# 10 · Setup and Repository Structure

> **Purpose:** how the repo is laid out, how to set up a working dev machine (Ubuntu or Windows 11 + WSL2), how to build the offline Docker bundle, and how the team writes, reviews and extends code.
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R1 Pipeline Lead

---

## 1. Repository tree

The top level and the `pipeline/drishti/` modules are **canonical**: they come from [`00-project-charter.md`](00-project-charter.md) §9. Files marked *(proposed)* are the recommended layout inside those folders. Create them as work starts, and update this section if you deviate.

```
sih2026-2/
├── README.md                    # Project pitch, 5-line quickstart, links to docs/
├── LICENSE                      # (proposed) Licence of our own code — decide with team (see 07 §8)
├── pyproject.toml               # (proposed) Python package "drishti": deps, ruff/black/mypy/pytest config, console script
├── uv.lock                      # (proposed) Exact Python dependency lock
├── environment.yml              # (proposed) conda-forge binaries: python 3.11, gdal, pdal, proj, ffmpeg
├── .pre-commit-config.yaml      # (proposed) ruff, black, mypy, eslint, prettier, large-file guard
├── .gitignore                   # Ignores data/, runs, weights, build outputs (see §8)
├── .gitattributes               # (proposed) LF line endings; mark *.tif/*.laz as binary
├── .github/
│   ├── pull_request_template.md # (proposed) PR checklist (see §7.3)
│   └── workflows/ci.yml         # (proposed) Lint + unit tests on CPU; no GPU in CI
│
├── docs/                        # This documentation set (00–16 + README.md index)
├── reports/                     # Research report: "Single pass drone 3D reconstruction.md"
├── research_notes/              # Raw research notes backing the report
│
├── pipeline/                    # Python package root
│   └── drishti/
│       ├── __init__.py          # Package version
│       ├── cli.py               # `drishti` entry point: run, ingest, preview, qa, export, benchmark, validate, selftest, check-licences (08 §8)
│       ├── config.py            # Pydantic config models; YAML layering (default → profile → overrides)
│       ├── run.py               # Orchestrator: stage registry, run directory, resume, progress events
│       ├── ingest/              # S0 Ingest & Sync
│       │   ├── video.py         #   ffprobe metadata, PTS table, frame extraction
│       │   ├── srt.py           #   DJI .SRT parser (per-model regex variants, golden-tested)
│       │   ├── klv.py           #   MISB ST 0601 KLV via klvdata (stretch)
│       │   └── timesync.py      #   SRT↔frame time-offset estimation (velocity cross-correlation)
│       ├── frames/              # S1 Keyframe Selection
│       │   ├── keyframes.py     #   Optical-flow parallax keyframing (~1–2 fps equivalent)
│       │   └── blur.py          #   Variance-of-Laplacian sharpness; best-frame-per-window
│       ├── masking/             # S2 Dynamic Masking & Semantics
│       │   ├── detector.py      #   YOLO-seg class detections (vehicle/person)
│       │   └── segmenter.py     #   SAM 2 mask refinement/propagation; sky & OSD masks
│       ├── sfm/                 # S3 Pose Estimation
│       │   ├── colmap_runner.py #   pycolmap/COLMAP 4.x: features, matching, global mapper, BA
│       │   ├── priors.py        #   GPS/gravity/gimbal pose priors, fixed intrinsics
│       │   └── rolling_shutter.py # Readout-time model and per-model defaults
│       ├── georef/              # S4 Georeferencing & Anchoring
│       │   ├── align.py         #   Robust 7-DoF Umeyama to GPS
│       │   ├── register.py      #   Ortho/DSM registration to reference rasters
│       │   ├── corrections.py   #   RTK/PPK/CORS/GAGAN position ingest; single-GCP shift
│       │   └── crs.py           #   pyproj helpers: UTM zone pick, ellipsoid↔geoid heights
│       ├── dense/               # S5 Dense Reconstruction & Mesh
│       │   ├── openmvs_runner.py #  InterfaceCOLMAP → Densify → Reconstruct → Refine → Texture
│       │   └── rasters.py       #   PDAL/GDAL DSM, DTM, orthomosaic
│       ├── completion/          # S6 Completion & Classification
│       │   ├── classify.py      #   Ground/building/road/vegetation/water labels
│       │   └── lod2.py          #   Roof-plane → wall LoD2 completion, flagged "inferred"
│       ├── splat/               # S7 Photoreal Layer (display only)
│       │   └── train.py         #   gsplat training with exposure compensation → splat glTF
│       ├── export/              # S8 Export & Tiling
│       │   ├── las.py           #   LAS/LAZ with CRS + classification
│       │   ├── cog.py           #   Cloud-Optimised GeoTIFF writer
│       │   ├── gltf.py          #   OBJ → glTF/GLB (+ compression)
│       │   └── tiles3d.py       #   OGC 3D Tiles (mesh + point cloud)
│       ├── qa/                  # S9 QA & Confidence
│       │   ├── accuracy.py      #   RMSE/CE90/LE90, bias-vs-noise, relative length error
│       │   ├── doming.py        #   Along/across-track DSM residual profiles
│       │   ├── confidence.py    #   observed-high / observed-low / inferred map
│       │   └── report.py        #   HTML/PDF + JSON accuracy report
│       └── preview/             # P Live Preview
│           └── mosaic.py        #   Incremental GPS-seeded 2D mosaic
│
├── server/                      # FastAPI app
│   ├── app/main.py              # (proposed) FastAPI instance, routers, static mounts
│   ├── app/routes/              # (proposed) missions.py, uploads.py, runs.py, measurements.py, ws.py — endpoints per 08 §9
│   ├── app/jobs.py              # (proposed) SQLite job table + single-GPU worker
│   └── tests/                   # (proposed) API tests (httpx TestClient)
│
├── web/                         # React + Vite + CesiumJS viewer, installable PWA (07 §3.13, ADR-012)
│   ├── package.json             # (proposed) Scripts: dev, build, lint, typecheck, test, e2e, gen:api; "packageManager": pnpm
│   ├── pnpm-lock.yaml           # (proposed) Exact web dependency lock (pnpm install --frozen-lockfile)
│   ├── .nvmrc                   # (proposed) Node active LTS used for builds
│   ├── vite.config.ts           # (proposed) Copies Cesium static assets; vite-plugin-pwa; dev proxy to server
│   ├── components.json          # (proposed) shadcn/ui config (components vendored into src/components/ui/)
│   ├── src/                     # (proposed) api/ (incl. generated schema.d.ts), stores/, pages/, viewer/ (incl. tools/), components/, i18n/ — see 09 §8.2
│   ├── e2e/                     # (proposed) Playwright + axe tests, offline network guard
│   └── public/                  # (proposed) Offline basemap tiles / PWA icons (no ion)
│
├── configs/
│   ├── default.yaml             # Every parameter with its default + comment
│   ├── fast.yaml                # ≤15 min profile overrides (default)
│   ├── quality.yaml             # Max-detail overrides
│   └── preview.yaml             # 2D-only overrides
│
├── scripts/
│   ├── download_datasets.sh     # (proposed) MARS-LVIG / UseGeo / UAVD4L / ODM samples → data/datasets/
│   ├── download_weights.sh      # (proposed) Fetch weights listed in models/MANIFEST.yaml, verify SHA256
│   ├── benchmark.py             # (proposed) Timed runs across profiles → CSV
│   ├── calibrate_camera.py      # (proposed) Checkerboard calibration → configs/cameras/<model>_<mode>.yaml
│   └── make_offline_bundle.sh   # (proposed) Build + docker save + weights + checksums
│
├── tests/
│   ├── unit/                    # (proposed) Fast, CPU-only, no data download
│   ├── integration/             # (proposed) Stage chains on tiny clips (GPU marked)
│   └── golden/                  # (proposed) Small reference inputs + expected outputs (SRT samples per drone model)
│
├── docker/
│   ├── worker.Dockerfile        # (proposed) CUDA 12 base + COLMAP + OpenMVS + conda env + drishti
│   ├── api.Dockerfile           # (proposed) Slim Python image for the FastAPI app in server/
│   ├── web.Dockerfile           # (proposed) Build web, serve static via nginx
│   ├── versions.env             # (proposed) Pinned COLMAP/OpenMVS commits, CUDA, PyTorch index
│   └── compose.yaml             # (proposed) web + api + worker (04 §6.3), GPU reservation, volumes
│
├── models/                      # (proposed, git-ignored except MANIFEST.yaml) Model weights (mounted read-only at /models)
│   └── MANIFEST.yaml            # name, url, sha256, licence, finale_allowed
│
└── data/                        # (git-ignored) inputs, runs, reference rasters
    ├── raw/                     #   Original flights (read-only; see 12 §9)
    ├── datasets/                #   Public datasets
    ├── reference/               #   Reference ortho/DSM tiles, checkpoint CSVs
    └── runs/<run_id>/           #   One folder per run (config.resolved.yaml, logs, stage outputs, report)
```

