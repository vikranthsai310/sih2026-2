# 16 · Glossary

> **Purpose:** Plain-language definitions of the photogrammetry, geodesy, computer-vision and defence terms used across the Drishti3D documentation, so that every team member and judge can read any document without looking terms up elsewhere.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R2 Geo & Accuracy Lead (maintainer), all roles contribute

---

## How to use this glossary

- Terms are **alphabetical**. Terms that start with a digit come first.
- **Used in** points to the document (by number, e.g. `06`) and/or pipeline stage (`S0`–`S9`, `P`) where the term matters most. Stage IDs follow [00-project-charter.md](00-project-charter.md) §7.
- Numbers quoted in definitions come from the research report ([reports/Single pass drone 3D reconstruction.md](../reports/Single%20pass%20drone%203D%20reconstruction.md)) with its sources. See [15-research-and-references.md](15-research-and-references.md).
- If you add a term, keep the definition to 1–3 plain sentences and add the "Used in" line.

**Jump to:** [0–9](#09) · [A](#a) · [B](#b) · [C](#c) · [D](#d) · [E](#e) · [F](#f) · [G](#g) · [I](#i) · [K](#k) · [L](#l) · [M](#m) · [N](#n) · [O](#o) · [P](#p) · [R](#r) · [S](#s) · [T](#t) · [U](#u) · [V](#v) · [W](#w) · [Y](#y)

---

## 0–9

| Term | Definition | Used in |
|---|---|---|
| **3D Gaussian Splatting (3DGS)** | A scene representation made of millions of small, coloured, semi-transparent 3D blobs ("Gaussians") that render photorealistic views very fast. It looks excellent but measures slightly worse than photogrammetry, so in Drishti3D it is **display only**. | 02, 05 · S7 |
| **3D Tiles (OGC)** | An open standard for streaming very large 3D datasets (meshes, point clouds, splats) as a hierarchy of tiles with levels of detail. CesiumJS loads it natively. | 08, 09 · S8 |
| **7-DoF similarity transform** | A transformation with 7 degrees of freedom: 3 translations, 3 rotations and 1 uniform scale. It moves an arbitrarily scaled SfM model into real-world coordinates without changing its shape. Also called a **Sim(3)** transform, or by geodesists a **Helmert transformation**. | 06 · S4 |

## A

| Term | Definition | Used in |
|---|---|---|
| **Absolute accuracy** | How close model coordinates are to their true positions on Earth (e.g. "this corner is 0.8 m from its surveyed location"). Mostly controlled by georeferencing, not reconstruction. | 01, 06, 11 · S4, S9 |
| **ALIKED** | A lightweight learned keypoint detector and descriptor that is supported in COLMAP 4.x. We prefer it over SuperPoint because of licensing. | 05, 07 · S3 |
| **Anchoring** | Our term for fixing the model's absolute position with an extra source beyond raw GPS: a reference orthophoto / DSM, RTK/PPK, CORS, GAGAN or a known point. | 02, 06 · S4 |
| **ASPRS Positional Accuracy Standards (Ed. 2, 2023)** | The American Society for Photogrammetry and Remote Sensing standard for reporting map accuracy. It uses RMSE only, with **≥ 30 independent checkpoints**, each at least twice as accurate as the product. | 06, 11 · S9 |

## B

| Term | Definition | Used in |
|---|---|---|
| **Barometric altitude** | Height estimated from air pressure. Smooth and precise over short periods but offset by weather. It is an optional PS input that helps control vertical drift. | 01, 05 · S0, S3 |
| **Bias vs. noise** | Splitting an error into a constant offset (bias, the mean error) and random scatter (noise, the standard deviation). Consumer GNSS error is mostly bias, so it can be removed with one anchor. | 06, 11 · S9 |
| **Boresight** | The small angular misalignment between the camera's optical axis and the IMU / gimbal frame. If it is ignored, attitude-based priors point slightly the wrong way. | 06 · S3, S4 |
| **Bundle adjustment (BA)** | The optimisation at the heart of SfM. It adjusts all camera poses, 3D points and (optionally) lens parameters together to minimise reprojection error. COLMAP 4.x includes GPU-accelerated BA. | 05 · S3 |

## C

| Term | Definition | Used in |
|---|---|---|
| **CE90 (Circular Error 90 %)** | The horizontal radius that contains 90 % of position errors. When RMSE_x ≈ RMSE_y, **CE90 ≈ 2.146 × RMSE_x**. This is the standard defence and GEOINT horizontal accuracy measure. | 01, 06, 11 · S9 |
| **Checkpoint** | A surveyed ground point that is **not** used to build or adjust the model and is kept only to measure its accuracy. Unlike a GCP, it gives an independent test. | 06, 11, 12 · S9 |
| **CityGML** | An OGC standard for semantic 3D city models (buildings, roofs, walls, roads) with levels of detail such as LoD2. | 08 · S6 |
| **COG (Cloud-Optimised GeoTIFF)** | A GeoTIFF laid out internally with tiles and overviews, so software can read just the part it needs. Used for our orthomosaic, DSM and DTM. | 08 · S5, S8 |
| **COLMAP** | The widely used open-source (BSD) Structure-from-Motion and MVS toolkit. Version 4.x adds the GLOMAP global mapper, GPS / gravity pose priors, ALIKED / LightGlue and GPU bundle adjustment. | 05, 07 · S3 |
| **Confidence map** | A per-surface label layer showing how trustworthy each part of the model is: *observed-high*, *observed-low* or *inferred*. | 02, 09 · S6, S9 |
| **CORS (Continuously Operating Reference Stations)** | Permanent GNSS base stations that broadcast corrections. Survey of India's network (~1,000+ stations) offers RTK / NRTK at about ±3 cm and is free for government and academia. | 06 · S4 |
| **CRS (Coordinate Reference System)** | The definition of how coordinates map to places on Earth, e.g. WGS84 geographic (EPSG:4326) or UTM zone 43N (EPSG:32643). Every output must state its horizontal and vertical CRS. | 06, 08 · S4, S8 |

## D

| Term | Definition | Used in |
|---|---|---|
| **Data localisation (DST 2021)** | An Indian rule that geospatial data finer than **1 m horizontal / 3 m vertical** must be owned by Indian entities and stored and processed in India. This is why Drishti3D runs fully offline. | 01, 04 |
| **Doming** | A systematic bowl- or dome-shaped height error caused by self-calibrating lens distortion on near-parallel (single-strip) views. It reached metres in simulation and ~0.2 m in a real test. Oblique views or fixed intrinsics reduce it 10–100×. | 01, 06, 11 · S3, S9 |
| **DPVO (Deep Patch Visual Odometry)** | A learned visual odometry method that needs less than 3 GB of GPU memory. It is our low-memory fallback for local camera poses. Its horizontal drift was 5.75 % on short nadir drone flights. | 05 · S3 |
| **DSM (Digital Surface Model)** | A height raster of the **top** surface: rooftops, tree canopy and terrain. | 08 · S5 |
| **DTM (Digital Terrain Model)** | A height raster of the **bare ground**, with buildings and vegetation removed by classification and filtering. | 08 · S5, S6 |
| **DUSt3R / MASt3R / VGGT** | Feed-forward 3D foundation models that predict point maps and camera poses directly from images. They are powerful but have licence limits: DUSt3R / MASt3R are non-commercial, and VGGT-1B-Commercial excludes military use. Not a default in Drishti3D. | 07, 15 · S3 |
| **Dynamic object** | Anything that moves during capture (vehicles, people, animals). Moving objects break the static-scene assumption of SfM and MVS, so they are masked. | 01, 05 · S2 |

## E

| Term | Definition | Used in |
|---|---|---|
| **EGM96 / geoid** | The geoid is the "mean sea level" surface of Earth's gravity field. EGM96 is a global model of it. The height difference between the geoid and the WGS84 ellipsoid (geoid undulation) varies by tens of metres across India. | 06, 08 · S4 |
| **Ellipsoidal vs. orthometric height** | Ellipsoidal height (what GNSS gives) is measured above the mathematical WGS84 ellipsoid. Orthometric height ("above mean sea level") is measured above the geoid. Mixing them up creates large vertical errors. | 06, 08 · S4 |
| **Epipolar geometry** | The geometric relation between two views of the same scene: a point in one image must lie on a known line (the epipolar line) in the other. It is the basis of matching and of relative pose. | 05 · S3 |
| **Extrinsics** | A camera's **position and orientation** in the world for a given frame, together called its **pose**. | 05, 06 · S3 |

## F

| Term | Definition | Used in |
|---|---|---|
| **Feed-forward reconstruction** | Neural networks that output 3D geometry and poses in a single forward pass instead of iterative optimisation (e.g. VGGT, MapAnything, GeoFF3D). They are fast but less accurate than SfM at high resolution, and licences vary. | 05, 15 · S3 |
| **FMV (Full-Motion Video)** | The defence term for surveillance video from aircraft or UAVs, usually MPEG-TS with embedded KLV metadata. | 01, 08 · S0 |
| **Focus of expansion** | The image point toward which a forward-moving camera travels. Points near it show little parallax, so forward-looking video has weak depth there. | 01 |

## G

| Term | Definition | Used in |
|---|---|---|
| **GAGAN** | GPS-Aided GEO Augmented Navigation, India's SBAS (AAI / ISRO). It improves GPS to about 1.5 m horizontal and 2.5 m vertical. | 06 · S4 |
| **GCP (Ground Control Point)** | A surveyed point, visible in the imagery, whose coordinates are **used** to constrain or georeference the model. The PS asks us to avoid needing "extensive" GCPs. At most we accept one (`--gcp`). | 01, 06, 12 · S4 |
| **GDAL / PDAL** | Open-source libraries for raster/vector geodata (GDAL) and point clouds (PDAL). We use them to make DSM, DTM, orthomosaics and COGs, and to filter point clouds. | 07 · S5, S8 |
| **Georeferencing** | Assigning real-world coordinates (a CRS) to a model or image, so that it lines up with maps. | 06 · S4 |
| **GLOMAP** | A global Structure-from-Motion method, "orders of magnitude faster" than incremental COLMAP at comparable accuracy. It is now merged into COLMAP as the "global" mapper. | 05, 07 · S3 |
| **glTF / GLB** | The Khronos standard format for 3D meshes and textures ("the JPEG of 3D"). GLB is its single-file binary form. The KHR_gaussian_splatting extension adds splats. | 08, 09 · S8 |
| **GNSS** | Global Navigation Satellite System, the umbrella term for GPS, GLONASS, Galileo, BeiDou and NavIC. Consumer drone GNSS is typically metres off. | 01, 06 · S0, S4 |
| **Gravity prior** | A constraint that the model's "down" matches the true vertical, taken from the IMU or gimbal attitude. It fixes roll about a straight flight line, which GPS alone cannot observe. | 05, 06 · S3 |
| **Green / yellow / red zone** | Airspace categories under India's Drone Rules 2021. Green zone allows flight up to 120 m without permission. Red zone needs Central Government permission. Our test flights stay in green zones. | 12 |
| **GSD (Ground Sampling Distance)** | The ground size of one image pixel (e.g. 2 cm/px). It depends on altitude, focal length and sensor. DJI's rule of thumb is accuracy of about 1–2 × GSD. | 06, 12 |

## I

| Term | Definition | Used in |
|---|---|---|
| **ICP (Iterative Closest Point)** | An algorithm that aligns two point clouds or surfaces by repeatedly matching nearest points and solving for the best transform. It is used in DSM-to-DSM registration and evaluation. | 06, 11 · S4, S9 |
| **IMU (Inertial Measurement Unit)** | Accelerometers and gyroscopes that measure motion and gravity direction. It is an optional PS input. Consumer video files usually lack a synchronised raw IMU stream. | 01, 05 · S0, S3 |
| **Intrinsics** | A camera's internal parameters: focal length, principal point and lens distortion (K1, K2…). Locking them from a pre-calibration is our main defence against doming. | 05, 06 · S3 |

## K

| Term | Definition | Used in |
|---|---|---|
| **Keyframe** | A frame selected from the video for reconstruction because it is sharp and adds enough new parallax. We target about 1–2 keyframes per second. | 05 · S1 |
| **KLV (Key-Length-Value)** | A binary metadata encoding (SMPTE 336) embedded in FMV streams. It carries platform position, attitude, sensor angles and timestamps. | 08 · S0 |

## L

| Term | Definition | Used in |
|---|---|---|
| **Laplacian variance** | A sharpness score: the variance of the image's Laplacian (second-derivative) response. Blurry frames have low variance and are rejected. | 05 · S1 |
| **LAS / LAZ** | The ASPRS standard file format for point clouds (LAS). LAZ is its losslessly compressed form. Each point can carry XYZ, colour, class and more. | 08 · S8 |
| **LE90 (Linear Error 90 %)** | The vertical error bound containing 90 % of height errors. **LE90 = 1.6449 × RMSE_z**. | 06, 11 · S9 |
| **Lever arm** | The 3D offset between the GNSS antenna and the camera's optical centre. It must be applied when converting antenna positions to camera positions, especially at RTK accuracy. | 06 · S4 |
| **LightGlue** | A fast learned feature matcher that pairs keypoints (ALIKED, SuperPoint) between images. Supported in COLMAP 4.x. | 05, 07 · S3 |
| **LoD2 (Level of Detail 2)** | A CityGML level where buildings are blocks with real roof shapes (gable, hip, flat) but no facade detail. We fit LoD2 planes to complete occluded walls. | 05 · S6 |
| **Loop closure** | Recognising a previously visited place to correct accumulated drift in SLAM. A single pass never revisits anywhere, so it gives nothing, and drift control must come from GPS, barometer and reference data. | 01, 05 · S3 |

## M

| Term | Definition | Used in |
|---|---|---|
| **Mesh** | A surface made of connected triangles (vertices + faces). With a texture it is the main visual 3D product. | 08 · S5 |
| **MISB ST 0601** | The Motion Imagery Standards Board "UAS Datalink Local Set", which defines KLV metadata fields for UAV video (sensor lat/lon/alt, platform heading, frame centre, etc.). Decoded with `klvdata`. | 01, 08 · S0 |
| **MVS (Multi-View Stereo)** | The step after SfM. With camera poses known, it computes dense depth for (almost) every pixel and fuses them into a dense point cloud. | 05 · S5 |

## N

| Term | Definition | Used in |
|---|---|---|
| **NavIC (IRNSS)** | India's regional navigation satellite system. Standalone accuracy is about 5–20 m. It is on our future roadmap as a native positioning source. | 02, 06 |
| **NeRF (Neural Radiance Field)** | A neural network that represents a scene as colour and density at every 3D point, rendered by ray marching. For large aerial scenes it has largely been overtaken by 3DGS. | 15 |

## O

| Term | Definition | Used in |
|---|---|---|
| **Oblique imagery** | Images taken with the camera tilted from vertical (e.g. 20–30°). A small share of oblique views sharply reduces doming. | 12 |
| **ODM (OpenDroneMap)** | An open-source (AGPL-3.0) drone photogrammetry suite. It ingests video + DJI `.srt` (default cap 500 frames) and outputs orthophoto, DSM/DTM, LAZ, OBJ and 3D Tiles. It is our M1 baseline. | 07, 13 |
| **OpenMVS** | An open-source (AGPL-3.0) library for dense reconstruction, meshing, mesh refinement and texturing. It is our S5 engine. | 05, 07 · S5 |
| **Optical flow** | The apparent per-pixel motion between consecutive frames. We use its magnitude to measure parallax for keyframe selection. | 05 · S1, P |
| **Orthomosaic** | A seamless, map-accurate top-down image built from many photos, corrected for terrain and perspective so distances can be measured on it. | 08 · S5, P |

## P

| Term | Definition | Used in |
|---|---|---|
| **Parallax** | The apparent shift of a nearer object against the background when the viewpoint moves. It is the only source of depth for a single moving camera. | 01, 02 · S1 |
| **Point cloud** | A set of 3D points (XYZ, often with colour and class). The sparse cloud comes from SfM. The dense cloud comes from MVS. | 08 · S3, S5 |
| **PPK (Post-Processed Kinematic)** | GNSS positioning corrected **after** the flight using base-station logs. It gives cm-level positions without a live radio link. PPK with zero GCPs reached XY 2.4 cm / Z 2.2 cm in Zhang et al. (2019). | 06 · S4 |

## R

| Term | Definition | Used in |
|---|---|---|
| **Relative accuracy** | How correct the model's **internal** geometry is (lengths, angles, areas, volumes), regardless of where it sits on Earth. Our target is ≤ 0.5 % length error (short ~300 m clips need an extra scale source such as RTK/PPK, anchoring or a known length). | 03, 06, 11 · S9 |
| **Reprojection error** | The pixel distance between where a reconstructed 3D point projects into an image and where it was actually detected. It is the quantity bundle adjustment minimises. | 05 · S3 |
| **RMSE (Root Mean Square Error)** | The square root of the average squared error. It is the core accuracy statistic in ASPRS Ed. 2, reported per axis (RMSE_x, RMSE_y, RMSE_z) or horizontally (RMSE_H). | 06, 11 · S9 |
| **Rolling shutter** | A sensor readout where image rows are exposed one after another, so a moving drone skews the image. Measured readouts include 74 ms (Phantom 2 Vision+) and 30 ms (Inspire 1). S3 models it. | 01, 05 · S3 |
| **RTK (Real-Time Kinematic)** | GNSS positioning corrected **live** from a base station or CORS network, giving cm-level accuracy. Our RTK/PPK-tier target is ≤ 0.10 m CE90. | 06 · S4 |

## S

| Term | Definition | Used in |
|---|---|---|
| **SAM / SAM 2 (Segment Anything)** | Meta's promptable segmentation models. SAM 2 also tracks masks through video. It is Apache-2.0 licensed and used for dynamic-object and sky masks. | 05, 07 · S2 |
| **SBAS (Satellite-Based Augmentation System)** | Geostationary satellites that broadcast GNSS corrections and integrity data. GAGAN is India's SBAS. | 06 · S4 |
| **Semantic segmentation** | Labelling every pixel or point with a class (ground, building, road, vegetation, vehicle, water…). | 05 · S2, S6 |
| **SfM (Structure-from-Motion)** | Recovering camera poses and a sparse 3D point cloud from overlapping images by matching features and running bundle adjustment. | 05 · S3 |
| **SLAM (Simultaneous Localisation and Mapping)** | Estimating camera motion and a map at the same time, usually online. Monocular SLAM drifts badly in altitude on long drone passes (vertical RMSE > 100 m in 29 of 34 long runs in one 2026 benchmark). | 05, 15 · S3 |
| **SRT (DJI subtitle telemetry)** | The `.SRT` "subtitle" sidecar that DJI drones write next to each video. It holds per-frame time, lat/lon, altitude and camera settings. The format varies by model, and it uses local time with no timezone. | 01, 08 · S0 |
| **STANAG 4609** | The NATO standard for digital motion imagery (FMV). It packages video with MISB KLV metadata, typically in MPEG-TS. | 01, 08 · S0 |
| **SuperPoint** | A learned keypoint detector / descriptor, widely paired with LightGlue. Its official weights are non-commercial, so ALIKED is our default. | 07 · S3 |

## T

| Term | Definition | Used in |
|---|---|---|
| **Texture atlas** | One or a few large images into which all the mesh's surface colours are packed, with UV coordinates mapping each triangle to its patch. | 08 · S5 |
| **Time offset** | The unknown delay between video frame timestamps and GPS log timestamps. We estimate it by cross-correlating GPS velocity with SfM-derived velocity. Sync better than 1 ms is needed for cm-level direct georeferencing at 10–30 m/s. | 05, 06 · S0 |

## U

| Term | Definition | Used in |
|---|---|---|
| **Umeyama alignment** | A closed-form least-squares method for the best similarity (rotation, translation, scale) between two sets of corresponding points. We run it robustly (with outlier rejection) between SfM camera centres and GPS positions. | 06 · S4 |
| **UTM (Universal Transverse Mercator)** | A projected coordinate system that divides Earth into 6°-wide zones with metric easting/northing. India spans zones 42N–47N. Metres make measurement easy. | 06, 08 · S4, S8 |

## V

| Term | Definition | Used in |
|---|---|---|
| **VIO (Visual-Inertial Odometry)** | Motion estimation that fuses camera and IMU data. It is more robust than vision alone but needs a synchronised IMU stream. | 05, 15 · S3 |

## W

| Term | Definition | Used in |
|---|---|---|
| **WGS84** | The World Geodetic System 1984 datum and ellipsoid used by GPS. Raw drone positions are in WGS84 latitude / longitude / ellipsoidal height. | 06, 08 · S0, S4 |

## Y

| Term | Definition | Used in |
|---|---|---|
| **YOLO-seg** | A fast family of object detectors (Ultralytics) with instance-segmentation heads. It is used to mask vehicles and people quickly. Note that it is AGPL-licensed. | 05, 07 · S2 |

---

## Abbreviation quick list

| Abbrev. | Expansion | Abbrev. | Expansion |
|---|---|---|---|
| BA | Bundle adjustment | LoD | Level of Detail |
| CE90 | Circular Error, 90 % | MISB | Motion Imagery Standards Board |
| COG | Cloud-Optimised GeoTIFF | MVS | Multi-View Stereo |
| CORS | Continuously Operating Reference Stations | NTRO | National Technical Research Organisation |
| CRS | Coordinate Reference System | PPK | Post-Processed Kinematic |
| DSM / DTM | Digital Surface / Terrain Model | RMSE | Root Mean Square Error |
| FMV | Full-Motion Video | RTK | Real-Time Kinematic |
| GAGAN | GPS-Aided GEO Augmented Navigation | SBAS | Satellite-Based Augmentation System |
| GCP | Ground Control Point | SfM | Structure-from-Motion |
| GNSS | Global Navigation Satellite System | SLAM | Simultaneous Localisation and Mapping |
| GSD | Ground Sampling Distance | SoI | Survey of India |
| IMU | Inertial Measurement Unit | UTM | Universal Transverse Mercator |
| KLV | Key-Length-Value | 3DGS | 3D Gaussian Splatting |
| LE90 | Linear Error, 90 % | WGS84 | World Geodetic System 1984 |

---

## Related documents

- [00-project-charter.md](00-project-charter.md): single source of truth
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
