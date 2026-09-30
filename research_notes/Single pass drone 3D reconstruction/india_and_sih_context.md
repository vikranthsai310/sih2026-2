# India & SIH Context for PS 26158 (Single-Pass Drone Video to 3D Model, NTRO, SIH 2026)

Research date: 2026-09-30. About 20 searches and fetches. The official sih.gov.in PS page was NOT fetched directly. PS text below comes from third-party mirrors and team repos, so check it against the portal.

## Q1. What does PS 26158 say, and what is the SIH 2026 timeline?

### Takeaway
SIH26158, "Single-Pass Drone Video to Accurate 3D Model Generation System", is an NTRO **Software** PS under the "Robotics and Drones" theme. It asks for a georeferenced, metric, textured 3D model built from a single monocular drone video pass plus GPS and flight metadata, without extensive GCPs. Several mirrors report two targets: under 15 min of processing for a 10-min video, and spatial accuracy of 1 m or better. SIH 2026 launched on 21 Aug 2026. Idea submissions closed around 30 Sep 2026, the finalist list is expected in Nov, and the 36-hour Grand Finale is in Dec 2026.

### Cited Findings
- Title "Single-Pass Drone Video to Accurate 3D Model Generation System". Organisation: NTRO. Theme: Robotics and Drones — [NoBugNinja SIH 2026 PS list](https://github.com/NoBugNinja/Smart-India-Hackathon-SIH-2026-Problem-Statements/blob/main/README.md)
- Category: Software. Background: accurate reconstruction today "requires multiple drone passes, extensive image overlap, specialized flight planning, and significant post-processing time". The PS wants a single-pass solution for disaster response, surveillance and reconnaissance — [zaidsayyed.in SIH26158 page](https://zaidsayyed.in/tools/sih-problem-statements/sih26158)
- Required inputs: drone video (1080p/4K), GPS coordinates and flight metadata. Optional inputs: IMU, barometric altitude, camera parameters and RTK/PPK corrections — [zaidsayyed.in](https://zaidsayyed.in/tools/sih-problem-statements/sih26158)
- Named challenges: limited viewing angles, motion blur, variable lighting, dynamic objects (vehicles, people), GPS inaccuracy, real-time processing load, reconstruction of occluded surfaces, and metric accuracy without extensive GCPs — [zaidsayyed.in](https://zaidsayyed.in/tools/sih-problem-statements/sih26158); [SIH 2026 PS search summary / Scout-3D repo](https://github.com/HoneyBadger-010/Scout-3D)
- Listed applications: border mapping, disaster assessment, urban planning, infrastructure inspection, construction monitoring, archaeology, digital twins and military reconnaissance — [zaidsayyed.in](https://zaidsayyed.in/tools/sih-problem-statements/sih26158)
- Scene content to reconstruct: terrain, buildings (facades and rooftops), roads, infrastructure, vegetation, obstacles, structures and objects. Output is a textured mesh or point cloud — [aggregated search of GitHub PS mirrors, e.g. noob-rishav repo](https://github.com/noob-rishav/SIH26158-Drone-3D-Reconstruction)
- Expected output formats reported: OBJ, PLY, LAS, GeoTIFF, GLB/glTF and FBX. Processing under 15 min for a 10-min video. Spatial accuracy of 1 m or better. Web or desktop viewer — [kartikshirode/sih26158-single-pass-3d ("inferred targets")](https://github.com/kartikshirode/sih26158-single-pass-3d); [Scout-3D](https://github.com/HoneyBadger-010/Scout-3D). The zaidsayyed.in page says the PS listing has **no explicit** accuracy or time targets. These numbers may therefore be team inferences or come from a longer PS PDF. This is a conflict to verify on sih.gov.in.
- One framing, from team mirrors: conventional photogrammetry needs 80%+ frontal and 70%+ side overlap and 45–90 min grid or crosshatch flights, plus hours of offline compute — [search result summaries of SIH 2026 PS mirrors](https://github.com/aerotwin/drone-video-to-3d)
- SIH 2026 has 226 PS in total — [blinknbuild master catalogue](https://www.blinknbuild.in/Assets/SIH_2026_All_226_Problem_Statements_Master_Catalogue.pdf)
- Timeline: launched 21 Aug 2026. College internal rounds ran through Sep. SPOC nominations and idea submission closed by 30 Sep 2026. Experts score ideas on novelty, feasibility, impact and clarity, and pick about 4–5 teams per PS. Finalists are expected in Nov. The Dec 2026 Grand Finale is a 36-hour hackathon at nodal centres — [Reskilll SIH 2026 guide](https://reskilll.com/blogs/smart-india-hackathon-2026-launched-timeline-registration-how-to-participate/); [zaidsayyed SIH 2026 playbook](https://zaidsayyed.in/blog/sih-2026). This comes from secondary blogs, not the official portal.
- Other NTRO PS in SIH 2026: SIH26142 (deep learning satellite image super-resolution) and SIH26143 (oil spill detection from satellite imagery). Related PS: SIH26177 (Qualcomm, autonomous search-and-rescue drone), SIH26126 (BEL, vision-based UGV navigation), SIH26054 (DRDO, UAV aero-engine digital twin), and SIH26166/26167 (ISRO: Chandrayaan-2 multimodal correspondence; remote-sensing VLM) — [NoBugNinja list](https://github.com/NoBugNinja/Smart-India-Hackathon-SIH-2026-Problem-Statements/blob/main/README.md)

#### Public competitor/team repos for PS 26158 (as of 2026-09-30)
- **Tesseract** ([kartikshirode/sih26158-single-pass-3d](https://github.com/kartikshirode/sih26158-single-pass-3d)): stages S0–S8. It screens out shot cuts and overlays, picks keyframes by optical flow, and estimates focal length with MapAnything. COLMAP's global mapper then solves poses with fixed intrinsics. OpenMVS handles densify, mesh and texture. The team wrote its own seam leveling. GPS alignment uses DJI SRT telemetry, focal length is corrected from gimbal pitch, and roll/pitch are fixed from gravity. It writes an "honest output" manifest that ties each accuracy claim to its evidence. Reported results: 293 s for an 18.9 s clip, 548 s for a synthetic 10-min flight, and 0.344 m median error on synthetic data.
- **Scout-3D** ([HoneyBadger-010/Scout-3D](https://github.com/HoneyBadger-010/Scout-3D)): "georeferenced, metrically accurate, textured 3D model from one single-pass drone video, no grid, no second pass, no surveyed markers, near real time".
- **noob-rishav** ([SIH26158-Drone-3D-Reconstruction](https://github.com/noob-rishav/SIH26158-Drone-3D-Reconstruction)): an end-to-end CV/photogrammetry pipeline that replaces GCPs with GPS+IMU for metric-scale georeferencing.
- Other public repos: [Trinetra-3D](https://github.com/Gambheer-Gowda/Trinetra-3D), [Aero3D](https://github.com/Jyotiraditya1006/Aero3D), [AeroSphere](https://github.com/chandana-ux/AeroSphere), [aerotwin/drone-video-to-3d](https://github.com/aerotwin/drone-video-to-3d), [pavan0010gowda](https://github.com/pavan0010gowda/SIH-2026---26158-Single-Pass-Drone-Video-to-3D-Model), [supreetborikar-build/SIH26](https://github.com/supreetborikar-build/SIH26) and [Project-GaRuDa1 frontend](https://github.com/Project-GaRuDa1/garuda-frontend-prototype).

### Inferences
- The field is crowded: at least 10 public repos exist. The common stack is COLMAP/GLOMAP + OpenMVS + GPS alignment, sometimes with a feed-forward model such as MapAnything. Differentiators are likely to be speed (GPU, keyframing), honest accuracy reporting, dynamic-object masking, and handling of DJI SRT/telemetry.
- NTRO's framing (border mapping, reconnaissance) points toward offline or on-premise, air-gapped deployment rather than cloud SaaS.

### Gaps
- The verbatim official PS text, with any dataset or evaluation rubric from sih.gov.in, was not retrieved. The accuracy and time targets conflict between sources.
- Exact Grand Finale dates and nodal centre for this PS were not found.

## Q2. Have prior SIH editions (2017–2025) had similar PS and winners?

### Takeaway
I found no earlier SIH PS that is a direct "single-pass video to 3D" analogue. The closest are the SIH 2024 Ministry of Panchayati Raj PS on SVAMITVA drone orthophotos (feature extraction and gamification) and some drone-hardware PS in SIH 2025. NTRO has sponsored SIH PS before (2024, 2025), mostly on software and AI topics.

### Cited Findings
- SIH1705 (SIH 2024, Ministry of Panchayati Raj, Robotics & Drones, software): "Development and Optimization of AI model for Feature identification/Extraction from drone orthophotos". SIH1704: "Gamification for Rural Planning using Drone land survey maps and GIS data" — [Wraient SIH-2024-Problems / search summary](https://github.com/Wraient/SIH-2024-Problems); [SIH 2024 PS PDF](https://www.driems.ac.in/wp-content/uploads/2024/08/SIH_2024_PS.pdf)
- An SIH 2024 team repo, "Drone Orthophoto Generation System", uses Python, OpenCV feature matching and stitching, and GDAL orthorectification. It publishes no metrics — [npmkrish/droneorthophotos](https://github.com/npmkrish/droneorthophotos)
- SIH 2025 hardware PS SIH250470: "Disaster Response Drone for Remote Areas" — [Scribd SIH 2025 analysis (search summary)](https://www.scribd.com/document/931632260/Smart-India-Hackathon-2025-Comprehensive-Analysis)
- NTRO provided PS to SIH 2024, and one SIH 2025 NTRO PS was an offline multimodal RAG task ("NeuraX" team) — [search summary; PIB SIH 2024 doc](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/dec/doc20241211470201.pdf)
- Post-SIH 2024 adoption: ISRO accepted 4 solutions, including a video geotagging application and a blockchain store for large geospatial datasets. DRDO accepted 1 (gesture commands) — [PIB SIH 2024 document](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2024/dec/doc20241211470201.pdf)
- A Kaggle dataset collects SIH 2024 PS with their winning teams and solutions, useful for mining earlier winners — [Kaggle](https://www.kaggle.com/datasets/adharshinikumar/sih-2024-ps-with-winning-teams-and-solutions/data)
- ISRO SAC/VEDAS hosted SIH 2024 geospatial PS — [VEDAS SIH 2024](https://vedas.sac.gov.in/en/sih2024.html)

### Inferences
- Government adoption after SIH tends to favour practical, deployable geospatial tools (ISRO's video geotagging, for example). A deployable, offline, well-documented pipeline fits this pattern.

### Gaps
- I found no SIH winner write-ups (Medium or LinkedIn) specifically on drone 3D reconstruction or DEM generation. No SIH 2017–2023 PS on photogrammetry or point clouds was found, which does not mean none existed.

## Q3. What Indian government, defence and industry work exists on drone 3D mapping, and what is NTRO?

### Takeaway
India's flagship operational drone mapping is Survey of India's SVAMITVA: about 3.3 lakh villages flown, 1:500 scale, about 5 cm accuracy using the CORS network. It is now extending to urban NAKSHA and to 3D and digital-twin work. Genesys (with SoI) and startups such as ideaForge, Aereo, Skylark and Garuda provide the industry base. NTRO is the PMO/NSA-linked technical intelligence agency (IMINT/GEOINT) and operates UAVs.

### Cited Findings
**SVAMITVA / Survey of India**
- SVAMITVA was launched on 24 Apr 2020 (National Panchayat Day), with Survey of India as the technology partner — [SoI SVAMITVA page](https://surveyofindia.gov.in/pages/svamitva); [PIB 2023 backgrounder](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2023/may/doc202351190201.pdf)
- Survey-grade drones plus the CORS network give maps at 1:500 scale with ±5 cm accuracy for abadi properties — [PIB backgrounder 2022](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2022/jun/doc20226862301.pdf)
- Framework specification: RTK/PPK-enabled drones with an RGB sensor, better than 5 cm GSD, and ±12.5 cm or better planimetric accuracy — [SVAMITVA Framework 2021–25](https://svamitva.nic.in/DownloadPDF/Svamitva_Scheme_Framework(2021-2025).pdf)
- Workflow: drone survey, then orthophotos and DSMs, then feature extraction (building footprints, roads, boundaries) into GIS layers. SVAMITVA "opened the doors" to 3D mapping with oblique and LiDAR cameras, and states now want city digital twins — [Esri India blog](https://www.esri.in/en-in/newsroom/blog/gis-drone-mapping-in-svamitva-scheme-land-records)
- Progress: about 3.30 lakh village abadis flown out of a 3.38 lakh target, and about 3.19 crore property cards across 1.94 lakh villages (as of 15 Jun 2026) — [ETV Bharat](https://www.etvbharat.com/en/bharat/over-3-crore-property-cards-prepared-for-rural-households-under-svamitva-scheme-enn26061905782); another source gives 3,29,161 villages flown and 26.3 M cards as of late Mar 2026 — [Frontiers 2026](https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2026.1874630/full)
- NAKSHA (urban) pilot, DoLR, launched Feb 2025: SoI is the technical partner, using UAV photogrammetry at about 5 cm GSD with a GNSS/CORS network — [Frontiers 2026](https://www.frontiersin.org/journals/sustainable-cities/articles/10.3389/frsc.2026.1874630/full)
- Garuda Aerospace mapped 7,000 villages in 1 year for SoI under SVAMITVA — [DroneLife 2022](https://dronelife.com/2022/09/16/the-survey-of-india-garuda-aerospace-maps-7000-villages-by-drone-in-1-year/)

**Industry**
- Genesys International has a strategic partnership with SoI and aims to build a digital twin of urban India. Its methods are aerial LiDAR, oblique imagery, mobile LiDAR and 360° imagery, producing 1:500 2D/3D base maps and a 3D reality mesh. Projects: Varanasi (160 km², SKOCH Gold 2025), Mumbai 3D city model, and Ahmedabad (₹283 cr) — [GIM International](https://www.gim-international.com/content/news/genesys-and-survey-of-india-enter-partnership-to-transform-india-s-geospatial-landscape); [GIM Varanasi](https://www.gim-international.com/content/news/varanasi-smart-city-3d-digital-twin-project-wins-indian-urban-development-award); [CXO Digital Pulse](https://www.cxodigitalpulse.com/genesys-wins-%E2%82%B9283-crore-contract-for-ahmedabads-3d-digital-twin/)
- ideaForge: the Q6 V2 GEO received DGCA type certification for survey and mapping, with payloads for LiDAR, LiDAR+RGB, photogrammetry, 3D oblique, and day/night. FLYGHT CLOUD produces orthomosaics, point clouds and 3D terrain. The Army ordered hybrid Mini UAVs (SWITCH family) worth about ₹137 cr in May 2025, after Operation Sindoor — [Business Standard](https://www.business-standard.com/technology/tech-news/ideaforge-technology-launches-q6v2-geo-drone-for-advanced-mapping-uses-125082001442_1.html); [Wikipedia ideaForge](https://en.wikipedia.org/wiki/IdeaForge_Technology)
- Skylark Labs and ideaForge signed a $35 M, 5-year AI software licence for on-drone intelligence (defence and public safety) — [TechPlugged](https://techplugged.com/skylark-labs-ideaforge-ai-drone-ecosystem/)
- Skylark Drones Spectra: a cloud platform for orthomosaics, 3D point clouds and 2D/3D worksite twins (mining, solar) — [Skylark Spectra](https://skylarkdrones.com/spectra)
- Aereo (formerly Aarav Unmanned Systems) was founded in 2013 at IIT Kanpur. It makes 3D digital twins and 2D maps, and has mapped 34,000–45,000+ villages (sources differ) — [Crunchbase](https://www.crunchbase.com/organization/aarav-unmanned-systems); [BW Education](https://www.bweducation.com/article/aereo-sjcit-open-centre-of-excellence-for-drone-education-remote-pilot-training-472489)

**Academia**
- IIT Bombay: low-cost, high-accuracy digital twins of heritage structures from UAV and terrestrial photogrammetry — [Research Matters](https://researchmatters.in/news/mapping-indias-heritage-researchers-use-drones-and-ground-cameras-create-3d-map-structures)
- IIT Mandi: 3D reconstruction and dimension estimation of landslides with a DJI Phantom 3 — [J. Indian Soc. Remote Sens. (Springer)](https://link.springer.com/article/10.1007/s12524-017-0727-1)

**NTRO**
- NTRO is India's technical intelligence agency, set up in 2004. It sits under the PMO and reports to the NSA. Its mandate covers SIGINT, IMINT, cyber and satellite reconnaissance, including geospatial intelligence and imagery analysis. It works with DRDO, ISRO, NIC and NCIIPC — [Wikipedia NTRO](https://en.wikipedia.org/wiki/National_Technical_Research_Organisation); [IAS Gyan](https://www.iasgyan.in/daily-current-affairs/national-technical-research-organisation-ntro)
- NTRO has access to UAVs, spy planes and satellites. Drones owned or operated by NTRO, ARC and the central intelligence agencies are exempt from UIN requirements (CBIC circular, 2019) — [Raksha Anirveda](https://raksha-anirveda.com/ntro-indias-eye-in-the-sky/); [CBIC circular mirror](http://worldtradescanner.com/32-CBIC%20Circular-20.09.2019.htm)

### Inferences
- SVAMITVA shows that the Indian standard for "accurate" drone mapping is RTK/PPK with CORS at 5–12.5 cm. PS 26158's target of about 1 m or better from single-pass video is a much looser, rapid-response tier. That fits reconnaissance and disaster use rather than cadastral work.
- Industry tools (Spectra, FLYGHT CLOUD) are cloud-based and need grid flights. A fast, offline, single-pass tool fills a gap for NTRO-style users.

### Gaps
- I found no public DRDO lab (CAIR, DEAL, ADE, DTRL) publication on UAV 3D reconstruction. The search returned only generic academic papers.
- No public information on NTRO's own drone 3D mapping programmes. This is expected for an intelligence agency.
- Not researched for lack of budget: ISRO/NRSC Bhuvan 3D, NMCG 3D mapping, IIIT Hyderabad and IIT Kanpur specific papers, and the product lines of TSAW, Scandron, Asteria, NewSpace, Marut and Drone Destination.

## Q4. What India-specific constraints apply: regulation, data rules, GNSS correction?

### Takeaway
Drone flights fall under the Drone Rules 2021 and the Digital Sky airspace map (green, yellow and red zones). Geospatial data finer than 1 m horizontal or 3 m vertical must be owned by Indian entities and stored and processed in India. Accuracy without GCPs can draw on SoI's CORS (about 1,000+ stations, ±3 cm RTK/NRTK) and GAGAN SBAS (about 1.5 m horizontal). NavIC alone gives about 5–20 m.

### Cited Findings
- Drone Rules 2021: the airspace map was released on 24 Sep 2021 on DGCA Digital Sky (digitalsky.dgca.gov.in). **Green** zone: up to 400 ft (120 m), or up to 200 ft in the 8–12 km band around an airport perimeter, with no permission needed. **Yellow**: above those limits, or within the airport band, needs ATC permission. The yellow zone was cut from 45 km to 12 km. **Red**: only with Central Government permission — [PIB Drone Rules backgrounder](https://static.pib.gov.in/writereaddata/specificdocs/documents/2022/jan/doc202212810701.pdf); [Business Standard](https://www.business-standard.com/article/economy-policy/govt-releases-interactive-digital-airspace-map-for-drone-operations-121092401343_1.html); [100knots](https://www.100knots.com/indias-airspace-map-for-drone-operations-released-by-the-aviation-ministry/)
- DST Geospatial Guidelines (15 Feb 2021): the threshold is 1 m horizontal and 3 m vertical. Data finer than this can only be created or owned by Indian entities and must be stored and processed in India. Indian entities may collect data at any accuracy, subject to a negative list. Prior approval and licensing were replaced by self-certification — [DST guidelines PDF](https://dst.gov.in/sites/default/files/Final%20Approved%20Guidelines%20on%20Geospatial%20Data.pdf); [MediaNama](https://www.medianama.com/2021/02/223-foreign-mapping-india/); [SCC Online](https://www.scconline.com/blog/post/2021/03/04/india-geospatial-data-guidelines-2021/)
- The National Geospatial Policy 2022 extends this liberalisation and creates the GDPDC apex committee — [DST](https://dst.gov.in/national-geospatial-policy-2022-marked-landmark-reform-democratized-access-geospatial-data); [SoI NGP page](https://surveyofindia.gov.in/pages/national-geospatial-policy-2022)
- SoI CORS gives real-time RTK/NRTK positioning at ±3 cm — [SoI CORS portal](https://cors.surveyofindia.gov.in/introduction.html). The station count is about 1,034 (Geospatial World) or 1,105+ (RTKdata). Access is free for government and academia, while the private sector must apply — [Geospatial World](https://geospatialworld.net/blogs/india-cors-network/); [RTKdata](https://rtkdata.com/in/)
- GAGAN (GPS-aided GEO augmented navigation, AAI/ISRO): about 1.5 m horizontal and 2.5 m vertical accuracy. DGCA provisionally certified it at RNP0.1 on 30 Dec 2013 — [Wikipedia GAGAN](https://en.wikipedia.org/wiki/GPS-aided_GEO_augmented_navigation); [Inside GNSS](https://insidegnss.com/india-certifies-gagan-for-en-route-and-npa-flight-operations/)
- NavIC (IRNSS) SPS: better than 20 m by design, up to about 5 m, over India plus 1,500 km — [Wikipedia IRNSS](https://en.wikipedia.org/wiki/Indian_Regional_Navigation_Satellite_System)

### Inferences
- A system that hits 1 m or better creates data at or finer than the DST threshold. Deployment should therefore be Indian-owned and processed in India, which argues for an offline or on-prem pipeline with no foreign cloud APIs. This matches NTRO's security posture.
- Typical consumer drone GPS error is several metres. PS 26158's own "GPS inaccuracy" challenge implies that absolute accuracy of 1 m or better needs GAGAN-enabled receivers, RTK/PPK against SoI CORS (listed as an optional input in the PS), or known-object and scale constraints. Relative (internal) metric accuracy is easier to reach than absolute georeferencing. The pitch should report the two separately.
- Demo flights for SIH should stay in green zones. Border and sensitive areas, which are NTRO use cases, are often red zones, so the tool should work on pre-recorded video from authorised operators.

### Gaps
- No public figure was found for GAGAN or NavIC accuracy on small drones specifically, or for whether Indian mapping drones use GAGAN by default.
- The exact current SoI CORS station count and its private-sector access terms (in 2026) were not confirmed from the SoI site.
- The attribute negative list (sensitive locations that cannot be mapped or published) was not retrieved in detail.
