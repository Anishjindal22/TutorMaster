const { SQSClient } = require("@aws-sdk/client-sqs");
require("dotenv").config();

let sqsClient = null;

try {
  if (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION
  ) {
    const config = {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };

    // Optional: override endpoint for local SQS emulation (e.g., LocalStack)
    if (process.env.AWS_SQS_ENDPOINT) {
      config.endpoint = process.env.AWS_SQS_ENDPOINT;
      console.log(`SQS Client using custom endpoint: ${process.env.AWS_SQS_ENDPOINT}`);
    } else {
      console.log("SQS Client using AWS endpoint");
    }

    sqsClient = new SQSClient(config);
    console.log("SQS Client initialized");
  } else {
    console.log("AWS credentials not found. SQS Client will not be initialized.");
  }
} catch (error) {
  console.log("Failed to initialize SQS client", error);
}

module.exports = sqsClient;
