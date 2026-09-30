# Camera Pose Estimation and 3D Reconstruction from Monocular UAV Video: Visual SLAM, Feed-Forward 3D Foundation Models, SfM, and Metric Depth (as of 2026-09-30)

Note on sourcing: facts marked [verified] were read from the fetched page this session. Facts marked [paper] cite the canonical arXiv/venue page of the original paper, and come from prior knowledge of that paper; they were not re-fetched this session. The report writer should treat [paper] numbers as lower-confidence than [verified] ones.

## Q1. Visual and visual-inertial SLAM on monocular UAV video (ORB-SLAM3, VINS, DSO/LDSO, DROID-SLAM, DPVO/DPV-SLAM, MASt3R-SLAM, GigaSLAM, VGGT-SLAM, GO-SLAM, Photo-SLAM)

### Takeaway
The most directly relevant evidence is a 2026 benchmark on high-altitude nadir UAV footage (Spagnolo et al., arXiv 2608.18632). On short local drone flights (about 1–2 km at 110–120 m altitude), the best monocular SLAM systems stay within about 0.5–0.6% horizontal drift (DROID-SLAM, MASt3R-SLAM). At city scale they drift heavily, and altitude estimates are badly wrong: vertical RMSE exceeded 100 m in 29 of 34 long runs. So monocular visual-only SLAM can give usable local relative poses from a single pass, but it needs GPS, IMU, altimeter or reference-imagery constraints to reach metric scale and global consistency.

