import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  FilePlus2,
  BellRing,
  Reply,
  UserRound,
  Building2,
  Activity,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/Badge";
import { adminUsers } from "@/data/adminData";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 6;

function UserAvatar({ user }) {
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ring-2 ${
        user.status === "Active"
          ? "bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 ring-indigo-50"
          : "bg-slate-100 text-slate-400 ring-slate-50"
      }`}
    >
      {initials}
    </div>
  );
}

function ExportButton({ onExport, format, label }) {
  return (
    <button
      onClick={onExport}
      className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
    >
      {format === "csv" ? (
        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <FileText className="h-3.5 w-3.5 text-rose-600" />
      )}
      {label}
    </button>
  );
}

const activityConfig = {
  submitted: { icon: FilePlus2, cls: "bg-indigo-50 text-indigo-600" },
  notification: { icon: BellRing, cls: "bg-amber-50 text-amber-600" },
  responded: { icon: Reply, cls: "bg-blue-50 text-blue-600" },
  updated: { icon: UserRound, cls: "bg-violet-50 text-violet-600" },
  resolved: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
};

const mockTimeline = [
  { id: 1, action: "submitted", title: "Submitted a report", description: "Pothole on Oak Street (RPT-1042)", time: "Today, 10:24 AM" },
  { id: 2, action: "notification", title: "Received notification", description: "Your report RPT-1042 was approved", time: "Today, 10:30 AM" },
  { id: 3, action: "responded", title: "Authority responded", description: "Water Authority responded to RPT-1036", time: "Yesterday, 4:45 PM" },
  { id: 4, action: "updated", title: "Updated profile", description: "Changed phone number", time: "2 days ago" },
  { id: 5, action: "resolved", title: "Report resolved", description: "RPT-1039 was marked as resolved", time: "3 days ago" },
];

export default function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [filterDistrict, setFilterDistrict] = useState("All Districts");
  const [filterDate, setFilterDate] = useState("All Dates");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [toggleUser, setToggleUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [users, setUsers] = useState(adminUsers);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const districts = useMemo(
    () => ["All Districts", ...new Set(users.map((u) => u.district))],
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "All Status" || u.status === filterStatus;
      const matchDistrict =
        filterDistrict === "All Districts" || u.district === filterDistrict;
      const matchDate = filterDate === "All Dates" || true;
      return matchQ && matchStatus && matchDistrict && matchDate;
    });
  }, [users, query, filterStatus, filterDistrict, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filterStatus, filterDistrict]);

  const handleExportCSV = () => {
    const header = [
      "Full Name",
      "Email",
      "Phone",
      "District",
      "Registration Date",
      "Total Reports",
      "Status",
    ];
    const rows = filtered.map((u) => [
      u.fullName,
      u.email,
      u.phone,
      u.district,
      u.joined,
      u.reports,
      u.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "civiclink-users.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} users exported to CSV`);
  };

  const handleExportPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CivicLink Users</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f1f5f9;padding:32px;color:#1e293b}
  .page{max-width:900px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,.08)}
  .hero{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;color:#fff}
  .hero h1{font-size:24px;font-weight:800;margin-top:6px}
  .body{padding:32px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:10px 12px;background:#f8fafc;text-transform:uppercase;font-size:10px;color:#94a3b8;letter-spacing:.06em}
  td{padding:10px 12px;border-top:1px solid #f1f5f9}
</style></head><body><div class="page">
  <div class="hero"><div>Civic Link — User Directory</div><h1>${filtered.length} Users</h1></div>
  <div class="body"><table><thead><tr><th>Name</th><th>Email</th><th>District</th><th>Joined</th><th>Reports</th><th>Status</th></tr></thead>
  <tbody>${filtered
    .map(
      (u) => `<tr><td>${u.fullName}</td><td>${u.email}</td><td>${u.district}</td><td>${u.joined}</td><td>${u.reports}</td><td>${u.status}</td></tr>`
    )
    .join("")}</tbody></table></div>
</div></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "civiclink-users.html";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} users exported to PDF`);
  };

  const handleToggleStatus = () => {
    if (!toggleUser) return;
    const newStatus = toggleUser.status === "Active" ? "Inactive" : "Active";
    setUsers((prev) =>
      prev.map((u) => (u.id === toggleUser.id ? { ...u, status: newStatus } : u))
    );
    toast.success(
      `${toggleUser.fullName} ${newStatus === "Active" ? "enabled" : "disabled"} successfully`
    );
    setToggleUser(null);
  };

  const handleDelete = () => {
    if (!deleteUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    toast.success(`${deleteUser.fullName} deleted from the system`);
    setDeleteUser(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) => (u.id === editUser.id ? { ...u, ...editUser } : u))
    );
    toast.success("User profile updated successfully");
    setEditUser(null);
  };

  const selectClass =
    "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  const inputClass =
    "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";

  return (
    <AdminLayout
      title="User Management"
      subtitle="Manage all registered citizens across the platform"
    >
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered citizens in the system`}
        actions={
          <>
            <ExportButton onExport={handleExportCSV} format="csv" label="Export CSV" />
            <ExportButton onExport={handleExportPDF} format="pdf" label="Export PDF" />
          </>
        }
      />

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or district..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectClass}
            >
              {["All Status", "Active", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className={selectClass}
            >
              {districts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={selectClass}
            >
              {["All Dates", "Last 7 days", "Last 30 days", "Last 90 days", "This year"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-5 py-3 font-bold">User</th>
                  <th className="px-5 py-3 font-bold">Contact</th>
                  <th className="px-5 py-3 font-bold">District</th>
                  <th className="px-5 py-3 font-bold">Registered</th>
                  <th className="px-5 py-3 font-bold text-center">Reports</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {paginated.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} />
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {u.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <Phone className="h-3 w-3" />
                        {u.phone}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {u.district}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                      {u.joined}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                        <ClipboardList className="h-3 w-3" />
                        {u.reports}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Profile"
                          onClick={() => setViewUser(u)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Edit User"
                          onClick={() => setEditUser(u)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {u.status === "Active" ? (
                          <button
                            title="Disable User"
                            onClick={() => setToggleUser(u)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            title="Enable User"
                            onClick={() => setToggleUser(u)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          title="Delete User"
                          onClick={() => setDeleteUser(u)}
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
              title="No users found"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          )}

          {/* Pagination */}
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
                users
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* View Profile Modal */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User Profile"
        subtitle={viewUser?.email || ""}
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setEditUser(viewUser);
                setViewUser(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit User
            </button>
            <button
              onClick={() => setViewUser(null)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </>
        }
      >
        {viewUser && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/20">
                {viewUser.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {viewUser.fullName}
                </h4>
                <p className="text-xs text-slate-500">{viewUser.district}</p>
                <div className="mt-1.5">
                  <StatusBadge status={viewUser.status} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <p className="text-xl font-bold text-indigo-600">{viewUser.totalReports}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Total Reports</p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-xl font-bold text-emerald-600">{viewUser.resolvedReports}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Resolved</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <p className="text-xl font-bold text-amber-600">{viewUser.pendingReports}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Pending</p>
              </div>
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <p className="text-xl font-bold text-sky-600">{viewUser.inProgressReports}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">In Progress</p>
              </div>
            </div>

            {/* Personal + Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Personal Information
                </h5>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{viewUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">{viewUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700">Joined {viewUser.joined}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Location
                </h5>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{viewUser.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">{viewUser.district}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Timeline of Activities
              </h5>
              <div className="relative space-y-5">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100" />
                {mockTimeline.map((a) => {
                  const cfg = activityConfig[a.action];
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} className="relative flex items-start gap-4">
                      <div className={`relative z-10 p-2.5 rounded-xl shrink-0 ${cfg.cls}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        subtitle="Update user information"
        footer={
          <>
            <button
              onClick={() => setEditUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editUser && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editUser.phone}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">District</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editUser.district}
                  onChange={(e) => setEditUser({ ...editUser, district: e.target.value })}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Toggle Status Dialog */}
      <ConfirmDialog
        open={!!toggleUser}
        title={toggleUser?.status === "Active" ? "Disable user?" : "Enable user?"}
        message={
          toggleUser?.status === "Active"
            ? `${toggleUser?.fullName} will no longer be able to log in or submit reports. You can re-enable them anytime.`
            : `${toggleUser?.fullName} will regain access to the platform and be able to submit reports again.`
        }
        confirmLabel={toggleUser?.status === "Active" ? "Disable" : "Enable"}
        tone={toggleUser?.status === "Active" ? "danger" : "primary"}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleUser(null)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleteUser}
        title="Delete user?"
        message={`This will permanently remove ${deleteUser?.fullName} from the system, along with all associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
      />
    </AdminLayout>
  );
}

