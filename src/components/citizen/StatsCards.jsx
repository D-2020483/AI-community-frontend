import React from "react";
import {
  ClipboardList,
  AlertTriangle,
  Wrench,
  CheckCircle2,
} from "lucide-react";

const iconMap = {
  ClipboardList,
  AlertTriangle,
  Wrench,
  CheckCircle2,
};

export function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon];
        return (
          <div
            key={stat.id}
            className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300"
          >
            <div
              className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-105 ${stat.iconBg}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500">
                {stat.label}
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1">
                {stat.value}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">
                {stat.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
