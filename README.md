# Drishti3D

**One pass. One video. A measurable 3D world.**

Drishti3D turns a **single-pass drone video + GPS + flight metadata** into a **georeferenced, metrically accurate, textured 3D model** of terrain, buildings, roads and vegetation. It is built fast, runs offline, and comes with an honest accuracy report.

> Smart India Hackathon 2026 · **PS 26158 — Single-Pass Drone Video to Accurate 3D Model Generation System** · National Technical Research Organisation (NTRO) · Software · Robotics and Drones

---

## Why

Accurate 3D mapping normally needs planned multi-pass flights, ground control points and hours of processing. In disaster response, reconnaissance, border mapping and inspection there is often **only one chance to fly**. Drishti3D is designed for that one chance.

## What makes it different

Recovering the 3D **shape** from video is largely a solved problem. **Placing that shape accurately on Earth** is still open. Consumer drone GPS leaves models about 2–4 m off, and a single straight flight line can bend them. Drishti3D treats georeferencing as the core problem:

- **Accuracy engine.** Automatic video↔GPS time sync, rolling-shutter modelling, locked lens calibration, and absolute anchoring against a reference orthophoto/DSM, RTK/PPK, Survey of India CORS, GAGAN, or a single known point.
- **Proof, not claims.** Accuracy is reported as CE90 / LE90 on independent checkpoints (ASPRS Ed. 2), with and without anchoring.
- **Honest confidence map.** Every surface is tagged as *observed* or *inferred*.
- **Mission-ready.** Fully offline, reads DJI `.SRT` and military KLV metadata, and uses only models whose licences allow this use.
- **Two-tier speed.** A live 2D preview appears within about a minute; the metric 3D model follows (target ≤ 15 min for a 10-min 4K clip).

## Pipeline

```
Video+GPS ─► S0 Ingest&Sync ─► S1 Keyframes ─► S2 Masking ─► S3 Poses(SfM) ─► S4 Georef&Anchor ⭐
          ─► S5 Dense+Mesh ─► S6 Completion ─► S7 Photoreal ─► S8 Export/3D Tiles ─► S9 QA&Confidence
          └► P Live 2D preview
```

## Outputs

Point cloud (LAS/LAZ) · textured mesh (OBJ, glTF, OGC 3D Tiles) · orthomosaic + DSM/DTM (COG GeoTIFF) · confidence map · accuracy report · CesiumJS web viewer with distance, height, area and volume tools.

## Documentation

Everything is in [`docs/`](docs/README.md). Start with the [Project Charter](docs/00-project-charter.md).

| | |
|---|---|
| Problem & solution | [01 Problem](docs/01-problem-statement.md) · [02 Solution](docs/02-solution-overview.md) |
| Engineering | [03 Requirements](docs/03-requirements.md) · [04 Architecture](docs/04-system-architecture.md) · [05 Pipeline](docs/05-pipeline-design.md) · [06 Georeferencing & Accuracy](docs/06-georeferencing-and-accuracy.md) · [07 Tech stack](docs/07-tech-stack.md) · [08 Interfaces](docs/08-data-formats-and-interfaces.md) · [09 Viewer](docs/09-viewer-and-ui.md) · [10 Setup](docs/10-setup-and-repo-structure.md) |
| Validation & ops | [11 Testing](docs/11-testing-and-evaluation.md) · [12 Flight guide](docs/12-flight-and-data-capture-guide.md) |
| Delivery | [13 Plan](docs/13-project-plan.md) · [14 Demo & pitch](docs/14-demo-and-pitch.md) · [15 References](docs/15-research-and-references.md) · [16 Glossary](docs/16-glossary.md) |

Research: [`reports/Single pass drone 3D reconstruction.md`](reports/Single%20pass%20drone%203D%20reconstruction.md) and [`research_notes/`](research_notes/).

## Status

📄 **Design phase:** documentation v1.0 complete, implementation starting (see [Project Plan](docs/13-project-plan.md)).

## Team

| Role | Member |
|---|---|
| R1 Pipeline Lead | _TBD_ |
| R2 Geo & Accuracy Lead | _TBD_ |
| R3 3D & Mesh Engineer | _TBD_ |
| R4 AI/ML Engineer | _TBD_ |
| R5 Frontend Engineer | _TBD_ |
| R6 Data, Flight Ops & Pitch | _TBD_ |
