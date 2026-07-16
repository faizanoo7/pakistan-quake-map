"""
Fetch the last 365 days of earthquakes in/around Pakistan from USGS,
tag each with the district it falls in, and write to public/data/quakes.geojson.
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
MIN_MAG = 2.5
LOOKBACK_DAYS = 365

DISTRICTS_FILE = Path("public/data/districts.geojson")
OUT_FILE = Path("public/data/quakes.geojson")
# ───────────────────────────────────────────────────────────────────────


def fetch_from_usgs():
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=LOOKBACK_DAYS)

    params = {
        "format": "geojson",
        "starttime": start.strftime("%Y-%m-%d"),
        "endtime": end.strftime("%Y-%m-%d"),
        "minmagnitude": MIN_MAG,
        **BBOX,
    }

    print(f"Querying USGS: {start.date()} to {end.date()}, min mag {MIN_MAG}...")
    resp = requests.get(USGS_URL, params=params, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    print(f"  → {data['metadata']['count']} events returned")
    return data["features"]


def to_clean_records(features):
    """Flatten USGS features into simple dicts we control."""
    records = []
    for f in features:
        coords = f["geometry"]["coordinates"]  # [lon, lat, depth]
        p = f["properties"]
        records.append({
            "id": f["id"],
            "lon": coords[0],
            "lat": coords[1],
            "depth_km": coords[2],
            "magnitude": p["mag"],
            "place": p["place"],
            "time_utc": datetime.fromtimestamp(p["time"] / 1000, tz=timezone.utc).isoformat(),
            "significance": p.get("sig"),
            "url": p.get("url"),
        })
    return records


def tag_with_districts(records):
    """Spatial join: for each quake point, find the district polygon it's in."""
    districts = gpd.read_file(DISTRICTS_FILE)

    # Build a GeoDataFrame of quake points
    quakes = gpd.GeoDataFrame(
        records,
        geometry=[Point(r["lon"], r["lat"]) for r in records],
        crs="EPSG:4326",
    )

    # Left join keeps every quake, even ones outside Pakistan
    joined = gpd.sjoin(
        quakes, districts[["province", "district", "geometry"]],
        how="left", predicate="within",
    )

    # Fill NaN for quakes outside Pakistan (they're in the buffer around it)
    joined["province"] = joined["province"].fillna("Outside Pakistan")
    joined["district"] = joined["district"].fillna("Outside Pakistan")

    inside = (joined["province"] != "Outside Pakistan").sum()
    print(f"  → {inside} of {len(joined)} events fell inside Pakistan districts")

    return joined


def write_geojson(gdf):
    """Write final GeoJSON, dropping the index_right column sjoin adds."""
    gdf = gdf.drop(columns=["index_right"], errors="ignore")
    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    gdf.to_file(OUT_FILE, driver="GeoJSON")
    size_kb = OUT_FILE.stat().st_size / 1024
    print(f"Wrote {len(gdf)} quakes to {OUT_FILE} ({size_kb:.0f} KB)")


def main():
    features = fetch_from_usgs()
    records = to_clean_records(features)
    tagged = tag_with_districts(records)
    write_geojson(tagged)


if __name__ == "__main__":
    main()