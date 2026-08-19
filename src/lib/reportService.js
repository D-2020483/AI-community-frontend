import { apiRequest } from "@/lib/api";
import { categoryLabel } from "@/data/issueCategories";

const MAX_IMAGE_CHARS = 2_000_000;

let myReportsCache = { at: 0, data: null };
const MY_REPORTS_TTL_MS = 15_000;

export function invalidateMyReportsCache() {
  myReportsCache = { at: 0, data: null };
}

export async function saveTrackedReport(payload) {
  const result = await apiRequest("/complaints/track", {
    method: "POST",
    body: JSON.stringify(payload),
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
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
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
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
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
  };
}
