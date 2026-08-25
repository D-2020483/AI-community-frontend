import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  loadingLabel,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel, loading]);

  const busyLabel =
    loadingLabel ||
    (String(confirmLabel).toLowerCase().includes("delete")
      ? "Deleting..."
      : "Processing...");

  if (!open) return null;

  const confirmCls =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 text-white"
      : "bg-indigo-600 hover:bg-indigo-700 text-white";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-scale-in">
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              tone === "danger"
                ? "bg-rose-50 text-rose-600"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            {message && (
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              if (loading) return;
              onConfirm();
            }}
            disabled={loading}
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${confirmCls}`}
          >
            {loading ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
