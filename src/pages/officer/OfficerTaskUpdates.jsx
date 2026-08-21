import React, { useMemo } from "react";
import { RefreshCw, MessageSquare, MapPin } from "lucide-react";
import { OfficerLayout } from "@/layouts/officer/OfficerLayout";
import { useOfficer } from "@/context/OfficerContext";

export default function OfficerTaskUpdates() {
  const { tasks, officer, tasksLoading, tasksError } = useOfficer();

  const feed = useMemo(() => {
    const items = [];
    tasks.forEach((t) => {
      (t.timeline || []).forEach((step, index) => {
        items.push({
          id: `${t.id}-${index}-${step.label}`,
          taskId: t.id,
          taskTitle: t.title,
          location: t.location,
          label: step.label,
          text: step.text,
          time: step.time,
          at: step.at,
          author: (() => {
            const actor = String(step.actor || "").trim();
            const actorKey = actor.toLowerCase();
            const label = String(step.label || "").toLowerCase();
            if (
              label === "reported" ||
              actorKey === "citizen" ||
              actorKey === "reporter"
            ) {
              return t.citizen || actor || "Citizen";
            }
            if (actorKey === "system") {
              return t.authority || t.assignedAuthority || "Authority";
            }
            return actor || officer?.name || "Field Officer";
          })(),
        });
      });
    });
    return items.sort((a, b) => {
      const aTime = a.at ? new Date(a.at).getTime() : 0;
      const bTime = b.at ? new Date(b.at).getTime() : 0;
      return bTime - aTime;
    });
  }, [tasks, officer]);

  const labelColor = {
    Assigned: "bg-slate-100 text-slate-600",
    "Officer Assigned": "bg-sky-50 text-sky-600",
    Accepted: "bg-emerald-50 text-emerald-600",
    "In Progress": "bg-sky-50 text-sky-600",
    Completed: "bg-indigo-50 text-indigo-600",
    Resolved: "bg-indigo-50 text-indigo-600",
    Update: "bg-violet-50 text-violet-600",
  };

  return (
    <OfficerLayout
      title="Task updates"
      subtitle="Latest activity across your assigned tasks"
    >
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-5">
          <RefreshCw className="h-4 w-4 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Activity feed</h3>
          <span className="text-xs text-slate-400 ml-auto">
            {feed.length} updates
          </span>
        </div>

        <div className="space-y-4">
          {tasksLoading ? (
            <p className="text-center text-sm font-semibold text-slate-500 py-8">
              Loading task updates…
            </p>
          ) : tasksError ? (
            <p className="text-center text-sm font-semibold text-rose-600 py-8">
              {tasksError}
            </p>
          ) : (
            feed.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    labelColor[item.label] || "bg-slate-100 text-slate-600"
                  }`}
                >
                  {(item.author || "OF")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1 bg-slate-50/80 border border-slate-100 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs font-bold text-slate-900">
                      {item.author}{" "}
                      <span className="text-[10px] font-semibold text-slate-400">
                        · {item.label}
                      </span>
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-semibold">
                    {item.taskTitle}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" /> {item.location}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed flex items-start gap-1.5">
                    <MessageSquare className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                    {item.text}
                  </p>
                </div>
              </div>
            ))
          )}

          {!tasksLoading && !tasksError && feed.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              No task updates yet.
            </p>
          )}
        </div>
      </div>
    </OfficerLayout>
  );
}
