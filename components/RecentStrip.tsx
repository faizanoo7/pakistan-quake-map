"use client";

import type { QuakeFeature } from "@/lib/types";
import { colorForMagnitude } from "@/lib/quake-style";
import { formatAgo } from "@/lib/quake-data";

interface Props {
  quakes: QuakeFeature[];
  onSelect: (q: QuakeFeature) => void;
}

export default function RecentStrip({ quakes, onSelect }: Props) {
  if (quakes.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-base font-bold text-[#0b3a5d]">Recent events</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-4">
        {quakes.map((q, i) => {
          const p = q.properties;
          return (
            <button
              key={`${p.id}-${i}`}
              onClick={() => onSelect(q)}
              className="flex w-[104px] shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-md border border-transparent px-2 py-3 text-center transition hover:border-slate-200 hover:bg-slate-50"
            >
              <span className="text-[11px] font-medium text-slate-500">
                {formatAgo(p.time_utc)}
              </span>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: colorForMagnitude(p.magnitude) }}
              >
                {p.magnitude.toFixed(1)}
              </span>
              <span className="line-clamp-2 text-[11px] leading-tight text-slate-600">
                {p.district !== "Outside Pakistan" ? p.district : p.place}
              </span>
              <span className="text-[10px] text-slate-400">
                {p.depth_km !== null ? `${p.depth_km.toFixed(0)} km` : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
