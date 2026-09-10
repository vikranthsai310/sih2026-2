# 04 · Tech Stack Document — MediKiosk

Every tool we use, why, and what we'd use instead.
Related: [03-architecture.md](03-architecture.md) · [08-ai-pipeline.md](08-ai-pipeline.md) · [06-folder-structure.md](06-folder-structure.md)

> Prices and model details are **approximate as of September 2026**. Verify on each provider's dashboard before quoting in the PPT.

---

## 1. Stack at a glance

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND   React 18 · TypeScript · Vite · Tailwind · react-i18next · Zustand │
│            TanStack Query · Web Audio / WebRTC                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ VOICE      Pipecat · Silero VAD · Smart-Turn · Exotel/Twilio · WebRTC        │
├──────────────────────────────────────────────────────────────────────────────┤
│ AI         STT Saaras v3 · LLM Sarvam-30B / Sarvam-105B · TTS Bulbul v3      │
│            OCR Sarvam Vision (+ Claude Haiku 4.5 fallback) · OpenCV          │
├──────────────────────────────────────────────────────────────────────────────┤
│ BACKEND    Python 3.11 · FastAPI · Pydantic v2 · SQLAlchemy 2 · Alembic      │
│            Celery · WebSockets                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ DATA       PostgreSQL 16 · Redis 7 · MinIO (S3) · HAPI FHIR (R4)             │
├──────────────────────────────────────────────────────────────────────────────┤
│ INTEROP    ABDM sandbox (ABHA · consent · HIP) · FHIR R4 NRCeS profiles      │
│            SNOMED CT · ICD-10/11 · LOINC · NAMASTE                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ DEVOPS     Docker Compose · nginx · GitHub Actions · Prometheus/Grafana (opt)│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend

One React app with four route groups: `/kiosk`, `/upload`, `/doctor`, `/triage` (+ `/admin`).

| Need | Choice | Why | Alternative |
|---|---|---|---|
| Framework | **React 18 + TypeScript** | Team familiarity, ecosystem, typed API models | Vue, Svelte |
| Build tool | **Vite** | Fast dev server, simple config | Next.js (not needed — no SSR) |
| Styling | **Tailwind CSS** | Fast to build large, accessible kiosk UI | MUI, Chakra |
| UI primitives | **shadcn/ui** (Radix-based) | Accessible dialogs, tabs, toasts for dashboards | Headless UI |
| Server state | **TanStack Query** | Caching, refetch, loading states | SWR |
| Client state | **Zustand** | Tiny store for kiosk session | Redux Toolkit |
| i18n | **react-i18next** | UI strings in en/hi/te(/ta) | FormatJS |
| Audio / voice on kiosk | **WebRTC** (Pipecat client) + Web Audio | Same voice pipeline as phone calls | Browser MediaRecorder + REST |
| Camera capture (docs) | `getUserMedia` + canvas | Kiosk webcam / phone camera in browser | Native app (future) |
| Realtime | Native **WebSocket** client | Triage alerts, doctor queue | Socket.IO |
| Charts (admin) | **Recharts** | Simple metrics charts | Chart.js |
| Icons | **Lucide** + custom medical icon set (SVG) | Icon-driven UI for low-literacy users | — |
| Testing | **Vitest**, **Playwright** | Unit + end-to-end | Jest, Cypress |
| Kiosk shell | Chrome **kiosk mode** (`--kiosk`) | Full-screen, no browser chrome | Electron (future) |

---

## 3. Voice & telephony

| Need | Choice | Why | Alternative |
|---|---|---|---|
| Voice-agent framework | **Pipecat** (Python) | Open source; handles streaming STT→LLM→TTS, barge-in, DTMF; has Sarvam, Exotel, Twilio, WebRTC integrations | LiveKit Agents |
| Voice activity detection | **Silero VAD** | Tiny, CPU-only, accurate | WebRTC VAD |
| Turn detection | **Smart-Turn** model (Pipecat) | Distinguishes a thinking pause from end of answer (important for elderly) | Fixed silence timeout |
| Browser / kiosk calls | **WebRTC** (Pipecat small WebRTC transport) | No phone number needed for demo; 16 kHz audio | Daily.co |
| Phone calls (India) | **Exotel** | Indian numbers, voicebot media streaming, DLT-compliant SMS | Plivo, Ozonetel, Knowlarity |
| Phone calls (dev) | **Twilio** | Best developer experience for testing | — |
| SMS | Exotel SMS / MSG91 | DLT-registered templates required in India | Twilio SMS |
| WhatsApp [Stretch] | WhatsApp Business Platform (via Exotel/Gupshup) | Most patients already use WhatsApp for photos | SMS link only |
| Noise suppression | **RNNoise** (Pipecat filter) | Hospital background noise | Krisp (paid) |

---

## 4. AI models

### 4.1 Model map

