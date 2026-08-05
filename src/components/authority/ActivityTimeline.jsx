import React from "react";
import { CheckCircle2, GitBranch, Wrench, FileText } from "lucide-react";

// Map a timeline label to its icon + color.
const iconMap = {
  Reported: { icon: FileText, color: "bg-slate-100 text-slate-500" },
  Assigned: { icon: GitBranch, color: "bg-indigo-50 text-indigo-600" },
  "In Progress": { icon: Wrench, color: "bg-amber-50 text-amber-600" },
  Resolved: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
};

// Vertical activity timeline shown on the report details page.
export function ActivityTimeline({ items = [] }) {
  return (
    <div className="relative">
      <div className="absolute top-2 bottom-2 left-[19px] w-px bg-slate-200" />
      <div className="space-y-5">
        {items.map((item, i) => {
          const cfg = iconMap[item.label] || iconMap.Reported;
          const Icon = cfg.icon;
          return (
            <div key={i} className="relative flex items-start gap-4">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${cfg.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="pt-1">
                <p className="text-sm font-bold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
