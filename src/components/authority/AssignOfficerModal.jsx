import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { UserCheck, ChevronDown } from "lucide-react";

// Modal that lets an authority assign an officer to a report.
export function AssignOfficerModal({
  open,
  onClose,
  onConfirm,
  officers,
  report,
}) {
  const [officer, setOfficer] = useState("");

  const handleConfirm = () => {
    if (!officer) return;
    onConfirm(officer);
    setOfficer("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Officer"
      subtitle={report ? `Assign an officer to ${report.id}` : ""}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!officer}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5" /> Assign
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Select Officer
          </label>
          <div className="relative">
            <select
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className="w-full pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/15 shadow-sm transition-all cursor-pointer"
            >
              <option value="">Choose an officer...</option>
              {officers.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name} · {o.department}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {report?.assignedOfficer && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
            Currently assigned:{" "}
            <span className="font-bold text-slate-900">
              {report.assignedOfficer}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}
