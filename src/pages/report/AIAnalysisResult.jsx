import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Wrench,
  Gauge,
  Building2,
  FileText,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  AlertCircle,
  Camera,
  Pencil,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { reportCategories, reportAuthorities } from "@/data/reportsData";

// The filter list includes "All Categories" which we should strip for the editable list
const CATEGORY_OPTIONS = reportCategories.filter((c) => c !== "All Categories");

export function AIAnalysisResult({
  reportData = {
    title: "Road surface damage detected",
    description:
      "Large pothole on the eastbound lane. It is causing drivers to move into the opposite lane.",
    location: "22 Oak Street, North District",
    category: "Roads & Infrastructure",
    confidence: "92%",
    authority: "Public Works Department",
    reportId: "RPT-1042",
    priority: "High priority",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000&auto=format&fit=crop",
  },
  onTrackReport,
}) {
  const [editing, setEditing] = useState(false);
  const [category, setCategory] = useState(reportData.category);
  const [authority, setAuthority] = useState(reportData.authority);

  const handleSave = () => {
    setEditing(false);
    toast.success("Report details updated successfully.");
  };

  const handleCancel = () => {
    setCategory(reportData.category);
    setAuthority(reportData.authority);
    setEditing(false);
    toast("Changes discarded.");
  };

  const selectClass =
    "w-full pl-3 pr-8 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Your report is ready
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Our AI has reviewed your submission and routed it to the right team.
        </p>
      </div>

      {/* Main Grid Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Submitted Image & User Description */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Image Box */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-100 group">
              <img
                src={reportData.imageUrl}
                alt="Submitted issue"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white flex items-center gap-1.5 text-[11px] font-medium border border-white/10">
                <Camera className="h-3.5 w-3.5" />
                <span>Uploaded issue photo</span>
              </div>
            </div>

            {/* Description Details */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Your Description
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {reportData.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{reportData.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            {/* AI Badges Row */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI analysis</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60">
                <AlertCircle className="h-3 w-3" />
                <span>{reportData.priority}</span>
              </div>
            </div>

            {/* Main AI Finding */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {reportData.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                We identified this issue and prepared the report for the
                responsible authority.
              </p>
            </div>

            {/* Grid Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 pt-2 border-t border-slate-100">
              {/* Metric 1 - Issue Category (editable) */}
              <div className="space-y-1 order-1">
                <div className="flex items-center gap-2 text-blue-600">
                  <Wrench className="h-4 w-4" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Issue Category
                  </span>
                </div>
                {editing ? (
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={selectClass}
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-800">{category}</p>
                )}
              </div>

              {/* Metric 2 - AI Confidence */}
              <div className="space-y-1 order-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Gauge className="h-4 w-4" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    AI Confidence
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {reportData.confidence}
                </p>
              </div>

              {/* Metric 3 - Assigned Authority (editable) */}
              <div className="space-y-1 order-3 pt-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Building2 className="h-4 w-4" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Assigned Authority
                  </span>
                </div>
                {editing ? (
                  <div className="relative">
                    <select
                      value={authority}
                      onChange={(e) => setAuthority(e.target.value)}
                      className={selectClass}
                    >
                      {reportAuthorities.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-800">
                    {authority}
                  </p>
                )}
              </div>

              {/* Metric 4 - Report ID */}
              <div className="space-y-1 order-4 pt-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Report ID
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {reportData.reportId}
                </p>
              </div>
            </div>

            {/* Edit Toggle / Save Controls */}
            {editing ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSave}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.99]"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.99]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit category & authority
              </button>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onTrackReport({ category, authority })}
            className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Track this report</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
