import React from "react";
import { MapPin } from "lucide-react";

export function MapPlaceholder({ location, lat, lng }) {
  return (
    <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 relative">
      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-y-0 left-1/4 w-px bg-slate-200" />
        <div className="absolute inset-y-0 left-2/4 w-px bg-slate-200" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-slate-200" />
        <div className="absolute inset-x-0 top-1/4 h-px bg-slate-200" />
        <div className="absolute inset-x-0 top-2/4 h-px bg-slate-200" />
        <div className="absolute inset-x-0 top-3/4 h-px bg-slate-200" />
      </div>

      {/* Center pin */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-4 ring-white">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="mt-3 bg-white rounded-lg px-3 py-1.5 shadow-md border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-800">{location}</p>
            <p className="text-[10px] text-slate-400">
              {lat}, {lng}
            </p>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-500 border border-slate-200 shadow-sm">
        Map placeholder
      </div>
    </div>
  );
}
