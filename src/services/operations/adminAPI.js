import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { adminEndpoints } from "../apis";

const {
  GET_ALL_STUDENTS_API,
  GET_ALL_INSTRUCTORS_API,
  GET_ALL_COURSES_ADMIN_API,
  GET_ADMIN_STATS_API,
  CREATE_CATEGORY_ADMIN_API,
} = adminEndpoints;

export async function getAdminStats(token) {
  let result = null;
  try {
    const response = await apiConnector("GET", GET_ADMIN_STATS_API, null, {
      Authorization: `Bearer ${token}`,
    });
    if (response?.data?.success) {
      result = response.data.data;
    }
  } catch (error) {
    console.error("GET_ADMIN_STATS error:", error);
  }
  return result;
}

export async function getAllStudents(token, page = 1, limit = 10) {
  let result = null;
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_STUDENTS_API}?page=${page}&limit=${limit}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      result = response.data;
    }
  } catch (error) {
    console.error("GET_ALL_STUDENTS error:", error);
  }
  return result;
}

export async function getAllInstructors(token, page = 1, limit = 10) {
  let result = null;
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_INSTRUCTORS_API}?page=${page}&limit=${limit}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      result = response.data;
    }
  } catch (error) {
    console.error("GET_ALL_INSTRUCTORS error:", error);
  }
  return result;
}

export async function getAllCoursesAdmin(token, page = 1, limit = 10) {
  let result = null;
  try {
    const response = await apiConnector(
      "GET",
      `${GET_ALL_COURSES_ADMIN_API}?page=${page}&limit=${limit}`,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      result = response.data;
    }
  } catch (error) {
    console.error("GET_ALL_COURSES_ADMIN error:", error);
  }
  return result;
}

export async function createCategoryAdmin(token, name, description) {
  const toastId = toast.loading("Creating category...");
  let result = false;
  try {
    const response = await apiConnector(
      "POST",
      CREATE_CATEGORY_ADMIN_API,
      { name, description },
      { Authorization: `Bearer ${token}` }
    );
    if (response?.data?.success) {
      toast.success("Category created successfully");
      result = true;
    } else {
      toast.error(response?.data?.message || "Failed to create category");
    }
  } catch (error) {
    console.error("CREATE_CATEGORY error:", error);
    toast.error(error?.response?.data?.message || "Failed to create category");
  }
  toast.dismiss(toastId);
  return result;
}
