import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Gauge,
  User,
  GitBranch,
  Save,
  UserCheck,
  ChevronDown,
  Building2,
} from "lucide-react";
import toast from "react-hot-toast";
import { AuthorityLayout } from "@/layouts/authority/AuthorityLayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { ActivityTimeline } from "@/components/authority/ActivityTimeline";
import { MapPlaceholder } from "@/components/authority/MapPlaceholder";
import { AssignOfficerModal } from "@/components/authority/AssignOfficerModal";
import { useAuthority } from "@/context/AuthorityContext";
import { reportStatusOptions } from "@/data/authority/mockReports";

const selectClass =
  "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

export default function AuthorityReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, officers, assignOfficer, updateReportStatus, reportsLoading } =
    useAuthority();

  const report = reports.find((r) => r.id === id || r.reportId === id);
  const ai = report?.ai || {
    detectedIssue: report?.title || "Civic issue reported",
    category: report?.category || "",
    priority: report?.priority || "Medium",
    confidence: 0,
  };
  const citizenName = report?.citizen || "Citizen";

  // Local state for resolution controls.
  const [status, setStatus] = useState(report?.status || "Pending");
  const [assignedOfficer, setAssignedOfficer] = useState(
    report?.assignedOfficer || "",
  );
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!report) return;
    setStatus(report.status || "Pending");
    setAssignedOfficer(report.assignedOfficer || "");
  }, [report?.id, report?.status, report?.assignedOfficer, report?.timeline]);

  if (!report) {
    return (
      <AuthorityLayout title="Report Details" subtitle="Report not found">
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm font-semibold text-slate-600">
            {reportsLoading ? "Loading report…" : "Report not found"}
          </p>
          <Link
            to="/authority/reports"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to reports
          </Link>
        </div>
      </AuthorityLayout>
    );
  }

  const handleAssign = async (officerName) => {
    try {
      await assignOfficer(report.id, officerName);
      setAssignedOfficer(officerName);
      setStatus("Assigned");
      setAssignModalOpen(false);
      toast.success("Officer assigned successfully");
    } catch {
      toast.error("Could not assign the officer.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateReportStatus(report.id, status, assignedOfficer);
      toast.success("Changes saved. The citizen timeline was updated.");
    } catch {
      toast.error("Could not save the status change.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthorityLayout title={report.id} subtitle={`Details for ${report.title}`}>
      {/* Back button */}
      <button
        onClick={() => navigate("/authority/reports")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to reports
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image + title */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
            <div className="relative h-56 sm:h-64 bg-slate-100">
              {report.image ? (
              <img
                src={report.image}
                alt={report.title}
                className="w-full h-full object-cover"
              />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                  No photo attached
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                  {report.id}
                </span>
                <StatusBadge status={report.status} />
                <PriorityBadge priority={report.priority} />
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900">
                {report.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />{" "}
                  {report.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />{" "}
                  {report.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />{" "}
                  {report.authority}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {report.description}
            </p>
          </div>

          {/* AI Analysis */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-violet-600" />
              <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                AI Analysis
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Detected Issue
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {ai.detectedIssue}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Category
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {ai.category}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Priority
                </p>
                <PriorityBadge priority={ai.priority} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-600">
                  Confidence Score
                </span>
                <span className="font-bold text-violet-700">
                  {ai.confidence}%
                </span>
              </div>
              <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                  style={{ width: `${ai.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              Activity Timeline
            </h3>
            <ActivityTimeline items={report.timeline} />
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6">
          {/* Resolution Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Resolution Controls
              </h3>
            </div>

            <div className="space-y-4">
              {/* Assign officer */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Assigned Officer
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      className={selectClass}
                    >
                      <option value="">No officer assigned</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.name}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setAssignModalOpen(true)}
                    title="Assign Officer"
                    className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors cursor-pointer shrink-0"
                  >
                    <UserCheck className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Update status */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Update Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={selectClass}
                  >
                    {reportStatusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Location Map
            </h3>
            <MapPlaceholder
              location={report.location}
              lat={report.lat}
              lng={report.lng}
            />
          </div>

          {/* Citizen info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Reported By
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                {citizenName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {citizenName}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {report.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Officer Modal */}
      <AssignOfficerModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onConfirm={handleAssign}
        officers={officers}
        report={report}
      />
    </AuthorityLayout>
  );
}
