const {
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} = require("@aws-sdk/client-sqs");

const sqsClient = require("../config/sqs");
const User = require("../models/User");
const NotificationCampaign = require("../models/NotificationCampaign");
const { sendDispatchMessage, sendDeliveryBatch } = require("../utils/sqsProducer");

const DISPATCH_QUEUE_URL =
  process.env.SQS_NOTIFICATION_DISPATCH_QUEUE_URL || process.env.SQS_NOTIFICATION_QUEUE_URL;
const CHUNK_SIZE = Math.max(10, Number(process.env.NOTIFICATION_DISPATCH_CHUNK_SIZE || 500));
const MAX_RETRIES = Math.max(1, Number(process.env.NOTIFICATION_MAX_RETRIES || 5));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getReceiveCount = (message) =>
  Number(message?.Attributes?.ApproximateReceiveCount || 1);

const deleteMessage = async (message) => {
  const command = new DeleteMessageCommand({
    QueueUrl: DISPATCH_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
  });

  await sqsClient.send(command);
};

const setRetryVisibility = async (message, attemptCount) => {
  const visibilityTimeout = Math.min(900, Math.pow(2, attemptCount) * 10);

  const command = new ChangeMessageVisibilityCommand({
    QueueUrl: DISPATCH_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
    VisibilityTimeout: visibilityTimeout,
  });

  await sqsClient.send(command);
};

const loadRecipientsChunk = async (campaign, cursor, cursorIndex) => {
  const mode = campaign?.recipientConfig?.mode;

  if (mode === "all_active_users" || mode === "course_students") {
    const query = { active: true };

    if (mode === "course_students") {
      const courseId = campaign?.recipientConfig?.courseId || campaign?.courseId;
      if (!courseId) {
        return {
          recipientIds: [],
          hasMore: false,
          nextCursor: cursor || null,
          nextCursorIndex: 0,
        };
      }
      query.courses = courseId;
    }

    if (cursor) {
      query._id = { $gt: cursor };
    }

    const users = await User.find(query)
      .select("_id")
      .sort({ _id: 1 })
      .limit(CHUNK_SIZE)
      .lean();

    const recipientIds = users.map((user) => user._id.toString());
    const nextCursor = recipientIds.length > 0 ? recipientIds[recipientIds.length - 1] : cursor || null;

    return {
      recipientIds,
      hasMore: users.length === CHUNK_SIZE,
      nextCursor,
      nextCursorIndex: 0,
    };
  }

  if (mode === "targeted_users") {
    const allUserIds = Array.isArray(campaign?.recipientConfig?.userIds)
      ? campaign.recipientConfig.userIds.map((id) => id.toString())
      : [];

    const startIndex = Number.isInteger(cursorIndex) && cursorIndex >= 0 ? cursorIndex : 0;
    const targetChunk = allUserIds.slice(startIndex, startIndex + CHUNK_SIZE);

    if (targetChunk.length === 0) {
      return {
        recipientIds: [],
        hasMore: false,
        nextCursor: null,
        nextCursorIndex: startIndex,
      };
    }

    const activeUsers = await User.find({
      _id: { $in: targetChunk },
      active: true,
    })
      .select("_id")
      .lean();

    const activeIdSet = new Set(activeUsers.map((user) => user._id.toString()));
    const recipientIds = targetChunk.filter((id) => activeIdSet.has(id));
    const nextCursorIndex = startIndex + targetChunk.length;

    return {
      recipientIds,
      hasMore: nextCursorIndex < allUserIds.length,
      nextCursor: null,
      nextCursorIndex,
    };
  }

  throw new Error("Unsupported campaign recipient mode");
};

const finalizeDispatchStage = async (campaignId) => {
  const campaign = await NotificationCampaign.findById(campaignId)
    .select("totalRecipients deliveredCount failedCount")
    .lean();

  if (!campaign) {
    return;
  }

  const processedCount = campaign.deliveredCount + campaign.failedCount;
  const isFullyDone = campaign.totalRecipients === 0 || processedCount >= campaign.totalRecipients;
  const nextStatus = isFullyDone
    ? campaign.failedCount > 0
      ? "completed_with_failures"
      : "completed"
    : "processing";

  await NotificationCampaign.findByIdAndUpdate(campaignId, {
    dispatchCompleted: true,
    dispatchCompletedAt: new Date(),
    status: nextStatus,
    completedAt: isFullyDone ? new Date() : null,
  });
};

