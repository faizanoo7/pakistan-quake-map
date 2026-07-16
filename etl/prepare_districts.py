"""
One-time script: convert GADM Pakistan district shapefile to
simplified GeoJSON for the web app.
"""
import geopandas as gpd
from pathlib import Path

RAW = Path("etl/raw/gadm/gadm41_PAK_3.shp")
OUT = Path("public/data/districts.geojson")

# Load districts
gdf = gpd.read_file(RAW)

# Keep only fields we actually need — drop the rest to shrink file size
gdf = gdf[["NAME_1", "NAME_2", "NAME_3", "geometry"]].rename(
    columns={"NAME_1": "province", "NAME_2": "division", "NAME_3": "district"}
)

# Simplify geometry. Tolerance is in degrees; 0.005 ≈ 500m.
# Good enough for visual boundaries at country zoom.
gdf["geometry"] = gdf["geometry"].simplify(tolerance=0.005, preserve_topology=True)

# Make sure CRS is WGS84 (lat/lon) — Leaflet requires this
gdf = gdf.to_crs(epsg=4326)

OUT.parent.mkdir(parents=True, exist_ok=True)
gdf.to_file(OUT, driver="GeoJSON")

size_kb = OUT.stat().st_size / 1024
print(f"Wrote {len(gdf)} districts to {OUT} ({size_kb:.0f} KB)")