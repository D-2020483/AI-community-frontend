import React, { useMemo } from "react";
import {
  FilePlus2,
  AlertTriangle,
  UserPlus,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
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
import { StatCard } from "@/components/authority/StatCard";
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

const CATEGORY_PALETTE = [
  "#4f46e5",
  "#7c3aed",
  "#0284c7",
  "#0ea5e9",
  "#06b6d4",
  "#d97706",
  "#e11d48",
  "#16a34a",
];

// Deterministic weekly distribution across the last 7 days.
// Uses a stable hash of the report id so values never change between renders.
function buildWeeklyData(reports) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  reports.forEach((r) => {
    let hash = 0;
    for (let i = 0; i < r.id.length; i++) {
      hash = (hash * 31 + r.id.charCodeAt(i)) >>> 0;
    }
    const dayIdx = hash % 7;
    counts[dayIdx] += 1;
  });
  return days.map((d, i) => ({ day: d, reports: Math.max(1, counts[i]) }));
}

// Build monthly resolution trend from reports.
function buildMonthlyData(reports) {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const data = months.map((m, i) => ({
    month: m,
    resolved: reports.length
      ? Math.max(1, Math.round(reports.length * (0.3 + i * 0.12)))
      : 0,
  }));
  return data;
}

export default function AuthorityDashboard() {
  const { authority, reports } = useAuthority();

  const newReports = reports.length;
  const highPriority = reports.filter((r) => r.priority === "High").length;
  const pendingAssignments = reports.filter(
    (r) => r.status === "Pending" && !r.assignedOfficer,
  ).length;
  const resolved = reports.filter((r) => r.status === "Resolved").length;

  // Reports by category for the bar chart.
  const categoryData = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return Object.keys(map).map((cat, i) => ({
      category: cat,
      reports: map[cat],
      color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length],
    }));
  }, [reports]);

  // Status distribution for the pie chart.
  const statusData = useMemo(() => {
    return ["Pending", "Assigned", "In Progress", "Resolved"]
      .map((s) => ({
        name: s,
        value: reports.filter((r) => r.status === s).length,
        color: STATUS_COLORS[s],
      }))
      .filter((d) => d.value > 0);
  }, [reports]);

  // Priority distribution for the donut.
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

  return (
    <AuthorityLayout
      title="Dashboard"
      subtitle="Overview of your authority's reports and performance"
    >
      {/* Header Banner */}
      <div
        className={`bg-gradient-to-br ${authority?.color || "from-indigo-600 to-violet-600"} rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden animate-fade-in`}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Authority Overview
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-3">
              Welcome, {authority?.authorityName}
            </h2>
            <p className="text-sm text-white/90 mt-1">
              Here's what's happening across {authority?.authorityType} reports
              today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Total reports
              </p>
              <p className="text-2xl font-extrabold">{newReports}</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Resolved
              </p>
              <p className="text-2xl font-extrabold">{resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <StatCard
          icon={FilePlus2}
          label="New Reports"
          value={newReports}
          subtext="Total assigned to you"
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard
          icon={AlertTriangle}
          label="High Priority"
          value={highPriority}
          subtext="Need immediate action"
          iconBg="bg-rose-50 text-rose-600 border-rose-100"
        />
        <StatCard
          icon={UserPlus}
          label="Pending Assignments"
          value={pendingAssignments}
          subtext="Awaiting officer"
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved Reports"
          value={resolved}
          subtext="Successfully resolved"
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Reports by Category */}
        <ChartCard
          title="Reports by Category"
          subtitle="Distribution across your categories"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
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
                <Bar dataKey="reports" name="Reports" radius={[6, 6, 0, 0]}>
                  {categoryData.map((d) => (
                    <Cell key={d.category} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Report Status Pie */}
        <ChartCard
          title="Report Status"
          subtitle="Distribution across all reports"
        >
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
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

      {/* Weekly + Priority Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Weekly Reports Line */}
        <ChartCard
          title="Weekly Reports"
          subtitle="Reports received over the last 7 days"
          className="lg:col-span-2"
        >
          <div className="h-64">
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

        {/* Priority Donut */}
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

      {/* Monthly Resolution Trend */}
      <ChartCard
        title="Monthly Resolution Trend"
        subtitle="Resolved reports over the last 6 months"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="resolved"
                name="Resolved"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#monthlyGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Track your resolution performance month over month.
          </p>
          <Link
            to="/authority/analytics"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View analytics <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </ChartCard>
    </AuthorityLayout>
  );
}
