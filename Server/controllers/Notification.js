const Notification = require("../models/Notification");
const Course = require("../models/Course");
const User = require("../models/User");
const { sendNotificationBatch } = require("../utils/sqsProducer");

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

        const enrolledStudents = course.studentsEnrolled;
        if (!enrolledStudents || enrolledStudents.length === 0) {
            return res.status(400).json({ success: false, message: "No students enrolled in this course" });
        }

        const payloads = enrolledStudents.map(studentId => ({
            senderId: instructorId,
            recipientId: studentId.toString(),
            title,
            message,
            type: "course_update",
            courseId
        }));

        await sendNotificationBatch(payloads);

        res.status(200).json({
            success: true,
            message: `Notification queued for ${enrolledStudents.length} students`
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

        const users = await User.find({ active: true }, '_id');

        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, message: "No active users found" });
        }

        const payloads = users.map(user => ({
            senderId: adminId,
            recipientId: user._id.toString(),
            title,
            message,
            type: "admin_broadcast"
        }));

        await sendNotificationBatch(payloads);

        res.status(200).json({
            success: true,
            message: `Broadcast notification queued for ${users.length} users`
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

        const payloads = userIds.map(userId => ({
            senderId: adminId,
            recipientId: userId,
            title,
            message,
            type: "admin_targeted"
        }));

        await sendNotificationBatch(payloads);

        res.status(200).json({
            success: true,
            message: `Targeted notification queued for ${userIds.length} users`
        });

    } catch (error) {
        console.error("Error sending targeted notification:", error);
        res.status(500).json({ success: false, message: "Failed to send targeted notification" });
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
