import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  Download,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  Building2,
  User,
  Sparkles,
  MessageSquare,
  Activity,
  GitBranch,
  X,
  Filter,
  CheckCircle2,
  AlertCircle,
  Gauge,
  FileText,
  Plus,
} from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { downloadReport } from "@/lib/reportDownload";
import { toast } from "react-hot-toast";

const PAGE_SIZE = 7;

const adminReports = [
  { id: "RPT-1052", title: "Pothole on Oak Street", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop", category: "Roads & Infrastructure", citizen: "Amara Okafor", citizenEmail: "amara.okafor@example.com", authority: "Public Works Dept.", officer: "Samuel Johnson", priority: "High", status: "Assigned", created: "24 Jul 2026", updated: "24 Jul 2026", district: "North District", location: "Oak Street, North District", lat: 4.8156, lng: 7.0498, aiCategory: "Roads & Infrastructure", confidence: 92, description: "A large pothole has formed on the eastbound lane of Oak Street, causing drivers to swerve dangerously." },
  { id: "RPT-1051", title: "Broken Water Main", image: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?q=80&w=800&auto=format&fit=crop", category: "Water Supply", citizen: "James Adeleke", citizenEmail: "j.adeleke@example.com", authority: "Water Authority", officer: "Ibrahim Musa", priority: "Critical", status: "In Progress", created: "24 Jul 2026", updated: "25 Jul 2026", district: "Central District", location: "Maple Street, Central", lat: 4.8105, lng: 7.0265, aiCategory: "Water Supply", confidence: 95, description: "A water main has burst and is flooding the street. Emergency repair required." },
  { id: "RPT-1050", title: "Illegal Dumping", image: "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?q=80&w=800&auto=format&fit=crop", category: "Waste Management", citizen: "Ngozi Okafor", citizenEmail: "ngozi.ok@example.com", authority: "Sanitation Dept.", officer: "Blessing Adamu", priority: "Medium", status: "Pending", created: "23 Jul 2026", updated: "23 Jul 2026", district: "East District", location: "Green Park, East", lat: 4.802, lng: 7.048, aiCategory: "Waste Management", confidence: 85, description: "Garbage has been dumped illegally near the park entrance." },
  { id: "RPT-1049", title: "Street Light Outage", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=800&auto=format&fit=crop", category: "Street Lighting", citizen: "Chiamaka Nnadi", citizenEmail: "chiamaka.n@example.com", authority: "Electrical Dept.", officer: "Amina Yusuf", priority: "Low", status: "Resolved", created: "23 Jul 2026", updated: "25 Jul 2026", district: "West District", location: "River Road, West", lat: 4.796, lng: 7.018, aiCategory: "Street Lighting", confidence: 90, description: "Street light has been out for several nights." },
  { id: "RPT-1048", title: "Playground Damage", image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=800&auto=format&fit=crop", category: "Public Safety", citizen: "Linda Ochieng", citizenEmail: "l.ochieng@example.com", authority: "Parks & Recreation", officer: "David Okon", priority: "Medium", status: "Resolved", created: "22 Jul 2026", updated: "24 Jul 2026", district: "Central District", location: "Central Park, Central", lat: 4.82, lng: 7.032, aiCategory: "Public Safety", confidence: 89, description: "Playground equipment damaged and posing safety risk." },
  { id: "RPT-1047", title: "Traffic Signal Fault", image: "https://images.unsplash.com/photo-1549921296-3b0f9a35af35?q=80&w=800&auto=format&fit=crop", category: "Traffic", citizen: "Yusuf Abdullahi", citizenEmail: "y.abdullahi@example.com", authority: "Traffic Dept.", officer: "Grace Eze", priority: "High", status: "In Progress", created: "22 Jul 2026", updated: "23 Jul 2026", district: "South District", location: "Main Intersection, South", lat: 4.79, lng: 7.035, aiCategory: "Traffic", confidence: 93, description: "Traffic signal malfunctioning at main intersection." },
  { id: "RPT-1046", title: "Drainage Blockage", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop", category: "Drainage", citizen: "Kwame Mensah", citizenEmail: "k.mensah@example.com", authority: "Water Authority", officer: "Ibrahim Musa", priority: "Medium", status: "Assigned", created: "21 Jul 2026", updated: "22 Jul 2026", district: "Harbor District", location: "Market Square, Harbor", lat: 4.806, lng: 7.012, aiCategory: "Drainage", confidence: 88, description: "Drainage system blocked causing water accumulation." },
  { id: "RPT-1045", title: "Overgrown Trees", image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?q=80&w=800&auto=format&fit=crop", category: "Garden & Green", citizen: "Tunde Olawale", citizenEmail: "t.olawale@example.com", authority: "Parks & Recreation", officer: "David Okon", priority: "Low", status: "Pending", created: "21 Jul 2026", updated: "21 Jul 2026", district: "North District", location: "Birch Lane, North", lat: 4.8156, lng: 7.0498, aiCategory: "Garden & Green", confidence: 86, description: "Trees have become overgrown and obstructing the footpath." },
  { id: "RPT-1044", title: "Damaged Street Barrier", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop", category: "Roads & Infrastructure", citizen: "Amara Okafor", citizenEmail: "amara.okafor@example.com", authority: "Public Works Dept.", officer: "Samuel Johnson", priority: "Low", status: "Rejected", created: "20 Jul 2026", updated: "21 Jul 2026", district: "Industrial Zone", location: "Highway 12, Industrial", lat: 4.788, lng: 7.06, aiCategory: "Roads & Infrastructure", confidence: 87, description: "Street barrier damaged and no longer providing protection." },
  { id: "RPT-1043", title: "Water Supply Leak", image: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?q=80&w=800&auto=format&fit=crop", category: "Water Supply", citizen: "Ngozi Okafor", citizenEmail: "ngozi.ok@example.com", authority: "Water Authority", officer: "Ibrahim Musa", priority: "High", status: "In Progress", created: "20 Jul 2026", updated: "22 Jul 2026", district: "Central District", location: "Elm Street, Central", lat: 4.8105, lng: 7.0265, aiCategory: "Water Supply", confidence: 91, description: "Water pipe leaking causing water loss and potential road damage." },
  { id: "RPT-1042", title: "Pothole on Oak Street", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop", category: "Roads & Infrastructure", citizen: "Amara Okafor", citizenEmail: "amara.okafor@example.com", authority: "Public Works Dept.", officer: "Samuel Johnson", priority: "High", status: "Assigned", created: "24 Jul 2026", updated: "24 Jul 2026", district: "North District", location: "Oak Street, North District", lat: 4.8156, lng: 7.0498, aiCategory: "Roads & Infrastructure", confidence: 92, description: "A large pothole on the eastbound lane causing drivers to swerve." },
  { id: "RPT-1041", title: "Garbage Dumping Near Park", image: "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?q=80&w=800&auto=format&fit=crop", category: "Waste Management", citizen: "Chiamaka Nnadi", citizenEmail: "chiamaka.n@example.com", authority: "Sanitation Dept.", officer: "Blessing Adamu", priority: "Medium", status: "Resolved", created: "19 Jul 2026", updated: "22 Jul 2026", district: "East District", location: "Green Park, East", lat: 4.802, lng: 7.048, aiCategory: "Waste Management", confidence: 85, description: "Waste dumped near the park entrance attracting pests." },
];

const categories = [...new Set(adminReports.map((r) => r.category))];
const authorities = [...new Set(adminReports.map((r) => r.authority))];
const officers = [...new Set(adminReports.map((r) => r.officer))];
const districts = [...new Set(adminReports.map((r) => r.district))];
const statuses = [...new Set(adminReports.map((r) => r.status))];
const priorities = [...new Set(adminReports.map((r) => r.priority))];

const timelineConfig = [
  { key: "Reported", icon: FileText, color: "bg-slate-100 text-slate-500" },
  { key: "Assigned", icon: GitBranch, color: "bg-indigo-50 text-indigo-600" },
  { key: "Accepted", icon: CheckCircle2, color: "bg-sky-50 text-sky-600" },
  { key: "In Progress", icon: Wrench, color: "bg-amber-50 text-amber-600" },
  { key: "Resolved", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  { key: "Closed", icon: CheckCircle2, color: "bg-slate-100 text-slate-600" },
];

const statusSteps = ["Reported", "Assigned", "Accepted", "In Progress", "Resolved", "Closed"];

function getStepIndex(status) {
  const idx = statusSteps.indexOf(status);
  return idx === -1 ? 0 : idx;
}

const mockComments = [
  { id: 1, author: "Samuel Johnson", role: "Officer", text: "We've inspected the site and scheduled repairs for tomorrow morning.", time: "Today, 11:20 AM", color: "bg-indigo-50 text-indigo-600" },
  { id: 2, author: "Amara Okafor", role: "Citizen", text: "Thank you for the quick response. The pothole is on the eastbound lane.", time: "Today, 10:45 AM", color: "bg-emerald-50 text-emerald-600" },
  { id: 3, author: "Public Works Dept.", role: "Authority", text: "Assigned to our Road Maintenance team for immediate action.", time: "Today, 10:30 AM", color: "bg-violet-50 text-violet-600" },
];

const mockTimeline = [
  { key: "Reported", desc: "Report submitted by citizen", time: "24 Jul 2026 · 09:12 AM" },
  { key: "Assigned", desc: "Assigned to Public Works Dept.", time: "24 Jul 2026 · 10:40 AM" },
  { key: "Accepted", desc: "Authority accepted the report", time: "24 Jul 2026 · 11:05 AM" },
  { key: "In Progress", desc: "Field crew dispatched", time: "25 Jul 2026 · 08:05 AM" },
  { key: "Resolved", desc: "Issue resolved", time: "25 Jul 2026 · 04:30 PM" },
  { key: "Closed", desc: "Report closed by citizen", time: "—" },
];

export default function ReportsManagement() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "All Categories",
    authority: "All Authorities",
    officer: "All Officers",
    district: "All Districts",
    status: "All Status",
    priority: "All Priority",
    dateRange: "All Dates",
  });
  const [reports, setReports] = useState(adminReports);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewReport, setViewReport] = useState(null);
  const [deleteReport, setDeleteReport] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.citizen.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      const matchCategory =
        filters.category === "All Categories" || r.category === filters.category;
      const matchAuthority =
        filters.authority === "All Authorities" || r.authority === filters.authority;
      const matchOfficer =
        filters.officer === "All Officers" || r.officer === filters.officer;
      const matchDistrict =
        filters.district === "All Districts" || r.district === filters.district;
      const matchStatus =
        filters.status === "All Status" || r.status === filters.status;
      const matchPriority =
        filters.priority === "All Priority" || r.priority === filters.priority;
      return (
        matchQ &&
        matchCategory &&
        matchAuthority &&
        matchOfficer &&
        matchDistrict &&
        matchStatus &&
        matchPriority
      );
    });
  }, [reports, query, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, filters]);

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = () => {
    if (!deleteReport) return;
    setReports((prev) => prev.filter((r) => r.id !== deleteReport.id));
    toast.success(`Report ${deleteReport.id} deleted`);
    setDeleteReport(null);
  };

  const handleDownload = (r) => {
    downloadReport({
      id: r.id,
      title: r.title,
      status: r.status,
      priority: r.priority,
      category: r.category,
      location: r.location,
      date: r.date || r.created,
      authority: r.authority,
      confidence: `${r.confidence}%`,
      description: r.description,
      progressSteps: statusSteps,
    });
    toast.success(`Report ${r.id} downloaded`);
  };

  const selectClass =
    "w-full pl-3.5 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer";

  return (
    <AdminLayout
      title="Reports Management"
      subtitle="Full access to every citizen report"
    >
      <PageHeader
        title="All Reports"
        subtitle={`${reports.length} reports submitted by citizens`}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl">
              <Filter className="h-3.5 w-3.5" /> {filtered.length} matching
            </span>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 animate-slide-up">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by report ID, title, citizen, or location..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)} className={selectClass}>
              {["All Categories", ...categories].map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filters.authority} onChange={(e) => setFilter("authority", e.target.value)} className={selectClass}>
              {["All Authorities", ...authorities].map((a) => <option key={a}>{a}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filters.officer} onChange={(e) => setFilter("officer", e.target.value)} className={selectClass}>
              {["All Officers", ...officers].map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filters.district} onChange={(e) => setFilter("district", e.target.value)} className={selectClass}>
              {["All Districts", ...districts].map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className={selectClass}>
              {["All Status", ...statuses].map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)} className={selectClass}>
              {["All Priority", ...priorities].map((p) => <option key={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={filters.dateRange} onChange={(e) => setFilter("dateRange", e.target.value)} className={selectClass}>
              {["All Dates", "Last 7 days", "Last 30 days", "Last 90 days", "This year"].map((d) => <option key={d}>{d}</option>)}
            </select>
            <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => {
              setQuery("");
              setFilters({
                category: "All Categories",
                authority: "All Authorities",
                officer: "All Officers",
                district: "All Districts",
                status: "All Status",
                priority: "All Priority",
                dateRange: "All Dates",
              });
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <SkeletonTable rows={7} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-5 py-3 font-bold">Report</th>
                  <th className="px-5 py-3 font-bold">Category</th>
                  <th className="px-5 py-3 font-bold">Citizen</th>
                  <th className="px-5 py-3 font-bold">Authority</th>
                  <th className="px-5 py-3 font-bold">Officer</th>
                  <th className="px-5 py-3 font-bold">Priority</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold">Created</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {paginated.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={r.image} alt={r.title} className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[180px]">{r.title}</p>
                          <p className="text-[10px] text-slate-400">{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{r.category}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-700">{r.citizen}</p>
                      <p className="text-[10px] text-slate-400">{r.district}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{r.authority}</td>
                    <td className="px-5 py-3.5 text-slate-600">{r.officer}</td>
                    <td className="px-5 py-3.5"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">{r.created}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View Report"
                          onClick={() => setViewReport(r)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Download"
                          onClick={() => handleDownload(r)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteReport(r)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <EmptyState
              icon={Search}
              title="No reports found"
              description="Try adjusting your search or filters to find reports."
            />
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>
                {" - "}
                <span className="font-semibold text-slate-700">
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filtered.length}
                </span>{" "}
                reports
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-8 w-8 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      p === currentPage
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      <Modal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        title="Report Details"
        subtitle={viewReport?.id || ""}
        size="xl"
        footer={
          <>
            <button
              onClick={() => viewReport && handleDownload(viewReport)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Download Report
            </button>
            <button
              onClick={() => setViewReport(null)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </>
        }
      >
        {viewReport && (
          <div className="space-y-6">
            {/* Image Header */}
            <div className="relative h-56 rounded-2xl overflow-hidden">
              <img src={viewReport.image} alt={viewReport.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                  {viewReport.id}
                </span>
                <StatusBadge status={viewReport.status} />
                <PriorityBadge priority={viewReport.priority} />
              </div>
            </div>

            {/* Title + Meta */}
            <div>
              <h4 className="text-lg font-bold text-slate-900">{viewReport.title}</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {viewReport.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Created {viewReport.created}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Updated {viewReport.updated}
                </span>
              </div>
            </div>

            {/* AI Classification */}
            <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                <h5 className="text-xs font-bold text-violet-700 uppercase tracking-wide">
                  AI Classification
                </h5>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Predicted Category</span>
                    <span className="font-bold text-violet-700">{viewReport.aiCategory}</span>
                  </div>
                  <div className="mt-2 h-2 bg-violet-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                      style={{ width: `${viewReport.confidence}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-slate-400">AI Confidence</span>
                    <span className="font-bold text-violet-600">{viewReport.confidence}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <Gauge className="h-6 w-6 text-violet-600" />
                  </div>
                  <p className="text-[10px] font-bold text-violet-700 mt-1">{viewReport.confidence}%</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Issue Description
              </h5>
              <p className="text-sm text-slate-600 leading-relaxed">{viewReport.description}</p>
            </div>

            {/* Assignment Panel */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <GitBranch className="h-4 w-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Assignment & Management
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Authority</label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.authority}
                      onChange={(e) => setViewReport({ ...viewReport, authority: e.target.value })}
                    >
                      {authorities.map((a) => <option key={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Officer</label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.officer}
                      onChange={(e) => setViewReport({ ...viewReport, officer: e.target.value })}
                    >
                      {officers.map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Priority</label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.priority}
                      onChange={(e) => setViewReport({ ...viewReport, priority: e.target.value })}
                    >
                      {priorities.map((p) => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status</label>
                  <div className="relative">
                    <select
                      className={selectClass + " py-2.5"}
                      value={viewReport.status}
                      onChange={(e) => setViewReport({ ...viewReport, status: e.target.value })}
                    >
                      {statuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setAssigning(true);
                  setTimeout(() => {
                    setAssigning(false);
                    toast.success(`Report ${viewReport.id} updated successfully`);
                  }, 800);
                }}
                disabled={assigning}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {assigning ? "Saving..." : "Save Assignment"}
              </button>
            </div>

            {/* Location Map */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Location Map
              </h5>
              <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
                <MapContainer
                  center={[viewReport.lat, viewReport.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[viewReport.lat, viewReport.lng]} />
                </MapContainer>
              </div>
            </div>

            {/* Citizen Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Citizen Information
                </h5>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {viewReport.citizen.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{viewReport.citizen}</p>
                  <p className="text-xs text-slate-500">{viewReport.citizenEmail}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {viewReport.district}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Progress Timeline
              </h5>
              <div className="relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${(getStepIndex(viewReport.status) / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>
                <div className="relative grid grid-cols-6 gap-2">
                  {timelineConfig.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = i <= getStepIndex(viewReport.status);
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                            isActive
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30"
                              : "bg-white border-slate-200 text-slate-300"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className={`mt-2 text-[10px] font-bold ${isActive ? "text-slate-900" : "text-slate-400"}`}>
                          {step.key}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Citizen Comments
                </h5>
              </div>
              <div className="space-y-3">
                {mockComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${c.color}`}>
                      {c.author.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 bg-slate-50/80 border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900">
                          {c.author}{" "}
                          <span className="text-[10px] font-semibold text-slate-400">({c.role})</span>
                        </p>
                        <span className="text-[10px] text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Report Dialog */}
      <ConfirmDialog
        open={!!deleteReport}
        title="Delete report?"
        message={`This will permanently delete report ${deleteReport?.id} and all associated data. This action cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteReport(null)}
      />
    </AdminLayout>
  );
}
