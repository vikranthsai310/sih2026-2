# 12 · Flight and Data Capture Guide

> **Purpose:** how to fly, record, survey and store a single-pass drone video so Drishti3D can turn it into a measurably accurate 3D model. Written for the team's own test flights (R6 Data, Flight Ops & Pitch) and for any operator who supplies video.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R6 (flight ops) with R2 (checkpoints and accuracy)

> ⚖️ **Legal disclaimer.** This guide summarises Indian drone rules as the team understood them from public sources on 30 Sep 2026. The rules are amended often. **Before every flight, check the current rules and the airspace map on [digitalsky.dgca.gov.in](https://digitalsky.dgca.gov.in)** and the latest Drone Rules and amendments published by MoCA/DGCA. Items marked **⚠ verify** must be confirmed by the pilot in command. Nothing here is legal advice.

---

## 1. Quick reference card

| Setting / rule | Value |
|---|---|
| Airspace | **Green zone only** for team flights. Check Digital Sky the same day. |
| Max height | **≤ 120 m (400 ft) AGL** in green zones. **≤ 60 m (200 ft)** in the 8–12 km band around airport perimeters. |
| Video | 4K, 25/30 fps, **highest bitrate**, H.265 if the drone supports it at the same bitrate class |
| Subtitles / SRT | **ON** (DJI "Video Subtitles" / "Video Caption") |
| Shutter | **≥ 1/500 s**, prefer **1/1000 s**. ND filter off. |
| Exposure / WB | **Locked** (manual or AE-lock). Fixed white balance (e.g. 5500 K daylight). |
| Focus | Fixed: infinity / AF locked after first focus |
| Zoom / digital crop | **Off**, 1×. No "Night mode", no "HDR video". |
| EIS / digital stabilisation | **Off** or locked if selectable. The mechanical gimbal is fine. |
| Gimbal | **−60° to −70°** (20–30° forward-oblique off nadir). Alternatively −45° for facade-heavy targets. **Not −90° nadir.** |
| Speed | **5–8 m/s** (use the blur formula in §5.2) |
| Path | One smooth pass, **overshoot both ends by 50–100 m**, gentle ±10–20 % altitude variation, slight curve, **no sharp yaw** |
| Ground truth | **≥ 30 checkpoints** (final evaluation, ASPRS Ed. 2) · **≥ 10** (development) · RTK/CORS-grade |

---

## 2. Indian legal requirements

### 2.1 Framework

| Rule | What it means for us | Source | Status |
|---|---|---|---|
| **Drone Rules, 2021** (and later amendments) | Main legal framework for civil drone operations: registration, certification, airspace, operations | [PIB Drone Rules backgrounder](https://static.pib.gov.in/writereaddata/specificdocs/documents/2022/jan/doc202212810701.pdf) | ⚠ verify the latest amendments |
| **Digital Sky airspace map** (released 24 Sep 2021) | Interactive map of **green / yellow / red** zones on digitalsky.dgca.gov.in | [Business Standard](https://www.business-standard.com/article/economy-policy/govt-releases-interactive-digital-airspace-map-for-drone-operations-121092401343_1.html); [100knots](https://www.100knots.com/indias-airspace-map-for-drone-operations-released-by-the-aviation-ministry/) | Check before every flight |
| **DST Geospatial Guidelines (15 Feb 2021)** and National Geospatial Policy 2022 | Data finer than **1 m horizontal / 3 m vertical** must be created or owned by Indian entities and **stored and processed in India** | [DST guidelines PDF](https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf) | Applies to our outputs (see §9) |

### 2.2 Airspace zones

| Zone | Meaning | Can the team fly? |
|---|---|---|
| 🟢 **Green** | Up to **400 ft (120 m) AGL** with no prior permission. In the band **8–12 km from an operational airport perimeter**, green is only up to **200 ft (60 m)**. | ✅ Yes, within those limits |
| 🟡 **Yellow** | Above the green limits, or inside controlled airspace near airports. The yellow zone was **reduced from 45 km to 12 km** from the airport perimeter. Needs permission from the air traffic control authority. | ❌ Not for team flights |
| 🔴 **Red** | "No-drone" zones. Operations only with **Central Government permission**. Includes many border, military and sensitive installations. | ❌ Never. NTRO use cases in red zones must use pre-recorded video from authorised operators. |

Sources: [PIB](https://static.pib.gov.in/writereaddata/specificdocs/documents/2022/jan/doc202212810701.pdf); [Business Standard](https://www.business-standard.com/article/economy-policy/govt-releases-interactive-digital-airspace-map-for-drone-operations-121092401343_1.html).

Also note **⚠ verify**: State governments or district authorities can declare **temporary red zones** (for example during VIP movements or events). These may not appear on the map until declared, so check with local police or the administration when in doubt.

### 2.3 Drone, pilot and paperwork

| Requirement | Summary as understood | Status |
|---|---|---|
| **Drone categories** | By all-up weight: nano (≤ 250 g), micro (> 250 g – 2 kg), small (> 2 – 25 kg), medium, large | ⚠ verify current thresholds |
| **Registration and UIN** | Drones must be registered on Digital Sky and carry a **Unique Identification Number (UIN)**, unless a specific exemption applies to your category | ⚠ verify whether your drone category is exempt. Do not assume. |
| **Type Certificate** | Drones need a DGCA type certificate. Exemptions for nano drones and model aircraft are understood to exist. | ⚠ verify for your model |
| **Remote Pilot Certificate (RPC)** | Issued through a DGCA-authorised Remote Pilot Training Organisation (RPTO). Understood **not** to be required for **nano** drones or for **micro** drones used **non-commercially**. A pilot operating a drone > 250 g for any purpose other than non-commercial micro use needs an RPC. | ⚠ **verify on digitalsky.dgca.gov.in**. Our SIH test flights may count as non-commercial, but confirm with the institute. |
| **Insurance** | Third-party insurance for drone operations. The rules refer to motor-vehicle insurance provisions. | ⚠ verify whether mandatory for your category |
| **Landowner / institutional permission** | Written permission from the campus, landowner or site authority | Always get it (our own rule) |
| **Local authorities** | Inform local police for public areas or large gatherings | Recommended |
| **NTRO/government drones** | Drones owned or operated by NTRO, ARC and central intelligence agencies are exempted from UIN requirements (CBIC circular 2019) | Not relevant to team flights ([Raksha Anirveda](https://raksha-anirveda.com/ntro-indias-eye-in-the-sky/)) |

**Team policy (stricter than the law):**
1. Fly only in verified **green** zones, ≤ 100 m AGL (keeps a margin below 120 m), in daylight, with visual line of sight (VLOS).
2. The pilot holds an RPC if the drone is > 250 g, even when an exemption might apply.
3. Never fly over crowds, roads with moving traffic, or people who have not agreed. Keep ≥ 30 m lateral separation from uninvolved people (our rule; ⚠ verify any statutory figure).
4. Keep a **flight log** (date, site, drone UIN, pilot, Digital Sky zone screenshot, permission letter) in `data/raw/<flight>/admin/`.

---

## 3. Safety checklist

| # | Item | ✔ |
|---|---|---|
| 1 | Digital Sky zone check done **on the day**. Screenshot saved. | ☐ |
| 2 | Site permission letter on hand | ☐ |
| 3 | Weather: wind < 8 m/s at altitude (or below the drone's limit, whichever is lower), no rain, visibility > 3 km | ☐ |
| 4 | Take-off/landing area clear, ≥ 10 m from people. Cordon with cones. | ☐ |
| 5 | Obstacles (power lines, towers, trees) identified and briefed. Planned path clears them by ≥ 20 m vertically. | ☐ |
| 6 | Batteries ≥ 95 %, not swollen, warm in cold weather. Plan to land at ≥ 30 %. | ☐ |
| 7 | Return-to-Home altitude set above the tallest obstacle + 20 m, and ≤ 120 m | ☐ |
| 8 | Geofence and max-altitude limit set in the app (≤ 120 m) | ☐ |
| 9 | Observer (spotter) assigned. Radio or phone contact. | ☐ |
| 10 | First-aid kit, fire extinguisher (Li-Po) | ☐ |
| 11 | Emergency procedure briefed: loss of link → RTH. Low battery → land immediately. People entering the area → hold or land. | ☐ |

---

## 4. Drone and camera settings

These settings matter because they control how accurately our pipeline can reconstruct and place the scene.

### 4.1 Settings table

| Setting | Recommendation | Why |
|---|---|---|
| **Video subtitles / SRT** | **ON.** On DJI apps it is under camera settings → *Video Subtitles* / *Video Caption* (the name and location vary by model and app: DJI Fly, DJI Pilot 2) | The `.SRT` sidecar logs per-frame lat, lon, altitude and focal length (plus ISO, shutter and gimbal on many models). It is our primary GPS input. SRT timestamps are **local time with no timezone** ([ScienceDirect 2025](https://www.sciencedirect.com/science/article/abs/pii/S2352938525003544)), so also note the timezone in the flight log. |
| **Resolution** | **4K (3840×2160)**, or the drone's highest *non-cropped* 16:9 mode | 4K frames are about 8 MP vs 20 MP stills ([PhotoModeler](https://www.photomodeler.com/tip-47-extract-stills-from-video-for-photogrammetry/)). Every pixel counts. Avoid modes that crop the sensor. |
| **Frame rate** | **25 or 30 fps** by default. 50/60 fps only if the bitrate is the same or higher. | We keep about 1–2 keyframes/s, so extra frames help only for choosing the sharpest frame. At a fixed bitrate, higher fps means fewer bits per frame and more compression artefacts. |
| **Bitrate** | **Highest available** (e.g. "High" bitrate setting) | Compression blocks destroy fine features |
| **Codec** | **H.265/HEVC** if the drone offers it at a high bitrate, otherwise H.264. Both are supported by our ffmpeg ingest. | H.265 keeps more detail at the same bitrate. H.264 is more universally decodable. Pick one per campaign and keep it. |
| **Colour profile** | Normal / standard. **Not** D-Log/HLG unless you will colour-grade. | Flat log profiles reduce feature contrast |
| **Shutter speed** | **≥ 1/500 s, prefer 1/1000 s.** Remove ND filters. | Motion blur is a named PS challenge. See the formula in §5.2. |
| **ISO** | Auto with an upper cap (e.g. ≤ 400), or manual | Keeps noise down while the shutter stays fast |
| **Exposure** | **Locked** (manual, or AE-lock after metering on the target area) | Auto-exposure drift changes appearance frame-to-frame. It hurts matching and texture seams. |
| **White balance** | **Fixed** (e.g. Sunny/5500 K) | Same reason: consistent colour across the pass |
| **Focus** | Tap-focus on the ground at flight altitude, then **lock (MF)**. Or set MF to infinity. | Refocusing changes the focal length (the intrinsics) mid-video |
| **Zoom** | **1× optical, digital zoom off** | Zoom changes intrinsics. Our fixed-intrinsics strategy relies on them being constant. |
| **EIS / RockSteady / HorizonSteady / "Dewarp"** | **Off** where selectable | Electronic stabilisation warps and crops each frame differently, which breaks the camera model. The mechanical gimbal is fine. |
| **Distortion correction ("Dewarp")** | Choose one setting and **use the same one for calibration** (§7) | Intrinsics must match the recording mode |
| **HDR / Night mode / Hyperlapse** | **Off** | Multi-frame processing breaks geometry |
| **Rolling shutter** | Nothing to set. Note the drone model so we can apply a readout-time profile. | Rolling shutter displaces content by about 4–10 px at 8 m/s ([Vautherin et al. 2016](https://isprs-annals.copernicus.org/articles/III-3/139/2016/isprs-annals-III-3-139-2016.pdf)). ODM has profiles for DJI Mini 3, Mini 4 Pro and Mavic 3. |
| **RTK module** (if available) | ON, fixed solution, log positions | RTK/PPK without GCPs reaches about 2–5 cm ([Zhang et al. 2019](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)) |
| **Overlays / OSD** | Do not burn telemetry text into the video | Burned-in text becomes a fake static feature. S2 can mask it, but avoid it. |
| **Clock** | Controller and phone clock synced to network time before the flight | Helps SRT ↔ RTK ↔ checkpoint time alignment |

---

## 5. Flight profile for a single pass

### 5.1 Why the profile matters (evidence)

- **Pure nadir straight lines cause doming.** Self-calibrating bundle adjustment on near-parallel views cannot recover radial distortion. The result is a dome or bowl deformation of **metre magnitude in simulation and about 0.2 m in a real test**. **Oblique images at 20–30° cut DEM deformation by one to two orders of magnitude.** A second flight line at a different azimuth did *not* help much, but varying pointing or altitude did ([James & Robson 2014](https://discovery.ucl.ac.uk/id/eprint/1443475/1/esp3609.pdf)). Newer guidance: 20–45° obliques in ≥ 10 % of images ([Drones 2025, 9(6), 387](https://doi.org/10.3390/drones9060387)).
- **Roll about the flight axis is unobservable from collinear GPS.** A dead-straight line gives GPS positions on one line, so aligning to them cannot fix rotation about that line. A gentle curve or altitude change helps (derived inference, [report](../reports/Drishti3D_Research_Report.pdf)).
- **Frame spacing.** Video sampled at about 1 frame per 2.5 s matched a photo flight (building-boundary RMSE 1.1–2.7 cm vs 1.3–2.8 cm), and accuracy degraded at 4 s and 5.5 s ([Remote Sens. 2021](https://doi.org/10.3390/rs13142745)).

### 5.2 Formulas: GSD, footprint, blur, overlap

Symbols: `H` = height AGL (m), `W` = image width (px), `HFOV` = horizontal field of view, `v` = ground speed (m/s), `t` = exposure time (s), `θ` = off-nadir tilt.

```
Footprint width (nadir)      Fw  = 2 · H · tan(HFOV/2)                    [m]
GSD (nadir)                  GSD = Fw / W                                  [m/px]
   (equivalently)            GSD = (sensor_width_mm · H) / (focal_mm · W)
Along-track footprint        Fa  = 2 · H · tan(VFOV/2)     (camera top pointing forward)
Motion blur                  blur_px = v · t / GSD
Rolling-shutter shift        rs_px   ≈ v · t_readout / GSD
Keyframe spacing for overlap o:   d = Fa · (1 − o)   ;   Δt = d / v
Oblique slant GSD (centre)   GSD_θ ≈ GSD / cos(θ)   (grows further toward the far edge)
```

Rules of thumb: keep **blur_px ≤ 0.5 px** and **rs_px** small, or modelled (S3 models it, but less is better).

**Worked example** (typical consumer drone, HFOV ≈ 82°, 4K 16:9 → VFOV ≈ 52°):

| H (m) | Fw (m) | GSD (cm/px) | Fa (m) | v (m/s) | blur @1/250 | blur @1/500 | blur @1/1000 | RS shift @30 ms readout | Δt for 80 % overlap |
|---|---|---|---|---|---|---|---|---|---|
| 60 | 104 | 2.7 | 59 | 5 | 0.74 px | 0.37 px | 0.18 px | 5.5 px | 2.4 s |
| 80 | 139 | 3.6 | 78 | 6 | 0.67 px | 0.33 px | 0.17 px | 5.0 px | 2.6 s |
| 100 | 174 | 4.5 | 98 | 8 | 0.71 px | 0.36 px | 0.18 px | 5.3 px | 2.4 s |
| 100 | 174 | 4.5 | 98 | 12 | 1.07 px | 0.53 px | 0.27 px | 8.0 px | 1.6 s |

*(Computed from the formulas above. The 30 ms readout is the Inspire 1 figure from Vautherin et al. Your drone may differ.)*

Reading the table: at 1/500 s or faster, blur stays below half a pixel up to about 8 m/s. Rolling shutter is the bigger effect, which is why S3 models it and why slower is better. Around 2.4 s between keyframes gives about 80 % overlap, which matches the "one frame per 2.5 s" evidence.

### 5.3 Recommended profile

| Parameter | Recommendation | Notes |
|---|---|---|
| **Altitude** | **60–100 m AGL** (legal ceiling 120 m; ≤ 60 m in the 8–12 km airport band) | Lower gives finer GSD but less coverage and more rolling-shutter pixels. 80 m is a good default. |
| **Speed** | **5–8 m/s** | Use §5.2. Slow down in dim light. |
| **Gimbal** | **−60° to −70°** (20–30° forward-oblique) as default. **−45°** for facade-rich urban targets. | −45° sees more facades but risks sky and horizon at the top of the frame and has larger GSD variation. S2 masks sky. **Avoid −90° nadir** for the whole pass. |
| **Heading** | Aligned with the direction of travel, constant | Camera looks forward along track |
| **Altitude variation** | Gentle **±10–20 %** (e.g. climb 80 → 95 m over the first third, descend back) | Breaks the doming degeneracy at zero extra flight time |
| **Path shape** | Straight or **slightly curved** (a gentle S or arc with a lateral offset of about 10–20 % of the footprint) | Makes roll about the track observable |
| **Ends** | **Overshoot 50–100 m** beyond the target at both ends. Start recording **before** entering and stop **after** leaving. | Edges of a strip have the least overlap |
| **Yaw** | **No sharp yaw or spins.** If a turn is needed, keep it ≤ 10–15°/s. | Fast yaw causes blur and breaks matching |
| **Hover** | Avoid hovering mid-pass (zero baseline). Take-off, climb and landing are trimmed by S1. | |
| **Sun** | Sun behind or to the side. Avoid flying straight into the sun (flare). Prefer 10:00–15:00 for short shadows. | Shadows move little in a minutes-long pass |
| **Length** | 0.5–2 km pass (one battery with margin) | Monocular drift grows with length. Short DJI flights of 1–2 km are where learned SLAM reached about 0.5 % drift ([arXiv 2608.18632](https://arxiv.org/html/2608.18632)). |
| **Optional bonus** | A 20–30 s **orbit** at the end over a central feature, if time allows | Converging views help calibration. Log it as a separate segment. |

```
 Side view (altitude)                         Top view (path)
 95 m ─        ____________                    start ●──────╮
 80 m ─  _____/            \_____                            ╰──────╮
         |<-50-100m->|  target  |<-50-100m->|                        ╰──────● end
         overshoot                overshoot          (gentle arc, no sharp yaw)
 gimbal: −60°…−70° throughout (forward-oblique)
```

Manual or automated? Use the app's waypoint mission if it supports constant speed, altitude ramps and fixed gimbal pitch. Otherwise fly manually in "Cine/Tripod-like" smooth mode with a spotter calling the distance.

---

## 6. Ground checkpoint survey protocol

### 6.1 How many, and why

| Purpose | Count | Standard |
|---|---|---|
| **Final evaluation** (pitch numbers) | **≥ 30 independent checkpoints** | ASPRS Positional Accuracy Standards Ed. 2 (2023): RMSE only, **≥ 30 checkpoints**, checkpoints **≥ 2× more accurate** than the product ([LIDAR Magazine](https://lidarmag.com/2023/10/06/the-asprs-positional-accuracy-standards-edition-2/amp/)) |
| **Development** (iteration) | **≥ 10** | Enough to estimate bias vs noise |
| **GCPs** (optional, for anchoring experiments) | 1 (charter "single GCP" mode), kept **separate** from checkpoints | A checkpoint used in processing is no longer a checkpoint |

Accuracy needed for the survey:

| Product tier (charter §6) | Target | Checkpoint accuracy needed (≥ 2×) | Instrument |
|---|---|---|---|
| Anchored | ≤ 1 m CE90/LE90 | ≤ 0.5 m, aim for cm | RTK rover / CORS NRTK / DGPS |
| RTK/PPK | ≤ 0.10 m CE90 | **≤ 0.05 m** | RTK rover with a fixed solution, or a total station |

> ⚠ **Phone GNSS is not enough.** Smartphones and handheld recreational GPS units give metre-level accuracy (roughly 3–10 m). That is as bad as, or worse than, the drone's own GPS. Checkpoints measured with them cannot validate a ≤ 1 m product. Use them only to *find* targets, never to *measure* them.

### 6.2 Sources of survey-grade positions

| Option | Accuracy | How to get it |
|---|---|---|
| **Survey of India CORS (NRTK)** | about **±3 cm** real-time ([SoI CORS](https://cors.surveyofindia.gov.in/introduction.html)) | Free for government and academia; the private sector applies ([Geospatial World](https://geospatialworld.net/blogs/india-cors-network/)). Register the institute on the SoI CORS portal (⚠ verify current process) and use an RTK-capable GNSS rover with NTRIP. |
| **Borrowed RTK/DGPS rover** | 1–3 cm with a fixed solution | Civil engineering / surveying department of the college, state survey office, or a local survey firm |
| **Static GNSS + PPK against a CORS** | cm-level | Longer occupations (10–20+ min per point), post-processed |
| **Total station** tied to 2 GNSS points | mm–cm relative | Good for dense relative checks (distances, heights) |
| GAGAN-enabled receiver | about 1.5 m H / 2.5 m V ([Wikipedia GAGAN](https://en.wikipedia.org/wiki/GPS-aided_GEO_augmented_navigation)) | **Not** sufficient for checkpoints (fails the 2× rule for a 1 m product). Useful only as an anchor-source experiment. |

### 6.3 Target design

| Aspect | Specification |
|---|---|
| Size | ≥ **10 × GSD** per side. At 4.5 cm GSD (100 m) use **≥ 60 cm**. **1 m × 1 m** covers all our altitudes. |
| Pattern | Black/white **2×2 checker** (bow-tie), or a white "L" or cross on a dark background. The centre must be sharply defined. |
| Material | Matte vinyl, painted plywood, or tarpaulin weighted at the corners. Not glossy (sun glint). |
| Contrast | High contrast against the local ground (white/black on grey concrete, yellow/black on vegetation) |
| Label | A large ID number (visible at GSD) next to the target, e.g. "C07" |
| Natural checkpoints | Sharp painted road-marking corners or manhole centres. Acceptable for dev; use targets for the final evaluation. |
| Vertical checks | Include a few points on **roof corners or wall bases** if safely accessible, to test facade and roof heights |

### 6.4 Spatial distribution

- Spread checkpoints **along the whole pass** (start, middle, end) **and across the swath** (left edge, centreline, right edge). Doming and roll errors show up at the edges and ends.
- Include **off-centreline** points. A line of points on the track centre cannot detect roll about the track.
- Keep them ≥ 1 target-width away from tall objects that could occlude them in oblique views.
- Include **elevation variety** (low ground, embankments, roofs).
- Put ≥ 20 % of points in the **outer third** of the swath.
- Suggested layout for 30 points on a 1 km × 150 m swath: 10 cross-sections every about 100 m, each with 3 points (left, centre, right). Randomly jitter the positions by ±15 m.

### 6.5 Measurement procedure

1. Lay out and photograph each target (a ground photo with ID, for the audit trail).
2. With an RTK rover (CORS NRTK or a local base):
   - Wait for a **FIXED** solution. Reject FLOAT.
   - Occupy for **≥ 30 s** (average of ≥ 30 epochs), rod plumb, bubble centred.
   - Record the reported σ_H and σ_V and the PDOP (require PDOP < 3).
   - **Re-occupy each point a second time ≥ 30 min later**, or at least 10 % of the points. If the two sessions disagree by more than 3 cm H / 5 cm V, measure again.
3. Record the **CRS and height type** explicitly: WGS84 / ITRF **ellipsoidal** height (EPSG:4979) or orthometric (geoid) height, and the rod height applied. Drishti3D stores ellipsoidal heights internally. See [06-georeferencing-and-accuracy.md](06-georeferencing-and-accuracy.md).
4. Measure **3–5 tape or total-station distances** between targets for relative (length) accuracy checks.
5. Leave the targets in place until the flight is complete. Photograph them again after the flight to confirm they did not move.

### 6.6 Checkpoint CSV format

File: `data/raw/<flight_id>/survey/checkpoints.csv` (UTF-8, comma-separated, header required). The same format is used for `--gcp` files; the `role` column distinguishes them.

```csv
id,role,lat_deg,lon_deg,h_ellip_m,h_ortho_m,easting_m,northing_m,crs_proj,sigma_h_m,sigma_v_m,fix,pdop,n_epochs,rod_m,instrument,correction,datetime_utc,photo,notes
C01,CP,17.3850123,78.4867456,512.431,,,,EPSG:32644,0.012,0.018,FIXED,1.6,60,2.000,Emlid-RS2,SoI-CORS-NRTK,2026-10-18T05:12:33Z,C01.jpg,road corner
C02,CP,17.3861001,78.4871210,511.902,,,,EPSG:32644,0.011,0.020,FIXED,1.7,60,2.000,Emlid-RS2,SoI-CORS-NRTK,2026-10-18T05:15:02Z,C02.jpg,
G01,GCP,17.3855400,78.4869000,512.100,,,,EPSG:32644,0.010,0.017,FIXED,1.5,60,2.000,Emlid-RS2,SoI-CORS-NRTK,2026-10-18T05:20:40Z,G01.jpg,single anchor
```

| Column | Meaning |
|---|---|
| `role` | `CP` = independent checkpoint (**never** used in processing). `GCP` = may be used for anchoring. |
| `lat_deg, lon_deg, h_ellip_m` | **Required.** WGS84 (EPSG:4979) geographic + ellipsoidal height |
| `h_ortho_m` | Optional orthometric height, with its geoid model noted in `notes` |
| `easting_m, northing_m, crs_proj` | Optional projected coordinates. `crs_proj` is also the preferred output CRS (UTM zone). |
| `sigma_h_m, sigma_v_m, fix, pdop, n_epochs` | Quality evidence. The evaluator drops rows that are not FIXED. |
| `rod_m` | Antenna/rod height **already subtracted** (value recorded for the audit) |
| `correction` | `SoI-CORS-NRTK`, `local-base-RTK`, `PPK`, `total-station` … |
| `datetime_utc` | ISO 8601 **UTC** |

The instrument names and coordinates above are examples only.

---

## 7. Camera calibration

Fixed, calibrated intrinsics are the cheapest defence against doming (fixing K1 alone gave an order-of-magnitude reduction, [James & Robson 2014](https://discovery.ucl.ac.uk/id/eprint/1443475/1/esp3609.pdf)). Calibrate **once per drone model per video mode** (resolution, fps, dewarp setting, zoom).

### 7.1 Method A: checkerboard (lab or field)

1. Use the **same video mode** as the flight: resolution, fps, dewarp/distortion-correction setting, EIS off, zoom 1×.
2. Board: a large, rigid, flat checkerboard (e.g. A0 print on foam board or aluminium, 9×6 or more inner corners, squares ≥ 8 cm). The drone camera is focused at far distance, so a large board **several metres away** stays sharp. Close-up small boards will be out of focus with focus locked at infinity.
3. Record 1–2 min of video with the drone held or hovering, moving the board so it:
   - covers **all image regions**, especially the **corners and edges** (where distortion lives);
   - appears at multiple **tilts** (±30–45°) and distances.
4. Extract about 40–80 sharp frames (`scripts/calibrate_camera.py` rejects blurred ones with variance-of-Laplacian).
5. Solve with OpenCV (`cv2.calibrateCamera`, OPENCV/Brown model: fx, fy, cx, cy, k1, k2, p1, p2, [k3]). Require **RMS reprojection error < 0.5 px**. Inspect for per-corner outliers.
6. Save to `configs/cameras/<drone_model>_<WxH>_<fps>_<dewarp>.yaml` (camera intrinsics YAML, schema in [08 §2.6](08-data-formats-and-interfaces.md)), with the COLMAP camera-model string, the date and the RMS.

### 7.2 Method B: in-flight calibration flight

Use this when a checkerboard is impractical, or to cross-check Method A.

1. Pick a textured, 3D-rich site (buildings, trees, varied relief) in a green zone.
2. Fly **convergent** geometry in the same video mode: two orbits (e.g. 50 m and 80 m AGL) around a central point with the gimbal at −35° to −50°, plus one nadir cross.
3. Run COLMAP with **free intrinsics** (shared across frames) on keyframes. The convergent geometry makes K1–K3 observable.
4. Freeze the result as the camera file. Compare it with Method A: fx within about 0.5 %, and distortion curves overlapping within 1 px at the image corners.

### 7.3 Rolling-shutter readout

Take the readout time from the vendor or ODM profile for your model if one is available. Otherwise, estimate it by filming a fast horizontal pan of vertical lines (e.g. a building edge), or let S3 estimate it from a flight at a known speed ([Vautherin et al. 2016](https://isprs-annals.copernicus.org/articles/III-3/139/2016/isprs-annals-III-3-139-2016.pdf) show velocity can be estimated from the rolling-shutter effect). Store it in the same camera JSON.

---

## 8. Public datasets to use

Use these while our own flights are pending and for reproducible benchmarks. **Check each dataset's licence** before use and before any derived weights ship ([07 §8.3](07-tech-stack.md)).

| Dataset | What it provides | Best for | Caveats |
|---|---|---|---|
| **MARS-LVIG** (IJRR 2024, HKU MaRS) | 21 downward-looking sequences at **80–130 m**, 3–12 m/s, paths up to 7.1 km. Global-shutter RGB, IMU, raw GNSS, **RTK ground-truth poses**, **DJI L1 LiDAR map** ([IJRR](https://journals.sagepub.com/doi/abs/10.1177/02783649241227968); [download](https://mars.hku.hk/dataset.html)) | Closest public stand-in for a single pass. S3 drift, S4 anchoring, **doming test** vs LiDAR DSM. | Global shutter (so no rolling-shutter test). Nadir. Images, not DJI MP4 + SRT. Needs an ingest adapter. |
| **UseGeo** (3DOM-FBK) | 829 UAV images (7952×5304) across 3 datasets. LiDAR point clouds and **ground-truth depth maps** ([GitHub](https://github.com/3DOM-FBK/UseGeo)) | S5 dense accuracy, depth/point-cloud error | Stills block, not video |
| **UAVD4L** (3DV 2024) | About 2.5 km² urban and rural area. **RTK/GCP-aligned textured mesh + DSM**, rendered RGB/depth, 6-DoF localisation queries ([arXiv 2401.05971](https://arxiv.org/abs/2401.05971); [GitHub](https://github.com/RingoWRW/UAVD4L)) | S4 **registration to a prior model / reference DSM** | Localisation-oriented |
| **UAVScenes** (2025) | Multi-modal UAV benchmark related to MARS-LVIG ([arXiv 2507.22412](https://arxiv.org/pdf/2507.22412)). Used in the GeoFF3D evaluation. | Long-sequence comparisons with published feed-forward results | ⚠ verify contents and licence |
| **ODM sample data** (`OpenDroneMap/odm_data_*` repos) | Small real drone image sets for smoke tests ([ODM GitHub](https://github.com/OpenDroneMap/ODM)) | CI smoke tests, M1 baseline | Mostly stills. Few or no video + SRT sets. ⚠ verify per repo. |
| **SensatUrban** | Large photogrammetric urban point clouds (UK cities) with **per-point semantic labels** (ground, vegetation, building, road, car, etc.). *From background knowledge; not verified in our research notes.* | S6 classification training and validation | ⚠ verify licence (often research/non-commercial) and exact class list |
| **Own flights** (§5–§6) | DJI MP4 + SRT + ≥ 30 RTK checkpoints | **Final accuracy table**, demo | The only source of real forward-oblique single-pass video with ground truth. No public benchmark exists for this ([report](../reports/Drishti3D_Research_Report.pdf)). |

---

## 9. Data handling

### 9.1 Naming convention

```
data/raw/<YYYYMMDD>_<site>_<drone>_<flightNN>/
├── video/        DJI_0001.MP4  DJI_0001.SRT      # original names, never renamed separately
├── rtk/          (optional) *.pos, *.obs, *.ubx, RINEX
├── survey/       checkpoints.csv  gcp.csv  photos/C01.jpg …
├── calib/        (optional) calibration videos
├── admin/        digitalsky_zone.png  permission.pdf  flight_log.md
└── MANIFEST.sha256
```

Example: `data/raw/20261018_campus-east_mini4pro_f02/`.

- Site slug: lowercase, hyphens, no spaces.
- **Never rename** the video without renaming its SRT identically (ODM matches them case-sensitively; our ingest does too).
- `flight_log.md` records: date, **local timezone** (IST +05:30), pilot, drone model and UIN, firmware, camera settings (§4), altitude, speed, gimbal, weather, notes on anything unusual.

### 9.2 Integrity

```bash
cd data/raw/20261018_campus-east_mini4pro_f02
find . -type f ! -name MANIFEST.sha256 -print0 | sort -z | xargs -0 sha256sum > MANIFEST.sha256
sha256sum -c MANIFEST.sha256        # verify after every copy
chmod -R a-w video/ survey/         # raw data is read-only
```

Every run records the input SHA256s in `runs/<id>/inputs.sha256` ([10 §9](10-setup-and-repo-structure.md)).

### 9.3 Storage and compliance

| Rule | Why |
|---|---|
| Copy the SD card to **two** team-controlled disks the same day. Keep the card until both copies verify. | Flights are expensive to repeat |
| Store raw data and outputs on **team-owned drives or India-hosted storage**. **Do not** upload high-accuracy outputs (≤ 1 m H / ≤ 3 m V) to foreign-hosted cloud services. | DST 2021: data finer than 1 m H / 3 m V must be stored and processed in India by Indian entities ([DST guidelines](https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf)). This also matches the charter's offline-first principle. ⚠ verify how this applies to specific services. |
| Do not fly, store or publish imagery of sensitive or restricted locations (the DST **negative list**, defence sites) | Legal and ethical. The negative list was not retrieved in detail; ⚠ verify. |
| Blur faces and number plates in any **public** demo material (S2 masks help) | Privacy |
| Never commit raw data or outputs to git (see [10 §8](10-setup-and-repo-structure.md)) | Repo size and compliance |
| Share only derived, down-sampled demo products publicly. Full-resolution data stays in-team. | Principle of least exposure |

---

## 10. Checklists

### 10.1 Pre-flight (day before and on site)

| # | Item | ✔ |
|---|---|---|
| **Admin** | | |
| 1 | Digital Sky zone = green, screenshot saved (on the day) | ☐ |
| 2 | Permission letter, drone UIN, pilot RPC (if required) on hand ⚠ verify | ☐ |
| 3 | Weather and wind forecast OK. Sunrise/sunset times noted. | ☐ |
| **Survey** | | |
| 4 | Checkpoint plan printed (≥ 30 for final, ≥ 10 for dev), targets numbered | ☐ |
| 5 | RTK rover charged, CORS/NTRIP login tested, rod height noted | ☐ |
| 6 | Targets laid, photographed, surveyed with a FIXED solution (§6.5) | ☐ |
| **Drone** | | |
| 7 | Firmware as recorded (no surprise updates on site) | ☐ |
| 8 | SD card: high-speed class, formatted **in the drone**, enough free space | ☐ |
| 9 | Lens and gimbal clean. Gimbal calibrated. IMU/compass calibrated if prompted. | ☐ |
| 10 | **Subtitles/SRT ON** · 4K · 25/30 fps · max bitrate · codec chosen | ☐ |
| 11 | **Shutter ≥ 1/500** (prefer 1/1000) · ISO capped · **exposure and WB locked** · **focus locked** · **zoom 1×** · **EIS off** · HDR/night off | ☐ |
| 12 | Gimbal pitch set (−60° to −70°, or −45°) | ☐ |
| 13 | Max altitude ≤ 120 m, RTH altitude set, geofence set | ☐ |
| 14 | Waypoint mission loaded (speed 5–8 m/s, altitude ramp, overshoot 50–100 m) or manual route briefed | ☐ |
| 15 | Controller clock synced. Timezone noted in the flight log. | ☐ |
| 16 | 3-second test recording, then check that an SRT file appears alongside the video | ☐ |

### 10.2 In flight

| # | Item | ✔ |
|---|---|---|
| 1 | Start recording **before** entering the target area | ☐ |
| 2 | Smooth constant speed, no sharp yaw, gimbal steady | ☐ |
| 3 | Spotter watches airspace and people. Pilot watches battery. | ☐ |
| 4 | Stop recording **after** leaving the target area (overshoot) | ☐ |
| 5 | Optional: short end orbit as a separate clip | ☐ |

### 10.3 Post-flight

| # | Item | ✔ |
|---|---|---|
| 1 | Drone powered off, battery temperature checked, flight time logged | ☐ |
| 2 | Targets re-photographed (not moved). A few checkpoints re-occupied (§6.5). | ☐ |
| 3 | Copy card to **two** disks. Build `MANIFEST.sha256` and verify both copies. | ☐ |
| 4 | Confirm each MP4 has a matching SRT, and that the SRT has about one entry per frame (`drishti ingest --inspect-srt`) | ☐ |
| 5 | `checkpoints.csv` exported in the §6.6 format. Roles (CP/GCP) assigned. Non-FIXED rows flagged. | ☐ |
| 6 | `flight_log.md` completed (settings, timezone, weather, anomalies) | ☐ |
| 7 | Quick `--profile preview` run on site or the same evening to confirm the data is usable | ☐ |
| 8 | Raw folder made read-only. Nothing uploaded to foreign cloud. | ☐ |
| 9 | Debrief: what to change next flight (speed, altitude, gimbal, exposure) | ☐ |

---

## Related documents

- [00-project-charter.md](00-project-charter.md): single source of truth (targets, principles)
- [01-problem-statement.md](01-problem-statement.md)
- [02-solution-overview.md](02-solution-overview.md)
- [03-requirements.md](03-requirements.md)
- [04-system-architecture.md](04-system-architecture.md)
- [05-pipeline-design.md](05-pipeline-design.md)
- [06-georeferencing-and-accuracy.md](06-georeferencing-and-accuracy.md): CRS, CE90/LE90, anchoring
- [07-tech-stack.md](07-tech-stack.md): tools and licences (datasets §8.3)
- [08-data-formats-and-interfaces.md](08-data-formats-and-interfaces.md)
- [09-viewer-and-ui.md](09-viewer-and-ui.md)
- [10-setup-and-repo-structure.md](10-setup-and-repo-structure.md)
- [11-testing-and-evaluation.md](11-testing-and-evaluation.md): evaluation protocol that uses these checkpoints
- [13-project-plan.md](13-project-plan.md): M3 real flight with ≥ 30 checkpoints
- [14-demo-and-pitch.md](14-demo-and-pitch.md)
- [15-research-and-references.md](15-research-and-references.md)
- [16-glossary.md](16-glossary.md)
