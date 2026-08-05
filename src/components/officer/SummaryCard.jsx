import React from "react";

export function SummaryCard({ icon: Icon, label, value, subtext, iconBg }) {
  return (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-4 transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300">
      <div
        className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <span className="text-2xl font-bold text-slate-900 mt-1">{value}</span>
        {subtext && (
          <span className="text-[11px] font-medium text-slate-400 mt-1">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}
