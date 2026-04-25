const Notification = require("../models/Notification");
const Course = require("../models/Course");
const mongoose = require("mongoose");
const NotificationCampaign = require("../models/NotificationCampaign");
const { sendDispatchMessage } = require("../utils/sqsProducer");

const queueDispatchMessage = async (campaignId) => {
    return sendDispatchMessage({
        campaignId: campaignId.toString(),
        cursor: null,
        cursorIndex: 0,
    });
};

const markCampaignFailed = async (campaignId, message) => {
    await NotificationCampaign.findByIdAndUpdate(campaignId, {
        status: "failed",
        dispatchCompleted: true,
        dispatchCompletedAt: new Date(),
        completedAt: new Date(),
        lastError: message,
    });
};

exports.sendCourseNotification = async (req, res) => {
    try {
        const { courseId, title, message } = req.body;
        const instructorId = req.user.id;

        if (!courseId || !title || !message) {
            return res.status(400).json({ success: false, message: "Course ID, title and message are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({ success: false, message: "You are not authorized to send notifications for this course" });
        }

        const campaign = await NotificationCampaign.create({
            sender: instructorId,
            senderRole: "Instructor",
            title,
            message,
            type: "course_update",
            courseId,
            recipientConfig: {
                mode: "course_students",
                courseId,
            },
            status: "accepted",
        });

        const queued = await queueDispatchMessage(campaign._id);
        if (!queued) {
            await markCampaignFailed(campaign._id, "Dispatch queue publish failed");
            return res.status(500).json({
                success: false,
                message: "Notification queueing failed (SQS not configured or batch send failed)",
            });
        }

        res.status(202).json({
            success: true,
            campaignId: campaign._id,
            message: "Notification campaign accepted and queued for dispatch",
        });

    } catch (error) {
        console.error("Error sending course notification:", error);
        res.status(500).json({ success: false, message: "Failed to send notification" });
    }
};

exports.sendBroadcastNotification = async (req, res) => {
    try {
        const { title, message } = req.body;
        const adminId = req.user.id;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Title and message are required" });
        }

        const campaign = await NotificationCampaign.create({
            sender: adminId,
            senderRole: "Admin",
            title,
            message,
            type: "admin_broadcast",
            recipientConfig: {
                mode: "all_active_users",
            },
            status: "accepted",
        });

        const queued = await queueDispatchMessage(campaign._id);
        if (!queued) {
            await markCampaignFailed(campaign._id, "Dispatch queue publish failed");
            return res.status(500).json({
                success: false,
                message: "Broadcast queueing failed (SQS not configured or batch send failed)",
            });
        }

        res.status(202).json({
            success: true,
            campaignId: campaign._id,
            message: "Broadcast campaign accepted and queued for dispatch",
        });

    } catch (error) {
        console.error("Error sending broadcast notification:", error);
        res.status(500).json({ success: false, message: "Failed to send broadcast" });
    }
};

exports.sendTargetedNotification = async (req, res) => {
    try {
        const { userIds, title, message } = req.body;
        const adminId = req.user.id;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !message) {
            return res.status(400).json({ success: false, message: "User IDs array, title and message are required" });
        }

        const validUserIds = [...new Set(
            userIds
                .map((id) => String(id).trim())
                .filter((id) => mongoose.Types.ObjectId.isValid(id))
        )];

        if (validUserIds.length === 0) {
            return res.status(400).json({ success: false, message: "No valid user IDs provided" });
        }

        const campaign = await NotificationCampaign.create({
            sender: adminId,
            senderRole: "Admin",
            title,
            message,
            type: "admin_targeted",
            recipientConfig: {
                mode: "targeted_users",
                userIds: validUserIds,
            },
            status: "accepted",
        });

        const queued = await queueDispatchMessage(campaign._id);
        if (!queued) {
            await markCampaignFailed(campaign._id, "Dispatch queue publish failed");
            return res.status(500).json({
                success: false,
                message: "Targeted notification queueing failed (SQS not configured or batch send failed)",
            });
        }

        res.status(202).json({
            success: true,
            campaignId: campaign._id,
            message: `Targeted campaign accepted for ${validUserIds.length} users`,
        });

    } catch (error) {
        console.error("Error sending targeted notification:", error);
        res.status(500).json({ success: false, message: "Failed to send targeted notification" });
    }
};

exports.getCampaignStatus = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const requesterId = req.user.id;
        const requesterRole = req.user.accountType;

        if (!mongoose.Types.ObjectId.isValid(campaignId)) {
            return res.status(400).json({ success: false, message: "Invalid campaign ID" });
        }

        const campaign = await NotificationCampaign.findById(campaignId)
            .select(
                "sender senderRole type title status totalRecipients queuedCount deliveredCount failedCount dispatchCompleted acceptedAt dispatchStartedAt dispatchCompletedAt completedAt lastError createdAt updatedAt"
            )
            .lean();

        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        const isOwner = campaign.sender?.toString() === requesterId;
        const isAdmin = requesterRole === "Admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized to view this campaign" });
        }

        res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        console.error("Error fetching campaign status:", error);
        res.status(500).json({ success: false, message: "Failed to fetch campaign status" });
    }
};

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate("sender", "firstName lastName image")
            .populate("courseId", "courseName");

        const total = await Notification.countDocuments({ recipient: userId });

        res.status(200).json({
            success: true,
            data: notifications,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
         console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        res.status(200).json({ success: true, data: notification });

    } catch (error) {
         console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: "Failed to update notification" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });

    } catch (error) {
         console.error("Error marking all notifications as read:", error);
        res.status(500).json({ success: false, message: "Failed to update notifications" });
    }
};

exports.getUnreadCount = async (req, res) => {
     try {
        const userId = req.user.id;
        const count = await Notification.countDocuments({ recipient: userId, read: false });

        res.status(200).json({ success: true, count });

    } catch (error) {
         console.error("Error getting unread count:", error);
        res.status(500).json({ success: false, message: "Failed to fetch unread count" });
    }
}
