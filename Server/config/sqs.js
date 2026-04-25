const { SQSClient } = require("@aws-sdk/client-sqs");
require("dotenv").config();

let sqsClient = null;

try {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
     sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log("SQS Client initialized");
  } else {
      console.log("AWS credentials not found. SQS Client will not be initialized.");
  }
} catch (error) {
  console.log("Failed to initialize SQS client", error);
}

module.exports = sqsClient;
