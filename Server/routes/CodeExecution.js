const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const {
  executeUserCode,
  generateStarterCode,
} = require("../controllers/CodeExecution");

router.post("/execute", auth, executeUserCode);
router.post("/generate", auth, generateStarterCode);

module.exports = router;
