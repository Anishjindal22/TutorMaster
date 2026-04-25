const mongoose = require("mongoose");

const notificationFailureSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NotificationCampaign",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["course_update", "admin_broadcast", "admin_targeted"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    errorMessage: {
      type: String,
      default: "Unknown processing error",
    },
    recoverable: {
      type: Boolean,
      default: false,
    },
    replayStatus: {
      type: String,
      enum: ["pending", "replayed"],
      default: "pending",
      index: true,
    },
    failedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

notificationFailureSchema.index({ campaignId: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model("NotificationFailure", notificationFailureSchema);
