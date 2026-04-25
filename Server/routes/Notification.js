const express = require("express");
const router = express.Router();
const { auth, isInstructor, isAdmin } = require("../middlewares/auth");

const {
    sendCourseNotification,
    sendBroadcastNotification,
    sendTargetedNotification,
    getCampaignStatus,
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} = require("../controllers/Notification");

// Sending APIs
router.post("/send-course", auth, isInstructor, sendCourseNotification);
router.post("/send-broadcast", auth, isAdmin, sendBroadcastNotification);
router.post("/send-targeted", auth, isAdmin, sendTargetedNotification);
router.get("/campaign/:campaignId", auth, getCampaignStatus);

// Read APIs
router.get("/my-notifications", auth, getMyNotifications);
router.put("/mark-read/:id", auth, markAsRead);
router.put("/mark-all-read", auth, markAllAsRead);
router.get("/unread-count", auth, getUnreadCount);

module.exports = router;
