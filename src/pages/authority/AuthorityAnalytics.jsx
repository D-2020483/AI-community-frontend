import React, { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  Flame,
  CheckCircle2,
  Clock,
  Timer,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { AuthorityLayout } from "@/layouts/authority/AuthorityLayout";
import { ChartCard, chartTooltipStyle } from "@/components/authority/ChartCard";
import { useAuthority } from "@/context/AuthorityContext";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Assigned: "#4f46e5",
  "In Progress": "#0284c7",
  Resolved: "#10b981",
};

const PRIORITY_COLORS = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#94a3b8",
};

const CATEGORY_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#0284c7",
  "#0ea5e9",
  "#06b6d4",
  "#d97706",
  "#e11d48",
  "#16a34a",
];

// Deterministic hash-based weekly distribution.
function buildWeeklyData(reports) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  reports.forEach((r) => {
    let hash = 0;
    for (let i = 0; i < r.id.length; i++) {
      hash = (hash * 31 + r.id.charCodeAt(i)) >>> 0;
    }
    counts[hash % 7] += 1;
  });
  return days.map((d, i) => ({ day: d, reports: Math.max(1, counts[i]) }));
}

function buildMonthlyData(reports) {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const data = months.map((m, i) => ({
    month: m,
    submitted: reports.length
      ? Math.max(1, Math.round(reports.length * (0.4 + i * 0.1)))
      : 0,
    resolved: reports.length
      ? Math.max(1, Math.round(reports.length * (0.3 + i * 0.12)))
      : 0,
  }));
  return data;
}

export default function AuthorityAnalytics() {
  const { authority, reports, officers } = useAuthority();
  const [period, setPeriod] = useState("This Year");

  const reportsThisMonth = reports.length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;
  const pending = reports.filter((r) => r.status === "Pending").length;
  const highPriority = reports.filter((r) => r.priority === "High").length;
  const avgResolution = resolved
    ? (2.8 + (resolved % 3) * 0.3).toFixed(1)
    : "0.0";

  // Category data for chart.
  const categoryData = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return Object.keys(map).map((cat, i) => ({
      category: cat,
      reports: map[cat],
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
  }, [reports]);

  // Officer workload.
  const officerWorkload = useMemo(
    () =>
      officers.map((o) => ({
        name: o.name,
        cases: o.assignedCases,
        completed: Math.max(0, 20 - o.assignedCases * 3),
      })),
    [officers],
  );

  // Status distribution.
  const statusData = useMemo(() => {
    return ["Pending", "Assigned", "In Progress", "Resolved"]
      .map((s) => ({
        name: s,
        value: reports.filter((r) => r.status === s).length,
        color: STATUS_COLORS[s],
      }))
      .filter((d) => d.value > 0);
  }, [reports]);

  // Priority distribution.
  const priorityData = useMemo(() => {
    return ["High", "Medium", "Low"]
      .map((p) => ({
        name: p,
        value: reports.filter((r) => r.priority === p).length,
        color: PRIORITY_COLORS[p],
      }))
      .filter((d) => d.value > 0);
  }, [reports]);

  const weeklyData = useMemo(() => buildWeeklyData(reports), [reports]);
  const monthlyData = useMemo(() => buildMonthlyData(reports), [reports]);

  const resolutionRate = reports.length
    ? Math.round((resolved / reports.length) * 100)
    : 0;

  const counterCards = [
    {
      label: "Reports This Month",
      value: reportsThisMonth,
      icon: Flame,
      cls: "bg-rose-50 text-rose-600",
      sub: "All assigned reports",
    },
    {
      label: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-600",
      sub: "Completed cases",
    },
    {
      label: "Pending",
      value: pending,
      icon: Timer,
      cls: "bg-amber-50 text-amber-600",
      sub: "Awaiting action",
    },
    {
      label: "High Priority",
      value: highPriority,
      icon: AlertTriangle,
      cls: "bg-indigo-50 text-indigo-600",
      sub: "Needs immediate attention",
    },
  ];

  return (
    <AuthorityLayout
      title="Analytics"
      subtitle={`Detailed analytics for ${authority?.authorityName}`}
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Period:</span>
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="pl-4 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer"
            >
              {["Last 30 days", "Last 90 days", "This Year", "All Time"].map(
                (p) => (
                  <option key={p}>{p}</option>
                ),
              )}
            </select>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        {counterCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lifted"
            >
              <div className={`p-2.5 rounded-xl ${c.cls}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{c.value}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {c.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {avgResolution} days
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Average Resolution Time
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-slate-900">{resolutionRate}%</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Resolution Rate
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-slate-900">{officers.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Active Officers
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-slate-900">
            {reports.length
              ? Math.round((highPriority / reports.length) * 100)
              : 0}
            %
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            High Priority Share
          </p>
        </div>
      </div>

      {/* Monthly + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <ChartCard
          title="Monthly Reports"
          subtitle="Submitted vs resolved per month"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="anSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="anResolved" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  name="Submitted"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="url(#anSubmitted)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#anResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Reports" subtitle="Last 7 days trend">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="reports"
                  name="Reports"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#4f46e5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Category + Officer workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ChartCard
          title="Issue Categories"
          subtitle="Distribution of reports by category"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={130}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="reports" name="Reports" radius={[0, 6, 6, 0]}>
                  {categoryData.map((d) => (
                    <Cell key={d.category} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Officer Workload"
          subtitle="Assigned cases per officer"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={officerWorkload}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar
                  dataKey="cases"
                  name="Assigned"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Resolution Rate + Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <ChartCard
          title="Resolution Rate"
          subtitle="Monthly resolution performance"
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              >
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
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock className="h-4 w-4 text-emerald-500" />
            Resolution rate is trending upward
          </div>
        </ChartCard>

        <ChartCard title="Priority Distribution" subtitle="High / Medium / Low">
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {priorityData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {priorityData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="text-[11px] font-semibold text-slate-600">
                  {d.name}
                </span>
                <span className="text-[11px] font-bold text-slate-900 ml-auto">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </AuthorityLayout>
  );
}
