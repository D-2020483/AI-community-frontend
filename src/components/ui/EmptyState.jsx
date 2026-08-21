import React from "react";

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-14 px-6 text-slate-400">
      {Icon && (
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon className="h-7 w-7 text-slate-300" />
        </div>
      )}
      <p className="text-sm font-bold text-slate-600">{title}</p>
      {description && (
        <p className="text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