| Pipeline stage | Primary model | Why | Fallback | On-prem option |
|---|---|---|---|---|
| **STT** | **Sarvam Saaras v3** | 22 Indic languages + English, auto language detect, **8 kHz telephony support**, modes: transcribe / translate / codemix | Bhashini ASR | AI4Bharat **IndicConformer** |
| **LLM — live interview** | **Sarvam-30B** (`sarvam-30b`) | MoE, ~2.4B active params → fast & cheap; built for conversational agents; 10 Indic languages + English; 64K context | Sarvam-105B | Sarvam-30B open weights (Apache 2.0) on **vLLM** |
| **LLM — summary & documents** | **Sarvam-105B** (`sarvam-105b`) | Stronger reasoning, 128K context | Claude Haiku 4.5 (`claude-haiku-4-5`) | Sarvam-105B on vLLM |
| **TTS** | **Sarvam Bulbul v3** | Natural Indian voices, 10 Indic languages + English, 30+ voices | Bhashini TTS | AI4Bharat **Indic Parler-TTS** / IndicF5 |
| **OCR** | **Sarvam Vision** | Document intelligence, 23 languages | **Claude Haiku 4.5** vision for hard handwriting | **Surya OCR** / PaddleOCR |
| **Image preprocessing** | **OpenCV** | Crop, deskew, denoise, contrast | Pillow | same |
| **VAD** | Silero VAD | — | — | same |
| **Translation** (only if needed) | Saaras translate mode / Sarvam-Translate / Mayura | Languages the LLM doesn't cover → English | IndicTrans2 | IndicTrans2 |

### 4.2 Why this split (cost + safety)
- Question **selection** is code (ontology) → no LLM cost, no hallucinated questions.
- Question **audio** is pre-generated once per language → near-zero TTS cost/latency during calls.
- LLM is used only to **understand answers** (short, cheap calls) and **write the summary** (one call/patient).

### 4.3 Approximate pricing

| Service | Price (approx.) |
|---|---|
| Saaras v3 STT | ~₹30 / hour of audio (~₹45 with diarization) |
| Bulbul v3 TTS | ~₹30 / 10,000 characters |
| Sarvam-30B | ~₹2.5 / 1M input tokens (some trackers list it free) |
| Sarvam-105B | ~₹4 / 1M input tokens |
| Sarvam Vision | ~₹0.5 / page |
| Sarvam-Translate / Mayura | ~₹20 / 10,000 characters |
| Claude Haiku 4.5 (fallback) | $1 / 1M input tokens · $5 / 1M output tokens |
| New Sarvam account | ₹100 free credits |

### 4.4 Estimated cost per patient (cloud)

| Item | Assumption | Cost |
|---|---|---|
| STT | ~5 min patient speech | ~₹2.5 |
| TTS (live only) | ~1,000 chars of read-backs/clarifications | ~₹3 |
| LLM | ~100K tokens | < ₹1 |
| OCR | ~2 pages | ~₹1 |
| **Total AI** | | **~₹5–10** |
| Phone call (if PSTN) | ~8 min × ₹0.5–1/min | +₹4–8 |

On-prem: near-zero marginal cost after GPU hardware.

---

## 5. Backend

| Need | Choice | Why | Alternative |
|---|---|---|---|
| Language | **Python 3.11+** | All AI/voice libraries are Python-first | — |
| Web framework | **FastAPI** | Async, WebSockets, auto OpenAPI docs, Pydantic | Django REST |
| Validation / schemas | **Pydantic v2** | Shared models for API + LLM JSON output validation | — |
| ORM / migrations | **SQLAlchemy 2** + **Alembic** | Mature, async support | SQLModel |
| Background jobs | **Celery** + Redis broker | Document pipeline, summary, SMS, cleanup, call scheduling | RQ, Arq |
| Scheduling | Celery beat | Retry calls, retention cleanup | APScheduler |
| Auth | **JWT** (PyJWT) + passlib/bcrypt | Simple, stateless staff auth | Keycloak (future SSO) |
| HTTP client | **httpx** | Async calls to Sarvam, ABDM | aiohttp |
| AI SDKs | `sarvamai` (Sarvam), `anthropic` (fallback) | Official SDKs | raw HTTP |
| FHIR | `fhir.resources` (Pydantic FHIR models) | Build/validate R4 resources | hand-built JSON |
| Rules | YAML rules + small Python evaluator | Red flags readable by doctors | json-logic |
| Lint / format / types | **Ruff**, **mypy** | Fast, consistent | flake8, black |
| Tests | **pytest**, pytest-asyncio, httpx test client | — | — |

---

## 6. Data

| Store | Choice | Holds |
|---|---|---|
| Relational DB | **PostgreSQL 16** | Patients, visits, consents, interview turns, history items, documents metadata, entities, summaries, alerts, audit |
| Cache / session / broker / pub-sub | **Redis 7** | Live interview session state, Celery queues, WebSocket fan-out |
| Object storage | **MinIO** (S3-compatible, SSE encryption) | Document images, consent audio, pre-generated TTS clips |
| FHIR server | **HAPI FHIR** (Docker `hapiproject/hapi`) | Stand-in for HIS; validates and stores FHIR bundles |

---

## 7. Interoperability & standards

