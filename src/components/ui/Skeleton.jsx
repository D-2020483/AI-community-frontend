import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/70", className)}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