### Cited Findings
**Head-to-head evaluation on UAV footage (most relevant source)**
- Spagnolo, Dobrevski, Skočaj, "Evaluation of Monocular SLAM Systems on High-Altitude Nadir UAV Footage", arXiv 2608.18632 (Aug 2026). They evaluated ORB-SLAM3, DROID-SLAM, DPVO, MASt3R-SLAM and VGGT-SLAM 2.0 on four datasets [verified] — [arXiv](https://arxiv.org/html/2608.18632):
  - DJI: 5 consumer-quadrotor flights at 110–120 m, gimbal-stabilized, about 1–2 km each.
  - GES: synthetic Google Earth Studio sequences at 150–800 m over Ljubljana, Graz and Venice, 222 km in total.
  - MARS-LVIG: 15 sequences at 80–130 m with RTK ground truth.
  - ALTO: helicopter flights over sequences of 28.5 km and 37.4 km.
- Horizontal mean absolute error as a percentage of path length (DJI / GES / MARS-LVIG / ALTO / overall) [verified] — [arXiv](https://arxiv.org/html/2608.18632):
  - DROID-SLAM: 0.58 / 1.82 / 2.38 / 8.03 / **2.88** (best overall).
  - MASt3R-SLAM: **0.53** / 3.71 / 4.23 / 18.36 / 5.24 (best on DJI).
  - ORB-SLAM3: 2.40 / 4.20 / 3.09 / 6.61 / 3.67.
  - DPVO: 5.75 / 1.85 / 2.24 / 8.57 / 3.98.
  - VGGT-SLAM 2.0: 6.34 / 3.89 / 3.08 / 8.18 / 4.71.
- Best single-sequence results [verified] — [arXiv](https://arxiv.org/html/2608.18632): DROID-SLAM 0.16% on DJI FRI-110m; DPVO 0.05% on Graz; DPVO 0.07% on HKairport01.
- Vertical error: vertical RMSE exceeded 100 m in 29 of 34 completed GES and ALTO runs, including runs with low horizontal error [verified] — [arXiv](https://arxiv.org/html/2608.18632).
- Loop closure behaviour [verified] — [arXiv](https://arxiv.org/html/2608.18632):
  - VGGT-SLAM 2.0 was too conservative. It rejected 66 of 71 loop candidates (93%) on GES, even though ground truth confirmed the revisits.
  - MASt3R-SLAM was too permissive. It accepted 468 of 1016 candidates; 82% were temporally local (within 5 keyframes) and some were spatially inconsistent.
- Failure modes [verified] — [arXiv](https://arxiv.org/html/2608.18632):
  - ORB-SLAM3 loses tracking on some sequences.
  - DROID-SLAM drifts progressively without a discrete failure.
  - DPVO drifts in one direction until estimates leave the survey area.
  - MASt3R-SLAM performs poorly over homogeneous terrain such as valleys.
  - On the longest ALTO splits, "no method yields a usable trajectory".
- Compute on an A100 40 GB [verified] — [arXiv](https://arxiv.org/html/2608.18632):
  - ORB-SLAM3 was the only method that is viable on CPU.
  - DPVO used under 3 GB of GPU memory and was judged the most practical learned method.
  - DROID-SLAM, MASt3R-SLAM and VGGT-SLAM 2.0 each needed about 30 GB.
- The authors recommend four additions: visual-inertial fusion for metric scale and attitude, altimetry to bound vertical error, absolute localization against reference imagery, and adapting foundation-model priors to the aerial domain [verified] — [arXiv](https://arxiv.org/html/2608.18632).
- A separate simulation study compares monocular ORB-SLAM3, DROID-SLAM, DPVO and DPV-SLAM (2025) — [ResearchGate](https://www.researchgate.net/publication/398213993_Simulation_Evaluation_of_Monocular_Visual_SLAM_ORB-SLAM3_DROID-SLAM_DPVO_and_DPV-SLAM). It was not fetched, so no numbers are given.

**Per-method notes**
- **MASt3R-SLAM** [verified] — [arXiv 2412.12392](https://arxiv.org/abs/2412.12392)
  - Murai, Dexheimer, Davison; CVPR 2025 (Highlight).
  - Built bottom-up on the MASt3R two-view prior. Runs at 15 FPS.
  - Calibration-free: it assumes no fixed or parametric camera model. It produces globally consistent poses and dense geometry.
- **DROID-SLAM** — Teed and Deng, NeurIPS 2021 [verified] — [arXiv 2108.10869](https://arxiv.org/pdf/2108.10869)
  - Recurrent optical-flow updates plus a differentiable dense bundle adjustment layer; supports monocular, stereo and RGB-D.
  - Trained on the synthetic TartanAir dataset, which includes aerial-like viewpoints [paper].
  - Monocular output has no metric scale.
- **DPVO** (Teed, Lipson, Deng, NeurIPS 2023) and **DPV-SLAM** (Lipson, Teed, Deng, ECCV 2024) [paper] — [arXiv 2408.01654](https://arxiv.org/pdf/2408.01654); [ECVA](https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/00272.pdf)
  - Sparse patch-based deep VO. DPV-SLAM adds proximity and classical loop closure to DPVO.
  - Much lower memory than DROID-SLAM, consistent with the under-3 GB figure measured above.
- **VGGT-SLAM** (Maggio, Lim, Carlone, 2025; [arXiv 2505.12549](https://arxiv.org/abs/2505.12549)) [paper]
  - Aligns VGGT submaps with SL(4) homographies, because uncalibrated feed-forward submaps carry a 15-DoF projective ambiguity.
- **VGGT-SLAM 2.0**: "Real-time Dense Feed-forward Scene Reconstruction", 2026 — [arXiv 2601.19887](https://arxiv.org/pdf/2601.19887).
- **GigaSLAM** [verified] — [arXiv 2503.08071](https://arxiv.org/abs/2503.08071); [ACM DOI](https://dl.acm.org/doi/10.1145/3757377.3763932); [GitHub](https://github.com/DengKaiCQ/GigaSLAM)
  - Kai Deng et al., Nankai University; published at SIGGRAPH Asia 2025 (ACM DOI 10.1145/3757377.3763932).
  - First kilometer-scale NeRF/3DGS monocular SLAM: a hierarchical sparse-voxel Gaussian map.
  - Tracking combines a metric depth model with epipolar geometry and PnP. Loop closure uses bag-of-words.
  - Evaluated only on driving datasets (KITTI, KITTI-360, 4Seasons, A2D2). No UAV evaluation was found.
- A 2026 follow-up, "Robust and Efficient Monocular 3D Gaussian SLAM for Kilometer-Scale Outdoor Scenes" — [arXiv 2606.30436](https://arxiv.org/pdf/2606.30436). Not fetched.
- **ORB-SLAM3** (Campos et al., IEEE T-RO 2021) [paper] — [arXiv 2007.11898](https://arxiv.org/abs/2007.11898)
  - Feature-based; supports monocular, stereo and visual-inertial, with multi-map Atlas and DBoW2 place recognition. License is GPLv3.
  - Monocular initialization needs enough parallax. Visual-inertial mode recovers metric scale.
- **VINS-Mono / VINS-Fusion** (Qin, Li, Shen, T-RO 2018) [paper] — [arXiv 1708.03852](https://arxiv.org/abs/1708.03852)
  - Tightly coupled optimization-based monocular visual-inertial odometry (VIO), giving metric scale from the IMU. VINS-Fusion adds stereo and global GPS fusion. GPLv3.
  - Designed for and demonstrated on UAVs; EuRoC is its standard benchmark.
  - Needs a synchronized IMU with known camera–IMU extrinsics, which consumer drone video files usually do not provide.
- **DSO** (Engel, Koltun, Cremers, TPAMI 2018; [arXiv 1607.02565](https://arxiv.org/abs/1607.02565)) and **LDSO** (Gao et al., IROS 2018; [arXiv 1808.01111](https://arxiv.org/abs/1808.01111)) [paper]
  - Direct photometric sparse odometry; LDSO adds loop closure. Both are sensitive to photometric calibration, rolling shutter and auto-exposure, which is common in drone video.
- **GO-SLAM** (Zhang et al., ICCV 2023; [arXiv 2309.02436](https://arxiv.org/abs/2309.02436)) and **Photo-SLAM** (Huang et al., CVPR 2024; [arXiv 2311.16728](https://arxiv.org/abs/2311.16728)) [paper]
  - GO-SLAM combines DROID-style tracking with online loop closure, full bundle adjustment and a neural implicit map.
  - Photo-SLAM combines ORB-SLAM3 tracking with photorealistic Gaussian mapping.
  - No UAV-specific evaluations were found for either.

### Inferences
- Single-pass consumer drone video at about 100 m altitude, at the scale of a few km, is the best case in the 2608.18632 benchmark. There, DROID-SLAM and MASt3R-SLAM reach about 0.5% drift, which is plausible for relative poses.
- Monocular visual SLAM should not be trusted for altitude or absolute scale. Scale should be anchored with GPS/EXIF telemetry or an altimeter.
- A single pass with no revisits gives loop closure nothing to work with, so drift correction must come from external priors such as GNSS, SRT/flight-log telemetry, or orthophoto registration.
- DPVO is the practical option for low-memory or edge use; ORB-SLAM3 is the option when there is no GPU.

### Gaps
- No fetched source gave UAV-dataset numbers for DSO/LDSO, GO-SLAM, Photo-SLAM, GigaSLAM, or VINS on UZH-FPV, Mid-Air, UAVid, VPAIR, AerialVL or WildUAV.
- Precise EuRoC and TartanAir ATE values for DROID-SLAM and DPVO were not re-verified this session; take them from the original papers.
- No source specifically evaluated forward-looking (oblique) low-altitude single-pass drone video. The 2608.18632 benchmark is nadir-only.

## Q2. Feed-forward 3D foundation models (DUSt3R, MASt3R, MASt3R-SfM, Spann3R, CUT3R, Fast3R, VGGT, π3, MapAnything, DA3, successors) on aerial imagery

### Takeaway
Off-the-shelf feed-forward models produce reasonable aerial reconstructions on small sets of images (fewer than about 10–50, at low resolution, around 518 px). They suffer from an aerial domain gap: oblique vs nadir views, and ambiguity between field of view and flying height. They also degrade as the number of images and the resolution grow.

In 2025–2026, three kinds of work address these problems:
- Aerial-specific fine-tuning: AerialMegaDepth, UAVFF3D.
- Chunked long-sequence pipelines: VGGT-Long, VGGT-SLAM.
- Geo-anchored variants that consume GPS: GeoFF3D.

GeoFF3D is currently the most directly relevant method for UAV mapping.

### Cited Findings
**Evaluations on aerial imagery**
- Wu, Landgraf, Ulrich, Qin, "An Evaluation of DUSt3R/MASt3R/VGGT 3D Reconstruction on Photogrammetric Aerial Blocks", arXiv 2507.14798 (v2, Oct 2025); in Geo-spatial Information Science [verified] — [arXiv](https://arxiv.org/abs/2507.14798); [GSIS](https://www.tandfonline.com/doi/pdf/10.1080/10095020.2025.2597491)
  - Evaluated on UseGeo aerial blocks, using sparse sets of fewer than 10 images at up to 518 px.
  - Dense completeness was up to +50% higher than COLMAP. VGGT was more efficient and gave more reliable poses.
  - All three models struggle with high-resolution images and with larger image sets, where pose reliability declines.
  - The authors conclude these models "cannot fully replace traditional SfM and MVS" but can complement them in sparse, low-resolution scenarios.
  - A search-result summary of the same work reports that MASt3R and VGGT performed similarly and generally best, with accuracy up to 0.4 m and completeness about +10%; this was not verified in the fetched abstract — [OSU copy](https://u.osu.edu/wu-4988/files/2025/11/GSIS_dust_mast3r_VGGT_evaluation.pdf).
- **AerialMegaDepth** — Vuong, Ghosh, Ramanan, Narasimhan, Tulsiani; CVPR 2025 [verified] — [arXiv 2504.13157](https://arxiv.org/abs/2504.13157); [CVPR paper](https://openaccess.thecvf.com/content/CVPR2025/papers/Vuong_AerialMegaDepth_Learning_Aerial-Ground_Reconstruction_and_View_Synthesis_CVPR_2025_paper.pdf); [GitHub](https://github.com/kvuong2711/aerial-megadepth)
  - Training data mixes pseudo-synthetic Google Earth mesh renderings with real MegaDepth ground images.
  - Fine-tuning DUSt3R raised the share of aerial-ground pairs localized within 5° rotation error from under 3% to nearly 50%.
  - This addresses aerial-to-ground matching, not a single aerial pass.
- **UAVFF3D** — Yang, Wang, Li, Zhang, arXiv 2605.17942 (May 2026) [verified] — [arXiv](https://arxiv.org/abs/2605.17942); [GitHub](https://github.com/yanxian-ll/UAVFF3D)
  - A benchmark with more than 170k real and 370k synthetic UAV images.
  - Identifies three main problems: appearance domain shift, oblique views, and ambiguity between horizontal field of view (HFOV) and flying height.
  - UAV adaptation reduced ray error by up to 84.2%, pose ATE by up to 76.0%, Chamfer distance by up to 41.1%, and the oblique-nadir rotation gap by up to 90.7%. Dataset and evaluation code are released.
- **GeoFF3D** — Yang, Wang, Zhang, Li, Chen, Li, arXiv 2608.28288 (Aug 2026) [verified] — [arXiv](https://arxiv.org/abs/2608.28288); [GitHub](https://github.com/yanxian-ll/GeoFF3D)
  - Uses georeferenced camera translations (GPS) and optional priors to predict poses and dense point maps directly in a gravity-aligned, Z-up metric frame.
  - Splits the images into overlapping chunks and aggregates them hierarchically.
  - F@5 was 0.877 on nine aerial blocks, against 0.829 for Pi3X + SLRF.
  - On long UAVScenes sequences F@5 was 0.848, against 0.687 for Pi3X + SLRF and 0.451 for a SLAM/streaming baseline.
  - Reconstructs about 2,000 images in about 5 minutes and is stated to be stable on near-collinear trajectories. This is highly relevant to single-line flights.
- **Cross3R** — Wang, Tuo, Ze, Shi, "Seeing Across Skies and Streets", arXiv 2605.07978 (May 2026) [verified] — [arXiv](https://arxiv.org/abs/2605.07978)
  - A feed-forward model that combines satellite imagery with UAV and/or ground images.
  - Introduces the CrossGeo dataset: 278k images over 85 scenes.
  - The authors state that UAV views supply roll, pitch and altitude cues that satellite imagery lacks.
- GRF-Recon (Global Ray-Field Optimization for long-sequence feed-forward reconstruction, arXiv 2609.20012) is another Sept 2026 long-sequence successor — [arXiv](https://arxiv.org/pdf/2609.20012). Not fetched.

**Core models**
- **VGGT** — Wang et al. (Oxford VGG / Meta), CVPR 2025 Best Paper [paper]; license [verified] — [arXiv 2503.11651](https://arxiv.org/abs/2503.11651); [GitHub](https://github.com/facebookresearch/vggt)
  - Predicts cameras, depth, point maps and tracks for 1 to hundreds of views in one forward pass.
  - Output is up to scale, with no metric scale.
  - The README says it typically reconstructs a scene in under 1 s.
  - The original checkpoint is non-commercial. VGGT-1B-Commercial (released 29 Jul 2025) allows commercial use except military, via an application form, with near-equal accuracy: AUC@30 of 90.37 vs 89.98 on Co3D.
- **VGGT-Long** — Kai Deng et al., arXiv 2507.16443 [verified] — [arXiv](https://arxiv.org/pdf/2507.16443); [GitHub](https://github.com/DengKaiCQ/VGGT-Long)
  - Splits the sequence into overlapping chunks and aligns them with Sim(3) using confidence-weighted IRLS, then adds loop closure.
  - Calibration-free at kilometer scale. Evaluated on driving datasets (KITTI, Waymo, Virtual KITTI), not UAV data.
- **π3** — ICLR 2026, [arXiv 2507.13347](https://arxiv.org/abs/2507.13347) [verified]
  - Fully permutation-equivariant with no reference view. Predicts affine-invariant poses and scale-invariant local point maps.
  - An extended variant, "Pi3X", appears as the GeoFF3D baseline.
- **MapAnything** — Keetha et al., Meta Reality Labs and CMU, [arXiv 2509.13414](https://arxiv.org/abs/2509.13414) (Sept 2025) [verified]
  - A single transformer that takes images plus optional intrinsics, poses, depth or partial reconstructions, and regresses metric 3D geometry and cameras directly.
  - Supports more than 12 tasks, including SfM, MVS and depth completion.
  - Because it accepts pose inputs, drone GPS or telemetry can in principle be fed in.
- **Depth Anything 3 (DA3)** — ByteDance Seed, Nov 2025 [verified] — [arXiv 2511.10647](https://arxiv.org/pdf/2511.10647); [GitHub](https://github.com/bytedance-seed/depth-anything-3); [Seed blog](https://seed.bytedance.com/en/blog/seed-research-depth-anything-3-a-single-transformer-architecture-for-space-reconstruction-from-any-views)
  - A plain DINO transformer with a depth-ray target. Estimates pose and intrinsics from any number of views.
  - Claims to beat VGGT by 35.7% on camera pose and 23.6% on geometry on average. DA3-metric reports SOTA on ETH3D, ahead of UniDepthV2.
- Other models [paper]:
  - DUSt3R (Wang et al., CVPR 2024; [arXiv 2312.14132](https://arxiv.org/abs/2312.14132)): pairwise point-map regression plus global alignment. CC BY-NC-SA, i.e. non-commercial.
  - MASt3R (Leroy, Cabon, Revaud, ECCV 2024; [arXiv 2406.09756](https://arxiv.org/abs/2406.09756)): adds dense matching features and metric-ish point maps.
  - MASt3R-SfM (Duisterhof et al., 3DV 2025; [arXiv 2409.19152](https://arxiv.org/abs/2409.19152)): retrieval, sparse alignment and global optimization; scales to large unordered collections.
  - Spann3R (Wang and Agapito, 3DV 2025; [arXiv 2408.16061](https://arxiv.org/abs/2408.16061)): spatial memory for incremental streaming.
  - CUT3R (Wang et al., CVPR 2025; [arXiv 2501.12387](https://arxiv.org/abs/2501.12387)): a continuously updated recurrent state for online reconstruction.
  - Fast3R (Yang et al., CVPR 2025; [arXiv 2501.13928](https://arxiv.org/abs/2501.13928)): processes 1000+ images in one pass.
  - All of these output up-to-scale geometry, except MASt3R, which is only approximately metric.

### Inferences
- For single-pass drone video, the most promising 2026 path is a chunked feed-forward reconstruction anchored by GPS or telemetry. GeoFF3D does this, and MapAnything can with pose or intrinsic inputs; both give metric, gravity-aligned output.
- The next alternative is VGGT-Long or VGGT-SLAM chunking, followed by Sim(3) alignment to GPS.
- Pure unanchored feed-forward output will show the HFOV-height ambiguity that UAVFF3D highlights. Known intrinsics (from EXIF) or known altitude resolve it.
- Licensing matters for deployment:
  - Non-commercial: VGGT-1B (original), DUSt3R/MASt3R.
  - Commercial allowed: VGGT-1B-Commercial (by application).
  - DA3, MapAnything and π3 licenses must be checked individually; not verified here.

### Gaps
- No verified numbers were found for MapAnything, π3, DA3, CUT3R or Fast3R on UAV benchmarks such as UAVid, VPAIR, WildUAV or UseGeo.
- UAVFF3D's per-model rankings were not visible in the abstract.
- Licenses for DA3, MapAnything and π3 were not verified.

## Q3. Modern SfM (COLMAP, GLOMAP, hloc/SuperPoint+LightGlue), sequential matching, keyframes

### Takeaway
Classical SfM remains the accuracy reference for aerial blocks. For a single-line or corridor flight, however, the geometry is weak and degenerate. The literature fixes this with GNSS constraints and by segmenting the strip into stable sub-scenes. For video, the standard practice is sequential or overlap-window matching plus keyframe subsampling.

### Cited Findings
- A 2026 Remote Sensing (MDPI) paper proposes "sub-scene-based GNSS-constrained SfM" for long-corridor UAV image strips. It extracts stable sub-scenes so that degenerate configurations do not corrupt camera parameter estimation, and targets weak geometry with limited control — [MDPI Remote Sensing 18(14):2321](https://www.mdpi.com/2072-4292/18/14/2321). The full text returned 403, so details come from the search snippet only.
- Pulling frames from video can raise overlap, which lets unstabilized, highly kinetic UAV footage be reconstructed — [J. Imaging 3(2):15](https://doi.org/10.3390/jimaging3020015).
- A review of efficient SfM for large-scale UAV images exists (ISPRS J. Photogramm., 2020) — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0924271620301131). An efficient SfM for large video from an open-source pipeline is also available — [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11125116/).
- COLMAP, GLOMAP and hloc [paper]:
  - COLMAP (Schönberger and Frahm, CVPR 2016): incremental SfM with a sequential matcher suited to video. BSD license.
  - GLOMAP (Pan et al., ECCV 2024; [arXiv 2407.20219](https://arxiv.org/abs/2407.20219)): global SfM with joint positioning of cameras and points. Reported to be one to two orders of magnitude faster than COLMAP with comparable accuracy.
  - hloc (Sarlin et al., CVPR 2019): pairs with LightGlue ([arXiv 2306.13643](https://arxiv.org/abs/2306.13643)). SuperPoint weights are non-commercial (Magic Leap license); ALIKED or DISK are permissive alternatives.
- GeoFF3D compares against SfM and SLAM baselines on near-collinear trajectories and outperforms a SLAM/streaming baseline by a large margin (F@5 0.848 vs 0.451) [verified] — [arXiv](https://arxiv.org/abs/2608.28288).

### Inferences
- A pure translation along one line (a single strip) leaves focal length and the rotation about the flight axis poorly constrained, which causes the known "bowl" or doming distortion. The practical fixes are fixing or pre-calibrating intrinsics and adding GNSS priors in bundle adjustment. This inference is standard photogrammetry knowledge; the fetched sources confirm the degeneracy and the GNSS remedy, but not the specific doming mechanism.
- For drone video, a sensible recipe is:
  - Select keyframes by parallax or optical-flow magnitude, e.g. at 1–3 fps.
  - Use COLMAP's sequential matcher with loop detection, or hloc with ALIKED+LightGlue.
  - Run GLOMAP for speed.
  - Use GPS priors from the DJI SRT/flight log.

### Gaps
- No fetched source quantified GLOMAP vs COLMAP on single-strip UAV video specifically.
- The body of the MDPI corridor paper was inaccessible (403).

## Q4. Monocular metric depth models (Depth Anything V2/V3, Metric3D v2, UniDepth, Depth Pro) on aerial imagery

### Takeaway
Zero-shot metric depth from models trained on street and indoor data transfers poorly to aerial viewpoints, because altitude, view angle and intrinsics shift the scale. The 2026 AerialMetric benchmark (ECCV 2026) shows that fine-tuning on aerial data is needed for reliable metric depth. Among off-the-shelf models, UniDepthV2, Metric3D v2 and DA3-metric are the strongest candidates reported.

### Cited Findings
- **AerialMetric** — Song, Chen, Zhang, Zou, Fu, Yuan, Huang, Cui, Cao; ECCV 2026 [verified] — [arXiv 2606.29716](https://arxiv.org/abs/2606.29716); [GitHub](https://github.com/kuieless/AerialMetric)
  - 52K real and 16K synthetic UAV image-depth pairs with metric ground truth.
  - Finds "significant domain gaps" for models trained on street-view and indoor data, and studies how viewpoint, altitude and camera parameters affect metric depth.
  - Fine-tuning yields state of the art on aerial imagery.
- Search-result snippets (not verified in the fetched abstracts) — [UAVScenes arXiv 2507.22412](https://arxiv.org/pdf/2507.22412); [AerialMetric](https://arxiv.org/pdf/2606.29716):
  - In a UAV-scene study, Metric3D V2 had the best AbsRel and SqRel, while Depth Anything V2 was best on δ1.
  - UniDepthV2 was reported strongest zero-shot on new aerial datasets.
  - In the scale-aligned setting, MoGe v2 led ordinal depth.
- DA3-metric beats UniDepthV2 on ETH3D [verified via search summary of DA3 paper] — [arXiv 2511.10647](https://arxiv.org/pdf/2511.10647).
- Other metric depth models [paper]: Depth Anything V2 ([arXiv 2406.09414](https://arxiv.org/abs/2406.09414), NeurIPS 2024), Metric3D v2 ([arXiv 2404.15506](https://arxiv.org/abs/2404.15506), TPAMI), UniDepth / UniDepthV2 ([CVPR 2024](https://openaccess.thecvf.com/content/CVPR2024/papers/Piccinelli_UniDepth_Universal_Monocular_Metric_Depth_Estimation_CVPR_2024_paper.pdf); [arXiv 2502.20110](https://arxiv.org/abs/2502.20110)) and Depth Pro (Apple, [arXiv 2410.02073](https://arxiv.org/abs/2410.02073)).
- OrthoTrack (arXiv 2606.25245) estimates continuous 6-DoF UAV trajectories anchored in public orthophotos. This matches the absolute-localization remedy recommended in the SLAM benchmark — [arXiv](https://arxiv.org/pdf/2606.25245). Not fetched.

### Inferences
- Metric depth at 100 m or more altitude is poorly conditioned: depth varies little relative to range. Scale is better taken from GPS baselines or altitude above ground than from monocular metric depth.
- Metric depth is most useful as a prior for SLAM initialization (as in GigaSLAM) or for densification.

### Gaps
- No verified per-model AbsRel or δ1 numbers were found on UAV data. Depth Pro in particular had no aerial evaluation in the sources found.

## Q5. Reconstruction from a single flight line / single pass / low overlap / forward-looking UAV video

### Takeaway
There is little work aimed squarely at single-pass forward-looking drone video. The closest 2026 results are:
- GeoFF3D: GPS-anchored feed-forward reconstruction, stated to be stable on near-collinear trajectories.
- Corridor GNSS-constrained SfM: sub-scenes to avoid degeneracy.
- The nadir monocular-SLAM benchmark: local accuracy is good, but vertical and large-scale drift are severe.

All three point to the same recipe: a learned local geometry front-end plus GNSS, altitude and intrinsics constraints.

### Cited Findings
- GeoFF3D: explicitly robust on near-collinear trajectories; 2,000 images in about 5 minutes; metric, Z-up frame from GPS — [arXiv 2608.28288](https://arxiv.org/abs/2608.28288).
- Corridor strips cause degenerate geometric configurations; GNSS-constrained sub-scene SfM is the remedy — [MDPI](https://www.mdpi.com/2072-4292/18/14/2321).
- Single-pass nadir flights at 110–120 m: DROID-SLAM and MASt3R-SLAM reach about 0.5% horizontal drift, but vertical error is severe on long runs — [arXiv 2608.18632](https://arxiv.org/html/2608.18632).
- Oblique views and HFOV-height ambiguity are the main UAV-specific failure modes of feed-forward models — [UAVFF3D](https://arxiv.org/abs/2605.17942).
- "UAV-Borne Mapping Algorithms for Low-Altitude and High-Speed Drone Applications" is relevant to fast low-altitude passes — [arXiv 2401.06407](https://arxiv.org/pdf/2401.06407). Not fetched.

### Inferences
- A forward-looking camera moving along its viewing axis produces low parallax near the image centre (the focus of expansion). This favours dense learned methods (DROID-SLAM, MASt3R-SLAM, VGGT chunking) over sparse feature-based initialization in ORB-SLAM3 and DSO. This is inferred, not directly measured in the fetched sources.
- Recommended pipeline candidates:
  1. DROID-SLAM, DPVO or MASt3R-SLAM for relative poses, followed by a Sim(3) fit to GPS.
  2. VGGT-Long, π3 or MapAnything in chunks, with GPS-anchored alignment (GeoFF3D-style).
  3. COLMAP or GLOMAP with a sequential matcher and GPS priors as the accuracy baseline.
  4. Fine-tuned metric depth, following the AerialMetric approach, for densification.

### Gaps
- No peer-reviewed benchmark was found that measures forward-looking, oblique single-pass drone video with ground truth.
- No quantitative data was found on the minimum overlap or parallax at which feed-forward models break.
- Several datasets named in the brief (UZH-FPV, Mid-Air, UAVid, VPAIR, AerialVL, WildUAV) had no located 2025–2026 SLAM or feed-forward results. EuRoC and TartanAir results exist in the original DROID-SLAM and DPVO papers but were not re-verified.
