# 07 · Tech Stack

> **Purpose:** every component of Drishti3D, layer by layer: what it does, why we chose it, what we rejected, which version to use, and its licence. This file also holds the licence register the charter requires.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R1 Pipeline Lead (stack), R2 Geo & Accuracy Lead (licence register sign-off)

---

## 0. How to read this document

- **Source of truth.** [`00-project-charter.md`](00-project-charter.md) §8 fixes the technology decisions. This document explains and expands them. If the two ever disagree, the charter wins. Fix this file.
- **Versions.** We quote a version only when the research notes name one. Anywhere else the text says **"pin at implementation time"**. When you pin a version, record it in the lock files (`uv.lock` / `environment.yml` / `web/package-lock.json`) and in the version column below.
- **Licences.** Anything marked **⚠ verify** was not confirmed against the upstream LICENSE file during research. R2 must check it and update the register (§11) before the idea-stage PPT, and again before the finale build.
- **Charter rule (§8):** *model weights whose licence excludes military use (e.g. VGGT-1B-Commercial), and non-commercial weights shipped as the default, are forbidden in the final build.*

### Licence traffic lights used below

| Mark | Meaning for the Drishti3D finale / NTRO build |
|---|---|
| 🟢 | Permissive (MIT, BSD, Apache-2.0, MPL-2.0, public domain). OK to ship. |
| 🟡 | Copyleft (GPL/AGPL/LGPL). OK for the hackathon and for internal or offline government use. Record it and give NTRO a deployment note. It is **not** OK to hide modifications if the tool is ever offered as a network service. |
| 🟠 | Non-commercial or research-only. May be used for **experiments and benchmarks only**. Never the default, and never in the finale bundle. |
| 🔴 | Excludes military or defence use, or is otherwise incompatible with NTRO. **Forbidden**: not in the repo, not in the bundle, not in the demo. |
| ⚪ | Unknown. Treat as 🟠 until verified. |

---

## 1. Stack at a glance

```
┌─────────────────────────── web/ (TypeScript) ──────────────────────────┐
│ React + Vite · CesiumJS (3D Tiles, glTF, KHR_gaussian_splatting)       │
│ measure tools · layer toggles · confidence overlay · export buttons    │
└───────────────▲─────────────────────────────────────────────────────────┘
                │ REST + WebSocket (progress)          static tiles/COGs
┌───────────────┴──────────── server/ (Python) ───────────────────────────┐
│ FastAPI · uvicorn · pydantic · SQLite job table · local job runner      │
└───────────────▲─────────────────────────────────────────────────────────┘
                │ subprocess / in-process call:  drishti run ...
┌───────────────┴──────────── pipeline/drishti (Python 3.11) ─────────────┐
│ S0 ffmpeg · SRT parser · klvdata · time-offset estimator               │
│ S1 OpenCV (flow parallax, variance-of-Laplacian)                        │
│ S2 YOLO-seg / SAM 2 masks                                               │
│ S3 COLMAP 4.x global mapper (pycolmap) · ALIKED(+SuperPoint) · LightGlue│
│    fallback: DPVO / licence-checked feed-forward                        │
│ S4 Umeyama 7-DoF · ortho/DSM registration · RTK/PPK/CORS/GAGAN · GCP    │
│ S5 OpenMVS · PDAL · GDAL          S6 Open3D planes · LoD2               │
│ S7 gsplat (display only)          S8 laspy/PDAL · COG · glTF · 3D Tiles │
│ S9 accuracy/doming/confidence · HTML/PDF report   P  2D live mosaic     │
└─────────────────────────────────────────────────────────────────────────┘
          Docker (CUDA 12 base) + docker compose · fully offline
```

---

## 2. Platform layer

