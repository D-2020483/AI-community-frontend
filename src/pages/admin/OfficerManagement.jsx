import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Pencil,
  UserX,
  Trash2,
  Plus,
  Key,
  Mail,
  Phone,
  ClipboardList,
  CheckCircle2,
  Users,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/Badge";
import { officersData, authoritiesData } from "@/data/adminData";
import {
  buildOfficerEmail,
  generateTemporaryPassword,
} from "@/lib/emailTemplate";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 6;

function OfficerAvatar({ officer }) {
  const initials = `${officer.firstName[0]}${officer.lastName[0]}`;
  return officer.avatar ? (
    <img
      src={officer.avatar}
      alt="Officer"
      className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-50"
    />
  ) : (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50">
      {initials}
    </div>
  );
}

function AvailabilityBadge({ availability }) {
  const map = {
    Available: "bg-emerald-50 text-emerald-600",
    "On Field": "bg-sky-50 text-sky-600",
    Busy: "bg-amber-50 text-amber-700",
  };
  const dotMap = {
    Available: "bg-emerald-500",
    "On Field": "bg-sky-500",
    Busy: "bg-amber-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${map[availability]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotMap[availability]}`} />
      {availability}
    </span>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";
const labelClass = "text-xs font-bold text-slate-700 block mb-1.5";

export default function OfficerManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterAuthority, setFilterAuthority] = useState("All Authorities");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [officers, setOfficers] = useState(officersData);
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null);
  const [toggleOfficer, setToggleOfficer] = useState(null);
  const [deleteOfficer, setDeleteOfficer] = useState(null);
  const [resetOfficer, setResetOfficer] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    authority: authoritiesData[0].name,
    authorityId: authoritiesData[0].id,
    photo: null,
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const authorities = useMemo(
    () => ["All Authorities", ...authoritiesData.map((a) => a.name)],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return officers.filter((o) => {
      const matchQ =
        !q ||
        `${o.firstName} ${o.lastName}`.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.position.toLowerCase().includes(q);
      const matchAuth =
        filterAuthority === "All Authorities" ||
        o.authority === filterAuthority;
      const matchStatus =
        filterStatus === "All Status" || o.status === filterStatus;
      return matchQ && matchAuth && matchStatus;
    });
  }, [officers, query, filterAuthority, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filterAuthority, filterStatus]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name, and email are required");
      return;
    }
    const tempPassword = generateTemporaryPassword();
    const fullName = `${form.firstName} ${form.lastName}`;
    const newOfficer = {
      id: `off-${Date.now()}`,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || "—",
      position: form.position || "Officer",
      department: form.department || "Field Operations",
      authority: form.authority,
      authorityId: form.authorityId,
      activeReports: 0,
      completedReports: 0,
      availability: "Available",
      avatar: form.photo,
      status: "Active",
    };
    setOfficers((prev) => [newOfficer, ...prev]);
    setCreateOpen(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      authority: authoritiesData[0].name,
      authorityId: authoritiesData[0].id,
      photo: null,
    });

    const emailHtml = buildOfficerEmail({
      name: fullName,
      email: form.email,
      tempPassword,
      authority: form.authority,
    });
    window.open("", "_blank").document.write(emailHtml);
    toast.success(`Officer created. Credentials sent to ${form.email}`, {
      duration: 5000,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editOfficer) return;
    setOfficers((prev) =>
      prev.map((o) => (o.id === editOfficer.id ? { ...o, ...editOfficer } : o)),
    );
    toast.success("Officer updated successfully");
    setEditOfficer(null);
  };

  const handleToggle = () => {
    if (!toggleOfficer) return;
    const newStatus = toggleOfficer.status === "Active" ? "Inactive" : "Active";
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === toggleOfficer.id ? { ...o, status: newStatus } : o,
      ),
    );
    toast.success(
      `${toggleOfficer.firstName} ${toggleOfficer.lastName} ${newStatus === "Active" ? "activated" : "deactivated"}`,
    );
    setToggleOfficer(null);
  };

  const handleDelete = () => {
    if (!deleteOfficer) return;
    setOfficers((prev) => prev.filter((o) => o.id !== deleteOfficer.id));
    toast.success("Officer removed from the system");
    setDeleteOfficer(null);
  };

  const handleReset = () => {
    if (!resetOfficer) return;
    const tempPassword = generateTemporaryPassword();
    const emailHtml = buildOfficerEmail({
      name: `${resetOfficer.firstName} ${resetOfficer.lastName}`,
      email: resetOfficer.email,
      tempPassword,
      authority: resetOfficer.authority,
    });
    window.open("", "_blank").document.write(emailHtml);
    toast.success(
      `Password reset. New credentials sent to ${resetOfficer.email}`,
    );
    setResetOfficer(null);
  };

  const selectClass =
    "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <AdminLayout
      title="Officer Management"
      subtitle="Manage all field officers across authorities"
    >
      <PageHeader
        title="Officers"
        subtitle={`${officers.length} officers across all authorities`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Officer
          </button>
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
            placeholder="Search officers by name, email, or position..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={filterAuthority}
              onChange={(e) => setFilterAuthority(e.target.value)}
              className={selectClass}
            >
              {authorities.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
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
        </div>
      </div>

      {/* Officers Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-5 py-3 font-bold">Officer</th>
                  <th className="px-5 py-3 font-bold">Position</th>
                  <th className="px-5 py-3 font-bold">Authority</th>
                  <th className="px-5 py-3 font-bold">Contact</th>
                  <th className="px-5 py-3 font-bold text-center">Active</th>
                  <th className="px-5 py-3 font-bold text-center">Completed</th>
                  <th className="px-5 py-3 font-bold">Availability</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {paginated.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <OfficerAvatar officer={o} />
                        <div>
                          <p className="font-bold text-slate-900">
                            {o.firstName} {o.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {o.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{o.position}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {o.authority}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" /> {o.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-400 mt-1">
                        <Phone className="h-3 w-3" /> {o.phone}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                        <ClipboardList className="h-3 w-3" /> {o.activeReports}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />{" "}
                        {o.completedReports}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <AvailabilityBadge availability={o.availability} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={() => setEditOfficer(o)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Reset Password"
                          onClick={() => setResetOfficer(o)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          title={
                            o.status === "Active" ? "Deactivate" : "Activate"
                          }
                          onClick={() => setToggleOfficer(o)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteOfficer(o)}
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
              icon={Users}
              title="No officers found"
              description="Try adjusting your search or filters, or create a new officer."
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
                officers
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

      {/* Create Officer Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Officer"
        subtitle="A secure account will be created and credentials emailed"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Create & Send Credentials
            </button>
          </>
        }
      >
        <form
          id="create-officer-form"
          onSubmit={handleCreate}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input
                type="text"
                className={inputClass}
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input
                type="text"
                className={inputClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Official Email *</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Job Position</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Field Supervisor"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Field Operations"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Assign Authority</label>
              <div className="relative">
                <select
                  className={inputClass + " appearance-none"}
                  value={form.authority}
                  onChange={(e) => {
                    const auth = authoritiesData.find(
                      (a) => a.name === e.target.value,
                    );
                    setForm({
                      ...form,
                      authority: e.target.value,
                      authorityId: auth?.id || "",
                    });
                  }}
                >
                  {authoritiesData.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Upload Photo</label>
              <label className="flex items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-5 cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
                {form.photo ? (
                  <img
                    src={form.photo}
                    alt="Officer"
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Upload className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-600">
                        Upload officer photo
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PNG or JPG. Optional.
                      </p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4">
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              <strong className="font-bold">On save:</strong> A temporary
              password will be generated and login credentials emailed to{" "}
              <strong>{form.email || "the officer's official email"}</strong>.
            </p>
          </div>
        </form>
      </Modal>

      {/* Edit Officer Modal */}
      <Modal
        open={!!editOfficer}
        onClose={() => setEditOfficer(null)}
        title="Edit Officer"
        subtitle="Update officer details"
        footer={
          <>
            <button
              onClick={() => setEditOfficer(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editOfficer && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.firstName}
                  onChange={(e) =>
                    setEditOfficer({
                      ...editOfficer,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.lastName}
                  onChange={(e) =>
                    setEditOfficer({ ...editOfficer, lastName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editOfficer.email}
                  onChange={(e) =>
                    setEditOfficer({ ...editOfficer, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editOfficer.phone}
                  onChange={(e) =>
                    setEditOfficer({ ...editOfficer, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Position</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.position}
                  onChange={(e) =>
                    setEditOfficer({ ...editOfficer, position: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.department}
                  onChange={(e) =>
                    setEditOfficer({
                      ...editOfficer,
                      department: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Toggle Officer Dialog */}
      <ConfirmDialog
        open={!!toggleOfficer}
        title={
          toggleOfficer?.status === "Active"
            ? "Deactivate officer?"
            : "Activate officer?"
        }
        message={
          toggleOfficer?.status === "Active"
            ? `${toggleOfficer?.firstName} ${toggleOfficer?.lastName} will no longer be able to log in or receive new reports.`
            : `${toggleOfficer?.firstName} ${toggleOfficer?.lastName} will be re-activated and can receive reports again.`
        }
        confirmLabel={
          toggleOfficer?.status === "Active" ? "Deactivate" : "Activate"
        }
        tone={toggleOfficer?.status === "Active" ? "danger" : "primary"}
        onConfirm={handleToggle}
        onCancel={() => setToggleOfficer(null)}
      />

      {/* Delete Officer Dialog */}
      <ConfirmDialog
        open={!!deleteOfficer}
        title="Delete officer?"
        message={`This will permanently remove ${deleteOfficer?.firstName} ${deleteOfficer?.lastName} from the system.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOfficer(null)}
      />

      {/* Reset Password Dialog */}
      <ConfirmDialog
        open={!!resetOfficer}
        title="Reset officer password?"
        message={`A new temporary password will be generated and emailed to ${resetOfficer?.email}.`}
        confirmLabel="Reset & Send"
        tone="primary"
        onConfirm={handleReset}
        onCancel={() => setResetOfficer(null)}
      />
    </AdminLayout>
  );
}
