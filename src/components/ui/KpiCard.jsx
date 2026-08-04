import React from "react";

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - 4 - ((v - min) / range) * (h - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = points.join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`spark-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${color.replace("#", "")})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  iconBg,
  sparkData,
  sparkColor,
}) {
  const isPositive = change >= 0;
  return (
    <div className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:shadow-lifted hover:-translate-y-0.5 hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div
          className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isPositive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(change)}%
        </span>
      </div>

      <div>
        <span className="text-xs font-semibold text-slate-500 block">
          {label}
        </span>
        <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
          {value}
        </span>
      </div>

      {sparkData ? (
        <div className="mt-auto">
          <Sparkline data={sparkData} color={sparkColor || "#4f46e5"} />
        </div>
      ) : (
        <div className="h-8 flex items-end">
          <div className="w-full flex items-center gap-1">
            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors"
                style={{ height: `${v * 28}px` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
