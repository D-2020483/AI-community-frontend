import React, { useEffect } from "react";
import { MapPin } from "lucide-react";
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
import { isValidCoordPair } from "@/lib/actionState";

function FitRoute({ lat, lng, originLat, originLng }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const hasIncident = isValidCoordPair(lat, lng);
    const hasOrigin = isValidCoordPair(originLat, originLng);

    if (hasIncident && hasOrigin) {
      const bounds = L.latLngBounds(
        [Number(originLat), Number(originLng)],
        [Number(lat), Number(lng)],
      );
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: SELECTED_MAP_ZOOM });
      return;
    }

    if (hasIncident) {
      map.setView([Number(lat), Number(lng)], SELECTED_MAP_ZOOM);
    }
  }, [lat, lng, originLat, originLng, map]);

  return null;
}

export function IncidentMap({
  location,
  lat,
  lng,
  originLat,
  originLng,
  reportId,
  title,
  description,
}) {
  const hasCoords = isValidCoordPair(lat, lng);
  const hasOrigin = isValidCoordPair(originLat, originLng);

  if (!hasCoords) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center">
        <p className="text-xs font-semibold text-slate-600">
          Incident coordinates are not available.
        </p>
        {location ? (
          <p className="text-[11px] text-slate-400 mt-1">{location}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 relative z-0">
        <MapContainer
          center={[Number(lat), Number(lng)]}
          zoom={SELECTED_MAP_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
          <FitRoute
            lat={lat}
            lng={lng}
            originLat={originLat}
            originLng={originLng}
          />
          {hasOrigin ? (
            <>
              <Marker
                position={[Number(originLat), Number(originLng)]}
                icon={officerIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[140px]">
                    <p className="font-bold text-slate-900">Your location</p>
                    <p className="text-slate-500">
                      {Number(originLat).toFixed(5)}, {Number(originLng).toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Polyline
                positions={[
                  [Number(originLat), Number(originLng)],
                  [Number(lat), Number(lng)],
                ]}
                pathOptions={{
                  color: "#4f46e5",
                  weight: 3,
                  opacity: 0.75,
                  dashArray: "8 6",
                }}
              />
            </>
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
                <p className="font-semibold text-slate-800">{location}</p>
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
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 space-y-2">
        {hasOrigin ? (
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              Your current location
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {Number(originLat).toFixed(5)}, {Number(originLng).toFixed(5)}
            </p>
          </div>
        ) : null}
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <MapPin className="h-3.5 w-3.5 text-rose-500" />
            {location || "Incident destination"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
          </p>
          {title ? (
            <p className="text-[11px] text-slate-500 mt-1">{title}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