---

## 2. Prerequisites overview

| Item | Requirement | Check command |
|---|---|---|
| GPU | NVIDIA, ≥ 12 GB VRAM (see [07 §4](07-tech-stack.md)) | `nvidia-smi` |
| Driver | Recent enough for CUDA 12.x | `nvidia-smi` shows "CUDA Version: 12.x" or higher |
| CUDA toolkit | 12.x (only needed when building COLMAP/OpenMVS from source) | `nvcc --version` |
| RAM / disk | 64 GB recommended / ≥ 200 GB free | `free -h`, `df -h` |
| Python | 3.11 via conda-forge | `python --version` |
| Node + pnpm | Current active LTS (pinned in `web/.nvmrc`; Node 20 is end-of-life ⚠ verify) + pnpm (version pinned in `web/package.json#packageManager`) | `node -v`, `pnpm -v` |
| Docker | Engine + compose v2 + NVIDIA Container Toolkit | `docker run --rm --gpus all nvidia/cuda:<cuda12-base-tag> nvidia-smi` *(any CUDA 12 `base` tag; pin at implementation time)* |

---

## 3. Setup on Ubuntu 22.04 / 24.04

### 3.1 NVIDIA driver

```bash
sudo apt update
ubuntu-drivers devices            # shows the recommended driver
sudo ubuntu-drivers autoinstall   # or: sudo apt install nvidia-driver-<NNN>
sudo reboot
nvidia-smi                         # must list your GPU and a CUDA 12.x-capable driver
```

