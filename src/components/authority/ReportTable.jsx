import React, { useState, useMemo } from "react";
import { Eye, MapPin } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const PAGE_SIZE = 6;

// Reusable, paginated report table with a single "View" action.
export function ReportTable({ reports, onView }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const paginated = reports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
            <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
              <th className="px-5 py-3 font-bold">Report ID</th>
              <th className="px-5 py-3 font-bold">Issue Category</th>
              <th className="px-5 py-3 font-bold">Location</th>
              <th className="px-5 py-3 font-bold">Priority</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 font-bold">Date</th>
              <th className="px-5 py-3 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {paginated.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-bold text-slate-900">{r.id}</td>
                <td className="px-5 py-3.5 text-slate-600">{r.category}</td>
                <td className="px-5 py-3.5 text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    {r.location}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <PriorityBadge priority={r.priority} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                  {r.date}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end">
                    <button
                      title="View Details"
                      onClick={() => onView(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="No reports found"
          description="Try adjusting your search or filters."
        />
      )}

      {reports.length > 0 && (
        <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {(currentPage - 1) * PAGE_SIZE + 1}
            </span>
            {" - "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * PAGE_SIZE, reports.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {reports.length}
            </span>{" "}
            reports
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`h-8 w-8 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  p === currentPage
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
