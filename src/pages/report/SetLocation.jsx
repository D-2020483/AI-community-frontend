import React, { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Search,
  Target,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { LocationPickerMap } from "@/components/map/LocationPickerMap";
import {
  ACTION_BTN,
  isValidCoordPair,
  parseCoordinates,
  reverseGeocode,
  searchPlaces,
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
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [recenterNonce, setRecenterNonce] = useState(0);
  const skipSuggestRef = useRef(false);
  const suggestTimerRef = useRef(null);

  const locationLoading = searching || geoLoading;
  const hasValidCoords = isValidCoordPair(coords?.lat, coords?.lng);
  const canConfirm = hasValidCoords && !locationConfirmed && !locationLoading;

  const applyLocation = (
    address,
    nextCoords,
    { confirm = false, preserveConfirm = false, recenter = false } = {},
  ) => {
    setQuery(address);
    onLocationChange(address);
    onCoordsChange(nextCoords);
    if (recenter) setRecenterNonce((value) => value + 1);
    if (preserveConfirm) return;
    onLocationConfirmed(
      Boolean(confirm && isValidCoordPair(nextCoords?.lat, nextCoords?.lng)),
    );
  };

  const handleQueryChange = (value) => {
    setSearchError("");
    setQuery(value);
    skipSuggestRef.current = false;
    const parsed = parseCoordinates(value);
    onLocationChange(value);
    if (parsed) {
      onCoordsChange(parsed);
    } else {
      onCoordsChange(null);
    }
    onLocationConfirmed(false);
  };

  const selectResult = (result) => {
    skipSuggestRef.current = true;
    setSuggestions([]);
    applyLocation(result.displayName, { lat: result.lat, lng: result.lng }, {
      recenter: true,
    });
  };

  const handleSearch = async () => {
    if (!query.trim() || locationLoading) return;
    setSearching(true);
    setSearchError("");
    try {
      const results = await searchPlaces(query);
      if (!results.length) {
        setSuggestions([]);
        setSearchError(
          "No matching location found. Try another search, click the map, or use My Current Location.",
        );
        onCoordsChange(null);
        onLocationConfirmed(false);
        return;
      }
      setSuggestions(results);
      skipSuggestRef.current = true;
      applyLocation(
        results[0].displayName,
        { lat: results[0].lat, lng: results[0].lng },
        { recenter: true },
      );
    } catch {
      setSuggestions([]);
      setSearchError("Could not search for that location. Try again.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (skipSuggestRef.current) return;
    const value = query.trim();
    if (value.length < 3 || parseCoordinates(value)) {
      setSuggestions([]);
      return;
    }

    clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const results = await searchPlaces(value);
        setSuggestions(results);
        if (!results.length) {
          setSearchError("");
        }
      } catch {
        setSuggestions([]);
        setSearchError("Could not search for that location. Try again.");
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => clearTimeout(suggestTimerRef.current);
  }, [query]);

  const nameForCoords = async (nextCoords, fallback) => {
    try {
      const result = await reverseGeocode(nextCoords.lat, nextCoords.lng);
      return result?.displayName || fallback;
    } catch {
      return fallback;
    }
  };

  const handleMapCoords = async (nextCoords) => {
    if (!isValidCoordPair(nextCoords?.lat, nextCoords?.lng)) return;
    const fallback = `${Number(nextCoords.lat).toFixed(5)}, ${Number(nextCoords.lng).toFixed(5)}`;
    skipSuggestRef.current = true;
    setSuggestions([]);
    applyLocation(fallback, nextCoords);
    setGeoLoading(true);
    setSearchError("");
    try {
      const name = await nameForCoords(nextCoords, fallback);
      applyLocation(name, nextCoords, { preserveConfirm: true });
    } finally {
      setGeoLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || locationLoading) return;
    setGeoLoading(true);
    setSearchError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        const fallback = `${next.lat.toFixed(5)}, ${next.lng.toFixed(5)}`;
        skipSuggestRef.current = true;
        setSuggestions([]);
        applyLocation(fallback, next, { recenter: true });
        try {
          const name = await nameForCoords(next, fallback);
          applyLocation(name, next, { recenter: true, preserveConfirm: true });
        } catch {
          setSearchError("Could not read your current location.");
        } finally {
          setGeoLoading(false);
        }
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
            <h3 className="text-base font-bold text-slate-900">Location</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose where the incident happened. This can be different from
              where you are now.
            </p>
          </div>
        </div>

        <LocationPickerMap
          coords={coords}
          onCoordsChange={handleMapCoords}
          recenterNonce={recenterNonce}
        />

        <div className="relative">
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
              placeholder="Search an address, place, road, or landmark"
              className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-xs transition-all"
              autoComplete="off"
            />
            {searching ? (
              <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-indigo-500" />
            ) : null}
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {suggestions.map((item) => (
                <li key={`${item.lat},${item.lng},${item.displayName}`}>
                  <button
                    type="button"
                    onClick={() => selectResult(item)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {item.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locationLoading}
            className={`w-full py-2.5 px-4 border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer ${ACTION_BTN}`}
          >
            {geoLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading location...</span>
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                <span>My Current Location</span>
              </>
            )}
          </button>
        </div>

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
                    ? `${Number(coords.lat).toFixed(5)}, ${Number(coords.lng).toFixed(5)} — confirm to continue`
                    : "Search, click the map, or drag the marker"}
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
