/** Shared action-validity helpers used by Civic Link buttons. */

import { apiRequest } from "@/lib/api";

export const ACTION_BTN =
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:shadow-none disabled:active:scale-100";

export const PRIMARY_BTN =
  `bg-indigo-600 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/15 text-white shadow-xs shadow-indigo-600/20 hover:shadow-md hover:shadow-indigo-600/30 transition-all active:scale-[0.99] ${ACTION_BTN}`;

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

export function navigationUrl(lat, lng, originLat, originLng) {
  const params = ["api=1"];
  if (isValidCoordPair(originLat, originLng)) {
    params.push(`origin=${encodeURIComponent(`${originLat},${originLng}`)}`);
  }
  params.push(`destination=${encodeURIComponent(`${lat},${lng}`)}`);
  return `https://www.google.com/maps/dir/?${params.join("&")}`;
}

export function formatRouteDistance(meters) {
  const value = Number(meters);
  if (!Number.isFinite(value) || value < 0) return null;
  if (value >= 1000) return `${(value / 1000).toFixed(1)} km`;
  return `${Math.round(value)} m`;
}

export function formatRouteDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return null;
  const minutes = Math.round(value / 60);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

const LOCATION_ACCESS_MESSAGE =
  "Unable to access your current location. Please enable location permission and try again.";

function geolocationErrorMessage(error) {
  if (!error) return LOCATION_ACCESS_MESSAGE;
  if (error.code === 1) return LOCATION_ACCESS_MESSAGE;
  if (error.code === 2) {
    return "Unable to access your current location. GPS is unavailable. Please try again.";
  }
  if (error.code === 3) {
    return "Unable to access your current location. The location request timed out. Please try again.";
  }
  return LOCATION_ACCESS_MESSAGE;
}

export function getBrowserCoordinates(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(
        new Error(
          "Unable to access your current location. This browser does not support geolocation.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!isValidCoordPair(lat, lng)) {
          reject(new Error(LOCATION_ACCESS_MESSAGE));
          return;
        }
        resolve({ lat, lng });
      },
      (error) => reject(new Error(geolocationErrorMessage(error))),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
        ...options,
      },
    );
  });
}

function mapGeocodeHit(hit, fallbackName) {
  const lat = Number(hit?.lat);
  const lng = Number(hit?.lng ?? hit?.lon);
  if (!isValidCoordPair(lat, lng)) return null;
  return {
    lat,
    lng,
    displayName: hit.displayName || hit.display_name || hit.name || fallbackName,
  };
}

async function searchPlacesNominatim(query, { signal } = {}) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) return [];
  const rows = await response.json();
  return (Array.isArray(rows) ? rows : [])
    .map((hit) => mapGeocodeHit(hit, query))
    .filter(Boolean);
}

async function reverseGeocodeNominatim(lat, lng, { signal } = {}) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) return null;
  return mapGeocodeHit(await response.json(), `${lat}, ${lng}`);
}

export async function searchPlaces(query, options = {}) {
  const q = String(query || "").trim();
  if (!q) return [];

  const fromCoords = parseCoordinates(q);
  if (fromCoords) {
    return [{ ...fromCoords, displayName: q }];
  }

  try {
    const data = await apiRequest(`/places/search?q=${encodeURIComponent(q)}`);
    const rows = Array.isArray(data?.data) ? data.data : [];
    const mapped = rows.map((hit) => mapGeocodeHit(hit, q)).filter(Boolean);
    if (mapped.length) return mapped;
  } catch {
    /* Fall back to public geocoding if the API is unavailable. */
  }

  return searchPlacesNominatim(q, options);
}

export async function reverseGeocode(lat, lng, options = {}) {
  if (!isValidCoordPair(lat, lng)) return null;

  try {
    const data = await apiRequest(
      `/places/reverse?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
    );
    const mapped = mapGeocodeHit(data?.data, `${lat}, ${lng}`);
    if (mapped) return mapped;
  } catch {
    /* Fall back to public geocoding if the API is unavailable. */
  }

  return reverseGeocodeNominatim(lat, lng, options);
}

function mapDrivingRoute(payload) {
  const coords = payload?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const coordinates = coords
    .map((point) => {
      if (Array.isArray(point)) {
        const lat = Number(point[0]);
        const lng = Number(point[1]);
        return isValidCoordPair(lat, lng) ? { lat, lng } : null;
      }
      const lat = Number(point?.lat);
      const lng = Number(point?.lng ?? point?.lon);
      return isValidCoordPair(lat, lng) ? { lat, lng } : null;
    })
    .filter(Boolean);

  if (coordinates.length < 2) return null;

  const distanceMeters = Number(payload.distanceMeters ?? payload.distance);
  const durationSeconds = Number(payload.durationSeconds ?? payload.duration);

  return {
    coordinates,
    distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : null,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
  };
}

async function fetchDrivingRouteOsrm(fromLat, fromLng, toLat, toLng, { signal } = {}) {
  const path = `${Number(fromLng)},${Number(fromLat)};${Number(toLng)},${Number(toLat)}`;
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`,
    { headers: { Accept: "application/json" }, signal },
  );
  if (!response.ok) return null;
  const payload = await response.json();
  const route = Array.isArray(payload?.routes) ? payload.routes[0] : null;
  const geometry = route?.geometry?.coordinates;
  if (!Array.isArray(geometry)) return null;
  return mapDrivingRoute({
    coordinates: geometry.map(([lng, lat]) => ({ lat, lng })),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  });
}

export async function fetchDrivingRoute(
  fromLat,
  fromLng,
  toLat,
  toLng,
  options = {},
) {
  if (
    !isValidCoordPair(fromLat, fromLng) ||
    !isValidCoordPair(toLat, toLng)
  ) {
    return null;
  }

  try {
    const data = await apiRequest(
      `/places/route?fromLat=${encodeURIComponent(fromLat)}&fromLng=${encodeURIComponent(fromLng)}&toLat=${encodeURIComponent(toLat)}&toLng=${encodeURIComponent(toLng)}`,
    );
    const mapped = mapDrivingRoute(data?.data);
    if (mapped) return mapped;
  } catch {
    /* Fall back to public routing if the API is unavailable. */
  }

  return fetchDrivingRouteOsrm(fromLat, fromLng, toLat, toLng, options);
}

export async function searchPlace(query) {
  const results = await searchPlaces(query);
  return results[0] || null;
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
