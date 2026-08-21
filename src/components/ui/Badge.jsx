import React from "react";

const variants = {
  default: "bg-slate-100 text-slate-700",
  primary: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
  success: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  danger: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
  info: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
  violet: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
};

const dotColors = {
  default: "bg-slate-400",
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  violet: "bg-violet-500",
};

export function Badge({
  children,
  variant = "default",
  dot = false,
  icon: Icon,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${variants[variant]}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active: { v: "success", label: "Active" },
    Inactive: { v: "default", label: "Inactive" },
    active: { v: "success", label: "Active" },
    inactive: { v: "default", label: "Inactive" },
    Pending: { v: "warning", label: "Pending" },
    "In Progress": { v: "info", label: "In Progress" },
    Assigned: { v: "primary", label: "Assigned" },
    Accepted: { v: "success", label: "Accepted" },
    Completed: { v: "violet", label: "Completed" },
    Resolved: { v: "success", label: "Resolved" },
    Rejected: { v: "danger", label: "Rejected" },
    Closed: { v: "default", label: "Closed" },
    Verified: { v: "success", label: "Verified" },
  };
  const cfg = map[status] || { v: "default", label: status || "—" };
  return (
    <Badge variant={cfg.v} dot>
      {cfg.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    Critical: "danger",
    High: "danger",
    Medium: "warning",
    Low: "default",
  };
  return <Badge variant={map[priority] || "default"}>{priority}</Badge>;
}
