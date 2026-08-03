import React, { useEffect } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  Building2,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Gauge,
} from "lucide-react";

function getStatusBadge(status) {
  const config = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200/60",
    Assigned: "bg-indigo-50 text-indigo-600 border-indigo-200/60",
    "In Progress": "bg-blue-50 text-blue-600 border-blue-200/60",
    Resolved: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
    Rejected: "bg-rose-50 text-rose-600 border-rose-200/60",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
        config[status] || config.Pending
      }`}
    >
      <Clock className="h-3 w-3" />
      {status}
    </span>
  );
}

function getPriorityBadge(priority) {
  const config = {
    High: "bg-rose-50 text-rose-600 border-rose-200/60",
    Medium: "bg-amber-50 text-amber-700 border-amber-200/60",
    Low: "bg-slate-100 text-slate-600 border-slate-200/60",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
        config[priority] || config.Low
      }`}
    >
      <CheckCircle2 className="h-3 w-3" />
      {priority}
    </span>
  );
}

export default function ReportDetailsModal({ report, open, onClose }) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !report) return null;

  const details = [
    {
      icon: Wrench,
      label: "Category",
      value: report.category,
    },
    {
      icon: Building2,
      label: "Assigned authority",
      value: report.authority,
    },
    {
      icon: Gauge,
      label: "AI confidence",
      value: report.confidence || "—",
    },
    {
      icon: FileText,
      label: "Report ID",
      value: report.id,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-modal-in">
        {/* Image Header */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100">
          {report.imageUrl ? (
            <img
              src={report.imageUrl}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
              <FileText className="h-14 w-14 text-indigo-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-slate-900/50 hover:bg-slate-900/80 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                <ShieldCheck className="h-3 w-3" />
                {report.id}
              </span>
              {getStatusBadge(report.status)}
              {getPriorityBadge(report.priority)}
            </div>
            <h3 className="text-xl font-bold text-white drop-shadow-sm">
              {report.title}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Description */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Issue description
            </span>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">
              {report.description || "No detailed description provided."}
            </p>
          </div>

          {/* Location + Date Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{report.location}</span>
            </div>
            <div className="hidden sm:block h-3.5 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Reported on {report.date}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.label}
                  className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100"
                >
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-semibold uppercase">
                      {d.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1.5 leading-snug">
                    {d.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Keep this report ID handy for tracking.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
