import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Wrench,
  Gauge,
  Building2,
  FileText,
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
import { reportAuthorities } from "@/data/reportsData";
import { CATEGORY_OPTIONS } from "@/data/issueCategories";
import { labelForCategory } from "@/lib/categoryService";

const PRIORITY_STYLES = {
  HIGH: "bg-rose-50 text-rose-700 border-rose-200/60",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200/60",
  LOW: "bg-slate-100 text-slate-600 border-slate-200/60",
};

export function AIAnalysisResult({
  aiResult,
  description,
  location,
  imagePreviewUrl,
  onTrackReport,
  categoryOptions = CATEGORY_OPTIONS,
}) {
  const [editing, setEditing] = useState(false);

  const [category, setCategory] = useState(aiResult.issue_category);

  const [authority, setAuthority] = useState(
    aiResult.assigned_authority?.name || ""
  );

  const handleSave = () => {
    setEditing(false);

    toast.success("Report details updated successfully.");
  };

  const handleCancel = () => {
    setCategory(aiResult.issue_category);

    setAuthority(aiResult.assigned_authority?.name || "");

    setEditing(false);

    toast("Changes discarded.");
  };

  const selectClass =
    "w-full pl-3 pr-8 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  /*
   * Convert AI confidence from decimal to percentage.
   *
   * Example:
   * 0.92 -> 92%
   * 0.87 -> 87%
   */
  const confidence =
    typeof aiResult.confidence === "number"
      ? `${Math.round(aiResult.confidence * 100)}%`
      : aiResult.confidence;

  /*
   * Get priority style safely.
   *
   * Example:
   * HIGH -> red
   * MEDIUM -> amber
   * LOW -> gray
   */
  const priorityStyle =
    PRIORITY_STYLES[aiResult.priority] || PRIORITY_STYLES.LOW;

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

        {/* Manual Review Warning */}
        {aiResult.needs_review && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-700 text-xs font-semibold">
            <AlertCircle className="h-3.5 w-3.5" />

            <span>
              This report was flagged for manual review before it's finalized.
            </span>
          </div>
        )}
      </div>

      {/* Main Grid Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
    {/* LEFT COLUMN */}
        {/* SUBMITTED DETAILS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            {/* Image Box */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-100 group">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt="Submitted issue"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No image available
                </div>
              )}

              {/* Image Label */}
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
                {description}
              </p>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />

                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT COLUMN - AI ANALYSIS */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            {/* AI Badges Row */}
            <div className="flex items-center justify-between">
              {/* AI Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                <Sparkles className="h-3.5 w-3.5" />

                <span>AI analysis</span>
              </div>

              {/* Priority Badge */}
              <div
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${priorityStyle}`}
              >
                <AlertCircle className="h-3 w-3" />

                <span>
                  {aiResult.priority
                    ? `${aiResult.priority} priority`
                    : "Priority not available"}
                </span>
              </div>
            </div>
            {/* MAIN AI FINDING */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {aiResult.detected_issue}
              </h3>

              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {aiResult.reason ||
                  "We identified this issue and prepared the report for the responsible authority."}
              </p>
            </div>
            {/* GRID METRICS */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 pt-2 border-t border-slate-100">
              {/* METRIC 1 - ISSUE CATEGORY */}
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
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-800">
                    {labelForCategory(category, categoryOptions)}
                  </p>
                )}
              </div>
              {/* METRIC 2 - AI CONFIDENCE */}
              <div className="space-y-1 order-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Gauge className="h-4 w-4" />

                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    AI Confidence
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800">
                  {confidence}
                </p>
              </div>
          
              {/* METRIC 3 - ASSIGNED AUTHORITY */}
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
              {/* METRIC 4 - REPORT ID */}
              <div className="space-y-1 order-4 pt-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />

                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Report ID
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-800">
                  {aiResult.report_id}
                </p>
              </div>
            </div>
            {/* EDIT / SAVE / CANCEL */}
            {editing ? (
              <div className="flex items-center gap-2 pt-1">
                {/* Save */}
                <button
                  onClick={handleSave}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.99]"
                >
                  <Check className="h-3.5 w-3.5" />

                  <span>Save changes</span>
                </button>

                {/* Cancel */}
                <button
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.99]"
                >
                  <X className="h-3.5 w-3.5" />

                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              /* Edit Button */
              <button
                onClick={() => setEditing(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.99]"
              >
                <Pencil className="h-3.5 w-3.5" />

                <span>Edit category & authority</span>
              </button>
            )}
          </div>
          {/* TRACK REPORT */}
          <button
            onClick={() =>
              onTrackReport({
                category,
                authority,
              })
            }
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