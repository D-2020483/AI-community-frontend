import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Upload,
  Send,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { OfficerLayout } from "@/layouts/officer/OfficerLayout";
import { TaskStatusBadge } from "@/components/officer/TaskStatusBadge";
import { ActionCard } from "@/components/officer/ActionCard";
import { IncidentMap } from "@/components/map/IncidentMap";
import { ActivityTimeline } from "@/components/authority/ActivityTimeline";
import { useOfficer } from "@/context/OfficerContext";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import {
  PRIMARY_BTN,
  OFFICER_STATUS_FLOW,
  allowedStatusOptions,
  canTransitionStatus,
  isTerminalOfficerStatus,
  getBrowserCoordinates,
  isValidCoordPair,
  navigationUrl,
  normalizeOfficerStatus,
  parseCoordinates,
} from "@/lib/actionState";

const priorityStyles = {
  High: "bg-rose-50 text-rose-600 border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const selectClass =
  "w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

export default function OfficerTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    tasks,
    tasksLoading,
    acceptTask,
    updateTaskStatus,
    addTaskUpdate,
  } = useOfficer();
  const { role } = useAuth();
  const canManageTask = role === "officer";

  const task = tasks.find((t) => t.id === id || t.reportId === id);

  const [status, setStatus] = useState(task?.status || "Assigned");
  const [updateText, setUpdateText] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [officerCoords, setOfficerCoords] = useState(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (task?.status) setStatus(task.status);
  }, [task?.id, task?.status]);

  if (tasksLoading && !task) {
    return (
      <OfficerLayout title="Task Details" subtitle="Loading task">
        <div className="text-center py-16 text-sm font-semibold text-slate-500">
          Loading task…
        </div>
      </OfficerLayout>
    );
  }

  if (!task) {
    return (
      <OfficerLayout title="Task Details" subtitle="Task not found">
        <div className="text-center py-16 text-slate-400">
          <p className="text-sm font-semibold text-slate-600">Task not found</p>
          <Link
            to="/officer/tasks"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to assigned tasks
          </Link>
        </div>
      </OfficerLayout>
    );
  }

  const priorityCls = priorityStyles[task.priority] || priorityStyles.Low;
  const currentStatus = normalizeOfficerStatus(task.status);
  const selectedStatus = normalizeOfficerStatus(status);
  const statusChoices = allowedStatusOptions(
    currentStatus,
    OFFICER_STATUS_FLOW,
  );
  const incidentCoords = parseCoordinates(task.location, task.lat, task.lng);
  const canNavigate = isValidCoordPair(incidentCoords?.lat, incidentCoords?.lng);
  const alreadyAccepted =
    currentStatus === "Accepted" ||
    currentStatus === "In Progress" ||
    currentStatus === "Completed";
  const canAccept = canManageTask && !alreadyAccepted && !accepting;
  const canSaveStatus =
    canManageTask &&
    !saving &&
    !isTerminalOfficerStatus(currentStatus) &&
    canTransitionStatus(currentStatus, selectedStatus, OFFICER_STATUS_FLOW);
  const canPostUpdate =
    canManageTask &&
    (updateText.trim() || fileName) &&
    !postingUpdate &&
    !isTerminalOfficerStatus(currentStatus);
  const canResolve =
    canManageTask &&
    !resolving &&
    currentStatus === "In Progress" &&
    Boolean(updateText.trim());

  const handleAccept = async () => {
    if (!canAccept) return;
    setAccepting(true);
    try {
      await acceptTask(task.id);
      setStatus("Accepted");
      toast.success("Task accepted. The authority and citizen timeline were updated.");
    } catch (error) {
      toast.error(getErrorMessage(error.data, "Could not accept this task."));
    } finally {
      setAccepting(false);
    }
  };

  const handleSave = async () => {
    if (!canSaveStatus) return;
    setSaving(true);
    try {
      await updateTaskStatus(task.id, status);
      toast.success("Status saved. Authority and citizen timelines were updated.");
    } catch (error) {
      toast.error(getErrorMessage(error.data, "Could not save the status change."));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      toast.success(`${file.name} will be noted on this update`);
    }
  };

  const handleSubmitUpdate = async () => {
    if (!canPostUpdate) return;
    const note = [updateText.trim(), fileName ? `Photo attached: ${fileName}` : ""]
      .filter(Boolean)
      .join(" ");
    setPostingUpdate(true);
    try {
      await addTaskUpdate(task.id, note);
      setUpdateText("");
      setFileName("");
      toast.success("Update posted to the authority and citizen timeline.");
    } catch (error) {
      toast.error(getErrorMessage(error.data, "Could not submit the update."));
    } finally {
      setPostingUpdate(false);
    }
  };

  const handleNavigate = async () => {
    if (!canNavigate || navigating) return;
    setNavigating(true);
    const mapsTab = window.open("", "_blank");
    let origin = officerCoords;
    try {
      origin = await getBrowserCoordinates();
      setOfficerCoords(origin);
    } catch (error) {
      toast.error(
        error.message || "Could not read your current location.",
      );
    }

    const url = navigationUrl(
      incidentCoords.lat,
      incidentCoords.lng,
      origin?.lat,
      origin?.lng,
    );
    if (mapsTab) {
      mapsTab.opener = null;
      mapsTab.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    setNavigating(false);
  };

  const handleResolve = async () => {
    if (!canResolve) return;
    setResolving(true);
    try {
      const note = updateText.trim();
      if (note) await addTaskUpdate(task.id, note);
      await updateTaskStatus(task.id, "Completed");
      setStatus("Completed");
      setUpdateText("");
      toast.success("Report marked as resolved.");
    } catch (error) {
      toast.error(getErrorMessage(error.data, "Could not resolve this report."));
    } finally {
      setResolving(false);
    }
  };

  return (
    <OfficerLayout title={task.id} subtitle={`Details for ${task.title}`}>
      <button
        onClick={() => navigate("/officer/tasks")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to assigned tasks
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
            {task.image ? (
              <div className="h-48 bg-slate-100">
                <img
                  src={task.image}
                  alt={task.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {task.id}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${priorityCls}`}
                >
                  {task.priority} priority
                </span>
                <TaskStatusBadge status={task.status} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-3">
                {task.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />{" "}
                  {task.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> {task.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> {task.citizen}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Task description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {task.description}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Incident location
            </h3>
            <IncidentMap
              location={task.location}
              lat={incidentCoords?.lat}
              lng={incidentCoords?.lng}
              originLat={officerCoords?.lat}
              originLng={officerCoords?.lng}
              reportId={task.id}
              title={task.title}
              description={task.description}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Activity timeline
            </h3>
            <ActivityTimeline items={task.timeline || []} />
          </div>

          <ActionCard
            title="Task actions"
            subtitle="Quick actions on this task"
            icon={UserCheck}
          >
            <div className="flex flex-wrap gap-3">
              {canManageTask && (
              <button
                onClick={handleAccept}
                disabled={!canAccept}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl ${PRIMARY_BTN}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {accepting
                  ? "Accepting..."
                  : alreadyAccepted
                    ? "Accepted"
                    : "Accept task"}
              </button>
              )}
              <button
                onClick={handleNavigate}
                disabled={!canNavigate || navigating}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl ${PRIMARY_BTN}`}
              >
                🧭 {navigating ? "Getting your location..." : "Navigate to Incident"}
              </button>
              <button
                onClick={() => navigate("/officer/updates")}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all cursor-pointer"
              >
                View task updates
              </button>
            </div>
          </ActionCard>
        </div>

        <div className="space-y-6">
          <ActionCard
            title="Resolution update"
            subtitle="Post a field update to this task"
            icon={Send}
          >
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-5 cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30 text-center">
                <Upload className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-600">
                    {fileName || "Upload photo or document"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Click to browse or drag & drop
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>

              <textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                rows={3}
                placeholder="Add a comment describing the field progress..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all resize-none"
              />

              <button
                onClick={handleSubmitUpdate}
                disabled={!canPostUpdate}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl ${PRIMARY_BTN}`}
              >
                <Send className="h-3.5 w-3.5" />
                {postingUpdate ? "Submitting..." : "Submit update"}
              </button>
            </div>
          </ActionCard>

          <ActionCard
            title="Task status"
            subtitle="Update the current status of this task"
            icon={CheckCircle2}
          >
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">
                  Current status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={selectClass}
                  >
                    {statusChoices.map((s) => (
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
                disabled={!canSaveStatus}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl ${PRIMARY_BTN}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={handleResolve}
                disabled={!canResolve}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl ${PRIMARY_BTN}`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {resolving
                  ? "Resolving..."
                  : currentStatus === "Completed"
                    ? "Resolved"
                    : "Mark as Resolved"}
              </button>

              {task.status === "Completed" && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-[11px] font-semibold text-emerald-700">
                    This task has been completed and submitted.
                  </p>
                </div>
              )}
            </div>
          </ActionCard>
        </div>
      </div>
    </OfficerLayout>
  );
}
