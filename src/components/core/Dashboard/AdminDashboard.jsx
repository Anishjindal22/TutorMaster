import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  VscMortarBoard,
  VscPerson,
  VscBook,
  VscTag,
  VscGraphLine,
  VscCreditCard,
  VscSearch,
} from "react-icons/vsc";
import { getAdminStats, getAllStudents, getAllInstructors, getAllCoursesAdmin, createCategoryAdmin } from "../../../services/operations/adminAPI";
import useDebounce from "../../../hooks/useDebounce";

const TABS = ["Overview", "Students", "Instructors", "Courses", "Categories"];

export default function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getAdminStats(token);
      if (data) setStats(data);
    })();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "Overview" || activeTab === "Categories") return;
      setLoading(true);
      let res = null;
      if (activeTab === "Students") res = await getAllStudents(token, pagination.page, pagination.limit);
      if (activeTab === "Instructors") res = await getAllInstructors(token, pagination.page, pagination.limit);
      if (activeTab === "Courses") res = await getAllCoursesAdmin(token, pagination.page, pagination.limit);
      if (res) {
        setTableData(res.data);
        setPagination(res.pagination);
      }
      setLoading(false);
    };
    fetchData();
  // eslint-disable-next-line
  }, [activeTab, pagination.page]);

  useEffect(() => {
    // Reset search when switching tabs so the UI doesn't look "empty" unexpectedly.
    setSearch("");
  }, [activeTab]);

  const filteredTableData = useMemo(() => {
    const query = (debouncedSearch || "").trim().toLowerCase();
    if (!query) return tableData;

    if (activeTab === "Courses") {
      return tableData.filter((item) => {
        const courseName = (item.courseName || "").toLowerCase();
        const instructorName = `${item.instructor?.firstName || ""} ${item.instructor?.lastName || ""}`
          .trim()
          .toLowerCase();
        const status = (item.status || "").toLowerCase();
        const category = (item.category?.name || item.category || "").toString().toLowerCase();
        const price = (item.price ?? "").toString().toLowerCase();

        return (
          courseName.includes(query) ||
          instructorName.includes(query) ||
          status.includes(query) ||
          category.includes(query) ||
          price.includes(query)
        );
      });
    }

    return tableData.filter((item) => {
      const fullName = `${item.firstName || ""} ${item.lastName || ""}`.trim().toLowerCase();
      const email = (item.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [tableData, debouncedSearch, activeTab]);

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((p) => ({ ...p, page: newPage }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim() || !catDesc.trim()) return;
    const success = await createCategoryAdmin(token, catName.trim(), catDesc.trim());
    if (success) {
      setCatName("");
      setCatDesc("");
      const data = await getAdminStats(token);
      if (data) setStats(data);
    }
  };

  const statCards = stats
    ? [
        { label: "Students", value: stats.totalStudents, icon: <VscMortarBoard />, color: "text-brand-secondary" },
        { label: "Instructors", value: stats.totalInstructors, icon: <VscPerson />, color: "text-brand-primary" },
        { label: "Courses", value: stats.totalCourses, icon: <VscBook />, color: "text-brand-accent" },
        { label: "Categories", value: stats.totalCategories, icon: <VscTag />, color: "text-brand-primary" },
        { label: "Enrollments", value: stats.totalEnrollments, icon: <VscGraphLine />, color: "text-caribbeangreen-100" },
        { label: "Revenue", value: `₹${stats.totalRevenue?.toLocaleString()}`, icon: <VscCreditCard />, color: "text-brand-secondary" },
      ]
    : [];

  return (
    <div className="text-white p-6 md:p-10 w-full">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-text-muted mb-8">Manage your platform from here.</p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-surface-border pb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-brand-primary text-white"
                : "text-text-muted hover:text-white hover:bg-surface-light"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((card, i) => (
            <div key={i} className="bg-surface-dim border border-surface-border rounded-xl p-6 flex items-center gap-4">
              <div className={`text-3xl ${card.color}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-text-muted">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students / Instructors / Courses Tables */}
      {(activeTab === "Students" || activeTab === "Instructors" || activeTab === "Courses") && (
        <div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner"></div></div>
          ) : (
            <>
              {/* Search */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <VscSearch />
                  </span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all text-white pl-10 pr-4 py-3"
                  />
                </div>
                {search.trim() && (
                  <button
                    onClick={() => setSearch("")}
                    className="px-4 py-3 rounded-xl border border-surface-border text-text-muted hover:text-white hover:bg-surface-light transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-surface-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-dim text-text-muted uppercase text-xs tracking-wider">
                    <tr>
                      {activeTab === "Courses" ? (
                        <>
                          <th className="px-5 py-4">Course</th>
                          <th className="px-5 py-4">Instructor</th>
                          <th className="px-5 py-4">Price</th>
                          <th className="px-5 py-4">Students</th>
                          <th className="px-5 py-4">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-5 py-4">Name</th>
                          <th className="px-5 py-4">Email</th>
                          <th className="px-5 py-4">{activeTab === "Students" ? "Enrolled" : "Courses"}</th>
                          <th className="px-5 py-4">Joined</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableData.map((item, idx) => (
                      <tr key={idx} className="border-t border-surface-border hover:bg-surface-light/30 transition-colors">
                        {activeTab === "Courses" ? (
                          <>
                            <td className="px-5 py-4 flex items-center gap-3">
                              <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-medium truncate max-w-[200px]">{item.courseName}</span>
                            </td>
                            <td className="px-5 py-4 text-text-muted">
                              {item.instructor?.firstName} {item.instructor?.lastName}
                            </td>
                            <td className="px-5 py-4">₹{item.price}</td>
                            <td className="px-5 py-4">{item.studentsEnrolled?.length || 0}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                item.status === "Published"
                                  ? "bg-caribbeangreen-400/20 text-caribbeangreen-50"
                                  : "bg-text-faint/20 text-text-muted"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-4 flex items-center gap-3">
                              <img src={item.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                              <span className="font-medium">{item.firstName} {item.lastName}</span>
                            </td>
                            <td className="px-5 py-4 text-text-muted">{item.email}</td>
                            <td className="px-5 py-4">{item.courses?.length || 0}</td>
                            <td className="px-5 py-4 text-text-muted">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {filteredTableData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-text-muted">No data found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-text-muted">
                  {search.trim()
                    ? `Showing ${filteredTableData.length} of ${tableData.length} on this page (filtered)`
                    : `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )} of ${pagination.total}`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 text-sm rounded-lg border border-surface-border text-text-muted hover:text-white hover:bg-surface-light disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm rounded-lg bg-brand-primary text-white font-medium">
                    {pagination.page}
                  </span>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 text-sm rounded-lg border border-surface-border text-text-muted hover:text-white hover:bg-surface-light disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "Categories" && (
        <div className="max-w-lg">
          <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
          <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-text-muted font-medium mb-1 block">Category Name</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g., Machine Learning"
                className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all text-white p-3.5"
                required
              />
            </div>
            <div>
              <label className="text-sm text-text-muted font-medium mb-1 block">Description</label>
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
                className="w-full rounded-xl bg-surface-dim border border-surface-border focus:border-brand-primary outline-none transition-all text-white p-3.5 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              className="self-start px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Create Category
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
