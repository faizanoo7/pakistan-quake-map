"use client";

import { useEffect, useState } from "react";
import type { QuakeCollection, QuakeFeature, Timeframe } from "@/lib/types";

const TIMEFRAME_FILES: Record<Timeframe, string> = {
  "30d": "/data/quakes_30d.geojson",
  "5y": "/data/quakes_5y.geojson",
  "50y": "/data/quakes_50y.geojson",
};

export const ALL_REGIONS = "All regions";

interface LoadedState {
  /** Which timeframe `features` belongs to — null until the first load lands. */
  timeframe: Timeframe | null;
  features: QuakeFeature[];
  error: string | null;
}

export function useQuakes(timeframe: Timeframe) {
  const [state, setState] = useState<LoadedState>({
    timeframe: null,
    features: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch(TIMEFRAME_FILES[timeframe])
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: QuakeCollection) => {
        if (cancelled) return;
        setState({ timeframe, features: data.features ?? [], error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to load quakes:", err);
        setState({
          timeframe,
          features: [],
          error: "Could not load earthquake data.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  // Derived rather than stored, so switching timeframe reads as loading on the
  // same render the prop changes — no setState from inside the effect body.
  const loading = state.timeframe !== timeframe;

  return {
    features: state.features,
    loading,
    error: loading ? null : state.error,
  };
}

export function timeOf(f: QuakeFeature): number {
  return new Date(f.properties.time_utc).getTime();
}

export function sortByTimeDesc(features: QuakeFeature[]): QuakeFeature[] {
  return [...features].sort((a, b) => timeOf(b) - timeOf(a));
}

/**
 * The three timeframes span 30 days to 50 years, so a fixed bucket size would
 * produce either one bar or thousands. Each timeframe gets its own grain.
 */
export type Granularity = "day" | "month" | "year";

export const GRANULARITY: Record<Timeframe, Granularity> = {
  "30d": "day",
  "5y": "month",
  "50y": "year",
};

export const GRANULARITY_HEADING: Record<Granularity, string> = {
  day: "Daily activity",
  month: "Monthly activity",
  year: "Yearly activity",
};

export interface PeriodBucket {
  key: string;
  label: string;
  sublabel: string;
  count: number;
  maxMag: number;
}

function bucketKey(d: Date, g: Granularity): string {
  const year = d.getUTCFullYear();
  if (g === "year") return String(year);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  if (g === "month") return `${year}-${month}`;
  return `${year}-${month}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function bucketLabels(d: Date, g: Granularity): { label: string; sublabel: string } {
  if (g === "year") {
    return { label: String(d.getUTCFullYear()), sublabel: "" };
  }
  if (g === "month") {
    return {
      label: MONTHS[d.getUTCMonth()],
      sublabel: String(d.getUTCFullYear()),
    };
  }
  return {
    label: DAYS[d.getUTCDay()],
    sublabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`,
  };
}

export function bucketByPeriod(
  features: QuakeFeature[],
  granularity: Granularity,
  limit = 10
): PeriodBucket[] {
  const buckets = new Map<string, PeriodBucket>();

  for (const f of features) {
    const d = new Date(f.properties.time_utc);
    if (Number.isNaN(d.getTime())) continue;

    const key = bucketKey(d, granularity);
    const existing = buckets.get(key);
    const mag = f.properties.magnitude ?? 0;

    if (existing) {
      existing.count += 1;
      existing.maxMag = Math.max(existing.maxMag, mag);
    } else {
      buckets.set(key, {
        key,
        ...bucketLabels(d, granularity),
        count: 1,
        maxMag: mag,
      });
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => b.key.localeCompare(a.key))
    .slice(0, limit);
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown time";
  return d.toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" });
}

/** "3 hours ago" style stamp — the closest quake equivalent of "as of now". */
export function formatAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;

  return `${Math.floor(months / 12)} yr ago`;
}

/** USGS "significance" (0–1000ish) reads like a scale nobody knows — label it. */
export function significanceLabel(sig: number | null): string {
  if (sig === null) return "Unknown";
  if (sig >= 600) return "Extreme";
  if (sig >= 400) return "High";
  if (sig >= 200) return "Moderate";
  return "Low";
}

export function depthLabel(depthKm: number | null): string {
  if (depthKm === null) return "Unknown";
  if (depthKm < 70) return "Shallow";
  if (depthKm < 300) return "Intermediate";
  return "Deep";
}
