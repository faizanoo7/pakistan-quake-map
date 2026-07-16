"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type {
  QuakeCollection,
  QuakeFeature,
  QuakeFilters,
  Timeframe,
} from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";
import TimeframeToggle from "@/components/TimeframeToggle";
import FilterSidebar from "@/components/FilterSidebar";

// Load the map only in the browser — Leaflet touches window/document
const QuakeMap = dynamic(() => import("@/components/QuakeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-slate-500">
      Loading map…
    </div>
  ),
});

const TIMEFRAME_FILES: Record<Timeframe, string> = {
  "30d": "/data/quakes_30d.geojson",
  "5y": "/data/quakes_5y.geojson",
  "50y": "/data/quakes_50y.geojson",
};

function matchesFilters(f: QuakeFeature, filters: QuakeFilters): boolean {
  const mag = f.properties.magnitude;
  if (mag < filters.minMagnitude || mag > filters.maxMagnitude) return false;

  if (
    filters.districts.length > 0 &&
    !filters.districts.includes(f.properties.district)
  ) {
    return false;
  }

  const time = new Date(f.properties.time_utc).getTime();
  if (filters.startDate && time < new Date(filters.startDate).getTime()) {
    return false;
  }
  if (filters.endDate && time > new Date(filters.endDate).getTime()) {
    return false;
  }

  return true;
}

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>("5y");
  const [filters, setFilters] = useState<QuakeFilters>(DEFAULT_FILTERS);
  const [quakes, setQuakes] = useState<QuakeCollection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(TIMEFRAME_FILES[timeframe])
      .then((r) => r.json())
      .then((data: QuakeCollection) => {
        if (cancelled) return;
        setQuakes(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load quakes:", err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  const allFeatures = quakes?.features ?? [];

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    for (const f of allFeatures) {
      if (f.properties.district) set.add(f.properties.district);
    }
    return Array.from(set).sort();
  }, [allFeatures]);

  const filteredCollection = useMemo<QuakeCollection>(
    () => ({
      type: "FeatureCollection",
      features: allFeatures.filter((f) => matchesFilters(f, filters)),
    }),
    [allFeatures, filters]
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <QuakeMap quakes={filteredCollection} loading={loading} />
      <TimeframeToggle value={timeframe} onChange={setTimeframe} />

      {/* Filters */}
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        availableDistricts={availableDistricts}
        totalCount={allFeatures.length}
        filteredCount={filteredCollection.features.length}
      />

      {/* Header */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
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