| Component | Purpose | Why chosen | Alternatives considered and why rejected | Version guidance | Licence |
|---|---|---|---|---|---|
| **Ubuntu 22.04 / 24.04 LTS** | Host OS for development and the finale | Every CV/photogrammetry tool builds and tests on it first. ODM 3.6.0 moved to an Ubuntu 24.04 base ([ODM releases](https://github.com/OpenDroneMap/ODM/releases)). | Windows native: COLMAP/OpenMVS builds are painful and paths break. macOS: no CUDA. | 22.04 or 24.04 LTS | Various, all free |
| **Windows 11 + WSL2** | Supported dev setup for team laptops | Uses the Windows NVIDIA driver with CUDA inside WSL2 Ubuntu. Same scripts as Linux. | Dual boot: works, but clumsy for the team | WSL2 with Ubuntu 22.04/24.04 | Proprietary host OS |
| **NVIDIA driver + CUDA 12.x** | GPU compute for COLMAP, OpenMVS, PyTorch, gsplat | The charter fixes CUDA 12. PyTorch, COLMAP and gsplat all ship CUDA 12 builds. | ROCm/HIP: COLMAP 4.2.0 added ROCm support ([COLMAP releases](https://github.com/colmap/colmap/releases)), but PyTorch3D-style extensions, gsplat and OpenMVS CUDA paths are NVIDIA-first. Rejected for the MVP. | CUDA 12.x. Pin the minor version at implementation time and match it to the PyTorch wheel. | NVIDIA EULA (driver, toolkit) |
| **Docker + docker compose + NVIDIA Container Toolkit** | Reproducible, **offline** deployment bundle | Charter §8: one bundle, `docker load`, runs air-gapped. ODM already ships a `opendronemap/odm:gpu` image used with `--gpus all` ([ODM GitHub](https://github.com/OpenDroneMap/ODM)). | Conda-only installs: not reproducible across machines. Singularity/Apptainer: fine on HPC, unfamiliar on laptops. | Docker Engine / Desktop current. Compose v2. | Apache-2.0 (Engine/Compose). Check the NVIDIA CUDA base image licence terms. |
| **Python 3.11** | Pipeline and server language | Charter §8. Supported by PyTorch 2.x, pycolmap, GDAL/PDAL on conda-forge. | 3.12: ODM moved to it, but some geo/ML wheels lag. Revisit after M2. | 3.11.x | PSF |
| **TypeScript + Node.js ≥ 20 LTS** | Web viewer | Charter §8. Vite needs a modern Node. | Plain JS: harder to refactor the measurement code safely | Node 20 LTS or newer. TypeScript: pin at implementation time. | Node MIT · TS Apache-2.0 |
| **conda-forge (Miniforge) + uv** | Environment management | conda-forge gives GDAL/PDAL/PROJ binaries that match each other. uv resolves the pure-Python layer quickly and writes a lock file. | pip-only: GDAL/PDAL wheels are fragile. Poetry: slower, and does not handle binary geo stacks. | Pin at implementation time | BSD-3 (Miniforge) · Apache-2.0/MIT (uv) |

---

## 3. Stage-by-stage components

### 3.1 S0 · Ingest & Sync (`drishti.ingest`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Version | Licence |
|---|---|---|---|---|---|
| **ffmpeg / ffprobe** | Decode MP4/MOV/TS (H.264/H.265), read PTS timestamps, demux the KLV data PID from `.ts` | Universal. Handles every drone container. Gives exact per-frame PTS, which the time-sync step needs. | OpenCV `VideoCapture`: no reliable PTS and no data-stream demux. PyAV: good. Allowed as a Python binding over the same libav. | Pin at implementation time. Use a build **without** `--enable-nonfree`. | LGPL-2.1 or GPL, depending on build flags 🟡. Ship an LGPL build. |
| **Own DJI SRT parser** (`ingest/srt.py`) | Parse per-frame lat/lon/alt/focal/gimbal/ISO/shutter from `.SRT` sidecars | The SRT format differs between DJI models. ODM needed several per-model fixes (Phantom 4 RTK in 3.2.0, Mavic 2 Zoom in 3.5.1, a telemetry fix in 3.6.2) ([ODM releases via Zenodo](https://zenodo.org/records/21909664)). Our own regex-based parser plus golden test files per model gives us control. SRT times are local with **no timezone** ([ScienceDirect 2025](https://www.sciencedirect.com/science/article/abs/pii/S2352938525003544)). | [DJI_SRT_Parser](https://github.com/JuanIrache/DJI_SRT_Parser) (JavaScript, wrong runtime). [dji-telemetry](https://pypi.org/project/dji-telemetry/) (Python). Use it as a **reference and cross-check**, not a hard dependency. exiftool `-ee`: not verified for all models. | n/a (in-repo) | Ours. Reference parsers: ⚪ verify before copying any code. |
| **klvdata** | Decode MISB ST 0601 (UAS Datalink LS) and ST 0102 from STANAG 4609 transport streams | The only mature pure-Python KLV decoder with no dependencies ([PyPI](https://pypi.org/project/klvdata/), [paretech/klvdata](https://github.com/paretech/klvdata)). NTRO will expect FMV support (charter §4.4). | klv-parser, klvcms: smaller, less used. All4Gis fork: used in QGIS FMV context, same lineage. | Pin at implementation time. Maintenance status: ⚠ verify. | ⚪ verify (believed MIT) |
| **Time-offset estimator** (`ingest/timesync.py`) | Estimate the SRT↔frame offset by cross-correlating GPS velocity with SfM/flow velocity | For cm-level georeferencing at 10–30 m/s, sync must be better than 1 ms ([Rehak & Skaloud, via ResearchGate](https://www.researchgate.net/publication/311555608_Time_synchronization_of_consumer_cameras_on_Micro_Aerial_Vehicles)). No public measurement of DJI SRT latency exists. | Assume offset = 0 (what everyone else does). Rejected: this is a differentiator. | n/a | Ours (NumPy/SciPy BSD) 🟢 |
| **NumPy, SciPy, pandas** | Numerics, interpolation, signal correlation | Standard | — | Pin at implementation time | BSD-3 🟢 |

### 3.2 S1 · Keyframe Selection (`drishti.frames`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Version | Licence |
|---|---|---|---|---|---|
| **OpenCV (opencv-python-headless)** | Optical-flow parallax, variance-of-Laplacian blur score, shot-cut and overlay detection | Fast and CPU-friendly. Well understood. Research shows about one frame per 2.5 s matches still-photo accuracy, and denser sampling adds compute, not accuracy ([Remote Sens. 2021](https://doi.org/10.3390/rs13142745)). | Learned blur or quality models: optional R4 experiment, not the default. Fixed-fps sampling (ODM `--video-limit` 500): ignores blur and parallax. | 4.x. Pin at implementation time. | Apache-2.0 (OpenCV ≥ 4.5) 🟢 |

### 3.3 S2 · Dynamic Masking & Semantics (`drishti.masking`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Version | Licence |
|---|---|---|---|---|---|
| **SAM 2** | Promptable and video-propagated masks for vehicles and people. DroneSplat-style tracking of temporarily parked vehicles ([arXiv 2503.16964](https://arxiv.org/abs/2503.16964)). | Apache-2.0 code **and** weights. Video propagation. | SAM v1: no video memory. Note that DroneSplat reports SAM 2 is a compute bottleneck on large scenes, so run it only on keyframes. | Pin checkpoint (e.g. a small/base variant) at implementation time | Apache-2.0 🟢 |
| **Ultralytics YOLO-seg** | Fast class detector and segmenter (car, truck, person, bus) that produces prompts or masks | Fastest route to class-aware masks. Well documented. | Detectron2 Mask R-CNN (Apache-2.0 code, slower, weights ⚠ verify). RT-DETR variants from other codebases (⚠ verify licence). Kept as the **licence-clean fallback path** if NTRO rejects AGPL. | Pin at implementation time | **AGPL-3.0** (code **and** weights) 🟡. Fine for the hackathon. For deployment: open-source the whole service, buy an Ultralytics enterprise licence, or switch to SAM 2 + a permissive detector. |
| **Sky / OSD overlay masks** | Remove sky (no stable features) and burned-in on-screen-display text | Simple colour/position heuristics plus a small segmenter | — | n/a | Ours 🟢 |

### 3.4 S3 · Pose Estimation (`drishti.sfm`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Version | Licence |
|---|---|---|---|---|---|
| **COLMAP 4.x (global mapper = GLOMAP) + pycolmap** | Primary SfM: features, matching, global SfM, bundle adjustment, GPS and gravity priors | GLOMAP is "orders of magnitude faster" than incremental COLMAP at comparable accuracy and handles sequential video ([arXiv 2407.20219](https://arxiv.org/html/2407.20219v2)). It is now merged into COLMAP as the "global" mapper ([GLOMAP README](https://github.com/colmap/glomap/blob/main/README.md)). COLMAP 4.x adds GPS/gravity pose priors, ALIKED/LightGlue, rig support, and Caspar GPU bundle adjustment billed as 1–2 orders of magnitude faster (4.1.0). 4.2.0 adds multi-component global mapping and LoMa matching via ONNX ([COLMAP releases](https://github.com/colmap/colmap/releases)). | See the comparison in §6.1 | **4.x.** Latest seen in research: 4.2.1. Release dates on the fetched page were inconsistent, so **verify and pin at implementation time**. Standalone GLOMAP is unmaintained, so do not use it. | BSD-3 🟢 |
| **ALIKED** (default) | Learned local features | Permissive alternative to SuperPoint. Supported natively in COLMAP 4.x. | SIFT: robust but weaker under blur and compression (kept as the CPU fallback). DISK: ⚠ verify licence. | Pin at implementation time | ⚪ verify (believed BSD-3) |
| **SuperPoint** (experiments only) | Learned features for benchmarks | Well known, strong with LightGlue | **Weights are non-commercial** (Magic Leap licence) ([hloc notes](https://github.com/cvg/Hierarchical-Localization)). Never the default. | — | **Pretrained weights non-commercial 🟠.** Code licence depends on the reimplementation (⚠ verify). |
| **LightGlue** | Learned matcher (ALIKED+LightGlue) | Fast and accurate. Integrated in COLMAP 4.x ([arXiv 2306.13643](https://arxiv.org/abs/2306.13643)) | SuperGlue (non-commercial weights 🟠). LoMa (COLMAP 4.2 ONNX; licence ⚠ verify). | Pin at implementation time | Code Apache-2.0 🟢. Each **feature-specific weight** follows its own licence. Use the ALIKED-LightGlue weights. ⚠ verify |
| **Rolling-shutter model** (`sfm/rolling_shutter.py`) | Per-row pose interpolation using a readout time | Rolling shutter displaces image content by about 10 px on a Phantom 2 at 8 m/s and 70 m. Modelling it removes systematic reprojection error ([Vautherin et al. 2016](https://isprs-annals.copernicus.org/articles/III-3/139/2016/isprs-annals-III-3-139-2016.pdf)). ODM ships per-model readout profiles (Mini 3, Mini 4 Pro, Mavic 3). | Ignore it (most teams do) | n/a | Ours 🟢 |
| **DPVO** (fallback) | Low-memory learned visual odometry when SfM fragments | **< 3 GB GPU**, the "most practical learned method" in the 2026 nadir-UAV benchmark ([arXiv 2608.18632](https://arxiv.org/html/2608.18632)) | DROID-SLAM and MASt3R-SLAM (~30 GB GPU, too heavy for a laptop). ORB-SLAM3 (GPLv3, CPU, loses tracking). | Pin at implementation time | ⚪ verify (believed MIT) |
| **GeoFF3D** (research fallback) | GPS-anchored feed-forward poses and point maps in a metric, Z-up frame | Closest published method to PS 26158. About 2,000 images in about 5 min. Stable on near-collinear paths ([arXiv 2608.28288](https://arxiv.org/abs/2608.28288)). | — | Pin a commit at implementation time | **⚪ to verify.** Blocked from the default until verified. |
| **MapAnything** (research) | Metric geometry that accepts intrinsics and pose inputs | Can take drone telemetry ([arXiv 2509.13414](https://arxiv.org/abs/2509.13414)) | — | — | **⚪ to verify** (code and weights may differ) |
| **VGGT** | Feed-forward reconstruction | Strong on small sets | Original checkpoint **non-commercial 🟠**. **VGGT-1B-Commercial excludes military use 🔴 FORBIDDEN** ([VGGT GitHub](https://github.com/facebookresearch/vggt)). | — | 🟠 / 🔴 |
| **π3 / Pi3X, Depth Anything 3** | Feed-forward pose and depth | Benchmarks only | — | — | **⚪ to verify** |
| **DUSt3R / MASt3R / MASt3R-SLAM** | Feed-forward pairwise pointmaps | Benchmarks only | CC BY-NC-SA ([slam notes](https://arxiv.org/abs/2312.14132)) | — | 🟠 |
| **Ceres Solver, GTSAM** (optional) | GNSS-aided bundle adjustment and factor graph refinement | Ceres ships with COLMAP. GTSAM is used if we add a pose-graph step with GPS and barometer factors. | GVINS/VINS-Fusion: need a raw synchronised IMU stream, which consumer video lacks ([VINS-Mono](https://arxiv.org/abs/1708.03852)). GPLv3. | Pin at implementation time | BSD-3 🟢 |

### 3.5 S4 · Georeferencing & Anchoring (`drishti.georef`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Version | Licence |
|---|---|---|---|---|---|
| **Robust Umeyama 7-DoF** (own, NumPy) | Similarity alignment of SfM camera centres to GPS (Huber/RANSAC, about 1 Hz subsampling) | Standard, fast, transparent. Consumer GNSS error is a near-rigid bias (Z mean 3.93 m, SD 0.18 m) ([Zhang et al. 2019](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)). | COLMAP `model_aligner`: fine as a cross-check, but it has no robust weighting or time-offset handling | n/a | Ours 🟢 |
| **Ortho/DSM registration** (OpenCV + rasterio) | Register our orthophoto/DSM to a reference orthophoto/DSM to remove the bias (the Raptor/Edgybees pattern) | Anchors absolute position with no GCPs. This is our main differentiator. | Manual GCP clicking: slow, and not "without extensive GCPs" | n/a | Ours 🟢 |
| **pyproj (PROJ)** | CRS transforms: WGS84 ↔ UTM ↔ ECEF, ellipsoid ↔ geoid (EGM) | Reference implementation | — | Pin at implementation time | MIT 🟢 |
| **RTK/PPK/CORS/GAGAN ingest** | Read `.pos`/RINEX-derived positions and replace SRT GPS | Survey of India CORS gives ±3 cm ([SoI CORS](https://cors.surveyofindia.gov.in/introduction.html)). GAGAN gives about 1.5 m H / 2.5 m V. | RTKLIB (BSD-2 ⚠ verify) for our own PPK post-processing: optional tool, not bundled by default | Pin at implementation time | Ours 🟢. RTKLIB ⚪ |

### 3.6 S5 · Dense Reconstruction & Mesh (`drishti.dense`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Version | Licence |
|---|---|---|---|---|---|
| **OpenMVS** | DensifyPointCloud → ReconstructMesh → RefineMesh → TextureMesh | Best open MVS + texturing quality/speed trade-off. Used inside ODM and by the strongest competitor repos. MVS geometry beats Gaussian-splat geometry ([ISPRS 2026](https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/143/2026/isprs-archives-XLVIII-2-W12-2026-143-2026.pdf)). | See §6.2 | Pin a release or commit at implementation time | **AGPL-3.0 🟡.** Called as a separate executable (process boundary). Write the deployment note for NTRO. |
| **PDAL** | Point-cloud pipelines: outlier removal, SMRF ground classification, cropping, reprojection, LAS/LAZ writing, DSM gridding | Industry standard. Scriptable JSON pipelines. | Pure Open3D: no ground filter, no LAS writing | Pin at implementation time (conda-forge) | BSD-3 🟢 |
| **GDAL** | DSM/DTM/orthomosaic rasters, COG writing, warping, overviews | Industry standard. ODM 3.6.0 bundles GDAL 3.11.1. | — | 3.x. Pin at implementation time (conda-forge). | MIT/X 🟢 |
| **rasterio** | Pythonic GDAL raster I/O | Clean API for S4, S8 and S9 | — | Pin at implementation time | BSD-3 🟢 |
| **Open3D** | Point-cloud and mesh utilities, ICP, RANSAC planes, TSDF (checks) | Fast, well-documented Python API | trimesh (MIT) for light mesh I/O, used alongside Open3D | Pin at implementation time | MIT 🟢 |

### 3.7 S6 · Completion & Classification (`drishti.completion`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Licence |
|---|---|---|---|---|
| **PDAL SMRF + height rules** | Ground / non-ground labels | Deterministic and fast | Learned point-cloud segmentation models: considered as a stretch, trained or validated on SensatUrban (licence ⚠ verify) | BSD-3 🟢 |
| **Open3D RANSAC + own LoD2 fitting** | Roof planes → vertical walls to ground (City3D-style), flagged *inferred* | Metric and explainable. City3D shows the approach ([arXiv 2201.10276](https://arxiv.org/abs/2201.10276)). | Diffusion completion (ReconFusion, CAT3D, Difix3D+): plausible but **non-metric**, rejected for measurement. City3D/City4CFD code: ⚠ verify licences before reuse. | MIT 🟢 |
| **Ortho semantic labels** (from S2 masks projected) | road / vegetation / water / building hints | Reuses S2 outputs | — | as S2 |

### 3.8 S7 · Photoreal Layer (`drishti.splat`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Licence |
|---|---|---|---|---|
| **gsplat** (nerfstudio) | CUDA 3D Gaussian splatting training with per-image exposure compensation. **Display only.** | Apache-2.0, fast, Python API ([gsplat](https://github.com/nerfstudio-project/gsplat)). CesiumJS 1.139 renders `KHR_gaussian_splatting` ([radiancefields.com](https://radiancefields.com/cesium-brings-khr_gaussian_splatting-support-to-cesiumjs-and-unreal-engine)). | Original Inria 3DGS code: research/non-commercial licence 🟠 (⚠ verify). NeRF: slower, worse at aerial scale. DroneSplat/PGSR: ideas borrowed, code licences ⚠ verify. | Apache-2.0 🟢 |

### 3.9 S8 · Export & Tiling (`drishti.export`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Licence |
|---|---|---|---|---|
| **laspy + PDAL** | LAS 1.4 / LAZ with CRS WKT and classification codes | Standard | — | BSD-2 (laspy) · BSD-3 (PDAL) 🟢 |
| **GDAL COG driver** | Cloud-Optimised GeoTIFF ortho/DSM/DTM/confidence | Streams to the viewer with HTTP range requests, fully offline | Plain GeoTIFF: no internal tiling or overviews | MIT/X 🟢 |
| **trimesh / Open3D + gltf-transform (CLI)** | OBJ → glTF/GLB, Draco/meshopt compression | Mature | FBX: proprietary SDK. Offer FBX only via an optional Blender CLI conversion (GPL tool, not bundled). | MIT 🟢 |
| **py3dtiles** | LAS → 3D Tiles point clouds | Python-native ([CesiumGS resources](https://github.com/CesiumGS/3d-tiles/blob/main/RESOURCES.md)) | Cesium ion tiler: commercial SaaS, cloud. Rejected (offline, DST). | ⚪ verify (believed Apache-2.0) |
| **obj2tiles** (as used by ODM `--3d-tiles`) | Textured mesh → 3D Tiles | Proven in ODM 3.6.1 (obj2tiles 1.4.0) | Writing our own tiler: time sink | ⚪ verify |

### 3.10 S9 · QA & Confidence (`drishti.qa`)

| Component | Purpose | Licence |
|---|---|---|
| NumPy/SciPy/pandas | RMSE_X/Y/Z, RMSE_H, CE90 = 2.146×RMSE_axis (≈1.5175×RMSE_H), LE90 = 1.6449×RMSE_Z, bias-vs-noise split ([ASPRS Ed. 2 summary](https://lidarmag.com/2023/10/06/the-asprs-positional-accuracy-standards-edition-2/amp/)) | BSD 🟢 |
| matplotlib | Residual plots, doming profiles | PSF-based 🟢 |
| Jinja2 + WeasyPrint | HTML → PDF accuracy report | BSD-3 🟢 |
| CloudCompare (desktop, **not bundled**) | Manual cloud-to-cloud checks against LiDAR truth | GPL 🟡 (tool only) |

### 3.11 P · Live Preview (`drishti.preview`)

| Component | Purpose | Why chosen | Rejected |
|---|---|---|---|
| OpenCV homography + GPS-seeded incremental mosaic | 2D preview within 60 s | CPU incremental mosaicking reaches about 2.3 fps ([ISPRS Annals 2025](https://isprs-annals.copernicus.org/articles/X-2-W2-2025/65/2025/)) | **OpenREALM**: alpha ROS1 code, last significant update around 2020, LGPL/GPLv3 ([GitHub](https://github.com/laxnpander/OpenREALM)). Porting it costs too much. |

### 3.12 Server layer (`server/`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Licence |
|---|---|---|---|---|
| **FastAPI + uvicorn + pydantic** | REST API for jobs, runs and files, plus a WebSocket for progress | Async, typed, auto OpenAPI docs, same language as the pipeline | Django (heavy). Flask (no native async or validation). | MIT (FastAPI, pydantic) · BSD-3 (uvicorn) 🟢 |
| **SQLite** | Job table and run metadata | Zero-ops, single file, works offline | Postgres (a service to run). Redis + Celery (two more services in an air-gapped bundle, for no gain with a single GPU). | Public domain 🟢 |
| **Local job runner** | One GPU-serialised worker, subprocess per run, cancellable | One GPU means one heavy job at a time | Celery, RQ: rejected as above | Ours 🟢 |

### 3.13 Web layer (`web/`)

| Component | Purpose | Why chosen | Alternatives and why rejected | Licence |
|---|---|---|---|---|
| **React + Vite + TypeScript** | UI shell | Team familiarity, fast HMR | Vue/Svelte: fine, but less team experience | MIT 🟢 |
| **CesiumJS** | Globe, 3D Tiles, glTF, COG imagery, splats | Native OGC 3D Tiles. KHR_gaussian_splatting in 1.139 (Mar 2026) and splat LOD in 3D Tiles (Apr 2026) ([Cesium blog](https://cesium.com/blog/2026/04/27/3d-gaussian-splats-lod/)). | See §6.3 | **≥ 1.139** if the splat layer is used. Otherwise pin at implementation time. **Do not use Cesium ion at runtime** (cloud). | Apache-2.0 🟢 |
| resium (optional) | React bindings for Cesium | Less glue code | Raw Cesium in a `useEffect` also works | ⚪ verify (believed MIT) |

### 3.14 Tooling

| Tool | Use | Licence |
|---|---|---|
| ruff, black, mypy, pytest, pytest-cov, pre-commit | Python lint, format, types, tests | MIT 🟢 |
| eslint, prettier, vitest, Playwright | TS lint, format, unit and e2e tests | MIT / Apache-2.0 🟢 |
| exiftool (dev only) | Inspect EXIF/XMP, cross-check SRT | Perl Artistic/GPL 🟡 (not bundled) |
| OpenDroneMap (Docker `opendronemap/odm:gpu`) | **M1 baseline** and fallback comparator | AGPL-3.0 🟡 |

---

## 4. Hardware specification

| Tier | GPU | CPU | RAM | Storage | Use |
|---|---|---|---|---|---|
| **Minimum (dev)** | NVIDIA RTX 3060 **12 GB** (charter minimum) | 6–8 cores | 32 GB (fast profile on short clips only). **64 GB** for full 10-min runs. | 1 TB NVMe | Development and unit/integration tests. `preview` and `fast` profiles on ≤ 5-min clips. |
| **Recommended (reference workstation)** | RTX 4090 **24 GB** (charter ideal) | 12–16 cores | **64 GB** | 1 TB NVMe + 2 TB data SSD/HDD | Reference for the ≤ 15-min target. Benchmarks, splat training, `quality` profile. |
| **Finale laptop** | RTX 4080/4090 **laptop** GPU, 12–16 GB VRAM | 8+ performance cores | **64 GB** | 2 TB NVMe (bundle about 30–60 GB plus runs) | 36-hour finale, offline. Also carry a spare laptop with the bundle pre-loaded. |

Notes:
- **ODM is RAM-hungry.** The community benchmark peaked at about 38–39 GB for 242 images at "ultra" quality ([ODM community](https://community.opendronemap.org/t/hardware-recommendations-cpu-cores-graphics-card-cuda-nvidia-memory-ram-storage/13705)). This is why the charter says 64 GB.
- Laptop GPUs throttle. Benchmark the finale laptop **on battery and on mains**, and always run on mains.
- The finale laptop must pass `drishti selftest --offline` with Wi-Fi **disabled**.

### 4.1 GPU memory per stage

| Stage | Tool | Expected VRAM | Source |
|---|---|---|---|
| S1 | OpenCV (CPU) | 0 | — |
| S2 | YOLO-seg / SAM 2 (small/base) | ~2–6 GB | *estimate, measure at M2* |
| S3 | COLMAP 4.x ALIKED+LightGlue, global mapper, GPU BA | ~4–10 GB for ~1,000 keyframes | *estimate, measure at M2* |
| S3 fallback | **DPVO** | **< 3 GB** | [arXiv 2608.18632](https://arxiv.org/html/2608.18632) (A100 40 GB testbed) |
| S3 (rejected for laptop) | DROID-SLAM / MASt3R-SLAM / VGGT-SLAM 2.0 | **~30 GB each** | [arXiv 2608.18632](https://arxiv.org/html/2608.18632) |
| S3 research | GeoFF3D | unknown. The hardware behind its 5-min figure is unverified. | [arXiv 2608.28288](https://arxiv.org/abs/2608.28288) |
| S5 | OpenMVS densify (CUDA) at medium resolution | ~4–8 GB | *estimate, measure* |
| S7 | gsplat | 6–20 GB depending on Gaussian count | *estimate, measure. Cap the count in the `fast` profile.* |
| P | Preview mosaic (CPU) | 0 | — |

> Rule: every stage must **run on 12 GB**. Stages that exceed that must degrade gracefully (smaller tiles, fewer Gaussians, lower resolution) and log a warning. They must not crash.

---

## 5. Version pinning policy

| Item | Policy |
|---|---|
| Python deps | `pyproject.toml` ranges plus `uv.lock` (exact). Conda binaries in `environment.yml` with exact versions. |
| COLMAP, OpenMVS | Built into the pipeline Docker image from a **tagged release or commit SHA** recorded in `docker/versions.env` |
| PyTorch | One CUDA 12.x wheel index, recorded in `docker/versions.env` |
| Model weights | `weights/MANIFEST.yaml`: name, source URL, **SHA256**, licence, `finale_allowed: true/false`. `drishti check-licences` fails the build if a `finale_allowed: false` weight is referenced by a finale profile. |
| Web | `web/package-lock.json`. `npm ci` only. |
| Updates | Only on a `chore/deps-*` branch with the full golden-dataset test run (see [`11-testing-and-evaluation.md`](11-testing-and-evaluation.md)) |

---

## 6. Comparison tables

### 6.1 SfM / pose-estimation options

| Option | Speed on 600–1,200 keyframes | Accuracy / robustness on a single pass | GPU | GPS priors | Licence | Verdict |
|---|---|---|---|---|---|---|
| **COLMAP incremental** | Slow. Grows super-linearly with images. | Most robust classical reference, but drifts on long strips | Features and BA | Yes (4.x) | BSD 🟢 | Fallback if the global mapper fragments |
| **COLMAP 4.x global (GLOMAP)** | "Orders of magnitude faster" than incremental ([arXiv 2407.20219](https://arxiv.org/html/2407.20219v2)) | Comparable to incremental. Handles sequential video. Multi-component mapping in 4.2.0. | Yes (+ Caspar GPU BA) | Yes (GPS and gravity) | BSD 🟢 | ✅ **Primary** |
| **ODM (OpenSfM inside)** | Hours: 242 images ultra took 62 min with GPU ([ODM community](https://community.opendronemap.org/t/hardware-recommendations-cpu-cores-graphics-card-cuda-nvidia-memory-ram-storage/13705)) | Good. Direct video + SRT ingest (500-frame default cap), rolling-shutter profiles. | Partial | Yes (`--gps-accuracy`) | AGPL 🟡 | ✅ **M1 baseline and comparator only** |
| **Learned SLAM** (DROID, MASt3R, DPVO) | Near real time | 0.53–0.58 % horizontal drift (DROID/MASt3R) on 1–2 km DJI flights. DPVO 5.75 %. **Vertical RMSE > 100 m in 29/34 long runs** ([arXiv 2608.18632](https://arxiv.org/html/2608.18632)). | DROID/MASt3R ~30 GB. DPVO < 3 GB. | No (post-hoc Sim(3)) | Mixed (⚠ verify) | DPVO as a **low-memory fallback** only |
| **Feed-forward** (GeoFF3D, MapAnything, VGGT, π3) | Minutes (GeoFF3D: ~2,000 images in ~5 min) | GeoFF3D F@5 0.848 vs 0.451 for a SLAM baseline on long UAVScenes. Stated stable on collinear paths. Off-the-shelf models "cannot fully replace SfM/MVS" ([arXiv 2507.14798](https://arxiv.org/abs/2507.14798)). | High, unverified | GeoFF3D and MapAnything: yes | GeoFF3D/MapAnything/π3/DA3 ⚪. VGGT 🟠/🔴. | Research track. **Enable only after the licence clears.** |

### 6.2 MVS / meshing options

| Option | Output | Quality | Speed | Licence | Verdict |
|---|---|---|---|---|---|
| **OpenMVS** | Dense cloud, mesh, refined mesh, **texture** | High. Good seam handling. | Fast with CUDA densify | AGPL 🟡 | ✅ **Primary** |
| COLMAP `patch_match_stereo` + fusion + Poisson/Delaunay | Dense cloud, untextured mesh | High depth quality | Slower. **No texturing.** | BSD 🟢 | Cross-check. Permissive fallback if AGPL is ever rejected (texturing would need extra work). |
| ODM (OpenMVS inside) | Everything + ortho/DSM | High | Slow overall (full pipeline) | AGPL 🟡 | Baseline only |
| Meshroom / AliceVision 2025.1.0 | Full pipeline + plugins | High | Slow. Heavy node graph. | MPL-2.0 🟢 | Rejected: integration cost |
| 3DGS / PGSR / CityGaussianV2 → TSDF mesh | Mesh from splats | Geometry "slightly lower than photogrammetry" ([ISPRS 2026](https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/143/2026/isprs-archives-XLVIII-2-W12-2026-143-2026.pdf)). City benchmarks use 1 m voxels. | Hours | Varies | Rejected for measurement. S7 display only. |
| Feed-forward dense pointmaps | Point maps | Up to +50 % completeness vs COLMAP on small sets, but low resolution (518 px) | Fast | ⚪/🟠 | Research: completeness booster for occluded areas, flagged |

### 6.3 Viewer options

| Criterion | **CesiumJS** | Potree | iTowns |
|---|---|---|---|
| Globe and geodesy | ✅ WGS84 globe, terrain, CRS handling | ❌ Local scene, no globe | ✅ Globe and planar views |
| 3D Tiles (OGC) | ✅ Native, reference implementation | ❌ Own octree format (converters exist) | ✅ Supported |
| Textured mesh (glTF) | ✅ | Limited | ✅ |
| Huge point clouds | Good (3D Tiles pnts) | ✅ Best in class | Good (Potree layer) |
| Gaussian splats | ✅ KHR_gaussian_splatting (1.139, Mar 2026) | ❌ | ❌ (not found) |
| Built-in measurement | Basic. We write distance/height/area/volume ourselves. | ✅ Rich measure and profile tools | Some |
| Offline (no cloud) | ✅ if Cesium ion is disabled and local imagery/terrain is used | ✅ | ✅ |
| Community and docs | Largest | Large (point-cloud niche) | Smaller (IGN France) |
| Licence | Apache-2.0 🟢 | ⚪ verify (believed BSD-2) | ⚪ verify (CeCILL-B/MIT) |
| **Verdict** | ✅ **Primary viewer** | Optional companion for LAZ inspection. Not in the MVP. | Rejected: smaller ecosystem, no splats |

---

## 7. Things we deliberately do **not** use

| Rejected | Reason |
|---|---|
| Any cloud API at runtime (Cesium ion, Google/Mapbox tiles, hosted ML APIs) | Offline-first principle. DST 2021 localisation: data finer than 1 m H / 3 m V must be stored and processed in India ([DST guidelines](https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf)). |
| VGGT-1B-Commercial | 🔴 Excludes military use |
| Non-commercial weights as the default (SuperPoint, SuperGlue, DUSt3R/MASt3R, original VGGT) | 🟠 Charter §8 |
| OpenREALM | Abandoned ROS1 alpha code |
| NeRF pipelines | Slower than 3DGS. No measurement advantage. |
| Diffusion-based scene completion as geometry | Non-metric. Violates "flag, don't fake". |

---

## 8. Licence register

> Maintained by R2. Every row must be ✅ verified before the finale bundle is built. "Finale" means allowed in the offline bundle shown to NTRO.

### 8.1 Software

| # | Component | Role | Licence | Verified? | Finale? | Notes |
|---|---|---|---|---|---|---|
| 1 | COLMAP 4.x / pycolmap | S3 | BSD-3 | charter | ✅ | Includes GLOMAP |
| 2 | OpenMVS | S5 | AGPL-3.0 | charter | ✅ 🟡 | Separate process. NTRO deployment note. |
| 3 | OpenDroneMap (ODM) | baseline | AGPL-3.0 | [GitHub](https://github.com/OpenDroneMap/ODM) | ⚠ optional | Comparator image. Not required at runtime. |
| 4 | gsplat | S7 | Apache-2.0 | charter | ✅ | |
| 5 | SAM 2 (code) | S2 | Apache-2.0 | charter | ✅ | |
| 6 | Ultralytics YOLO (code) | S2 | AGPL-3.0 | charter | ✅ 🟡 | Enterprise licence or switch for deployment |
| 7 | LightGlue (code) | S3 | Apache-2.0 | ⚠ verify | ✅ | |
| 8 | ALIKED (code) | S3 | believed BSD-3 | ⚠ verify | ✅ if verified | |
| 9 | DPVO | S3 fallback | believed MIT | ⚠ verify | ✅ if verified | |
| 10 | CesiumJS | web | Apache-2.0 | charter | ✅ | ion disabled |
| 11 | FastAPI | server | MIT | charter | ✅ | |
| 12 | React | web | MIT | charter | ✅ | |
| 13 | Vite, TypeScript | web | MIT, Apache-2.0 | ⚠ verify | ✅ | |
| 14 | GDAL | S5/S8 | MIT/X | ✅ | ✅ | |
| 15 | PDAL | S5/S8 | BSD-3 | ✅ | ✅ | |
| 16 | Open3D | S5/S6 | MIT | ⚠ verify | ✅ | |
| 17 | pyproj / PROJ | S4 | MIT | ⚠ verify | ✅ | |
| 18 | rasterio | S4/S8 | BSD-3 | ⚠ verify | ✅ | |
| 19 | laspy | S8 | BSD-2 | ⚠ verify | ✅ | |
| 20 | py3dtiles | S8 | believed Apache-2.0 | ⚠ verify | ✅ if verified | |
| 21 | obj2tiles | S8 | unknown | ⚠ verify | ⚪ | |
| 22 | klvdata | S0 | believed MIT | ⚠ verify | ✅ if verified | |
| 23 | DJI SRT parsers (DJI_SRT_Parser, dji-telemetry, etc.) | S0 reference | various | ⚠ verify | ❌ not bundled | Own parser shipped instead |
| 24 | ffmpeg | S0 | LGPL-2.1 build | ⚠ verify build flags | ✅ | No `--enable-nonfree`, no GPL-only codecs unless GPL is accepted |
| 25 | OpenCV | S1/S4/P | Apache-2.0 | ✅ | ✅ | |
| 26 | PyTorch | ML | BSD-3 | ✅ | ✅ | |
| 27 | NumPy / SciPy / pandas | all | BSD-3 | ✅ | ✅ | |
| 28 | uvicorn / pydantic | server | BSD-3 / MIT | ⚠ verify | ✅ | |
| 29 | SQLite | server | Public domain | ✅ | ✅ | |
| 30 | Ceres / GTSAM | S3/S4 | BSD-3 | ⚠ verify | ✅ | |
| 31 | Jinja2 / WeasyPrint | S9 | BSD-3 | ⚠ verify | ✅ | |
| 32 | Potree | optional viewer | believed BSD-2 | ⚠ verify | ⚪ | Not in MVP |
| 33 | iTowns | rejected | CeCILL-B/MIT | ⚠ verify | — | |
| 34 | ORB-SLAM3, VINS-Fusion | benchmark | GPLv3 | [paper notes](https://arxiv.org/abs/2007.11898) | ❌ | Not bundled |
| 35 | OpenREALM | rejected | LGPL + GPLv3 (CUDA path) | [GitHub](https://github.com/laxnpander/OpenREALM) | ❌ | |
| 36 | Meshroom | rejected | MPL-2.0 | [manual](https://meshroom-manual.readthedocs.io/en/latest/about/licenses/licenses.html) | — | |
| 37 | Docker Engine / Compose | packaging | Apache-2.0 | ✅ | ✅ | |
| 38 | NVIDIA CUDA base images | packaging | NVIDIA licence | ⚠ verify redistribution terms | ✅ | Air-gap redistribution check |

### 8.2 Model weights

| # | Weights | Licence | Status | Finale? |
|---|---|---|---|---|
| W1 | SAM 2 checkpoints | Apache-2.0 | charter | ✅ |
| W2 | Ultralytics YOLO-seg (COCO) | AGPL-3.0 | charter | ✅ 🟡 (deployment note) |
| W3 | **ALIKED** | believed BSD-3 | ⚠ verify | ✅ **default** if verified |
| W4 | LightGlue for ALIKED | follows LightGlue repo | ⚠ verify | ✅ if verified |
| W5 | **SuperPoint** (+ its LightGlue weights) | **Non-commercial** (Magic Leap) | known | ❌ experiments only |
| W6 | SuperGlue | Non-commercial | known | ❌ |
| W7 | **VGGT-1B (original)** | **Non-commercial** | [VGGT GitHub](https://github.com/facebookresearch/vggt) | ❌ |
| W8 | **VGGT-1B-Commercial** | Commercial **excluding military use** | [VGGT GitHub](https://github.com/facebookresearch/vggt) | 🔴 **FORBIDDEN**: must not be downloaded into the repo or bundle |
| W9 | DUSt3R / MASt3R | CC BY-NC-SA | known | ❌ |
| W10 | MapAnything | **to verify** | ⚪ | ❌ until verified |
| W11 | π3 / Pi3X | **to verify** | ⚪ | ❌ until verified |
| W12 | Depth Anything 3 (DA3) | **to verify** | ⚪ | ❌ until verified |
| W13 | GeoFF3D / UAVFF3D | **to verify** | ⚪ | ❌ until verified |
| W14 | DPVO | ⚠ verify | ⚪ | ✅ if verified |
| W15 | Any fine-tuned in-house weight | Ours, trained only on data we are allowed to use | — | ✅ with dataset licence recorded |

### 8.3 Datasets (for training and evaluation, not shipped)

| Dataset | Use | Licence |
|---|---|---|
| MARS-LVIG | S3/S4/S9 evaluation (RTK + L1 LiDAR truth) | ⚠ verify at [mars.hku.hk](https://mars.hku.hk/dataset.html) |
| UseGeo | Depth and point-cloud accuracy | ⚠ verify ([GitHub](https://github.com/3DOM-FBK/UseGeo)) |
| UAVD4L | Registration to a prior model | ⚠ verify ([GitHub](https://github.com/RingoWRW/UAVD4L)) |
| ODM sample data | Smoke tests | ⚠ verify per repo |
| SensatUrban | S6 semantics | ⚠ verify (typically research/non-commercial). Do **not** ship weights trained on it without checking. |

---

## Related documents

- [00-project-charter.md](00-project-charter.md): single source of truth
- [01-problem-statement.md](01-problem-statement.md)
- [02-solution-overview.md](02-solution-overview.md)
- [03-requirements.md](03-requirements.md)
- [04-system-architecture.md](04-system-architecture.md)
- [05-pipeline-design.md](05-pipeline-design.md)
- [06-georeferencing-and-accuracy.md](06-georeferencing-and-accuracy.md)
- [08-data-formats-and-interfaces.md](08-data-formats-and-interfaces.md)
- [09-viewer-and-ui.md](09-viewer-and-ui.md)
- [10-setup-and-repo-structure.md](10-setup-and-repo-structure.md)
- [11-testing-and-evaluation.md](11-testing-and-evaluation.md)
- [12-flight-and-data-capture-guide.md](12-flight-and-data-capture-guide.md)
- [13-project-plan.md](13-project-plan.md)
- [14-demo-and-pitch.md](14-demo-and-pitch.md)
- [15-research-and-references.md](15-research-and-references.md)
- [16-glossary.md](16-glossary.md)
