import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Wrench,
  Building2,
  Sparkles,
  FileText,
  Bell,
  RefreshCw,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { ResponsiveSidebar } from "@/layouts/citizen/ResponsiveSidebar";
import { HeaderNavbar } from "@/layouts/citizen/HeaderNavbar";
import {
  formatStatus,
  getMyReports,
  getTrackedReport,
  mapComplaintToTrackView,
} from "@/lib/reportService";

const STATUS_STEPS = [
  { key: "Submitted", label: "Submitted", desc: "Report received" },
  { key: "Assigned", label: "Assigned", desc: "Team assigned" },
  { key: "In Progress", label: "In Progress", desc: "Work underway" },
  { key: "Resolved", label: "Resolved", desc: "Issue fixed" },
];

function getStatusIndex(status) {
  const normalized = formatStatus(status);
  if (normalized === "Rejected") return 0;
  const idx = STATUS_STEPS.findIndex((s) => s.key === normalized);
  return idx === -1 ? 0 : idx;
}

function getStatusBadge(status) {
  const config = {
    Submitted: "bg-slate-100 text-slate-600 border-slate-200/60",
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
      <Activity className="h-3 w-3" />
      {status}
    </span>
  );
}

export default function TrackReport() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [dbReport, setDbReport] = useState(null);
  const [myReports, setMyReports] = useState([]);

  const passed = location.state?.report || {};

  const loadReport = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setLoadError(null);

    try {
      const mine = await getMyReports({ force: isRefresh });
      setMyReports(mine);

      const latest = mine[0];
      if (!reportId) {
        if (latest) {
          navigate(`/track-report/${latest.id}`, {
            replace: true,
            state: { report: latest },
          });
        }
        return;
      }

      const owned = mine.find((item) => item.id === reportId);
      try {
        const response = await getTrackedReport(reportId);
        setDbReport(response.data);
      } catch (error) {
        setDbReport(null);
        if (!owned && latest) {
          navigate(`/track-report/${latest.id}`, {
            replace: true,
            state: { report: latest },
          });
          return;
        }
        setLoadError(
          error.message || "Could not load this report from the database.",
        );
      }
    } catch (error) {
      setLoadError(error.message || "Could not load your reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fromList = myReports.find((item) => item.id === reportId) || {};
  const report = mapComplaintToTrackView(dbReport, {
    id: passed.id || fromList.id || reportId,
    title:
      passed.title ||
      fromList.title ||
      (loading ? "Loading report…" : "Report details unavailable"),
    description: passed.description || fromList.description || "",
    location: passed.location || fromList.location || "",
    category: passed.category || fromList.category || "",
    confidence: passed.confidence || fromList.confidence || "",
    authority: passed.authority || fromList.authority || "",
    priority: passed.priority || fromList.priority || "Medium",
    status: formatStatus(passed.status || fromList.status || "Submitted"),
    date: passed.date || fromList.date || "",
    imageUrl: passed.imageUrl || fromList.imageUrl || null,
    createdAt: passed.createdAt || fromList.createdAt,
  });

  const hasReports = myReports.length > 0;

  const currentStep = getStatusIndex(report.status);

  const activityFeed = useMemo(() => {
    const reportedAt = report.createdAt
      ? new Date(report.createdAt)
      : null;
    const stamp = (date) =>
      date
        ? date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : report.date;

    const items = [
      {
        icon: FileText,
        color: "bg-slate-100 text-slate-600",
        title: "Report submitted",
        desc: "Your issue was received and queued for AI analysis.",
        time: stamp(reportedAt),
        minStep: 0,
      },
      {
        icon: Sparkles,
        color: "bg-blue-50 text-blue-600",
        title: "AI analysis completed",
        desc: `Categorized as ${report.category} and routed automatically.`,
        time: stamp(reportedAt),
        minStep: 1,
      },
      {
        icon: Building2,
        color: "bg-indigo-50 text-indigo-600",
        title: `Assigned to ${report.authority}`,
        desc: "The responsible team has been notified of your report.",
        time: stamp(reportedAt),
        minStep: 1,
      },
    ];

    if (currentStep >= 2) {
      items.push({
        icon: Wrench,
        color: "bg-amber-50 text-amber-600",
        title: "In progress",
        desc: "A field crew has been scheduled to address the issue.",
        time: stamp(reportedAt),
        minStep: 2,
      });
    }

    if (currentStep >= 3) {
      items.push({
        icon: CheckCircle2,
        color: "bg-emerald-50 text-emerald-600",
        title: "Issue resolved",
        desc: "The assigned team marked this report as resolved.",
        time: stamp(reportedAt),
        minStep: 3,
      });
    } else {
      items.push({
        icon: Bell,
        color: "bg-emerald-50 text-emerald-600",
        title: "You'll be notified",
        desc: "We'll send you an update the moment this issue is resolved.",
        time: "Ongoing",
        minStep: 0,
      });
    }

    return items.filter((item) => currentStep >= item.minStep);
  }, [currentStep, report.authority, report.category, report.createdAt, report.date]);

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNavbar
          title="Track report"
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <button
            onClick={() => navigate("/reports")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to reports
          </button>

          {!loading && !hasReports && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-10 text-center">
              <Activity className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-bold text-slate-900">
                No reports to track yet
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Submit an issue and you can follow its live status here.
              </p>
              <button
                onClick={() => navigate("/report-issue")}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 cursor-pointer"
              >
                Report an issue
              </button>
            </div>
          )}

          {hasReports && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Your reports
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {myReports.map((item) => {
                  const active = item.id === report.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        navigate(`/track-report/${item.id}`, {
                          state: { report: item },
                        })
                      }
                      className={`shrink-0 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <p className="text-[11px] font-bold">{item.id}</p>
                      <p className="text-[10px] truncate max-w-40">
                        {item.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {hasReports && loadError && !dbReport && !passed.id && !fromList.id && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
              {loadError}
            </div>
          )}

          {hasReports && loading && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-medium text-indigo-700">
              Loading the latest tracking status from the database…
            </div>
          )}

          {hasReports && (
          <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Tracking report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Follow the status of{" "}
                <span className="font-semibold text-slate-700">
                  {report.id}
                </span>{" "}
                in real time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(report.status)}
              <button
                onClick={() => loadReport(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Report Summary + Progress Timeline */}
            <div className="lg:col-span-7 space-y-6">
              {/* Report Summary Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
                <div className="relative h-56 sm:h-64 w-full bg-slate-100">
                  {report.imageUrl ? (
                    <img
                      src={report.imageUrl}
                      alt="Report issue"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      No image available
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-semibold border border-white/10">
                    {report.id}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Reported on {report.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{report.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Quick Info Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Wrench className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Category
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {report.category}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Authority
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {report.authority}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-semibold uppercase">
                          Priority
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        {report.priority}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Progress timeline
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Track where your report stands in the workflow.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                    <ShieldCheck className="h-3 w-3" />
                    Step {currentStep + 1} of {STATUS_STEPS.length}
                  </div>
                </div>

                {/* Stepper */}
                <div className="relative">
                  {/* Progress line */}
                  <div
                    className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100"
                    style={{ zIndex: 0 }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{
                        width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="relative grid grid-cols-4 gap-2">
                    {STATUS_STEPS.map((step, i) => {
                      const isActive = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div
                          key={step.key}
                          className="flex flex-col items-center text-center"
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                              isActive
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                : "bg-white border-slate-200 text-slate-300"
                            } ${isCurrent ? "ring-4 ring-indigo-100" : ""}`}
                          >
                            {isActive ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <span className="text-xs font-bold">{i + 1}</span>
                            )}
                          </div>
                          <p
                            className={`mt-2 text-[11px] font-bold ${
                              isActive ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {step.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Activity Feed */}
            <div className="lg:col-span-5 space-y-6">
              {/* Activity Feed Card */}
              <div
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up"
                style={{ animationDelay: "100ms" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Activity updates
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Latest actions on this report.
                    </p>
                  </div>
                  <FileText className="h-4 w-4 text-slate-300" />
                </div>

                <div className="space-y-0">
                  {activityFeed.map((item, i) => {
                    const Icon = item.icon;
                    const isLast = i === activityFeed.length - 1;
                    return (
                      <div
                        key={i}
                        className="relative flex gap-3 pb-6 last:pb-0"
                      >
                        {!isLast && (
                          <span className="absolute left-[13px] top-8 bottom-0 w-px bg-slate-100" />
                        )}
                        <div
                          className={`relative z-10 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${item.color}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {item.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Keep in loop / notification card */}
              <div
                className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20 animate-slide-up"
                style={{ animationDelay: "150ms" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4" />
                  <h3 className="text-sm font-bold">Stay in the loop</h3>
                </div>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  We'll send you a notification whenever {report.authority}{" "}
                  makes progress on your report. You can manage preferences
                  anytime.
                </p>
              </div>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
