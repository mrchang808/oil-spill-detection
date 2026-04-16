"""
Neft Dashlari (Oil Rocks) - Satellite Image Downloader
=======================================================
Downloads the latest SAR (Sentinel-1) and Optical (Sentinel-2) images
from Copernicus Data Space Ecosystem using Sentinel Hub Process API.

- SAR: Grayscale VV backscatter, sigma0 dB scaling (Sentinel-1 GRD IW)
- Optical: True-color RGB band combination B04/B03/B02 (Sentinel-2 L2A, 10m)

Coordinates (Google Maps):
  Top-left:     40.31021364934206,  50.6749538229896
  Bottom-right: 40.249950697492125, 50.800925373895055
"""

import requests
import json
import os
from datetime import datetime, timedelta, timezone

# ==============================================================================
# CONFIGURATION
# ==============================================================================

CLIENT_ID = "sh-8443ca67-86a9-4dac-abbd-abcfbc52fb06"
CLIENT_SECRET = "lM4jnweUU1LZil8Aj08eYocFoLNYgQUR"

# Bounding box [west, south, east, north] (lon/lat from Google Maps coords)
# Coord 1: lon=50.7201,    lat=40.294454  (NW corner)
# Coord 2: lon=50.940857,  lat=40.174152  (SE corner)
BBOX = [50.7201, 40.174152, 50.940857, 40.294454]

# Output image resolution (pixels)
WIDTH = 2048
HEIGHT = 2048

# Output directory
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# How far back to search for imagery (days)
SEARCH_WINDOW_DAYS = 90

# API endpoints (Copernicus Data Space Ecosystem)
TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"
CATALOG_URL = "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search"

# ==============================================================================
# EVALSCRIPTS
# ==============================================================================

# SAR Evalscript (Sentinel-1 GRD IW)
# - Grayscale VV backscatter
# - Conventional sigma0 to dB conversion: 10 * log10(sigma0)
# - Linear stretch from -25 dB to 0 dB mapped to 0-255 (black to white)
SAR_EVALSCRIPT = """//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["VV"],
      units: "LINEAR_POWER"
    }],
    output: {
      bands: 1,
      sampleType: "UINT8"
    }
  };
}

function evaluatePixel(sample) {
  // Convert linear power (sigma0) to dB
  var sigma0_db = 10.0 * Math.log10(Math.max(sample.VV, 1e-10));

  // Wider dB range for brighter water visibility
  var minDb = -30.0;
  var maxDb = -2.0;
  var val = (sigma0_db - minDb) / (maxDb - minDb);
  val = Math.max(0.0, Math.min(1.0, val));

  // Gamma correction to brighten mid-tones
  val = Math.pow(val, 0.5);

  return [Math.round(val * 255)];
}
"""

# Optical Evalscript (Sentinel-2 L2A)
# - True Color RGB: B04 (Red, 10m), B03 (Green, 10m), B02 (Blue, 10m)
# - Contrast stretch with gain and gamma for enhanced water/structure visibility
OPTICAL_EVALSCRIPT = """//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["B04", "B03", "B02"],
      units: "REFLECTANCE"
    }],
    output: {
      bands: 3,
      sampleType: "UINT8"
    }
  };
}

function stretch(val, minR, maxR) {
  return Math.max(0, Math.min(1, (val - minR) / (maxR - minR)));
}

function evaluatePixel(sample) {
  // Reflectance range for water scenes: ~0.0 to ~0.12
  // Apply per-channel min/max stretch then gamma correction
  var gamma = 0.6;

  var r = Math.pow(stretch(sample.B04, 0.0, 0.15), gamma);
  var g = Math.pow(stretch(sample.B03, 0.0, 0.15), gamma);
  var b = Math.pow(stretch(sample.B02, 0.0, 0.15), gamma);

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
"""

# ==============================================================================
# FUNCTIONS
# ==============================================================================

def get_access_token():
    """Authenticate with Copernicus Data Space and return access token."""
    print("[AUTH] Requesting access token...")
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code != 200:
        print(f"[AUTH] FAILED - Status {response.status_code}")
        print(f"[AUTH] Response: {response.text}")
        raise Exception("Authentication failed. Check your client_id and client_secret.")

    token = response.json()["access_token"]
    print("[AUTH] Token obtained successfully.")
    return token


