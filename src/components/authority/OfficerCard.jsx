import React from "react";
import { ClipboardList, CheckCircle2, Pencil, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";

// Availability badge with colored dot.
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

// Card used on the authority officers page.
export function OfficerCard({ officer, onEdit, onView }) {
  const initials = officer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-sm ring-2 ring-indigo-50">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{officer.name}</p>
            <p className="text-[10px] text-slate-400">{officer.department}</p>
          </div>
        </div>
        <StatusBadge status={officer.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-3 text-center">
          <ClipboardList className="h-4 w-4 text-amber-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900">
            {officer.assignedCases}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">
            Assigned Cases
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-center">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900">
            {Math.max(0, 20 - officer.assignedCases * 3)}
          </p>
          <p className="text-[10px] font-semibold text-slate-500">Completed</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <AvailabilityBadge availability={officer.availability} />
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView && onView(officer)}
            title="View"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit && onEdit(officer)}
            title="Edit"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
