import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  ShieldCheck,
  Mail,
  Phone,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthorityLayout } from "@/layouts/authority/AuthorityLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { OfficerCard } from "@/components/authority/OfficerCard";
import { useAuthority } from "@/context/AuthorityContext";
import { ACTION_BTN } from "@/lib/actionState";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";
const labelClass = "text-xs font-bold text-slate-700 block mb-1.5";
const selectClass =
  "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

function OfficerAvatar({ officer }) {
  const initials = officer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  return (
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

const emptyForm = {
  name: "",
  department: "",
  availability: "Available",
  assignedCases: 0,
  status: "Active",
};

export default function AuthorityOfficers() {
  const { authority, officers, addOfficer, updateOfficer } = useAuthority();

  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null);
  const [viewOfficer, setViewOfficer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const canCreateOfficer =
    Boolean(form.name.trim()) && Boolean(form.department.trim()) && !saving;
  const canSaveOfficer =
    Boolean(editOfficer?.name?.trim()) &&
    Boolean(editOfficer?.department?.trim()) &&
    !saving;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return officers.filter((o) => {
      const matchQ =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "All Status" || o.status === filterStatus;
      return matchQ && matchStatus;
    });
  }, [officers, query, filterStatus]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!canCreateOfficer) return;
    const newOfficer = {
      id: `${authority?.authorityType || "auth"}-${Date.now()}`,
      name: form.name,
      department: form.department,
      authority: authority?.authorityName,
      assignedCases: form.assignedCases || 0,
      status: form.status,
      availability: form.availability,
    };
    addOfficer(newOfficer);
    setCreateOpen(false);
    setForm(emptyForm);
    toast.success("Officer added successfully");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editOfficer || !canSaveOfficer) return;
    updateOfficer(editOfficer);
    toast.success("Officer updated successfully");
    setEditOfficer(null);
  };

  return (
    <AuthorityLayout
      title="Officers"
      subtitle="Manage officers under your authority"
    >
      <PageHeader
        title="Officers"
        subtitle={`${officers.length} officers under ${authority?.authorityName}`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Officer
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
            placeholder="Search officers by name or department..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="relative sm:max-w-xs">
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

      {/* Officer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
        {filtered.map((o) => (
          <OfficerCard
            key={o.id}
            officer={o}
            onEdit={setEditOfficer}
            onView={setViewOfficer}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title="No officers found"
          description="Try adjusting your search or add a new officer."
        />
      )}

      {/* Create Officer Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Officer"
        subtitle="Add a new officer to your authority"
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
              disabled={!canCreateOfficer}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer ${ACTION_BTN}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Create Officer
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelClass}>Officer Name *</label>
            <input
              type="text"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Officer 6"
            />
          </div>
          <div>
            <label className={labelClass}>Department *</label>
            <input
              type="text"
              className={inputClass}
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Field Operations"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Availability</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={form.availability}
                  onChange={(e) =>
                    setForm({ ...form, availability: e.target.value })
                  }
                >
                  <option>Available</option>
                  <option>On Field</option>
                  <option>Busy</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
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
              disabled={!canSaveOfficer}
              className={`px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer ${ACTION_BTN}`}
            >
              Save Changes
            </button>
          </>
        }
      >
        {editOfficer && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelClass}>Officer Name</label>
              <input
                type="text"
                className={inputClass}
                value={editOfficer.name}
                onChange={(e) =>
                  setEditOfficer({ ...editOfficer, name: e.target.value })
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
                  setEditOfficer({ ...editOfficer, department: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Availability</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={editOfficer.availability}
                    onChange={(e) =>
                      setEditOfficer({
                        ...editOfficer,
                        availability: e.target.value,
                      })
                    }
                  >
                    <option>Available</option>
                    <option>On Field</option>
                    <option>Busy</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={editOfficer.status}
                    onChange={(e) =>
                      setEditOfficer({ ...editOfficer, status: e.target.value })
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* View Officer Modal */}
      <Modal
        open={!!viewOfficer}
        onClose={() => setViewOfficer(null)}
        title={viewOfficer?.name || "Officer"}
        subtitle={viewOfficer?.department || ""}
        footer={
          <button
            onClick={() => setViewOfficer(null)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        }
      >
        {viewOfficer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <OfficerAvatar officer={viewOfficer} />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {viewOfficer.name}
                </p>
                <p className="text-xs text-slate-500">
                  {viewOfficer.department}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Assigned Cases
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-amber-500" />
                  {viewOfficer.assignedCases}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Completed
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {Math.max(0, 20 - viewOfficer.assignedCases * 3)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Availability
                </p>
                <AvailabilityBadge availability={viewOfficer.availability} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Status
                </p>
                <StatusBadge status={viewOfficer.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AuthorityLayout>
  );
}
