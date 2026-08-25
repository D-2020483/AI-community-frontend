import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  Building2,
  User,
  Sparkles,
  MessageSquare,
  Activity,
  GitBranch,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Gauge,
  FileText,
  Plus,
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { downloadReport } from "@/lib/reportDownload";
import { toast } from "react-hot-toast";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { mapAdminReportFromApi } from "@/lib/adminMappers";
import { markReportsSeen, REPORT_SEEN_KEYS } from "@/lib/reportBadges";
import { ACTION_BTN } from "@/lib/actionState";

const PAGE_SIZE = 7;

const DEFAULT_STATUSES = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
];
const DEFAULT_PRIORITIES = ["Critical", "High", "Medium", "Low"];

const timelineConfig = [
  { key: "Reported", icon: FileText, color: "bg-slate-100 text-slate-500" },
  { key: "Assigned", icon: GitBranch, color: "bg-indigo-50 text-indigo-600" },
  { key: "Accepted", icon: CheckCircle2, color: "bg-sky-50 text-sky-600" },
  { key: "In Progress", icon: Wrench, color: "bg-amber-50 text-amber-600" },
  {
    key: "Resolved",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600",
  },
  { key: "Closed", icon: CheckCircle2, color: "bg-slate-100 text-slate-600" },
];

const statusSteps = [
  "Reported",
  "Assigned",
  "Accepted",
  "In Progress",
  "Resolved",
  "Closed",
];