const handleDispatchMessage = async (message) => {
  let payload;

  try {
    payload = JSON.parse(message.Body);
  } catch (error) {
    console.error("Invalid dispatch payload. Deleting message.", error);
    await deleteMessage(message);
    return;
  }

  if (!payload?.campaignId) {
    console.error("Dispatch payload missing campaignId. Deleting message.");
    await deleteMessage(message);
    return;
  }

  try {
    const campaign = await NotificationCampaign.findById(payload.campaignId);

    if (!campaign) {
      await deleteMessage(message);
      return;
    }

    if (["completed", "completed_with_failures", "failed"].includes(campaign.status)) {
      await deleteMessage(message);
      return;
    }

    if (!campaign.dispatchStartedAt) {
      campaign.dispatchStartedAt = new Date();
    }
    campaign.status = "dispatching";
    campaign.lastError = null;
    await campaign.save();

    const cursor = typeof payload.cursor === "string" ? payload.cursor : campaign.lastDispatchCursor;
    const cursorIndex = Number.isInteger(payload.cursorIndex) ? payload.cursorIndex : 0;

    const { recipientIds, hasMore, nextCursor, nextCursorIndex } = await loadRecipientsChunk(
      campaign,
      cursor,
      cursorIndex
    );

    if (recipientIds.length > 0) {
      const deliveryPayloads = recipientIds.map((recipientId) => ({
        campaignId: campaign._id.toString(),
        senderId: campaign.sender.toString(),
        recipientId,
        title: campaign.title,
        message: campaign.message,
        type: campaign.type,
        courseId: campaign.courseId ? campaign.courseId.toString() : null,
      }));

      const queued = await sendDeliveryBatch(deliveryPayloads);
      if (!queued) {
        throw new Error("Failed to enqueue delivery batch");
      }

      await NotificationCampaign.findByIdAndUpdate(campaign._id, {
        $inc: {
          totalRecipients: recipientIds.length,
          queuedCount: recipientIds.length,
        },
        $set: {
          status: "dispatching",
          lastDispatchCursor: nextCursor,
          lastError: null,
        },
      });
    }

    if (hasMore) {
      const queuedNext = await sendDispatchMessage({
        campaignId: campaign._id.toString(),
        cursor: nextCursor,
        cursorIndex: nextCursorIndex,
      });

      if (!queuedNext) {
        throw new Error("Failed to enqueue next dispatch cursor message");
      }
    } else {
      await finalizeDispatchStage(campaign._id);
    }

    await deleteMessage(message);
  } catch (error) {
    console.error("Error processing dispatch message:", error);

    const attemptCount = getReceiveCount(message);
    if (attemptCount >= MAX_RETRIES) {
      await NotificationCampaign.findByIdAndUpdate(payload.campaignId, {
        status: "failed",
        dispatchCompleted: true,
        dispatchCompletedAt: new Date(),
        completedAt: new Date(),
        lastError: error.message,
      });

      await deleteMessage(message);
      return;
    }

    await setRetryVisibility(message, attemptCount);
  }
};

const pollDispatchQueue = async () => {
  if (!sqsClient || !DISPATCH_QUEUE_URL) {
    console.log("Dispatch queue URL or SQS client missing. Dispatch worker not started.");
    return;
  }

  console.log("Starting notification dispatch worker...");

  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: DISPATCH_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        AttributeNames: ["ApproximateReceiveCount"],
      });

      const response = await sqsClient.send(command);
      const messages = response.Messages || [];

      if (messages.length === 0) {
        continue;
      }

      await Promise.allSettled(messages.map(handleDispatchMessage));
    } catch (error) {
      console.error("Error polling dispatch queue:", error);
      await sleep(5000);
    }
  }
};

exports.startDispatchConsumer = () => {
  setTimeout(pollDispatchQueue, 0);
};
