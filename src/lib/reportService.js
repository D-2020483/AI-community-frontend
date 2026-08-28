import { apiRequest } from "@/lib/api";
import { categoryLabel } from "@/data/issueCategories";

const MAX_IMAGE_CHARS = 2_000_000;

let myReportsCache = { at: 0, data: null };
const MY_REPORTS_TTL_MS = 15_000;

export function invalidateMyReportsCache() {
  myReportsCache = { at: 0, data: null };
}

function parseConfidenceNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const numeric = Number.parseFloat(String(value).replace("%", ""));
  if (Number.isNaN(numeric)) return 0;
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
}

function buildAuthorityTimeline(report) {
  const created = report.date || "";
  const items = [
    {
      label: "Reported",
      text: `Report submitted by ${report.citizen || "citizen"}`,
      time: created,
    },
    {
      label: "Assigned",
      text: `Assigned to ${report.authority || "the relevant authority"}`,
      time: created,
    },
  ];
  if (report.status === "In Progress" || report.status === "Resolved") {
    items.push({
      label: "In Progress",
      text: "Authority is working on this issue",
      time: created,
    });
  }
  if (report.status === "Resolved") {
    items.push({
      label: "Resolved",
      text: "Issue marked as resolved",
      time: created,
    });
  }
  return items;
}

export function mapComplaintToAuthorityView(report) {
  const list = mapComplaintToListView(report);
  if (!list) return null;

  const confidence = parseConfidenceNumber(
    report.confidence ?? list.confidence,
  );

  const mapped = {
    ...list,
    image: report.image || list.imageUrl || "",
    citizen: report.citizen || "Citizen",
    citizenEmail: report.citizenEmail || "",
    assignedOfficer: report.assignedOfficer || "",
    reason: report.reason || "",
    lat: report.lat ?? report.latitude ?? null,
    lng: report.lng ?? report.longitude ?? null,
    ai: {
      detectedIssue:
        report.detectedIssue || list.title || "Civic issue reported",
      category: list.category,
      priority: list.priority,
      confidence,
    },
  };

  return {
    ...mapped,
    assignedOfficer: report.assignedOfficer || "",
    timeline:
      Array.isArray(report.timeline) && report.timeline.length
        ? report.timeline
        : buildAuthorityTimeline(mapped),
  };
}

export async function getAssignedReports() {
  const data = await apiRequest("/complaints/assigned");
  return (data.data || []).map(mapComplaintToAuthorityView).filter(Boolean);
}

