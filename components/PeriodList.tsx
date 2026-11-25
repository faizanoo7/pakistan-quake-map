"use client";

import { colorForMagnitude } from "@/lib/quake-style";
import type { PeriodBucket } from "@/lib/quake-data";

interface Props {
  buckets: PeriodBucket[];
  heading: string;
}

export default function PeriodList({ buckets, heading }: Props) {
  if (buckets.length === 0) return null;

  const busiest = Math.max(...buckets.map((b) => b.count));

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-3">
        <h2 className="text-base font-bold text-[#0b3a5d]">{heading}</h2>
      </div>

      <ul className="divide-y divide-slate-100">
        {buckets.map((b) => (
          <li
            key={b.key}
            className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50"
          >
            <div className="w-20 shrink-0">
              <div className="text-sm font-semibold text-slate-800">
                {b.label}
              </div>
              {b.sublabel && (
                <div className="text-xs text-slate-500">{b.sublabel}</div>
              )}
            </div>

            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: colorForMagnitude(b.maxMag) }}
              title={`Strongest: M${b.maxMag.toFixed(1)}`}
            >
              {b.maxMag.toFixed(1)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#ff6b00]"
                  style={{ width: `${Math.max((b.count / busiest) * 100, 4)}%` }}
                />
              </div>
            </div>

            <div className="w-16 shrink-0 text-right text-sm text-slate-600">
              {b.count.toLocaleString()}
              <span className="ml-1 text-xs text-slate-400">
                {b.count === 1 ? "quake" : "quakes"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
