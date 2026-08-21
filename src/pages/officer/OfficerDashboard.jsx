import React from "react";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { OfficerLayout } from "@/layouts/officer/OfficerLayout";
import { SummaryCard } from "@/components/officer/SummaryCard";
import { TaskListItem } from "@/components/officer/TaskListItem";
import { useOfficer } from "@/context/OfficerContext";
import { useAuth } from "@/context/AuthContext";

export default function OfficerDashboard() {
  const { tasks, tasksLoading, tasksError } = useOfficer();
  const { user } = useAuth();
  const officerName = user?.fullName || "Field Officer";

  const assigned = tasks.length;
  const highPriority = tasks.filter((t) => t.priority === "High").length;
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const completedToday = tasks.filter((t) => {
    if (t.status !== "Completed") return false;
    const updated = new Date(t.updatedAt);
    return !Number.isNaN(updated.getTime()) && updated >= startToday;
  }).length;

  const sortedTasks = [...tasks].slice(0, 5);

  return (
    <OfficerLayout
      title="Overview"
      subtitle="Your assigned tasks and field performance"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden animate-fade-in">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Officer Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
              Welcome, {officerName}
            </h2>
            <p className="text-sm text-white/90 mt-1">
              Here's what's on your plate today. Stay on top of your assigned
              tasks and field updates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Assigned
              </p>
              <p className="text-2xl font-extrabold">{assigned}</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Completed today
              </p>
              <p className="text-2xl font-extrabold">{completedToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
        <SummaryCard
          icon={ClipboardList}
          label="Assigned tasks"
          value={assigned}
          subtext="Total tasks in your queue"
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="High priority tasks"
          value={highPriority}
          subtext="Need immediate attention"
          iconBg="bg-rose-50 text-rose-600 border-rose-100"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Completed today"
          value={completedToday}
          subtext="Tasks marked complete"
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
      </div>

      {/* Assigned Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assigned tasks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tasks assigned to you for field resolution
            </p>
          </div>
          <Link
            to="/officer/tasks"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {tasksLoading ? (
            <p className="text-sm font-semibold text-slate-500 py-6 text-center">
              Loading assigned tasks…
            </p>
          ) : tasksError ? (
            <p className="text-sm font-semibold text-rose-600 py-6 text-center">
              {tasksError}
            </p>
          ) : sortedTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No reports have been assigned to you yet.
            </p>
          ) : (
            sortedTasks.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))
          )}
        </div>
      </div>
    </OfficerLayout>
  );
}