import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  AlertCircle,
  Wrench,
  CheckCircle,
  XCircle,
  Activity,
  Download,
} from "lucide-react";
import { downloadReport } from "@/lib/reportDownload";

export function RecentReportsTable({ reports = [], loading = false }) {
  const navigate = useNavigate();
  const getPriorityBadge = (priority) => {
    switch (String(priority || "").toLowerCase()) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <AlertCircle className="h-3 w-3" /> High
          </span>
        );

      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            Medium
          </span>
        );

      case "low":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "assigned":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
            Assigned
          </span>
        );

      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100/70 text-amber-800">
            Pending
          </span>
        );

      case "in progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
            <Wrench className="h-3 w-3" /> In Progress
          </span>
        );

      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-3 w-3" /> Resolved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent reports
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track your latest community submissions
            </p>
          </div>
          <button
            onClick={() => navigate("/reports")}
            className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 font-bold">Report ID</th>
                <th className="pb-3 font-bold">Issue Category</th>
                <th className="pb-3 font-bold">Location</th>
                <th className="pb-3 font-bold">Priority</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading your reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    You have not submitted any reports yet.
                  </td>
                </tr>
              ) : (
                reports.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3.5 font-bold text-slate-900">{item.id}</td>
                  <td className="py-3.5 text-slate-600">{item.category}</td>
                  <td className="py-3.5 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {item.location}
                    </span>
                  </td>
                  <td className="py-3.5">{getPriorityBadge(item.priority)}</td>
                  <td className="py-3.5">{getStatusBadge(item.status)}</td>
                  <td className="py-3.5 text-slate-500">{item.date}</td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Track Progress"
                        onClick={() =>
                          navigate(`/track-report/${item.id}`, {
                            state: { report: item },
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Activity className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Download Report"
                        onClick={() => downloadReport(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
