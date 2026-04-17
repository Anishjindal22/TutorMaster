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

// All routes require admin authentication
router.get("/students", auth, isAdmin, getAllStudents);
router.get("/instructors", auth, isAdmin, getAllInstructors);
router.get("/courses", auth, isAdmin, getAllCoursesAdmin);
router.get("/stats", auth, isAdmin, getAdminStats);
router.post("/createCategory", auth, isAdmin, createCategory);

module.exports = router;
