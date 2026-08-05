import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Eye,
  Pencil,
  UserX,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Users,
  ClipboardList,
  CheckCircle2,
  Building2,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/Badge";
import { authoritiesData } from "@/data/adminData";
import {
  generateTemporaryPassword,
  buildAuthorityEmail,
} from "@/lib/emailTemplate";
import { toast } from "react-hot-toast";

function AuthorityLogo({ name, logo, status }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return logo ? (
    <img
      src={logo}
      alt={name}
      className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
    />
  ) : (
    <div
      className={`h-14 w-14 rounded-xl flex items-center justify-center text-base font-bold ring-1 ${
        status === "Active"
          ? "bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 ring-indigo-100"
          : "bg-slate-100 text-slate-400 ring-slate-100"
      }`}
    >
      {initials}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";
const labelClass = "text-xs font-bold text-slate-700 block mb-1.5";

export default function AuthorityManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [authorities, setAuthorities] = useState(authoritiesData);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAuth, setEditAuth] = useState(null);
  const [deactivateAuth, setDeactivateAuth] = useState(null);
  const [deleteAuth, setDeleteAuth] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    coverage: "",
    district: "",
    description: "",
    logo: null,
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return authorities.filter((a) => {
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "All Status" || a.status === filterStatus;
      return matchQ && matchStatus;
    });
  }, [authorities, query, filterStatus]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Authority name and email are required");
      return;
    }
    const tempPassword = generateTemporaryPassword();
    const emailHtml = buildAuthorityEmail({
      name: form.name,
      email: form.email,
      tempPassword,
    });

    const newAuth = {
      id: `auth-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone || "—",
      address: form.address || "—",
      coverage: form.coverage || "All Metro Districts",
      district: form.district || "Central District",
      description: form.description || "",
      officers: 0,
      activeReports: 0,
      resolvedReports: 0,
      populationCovered: 0,
      areaSize: "—",
      operatingHours: "Mon–Fri, 8:00 AM – 5:00 PM",
      head: { name: "TBD", position: "Head of Authority" },
      status: "Active",
      logo: form.logo,
    };

    setAuthorities((prev) => [newAuth, ...prev]);
    setCreateOpen(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      coverage: "",
      district: "",
      description: "",
      logo: null,
    });

    window.open("", "_blank").document.write(emailHtml);
    toast.success(
      `Authority created. Temporary password sent to ${form.email}`,
      { duration: 5000 },
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, logo: reader.result });
      toast.success("Logo uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editAuth) return;
    setAuthorities((prev) =>
      prev.map((a) => (a.id === editAuth.id ? { ...a, ...editAuth } : a)),
    );
    toast.success("Authority updated successfully");
    setEditAuth(null);
  };

  const handleDeactivate = () => {
    if (!deactivateAuth) return;
    const newStatus =
      deactivateAuth.status === "Active" ? "Inactive" : "Active";
    setAuthorities((prev) =>
      prev.map((a) =>
        a.id === deactivateAuth.id ? { ...a, status: newStatus } : a,
      ),
    );
    toast.success(
      `${deactivateAuth.name} ${newStatus === "Active" ? "activated" : "deactivated"} successfully`,
    );
    setDeactivateAuth(null);
  };

  const handleDelete = () => {
    if (!deleteAuth) return;
    setAuthorities((prev) => prev.filter((a) => a.id !== deleteAuth.id));
    toast.success(`${deleteAuth.name} removed from the system`);
    setDeleteAuth(null);
  };

  const selectClass =
    "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <AdminLayout
      title="Authority Management"
      subtitle="Centrally manage all government authorities"
    >
      <PageHeader
        title="Authorities"
        subtitle={`${authorities.length} registered government authorities`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Authority
          </button>
        }
      />

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search authorities by name, email, or district..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="relative max-w-[220px]">
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

      {/* Authority Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-slide-up">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4 min-w-0">
                  <AuthorityLogo
                    name={a.name}
                    logo={a.logo}
                    status={a.status}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {a.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" /> {a.email}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mt-4 line-clamp-2">
                {a.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3" /> Officers
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {a.officers}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <ClipboardList className="h-3 w-3" /> Active Reports
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {a.activeReports}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Resolved Reports
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {a.resolvedReports}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                  <p className="text-[9px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> District
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {a.district}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5">
                <button
                  onClick={() => navigate(`/admin/authorities/${a.id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  onClick={() => setEditAuth(a)}
                  title="Edit"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeactivateAuth(a)}
                  title={a.status === "Active" ? "Deactivate" : "Activate"}
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                >
                  <UserX className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteAuth(a)}
                  title="Delete"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No authorities found"
          description="Try adjusting your search or create a new authority."
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Create Authority
            </button>
          }
        />
      )}

      {/* Create Authority Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Authority"
        subtitle="An account will be generated and login credentials emailed"
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
          id="create-auth-form"
          onSubmit={handleCreate}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Authority Logo</label>
              <label className="flex items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-6 cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
                {form.logo ? (
                  <img
                    src={form.logo}
                    alt="Logo"
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Upload className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-600">
                        Upload authority logo
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PNG, JPG or SVG. Recommended 128×128px.
                      </p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            <div>
              <label className={labelClass}>Authority Name *</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Housing Development Corp."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Official Email *</label>
              <input
                type="email"
                className={inputClass}
                placeholder="official@citymail.gov"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="tel"
                className={inputClass}
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>District</label>
              <select
                className={inputClass + " appearance-none"}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              >
                {[
                  "North District",
                  "Central District",
                  "East District",
                  "West District",
                  "South District",
                  "Industrial Zone",
                  "Harbor District",
                ].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Office Address</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Street address, city"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Coverage Area</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. North, Central & East Districts"
                value={form.coverage}
                onChange={(e) => setForm({ ...form, coverage: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                className={inputClass + " min-h-24 resize-y"}
                placeholder="Describe the authority's responsibilities..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4">
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              <strong className="font-bold">On save:</strong> A secure account
              will be generated, a temporary password created, and a
              professional HTML email with login credentials will be sent to{" "}
              <strong>{form.email || "the official email"}</strong>. The
              authority will be required to change their password after first
              login.
            </p>
          </div>
        </form>
      </Modal>

      {/* Edit Authority Modal */}
      <Modal
        open={!!editAuth}
        onClose={() => setEditAuth(null)}
        title="Edit Authority"
        subtitle="Update authority information"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setEditAuth(null)}
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
        {editAuth && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Authority Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editAuth.name}
                  onChange={(e) =>
                    setEditAuth({ ...editAuth, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Official Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editAuth.email}
                  onChange={(e) =>
                    setEditAuth({ ...editAuth, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editAuth.phone}
                  onChange={(e) =>
                    setEditAuth({ ...editAuth, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>District</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editAuth.district}
                  onChange={(e) =>
                    setEditAuth({ ...editAuth, district: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Office Address</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editAuth.address}
                  onChange={(e) =>
                    setEditAuth({ ...editAuth, address: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Coverage Area</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editAuth.coverage}
                  onChange={(e) =>
                    setEditAuth({ ...editAuth, coverage: e.target.value })
                  }
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Deactivate Dialog */}
      <ConfirmDialog
        open={!!deactivateAuth}
        title={
          deactivateAuth?.status === "Active"
            ? "Deactivate authority?"
            : "Activate authority?"
        }
        message={
          deactivateAuth?.status === "Active"
            ? `${deactivateAuth?.name} will stop receiving new reports and its officers won't be able to log in.`
            : `${deactivateAuth?.name} will be re-activated and resume receiving reports.`
        }
        confirmLabel={
          deactivateAuth?.status === "Active" ? "Deactivate" : "Activate"
        }
        tone={deactivateAuth?.status === "Active" ? "danger" : "primary"}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateAuth(null)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleteAuth}
        title="Delete authority?"
        message={`This will permanently remove ${deleteAuth?.name} along with all officers and associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteAuth(null)}
      />
    </AdminLayout>
  );
}
