"use client";

import type { QuakeFeature } from "@/lib/types";
import { colorForMagnitude } from "@/lib/quake-style";
import { formatAgo } from "@/lib/quake-data";

interface Props {
  quakes: QuakeFeature[];
  onSelect: (q: QuakeFeature) => void;
}

export default function TopStories({ quakes, onSelect }: Props) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-base font-bold text-[#0b3a5d]">Strongest events</h2>
      </div>

      {quakes.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-500">Nothing to show.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {quakes.map((q, i) => {
            const p = q.properties;
            return (
              <li key={`${p.id}-${i}`}>
                <button
                  onClick={() => onSelect(q)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
                    style={{ backgroundColor: colorForMagnitude(p.magnitude) }}
                  >
                    {p.magnitude.toFixed(1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-medium text-slate-800">
                      {p.place}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatAgo(p.time_utc)}
                      {p.depth_km !== null && ` · ${p.depth_km.toFixed(0)} km deep`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
