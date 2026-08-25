/** Shared action-validity helpers used by Civic Link buttons. */

export const ACTION_BTN =
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:shadow-none disabled:active:scale-100";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isValidPassword(value, minLength = 8) {
  return String(value || "").length >= minLength;
}

export function isValidCoordPair(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function parseCoordinates(value, lat, lng) {
  if (isValidCoordPair(lat, lng)) {
    return { lat: Number(lat), lng: Number(lng) };
  }

  const text = String(value || "").trim();
  const match = text.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/,
  );
  if (!match) return null;

  const parsed = { lat: Number(match[1]), lng: Number(match[2]) };
  return isValidCoordPair(parsed.lat, parsed.lng) ? parsed : null;
}

export function navigationUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${lat},${lng}`,
  )}`;
}

export async function searchPlace(query) {
  const q = String(query || "").trim();
  if (!q) return null;

  const fromCoords = parseCoordinates(q);
  if (fromCoords) {
    return { ...fromCoords, displayName: q };
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) return null;

  const rows = await response.json();
  const hit = rows?.[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!isValidCoordPair(lat, lng)) return null;

  return {
    lat,
    lng,
    displayName: hit.display_name || q,
  };
}

export const REPORT_STATUS_FLOW = [
  "Pending",
  "Assigned",
  "In Progress",
  "Resolved",
];

export const OFFICER_STATUS_FLOW = [
  "Assigned",
  "Accepted",
  "In Progress",
  "Completed",
];

export function normalizeReportStatus(status) {
  const value = String(status || "").trim();
  const key = value.toUpperCase().replace(/[\s-]+/g, "_");
  if (key === "SUBMITTED" || key === "PENDING") return "Pending";
  if (key === "ASSIGNED" || key === "ACCEPTED") return "Assigned";
  if (key === "IN_PROGRESS") return "In Progress";
  if (key === "RESOLVED" || key === "COMPLETED") return "Resolved";
  if (REPORT_STATUS_FLOW.includes(value)) return value;
  return value;
}

export function normalizeOfficerStatus(status) {
  const value = String(status || "").trim();
  if (value === "Resolved") return "Completed";
  if (value === "Pending") return "Assigned";
  if (OFFICER_STATUS_FLOW.includes(value)) return value;
  const report = normalizeReportStatus(value);
  if (report === "Resolved") return "Completed";
  if (report === "Pending") return "Assigned";
  if (report === "In Progress") return "In Progress";
  if (report === "Assigned") return "Assigned";
  return value;
}

export function canTransitionStatus(current, next, flow) {
  if (!current || !next || current === next) return false;
  const from = flow.indexOf(current);
  const to = flow.indexOf(next);
  return from !== -1 && to === from + 1;
}

export function allowedStatusOptions(current, flow) {
  const from = flow.indexOf(current);
  if (from === -1) return flow;
  return flow.slice(from, from + 2);
}

export function isTerminalReportStatus(status) {
  const normalized = normalizeReportStatus(status);
  return normalized === "Resolved";
}

export function isTerminalOfficerStatus(status) {
  return normalizeOfficerStatus(status) === "Completed";
}

export function canAssignOfficer({
  selectedOfficer,
  alreadyAssigned,
  canAssign,
  assigning,
}) {
  return Boolean(
    canAssign &&
      String(selectedOfficer || "").trim() &&
      !alreadyAssigned &&
      !assigning,
  );
}

export function canResolveReport({
  currentStatus,
  resolutionNote,
  canResolve,
  processing,
  flow = REPORT_STATUS_FLOW,
}) {
  const current = flow === OFFICER_STATUS_FLOW
    ? normalizeOfficerStatus(currentStatus)
    : normalizeReportStatus(currentStatus);
  const resolved = flow[flow.length - 1];
  return Boolean(
    canResolve &&
      !processing &&
      String(resolutionNote || "").trim() &&
      canTransitionStatus(current, resolved, flow),
  );
}
