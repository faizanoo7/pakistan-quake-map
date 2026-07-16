"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Timeframe } from "@/lib/types";
import TimeframeToggle from "@/components/TimeframeToggle";

// Load the map only in the browser — Leaflet touches window/document
const QuakeMap = dynamic(() => import("@/components/QuakeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-slate-500">
      Loading map…
    </div>
  ),
});

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>("5y");

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <QuakeMap timeframe={timeframe} />
      <TimeframeToggle value={timeframe} onChange={setTimeframe} />

      {/* Header */}
      <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
        <h1 className="text-lg font-bold text-slate-900">
          Pakistan Earthquake Explorer
        </h1>
        <p className="text-xs text-slate-500">
          USGS data · updated daily
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/95 p-3 text-xs shadow-lg backdrop-blur">
        <div className="mb-2 font-semibold text-slate-700">Magnitude</div>
        <div className="space-y-1">
          {[
            { color: "#7f1d1d", label: "M 7.0+" },
            { color: "#dc2626", label: "M 6.0 – 6.9" },
            { color: "#f97316", label: "M 5.0 – 5.9" },
            { color: "#eab308", label: "M 4.0 – 4.9" },
            { color: "#84cc16", label: "M 3.0 – 3.9" },
            { color: "#22d3ee", label: "M < 3.0" },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="text-slate-600">{row.label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}