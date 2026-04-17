const rateLimit = require("express-rate-limit");

// Strict limiter for auth-sensitive endpoints (OTP, login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per window per IP
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Even stricter for OTP — prevent brute force
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 OTP requests per 15 min
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter — prevent DDoS
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    success: false,
    message: "Rate limit exceeded. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, otpLimiter, apiLimiter };
