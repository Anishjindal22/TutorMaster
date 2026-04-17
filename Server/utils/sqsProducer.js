const { SendMessageCommand, SendMessageBatchCommand } = require("@aws-sdk/client-sqs");
const sqsClient = require("../config/sqs");
const { v4: uuidv4 } = require('uuid');

const SQS_QUEUE_URL = process.env.SQS_NOTIFICATION_QUEUE_URL;

exports.sendNotification = async (payload) => {
    if (!sqsClient || !SQS_QUEUE_URL) {
        console.warn("SQS not configured, skipping notification send:", payload.title);
        return false;
    }

    try {
        const command = new SendMessageCommand({
            QueueUrl: SQS_QUEUE_URL,
            MessageBody: JSON.stringify(payload),
        });

        const response = await sqsClient.send(command);
        console.log("Message sent to SQS:", response.MessageId);
        return true;
    } catch (error) {
        console.error("Error sending message to SQS:", error);
        return false;
    }
};

exports.sendNotificationBatch = async (payloads) => {
     if (!sqsClient || !SQS_QUEUE_URL) {
        console.warn("SQS not configured, skipping batch notification send");
        return false;
    }

    const chunkSize = 10;
    for (let i = 0; i < payloads.length; i += chunkSize) {
        const chunk = payloads.slice(i, i + chunkSize);
        
        const entries = chunk.map((payload, index) => ({

            MessageBody: JSON.stringify(payload),
        }));

        try {
            const command = new SendMessageBatchCommand({
                QueueUrl: SQS_QUEUE_URL,
                Entries: entries,
            });

            const response = await sqsClient.send(command);
            if(response.Failed && response.Failed.length > 0) {
                 console.error("Failed to send some messages in batch:", response.Failed);
            }
             console.log(`Sent batch of ${chunk.length} messages to SQS`);
        } catch (error) {
           console.error("Error sending batch to SQS:", error);
        }
    }
    return true;
};
