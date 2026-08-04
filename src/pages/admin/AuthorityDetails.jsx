import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  ClipboardList,
  Plus,
  Pencil,
  UserX,
  Trash2,
  Key,
  Building2,
  Globe,
  Users2,
  Activity,
  Gauge,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, Popup } from "react-leaflet";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { authoritiesData, officersData } from "@/data/adminData";
import { buildOfficerEmail, generateTemporaryPassword } from "@/lib/emailTemplate";
import { toast } from "react-hot-toast";

const districtCenters = [
  { name: "North District", lat: 4.8156, lng: 7.0498, population: 182000 },
  { name: "Central District", lat: 4.8105, lng: 7.0265, population: 154000 },
  { name: "East District", lat: 4.802, lng: 7.048, population: 146000 },
  { name: "West District", lat: 4.796, lng: 7.018, population: 98000 },
  { name: "South District", lat: 4.79, lng: 7.035, population: 112000 },
  { name: "Industrial Zone", lat: 4.788, lng: 7.06, population: 42000 },
  { name: "Harbor District", lat: 4.806, lng: 7.012, population: 89000 },
];

const inputClass =
  "w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all";
const labelClass = "text-xs font-bold text-slate-700 block mb-1.5";

function OfficerAvatar({ officer }) {
  const initials = `${officer.firstName[0]}${officer.lastName[0]}`;
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-50">
      {initials}
    </div>
  );
}

