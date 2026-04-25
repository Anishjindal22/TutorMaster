const { SendMessageCommand, SendMessageBatchCommand } = require("@aws-sdk/client-sqs");
const sqsClient = require("../config/sqs");

const DISPATCH_QUEUE_URL =
    process.env.SQS_NOTIFICATION_DISPATCH_QUEUE_URL || process.env.SQS_NOTIFICATION_QUEUE_URL;
const DELIVERY_QUEUE_URL =
    process.env.SQS_NOTIFICATION_DELIVERY_QUEUE_URL || process.env.SQS_NOTIFICATION_QUEUE_URL;

const buildBatchEntryId = (prefix, index) =>
    `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;

const sendMessageToQueue = async (queueUrl, payload, label) => {
    if (!sqsClient || !queueUrl) {
        console.warn(`SQS not configured, skipping ${label} send`);
        return false;
    }

    try {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(payload),
        });

        const response = await sqsClient.send(command);
        console.log(`${label} message sent to SQS:`, response.MessageId);
        return true;
    } catch (error) {
        console.error(`Error sending ${label} message to SQS:`, error);
        return false;
    }
};

const sendBatchToQueue = async (queueUrl, payloads, label) => {
    if (!sqsClient || !queueUrl) {
        console.warn(`SQS not configured, skipping batch ${label} send`);
        return false;
    }

    if (!Array.isArray(payloads) || payloads.length === 0) {
        return true;
    }

    const chunkSize = 10;
    let allBatchesSucceeded = true;

    for (let i = 0; i < payloads.length; i += chunkSize) {
        const chunk = payloads.slice(i, i + chunkSize);

        const entries = chunk.map((payload) => ({
            Id: buildBatchEntryId(label, i),
            MessageBody: JSON.stringify(payload),
        }));

        try {
            const command = new SendMessageBatchCommand({
                QueueUrl: queueUrl,
                Entries: entries,
            });

            const response = await sqsClient.send(command);
            if (response.Failed && response.Failed.length > 0) {
                allBatchesSucceeded = false;
                console.error(`Failed to send some ${label} messages in batch:`, response.Failed);
            }
            console.log(`Sent ${label} batch of ${chunk.length} messages to SQS`);
        } catch (error) {
            allBatchesSucceeded = false;
            console.error(`Error sending ${label} batch to SQS:`, error);
        }
    }

    return allBatchesSucceeded;
};

exports.sendDispatchMessage = async (payload) => sendMessageToQueue(DISPATCH_QUEUE_URL, payload, "dispatch");

exports.sendDeliveryBatch = async (payloads) => sendBatchToQueue(DELIVERY_QUEUE_URL, payloads, "delivery");

// Backward-compatible helpers retained for older call sites.
exports.sendNotification = async (payload) => sendMessageToQueue(DELIVERY_QUEUE_URL, payload, "delivery");

exports.sendNotificationBatch = async (payloads) => sendBatchToQueue(DELIVERY_QUEUE_URL, payloads, "delivery");
