import React from "react";
import { UploadCloud, Wrench, ChevronDown } from "lucide-react";

export function TellUs() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5 transition-all duration-300 hover:shadow-md">
      {/* Step Header */}
      <div className="flex items-start gap-3">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-indigo-600/20">
          1
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Tell us what happened
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Include a clear photo and a few helpful details.
          </p>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="group border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/30 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all duration-300 cursor-pointer">
        <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
          <UploadCloud className="h-5 w-5" />
        </div>
        <span className="text-xs font-bold text-slate-800">
          Upload a photo of the issue
        </span>
        <span className="text-[11px] text-slate-400 mt-1">
          Drag and drop or{" "}
          <span className="text-indigo-600 font-medium underline">
            browse files
          </span>{" "}
          · PNG, JPG up to 10MB
        </span>
      </div>

      {/* Issue Category Select */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Issue category
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-600">
            <Wrench className="h-4 w-4" />
          </div>
          <select className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer">
            <option>Roads & infrastructure</option>
            <option>Street light</option>
            <option>Garbage collection</option>
            <option>Water supply</option>
          </select>
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Description Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Describe the issue
        </label>
        <textarea
          rows={4}
          placeholder="Tell us what needs attention. Include landmarks or details that may help the response team."
          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all resize-none"
        />
      </div>
    </div>
  );
}
