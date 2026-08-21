import React from "react";
import { MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TaskStatusBadge } from "@/components/officer/TaskStatusBadge";

const priorityStyles = {
  High: "bg-rose-50 text-rose-600 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

export function TaskListItem({ task }) {
  const navigate = useNavigate();
  const priorityCls = priorityStyles[task.priority] || priorityStyles.Low;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:shadow-lifted hover:border-slate-300 transition-all duration-300">
      {/* Thumb */}
      <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-slate-200">
        {task.image ? (
          <img
            src={task.image}
            alt={task.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-slate-100" />
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            {task.id}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityCls}`}
          >
            <AlertCircle className="h-3 w-3" />
            {task.priority}
          </span>
          <TaskStatusBadge status={task.status} />
        </div>
        <p className="mt-1.5 text-sm font-bold text-slate-900 truncate">
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-slate-400" />
          {task.location}
        </p>
      </div>

      {/* Type + action */}
      <div className="flex items-center justify-between sm:justify-end gap-4">
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {task.type}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{task.date}</p>
        </div>
        <button
          onClick={() => navigate(`/officer/tasks/${task.id}`)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          Open task
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
