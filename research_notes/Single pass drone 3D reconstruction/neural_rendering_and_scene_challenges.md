# Neural Scene Representations (NeRF / 3DGS) for Large-Scale Aerial Scenes, and Handling Dynamics, Illumination, Blur and Occlusion in Aerial 3D Reconstruction

Research date: 2026-09-30. Verification note: items marked [V] were verified against the fetched primary page this session; items marked [K] are cited to the canonical paper/repo URL but the specific details come from the abstract-level description of the well-known paper and were not re-fetched this session. The report writer should treat [K] numbers cautiously; no [K] item includes an invented number.

## Q1. Large-scale NeRF/3DGS for aerial scenes: methods, results, speed, geometric accuracy, mesh extraction, code, single-pass applicability

### Takeaway
3DGS-based divide-and-conquer methods (VastGaussian, CityGaussian, DOGS, Hierarchical 3DGS, Octree-GS) have replaced Mega-NeRF/Switch-NeRF for aerial novel-view synthesis: on Mill-19 / UrbanScene3D they give roughly +1-2 dB PSNR, far better SSIM/LPIPS and train in ~2.5-4.5 h instead of ~a day, but PSNR is not geometric accuracy. For metric surfaces, 2DGS-family methods (2DGS, PGSR, GOF, CityGaussianV2) extract meshes via TSDF, and independent ISPRS 2025-2026 studies find GS geometry is still generally slightly worse than classical photogrammetry (MVS), so a photogrammetry/MVS backbone plus GS for visualization remains the safest design for a mapping-grade product.

### Cited Findings

