import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCheck,
  Check,
  Trash2,
  Clock,
  Inbox,
  FilePlus2,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  GitBranch,
  Flag,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthorityLayout } from "@/layouts/authority/AuthorityLayout";
import { OfficerLayout } from "@/layouts/officer/OfficerLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { getErrorMessage } from "@/lib/api";
import {
  getOfficerNotifications,
  getWorkspaceNotifications,
} from "@/lib/reportService";
import {
  applyWorkspaceNotificationState,
  markWorkspaceNotificationRead,
  markAllWorkspaceNotificationsRead,
  deleteWorkspaceNotification,
} from "@/lib/workspaceNotifications";

const typeConfig = {
  "new-report": {
    icon: FilePlus2,
    cls: "bg-indigo-50 text-indigo-600",
    label: "New Report",
  },
  critical: {
    icon: AlertCircle,
    cls: "bg-rose-50 text-rose-600",
    label: "Critical",
  },
  officer: {
    icon: UserCheck,
    cls: "bg-sky-50 text-sky-600",
    label: "Officer",
  },
  status: {
    icon: GitBranch,
    cls: "bg-amber-50 text-amber-600",
    label: "Status",
  },
  resolved: {
    icon: CheckCircle2,
    cls: "bg-emerald-50 text-emerald-600",
    label: "Resolved",
  },
  overdue: {
    icon: Flag,
    cls: "bg-orange-50 text-orange-600",
    label: "Overdue",
  },
};

const filters = ["All", "Read", "Unread", "Today", "This Week"];

function WorkspaceNotifications({ variant }) {
  const navigate = useNavigate();
  const role = variant === "officer" ? "officer" : "authority";
  const Layout = variant === "officer" ? OfficerLayout : AuthorityLayout;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const items =
          variant === "officer"
            ? await getOfficerNotifications()
            : await getWorkspaceNotifications();
        if (!cancelled) {
          setNotifications(applyWorkspaceNotificationState(role, items));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error.data, "Failed to load notifications"));
          setNotifications([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      let matchesFilter = true;
      if (activeFilter === "Read") matchesFilter = item.read;
      if (activeFilter === "Unread") matchesFilter = !item.read;
      if (activeFilter === "Today") matchesFilter = item.date === "Today";
      if (activeFilter === "This Week") matchesFilter = (item.diffDays ?? 99) <= 7;
      return matchesQuery && matchesFilter;
    });
  }, [notifications, query, activeFilter]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAsRead = (id) => {
    markWorkspaceNotificationRead(role, id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  return (
    <Layout
      title="Notifications"
      subtitle="Updates for reports assigned to your workspace"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up."}
          </p>
        </div>
        <button
          onClick={() => {
            markAllWorkspaceNotificationsRead(
              role,
              notifications.map((item) => item.id),
            );
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
            toast.success("All notifications marked as read");
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
                activeFilter === filter
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-sm font-semibold text-slate-600">
            Loading notifications...
          </div>
        ) : (
          filtered.map((item) => {
            const cfg = typeConfig[item.type] || typeConfig.status;
            const Icon = cfg.icon;
            return (
              <div
                key={item.id}
                onClick={() =>
                  navigate(
                    variant === "officer"
                      ? item.reportId
                        ? `/officer/tasks/${item.reportId}`
                        : "/officer/tasks"
                      : item.reportId
                        ? `/authority/reports/${item.reportId}`
                        : "/authority/reports",
                  )
                }
                className={`group flex items-start gap-4 p-4 rounded-2xl border bg-white cursor-pointer ${
                  item.read ? "border-slate-200/80" : "border-indigo-100 bg-indigo-50/40"
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${cfg.cls}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <div className="flex items-center gap-1">
                      {!item.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkspaceNotification(role, item.id);
                          setNotifications((prev) =>
                            prev.filter((note) => note.id !== item.id),
                          );
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-2 inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.date} · {item.time}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No notifications"
            description="Updates about assigned reports will appear here."
          />
        )}
      </div>
    </Layout>
  );
}

export default function AuthorityNotifications() {
  return <WorkspaceNotifications variant="authority" />;
}

export function OfficerNotifications() {
  return <WorkspaceNotifications variant="officer" />;
}
