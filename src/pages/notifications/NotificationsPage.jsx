import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Search,
  CheckCheck,
  Check,
  Trash2,
  BellRing,
  CheckCircle2,
  XCircle,
  Reply,
  Wrench,
  Sparkles,
  Clock,
  Inbox,
} from "lucide-react";
import { ResponsiveSidebar } from "@/components/layout/ResponsiveSidebar";
import { HeaderNavbar } from "@/components/layout/HeaderNavbar";
import {
  notificationsData,
  notificationCategories,
} from "@/data/notificationsData";

const typeConfig = {
  approved: {
    icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-600",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    cls: "bg-rose-50 text-rose-600",
    label: "Rejected",
  },
  responded: {
    icon: Reply,
    cls: "bg-blue-50 text-blue-600",
    label: "Responded",
  },
  status: {
    icon: Wrench,
    cls: "bg-indigo-50 text-indigo-600",
    label: "Status",
  },
  ai: { icon: Sparkles, cls: "bg-violet-50 text-violet-600", label: "AI" },
  resolved: {
    icon: CheckCircle2,
    cls: "bg-teal-50 text-teal-600",
    label: "Resolved",
  },
};

const filters = ["All", "Read", "Unread", "Today", "This Week"];

export default function NotificationsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationsData);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications.filter((n) => {
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "all" || n.type === activeCategory;
      let matchesFilter = true;
      if (activeFilter === "Read") matchesFilter = n.read;
      if (activeFilter === "Unread") matchesFilter = !n.read;
      if (activeFilter === "Today") matchesFilter = n.date === "Today";
      if (activeFilter === "This Week")
        matchesFilter = ["Today", "Yesterday", "2 days ago"].includes(n.date);
      return matchesQuery && matchesCategory && matchesFilter;
    });
  }, [notifications, query, activeFilter, activeCategory]);

  const unreadCount = notifications.filter((n) => !n.read).length;

const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    toast.success("Notification marked as read.");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast("Notification deleted.");
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNavbar
          title="Notifications"
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Notifications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
                  : "You're all caught up."}
              </p>
            </div>
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </div>

          {/* Search + Filter bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4 animate-slide-up">
            {/* Search */}
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

            {/* Filter chips */}
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

            {/* Category chips */}
            <div className="flex flex-wrap items-center gap-2">
              {notificationCategories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all cursor-pointer ${
                    activeCategory === c.key
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
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
                  {/* Icon */}
                  <div
                    className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${cfg.cls}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {n.title}
                        </h3>
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
                        <Clock className="h-3 w-3" />
                        {n.date} · {n.time}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${cfg.cls}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Inbox className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">
                  No notifications
                </p>
                <p className="text-xs mt-1">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