| Standard | Use |
|---|---|
| **ABDM sandbox** | ABHA verification (M1), HIP linking & sharing care contexts (M2), consent artefacts |
| **FHIR R4 — NRCeS India profiles** | `OPConsultRecord` (history summary), `HealthDocumentRecord` (scanned docs), `DiagnosticReportRecord` (lab values), `PrescriptionRecord` |
| **SNOMED CT** (free in India via NRCeS) | Symptoms, findings, diagnoses |
| **ICD-10 / ICD-11** | Diagnoses |
| **LOINC** | Lab tests |
| **NAMASTE** + **WHO ICD-11 TM2** | Ayurvedic diagnoses and concepts |

---

## 8. DevOps & tooling

| Need | Choice |
|---|---|
| Containers | **Docker** + **Docker Compose** (one command brings up everything) |
| Reverse proxy / TLS | **nginx** (+ Let's Encrypt on cloud) |
| CI | **GitHub Actions** — lint, type-check, tests, ontology validation, red-flag suite |
| Secrets | `.env` (never committed) → Docker secrets / Vault in production |
| Monitoring [Stretch] | Prometheus + Grafana (stage latency, STT confidence, call outcomes) |
| Error tracking [Stretch] | Sentry (PHI scrubbing on) |
| Self-hosted inference [Future] | **vLLM** for Sarvam LLMs; Triton/NeMo for IndicConformer |
| Design | Figma (wireframes → hi-fi), Excalidraw (diagrams) |
| Docs | Markdown + Mermaid in `docs/` |
| Project management | GitHub Projects (board per phase) |

---

## 9. Environment variables (`.env.example`)

```bash
# --- App ---
APP_ENV=dev
DEMO_MODE=false                # true = demo shortcuts for judging (see 13-demo-and-pitch §4.1)
APP_SECRET_KEY=change-me
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=7
PUBLIC_BASE_URL=https://localhost

# --- Database / cache / storage ---
DATABASE_URL=postgresql+asyncpg://medikiosk:medikiosk@postgres:5432/medikiosk
REDIS_URL=redis://redis:6379/0
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio-secret
S3_BUCKET_DOCUMENTS=documents
S3_BUCKET_AUDIO=audio
FIELD_ENCRYPTION_KEY=base64-32-bytes

# --- AI providers (swap without code changes) ---
STT_PROVIDER=sarvam            # sarvam | bhashini | indicconformer
TTS_PROVIDER=sarvam            # sarvam | bhashini | indicparler
LLM_LIVE_PROVIDER=sarvam       # model: sarvam-30b
LLM_LIVE_MODEL=sarvam-30b
LLM_SUMMARY_PROVIDER=sarvam
LLM_SUMMARY_MODEL=sarvam-105b
LLM_SUMMARY_FALLBACK_PROVIDER=none   # none | claude — set none for strict India data residency
OCR_PROVIDER=sarvam            # sarvam | surya
OCR_FALLBACK_PROVIDER=claude   # claude | none — sends images outside India; needs consent/DPA review (see 10)
SARVAM_API_KEY=
ANTHROPIC_API_KEY=
CLAUDE_FALLBACK_MODEL=claude-haiku-4-5

# --- Telephony / messaging ---
TELEPHONY_PROVIDER=webrtc      # webrtc | exotel | twilio
EXOTEL_SID=
EXOTEL_API_KEY=
EXOTEL_API_TOKEN=
EXOTEL_CALLER_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_NUMBER=
SMS_PROVIDER=exotel
TRIAGE_TRANSFER_NUMBER=

# --- ABDM / FHIR ---
ABDM_BASE_URL=https://dev.abdm.gov.in
ABDM_CLIENT_ID=
ABDM_CLIENT_SECRET=
ABDM_HIP_ID=
FHIR_SERVER_URL=http://hapi-fhir:8080/fhir

# --- Interview tuning ---
DEFAULT_LANGUAGES=hi,te,en
VAD_STOP_SECS_ELDERLY=1.2
STT_MIN_CONFIDENCE=0.6
EXTRACT_MIN_CONFIDENCE=0.7
MAX_REASK=2
```

---

## 10. Accounts & access checklist

| Account | Purpose | Who | Status |
|---|---|---|---|
| Sarvam AI (dashboard.sarvam.ai) | STT, TTS, LLM, Vision API key | Voice lead | ☐ |
| ABDM Sandbox (sandbox.abdm.gov.in) | Client ID/secret, test ABHA numbers | Backend lead | ☐ |
| Anthropic Console | Fallback OCR/LLM key | AI lead | ☐ |
| Exotel or Twilio trial | Phone number for real-call demo | Voice lead | ☐ |
| GitHub organization/repo | Code, CI, project board | Team lead | ☐ |
| Figma | Wireframes | Frontend lead | ☐ |
| Cloud VM (optional) | Public demo URL | Backend lead | ☐ |

---

## 11. Local development prerequisites

| Tool | Version |
|---|---|
| Python | 3.11+ (with `uv` or `pip`) |
| Node.js | 20 LTS |
| Docker Desktop | Latest (Compose v2) |
| Git | Latest |
| Chrome | Latest (kiosk mode, WebRTC) |
| Optional | NVIDIA GPU + CUDA (only for on-prem model experiments) |
