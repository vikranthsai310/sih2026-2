# 15 · Research and References

> **Purpose:** a summary of the research behind Drishti3D, organised by topic with the key numbers, followed by a full categorised and annotated bibliography of every source in our research set, a list of claims still to verify, and a recommended reading order.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R2 (Geo & Accuracy Lead) with R6 · Must agree with [`00-project-charter.md`](00-project-charter.md)

---

## 1. Where the research lives

| Item | Path | What it is |
|---|---|---|
| Research report | [`reports/Drishti3D_Research_Report.pdf`](../reports/Drishti3D_Research_Report.pdf) | The synthesis: "GPS anchoring turns single-pass video metric". Read this first. |
| Research notes | [`research_notes/Single pass drone 3D reconstruction/`](../research_notes/Single%20pass%20drone%203D%20reconstruction/) | Six raw note files with cited findings, inferences and gaps |
| — | `commercial_and_defense_products.md` | DJI, Pix4D, Skydio, SkyeBrowse, Metashape, iTwin, Esri; Raptor, Edgybees, OWT/RAPTRS, WRIVA |
| — | `georeferencing_and_accuracy.md` | Consumer GNSS vs RTK/PPK, video vs stills, doming, time sync, rolling shutter, ASPRS |
| — | `india_and_sih_context.md` | PS 26158 text, SIH timeline, competitor repos, SVAMITVA, DST rules, CORS/GAGAN/NavIC, NTRO |
| — | `neural_rendering_and_scene_challenges.md` | NeRF/3DGS at aerial scale, dynamics, blur, illumination, occlusion, delivery formats |
| — | `open_source_and_realtime_systems.md` | ODM, COLMAP/GLOMAP, Meshroom, gsplat, OpenREALM, SRT/KLV parsers, viewers, datasets |
| — | `slam_and_feedforward_research.md` | SLAM benchmark on UAV footage, feed-forward models, SfM, metric depth, single-pass work |

Research date for all of the above: **30 Sep 2026**. Source-quality flags used in the notes: *[verified]* / *[V]* = read from the fetched page; *[paper]* / *[K]* = cited to the canonical page from prior knowledge; *(abstract/snippet)* = only a search abstract was available; *[unverified this session]* = a lead, not a citation.

## 2. Summary of findings by topic

### 2.1 Headline

No product or paper (as of 30 Sep 2026) turns one monocular drone video pass with consumer GPS into a **validated**, georeferenced, textured mesh in near-real time. **Relative 3D is essentially solved; absolute georeferencing is the open problem.** Consumer GNSS error is a near-rigid offset that one good anchor removes. Single straight passes add doming and roll ambiguity. This is the basis of the charter's thesis (§3).

### 2.2 Commercial products

| Finding | Number | Source |
|---|---|---|
| DJI Terra in-mission real-time 3D is "of low accuracy"; re-process originals for accuracy | — | DJI Terra FAQ [B1] |
| DJI Terra accurate mode: P4 RTK at 100 m, no GCPs | 2–5 cm H (2D), "within 4 cm" (3D); ≈1–2× GSD | [B1] |
| FlightHub 2 rapid modelling (Feb 2026) | ≤500 thumbnails → 3DGS/photogrammetry in ~5 min; no accuracy published | [B4] |
| Skydio X10 Onboard Modeling | 1920×1440 thumbnails, ~30 images/min, no accuracy spec | [B13][B14] |
| Pix4Dreact | 2D orthomosaic from stills only; PIX4Dmapper video import loses EXIF | [B8][B10] |
| SkyeBrowse (closest analogue) | single ~2-min **orbit** video → model in minutes; vendor claims 0.5 in / 0.1 in, unvalidated, likely relative | [B16][B17] |
| Metashape, iTwin Capture | Video = frame extraction into normal SfM; Metashape reportedly reads DJI SRT | [B22][B25] |

### 2.3 Defence and intelligence

| Finding | Number | Source |
|---|---|---|
| Vantor (Maxar) Raptor registers FMV to prior 3D terrain (>90 M km²), no new 3D | Sync/Ace <3 m; Guide <10 m RMSE | [C1][C2] |
| Edgybees georegisters video to satellite imagery "in seconds" | 1–2 m | [C6] |
| US Army One World Terrain / RAPTRS | ~1 km² in 3D in ~3 h (was weeks), dedicated collection | [C10] |
| IARPA WRIVA (2023, 42 months) | camera geolocation within 5 m from sparse imagery | [C14] |
| **Lesson:** prior geospatial data + live registration gives metre-level absolute accuracy without GCPs → our S4 anchoring | | |

### 2.4 Accuracy and georeferencing

| Finding | Number | Source |
|---|---|---|
| Consumer GNSS only (Zhang et al., 45 m, 16 checkpoints) | RMSE 2.29 m H, 3.93 m Z; **Z mean 3.93 m, SD 0.18 m** (rigid bias) | [D1] |
| Same study, GoPro | XY 1.53 m, Z 3.89 m; XY SD 0.065 m | [D1] |
| PPK, 0 GCP | XY 2.4 cm, Z 2.2 cm ≈ 8-GCP solution; still recommend 1 GCP | [D1] |
| P4 RTK direct georeferencing, 71 checkpoints | H 1–3 cm, V 4–6 cm (abstract) | [D5] |
| DJI/DroneDeploy whitepaper | distances within 0.1–0.3 % of truth | [D4] |
| Video vs stills (2021) | 1 frame/2.5 s video: 1.1–2.7 cm boundary RMSE vs 1.3–2.8 cm photo (abstract) | [D12] |
| 4K frame vs still | ~8 MP vs ~20 MP | [B30] |
| Rolling shutter (Vautherin et al. 2016) | 74 ms (Phantom 2 V+), 30 ms (Inspire 1) → ~10 px / ~4 px at 8 m/s, 70 m | [D33] |
| Time sync for cm-level direct georeferencing | < 1 ms at 10–30 m/s | [D29] |
| DJI SRT | per-frame lat/lon/alt/focal; local time, no timezone; latency unmeasured | [D13] |
| Doming (James & Robson 2014) | metre-scale in simulation, ~0.2 m real; 20–30° oblique → 1–2 orders less; fixing K1 → 10× less; 2nd azimuth alone does not help | [D15] |
| Oblique recommendation | 20–45° obliques ≥10 % of block | [D16] |
| Corridor, pre-calibrated camera + GNSS, no GCPs | 5.9 / 3.3 / 7.0 cm (X/Y/Z) over 1,200 × 180 m | [D20] |
| ASPRS Ed. 2 (2023) | RMSE only; ≥30 checkpoints; checkpoints ≥2× more accurate | [D37][D38][D39] |
| Conversions | CE90 ≈ 2.146 × per-axis RMSE; LE90 = 1.6449 × RMSE_Z | [D40][D41] |
| Derived: Zhang consumer GNSS | ≈3.5 m CE90, ≈6.5 m LE90 (derived, not sourced) | [D1] + [D41] |
| GS from video with GNSS (2026) | 4.8 mm ICP RMS internal, **5.26 m CE90** absolute | [D42] |
| Collinear GPS cannot fix roll about the track | derived inference | report |

### 2.5 Research methods (SLAM, feed-forward, SfM, neural rendering)

| Finding | Number | Source |
|---|---|---|
| Monocular SLAM on nadir UAV footage (Spagnolo et al. 2026), DJI flights 1–2 km at 110–120 m | MASt3R-SLAM 0.53 %, DROID-SLAM 0.58 %, ORB-SLAM3 2.40 %, DPVO 5.75 %, VGGT-SLAM 2.0 6.34 % horizontal drift | [F1] |
| Same, long runs | vertical RMSE >100 m in 29/34; longest: "no method yields a usable trajectory" | [F1] |
| Same, compute | DROID/MASt3R/VGGT-SLAM ~30 GB GPU; DPVO <3 GB; only ORB-SLAM3 on CPU | [F1] |
| Feed-forward on aerial blocks (Wu et al.) | up to +50 % completeness vs COLMAP on <10 images at 518 px; "cannot fully replace" SfM/MVS | [G1] |
| UAVFF3D | aerial adaptation: ATE −76 %, Chamfer −41 % | [G7] |
| **GeoFF3D** | GPS-anchored, metric Z-up; ~2,000 images in ~5 min; F@5 0.848 vs 0.687 (Pi3X) vs 0.451 (SLAM) | [G9] |
| Licences | VGGT original non-commercial; **VGGT-1B-Commercial excludes military**; DUSt3R/MASt3R non-commercial; GeoFF3D/MapAnything/π3/DA3 unverified | [G13] |
| AerialMetric (ECCV 2026) | "significant domain gaps" for monocular metric depth on UAV imagery | [G29] |
| GLOMAP | "orders of magnitude faster" than incremental COLMAP; merged as COLMAP global mapper | [H10][H14] |
| COLMAP 4.x | GPS/gravity priors, ALIKED/LightGlue, GPU BA "1–2 orders faster" (dates inconsistent — verify) | [H16] |
| Large-scale 3DGS (DOGS table) | 2.5–4.5 h vs 18–23 h vanilla 3DGS; PSNR differences <1 dB | [K1] |
| GS geometry | ISPRS 2026: "generally slightly lower than traditional photogrammetry"; city benchmarks use 1 m TSDF voxels | [K16][K7] |
| PGSR | 0.52 mm DTU Chamfer in 0.5 h; per-image exposure compensation | [K13] |
| DroneSplat (CVPR 2025) | SAM v2 masking; +0.9 to +2.4 dB PSNR on 24 drone scenes | [L1] |
| SLAM + GS systems | ~0.3–3.7 fps, mostly indoor | [K28][K30] |
| City3D | infers walls from roof planes; 20,000-building dataset | [L25] |

### 2.6 Open source and real-time

| Finding | Number | Source |
|---|---|---|
| ODM ingests video + DJI SRT since v3.0.4 | default `--video-limit` 500 frames; outputs ortho, DSM/DTM, LAZ, OBJ/PLY, `--3d-tiles` | [H1][H3] |
| ODM speed | 242 images ultra: 124 min CPU / 62 min GPU; ~40 GB RAM peak | [H9] |
| ODM licence | AGPL-3.0 | [H1] |
| OpenREALM | real-time SLAM + 2.5D map + ortho; Jetson Xavier NX; alpha ROS1, last major update ~2020 | [I1][I5] |
| CPU near-real-time mosaicking | 2.3 fps | [I7] |
| KLV | `klvdata` decodes MISB ST 0601 from STANAG 4609 | [J10] |
| Delivery | KHR_gaussian_splatting in CesiumJS 1.139 / Cesium for Unreal 2.23 (Mar 2026); splat LOD in 3D Tiles (Apr 2026) | [M1][M4][M5] |
| Datasets | MARS-LVIG: 21 sequences, 80–130 m, RTK poses + DJI L1 LiDAR map | [N1][N2] |

### 2.7 India and SIH

