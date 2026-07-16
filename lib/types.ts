export type Timeframe = "30d" | "5y" | "50y";

export interface QuakeProperties {
  id: string;
  magnitude: number;
  depth_km: number | null;
  place: string;
  time_utc: string;
  year: number;
  significance: number | null;
  url: string | null;
  province: string;
  district: string;
}

// GeoJSON feature shape — matches what fetch_quakes.py writes
export interface QuakeFeature {
  type: "Feature";
  properties: QuakeProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
}

export interface QuakeCollection {
  type: "FeatureCollection";
  features: QuakeFeature[];
}
export interface QuakeFilters {
  minMagnitude: number;
  maxMagnitude: number;
  districts: string[];      // empty array = all districts
  startDate: string | null; // ISO date string, null = no lower bound
  endDate: string | null;
}

export const DEFAULT_FILTERS: QuakeFilters = {
  minMagnitude: 0,
  maxMagnitude: 10,
  districts: [],
  startDate: null,
  endDate: null,
};