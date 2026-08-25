import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  FileSpreadsheet,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  CheckCircle2,
  FilePlus2,
  BellRing,
  Reply,
  UserRound,
  Building2,
} from "lucide-react";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { mapCitizenFromApi } from "@/lib/adminMappers";
import { toast } from "react-hot-toast";
import { ACTION_BTN, isValidEmail } from "@/lib/actionState";

const PAGE_SIZE = 6;

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function shortId(id) {
  if (!id) return "—";
  return String(id).slice(0, 8);
}

function UserAvatar({ user }) {
  const initials = getInitials(user.fullName);
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

function matchesDateFilter(createdAt, filterDate) {
  if (filterDate === "All Dates" || !createdAt) return true;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return true;
  const now = Date.now();
  const day = 86_400_000;
  if (filterDate === "Last 7 days") return now - created <= 7 * day;
  if (filterDate === "Last 30 days") return now - created <= 30 * day;
  if (filterDate === "Last 90 days") return now - created <= 90 * day;
  if (filterDate === "This year") {
    return new Date(createdAt).getFullYear() === new Date().getFullYear();
  }
  return true;
}

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
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const applyUpdatedUser = (updated) => {
    if (!updated) return;
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setViewUser((prev) => (prev?.id === updated.id ? updated : prev));
    setEditUser((prev) => (prev?.id === updated.id ? { ...updated } : prev));
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/admin/users");
      const list = data.data?.users || data.users || [];
      setUsers(Array.isArray(list) ? list.map(mapCitizenFromApi) : []);
    } catch (error) {
      toast.error(
        getErrorMessage(error.data, error.message || "Failed to load citizens"),
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const districts = useMemo(() => {
    const values = [
      ...new Set(
        users
          .map((u) => u.district)
          .filter((d) => d && d !== "—"),
      ),
    ];
    return ["All Districts", ...values];
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQ =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.district.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "All Status" || u.status === filterStatus;
      const matchDistrict =
        filterDistrict === "All Districts" || u.district === filterDistrict;
      const matchDate = matchesDateFilter(u.createdAt, filterDate);
      return matchQ && matchStatus && matchDistrict && matchDate;
    });
  }, [users, query, filterStatus, filterDistrict, filterDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filterStatus, filterDistrict, filterDate]);

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
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      toast.error("Please allow pop-ups to export a PDF.");
      return;
    }

    const rows = filtered
      .map(
        (u) =>
          `<tr><td>${u.fullName}</td><td>${u.email}</td><td>${u.phone}</td><td>${u.district}</td><td>${u.joined}</td><td>${u.reports}</td><td>${u.status}</td></tr>`,
      )
      .join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>CivicLink Citizens</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#fff;color:#1e293b;padding:24px}
  h1{font-size:22px;margin:0 0 6px}
  p{color:#64748b;font-size:12px;margin:0 0 18px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{text-align:left;padding:8px 10px;background:#f8fafc;text-transform:uppercase;font-size:10px;color:#94a3b8}
  td{padding:8px 10px;border-top:1px solid #e2e8f0}
  @media print { body { padding: 0; } }
</style></head><body>
  <h1>Civic Link — Citizens</h1>
  <p>${filtered.length} registered citizen${filtered.length === 1 ? "" : "s"} · ${new Date().toLocaleDateString()}</p>
  <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>District</th><th>Joined</th><th>Reports</th><th>Status</th></tr></thead>
  <tbody>${rows}</tbody></table>
</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success("Use Save as PDF in the print dialog.");
  };

  const handleToggleStatus = async () => {
    if (!toggleUser || busy) return;
    setBusy(true);
    try {
      const data = await apiRequest(`/admin/users/${toggleUser.id}/status`, {
        method: "PATCH",
      });
      const updated = mapCitizenFromApi(data.data.user);
      applyUpdatedUser(updated);
      toast.success(
        `${updated.fullName} ${updated.status === "Active" ? "enabled" : "deactivated"} successfully`,
      );
      setToggleUser(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error.data, error.message || "Failed to update status"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser || busy) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/users/${deleteUser.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      if (viewUser?.id === deleteUser.id) setViewUser(null);
      if (editUser?.id === deleteUser.id) setEditUser(null);
      toast.success(`${deleteUser.fullName} deleted from the system`);
      setDeleteUser(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error.data, error.message || "Failed to delete user"),
      );
    } finally {
      setBusy(false);
    }
  };

  const openViewUser = async (user) => {
    setViewUser(user);
    setViewLoading(true);
    try {
      const data = await apiRequest(`/admin/users/${user.id}`);
      const detailed = mapCitizenFromApi(data.data?.user || data.user);
      if (detailed) applyUpdatedUser(detailed);
    } catch (error) {
      toast.error(
        getErrorMessage(error.data, error.message || "Failed to load user details"),
      );
    } finally {
      setViewLoading(false);
    }
  };

  const openEditUser = (user) => {
    setEditUser({ ...user });
  };

  const canSaveUser =
    Boolean(editUser?.fullName?.trim()) &&
    isValidEmail(editUser?.email) &&
    !busy;

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!canSaveUser) return;
    setBusy(true);
    try {
      const data = await apiRequest(`/admin/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: editUser.fullName.trim(),
          email: editUser.email.trim(),
          phone: editUser.phone === "—" ? "" : editUser.phone.trim(),
          district: editUser.district === "—" ? "" : editUser.district.trim(),
          location: editUser.location === "—" ? "" : editUser.location.trim(),
        }),
      });
      const updated = mapCitizenFromApi(data.data.user);
      applyUpdatedUser(updated);
      toast.success("User profile updated successfully");
      setEditUser(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error.data, error.message || "Failed to update user"),
      );
    } finally {
      setBusy(false);
    }
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
            <ExportButton
              onExport={handleExportCSV}
              format="csv"
              label="Export CSV"
            />
            <ExportButton
              onExport={handleExportPDF}
              format="pdf"
              label="Export PDF"
            />
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
            placeholder="Search by name, email, phone, or district..."
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
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={u} />
                        <div>
                          <p className="font-bold text-slate-900">
                            {u.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            ID: {shortId(u.id)}
                          </p>
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
                          title="View user"
                          onClick={() => openViewUser(u)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Edit User"
                          onClick={() => openEditUser(u)}
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
              title={users.length === 0 ? "No citizens yet" : "No users found"}
              description={
                users.length === 0
                  ? "Registered citizens will appear here after they create an account."
                  : "Try adjusting your search or filters to find what you're looking for."
              }
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

      {/* View Profile Modal */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User details"
        subtitle={viewUser?.email || ""}
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                openEditUser(viewUser);
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
            {viewLoading && (
              <p className="text-xs text-slate-400">Refreshing latest details…</p>
            )}
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/20">
                {getInitials(viewUser.fullName)}
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
                <p className="text-xl font-bold text-indigo-600">
                  {viewUser.totalReports}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                  Total Reports
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <p className="text-xl font-bold text-emerald-600">
                  {viewUser.resolvedReports}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                  Resolved
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100">
                <p className="text-xl font-bold text-amber-600">
                  {viewUser.pendingReports}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                  Pending
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <p className="text-xl font-bold text-sky-600">
                  {viewUser.inProgressReports}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                  In Progress
                </p>
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
                    <span className="text-slate-700">
                      Joined {viewUser.joined}
                    </span>
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
                {(viewUser.recentActivity?.length
                  ? viewUser.recentActivity
                  : []
                ).map((a) => {
                  const cfg = activityConfig[a.action] || activityConfig.submitted;
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 p-2.5 rounded-xl shrink-0 ${cfg.cls}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">
                          {a.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {a.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(!viewUser.recentActivity ||
                  viewUser.recentActivity.length === 0) && (
                  <p className="text-xs text-slate-400 pl-12">
                    No report activity yet for this citizen.
                  </p>
                )}
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
              type="button"
              onClick={() => setEditUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-form"
              disabled={!canSaveUser}
              className={`px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer ${ACTION_BTN}`}
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        {editUser && (
          <form id="edit-user-form" onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={editUser.fullName}
                  onChange={(e) =>
                    setEditUser({ ...editUser, fullName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className={inputClass}
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editUser.phone}
                  onChange={(e) =>
                    setEditUser({ ...editUser, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  District
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={editUser.district}
                  onChange={(e) =>
                    setEditUser({ ...editUser, district: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={editUser.location}
                  onChange={(e) =>
                    setEditUser({ ...editUser, location: e.target.value })
                  }
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Toggle Status Dialog */}
      <ConfirmDialog
        open={!!toggleUser}
        title={
          toggleUser?.status === "Active" ? "Deactivate user?" : "Enable user?"
        }
        message={
          toggleUser?.status === "Active"
            ? `${toggleUser?.fullName} will no longer be able to log in or submit reports. You can re-enable them anytime.`
            : `${toggleUser?.fullName} will regain access to the platform and be able to submit reports again.`
        }
        confirmLabel={
          busy
            ? "Please wait..."
            : toggleUser?.status === "Active"
              ? "Deactivate"
              : "Enable"
        }
        tone={toggleUser?.status === "Active" ? "danger" : "primary"}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleUser(null)}
        loading={busy}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleteUser}
        title="Delete user?"
        message={`This will permanently remove ${deleteUser?.fullName} from the system. Their submitted reports stay in the system without a linked citizen. This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
        loading={busy}
        loadingLabel="Deleting..."
      />
    </AdminLayout>
  );
}
