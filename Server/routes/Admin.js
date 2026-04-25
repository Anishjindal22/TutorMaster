const express = require("express");
const router = express.Router();

const {
  getAllStudents,
  getAllInstructors,
  getAllCoursesAdmin,
  getAdminStats,
} = require("../controllers/Admin");

const { createCategory } = require("../controllers/Categories");

const { auth, isAdmin } = require("../middlewares/auth");
const { adminReadLimiter, adminMutationLimiter } = require("../middlewares/rateLimiter");

// All routes require admin authentication
router.get("/students", auth, isAdmin, adminReadLimiter, getAllStudents);
router.get("/instructors", auth, isAdmin, adminReadLimiter, getAllInstructors);
router.get("/courses", auth, isAdmin, adminReadLimiter, getAllCoursesAdmin);
router.get("/stats", auth, isAdmin, adminReadLimiter, getAdminStats);
router.post("/createCategory", auth, isAdmin, adminMutationLimiter, createCategory);

module.exports = router;
