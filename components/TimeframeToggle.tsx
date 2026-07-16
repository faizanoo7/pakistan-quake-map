"use client";

import type { Timeframe } from "@/lib/types";

interface Props {
  value: Timeframe;
  onChange: (t: Timeframe) => void;
}

const OPTIONS: { key: Timeframe; label: string; sub: string }[] = [
  { key: "30d", label: "30 days", sub: "Recent activity" },
  { key: "5y", label: "5 years", sub: "Recent patterns" },
  { key: "50y", label: "50 years", sub: "Historical hotspots" },
];

export default function TimeframeToggle({ value, onChange }: Props) {
  return (
    <div className="absolute top-4 left-4 z-[1000] rounded-lg bg-white/95 p-1 shadow-lg backdrop-blur">
      <div className="flex gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`rounded-md px-3 py-2 text-left transition ${
              value === opt.key
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="text-sm font-semibold">{opt.label}</div>
            <div
              className={`text-[10px] ${
                value === opt.key ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {opt.sub}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}