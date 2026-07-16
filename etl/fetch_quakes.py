"""
Fetch earthquakes in/around Pakistan from USGS across three timeframes:
  - Last 30 days   (M2.5+) → recent activity
  - Last 5 years   (M3.5+) → recent patterns for the heatmap
  - Last 50 years  (M4.5+) → historical hotspots and major events

Each event is tagged with the Pakistani district it falls in (or "Outside Pakistan").
Outputs three GeoJSON files into public/data/.
"""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests
import geopandas as gpd
from shapely.geometry import Point

# ─── Config ────────────────────────────────────────────────────────────
USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"

BBOX = {
    "minlatitude": 23.5,
    "maxlatitude": 37.5,
    "minlongitude": 60.5,
    "maxlongitude": 77.5,
}

# Magnitude threshold rises with timeframe length — keeps signal high,
# avoids catalog completeness issues for older/smaller events.
TIMEFRAMES = {
    "30d": {"days": 30,       "min_mag": 2.5, "out": "quakes_30d.geojson"},
    "5y":  {"days": 365 * 5,  "min_mag": 3.5, "out": "quakes_5y.geojson"},
    "50y": {"days": 365 * 50, "min_mag": 4.5, "out": "quakes_50y.geojson"},
}

DISTRICTS_FILE = Path("public/data/districts.geojson")
OUT_DIR = Path("public/data")
# ───────────────────────────────────────────────────────────────────────


def fetch_from_usgs(days: int, min_mag: float):
    """Query USGS FDSN event API for the given lookback window and min magnitude."""
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)

    params = {
        "format": "geojson",
        "starttime": start.strftime("%Y-%m-%d"),
        "endtime": end.strftime("%Y-%m-%d"),
        "minmagnitude": min_mag,
        "orderby": "time",
        **BBOX,
    }

    print(f"  Querying USGS: {start.date()} → {end.date()}, M{min_mag}+ ...")
    resp = requests.get(USGS_URL, params=params, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    print(f"  → {data['metadata']['count']} events returned")
    return data["features"]


def to_clean_records(features):
    """Flatten USGS feature dicts into simple records with fields we control."""
    records = []
    for f in features:
        coords = f["geometry"]["coordinates"]  # [lon, lat, depth_km]
        p = f["properties"]
        # Guard against occasional nulls in old records
        if p.get("mag") is None or coords[0] is None or coords[1] is None:
            continue
        records.append({
            "id": f["id"],
            "lon": coords[0],
            "lat": coords[1],
            "depth_km": coords[2] if len(coords) > 2 else None,
            "magnitude": round(p["mag"], 2),
            "place": p.get("place") or "Unknown",
            "time_utc": datetime.fromtimestamp(
                p["time"] / 1000, tz=timezone.utc
            ).isoformat(),
            "year": datetime.fromtimestamp(p["time"] / 1000, tz=timezone.utc).year,
            "significance": p.get("sig"),
            "url": p.get("url"),
        })
    return records


def tag_with_districts(records, districts):
    """Spatial join each quake point to a Pakistan district polygon."""
    if not records:
        return gpd.GeoDataFrame(
            columns=["id", "magnitude", "place", "time_utc", "province", "district", "geometry"],
            geometry="geometry",
            crs="EPSG:4326",
        )

    quakes = gpd.GeoDataFrame(
        records,
        geometry=[Point(r["lon"], r["lat"]) for r in records],
        crs="EPSG:4326",
    )

    joined = gpd.sjoin(
        quakes,
        districts[["province", "district", "geometry"]],
        how="left",
        predicate="within",
    )

    joined["province"] = joined["province"].fillna("Outside Pakistan")
    joined["district"] = joined["district"].fillna("Outside Pakistan")

    inside = (joined["province"] != "Outside Pakistan").sum()
    print(f"  → {inside} of {len(joined)} events fell inside Pakistan districts")

    return joined.drop(columns=["index_right"], errors="ignore")


def write_geojson(gdf, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    # Overwrite cleanly — geopandas errors if the file exists in some drivers
    if out_path.exists():
        out_path.unlink()
    gdf.to_file(out_path, driver="GeoJSON")
    size_kb = out_path.stat().st_size / 1024
    if size_kb > 1024:
        print(f"  ✓ Wrote {len(gdf)} quakes → {out_path.name} ({size_kb/1024:.1f} MB)")
    else:
        print(f"  ✓ Wrote {len(gdf)} quakes → {out_path.name} ({size_kb:.0f} KB)")


def summarize(gdf, label):
    """Print a quick sanity summary for the timeframe."""
    if len(gdf) == 0:
        print(f"  ⚠ {label}: no events")
        return
    inside = gdf[gdf["province"] != "Outside Pakistan"]
    print(f"\n  Summary [{label}]:")
    print(f"    Total events:            {len(gdf)}")
    print(f"    Inside Pakistan:         {len(inside)}")
    print(f"    Max magnitude:           M{gdf['magnitude'].max():.1f}")
    if len(inside) > 0:
        top = inside["district"].value_counts().head(3)
        top_str = ", ".join(f"{d} ({c})" for d, c in top.items())
        print(f"    Top PK districts:        {top_str}")


def main():
    print(f"Loading districts from {DISTRICTS_FILE}...")
    districts = gpd.read_file(DISTRICTS_FILE)
    print(f"  → {len(districts)} district polygons loaded\n")

    for label, cfg in TIMEFRAMES.items():
        print(f"=== Timeframe: {label} (last {cfg['days']} days, M{cfg['min_mag']}+) ===")
        features = fetch_from_usgs(days=cfg["days"], min_mag=cfg["min_mag"])
        records = to_clean_records(features)
        tagged = tag_with_districts(records, districts)
        write_geojson(tagged, OUT_DIR / cfg["out"])
        summarize(tagged, label)
        print()

    print("Done. Three GeoJSON files written to public/data/.")


if __name__ == "__main__":
    main()