const User = require("../models/User");
const Course = require("../models/Course");
const Category = require("../models/Category");
exports.getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      User.find({ accountType: "Student" })
        .select("firstName lastName email image courses createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ accountType: "Student" }),
    ]);

    return res.status(200).json({
      success: true,
      data: students,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [instructors, total] = await Promise.all([
      User.find({ accountType: "Instructor" })
        .select("firstName lastName email image courses approved createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({ accountType: "Instructor" }),
    ]);

    return res.status(200).json({
      success: true,
      data: instructors,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find()
        .select("courseName price status studentsEnrolled thumbnail createdAt category")
        .populate("instructor", "firstName lastName email")
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: courses,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalStudents, totalInstructors, totalCourses, totalCategories] =
      await Promise.all([
        User.countDocuments({ accountType: "Student" }),
        User.countDocuments({ accountType: "Instructor" }),
        Course.countDocuments(),
        Category.countDocuments(),
      ]);

    const courses = await Course.find()
      .select("price studentsEnrolled")
      .lean();

    let totalRevenue = 0;
    let totalEnrollments = 0;
    courses.forEach((course) => {
      const enrolled = course.studentsEnrolled ? course.studentsEnrolled.length : 0;
      totalEnrollments += enrolled;
      totalRevenue += enrolled * (course.price || 0);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalCategories,
        totalRevenue,
        totalEnrollments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
