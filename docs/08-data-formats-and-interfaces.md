# 08 · Data Formats and Interfaces

> **Purpose:** the reference for every file Drishti3D reads or writes, its coordinate-reference-system policy, the configuration and run-manifest schemas, and the CLI, REST/WebSocket and Python interfaces.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R1 Pipeline Lead (interfaces), R2 Geo & Accuracy Lead (telemetry, CRS, accuracy schema), R3 (output formats), R5 (API consumers) · Normative source: [`00-project-charter.md`](00-project-charter.md)

---

## Table of contents

1. [Conventions](#1-conventions)
2. [Input formats](#2-input-formats)
3. [CRS and height policy](#3-crs-and-height-policy)
4. [Configuration schema](#4-configuration-schema)
5. [Profiles](#5-profiles)
6. [Run manifest schema](#6-run-manifest-schema)
7. [Output formats](#7-output-formats)
8. [CLI reference](#8-cli-reference)
9. [REST and WebSocket API](#9-rest-and-websocket-api)
10. [Python module interfaces](#10-python-module-interfaces)

---

## 1. Conventions

| Topic | Convention |
|---|---|
| Time | All internal timestamps are **UTC**, ISO 8601 with milliseconds (`2026-10-18T05:12:07.118Z`). Video time is PTS in seconds from stream start. |
| Angles | Degrees in files and APIs; radians only inside maths code. Yaw/heading clockwise from true north; pitch positive nose-up; gimbal pitch −90° = nadir. |
| Units | SI (metres, seconds). Pixel coordinates origin top-left, x right, y down. |
| Coordinates | `lat, lon` order in human-readable CSV/JSON; `x=E, y=N, z=up` in projected data. GeoJSON follows RFC 7946 (`lon, lat`). |
| Encoding | UTF-8, LF line endings; CSV with header row, comma separator, `.` decimal. |
| IDs | `run_id` = `YYYYMMDD-HHMMSS-<6 hex>` (UTC), e.g. `20261018-104207-a3f9c1`. Frame IDs = zero-padded source frame index, e.g. `f012345`. |
| Versioning | Every JSON document has `schema_version` (semver). Breaking changes bump the major version. |
| Stage names | S0–S9 and P exactly as in charter §7. |

---

## 2. Input formats

### 2.1 Video

| Property | Supported | Notes |
|---|---|---|
| Containers | MP4, MOV (QuickTime), MPEG-TS (`.ts`, `.m2ts`) | TS required for KLV (STANAG 4609). DJI `.LRF` low-res proxies are rejected with hint to use the full-res file. |
| Codecs | H.264/AVC, H.265/HEVC (8/10-bit) | ProRes/MJPEG decoded if ffmpeg supports; not tested. |
| Resolution | 1920×1080, 2.7K, 3840×2160 (UHD), 4096×2160 (DCI), 5.1K/5.4K | Minimum 1280×720. Keyframes are extracted at full resolution. |
| Frame rate | 23.976–60 fps; VFR supported | Per-frame PTS always used; never assume constant rate. |
| Colour | BT.709 SDR; D-Log / D-Log M / HLG accepted | Log/HLG: a fixed tone curve is applied for feature extraction only; textures keep a mild correction (config `ingest.color`). |
| Rotation | `rotate` side-data honoured | |
| Audio / subtitle / data streams | Ignored, except embedded SRT-like subtitle track (some DJI models) and KLV data streams | |
| Max size | Limited by disk; uploads are chunked | 10 min 4K at ~100–150 Mb/s ≈ 7.5–11 GB (estimate). |

Probe command used by S0 (recorded in `00_ingest/video_info.json`):

```bash
ffprobe -v error -show_streams -show_format -of json -count_packets flight.mp4
```

**`moov` placement.** MP4/MOV files whose `moov` atom is at the end cannot be decoded until fully uploaded; the live preview (P) then starts after upload. TS and "faststart" MP4 allow progressive decoding.

### 2.2 DJI `.SRT` telemetry

DJI drones write a subtitle sidecar (`DJI_0001.SRT`) next to each video (when "Video Subtitles" / "Video Caption" is enabled). Each subtitle block covers one video frame on modern models (≈1 Hz on some older ones). **There is no published specification and layouts vary by model and firmware**; the parser (`drishti/ingest/srt.py`) is layout-tolerant and keeps unknown keys.

#### 2.2.1 Annotated example (modern bracketed layout, e.g. Mavic 3 / Mini 3 Pro / Air 2S family)

The numbers below are illustrative, not from a real flight.

```text
1                                                   ← subtitle index (1-based)
00:00:00,000 --> 00:00:00,033                       ← subtitle time span = frame display time
<font size="28">FrameCnt: 1, DiffTime: 33ms         ← FrameCnt: frame counter; DiffTime: ms since previous entry
2026-10-18 10:42:07.118                             ← LOCAL wall-clock time, NO timezone
[iso: 100] [shutter: 1/1000.0] [fnum: 1.7] [ev: 0] [color_md: default] [focal_len: 24.00] [latitude: 17.445612] [longitude: 78.349871] [rel_alt: 80.100 abs_alt: 612.345] [ct: 5500] </font>

2
00:00:00,033 --> 00:00:00,066
<font size="28">FrameCnt: 2, DiffTime: 33ms
2026-10-18 10:42:07.151
[iso: 100] [shutter: 1/1000.0] [fnum: 1.7] [ev: 0] [color_md: default] [focal_len: 24.00] [latitude: 17.445615] [longitude: 78.349874] [rel_alt: 80.100 abs_alt: 612.345] [ct: 5500] </font>
```

#### 2.2.2 Field dictionary

| Field | Example | Unit / meaning | Used by | Trust / caveats |
|---|---|---|---|---|
| `FrameCnt` (`SrtCnt` on some models) | `1` | Frame counter, 1-based | Frame ↔ entry matching | Primary join key when present |
| `DiffTime` | `33ms` | Time since previous entry | Gap / VFR detection | Rounded to ms |
| Date-time line | `2026-10-18 10:42:07.118` | **Local time of the remote controller / aircraft, no timezone** ([ScienceDirect 2025](https://www.sciencedirect.com/science/article/abs/pii/S2352938525003544)) | Absolute time, RTK/PPK join | Needs `--tz` (default `Asia/Kolkata`, UTC+05:30). Latency vs exposure unmeasured publicly → estimated by S0 time-sync |
| `iso` | `100` | ISO gain | Blur/noise heuristics, exposure comp. | |
| `shutter` | `1/1000.0` | Exposure time (s) | Motion-blur prediction: blur_px ≈ v·t_exp / GSD | |
| `fnum` | `1.7` (or `280` = f/2.8 on some firmware) | Aperture | Metadata only | Scaled integer on some models → normalise |
| `ev` | `0` | Exposure compensation | Exposure-change detection | |
| `color_md` | `default`, `d_log` | Colour profile | Tone mapping choice | |
| `ct` | `5500` | Colour temperature (K) | White-balance drift detection | |
| `focal_len` | `24.00` (or `240` = 24.0 mm on some firmware) | **35 mm-equivalent** focal length (mm) on most models | Intrinsics prior, zoom detection | Not the physical focal length; convert with sensor crop factor from calibration library |
| `dzoom_ratio` | `10000` (= 1.0×) | Digital zoom ×10⁴ | Reject/flag zoom changes | Changing zoom breaks fixed intrinsics → segment split |
| `latitude`, `longitude` | `17.445612`, `78.349871` | WGS 84 degrees | GPS priors, S4 alignment, P | Consumer GNSS; metre-level bias. `0.0, 0.0` = no fix → drop |
| `longtitude` | — | Misspelled key reported in some firmware | Same as `longitude` | Parser accepts both |
| `rel_alt` | `80.100` | Metres above take-off point (barometer-fused) | Altitude prior, preview footprint | Good relative precision, unknown absolute datum |
| `abs_alt` | `612.345` | Metres, "absolute" altitude | Vertical prior (low weight) | **Vertical datum not documented** (MSL-like vs ellipsoidal varies); treat as unknown datum with large σ (open issue OI-03 in `03`) |
| `gb_yaw`, `gb_pitch`, `gb_roll` | `-12.3`, `-60.0`, `0.0` | Gimbal attitude (deg), enterprise models | Rotation priors, roll-about-track (FR-SFM-07) | Present on some enterprise models only |
| `altitude` | `612.3` | Older bracketed layouts | As `abs_alt` | |

#### 2.2.3 Layout variants (non-exhaustive — verify with fixtures per model)

| Variant | Typical models (reported) | Distinguishing features |
|---|---|---|
| **A — bracketed, per-frame** | Mavic 3 family, Mini 3/4 Pro, Air 2S, Air 3 | `FrameCnt`, `[key: value]`, `rel_alt`/`abs_alt` in one bracket |
| **B — bracketed with spaces / scaled ints** | Mavic 2 Pro/Zoom, Mavic Air 2, Mini 2 | `SrtCnt : 1`, `[iso : 100]`, `fnum : 280`, `focal_len : 240`, `longtitude`, `[altitude: …]`; date-time with `,` millisecond separators |
| **C — legacy 1 Hz** | Phantom 3/4 (early firmware), Mavic Pro | `HOME(lon,lat)`, `GPS(lon,lat,n)`, `BAROMETER:80.1`, `ISO:100 Shutter:60 EV:0 Fnum:F2.2`; one entry per second; **lon before lat**; meaning of the third `GPS` value differs by firmware |
| **D — enterprise** | M30/M30T, Mavic 3 Enterprise, Matrice 4 series | Adds gimbal angles, zoom ratio, sometimes RTK status; may embed telemetry in the MP4 instead of / in addition to SRT |

Parsing notes:

1. Strip `<font …>` / `</font>` HTML tags and any `<…>` markup before tokenising.
2. Tokenise with a tolerant regex: `\[?\s*([A-Za-z_]+)\s*:\s*([^\]\s]+)` plus special cases for `rel_alt: x abs_alt: y`, `GPS(…)`, `HOME(…)`, `BAROMETER:`.
3. Join to frames by `FrameCnt` if present; otherwise by subtitle start time → nearest PTS; for 1 Hz layouts interpolate position linearly (lat/lon/alt) and slerp for attitudes.
4. Convert local time to UTC using `--tz`; record the assumption in the manifest. If the RTK `.pos` exists, verify the offset (whole hours/half-hours) by matching trajectories.
5. Reject entries with `latitude == 0 && longitude == 0`, jumps > `ingest.max_gps_jump_m` (default 50 m between consecutive frames), and non-monotonic times (warning W-ING-02).
6. Output: `00_ingest/telemetry.csv` (normalised; see below) and parser report with layout variant detected.

Normalised telemetry CSV (`00_ingest/telemetry.csv`), one row per video frame:

```csv
frame_idx,pts_s,utc,lat,lon,alt_rel_m,alt_abs_m,alt_datum,gimbal_yaw,gimbal_pitch,gimbal_roll,focal_35mm,zoom,iso,shutter_s,ev,src,interp
0,0.000,2026-10-18T05:12:07.118Z,17.445612,78.349871,80.100,612.345,unknown,,,,24.00,1.0,100,0.001,0,srt,0
1,0.033,2026-10-18T05:12:07.151Z,17.445615,78.349874,80.100,612.345,unknown,,,,24.00,1.0,100,0.001,0,srt,0
```

`utc` includes the **time offset** estimated by S0 (`timesync.json`), which is applied *after* the raw parse so both raw and corrected times are auditable.

### 2.3 KLV — MISB ST 0601 (STANAG 4609 full-motion video)

Military/defence FMV carries metadata as KLV (Key-Length-Value) packets in an MPEG-TS data stream (stream type `0x15` synchronous metadata or `0x06` private data with `KLVA` registration). Drishti3D demuxes the data PID with ffmpeg and decodes packets with `klvdata` ([PyPI](https://pypi.org/project/klvdata/)).

```bash
ffmpeg -i fmv.ts -map 0:d:0 -c copy -f data 00_ingest/metadata.klv
```

- **Universal Label (UAS Datalink Local Set):** `06 0E 2B 34 02 0B 01 01 0E 01 03 01 01 00 00 00`.
- Values are integer-mapped (IMAPB-style linear mapping from integer range to physical range); the most negative integer is commonly reserved as an "error/out of range" sentinel.
- **Implementation must be verified against the latest ST 0601 revision** (tag list below is the subset we consume).

| Tag | Name | Physical unit / range | Encoding (typical) | Drishti3D use |
|---|---|---|---|---|
| 1 | Checksum | — | uint16 | Packet integrity (reject on mismatch) |
| 2 | Precision Time Stamp | µs since 1970-01-01 UTC | uint64 | **Primary time base** (UTC; no timezone issue) |
| 3 | Mission ID | text | ISO 646 string | Manifest |
| 5 | Platform Heading Angle | 0…360° | uint16 | Attitude prior |
| 6 | Platform Pitch Angle | ±20° | int16 | Attitude prior (superseded by 90 if present) |
| 7 | Platform Roll Angle | ±50° | int16 | Attitude prior (superseded by 91 if present) |
| 10 | Platform Designation | text | string | Camera library lookup |
| 11 | Image Source Sensor | text (e.g. "EO Nose") | string | Camera library lookup / EO vs IR |
| 13 | Sensor Latitude | ±90° | int32 | Position prior |
| 14 | Sensor Longitude | ±180° | int32 | Position prior |
| 15 | Sensor True Altitude | −900…19,000 m **MSL** | uint16 | Vertical prior (orthometric) |
| 16 | Sensor Horizontal FoV | 0…180° | uint16 | Intrinsics prior: fx = (W/2)/tan(HFOV/2) |
| 17 | Sensor Vertical FoV | 0…180° | uint16 | Intrinsics check |
| 18 | Sensor Relative Azimuth Angle | 0…360° | uint32 | Sensor-to-platform rotation |
| 19 | Sensor Relative Elevation Angle | ±180° | int32 | Sensor-to-platform rotation |
| 20 | Sensor Relative Roll Angle | 0…360° | uint32 | Sensor-to-platform rotation |
| 21 | Slant Range | m | uint32 | Scale sanity check |
| 23 | Frame Center Latitude | ±90° | int32 | Preview footprint, registration seed |
| 24 | Frame Center Longitude | ±180° | int32 | Preview footprint, registration seed |
| 25 | Frame Center Elevation | −900…19,000 m MSL | uint16 | DSM sanity check |
| 26–33 | Offset Corner Lat/Lon Points 1–4 | small offsets from frame centre | int16 | Preview footprint |
| 65 | UAS Datalink LS Version Number | integer | uint8 | Decoder selection |
| 75 | Sensor Ellipsoid Height | −900…19,000 m **HAE** | uint16 | Preferred vertical prior (ellipsoidal) |
| 78 | Frame Center Height Above Ellipsoid | m HAE | uint16 | DSM check |
| 90 | Platform Pitch Angle (Full) | ±90° | int32 | Attitude prior |
| 91 | Platform Roll Angle (Full) | ±90° | int32 | Attitude prior |

Camera attitude in the world frame is composed as **R_world←cam = R(platform heading, pitch, roll) · R(sensor relative azimuth, elevation, roll) · R_cam←sensor**; the rotation order is implemented and unit-tested in `ingest/klv.py` against a sample STANAG 4609 file. KLV packets are asynchronous to frames; S0 interpolates to each frame PTS using the Precision Time Stamp ↔ PTS mapping.

### 2.4 RTK / PPK solution (optional)

Accepted formats: **RTKLIB `.pos`** (primary), Emlid/REDtoolbox CSV (mapped), generic CSV.

```text
% program   : RTKLIB ver.2.4.3 b34
% pos mode  : Kinematic
% elev mask : 15.0 deg
% ref pos   : 17.401234567  78.456789012   498.1234
% (lat/lon/height=WGS84/ellipsoidal,Q=1:fix,2:float,3:sbas,4:dgps,5:single,6:ppp,ns=# of satellites)
%  GPST                  latitude(deg) longitude(deg)  height(m)   Q  ns   sdn(m)   sde(m)   sdu(m)  sdne(m)  sdeu(m)  sdun(m) age(s)  ratio
2026/10/18 05:12:25.000   17.445612345   78.349871234   470.1234   1  18   0.0071   0.0058   0.0163  -0.0021   0.0017  -0.0045   1.00   45.3
2026/10/18 05:12:25.200   17.445614101   78.349872998   470.1241   1  18   0.0071   0.0058   0.0163  -0.0021   0.0017  -0.0045   1.20   44.9
```

| Column | Use | Notes |
|---|---|---|
| `GPST` | Time | **GPS time, not UTC** (GPS − UTC = 18 s since 2017); converted by S0 |
| `latitude/longitude/height` | Camera-centre prior after lever-arm | Height is **ellipsoidal** (WGS 84) |
| `Q` | Quality | Only `Q=1` (fix) used with σ from `sdn/sde/sdu`; `Q=2` (float) down-weighted ×10; others dropped |
| `sdn, sde, sdu` | Prior σ | Floored at `georef.rtk.min_sigma_m` (default 0.02 m) |
| `ratio` | Ambiguity ratio | < 3 → treat as float |

Video frames have no camera event marks, so RTK positions are interpolated to frame UTC **after** time-sync (§2.2 step 4). Lever arm (antenna → camera) comes from `configs/cameras/<model>.yaml` or `--set georef.lever_arm_m=[x,y,z]` in body frame (x forward, y right, z down).

### 2.5 IMU / attitude CSV (optional)

```csv
utc,roll_deg,pitch_deg,yaw_deg,gyro_x,gyro_y,gyro_z,acc_x,acc_y,acc_z,baro_alt_m
2026-10-18T05:12:07.100Z,1.20,-3.40,152.10,,,,,,,80.05
```

| Column | Required | Unit |
|---|---|---|
| `utc` | yes | ISO 8601 UTC (or `gps_s` column with GPS seconds of week + `gps_week`) |
| `roll_deg, pitch_deg, yaw_deg` | yes (attitude) | degrees, aircraft body, yaw from true north |
| `gyro_*`, `acc_*` | optional | rad/s, m/s² body frame — reserved for future VIO fusion |
| `baro_alt_m` | optional | metres relative to take-off |

DJI flight logs (`.txt`/`.DAT`) must be converted to this CSV by an external tool before ingest (conversion is not part of the offline bundle).

### 2.6 Camera intrinsics YAML (optional)

```yaml
# configs/cameras/dji_mavic3_hasselblad_4k.yaml
schema_version: "1.0"
camera_id: dji_mavic3_hasselblad_4k
make: DJI
model: Mavic 3
image_size: [3840, 2160]          # must match the video stream (after rotation)
model_type: OPENCV                # COLMAP camera model: SIMPLE_RADIAL | RADIAL | OPENCV | FULL_OPENCV
params:                           # COLMAP OPENCV order: fx, fy, cx, cy, k1, k2, p1, p2
  fx: 2765.4
  fy: 2765.9
  cx: 1918.7
  cy: 1081.2
  k1: -0.1123
  k2: 0.0457
  p1: 0.0003
  p2: -0.0002
focal_35mm_equiv: 24.0            # to map SRT focal_len
sensor_crop_factor: 1.0           # 35 mm-equivalent / physical focal ratio for video mode
rolling_shutter:
  enabled: true
  readout_time_s: 0.030           # full-frame readout; measure or take from vendor/ODM profile
  direction: top_to_bottom
lever_arm_m: [0.05, 0.00, 0.08]   # GNSS antenna → camera centre, body frame (x fwd, y right, z down)
calibration:
  method: checkerboard            # checkerboard | charuco | prior_flight | vendor
  date: 2026-10-10
  rms_px: 0.31
  notes: "Video mode 4K 30 fps, focus at infinity, stabiliser on"
```

The values above are **placeholders** for illustration, not a real calibration. Resolution-mode matters: 4K and 1080p modes may use different sensor crops; calibrate per mode.

### 2.7 GCP / checkpoint CSV

One file can hold both GCPs (used for anchoring) and checkpoints (used only for QA), distinguished by `role`.

```csv
id,role,crs,x,y,z,height_type,sigma_xy_m,sigma_z_m,survey_method,survey_date,description
GCP01,GCP,EPSG:32644,219512.408,1930987.114,531.842,orthometric_egm2008,0.015,0.025,RTK-CORS,2026-10-18,"Painted L-mark, NE corner of parking"
CP01,CP,EPSG:32644,219634.227,1931102.559,532.117,orthometric_egm2008,0.015,0.025,RTK-CORS,2026-10-18,"Road marking corner"
CP02,CP,EPSG:4326,17.4461203,78.3502281,470.305,ellipsoidal,0.015,0.025,RTK-CORS,2026-10-18,"Manhole centre"
```

| Column | Type | Rules |
|---|---|---|
| `id` | string | Unique within file |
| `role` | `GCP` \| `CP` | CP IDs are **never** used in processing (enforced; FR-GEO-04) |
| `crs` | EPSG code | `EPSG:4326` (x=lat, y=lon in this CSV) or projected EPSG (x=E, y=N) |
| `x, y, z` | float | z in metres |
| `height_type` | `ellipsoidal` \| `orthometric_egm2008` \| `orthometric_egm96` | Mandatory — no silent assumption |
| `sigma_xy_m`, `sigma_z_m` | float | Survey precision; ASPRS Ed. 2 expects checkpoints ≥ 2× more accurate than the product |
| `survey_method` | string | e.g. `RTK-CORS`, `PPK`, `total-station`, `DGPS` |
| `survey_date`, `description` | string | For the report |

Coordinates in the example are illustrative (UTM zone 44N, near Hyderabad). Optional **distance-pair CSV** for relative accuracy: `from_id,to_id,measured_length_m,sigma_m,method` (or free endpoints `x1,y1,z1,x2,y2,z2`).

### 2.8 Reference orthophoto / DSM (anchoring)

| Property | Reference orthophoto | Reference DSM |
|---|---|---|
| Format | GeoTIFF / COG (single file or VRT mosaic) | GeoTIFF / COG, Float32 |
| CRS | Any EPSG-defined CRS (reprojected by S4) | Any; **vertical datum must be declared** in metadata or via `--ref-dsm-vdatum` |
| Resolution | ≤ 1 m GSD required; ≤ 0.5 m recommended | Posting ≤ 5 m required; ≤ 1 m recommended |
| Coverage | ≥ 50 % of flight footprint; ideally 100 % + 100 m margin | Same |
| Accuracy | Known and documented (CE90); it bounds our anchored accuracy | Known LE90 |
| Recency | Ideally < 2 years; seasonal/vegetation change tolerated by robust registration | Built-up areas change → masked by S2 semantics |
| Bands | RGB or panchromatic, 8/16-bit | 1 band, NoData set |
| Sources | NTRO/SoI-supplied, Bhuvan-derived, own prior flights (licensing checked) | CartoDEM/SRTM too coarse for vertical ≤ 1 m; use high-res DSM when available |

S4 records the reference's stated accuracy in `anchoring.json`; the accuracy report states that anchored accuracy cannot be better than the reference accuracy combined with registration residual.

---

## 3. CRS and height policy

| Context | CRS | Heights | EPSG |
|---|---|---|---|
| Input telemetry (SRT, KLV 13/14, RTK) | WGS 84 geographic | SRT `abs_alt`: unknown datum; KLV 15: MSL; KLV 75 / RTK: ellipsoidal | 4326 / 4979 |
| **Processing (S3–S9)** | **WGS 84 / UTM zone of scene centroid** (auto), local offset subtracted for float precision | **Ellipsoidal** internally | 326zz (e.g. **32643** for 72–78° E, **32644** for 78–84° E) |
| Deliverable rasters & LAS | Same UTM zone | **Orthometric, EGM2008** (default) or EGM96 (option) as compound CRS | e.g. `EPSG:32644+3855` (EGM2008) / `+5773` (EGM96) |
| 3D Tiles / GLB for Cesium | ECEF (tile transforms), ellipsoidal | Ellipsoidal (Cesium convention) | 4978 |
| Preview tiles | Web Mercator | — | 3857 |
| API/UI display | WGS 84 lat/lon + UTM E/N; heights labelled "MSL (EGM2008)" or "ellipsoidal" | | |

Rules:

1. **UTM zone selection:** `zone = floor((lon_centroid + 180) / 6) + 1`; mainland India spans zones 42N–47N. If the footprint crosses a zone boundary, the zone of the centroid is used (no split). Override: `--set georef.processing_crs=EPSG:32643`.
2. **Geoid:** EGM2008 grid (`us_nga_egm08_25.tif`) and EGM96 grid (`us_nga_egm96_15.tif`) are bundled for PROJ (offline). N = h − H (ellipsoidal minus orthometric).
3. **Every output declares** horizontal CRS (WKT2), vertical datum, and the geoid model; LAS via WKT VLR, COG via GeoKeys + `AREA_OR_POINT` + a JSON sidecar, 3D Tiles via `asset.extras.drishti`.
4. Indian national datums (e.g. Everest 1830-based legacy maps) are only supported through explicit EPSG codes provided by the user; no implicit datum shifts.
5. Round-trip tests ensure < 1 mm error for 4326 ↔ 326zz ↔ 4978 (FR-GEO-06).

---

## 4. Configuration schema

Configuration is YAML, validated by Pydantic models in `drishti/config.py`. Resolution order (later wins): `configs/default.yaml` → `configs/<profile>.yaml` → `--config user.yaml` → `--set key=value` overrides. The merged result is written to `config.resolved.yaml` in the run directory.

### 4.1 Full `configs/default.yaml`

```yaml
# Drishti3D default configuration — schema 1.0
# Values marked (est.) are engineering estimates to be tuned on golden datasets.
schema_version: "1.0"

run:
  profile: fast                  # preview | fast | quality
  out_root: data/runs
  keep_intermediate: true        # false → delete 01_frames/images etc. after S9
  resume: true                   # skip stages with matching fingerprint
  seed: 42
  timezone: Asia/Kolkata         # for DJI SRT local times
  stages:                        # stage enable switches
    S0_ingest: true
    S1_frames: true
    S2_masking: true
    S3_sfm: true
    S4_georef: true
    S5_dense: true
    S6_completion: true
    S7_splat: false              # optional photoreal layer (display only)
    S8_export: true
    S9_qa: true
    P_preview: true

resources:
  gpu_ids: [0]
  max_gpu_mem_gb: 11             # NFR-PERF-04
  max_ram_gb: 48                 # NFR-PERF-05
  cpu_workers: 8
  min_free_disk_factor: 5.0      # × input video size (est.)
  stage_timeouts_s:              # hard timeouts per stage (fast profile budgets, est.)
    S0_ingest: 120
    S1_frames: 180
    S2_masking: 240
    S3_sfm: 600
    S4_georef: 120
    S5_dense: 900
    S6_completion: 120
    S8_export: 180
    S9_qa: 120

ingest:
  telemetry: auto                # auto | srt | klv | gpx | csv | none
  srt:
    layout: auto                 # auto | A | B | C | D
    max_gps_jump_m: 50
    drop_zero_fix: true
  klv:
    data_stream: auto            # ffmpeg stream specifier, e.g. "0:d:0"
    ul: "060E2B34020B01010E01030101000000"
    validate_checksum: true
  timesync:
    enabled: true
    method: velocity_xcorr       # velocity_xcorr | none
    search_window_s: 2.0
    refine_after_sfm: true
    min_peak_ratio: 1.5          # below → warning W-SYNC-01, offset=0
  color:
    log_profile_tonemap: auto
  overlays:
    detect_static_overlay: true
    letterbox_detect: true
  camera_library: configs/cameras

frames:
  target_fps: 1.0                # fast: ~1 keyframe/s (report: 1–2 fps ≈ 600–1,200 frames per 10 min)
  max_frames: 900
  min_frames: 30
  parallax:
    target_overlap: 0.85         # forward overlap target
    min_flow_px: 20              # at 1080p-normalised scale (est.)
  blur:
    method: var_laplacian
    window_s: 1.0                # choose sharpest in each window
    reject_below_ratio: 0.6      # vs rolling median (est.)
  hover:
    max_interval_s: 5.0
  shot_cut:
    enabled: true
    threshold: 0.4
  max_gap_s: 3.0
  image_format: jpg
  jpeg_quality: 95

masking:
  dynamic:
    enabled: true
    detector: yolo_seg           # yolo_seg | none   (Ultralytics AGPL — see 07)
    detector_weights: models/yolo/yolo-seg-aerial.pt
    classes: [car, truck, bus, motorcycle, bicycle, person, animal]
    conf_threshold: 0.35
    dilate_px: 8
  segmenter:
    enabled: true
    model: sam2                  # sam2 | none   (Apache-2.0)
    weights: models/sam2/sam2_hiera_small.pt
    temporal_propagation: false  # FR-MSK-04 (Could)
  sky: true
  semantic:
    enabled: true
    classes: [ground, building, road, vegetation, water, vehicle, person, other]
  budget_s: 90                   # fallback to detector-only above this (FR-MSK-06, est.)

sfm:
  engine: colmap                 # colmap | dpvo_fallback
  mapper: global                 # global (GLOMAP in COLMAP 4.x) | incremental
  features:
    type: aliked                 # aliked | superpoint (non-commercial weights) | sift
    max_keypoints: 4096
    resize_max_px: 1600
  matching:
    matcher: lightglue
    sequential_overlap: 15       # neighbours in time
    gps_neighbours: 20           # spatial neighbours via GPS
    gps_radius_m: 150
    loop_detection: false        # single pass: no revisits
  priors:
    use_gps: true
    gps_sigma_m: [3.0, 3.0, 5.0] # consumer GNSS; RTK overrides
    use_gravity: true
    use_gimbal: true
  intrinsics:
    source: library              # library | file | metadata | self_calibrate
    refine_focal: false
    refine_principal_point: false
    refine_distortion: false     # never true on near-nadir strips (ADR-011)
    focal_tolerance: 0.02        # when refine_focal is enabled
  rolling_shutter:
    enabled: auto                # auto → from camera library
  split:
    enabled: auto
    chunk_frames: 600
    overlap_frames: 50
  min_registered_ratio: 0.70     # below → fallback (FR-SFM-06)
  ba:
    gpu: true
    max_iterations: 100

georef:
  processing_crs: auto           # auto → UTM zone of centroid
  vertical_output: egm2008       # egm2008 | egm96 | ellipsoidal
  align:
    method: umeyama_robust
    robust_loss: huber
    huber_delta_m: 3.0
    subsample_hz: 1.0
    ransac_iterations: 500
  anchoring:
    order: [rtk, gcp, ref_ortho_dsm, corrected_track, gnss_only]
    ref_registration:
      ortho_gsd_m: 0.5
      method: feature_ncc        # feature_ncc | mutual_information
      dsm_vertical: robust_median  # robust_median | icp_z
      min_inlier_ratio: 0.3
      max_rotation_deg: 2.0
      max_scale_change: 0.01
    gcp:
      max_used: 3                # "without extensive GCPs"
  rtk:
    min_sigma_m: 0.02
    accept_float: false
  lever_arm_m: auto              # auto → camera library
  collinearity_pca_ratio: 0.02   # below → strip considered collinear (roll from gimbal/gravity)

dense:
  engine: openmvs
  resolution_level: 2            # 0=full, 1=half, 2=quarter (fast)
  max_resolution_px: 2560
  min_views: 2
  number_views_fuse: 3
  mesh:
    decimate: 0.5
    refine: false                # quality: true
    texture:
      resolution_level: 1
      seam_leveling: true
      exposure_compensation: true
  rasters:
    gsd_m: auto                  # auto → 2 × native GSD (est.)
    dsm_method: max              # max | idw
    ortho_from: mesh             # mesh | points
  tiles:
    enabled: auto                # spatial tiling for large scenes
    tile_size_m: 250

completion:
  classify:
    method: rules_plus_semantic  # height-above-DTM + S2 labels
    ground_filter: smrf          # smrf | csf (PDAL)
    veg_height_bands_m: [0.5, 2.0]   # low <0.5, medium 0.5–2, high >2
  lod2:
    enabled: true
    min_roof_area_m2: 20
    plane_ransac_threshold_m: 0.15
    extrude_to: dtm
    flag_inferred: true          # always true; cannot be disabled in production

splat:
  engine: gsplat
  iterations: 15000
  exposure_compensation: true
  priority: background
  export: [ply, glb_khr]

export:
  formats: [laz, cog, obj, glb, tiles3d]   # add: las, ply, fbx
  las:
    version: "1.4"
    point_format: 7
    extra_bytes: [confidence, conf_class, n_views, tri_angle_deg]
  cog:
    compress_float: DEFLATE
    predictor_float: 3
    compress_rgb: JPEG
    jpeg_quality: 90
    blocksize: 512
    overviews: auto
  obj:
    local_offset: true           # coordinates relative to offset.json
  tiles3d:
    version: "1.1"
    mesh_max_triangles_per_tile: 100000
    pointcloud: true
    geometric_error_root_m: auto
  bundle:
    zip: true
    checksums: sha256

qa:
  checkpoints_file: null
  distance_pairs_file: null
  asprs_min_checkpoints: 30
  ce90_factor: 2.146             # × per-axis RMSE (valid when RMSE_x ≈ RMSE_y); computed as 1.5175 × RMSE_H
  le90_factor: 1.6449            # × RMSE_z
  doming:
    enabled: auto                # requires reference DSM or LiDAR
    detrend: plane
    profile_spacing_m: 10
  confidence:
    high:                        # observed-high thresholds (est.)
      min_views: 3
      min_tri_angle_deg: 5.0
      max_reproj_px: 1.0
    low:
      min_views: 2
  completeness:
    footprint_from: telemetry_fov
  report:
    formats: [html, pdf, json]
    language: en

preview:
  enabled: true
  fps: 1.0
  frame_max_px: 1024
  zoom_levels: [14, 19]
  refine_homography: true
  tile_format: webp
  device: cpu

logging:
  level: INFO
  json: true
  resource_sample_s: 5
```

### 4.2 Validation rules (selected)

| Rule | Error |
|---|---|
| `sfm.intrinsics.refine_distortion == true` while strip is collinear | Warning W-SFM-02 (doming risk); **error** in `production` mode |
| `completion.lod2.flag_inferred == false` | Error E-CFG-03 (honesty policy) |
| `georef.anchoring.gcp.max_used > 5` | Warning (conflicts with "without extensive GCPs") |
| Weight file missing or checksum mismatch | Error E-SYS-04 |
| `sfm.features.type == superpoint` | Warning W-LIC-01 (non-commercial weights) |

---

## 5. Profiles

Profile files override `default.yaml`. Values are targets/estimates.

| Key | `preview` | `fast` (default) | `quality` |
|---|---|---|---|
| Purpose | 2D mosaic only, seconds | Full metric product ≤ 15 min (10-min 4K) | Max detail, no time limit |
| Stages | S0, S1, P | S0–S6, S8, S9 (+S7 off) | S0–S9 incl. S7 |
| `frames.target_fps` / `max_frames` | 0.5 / 300 | 1.0 / 900 | 2.0 / 2,400 |
| `masking.segmenter.enabled` | false | true (budgeted) | true + temporal propagation |
| `sfm.features.max_keypoints` | — | 4096 | 8192 |
| `dense.resolution_level` | — | 2 | 0–1 |
| `dense.mesh.refine` | — | false | true |
| `completion.lod2.enabled` | — | true | true |
| `export.formats` | preview tiles | laz, cog, obj, glb, tiles3d | + las, ply, fbx |

```yaml
# configs/quality.yaml (excerpt)
run: { profile: quality, stages: { S7_splat: true } }
frames: { target_fps: 2.0, max_frames: 2400 }
masking: { segmenter: { temporal_propagation: true } }
sfm: { features: { max_keypoints: 8192 } }
dense: { resolution_level: 1, mesh: { refine: true, texture: { resolution_level: 0 } } }
export: { formats: [laz, las, cog, obj, glb, ply, fbx, tiles3d] }
```

---

## 6. Run manifest schema

`data/runs/<run_id>/manifest.json` is the authoritative record of a run (ADR-009 in [`04-system-architecture.md`](04-system-architecture.md)). It is updated atomically (write temp + rename) after every stage.

### 6.1 Example

```json
{
  "schema_version": "1.0.0",
  "run_id": "20261018-104207-a3f9c1",
  "created_at": "2026-10-18T10:42:07.512Z",
  "updated_at": "2026-10-18T10:55:31.004Z",
  "status": "succeeded_with_warnings",
  "profile": "fast",
  "software": {
    "drishti": "1.0.0+g1a2b3c4",
    "colmap": "4.x (pinned)",
    "openmvs": "2.x (pinned)",
    "gdal": "3.x", "pdal": "2.x",
    "cuda": "12.x",
    "image_digest": "sha256:9f1c…"
  },
  "host": { "gpu": "NVIDIA GeForce RTX 4090 24GB", "ram_gb": 64, "os": "Ubuntu 24.04" },
  "command": "drishti run --video inputs/DJI_0001.MP4 --srt inputs/DJI_0001.SRT --ref-ortho inputs/ref_ortho.tif --gcp inputs/points.csv --profile fast --out data/runs/20261018-104207-a3f9c1",
  "config": { "file": "config.resolved.yaml", "sha256": "4be1…" },
  "inputs": [
    { "role": "video", "path": "inputs/DJI_0001.MP4", "sha256": "0c7d…", "bytes": 7812345678,
      "info": { "codec": "hevc", "width": 3840, "height": 2160, "fps": 29.97, "duration_s": 600.2, "frames": 17988 } },
    { "role": "telemetry_srt", "path": "inputs/DJI_0001.SRT", "sha256": "a19e…", "layout": "A", "entries": 17988, "timezone_assumed": "Asia/Kolkata" },
    { "role": "ref_ortho", "path": "inputs/ref_ortho.tif", "sha256": "77aa…", "gsd_m": 0.3, "stated_ce90_m": 0.5 },
    { "role": "points", "path": "inputs/points.csv", "sha256": "e0f2…", "gcp_count": 1, "checkpoint_count": 32 }
  ],
  "crs": {
    "processing": "EPSG:32644",
    "output_horizontal": "EPSG:32644",
    "output_vertical": "EGM2008 (EPSG:3855)",
    "local_offset_m": [219000.0, 1930000.0, 0.0]
  },
  "stages": [
    { "id": "S0", "name": "ingest", "status": "done", "duration_s": 31.2, "fingerprint": "s0:3c9a…",
      "metrics": { "time_offset_s": -0.267, "time_offset_sigma_s": 0.018, "gps_gaps": 0 }, "warnings": [] },
    { "id": "S1", "name": "frames", "status": "done", "duration_s": 58.4,
      "metrics": { "keyframes": 842, "rejected_blur": 131, "hover_segments": 2 } },
    { "id": "S2", "name": "masking", "status": "done", "duration_s": 83.0,
      "metrics": { "masked_pixel_ratio": 0.021, "segmenter": "sam2" } },
    { "id": "S3", "name": "sfm", "status": "done", "duration_s": 231.7,
      "metrics": { "registered": 836, "registered_ratio": 0.993, "reproj_rmse_px": 0.71, "points3d": 412339, "rolling_shutter": true, "chunks": 2 } },
    { "id": "S4", "name": "georef", "status": "done", "duration_s": 22.9,
      "metrics": { "placement_tier": "anchored_ref_ortho", "sim3_scale": 1.00082, "gnss_fit_rmse_m": 1.84,
                   "anchor_shift_m": [1.21, -1.77, -3.62], "registration_inliers": 0.58 } },
    { "id": "S5", "name": "dense", "status": "done", "duration_s": 318.5,
      "metrics": { "dense_points": 38211045, "mesh_faces": 4000000, "gsd_m": 0.05 } },
    { "id": "S6", "name": "completion", "status": "done", "duration_s": 29.1,
      "metrics": { "buildings_lod2": 57, "inferred_area_ratio": 0.064 } },
    { "id": "S7", "name": "splat", "status": "skipped" },
    { "id": "S8", "name": "export", "status": "done", "duration_s": 61.0 },
    { "id": "S9", "name": "qa", "status": "done", "duration_s": 12.4,
      "metrics": { "ce90_m": 0.69, "le90_m": 0.87, "n_checkpoints": 32, "completeness": 0.93 },
      "warnings": [ { "code": "W-QA-03", "msg": "Doming test skipped: no reference DSM supplied" } ] },
    { "id": "P", "name": "preview", "status": "done", "first_tile_s": 41.8 }
  ],
  "timing": { "total_s": 848.2, "critical_path_s": 848.2, "first_visual_s": 41.8 },
  "summary": {
    "placement_tier": "anchored_ref_ortho",
    "accuracy_report": "09_qa/accuracy.json",
    "headline": "CE90 0.69 m / LE90 0.87 m on 32 independent checkpoints (anchored); GNSS-only CE90 3.37 m"
  },
  "artifacts": [
    { "id": "pointcloud_laz", "path": "08_export/pointcloud/20261018-104207-a3f9c1.laz", "type": "application/vnd.laszip", "bytes": 412345678, "sha256": "…" },
    { "id": "tiles_mesh", "path": "08_export/tiles/mesh/tileset.json", "type": "application/json" },
    { "id": "ortho", "path": "08_export/rasters/ortho.tif", "type": "image/tiff; application=geotiff; profile=cloud-optimized" },
    { "id": "report_pdf", "path": "09_qa/report.pdf", "type": "application/pdf" }
  ],
  "warnings": [ { "code": "W-QA-03", "stage": "S9" } ],
  "errors": []
}
```

**All metric values in this example are invented placeholders** to illustrate the schema; they are not results.

### 6.2 Field reference (top level)

| Field | Type | Description |
|---|---|---|
| `schema_version` | string | Manifest schema version |
| `run_id` | string | See §1 |
| `status` | enum | `created`, `queued`, `running`, `cancelling`, `succeeded`, `succeeded_with_warnings`, `failed`, `interrupted`, `cancelled` |
| `software` | object | Versions and container digest for reproducibility |
| `command` | string | CLI equivalent of the run |
| `config` | object | Resolved config path + hash |
| `inputs[]` | array | Role, path (relative to run dir), SHA-256, size, probed info |
| `crs` | object | Processing/output CRS, vertical datum, local offset |
| `stages[]` | array | Per stage: `id`, `name`, `status` (`pending`/`running`/`done`/`skipped`/`failed`/`cached`), `duration_s`, `fingerprint`, `metrics`, `warnings`, `error` |
| `timing` | object | Total, critical-path, first-visual seconds |
| `summary` | object | Placement tier and headline accuracy string (only from S9 evidence) |
| `artifacts[]` | array | Deliverables with MIME type, bytes, SHA-256 |
| `warnings[]`, `errors[]` | array | `{code, stage, msg}` |

A JSON Schema file is kept at `pipeline/drishti/schemas/manifest.schema.json` and validated in tests.

---

## 7. Output formats

### 7.1 Point cloud — LAS 1.4 / LAZ

| Property | Value |
|---|---|
| Version | LAS 1.4, compressed as LAZ (LASzip) by default; uncompressed LAS on request |
| Point Data Record Format | **7** (XYZ, intensity, return info, classification + flags, scan angle, user data, point source ID, GPS time, **RGB**) |
| Scale / offset | 0.001 m scale; offset = local UTM offset from manifest |
| CRS | OGC WKT2 VLR (compound: UTM zone + EGM2008 height) |
| GPS time | Frame UTC of the first observing keyframe in adjusted GPS standard time (for provenance only) |
| Point source ID | Chunk ID from split-merge (0 if single chunk) |
| Intensity | Luminance (0–65535) derived from RGB (no LiDAR intensity) |

**Classification codes** (ASPRS LAS 1.4 standard classes, plus user-definable range 64–255):

| Code | Class | Source in Drishti3D |
|---|---|---|
| 1 | Unclassified | Default / undetermined ("other") |
| 2 | **Ground** | PDAL SMRF/CSF + semantic ground/road |
| 3 | Low vegetation | Vegetation, < 0.5 m above DTM |
| 4 | Medium vegetation | Vegetation, 0.5–2 m |
| 5 | **High vegetation** | Vegetation, > 2 m |
| 6 | **Building** | Semantic building + planarity |
| 7 | Low point (noise) | Statistical outlier below surface |
| 9 | Water | Semantic water (low confidence expected: textureless) |
| 11 | **Road surface** | Semantic road ∩ ground |
| 17 | Bridge deck | Manual/optional |
| 18 | High noise | Outliers above surface |
| 64 | *Vehicle* (user-defined) | Masked-class residue (static vehicles retained) |
| 65 | *Person* (user-defined) | Should be empty after masking; retained for audit |
| 66 | *LoD2 inferred wall/roof* (user-defined) | S6 completion (also synthetic flag) |

Classification flags: the **Synthetic** bit is set on every point generated by S6 LoD2 completion (FR-CMP-03). The **Withheld** bit is set on noise points kept for audit.

**Extra bytes** (LAS 1.4 Extra Bytes VLR, record ID 4):

| Name | Data type | Range | Meaning |
|---|---|---|---|
| `confidence` | float32 | 0.0–1.0 | Combined score from view count, triangulation angle, photometric consistency |
| `conf_class` | uint8 | 0, 1, 2 | 0 = observed-high, 1 = observed-low, 2 = inferred |
| `n_views` | uint16 | 0–65535 | Number of keyframes observing the point |
| `tri_angle_deg` | float32 | 0–180 | Maximum triangulation angle among observing views |

### 7.2 Rasters — Cloud-Optimised GeoTIFF

| Product | File | Bands / type | NoData | Compression | Notes |
|---|---|---|---|---|---|
| Orthomosaic | `rasters/ortho.tif` | 3× uint8 RGB + internal mask | mask band | JPEG (YCbCr) q90, or WEBP | GSD = `dense.rasters.gsd_m` |
| DSM | `rasters/dsm.tif` | 1× float32, metres (EGM2008 default) | −9999 | DEFLATE, predictor 3 | `AREA_OR_POINT=Area` |
| DTM | `rasters/dtm.tif` | 1× float32 | −9999 | DEFLATE, predictor 3 | From ground class |
| Confidence | `rasters/confidence.tif` | band 1 uint8 class (1 = observed-high, 2 = observed-low, 3 = inferred, 0 = not reconstructed); band 2 uint8 score 0–255 | 0 | DEFLATE | Palette on band 1 |

All COGs: 512×512 internal tiles, overviews (average for ortho/score, nearest for class, average for DSM), `rio cogeo validate` passes (FR-EXP-04). A sidecar `<name>.json` records run ID, CRS, vertical datum and placement tier.

### 7.3 Mesh — OBJ/MTL

- Coordinates **relative to the local offset** in `mesh/offset.json` (`{"crs":"EPSG:32644+3855","offset":[219000.0,1930000.0,0.0]}`) to avoid float32 precision loss in viewers; Z up.
- `model.obj` + `model.mtl` + `textures/*.jpg` (atlas pages ≤ 8192 px).
- Vertex colours are not written in OBJ; per-face confidence is written as a separate `model_confidence.ply` for analysis tools.

### 7.4 Mesh — glTF 2.0 binary (GLB)

- Single `model.glb`, Y-up per glTF convention, origin at the local ENU frame of the scene centre; geolocation in `asset.extras.drishti.enu_origin_lla` and `…ecef_transform`.
- Textures JPEG (or KTX2/BasisU in `quality`), optional `EXT_meshopt_compression`.
- Per-vertex custom attribute `_CONFIDENCE` (normalised uint8) for the viewer's confidence overlay.
- Validated with the Khronos glTF-Validator (0 errors).

### 7.5 OGC 3D Tiles

- 3D Tiles **1.1**, content = GLB tiles (mesh) and GLB with `EXT_mesh_features`/point primitives or `.pnts` (point cloud, via py3dtiles); splat layer (S7) as glTF with `KHR_gaussian_splatting` where supported by the bundled CesiumJS.
- Implicit or explicit quadtree; `refine: "REPLACE"` for mesh, `"ADD"` for point cloud.

Example `08_export/tiles/mesh/tileset.json` (root transform = ENU→ECEF at lat 17.4456°, lon 78.3499°, h 470 m; illustrative):

```json
{
  "asset": {
    "version": "1.1",
    "generator": "drishti 1.0.0",
    "extras": {
      "drishti": {
        "run_id": "20261018-104207-a3f9c1",
        "placement_tier": "anchored_ref_ortho",
        "vertical": "ellipsoidal (WGS 84)",
        "metric": true
      }
    }
  },
  "geometricError": 256.0,
  "root": {
    "transform": [
      -0.979399051, 0.201934395, 0.0, 0.0,
      -0.060539962, -0.293623981, 0.954002029, 0.0,
       0.192645822, 0.934348681, 0.299800149, 0.0,
       1229181.812, 5961636.710, 1900078.234, 1.0
    ],
    "boundingVolume": { "box": [0, 0, 20, 640, 0, 0, 0, 610, 0, 0, 0, 60] },
    "geometricError": 64.0,
    "refine": "REPLACE",
    "content": { "uri": "0/0_0.glb" },
    "children": [
      {
        "boundingVolume": { "box": [-320, -305, 20, 320, 0, 0, 0, 305, 0, 0, 0, 60] },
        "geometricError": 16.0,
        "content": { "uri": "1/0_0.glb" }
      }
    ]
  }
}
```

`transform` is column-major (3D Tiles convention). Children inherit the root transform. Point-cloud and splat tilesets live in sibling folders and are loaded as separate layers.

### 7.6 Accuracy report JSON (`09_qa/accuracy.json`)

#### 7.6.1 Schema (abridged JSON Schema)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "drishti/accuracy.schema.json",
  "title": "Drishti3D accuracy report",
  "type": "object",
  "required": ["schema_version", "run_id", "crs", "standard", "tiers", "relative", "confidence", "provenance"],
  "properties": {
    "schema_version": { "type": "string" },
    "run_id": { "type": "string" },
    "generated_at": { "type": "string", "format": "date-time" },
    "crs": {
      "type": "object",
      "properties": {
        "horizontal": { "type": "string" },
        "vertical": { "type": "string" },
        "geoid": { "type": "string" }
      }
    },
    "standard": {
      "type": "object",
      "properties": {
        "name": { "const": "ASPRS Positional Accuracy Standards, Edition 2 (2023)" },
        "ce90_factor": { "type": "number" },
        "le90_factor": { "type": "number" },
        "min_checkpoints": { "type": "integer" }
      }
    },
    "checkpoints": {
      "type": "object",
      "properties": {
        "n": { "type": "integer" },
        "n_gcp_used": { "type": "integer" },
        "survey_method": { "type": "string" },
        "sigma_xy_m": { "type": "number" },
        "sigma_z_m": { "type": "number" },
        "meets_asprs_min": { "type": "boolean" }
      }
    },
    "tiers": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["tier", "rmse_x_m", "rmse_y_m", "rmse_h_m", "rmse_z_m", "ce90_m", "le90_m"],
        "properties": {
          "tier": { "enum": ["gnss_only", "anchored_ref_ortho", "anchored_gcp", "anchored_corrected_track", "rtk_ppk"] },
          "rmse_x_m": { "type": "number" }, "rmse_y_m": { "type": "number" },
          "rmse_h_m": { "type": "number" }, "rmse_z_m": { "type": "number" },
          "mean_dx_m": { "type": "number" }, "mean_dy_m": { "type": "number" }, "mean_dz_m": { "type": "number" },
          "sd_dx_m": { "type": "number" }, "sd_dy_m": { "type": "number" }, "sd_dz_m": { "type": "number" },
          "ce90_m": { "type": "number" }, "le90_m": { "type": "number" },
          "ce90_valid": { "type": "boolean", "description": "false if min(RMSEx,RMSEy)/max < 0.6" },
          "asprs_h_class_cm": { "type": "number" }, "asprs_v_class_cm": { "type": "number" },
          "max_abs_dz_m": { "type": "number" },
          "residuals_file": { "type": "string" }
        }
      }
    },
    "relative": {
      "type": "object",
      "properties": {
        "n_pairs": { "type": "integer" },
        "median_length_error_pct": { "type": "number" },
        "max_length_error_pct": { "type": "number" },
        "error_on_20m_m": { "type": ["number", "null"] }
      }
    },
    "doming": {
      "type": ["object", "null"],
      "properties": {
        "reference": { "type": "string" },
        "strip_length_m": { "type": "number" },
        "peak_deformation_m": { "type": "number" },
        "along_track_profile_file": { "type": "string" },
        "across_track_profile_file": { "type": "string" }
      }
    },
    "completeness": { "type": ["number", "null"], "minimum": 0, "maximum": 1 },
    "confidence": {
      "type": "object",
      "properties": {
        "observed_high_ratio": { "type": "number" },
        "observed_low_ratio": { "type": "number" },
        "inferred_ratio": { "type": "number" },
        "definitions": { "type": "object" }
      }
    },
    "time_sync": { "type": "object", "properties": { "offset_s": { "type": "number" }, "sigma_s": { "type": "number" } } },
    "targets": { "type": "object", "description": "Charter §6 targets with pass/fail per metric" },
    "warnings": { "type": "array", "items": { "type": "object" } },
    "provenance": {
      "type": "object",
      "properties": {
        "manifest_sha256": { "type": "string" },
        "software": { "type": "string" },
        "method_notes": { "type": "string" }
      }
    }
  }
}
```

#### 7.6.2 Example (placeholder values)

```json
{
  "schema_version": "1.0.0",
  "run_id": "20261018-104207-a3f9c1",
  "generated_at": "2026-10-18T10:55:30.100Z",
  "crs": { "horizontal": "EPSG:32644", "vertical": "EPSG:3855", "geoid": "EGM2008" },
  "standard": { "name": "ASPRS Positional Accuracy Standards, Edition 2 (2023)", "ce90_factor": 2.146, "le90_factor": 1.6449, "min_checkpoints": 30 },
  "checkpoints": { "n": 32, "n_gcp_used": 1, "survey_method": "RTK-CORS", "sigma_xy_m": 0.015, "sigma_z_m": 0.025, "meets_asprs_min": true },
  "tiers": [
    { "tier": "gnss_only", "rmse_x_m": 1.21, "rmse_y_m": 1.86, "rmse_h_m": 2.22, "rmse_z_m": 3.70,
      "mean_dx_m": -1.18, "mean_dy_m": 1.80, "mean_dz_m": 3.66, "sd_dx_m": 0.24, "sd_dy_m": 0.31, "sd_dz_m": 0.41,
      "ce90_m": 3.37, "le90_m": 6.09, "ce90_valid": true },
    { "tier": "anchored_ref_ortho", "rmse_x_m": 0.29, "rmse_y_m": 0.35, "rmse_h_m": 0.45, "rmse_z_m": 0.53,
      "mean_dx_m": 0.04, "mean_dy_m": -0.06, "mean_dz_m": 0.11, "sd_dx_m": 0.29, "sd_dy_m": 0.35, "sd_dz_m": 0.52,
      "ce90_m": 0.69, "le90_m": 0.87, "ce90_valid": true, "residuals_file": "09_qa/residuals.csv" }
  ],
  "relative": { "n_pairs": 20, "median_length_error_pct": 0.21, "max_length_error_pct": 0.48, "error_on_20m_m": 0.05 },
  "doming": null,
  "completeness": 0.93,
  "confidence": { "observed_high_ratio": 0.78, "observed_low_ratio": 0.16, "inferred_ratio": 0.06 },
  "time_sync": { "offset_s": -0.267, "sigma_s": 0.018 },
  "targets": {
    "anchored_ce90_le_1m": { "target": 1.0, "value": 0.69, "pass": true },
    "anchored_le90_le_1m": { "target": 1.0, "value": 0.87, "pass": true },
    "relative_length_le_0_5pct": { "target": 0.5, "value": 0.21, "pass": true }
  },
  "warnings": [ { "code": "W-QA-03", "msg": "Doming test skipped: no reference DSM" } ],
  "provenance": { "manifest_sha256": "…", "software": "drishti 1.0.0", "method_notes": "CE90 = 1.5175 × RMSE_H (≡ 2.146 × per-axis RMSE when RMSE_x ≈ RMSE_y; axis ratio 0.83 ≥ 0.6); LE90 = 1.6449 × RMSE_z" }
}
```

> Again, **these numbers are illustrative only**; the GNSS-only row mimics the *shape* of the rigid bias reported by Zhang et al. (2019) (large mean, small SD), not a measured Drishti3D result.

`residuals.csv`: `id,x_true,y_true,z_true,x_model,y_model,z_model,dx,dy,dz,dh,tier`.

---

## 8. CLI reference

Entry point `drishti` (installed from `pipeline/`). Global flags apply to all subcommands.

### 8.1 Global flags

| Flag | Default | Description |
|---|---|---|
| `--config PATH` | — | Extra YAML merged after the profile |
| `--set KEY=VALUE` | — | Dotted override, repeatable (`--set dense.resolution_level=1`) |
| `--log-level LEVEL` | `INFO` | `DEBUG`/`INFO`/`WARNING`/`ERROR` |
| `--json` | off | Machine-readable output on stdout |
| `--gpu IDS` | `0` | Comma-separated GPU ids |
| `--offline / --no-offline` | `--offline` | Hard-fail on any network access |
| `--version` | | Print versions of drishti, COLMAP, OpenMVS, GDAL |

### 8.2 `drishti run` — full pipeline (charter contract)

```bash
drishti run --video flight.mp4 --srt flight.srt \
  [--klv auto] [--rtk rtk.pos] [--imu imu.csv] [--intrinsics cam.yaml] \
  [--ref-ortho ref.tif] [--ref-dsm ref_dsm.tif] [--ref-dsm-vdatum egm2008] \
  [--gcp gcp.csv] [--checkpoints cp.csv] [--distances pairs.csv] \
  [--tz Asia/Kolkata] --profile fast --out data/runs/<run_id> \
  [--resume] [--from S5] [--until S8] [--skip S7]
```

| Flag | Required | Description |
|---|---|---|
| `--video PATH` | yes | Input video |
| `--srt PATH` | if DJI | DJI SRT sidecar (auto-detected if same basename) |
| `--klv auto\|off\|STREAM` | no | KLV extraction from TS |
| `--rtk PATH` | no | RTKLIB `.pos` or CSV |
| `--imu PATH` | no | Attitude/IMU CSV |
| `--intrinsics PATH` | no | Camera YAML (else library lookup) |
| `--ref-ortho PATH`, `--ref-dsm PATH` | no | Reference rasters for anchoring |
| `--gcp PATH` | no | GCP/CP CSV (`role` column decides usage) |
| `--checkpoints PATH` | no | CP-only CSV (alternative to mixed file) |
| `--distances PATH` | no | Distance-pair CSV for relative accuracy |
| `--tz TZ` | no | Timezone of SRT local times |
| `--profile` | no | `preview` \| `fast` \| `quality` (default `fast`) |
| `--out DIR` | no | Run directory (default `data/runs/<generated run_id>`) |
| `--resume` | no | Resume existing run dir |
| `--from S#`, `--until S#`, `--skip S#` | no | Partial execution |

### 8.3 Other subcommands

| Command | Purpose | Key flags | Example |
|---|---|---|---|
| `drishti ingest` | S0 only: probe, parse telemetry, time-sync estimate; prints a data-quality summary | `--video --srt/--klv --tz --out` | `drishti ingest --video DJI_0001.MP4 --out /tmp/check` |
| `drishti preview` | Profile `preview`: S0, S1, P; serves tiles if `--serve` | `--video --srt --out --serve --port 8090` | `drishti preview --video f.mp4 --srt f.srt --serve` |
| `drishti qa` | Re-run S9 on an existing run with new checkpoints/references | `--run DIR --checkpoints cp.csv [--ref-dsm dsm.tif] [--distances pairs.csv] [--format html,pdf,json]` | `drishti qa --run data/runs/2026… --checkpoints cp.csv` |
| `drishti export` | Re-run S8 with other formats / CRS | `--run DIR --formats laz,las,ply,fbx,tiles3d --vertical egm96 --crs EPSG:32643 --bundle` | `drishti export --run … --formats ply,fbx` |
| `drishti benchmark` | Run a dataset suite, collect timings and accuracy into a table | `--suite tests/benchmarks/suite.yaml --profile fast --repeat 3 --report bench.html` | `drishti benchmark --suite finale_dryrun.yaml` |
| `drishti validate` | Validate an input file against its schema (SRT, CSV, YAML, GeoTIFF) | `--type srt|gcp|intrinsics|ref --file PATH` | `drishti validate --type gcp --file points.csv` |

### 8.4 Exit codes

| Code | Meaning |
|---|---|
| 0 | Success (possibly with warnings — see `--json` output / manifest) |
| 1 | Unexpected internal error |
| 2 | Usage error (bad flags) |
| 3 | Input validation error (E-ING-*, E-CFG-*) |
| 4 | Stage failure (E-S#-*) |
| 5 | Resource error (GPU OOM after retries, disk full) |
| 6 | Licence / offline policy violation (weight not approved, network access attempted) |
| 130 | Interrupted (Ctrl-C); run resumable |

---

## 9. REST and WebSocket API

### 9.1 Conventions

| Item | Value |
|---|---|
| Base URL | `http://127.0.0.1:8080/api/v1` (via nginx) |
| Auth | Session cookie from `POST /auth/login`, or `Authorization: Bearer <token>` |
| Content type | `application/json` (UTF-8) unless noted |
| Errors | RFC 7807 `application/problem+json` with extra `code` field (§9.4) |
| Pagination | `?limit=50&cursor=<opaque>` → `next_cursor` |
| Idempotency | `Idempotency-Key` header supported on `POST /runs` |
| OpenAPI | Served offline at `/api/v1/docs` and `/api/v1/openapi.json` |

### 9.2 Endpoint summary

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/health` | any | Liveness + offline status + GPU visibility |
| GET | `/version` | any | Software versions |
| POST | `/auth/login` | — | Username/password → session |
| POST | `/uploads` | operator | Start chunked upload |
| PUT | `/uploads/{upload_id}/chunks/{n}` | operator | Upload chunk *n* (binary) |
| POST | `/uploads/{upload_id}/complete` | operator | Finalise; server verifies SHA-256 |
| POST | `/runs` | operator | Create run from uploads (or server-local paths under `data/`) |
| GET | `/runs` | analyst | List runs (filters: `status`, `since`) |
| GET | `/runs/{run_id}` | analyst | Run detail (manifest summary + live state) |
| POST | `/runs/{run_id}/cancel` | operator | Request cancellation |
| POST | `/runs/{run_id}/resume` | operator | Resume interrupted/failed run (optional config overrides) |
| DELETE | `/runs/{run_id}` | admin / owner | Delete run and all files |
| GET | `/runs/{run_id}/artifacts` | analyst | List deliverables |
| GET | `/runs/{run_id}/artifacts/{artifact_id}` | analyst | Download (302 to `/files/…`, supports Range) |
| POST | `/runs/{run_id}/exports` | analyst | Request extra formats (S8 re-run) |
| POST | `/runs/{run_id}/checkpoints` | operator | Upload checkpoint CSV → S9-only job |
| GET | `/runs/{run_id}/report` | analyst | Accuracy report (`?format=json|html|pdf`) |
| GET | `/runs/{run_id}/logs` | operator | Tail of structured log (`?stage=S3&level=WARNING`) |
| WS | `/runs/{run_id}/progress` | analyst | Progress, preview updates, completion |

### 9.3 Request / response examples

#### `POST /uploads`

```http
POST /api/v1/uploads
Content-Type: application/json

{ "filename": "DJI_0001.MP4", "bytes": 7812345678, "sha256": "0c7d…", "role": "video" }
```

```http
HTTP/1.1 201 Created
{ "upload_id": "up_7f3a1c", "chunk_bytes": 67108864, "chunks": 117, "expires_at": "2026-10-19T10:40:00Z" }
```

`PUT /uploads/up_7f3a1c/chunks/0` with `Content-Type: application/octet-stream` → `204`. Re-sending a chunk is idempotent. `GET /uploads/{id}` returns received chunk indices for resume.

#### `POST /runs`

```http
POST /api/v1/runs
Content-Type: application/json
Idempotency-Key: 5c1f0a0e-2b0e-4d7e-9a53-2f7d8c1b9e11

{
  "name": "Campus strip 18-Oct",
  "profile": "fast",
  "inputs": {
    "video": { "upload_id": "up_7f3a1c" },
    "srt": { "upload_id": "up_7f3a1d" },
    "ref_ortho": { "path": "reference/hyd_campus_ortho_30cm.tif" },
    "gcp": { "upload_id": "up_7f3a1e" }
  },
  "options": { "timezone": "Asia/Kolkata" },
  "overrides": { "dense.resolution_level": 2 }
}
```

```http
HTTP/1.1 202 Accepted
Location: /api/v1/runs/20261018-104207-a3f9c1
{
  "run_id": "20261018-104207-a3f9c1",
  "status": "queued",
  "queue_position": 1,
  "links": {
    "self": "/api/v1/runs/20261018-104207-a3f9c1",
    "progress": "/api/v1/runs/20261018-104207-a3f9c1/progress",
    "artifacts": "/api/v1/runs/20261018-104207-a3f9c1/artifacts"
  }
}
```

#### `GET /runs/{run_id}`

```json
{
  "run_id": "20261018-104207-a3f9c1",
  "name": "Campus strip 18-Oct",
  "status": "running",
  "profile": "fast",
  "created_at": "2026-10-18T10:42:07Z",
  "current_stage": { "id": "S5", "name": "dense", "pct": 42.0, "eta_s": 190 },
  "stages": [
    { "id": "S0", "status": "done", "duration_s": 31.2 },
    { "id": "S1", "status": "done", "duration_s": 58.4 },
    { "id": "S2", "status": "done", "duration_s": 83.0 },
    { "id": "S3", "status": "done", "duration_s": 231.7 },
    { "id": "S4", "status": "done", "duration_s": 22.9, "placement_tier": "anchored_ref_ortho" },
    { "id": "S5", "status": "running" }
  ],
  "preview": { "tiles": "/files/runs/20261018-104207-a3f9c1/preview/tiles/{z}/{x}/{y}.webp", "version": 812 },
  "warnings": []
}
```

#### `GET /runs/{run_id}/artifacts`

```json
{
  "run_id": "20261018-104207-a3f9c1",
  "artifacts": [
    { "id": "tiles_mesh", "kind": "3dtiles", "path": "08_export/tiles/mesh/tileset.json", "url": "/files/runs/20261018-104207-a3f9c1/08_export/tiles/mesh/tileset.json", "metric": true },
    { "id": "tiles_pointcloud", "kind": "3dtiles", "url": "/files/runs/…/08_export/tiles/pointcloud/tileset.json", "metric": true },
    { "id": "pointcloud_laz", "kind": "laz", "bytes": 412345678, "sha256": "…", "url": "/api/v1/runs/…/artifacts/pointcloud_laz" },
    { "id": "ortho", "kind": "cog", "url": "/files/runs/…/08_export/rasters/ortho.tif" },
    { "id": "dsm", "kind": "cog", "url": "/files/runs/…/08_export/rasters/dsm.tif" },
    { "id": "confidence", "kind": "cog", "url": "/files/runs/…/08_export/rasters/confidence.tif" },
    { "id": "mesh_obj", "kind": "obj", "url": "/api/v1/runs/…/artifacts/mesh_obj" },
    { "id": "mesh_glb", "kind": "glb", "url": "/files/runs/…/08_export/mesh/model.glb" },
    { "id": "report_pdf", "kind": "pdf", "url": "/api/v1/runs/…/report?format=pdf" },
    { "id": "bundle", "kind": "zip", "url": "/api/v1/runs/…/artifacts/bundle" }
  ]
}
```

#### `POST /runs/{run_id}/checkpoints`

```http
POST /api/v1/runs/20261018-104207-a3f9c1/checkpoints
Content-Type: multipart/form-data; boundary=---x

---x
Content-Disposition: form-data; name="file"; filename="checkpoints.csv"
Content-Type: text/csv
(id,role,crs,x,y,z,height_type,…)
---x
Content-Disposition: form-data; name="replace"
true
---x--
```

```http
HTTP/1.1 202 Accepted
{ "job_id": "job_qa_19c2", "type": "qa_only", "checkpoints_accepted": 32, "rejected": [], "status": "queued" }
```

Rejections are listed per row, e.g. `{"row": 7, "id": "CP07", "code": "E-ING-12", "detail": "Point outside model footprint"}`.

#### `GET /runs/{run_id}/report?format=json`

Returns the `accuracy.json` document (§7.6). `format=pdf` → `application/pdf`; `format=html` → self-contained HTML (inline CSS/images, no external resources).

#### `POST /runs/{run_id}/cancel`, `POST /runs/{run_id}/resume`, `DELETE /runs/{run_id}`

```http
POST /api/v1/runs/{id}/resume
{ "from_stage": "S5", "overrides": { "dense.resolution_level": 3 } }
→ 202 { "run_id": "…", "status": "queued" }

DELETE /api/v1/runs/{id}?confirm=true
→ 204 No Content          (409 if running: cancel first)
```

#### WebSocket `WS /runs/{run_id}/progress`

Client may send `{"type":"subscribe","since_seq":120}` to replay missed events. Server messages:

```json
{ "type": "stage_started",  "seq": 121, "ts": "2026-10-18T10:48:31Z", "stage": "S5", "name": "dense" }
{ "type": "progress",       "seq": 122, "ts": "2026-10-18T10:49:02Z", "stage": "S5", "pct": 18.5, "eta_s": 262, "msg": "DensifyPointCloud 3/16 tiles" }
{ "type": "preview_update", "seq": 123, "ts": "2026-10-18T10:43:10Z", "tiles": "/files/runs/…/preview/tiles/{z}/{x}/{y}.webp", "version": 57, "bbox": [78.3440, 17.4400, 78.3560, 17.4510] }
{ "type": "warning",        "seq": 124, "stage": "S4", "code": "W-GEO-02", "msg": "Reference registration inliers low (0.34); result accepted" }
{ "type": "stage_completed","seq": 125, "stage": "S5", "duration_s": 318.5, "metrics": { "dense_points": 38211045 } }
{ "type": "run_completed",  "seq": 140, "status": "succeeded_with_warnings", "headline": "…", "artifacts": "/api/v1/runs/…/artifacts" }
{ "type": "run_failed",     "seq": 140, "code": "E-S3-01", "detail": "Global mapper registered 41% of frames; fallback failed" }
{ "type": "heartbeat",      "seq": 141, "ts": "…" }
```

Heartbeats every 15 s; the client reconnects with `since_seq`.

### 9.4 Error model

```json
{
  "type": "https://drishti.local/errors/E-ING-03",
  "title": "Telemetry does not cover the video",
  "status": 422,
  "code": "E-ING-03",
  "detail": "SRT covers 212.4 s of a 600.2 s video (35%). Minimum is 95%.",
  "instance": "/api/v1/runs",
  "remedy": "Supply the matching SRT file or run with --set ingest.telemetry=none for relative-only output."
}
```

| HTTP | Code(s) | Meaning |
|---|---|---|
| 400 | `E-API-01` | Malformed request / unknown field |
| 401 / 403 | `E-API-02` / `E-API-03` | Not authenticated / role not permitted |
| 404 | `E-API-04` | Run, upload or artefact not found |
| 409 | `E-API-05` | State conflict (e.g. delete while running, resume while running) |
| 413 | `E-API-06` | Chunk too large / quota exceeded |
| 422 | `E-ING-01…` | Input validation: `E-ING-01` unsupported container/codec, `E-ING-02` unparseable SRT, `E-ING-03` telemetry coverage < 95 %, `E-ING-10` KLV checksum failures > threshold, `E-ING-11` CSV schema error, `E-ING-12` point outside footprint, `E-ING-13` GCP/CP id overlap |
| 422 | `E-CFG-01…` | Config: `E-CFG-01` invalid key/value, `E-CFG-02` unknown profile, `E-CFG-03` honesty policy violation |
| 500 | `E-S0-*` … `E-S9-*` | Stage failure, e.g. `E-S3-01` too few registered frames, `E-S4-01` no usable anchor and no GNSS, `E-S5-01` OpenMVS failed after retry |
| 503 | `E-SYS-01` | Worker unavailable / no GPU |
| 507 | `E-SYS-02` | Insufficient storage |
| 500 | `E-SYS-04` | Model weight missing / checksum mismatch |
| 451 | `E-LIC-01` | Licence policy violation (non-approved weights requested) |

Warning codes (non-fatal, surfaced in manifest, report and UI): `W-ING-01` timezone assumed, `W-ING-02` non-monotonic SRT times, `W-SYNC-01` time offset unobservable, `W-MSK-01` segmenter fallback, `W-SFM-01` split-merge used, `W-SFM-02` distortion refinement on strip, `W-GEO-01` GNSS-only placement, `W-GEO-02` low registration inliers, `W-DNS-01` resolution reduced after OOM, `W-CMP-01` LoD2 skipped, `W-SPL-01` splat failed, `W-QA-01` < 30 checkpoints, `W-QA-02` CE90 approximation invalid (axis RMSE ratio < 0.6), `W-QA-03` doming test skipped, `W-LIC-01` non-commercial weights selected.

---

## 10. Python module interfaces

The package is `drishti` (under `pipeline/drishti/`). All stages share common types and the `Stage` protocol. Signatures below are the **contract**; implementations may add keyword-only parameters with defaults.

### 10.1 Common types (`drishti/run.py`, `drishti/types.py`)

```python
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol, Callable, Literal, Sequence
import numpy as np

StageId = Literal["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "P"]
PlacementTier = Literal["none", "gnss_only", "anchored_ref_ortho", "anchored_gcp",
                        "anchored_corrected_track", "rtk_ppk"]

@dataclass(frozen=True)
class RunContext:
    run_id: str
    run_dir: Path
    cfg: "DrishtiConfig"                         # pydantic model of §4
    emit: Callable[["ProgressEvent"], None]      # progress/event sink (DB + JSONL)
    log: "logging.Logger"
    cancel: "CancelToken"
    gpu_ids: tuple[int, ...] = (0,)
    def stage_dir(self, stage: StageId) -> Path: ...

@dataclass
class StageResult:
    stage: StageId
    status: Literal["done", "skipped", "failed", "cached"]
    outputs: dict[str, Path]
    metrics: dict[str, float | int | str | bool] = field(default_factory=dict)
    warnings: list["Issue"] = field(default_factory=list)
    duration_s: float = 0.0

class Stage(Protocol):
    id: StageId
    name: str
    requires: tuple[StageId, ...]
    def fingerprint(self, ctx: RunContext) -> str: ...
    def run(self, ctx: RunContext, cfg: "StageConfig") -> StageResult: ...   # cfg = ctx.cfg.<stage section>

def run_pipeline(ctx: RunContext, stages: Sequence[Stage], *,
                 resume: bool = True, from_stage: StageId | None = None,
                 until_stage: StageId | None = None) -> "Manifest": ...
```

### 10.2 S0 — `drishti.ingest`

```python
# video.py
@dataclass
class VideoInfo:
    path: Path; codec: str; width: int; height: int; fps_nominal: float
    duration_s: float; n_frames: int; rotation_deg: int; color_transfer: str
    pts_s: np.ndarray                                  # per-frame PTS
def probe_video(path: Path) -> VideoInfo: ...
def iter_frames(path: Path, *, every_n: int = 1, max_px: int | None = None,
                start_s: float = 0.0) -> "Iterator[tuple[int, float, np.ndarray]]": ...

# srt.py
@dataclass
class TelemetryTrack:                                  # columnar, one row per sample
    t_utc: np.ndarray; lat: np.ndarray; lon: np.ndarray
    alt_rel: np.ndarray; alt_abs: np.ndarray; alt_datum: str
    gimbal_ypr: np.ndarray | None; focal_35mm: np.ndarray | None
    frame_idx: np.ndarray | None; source: Literal["srt", "klv", "gpx", "csv"]
    extra: dict[str, np.ndarray]
def parse_srt(path: Path, *, tz: str = "Asia/Kolkata",
              layout: Literal["auto", "A", "B", "C", "D"] = "auto") -> tuple[TelemetryTrack, "ParseReport"]: ...

# klv.py
def extract_klv(ts_path: Path, *, stream: str = "auto") -> bytes: ...
def parse_klv(ts_path: Path, *, validate_checksum: bool = True) -> tuple[TelemetryTrack, "ParseReport"]: ...

# timesync.py
@dataclass
class TimeOffset:
    offset_s: float; sigma_s: float; peak_ratio: float
    method: Literal["velocity_xcorr", "none"]; observable: bool
def estimate_time_offset(track: TelemetryTrack, frame_times_s: np.ndarray,
                         image_speed: np.ndarray, *, window_s: float = 2.0) -> TimeOffset: ...
def refine_time_offset(track: TelemetryTrack, cam_centres: np.ndarray,
                       cam_times_s: np.ndarray, prior: TimeOffset) -> TimeOffset: ...
def align_to_frames(track: TelemetryTrack, video: VideoInfo, offset: TimeOffset) -> TelemetryTrack: ...

class IngestStage(Stage): id = "S0"; name = "ingest"; requires = ()
```

### 10.3 S1 — `drishti.frames`

```python
@dataclass
class Keyframe:
    frame_idx: int; pts_s: float; t_utc: "datetime"; image_path: Path
    lat: float | None; lon: float | None; alt_rel: float | None
    gimbal_ypr: tuple[float, float, float] | None; focal_35mm: float | None
    sharpness: float; parallax_px: float
def blur_score(img_gray: np.ndarray) -> float: ...                     # variance of Laplacian
def detect_shot_cuts(video: Path, *, threshold: float = 0.4) -> list[float]: ...
def select_keyframes(video: "VideoInfo", track: "TelemetryTrack",
                     cfg: "FramesConfig") -> list[Keyframe]: ...
def write_keyframes(kfs: list[Keyframe], out_dir: Path, *, fmt: str = "jpg",
                    quality: int = 95) -> Path: ...                      # returns keyframes.csv

class FramesStage(Stage): id = "S1"; name = "frames"; requires = ("S0",)
```

### 10.4 S2 — `drishti.masking`

```python
@dataclass
class MaskSet:
    dynamic_dir: Path; semantic_dir: Path | None
    class_names: list[str]; masked_ratio: float
class DynamicDetector(Protocol):
    def __call__(self, img: np.ndarray) -> list["Detection"]: ...
def load_detector(weights: Path, device: str = "cuda") -> DynamicDetector: ...
def segment(img: np.ndarray, boxes: Sequence["Detection"], *, model: "Sam2Predictor") -> np.ndarray: ...
def sky_mask(img: np.ndarray) -> np.ndarray: ...
def build_masks(keyframes: Sequence["Keyframe"], cfg: "MaskingConfig", *,
                budget_s: float) -> MaskSet: ...

class MaskingStage(Stage): id = "S2"; name = "masking"; requires = ("S1",)
```

### 10.5 S3 — `drishti.sfm`

```python
@dataclass
class PosePriors:
    positions_enu: np.ndarray            # (N,3) in local ENU/UTM
    sigmas: np.ndarray                   # (N,3)
    gravity: np.ndarray | None           # (N,3) unit vectors in camera frame
    gimbal_R: np.ndarray | None          # (N,3,3)
@dataclass
class SfmModel:
    sparse_dir: Path; n_registered: int; n_images: int; reproj_rmse_px: float
    n_points: int; chunks: int; mode: Literal["global", "incremental", "fallback"]
    def camera_centres(self) -> tuple[list[str], np.ndarray]: ...

def build_priors(keyframes: Sequence["Keyframe"], crs: "LocalFrame",
                 cfg: "SfmConfig", rtk: "TelemetryTrack | None" = None) -> PosePriors: ...
def rolling_shutter_params(camera: "CameraSpec") -> "RSParams | None": ...
def run_colmap(images_dir: Path, masks_dir: Path | None, priors: PosePriors,
               camera: "CameraSpec", cfg: "SfmConfig", work_dir: Path) -> SfmModel: ...
def split_sequence(keyframes: Sequence["Keyframe"], *, chunk: int, overlap: int) -> list[slice]: ...
def merge_chunks(models: Sequence[SfmModel], priors: PosePriors, out_dir: Path) -> SfmModel: ...
def fallback_dpvo(images_dir: Path, priors: PosePriors, work_dir: Path) -> SfmModel: ...

class SfmStage(Stage): id = "S3"; name = "sfm"; requires = ("S1", "S2")
```

### 10.6 S4 — `drishti.georef`

```python
@dataclass
class Sim3:
    s: float; R: np.ndarray; t: np.ndarray
    def apply(self, X: np.ndarray) -> np.ndarray: ...
    def inverse(self) -> "Sim3": ...
@dataclass
class AnchorResult:
    tier: "PlacementTier"; transform: Sim3; residual_rmse_m: float
    inlier_ratio: float | None; source: str; details: dict

# crs.py
def utm_epsg_for(lon: float, lat: float) -> int: ...                 # 32601–32660 / 32701–32760
def to_processing_crs(lat, lon, h_ell, *, epsg: int) -> np.ndarray: ...
def ellipsoidal_to_orthometric(E, N, h, *, epsg: int, geoid: Literal["egm2008", "egm96"]) -> np.ndarray: ...
def enu_to_ecef_matrix(lat: float, lon: float, h: float) -> np.ndarray: ...   # 4×4, for 3D Tiles

# align.py
def umeyama_sim3(src: np.ndarray, dst: np.ndarray, *, weights: np.ndarray | None = None) -> Sim3: ...
def robust_sim3(src: np.ndarray, dst: np.ndarray, sigmas: np.ndarray, *,
                loss: Literal["huber", "cauchy"] = "huber", delta: float = 3.0,
                ransac_iters: int = 500, fix_roll_from: np.ndarray | None = None) -> tuple[Sim3, dict]: ...
def is_collinear(points: np.ndarray, *, pca_ratio: float = 0.02) -> bool: ...

# register.py
def register_ortho(ortho: Path, ref_ortho: Path, *, gsd_m: float,
                   method: Literal["feature_ncc", "mutual_information"] = "feature_ncc") -> AnchorResult: ...
def register_dsm(dsm: Path, ref_dsm: Path, *, mask: np.ndarray | None = None,
                 method: Literal["robust_median", "icp_z"] = "robust_median") -> AnchorResult: ...

# corrections.py
def anchor_with_gcps(model_pts: np.ndarray, gcps: "PointSet", *, max_used: int = 3) -> AnchorResult: ...
def anchor_with_rtk(model: "SfmModel", rtk: "TelemetryTrack", lever_arm_m: np.ndarray) -> AnchorResult: ...
def choose_anchor(candidates: Sequence[AnchorResult], cfg: "GeorefConfig") -> tuple[AnchorResult, dict]: ...

class GeorefStage(Stage): id = "S4"; name = "georef"; requires = ("S3",)
```

### 10.7 S5 — `drishti.dense`

```python
@dataclass
class DenseProducts:
    dense_ply: Path; mesh_ply: Path; textured_obj: Path
    dsm_tif: Path; ortho_tif: Path; gsd_m: float
def export_to_openmvs(model: "SfmModel", images_dir: Path, masks_dir: Path | None, out: Path) -> Path: ...
def run_openmvs(scene_mvs: Path, cfg: "DenseConfig", work_dir: Path, *,
                gpu_id: int = 0, tiles: Sequence["TileSpec"] | None = None) -> DenseProducts: ...
def rasterize_dsm(points: Path, *, gsd_m: float, epsg: int, method: str = "max") -> Path: ...
def make_orthomosaic(mesh_obj: Path, *, gsd_m: float, epsg: int) -> Path: ...

class DenseStage(Stage): id = "S5"; name = "dense"; requires = ("S4", "S2")
```

### 10.8 S6 — `drishti.completion`

```python
def ground_filter(points: Path, *, method: Literal["smrf", "csf"] = "smrf") -> tuple[Path, Path]: ...  # (classified, dtm)
def classify_points(points: Path, semantic_dir: Path, dtm: Path, cfg: "CompletionConfig") -> Path: ...
@dataclass
class Lod2Building:
    id: str; footprint: "shapely.Polygon"; roof_planes: list[np.ndarray]
    walls_inferred: bool; observed_ratio: float
def fit_lod2(points: Path, building_mask: np.ndarray, dtm: Path, cfg: "Lod2Config") -> list[Lod2Building]: ...
def write_inferred(buildings: Sequence[Lod2Building], out_ply: Path, out_geojson: Path) -> None: ...

class CompletionStage(Stage): id = "S6"; name = "completion"; requires = ("S5",)
```

### 10.9 S7 — `drishti.splat`

```python
def train_splats(images_dir: Path, poses: "SfmModel", init_points: Path, cfg: "SplatConfig",
                 out_dir: Path, *, gpu_id: int = 0) -> Path: ...              # splat.ply
def export_khr_gaussian_splatting(splat_ply: Path, out_glb: Path, enu_origin: tuple[float, float, float]) -> Path: ...

class SplatStage(Stage): id = "S7"; name = "splat"; requires = ("S4", "S5")
```

### 10.10 S8 — `drishti.export`

```python
def write_las(points: Path, out: Path, *, epsg: int, vertical: str, point_format: int = 7,
              extra_bytes: Sequence[str] = ("confidence", "conf_class", "n_views", "tri_angle_deg"),
              compress: bool = True) -> Path: ...
def write_cog(src: Path, out: Path, *, kind: Literal["ortho", "dsm", "dtm", "confidence"]) -> Path: ...
def write_obj(mesh: Path, out_dir: Path, *, local_offset: np.ndarray) -> Path: ...
def write_glb(mesh: Path, out: Path, *, enu_origin_lla: tuple[float, float, float],
              confidence_attr: bool = True) -> Path: ...
def build_3dtiles(src: Path, out_dir: Path, *, kind: Literal["mesh", "pointcloud", "splat"],
                  enu_origin_lla: tuple[float, float, float], cfg: "Tiles3DConfig") -> Path: ...  # tileset.json
def make_bundle(run_dir: Path, artifacts: Sequence[Path]) -> tuple[Path, Path]: ...                # (zip, SHA256SUMS)

class ExportStage(Stage): id = "S8"; name = "export"; requires = ("S5", "S6")
```

### 10.11 S9 — `drishti.qa`

```python
@dataclass
class TierMetrics:
    tier: "PlacementTier"; n: int
    rmse_x: float; rmse_y: float; rmse_h: float; rmse_z: float
    mean: np.ndarray; sd: np.ndarray; ce90: float; le90: float; ce90_valid: bool

def compute_accuracy(checkpoints: "PointSet", surface: "SurfaceSampler", tier: "PlacementTier", *,
                     ce90_factor: float = 2.146, le90_factor: float = 1.6449) -> TierMetrics: ...
def relative_accuracy(pairs: "DistancePairs", surface: "SurfaceSampler") -> dict: ...
def doming_test(dsm: Path, ref_dsm: Path, trajectory: np.ndarray, *,
                detrend: Literal["plane", "none"] = "plane", spacing_m: float = 10.0) -> dict: ...
def confidence_map(points: Path, mesh: Path, inferred: Path | None, cfg: "ConfidenceConfig") -> tuple[Path, dict]: ...
def completeness(dsm: Path, footprint: "shapely.Polygon") -> float: ...
def render_report(accuracy: dict, manifest: dict, out_dir: Path, *,
                  formats: Sequence[Literal["html", "pdf", "json"]] = ("html", "pdf", "json")) -> dict[str, Path]: ...

class QaStage(Stage): id = "S9"; name = "qa"; requires = ("S8",)
```

### 10.12 P — `drishti.preview`

```python
class MosaicBuilder:
    def __init__(self, out_dir: Path, *, zoom_levels: tuple[int, int] = (14, 19),
                 tile_format: Literal["webp", "png"] = "webp", refine_homography: bool = True): ...
    def add(self, frame: np.ndarray, t_utc: "datetime", lat: float, lon: float, alt_rel: float,
            yaw_deg: float | None, hfov_deg: float, gimbal_pitch_deg: float | None = None) -> list["TileKey"]: ...
    def flush(self) -> int: ...                           # returns new tile version
def run_preview(ctx: "RunContext", frames: "Iterator[tuple[int, float, np.ndarray]]",
                track: "TelemetryTrack") -> "StageResult": ...

class PreviewStage(Stage): id = "P"; name = "preview"; requires = ("S0",)
```

---

## Related documents

- [00-project-charter.md](00-project-charter.md)
- [01-problem-statement.md](01-problem-statement.md)
- [02-solution-overview.md](02-solution-overview.md)
- [03-requirements.md](03-requirements.md)
- [04-system-architecture.md](04-system-architecture.md)
- [05-pipeline-design.md](05-pipeline-design.md)
- [06-georeferencing-and-accuracy.md](06-georeferencing-and-accuracy.md)
- [07-tech-stack.md](07-tech-stack.md)
- [08-data-formats-and-interfaces.md](08-data-formats-and-interfaces.md)
- [09-viewer-and-ui.md](09-viewer-and-ui.md)
- [10-setup-and-repo-structure.md](10-setup-and-repo-structure.md)
- [11-testing-and-evaluation.md](11-testing-and-evaluation.md)
- [12-flight-and-data-capture-guide.md](12-flight-and-data-capture-guide.md)
- [13-project-plan.md](13-project-plan.md)
- [14-demo-and-pitch.md](14-demo-and-pitch.md)
- [15-research-and-references.md](15-research-and-references.md)
- [16-glossary.md](16-glossary.md)
