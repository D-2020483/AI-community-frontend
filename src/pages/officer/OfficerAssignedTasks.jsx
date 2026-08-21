import React, { useState, useMemo, useEffect } from "react";
import { Search, ClipboardList } from "lucide-react";
import { OfficerLayout } from "@/layouts/officer/OfficerLayout";
import { TaskListItem } from "@/components/officer/TaskListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOfficer } from "@/context/OfficerContext";
import { markReportsSeen, REPORT_SEEN_KEYS } from "@/lib/reportBadges";

const statusOptions = [
  "All Status",
  "Assigned",
  "Accepted",
  "In Progress",
  "Completed",
];

export default function OfficerAssignedTasks() {
  const { tasks, tasksLoading, tasksError, refreshTasks } = useOfficer();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  useEffect(() => {
    if (!tasks.length) return;
    markReportsSeen(
      tasks.map((task) => task.id),
      REPORT_SEEN_KEYS.officer,
    );
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchQ =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        (t.type || t.category || "").toLowerCase().includes(q);
      const matchStatus = status === "All Status" || t.status === status;
      return matchQ && matchStatus;
    });
  }, [tasks, query, status]);

  const selectClass =
    "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <OfficerLayout
      title="Assigned tasks"
      subtitle="All tasks currently assigned to you"
    >
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks by title, ID, or location..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectClass}
            >
              {statusOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <span className="text-xs font-semibold text-slate-500 ml-auto">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasksLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center text-sm font-semibold text-slate-500">
            Loading assigned tasks…
          </div>
        ) : tasksError ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center text-sm font-semibold text-rose-600">
            {tasksError}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <EmptyState
              icon={ClipboardList}
              title="No tasks found"
              description="Reports assigned to you by your authority will appear here."
            />
          </div>
        ) : (
          filtered.map((task) => <TaskListItem key={task.id} task={task} />)
        )}
      </div>
    </OfficerLayout>
  );
}