### 3.2 CUDA 12 toolkit (for source builds only)

PyTorch wheels bundle their own CUDA runtime, so you only need the toolkit to **compile** COLMAP/OpenMVS. Install `cuda-toolkit-12-x` from NVIDIA's apt repository for your Ubuntu release (follow NVIDIA's instructions, choosing *deb (network)*). Install the **toolkit** package, not the `cuda` meta-package, so the driver you already have is not replaced.

```bash
# after adding NVIDIA's repo per their docs:
sudo apt install cuda-toolkit-12-<minor>     # pin minor at implementation time
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc && nvcc --version
```

### 3.3 System packages

```bash
sudo apt install -y git git-lfs build-essential cmake ninja-build pkg-config \
    ffmpeg exiftool curl wget unzip \
    libboost-program-options-dev libboost-graph-dev libboost-system-dev \
    libboost-iostreams-dev libboost-serialization-dev \
    libeigen3-dev libmetis-dev libgoogle-glog-dev libgflags-dev \
    libsqlite3-dev libglew-dev qtbase5-dev libqt5opengl5-dev \
    libcgal-dev libceres-dev libopencv-dev libjpeg-dev libpng-dev libtiff-dev \
    libfreeimage-dev libgtest-dev libgmock-dev
```

> The exact dependency list for COLMAP 4.x may differ from 3.x (for example, image I/O libraries changed between versions). **Check the "Installation" page of the COLMAP docs for the tag you pin** and update this list.

### 3.4 Python environment (conda-forge + uv)

```bash
# Miniforge (conda-forge by default)
curl -L -O https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-Linux-x86_64.sh
bash Miniforge3-Linux-x86_64.sh -b && ~/miniforge3/bin/conda init && exec $SHELL

git clone https://github.com/vikranthsai310/sih2026-2.git && cd sih2026-2
conda env create -f environment.yml      # python=3.11 gdal pdal proj rasterio laspy ffmpeg
conda activate drishti

pip install uv
# PyTorch with CUDA 12 — choose the cu12x index matching your driver; pin at implementation time
uv pip install torch torchvision --index-url https://download.pytorch.org/whl/cu12X
uv pip install -e ".[dev]"               # drishti + ruff/black/mypy/pytest
python -c "import torch; print(torch.cuda.is_available(), torch.version.cuda)"
python -c "from osgeo import gdal; import pdal; print(gdal.__version__)"
```

Why GDAL/PDAL come from conda-forge: their pip wheels often break against a system PROJ. conda-forge ships a matched GDAL/PDAL/PROJ set.

### 3.5 COLMAP 4.x with CUDA

**Option A: build from source (recommended, full control)**

```bash
git clone https://github.com/colmap/colmap.git && cd colmap
git checkout <PINNED_4.x_TAG>            # recorded in docker/versions.env
mkdir build && cd build
cmake .. -GNinja -DCMAKE_BUILD_TYPE=Release -DCUDA_ENABLED=ON \
         -DCMAKE_CUDA_ARCHITECTURES=native   # or e.g. "86;89" for RTX 30xx/40xx
ninja && sudo ninja install
colmap -h | head -n 3                    # header should mention "with CUDA"
```

pycolmap: install the version matching your COLMAP tag (`uv pip install pycolmap==<same 4.x>`). The PyPI wheels may be CPU-only. If the pipeline needs GPU features through pycolmap, build pycolmap from the same COLMAP checkout (`pip install ./python` or as the COLMAP docs describe for your tag). Alternatively, call the `colmap` CLI through `sfm/colmap_runner.py`. **Verify at implementation time.**