function getStepIndex(status) {
  const idx = statusSteps.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function ReportsManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "All Categories",
    authority: "All Authorities",
    officer: "All Officers",
    district: "All Districts",
    status: "All Status",
    priority: "All Priority",
    dateRange: "All Dates",
  });
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewReport, setViewReport] = useState(null);
  const [deleteReport, setDeleteReport] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadReports = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/admin/reports");
        if (!cancelled) {
          const mapped = (data.data?.reports || []).map(mapAdminReportFromApi);
          setReports(mapped);
          markReportsSeen(
            mapped.map((report) => report.id),
            REPORT_SEEN_KEYS.admin,
          );
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error.data, "Failed to load reports"));
          setReports([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadReports();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(reports.map((r) => r.category).filter(Boolean))],
    [reports],
  );
  const authorities = useMemo(
    () => [...new Set(reports.map((r) => r.authority).filter((v) => v && v !== "—"))],
    [reports],
  );
  const officers = useMemo(
    () => [...new Set(reports.map((r) => r.officer).filter((v) => v && v !== "—"))],
    [reports],
  );
  const districts = useMemo(
    () => [...new Set(reports.map((r) => r.district).filter((v) => v && v !== "—"))],
    [reports],
  );
  const statuses = DEFAULT_STATUSES;
  const priorities = DEFAULT_PRIORITIES;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.citizen.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      const matchCategory =
        filters.category === "All Categories" ||
        r.category === filters.category;
      const matchAuthority =
        filters.authority === "All Authorities" ||
        r.authority === filters.authority;
      const matchOfficer =
        filters.officer === "All Officers" || r.officer === filters.officer;
      const matchDistrict =
        filters.district === "All Districts" || r.district === filters.district;
      const matchStatus =
        filters.status === "All Status" || r.status === filters.status;
      const matchPriority =
        filters.priority === "All Priority" || r.priority === filters.priority;
      return (
        matchQ &&
        matchCategory &&
        matchAuthority &&
        matchOfficer &&
        matchDistrict &&
        matchStatus &&
        matchPriority
      );
    });
  }, [reports, query, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const assignmentDirty = Boolean(
    viewReport &&
      reports.some((report) => {
        if (report.id !== viewReport.id) return false;
        return (
          report.authority !== viewReport.authority ||
          report.officer !== viewReport.officer ||
          report.status !== viewReport.status ||
          report.priority !== viewReport.priority ||
          report.category !== viewReport.category
        );
      }),
  );

  const handleDelete = async () => {
    if (!deleteReport || busy) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/reports/${deleteReport.id}`, {
        method: "DELETE",
      });
      setReports((prev) => prev.filter((r) => r.id !== deleteReport.id));
      if (viewReport?.id === deleteReport.id) setViewReport(null);
      toast.success(`Report ${deleteReport.id} deleted`);
      setDeleteReport(null);
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Failed to delete report"));
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!viewReport || assigning || !assignmentDirty) return;
    setAssigning(true);
    try {
      const data = await apiRequest(`/admin/reports/${viewReport.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: viewReport.status,
          priority: viewReport.priority,
          assignedAuthority: viewReport.authority === "—" ? "" : viewReport.authority,
          category: viewReport.category,
        }),
      });
      const updated = mapAdminReportFromApi(data.data.report);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setViewReport(updated);
      toast.success(`Report ${updated.id} updated successfully`);
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Failed to update report"));
    } finally {
      setAssigning(false);
    }
  };

  const handleDownload = (r) => {
    downloadReport({
      id: r.id,
      title: r.title,
      status: r.status,
      priority: r.priority,
      category: r.category,
      location: r.location,
      date: r.date || r.created,
      authority: r.authority,
      confidence: `${r.confidence}%`,
      description: r.description,
      progressSteps: statusSteps,
    });
    toast.success(`Report ${r.id} downloaded`);
  };

  const selectClass =
    "w-full pl-3.5 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <AdminLayout
      title="Reports Management"
      subtitle="Full access to every citizen report"
    >
      <PageHeader
        title="All Reports"
        subtitle={`${reports.length} reports submitted by citizens`}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl">
              <Filter className="h-3.5 w-3.5" /> {filtered.length} matching
            </span>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by report ID, title, citizen, or location..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
              className={selectClass}
            >
              {["All Categories", ...categories].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.authority}
              onChange={(e) => setFilter("authority", e.target.value)}
              className={selectClass}
            >
              {["All Authorities", ...authorities].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.officer}
              onChange={(e) => setFilter("officer", e.target.value)}
              className={selectClass}
            >
              {["All Officers", ...officers].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.district}
              onChange={(e) => setFilter("district", e.target.value)}
              className={selectClass}
            >
              {["All Districts", ...districts].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              className={selectClass}
            >
              {["All Status", ...statuses].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilter("priority", e.target.value)}
              className={selectClass}
            >
              {["All Priority", ...priorities].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => setFilter("dateRange", e.target.value)}
              className={selectClass}
            >
              {[
                "All Dates",
                "Last 7 days",
                "Last 30 days",
                "Last 90 days",
                "This year",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => {
              setQuery("");
              setFilters({
                category: "All Categories",
                authority: "All Authorities",
                officer: "All Officers",
                district: "All Districts",
                status: "All Status",
                priority: "All Priority",
                dateRange: "All Dates",
              });
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <SkeletonTable rows={7} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-5 py-3 font-bold">Report</th>
                  <th className="px-5 py-3 font-bold">Category</th>
                  <th className="px-5 py-3 font-bold">Citizen</th>
                  <th className="px-5 py-3 font-bold">Authority</th>
                  <th className="px-5 py-3 font-bold">Officer</th>
                  <th className="px-5 py-3 font-bold">Priority</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Created</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {paginated.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.image}
                          alt={r.title}
                          className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[180px]">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-slate-400">{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{r.category}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">{r.citizen}</p>
                      <p className="text-[10px] text-slate-400">{r.district}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {r.authority}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{r.officer}</td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={r.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                      {r.created}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Report"
                          onClick={() => setViewReport(r)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Download"
                          onClick={() => handleDownload(r)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteReport(r)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <EmptyState
              icon={Search}
              title={reports.length === 0 ? "No reports yet" : "No reports found"}
              description={
                reports.length === 0
                  ? "Citizen-submitted reports will appear here."
                  : "Try adjusting your search or filters to find reports."
              }
            />
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>
                {" - "}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length}
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
          )}
        </div>
      )}

      {/* Report Details Modal */}
      <Modal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        title="Report Details"
        subtitle={viewReport?.id || ""}
        size="xl"
        footer={
          <>
            <button
              onClick={() => viewReport && handleDownload(viewReport)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Report
            </button>
            <button
              onClick={() => setViewReport(null)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </>
        }
      >
        {viewReport && (
          <div className="space-y-6">
            {/* Image Header */}
            <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100">
              {viewReport.image ? (
              <img
                src={viewReport.image}
                alt={viewReport.title}
                className="w-full h-full object-cover"
              />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 text-sm font-semibold">
                  No photo attached
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                  {viewReport.id}
                </span>
                <StatusBadge status={viewReport.status} />
                <PriorityBadge priority={viewReport.priority} />
              </div>
            </div>

            {/* Title + Meta */}
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {viewReport.title}
              </h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />{" "}
                  {viewReport.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Created{" "}
                  {viewReport.created}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Updated{" "}
                  {viewReport.updated}
                </span>
              </div>
            </div>

            {/* AI Classification */}
            <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h5 className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                  AI Classification
                </h5>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      Predicted Category
                    </span>
                    <span className="font-bold text-violet-700">
                      {viewReport.aiCategory}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-violet-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      style={{ width: `${viewReport.confidence}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-slate-400">AI Confidence</span>
                    <span className="font-bold text-violet-600">
                      {viewReport.confidence}%
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <Gauge className="h-6 w-6 text-violet-600" />
                  </div>
                  <p className="text-[10px] font-bold text-violet-700 mt-1">
                    {viewReport.confidence}%
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Issue Description
              </h5>
              <p className="text-sm text-slate-600 leading-relaxed">
                {viewReport.description}
              </p>
            </div>

            {/* Assignment Panel */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="h-4 w-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Assignment & Management
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Authority
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.authority}
                      onChange={(e) =>
                        setViewReport({
                          ...viewReport,
                          authority: e.target.value,
                        })
                      }
                    >
                      {["Unassigned", viewReport.authority, ...authorities]
                        .filter((v, i, arr) => v && arr.indexOf(v) === i)
                        .map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Officer
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.officer}
                      onChange={(e) =>
                        setViewReport({
                          ...viewReport,
                          officer: e.target.value,
                        })
                      }
                    >
                      {["Unassigned", viewReport.officer, ...officers]
                        .filter((v, i, arr) => v && arr.indexOf(v) === i)
                        .map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.priority}
                      onChange={(e) =>
                        setViewReport({
                          ...viewReport,
                          priority: e.target.value,
                        })
                      }
                    >
                      {priorities.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.status}
                      onChange={(e) =>
                        setViewReport({ ...viewReport, status: e.target.value })
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSaveAssignment}
                disabled={assigning || !assignmentDirty}
                className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer ${ACTION_BTN}`}
              >
                {assigning ? "Assigning..." : "Save Assignment"}
              </button>
            </div>

            {/* Location Map */}
            {viewReport.lat && viewReport.lng ? (
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Location Map
              </h5>
              <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
                <MapContainer
                  center={[viewReport.lat, viewReport.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[viewReport.lat, viewReport.lng]} />
                </MapContainer>
              </div>
            </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                Map coordinates are not available for this report. Location: {viewReport.location}
              </div>
            )}

            {/* Citizen Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Citizen Information
                </h5>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {viewReport.citizen
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {viewReport.citizen}
                  </p>
                  <p className="text-xs text-slate-500">
                    {viewReport.citizenEmail}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {viewReport.district}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Progress Timeline
              </h5>
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{
                      width: `${(getStepIndex(viewReport.status) / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="relative grid grid-cols-6 gap-2">
                  {timelineConfig.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= getStepIndex(viewReport.status);
                    return (
                      <div
                        key={step.key}
                        className="flex flex-col items-center text-center"
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isActive
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30"
                              : "bg-white border-slate-200 text-slate-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <p
                          className={`mt-2 text-[10px] font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {step.key}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Citizen Comments
                </h5>
              </div>
              <p className="text-xs text-slate-400 bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                No comments on this report yet.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Report Dialog */}
      <ConfirmDialog
        open={!!deleteReport}
        title="Delete report?"
        message={`This will permanently delete report ${deleteReport?.id} and all associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteReport(null)}
        loading={busy}
        loadingLabel="Deleting..."
      />
    </AdminLayout>
  );
}
