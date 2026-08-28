import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const DEFAULT_MAP_CENTER = [7.8731, 80.7718];
export const DEFAULT_MAP_ZOOM = 8;
export const SELECTED_MAP_ZOOM = 16;

export const incidentIcon = L.divIcon({
  className: "civic-incident-marker",
  html: '<div class="civic-incident-marker-pin"></div>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -28],
});

export const officerIcon = L.divIcon({
  className: "civic-officer-marker",
  html: '<div class="civic-officer-marker-pin"></div>',
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -28],
});

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
