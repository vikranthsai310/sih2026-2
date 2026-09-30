# Commercial and Defense Products for Rapid / Single-Pass / Video-Based Drone 3D Reconstruction (as of 2026-09-30)

Scope note: about 20 search/fetch calls. Vendor claims are marked as vendor claims. Where a claim comes from a competitor or reseller, that is noted. Many requested vendors (Anduril, Shield AI, Palantir, Red Cat/Teal, Elbit, Rafael, Percepto, Cesium, Hivemapper, Nira, Luma, Polycam, RealityScan, L3Harris, Leidos, Pixel Factory, CORE3D) were not researched in depth; they are listed under Gaps.

## 1. DJI: Terra real-time reconstruction, Smart 3D Capture, FlightHub 2 rapid modelling

### Takeaway
DJI has three real-time or near-real-time 3D paths: Terra real-time mapping, which DJI itself calls "low accuracy" and which needs a follow-up full reconstruction for accuracy; Smart 3D Capture on the Matrice 4E, which builds a rough model on the controller; and FlightHub 2 rapid modelling, which turns up to 500 streamed thumbnails into a 3D model in about 5 minutes. None of these take video as input; all use stills or thumbnails. The survey-grade numbers (3D model within 4 cm, no GCPs) apply only to RTK-FIX, full-resolution, post-processed image blocks.

