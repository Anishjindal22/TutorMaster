const { ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const sqsClient = require("../config/sqs");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { notificationEmail } = require("../mail/templates/notificationEmail");

const SQS_QUEUE_URL = process.env.SQS_NOTIFICATION_QUEUE_URL;

const processMessage = async (message) => {
    try {
        const payload = JSON.parse(message.Body);
        
        const notification = await Notification.create({
            sender: payload.senderId,
            recipient: payload.recipientId,
            title: payload.title,
            message: payload.message,
            type: payload.type,
            courseId: payload.courseId,
        });

        if (process.env.NOTIFICATION_EMAIL_ENABLED === "true") {
             const user = await User.findById(payload.recipientId);
             if (user && user.email) {
                 await mailSender(
                     user.email,
                     payload.title,
                     notificationEmail(user.firstName || "User", payload.title, payload.message)
                 );
             }
        }

        const deleteCommand = new DeleteMessageCommand({
             QueueUrl: SQS_QUEUE_URL,
             ReceiptHandle: message.ReceiptHandle,
        });
        await sqsClient.send(deleteCommand);
        console.log(`Successfully processed and deleted SQS message: ${message.MessageId}`);
        
    } catch (error) {
        console.error("Error processing SQS message:", error);
    }
};

const pollQueue = async () => {
    if (!sqsClient || !SQS_QUEUE_URL) {
        console.log("SQS client or Queue URL not configured. Not starting consumer.");
        return;
    }

    console.log("Starting SQS consumer worker...");
    
    while (true) {
        try {
            const command = new ReceiveMessageCommand({
                QueueUrl: SQS_QUEUE_URL,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20,
            });

            const response = await sqsClient.send(command);

            if (response.Messages && response.Messages.length > 0) {
                 console.log(`Received ${response.Messages.length} messages`);
                 
                 const processingPromises = response.Messages.map(processMessage);
                 await Promise.allSettled(processingPromises);
            }
        } catch (error) {
            console.error("Error pulling messages from SQS:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

exports.startConsumer = () => {
    setTimeout(pollQueue, 0);
};
