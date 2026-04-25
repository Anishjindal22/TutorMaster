const mongoose = require("mongoose");

const notificationCampaignSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["Admin", "Instructor"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["course_update", "admin_broadcast", "admin_targeted"],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    recipientConfig: {
      mode: {
        type: String,
        enum: ["all_active_users", "course_students", "targeted_users"],
        required: true,
      },
      userIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    },
    status: {
      type: String,
      enum: [
        "accepted",
        "dispatching",
        "processing",
        "completed",
        "completed_with_failures",
        "failed",
      ],
      default: "accepted",
      index: true,
    },
    totalRecipients: {
      type: Number,
      default: 0,
      min: 0,
    },
    queuedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dispatchCompleted: {
      type: Boolean,
      default: false,
    },
    lastDispatchCursor: {
      type: String,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
    dispatchStartedAt: {
      type: Date,
      default: null,
    },
    dispatchCompletedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationCampaignSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model("NotificationCampaign", notificationCampaignSchema);
