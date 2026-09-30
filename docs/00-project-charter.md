# 00 · Project Charter — Drishti3D

> **Single source of truth.** Every other document in `docs/` must agree with this file. If a decision changes, change it here first, then propagate.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: whole team

---

## 1. Identity

| Item | Value |
|---|---|
| Working name | **Drishti3D** (दृष्टि, "vision / sight") — rename freely, but update everywhere |
| Tagline | *One pass. One video. A measurable 3D world.* |
| Hackathon | Smart India Hackathon (SIH) 2026 — Software category |
| Problem Statement | **PS 26158 — Single-Pass Drone Video to Accurate 3D Model Generation System** |
| Sponsor | National Technical Research Organisation (NTRO) |
| Theme | Robotics and Drones |
| Repository | https://github.com/vikranthsai310/sih2026-2 |

## 2. Problem in one paragraph

Accurate 3D models of terrain and structures normally need planned multi-pass grid flights, heavy image overlap, Ground Control Points (GCPs) and hours of processing. In disaster response, reconnaissance, border mapping and inspection there is often **one chance** to fly over a target. PS 26158 asks for an AI-enabled system that turns **one drone video pass + GPS + flight metadata** into a **georeferenced, metrically accurate, textured 3D model** (terrain, facades, rooftops, roads, vegetation, obstacles) fit for visualisation, measurement and analysis — fast, and without extensive GCPs.

## 3. Core insight (why we will win)

Research (see `reports/Single pass drone 3D reconstruction.md`) shows:

1. **Relative 3D shape from video is essentially solved** — COLMAP/OpenMVS, learned SLAM and feed-forward models give sub-percent drift and cm-level internal consistency.
2. **Absolute placement is the open problem.** Consumer drone GNSS puts the model **~2–4 m off**, but the error is a near-*rigid bias* (e.g. Z bias 3.93 m with only 0.18 m spread). One good anchor removes most of it.
3. **Single straight passes cause systematic "doming"** (bowl-shaped height error) with self-calibrated lenses on near-parallel views; 20–30° oblique views cut it 10–100×.
4. **Video-specific error sources** — video↔GPS time offset, rolling shutter, compression blur — are ignored by most teams.
5. At least **10 competing public repos** already produce pretty meshes (COLMAP + OpenMVS + GPS). **None shows measured absolute accuracy on a real flight.**

➡ **Our thesis: treat georeferencing as the core engineering problem, not a final alignment step — and prove accuracy with numbers.**

## 4. Differentiators (the pitch in five lines)

1. **Accuracy engine** — automatic video↔GPS time-sync, rolling-shutter modelling, locked intrinsics, strip-degeneracy handling, and **absolute anchoring** by registering to a reference orthophoto/DSM (+ optional RTK/PPK, Survey of India CORS, GAGAN, or one known point).
2. **Proof, not claims** — before/after accuracy table on real checkpoints in NTRO's language (**CE90 / LE90**, RMSE, bias vs noise), following ASPRS Positional Accuracy Standards Ed. 2 (2023).
3. **Honest confidence map** — every surface tagged *observed-high*, *observed-low* or *inferred*; occluded facades completed with plane-based LoD2 priors and clearly flagged.
4. **Mission-ready** — fully **offline / air-gapped** (DST 2021 geospatial data-localisation), ingests DJI `.SRT` **and** military FMV KLV (MISB ST 0601 / STANAG 4609), licence-clean models (no military-use-restricted weights).
5. **Two-tier speed** — live 2D preview while processing, metric 3D product minutes later. We never claim real-time 3D that the literature doesn't support.

## 5. Scope

### In scope (MVP → Finale)
- Ingest: MP4/MOV/TS video (1080p/4K) + DJI `.SRT`; KLV (MISB 0601) as stretch; optional IMU/baro/intrinsics/RTK-PPK files.
- Outputs: georeferenced **point cloud** (LAS/LAZ), **textured mesh** (OBJ, glTF/GLB, OGC 3D Tiles), **orthomosaic** + **DSM/DTM** (Cloud-Optimised GeoTIFF), **confidence map**, **accuracy report** (HTML/PDF + JSON).
- Web viewer: CesiumJS globe, measure distance / height / area / volume, layer toggles, confidence overlay, export buttons.
- Semantic classes: ground, building, road, vegetation, vehicle/person (masked), water, other.

### Out of scope (explicitly)
- Flight control / autopilot, onboard (edge) processing on the drone (future work).
- Real-time full 3D during flight (we provide a live **2D** preview only).
- Multi-pass fusion / change detection (stretch / future).
- Survey-grade (cm) absolute accuracy without any correction source.

