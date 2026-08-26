import React from "react";
import { Search, ChevronDown } from "lucide-react";

const selectClass =
  "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

// Reusable search + filter + sort bar for the reports page.
export function FilterBar({
  query,
  onQueryChange,
  searchPlaceholder = "Search reports...",
  filters = [],
  sortOptions = [],
  sortValue,
  onSortChange,
  onReset,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {filters.map((f) => (
          <div key={f.key} className="relative">
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className={`${selectClass} ${f.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={f.label}
              disabled={f.disabled}
            >
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        ))}

        {sortOptions.length > 0 && (
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className={selectClass}
              aria-label="Sort"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
