import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCheck,
  Check,
  Trash2,
  Clock,
  Inbox,
  FilePlus2,
  AlertCircle,
  Building2,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Flag,
  TrendingDown,
  MailX,
  Bell,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  adminNotifications,
  adminNotificationCategories,
} from "@/data/adminData";
import { toast } from "react-hot-toast";

const typeConfig = {
  "new-report": { icon: FilePlus2, cls: "bg-indigo-50 text-indigo-600", label: "New Report" },
  critical: { icon: AlertCircle, cls: "bg-rose-50 text-rose-600", label: "Critical" },
  "authority-created": { icon: Building2, cls: "bg-violet-50 text-violet-600", label: "Authority" },
  "officer-created": { icon: ShieldCheck, cls: "bg-sky-50 text-sky-600", label: "Officer" },
  escalated: { icon: GitBranch, cls: "bg-amber-50 text-amber-600", label: "Escalated" },
  resolved: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600", label: "Resolved" },
  "email-failed": { icon: MailX, cls: "bg-rose-50 text-rose-600", label: "Email Failed" },
  inactive: { icon: TrendingDown, cls: "bg-slate-100 text-slate-600", label: "Inactive" },
  overdue: { icon: Flag, cls: "bg-orange-50 text-orange-600", label: "Overdue" },
};

const filters = ["All", "Read", "Unread", "Today", "This Week"];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(adminNotifications);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("all");
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchQ =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q);
      const matchCategory =
        activeCategory === "all" || n.type === activeCategory;
      let matchFilter = true;
      if (activeFilter === "Read") matchFilter = n.read;
      if (activeFilter === "Unread") matchFilter = !n.read;
      if (activeFilter === "Today") matchFilter = n.date === "Today";
      if (activeFilter === "This Week")
        matchFilter = ["Today", "Yesterday", "2 days ago"].includes(n.date);
      return matchQ && matchCategory && matchFilter;
    });
  }, [notifications, query, activeFilter, activeCategory]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleDeleteAll = () => {
    setNotifications([]);
    setDeleteAllOpen(false);
    toast.success("All notifications cleared");
  };

  return (
    <AdminLayout
      title="Notifications"
      subtitle="System-wide notifications and alerts"
    >
      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
            : "You're all caught up"
        }
        actions={
          <>
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
            <button
              onClick={() => setDeleteAllOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl hover:bg-rose-50 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Clear all
            </button>
          </>
        }
      />

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {adminNotificationCategories.map((c) => {
            const active = activeCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle ${c.color}`} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3 animate-slide-up">
        {filtered.map((n) => {
          const cfg = typeConfig[n.type];
          const Icon = cfg.icon;
          return (
            <div
              key={n.id}
              className={`group flex items-start gap-4 p-4 rounded-2xl border bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                n.read
                  ? "border-slate-200/80"
                  : "border-indigo-100 bg-indigo-50/40 shadow-sm"
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${cfg.cls}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        title="Mark as read"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {n.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-semibold text-slate-400 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {n.date} · {n.time}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No notifications"
            description="Try adjusting your search or filters."
          />
        )}
      </div>

      {/* Clear All Dialog */}
      <ConfirmDialog
        open={deleteAllOpen}
        title="Clear all notifications?"
        message="This will permanently remove all notifications from your inbox. This action cannot be undone."
        confirmLabel="Clear All"
        tone="danger"
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </AdminLayout>
  );
}
