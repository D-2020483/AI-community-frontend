import React, { useEffect, useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import {
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  SELECTED_MAP_ZOOM,
  incidentIcon,
  officerIcon,
} from "@/lib/mapSetup";
import {
  PRIMARY_BTN,
  formatRouteDistance,
  formatRouteDuration,
  isValidCoordPair,
} from "@/lib/actionState";

function FitRoute({ positions }) {
  const map = useMap();
  const key = JSON.stringify(positions);

  useEffect(() => {
    map.invalidateSize();
    const pts = (positions || []).filter(([lat, lng]) =>
      isValidCoordPair(lat, lng),
    );
    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), {
        padding: [40, 40],
        maxZoom: SELECTED_MAP_ZOOM,
      });
      return;
    }
    if (pts.length === 1) {
      map.setView(pts[0], SELECTED_MAP_ZOOM);
    }
  }, [key, map, positions]);

  return null;
}

export function IncidentMap({
  location,
  lat,
  lng,
  originLat,
  originLng,
  originName,
  routeCoordinates,
  distanceMeters,
  durationSeconds,
  routeMessage,
  reportId,
  title,
  description,
  onOpenExternal,
}) {
  const hasCoords = isValidCoordPair(lat, lng);
  const hasOrigin = isValidCoordPair(originLat, originLng);
  const routePositions = useMemo(
    () =>
      (Array.isArray(routeCoordinates) ? routeCoordinates : [])
        .map((point) => [Number(point.lat), Number(point.lng)])
        .filter(([a, b]) => isValidCoordPair(a, b)),
    [routeCoordinates],
  );
  const fitPositions = useMemo(() => {
    if (routePositions.length >= 2) return routePositions;
    const pts = [];
    if (hasOrigin) pts.push([Number(originLat), Number(originLng)]);
    if (hasCoords) pts.push([Number(lat), Number(lng)]);
    return pts;
  }, [routePositions, hasOrigin, hasCoords, originLat, originLng, lat, lng]);

  const distanceLabel = formatRouteDistance(distanceMeters);
  const durationLabel = formatRouteDuration(durationSeconds);
  const destinationName = location || "Reported Incident";
  const officerLocationName = originName || "Officer Current Location";

  if (!hasCoords) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center">
        <p className="text-xs font-semibold text-slate-800">Unable to navigate</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Incident location is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer
          center={[Number(lat), Number(lng)]}
          zoom={SELECTED_MAP_ZOOM}
          scrollWheelZoom
          zoomControl
          className="h-full w-full"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          <FitRoute positions={fitPositions} />
          {hasOrigin ? (
            <Marker
              position={[Number(originLat), Number(originLng)]}
              icon={officerIcon}
            >
              <Popup>
                <div className="text-xs space-y-1 min-w-[140px]">
                  <p className="font-bold text-slate-900">Your Location</p>
                  <p className="text-slate-600">{officerLocationName}</p>
                  <p className="text-slate-500">
                    {Number(originLat).toFixed(5)}, {Number(originLng).toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null}
          {routePositions.length >= 2 ? (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#4f46e5",
                weight: 5,
                opacity: 0.9,
              }}
            />
          ) : null}
          <Marker position={[Number(lat), Number(lng)]} icon={incidentIcon}>
            <Popup>
              <div className="text-xs space-y-1 min-w-[160px]">
                {reportId ? (
                  <p className="font-bold text-slate-500 uppercase tracking-wide">
                    {reportId}
                  </p>
                ) : null}
                {title ? (
                  <p className="font-bold text-slate-900">{title}</p>
                ) : null}
                <p className="font-semibold text-slate-800">{destinationName}</p>
                <p className="text-slate-500">
                  {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                </p>
                {description ? (
                  <p className="text-slate-500 leading-relaxed">{description}</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 space-y-3">
        {hasOrigin ? (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              Your Location
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{officerLocationName}</p>
          </div>
        ) : null}
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            Destination
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{destinationName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
          </p>
        </div>
        {(distanceLabel || durationLabel) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-700">
            {distanceLabel ? <span>Distance: {distanceLabel}</span> : null}
            {durationLabel ? <span>Estimated Time: {durationLabel}</span> : null}
          </div>
        )}
        {routeMessage ? (
          <p className="text-[11px] font-medium text-amber-700">{routeMessage}</p>
        ) : null}
        {hasOrigin && onOpenExternal ? (
          <button
            type="button"
            onClick={onOpenExternal}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl ${PRIMARY_BTN}`}
          >
            <Navigation className="h-3.5 w-3.5" />
            Open Navigation
          </button>
        ) : null}
      </div>
    </div>
  );
}