export default function AuthorityDetails() {
  const { authorityId } = useParams();
  const navigate = useNavigate();
  const [authority, setAuthority] = useState(
    authoritiesData.find((a) => a.id === authorityId) || authoritiesData[0]
  );
  const [officers, setOfficers] = useState(
    officersData.filter((o) => o.authorityId === authority.id)
  );
  const [addOfficerOpen, setAddOfficerOpen] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null);
  const [deactivateOfficer, setDeactivateOfficer] = useState(null);
  const [deleteOfficer, setDeleteOfficer] = useState(null);
  const [resetOfficer, setResetOfficer] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    photo: null,
  });

  const coveredDistricts = authority.coverage
    .split(",")
    .map((d) => d.trim());

  const handleAddOfficer = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name, and email are required");
      return;
    }
    const tempPassword = generateTemporaryPassword();
    const fullName = `${form.firstName} ${form.lastName}`;
    const newOfficer = {
      id: `off-${Date.now()}`,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || "—",
      position: form.position || "Officer",
      department: form.department || "Field Operations",
      authority: authority.name,
      authorityId: authority.id,
      activeReports: 0,
      completedReports: 0,
      availability: "Available",
      avatar: form.photo,
      status: "Active",
    };
    setOfficers((prev) => [...prev, newOfficer]);
    setAuthority((prev) => ({ ...prev, officers: prev.officers + 1 }));
    setAddOfficerOpen(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      photo: null,
    });

    const emailHtml = buildOfficerEmail({
      name: fullName,
      email: form.email,
      tempPassword,
      authority: authority.name,
    });
    window.open("", "_blank").document.write(emailHtml);
    toast.success(`Officer created. Credentials sent to ${form.email}`, {
      duration: 5000,
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSaveOfficer = (e) => {
    e.preventDefault();
    if (!editOfficer) return;
    setOfficers((prev) =>
      prev.map((o) => (o.id === editOfficer.id ? { ...o, ...editOfficer } : o))
    );
    toast.success("Officer updated successfully");
    setEditOfficer(null);
  };

  const handleToggleOfficer = () => {
    if (!deactivateOfficer) return;
    const newStatus = deactivateOfficer.status === "Active" ? "Inactive" : "Active";
    setOfficers((prev) =>
      prev.map((o) =>
        o.id === deactivateOfficer.id ? { ...o, status: newStatus } : o
      )
    );
    toast.success(
      `${deactivateOfficer.firstName} ${deactivateOfficer.lastName} ${newStatus === "Active" ? "activated" : "deactivated"}`
    );
    setDeactivateOfficer(null);
  };

  const handleDeleteOfficer = () => {
    if (!deleteOfficer) return;
    setOfficers((prev) => prev.filter((o) => o.id !== deleteOfficer.id));
    setAuthority((prev) => ({ ...prev, officers: prev.officers - 1 }));
    toast.success("Officer removed from the authority");
    setDeleteOfficer(null);
  };

  const handleResetPassword = () => {
    if (!resetOfficer) return;
    const tempPassword = generateTemporaryPassword();
    const emailHtml = buildOfficerEmail({
      name: `${resetOfficer.firstName} ${resetOfficer.lastName}`,
      email: resetOfficer.email,
      tempPassword,
      authority: authority.name,
    });
    window.open("", "_blank").document.write(emailHtml);
    toast.success(`Password reset. New credentials sent to ${resetOfficer.email}`);
    setResetOfficer(null);
  };

  const resolutionRate = Math.round(
    (authority.resolvedReports /
      (authority.resolvedReports + authority.activeReports + 200)) *
      100
  );

  return (
    <AdminLayout
      title="Authority Details"
      subtitle={authority.name}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/authorities")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to authorities
      </button>

      {/* Authority Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/20">
            {authority.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{authority.name}</h2>
              <StatusBadge status={authority.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {authority.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {authority.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> {authority.operatingHours}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/authorities")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit Authority
          </button>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mt-5 pt-5 border-t border-slate-100">
          {authority.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{officers.length}</p>
            <p className="text-xs font-semibold text-slate-500">Officers</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{authority.activeReports}</p>
            <p className="text-xs font-semibold text-slate-500">Active Reports</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{authority.resolvedReports}</p>
            <p className="text-xs font-semibold text-slate-500">Resolved Reports</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{resolutionRate}%</p>
            <p className="text-xs font-semibold text-slate-500">Resolution Rate</p>
          </div>
        </div>
      </div>

      {/* Map + Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-slide-up">
        {/* Interactive Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Coverage Area</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                GIS map of covered districts, towns & villages
              </p>
            </div>
            <Globe className="h-4 w-4 text-slate-300" />
          </div>
          <div className="h-96 relative z-0">
            <MapContainer
              center={[4.806, 7.03]}
              zoom={11}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {coveredDistricts.map((name) => {
                const d = districtCenters.find(
                  (x) => x.name.toLowerCase() === name.toLowerCase()
                );
                if (!d) return null;
                return (
                  <CircleMarker
                    key={name}
                    center={[d.lat, d.lng]}
                    radius={14}
                    pathOptions={{
                      color: "#4f46e5",
                      fillColor: "#4f46e5",
                      fillOpacity: 0.25,
                      weight: 2,
                    }}
                  >
                    <LeafletTooltip>{name}</LeafletTooltip>
                    <Popup>
                      <strong>{name}</strong>
                      <br />
                      Population: {d.population.toLocaleString()}
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Coverage Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Coverage Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-slate-400" /> Population Covered
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {authority.populationCovered.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" /> Area Size
                </span>
                <span className="text-sm font-bold text-slate-900">{authority.areaSize}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-400" /> Reports from Area
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {authority.activeReports + authority.resolvedReports}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-slate-400" /> Resolution Rate
                </span>
                <span className="text-sm font-bold text-emerald-600">{resolutionRate}%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Covered Districts
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {coveredDistricts.map((d) => (
                  <span key={d} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Head of Authority */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Responsible Person</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-base font-bold shadow-md shadow-indigo-600/20 ring-2 ring-indigo-100">
                {authority.head.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {authority.head.name}
                </p>
                <p className="text-xs text-slate-500">{authority.head.position}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {authority.head.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {authority.head.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Officers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Officers</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {officers.length} officers assigned to {authority.name}
            </p>
          </div>
          <button
            onClick={() => setAddOfficerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Officer
          </button>
        </div>

        {officers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No officers assigned"
            description="Add officers to this authority to start assigning reports."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm">
                <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-6 py-3 font-bold">Officer</th>
                  <th className="px-6 py-3 font-bold">Position</th>
                  <th className="px-6 py-3 font-bold">Contact</th>
                  <th className="px-6 py-3 font-bold text-center">Active Reports</th>
                  <th className="px-6 py-3 font-bold text-center">Completed</th>
                  <th className="px-6 py-3 font-bold">Availability</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
                {officers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <OfficerAvatar officer={o} />
                        <div>
                          <p className="font-bold text-slate-900">
                            {o.firstName} {o.lastName}
                          </p>
                          <p className="text-[10px] text-slate-400">{o.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{o.position}</td>
                    <td className="px-6 py-3.5">
                      <p className="text-slate-600">{o.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{o.phone}</p>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                        <ClipboardList className="h-3 w-3" /> {o.activeReports}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                        <CheckCircle2 className="h-3 w-3" /> {o.completedReports}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          o.availability === "Available"
                            ? "bg-emerald-50 text-emerald-600"
                            : o.availability === "On Field"
                            ? "bg-sky-50 text-sky-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            o.availability === "Available"
                              ? "bg-emerald-500"
                              : o.availability === "On Field"
                              ? "bg-sky-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {o.availability}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={() => setEditOfficer(o)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Reset Password"
                          onClick={() => setResetOfficer(o)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        <button
                          title={o.status === "Active" ? "Deactivate" : "Activate"}
                          onClick={() => setDeactivateOfficer(o)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteOfficer(o)}
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
        )}
      </div>

      {/* Add Officer Modal */}
      <Modal
        open={addOfficerOpen}
        onClose={() => setAddOfficerOpen(false)}
        title="Add Officer"
        subtitle="Create a new officer account under this authority"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setAddOfficerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddOfficer}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <Key className="h-3.5 w-3.5" /> Create & Send Credentials
            </button>
          </>
        }
      >
        <form id="add-officer-form" onSubmit={handleAddOfficer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input
                type="text"
                className={inputClass}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input
                type="text"
                className={inputClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Official Email *</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Job Position</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Field Officer"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Field Operations"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Assign Authority</label>
              <input
                type="text"
                className={inputClass + " bg-slate-50"}
                value={authority.name}
                readOnly
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Upload Photo</label>
              <label className="flex items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-5 cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
                {form.photo ? (
                  <img src={form.photo} alt="Officer" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Users className="h-5 w-5" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-600">Upload officer photo</p>
                      <p className="text-[10px] text-slate-400">PNG or JPG. Optional.</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-4">
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              <strong className="font-bold">On save:</strong> A temporary password will be
              generated and login credentials emailed to{" "}
              <strong>{form.email || "the officer's official email"}</strong>. First login
              will require a password change.
            </p>
          </div>
        </form>
      </Modal>

      {/* Edit Officer Modal */}
      <Modal
        open={!!editOfficer}
        onClose={() => setEditOfficer(null)}
        title="Edit Officer"
        subtitle="Update officer details"
        footer={
          <>
            <button
              onClick={() => setEditOfficer(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOfficer}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editOfficer && (
          <form onSubmit={handleSaveOfficer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.firstName}
                  onChange={(e) => setEditOfficer({ ...editOfficer, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.lastName}
                  onChange={(e) => setEditOfficer({ ...editOfficer, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  className={inputClass}
                  value={editOfficer.email}
                  onChange={(e) => setEditOfficer({ ...editOfficer, email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={editOfficer.phone}
                  onChange={(e) => setEditOfficer({ ...editOfficer, phone: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Position</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.position}
                  onChange={(e) => setEditOfficer({ ...editOfficer, position: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <input
                  type="text"
                  className={inputClass}
                  value={editOfficer.department}
                  onChange={(e) => setEditOfficer({ ...editOfficer, department: e.target.value })}
                />
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Deactivate Officer Dialog */}
      <ConfirmDialog
        open={!!deactivateOfficer}
        title={deactivateOfficer?.status === "Active" ? "Deactivate officer?" : "Activate officer?"}
        message={
          deactivateOfficer?.status === "Active"
            ? `${deactivateOfficer?.firstName} ${deactivateOfficer?.lastName} will no longer be able to log in or receive new reports.`
            : `${deactivateOfficer?.firstName} ${deactivateOfficer?.lastName} will be re-activated and can receive reports again.`
        }
        confirmLabel={deactivateOfficer?.status === "Active" ? "Deactivate" : "Activate"}
        tone={deactivateOfficer?.status === "Active" ? "danger" : "primary"}
        onConfirm={handleToggleOfficer}
        onCancel={() => setDeactivateOfficer(null)}
      />

      {/* Delete Officer Dialog */}
      <ConfirmDialog
        open={!!deleteOfficer}
        title="Delete officer?"
        message={`This will permanently remove ${deleteOfficer?.firstName} ${deleteOfficer?.lastName} from the authority. Their assigned reports will be reassigned.`}
        confirmLabel="Delete"
        tone="danger"
        onConfirm={handleDeleteOfficer}
        onCancel={() => setDeleteOfficer(null)}
      />

      {/* Reset Password Dialog */}
      <ConfirmDialog
        open={!!resetOfficer}
        title="Reset officer password?"
        message={`A new temporary password will be generated and emailed to ${resetOfficer?.email}. The officer will be required to change it on next login.`}
        confirmLabel="Reset & Send"
        tone="primary"
        onConfirm={handleResetPassword}
        onCancel={() => setResetOfficer(null)}
      />
    </AdminLayout>
  );
}

