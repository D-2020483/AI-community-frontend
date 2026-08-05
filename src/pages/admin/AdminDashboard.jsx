import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  ShieldCheck,
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  Gauge,
  Timer,
  TrendingUp,
  ArrowRight,
  FileText,
  MapPin,
  Sparkles,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";
import {
  adminKpis,
  monthlyReports,
  reportsByCategory,
  authorityPerformance,
} from "@/data/adminData";

const iconMap = {
  Users,
  Building2,
  ShieldCheck,
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  Gauge,
  Timer,
  TrendingUp,
};

const CATEGORY_COLORS = {
  "Roads & Infrastructure": "#4f46e5",
  "Waste Management": "#7c3aed",
  "Street Lighting": "#0284c7",
  "Water Supply": "#0ea5e9",
  Drainage: "#06b6d4",
  "Public Safety": "#d97706",
  Traffic: "#e11d48",
  Others: "#94a3b8",
};

function getStatusBadge(status) {
  const map = {
    Pending: "warning",
    "In Progress": "info",
    Resolved: "success",
    Rejected: "danger",
    Assigned: "primary",
  };
  return <StatusBadge status={status} />;
}

const recentReports = [
  {
    id: "RPT-1052",
    title: "Pothole on Oak Street",
    category: "Roads & Infrastructure",
    district: "North District",
    priority: "High",
    status: "Assigned",
    date: "Today",
    authority: "Public Works Dept.",
  },
  {
    id: "RPT-1051",
    title: "Broken Water Main",
    category: "Water Supply",
    district: "Central District",
    priority: "Critical",
    status: "In Progress",
    date: "Today",
    authority: "Water Authority",
  },
  {
    id: "RPT-1050",
    title: "Illegal Dumping",
    category: "Waste Management",
    district: "East District",
    priority: "Medium",
    status: "Pending",
    date: "Yesterday",
    authority: "Sanitation Dept.",
  },
  {
    id: "RPT-1049",
    title: "Street Light Outage",
    category: "Street Lighting",
    district: "West District",
    priority: "Low",
    status: "Resolved",
    date: "Yesterday",
    authority: "Electrical Dept.",
  },
  {
    id: "RPT-1048",
    title: "Playground Damage",
    category: "Public Safety",
    district: "Central District",
    priority: "Medium",
    status: "Resolved",
    date: "2 days ago",
    authority: "Parks & Recreation",
  },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const donutData = [
    { name: "Pending", value: 1842, color: "#f59e0b" },
    { name: "In Progress", value: 3214, color: "#4f46e5" },
    { name: "Resolved", value: 22847, color: "#10b981" },
    { name: "Rejected", value: 1040, color: "#ef4444" },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Complete system overview and performance monitoring"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden animate-fade-in">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Administrator Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
              Welcome back, Super Admin
            </h2>
            <p className="text-sm text-indigo-100/90 mt-1">
              Here's what's happening across the Civic Link platform today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Live reports
              </p>
              <p className="text-2xl font-extrabold">28,943</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Resolution rate
              </p>
              <p className="text-2xl font-extrabold">78.9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 animate-slide-up">
          {adminKpis.map((kpi) => {
            const Icon = iconMap[kpi.icon];
            return (
              <KpiCard
                key={kpi.id}
                icon={Icon}
                label={kpi.label}
                value={kpi.value}
                change={kpi.change}
                iconBg={kpi.iconBg}
                sparkData={kpi.sparkData}
                sparkColor={kpi.sparkColor}
              />
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Reports Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reports Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly submitted vs resolved reports
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyReports}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="submittedGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 8px 24px -6px rgba(15,23,42,0.12)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  name="Submitted"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#submittedGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#resolvedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
          <h3 className="text-base font-bold text-slate-900">Report Status</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution across all reports
          </p>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="text-[11px] font-semibold text-slate-600">
                  {d.name}
                </span>
                <span className="text-[11px] font-bold text-slate-900 ml-auto">
                  {d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Reports Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Reports
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Latest citizen submissions
              </p>
            </div>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonTable rows={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm">
                  <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    <th className="px-6 py-3 font-bold">Report ID</th>
                    <th className="px-6 py-3 font-bold">Issue Title</th>
                    <th className="px-6 py-3 font-bold">Priority</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                  {recentReports.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        {r.id}
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-800">
                          {r.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {r.district}
                        </p>
                      </td>
                      <td className="px-6 py-3.5">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="px-6 py-3.5">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {r.authority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Authority Performance Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Authority Performance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Completion rate by authority
              </p>
            </div>
            <Activity className="h-4 w-4 text-slate-300" />
          </div>
          <div className="space-y-4">
            {authorityPerformance
              .slice()
              .sort((a, b) => b.completionRate - a.completionRate)
              .slice(0, 6)
              .map((a) => (
                <div key={a.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      {a.name}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {a.completionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${a.completionRate}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100">
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Open full analytics
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
