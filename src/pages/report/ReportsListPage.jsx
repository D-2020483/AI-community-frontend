import React, { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  MapPin,
  Download,
  Eye,
  Activity,
  ArrowRight,
  Calendar,
  AlertCircle,
  Clock,
  Wrench,
  CheckCircle,
  XCircle,
  Building2,
} from "lucide-react";
import { ResponsiveSidebar } from "@/layouts/citizen/ResponsiveSidebar";
import { HeaderNavbar } from "@/layouts/citizen/HeaderNavbar";
import { downloadReport } from "@/lib/reportDownload";
import ReportDetailsModal from "@/components/reports/ReportDetailsModal";
import {
  reportSuggestions,
  reportStatuses,
  reportPriorities,
  dateRanges,
} from "@/data/reportsData";
import { getMyReports } from "@/lib/reportService";
import { markReportsSeen, REPORT_SEEN_KEYS } from "@/lib/reportBadges";
import {
  matchesCategoryFilter,
  useIssueCategories,
} from "@/lib/categoryService";

const PAGE_SIZE = 6;

function getStatusBadge(status) {
  const config = {
    Pending: {
      cls: "bg-amber-50 text-amber-700 border-amber-200/60",
      icon: Clock,
    },
    "In Progress": {
      cls: "bg-blue-50 text-blue-600 border-blue-200/60",
      icon: Wrench,
    },
    Resolved: {
      cls: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      icon: CheckCircle,
    },
    Rejected: {
      cls: "bg-rose-50 text-rose-600 border-rose-200/60",
      icon: XCircle,
    },
    Assigned: {
      cls: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
      icon: Activity,
    },
  };
  const c = config[status] || config.Pending;
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${c.cls}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function getPriorityBadge(priority) {
  const config = {
    High: "bg-rose-50 text-rose-600 border-rose-200/60",
    Medium: "bg-amber-50 text-amber-700 border-amber-200/60",
    Low: "bg-slate-100 text-slate-600 border-slate-200/60",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config[priority] || config.Low}`}
    >
      <AlertCircle className="h-3 w-3" />
      {priority}
    </span>
  );
}

function Highlight({ text, query }) {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="bg-indigo-100 text-indigo-700 font-bold rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [status, setStatus] = useState("All Status");
  const [category, setCategory] = useState("All Categories");
  const [priority, setPriority] = useState("All Priority");
  const [dateRange, setDateRange] = useState("All Dates");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsReport, setDetailsReport] = useState(null);
  const searchRef = useRef(null);
  const { options: categoryOptions, loading: categoriesLoading } =
    useIssueCategories();
  const reportCategories = useMemo(
    () => ["All Categories", ...categoryOptions.map((option) => option.label)],
    [categoryOptions],
  );

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const reports = await getMyReports();
        setReportsData(reports);
        markReportsSeen(
          reports.map((report) => report.id),
          REPORT_SEEN_KEYS.citizen,
        );
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error(error?.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return reportSuggestions.filter((s) => s.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredReports = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reportsData.filter((r) => {
      const matchesQuery =
        !q ||
        r.title?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q);
      const matchesStatus = status === "All Status" || r.status === status;
      const matchesCategory = matchesCategoryFilter(
        r.category,
        category,
        categoryOptions,
      );
      const matchesPriority =
        priority === "All Priority" || r.priority === priority;
      return (
        matchesQuery && matchesStatus && matchesCategory && matchesPriority
      );
    });
  }, [reportsData, query, status, category, priority, categoryOptions]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const paginated = filteredReports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, category, priority]);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        setQuery(suggestions[activeIndex]);
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const selectSuggestion = (s) => {
    setQuery(s);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const selectClass =
    "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNavbar
          title="My reports"
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              My reports
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              View, search and track all the reports you've submitted.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
            {/* Search Bar */}
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                  {suggestions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => selectSuggestion(s)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                        i === activeIndex
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Highlight text={s} query={query} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectClass}
                >
                  {reportStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={categoriesLoading}
                  className={selectClass}
                >
                  {reportCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                {categoriesLoading ? (
                  <p className="mt-1 text-[10px] text-slate-400">
                    Loading categories...
                  </p>
                ) : categoryOptions.length === 0 ? (
                  <p className="mt-1 text-[10px] text-slate-400">
                    No categories available.
                  </p>
                ) : null}
              </div>

              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={selectClass}
                >
                  {reportPriorities.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className={selectClass}
                >
                  {dateRanges.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 font-bold">Report ID</th>
                    <th className="px-5 py-3 font-bold">Issue Title</th>
                    <th className="px-5 py-3 font-bold">Category</th>
                    <th className="px-5 py-3 font-bold">Date</th>
                    <th className="px-5 py-3 font-bold">Location</th>
                    <th className="px-5 py-3 font-bold">Priority</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold">Assigned Authority</th>
                    <th className="px-5 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-8 text-slate-400"
                      >
                        Loading your reports...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-8 text-slate-400"
                      >
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {item.id}
                        </td>
                        <td className="px-5 py-3.5 text-slate-700">
                          {item.title}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {item.category}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                          {item.date}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {item.location}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {getPriorityBadge(item.priority)}
                        </td>
                        <td className="px-5 py-3.5">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {item.authority}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View Details"
                              onClick={() => setDetailsReport(item)}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              title="Track Progress"
                              onClick={() => {
                                toast(
                                  "Opening live tracker for " + item.id + "…",
                                );
                                navigate(`/track-report/${item.id}`, {
                                  state: { report: item },
                                });
                              }}
                              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Activity className="h-4 w-4" />
                            </button>
                            <button
                              title="Download Report"
                              onClick={() => {
                                downloadReport(item);
                                toast.success(
                                  "Report downloaded successfully.",
                                );
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredReports.length === 0
                    ? 0
                    : (currentPage - 1) * PAGE_SIZE + 1}
                </span>
                {" - "}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * PAGE_SIZE, filteredReports.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredReports.length}
                </span>{" "}
                reports
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`h-8 w-8 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        p === currentPage
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Details Modal */}
        <ReportDetailsModal
          report={detailsReport}
          open={!!detailsReport}
          onClose={() => setDetailsReport(null)}
        />
      </div>
    </div>
  );
}
