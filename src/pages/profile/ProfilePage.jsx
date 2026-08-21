import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Pencil,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  BellRing,
  Save,
  Key,
  Eye,
  EyeOff,
  FilePlus2,
  UserRound,
  Reply,
  Wrench,
} from "lucide-react";
import { ResponsiveSidebar } from "@/layouts/citizen/ResponsiveSidebar";
import { HeaderNavbar } from "@/layouts/citizen/HeaderNavbar";
import { useAuth } from "@/context/AuthContext";
import { useMyReports } from "@/hooks/useMyReports";
import {
  notificationsFromReports,
  unreadNotificationCount,
} from "@/lib/citizenNotifications";
import { getErrorMessage } from "@/lib/api";

const activityConfig = {
  submitted: { icon: FilePlus2, cls: "bg-indigo-50 text-indigo-600" },
  notification: { icon: BellRing, cls: "bg-amber-50 text-amber-600" },
  responded: { icon: Reply, cls: "bg-blue-50 text-blue-600" },
  updated: { icon: UserRound, cls: "bg-violet-50 text-violet-600" },
  resolved: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
  status: { icon: Wrench, cls: "bg-indigo-50 text-indigo-600" },
  approved: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
  ai: { icon: FilePlus2, cls: "bg-violet-50 text-violet-600" },
};

function roleLabel(role) {
  if (!role) return "Citizen";
  const value = String(role).toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function memberSince(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function initialsFromName(name) {
  const parts = String(name || "C")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts.slice(0, 2).map((part) => part[0]).join("") || "C").toUpperCase();
}

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-slate-200",
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ];
  return {
    score: Math.min(score, 5),
    label: labels[Math.min(score, 5)],
    color: colors[Math.min(score, 5)],
  };
}

function formFromUser(user) {
  return {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    district: user?.district || "",
  };
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { reports } = useMyReports();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => formFromUser(user));
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setForm(formFromUser(user));
  }, [user]);

  const displayName = user?.fullName || "Citizen";
  const recentActivities = useMemo(
    () => notificationsFromReports(reports).slice(0, 6),
    [reports],
  );

  const stats = [
    {
      label: "Total Reports",
      value: reports.length,
      icon: FileText,
      cls: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Resolved",
      value: reports.filter((report) => report.status === "Resolved").length,
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending",
      value: reports.filter((report) =>
        ["Pending", "Assigned"].includes(report.status),
      ).length,
      icon: Clock,
      cls: "bg-amber-50 text-amber-600",
    },
    {
      label: "Notifications",
      value: unreadNotificationCount(reports),
      icon: BellRing,
      cls: "bg-violet-50 text-violet-600",
    },
  ];

  const strength = getPasswordStrength(passwords.new);
  const joined = memberSince(user?.createdAt);

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        district: form.district.trim(),
      });
      setEditing(false);
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Could not save settings"));
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm,
      });
      setPasswords({ current: "", new: "", confirm: "" });
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Could not update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all disabled:bg-slate-50 disabled:text-slate-500";

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans">
      <ResponsiveSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <HeaderNavbar
          title="Settings"
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-600/20">
                {initialsFromName(displayName)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {displayName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wide ring-1 ring-indigo-100">
                    {roleLabel(user?.role)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                  {user?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {user.email}
                    </span>
                  )}
                  {user?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {user.phone}
                    </span>
                  )}
                  {joined && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Member since {joined}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (editing) setForm(formFromUser(user));
                  setEditing(!editing);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div
                    className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${s.cls}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {s.value}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Account
                </h3>
                <Pencil className="h-4 w-4 text-slate-400" />
              </div>

              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={form.location}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      District
                    </label>
                    <input
                      type="text"
                      value={form.district}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm({ ...form, district: e.target.value })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {editing && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-5">
                <Key className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Security</h3>
              </div>

              <form onSubmit={handlePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current: e.target.value })
                      }
                      placeholder="Enter current password"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    placeholder="Enter new password"
                    className={inputClass}
                  />
                  {passwords.new && (
                    <div className="mt-2">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i < strength.score
                                ? strength.color
                                : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 mt-1.5">
                        Password strength:{" "}
                        <span className="font-bold">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  <Key className="h-3.5 w-3.5" />
                  {savingPassword ? "Saving..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
            <h3 className="text-base font-bold text-slate-900 mb-5">
              Recent Activity
            </h3>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-slate-500">
                No activity yet. Submit a report to see updates here.
              </p>
            ) : (
              <div className="relative space-y-6">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-100" />
                {recentActivities.map((a) => {
                  const cfg = activityConfig[a.type] || activityConfig.status;
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} className="relative flex items-start gap-4">
                      <div
                        className={`relative z-10 p-2.5 rounded-xl shrink-0 ${cfg.cls}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">
                          {a.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {a.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {[a.date, a.time].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
