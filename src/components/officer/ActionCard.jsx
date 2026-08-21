import React from "react";

export function ActionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-indigo-600" />}
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 -mt-2 mb-4">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