export async function updateAssignedReport(reportId, { status, assignedOfficer } = {}) {
  const data = await apiRequest(
    `/complaints/${encodeURIComponent(reportId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, assignedOfficer }),
    },
  );
  return mapComplaintToAuthorityView(data.data);
}

export async function getAuthorityOfficers() {
  const data = await apiRequest("/complaints/officers");
  return data.data || [];
}

export async function getWorkspaceNotifications() {
  const data = await apiRequest("/complaints/notifications");
  return data.data?.notifications || [];
}

export function mapComplaintToOfficerTask(report) {
  const mapped = mapComplaintToAuthorityView(report);
  if (!mapped) return null;

  const statusValue = report.officerStatus || mapped.status;
  const officerStatus =
    statusValue === "Resolved"
      ? "Completed"
      : statusValue === "Pending"
        ? "Assigned"
        : statusValue;

  return {
    ...mapped,
    type: mapped.category,
    image: mapped.image || mapped.imageUrl || "",
    status: officerStatus,
    updates: Array.isArray(report.updates) ? report.updates : [],
  };
}

export async function getOfficerTasks() {
  const data = await apiRequest("/officer/tasks");
  return (data.data || []).map(mapComplaintToOfficerTask).filter(Boolean);
}

export async function getOfficerTask(reportId) {
  const data = await apiRequest(`/officer/tasks/${encodeURIComponent(reportId)}`);
  return mapComplaintToOfficerTask(data.data);
}

export async function updateOfficerTask(reportId, { status, note } = {}) {
  const data = await apiRequest(
    `/officer/tasks/${encodeURIComponent(reportId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    },
  );
  invalidateMyReportsCache();
  return mapComplaintToOfficerTask(data.data);
}

export async function getOfficerUpdates() {
  const data = await apiRequest("/officer/updates");
  return data.data || [];
}

export async function getOfficerNotifications() {
  const data = await apiRequest("/officer/notifications");
  return data.data?.notifications || [];
}

export async function saveTrackedReport(payload, { signal } = {}) {
  const result = await apiRequest("/complaints/track", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
  invalidateMyReportsCache();
  return result;
}

export async function getTrackedReport(reportId) {
  return apiRequest(`/complaints/${encodeURIComponent(reportId)}`);
}

export function formatListStatus(status) {
  const value = String(status || "ASSIGNED")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  const map = {
    SUBMITTED: "Pending",
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    ACCEPTED: "Accepted",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    COMPLETED: "Resolved",
    REJECTED: "Rejected",
  };
  return map[value] || "Assigned";
}

export function mapComplaintToListView(report) {
  if (!report) return null;

  return {
    ...report,
    id: report.id || report.reportId,
    title:
      report.title ||
      report.detectedIssue ||
      categoryLabel(report.category) ||
      "Civic issue reported",
    category: categoryLabel(report.category),
    authority: report.authority || report.assignedAuthority || "Unassigned",
    priority: formatPriority(report.priority),
    status: formatListStatus(report.status),
    date:
      report.date ||
      (report.createdAt
        ? new Date(report.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : ""),
    imageUrl: report.imageUrl || null,
    description: report.description || "",
  };
}

export async function getMyReports({ force = false } = {}) {
  if (
    !force &&
    myReportsCache.data &&
    Date.now() - myReportsCache.at < MY_REPORTS_TTL_MS
  ) {
    return myReportsCache.data;
  }

  const data = await apiRequest("/complaints");
  const reports = (data.data || []).map(mapComplaintToListView).filter(Boolean);
  myReportsCache = { at: Date.now(), data: reports };
  return reports;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file"));
    reader.readAsDataURL(file);
  });
}

export function toStoredImageUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  if (dataUrl.length > MAX_IMAGE_CHARS) return null;
  return dataUrl;
}

export function formatPriority(priority) {
  if (!priority) return "Medium";
  const value = String(priority).toUpperCase();
  if (value === "HIGH") return "High";
  if (value === "LOW") return "Low";
  return "Medium";
}

export function formatStatus(status) {
  const value = String(status || "ASSIGNED").toUpperCase().replace(/[\s-]+/g, "_");
  const map = {
    SUBMITTED: "Submitted",
    PENDING: "Submitted",
    ASSIGNED: "Assigned",
    ACCEPTED: "Assigned",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    COMPLETED: "Resolved",
    REJECTED: "Rejected",
  };
  return map[value] || "Assigned";
}

export function mapComplaintToTrackView(complaint, extras = {}) {
  if (!complaint) return extras;

  const confidence = complaint.confidence;
  const confidenceLabel =
    typeof confidence === "number"
      ? `${Math.round((confidence > 1 ? confidence : confidence * 100))}%`
      : extras.confidence;

  return {
    id: complaint.reportId || extras.id,
    title: complaint.detectedIssue || extras.title,
    description: complaint.description || extras.description,
    location: complaint.location || extras.location,
    category: categoryLabel(complaint.category) || extras.category,
    confidence: confidenceLabel,
    authority: complaint.assignedAuthority || extras.authority,
    priority: formatPriority(complaint.priority),
    status: formatStatus(complaint.status),
    date: complaint.createdAt
      ? new Date(complaint.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : extras.date,
    imageUrl: complaint.imageUrl || extras.imageUrl,
    reason: complaint.reason || extras.reason,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt || extras.updatedAt,
    assignedOfficer:
      complaint.assignedOfficer || extras.assignedOfficer || "",
    timeline: Array.isArray(complaint.timeline)
      ? complaint.timeline
      : extras.timeline || [],
  };
}
