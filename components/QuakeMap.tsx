"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import "@/lib/leaflet-setup";
import type { QuakeCollection, QuakeFeature } from "@/lib/types";
import { radiusForMagnitude, colorForMagnitude } from "@/lib/quake-style";
import { formatWhen } from "@/lib/quake-data";

const PAKISTAN_BOUNDS: LatLngBoundsExpression = [
  [23.5, 60.5],
  [37.5, 77.5],
];

interface Props {
  quakes: QuakeCollection | null;
  loading: boolean;
  selected?: QuakeFeature | null;
}

/** Pans the map when a quake is picked from one of the surrounding lists. */
function FlyToSelected({ selected }: { selected: QuakeFeature | null }) {
  const map = useMap();

  useEffect(() => {
    if (!selected?.geometry?.coordinates) return;

    const [lon, lat] = selected.geometry.coordinates;
    const zoom = Math.max(map.getZoom(), 7);

    // flyTo is driven by requestAnimationFrame, which never runs for reduced
    // motion or a backgrounded tab — jump instead so the pin is always reached.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      map.setView([lat, lon], zoom, { animate: false });
    } else {
      map.flyTo([lat, lon], zoom, { duration: 0.8 });
    }
  }, [selected, map]);

  return null;
}

export default function QuakeMap({ quakes, loading, selected = null }: Props) {
  const [districts, setDistricts] = useState<GeoJSON.GeoJsonObject | null>(null);

  useEffect(() => {
    fetch("/data/districts.geojson")
      .then((r) => r.json())
      .then(setDistricts)
      .catch((err) => console.error("Failed to load districts:", err));
  }, []);

  const selectedId = selected?.properties.id ?? null;

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-white/95 px-4 py-1 text-xs font-medium shadow">
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

        <FlyToSelected selected={selected} />

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
          .map((f, i) => {
            const [lon, lat] = f.geometry.coordinates;
            const mag = f.properties.magnitude;
            const isSelected = f.properties.id === selectedId;

            return (
              <CircleMarker
                key={`${f.properties.id}-${i}`}
                center={[lat, lon]}
                radius={radiusForMagnitude(mag)}
                pathOptions={{
                  color: isSelected ? "#0b3a5d" : colorForMagnitude(mag),
                  fillColor: colorForMagnitude(mag),
                  fillOpacity: isSelected ? 0.9 : 0.55,
                  weight: isSelected ? 3 : 1,
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="mb-1 font-semibold">
                      M{mag.toFixed(1)} · {f.properties.place}
                    </div>
                    <div className="text-slate-600">
                      {formatWhen(f.properties.time_utc)}
                    </div>
                    <div className="text-slate-600">
                      Depth: {f.properties.depth_km?.toFixed(1) ?? "?"} km
                    </div>
                    <div className="text-slate-600">
                      {f.properties.district}, {f.properties.province}
                    </div>
                    {f.properties.url && (
                      <a
                        href={f.properties.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-blue-600 hover:underline"
                      >
                        USGS details
                      </a>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
