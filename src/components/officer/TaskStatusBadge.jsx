import React from "react";

const statusStyles = {
  Assigned: "bg-slate-100 text-slate-600 border-slate-200",
  Accepted: "bg-emerald-50 text-emerald-600 border-emerald-200",
  "In Progress": "bg-sky-50 text-sky-600 border-sky-200",
  Completed: "bg-indigo-50 text-indigo-600 border-indigo-200",
};

export function TaskStatusBadge({ status }) {
  const cls = statusStyles[status] || statusStyles.Assigned;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
