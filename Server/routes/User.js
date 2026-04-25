const express = require("express")
const router = express.Router()

const {
  login,
  signUp,
  sendOtp,
  changePassword,
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")
const {
  loginLimiter,
  signupLimiter,
  otpLimiter,
  resetPasswordTokenLimiter,
  resetPasswordLimiter,
  authLimiter,
} = require("../middlewares/rateLimiter")

router.post("/login", loginLimiter, login)
router.post("/signup", signupLimiter, signUp)
router.post("/sendotp", otpLimiter, sendOtp)
router.post("/changepassword", auth, authLimiter, changePassword)

router.post("/reset-password-token", resetPasswordTokenLimiter, resetPasswordToken)
router.post("/reset-password", resetPasswordLimiter, resetPassword)
module.exports = router