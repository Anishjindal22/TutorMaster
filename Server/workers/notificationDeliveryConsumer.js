const {
  ReceiveMessageCommand,
  DeleteMessageCommand,
  ChangeMessageVisibilityCommand,
} = require("@aws-sdk/client-sqs");

const sqsClient = require("../config/sqs");
const Notification = require("../models/Notification");
const NotificationCampaign = require("../models/NotificationCampaign");
const NotificationFailure = require("../models/NotificationFailure");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { notificationEmail } = require("../mail/templates/notificationEmail");

const DELIVERY_QUEUE_URL =
  process.env.SQS_NOTIFICATION_DELIVERY_QUEUE_URL || process.env.SQS_NOTIFICATION_QUEUE_URL;
const MAX_RETRIES = Math.max(1, Number(process.env.NOTIFICATION_MAX_RETRIES || 5));
const EMAIL_ENABLED = process.env.NOTIFICATION_EMAIL_ENABLED === "true";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getReceiveCount = (message) =>
  Number(message?.Attributes?.ApproximateReceiveCount || 1);

const deleteMessage = async (message) => {
  const command = new DeleteMessageCommand({
    QueueUrl: DELIVERY_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
  });

  await sqsClient.send(command);
};

const setRetryVisibility = async (message, attemptCount) => {
  const visibilityTimeout = Math.min(900, Math.pow(2, attemptCount) * 10);

  const command = new ChangeMessageVisibilityCommand({
    QueueUrl: DELIVERY_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
    VisibilityTimeout: visibilityTimeout,
  });

  await sqsClient.send(command);
};

const finalizeCampaignIfDone = async (campaignId) => {
  const campaign = await NotificationCampaign.findById(campaignId)
    .select("status dispatchCompleted totalRecipients deliveredCount failedCount")
    .lean();

  if (!campaign || !campaign.dispatchCompleted) {
    return;
  }

  if (["completed", "completed_with_failures", "failed"].includes(campaign.status)) {
    return;
  }

  const processed = campaign.deliveredCount + campaign.failedCount;
  if (processed < campaign.totalRecipients) {
    return;
  }

  const nextStatus = campaign.failedCount > 0 ? "completed_with_failures" : "completed";

  await NotificationCampaign.updateOne(
    {
      _id: campaignId,
      status: { $nin: ["completed", "completed_with_failures", "failed"] },
    },
    {
      $set: {
        status: nextStatus,
        completedAt: new Date(),
      },
    }
  );
};

const recordTerminalFailure = async (payload, attemptCount, errorMessage) => {
  if (!payload?.campaignId || !payload?.recipientId) {
    return false;
  }

  const result = await NotificationFailure.findOneAndUpdate(
    {
      campaignId: payload.campaignId,
      recipient: payload.recipientId,
    },
    {
      $set: {
        sender: payload.senderId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        courseId: payload.courseId,
        attemptCount,
        errorMessage,
        recoverable: false,
        replayStatus: "pending",
        failedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      rawResult: true,
      setDefaultsOnInsert: true,
    }
  );

  return !result?.lastErrorObject?.updatedExisting;
};

const handleDeliveryMessage = async (message) => {
  let payload;

  try {
    payload = JSON.parse(message.Body);
  } catch (error) {
    console.error("Invalid delivery payload. Deleting message.", error);
    await deleteMessage(message);
    return;
  }

  if (!payload?.campaignId || !payload?.recipientId || !payload?.title || !payload?.message || !payload?.type) {
    console.error("Delivery payload missing required fields. Deleting message.");
    await deleteMessage(message);
    return;
  }

  try {
    const notificationWriteResult = await Notification.findOneAndUpdate(
      {
        campaignId: payload.campaignId,
        recipient: payload.recipientId,
      },
      {
        $setOnInsert: {
          campaignId: payload.campaignId,
          sender: payload.senderId,
          recipient: payload.recipientId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          courseId: payload.courseId,
        },
      },
      {
        upsert: true,
        new: true,
        rawResult: true,
        setDefaultsOnInsert: true,
      }
    );

    const inserted = !notificationWriteResult?.lastErrorObject?.updatedExisting;

    if (inserted) {
      await NotificationCampaign.updateOne(
        { _id: payload.campaignId },
        {
          $inc: { deliveredCount: 1 },
          $set: { status: "processing", lastError: null },
        }
      );

      if (EMAIL_ENABLED) {
        const user = await User.findById(payload.recipientId).select("firstName email").lean();
        if (user?.email) {
          await mailSender(
            user.email,
            payload.title,
            notificationEmail(user.firstName || "User", payload.title, payload.message)
          );
        }
      }
    }

    await deleteMessage(message);
    await finalizeCampaignIfDone(payload.campaignId);
  } catch (error) {
    console.error("Error processing delivery message:", error);

    const attemptCount = getReceiveCount(message);
    if (attemptCount >= MAX_RETRIES) {
      const isNewFailure = await recordTerminalFailure(payload, attemptCount, error.message);

      if (isNewFailure) {
        await NotificationCampaign.updateOne(
          { _id: payload.campaignId },
          {
            $inc: { failedCount: 1 },
            $set: { status: "processing", lastError: error.message },
          }
        );
      }

      await deleteMessage(message);
      await finalizeCampaignIfDone(payload.campaignId);
      return;
    }

    await setRetryVisibility(message, attemptCount);
  }
};

const pollDeliveryQueue = async () => {
  if (!sqsClient || !DELIVERY_QUEUE_URL) {
    console.log("Delivery queue URL or SQS client missing. Delivery worker not started.");
    return;
  }

  console.log("Starting notification delivery worker...");

  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: DELIVERY_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        AttributeNames: ["ApproximateReceiveCount"],
      });

      const response = await sqsClient.send(command);
      const messages = response.Messages || [];

      if (messages.length === 0) {
        continue;
      }

      await Promise.allSettled(messages.map(handleDeliveryMessage));
    } catch (error) {
      console.error("Error polling delivery queue:", error);
      await sleep(5000);
    }
  }
};

exports.startDeliveryConsumer = () => {
  setTimeout(pollDeliveryQueue, 0);
};