**Option B: conda-forge `colmap` package.** Faster to install. Check that the build has CUDA enabled (`colmap -h`). If it does not, use Option A.

### 3.6 OpenMVS

```bash
git clone https://github.com/cdcseacave/VCG.git ~/src/vcglib
git clone --recurse-submodules https://github.com/cdcseacave/openMVS.git ~/src/openMVS
cd ~/src/openMVS && git checkout <PINNED_COMMIT_OR_TAG>
mkdir make && cd make
cmake .. -GNinja -DCMAKE_BUILD_TYPE=Release -DVCG_ROOT=$HOME/src/vcglib \
         -DOpenMVS_USE_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=native
ninja && sudo ninja install
DensifyPointCloud --help | head -n 5
```

OpenMVS binaries usually install under `/usr/local/bin/OpenMVS/`. Put that folder on `PATH`, or set `dense.openmvs_bin` in the config.

### 3.7 Node and web

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
exec $SHELL && cd web && nvm install && nvm use   # reads web/.nvmrc (active LTS)
npm install -g pnpm@<version in package.json#packageManager>   # or enable it via corepack if your Node ships it
pnpm install --frozen-lockfile && pnpm dev      # http://localhost:5173
```

### 3.8 Verify the install

```bash
drishti selftest            # checks: CUDA, torch, colmap(+CUDA), OpenMVS bins, gdal/pdal, ffmpeg, weights SHA256
drishti check-licences      # fails if a finale profile references finale_allowed:false weights
pytest -m "not gpu" -q      # unit tests
```

---

## 4. Setup on Windows 11 + WSL2

1. **Install only the Windows NVIDIA driver** (Game Ready or Studio, a recent release with WSL CUDA support). **Do not** install a Linux NVIDIA driver inside WSL: the Windows driver exposes the GPU to WSL.
2. Install WSL and Ubuntu from an admin PowerShell:
   ```powershell
   wsl --install -d Ubuntu-22.04     # or Ubuntu-24.04
   wsl --update
   wsl -l -v                         # VERSION must be 2
   ```
3. Give WSL enough memory. Create `%UserProfile%\.wslconfig`:
   ```ini
   [wsl2]
   memory=48GB        # leave ~16 GB for Windows on a 64 GB machine
   processors=12
   swap=16GB
   ```
   Then run `wsl --shutdown` and reopen Ubuntu.
4. Inside Ubuntu, check the GPU with `nvidia-smi`. It should work without any driver install.
5. CUDA toolkit (only for source builds): use NVIDIA's **"WSL-Ubuntu"** CUDA repository and install `cuda-toolkit-12-x` only. Never install the `cuda` or `cuda-drivers` meta-packages inside WSL.
6. Follow §3.3–§3.8 unchanged.
7. **Keep the repo and data inside the Linux filesystem** (`~/sih2026-2`, `~/data`). Do not use `/mnt/c` or `/mnt/d`: cross-filesystem I/O is many times slower, and COLMAP databases and OpenMVS temp files suffer. Open the repo from VS Code with the *WSL* extension (`code .` inside WSL).
8. Docker: use Docker Desktop with the WSL2 backend and turn on integration for your distro, or install Docker Engine inside WSL plus the NVIDIA Container Toolkit. Test with `docker run --rm --gpus all <cuda12-base-image> nvidia-smi`.

---

## 5. Docker and the offline bundle

### 5.1 Images and services

Service names, images, ports and volumes follow [04 §3 and §6.3](04-system-architecture.md#63-compose-sketch).

| Service | Image | Contents | GPU |
|---|---|---|---|
| `worker` | `drishti/worker:<ver>-cuda12` (from `docker/worker.Dockerfile`) | CUDA 12 runtime base, COLMAP 4.x (CUDA), OpenMVS, conda env (GDAL/PDAL), PyTorch, `drishti`; runs the job runner that claims queued jobs from SQLite | ✅ |
| `api` | `drishti/api:<ver>` (from `docker/api.Dockerfile`; code in `server/`) | FastAPI (REST + WebSocket, [08 §9](08-data-formats-and-interfaces.md#9-rest-and-websocket-api)), uploads, run CRUD. Not published to the host; reached through `web`. | — |
| `web` | `drishti/web:<ver>` (from `docker/web.Dockerfile`) | nginx serving the built React/Cesium app, proxying `/api/*` to `api`, and serving run outputs read-only at `/files/runs/…` (3D Tiles, COGs, preview tiles, with Range) | — |
| `odm` (optional) | `opendronemap/odm:gpu` | Baseline comparator only | ✅ |

`docker/compose.yaml` (sketch; network isolation details in 04 §6.3):

```yaml
services:
  worker:
    image: drishti/worker:${DRISHTI_VERSION}-cuda12
    command: ["drishti-worker"]                 # job runner; DB at /data/drishti.db
    volumes: ["../data:/data", "../models:/models:ro"]
    environment: [DRISHTI_DATA=/data, DRISHTI_MODELS=/models, DRISHTI_OFFLINE=1]
    deploy:
      resources:
        reservations:
          devices: [{ driver: nvidia, count: all, capabilities: [gpu] }]
  api:
    image: drishti/api:${DRISHTI_VERSION}
    command: ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
    environment: [DRISHTI_DATA=/data, DRISHTI_DB=/data/drishti.db]
    volumes: ["../data:/data"]                  # no host port: reached via web
  web:
    image: drishti/web:${DRISHTI_VERSION}
    volumes: ["../data:/data:ro"]               # nginx: /files/runs/… → /data/runs/…
    ports: ["127.0.0.1:8080:80"]                # localhost only by default
    depends_on: [api]
```

### 5.2 Building the offline bundle (`scripts/make_offline_bundle.sh`)

```bash
export DRISHTI_VERSION=0.x.y
docker compose -f docker/compose.yaml build
docker pull opendronemap/odm:gpu                # optional baseline
bash scripts/download_weights.sh                 # verifies SHA256 against models/MANIFEST.yaml
drishti check-licences --profile fast            # MUST pass (no forbidden weights)

mkdir -p bundle
docker save -o bundle/drishti-offline-$DRISHTI_VERSION.tar \
  drishti/worker:$DRISHTI_VERSION-cuda12 drishti/api:$DRISHTI_VERSION drishti/web:$DRISHTI_VERSION
tar -czf bundle/models.tgz models/              # includes MANIFEST.yaml, SHA256SUMS, licence file per weight
cp docker/compose.yaml configs/*.yaml bundle/
cp -r data/reference/sample bundle/sample_data   # small demo clip + SRT + checkpoints
( cd bundle && sha256sum * > SHA256SUMS )
```

### 5.3 Installing on an air-gapped machine

```bash
sha256sum -c SHA256SUMS
docker load -i drishti-offline-0.x.y.tar
tar -xzf models.tgz
DRISHTI_VERSION=0.x.y docker compose -f compose.yaml up -d
curl -s http://127.0.0.1:8080/api/v1/health       # expect "offline": true
# open http://localhost:8080  — Wi-Fi OFF during the whole test
```

Offline rules:
- **CesiumJS without ion.** Do not set an ion token. Use `EllipsoidTerrainProvider`, or our own DSM, plus local imagery (our orthomosaic COG and optional pre-downloaded basemap tiles). Any call to `*.cesium.com` is a bug. Test with the network unplugged.
- **No runtime downloads.** PyTorch Hub, Ultralytics, and Hugging Face auto-downloads must be disabled (`DRISHTI_OFFLINE=1` sets `HF_HUB_OFFLINE=1`, `TORCH_HOME=/models/torch`, and Ultralytics settings pointing to local weights).
- Rehearse the full `docker load → run → view` loop on the **finale laptop** at M5.

---

## 6. Quickstart

```bash
conda activate drishti
bash scripts/download_datasets.sh --only odm-sample   # tiny smoke test data

# 1) 2D preview only (seconds)
drishti run --video data/raw/demo/DJI_0001.MP4 --srt data/raw/demo/DJI_0001.SRT \
            --profile preview --out data/runs/demo_preview

# 2) Default metric 3D (≤15 min target on reference workstation)
drishti run --video data/raw/demo/DJI_0001.MP4 --srt data/raw/demo/DJI_0001.SRT \
            --ref-ortho data/reference/demo/ortho.tif --ref-dsm data/reference/demo/dsm.tif \
            --profile fast --out data/runs/demo_fast

# 3) With RTK/PPK and a single GCP
drishti run --video f.mp4 --srt f.srt --rtk f.pos --gcp gcp.csv --profile quality --out data/runs/q1

# 4) Evaluate against independent checkpoints (never the GCPs)
drishti qa --run data/runs/demo_fast --checkpoints data/reference/demo/checkpoints.csv

# 5) Server + viewer
uvicorn app.main:app --app-dir server --reload        # :8000
( cd web && pnpm dev )                                 # :5173
```

The CLI contract (charter §9) is fixed: `drishti run --video … --srt … [--rtk] [--ref-ortho] [--ref-dsm] [--gcp] --profile … --out data/runs/<run_id>`.

### 6.1 Running on sample and public data

| Dataset | Command (proposed) | What to look at |
|---|---|---|
| ODM sample images/video | `scripts/download_datasets.sh --only odm-sample` then `drishti run …` | End-to-end smoke test, S8 outputs open in the viewer |
| MARS-LVIG sequence | `scripts/download_datasets.sh --only mars-lvig --seq <name>`, then `drishti run --video <frames-as-video> --gnss <csv>` (adapter in `ingest/`) | S3 drift vs RTK. S5 DSM vs L1 LiDAR (doming test). |
| Own flight | See [12-flight-and-data-capture-guide.md](12-flight-and-data-capture-guide.md) | CE90/LE90 before/after anchoring |

---

## 7. Coding conventions and git workflow

### 7.1 Python

| Tool | Rule |
|---|---|
| **ruff** | Lint (`ruff check .`). Rule sets E, F, I (isort), B, UP, SIM. Line length 100. |
| **black** | Format (`black .`). Line length 100. |
| **mypy** | `--strict` on `drishti/georef`, `drishti/qa`, `drishti/ingest` (the accuracy-critical code). Normal mode elsewhere. |
| **pytest** | `tests/unit` must run CPU-only in < 2 min. Mark GPU tests `@pytest.mark.gpu` and slow tests `@pytest.mark.slow`. |
| Style | Type hints everywhere. Docstrings state **units and frames** (e.g. `"xyz: (N,3) float64, metres, EPSG:32643"`). Never mix degrees and radians silently. |
| Numbers | Coordinates in float64. Never store UTM in float32 (it loses cm precision). |
| Logging | `logging` via `drishti.run.get_logger(stage)`. No `print`. Every stage logs its inputs, parameters and timing into `runs/<id>/logs/`. |
| Errors | Raise `StageError(stage, msg, hint)` with an actionable hint. The orchestrator turns it into a user-facing message. |

### 7.2 TypeScript

- **eslint** (typescript-eslint, react-hooks, jsx-a11y) and **prettier** (2-space indent, single quotes, width 100, Tailwind class sorting). Full web stack: [07 §3.13](07-tech-stack.md).
- `strict: true` in `tsconfig.json`. No `any` in measurement code.
- Measurement maths lives in pure functions under `web/src/viewer/tools/` (09 §8.2) with **vitest** unit tests against known geodesic distances.
- `web/src/api/schema.d.ts` is generated from the server's OpenAPI (`pnpm gen:api`); never edit it by hand. CI fails if it is stale.

### 7.3 Git workflow

| Item | Rule |
|---|---|
| Default branch | `main`: always runnable. Protected, no direct pushes. |
| Branch names | `feature/<stage>-<desc>` e.g. `feature/s0-srt-mini4pro`, `feature/s4-ortho-registration`, `feature/web-measure-area`. Also `fix/<stage>-<desc>`, `docs/<desc>`, `chore/<desc>`. Stage tags: `s0`…`s9`, `p`, `server`, `web`, `infra`. |
| Commits | **Conventional Commits**: `feat(s4): add robust Umeyama with Huber loss`, `fix(s0): handle SRT without gimbal fields`, `docs(12): add checkpoint CSV format`, `test(s9): golden CE90 case`, `chore(deps): pin pycolmap`. |
| PR size | Aim for ≤ 400 changed lines. Split big features. |
| Reviews | ≥ 1 approving review. Changes to `georef/`, `qa/` or `ingest/timesync.py` need a review from **R2 Geo & Accuracy Lead**. Changes to `models/MANIFEST.yaml` need R2 sign-off on the licence. |
| CI gate | ruff + black --check + mypy + `pytest -m "not gpu"` + web lint/test must pass. |
| Merging | Squash-merge. PR title = conventional commit. |
| Releases | Tag `v0.<milestone>.<patch>` at each milestone (M1…M5). The offline bundle is built only from tags. |

**PR template** (`.github/pull_request_template.md`):

```markdown
## What / why
<!-- one paragraph; link issue -->

## Stage(s) touched
- [ ] S0 [ ] S1 [ ] S2 [ ] S3 [ ] S4 [ ] S5 [ ] S6 [ ] S7 [ ] S8 [ ] S9 [ ] P [ ] server [ ] web [ ] infra

## Evidence
- [ ] Unit tests added/updated
- [ ] Ran on golden clip: runtime ___ s, peak VRAM ___ GB
- [ ] Accuracy impact (if S0/S3/S4/S5): CE90 ___ → ___, LE90 ___ → ___ on <dataset>

## Checklist
- [ ] No data, weights or run outputs committed
- [ ] New dependency/weight added to docs/07-tech-stack.md licence register
- [ ] Config keys documented in configs/default.yaml
- [ ] Offline: no new network calls at runtime
```

**Code review rules:**
1. Review for **correctness of units, frames and CRS** first, then style.
2. Any accuracy claim in a PR must include a number and the dataset it came from ("measure, don't claim").
3. Anything that fabricates geometry must set the `inferred` flag ("flag, don't fake").
4. Reviewers run the change locally when it touches S3–S5 or the viewer's measurement tools.
5. Be kind and specific. Suggest code, don't only point at problems.

---

## 8. `.gitignore` guidance

```gitignore
# data & outputs — never commit
data/
runs/
bundle/
*.mp4
*.MP4
*.mov
*.MOV
*.ts
*.tif
*.tiff
*.las
*.laz
*.ply
*.obj
*.glb
*.splat
*.db
*.sqlite

# weights — only the manifest is tracked
models/*
!models/MANIFEST.yaml

# SRT: ignore in data, but allow tiny golden samples
*.SRT
*.srt
!tests/golden/**/*.SRT
!tests/golden/**/*.srt