## 6. Target metrics (to be confirmed against the official PS / NTRO PDF)

> ⚠ The official PS text published here has an empty "Desired Output / Evaluation Criteria" table. The figures below are **our own engineering targets**, informed by research and competitor repos. Confirm on sih.gov.in and the NTRO Drive PDF.

| Metric | Target | Condition |
|---|---|---|
| End-to-end processing | **≤ 15 min** for a 10-min 4K clip | `fast` profile, reference workstation |
| First visual (2D preview) | **≤ 60 s** after upload starts | `preview` tier |
| Relative accuracy (length error) | **≤ 0.5 %** of measured length; ≤ 10 cm on 20 m | internal geometry; GNSS-only scale can reach ~0.7 % on short (~300 m) clips — short clips need an extra scale source (RTK/PPK, anchoring, or known length). See [06](06-georeferencing-and-accuracy.md) |
| Absolute accuracy — GNSS only | report honestly (expected ~3–7 m CE90) | consumer GPS, no correction |
| Absolute accuracy — anchored | **≤ 1 m CE90, ≤ 1 m LE90** | ortho/DSM registration or CORS/GAGAN |
| Absolute accuracy — RTK/PPK | **≤ 0.10 m CE90** | when RTK/PPK supplied |
| Completeness | ≥ 90 % of visible ground footprint reconstructed | |
| Doming residual | ≤ 0.2 m peak vertical deformation along 1 km strip | vs LiDAR/DSM truth |

Conversions (ASPRS): **CE90 ≈ 2.146 × RMSE_x** (when RMSE_x ≈ RMSE_y), **LE90 = 1.6449 × RMSE_z**.

## 7. Pipeline (canonical stage names — use these everywhere)

| # | Stage | Module | Key tools |
|---|---|---|---|
| S0 | **Ingest & Sync** | `drishti.ingest` | ffmpeg, SRT parser, `klvdata`, time-offset estimator |
| S1 | **Keyframe Selection** | `drishti.frames` | OpenCV (optical flow parallax, variance-of-Laplacian blur) |
| S2 | **Dynamic Masking & Semantics** | `drishti.masking` | YOLO-seg / SAM 2, sky & overlay masks |
| S3 | **Pose Estimation (SfM)** | `drishti.sfm` | COLMAP 4.x global mapper (GLOMAP) + ALIKED/SuperPoint + LightGlue, GPS/gravity priors, rolling-shutter model, fixed intrinsics; fallback DPVO / feed-forward (licence-checked) |
| S4 | **Georeferencing & Anchoring** | `drishti.georef` | robust 7-DoF Umeyama to GPS → ortho/DSM registration → optional RTK/PPK/CORS/GAGAN/single-GCP |
| S5 | **Dense Reconstruction & Mesh** | `drishti.dense` | OpenMVS (densify, mesh, refine, texture), PDAL, GDAL (DSM/DTM, orthomosaic) |
| S6 | **Completion & Classification** | `drishti.completion` | point-cloud semantic labels, plane-based LoD2 roof/wall fitting (flagged *inferred*) |
| S7 | **Photoreal Layer** (optional) | `drishti.splat` | gsplat 3D Gaussian Splatting with exposure compensation — **display only** |
| S8 | **Export & Tiling** | `drishti.export` | LAS/LAZ, COG GeoTIFF, OBJ/GLB, 3D Tiles (py3dtiles / ODM tiler) |
| S9 | **QA & Confidence** | `drishti.qa` | checkpoint RMSE/CE90/LE90, bias-vs-noise split, doming test, confidence map, HTML/PDF report |
| P | **Live Preview** (parallel) | `drishti.preview` | incremental 2D mosaic from GPS-tagged keyframes |

Processing **profiles**: `preview` (2D only, seconds) · `fast` (default, ≤15 min) · `quality` (max detail, no time limit).

## 8. Technology decisions

| Layer | Choice | Licence note |
|---|---|---|
| Language | Python 3.11 (pipeline), TypeScript (web) | |
| Core CV | OpenCV, PyTorch 2.x (CUDA 12) | |
| SfM | COLMAP 4.x (global mapper, pycolmap) | BSD |
| Features | ALIKED / SuperPoint + LightGlue | check weights licence (SuperPoint weights non-commercial) — prefer ALIKED |
| MVS / mesh | OpenMVS | AGPL-3.0 (fine for hackathon; note for deployment) |
| Baseline / fallback | OpenDroneMap (ODM) | AGPL-3.0 |
| Segmentation | SAM 2 (Apache-2.0); YOLO-seg (Ultralytics AGPL) | |
| Geo | GDAL, PDAL, pyproj, rasterio, Open3D | |
| Splatting | gsplat (nerfstudio) | Apache-2.0 |
| Backend | FastAPI + local job runner (SQLite) | |
| Frontend | React + Vite + CesiumJS (3D Tiles, glTF) | Apache-2.0 |
| Packaging | Docker (CUDA base) + `docker compose`, fully offline | |

