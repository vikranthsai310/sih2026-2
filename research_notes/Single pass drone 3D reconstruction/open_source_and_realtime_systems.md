# Open-Source Pipelines and Real-Time Systems for Aerial Mapping / 3D Reconstruction from Drone Imagery and Video

Research date: 2026-09-30. Budget-limited pass (~16 tool calls). Items marked **[unverified this session]** come from background knowledge and were NOT re-checked against a live source here; the report writer should treat them as leads, not citations.

---

## 1. OpenDroneMap / WebODM / NodeODM: video input, split-merge, GPU, processing times

### Takeaway
ODM (AGPL-3.0) is the most mature open-source drone photogrammetry stack. It has accepted video (.mp4/.mov/.lrv/.ts) plus DJI .srt GPS sidecars directly since v3.0.4, capped by default at 500 extracted frames. It outputs orthophoto GeoTIFF, DSM/DTM, LAZ point clouds, OBJ/PLY meshes and OGC 3D Tiles. It is batch software, not real-time: a few hundred images take roughly 1–8 hours on a workstation, and GPU gives about 1.2–2x end-to-end speedup.

### Cited Findings
- ODM is "a command line toolkit to generate maps, point clouds, 3D models and DEMs from drone, balloon or kite images". License: AGPL-3.0. Runs on Windows, Mac and Linux, natively or via Docker — [ODM GitHub](https://github.com/OpenDroneMap/ODM)
- Pipeline components: OpenSfM (structure-from-motion), OpenMVS (dense reconstruction and meshing), PDAL (point cloud processing), GRASS GIS — [ODM GitHub](https://github.com/OpenDroneMap/ODM)
- **Video input:** since v3.0.4, ODM automatically extracts images from video files (.mp4, .mov, .lrv, .ts) placed in the `images` folder. `.srt` subtitle files with GPS are supported when their filenames match the video's. The match is case-sensitive — [ODM GitHub README](https://github.com/OpenDroneMap/ODM); [ODM releases (search summary)](https://github.com/OpenDroneMap/ODM/releases)
- The video feature came in as the `video2dataset` module, PR #1567 by HeDo88TH — [PR #1567](https://github.com/OpenDroneMap/ODM/pull/1567)
- Video-related arguments: `--video-limit` is the maximum number of frames extracted from video (default 500). `--video-resolution` is the maximum resolution of extracted frames (default 4000 px) — [ODM docs: arguments](https://docs.opendronemap.org/arguments/)
- SRT fixes in 3.x: v3.2.0 added DJI Phantom 4 RTK SRT parsing; v3.5.1 added Mavic 2 Zoom SRT support; v3.6.2 fixed SRT telemetry parsing for DJI videos — [Zenodo ODM 3.2.0](https://zenodo.org/records/8273787); [Zenodo ODM 3.5.1](https://zenodo.org/records/11555768); [Zenodo ODM 3.6.2](https://zenodo.org/records/21909664)
- Community thread on processing video in WebODM (practical experience and limits) — [community.opendronemap.org](https://community.opendronemap.org/t/processing-video-files-with-webodm/15787?page=2)
- Latest release found: 3.6.2. Its notes include a fix for DJI video SRT parsing and restored PyPopsift GPU module dependencies. 3.6.1 added DJI Mini 3 rolling-shutter support and updated obj2tiles to v1.4.0. 3.6.0 moved to an Ubuntu 24.04 base, Python 3.12 and CUDA 12.8.1 (Windows) / 13.0.0 (Ubuntu) with GDAL 3.11.1. Earlier: 3.5.6 added DJI Mini 4 Pro rolling shutter and `--gps-z-offset`; 3.5.5 added DNG/RAW support and DXF output; 3.5.0 added Mavic 3 rolling shutter and point-cloud classification — [ODM releases](https://github.com/OpenDroneMap/ODM/releases). **Caveat:** the fetched page gave dates that contradict each other. It dated 3.6.0 to "Oct 2023", which cannot be right for an Ubuntu 24.04 base. Verify dates on GitHub before quoting them.
- Useful arguments and defaults ([ODM docs](https://docs.opendronemap.org/arguments/)):
  - `--split` (images per submodel; default 999999, which means no split)
  - `--split-overlap` (default 150 m)
  - `--sm-cluster` (ClusterODM URL for distributed split-merge)
  - `--feature-type` (akaze/dspsift/hahog/orb/sift; default dspsift)
  - `--feature-quality` (default high)
  - `--matcher-neighbors` (GPS-based neighbour matching; default 0)
  - `--fast-orthophoto` (skips dense reconstruction)
  - `--3d-tiles` (outputs OGC 3D Tiles)
  - `--pc-quality` (default medium)
  - `--sfm-algorithm` (incremental/triangulation/planar)
  - `--camera-lens` (auto/perspective/brown/fisheye/spherical/equirectangular/dual)
  - `--rolling-shutter` (default False)
  - `--gps-accuracy` (default 3 m)
- **GPU:** CUDA SIFT feature extraction is about 2x faster than CPU on consumer laptops. It uses the `opendronemap/odm:gpu` Docker image with `--gpus all` and needs an NVIDIA GTX 9xx or newer — [ODM GitHub](https://github.com/OpenDroneMap/ODM)
- **Benchmarks** (community hardware thread) — [OpenDroneMap Community: Hardware Recommendations](https://community.opendronemap.org/t/hardware-recommendations-cpu-cores-graphics-card-cuda-nvidia-memory-ram-storage/13705):
  - Total time:
    - 242 images, ultra/ultra: 124 min on CPU vs 62 min with GPU
    - 473 images, ultra/ultra: 496 min vs 316 min
    - 1,413 images, high/high: 543 min vs 467 min
  - Feature extraction alone:
    - 242 images: 6:10 vs 2:28
    - 473 images: 2:46 vs 0:43
    - 2,819 images: 59:36 vs 19:52
  - GPU makes point-cloud densification up to about 10x faster.
  - Peak RAM: about 38–39 GB for 242 images at ultra; 42–47 GB for 1,002 images; about 98–101 GB for 1,413 images; 152 GB for 2,819 images. "Ultra" roughly doubles memory compared with "high".
  - Guidance: 64 GB RAM and 8 cores as a starting point for 500–3,000 images. Going from 4 to 8 cores saved 6–19% of time.
- The GPU is used for feature extraction and dense reconstruction but not noticeably during matching — [OpenDroneMap Community: GPU based processes](https://community.opendronemap.org/t/gpu-based-processes/12913)

### Inferences
- A single-pass DJI video with matching .srt can be dropped straight into ODM or WebODM. Raise `--video-limit` for long clips, or pre-sample frames yourself for more control over overlap and blur.
- `--sfm-algorithm planar` and `--fast-orthophoto` are the fastest route to a near-real-time orthomosaic from ODM, but the result is still minutes after landing, not live.
- ODM's AGPL license means network-served modifications must be shared, which matters if the team builds a hosted service on it.

### Gaps
- No precise processing times were found specifically for video inputs, such as a 5-minute 4K clip.
- It was not confirmed whether ODM 3.6.x has native Gaussian splatting output.
- NodeODM and WebODM version numbers were not fetched. NodeODM is the REST API wrapper around ODM and WebODM is the Django UI; both are AGPL **[unverified this session]**.

---

## 2. Offline SfM / MVS / neural reconstruction libraries

### Takeaway
COLMAP is the standard research SfM/MVS tool. GLOMAP, a global SfM that is "orders of magnitude faster" than incremental SfM, has been merged into COLMAP as the "global" mapper. COLMAP 4.x adds GPS and gravity pose priors, rig support, learned features (ALIKED/LightGlue) and GPU bundle adjustment. Meshroom 2025.1.0 (MPL-2.0) now covers Gaussian splatting through plugins. nerfstudio and gsplat are the main open Gaussian-splatting stack and have been evaluated on UAV imagery.

### Cited Findings
- **GLOMAP** (ECCV 2024) is a general-purpose global SfM that performs on par with or better than COLMAP while being "orders of magnitude faster". It handles unknown intrinsics and sequential data such as handheld video — [Microsoft Research](https://www.microsoft.com/en-us/research/publication/global-structure-from-motion-revisited/); [paper PDF](https://demuc.de/papers/pan2024glomap.pdf); [arXiv 2407.20219](https://arxiv.org/html/2407.20219v2)
- GLOMAP reads a COLMAP database and writes a COLMAP sparse model. The standalone repo is no longer maintained and has been migrated into COLMAP as the "global" mapper — [GLOMAP README](https://github.com/colmap/glomap/blob/main/README.md); [GLOMAP releases](https://github.com/colmap/glomap/releases)
- **COLMAP 4.x** releases (fetched release notes) — [COLMAP releases](https://github.com/colmap/colmap/releases):
  - 4.1.0: Caspar GPU-accelerated bundle adjustment ("1–2 orders of magnitude faster"), spherical camera models, advancing-front meshing.
  - 4.2.0: multi-component global mapping, LoMa learned matching via ONNX, ROCm/HIP GPU support, a browser-based 3D viewer.
  - 4.2.1: bug fixes.
  - Across 4.x: ALIKED/LightGlue features, GPS and gravity pose priors from EXIF, rig support for synchronized multi-camera setups, full pycolmap bindings.
  - **Caveat:** the fetched page gave 2024 dates for these releases, which conflicts with GLOMAP being merged later. Verify dates before quoting.
- Global SfM is still being extended, for example Glob3R, which combines global SfM with 3D foundation models (2026) — [arXiv 2607.09225](https://arxiv.org/pdf/2607.09225)
- **Meshroom / AliceVision:**
  - Meshroom 2025.1.0 was released on 18 Aug 2025 under MPL-2.0.
  - It adds a plugin architecture: an AliceVision plugin covering photogrammetry, camera tracking and LiDAR meshing, plus MeshroomHub plugins for Gaussian splatting and monocular depth.
  - Sources: [Meshroom 2025.1.0 announcement](https://groups.google.com/g/alicevision/c/a9xGujkF-6c); [MPC news](https://www.mpcvfx.com/en/news/mpc-celebrates-the-release-of-meshroom-2025-1-0/); [Meshroom releases](https://github.com/alicevision/meshroom/releases); [licenses](https://meshroom-manual.readthedocs.io/en/latest/about/licenses/licenses.html)
- **gsplat** is an open-source library for CUDA-accelerated Gaussian rasterization with Python bindings, from the nerfstudio project. Nerfstudio trains splats (Splatfacto) from video — [gsplat GitHub](https://github.com/nerfstudio-project/gsplat); [LearnOpenCV](https://learnopencv.com/3d-gaussian-splatting/)
- Splatfacto (nerfstudio) looks promising on UAV imagery for scene complexity, rendering efficiency and accuracy — [PMC: NeRF vs 3DGS for UAV point clouds](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12115230/); [ISPRS Annals 2024: NeRF/3DGS from aerial imagery](https://isprs-annals.copernicus.org/articles/X-2-2024/97/2024/isprs-annals-X-2-2024-97-2024.pdf)
- **DroneSplat** (CVPR 2025) makes 3DGS robust for in-the-wild drone imagery with dynamic distractors and sparse views — [arXiv 2503.16964](https://arxiv.org/pdf/2503.16964). Related work:
  - Horizon-GS: aerial-to-ground 3DGS — [arXiv 2412.01745](https://arxiv.org/pdf/2412.01745)
  - AeroDGS: dynamic 4D reconstruction from a single aerial sequence — [arXiv 2602.22376](https://arxiv.org/pdf/2602.22376)

### Inferences
- For single-pass video with GPS, a strong modern pipeline is: keyframe selection, then COLMAP 4.x with GPS pose priors and the global mapper (fast), then COLMAP/OpenMVS dense output or Gaussian splatting with gsplat.
- Georeferenced ortho/DSM products are simpler to get from ODM. COLMAP needs manual georeferencing (model_aligner) and custom DSM rasterization.

### Gaps
- OpenMVG, OpenMVS, Theia, hloc and Kapture were not re-verified this session. From background knowledge **[unverified this session]**:
  - OpenMVG (MPL-2.0, SfM library, pairs with OpenMVS) — https://github.com/openMVG/openMVG
  - OpenMVS (AGPL-3.0, dense MVS, meshing, texturing; used inside ODM) — https://github.com/cdcseacave/openMVS
  - Theia (BSD, global SfM; little activity) — https://github.com/sweeneychris/TheiaSfM
  - hloc (Hierarchical-Localization, ETH CVG; SuperPoint/LightGlue with COLMAP; Apache-2.0 code, but SuperPoint/SuperGlue weights are non-commercial) — https://github.com/cvg/Hierarchical-Localization
  - Kapture (NAVER LABS; data format and localization toolbox, BSD) — https://github.com/naver/kapture
- No accuracy numbers (RMSE against GCPs) were gathered comparing COLMAP, ODM and 3DGS on aerial data. The PMC article above contains some.

---

## 3. Real-time and near-real-time aerial mapping (on-board / edge)

### Takeaway
OpenREALM is the main open-source real-time UAV mapping pipeline. It runs visual SLAM, optional GPU stereo densification, a live 2.5D elevation map and an incremental orthomosaic, and it has been run on a Jetson Xavier NX. However, it is alpha-quality ROS1 research code with little activity since about 2020. Recent papers show CPU-only real-time 2D orthomosaicking from UAV video at about 2.3 fps, which is realistic for a student team.

### Cited Findings
- **OpenREALM** is "a pipeline for real-time aerial mapping utilizing visual SLAM and 3D reconstruction frameworks" — [GitHub laxnpander/OpenREALM](https://github.com/laxnpander/OpenREALM); [arXiv 2009.10492](https://arxiv.org/pdf/2009.10492)
  - Authors: A. Kern, M. Bobbe, Y. Khedar, U. Bestmann (TU Braunschweig IFF drone lab) — [iff-dronelab](https://github.com/iff-dronelab)
  - Modes: planar-ground stitching, or full 3D surface recovery producing elevation maps and orthophotos. The operator sees incremental results live on the ground.
  - Assumes a multirotor with a downward-looking 2-axis gimbal and heading aligned with the image's negative y-axis.
  - Stack: OpenVSLAM (default) or ORB-SLAM2 for pose; Plane Sweep Library for GPU stereo; ROS1 bridge.
  - Inputs: geotagged imagery with EXIF.
  - Outputs: 2D georeferenced maps, 2.5D elevation maps, orthomosaics; supports multiple UAVs.
  - License: mostly LGPL, but the CUDA/PSL 3D path pulls in GPLv3.
  - Maturity: self-described alpha ("ugly and buggy"). The last significant update was about Sept 2020. Docker image is on Ubuntu 18.04 — [OpenREALM README](https://github.com/laxnpander/OpenREALM); [CHANGELOG](https://github.com/laxnpander/OpenREALM/blob/master/CHANGELOG.md)
- OpenREALM has been run on an NVIDIA Jetson Xavier NX, extracting camera trajectory, DSM and orthomosaic in real time. It has also been extended with semantic real-time mapping — [Springer PFG: Semantic Real-Time Mapping with UAVs](https://link.springer.com/article/10.1007/s41064-023-00242-2)
- A 2026 MDPI Applied Sciences paper builds 2D orthomosaics from UAV video in real time on standard CPU hardware, by incrementally registering sparsely sampled frames with classical feature-based registration — [MDPI Appl. Sci. 16(4):2133](https://www.mdpi.com/2076-3417/16/4/2133)
- An ISPRS Annals 2025 near-real-time approach reaches 2.3 fps mosaicking on consumer UAVs with minimal sensor data. Target uses: forestry, hydrology, urban planning, disaster management — [ISPRS Annals X-2-W2-2025-65](https://isprs-annals.copernicus.org/articles/X-2-W2-2025/65/2025/)
- An accurate real-time UAV mapping solution (dissertation / d-nb) — [d-nb.info](https://d-nb.info/1239825390/34)
- GitHub "orthomosaic" topic, for finding smaller real-time stitchers — [GitHub topics](https://github.com/topics/orthomosaic?o=asc&s=updated)

### Inferences
- A student team could build a lighter OpenREALM-style pipeline in two stages:
  1. Live preview: SRT-geotagged keyframes, homography or feature-based incremental mosaic on CPU (about 2 fps).
  2. Offline quality product: ODM or COLMAP after landing.
- Porting OpenREALM to ROS2 or Ubuntu 22.04+ is a heavy lift because of its dependence on ROS1 and OpenVSLAM. OpenVSLAM was taken down in 2021 and its successor is stella_vslam **[unverified this session]**.

### Gaps
- These systems were not verified this session. From background knowledge **[unverified this session]**:
  - Map2DFusion (Bao et al., IROS 2016; real-time mosaicking with ORB-SLAM) — https://github.com/zdzhaoyong/Map2DFusion
  - TerrainFusion (real-time DSM/ortho, 2019)
  - REMODE (UZH RPG; probabilistic monocular dense depth, GPL-3.0) — https://github.com/uzh-rpg/rpg_open_remode
  - RTAB-Map (BSD; RGB-D/stereo/LiDAR SLAM with ROS/ROS2; limited for monocular aerial) — https://github.com/introlab/rtabmap
  - OpenVINS (GPL-3.0; visual-inertial state estimation) — https://github.com/rpng/open_vins
  - Kimera (MIT SPARK; VIO plus mesh plus semantics, BSD-2) — https://github.com/MIT-SPARK/Kimera
  - "DenseFusion" in the sense named by the task was not found as an aerial mapping system. The well-known DenseFusion is 6D object pose estimation, not mapping.
- No benchmark numbers for Jetson Orin on-board dense reconstruction were found.

---

## 4. Drone video metadata parsing and frame geotagging (DJI SRT, KLV/MISB 0601, STANAG 4609)

### Takeaway
Many small open-source DJI SRT parsers exist, including JavaScript and Python versions and CLIs that export to GPX, CSV or GeoJSON or write EXIF with exiftool. ODM itself parses SRT. For military full-motion video (FMV), `klvdata` (Python, no dependencies) parses MISB ST 0601 UAS Datalink Local Sets from STANAG 4609 MPEG-2 transport streams.

### Cited Findings
- **JuanIrache/DJI_SRT_Parser** parses and interprets DJI SRT metadata (JavaScript) — [GitHub](https://github.com/JuanIrache/DJI_SRT_Parser)
- **dji-telemetry** (PyPI) parses per-frame DJI SRT telemetry and exports it to several formats — [PyPI](https://pypi.org/project/dji-telemetry/)
- **DJI-Video-GPS-Tagger** extracts SRT metadata and writes it to extracted video frames using ffmpeg and exiftool — [GitHub](https://github.com/hcampbell98/DJI-Video-GPS-Tagger)
- **dji-drone-metadata-embedder** converts SRT to GPX, CSV, GeoJSON, KML, CoT or an HTML map — [GitHub](https://github.com/CallMarcus/dji-drone-metadata-embedder)
- **dji-flight** is a CLI and web dashboard with an SRT parser and CSV/JSON/GPX/GeoJSON exporters — [GitHub](https://github.com/bhanurp/dji-flight)
- Other small tools:
  - python_DJI_SRT_parser (to CSV/JSON) — [GitHub](https://github.com/Nunzio03/python_DJI_SRT_parser)
  - SRT2GPX — [GitHub](https://github.com/Roady1/SRT2GPX/blob/main/SRT2GPX.py)
  - srt-to-gpx — [GitHub](https://github.com/arru/srt-to-gpx/blob/master/srt_to_gpx.py)
- Community workflows for extracting geotagged frames from video and SRT for photogrammetry — [MavicPilots thread 1](https://mavicpilots.com/threads/simple-tool-with-gui-for-extracting-geotagged-images-from-videos-srt-files-useful-for-photogrammetry.139243/); [MavicPilots thread 2](https://mavicpilots.com/threads/how-to-extract-geotagged-frames-from-video-for-use-in-photogrammetry.133471/)
- **klvdata** parses and builds KLV binary streams. Its common use is MISB ST 0601 UAS metadata from STANAG 4609 MPEG-2 TS. It supports ST 0601 and ST 0102 (security) and has no external dependencies — [PyPI klvdata](https://pypi.org/project/klvdata/); [paretech/klvdata](https://github.com/paretech/klvdata)
  - All4Gis fork (used in a QGIS FMV plugin context) — [All4Gis/klvdata](https://github.com/All4Gis/klvdata)
  - Alternatives: klv-parser — [PyPI](https://pypi.org/project/klv-parser/); [GitHub Pazshp](https://github.com/Pazshp/klv_parser). klvcms — [GitHub bradh](https://github.com/bradh/klvcms)

### Inferences
- A robust ingest step: ffmpeg frame extraction at N fps, then align SRT entries to frames by frame index or timestamp (DJI SRT has about one entry per frame), then write GPS, altitude and gimbal data to EXIF with exiftool, then feed ODM or COLMAP.
- For KLV sources: demux the data PID from the .ts with ffmpeg, decode it with klvdata, then interpolate sensor lat/lon/alt and platform or sensor angles to each frame's PTS.

### Gaps
- DJI SRT formats differ between models (Mini/Mavic/Phantom RTK), as ODM's per-model fixes show. No single authoritative spec was found.
- exiftool's `-ee` extraction of DJI/GoPro embedded telemetry was not verified this session.
- Maintenance status of paretech/klvdata was not checked.

---

## 5. Visualization and measurement (Potree, CesiumJS/3D Tiles, py3dtiles, Open3D, CloudCompare, iTowns, QGIS)

### Takeaway
3D Tiles is the OGC-standard format (2019) for streaming meshes and point clouds to the web, and CesiumJS renders it natively. ODM can output 3D Tiles directly (`--3d-tiles`, using obj2tiles). Potree is the go-to WebGL viewer for very large point clouds. py3dtiles converts LAS/LAZ to 3D Tiles in Python.

### Cited Findings
- 3D Tiles is an open specification for streaming massive heterogeneous 3D geospatial data. Cesium created it and OGC standardized it in 2019. CesiumJS implements it natively — [Swyvl explainer](https://swyvl.io/blog/3d-tiles-explained/); [CesiumGS 3d-tiles RESOURCES](https://github.com/CesiumGS/3d-tiles/blob/main/RESOURCES.md)
- py3dtiles is a Python tool and library for creating and manipulating 3D Tiles, for example converting LAS to .pnts — [CesiumGS resources](https://github.com/CesiumGS/3d-tiles/blob/main/RESOURCES.md)
- Potree is a free, open-source WebGL renderer for large point clouds with its own octree format. There are Potree-to-Cesium converters — [potree23dtiles](https://github.com/yeyan00/potree23dtiles); [Potree issue #600](https://github.com/potree/potree/issues/600)
- Cesium ion's tiling pipeline (commercial SaaS) handles point clouds and OBJ; DroneDeploy uses CesiumJS and ion — [Cesium point cloud tiler](https://cesium.com/platform/cesium-ion/3d-tiling-pipeline/point-clouds/); [Cesium community: OBJ to 3D Tiles](https://community.cesium.com/t/obj-to-3d-tiles/31567)
- ODM has an `--3d-tiles` flag for OGC 3D Tiles output, and v3.6.1 updated obj2tiles to 1.4.0 — [ODM docs](https://docs.opendronemap.org/arguments/); [ODM releases](https://github.com/OpenDroneMap/ODM/releases)

### Inferences
- The simplest web demo path is ODM `--3d-tiles`, a static file server and a CesiumJS viewer, with Potree as a companion viewer for measuring the LAZ point cloud.

### Gaps
- These tools were not verified this session **[unverified this session]**:
  - Open3D (MIT; Python/C++ point cloud and mesh processing, TSDF fusion)
  - CloudCompare (GPL; desktop cloud-to-cloud and cloud-to-mesh distance, used for accuracy evaluation against LiDAR ground truth)
  - iTowns (IGN France; web 3D geospatial, CeCILL-B/MIT)
  - QGIS (GPL; ortho/DSM analysis, profile tools, 3D view)
  - Potree licensing and PotreeConverter 2.x status

---

## 6. Public datasets for testing single-pass drone video with GPS and ground truth

### Takeaway
Two datasets have the strongest mapping ground truth. MARS-LVIG offers aerial downward LiDAR, visual, IMU and GNSS data with RTK poses and DJI L1 map ground truth. UseGeo offers UAV images with LiDAR point clouds and ground-truth depth. UAVD4L offers 6-DoF localization with an RTK-aligned textured 3D model and DSM. For raw DJI-style video with SRT, ODM sample datasets and community uploads are the practical test sources.

### Cited Findings
- **MARS-LVIG** (IJRR 2024; HKU MaRS lab):
  - Downward-looking aerial data from 80–130 m altitude.
  - Hardware-synchronized solid-state LiDAR, global-shutter RGB camera, IMUs and raw GNSS.
  - Ground truth: on-board RTK for localization and DJI L1 (processed in DJI Terra) for mapping.
  - 21 sequences across 5 environments (urban, remote, featureless). Speeds 3–12 m/s, areas up to 577,000 m², paths up to 7.148 km.
  - Download: https://mars.hku.hk/dataset.html
  - Sources: [SAGE IJRR](https://journals.sagepub.com/doi/abs/10.1177/02783649241227968); [HKU Scholars Hub](https://hub.hku.hk/handle/10722/339450)
- **UseGeo** (3DOM-FBK): a UAV multi-sensor dataset with images and LiDAR, and ground-truth point clouds and depth maps. It has 829 images across 3 datasets at 7952×5304 px, with ground-truth depth at 1989×1320 — [GitHub 3DOM-FBK/UseGeo](https://github.com/3DOM-FBK/UseGeo); [ResearchGate](https://www.researchgate.net/publication/381534229_UseGeo_-_A_UAV-based_multi-sensor_dataset_for_geospatial_research)
- **UAVD4L** (3DV 2024): a large-scale UAV 6-DoF localization dataset over about 2.5 km² of urban and rural areas. It includes a textured 3D model from oblique aerial photography aligned with RTK and GCPs, plus rendered RGB, depth and DSM, and the UAVLoc pipeline — [arXiv 2401.05971](https://arxiv.org/abs/2401.05971); [GitHub](https://github.com/RingoWRW/UAVD4L)
- **UAVScenes** (2025): a multi-modal UAV dataset, related to MARS-LVIG — [arXiv 2507.22412](https://arxiv.org/pdf/2507.22412)
- Other related datasets:
  - INSANE: cross-domain UAV sensor datasets — [arXiv 2210.09114](https://arxiv.org/pdf/2210.09114)
  - Multi-LiDAR multi-UAV GNSS-denied dataset — [arXiv 2310.09165](https://arxiv.org/pdf/2310.09165)
  - egenioussBench: geospatial visual localisation, 2026 — [arXiv 2605.05351](https://arxiv.org/html/2605.05351)
  - AeroMap3D: monocular UAV 6-DoF localization against map priors, 2026 — [arXiv 2607.14009](https://arxiv.org/pdf/2607.14009)
- DroneSplat introduces an in-the-wild drone imagery benchmark alongside its method — [arXiv 2503.16964](https://arxiv.org/pdf/2503.16964)

### Inferences
- MARS-LVIG is the best fit for "single-pass downward flight, GNSS, dense-map ground truth". Use its camera stream as the "video" and RTK and L1 for evaluation.
- UseGeo is best for per-image depth and point-cloud accuracy evaluation. UAVD4L is best for testing georegistration and localization against an existing 3D model.

### Gaps
- These datasets were not verified this session **[unverified this session]**; check each for licensing and whether GPS is included:
  - UAVid (semantic segmentation of oblique UAV video, no GPS)
  - VisDrone (detection and tracking, no GPS/3D)
  - UZH-FPV (FPV racing VIO with mocap/laser-tracker ground truth)
  - Mid-Air (synthetic low-altitude drone with GPS, IMU and depth)
  - TartanAir (synthetic SLAM)
  - WildUAV (mapping-quality video with GPS and depth)
  - Hessigheim 3D / H3D (ISPRS benchmark; UAV LiDAR plus mesh)
  - AerialVL
  - ISPRS/EuroSDR benchmarks
  - ODM sample datasets (https://github.com/OpenDroneMap/odm_data_* repos and the ODM community datasets page)