# python / node / build
__pycache__/
*.egg-info/
.venv/
.mypy_cache/
.ruff_cache/
.pytest_cache/
web/node_modules/
web/dist/
build/
make/

# secrets & local config
.env
*.local.yaml
```

Golden test files must be **tiny**: an SRT excerpt of a few KB, or a 64×64 raster. Use git LFS only if a golden asset really must exceed about 1 MB, and discuss it first.

---

## 9. Configuration management

- **Layering:** `configs/default.yaml` ← `configs/<profile>.yaml` ← `--config my.yaml` ← `--set key=value` CLI overrides ← `DRISHTI_*` environment variables (paths only).
- **Validation:** `drishti/config.py` defines pydantic models per stage (`IngestConfig`, `SfmConfig`, …). Unknown keys are an error, so typos fail fast.
- **Reproducibility:** every run writes `data/runs/<run_id>/config.resolved.yaml` and `manifest.json` (software versions incl. git SHA, COLMAP/OpenMVS versions, container digest; input SHA-256 hashes) — see [08 §6](08-data-formats-and-interfaces.md). Weight SHA-256s are checked against `models/MANIFEST.yaml` by `drishti selftest`.
- **Camera configs:** `configs/cameras/<drone_model>_<video_mode>.yaml` (schema in [08 §2.6](08-data-formats-and-interfaces.md)) holds calibrated intrinsics and rolling-shutter readout. See [12 §7](12-flight-and-data-capture-guide.md).
- **No secrets** exist in the runtime (offline). CORS caster credentials used during field survey stay in the surveyor's device, not in the repo.

Example override:

```bash
drishti run --video f.mp4 --srt f.srt --profile fast \
  --set frames.target_fps=1.5 --set sfm.mapper=global --set sfm.intrinsics.refine_distortion=false \
  --out data/runs/exp_fps15