**Forbidden for final build:** model weights whose licence excludes military use (e.g. VGGT-1B-Commercial) or non-commercial weights shipped as the default. Record every model licence in `docs/07-tech-stack.md`.

**Reference hardware:** NVIDIA RTX 3060 12 GB (minimum) / RTX 4090 24 GB (ideal), 64 GB RAM, 1 TB NVMe, Ubuntu 22.04/24.04 or Windows 11 + WSL2.

## 9. Repository layout (canonical)

```
sih2026-2/
├── README.md
├── docs/                    # this documentation set
├── reports/                 # research report
├── research_notes/          # raw research notes
├── pipeline/                # Python package "drishti"
│   └── drishti/
│       ├── cli.py  config.py  run.py
│       ├── ingest/          # video.py srt.py klv.py timesync.py
│       ├── frames/          # keyframes.py blur.py
│       ├── masking/         # detector.py segmenter.py
│       ├── sfm/             # colmap_runner.py priors.py rolling_shutter.py
│       ├── georef/          # align.py register.py corrections.py crs.py
│       ├── dense/           # openmvs_runner.py rasters.py
│       ├── completion/      # classify.py lod2.py
│       ├── splat/           # train.py
│       ├── export/          # las.py cog.py gltf.py tiles3d.py
│       ├── qa/              # accuracy.py doming.py confidence.py report.py
│       └── preview/         # mosaic.py
├── server/                  # FastAPI app (jobs, runs, files, websocket progress)
├── web/                     # React + CesiumJS viewer
├── configs/                 # default.yaml fast.yaml quality.yaml preview.yaml
├── scripts/                 # dataset download, benchmarks, calibration
├── tests/                   # unit + integration + golden datasets
├── docker/                  # Dockerfiles, compose
└── data/                    # (git-ignored) inputs, runs, reference rasters
```

CLI contract: `drishti run --video flight.mp4 --srt flight.srt [--rtk rtk.pos] [--ref-ortho ref.tif] [--ref-dsm ref_dsm.tif] [--gcp gcp.csv] --profile fast --out data/runs/<run_id>`

## 10. Team & roles (6 members)

| Role | Owns |
|---|---|
| R1 Pipeline Lead | S1–S3, orchestration, config, CLI |
| R2 Geo & Accuracy Lead ⭐ | S0 time-sync, S4, S9, CRS, accuracy report |
| R3 3D & Mesh Engineer | S5, S6, S7, S8 exports |
| R4 AI/ML Engineer | S2 masking/semantics, blur models, classification |
| R5 Frontend Engineer | web viewer, measurement tools, server API integration |
| R6 Data, Flight Ops & Pitch | drone flights, checkpoints, datasets, PPT, demo |

## 11. Timeline (SIH 2026 — verify dates on sih.gov.in)

| Window | Milestone |
|---|---|
| ~30 Sep 2026 | Idea submission (PPT) |
| Oct 2026 · Wk 1–2 | M1 Baseline: ODM on sample + own video → first model |
| Oct 2026 · Wk 3–4 | M2 Own pipeline S0–S5 end-to-end, one CLI command |
| Nov 2026 · Wk 1–2 | M3 Accuracy engine (S4, S9) + real flight with ≥30 checkpoints |
| Nov 2026 | Shortlist announced (~4–5 teams per PS) |
| Nov 2026 · Wk 3–4 | M4 Viewer + exports + live preview + confidence map |
| Dec 2026 · Wk 1 | M5 Hardening, Docker offline bundle, rehearsal |
| Dec 2026 | **36-hour Grand Finale** (unseen NTRO video) |

## 12. Principles

1. **Measure, don't claim.** Every accuracy statement comes with checkpoints, conditions and method.
2. **Separate relative from absolute accuracy** — always report both.
3. **Flag, don't fake.** Inferred geometry is labelled as such.
4. **Offline first.** No cloud dependency at runtime.
5. **One command, any video.** The finale video is unseen; robustness beats peak quality.
6. **Licence-clean.** Every dependency and weight is recorded with its licence.

## 13. Document map

See [`docs/README.md`](README.md).
