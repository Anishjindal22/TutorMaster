const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const { codeExecutionLimiter, codeGenerationLimiter } = require("../middlewares/rateLimiter");
const {
  executeUserCode,
  generateStarterCode,
} = require("../controllers/CodeExecution");

router.post("/execute", auth, codeExecutionLimiter, executeUserCode);
router.post("/generate", auth, codeGenerationLimiter, generateStarterCode);

module.exports = router;
