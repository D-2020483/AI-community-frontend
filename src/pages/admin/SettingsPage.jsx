import React, { useState } from "react";
import {
  Settings,
  Globe,
  Mail,
  Shield,
  ClipboardList,
  Save,
  Building2,
  Users,
  Key,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { toast } from "react-hot-toast";

const defaultSettings = {
  general: {
    systemName: "Civic Link",
    supportEmail: "support@civiclink.gov",
    baseUrl: "https://civiclink.gov",
    timezone: "GMT+1",
  },
  email: {
    enableAutomation: true,
    authorityWelcome: true,
    officerWelcome: true,
    sendWeeklyDigest: true,
    senderName: "Civic Link Admin",
    senderEmail: "no-reply@civiclink.gov",
  },
  security: {
    forcePasswordChange: true,
    minPasswordLength: 8,
    sessionTimeout: "30 min",
    twoFactorAuth: false,
  },
  report: {
    autoAssign: true,
    escalationDays: 5,
    slaDays: 7,
    allowCitizenComments: true,
  },
};

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

function SectionCard({ icon: Icon, title, subtitle, children, onSave }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {subtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [general, setGeneral] = useState(defaultSettings.general);
  const [email, setEmail] = useState(defaultSettings.email);
  const [security, setSecurity] = useState(defaultSettings.security);
  const [report, setReport] = useState(defaultSettings.report);

  const saveGeneral = () => {
    toast.success("General settings saved successfully");
  };
  const saveEmail = () => {
    toast.success("Email automation preferences saved");
  };
  const saveSecurity = () => {
    toast.success("Security settings saved");
  };
  const saveReport = () => {
    toast.success("Report configuration saved");
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="System configuration and preferences"
    >
      <PageHeader
        title="Settings"
        subtitle="Manage system-wide configurations"
        actions={
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-xl border border-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" /> All systems operational
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* General */}
        <SectionCard
          icon={Globe}
          title="General Settings"
          subtitle="System identity and branding"
          onSave={saveGeneral}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>System Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={general.systemName}
                  onChange={(e) =>
                    setGeneral({ ...general, systemName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Timezone</label>
                <select
                  className={inputClass + " appearance-none"}
                  value={general.timezone}
                  onChange={(e) =>
                    setGeneral({ ...general, timezone: e.target.value })
                  }
                >
                  <option>GMT+1</option>
                  <option>GMT+0</option>
                  <option>EST</option>
                  <option>PST</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Base URL</label>
                <input
                  type="text"
                  className={inputClass}
                  value={general.baseUrl}
                  onChange={(e) =>
                    setGeneral({ ...general, baseUrl: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Support Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={general.supportEmail}
                  onChange={(e) =>
                    setGeneral({ ...general, supportEmail: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Email Automation */}
        <SectionCard
          icon={Mail}
          title="Email Automation"
          subtitle="Automated email delivery preferences"
          onSave={saveEmail}
        >
          <div className="divide-y divide-slate-50">
            <Toggle
              checked={email.enableAutomation}
              onChange={(v) => setEmail({ ...email, enableAutomation: v })}
              label="Enable Email Automation"
              description="Send automated emails for account creation and report updates"
            />
            <Toggle
              checked={email.authorityWelcome}
              onChange={(v) => setEmail({ ...email, authorityWelcome: v })}
              label="Authority Welcome Emails"
              description="Send credentials when a new authority is created"
            />
            <Toggle
              checked={email.officerWelcome}
              onChange={(v) => setEmail({ ...email, officerWelcome: v })}
              label="Officer Welcome Emails"
              description="Send credentials when a new officer is created"
            />
            <Toggle
              checked={email.sendWeeklyDigest}
              onChange={(v) => setEmail({ ...email, sendWeeklyDigest: v })}
              label="Weekly Digest"
              description="Send weekly performance summary to authorities"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sender Name</label>
              <input
                type="text"
                className={inputClass}
                value={email.senderName}
                onChange={(e) =>
                  setEmail({ ...email, senderName: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Sender Email</label>
              <input
                type="email"
                className={inputClass}
                value={email.senderEmail}
                onChange={(e) =>
                  setEmail({ ...email, senderEmail: e.target.value })
                }
              />
            </div>
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard
          icon={Shield}
          title="Security"
          subtitle="Authentication and access policies"
          onSave={saveSecurity}
        >
          <div className="divide-y divide-slate-50">
            <Toggle
              checked={security.forcePasswordChange}
              onChange={(v) =>
                setSecurity({ ...security, forcePasswordChange: v })
              }
              label="Force Password Change"
              description="Require password change on first login"
            />
            <Toggle
              checked={security.twoFactorAuth}
              onChange={(v) => setSecurity({ ...security, twoFactorAuth: v })}
              label="Two-Factor Authentication"
              description="Require 2FA for all admin accounts"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Password Length</label>
              <input
                type="number"
                className={inputClass}
                value={security.minPasswordLength}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    minPasswordLength: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>Session Timeout</label>
              <select
                className={inputClass + " appearance-none"}
                value={security.sessionTimeout}
                onChange={(e) =>
                  setSecurity({ ...security, sessionTimeout: e.target.value })
                }
              >
                <option>15 min</option>
                <option>30 min</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Report Configuration */}
        <SectionCard
          icon={ClipboardList}
          title="Report Configuration"
          subtitle="Report workflow and SLA policies"
          onSave={saveReport}
        >
          <div className="divide-y divide-slate-50">
            <Toggle
              checked={report.autoAssign}
              onChange={(v) => setReport({ ...report, autoAssign: v })}
              label="Auto Assign Reports"
              description="Automatically route reports to the responsible authority"
            />
            <Toggle
              checked={report.allowCitizenComments}
              onChange={(v) =>
                setReport({ ...report, allowCitizenComments: v })
              }
              label="Allow Citizen Comments"
              description="Allow citizens to comment on their reports"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Escalation Days</label>
              <input
                type="number"
                className={inputClass}
                value={report.escalationDays}
                onChange={(e) =>
                  setReport({
                    ...report,
                    escalationDays: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className={labelClass}>SLA (days)</label>
              <input
                type="number"
                className={inputClass}
                value={report.slaDays}
                onChange={(e) =>
                  setReport({ ...report, slaDays: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* System Info */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold">System Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Version
                </p>
                <p className="text-sm font-bold mt-1">Civic Link v1.0.0</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Environment
                </p>
                <p className="text-sm font-bold mt-1">Production</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AI Engine
                </p>
                <p className="text-sm font-bold mt-1">Civic AI · v1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
