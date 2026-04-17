const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail, razorpayWebhook } = require("../controllers/Payments")
const { auth, isStudent } = require("../middlewares/auth")
router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifyPayment",auth, isStudent, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);
// Webhook — NO auth middleware (Razorpay sends this directly, verified via signature)
router.post("/webhook", razorpayWebhook);

module.exports = router