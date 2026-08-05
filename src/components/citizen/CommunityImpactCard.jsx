import React from "react";
import { ArrowRight, MapPin } from "lucide-react";

export function CommunityImpactCard({ communityImpact }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-6 flex flex-col justify-between border border-slate-800 shadow-xl min-h-75 transition-all duration-300 hover:shadow-2xl">
      {/* Background Map Placeholder Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [bg-size:16px_16px] pointer-events-none" />

      {/* Map Marker Pin Visual */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-30">
        <MapPin className="h-32 w-32 text-rose-500" />
      </div>

      <div className="relative z-10 space-y-3 max-w-xs">
        <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase">
          Community Impact
        </span>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
          Issues near you
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Live view of recent reports around{" "}
          <strong className="text-white">North District.</strong>
        </p>
      </div>

      <div className="relative z-10 pt-6">
        <button className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-100 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer">
          <span>Explore map</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-900" />
        </button>
      </div>
    </div>
  );
}
