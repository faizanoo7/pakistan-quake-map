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
