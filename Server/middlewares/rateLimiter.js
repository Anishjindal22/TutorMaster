const { createRateLimiter } = require("./rateLimiterFactory");

const getPositiveNumber = (name, fallback) => {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const authWindowMs = getPositiveNumber("RATE_LIMIT_AUTH_WINDOW_MS", 15 * 60 * 1000);
const otpWindowMs = getPositiveNumber("RATE_LIMIT_OTP_WINDOW_MS", 15 * 60 * 1000);
const resetWindowMs = getPositiveNumber("RATE_LIMIT_RESET_WINDOW_MS", 15 * 60 * 1000);
const apiWindowMs = getPositiveNumber("RATE_LIMIT_API_WINDOW_MS", 60 * 1000);
const paymentWindowMs = getPositiveNumber("RATE_LIMIT_PAYMENT_WINDOW_MS", 60 * 1000);
const webhookWindowMs = getPositiveNumber("RATE_LIMIT_WEBHOOK_WINDOW_MS", 60 * 1000);
const codeWindowMs = getPositiveNumber("RATE_LIMIT_CODE_WINDOW_MS", 60 * 1000);
const adminWindowMs = getPositiveNumber("RATE_LIMIT_ADMIN_WINDOW_MS", 5 * 60 * 1000);
const publicWindowMs = getPositiveNumber("RATE_LIMIT_PUBLIC_WINDOW_MS", 60 * 1000);

const loginLimiter = createRateLimiter({
  policyName: "auth-login",
  storePrefix: "auth-login",
  windowMs: authWindowMs,
  max: getPositiveNumber("RATE_LIMIT_LOGIN_MAX", 5),
  message: "Too many login attempts. Please try again later.",
});

const signupLimiter = createRateLimiter({
  policyName: "auth-signup",
  storePrefix: "auth-signup",
  windowMs: authWindowMs,
  max: getPositiveNumber("RATE_LIMIT_SIGNUP_MAX", 5),
  message: "Too many signup attempts. Please try again later.",
});

const otpLimiter = createRateLimiter({
  policyName: "auth-otp",
  storePrefix: "auth-otp",
  windowMs: otpWindowMs,
  max: getPositiveNumber("RATE_LIMIT_OTP_MAX", 3),
  message: "Too many OTP requests. Please try again later.",
});

const resetPasswordTokenLimiter = createRateLimiter({
  policyName: "auth-reset-token",
  storePrefix: "auth-reset-token",
  windowMs: resetWindowMs,
  max: getPositiveNumber("RATE_LIMIT_RESET_TOKEN_MAX", 3),
  message: "Too many reset token requests. Please try again later.",
});

const resetPasswordLimiter = createRateLimiter({
  policyName: "auth-reset-password",
  storePrefix: "auth-reset-password",
  windowMs: resetWindowMs,
  max: getPositiveNumber("RATE_LIMIT_RESET_PASSWORD_MAX", 5),
  message: "Too many password reset attempts. Please try again later.",
});

const authLimiter = createRateLimiter({
  policyName: "auth-protected",
  storePrefix: "auth-protected",
  windowMs: authWindowMs,
  max: getPositiveNumber("RATE_LIMIT_AUTH_MAX", 10),
  message: "Too many authentication requests. Please try again later.",
});

const apiLimiter = createRateLimiter({
  policyName: "api-general",
  storePrefix: "api-general",
  windowMs: apiWindowMs,
  max: getPositiveNumber("RATE_LIMIT_API_MAX", 100),
  message: "Rate limit exceeded. Please slow down.",
});

const paymentActionLimiter = createRateLimiter({
  policyName: "payment-action",
  storePrefix: "payment-action",
  windowMs: paymentWindowMs,
  max: getPositiveNumber("RATE_LIMIT_PAYMENT_ACTION_MAX", 30),
  message: "Too many payment requests. Please try again later.",
});

const paymentWebhookLimiter = createRateLimiter({
  policyName: "payment-webhook",
  storePrefix: "payment-webhook",
  windowMs: webhookWindowMs,
  max: getPositiveNumber("RATE_LIMIT_PAYMENT_WEBHOOK_MAX", 120),
  message: "Webhook rate limit exceeded. Please retry shortly.",
});

const codeExecutionLimiter = createRateLimiter({
  policyName: "code-execution",
  storePrefix: "code-execution",
  windowMs: codeWindowMs,
  max: getPositiveNumber("RATE_LIMIT_CODE_EXECUTE_MAX", 20),
  message: "Too many code execution requests. Please try again later.",
});

const codeGenerationLimiter = createRateLimiter({
  policyName: "code-generation",
  storePrefix: "code-generation",
  windowMs: codeWindowMs,
  max: getPositiveNumber("RATE_LIMIT_CODE_GENERATE_MAX", 30),
  message: "Too many code generation requests. Please try again later.",
});

const adminReadLimiter = createRateLimiter({
  policyName: "admin-read",
  storePrefix: "admin-read",
  windowMs: adminWindowMs,
  max: getPositiveNumber("RATE_LIMIT_ADMIN_READ_MAX", 120),
  message: "Too many admin read requests. Please try again later.",
});

const adminMutationLimiter = createRateLimiter({
  policyName: "admin-mutation",
  storePrefix: "admin-mutation",
  windowMs: adminWindowMs,
  max: getPositiveNumber("RATE_LIMIT_ADMIN_MUTATION_MAX", 30),
  message: "Too many admin updates. Please try again later.",
});

const publicReadLimiter = createRateLimiter({
  policyName: "public-read",
  storePrefix: "public-read",
  windowMs: publicWindowMs,
  max: getPositiveNumber("RATE_LIMIT_PUBLIC_READ_MAX", 200),
  message: "Too many public requests. Please try again later.",
});

module.exports = {
  loginLimiter,
  signupLimiter,
  otpLimiter,
  resetPasswordTokenLimiter,
  resetPasswordLimiter,
  authLimiter,
  apiLimiter,
  paymentActionLimiter,
  paymentWebhookLimiter,
  codeExecutionLimiter,
  codeGenerationLimiter,
  adminReadLimiter,
  adminMutationLimiter,
  publicReadLimiter,
};
