import type { QuakeFeature, QuakeFilters } from "@/lib/types";

export function applyFilters(
  features: QuakeFeature[],
  filters: QuakeFilters
): QuakeFeature[] {
  return features.filter((f) => {
    const p = f.properties;

    if (p.magnitude < filters.minMagnitude) return false;
    if (p.magnitude > filters.maxMagnitude) return false;

    if (filters.districts.length > 0 && !filters.districts.includes(p.district)) {
      return false;
    }

    if (filters.startDate) {
      if (p.time_utc < filters.startDate) return false;
    }
    if (filters.endDate) {
      if (p.time_utc > filters.endDate) return false;
    }

    return true;
  });
}

export function uniqueDistricts(features: QuakeFeature[]): string[] {
  const set = new Set<string>();
  for (const f of features) {
    if (f.properties.district && f.properties.district !== "Outside Pakistan") {
      set.add(f.properties.district);
    }
  }
  return Array.from(set).sort();
}