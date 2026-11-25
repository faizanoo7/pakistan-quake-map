"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type {
  QuakeCollection,
  QuakeFeature,
  QuakeFilters,
  Timeframe,
} from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";
import {
  ALL_REGIONS,
  GRANULARITY,
  GRANULARITY_HEADING,
  bucketByPeriod,
  sortByTimeDesc,
  useQuakes,
} from "@/lib/quake-data";
import SiteHeader from "@/components/SiteHeader";
import TimeframeToggle from "@/components/TimeframeToggle";
import CurrentQuake from "@/components/CurrentQuake";
import RecentStrip from "@/components/RecentStrip";
import PeriodList from "@/components/PeriodList";
import TopStories from "@/components/TopStories";
import RegionBreakdown from "@/components/RegionBreakdown";
import FilterSidebar from "@/components/FilterSidebar";

// Load the map only in the browser — Leaflet touches window/document
const QuakeMap = dynamic(() => import("@/components/QuakeMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

const MAGNITUDE_LEGEND = [
  { color: "#7f1d1d", label: "7.0+" },
  { color: "#dc2626", label: "6.0 – 6.9" },
  { color: "#f97316", label: "5.0 – 5.9" },
  { color: "#eab308", label: "4.0 – 4.9" },
  { color: "#84cc16", label: "3.0 – 3.9" },
  { color: "#22d3ee", label: "< 3.0" },
];

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

function matchesQuery(f: QuakeFeature, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const p = f.properties;
  return (
    p.place.toLowerCase().includes(q) ||
    p.district.toLowerCase().includes(q) ||
    p.province.toLowerCase().includes(q)
  );
}

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>("5y");
  const [province, setProvince] = useState<string>(ALL_REGIONS);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<QuakeFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<QuakeFeature | null>(null);

  const { features, loading, error } = useQuakes(timeframe);

  const provinces = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of features) {
      const name = f.properties.province;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.keys()).sort();
  }, [features]);

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of features) {
      const name = f.properties.province;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count
    );
  }, [features]);

  // Region + search narrow the pool; the Refine panel filters within it.
  const scoped = useMemo(
    () =>
      features.filter(
        (f) =>
          (province === ALL_REGIONS || f.properties.province === province) &&
          matchesQuery(f, query)
      ),
    [features, province, query]
  );

  const visible = useMemo(
    () => scoped.filter((f) => matchesFilters(f, filters)),
    [scoped, filters]
  );

  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    for (const f of scoped) {
      if (f.properties.district) set.add(f.properties.district);
    }
    return Array.from(set).sort();
  }, [scoped]);

  const byTimeDesc = useMemo(() => sortByTimeDesc(visible), [visible]);

  const strongest = useMemo(
    () =>
      [...visible]
        .sort((a, b) => b.properties.magnitude - a.properties.magnitude)
        .slice(0, 6),
    [visible]
  );

  const buckets = useMemo(
    () => bucketByPeriod(visible, GRANULARITY[timeframe]),
    [visible, timeframe]
  );

  const mapCollection = useMemo<QuakeCollection>(
    () => ({ type: "FeatureCollection", features: visible }),
    [visible]
  );

  return (
    <div className="min-h-screen bg-[#eef1f4]">
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        province={province}
        onProvinceChange={setProvince}
        provinces={provinces}
      />
      <TimeframeToggle value={timeframe} onChange={setTimeframe} />

      <main className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#0b3a5d]">
            {province === ALL_REGIONS ? "Pakistan & surrounding region" : province}
          </h1>
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading earthquake data…"
              : `${visible.length.toLocaleString()} recorded earthquake${
                  visible.length === 1 ? "" : "s"
                } · USGS`}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* minmax(0,…) keeps the scrolling strip from blowing out the track */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main column */}
          <div className="flex min-w-0 flex-col gap-4">
            <CurrentQuake quake={byTimeDesc[0] ?? null} loading={loading} />

            <RecentStrip quakes={byTimeDesc.slice(0, 12)} onSelect={setSelected} />

            {/* Radar-style map panel */}
            <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-100 px-5 py-3">
                <h2 className="shrink-0 text-base font-bold text-[#0b3a5d]">
                  Seismic map
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  {MAGNITUDE_LEGEND.map((row) => (
                    <span key={row.label} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-[11px] text-slate-500">
                        {row.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-[460px]">
                <QuakeMap
                  quakes={mapCollection}
                  loading={loading}
                  selected={selected}
                />
              </div>
            </section>

            <PeriodList
              buckets={buckets}
              heading={GRANULARITY_HEADING[GRANULARITY[timeframe]]}
            />
          </div>

          {/* Right rail */}
          <aside className="flex flex-col gap-4">
            <TopStories quakes={strongest} onSelect={setSelected} />
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              availableDistricts={availableDistricts}
              totalCount={features.length}
              filteredCount={visible.length}
            />
            <RegionBreakdown regions={regionCounts} onSelect={setProvince} />
          </aside>
        </div>
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-slate-500">
        Data from the{" "}
        <a
          href="https://earthquake.usgs.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0b3a5d] underline"
        >
          USGS Earthquake Catalog
        </a>
        . Basemap © OpenStreetMap contributors, CARTO.
      </footer>
    </div>
  );
}
