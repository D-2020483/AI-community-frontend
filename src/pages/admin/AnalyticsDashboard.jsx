import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  TrendingUp,
  Clock,
  Timer,
  CheckCircle2,
  Flame,
  MapPin,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { AdminLayout } from "@/layouts/admin/AdminLayout";
import { apiRequest, getErrorMessage } from "@/lib/api";
import { toast } from "react-hot-toast";

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

const DISTRICT_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#0284c7",
  "#0ea5e9",
  "#06b6d4",
  "#d97706",
  "#16a34a",
  "#e11d48",
];

const cellColors = (d) => CATEGORY_COLORS[d.category] || "#94a3b8";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px -6px rgba(15,23,42,0.12)",
  fontSize: 12,
};

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState("This Year");
  const [sortOaa, setSortOaa] = useState("completionRate");
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = async (nextPeriod = period) => {
    try {
      setLoading(true);
      const data = await apiRequest(
        `/admin/insights?period=${encodeURIComponent(nextPeriod)}`,
      );
      setInsights(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error.data, "Failed to load analytics"));
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const monthlyReports = insights?.monthlyReports || [];
  const yearlyComparison = insights?.yearlyComparison || [];
  const reportsByCategory = insights?.reportsByCategory || [];
  const reportsByDistrict = insights?.reportsByDistrict || [];
  const authorityPerformance = insights?.authorityPerformance || [];
  const officerPerformance = insights?.officerPerformance || [];
  const activeCitizens = insights?.activeCitizens || [];
  const activeAuthorities = insights?.activeAuthorities || [];
  const topCategories = insights?.topCategories || [];
  const radarData = insights?.radarData || [];
  const totals = insights?.totals || {
    reports: 0,
    resolutionRate: 0,
    avgResolutionDays: 0,
    avgResponseHours: 0,
    monthlyGrowth: 0,
  };

  const sortedAuthorities = useMemo(() => {
    return [...authorityPerformance].sort(
      (a, b) => (b[sortOaa] || 0) - (a[sortOaa] || 0),
    );
  }, [sortOaa, authorityPerformance]);

  const counterCards = [
    {
      label: "Live Reports",
      value: String(totals.reports),
      icon: Flame,
      cls: "bg-rose-50 text-rose-600",
      sub: `${totals.monthlyGrowth >= 0 ? "+" : ""}${totals.monthlyGrowth}% vs previous period`,
    },
    {
      label: "Avg Response Time",
      value: totals.avgResponseHours ? `${totals.avgResponseHours} hrs` : "—",
      icon: Clock,
      cls: "bg-indigo-50 text-indigo-600",
      sub: "Based on resolved reports",
    },
    {
      label: "Avg Completion Time",
      value: totals.avgResolutionDays ? `${totals.avgResolutionDays} days` : "—",
      icon: Timer,
      cls: "bg-amber-50 text-amber-600",
      sub: "Created to resolved",
    },
    {
      label: "Resolution Rate",
      value: `${totals.resolutionRate}%`,
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-600",
      sub: loading ? "Refreshing…" : "Of reports in this period",
    },
  ];

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Comprehensive system performance analytics and insights"
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
          onClick={() => loadInsights(period)}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Live Counters */}
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

      {/* Reports by Month + Yearly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-slide-up">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900">Monthly Trends</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Submitted vs resolved over the last 12 months
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyReports}
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
                <Tooltip contentStyle={tooltipStyle} />
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
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900">
            Yearly Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Submitted vs resolved per year
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyComparison}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="submitted"
                  name="Submitted"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  name="Resolved"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category + District */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-slide-up">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900">
            Reports by Category
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Distribution of all reports
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportsByCategory}
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
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Reports" radius={[0, 6, 6, 0]}>
                  {reportsByCategory.map((d) => (
                    <Cell key={d.category} fill={cellColors(d)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900">
            Reports by District
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic distribution of reports
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportsByDistrict}
                  dataKey="value"
                  nameKey="district"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={2}
                  label={false}
                >
                  {reportsByDistrict.map((d, i) => (
                    <Cell
                      key={d.district}
                      fill={DISTRICT_COLORS[i % DISTRICT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Authority Performance + Officer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-slide-up">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-slate-900">
              Authority Performance
            </h3>
            <div className="relative">
              <select
                value={sortOaa}
                onChange={(e) => setSortOaa(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 appearance-none focus:outline-none focus:border-indigo-600 cursor-pointer"
              >
                <option value="completionRate">Sort by Completion</option>
                <option value="avgResolution">Sort by Resolution</option>
                <option value="reports">Sort by Reports</option>
                <option value="score">Sort by Score</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Best to worst performing authorities
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedAuthorities}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
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
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey={sortOaa}
                  name={
                    sortOaa === "avgResolution"
                      ? "Avg Resolution (days)"
                      : sortOaa === "reports"
                        ? "Reports"
                        : sortOaa === "score"
                          ? "Performance Score"
                          : "Completion Rate (%)"
                  }
                  fill="#4f46e5"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900">
            Officer Performance
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Resolved reports by top officers
          </p>
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={officerPerformance}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar
                  dataKey="resolved"
                  name="Resolved Reports"
                  fill="#7c3aed"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap + Insight Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-slide-up">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Location density
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Report volume by district or location
              </p>
            </div>
            <MapPin className="h-4 w-4 text-slate-300" />
          </div>
          <div className="p-6 space-y-3">
            {reportsByDistrict.length === 0 ? (
              <p className="text-xs text-slate-400">No location data yet.</p>
            ) : (
              reportsByDistrict.slice(0, 8).map((d) => {
                const max = reportsByDistrict[0]?.value || 1;
                return (
                  <div key={d.district}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {d.district}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {d.value}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.round((d.value / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Insight Radar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900">
              System Efficiency
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Overall performance radar
            </p>
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="score"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start animate-slide-up">
        {/* Top 10 Categories */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Top Issue Categories
          </h3>
          <div className="space-y-3">
            {topCategories.slice(0, 7).map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 w-4">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-slate-600 flex-1 truncate">
                  {c.name}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {c.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Citizens */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Most Active Citizens
          </h3>
          <div className="space-y-3">
            {activeCitizens.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(c.name || "?")
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <span className="text-xs font-semibold text-slate-600 flex-1 truncate">
                  {c.name}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {c.reports}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Authorities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Most Active Authorities
          </h3>
          <div className="space-y-3">
            {activeAuthorities.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(a.name || "?")
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <span className="text-xs font-semibold text-slate-600 flex-1 truncate">
                  {a.name}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {a.reports.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Rate Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Resolution Rate
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyReports}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Resolution rate trending upward
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {totals.monthlyGrowth >= 0 ? "+" : ""}
              {totals.monthlyGrowth}% vs previous period
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