**Benchmark numbers on aerial datasets (from DOGS, NeurIPS 2024) [V]** — all PSNR/SSIM/LPIPS — [DOGS arXiv html](https://arxiv.org/html/2405.13943v2)
- Mill-19 Building: Mega-NeRF 20.92/0.547/0.454; Switch-NeRF 21.54/0.579/0.397; 3DGS 22.53/0.738/0.214; VastGaussian 21.80/0.728/0.225; Hierarchy-GS 21.52/0.723/0.297; DOGS 22.73/0.759/0.204.
- Mill-19 Rubble: Mega-NeRF 24.06/0.553/0.508; Switch-NeRF 24.31/0.562/0.478; 3DGS 25.51/0.725/0.316; VastGaussian 25.20/0.742/0.264; Hierarchy-GS 24.64/0.755/0.284; DOGS 25.78/0.765/0.257.
- UrbanScene3D Campus / Residence / Sci-Art: Mega-NeRF 23.42 / 22.08 / 25.60; Switch-NeRF 23.62 / 22.57 / 26.51; 3DGS 23.67 / 22.36 / 24.13; VastGaussian 23.82 / 21.01 / 22.64; DOGS 24.01 / 21.94 / 24.42 (NeRFs keep a PSNR edge on Sci-Art/Residence but lose on SSIM/LPIPS).
- Training time (hh:mm) Mill-19/UrbanScene3D: 3DGS ~18:40-23:13 (single GPU, full scene); VastGaussian 02:30-03:33; DOGS 02:25-04:33 (distributed). DOGS reports a 6x+ speedup using ADMM consensus over shared Gaussians across blocks.
- MatrixCity Aerial: 3DGS 27.36/0.818/0.237 (47:40 h); VastGaussian 28.33/0.835/0.220 (05:53); DOGS 28.58/0.847/0.219 (06:34). On MatrixCity Street, VastGaussian failed (imbalanced splitting produced empty blocks); DOGS 21.61.

**Individual large-scale methods**
- Mega-NeRF (CVPR 2022): spatially partitions a drone scene into grid cells, trains one NeRF submodule per cell with geometry-aware pixel/data partitioning; introduced the Mill-19 dataset (Building, Rubble). Code: github.com/cmusatyalab/mega-nerf — [K] [arXiv 2112.10703](https://arxiv.org/abs/2112.10703)
- Block-NeRF (CVPR 2022): city-scale street-level (Waymo) NeRF blocks with per-block appearance embeddings, learned pose refinement and exposure conditioning; blocks composited at render time. Street-view, not aerial; no official code release — [K] [arXiv 2202.05263](https://arxiv.org/abs/2202.05263)
- Switch-NeRF (ICLR 2023): mixture-of-experts NeRF with learned scene decomposition; its Mill-19/UrbanScene3D scores are in the DOGS table above — [DOGS](https://arxiv.org/html/2405.13943v2) (primary paper/repo URL not verified this session; see Gaps)
- VastGaussian (CVPR 2024): progressive camera/point-based data partitioning with airspace-aware visibility, parallel block training and seamless merging; decoupled appearance modelling to handle per-image appearance variation. Faster than DOGS but lower quality; fails on imbalanced street scenes — [VastGaussian arXiv](https://arxiv.org/pdf/2402.17427); [DOGS comparison](https://arxiv.org/html/2405.13943v2)
- DOGS / DoGaussian (NeurIPS 2024): distributed 3DGS with ADMM-based Gaussian consensus; best quality in the table above — [arXiv 2405.13943](https://arxiv.org/pdf/2405.13943)
- CityGaussian (ECCV 2024) and CityGaussianV2 (ICLR 2025): V2 builds on 2DGS, adds decomposed-gradient densification and depth regression, an elongation filter against Gaussian-count explosion from 2DGS degeneration, parallel training with up to 10x compression, >=25% less training time and 50% less memory; establishes a TnT-style geometric benchmark for large unbounded scenes; code + HF weights — [project](https://dekuliutesla.github.io/CityGaussianV2/); [arXiv](https://arxiv.org/abs/2411.00771); [HF](https://huggingface.co/TeslaYang123/CityGaussianV2)
- CityGaussianV2 geometry results [V] — [arXiv html](https://arxiv.org/html/2411.00771v1):
  - GauU-Scene: F1 2DGS 0.491, GOF 0.374, CityGS 0.407, CityGaussianV2 0.501 (P 0.576, R 0.450); PSNR 24.51 vs CityGS 24.75.
  - MatrixCity-Aerial: F1 2DGS 0.270, GOF FAIL, CityGS 0.462, CityGaussianV2 0.556; PSNR 27.23.
  - Residence scene: ~181 min training, 14.2 GB memory, 0.44 GB storage, 8.06 M Gaussians.
  - Meshes from all methods extracted by TSDF + marching cubes (1 m voxel, 4 m truncation) — i.e. metre-scale mesh resolution in city benchmarks.
- Hierarchical 3DGS (SIGGRAPH 2024, Inria): chunk-based training plus a hierarchy of merged Gaussians for LOD rendering of very large (km-scale, tens of thousands of images) captures; code at github.com/graphdeco-inria/hierarchical-3d-gaussians — [K] [project](https://repo-sam.inria.fr/fungraph/hierarchical-3d-gaussians/). Scores in the DOGS table above [V].
- Octree-GS (TPAMI 2025): LOD-structured anchor Gaussians organised in an octree for consistent real-time rendering across scales, evaluated on large aerial/street scenes — [arXiv 2403.17898](https://arxiv.org/pdf/2403.17898)
- DroneSplat (CVPR 2025): see Q2; adds DUSt3R MVS priors and voxel-guided optimization for limited-view drone captures; code on GitHub — [CVF](https://openaccess.thecvf.com/content/CVPR2025/html/Tang_DroneSplat_3D_Gaussian_Splatting_for_Robust_3D_Reconstruction_from_In-the-Wild_CVPR_2025_paper.html); [GitHub BITyia/DroneSplat](https://github.com/BITyia/DroneSplat)
- STARS-GS (arXiv, Sept 2026): "Structure-Aware Regularized Gaussian Splatting for Large-Scale Aerial Surface Reconstruction" — very recent aerial surface-reconstruction work (PDF too large to fetch; numbers not verified) — [arXiv 2609.03447](https://arxiv.org/pdf/2609.03447)
- GS4Buildings (2025): prior-guided GS for 3D building reconstruction (uses building priors) — [arXiv 2508.07355](https://arxiv.org/pdf/2508.07355)
- Live UAV-video GS pipeline (Maikos, Angelidis, Papadopoulos, arXiv 2602.20342, 2026): RTMP-streamed drone video + synchronized sensor fusion + pose estimation feeding 3DGS with continuous model updates; quality "within 4-7% of high-fidelity offline references", much lower latency than NeRF; no photogrammetry/LiDAR geometric comparison reported — [arXiv 2602.20342](https://arxiv.org/abs/2602.20342)

**Surface-accurate GS / mesh extraction**
- PGSR (TVCG 2024) [V]: flattens Gaussians into planes, unbiased depth rendering (camera-to-plane distance + normal), single- and multi-view geometric regularization, per-image exposure compensation. DTU Chamfer (mm): SuGaR 1.33, 2DGS 0.80, GOF 0.74, Neuralangelo 0.61 (>128 h), PGSR 0.52 (0.5 h). Tanks&Temples F1: SuGaR 0.19, 2DGS 0.32 (0.57 h), GOF 0.46 (2 h), Neuralangelo 0.50, PGSR 0.52 (0.75 h) — [arXiv html](https://arxiv.org/html/2406.06521v2); project [zju3dv.github.io/pgsr](https://zju3dv.github.io/pgsr/)
- 2DGS (SIGGRAPH 2024): surfel (2D disk) Gaussians giving view-consistent geometry; TSDF mesh extraction — [K] [arXiv 2403.17888](https://arxiv.org/abs/2403.17888). GOF (Gaussian Opacity Fields, SIGGRAPH Asia 2024): level-set mesh extraction directly from Gaussian opacity field; failed on MatrixCity-Aerial in CityGaussianV2 benchmark [V] — [K] [arXiv 2404.10772](https://arxiv.org/abs/2404.10772)

**GS vs photogrammetry geometric accuracy (aerial/UAV)**
- ISPRS Archives 2026 "Metric Assessment of 3D Gaussian Splatting for UAV-..." (search-result summary; PDF text not extractable): rendering quality and geometric accuracy are dissociated in 3DGS; 3DGS geometric accuracy is generally slightly lower than traditional photogrammetry, especially for small datasets or low-resolution input; Postshot "Splat3" configurations beat native 3DGS, and LichtFeld Studio was best/near-best among GS implementations — [ISPRS Archives XLVIII-2-W12-2026-143](https://isprs-archives.copernicus.org/articles/XLVIII-2-W12-2026/143/2026/isprs-archives-XLVIII-2-W12-2026-143-2026.pdf)
- A 2026 UAV study (Int. J. Image and Data Fusion, via search snippet) reports GS reconstructed directly from video frames with GNSS metadata achieved ICP RMS 0.0048 m structural consistency (comparable to photogrammetry), but absolute georeferencing CE90 = 5.26 m horizontal and LE90 = 0.56 m vertical — i.e. without GCPs absolute accuracy is poor — [T&F 10.1080/19479832.2026.2661679](https://www.tandfonline.com/doi/abs/10.1080/19479832.2026.2661679)
- ISPRS Annals 2025 "3D Gaussian Splatting Methods for Real-World Scenarios" and ISPRS 2026 "Photogrammetry and 3D Gaussian Splatting for Cultural Heritage" are further comparative sources — [ISPRS Annals X-G-2025-641](https://isprs-annals.copernicus.org/articles/X-G-2025/641/2025/isprs-annals-X-G-2025-641-2025.pdf); [ISPRS Archives XLIX-B2-2026-451](https://isprs-archives.copernicus.org/articles/XLIX-B2-2026/451/2026/isprs-archives-XLIX-B2-2026-451-2026.pdf)

**Feed-forward GS**
- AnySplat (SIGGRAPH Asia 2025, ACM TOG): feed-forward network that regresses 3D Gaussians plus camera intrinsics/extrinsics from unposed, uncalibrated image collections in one pass; code on GitHub — [arXiv 2505.23716](https://arxiv.org/pdf/2505.23716); [ACM](https://dl.acm.org/doi/10.1145/3763326); [GitHub](https://github.com/Rivers2de/AnySplat)
- VGGT (CVPR 2025), Pi3, DUSt3R/MASt3R are the geometry foundation models underpinning these feed-forward pipelines; scaling to large scenes is still an open research area — [Emergent Mind topic summary](https://www.emergentmind.com/topics/feed-forward-3d-gaussian-splatting-3dgs)
- InstantSplat (2024): DUSt3R/MASt3R initialization + joint pose/Gaussian optimization for sparse unposed views in under a minute — [K] [arXiv 2403.20309](https://arxiv.org/abs/2403.20309)

**SLAM + GS (online)**
- Reported speeds: MonoGS rendering ~235 FPS but overall system 0.32-1.58 FPS; Photo-SLAM rendering ~788 FPS and overall 0.53-2.8 FPS in one comparison — [GaussianFlow SLAM](https://arxiv.org/html/2604.15612v1)
- Coupled systems (CG-SLAM, RTG-SLAM, Splat-SLAM) struggle to exceed 20 fps; MGSO runs >=30 fps, matched only by Photo-SLAM and GS-ICP — [MGSO](https://arxiv.org/html/2409.13055v3)
- SplatMAP averages 3.74 fps vs GO-SLAM 8.36 and MonoGS 0.32 — [SplatMAP](https://arxiv.org/html/2501.07015)
- DROID-Splat combines end-to-end DROID-SLAM tracking with 3DGS mapping — [arXiv 2411.17660](https://arxiv.org/pdf/2411.17660); 3DGS-SLAM survey 2026 — [arXiv 2602.04251](https://arxiv.org/pdf/2602.04251)
- These SLAM systems are evaluated almost entirely on indoor/handheld sequences (Replica, TUM, ScanNet); "NeRF and Gaussian Splatting SLAM in the Wild" examines outdoor robustness — [arXiv 2412.03263](https://arxiv.org/html/2412.03263v1)

### Inferences
- For a single-pass drone video, the realistic pipeline is: keyframe selection → SfM/SLAM poses (optionally VGGT/MASt3R-initialized) → classical MVS for metric mesh / DSM → GS (e.g. CityGaussianV2/PGSR with exposure compensation) for photoreal viewing. GS alone should not be sold as survey-grade.
- The DOGS table shows PSNR differences between modern 3DGS methods on Mill-19 are small (<1 dB); choice should be driven by memory, training time, LOD delivery (Hierarchical 3DGS, Octree-GS) and geometry, not PSNR.
- Metre-scale TSDF voxels in city-scale GS benchmarks mean GS meshes are currently coarser than photogrammetric meshes for building-scale detail unless tiled at finer voxel sizes.
- Feed-forward (AnySplat) and SLAM-GS are good for an instant on-site preview but lack metric scale and are unproven on km-scale aerial captures.

### Gaps
- Could not extract the full text/numbers (RMSE in cm) of the ISPRS 2026 UAV metric-assessment paper (PDF not parseable here); STARS-GS numbers not verified.
- Switch-NeRF repository URL not verified; CityGaussian (V1) and Octree-GS aerial numbers not fetched.
- No verified numbers found for GS on UAVD / Tanks&Temples aerial scenes specifically, nor direct GS vs Metashape/COLMAP MVS F1 on Mill-19.

## Q2. Dynamic objects / transient distractors

### Takeaway
Robust-loss and semantic-feature masking (RobustNeRF → SpotLessSplats, WildGaussians with DINOv2 features, SAM-based masks) now handle moving cars/people during training; DroneSplat is the only aerial-specific CVPR-level method, using SAM v2 adaptive local-global masking and gaining +0.9 to +2.4 dB PSNR over 3DGS/WildGaussians on its 24-scene drone dataset. Pre-SfM semantic masking (YOLO/SAM) remains a cheap complementary step for photogrammetry.

### Cited Findings
- DroneSplat [V] — [paper notes](https://github.com/zhaoyang97/Paper-Notes-en/blob/main/docs/CVPR2025/3d_vision/dronesplat_3d_gaussian_splatting_for_robust_3d_reconstruction_from_in-the-wild_d.md); [arXiv 2503.16964](https://arxiv.org/abs/2503.16964)
  - Adaptive Local-Global Masking: per-frame class-agnostic SAM v2 segmentation with a residual-statistics threshold (mean + variance scaled, looser early in training); global masking with SAM v2 video tracking catches temporarily stationary objects.
  - DUSt3R dense point cloud initialization with FPFH-based geometry-aware sampling; voxel-guided optimization constrains Gaussians within voxel bounds, improving geometry under limited drone views.
  - Dataset: 24 drone scenes grouped by dynamic intensity. PSNR: low-dynamic 24.56 vs 3DGS 22.43 / WildGaussians 22.41; medium 17.89 vs 17.04 / 16.96; high 19.51 vs 17.11 / 17.15.
  - Limitations: SAM v2 is a compute bottleneck for large scenes; fixed voxel partition; lighting/exposure variation not handled.
- SpotLessSplats: pretrained semantic features + robust optimization; spatial clustering (SLS-agg) and spatio-temporal learned MLP clustering (SLS-mlp) masks; generally beats WildGaussians — [arXiv 2406.20055](https://arxiv.org/pdf/2406.20055); [DeGauss comparison](https://arxiv.org/html/2503.13176v2)
- WildGaussians extends NeRF On-the-go by predicting per-pixel dynamic masks from DINOv2 features (also includes appearance embeddings) — [DeGauss related work](https://arxiv.org/html/2503.13176v2)
- Newer: RobustSplat (2025) decouples densification from dynamics — [arXiv 2506.02751](https://arxiv.org/pdf/2506.02751); DualSplat (2026) pseudo-mask bootstrapping — [arXiv 2604.21631](https://arxiv.org/pdf/2604.21631); Difix3D-W (2026) distractor-free few-shot GS — [arXiv 2604.27422](https://arxiv.org/pdf/2604.27422)
- NeRF-W (CVPR 2021): per-image appearance embeddings + transient head with uncertainty for internet photo collections — [K] [arXiv 2008.02268](https://arxiv.org/abs/2008.02268). RobustNeRF (CVPR 2023): trimmed robust loss treating distractors as outliers — [K] [arXiv 2302.00833](https://arxiv.org/abs/2302.00833)

### Inferences
- For single-pass drone video, moving objects appear in fewer frames than static structure, so residual-based robust masking works well; SAM/YOLO masks of known classes (vehicles, people) before SfM/MVS are a cheap, deterministic complement and also help photogrammetric texturing.
- Temporarily parked vehicles are a real risk in a single pass; DroneSplat's global video-tracked masking specifically targets that.

### Gaps
- No verified results for YOLO/SAM pre-SfM masking on aerial benchmarks (accuracy gain in cm) were found.

## Q3. Motion blur and rolling shutter

### Takeaway
Physically modelled blur (integrating sharp renders along an in-exposure camera trajectory) is the standard: BAD-NeRF → BAD-Gaussians, plus "Gaussian Splatting on the Move" (ECCV 2024) which jointly compensates blur and rolling shutter — directly relevant to consumer drone video.

### Cited Findings
- BAD-Gaussians (ECCV 2024): models the physical formation of motion-blurred images, jointly optimizing Gaussians and the camera trajectory within the exposure time; tolerant of inaccurate poses — [project](https://lingzhezhao.github.io/BAD-Gaussians/); [Springer](https://link.springer.com/chapter/10.1007/978-3-031-72698-9_14)
- Gaussian Splatting on the Move (Seiskari et al., ECCV 2024, Spectacular AI): differentiable screen-space approximation incorporating rolling-shutter and motion blur into 3DGS for handheld video, using VIO velocity; code github.com/SpectacularAI/3dgs-deblur — [GitHub](https://github.com/SpectacularAI/3dgs-deblur); [Springer](https://link.springer.com/chapter/10.1007/978-3-031-73209-6_10)
- Concurrent: DeblurGS, BAGS (blur-agnostic GS); BARD-GS (CVPR 2025) for blur in dynamic scenes; Deblur Gaussian Splatting SLAM (2025) — [BARD-GS](https://openaccess.thecvf.com/content/CVPR2025/papers/Lu_BARD-GS_Blur-Aware_Reconstruction_of_Dynamic_Scenes_via_Gaussian_Splatting_CVPR_2025_paper.pdf); [Deblur GS SLAM](https://arxiv.org/pdf/2503.12572)
- Deblur-NeRF (CVPR 2022) learns a deformable sparse blur kernel; BAD-NeRF (CVPR 2023) is the NeRF predecessor of BAD-Gaussians — [K] [Deblur-NeRF arXiv 2111.14292](https://arxiv.org/abs/2111.14292); [BAD-NeRF arXiv 2211.12853](https://arxiv.org/abs/2211.12853)

### Inferences
- For single-pass video, cheapest wins come first: blur-aware keyframe selection (e.g. variance-of-Laplacian sharpness scoring, reject worst frames per window) before SfM, then optionally BAD-Gaussians-style modeling for the remaining frames; rolling-shutter correction matters for fast yaw on consumer drones (DJI Mini/Air class sensors).

### Gaps
- No verified quantitative blur/rolling-shutter results on aerial datasets were found; "blur-aware keyframe selection" literature specific to drones not verified this session.

## Q4. Illumination, exposure, shadows

### Takeaway
Per-image appearance embeddings (NeRF-W, Block-NeRF, VastGaussian decoupled appearance, WildGaussians) and lightweight per-image affine exposure models (PGSR: exp(a_i)·I + b_i) absorb illumination/exposure changes during training; true shadow removal for texturing (delighting) is less mature and not addressed by the aerial GS methods reviewed.

### Cited Findings
- PGSR exposure compensation: two coefficients (a, b) per image, adjusted image = exp(a_i)·I_r + b_i, applied selectively based on SSIM — [PGSR](https://arxiv.org/html/2406.06521v2)
- VastGaussian uses decoupled appearance modelling for large-scene appearance variation — [VastGaussian](https://arxiv.org/pdf/2402.17427)
- DroneSplat explicitly lists unaddressed lighting/exposure variation as a limitation — [notes](https://github.com/zhaoyang97/Paper-Notes-en/blob/main/docs/CVPR2025/3d_vision/dronesplat_3d_gaussian_splatting_for_robust_3d_reconstruction_from_in-the-wild_d.md)
- Block-NeRF conditions on appearance embeddings and exposure — [K] [arXiv 2202.05263](https://arxiv.org/abs/2202.05263)

### Inferences
- A single-pass flight (minutes) has little sun-angle change, so exposure/white-balance compensation (auto-exposure of the drone camera) matters more than day-to-day illumination; lock exposure in flight where possible. For mesh texturing, global color adjustment + seam leveling (mvs-texturing) handles most exposure differences; hard shadows get baked in.

### Gaps
- No verified aerial-specific shadow-removal/delighting method with results was found in this session.

## Q5. Occluded / unseen surface completion (generative priors, building models, semantics)

### Takeaway
Two complementary routes: (a) diffusion priors (ReconFusion, CAT3D, ViewCrafter, Difix3D+) that hallucinate plausible content for under-observed views — good for visuals, not metric; (b) structured priors for buildings — segment the point cloud (PTv3, RandLA-Net on SensatUrban-type data), then fit planar/LoD2 models (PolyFit, City3D) that infer missing walls — metric and CityGML-compatible.

### Cited Findings
- Diffusion completion: Difix3D+ improves 3D reconstructions with single-step diffusion and is a common baseline; ViewCrafter tames video diffusion using point-cloud/3DGS render conditioning; CAT3D uses multi-view diffusion to generate views then reconstructs — [co-adaptation paper related work](https://arxiv.org/pdf/2508.12720); [GSFix3D](https://ar5iv.labs.arxiv.org/html/2508.14717); [VidSplat 2026](https://arxiv.org/pdf/2605.11424); [GaMO multi-view outpainting](https://arxiv.org/html/2512.25073)
- ReconFusion (CVPR 2024): diffusion prior regularizing NeRF from few views — [K] [arXiv 2312.02981](https://arxiv.org/abs/2312.02981); CAT3D — [K] [arXiv 2405.10314](https://arxiv.org/abs/2405.10314); ViewCrafter — [K] [arXiv 2409.02048](https://arxiv.org/abs/2409.02048)
- City3D: fully automatic compact building reconstruction from airborne point clouds; infers missing vertical walls from planar roofs (roofs connected by vertical walls to ground), extends PolyFit's candidate faces with inferred vertical planes; released dataset of 20,000 buildings — [arXiv 2201.10276](https://arxiv.org/abs/2201.10276); [MDPI Remote Sensing](https://mdpi.com/2072-4292/14/9/2254/htm)
- PolyFit hypothesizes faces from pairwise plane intersections and selects via optimization but assumes a complete set of planar primitives — [City3D](https://arxiv.org/abs/2201.10276)
- Other building modelling: City4CFD (TU Delft, LoD2 for CFD) — [GitHub](https://github.com/tudelft3d/City4CFD); Point2Building (2024) — [arXiv 2403.02136](https://arxiv.org/pdf/2403.02136); SimpliCity — [arXiv 2404.08104](https://arxiv.org/pdf/2404.08104); GS4Buildings uses building priors inside GS — [arXiv 2508.07355](https://arxiv.org/pdf/2508.07355)
- SensatUrban: photogrammetric (UAV) point cloud, 7.6 km², ~3 billion points, 13 classes — [arXiv 2009.03137](https://arxiv.org/pdf/2009.03137); RandLA-Net ~52.7-53.9% mIoU; PTv3 reported 46.2% mIoU in one evaluation and 75.5% in another (conflicting setups; treat carefully) — [search summary of SensatUrban/PTv3 sources](https://ar5iv.labs.arxiv.org/html/2201.04494); [PTv3 CVPR 2024](https://openaccess.thecvf.com/content/CVPR2024/papers/Wu_Point_Transformer_V3_Simpler_Faster_Stronger_CVPR_2024_paper.pdf)

### Inferences
- For a single pass, facades and roof overhangs are under-observed; LoD2 fitting (roof planes + extruded walls) gives defensible metric completion, while diffusion completion should be flagged as "synthesized" in any deliverable.

### Gaps
- PTv3 SensatUrban mIoU figures conflict (46.2 vs 75.5) — original sources not fetched. No verified diffusion-completion results on aerial datasets.

## Q6. Mesh / texture / delivery formats

### Takeaway
Classical path: OpenMVS (DensifyPointCloud → ReconstructMesh → RefineMesh → TextureMesh) or mvs-texturing (Waechter et al., view selection + global color adjustment + seam leveling) → export OBJ/glTF → 3D Tiles for Cesium. GS can now also be delivered as 3D Tiles via the Khronos KHR_gaussian_splatting glTF extension with hierarchical LOD in CesiumJS.

### Cited Findings
- Khronos formally added 3DGS to glTF with OGC, Niantic Spatial, Cesium (Bentley), Esri — [Khronos press release](https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release)
- CesiumJS 1.130.1 (July 2025) experimental 3D Tiles with SPZ-compressed splats; Nov 2025 moved to KHR_gaussian_splatting and KHR_gaussian_splatting_compression_spz_2; first shipping implementation CesiumJS 1.139 and Cesium for Unreal 2.23.0 (March 2026); splats slated for proposed 3D Tiles 2.0 OGC community standard — [Cesium July 2025](https://cesium.com/blog/2025/07/01/cesium-releases-in-july-2025/); [Cesium Nov 2025](https://cesium.com/blog/2025/11/03/cesium-releases-in-november-2025/); [radiancefields.com](https://radiancefields.com/cesium-brings-khr_gaussian_splatting-support-to-cesiumjs-and-unreal-engine)
- Hierarchical LOD for Gaussian splats in 3D Tiles (Cesium blog, 27 Apr 2026) — [Cesium blog](https://cesium.com/blog/2026/04/27/3d-gaussian-splats-lod/)
- OpenMVS — [K] [github.com/cdcseacave/openMVS](https://github.com/cdcseacave/openMVS); mvs-texturing — [K] [github.com/nmoehrle/mvs-texturing](https://github.com/nmoehrle/mvs-texturing)

### Inferences
- A hybrid deliverable (textured photogrammetric mesh in 3D Tiles for measurement + GS 3D Tiles layer for photoreal viewing) is now feasible in one Cesium viewer.

### Gaps
- Did not verify OpenMVS/mvs-texturing performance on aerial data this session.