| Finding | Number | Source |
|---|---|---|
| PS 26158: NTRO, Software, Robotics & Drones; inputs video + GPS + metadata; optional IMU/baro/intrinsics/RTK-PPK | — | [A1][A4] |
| Targets cited by team repos | <15 min for 10-min video; ≤1 m — **mirror says no explicit targets: verify** | [A7][A8] |
| SIH 2026 | launched 21 Aug; ideas close ~30 Sep; shortlist ~Nov (4–5 teams/PS); 36-h finale Dec | [A3][A2] |
| Competitors | ≥10 public repos; Tesseract: 548 s synthetic 10-min flight, 0.344 m median error on synthetic data | [A7] |
| DST 2021 | data finer than 1 m H / 3 m V: Indian-owned, stored and processed in India | [E1] |
| SoI CORS | ±3 cm RTK/NRTK, ~1,000+ stations, free for govt/academia | [E6][E7] |
| GAGAN / NavIC | ~1.5 m H, 2.5 m V / ~5–20 m | [E9][E11] |
| SVAMITVA | ~3.3 lakh villages, 1:500, ±5 cm with RTK/PPK + CORS | [E17][E21] |
| Drone Rules 2021 | green zone up to 120 m without permission; red zones need central permission | [E12] |
| SIH→adoption | ISRO accepted a video-geotagging tool after SIH 2024 | [A15] |

## 3. Annotated bibliography

Every URL in the report and the six research notes, deduplicated and grouped. IDs (e.g. `[D1]`) are used in §2 and in other docs. Flags: **(vendor)** vendor claim · **(secondary)** blog/mirror/summary · **(abstract)** only abstract/snippet seen · **(lead)** marked unverified in the notes.

### A. SIH 2026, PS 26158 and competitor repositories

