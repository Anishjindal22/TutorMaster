const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail, razorpayWebhook } = require("../controllers/Payments")
const { auth, isStudent } = require("../middlewares/auth")
const { paymentActionLimiter, paymentWebhookLimiter } = require("../middlewares/rateLimiter")

router.post("/capturePayment", auth, isStudent, paymentActionLimiter, capturePayment)
router.post("/verifyPayment", auth, isStudent, paymentActionLimiter, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, paymentActionLimiter, sendPaymentSuccessEmail);
// Webhook — NO auth middleware (Razorpay sends this directly, verified via signature)
router.post("/webhook", paymentWebhookLimiter, razorpayWebhook);

module.exports = router