import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Sparkles,
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
import { MapPlaceholder } from "@/components/authority/MapPlaceholder";
import { useOfficer } from "@/context/OfficerContext";
import { officerTaskStatusOptions } from "@/data/officer/mockOfficerTasks";

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
  const { tasks, acceptTask, updateTaskStatus, addTaskUpdate } = useOfficer();

  const task = tasks.find((t) => t.id === id);

  // Local state for resolution controls.
  const [status, setStatus] = useState(task?.status || "Assigned");
  const [updateText, setUpdateText] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleAccept = () => {
    acceptTask(task.id);
    setStatus("Accepted");
    toast.success("Task accepted successfully");
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateTaskStatus(task.id, status);
      // Auto-accept when moving to In Progress/Completed if still Assigned.
      setSaving(false);
      toast.success("Task status updated successfully");
    }, 600);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      toast.success(`${file.name} attached to resolution update`);
    }
  };

  const handleSubmitUpdate = () => {
    if (!updateText.trim() && !fileName) {
      toast.error("Add a comment or attach a photo first");
      return;
    }
    addTaskUpdate(task.id, updateText.trim() || "Photo attached");
    setUpdateText("");
    setFileName("");
    toast.success("Resolution update submitted");
  };

  return (
    <OfficerLayout title={task.id} subtitle={`Details for ${task.title}`}>
      {/* Back button */}
      <button
        onClick={() => navigate("/officer/tasks")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to assigned tasks
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task header card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-fade-in">
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

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Task description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Navigation (map placeholder) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Navigation
            </h3>
            <MapPlaceholder
              location={task.location}
              lat={task.lat}
              lng={task.lng}
            />
          </div>

          {/* Task actions (left) */}
          <ActionCard
            title="Task actions"
            subtitle="Quick actions on this task"
            icon={UserCheck}
          >
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAccept}
                disabled={
                  task.status === "Accepted" ||
                  task.status === "In Progress" ||
                  task.status === "Completed"
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {task.status === "Accepted" ||
                task.status === "In Progress" ||
                task.status === "Completed"
                  ? "Accepted"
                  : "Accept task"}
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

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Resolution update */}
          <ActionCard
            title="Resolution update"
            subtitle="Post a field update to this task"
            icon={Send}
          >
            <div className="space-y-3">
              {/* Dashed upload area */}
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

              {/* Comment textarea */}
              <textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                rows={3}
                placeholder="Add a comment describing the field progress..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all resize-none"
              />

              <button
                onClick={handleSubmitUpdate}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Submit update
              </button>
            </div>
          </ActionCard>

          {/* Task status */}
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
                    {officerTaskStatusOptions.map((s) => (
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
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Changes"}
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
