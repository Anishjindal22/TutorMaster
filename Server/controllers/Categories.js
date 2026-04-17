const Category = require("../models/Category");
const Course = require("../models/Course");
const { cacheGet, cacheSet, cacheDelete } = require("../config/redis");
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "Tag name or description not available",
      });
    }

    const newCategory = await Category.create({
      name,
      description,
    });

    if (!newCategory) {
      return res.status(401).json({
        success: false,
        message: "Error in pushing new tag to db",
      });
    }

    await cacheDelete("all_categories");

    return res.status(200).json({
      success: true,
      message: "Tag created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const cachedCategories = await cacheGet("all_categories");
    if (cachedCategories) {
      return res.status(200).json({
        success: true,
        message: "All tags received (cache)",
        data: cachedCategories,
      });
    }

    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    await cacheSet("all_categories", allCategories, 3600);

    return res.status(200).json({
      success: true,
      message: "All tags received",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    
    // Get courses for the specified category
    const selectedCourses = await Category.findById(categoryId)
      .populate({
        path: "course",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    // Handle the case when the category is not found
    if (!selectedCourses) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    // Handle the case when there are no courses
    if (!selectedCourses.course || selectedCourses.course.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
      course: { $not: { $size: 0 } },
    });
    
    let differentCourses = null;
    if (categoriesExceptSelected.length > 0) {
      const randomCategory = categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)];
      differentCourses = await Category.findById(randomCategory._id)
        .populate({
          path: "course",
          match: { status: "Published" },
          populate: "ratingAndReviews",
        })
        .exec();
    }

    // Get top-selling courses across all categories
    const mostSellingCourses = await Course.find({ status: "Published" })
      .sort({ "studentsEnrolled.length": -1 })
      .populate("ratingAndReviews")
      .limit(10)
      .exec();

    res.status(200).json({
      selectedCourses: selectedCourses,
      differentCourses: differentCourses || { course: [] },
      mostSellingCourses,
      name: selectedCourses.name,
      description: selectedCourses.description,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