```

---

## 10. How to add a new stage

Example: adding `S4b · Barometric altitude fusion`.

1. **Agree it.** If it changes the canonical stage list, update the charter §7 first (charter-first rule), then [05-pipeline-design.md](05-pipeline-design.md).
2. **Create the module** `pipeline/drishti/<pkg>/` with a class implementing the stage protocol:

   ```python
   # pipeline/drishti/run.py (protocol, simplified)
   class Stage(Protocol):
       name: str                      # "S4b_baro"
       requires: tuple[str, ...]      # artefact keys it consumes, e.g. ("poses_georef", "srt_table")
       provides: tuple[str, ...]      # artefact keys it produces, e.g. ("poses_georef",)
       def run(self, ctx: RunContext, cfg: BaseModel) -> None: ...
   ```
3. **Config:** add a pydantic model and a section in `configs/default.yaml` with comments. Set `enabled: false` by default until it is validated.
4. **Register** it in the stage registry in `run.py` with its order. The orchestrator checks `requires`/`provides` at start-up.
5. **Artefacts:** write only inside `ctx.stage_dir`. Register outputs with `ctx.artefacts.put(key, path, meta)`. Formats follow [08-data-formats-and-interfaces.md](08-data-formats-and-interfaces.md).
6. **Progress:** call `ctx.progress(fraction, message)`. It feeds the WebSocket and the viewer.
7. **Tests:** a unit test (synthetic input), an integration test on the golden clip, and an accuracy before/after row if the stage touches geometry.
8. **Docs:** update 05, 07 (any new dependency and its licence), and this file's tree.

---

## 11. Troubleshooting FAQ

| Symptom | Likely cause | Fix |
|---|---|---|
| `torch.cuda.is_available()` is `False` | CPU wheel installed, or driver too old for the wheel's CUDA | Reinstall from the `cu12X` index. Check that `nvidia-smi` shows a driver CUDA version ≥ the wheel's CUDA. |
| `CUDA error: no kernel image is available for execution on the device` | COLMAP/OpenMVS built for the wrong GPU architecture | Rebuild with `-DCMAKE_CUDA_ARCHITECTURES=native` (or `86` for RTX 30xx, `89` for 40xx) |
| Version-mismatch errors between CUDA toolkit and driver | Toolkit newer than the driver supports | Upgrade the driver, or install an older 12.x toolkit. Under WSL, update the **Windows** driver. |
| COLMAP runs but is slow and the logs say SIFT on CPU / "without CUDA" | Binary built without CUDA (common with some packages) | `colmap -h` must say *with CUDA*. Rebuild (§3.5A). In Docker, check `--gpus all` / compose `deploy.resources`. |
| COLMAP GPU works on the host but not in Docker | NVIDIA Container Toolkit missing | Install `nvidia-container-toolkit`, run `sudo nvidia-ctk runtime configure --runtime=docker`, restart Docker |
| `CUDA out of memory` in S2/S3/S5/S7 | Too many keyframes, resolution too high, too many Gaussians | Use the `fast` profile. Lower `dense.resolution_level`, `sfm.features.resize_max_px`, `splat.max_gaussians`. Close browser GPU tabs. On 12 GB, never run S7 concurrently with S5. |
| System RAM OOM / WSL crashes | WSL memory cap too low, or ODM ultra settings | Raise `.wslconfig` memory. Use `high`, not `ultra`, in ODM. Add swap. |
| `SRT not matched` / zero GPS rows | SRT name differs from the video (case matters: ODM is case-sensitive), a different SRT dialect for the drone model, or subtitles were disabled during recording | Keep `DJI_0001.MP4` + `DJI_0001.SRT` together. Run `drishti ingest --inspect-srt f.SRT` to see the detected dialect. Add a golden sample and parser variant. If there is no SRT at all, use `--gnss` from the flight log (CSV). |
| GPS track looks shifted in time along the path | SRT↔frame offset | Check the `timesync` report. It should show a single clear correlation peak. Force it with `--set ingest.timesync.manual_offset_s=<value>` if you measured it. |
| Model is "bowl-shaped" | Doming: free K1 on a near-nadir strip | Set `sfm.intrinsics.source=file` and keep `sfm.intrinsics.refine_distortion=false` with a calibrated camera file. Fly forward-oblique (see [12](12-flight-and-data-capture-guide.md)). |
| Windows paths break (`\`, spaces, `D:\…`) | Tools running in WSL/Docker receive Windows paths | Keep data in the WSL filesystem. Use `pathlib` everywhere. Never build paths by string concatenation. Avoid spaces in run IDs. `wslpath -u 'D:\x'` converts a path if needed. |
| Very slow I/O under WSL | Repo or data on `/mnt/c` or `/mnt/d` | Move everything to `~/` inside WSL |
| Cesium viewer is blank or requests `cesium.com` | ion default token or imagery provider | Set `Ion.defaultAccessToken = undefined`. Use local imagery/terrain providers (§5.3). |
| GDAL `PROJ: proj_create_from_database` errors | Mixed pip and conda PROJ | Remove pip `gdal`/`pyproj`/`rasterio` and install them all from conda-forge in one env |
| `DensifyPointCloud: command not found` | OpenMVS bin dir not on `PATH` | Add `/usr/local/bin/OpenMVS` to `PATH`, or set `dense.openmvs_bin` |

---

## Related documents

- [00-project-charter.md](00-project-charter.md): single source of truth (layout §9, CLI, profiles)
- [01-problem-statement.md](01-problem-statement.md)
- [02-solution-overview.md](02-solution-overview.md)
- [03-requirements.md](03-requirements.md)
- [04-system-architecture.md](04-system-architecture.md)
- [05-pipeline-design.md](05-pipeline-design.md)
- [06-georeferencing-and-accuracy.md](06-georeferencing-and-accuracy.md)
- [07-tech-stack.md](07-tech-stack.md)
- [08-data-formats-and-interfaces.md](08-data-formats-and-interfaces.md)
- [09-viewer-and-ui.md](09-viewer-and-ui.md)
- [11-testing-and-evaluation.md](11-testing-and-evaluation.md)
- [12-flight-and-data-capture-guide.md](12-flight-and-data-capture-guide.md)
- [13-project-plan.md](13-project-plan.md)
- [14-demo-and-pitch.md](14-demo-and-pitch.md)
- [15-research-and-references.md](15-research-and-references.md)
- [16-glossary.md](16-glossary.md)
