import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  OSM_ATTRIBUTION,
  OSM_TILE_URL,
  SELECTED_MAP_ZOOM,
  incidentIcon,
} from "@/lib/mapSetup";
import { isValidCoordPair } from "@/lib/actionState";

function Recenter({ coords, nonce }) {
  const map = useMap();
  const lastNonce = useRef(0);

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (nonce === lastNonce.current) return;
    lastNonce.current = nonce;
    if (!isValidCoordPair(coords?.lat, coords?.lng)) return;
    map.flyTo([Number(coords.lat), Number(coords.lng)], SELECTED_MAP_ZOOM, {
      duration: 0.6,
    });
  }, [coords, nonce, map]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect?.({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });
  return null;
}

export function LocationPickerMap({ coords, onCoordsChange, recenterNonce = 0 }) {
  const hasCoords = isValidCoordPair(coords?.lat, coords?.lng);
  const center = hasCoords
    ? [Number(coords.lat), Number(coords.lng)]
    : DEFAULT_MAP_CENTER;

  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200/60 z-0">
      <MapContainer
        center={center}
        zoom={hasCoords ? SELECTED_MAP_ZOOM : DEFAULT_MAP_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
        <MapClickHandler onSelect={onCoordsChange} />
        <Recenter coords={coords} nonce={recenterNonce} />
        {hasCoords && (
          <Marker
            position={[Number(coords.lat), Number(coords.lng)]}
            icon={incidentIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const next = event.target.getLatLng();
                onCoordsChange?.({ lat: next.lat, lng: next.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
