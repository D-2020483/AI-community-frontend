import React, { useMemo, useState } from "react";
import { Bell, Key, Save, UserRound, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { AuthorityLayout } from "@/layouts/authority/AuthorityLayout";
import { OfficerLayout } from "@/layouts/officer/OfficerLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";
const labelClass = "text-xs font-bold text-slate-700 block mb-1.5";

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
          checked ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function settingsKey(role) {
  return `civiclink_${role}_settings`;
}

function readSettings(role, email) {
  try {
    const raw = localStorage.getItem(settingsKey(role));
    return raw
      ? JSON.parse(raw)
      : {
          emailAlerts: true,
          statusAlerts: true,
          assignmentAlerts: true,
          weeklyDigest: false,
          email,
        };
  } catch {
    return {
      emailAlerts: true,
      statusAlerts: true,
      assignmentAlerts: true,
      weeklyDigest: false,
      email,
    };
  }
}

function WorkspaceSettings({ variant }) {
  const { user, changePassword } = useAuth();
  const role = variant === "officer" ? "officer" : "authority";
  const Layout = variant === "officer" ? OfficerLayout : AuthorityLayout;
  const displayName =
    user?.authority?.name || user?.fullName || (role === "officer" ? "Officer" : "Authority");
  const [prefs, setPrefs] = useState(() => readSettings(role, user?.email || ""));
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const orgLabel = useMemo(() => {
    if (role === "officer") {
      return user?.officer?.authority?.name || user?.officer?.department || "Field operations";
    }
    return user?.authority?.coverage || user?.authority?.district || "National coverage";
  }, [role, user]);

  const savePrefs = () => {
    localStorage.setItem(settingsKey(role), JSON.stringify(prefs));
    toast.success("Notification settings saved");
  };

  const savePassword = async () => {
    setSavingPassword(true);
    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error.data, error.message || "Could not update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Layout title="Settings" subtitle="Account, notifications, and security">
      <PageHeader
        title="Settings"
        subtitle={`Manage your ${role} workspace preferences`}
        actions={
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" /> Account active
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Account</h3>
              <p className="text-[11px] text-slate-400">Your workspace identity</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className={labelClass}>Display name</label>
              <input className={inputClass} value={displayName} readOnly />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input className={inputClass} value={user?.email || ""} readOnly />
            </div>
            <div>
              <label className={labelClass}>
                {role === "officer" ? "Authority" : "Coverage"}
              </label>
              <input className={inputClass} value={orgLabel} readOnly />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={user?.phone || user?.authority?.phone || "—"} readOnly />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <p className="text-[11px] text-slate-400">Choose what you want to be alerted about</p>
              </div>
            </div>
            <button
              type="button"
              onClick={savePrefs}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> Save
            </button>
          </div>
          <div className="p-6 divide-y divide-slate-50">
            <Toggle
              checked={prefs.emailAlerts}
              onChange={(value) => setPrefs({ ...prefs, emailAlerts: value })}
              label="Email alerts"
              description="Send an email when a new report is assigned to this workspace"
            />
            <Toggle
              checked={prefs.statusAlerts}
              onChange={(value) => setPrefs({ ...prefs, statusAlerts: value })}
              label="Status updates"
              description="Notify when a report status or timeline event changes"
            />
            <Toggle
              checked={prefs.assignmentAlerts}
              onChange={(value) => setPrefs({ ...prefs, assignmentAlerts: value })}
              label="Officer assignments"
              description="Alert when an officer is assigned to a report"
            />
            <Toggle
              checked={prefs.weeklyDigest}
              onChange={(value) => setPrefs({ ...prefs, weeklyDigest: value })}
              label="Weekly digest"
              description="Receive a weekly summary of open and resolved reports"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security</h3>
              <p className="text-[11px] text-slate-400">Change the password for this account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={savePassword}
            disabled={savingPassword}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {savingPassword ? "Saving..." : "Update password"}
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Current password</label>
            <input
              type="password"
              className={inputClass}
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              className={inputClass}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <input
              type="password"
              className={inputClass}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function AuthoritySettings() {
  return <WorkspaceSettings variant="authority" />;
}

export function OfficerSettings() {
  return <WorkspaceSettings variant="officer" />;
}
