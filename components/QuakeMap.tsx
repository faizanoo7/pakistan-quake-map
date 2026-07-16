"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "@/lib/leaflet-setup";
import type { QuakeCollection } from "@/lib/types";
import { radiusForMagnitude, colorForMagnitude } from "@/lib/quake-style";

const PAKISTAN_BOUNDS: LatLngBoundsExpression = [
  [23.5, 60.5],
  [37.5, 77.5],
];

interface Props {
  quakes: QuakeCollection | null;
  loading: boolean;
}

export default function QuakeMap({ quakes, loading }: Props) {
  const [districts, setDistricts] = useState<GeoJSON.GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/data/districts.geojson")
      .then((r) => r.json())
      .then(setDistricts)
      .catch((err) => console.error("Failed to load districts:", err));
  }, []);

  const renderLink = (url: string | null) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-blue-600 hover:underline"
      >
        USGS details
      </a>
    );
  };

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-sm shadow">
          Loading earthquakes…
        </div>
      )}

      <MapContainer
        bounds={PAKISTAN_BOUNDS}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution="OpenStreetMap contributors, CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {districts && (
          <GeoJSON
            data={districts}
            style={{
              color: "#64748b",
              weight: 0.5,
              fillColor: "#f1f5f9",
              fillOpacity: 0.15,
            }}
          />
        )}

        {quakes?.features
          .filter((f) => f.geometry?.coordinates)
          .map((f) => {
            const [lon, lat] = f.geometry.coordinates;
            const mag = f.properties.magnitude;
            return (
              <CircleMarker
                key={f.properties.id}
                center={[lat, lon]}
                radius={radiusForMagnitude(mag)}
                pathOptions={{
                  color: colorForMagnitude(mag),
                  fillColor: colorForMagnitude(mag),
                  fillOpacity: 0.55,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="mb-1 font-semibold">
                      M{mag.toFixed(1)} · {f.properties.place}
                    </div>
                    <div className="text-slate-600">
                      {new Date(f.properties.time_utc).toLocaleString("en-PK", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <div className="text-slate-600">
                      Depth: {f.properties.depth_km?.toFixed(1) ?? "?"} km
                    </div>
                    <div className="text-slate-600">
                      {f.properties.district}, {f.properties.province}
                    </div>
                    {renderLink(f.properties.url)}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
