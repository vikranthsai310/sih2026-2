# Georeferencing and Metric Accuracy for UAV Photogrammetry / Video Reconstruction Without (or With Minimal) GCPs

Scope note: numbers below come from primary papers where full text was accessible (Zhang et al. 2019 ESurfD preprint; Vautherin et al. 2016 ISPRS Annals; James & Robson 2014 ESPL; DJI/DroneDeploy P4 RTK whitepaper; ASPRS Ed.2 summary). Several MDPI/PMC pages returned HTTP 403 or CAPTCHA, so some numbers are from search-result abstracts/snippets and are flagged "(abstract/snippet)". Treat those as lower-confidence until the full text is checked.

## 1. Absolute & relative RMSE by setup: consumer GNSS only vs RTK/PPK (no GCPs) vs with GCPs

### Takeaway
Consumer (single-point, uncorrected) GNSS geotags give metre-level absolute error (roughly 1-2.5 m horizontal, ~4 m vertical in a controlled study), even though the internal (relative) geometry can be cm-level. RTK/PPK direct georeferencing without GCPs routinely reaches ~1-3 cm horizontal and ~2-6 cm vertical RMSE on checkpoints, comparable to a GCP-based solution; one GCP is recommended mainly to catch vertical bias / wrong fixes.

### Cited Findings
**Consumer GNSS only (no GCP)**
- Zhang et al. (UCLouvain), 45 m flight, 16 checkpoints: DSLR (Canon EOS, GSD 0.63 cm) with on-board single GPS and 0 GCP: RMSE X 0.557 m, Y 2.216 m, XY 2.285 m, Z 3.931 m; mean error Z 3.927 m with SD only 0.18 m -> the error is almost entirely a systematic shift/offset, not noise. — [Zhang et al. 2019, ESurfD preprint, Table 1](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)
- Same study, action camera (GoPro, fish-eye, GSD 3.11 cm), single GPS 0 GCP: RMSE XY 1.529 m, Z 3.886 m (SD XY 0.065 m, Z 0.124 m -> again a near-rigid offset). — [Zhang et al. 2019](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)
- DJI Mavic Pro (consumer GNSS) direct georeferencing: best horizontal RMSE "less than 1 m", vertical RMSE "large and unacceptable"; authors do not recommend GCP-free mapping with this drone (abstract/snippet). — [Elkhrachy 2021, Alexandria Eng. J.](https://www.sciencedirect.com/science/article/pii/S1110016821002544)
- On-board navigation components with appropriate synchronisation allow direct georeferencing "with a precision below 1 m in each coordinate" (snippet, older low-cost DG experiments). — [Direct georeferencing with on-board navigation components (scispace PDF)](https://scispace.com/pdf/direct-georeferencing-with-on-board-navigation-components-of-1fozwb4xff.pdf)
- Older literature table (in Zhang et al. Table A1): Turner et al. 2012 direct georeferencing, 50 m, ~1 cm/px: mean absolute horizontal accuracy 0.66-1.25 m. — [Zhang et al. 2019 Table A1](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)

**RTK/PPK, no GCP**
- Zhang et al.: DSLR PPK, 0 GCP: RMSE XY 0.024 m, Z 0.022 m; PPK + 1 GCP: XY 0.023 m, Z 0.029 m. GoPro PPK 0 GCP: XY 0.026 m, Z 0.042 m; PPK+1 GCP: XY 0.020 m, Z 0.032 m. Single GPS + 8 GCPs (DSLR): XY 0.023 m, Z 0.026 m -> PPK with 0 GCP ≈ 8-GCP solution. Antenna-camera offset 22.5 cm handled as lever arm. Conclusion: PPK-SfM gives "ca. 0.01 m" mean error, "RMSE ca. 0.03 m", same as GCP method; they recommend at least one GCP as an operational compromise to detect PPK biases/false fixes. — [Zhang et al. 2019](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)
- DJI Phantom 4 RTK (DroneDeploy whitepaper): 2 cm relative vertical accuracy and 1.2 cm relative horizontal accuracy; control distances within 0.1% of P4 Pro+GCP result and within 0.27% of GNSS-rover measurements; 2D vs 3D (oblique) flights did not significantly affect accuracy. DJI claims 5 cm absolute accuracy on photogrammetric models at 100 m (GSD 2.74 cm). TimeSync aligns flight controller, camera and RTK module and fixes position to CMOS sensor centre. — [DJI/DroneDeploy P4 RTK whitepaper](https://docs.djicdn.com/DJI+Enterprise/measurement-accuracy-dji-phantom-4-rtk-whitepaper-f[1].pdf)
- P4 RTK direct georeferencing: horizontal 1-3 cm, vertical 4-6 cm without GCPs; 71 checkpoints gave Z RMSE 5.58 cm (abstract/snippet). — [Accuracy Assessment of UAV Photogrammetry System with RTK (Semantic Scholar PDF)](https://pdfs.semanticscholar.org/5c9e/bad8e2cf3acf82d7a2a7ca7db2312f58b492.pdf)
- RTK without GCP 5.23 cm vs RTK with GCP 4.45 cm, with 84% lower operating cost (abstract/snippet). — [Geo-spatial Information Science 2025](https://www.tandfonline.com/doi/full/10.1080/10095020.2025.2451204)
- PPK vertical (ellipsoidal) RMSE 5.2 cm vs 4.8 cm with GCPs (snippet). — [Low-cost UAV RTK/PPK test, Sensors (PMC8200111)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8200111/)
- RTK/PPK with corrections from multiple base stations: min error 1.8 cm at 50 m; max 2.7-2.9 cm at 90 m, no GCP (snippet). — [Geocarto Int. 2023](https://www.tandfonline.com/doi/full/10.1080/10106049.2023.2197507)
- P4 RTK in PPK mode, open-pit mine: adding one GCP gave XY/Z RMSE 3.8-9.8 cm; two GCPs 3.0-5.7 cm (snippet). — [ResearchGate: P4 RTK PPK open-pit](https://www.researchgate.net/publication/351810047_Experimental_Investigation_on_the_Performance_of_DJI_Phantom_4_RTK_in_the_PPK_Mode_for_3D_Mapping_Open-Pit_Mines)
- Gerke & Przybilla (PfG 2016): with onboard RTK not only absolute orientation improves but "block deformation is reduced"; in flat terrain cross-flight patterns help self-calibration; residual offsets from time synchronization/camera event triggering must be considered. — [Univ. Twente record](https://research.utwente.nl/en/publications/accuracy-analysis-of-photogrammetric-uav-image-blocks-influence-o/)
- Commercial caveat: GCP-free RTK moves accuracy management to datum/geoid/transformation handling; wrong transformation can lose the cm-level antenna accuracy. — [Unmanned Systems Technology](https://www.unmannedsystemstechnology.com/feature/managing-accuracy-in-gcp-free-rtk-mapping/)

### Inferences
- With consumer GNSS, the error is dominated by a near-constant 3D offset (Zhang: Z bias 3.9 m, SD 0.18 m). So relative/internal geometry (lengths, areas, volumes) can be far better than absolute position; a single GCP or a known-coordinate feature removes most of the error (single GPS + GCP -> 2-3 cm).
- Realistic absolute accuracy tiers: consumer GNSS ~1-5 m (vertical worst); RTK/PPK no GCP ~2-5 cm (≈1-3 GSD); RTK/PPK + 1 GCP / GCP-block ~1-3 cm.
- Scale error from consumer GNSS is smaller than translation error because noise averages over many camera positions; distances measured in the DJI whitepaper were within 0.1-0.3%.

### Gaps
- Could not access full text of Elkhrachy 2021 (403) for exact Mavic Pro numbers.
- No independent (non-vendor) study found in this pass quantifying consumer-GNSS scale error (ppm/%) specifically.

## 2. Video-derived vs still-image-derived models

### Takeaway
4K video frames (~8.3 MP) have lower resolution than stills (12-20 MP), more compression and rolling-shutter/motion blur, but provide massive overlap. Published comparisons show video-frame models can reach cm-level accuracy comparable to photo mosaics when frames are sampled densely enough (e.g., 1 frame / 2.5 s) and GCPs or accurate georeferencing are used; accuracy degrades as frame interval increases.

### Cited Findings
- Remote Sensing 2021 (photovoltaic panels, UAV video vs photo mosaic): RMSE of building boundaries 0.013-0.028 m (photo "path flight"), 0.011-0.027 m (video, 1 frame/2.5 s), 0.016-0.044 m (1 frame/4 s); PV panel locations 0.001-0.064 m (photo), 0.004-0.039 m (1/2.5 s), 0.012-0.073 m (1/4 s), 0.017-0.078 m (1/5.5 s); boundary altitude 0.003-0.056 m (photo), 0.019-0.053 m (1/2.5 s), 0.021-0.082 m (1/4 s), 0.022-0.095 m (1/5.5 s). Mean RMSE of photo path flight and 2.5 s video ≈ 0.019 m (abstract/snippet; full text 403). — [Remote Sens. 2021, 13(14), 2745](https://doi.org/10.3390/rs13142745)
- 4K video ≈ 8 MP still in resolution; stills from many UAVs are 20+ MP; video flights must be lower to match photo quality. — [PhotoModeler Tip 47](https://www.photomodeler.com/tip-47-extract-stills-from-video-for-photogrammetry/); [SkyeBrowse](https://www.skyebrowse.com/news/posts/videogrammetry-vs-photogrammetry) (vendor)
- DJI SRT sidecar files hold per-frame telemetry (lat, lon, altitude, focal length, zoom) at the video frame rate (e.g., 29.97 fps); SRT times are local with no timezone. — [ScienceDirect lightweight georeferencing workflow for dynamic UAV footage (2025)](https://www.sciencedirect.com/science/article/abs/pii/S2352938525003544); [dji-drone-metadata-embedder (GitHub)](https://github.com/CallMarcus/dji-drone-metadata-embedder); [SANS ISC diary on DJI video metadata](https://isc.sans.edu/diary/31014)

### Inferences
- For single-pass video, SRT GPS is consumer-grade (not RTK unless an RTK airframe records it), so expect metre-level absolute offset; the SRT positions are still very useful as a scale/orientation prior over the whole trajectory.
- Frame sampling around 80-90% forward overlap (roughly the 2.5 s interval regime in that study) appears to be the sweet spot; denser sampling adds compute but little accuracy.

### Gaps
- Could not retrieve full text of RS 2021 video paper (no details on camera model or GCP count).
- No study found quantifying the actual latency between DJI SRT entries and frame exposure (timing offset); SRT is generally described as "synchronised" by tool vendors, not measured.

## 3. Single strip / corridor mapping and the doming (bowl) problem

### Takeaway
Near-parallel (nadir) image networks with self-calibration mis-estimate radial distortion (K1), producing a dome/bowl DEM deformation up to metres in simulation (~0.2 m in a real test). Adding 20-45° oblique images (≥10% of the block), convergent/varying headings and altitudes, or strong GNSS camera-position constraints plus a pre-calibrated camera reduce this by one to two orders of magnitude. Single strips are weakest (roll about strip axis poorly constrained); RTK camera positions + pre-calibrated camera make GCP-free corridors feasible at ~3-7 cm.

### Cited Findings
- James & Robson 2014: self-calibrating bundle adjustment on near-parallel viewing networks "will not be able to derive radial lens distortion accurately", producing systematic doming; simulations without control show "metre-magnitude" dome/arch deformation; a real self-calibrated network recovering K1 = 2.2×10⁻⁶ mm⁻² showed deformation up to ~0.2 m; adding a second set of flight lines at a different azimuth did NOT significantly reduce doming, but varying pointing direction/altitude did; practical oblique flight plans reduce DEM deformation by one to two orders of magnitude; suggested plans: 20° inclination images during banked turns (fixed-wing) or ~30° oblique images (gimballed rotor UAV); fixing K1 to a doming-free value gave an order-of-magnitude error reduction. Simulated flight: 50 m height, ~13 mm GSD. — [James & Robson 2014, ESPL (UCL)](https://discovery.ucl.ac.uk/id/eprint/1443475/1/esp3609.pdf)
- Recommendation: oblique images 20-45° off-nadir amounting to at least 10% of block images to reduce doming (snippet). — [Drones 2025, 9(6), 387 "Bowl effect" strategies](https://doi.org/10.3390/drones9060387); see also [Simulation of UAV blocks, Remote Sens. 2020, 12(1), 22](https://www.doi.org/10.3390/rs12010022) and [UAV Block Geometry Design and Camera Calibration (PMC8473092)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8473092/)
- Flight design with all images oriented towards the centre of the area reduces dome errors. — [Reducing systematic dome errors through better UAV flight design (ResearchGate)](https://www.researchgate.net/publication/340701608_Reducing_systematic_dome_errors_in_digital_elevation_models_through_better_UAV_flight_design)
- Corridor 1200 × 180 m with pre-calibrated camera, GNSS-assisted integrated sensor orientation, NO GCPs: accuracy 5.9 cm (X), 3.3 cm (Y), 7.0 cm (Z) (snippet). — [GNSS-Assisted ISO with Sensor Pre-Calibration for Corridor Mapping, Sensors 2018 (PMC6163762)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6163762/)
- Single strip ~700 m at 30 m AGL (multicopter, consumer GNSS) referenced to cm-level by joint adjustment with an RTK fixed-wing block at 100 m; without GCP, precision transfers to horizontal coordinates and, with a pre-calibrated camera, also to heights (snippet). — [Indirect UAV Strip Georeferencing, Remote Sens. 2019, 11(15), 1765](https://doi.org/10.3390/rs11151765)
- Gerke & Przybilla: RTK reduces block deformation; cross-flight patterns help self-calibration in flat terrain. — [Univ. Twente](https://research.utwente.nl/en/publications/accuracy-analysis-of-photogrammetric-uav-image-blocks-influence-o/)

### Inferences
- A single-pass nadir video strip is the worst case for doming AND for roll-about-track instability. Mitigations for a single pass: (a) fly with gimbal tilted (e.g., 20-30° forward-oblique) or vary tilt/altitude along the pass; (b) pre-calibrate intrinsics (lab/checkerboard or a prior convergent flight) and fix or tightly constrain K1-K3; (c) use GNSS camera-position constraints (even consumer GNSS helps bend-control over long strips, RTK much more); (d) add at least one checkpoint/GCP off the strip centerline.
- Crossing the strip with a second azimuth alone is not enough (James & Robson) — geometry diversity (tilt/altitude) matters more.

### Gaps
- Could not access full text of Drones 2025 bowl paper or Sensors 2018 corridor paper (CAPTCHA/403) to verify self-calibrated vs pre-calibrated corridor numbers.
- No numbers found for power-line single-strip corridors with consumer GNSS only.

## 4. Methods: GNSS-aided BA, lever arm/boresight, similarity alignment, factor-graph fusion, time sync, rolling shutter, scale from video + noisy GPS

### Takeaway
Standard approach: run SfM/SLAM, then either (a) similarity (7-DoF Helmert/Umeyama) align the reconstructed camera centres to GNSS positions, or (b) include GNSS positions as weighted camera-centre observations in the bundle adjustment (with lever arm, time offset and optionally per-flight bias as unknowns), or (c) tightly couple GNSS (positions or raw pseudoranges) with visual-inertial factors in a factor graph (GVINS, VINS-Fusion GPS). Rolling-shutter modelling is essential for consumer drones at speed; ms-level time sync is required for cm-level direct georeferencing.

### Cited Findings
- Similarity alignment: Umeyama's algorithm is used to scale/align monocular trajectories to GPS; GPS–VIO fusion typically initialises the transformation with Umeyama. Monocular SLAM on high-altitude nadir UAV footage suffers from weak geometry and perceptual aliasing. — [Tightly coupled GPS-visual-inertial (arXiv 2203.02677)](https://arxiv.org/pdf/2203.02677); [Evaluation of Monocular SLAM on High-Altitude Nadir UAV (arXiv 2608.18632)](https://arxiv.org/html/2608.18632); [Multi-sensor Fusion SLAM from the Nadir View, ISPRS Annals 2025](https://isprs-annals.copernicus.org/articles/X-2-W2-2025/109/2025/isprs-annals-X-2-W2-2025-109-2025.pdf)
- GVINS (Cao et al., IEEE T-RO): tightly fuses raw GNSS pseudorange/Doppler with visual and inertial in nonlinear optimisation (factor graph); drift-free global estimates, handles GNSS outages. — [arXiv 2103.07899](https://arxiv.org/pdf/2103.07899); [IEEE Xplore](https://ieeexplore.ieee.org/document/9667780/). Reported vehicle results: ~4.5 m mean ATE RMSE over 23 km (secondary summary, not verified in primary). — [emergentmind GVINS summary](https://www.emergentmind.com/topics/gvins)
- Embedded GNSS-visual-inertial system (NAVIGATION journal): 3D RMS positioning error reduced from 8.455 m to 5.751 m on urban roads; drift 1.58‰ of distance with no satellites. — [NAVIGATION (ION) 70(4) navi.607](https://navi.ion.org/content/70/4/navi.607)
- OKVIS2-X (2025) adds GNSS to keyframe VI-SLAM. — [arXiv 2510.04612](https://arxiv.org/pdf/2510.04612)
- Time sync: exposure-to-GNSS timestamp delay is a known georeferencing error; for ~2 cm carrier-phase noise, synchronisation better than 1 ms is needed at 10-30 m/s ground speed; uncertainty of a few ms produces significant image position error (snippet, likely Rehak & Skaloud). — [Time synchronization of consumer cameras on MAVs (ResearchGate)](https://www.researchgate.net/publication/311555608_Time_synchronization_of_consumer_cameras_on_Micro_Aerial_Vehicles); [Quality assessment of combined IMU/GNSS for DG, ISPRS Archives 2017](https://isprs-archives.copernicus.org/articles/XLII-2-W6/355/2017/)
- Lever arm: GNSS-antenna-to-camera offset must be applied per image because aircraft/gimbal attitude changes; Zhang et al. used 22.5 cm antenna height offset. — [Geo-spatial Inf. Sci. 2020 RTK UAV](https://www.tandfonline.com/doi/full/10.1080/10095020.2019.1710437); [Zhang et al. 2019](https://esurf.copernicus.org/preprints/esurf-2019-2/esurf-2019-2.pdf)
- DJI TimeSync "continually align[s] the flight controller, camera, and RTK module" and fixes positioning data to the centre of the CMOS sensor (vendor claim; no timing figure given in the whitepaper). — [DJI P4 RTK whitepaper](https://docs.djicdn.com/DJI+Enterprise/measurement-accuracy-dji-phantom-4-rtk-whitepaper-f[1].pdf)
- Rolling shutter (Vautherin et al. 2016, Pix4D): Phantom 2 Vision+ readout ≈74 ms (DJI confirmed 73 ms), Inspire 1 ≈30 ms (DJI 33 ms); at 8 m/s and 70 m AGL, Phantom 2 image displacement ≈10 px, Inspire 1 ≈4 px; the RS model gives significant checkpoint accuracy improvement at 8 m/s, removes systematic reprojection error; global shutter (eBee) still superior; drone velocity can be estimated from the RS effect alone. — [Vautherin et al. 2016, ISPRS Annals III-3](https://isprs-annals.copernicus.org/articles/III-3/139/2016/isprs-annals-III-3-139-2016.pdf)
- Other reported RS gains: planimetric 3.89 -> 2.9 cm at 8 m/s and 4.92 -> 3.2 cm at 12 m/s; 3D accuracy improved 30-60% in block and 15-25% in corridor configuration (snippets; sources not individually verified). — [Rolling Shutter Effect on Accuracy, low-cost UAV (ResearchGate)](https://www.researchgate.net/publication/357058859_Rolling_Shutter_Effect_on_the_Accuracy_of_Photogrammetric_Product_Produced_by_Low-Cost_UAV); [Two-step RS correction, ISPRS J. 2020](https://www.sciencedirect.com/science/article/abs/pii/S0924271619302849)
- RS models are integrated in Pix4Dmapper and Agisoft Metashape. — [GAEE 2024 article](https://www.gaee.agh.edu.pl/gaee/article/view/452)

### Inferences
- Scale from video + noisy GPS: with a 7-DoF Umeyama fit over N camera centres with independent GNSS noise σ, translation error ≈ σ/√N and scale error ≈ σ/(L·√N) roughly (L = trajectory extent); so a 300 m trajectory with σ = 2 m and ~100 independent fixes gives scale error on the order of 0.1% — consistent with DJI whitepaper 0.1-0.3% distance agreement. Caveat: consumer GNSS errors are temporally correlated (multipath, ionosphere), so effective N is much smaller than frame count; subsample to ~1 Hz and use robust (Huber/RANSAC) fitting. This is a derived estimate, not a sourced figure.
- For a single straight strip, Umeyama cannot resolve rotation about the strip axis (collinear GNSS positions) — need IMU gravity/gimbal attitude, a curved trajectory, or altitude variation.
- Recommended pipeline for single-pass video: extract frames + SRT telemetry -> estimate/compensate time offset (cross-correlate SfM-derived and GNSS velocity) -> SfM/BA with RS model and pre-calibrated intrinsics -> GNSS-aided BA (camera-centre priors, σ ~ receiver accuracy, lever arm) or GTSAM factor graph with IMU -> report checkpoint RMSE.

### Gaps
- No primary number found for how long a trajectory is needed for a given scale accuracy with consumer GNSS.
- No peer-reviewed measurement of DJI SRT timing latency found.

## 5. Accuracy standards (ASPRS 2023) and how an evaluator would measure accuracy

### Takeaway
ASPRS Positional Accuracy Standards Edition 2 (2023) uses RMSE only (RMSE_H radial horizontal, RMSE_V vertical), requires ≥30 checkpoints, checkpoints at least 2× more accurate than the product, and folds checkpoint survey error into the reported accuracy. Military/government evaluators (e.g., NTRO-type) typically quote CE90/LE90, obtained from RMSE via NSSDA factors.

### Cited Findings
- Edition 2: RMSE is sole metric; 95% confidence references removed ("no need for a second accuracy derived from the first"); min checkpoints increased 20 -> 30, max 120 for >10,000 km²; checkpoints must be twice as accurate as the product (relaxed from 3-4×); checkpoint uncertainty incorporated into final product accuracy; RMSE_H = combined radial horizontal error; accuracy classes independent of map scale/GSD. — [LIDAR Magazine, ASPRS Ed. 2](https://lidarmag.com/2023/10/06/the-asprs-positional-accuracy-standards-edition-2/amp/)
- VVA pass/fail removed; if tested, ≥30 VVA checkpoints. — [GPS World](https://www.gpsworld.com/asprs-approves-edition-2-of-the-asprs-positional-accuracy-standards-for-digital-geospatial-data/); [ASPRS Ed.2 main body PDF](https://aagsmo.org/wp-content/uploads/2023/03/ASPRS_PosAcc_Edition2_MainBody.pdf)
- CE90 ≈ 2.1460 × RMSE (per-axis, circular case, valid when RMSE_x/RMSE_y ratio ≥ 0.6); LE90 = 1.6449 × RMSE_Z (NSSDA/ASPRS factors). — [uw-cryo/groundcontrol PR #30](https://github.com/uw-cryo/groundcontrol/pull/30); [Maxar/DigitalGlobe accuracy whitepaper](https://dg-cms-uploads-production.s3.amazonaws.com/uploads/document/file/38/DG_ACCURACY_WP_V3.pdf)

### Inferences
- Evaluation protocol an evaluator would likely use: independent, well-distributed checkpoints (≥30 per ASPRS; not used in processing) surveyed by RTK/total station; compute RMSE_X, RMSE_Y, RMSE_H = √(RMSE_X²+RMSE_Y²), RMSE_Z, mean error (bias) and SD; convert CE90 = 1.5175 × RMSE_H (equivalently 2.146 × per-axis RMSE) and LE90 = 1.6449 × RMSE_Z; plus relative accuracy via measured distances/areas/volumes vs tape/total-station ground truth.
- Example conversion: RTK no-GCP (XY 2.4 cm, Z 2.2 cm per Zhang) -> CE90 ≈ 3.6 cm, LE90 ≈ 3.6 cm; consumer GNSS (XY 2.29 m, Z 3.93 m) -> CE90 ≈ 3.5 m, LE90 ≈ 6.5 m (derived).

### Gaps
- Did not find any public NTRO/Indian-government UAV accuracy evaluation protocol; Indian standards (e.g., Survey of India / SVAMITVA specs) not researched in this pass.