| ID | Source | Annotation |
|---|---|---|
| A1 | [zaidsayyed.in — SIH26158 page](https://zaidsayyed.in/tools/sih-problem-statements/sih26158) | PS mirror: background, required/optional inputs, named challenges, applications; states no explicit numeric targets (secondary) |
| A2 | [zaidsayyed.in — SIH 2026 playbook](https://zaidsayyed.in/blog/sih-2026) | SIH 2026 timeline and process (secondary) |
| A3 | [Reskilll — SIH 2026 launched: timeline](https://reskilll.com/blogs/smart-india-hackathon-2026-launched-timeline-registration-how-to-participate/) | Launch 21 Aug 2026, idea deadline ~30 Sep, evaluation criteria, ~4–5 teams per PS, Dec finale (secondary) |
| A4 | [NoBugNinja — SIH 2026 PS list](https://github.com/NoBugNinja/Smart-India-Hackathon-SIH-2026-Problem-Statements/blob/main/README.md) | PS title, NTRO, Robotics & Drones theme; other NTRO and related drone PS |
| A5 | [blinknbuild — SIH 2026 all 226 PS catalogue](https://www.blinknbuild.in/Assets/SIH_2026_All_226_Problem_Statements_Master_Catalogue.pdf) | SIH 2026 has 226 problem statements (secondary) |
| A6 | [aerotwin/drone-video-to-3d](https://github.com/aerotwin/drone-video-to-3d) | Team repo; framing of conventional overlap (80 %+/70 %+) and 45–90 min grid flights |
| A7 | [kartikshirode/sih26158-single-pass-3d (Tesseract)](https://github.com/kartikshirode/sih26158-single-pass-3d) | Most mature competitor: COLMAP global mapper + OpenMVS, SRT alignment, "honest output" manifest; 548 s synthetic 10-min, 0.344 m median synthetic error; cites "inferred targets" |
| A8 | [HoneyBadger-010/Scout-3D](https://github.com/HoneyBadger-010/Scout-3D) | Competitor; cites <15 min and ≤1 m targets and output formats |
| A9 | [noob-rishav/SIH26158-Drone-3D-Reconstruction](https://github.com/noob-rishav/SIH26158-Drone-3D-Reconstruction) | Competitor; replaces GCPs with GPS+IMU; lists scene contents |
| A10 | [Gambheer-Gowda/Trinetra-3D](https://github.com/Gambheer-Gowda/Trinetra-3D) | Competitor repo |
| A11 | [Jyotiraditya1006/Aero3D](https://github.com/Jyotiraditya1006/Aero3D) | Competitor repo |
| A12 | [chandana-ux/AeroSphere](https://github.com/chandana-ux/AeroSphere) | Competitor repo |
| A13 | [pavan0010gowda/SIH-2026---26158](https://github.com/pavan0010gowda/SIH-2026---26158-Single-Pass-Drone-Video-to-3D-Model) | Competitor repo |
| A14 | [supreetborikar-build/SIH26](https://github.com/supreetborikar-build/SIH26) | Competitor repo |
| A15 | [PIB — SIH 2024 document](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/dec/doc20241211470201.pdf) | Post-SIH 2024 adoption: ISRO accepted 4 solutions incl. video geotagging; DRDO 1; NTRO as PS provider |
| A16 | [Project-GaRuDa1/garuda-frontend-prototype](https://github.com/Project-GaRuDa1/garuda-frontend-prototype) | Competitor frontend prototype |
| A17 | [Wraient/SIH-2024-Problems](https://github.com/Wraient/SIH-2024-Problems) | SIH 2024 PS incl. SIH1704/1705 (SVAMITVA drone orthophotos) |
| A18 | [DRIEMS — SIH 2024 PS PDF](https://www.driems.ac.in/wp-content/uploads/2024/08/SIH_2024_PS.pdf) | SIH 2024 PS list PDF |
| A19 | [npmkrish/droneorthophotos](https://github.com/npmkrish/droneorthophotos) | SIH 2024 "Drone Orthophoto Generation System" repo (OpenCV + GDAL), no metrics |
| A20 | [Scribd — SIH 2025 comprehensive analysis](https://www.scribd.com/document/931632260/Smart-India-Hackathon-2025-Comprehensive-Analysis) | SIH 2025 hardware PS SIH250470 "Disaster Response Drone" (secondary) |
| A21 | [Kaggle — SIH 2024 PS with winning teams](https://www.kaggle.com/datasets/adharshinikumar/sih-2024-ps-with-winning-teams-and-solutions/data) | Dataset of SIH 2024 PS and winners |
| A22 | [ISRO SAC VEDAS — SIH 2024](https://vedas.sac.gov.in/en/sih2024.html) | ISRO SAC/VEDAS geospatial PS for SIH 2024 |

### B. Commercial products

| ID | Source | Annotation |
|---|---|---|
| B1 | [DJI Terra FAQ](https://enterprise.dji.com/dji-terra/faq) | Real-time 3D "low accuracy"; RTK P4 at 100 m: 2–5 cm 2D, within 4 cm 3D; accuracy ≈1–2× GSD; hardware; no video input (vendor) |
| B2 | [DJI Terra User Manual v4.0](https://dl.djicdn.com/downloads/dji-terra/20240118/DJI_Terra_User_Manual_v4.0__EN.pdf) | Re-import originals after mission for high accuracy (vendor) |
| B3 | [DJI Terra User Manual v4.3](https://dl.djicdn.com/downloads/dji-terra/20241024/DJI_Terra_User_Manual_v4.3_EN.pdf) | Accuracy factors; RTK-FIX formula for obliques (from a search summary, not verified) (vendor) |
| B4 | [DJI blog — FlightHub 2 new version / Zenmuse L3 (2026)](https://enterprise-insights.dji.com/blog/blog/dji-flighthub-2-new-version-zenmuse-l3-2026) | Rapid modelling: ≤500 thumbnails → 3DGS/photogrammetry in ~5 min; no accuracy figure (vendor) |
| B5 | [DJI blog — Terra updates, faster processing](https://enterprise-insights.dji.com/blog/dji-terra-updates-faster-data-processing) | ~20 % faster real-time 3D, optimised RTK real-time accuracy (vendor) |
| B6 | [DJI blog — Terra V4.4 (Mar 2025)](https://enterprise-insights.dji.com/blog/new-terra-update-march-2025) | "Focus Accuracy Compensation" for Matrice 4E data (vendor) |
| B7 | [DJI blog — Top features of Matrice 4 series](https://enterprise-insights.dji.com/blog/top-features-of-the-matrice-4-series) | Smart 3D Capture rough model on controller for route planning; distortion <2 px residual (vendor) |
| B8 | [Pix4Dreact product page](https://www.pix4d.com/product/pix4dreact) | Rapid offline 2D orthomosaics from images for public safety (vendor) |
| B9 | [Pix4Dreact FAQ](https://support.pix4d.com/hc/en-us/articles/360033543611) | Inputs: RGB JPG/TIF and thermal R-JPEG (vendor) |
| B10 | [Pix4D support — using videos for processing](https://support.pix4d.com/hc/en-us/articles/205294735) | PIX4Dmapper extracts frames from .avi/.mp4; EXIF lost, default camera params (snippet) |
| B11 | [Pix4D community — importing photos extracted from video](https://community.pix4d.com/t/importing-photos-extracted-from-video/25262) | Feature request implying PIX4Dmatic lacked native video import |
| B12 | [Esri newsroom — Esri and Pix4D real-time terrestrial mapping](https://www.esri.com/about/newsroom/announcements/esri-and-pix4d-launch-real-time-terrestrial-mapping-workflow) | Real-time workflow is terrestrial (PIX4Dcatch), not aerial single pass |
| B13 | [Skydio support — Onboard Maps and Models (X10)](https://support.skydio.com/hc/en-us/articles/20938651178907-How-to-create-Onboard-Maps-and-Models-with-Skydio-X10) | 1920×1440 thumbnails, ~30 images/min, glTF mesh / ortho TIFF (vendor) |
| B14 | [Skydio blog — X10 onboard modeling](https://www.skydio.com/blog/skydio-x10-revolutionizing-3d-scanning-with-onboard-modeling) | "Within minutes after the flight"; coverage heatmap; no accuracy spec (vendor) |
| B15 | [Skydio X10 page](https://www.skydio.com/x10) | Full data exported to Pix4D, Bentley, DroneDeploy, Esri for deliverables (vendor) |
| B16 | [The Drone Girl — SkyeBrowse (18 Sep 2026)](https://www.thedronegirl.com/2026/09/18/skyebrowse/) | Single continuous video, ~2-min orbit, minutes to model; 0.5 in / 0.1 in claims; pricing |
| B17 | [SkyeBrowse home](https://www.skyebrowse.com/) | Tiered accuracy claims "without GCPs", "court-admissible" (vendor) |
| B18 | [SkyeBrowse about](https://www.skyebrowse.com/about) | Company/accuracy claims (vendor) |
| B19 | [SkyeBrowse — Pix4D review](https://www.skyebrowse.com/news/posts/pix4d-review) | Claims Pix4Dreact has no video input (competitor, biased) |
| B20 | [SkyeBrowse — videogrammetry vs photogrammetry](https://www.skyebrowse.com/news/posts/videogrammetry-vs-photogrammetry) | Video frame vs still resolution discussion (vendor) |
| B21 | [DroneDJ 2021 — SkyeBrowse](https://dronedj.com/2021/06/15/skyebrowse-3d-models-drone-videos/) | 2021 coverage of DJI video → 3D models |
| B22 | [Agisoft forum — drone location metadata (SRT)](https://www.agisoft.com/forum/index.php?topic=15164.0) | Users report Metashape reads matching DJI .SRT for geotags |
| B23 | [Agisoft forum — drone video to georeferenced 3D tutorial](https://www.agisoft.com/forum/index.php?topic=4967.0) | Community tutorial for video workflow |
| B24 | [Metashape Pro manual 1.6](https://www.agisoft.com/pdf/metashape-pro_1_6_en.pdf) | File > Import Video extracts frames at a set rate |
| B25 | [Wingtra — Bentley iTwin Capture overview](https://wingtra.com/best-photogrammetry-software/bentley-contextcapture/) | iTwin Capture imports video; meshes and splats; GCPs for precision (third party) |
| B26 | [Bentley iTwin Capture Engine](https://www.bentley.com/en/products/itwin-capture-engine/) | Product page (vendor) |
| B27 | [Esri Site Scan for ArcGIS](https://www.esri.com/en-us/arcgis/products/arcgis-reality/products/site-scan-for-arcgis) | Cloud drone mapping, repeatable flight plans (vendor) |
| B28 | [Esri blog — Site Scan 2025 wrap-up](https://www.esri.com/arcgis-blog/products/site-scan/imagery/2025-wrap-up-elevating-reality-mapping-with-site-scan-for-arcgis) | 2025 Site Scan updates (vendor) |
| B29 | [ENR — ArcGIS Reality launch](https://www.enr.com/articles/55895-esri-launches-arcgis-reality-suite-to-get-reality-capture-data-into-gis) | ArcGIS Reality launched 7 Feb 2023 |
| B30 | [PhotoModeler Tip 47 — stills from video](https://www.photomodeler.com/tip-47-extract-stills-from-video-for-photogrammetry/) | 4K frame ≈ 8 MP vs 20 MP stills; compression, blur, rolling shutter |

### C. Defence and intelligence

| ID | Source | Annotation |
|---|---|---|
| C1 | [Vantor Raptor product page](https://vantor.com/product/mission-solutions/raptor) | Guide <10 m RMSE positioning; Sync/Ace <3 m; registers FMV to existing 3D; no 3D generation (vendor) |
| C2 | [Via Satellite — Maxar debuts Raptor (25 Mar 2025)](https://www.satellitetoday.com/imagery-and-sensing/2025/03/25/maxar-debuts-raptor-software-that-uses-3d-data-for-drone-positioning/) | Raptor debut; 3D base >90 M km² |
| C3 | [GIS Resources — Raptor GPS-denied navigation](https://gisresources.com/maxars-raptor-software-sets-new-standard-for-gps-denied-drone-navigation/) | Secondary coverage of Raptor |
| C4 | [Vantor on X — World Defense Show demo](https://x.com/vantortech/status/2039679286689288524) | Raptor shown live in Saudi Arabia (2026) |
| C5 | [PR Newswire — Edgybees Series A (2021)](https://www.prnewswire.com/news-releases/edgybees-closes-9-5m-in-series-a-funding-delivers-breakthrough-geo-mapping-accuracy-and-speed-for-lifesaving-aerial-video-301229909.html) | Real-time georegistration and AR overlay; $9.5 M Series A; no 3D generation |
| C6 | [BAE GXP — Edgybees](https://www.geospatialexploitationproducts.com/third-party-solutions/edgybees/) | Georegisters "in seconds" to within 1–2 m |
| C7 | [PR Newswire — Edgybees + Hood Tech](https://www.prnewswire.com/news-releases/aerial-video-takes-a-big-leap-towards-real-time-situation-awareness-powered-by-edgybees-geo-registration-software-and-hoodtechs-sensors-301263850.html) | Integration with Hood Tech aerial sensors |
| C8 | [BAE SOCET GXP](https://www.geospatialexploitationproducts.com/content/socet-gxp/) | Photogrammetric terrain/DSM/point-cloud from imagery |
| C9 | [SOCET GXP brochure 2024](https://www.geospatialexploitationproducts.com/wp-content/uploads/2024/12/SOCET-GXP-Brochure.pdf) | GXP InMotion FMV analysis; no public video-to-3D function |
| C10 | [army.mil — One World Terrain drone technology](https://www.army.mil/article/243238/soldiers_equipped_with_game_changing_drone_technology) | ~1 km² in 3D in ~3 h via RAPTRS (was weeks) |
| C11 | [USC ICT — OWT one-sheet](https://ict.usc.edu/wp-content/uploads/2023/08/OWT-One-Sheet-Design-V1.pdf) | One World Terrain overview |
| C12 | [USC ICT news — OWT to Army program of record](https://ict.usc.edu/news/uarc-technology-behind-successful-transition-of-one-world-terrain-to-army-program-of-record/) | OWT transition |
| C13 | [Breaking Defense 2019 — OWT used by special ops](https://breakingdefense.com/2019/10/ste-army-3d-mapping-software-so-good-special-ops-uses-it-for-missions/) | Prototype OWT 3D maps used on missions |
| C14 | [IARPA WRIVA](https://www.iarpa.gov/research-programs/wriva) | 42-month program (2023): 3D site models from sparse imagery; geolocation within 5 m |
| C15 | [IARPA WRIVA slick sheet (Feb 2026)](https://www.iarpa.gov/images/OA-Slicksheets/WRIVA_SlickSheet_02202026.pdf) | Program targets and performers |
| C16 | [DRAGON (arXiv 2407.01761)](https://arxiv.org/pdf/2407.01761) | IARPA-funded drone+ground Gaussian-splatting research |
| C17 | [USPTO 9761002](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9761002) | Patent: fuse SfM-from-FMV with LiDAR via 3D-to-3D registration |

### D. Georeferencing, accuracy and standards

| ID | Source | Annotation |
|---|---|---|
| D1 | [Zhang et al. 2019 (ESurfD preprint)](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf) | **Key paper.** Consumer GNSS: 2.29 m H, 3.93 m Z, Z SD 0.18 m (rigid bias); PPK 0 GCP: 2.4 cm XY, 2.2 cm Z ≈ 8-GCP; lever arm 22.5 cm |
| D2 | [Elkhrachy 2021, Alexandria Eng. J.](https://www.sciencedirect.com/science/article/pii/S1110016821002544) | Mavic Pro direct georeferencing: H <1 m best, V "unacceptable" (abstract) |
| D3 | [Direct georeferencing with on-board navigation components (scispace)](https://scispace.com/pdf/direct-georeferencing-with-on-board-navigation-components-of-1fozwb4xff.pdf) | Low-cost DG below 1 m per coordinate with proper sync (snippet) |
| D4 | [DJI/DroneDeploy P4 RTK whitepaper](<https://docs.djicdn.com/DJI+Enterprise/measurement-accuracy-dji-phantom-4-rtk-whitepaper-f[1].pdf>) | Distances within 0.1–0.3 %; 1.2 cm H / 2 cm V relative; TimeSync (vendor) |
| D5 | [Accuracy assessment of UAV photogrammetry with RTK (Semantic Scholar PDF)](https://pdfs.semanticscholar.org/5c9e/bad8e2cf3acf82d7a2a7ca7db2312f58b492.pdf) | P4 RTK no GCP: H 1–3 cm, V 4–6 cm; 71 checkpoints Z 5.58 cm (abstract) |
| D6 | [Geo-spatial Information Science 2025 (RTK with/without GCP)](https://www.tandfonline.com/doi/full/10.1080/10095020.2025.2451204) | RTK no GCP 5.23 cm vs 4.45 cm with GCP; 84 % lower cost (abstract) |
| D7 | [Low-cost UAV RTK/PPK test, Sensors (PMC8200111)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8200111/) | PPK vertical 5.2 cm vs 4.8 cm with GCPs (snippet) |
| D8 | [Geocarto Int. 2023 — multi-base RTK/PPK](https://www.tandfonline.com/doi/full/10.1080/10106049.2023.2197507) | 1.8–2.9 cm without GCP at 50–90 m (snippet) |
| D9 | [P4 RTK in PPK mode, open-pit mines (ResearchGate)](https://www.researchgate.net/publication/351810047_Experimental_Investigation_on_the_Performance_of_DJI_Phantom_4_RTK_in_the_PPK_Mode_for_3D_Mapping_Open-Pit_Mines) | 1 GCP: 3.8–9.8 cm; 2 GCPs: 3.0–5.7 cm (snippet) |
| D10 | [Gerke & Przybilla 2016 (Univ. Twente)](https://research.utwente.nl/en/publications/accuracy-analysis-of-photogrammetric-uav-image-blocks-influence-o/) | Onboard RTK reduces block deformation; time-sync offsets matter |
| D11 | [Unmanned Systems Technology — accuracy in GCP-free RTK](https://www.unmannedsystemstechnology.com/feature/managing-accuracy-in-gcp-free-rtk-mapping/) | Datum/geoid/transformation errors can erase RTK accuracy |
| D12 | [Remote Sens. 2021, 13(14), 2745 — video vs photo](https://doi.org/10.3390/rs13142745) | 1 frame/2.5 s video ≈ photo flight (1.1–2.7 vs 1.3–2.8 cm); worse at 4 s, 5.5 s (abstract) |
| D13 | [ScienceDirect 2025 — georeferencing dynamic UAV footage](https://www.sciencedirect.com/science/article/abs/pii/S2352938525003544) | DJI SRT per-frame telemetry; local time, no timezone |
| D14 | [SANS ISC diary 31014 — DJI video metadata](https://isc.sans.edu/diary/31014) | DJI video/SRT metadata contents |
| D15 | [James & Robson 2014, ESPL (UCL)](https://discovery.ucl.ac.uk/id/eprint/1443475/1/esp3609.pdf) | **Key paper.** Doming from self-calibration on parallel views; oblique 20–30° reduces 1–2 orders; fixing K1 10× |
| D16 | [Drones 2025, 9(6), 387 — "bowl effect" strategies](https://doi.org/10.3390/drones9060387) | 20–45° obliques ≥10 % of block (snippet) |
| D17 | [Remote Sens. 2020, 12(1), 22 — simulation of UAV blocks](https://www.doi.org/10.3390/rs12010022) | Block geometry simulation related to doming |
| D18 | [UAV block geometry design and camera calibration (PMC8473092)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8473092/) | Block geometry vs calibration |
| D19 | [Reducing dome errors via flight design (ResearchGate)](https://www.researchgate.net/publication/340701608_Reducing_systematic_dome_errors_in_digital_elevation_models_through_better_UAV_flight_design) | Images oriented towards area centre reduce dome errors |
| D20 | [Corridor mapping with GNSS-assisted ISO, Sensors 2018 (PMC6163762)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6163762/) | 1,200 × 180 m corridor, no GCP: 5.9/3.3/7.0 cm (snippet) |
| D21 | [Indirect UAV strip georeferencing, Remote Sens. 2019, 11(15), 1765](https://doi.org/10.3390/rs11151765) | Single 700 m strip referenced by joint adjustment with RTK block (snippet) |
| D22 | [MDPI Remote Sensing 18(14):2321 — sub-scene GNSS-constrained SfM](https://www.mdpi.com/2072-4292/18/14/2321) | 2026: sub-scenes keep degenerate corridor stretches from corrupting cameras (snippet) |
| D23 | [Tightly coupled GPS-visual-inertial (arXiv 2203.02677)](https://arxiv.org/pdf/2203.02677) | Umeyama initialisation for GPS–VIO fusion |
| D24 | [Multi-sensor fusion SLAM from nadir view, ISPRS Annals 2025](https://isprs-annals.copernicus.org/articles/X-2-W2-2025/109/2025/isprs-annals-X-2-W2-2025-109-2025.pdf) | Nadir-view multi-sensor SLAM |
| D25 | [GVINS (arXiv 2103.07899)](https://arxiv.org/pdf/2103.07899) | Tight raw-GNSS + visual + inertial factor graph |
| D26 | [GVINS (IEEE Xplore)](https://ieeexplore.ieee.org/document/9667780/) | Published T-RO version |
| D27 | [Emergent Mind — GVINS summary](https://www.emergentmind.com/topics/gvins) | ~4.5 m mean ATE over 23 km (secondary, unverified) |
| D28 | [NAVIGATION 70(4) navi.607](https://navi.ion.org/content/70/4/navi.607) | Embedded GNSS-VI: 8.455 → 5.751 m RMS; 1.58 ‰ drift without satellites |
| D29 | [Time synchronization of consumer cameras on MAVs (ResearchGate)](https://www.researchgate.net/publication/311555608_Time_synchronization_of_consumer_cameras_on_Micro_Aerial_Vehicles) | <1 ms sync needed at 10–30 m/s for cm-level DG (snippet) |
| D30 | [ISPRS Archives 2017 — IMU/GNSS for DG](https://isprs-archives.copernicus.org/articles/XLII-2-W6/355/2017/) | Quality of combined IMU/GNSS direct georeferencing |
| D31 | [GSIS 2020 — RTK UAV (lever arm)](https://www.tandfonline.com/doi/full/10.1080/10095020.2019.1710437) | Apply antenna–camera lever arm per image |
| D32 | [OKVIS2-X (arXiv 2510.04612)](https://arxiv.org/pdf/2510.04612) | Adds GNSS to keyframe VI-SLAM (2025) |
| D33 | [Vautherin et al. 2016, ISPRS Annals III-3](https://isprs-annals.copernicus.org/articles/III-3/139/2016/isprs-annals-III-3-139-2016.pdf) | **Key paper.** Rolling shutter: 74 ms / 30 ms readout, ~10 px / ~4 px at 8 m/s, 70 m; modelling fixes systematic error |
| D34 | [Rolling shutter effect, low-cost UAV (ResearchGate)](https://www.researchgate.net/publication/357058859_Rolling_Shutter_Effect_on_the_Accuracy_of_Photogrammetric_Product_Produced_by_Low-Cost_UAV) | Reported RS correction gains (snippet, unverified) |
| D35 | [Two-step RS correction, ISPRS J. 2020](https://www.sciencedirect.com/science/article/abs/pii/S0924271619302849) | 30–60 % block / 15–25 % corridor gains (snippet, unverified) |
| D36 | [GAEE 2024 article](https://www.gaee.agh.edu.pl/gaee/article/view/452) | RS models integrated in Pix4Dmapper and Metashape |
| D37 | [LIDAR Magazine — ASPRS Ed. 2](https://lidarmag.com/2023/10/06/the-asprs-positional-accuracy-standards-edition-2/amp/) | RMSE only; ≥30 checkpoints; checkpoints ≥2× more accurate |
| D38 | [GPS World — ASPRS Ed. 2 approved](https://www.gpsworld.com/asprs-approves-edition-2-of-the-asprs-positional-accuracy-standards-for-digital-geospatial-data/) | VVA pass/fail removed |
| D39 | [ASPRS Positional Accuracy Standards Ed. 2 — main body](https://aagsmo.org/wp-content/uploads/2023/03/ASPRS_PosAcc_Edition2_MainBody.pdf) | The standard itself |
| D40 | [uw-cryo/groundcontrol PR #30](https://github.com/uw-cryo/groundcontrol/pull/30) | CE90 ≈ 2.146 × RMSE (valid when RMSE_x/RMSE_y ≥ 0.6) |
| D41 | [Maxar/DigitalGlobe accuracy whitepaper](https://dg-cms-uploads-production.s3.amazonaws.com/uploads/document/file/38/DG_ACCURACY_WP_V3.pdf) | CE90/LE90 definitions; LE90 = 1.6449 × RMSE_Z |
| D42 | [Int. J. Image and Data Fusion 2026 — GS from UAV video](https://www.tandfonline.com/doi/abs/10.1080/19479832.2026.2661679) | GS from video + GNSS: 4.8 mm ICP RMS, CE90 5.26 m, LE90 0.56 m (snippet) |

### E. India: regulation, GNSS, national programmes, industry, NTRO

| ID | Source | Annotation |
|---|---|---|
| E1 | [DST Geospatial Guidelines 2021 (PDF)](https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf) | 1 m H / 3 m V threshold; finer data Indian-owned, stored/processed in India |
| E2 | [MediaNama — foreign mapping in India](https://www.medianama.com/2021/02/223-foreign-mapping-india/) | Commentary on 2021 guidelines |
| E3 | [SCC Online — geospatial guidelines 2021](https://www.scconline.com/blog/post/2021/03/04/india-geospatial-data-guidelines-2021/) | Legal summary |
| E4 | [DST — National Geospatial Policy 2022](https://dst.gov.in/national-geospatial-policy-2022-marked-landmark-reform-democratized-access-geospatial-data) | NGP 2022, GDPDC |
| E5 | [Survey of India — NGP 2022 page](https://surveyofindia.gov.in/pages/national-geospatial-policy-2022) | NGP 2022 |
| E6 | [SoI CORS portal](https://cors.surveyofindia.gov.in/introduction.html) | RTK/NRTK ±3 cm |
| E7 | [Geospatial World — India CORS network](https://geospatialworld.net/blogs/india-cors-network/) | ~1,034 stations; free for govt/academia |
| E8 | [RTKdata — India](https://rtkdata.com/in/) | 1,105+ stations figure |
| E9 | [Wikipedia — GAGAN](https://en.wikipedia.org/wiki/GPS-aided_GEO_augmented_navigation) | ~1.5 m H, 2.5 m V |
| E10 | [Inside GNSS — GAGAN certification](https://insidegnss.com/india-certifies-gagan-for-en-route-and-npa-flight-operations/) | DGCA certification (RNP0.1, 2013) |
| E11 | [Wikipedia — IRNSS/NavIC](https://en.wikipedia.org/wiki/Indian_Regional_Navigation_Satellite_System) | SPS better than 20 m, up to ~5 m |
| E12 | [PIB — Drone Rules 2021 backgrounder](https://static.pib.gov.in/writereaddata/specificdocs/documents/2022/jan/doc202212810701.pdf) | Green/yellow/red zones; green up to 120 m |
| E13 | [Business Standard — airspace map](https://www.business-standard.com/article/economy-policy/govt-releases-interactive-digital-airspace-map-for-drone-operations-121092401343_1.html) | Digital Sky airspace map released 24 Sep 2021 |
| E14 | [100knots — airspace map](https://www.100knots.com/indias-airspace-map-for-drone-operations-released-by-the-aviation-ministry/) | Zone definitions |
| E15 | [SoI — SVAMITVA](https://surveyofindia.gov.in/pages/svamitva) | Launched 24 Apr 2020; SoI technology partner |
| E16 | [PIB 2023 SVAMITVA backgrounder](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2023/may/doc202351190201.pdf) | Programme background |
| E17 | [PIB 2022 SVAMITVA backgrounder](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2022/jun/doc20226862301.pdf) | 1:500 maps, ±5 cm with CORS |
| E18 | [SVAMITVA Framework 2021–25](<https://svamitva.nic.in/DownloadPDF/Svamitva_Scheme_Framework(2021-2025).pdf>) | RTK/PPK drones, <5 cm GSD, ±12.5 cm planimetric |
| E19 | [Esri India — GIS drone mapping in SVAMITVA](https://www.esri.in/en-in/newsroom/blog/gis-drone-mapping-in-svamitva-scheme-land-records) | Workflow; move to 3D and digital twins |
| E20 | [Frontiers 2026 — SVAMITVA / NAKSHA](https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2026.1874630/full) | 3,29,161 villages flown (Mar 2026); NAKSHA ~5 cm GSD |
| E21 | [ETV Bharat — 3 crore property cards](https://www.etvbharat.com/en/bharat/over-3-crore-property-cards-prepared-for-rural-households-under-svamitva-scheme-enn26061905782) | ~3.30 lakh abadis flown; 3.19 crore cards (Jun 2026) |
| E22 | [DroneLife — Garuda maps 7,000 villages](https://dronelife.com/2022/09/16/the-survey-of-india-garuda-aerospace-maps-7000-villages-by-drone-in-1-year/) | Industry contribution to SVAMITVA |
| E23 | [GIM — Genesys and SoI partnership](https://www.gim-international.com/content/news/genesys-and-survey-of-india-enter-partnership-to-transform-india-s-geospatial-landscape) | Urban digital twin ambitions |
| E24 | [GIM — Varanasi digital twin award](https://www.gim-international.com/content/news/varanasi-smart-city-3d-digital-twin-project-wins-indian-urban-development-award) | 160 km² Varanasi 3D twin |
| E25 | [CXO Digital Pulse — Ahmedabad digital twin](https://www.cxodigitalpulse.com/genesys-wins-%E2%82%B9283-crore-contract-for-ahmedabads-3d-digital-twin/) | ₹283 cr contract |
| E26 | [Business Standard — ideaForge Q6 V2 GEO](https://www.business-standard.com/technology/tech-news/ideaforge-technology-launches-q6v2-geo-drone-for-advanced-mapping-uses-125082001442_1.html) | DGCA-certified mapping drone |
| E27 | [Wikipedia — ideaForge](https://en.wikipedia.org/wiki/IdeaForge_Technology) | Company background, Army orders |
| E28 | [TechPlugged — Skylark Labs × ideaForge](https://techplugged.com/skylark-labs-ideaforge-ai-drone-ecosystem/) | $35 M on-drone AI licence |
| E29 | [Skylark Drones Spectra](https://skylarkdrones.com/spectra) | Cloud orthomosaic/point-cloud platform (vendor) |
| E30 | [Crunchbase — Aarav Unmanned Systems (Aereo)](https://www.crunchbase.com/organization/aarav-unmanned-systems) | Aereo background |
| E31 | [BW Education — Aereo CoE](https://www.bweducation.com/article/aereo-sjcit-open-centre-of-excellence-for-drone-education-remote-pilot-training-472489) | Aereo village-mapping figures |
| E32 | [Research Matters — IIT Bombay heritage twins](https://researchmatters.in/news/mapping-indias-heritage-researchers-use-drones-and-ground-cameras-create-3d-map-structures) | UAV + terrestrial photogrammetry |
| E33 | [J. Indian Soc. Remote Sens. — IIT Mandi landslides](https://link.springer.com/article/10.1007/s12524-017-0727-1) | Landslide 3D reconstruction with Phantom 3 |
| E34 | [Wikipedia — NTRO](https://en.wikipedia.org/wiki/National_Technical_Research_Organisation) | Technical intelligence agency (2004), PMO/NSA, IMINT/GEOINT |
| E35 | [IAS Gyan — NTRO](https://www.iasgyan.in/daily-current-affairs/national-technical-research-organisation-ntro) | NTRO mandate summary |
| E36 | [Raksha Anirveda — NTRO eye in the sky](https://raksha-anirveda.com/ntro-indias-eye-in-the-sky/) | NTRO UAV/satellite assets |
| E37 | [CBIC circular 2019 (mirror)](http://worldtradescanner.com/32-CBIC%20Circular-20.09.2019.htm) | NTRO drones exempt from UIN |

### F. Visual SLAM and visual odometry

| ID | Source | Annotation |
|---|---|---|
| F1 | [Spagnolo et al. 2026 — monocular SLAM on nadir UAV (arXiv 2608.18632)](https://arxiv.org/html/2608.18632) | **Key paper.** 0.53–6.34 % short-flight drift; vertical RMSE >100 m in 29/34 long runs; memory figures |
| F2 | [Simulation evaluation of ORB-SLAM3/DROID/DPVO/DPV-SLAM (ResearchGate)](https://www.researchgate.net/publication/398213993_Simulation_Evaluation_of_Monocular_Visual_SLAM_ORB-SLAM3_DROID-SLAM_DPVO_and_DPV-SLAM) | 2025 simulation comparison (not fetched) |
| F3 | [MASt3R-SLAM (arXiv 2412.12392)](https://arxiv.org/abs/2412.12392) | CVPR 2025; calibration-free, 15 FPS |
| F4 | [DROID-SLAM (arXiv 2108.10869)](https://arxiv.org/pdf/2108.10869) | Dense BA layer; monocular output unscaled |
| F5 | [DPV-SLAM (arXiv 2408.01654)](https://arxiv.org/pdf/2408.01654) | Deep patch VO + loop closure; low memory |
| F6 | [DPV-SLAM (ECCV 2024 PDF)](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/00272.pdf) | Published version |
| F7 | [VGGT-SLAM (arXiv 2505.12549)](https://arxiv.org/abs/2505.12549) | SL(4) submap alignment for 15-DoF ambiguity |
| F8 | [VGGT-SLAM 2.0 (arXiv 2601.19887)](https://arxiv.org/pdf/2601.19887) | Real-time dense feed-forward reconstruction (2026) |
| F9 | [GigaSLAM (arXiv 2503.08071)](https://arxiv.org/abs/2503.08071) | Km-scale Gaussian SLAM; driving data only |
| F10 | [GigaSLAM (ACM DOI)](https://dl.acm.org/doi/10.1145/3757377.3763932) | SIGGRAPH Asia 2025 version |
| F11 | [GigaSLAM (GitHub)](https://github.com/DengKaiCQ/GigaSLAM) | Code |
| F12 | [Robust monocular 3DGS SLAM for km-scale outdoor (arXiv 2606.30436)](https://arxiv.org/pdf/2606.30436) | 2026 follow-up (not fetched) |
| F13 | [ORB-SLAM3 (arXiv 2007.11898)](https://arxiv.org/abs/2007.11898) | Feature-based; CPU; GPLv3 |
| F14 | [VINS-Mono (arXiv 1708.03852)](https://arxiv.org/abs/1708.03852) | Monocular VIO; needs synced IMU (rare in consumer video files) |
| F15 | [DSO (arXiv 1607.02565)](https://arxiv.org/abs/1607.02565) | Direct sparse odometry; sensitive to RS and auto-exposure |
| F16 | [LDSO (arXiv 1808.01111)](https://arxiv.org/abs/1808.01111) | DSO + loop closure |
| F17 | [GO-SLAM (arXiv 2309.02436)](https://arxiv.org/abs/2309.02436) | DROID-style tracking + neural map |
| F18 | [Photo-SLAM (arXiv 2311.16728)](https://arxiv.org/abs/2311.16728) | ORB-SLAM3 + Gaussian mapping |
| F19 | [UAV-borne mapping for low-altitude high-speed drones (arXiv 2401.06407)](https://arxiv.org/pdf/2401.06407) | Relevant to fast low passes (not fetched) |
| F20 | [OrthoTrack (arXiv 2606.25245)](https://arxiv.org/pdf/2606.25245) | 6-DoF UAV trajectories anchored in public orthophotos (not fetched) |

### G. Feed-forward 3D models and monocular metric depth

| ID | Source | Annotation |
|---|---|---|
| G1 | [Wu et al. — DUSt3R/MASt3R/VGGT on aerial blocks (arXiv 2507.14798)](https://arxiv.org/abs/2507.14798) | Up to +50 % completeness vs COLMAP on <10 images; cannot replace SfM/MVS |
| G2 | [Wu et al. — GSIS version](https://www.tandfonline.com/doi/pdf/10.1080/10095020.2025.2597491) | Published version |
| G3 | [Wu et al. — OSU copy](https://u.osu.edu/wu-4988/files/2025/11/GSIS_dust_mast3r_VGGT_evaluation.pdf) | Accuracy up to 0.4 m (search summary, unverified) |
| G4 | [AerialMegaDepth (arXiv 2504.13157)](https://arxiv.org/abs/2504.13157) | Aerial–ground pairs within 5°: <3 % → ~50 % after fine-tuning |
| G5 | [AerialMegaDepth (arXiv PDF)](https://arxiv.org/pdf/2504.13157) | Same paper (PDF; also cited as IARPA-funded) |
| G6 | [AerialMegaDepth (CVPR 2025)](https://openaccess.thecvf.com/content/CVPR2025/papers/Vuong_AerialMegaDepth_Learning_Aerial-Ground_Reconstruction_and_View_Synthesis_CVPR_2025_paper.pdf) · [GitHub](https://github.com/kvuong2711/aerial-megadepth) | Published paper and code |
| G7 | [UAVFF3D (arXiv 2605.17942)](https://arxiv.org/abs/2605.17942) | 170k real + 370k synthetic UAV images; ATE −76 %, Chamfer −41 %; HFOV–height ambiguity |
| G8 | [UAVFF3D (GitHub)](https://github.com/yanxian-ll/UAVFF3D) | Dataset and evaluation code |
| G9 | [GeoFF3D (arXiv 2608.28288)](https://arxiv.org/abs/2608.28288) | **Key paper.** GPS-anchored, metric Z-up; ~2,000 images ~5 min; stable on near-collinear paths; F@5 0.848 |
| G10 | [GeoFF3D (GitHub)](https://github.com/yanxian-ll/GeoFF3D) | Code — **licence unverified** |
| G11 | [Cross3R (arXiv 2605.07978)](https://arxiv.org/abs/2605.07978) | Satellite + UAV/ground feed-forward; CrossGeo 278k images |
| G12 | [GRF-Recon (arXiv 2609.20012)](https://arxiv.org/pdf/2609.20012) | Long-sequence feed-forward successor (not fetched) |
| G13 | [VGGT (GitHub)](https://github.com/facebookresearch/vggt) | Licence facts: original non-commercial; VGGT-1B-Commercial excludes military |
| G14 | [VGGT (arXiv 2503.11651)](https://arxiv.org/abs/2503.11651) | CVPR 2025; up-to-scale output |
| G15 | [VGGT-Long (arXiv 2507.16443)](https://arxiv.org/pdf/2507.16443) | Chunked Sim(3) alignment to km scale; driving data only |
| G16 | [VGGT-Long (GitHub)](https://github.com/DengKaiCQ/VGGT-Long) | Code |
| G17 | [π3 (arXiv 2507.13347)](https://arxiv.org/abs/2507.13347) | Permutation-equivariant; Pi3X is a GeoFF3D baseline; licence unverified |
| G18 | [MapAnything (arXiv 2509.13414)](https://arxiv.org/abs/2509.13414) | Accepts intrinsics/poses; metric output; licence unverified |
| G19 | [Depth Anything 3 (arXiv 2511.10647)](https://arxiv.org/pdf/2511.10647) | Any-view pose + depth; claims +35.7 % pose vs VGGT |
| G20 | [Depth Anything 3 (GitHub)](https://github.com/bytedance-seed/depth-anything-3) | Code; licence unverified |
| G21 | [ByteDance Seed blog — DA3](https://seed.bytedance.com/en/blog/seed-research-depth-anything-3-a-single-transformer-architecture-for-space-reconstruction-from-any-views) | Announcement |
| G22 | [DUSt3R (arXiv 2312.14132)](https://arxiv.org/abs/2312.14132) | Pairwise point maps; CC BY-NC-SA |
| G23 | [MASt3R (arXiv 2406.09756)](https://arxiv.org/abs/2406.09756) | Matching + approximately metric point maps; non-commercial |
| G24 | [MASt3R-SfM (arXiv 2409.19152)](https://arxiv.org/abs/2409.19152) | Scales to large unordered collections |
| G25 | [Spann3R (arXiv 2408.16061)](https://arxiv.org/abs/2408.16061) | Spatial memory for streaming |
| G26 | [CUT3R (arXiv 2501.12387)](https://arxiv.org/abs/2501.12387) | Recurrent state online reconstruction |
| G27 | [Fast3R (arXiv 2501.13928)](https://arxiv.org/abs/2501.13928) | 1000+ images in one pass |
| G28 | [Emergent Mind — feed-forward 3DGS topic](https://www.emergentmind.com/topics/feed-forward-3d-gaussian-splatting-3dgs) | Overview of feed-forward GS foundations (secondary) |
| G29 | [AerialMetric (arXiv 2606.29716)](https://arxiv.org/abs/2606.29716) | ECCV 2026: 52k real + 16k synthetic UAV depth pairs; significant domain gaps |
| G30 | [AerialMetric (arXiv PDF)](https://arxiv.org/pdf/2606.29716) · [GitHub](https://github.com/kuieless/AerialMetric) | PDF and code |
| G31 | [Depth Anything V2 (arXiv 2406.09414)](https://arxiv.org/abs/2406.09414) | Metric depth model |
| G32 | [Metric3D v2 (arXiv 2404.15506)](https://arxiv.org/abs/2404.15506) | Metric depth model |
| G33 | [UniDepth (CVPR 2024)](https://openaccess.thecvf.com/content/CVPR2024/papers/Piccinelli_UniDepth_Universal_Monocular_Metric_Depth_Estimation_CVPR_2024_paper.pdf) | Universal metric depth |
| G34 | [UniDepthV2 (arXiv 2502.20110)](https://arxiv.org/abs/2502.20110) | Reported strongest zero-shot on new aerial data (snippet) |
| G35 | [Depth Pro (arXiv 2410.02073)](https://arxiv.org/abs/2410.02073) | Apple metric depth; no aerial evaluation found |

### H. SfM / MVS libraries and open-source pipelines

| ID | Source | Annotation |
|---|---|---|
| H1 | [OpenDroneMap ODM (GitHub)](https://github.com/OpenDroneMap/ODM) | AGPL-3.0; OpenSfM + OpenMVS + PDAL; video + SRT since v3.0.4; GPU image |
| H2 | [ODM PR #1567 — video2dataset](https://github.com/OpenDroneMap/ODM/pull/1567) | Video input module |
| H3 | [ODM docs — arguments](https://docs.opendronemap.org/arguments/) | `--video-limit` 500, `--3d-tiles`, `--rolling-shutter`, `--gps-accuracy`, `--split` |
| H4 | [ODM releases](https://github.com/OpenDroneMap/ODM/releases) | Rolling-shutter profiles, SRT fixes, 3.6.x; **dates inconsistent — verify** |
| H5 | [Zenodo — ODM 3.2.0](https://zenodo.org/records/8273787) | P4 RTK SRT parsing |
| H6 | [Zenodo — ODM 3.5.1](https://zenodo.org/records/11555768) | Mavic 2 Zoom SRT |
| H7 | [Zenodo — ODM 3.6.2](https://zenodo.org/records/21909664) | DJI video SRT parsing fix |
| H8 | [ODM community — processing video in WebODM](https://community.opendronemap.org/t/processing-video-files-with-webodm/15787?page=2) | Practical experience and limits |
| H9 | [ODM community — hardware recommendations](https://community.opendronemap.org/t/hardware-recommendations-cpu-cores-graphics-card-cuda-nvidia-memory-ram-storage/13705) | 242 images: 124 min CPU / 62 min GPU; RAM peaks |
| H10 | [ODM community — GPU based processes](https://community.opendronemap.org/t/gpu-based-processes/12913) | GPU used in features and densification, not matching |
| H11 | ODM sample datasets — `https://github.com/OpenDroneMap/odm_data_*` | Family of sample-data repos (lead) |
| H12 | [GLOMAP (arXiv 2407.20219)](https://arxiv.org/abs/2407.20219) | Global SfM, 1–2 orders faster than COLMAP |
| H13 | [GLOMAP (arXiv HTML v2)](https://arxiv.org/html/2407.20219v2) | "Orders of magnitude faster"; handles sequential video |
| H14 | [GLOMAP README](https://github.com/colmap/glomap/blob/main/README.md) | Standalone repo migrated into COLMAP global mapper |
| H15 | [GLOMAP releases](https://github.com/colmap/glomap/releases) | Release history |
| H16 | [COLMAP releases](https://github.com/colmap/colmap/releases) | 4.x: GPS/gravity priors, ALIKED/LightGlue, GPU BA; **dates inconsistent — verify** |
| H17 | [GLOMAP paper PDF (demuc.de)](https://demuc.de/papers/pan2024glomap.pdf) | ECCV 2024 paper |
| H18 | [Microsoft Research — GLOMAP](https://www.microsoft.com/en-us/research/publication/global-structure-from-motion-revisited/) | Publication page |
| H19 | [Glob3R (arXiv 2607.09225)](https://arxiv.org/pdf/2607.09225) | Global SfM + 3D foundation models (2026) |
| H20 | [Meshroom 2025.1.0 announcement](https://groups.google.com/g/alicevision/c/a9xGujkF-6c) | Plugin architecture incl. GS |
| H21 | [MPC — Meshroom 2025.1.0](https://www.mpcvfx.com/en/news/mpc-celebrates-the-release-of-meshroom-2025-1-0/) | Release news |
| H22 | [Meshroom releases](https://github.com/alicevision/meshroom/releases) | Release history |
| H23 | [Meshroom licences](https://meshroom-manual.readthedocs.io/en/latest/about/licenses/licenses.html) | MPL-2.0 |
| H24 | [OpenMVS](https://github.com/cdcseacave/openMVS) | Dense MVS, mesh, refine, texture; AGPL-3.0 (lead) |
| H25 | [OpenMVG](https://github.com/openMVG/openMVG) | SfM library, MPL-2.0 (lead) |
| H26 | [TheiaSfM](https://github.com/sweeneychris/TheiaSfM) | Global SfM, BSD, low activity (lead) |
| H27 | [hloc — Hierarchical-Localization](https://github.com/cvg/Hierarchical-Localization) | SuperPoint/LightGlue + COLMAP; SuperPoint weights non-commercial (lead) |
| H28 | [Kapture](https://github.com/naver/kapture) | Data format/localisation toolbox, BSD (lead) |
| H29 | [LightGlue (arXiv 2306.13643)](https://arxiv.org/abs/2306.13643) | Learned matcher |
| H30 | [mvs-texturing](https://github.com/nmoehrle/mvs-texturing) | View selection, global colour adjustment, seam levelling |
| H31 | [J. Imaging 3(2):15 — frames from video raise overlap](https://doi.org/10.3390/jimaging3020015) | Kinetic UAV footage reconstructable via frame extraction |
| H32 | [ISPRS J. 2020 — efficient SfM for large UAV images (review)](https://www.sciencedirect.com/science/article/abs/pii/S0924271620301131) | Review |
| H33 | [PMC11125116 — efficient SfM for large video](https://pmc.ncbi.nlm.nih.gov/articles/PMC11125116/) | Open-source large-video SfM |

### I. Real-time and near-real-time mapping

| ID | Source | Annotation |
|---|---|---|
| I1 | [OpenREALM (GitHub)](https://github.com/laxnpander/OpenREALM) | Real-time SLAM + 2.5D map + ortho; alpha ROS1; LGPL/GPLv3 |
| I2 | [OpenREALM CHANGELOG](https://github.com/laxnpander/OpenREALM/blob/master/CHANGELOG.md) | Last significant update ~Sept 2020 |
| I3 | [OpenREALM paper (arXiv 2009.10492)](https://arxiv.org/pdf/2009.10492) | Method paper |
| I4 | [TU Braunschweig IFF drone lab](https://github.com/iff-dronelab) | Authors' organisation |
| I5 | [Springer PFG — semantic real-time mapping with UAVs](https://link.springer.com/article/10.1007/s41064-023-00242-2) | OpenREALM on Jetson Xavier NX; semantic extension |
| I6 | [MDPI Appl. Sci. 16(4):2133 (2026)](https://www.mdpi.com/2076-3417/16/4/2133) | CPU real-time 2D orthomosaics from UAV video |
| I7 | [ISPRS Annals 2025 — near-real-time mosaicking](https://isprs-annals.copernicus.org/articles/X-2-W2-2025/65/2025/) | 2.3 fps on consumer UAVs |
| I8 | [d-nb.info — accurate real-time UAV mapping (dissertation)](https://d-nb.info/1239825390/34) | Dissertation |
| I9 | [GitHub topic — orthomosaic](https://github.com/topics/orthomosaic?o=asc&s=updated) | Index of smaller stitchers |
| I10 | [Map2DFusion](https://github.com/zdzhaoyong/Map2DFusion) | Real-time mosaicking with ORB-SLAM (lead) |
| I11 | [REMODE](https://github.com/uzh-rpg/rpg_open_remode) | Probabilistic monocular dense depth, GPL-3.0 (lead) |
| I12 | [RTAB-Map](https://github.com/introlab/rtabmap) | RGB-D/stereo/LiDAR SLAM; limited for monocular aerial (lead) |
| I13 | [OpenVINS](https://github.com/rpng/open_vins) | VIO, GPL-3.0 (lead) |
| I14 | [Kimera](https://github.com/MIT-SPARK/Kimera) | VIO + mesh + semantics (lead) |

### J. Telemetry and metadata (DJI SRT, KLV / MISB 0601)

| ID | Source | Annotation |
|---|---|---|
| J1 | [DJI_SRT_Parser](https://github.com/JuanIrache/DJI_SRT_Parser) | JavaScript SRT parser |
| J2 | [dji-telemetry (PyPI)](https://pypi.org/project/dji-telemetry/) | Python per-frame SRT parser/exporter |
| J3 | [DJI-Video-GPS-Tagger](https://github.com/hcampbell98/DJI-Video-GPS-Tagger) | Writes SRT GPS into extracted frames (ffmpeg + exiftool) |
| J4 | [dji-drone-metadata-embedder](https://github.com/CallMarcus/dji-drone-metadata-embedder) | SRT → GPX/CSV/GeoJSON/KML/CoT |
| J5 | [dji-flight](https://github.com/bhanurp/dji-flight) | CLI + dashboard with SRT parser |
| J6 | [python_DJI_SRT_parser](https://github.com/Nunzio03/python_DJI_SRT_parser) | SRT → CSV/JSON |
| J7 | [SRT2GPX](https://github.com/Roady1/SRT2GPX/blob/main/SRT2GPX.py) | SRT → GPX script |
| J8 | [srt-to-gpx](https://github.com/arru/srt-to-gpx/blob/master/srt_to_gpx.py) | SRT → GPX script |
| J9 | [MavicPilots — geotagged frames tool (GUI)](https://mavicpilots.com/threads/simple-tool-with-gui-for-extracting-geotagged-images-from-videos-srt-files-useful-for-photogrammetry.139243/) · [MavicPilots — extracting geotagged frames](https://mavicpilots.com/threads/how-to-extract-geotagged-frames-from-video-for-use-in-photogrammetry.133471/) | Community workflows |
| J10 | [klvdata (PyPI)](https://pypi.org/project/klvdata/) | MISB ST 0601 / ST 0102 from STANAG 4609 TS; no dependencies |
| J11 | [paretech/klvdata](https://github.com/paretech/klvdata) | Source repo (maintenance status unchecked) |
| J12 | [All4Gis/klvdata](https://github.com/All4Gis/klvdata) | Fork used in QGIS FMV plugin context |
| J13 | [klv-parser (PyPI)](https://pypi.org/project/klv-parser/) · [Pazshp/klv_parser](https://github.com/Pazshp/klv_parser) | Alternative KLV parser |
| J14 | [bradh/klvcms](https://github.com/bradh/klvcms) | Alternative KLV tool |

### K. Neural rendering at aerial scale (NeRF, 3DGS, SLAM-GS)

| ID | Source | Annotation |
|---|---|---|
| K1 | [DOGS (arXiv HTML 2405.13943v2)](https://arxiv.org/html/2405.13943v2) | Mill-19/UrbanScene3D/MatrixCity table; 2.5–4.5 h vs 18–23 h |
| K2 | [DOGS (arXiv PDF)](https://arxiv.org/pdf/2405.13943) | NeurIPS 2024 ADMM distributed 3DGS |
| K3 | [Mega-NeRF (arXiv 2112.10703)](https://arxiv.org/abs/2112.10703) | Drone-scale NeRF; Mill-19 dataset |
| K4 | [Block-NeRF (arXiv 2202.05263)](https://arxiv.org/abs/2202.05263) | City-scale street NeRF; appearance/exposure conditioning |
| K5 | [VastGaussian (arXiv 2402.17427)](https://arxiv.org/pdf/2402.17427) | Partitioned 3DGS; decoupled appearance |
| K6 | [CityGaussianV2 project](https://dekuliutesla.github.io/CityGaussianV2/) | ICLR 2025 project page |
| K7 | [CityGaussianV2 (arXiv HTML v1)](https://arxiv.org/html/2411.00771v1) | F1 0.556 MatrixCity-Aerial; TSDF with 1 m voxels |
| K8 | [CityGaussianV2 (arXiv abs)](https://arxiv.org/abs/2411.00771) | Paper |
| K9 | [CityGaussianV2 (Hugging Face)](https://huggingface.co/TeslaYang123/CityGaussianV2) | Weights |
| K10 | [Hierarchical 3DGS (Inria)](https://repo-sam.inria.fr/fungraph/hierarchical-3d-gaussians/) | LOD for very large captures |
| K11 | [Octree-GS (arXiv 2403.17898)](https://arxiv.org/pdf/2403.17898) | LOD anchor Gaussians |
| K12 | [DroneSplat (CVPR 2025 page)](https://openaccess.thecvf.com/content/CVPR2025/html/Tang_DroneSplat_3D_Gaussian_Splatting_for_Robust_3D_Reconstruction_from_In-the-Wild_CVPR_2025_paper.html) | Published version |
| K13 | [PGSR (arXiv HTML 2406.06521v2)](https://arxiv.org/html/2406.06521v2) | 0.52 mm DTU Chamfer in 0.5 h; exposure compensation |
| K14 | [PGSR project](https://zju3dv.github.io/pgsr/) | Project page |
| K15 | [2DGS (arXiv 2403.17888)](https://arxiv.org/abs/2403.17888) · [GOF (arXiv 2404.10772)](https://arxiv.org/abs/2404.10772) | Surfel GS and opacity-field meshing; GOF failed on MatrixCity-Aerial |
| K16 | [ISPRS Archives 2026 — metric assessment of 3DGS for UAV](https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/143/2026/isprs-archives-XLVIII-2-W12-2026-143-2026.pdf) | GS geometry "generally slightly lower" than photogrammetry |
| K17 | [ISPRS Annals 2025 — 3DGS for real-world scenarios](https://isprs-annals.copernicus.org/articles/X-G-2025/641/2025/isprs-annals-X-G-2025-641-2025.pdf) | Comparative study |
| K18 | [ISPRS Archives 2026 — photogrammetry vs 3DGS, heritage](https://isprs-archives.copernicus.org/articles/XLIX-B2-2026/451/2026/isprs-archives-XLIX-B2-2026-451-2026.pdf) | Comparative study |
| K19 | [STARS-GS (arXiv 2609.03447)](https://arxiv.org/pdf/2609.03447) | Aerial surface reconstruction GS, Sep 2026 (numbers unverified) |
| K20 | [GS4Buildings (arXiv 2508.07355)](https://arxiv.org/pdf/2508.07355) | Building priors inside GS |
| K21 | [Live UAV-video GS (arXiv 2602.20342)](https://arxiv.org/abs/2602.20342) | RTMP stream → GS within 4–7 % of offline; no geometry comparison |
| K22 | [AnySplat (arXiv 2505.23716)](https://arxiv.org/pdf/2505.23716) · [ACM](https://dl.acm.org/doi/10.1145/3763326) · [GitHub](https://github.com/Rivers2de/AnySplat) | Feed-forward GS from unposed images |
| K23 | [InstantSplat (arXiv 2403.20309)](https://arxiv.org/abs/2403.20309) | Sparse-view GS in under a minute |
| K24 | [gsplat](https://github.com/nerfstudio-project/gsplat) | CUDA Gaussian rasterisation (our S7 library) |
| K25 | [LearnOpenCV — 3DGS](https://learnopencv.com/3d-gaussian-splatting/) | Tutorial; nerfstudio Splatfacto |
| K26 | [NeRF vs 3DGS for UAV point clouds (PMC12115230)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12115230/) | Splatfacto promising on UAV imagery |
| K27 | [ISPRS Annals 2024 — NeRF/3DGS from aerial imagery](https://isprs-annals.copernicus.org/articles/X-2-2024/97/2024/isprs-annals-X-2-2024-97-2024.pdf) | Aerial evaluation |
| K28 | [GaussianFlow SLAM (arXiv 2604.15612)](https://arxiv.org/html/2604.15612v1) | MonoGS 0.32–1.58 FPS, Photo-SLAM 0.53–2.8 FPS overall |
| K29 | [MGSO (arXiv 2409.13055)](https://arxiv.org/html/2409.13055v3) | Coupled GS-SLAM rarely >20 fps |
| K30 | [SplatMAP (arXiv 2501.07015)](https://arxiv.org/html/2501.07015) | 3.74 fps vs GO-SLAM 8.36, MonoGS 0.32 |
| K31 | [DROID-Splat (arXiv 2411.17660)](https://arxiv.org/pdf/2411.17660) | DROID tracking + 3DGS mapping |
| K32 | [3DGS-SLAM survey 2026 (arXiv 2602.04251)](https://arxiv.org/pdf/2602.04251) | Survey |
| K33 | [NeRF & GS SLAM in the wild (arXiv 2412.03263)](https://arxiv.org/html/2412.03263v1) | Outdoor robustness |
| K34 | [Horizon-GS (arXiv 2412.01745)](https://arxiv.org/pdf/2412.01745) | Aerial-to-ground 3DGS |
| K35 | [AeroDGS (arXiv 2602.22376)](https://arxiv.org/pdf/2602.22376) | Dynamic 4D from a single aerial sequence |

### L. Scene challenges: dynamics, blur, illumination, occlusion and building completion

| ID | Source | Annotation |
|---|---|---|
| L1 | [DroneSplat (arXiv 2503.16964)](https://arxiv.org/abs/2503.16964) | SAM v2 local-global masking; +0.9 to +2.4 dB on 24 drone scenes |
| L2 | [DroneSplat (arXiv PDF)](https://arxiv.org/pdf/2503.16964) | Same; in-the-wild drone benchmark |
| L3 | [DroneSplat (GitHub)](https://github.com/BITyia/DroneSplat) | Code |
| L4 | [DroneSplat paper notes](https://github.com/zhaoyang97/Paper-Notes-en/blob/main/docs/CVPR2025/3d_vision/dronesplat_3d_gaussian_splatting_for_robust_3d_reconstruction_from_in-the-wild_d.md) | Detailed notes incl. limitations (SAM v2 cost, no lighting handling) |
| L5 | [SpotLessSplats (arXiv 2406.20055)](https://arxiv.org/pdf/2406.20055) | Semantic features + robust optimisation |
| L6 | [DeGauss (arXiv 2503.13176)](https://arxiv.org/html/2503.13176v2) | Comparison incl. WildGaussians |
| L7 | [RobustSplat (arXiv 2506.02751)](https://arxiv.org/pdf/2506.02751) | Decouples densification from dynamics |
| L8 | [DualSplat (arXiv 2604.21631)](https://arxiv.org/pdf/2604.21631) | Pseudo-mask bootstrapping |
| L9 | [Difix3D-W (arXiv 2604.27422)](https://arxiv.org/pdf/2604.27422) | Distractor-free few-shot GS |
| L10 | [NeRF-W (arXiv 2008.02268)](https://arxiv.org/abs/2008.02268) | Appearance embeddings + transient head |
| L11 | [RobustNeRF (arXiv 2302.00833)](https://arxiv.org/abs/2302.00833) | Trimmed robust loss |
| L12 | [BAD-Gaussians project](https://lingzhezhao.github.io/BAD-Gaussians/) · [Springer](https://link.springer.com/chapter/10.1007/978-3-031-72698-9_14) | Blur as integration along in-exposure trajectory |
| L13 | [Gaussian Splatting on the Move (GitHub)](https://github.com/SpectacularAI/3dgs-deblur) · [Springer](https://link.springer.com/chapter/10.1007/978-3-031-73209-6_10) | Joint blur + rolling-shutter compensation (ECCV 2024) |
| L14 | [BARD-GS (CVPR 2025)](https://openaccess.thecvf.com/content/CVPR2025/papers/Lu_BARD-GS_Blur-Aware_Reconstruction_of_Dynamic_Scenes_via_Gaussian_Splatting_CVPR_2025_paper.pdf) | Blur in dynamic scenes |
| L15 | [Deblur GS SLAM (arXiv 2503.12572)](https://arxiv.org/pdf/2503.12572) | Deblurring in GS SLAM |
| L16 | [Deblur-NeRF (arXiv 2111.14292)](https://arxiv.org/abs/2111.14292) | Learned blur kernel |
| L17 | [BAD-NeRF (arXiv 2211.12853)](https://arxiv.org/abs/2211.12853) | NeRF predecessor of BAD-Gaussians |
| L18 | [Co-adaptation paper (arXiv 2508.12720)](https://arxiv.org/pdf/2508.12720) | Related work on diffusion completion (Difix3D+, ViewCrafter, CAT3D) |
| L19 | [GSFix3D (ar5iv 2508.14717)](https://ar5iv.labs.arxiv.org/html/2508.14717) | Diffusion completion — plausible, non-metric |
| L20 | [VidSplat 2026 (arXiv 2605.11424)](https://arxiv.org/pdf/2605.11424) | Video-diffusion-based completion |
| L21 | [GaMO (arXiv 2512.25073)](https://arxiv.org/html/2512.25073) | Multi-view outpainting |
| L22 | [ReconFusion (arXiv 2312.02981)](https://arxiv.org/abs/2312.02981) | Diffusion prior for few-view NeRF |
| L23 | [CAT3D (arXiv 2405.10314)](https://arxiv.org/abs/2405.10314) | Multi-view diffusion then reconstruct |
| L24 | [ViewCrafter (arXiv 2409.02048)](https://arxiv.org/abs/2409.02048) | Video diffusion for novel views |
| L25 | [City3D (arXiv 2201.10276)](https://arxiv.org/abs/2201.10276) | Infers walls from roof planes; 20,000 buildings (our S6 reference) |
| L26 | [City3D (MDPI Remote Sensing)](https://mdpi.com/2072-4292/14/9/2254/htm) | Published version |
| L27 | [City4CFD (TU Delft)](https://github.com/tudelft3d/City4CFD) | LoD2 building models |
| L28 | [Point2Building (arXiv 2403.02136)](https://arxiv.org/pdf/2403.02136) | Building modelling from points |
| L29 | [SimpliCity (arXiv 2404.08104)](https://arxiv.org/pdf/2404.08104) | Building simplification |
| L30 | [SensatUrban (arXiv 2009.03137)](https://arxiv.org/pdf/2009.03137) | UAV photogrammetric point cloud, 7.6 km², 13 classes |
| L31 | [SensatUrban/PTv3 summary (ar5iv 2201.04494)](https://ar5iv.labs.arxiv.org/html/2201.04494) | Conflicting mIoU figures (46.2 vs 75.5) |
| L32 | [Point Transformer V3 (CVPR 2024)](https://openaccess.thecvf.com/content/CVPR2024/papers/Wu_Point_Transformer_V3_Simpler_Faster_Stronger_CVPR_2024_paper.pdf) | Point-cloud segmentation backbone |

### M. Delivery and visualisation (glTF, 3D Tiles, Cesium, Potree)

| ID | Source | Annotation |
|---|---|---|
| M1 | [Khronos — glTF Gaussian splatting](https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release) | KHR_gaussian_splatting with OGC, Cesium, Esri, Niantic |
| M2 | [Cesium — July 2025 releases](https://cesium.com/blog/2025/07/01/cesium-releases-in-july-2025/) | Experimental SPZ splats in 3D Tiles (CesiumJS 1.130.1) |
| M3 | [Cesium — Nov 2025 releases](https://cesium.com/blog/2025/11/03/cesium-releases-in-november-2025/) | Move to KHR_gaussian_splatting |
| M4 | [radiancefields.com — Cesium KHR support](https://radiancefields.com/cesium-brings-khr_gaussian_splatting-support-to-cesiumjs-and-unreal-engine) | CesiumJS 1.139, Cesium for Unreal 2.23 (Mar 2026) |
| M5 | [Cesium blog — 3DGS LOD (27 Apr 2026)](https://cesium.com/blog/2026/04/27/3d-gaussian-splats-lod/) | Hierarchical LOD for splat 3D Tiles |
| M6 | [Swyvl — 3D Tiles explained](https://swyvl.io/blog/3d-tiles-explained/) | 3D Tiles OGC standard (2019) |
| M7 | [CesiumGS 3d-tiles RESOURCES](https://github.com/CesiumGS/3d-tiles/blob/main/RESOURCES.md) | Tool list incl. py3dtiles |
| M8 | [potree23dtiles](https://github.com/yeyan00/potree23dtiles) | Potree → 3D Tiles converter |
| M9 | [Potree issue #600](https://github.com/potree/potree/issues/600) | Potree/Cesium interop discussion |
| M10 | [Cesium ion point-cloud tiling](https://cesium.com/platform/cesium-ion/3d-tiling-pipeline/point-clouds/) | Commercial SaaS tiler (not usable offline) |
| M11 | [Cesium community — OBJ to 3D Tiles](https://community.cesium.com/t/obj-to-3d-tiles/31567) | Conversion discussion |

### N. Datasets

| ID | Source | Annotation |
|---|---|---|
| N1 | [MARS-LVIG (IJRR)](https://journals.sagepub.com/doi/abs/10.1177/02783649241227968) | 21 downward sequences, 80–130 m, 3–12 m/s, RTK poses, DJI L1 LiDAR map — **our primary public benchmark** |
| N2 | [MARS-LVIG download](https://mars.hku.hk/dataset.html) | Download page |
| N3 | [MARS-LVIG (HKU Scholars Hub)](https://hub.hku.hk/handle/10722/339450) | Repository record |
| N4 | [UseGeo (GitHub)](https://github.com/3DOM-FBK/UseGeo) | UAV images + LiDAR, GT depth; 829 images |
| N5 | [UseGeo (ResearchGate)](https://www.researchgate.net/publication/381534229_UseGeo_-_A_UAV-based_multi-sensor_dataset_for_geospatial_research) | Paper |
| N6 | [UAVD4L (arXiv 2401.05971)](https://arxiv.org/abs/2401.05971) · [GitHub](https://github.com/RingoWRW/UAVD4L) | RTK/GCP-aligned mesh + DSM over ~2.5 km²; tests registration to a prior model |
| N7 | [UAVScenes (arXiv 2507.22412)](https://arxiv.org/pdf/2507.22412) | Multi-modal UAV dataset (MARS-LVIG-related); depth-model snippets |
| N8 | [INSANE (arXiv 2210.09114)](https://arxiv.org/pdf/2210.09114) | Cross-domain UAV sensor datasets |
| N9 | [Multi-LiDAR multi-UAV GNSS-denied (arXiv 2310.09165)](https://arxiv.org/pdf/2310.09165) | GNSS-denied dataset |
| N10 | [egenioussBench (arXiv 2605.05351)](https://arxiv.org/html/2605.05351) | Geospatial visual localisation benchmark (2026) |
| N11 | [AeroMap3D (arXiv 2607.14009)](https://arxiv.org/pdf/2607.14009) | UAV 6-DoF localisation against map priors (2026) |

## 4. Claims to verify (before quoting in the pitch)

| # | Claim | Why uncertain | How to verify | Owner |
|---|---|---|---|---|
| V1 | Official PS 26158 targets: ≤15 min for a 10-min video, ≤1 m accuracy, output formats | Come from team repos ("inferred targets"); one mirror says the listing has no explicit numbers | sih.gov.in PS page + NTRO PDF | R2 |
| V2 | SIH 2026 dates (idea close ~30 Sep, shortlist Nov, finale Dec) and nodal centre | Secondary blogs only | sih.gov.in, SPOC emails | R6 |
| V3 | Finale evaluation rubric and whether a dataset/video format is specified | Not retrieved | Portal / organisers | R6 |
| V4 | **GeoFF3D licence**, hardware for its "2,000 images in ~5 min", behaviour on low-altitude oblique video | Not stated in fetched sources | GitHub repo LICENSE, paper appendix, own test | R4 |
| V5 | Licences of MapAnything, π3, DA3 weights | Not verified | Repo LICENSE / model cards | R4 |
| V6 | ODM release dates (e.g. 3.6.0 "Oct 2023" conflicts with Ubuntu 24.04 base) | Fetched page inconsistent | GitHub releases, Zenodo records | R3 |
| V7 | COLMAP 4.x release dates and versions (GLOMAP merge timing) | Fetched page dated releases in 2024, conflicting | GitHub releases / tags | R1 |
| V8 | OpenMVS, OpenMVG, hloc, Kapture licences | Marked "[unverified this session]" | Repo LICENSE files | R4 |
| V9 | NodeODM/WebODM AGPL licence | Unverified | Repo LICENSE | R3 |
| V10 | DJI SRT timing latency vs frame exposure | No public measurement exists | Our own time-offset estimator on known flights | R2 |
| V11 | SoI CORS station count (~1,034 vs 1,105+) and 2026 academic access terms | Sources differ | SoI CORS portal / registration | R2 |
| V12 | GAGAN/NavIC accuracy on small drones specifically | Figures are system-level | Receiver specs, own logs | R2 |
| V13 | SkyeBrowse accuracy claims (0.1–0.5 in) | Vendor-only; likely relative | Treat as vendor claim; don't restate as fact | R6 |
| V14 | Rolling-shutter correction gains (30–60 % block, 15–25 % corridor) | Snippets, sources not individually verified | Full papers [D34][D35] | R2 |
| V15 | Video-vs-photo RMSE figures (Remote Sens. 2021) | Abstract/snippet only | Full text [D12] | R2 |
| V16 | Drones 2025 "≥10 % obliques at 20–45°" and Sensors 2018 corridor numbers | Snippets; full text 403 | Full text [D16][D20] | R2 |
| V17 | GS-from-video CE90 5.26 m / LE90 0.56 m (T&F 2026) | Snippet only | Full text [D42] | R3 |
| V18 | DJI Terra RTK-FIX oblique formula (1 cm + 1–2× GSD H; 2 cm + 1.5–3× GSD V) | From a search summary, page not verified | DJI Terra manual v4.3 [B3] | R2 |
| V19 | PTv3 SensatUrban mIoU (46.2 vs 75.5) | Conflicting setups | Original papers [L31][L32] | R4 |
| V20 | GVINS "~4.5 m ATE over 23 km" | Secondary summary | Primary paper [D25] | R2 |
| V21 | Derived numbers we use: Zhang → ≈3.5 m CE90 / 6.5 m LE90; 0.1 % scale error over 300 m | Our derivations, not sourced | Keep labelled "derived" | R2 |
| V22 | Whether ODM 3.6.x outputs Gaussian splats natively | Not confirmed | ODM docs/releases | R3 |
| V23 | Tesseract's reported numbers (548 s, 0.344 m) | Competitor self-report on synthetic data | Their repo; don't overstate | R6 |

## 5. Recommended reading order

| Step | Who | Read | Time | Why |
|---|---|---|---|---|
| 1 | Everyone | [`00-project-charter.md`](00-project-charter.md) | 15 min | Scope, stages, targets |
| 2 | Everyone | The research report (§1) | 45 min | Whole argument in one place |
| 3 | Everyone | [Zhang et al. 2019](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf) (Table 1 only) | 15 min | Bias vs noise — the core insight |
| 4 | Everyone | [James & Robson 2014](https://discovery.ucl.ac.uk/id/eprint/1443475/1/esp3609.pdf) (abstract + conclusions) | 20 min | Why single strips dome |
| 5 | R2, R1 | [Vautherin et al. 2016](https://isprs-annals.copernicus.org/articles/III-3/139/2016/isprs-annals-III-3-139-2016.pdf); [ASPRS Ed. 2 summary](https://lidarmag.com/2023/10/06/the-asprs-positional-accuracy-standards-edition-2/amp/); [Maxar accuracy whitepaper](https://dg-cms-uploads-production.s3.amazonaws.com/uploads/document/file/38/DG_ACCURACY_WP_V3.pdf) | 1.5 h | Rolling shutter; how we will be judged |
| 6 | R1, R4 | [Spagnolo et al. 2026](https://arxiv.org/html/2608.18632); [GeoFF3D](https://arxiv.org/abs/2608.28288); [GLOMAP](https://arxiv.org/html/2407.20219v2); [COLMAP releases](https://github.com/colmap/colmap/releases) | 2 h | Pose-estimation choices |
| 7 | R3 | [ODM arguments](https://docs.opendronemap.org/arguments/); [ODM hardware thread](https://community.opendronemap.org/t/hardware-recommendations-cpu-cores-graphics-card-cuda-nvidia-memory-ram-storage/13705); [City3D](https://arxiv.org/abs/2201.10276); [PGSR](https://arxiv.org/html/2406.06521v2) | 2 h | Dense, completion, splats |
| 8 | R4 | [DroneSplat](https://arxiv.org/abs/2503.16964); [VGGT licence](https://github.com/facebookresearch/vggt); [Wu et al.](https://arxiv.org/abs/2507.14798) | 1.5 h | Masking, licences, limits of feed-forward |
| 9 | R5 | [Khronos splat release](https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release); [Cesium splat LOD](https://cesium.com/blog/2026/04/27/3d-gaussian-splats-lod/); [3D Tiles resources](https://github.com/CesiumGS/3d-tiles/blob/main/RESOURCES.md) | 1 h | Delivery formats |
| 10 | R6, R2 | [PS mirror](https://zaidsayyed.in/tools/sih-problem-statements/sih26158); [Tesseract](https://github.com/kartikshirode/sih26158-single-pass-3d); [DST guidelines](https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf); [PIB Drone Rules](https://static.pib.gov.in/writereaddata/specificdocs/documents/2022/jan/doc202212810701.pdf); [SoI CORS](https://cors.surveyofindia.gov.in/introduction.html) | 1.5 h | Competition, regulation, anchors |
| 11 | Everyone | The six research notes — "Gaps" sections | 30 min | Know what we don't know |

---

## Related documents

- [00-project-charter.md](00-project-charter.md) — single source of truth
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
- [16-glossary.md](16-glossary.md)
