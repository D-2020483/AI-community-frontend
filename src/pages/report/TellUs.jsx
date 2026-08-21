import React, { useRef, useState } from "react";
import { UploadCloud, Wrench, ChevronDown, X } from "lucide-react";
import { CATEGORY_OPTIONS } from "@/data/issueCategories";

export function TellUs({
  imageFile,
  imagePreviewUrl,
  onImageChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  categoryOptions = CATEGORY_OPTIONS,
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const acceptFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return;
    onImageChange(file);
  };

  const handleFilePicked = (e) => {
    acceptFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5 transition-all duration-300 hover:shadow-md">
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

      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFilePicked}
      />

      {imagePreviewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            src={imagePreviewUrl}
            alt="Selected issue"
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-slate-900/70 px-3 py-2 text-white">
            <span className="truncate text-[11px] font-medium">
              {imageFile?.name || "Uploaded photo"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(null);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[11px] font-semibold hover:bg-white/25"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm hover:bg-white"
          >
            Change photo
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`group border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? "border-indigo-400 bg-indigo-50/70"
              : "border-slate-200 bg-slate-50/30 hover:bg-indigo-50/40 hover:border-indigo-200"
          }`}
        >
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
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Issue category
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-600">
            <Wrench className="h-4 w-4" />
          </div>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer"
          >
            <option value="">Not sure / let AI decide</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Describe the issue
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Tell us what needs attention. Include landmarks or details that may help the response team."
          className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all resize-none"
        />
      </div>
    </div>
  );
}
