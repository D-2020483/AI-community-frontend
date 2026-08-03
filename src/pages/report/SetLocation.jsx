import React from "react";
import { MapPin, Search, Target, CheckCircle2, ArrowRight } from "lucide-react";

export function SetLocation({ onSubmit }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md h-full">
      <div className="space-y-5">
        {/* Step Header */}
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

        {/* Custom Vector Blueprint Map Box */}
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

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-md shadow-md text-[10px] font-bold text-slate-800 border border-slate-100 mb-1">
              <span>22 Oak Street</span>
            </div>
            <div className="h-7 w-7 bg-rose-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin className="h-4 w-4 fill-white text-rose-500" />
            </div>
          </div>
        </div>

        {/* Search Location Input Bar */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search for an address or place"
            className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-xs transition-all"
          />
          <button className="absolute right-2 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
            <Target className="h-4 w-4" />
          </button>
        </div>

        {/* Location Selection Confirmation Status */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                22 Oak Street, North District
              </p>
              <p className="text-[10px] text-slate-400">
                Selected report location
              </p>
            </div>
          </div>
          <CheckCircle2 className="h-4 w-4 text-slate-800" />
        </div>
      </div>

      {/* Trigger Submit Handler */}
      <button
        onClick={onSubmit}
        className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs shadow-indigo-600/20 transition-all hover:shadow-md hover:shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        <span>Submit report</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