def search_catalog(token, collection_id, time_from, time_to):
    """Search the Sentinel Hub catalog for available data."""
    print(f"[CATALOG] Searching {collection_id} from {time_from} to {time_to}...")

    payload = {
        "bbox": BBOX,
        "datetime": f"{time_from}T00:00:00Z/{time_to}T23:59:59Z",
        "collections": [collection_id],
        "limit": 10,
        "distinct": "date",
    }

    response = requests.post(
        CATALOG_URL,
        json=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    if response.status_code != 200:
        print(f"[CATALOG] FAILED - Status {response.status_code}")
        print(f"[CATALOG] Response: {response.text}")
        return []

    result = response.json()
    features = result.get("features", [])
    print(f"[CATALOG] Found {len(features)} result(s).")

    if features:
        dates = []
        for f in features:
            if isinstance(f, str):
                # distinct=date returns plain date strings
                dates.append(f)
            elif isinstance(f, dict):
                props = f.get("properties", {})
                dt = props.get("datetime", "unknown")
                dates.append(dt)
        dates.sort(reverse=True)
        print(f"[CATALOG] Available dates: {dates}")
        return dates

    return []


def download_image(token, evalscript, data_collection, time_from, time_to, output_path):
    """Download image using the Sentinel Hub Process API."""
    print(f"[DOWNLOAD] Requesting image for {data_collection}...")
    print(f"[DOWNLOAD] Time range: {time_from} to {time_to}")

    payload = {
        "input": {
            "bounds": {
                "bbox": BBOX,
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/EPSG/0/4326"
                },
            },
            "data": [
                {
                    "type": data_collection,
                    "dataFilter": {
                        "timeRange": {
                            "from": f"{time_from}T00:00:00Z",
                            "to": f"{time_to}T23:59:59Z",
                        },
                        "mosaickingOrder": "mostRecent",
                        **({
                            "maxCloudCoverage": 30
                        } if "S2" in data_collection else {}),
                    },
                    **({
                        "processing": {
                            "upsampling": "BICUBIC",
                            "downsampling": "BICUBIC",
                        }
                    } if "S2" in data_collection else {}),
                }
            ],
        },
        "output": {
            "width": WIDTH,
            "height": HEIGHT,
            "responses": [
                {
                    "identifier": "default",
                    "format": {"type": "image/png"},
                }
            ],
        },
        "evalscript": evalscript,
    }

    # Add Sentinel-1 specific parameters
    if "S1GRD" in data_collection or "sentinel-1" in data_collection.lower():
        payload["input"]["data"][0]["dataFilter"]["acquisitionMode"] = "IW"
        payload["input"]["data"][0]["processing"] = {
            "orthorectify": True,
            "backCoeff": "SIGMA0_ELLIPSOID",
        }

    response = requests.post(
        PROCESS_URL,
        json=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "image/png",
        },
    )

    if response.status_code != 200:
        print(f"[DOWNLOAD] FAILED - Status {response.status_code}")
        print(f"[DOWNLOAD] Response: {response.text[:500]}")
        return False

    # Save the PNG image
    with open(output_path, "wb") as f:
        f.write(response.content)

    size_kb = len(response.content) / 1024
    print(f"[DOWNLOAD] Saved: {output_path} ({size_kb:.1f} KB)")
    return True


def main():
    print("=" * 70)
    print("  NEFT DASHLARI - Satellite Image Downloader")
    print("  SAR (Sentinel-1) & Optical (Sentinel-2)")
    print("=" * 70)
    print()
    print(f"  Bounding Box: {BBOX}")
    print(f"  Output Size:  {WIDTH}x{HEIGHT} px")
    print(f"  Output Dir:   {OUTPUT_DIR}")
    print()

    # -------------------------------------------
    # Step 1: Authenticate
    # -------------------------------------------
    token = get_access_token()
    print()

    # -------------------------------------------
    # Step 2: Determine time range
    # -------------------------------------------
    date_to = datetime.now(timezone.utc)
    date_from = date_to - timedelta(days=SEARCH_WINDOW_DAYS)
    time_from = date_from.strftime("%Y-%m-%d")
    time_to = date_to.strftime("%Y-%m-%d")

    # -------------------------------------------
    # Step 3: Search catalog for available dates
    # -------------------------------------------
    print("-" * 70)
    print("  Searching for SAR (Sentinel-1 GRD) data...")
    print("-" * 70)
    sar_dates = search_catalog(token, "sentinel-1-grd", time_from, time_to)
    print()

    print("-" * 70)
    print("  Searching for Optical (Sentinel-2 L2A) data...")
    print("-" * 70)
    optical_dates = search_catalog(token, "sentinel-2-l2a", time_from, time_to)
    print()

    # -------------------------------------------
    # Step 4: Download SAR image
    # -------------------------------------------
    print("-" * 70)
    print("  Downloading SAR Image (Sentinel-1 GRD)")
    print("  Processing: Grayscale VV, sigma0 dB scaling [-25, 0]")
    print("-" * 70)

    sar_filename = os.path.join(OUTPUT_DIR, "neft_dashlari_SAR_latest.png")
    sar_success = download_image(
        token=token,
        evalscript=SAR_EVALSCRIPT,
        data_collection="S1GRD",
        time_from=time_from,
        time_to=time_to,
        output_path=sar_filename,
    )
    print()

    # -------------------------------------------
    # Step 5: Download Optical image
    # -------------------------------------------
    print("-" * 70)
    print("  Downloading Optical Image (Sentinel-2 L2A)")
    print("  Processing: True Color RGB (B04/B03/B02), brightness enhanced")
    print("-" * 70)

    optical_filename = os.path.join(OUTPUT_DIR, "neft_dashlari_Optical_latest.png")
    optical_success = download_image(
        token=token,
        evalscript=OPTICAL_EVALSCRIPT,
        data_collection="S2L2A",
        time_from=time_from,
        time_to=time_to,
        output_path=optical_filename,
    )
    print()

    # -------------------------------------------
    # Summary
    # -------------------------------------------
    print("=" * 70)
    print("  DOWNLOAD SUMMARY")
    print("=" * 70)
    print(f"  SAR (Sentinel-1):     {'OK - ' + sar_filename if sar_success else 'FAILED'}")
    print(f"  Optical (Sentinel-2): {'OK - ' + optical_filename if optical_success else 'FAILED'}")
    print()

    if sar_dates:
        print(f"  Latest SAR date available:     {sar_dates[0]}")
    if optical_dates:
        print(f"  Latest Optical date available: {optical_dates[0]}")

    print()
    print("  Done!")


if __name__ == "__main__":
    main()