### Cited Findings
- **Terra real-time 3D, supported aircraft:** Terra real-time 3D mapping is documented for the Phantom 4 RTK (with its remote controller), Phantom 4 Pro V2.0 and Phantom 4 Pro+ V2.0. DJI warns that "models may be of poor quality or be unavailable in environments without RTK signals." — [DJI Terra FAQ](https://enterprise.dji.com/dji-terra/faq)
- **Terra real-time 3D, accuracy:** DJI describes in-mission real-time 3D mapping as "of low accuracy." For high accuracy, the original images must be imported into Terra after the mission and reconstructed again. — [DJI Terra FAQ](https://enterprise.dji.com/dji-terra/faq); [DJI Terra v4.0 manual](https://dl.djicdn.com/downloads/dji-terra/20240118/DJI_Terra_User_Manual_v4.0__EN.pdf)
- **Terra accuracy with RTK and no GCPs:** Flying a Phantom 4 RTK at 100 m, DJI states 2–5 cm absolute horizontal accuracy for the 2D map and "within 4 cm" absolute accuracy for 3D models. DJI's general rule is that accuracy is "around 1 to 2 times the GSD." — [DJI Terra FAQ](https://enterprise.dji.com/dji-terra/faq)
- **Terra RTK-FIX formula without GCPs (oblique images):** Horizontal = 1 cm + 1–2× GSD; Vertical = 2 cm + 1.5–3× GSD. This comes from a search-result summary of DJI Terra documentation, and I did not verify the exact page. — [DJI Terra support/manual](https://dl.djicdn.com/downloads/dji-terra/20241024/DJI_Terra_User_Manual_v4.3_EN.pdf)
- **Terra factors affecting accuracy:** DJI lists camera distortion, image quality, flight height, overlap, GPS/RTK accuracy and scene texture. — [DJI Terra v4.3 manual](https://dl.djicdn.com/downloads/dji-terra/20241024/DJI_Terra_User_Manual_v4.3_EN.pdf)
- **Terra update claim:** A Terra update states optimized accuracy for RTK-enabled real-time reconstruction and about 20% faster real-time 3D processing. — [DJI Enterprise blog: Terra updates](https://enterprise-insights.dji.com/blog/dji-terra-updates-faster-data-processing)
- **Terra hardware:** Minimum is 32 GB RAM and a 4 GB NVIDIA GPU (Shader Model 6.1+). Recommended is 64 GB+ RAM and an RTX 2070 or better. High:medium:low resolution processing times are in a ratio of about 16:4:1. Gaussian-splat block reconstruction typically takes "under 40 minutes." — [DJI Terra FAQ](https://enterprise.dji.com/dji-terra/faq)
- **Terra and video:** The Terra FAQ does not mention video input. — [DJI Terra FAQ](https://enterprise.dji.com/dji-terra/faq)
- **Matrice 4E Smart 3D Capture:** It uses the built-in Terra reconstruction engine. The DJI RC Plus 2 Enterprise controller generates a rough model, then generates a close-to-surface mapping route from it. — [DJI Enterprise: Top features of Matrice 4 series](https://enterprise-insights.dji.com/blog/top-features-of-the-matrice-4-series)
- **Matrice 4E distortion correction:** "Distortion Correction 2.0" leaves residual distortion under 2 px. — [DJI Enterprise: Matrice 4 features](https://enterprise-insights.dji.com/blog/top-features-of-the-matrice-4-series)
- **Terra and Matrice 4E accuracy:** Terra uses a "Focus Accuracy Compensation" method for Matrice 4E data to protect aerotriangulation and model accuracy. — [DJI Terra V4.4 (March 2025)](https://enterprise-insights.dji.com/blog/new-terra-update-march-2025)
- **FlightHub 2 rapid modelling (update of 13 Feb 2026):**
  - Drones stream thumbnails during the mission, and modelling starts automatically when transmission completes.
  - Up to 500 thumbnails are reconstructed into a 3D model in about 5 minutes.
  - Output can be 3D Gaussian Splatting or a photogrammetry model.
  - Only manually piloted drones are supported; DJI Dock is not.
  - Zenmuse L3 point clouds shown in FlightHub are downsampled previews.
  - [DJI Enterprise blog: FlightHub 2 update](https://enterprise-insights.dji.com/blog/blog/dji-flighthub-2-new-version-zenmuse-l3-2026)
- **FlightHub 2 accuracy:** No accuracy figure is published for rapid modelling. — [same](https://enterprise-insights.dji.com/blog/blog/dji-flighthub-2-new-version-zenmuse-l3-2026)

### Inferences
- DJI's "real-time" outputs are previews built from thumbnails or low-resolution data. Metric accuracy depends on RTK-FIX plus full reconstruction from overlapping stills, usually with oblique or multi-pass capture.
- A single-pass video workflow would fall outside DJI's documented accuracy envelope.
- The ~4 cm figure is the reference benchmark for "RTK, no GCP, full pipeline."

### Gaps
- I found no published accuracy for FlightHub 2 rapid models, Smart 3D Capture rough models, or Terra real-time 3D on current aircraft (M3E, M4E, M400).
- I did not verify SmartOblique details or a Terra 5.x release.
- I found no evidence that DJI accepts video input anywhere in its pipeline.

## 2. Pix4D: Pix4Dreact, Pix4Dmatic, Pix4Dmapper and Pix4Dcloud video handling

### Takeaway
Pix4D's rapid product, Pix4Dreact, is 2D only and takes still images. The only Pix4D product documented as taking video is the legacy PIX4Dmapper (.avi/.mp4, with degraded EXIF and camera handling). PIX4Dmatic's lack of video import appears as a user feature request.

### Cited Findings
- **Pix4Dreact:** Fast desktop software that turns drone RGB images into 2D orthomosaics "within minutes." It works offline and targets public safety and disaster response. — [Pix4D product page](https://www.pix4d.com/product/pix4dreact)
- **Pix4Dreact inputs:** RGB images (.jpg, .tif) and thermal R-JPEG. — [Pix4Dreact FAQ](https://support.pix4d.com/hc/en-us/articles/360033543611)
- **Pix4Dreact and video:** It "does not accept video input" and still requires a photo-based grid flight. This claim comes from SkyeBrowse, a competitor, so it is biased, but it is consistent with Pix4D's listed inputs. — [SkyeBrowse Pix4D review](https://www.skyebrowse.com/news/posts/pix4d-review)
- **PIX4Dmapper video:** It processes .avi and .mp4 by extracting frames. EXIF cannot be fully extracted, so the camera model is not auto-selected and default parameters load. — [Pix4D support: How to use videos for processing](https://support.pix4d.com/hc/en-us/articles/205294735) (page redirect-looped on fetch; content from search snippet)
- **PIX4Dmatic video:** Community feature request "Importing photos extracted from video" suggests PIX4Dmatic had no native video import at the time of the request. — [Pix4D community](https://community.pix4d.com/t/importing-photos-extracted-from-video/25262)
- **Esri and Pix4D:** They launched a real-time terrestrial (ground/handheld) mapping workflow using PIX4Dcatch, not aerial single-pass. — [Esri newsroom](https://www.esri.com/about/newsroom/announcements/esri-and-pix4d-launch-real-time-terrestrial-mapping-workflow)

### Inferences
- Pix4D has no aerial single-pass-video-to-metric-3D product. Rapid output (React) is 2D orthomosaic from gridded stills.

### Gaps
- I did not verify PIX4Dcatch RTK accuracy numbers or current Pix4Dcloud video support.

## 3. Skydio: 3D Scan, Onboard Modeling, X10 / X10D

### Takeaway
Skydio X10 builds textured meshes and 2D maps on the controller from HD thumbnails within minutes after the flight. Skydio positions this for coverage and quality checks, not as a metric deliverable. Full-resolution data is exported to third-party photogrammetry tools.

### Cited Findings
- **How Onboard Modeling works:** It uses thumbnails from a 3D Scan mission to compute a textured 3D mesh or 2D map preview on the X10 controller, "within minutes after the flight." It also produces a coverage heatmap for recapture decisions. Blog dated 16 Dec 2025. — [Skydio blog](https://www.skydio.com/blog/skydio-x10-revolutionizing-3d-scanning-with-onboard-modeling)
- **Inputs, rate and outputs:** It uses HD thumbnails (1920×1440) and processes about 30 images per minute. Outputs are an Onboard Model (.glTF) and, for Map/Surface Capture, an orthorectified Onboard Map (.tiff). — [Skydio support: Onboard Maps and Models](https://support.skydio.com/hc/en-us/articles/20938651178907-How-to-create-Onboard-Maps-and-Models-with-Skydio-X10)
- **Export:** Full data exports to Pix4D, Bentley iTwin Capture, gNext, DroneDeploy and Esri Site Scan. — [Skydio X10 page](https://www.skydio.com/x10)
- **What the blog leaves out:** It gives no accuracy specification and does not discuss GPS-denied accuracy. — [Skydio blog](https://www.skydio.com/blog/skydio-x10-revolutionizing-3d-scanning-with-onboard-modeling)

### Inferences
- At about 30 images per minute, a 500-image scan takes roughly 17 minutes on the controller. It is a preview-grade, near-real-time product.
- The X10D defense variant likely shares this capability, but I did not verify that.

### Gaps
- I found no X10D-specific reconstruction or accuracy data, and no absolute-accuracy figures for Onboard Models.

## 4. Video-native photogrammetry: SkyeBrowse, Agisoft Metashape, Bentley iTwin Capture, Esri

### Takeaway
SkyeBrowse is the clearest commercial "single continuous drone video to 3D model" product. Its typical capture is a roughly 2-minute orbit, processing takes minutes, and it claims sub-inch accuracy without GCPs. The accuracy claims are vendor marketing, and "accuracy" is probably relative (measurement) accuracy, not absolute georeferencing. Metashape and iTwin Capture accept video but treat it as frame extraction feeding a standard SfM pipeline.

### Cited Findings
- **SkyeBrowse workflow (platform overhaul reported 17–18 Sep 2026):**
  - Processes "single, continuous video files" instead of hundreds of photos.
  - Drone capture is a two-minute orbit, and model creation takes "a few minutes."
  - Inputs include drone, phone, body-cam and Insta360 video; non-drone sources are about 33% of models.
  - Rapid Upload compresses a typical ~1 GB 4K two-minute video "nearly 10x."
  - [The Drone Girl, 2026-09-18](https://www.thedronegirl.com/2026/09/18/skyebrowse/)
- **SkyeBrowse accuracy by tier (2026):** Commercial/Pro 0.5 in; Public Safety & Enterprise 0.1 in with "16K Ultra" processing. — [The Drone Girl](https://www.thedronegirl.com/2026/09/18/skyebrowse/)
- **SkyeBrowse accuracy, older tier wording:** Lite about 2–6 in, Premium (8K) about 0.25 in, Premium Advanced (16K, AI moving-object removal) about 0.1 in. The claims are "without ground control points" and "court-admissible." — [SkyeBrowse site](https://www.skyebrowse.com/); [SkyeBrowse about](https://www.skyebrowse.com/about)
- **SkyeBrowse pricing (2026):**
  - Commercial: $24.99/model (monthly) or $19.99 (annual)
  - Pro: $49.99 or $39.99
  - Public Safety/Enterprise: $199/model/yr
  - [The Drone Girl](https://www.thedronegirl.com/2026/09/18/skyebrowse/)
- **SkyeBrowse history:** Covered in 2021 as converting DJI drone video to 3D models. — [DroneDJ 2021](https://dronedj.com/2021/06/15/skyebrowse-3d-models-drone-videos/)
- **Agisoft Metashape video import:**
  - File > Import Video extracts frames at a user-set rate and start/end range, and adds them to the chunk.
  - Users report that a DJI .SRT file in the same folder (with location and gimbal orientation) is used for geotags.
  - [Metashape Pro manual 1.6](https://www.agisoft.com/pdf/metashape-pro_1_6_en.pdf); [Agisoft forum: drone location metadata](https://www.agisoft.com/forum/index.php?topic=15164.0); [Agisoft forum tutorial: drone video to georeferenced 3D](https://www.agisoft.com/forum/index.php?topic=4967.0)
- **Bentley iTwin Capture:** Supports importing RGB, thermal and video files. It produces reality meshes and Gaussian splats, and uses GCPs for precision. The video claim comes from a third-party (Wingtra) overview. — [Wingtra: Bentley iTwin Capture](https://wingtra.com/best-photogrammetry-software/bentley-contextcapture/); [Bentley iTwin Capture Engine](https://www.bentley.com/en/products/itwin-capture-engine/)
- **Esri Site Scan for ArcGIS:** Cloud-based, end-to-end drone mapping in the ArcGIS Reality suite. It uses repeatable flight plans and cloud processing for 2D/3D products. — [Esri Site Scan](https://www.esri.com/en-us/arcgis/products/arcgis-reality/products/site-scan-for-arcgis); [Esri 2025 wrap-up](https://www.esri.com/arcgis-blog/products/site-scan/imagery/2025-wrap-up-elevating-reality-mapping-with-site-scan-for-arcgis)
- **ArcGIS Reality launch:** Launched 7 Feb 2023 on the ArcGIS Reality Engine for site-, city- and country-wide mapping. — [ENR](https://www.enr.com/articles/55895-esri-launches-arcgis-reality-suite-to-get-reality-capture-data-into-gis)

### Inferences
- SkyeBrowse is the closest commercial analogue to a "single-pass video to 3D" product. Its claims have no public independent absolute-accuracy validation, and "without GCPs" suggests absolute georeferencing relies on drone GNSS.
- The general-purpose SfM tools (Metashape, iTwin, PIX4Dmapper) handle video only as frame extraction. Georeferencing comes from SRT/telemetry or GCPs, and rolling shutter or motion blur hurts accuracy.

### Gaps
- I found no independent study of SkyeBrowse accuracy; the "validated in studies" claim is from the vendor.
- I did not confirm a "live mapping" feature in Site Scan Flight.
- I did not research RealityCapture/RealityScan video import.

## 5. Defense and intelligence: real-time FMV georegistration and rapid 3D terrain

### Takeaway
In defense, the main "real-time drone video" capability is georegistration of FMV against prebuilt 3D or satellite reference data, not generating new 3D from video:
- Vantor (Maxar) Raptor Sync/Ace: under 3 m ground-coordinate accuracy.
- Raptor Guide: under 10 m RMSE positioning.
- Edgybees: about 1–2 m.

Rapid tactical 3D generation from sUAS imagery exists in the Army's One World Terrain / RAPTRS workflow (about 3 hours per km²). IARPA WRIVA targets 3D site models from very sparse imagery, including UAV imagery.

### Cited Findings
- **Raptor components (Vantor, formerly Maxar Intelligence):**
  - Guide: vision-based drone positioning, "<10 m RMSE in all dimensions," 1–5 Hz update, runs on the drone with commodity cameras.
  - Sync: real-time georegistration of drone FMV to Vantor's encrypted 3D terrain, "<3 m" absolute coordinate accuracy.
  - Ace: laptop software, EO/IR FMV, off-nadir cameras, flights down to 100 m, "<3 m" target coordinate accuracy.
  - Reference data: Vivid Terrain (3 m-accurate) and WorldView 3D Rapid.
  - It uses existing 3D data and does not generate 3D from video.
  - [Vantor Raptor product page](https://vantor.com/product/mission-solutions/raptor)
- **Raptor debut and coverage:** Debuted in March 2025. It uses a 3D terrain base covering more than 90 million km². — [Via Satellite, 2025-03-25](https://www.satellitetoday.com/imagery-and-sensing/2025/03/25/maxar-debuts-raptor-software-that-uses-3d-data-for-drone-positioning/); [GIS Resources](https://gisresources.com/maxars-raptor-software-sets-new-standard-for-gps-denied-drone-navigation/)
- **Raptor demonstration:** Vantor showed Raptor live at the World Defense Show in Saudi Arabia (2026). — [Vantor on X](https://x.com/vantortech/status/2039679286689288524)
- **Edgybees, what it does:** Software-only CV/ML platform for real-time georegistration and AR overlay of aerial video. It matches video to satellite reference imagery with "near-zero latency." Series A of $9.5M on 17 Feb 2021, led by Seraphim; HQ Gaithersburg, MD. The press release does not mention 3D model generation. — [PR Newswire 2021-02-17](https://www.prnewswire.com/news-releases/edgybees-closes-9-5m-in-series-a-funding-delivers-breakthrough-geo-mapping-accuracy-and-speed-for-lifesaving-aerial-video-301229909.html)
- **Edgybees accuracy:** Georegisters imagery "in seconds," improving spatial accuracy "to within 1–2 meters." — [BAE GXP third-party solutions page](https://www.geospatialexploitationproducts.com/third-party-solutions/edgybees/)
- **Edgybees integrations:** Integrated with Hood Tech sensors for aerial video. — [PR Newswire](https://www.prnewswire.com/news-releases/aerial-video-takes-a-big-leap-towards-real-time-situation-awareness-powered-by-edgybees-geo-registration-software-and-hoodtechs-sensors-301263850.html)
- **BAE SOCET GXP / GXP InMotion:** SOCET GXP does photogrammetric terrain, DSM and point-cloud creation from imagery. GXP InMotion analyzes FMV, motion imagery, MTI and tracks. I found no public statement of a "video-to-3D" point-cloud function. — [SOCET GXP](https://www.geospatialexploitationproducts.com/content/socet-gxp/); [SOCET GXP brochure 2024](https://www.geospatialexploitationproducts.com/wp-content/uploads/2024/12/SOCET-GXP-Brochure.pdf)
- **Army One World Terrain / RAPTRS:**
  - Soldiers fly an sUAS over about 1 km² and can visualize the area in 3D within about 3 hours; this once took weeks.
  - Reconstruction uses the Rapid Aerial PhoTogrammetric Reconstruction System (RAPTRS), developed at USC ICT, giving units an organic capture capability.
  - [army.mil](https://www.army.mil/article/243238/soldiers_equipped_with_game_changing_drone_technology); [USC ICT OWT sheet](https://ict.usc.edu/wp-content/uploads/2023/08/OWT-One-Sheet-Design-V1.pdf); [USC ICT news](https://ict.usc.edu/news/uarc-technology-behind-successful-transition-of-one-world-terrain-to-army-program-of-record/)
- **OWT and special operations:** Special operations reportedly used prototype OWT 3D maps on missions. — [Breaking Defense 2019](https://breakingdefense.com/2019/10/ste-army-3d-mapping-software-so-good-special-ops-uses-it-for-missions/)
- **IARPA WRIVA (Walk-through Rendering from Images of Varying Altitude):**
  - Started 2023 as a 42-month program.
  - Goal is photorealistic, navigable 3D site models from a highly limited set of ground, surveillance-height, UAV and satellite imagery.
  - Targets: fewer than 10 ground images, and camera geolocation within 5 m.
  - Performers: Accenture Federal, BlueHalo, JHU, RTX, SRI, STR.
  - [IARPA WRIVA](https://www.iarpa.gov/research-programs/wriva); [WRIVA slick sheet Feb 2026](https://www.iarpa.gov/images/OA-Slicksheets/WRIVA_SlickSheet_02202026.pdf)
- **Other IARPA work:** IARPA also funds drone-plus-ground Gaussian-splatting research, e.g. DRAGON (contract 140D0423C0076) and AerialMegaDepth. — [DRAGON arXiv](https://arxiv.org/pdf/2407.01761); [AerialMegaDepth arXiv](https://arxiv.org/pdf/2504.13157)
- **Patents:** They describe fusing structure-from-motion 3D from FMV with LiDAR point clouds through 3D-to-3D registration. — [USPTO 9761002](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9761002)

### Inferences
- The operational defense pattern is "prior 3D foundation + live FMV registration," which gives meter-level absolute accuracy without GCPs or GNSS. It does not produce a new textured model from the pass.
- A single-pass-video system could adopt the same idea: register the video-derived model to a prior DSM or orthophoto instead of using GCPs, to fix absolute georeferencing.
- Tactical 3D generation (RAPTRS) still uses dedicated photogrammetric collection and takes hours, not real time.

### Gaps
- I did not research: Anduril, Shield AI, Palantir, Red Cat/Teal, Elbit, Rafael Fire Weaver, Percepto, L3Harris, Leidos, Airbus Pixel Factory, IARPA CORE3D (satellite-focused), DARPA programs, Cesium, Hivemapper, Nira, Luma AI, Polycam, Epic RealityScan.
- I did not confirm Vantor Precision3D accuracy specifications, or whether Vantor/Vricon offers any "3D from drone video" product.
- I found no public accuracy or timing figures for OWT/RAPTRS models, and no public product that explicitly markets "FMV to 3D point cloud" with accuracy specs.
