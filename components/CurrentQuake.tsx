"use client";

import type { QuakeFeature } from "@/lib/types";
import { colorForMagnitude } from "@/lib/quake-style";
import {
  depthLabel,
  formatAgo,
  formatWhen,
  significanceLabel,
} from "@/lib/quake-data";

interface Props {
  quake: QuakeFeature | null;
  loading: boolean;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-wide text-slate-500 uppercase">
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

export default function CurrentQuake({ quake, loading }: Props) {
  if (loading) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-32 animate-pulse rounded bg-slate-100" />
      </section>
    );
  }

  if (!quake) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0b3a5d]">
          Most recent earthquake
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          No earthquakes match the current search or filters.
        </p>
      </section>
    );
  }

  const p = quake.properties;
  const color = colorForMagnitude(p.magnitude);
  const [lon, lat] = quake.geometry.coordinates;

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h2 className="text-base font-bold text-[#0b3a5d]">
          Most recent earthquake
        </h2>
        <span className="text-xs text-slate-500">{formatAgo(p.time_utc)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-5 py-5">
        <div className="flex items-center gap-4">
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          >
            M
          </span>
          <div>
            <div className="text-6xl leading-none font-light text-slate-900">
              {p.magnitude.toFixed(1)}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-500">
              Magnitude
            </div>
          </div>
        </div>

        <div className="min-w-[200px] flex-1">
          <div className="text-lg font-semibold text-slate-800">{p.place}</div>
          <div className="mt-0.5 text-sm text-slate-500">
            {p.district}
            {p.province !== p.district ? `, ${p.province}` : ""}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            {formatWhen(p.time_utc)}
          </div>
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-[#ff6b00] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#e55f00]"
            >
              USGS details
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:grid-cols-4">
        <Stat
          label="Depth"
          value={p.depth_km !== null ? `${p.depth_km.toFixed(0)} km` : "Unknown"}
        />
        <Stat label="Depth class" value={depthLabel(p.depth_km)} />
        <Stat label="Impact" value={significanceLabel(p.significance)} />
        <Stat label="Coordinates" value={`${lat.toFixed(2)}, ${lon.toFixed(2)}`} />
      </div>
    </section>
  );
}
