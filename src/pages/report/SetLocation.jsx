import React, { useState } from "react";
import {
  MapPin,
  Search,
  Target,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  ACTION_BTN,
  isValidCoordPair,
  parseCoordinates,
  searchPlace,
} from "@/lib/actionState";

export function SetLocation({
  location,
  onLocationChange,
  coords,
  onCoordsChange,
  locationConfirmed,
  onLocationConfirmed,
  onSubmit,
  submitting,
  canSubmit,
  error,
}) {
  const [query, setQuery] = useState(location || "");
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const locationLoading = searching || geoLoading;
  const hasValidCoords = isValidCoordPair(coords?.lat, coords?.lng);
  const canConfirm = hasValidCoords && !locationConfirmed && !locationLoading;

  const applyLocation = (address, nextCoords, { confirm = false } = {}) => {
    setQuery(address);
    onLocationChange(address);
    onCoordsChange(nextCoords);
    onLocationConfirmed(Boolean(confirm && isValidCoordPair(nextCoords?.lat, nextCoords?.lng)));
  };

  const handleQueryChange = (value) => {
    setSearchError("");
    setQuery(value);
    const parsed = parseCoordinates(value);
    onLocationChange(value);
    if (parsed) {
      onCoordsChange(parsed);
    } else {
      onCoordsChange(null);
    }
    onLocationConfirmed(false);
  };

  const handleSearch = async () => {
    if (!query.trim() || locationLoading) return;
    setSearching(true);
    setSearchError("");
    try {
      const result = await searchPlace(query);
      if (!result) {
        setSearchError("No matching location found. Try another search or use current location.");
        onCoordsChange(null);
        onLocationConfirmed(false);
        return;
      }
      applyLocation(result.displayName, {
        lat: result.lat,
        lng: result.lng,
      });
    } catch {
      setSearchError("Could not search for that location. Try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || locationLoading) return;
    setGeoLoading(true);
    setSearchError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        applyLocation(
          `${next.lat.toFixed(5)}, ${next.lng.toFixed(5)}`,
          next,
        );
        setGeoLoading(false);
      },
      () => {
        setSearchError("Could not read your current location.");
        setGeoLoading(false);
      },
    );
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onLocationConfirmed(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md h-full">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs shadow-indigo-600/20">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Set the location
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pinpoint where the issue is happening.
            </p>
          </div>
        </div>

        <div className="relative h-64 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200/60 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full stroke-white stroke-6"
            fill="none"
          >
            <line x1="0" y1="20%" x2="100%" y2="80%" />
            <line x1="20%" y1="0" x2="80%" y2="100%" />
            <line x1="60%" y1="0" x2="100%" y2="60%" />
          </svg>

          <div className="absolute top-12 left-12 w-20 h-12 bg-slate-200/80 rounded-md transform -rotate-12" />
          <div className="absolute bottom-12 left-1/3 w-24 h-12 bg-slate-200/80 rounded-md transform -rotate-12" />
          <div className="absolute top-12 right-12 w-24 h-12 bg-slate-200/80 rounded-md transform -rotate-12" />

          <div className="relative z-10 flex flex-col items-center max-w-[85%]">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-md shadow-md text-[10px] font-bold text-slate-800 border border-slate-100 mb-1">
              <span className="truncate">
                {locationLoading
                  ? "Locating…"
                  : location || "Search or drop a pin"}
              </span>
            </div>
            <div
              className={`h-7 w-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white ${
                locationConfirmed ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              <MapPin className="h-4 w-4 fill-white" />
            </div>
            {hasValidCoords && (
              <p className="mt-2 text-[10px] font-semibold text-slate-500 bg-white/90 px-2 py-0.5 rounded-md">
                {Number(coords.lat).toFixed(5)}, {Number(coords.lng).toFixed(5)}
              </p>
            )}
          </div>
        </div>

        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            type="text"
            placeholder="Search for an address or place"
            className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-xs transition-all"
          />
          <button
            type="button"
            title="Use my current location"
            onClick={handleUseCurrentLocation}
            disabled={locationLoading}
            className={`absolute right-2 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer ${ACTION_BTN}`}
          >
            {geoLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Target className="h-4 w-4" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!query.trim() || locationLoading}
          className={`w-full py-2.5 px-4 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer ${ACTION_BTN}`}
        >
          {searching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Search location</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {locationLoading
                  ? geoLoading
                    ? "Loading location..."
                    : "Searching..."
                  : location || "Not set yet"}
              </p>
              <p className="text-[10px] text-slate-400">
                {locationConfirmed
                  ? "Location confirmed"
                  : hasValidCoords
                    ? "Confirm this location to continue"
                    : "Selected report location"}
              </p>
            </div>
          </div>
          {locationConfirmed && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${ACTION_BTN}`}
        >
          {locationLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{geoLoading ? "Loading location..." : "Searching..."}</span>
            </>
          ) : locationConfirmed ? (
            "Location confirmed"
          ) : (
            "Confirm Location"
          )}
        </button>

        {(error || searchError) && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-xs font-medium">{error || searchError}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !canSubmit}
        className={`w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs shadow-indigo-600/20 transition-all hover:shadow-md hover:shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${ACTION_BTN}`}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <span>Submit Report</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
