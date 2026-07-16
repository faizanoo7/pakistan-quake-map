/**
 * Radius and color scaling for quake markers.
 * Radius grows exponentially with magnitude (energy is logarithmic, so this
 * makes bigger events pop visually without dwarfing small ones off the map).
 * Color goes cool → warm as magnitude rises.
 */

export function radiusForMagnitude(mag: number): number {
  // M2 → ~3px, M5 → ~10px, M7 → ~22px, M8 → ~32px
  return Math.max(3, Math.pow(mag, 1.6));
}

export function colorForMagnitude(mag: number): string {
  if (mag >= 7) return "#7f1d1d"; // dark red
  if (mag >= 6) return "#dc2626"; // red
  if (mag >= 5) return "#f97316"; // orange
  if (mag >= 4) return "#eab308"; // yellow
  if (mag >= 3) return "#84cc16"; // lime
  return "#22d3ee";               // cyan for tiny events
}

export function colorForDepth(depthKm: number | null): string {
  // Shallow quakes are more damaging — worth showing depth too
  if (depthKm === null) return "#94a3b8";
  if (depthKm < 30) return "#ef4444";
  if (depthKm < 70) return "#f59e0b";
  if (depthKm < 150) return "#10b981";
  return "#3b82f6";
}