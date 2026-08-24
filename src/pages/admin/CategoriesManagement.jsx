import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Tag,
  TrafficCone,
  Trash2 as TrashIcon,
  Lightbulb,
  Droplets,
  Waves,
  ShieldAlert,
  Car,
  TreePine,
  Volume2,
  Eye,
  CheckCircle2,
  Gauge,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/Badge";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { mapCategoryFromApi } from "@/lib/adminMappers";
import { toast } from "react-hot-toast";

const iconMap = {
  TrafficCone,
  Trash2: TrashIcon,
  Lightbulb,
  Droplets,
  Waves,
  ShieldAlert,
  Car,
  TreePine,
  Volume2,
  EyeOff,
};

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";
const labelClass = "text-xs font-bold text-slate-700 block mb-1.5";
const selectClass =
  "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

export default function CategoriesManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Categories");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [categories, setCategories] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [toggleCat, setToggleCat] = useState(null);
  const [deleteCat, setDeleteCat] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "Tag", color: "#4f46e5" });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/admin/categories");
      setCategories((data.data?.categories || []).map(mapCategoryFromApi));
    } catch (error) {
      toast.error(getErrorMessage(error.data, "Failed to load categories"));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const categoryOptions = useMemo(
    () =>
      [...new Set(categories.map((c) => c.name).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      const matchQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        String(c.code || "").toLowerCase().includes(q);
      const matchCategory =
        filterCategory === "All Categories" || c.name === filterCategory;
      const matchStatus =
        filterStatus === "All Status" || c.status === filterStatus;
      return matchQuery && matchCategory && matchStatus;
    });
  }, [categories, query, filterCategory, filterStatus]);

  const totalReports = categories.reduce((s, c) => s + c.reports, 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }
    setBusy(true);
    try {
      const data = await apiRequest("/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          icon: form.icon,
          color: form.color,
        }),
      });
      setCategories((prev) => [mapCategoryFromApi(data.data.category), ...prev]);
      setCreateOpen(false);
      setForm({ name: "", icon: "Tag", color: "#4f46e5" });
      toast.success("Category created successfully");
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Failed to create category"));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editCat || busy) return;
    setBusy(true);
    try {
      const data = await apiRequest(`/admin/categories/${editCat.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editCat.name,
          icon: editCat.icon,
          color: editCat.color,
        }),
      });
      const updated = mapCategoryFromApi(data.data.category);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      toast.success("Category updated successfully");
      setEditCat(null);
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Failed to update category"));
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async () => {
    if (!toggleCat || busy) return;
    setBusy(true);
    try {
      const data = await apiRequest(`/admin/categories/${toggleCat.id}/status`, {
        method: "PATCH",
      });
      const updated = mapCategoryFromApi(data.data.category);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      toast.success(
        `Category ${updated.name} ${updated.status === "Active" ? "activated" : "deactivated"}`,
      );
      setToggleCat(null);
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Failed to update status"));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCat || busy) return;
    setBusy(true);
    try {
      await apiRequest(`/admin/categories/${deleteCat.id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== deleteCat.id));
      toast.success("Category deleted");
      setDeleteCat(null);
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Failed to delete category"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout
      title="Categories"
      subtitle="Manage issue categories used across the platform"
    >
      <PageHeader
        title="Report Categories"
        subtitle={`${categories.length} categories · ${totalReports.toLocaleString()} total reports`}
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {categories.length}
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Active Categories
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {categories.filter((c) => c.status === "Active").length}
            </p>
            <p className="text-xs font-semibold text-slate-500">Enabled</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 border border-slate-100">
            <EyeOff className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {categories.filter((c) => c.status === "Inactive").length}
            </p>
            <p className="text-xs font-semibold text-slate-500">Disabled</p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={selectClass}
            >
              {["All Categories", ...categoryOptions].map((name) => (
                <option key={name}>{name}</option>
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
              {["All Status", "Active", "Inactive"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-6 py-3 font-bold">Category</th>
                  <th className="px-6 py-3 font-bold">Reports</th>
                  <th className="px-6 py-3 font-bold">Share</th>
                  <th className="px-6 py-3 font-bold">Status</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {filtered.map((c) => {
                  const Icon = iconMap[c.icon] || Tag;
                  const share = totalReports
                    ? Math.round((c.reports / totalReports) * 100)
                    : 0;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2.5 rounded-xl"
                            style={{
                              background: `${c.color}15`,
                              color: c.color,
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name}</p>
                            <p className="text-[10px] text-slate-400">
                              ID: {c.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-900">
                          {c.reports.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${share}%`,
                                background: c.color,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            {share}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Edit"
                            onClick={() => setEditCat({ ...c })}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            title={c.status === "Active" ? "Disable" : "Enable"}
                            onClick={() => setToggleCat(c)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {c.status === "Active" ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeleteCat(c)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <EmptyState
              icon={Tag}
              title="No categories found"
              description="Try a different search, filter, or add a new category."
            />
          )}
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add Category"
        subtitle="Create a new report category"
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
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Create Category
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className={labelClass}>Category Name *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Environmental Health"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Icon</label>
              <select
                className={inputClass + " appearance-none"}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              >
                {Object.keys(iconMap).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input
                type="color"
                className="w-full h-[42px] bg-white border border-slate-200 rounded-xl p-1.5 cursor-pointer"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        open={!!editCat}
        onClose={() => setEditCat(null)}
        title="Edit Category"
        subtitle="Update category details"
        footer={
          <>
            <button
              onClick={() => setEditCat(null)}
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
        {editCat && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelClass}>Category Name</label>
              <input
                type="text"
                className={inputClass}
                value={editCat.name}
                onChange={(e) =>
                  setEditCat({ ...editCat, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Icon</label>
                <select
                  className={inputClass + " appearance-none"}
                  value={editCat.icon}
                  onChange={(e) =>
                    setEditCat({ ...editCat, icon: e.target.value })
                  }
                >
                  {Object.keys(iconMap).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Color</label>
                <input
                  type="color"
                  className="w-full h-[42px] bg-white border border-slate-200 rounded-xl p-1.5 cursor-pointer"
                  value={editCat.color}
                  onChange={(e) =>
                    setEditCat({ ...editCat, color: e.target.value })
                  }
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Toggle Category Dialog */}
      <ConfirmDialog
        open={!!toggleCat}
        title={
          toggleCat?.status === "Active"
            ? "Disable category?"
            : "Enable category?"
        }
        message={
          toggleCat?.status === "Active"
            ? `Citizens will no longer be able to submit new reports under "${toggleCat?.name}". Existing reports remain unchanged.`
            : `Citizens will be able to submit reports under "${toggleCat?.name}" again.`
        }
        confirmLabel={toggleCat?.status === "Active" ? "Disable" : "Enable"}
        tone={toggleCat?.status === "Active" ? "danger" : "primary"}
        onConfirm={handleToggle}
        onCancel={() => setToggleCat(null)}
        loading={busy}
      />

      {/* Delete Category Dialog */}
      <ConfirmDialog
        open={!!deleteCat}
        title="Delete category?"
        message={`This will permanently delete "${deleteCat?.name}". Reports assigned to this category will need to be reassigned.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteCat(null)}
        loading={busy}
      />
    </AdminLayout>
  );
}
