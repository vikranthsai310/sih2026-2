# 06 · Folder Structure Document — MediKiosk

Where every file lives, how things are named, and how we work in git.
Related: [03-architecture.md](03-architecture.md) · [04-tech-stack.md](04-tech-stack.md) · [09-data-model-and-api.md](09-data-model-and-api.md)

---

## 1. Top level (monorepo)

```
sih2026-2-/                          # repo root — project "MediKiosk"
├── README.md                        # project overview + quick start
├── .gitignore
├── .env.example                     # all config keys (no secrets) — see 04-tech-stack §9
├── docker-compose.yml               # postgres, redis, minio, hapi-fhir, api, voice, worker, frontend, nginx
├── Makefile                         # make up / down / test / lint / seed / pregen-audio
├── docs/                            # ← you are here (all project documents)
├── backend/                         # Python: API, voice gateway, interview engine, workers
├── frontend/                        # React: kiosk, upload, doctor, triage, admin
├── infra/                           # nginx, HAPI FHIR config, on-prem model serving, monitoring
├── data/                            # sample documents, test calls, eval sets (mostly git-ignored)
└── .github/workflows/               # CI pipelines
```

---

## 2. `docs/`

```
docs/
├── README.md                        # index of all documents
├── 01-idea.md
├── 02-requirements.md
├── 03-architecture.md
├── 04-tech-stack.md
├── 05-wireframes.md
├── 06-folder-structure.md
├── 07-conversation-design.md
├── 08-ai-pipeline.md
├── 09-data-model-and-api.md
├── 10-security-privacy.md
├── 11-testing-evaluation.md
├── 12-project-plan.md
├── 13-demo-and-pitch.md
└── assets/                          # exported diagrams, screenshots, Figma exports
    └── clinical-validation.md       # results of the simulated clinical validation (see 11)
```

---

## 3. `backend/`

```
backend/
├── pyproject.toml                   # dependencies, ruff, mypy, pytest config
├── Dockerfile
├── alembic.ini
├── alembic/
│   └── versions/                    # DB migrations (one file per change)
│
├── app/
│   ├── main.py                      # FastAPI app factory, routers, middleware
│   ├── voice_main.py                # entrypoint for Voice Gateway (Pipecat workers)
│   ├── worker_main.py               # entrypoint for Celery workers
│   │
│   ├── core/
│   │   ├── config.py                # typed settings from .env
│   │   ├── security.py              # JWT, password hashing, upload tokens
│   │   ├── crypto.py                # field-level encryption (mobile, ABHA)
│   │   ├── logging.py               # JSON logs, PHI scrubbing, request IDs
│   │   ├── deps.py                  # FastAPI dependencies (db session, current user, roles)
│   │   └── errors.py                # error model + handlers
│   │
│   ├── db/
│   │   ├── base.py                  # SQLAlchemy Base, naming conventions
│   │   └── session.py               # async engine/session
│   │
│   ├── models/                      # SQLAlchemy tables (see 09-data-model-and-api §2)
│   │   ├── user.py                  # staff_users
│   │   ├── patient.py
│   │   ├── visit.py
│   │   ├── consent.py
│   │   ├── interview.py             # interview_sessions, interview_turns
│   │   ├── history.py               # history_items
│   │   ├── alert.py                 # red_flag_alerts, clinical_flags
│   │   ├── help_request.py
│   │   ├── document.py              # documents, document_entities
│   │   ├── summary.py               # summaries, summary_edits
│   │   ├── fhir_export.py
│   │   └── audit.py
│   │
│   ├── schemas/                     # Pydantic request/response + canonical JSON
│   │   ├── history_record.py        # canonical structured history (single source of truth)
│   │   ├── ontology.py              # node / slot / branch models
│   │   ├── extraction.py            # LLM extraction output schemas
│   │   ├── document.py
│   │   ├── summary.py
│   │   └── common.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── router.py            # mounts all routers under /api/v1
│   │       ├── auth.py
│   │       ├── identity.py          # ABHA / mobile OTP verify (init/confirm)
│   │       ├── patients.py
│   │       ├── visits.py
│   │       ├── consents.py          # incl. /patient/consents (patient-otp)
│   │       ├── help.py              # kiosk/call Help requests
│   │       ├── kiosk.py             # kiosk device sessions, staff-assisted mode, emergency close
│   │       ├── interview.py         # kiosk touch/text interview endpoints
│   │       ├── calls.py             # schedule outbound calls
│   │       ├── telephony.py         # Exotel/Twilio webhooks
│   │       ├── documents.py         # staff/kiosk document endpoints
│   │       ├── upload.py            # public token-based upload page API
│   │       ├── summary.py
│   │       ├── alerts.py            # triage alerts
│   │       ├── doctor.py            # doctor queue
│   │       ├── fhir.py
│   │       └── admin.py             # metrics, audit
│   │
│   ├── ws/
│   │   ├── hub.py                   # Redis pub/sub → WebSocket fan-out
│   │   ├── triage.py                # /ws/triage
│   │   ├── doctor.py                # /ws/doctor
│   │   └── kiosk.py                 # /ws/kiosk/{session_id}
│   │
│   ├── services/
│   │   ├── interview/
│   │   │   ├── engine.py            # public API: start, submit_answer, next, end
│   │   │   ├── ontology_loader.py   # loads + validates YAML, builds graph
│   │   │   ├── state_machine.py     # section order, branching, completion
│   │   │   ├── extractor.py         # LLM extraction with schema + retries
│   │   │   ├── normalizer.py        # lexicon mapping, units, numbers in words
│   │   │   ├── validator.py         # type/range/confidence/contradiction checks
│   │   │   ├── clarifier.py         # re-ask templates, keypad fallback
│   │   │   ├── readback.py          # section read-back text
│   │   │   └── session_store.py     # Redis session state + persistence
│   │   │
│   │   ├── safety/
│   │   │   ├── red_flags.py         # rule evaluator (fail-safe)
│   │   │   ├── rules_loader.py
│   │   │   └── escalation.py        # alert creation, call transfer, patient message
│   │   │
│   │   ├── voice/
│   │   │   ├── pipeline.py          # Pipecat pipeline builder per call
│   │   │   ├── transports.py        # WebRTC, Exotel, Twilio transports
│   │   │   ├── processors.py        # custom frame processors (engine bridge, DTMF, fillers)
│   │   │   ├── audio_cache.py       # pre-generated clip lookup (MinIO/local)
│   │   │   └── call_control.py      # outbound dial, transfer, hang-up
│   │   │
│   │   ├── ai/                      # provider adapters (see 03-architecture §7)
│   │   │   ├── base.py              # STT/TTS/LLM/OCR Protocols
│   │   │   ├── registry.py          # picks provider from env
│   │   │   ├── sarvam_stt.py
│   │   │   ├── sarvam_tts.py
│   │   │   ├── sarvam_llm.py
│   │   │   ├── sarvam_vision.py
│   │   │   ├── claude_fallback.py   # Haiku 4.5 vision/LLM fallback
│   │   │   └── prompts/             # versioned prompt templates (*.md / *.j2)
│   │   │       ├── extract_slot.j2
│   │   │       ├── clarify.j2
│   │   │       ├── extract_document.j2
│   │   │       ├── summary.j2
│   │   │       └── redflag_check.j2
│   │   │
│   │   ├── documents/
│   │   │   ├── ingest.py            # store original, create record, enqueue
│   │   │   ├── preprocess.py        # OpenCV crop/deskew/denoise, doc-type guess
│   │   │   ├── ocr.py               # OCR with fallback
│   │   │   ├── extract.py           # text → entities JSON
│   │   │   ├── normalize.py         # brand→generic, LOINC, SNOMED, units
│   │   │   ├── lab_flags.py         # reference-range checks
│   │   │   ├── interactions.py      # drug–drug / drug–allergy checks
│   │   │   └── timeline.py          # date inference + ordering
│   │   │
│   │   ├── summary/
│   │   │   ├── generator.py         # facts → summary JSON (LLM) → fact check
│   │   │   ├── fact_check.py        # every statement must map to a stored fact
│   │   │   └── renderer.py          # summary JSON → doctor view / SMS / audio text
│   │   │
│   │   ├── abdm/
│   │   │   ├── client.py            # gateway auth, signing, retries
│   │   │   ├── abha.py              # verify / fetch profile
│   │   │   ├── consent.py           # consent artefacts
│   │   │   └── hip.py               # care-context linking, data push
│   │   │
│   │   ├── fhir/
│   │   │   ├── builder.py           # canonical history → FHIR bundle
│   │   │   ├── mappings.py          # field → resource/code mappings
│   │   │   └── push.py              # POST to HAPI / HIS
│   │   │
│   │   ├── notify/
│   │   │   ├── sms.py
│   │   │   └── whatsapp.py          # [Stretch]
│   │   │
│   │   └── storage/
│   │       └── s3.py                # MinIO client, presigned URLs
│   │
│   └── workers/
│       ├── celery_app.py
│       ├── tasks_documents.py
│       ├── tasks_summary.py
│       ├── tasks_calls.py           # scheduled outbound calls, retries
│       ├── tasks_fhir.py
│       └── tasks_cleanup.py         # retention & session wipe jobs
│
├── ontology/                        # clinical content (edited by the clinical team)
│   ├── schema.json                  # JSON Schema every YAML file must satisfy
│   ├── CHANGELOG.md                 # what changed, why, who clinically reviewed it
│   ├── flow.yaml                    # section order per mode (allopathy / ayurveda)
│   ├── intake/
│   │   ├── language.yaml
│   │   ├── identity.yaml
│   │   └── consent.yaml
│   ├── complaints/
│   │   ├── _router.yaml             # maps free-text chief complaint → tree
│   │   ├── chest_pain.yaml
│   │   ├── fever.yaml
│   │   ├── abdominal_pain.yaml
│   │   ├── joint_pain.yaml
│   │   ├── cough_breathlessness.yaml
│   │   ├── headache.yaml
│   │   └── generic.yaml             # fallback tree (OLDCARTS)
│   ├── sections/
│   │   ├── past_history.yaml
│   │   ├── surgical_history.yaml
│   │   ├── drug_history.yaml
│   │   ├── allergies.yaml
│   │   ├── family_history.yaml
│   │   ├── personal_history.yaml
│   │   ├── obstetric_history.yaml   # asked when relevant
│   │   ├── review_of_systems.yaml
│   │   └── wrapup.yaml              # final read-back, documents SMS, closing message
│   ├── ayurveda/
│   │   ├── prakriti.yaml
│   │   ├── agni_koshtha.yaml
│   │   ├── ahara_vihara.yaml
│   │   ├── dashavidha.yaml
│   │   └── nidana.yaml
│   ├── red_flags.yaml               # emergency rules
│   └── lexicon/
│       ├── hi.yaml                  # colloquial Hindi → canonical terms
│       ├── te.yaml
│       └── ta.yaml                  # [Stretch]
│
├── reference_data/
│   ├── lab_ranges.csv               # LOINC code, test, unit, low, high, critical, sex/age
│   ├── drug_brand_generic.csv       # Indian brand → generic
│   ├── drug_interactions.csv        # pairs + severity + note
│   ├── snomed_subset.csv            # codes we use
│   ├── icd_subset.csv
│   └── namaste_subset.csv           # Ayurveda codes
│
├── audio_cache/                     # git-ignored: local render output of pregenerate_tts.py,
│                                    # uploaded to MinIO as tts/<lang>/<node_id>.v<version>.mp3
│   ├── hi/
│   ├── te/
│   └── en/
│
├── scripts/
│   ├── pregenerate_tts.py           # renders every ontology question to audio per language
│   ├── validate_ontology.py         # schema + graph checks (no dead ends, all langs present)
│   ├── seed_demo_data.py            # staff users, demo patients, sample visits
│   ├── run_eval.py                  # extraction / red-flag / OCR evaluation
│   └── export_openapi.py
│
└── tests/
    ├── unit/                        # state machine, red flags, normalizer, validators
    ├── integration/                 # API + DB, document pipeline with mocked AI
    │   └── adapters/                # contract tests for STT/TTS/LLM/OCR provider adapters
    ├── e2e_voice/                   # scripted calls using recorded audio from data/test_calls
    ├── security/                    # auth, RBAC, upload-token, injection tests
    ├── eval/                        # scored evaluations against data/eval_sets
    ├── redflags/                    # mandatory red-flag suite (must be 100 %)
    └── fixtures/
```

---

## 4. `frontend/`

```
frontend/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
├── Dockerfile
├── e2e/                             # Playwright end-to-end tests (kiosk, upload, doctor, triage)
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── routes.tsx                   # /kiosk/* /upload/:token /doctor/* /triage /admin/*
    │
    ├── apps/
    │   ├── kiosk/
    │   │   ├── screens/
    │   │   │   ├── AttractScreen.tsx      # idle "Touch to start / pick up handset"
    │   │   │   ├── LanguageScreen.tsx
    │   │   │   ├── IdentifyScreen.tsx     # ABHA / mobile / new registration
    │   │   │   ├── OtpScreen.tsx
    │   │   │   ├── ConsentScreen.tsx      # audio + icons
    │   │   │   ├── ModeScreen.tsx         # handset (voice) or touch
    │   │   │   ├── QuestionScreen.tsx     # generic question renderer
    │   │   │   ├── PainScaleScreen.tsx
    │   │   │   ├── BodyMapScreen.tsx
    │   │   │   ├── DurationPicker.tsx
    │   │   │   ├── EmergencyScreen.tsx
    │   │   │   ├── DocumentScanScreen.tsx
    │   │   │   ├── DocumentReviewScreen.tsx
    │   │   │   └── DoneScreen.tsx         # token + "summary sent to doctor"
    │   │   ├── components/                # BigIconButton, AudioPrompt, ProgressDots, HelpButton
    │   │   ├── hooks/                     # useVoiceSession, useIdleTimeout, useAudioPrompt
    │   │   └── store.ts                   # Zustand kiosk session (wiped on finish/timeout)
    │   │
    │   ├── upload/
    │   │   └── pages/UploadPage.tsx       # mobile: capture/choose photos, progress, done
    │   │
    │   ├── doctor/
    │   │   ├── pages/
    │   │   │   ├── QueuePage.tsx
    │   │   │   ├── PatientPage.tsx        # tabs: Summary · Timeline · Documents · Ayurveda · Transcript
    │   │   │   └── LoginPage.tsx
    │   │   └── components/                # SummarySection, EditableField, FlagBadge, SourceLink, DocViewer
    │   │
    │   ├── triage/
    │   │   └── pages/AlertBoard.tsx
    │   │
    │   └── admin/
    │       └── pages/MetricsPage.tsx
    │
    ├── components/ui/                     # shared shadcn/ui primitives
    ├── lib/
    │   ├── api.ts                         # typed API client (generated from OpenAPI)
    │   ├── ws.ts                          # WebSocket helper with reconnect
    │   └── auth.ts
    ├── i18n/
    │   ├── index.ts
    │   ├── en.json
    │   ├── hi.json
    │   └── te.json
    ├── assets/
    │   ├── icons/                         # medical & body icons (SVG)
    │   └── audio/                         # UI prompts not tied to ontology (e.g. "touch to start")
    └── styles/
        └── globals.css
```

---

## 5. `infra/`, `data/`, `.github/`

```
infra/
├── nginx/
│   └── nginx.conf                   # TLS, /api → api, /voice → voice, / → frontend
├── hapi-fhir/
│   └── application.yaml             # R4, validation on
├── onprem/                          # [Future] self-hosted models
│   ├── docker-compose.gpu.yml       # vLLM (Sarvam-30B/105B), IndicConformer, Indic Parler-TTS
│   └── README.md
├── loadtest/                        # k6 / Locust scripts (API load, simulated concurrent calls)
└── monitoring/                      # [Stretch] Prometheus + Grafana dashboards

data/                                # git-ignored except README + small synthetic samples
├── README.md                        # what goes here, NO real patient data rule
├── sample_documents/                # synthetic / consented prescriptions & reports
├── test_calls/                      # recorded mock calls (team members / volunteers, consented)
│   ├── hi/
│   └── te/
└── eval_sets/
    ├── extraction.jsonl             # (question, transcript) → expected slots
    ├── redflags.jsonl               # scenarios → expected alert
    ├── ocr.jsonl                    # image → expected entities
    └── results/                     # dated eval run outputs (scores per model/prompt version)

.github/
└── workflows/
    └── ci.yml                       # ruff, mypy, pytest, ontology validation, red-flag suite, frontend lint/test/build
```

---

## 6. Where does my code go? (quick lookup)

| I'm building… | Put it in |
|---|---|
| A new API endpoint | `backend/app/api/v1/<area>.py` + schema in `app/schemas/` |
| A new DB table / column | `backend/app/models/` + `alembic revision --autogenerate` |
| A new complaint question tree | `backend/ontology/complaints/<name>.yaml` + route in `_router.yaml` |
| A new emergency rule | `backend/ontology/red_flags.yaml` + test case in `data/eval_sets/redflags.jsonl` |
| A colloquial word mapping | `backend/ontology/lexicon/<lang>.yaml` |
| A new AI provider | `backend/app/services/ai/<provider>_<kind>.py` + register in `registry.py` |
| A prompt change | `backend/app/services/ai/prompts/` (bump version comment; re-run eval) |
| A lab reference range | `backend/reference_data/lab_ranges.csv` |
| A kiosk screen | `frontend/src/apps/kiosk/screens/` |
| A doctor dashboard widget | `frontend/src/apps/doctor/components/` |
| A UI translation | `frontend/src/i18n/<lang>.json` |

---

## 7. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Python modules / functions | `snake_case` | `submit_answer()` |
| Python classes | `PascalCase` | `InterviewEngine` |
| TS components | `PascalCase.tsx` | `PainScaleScreen.tsx` |
| TS hooks | `useXxx.ts` | `useVoiceSession.ts` |
| DB tables | plural `snake_case` | `interview_turns` |
| API paths | plural nouns, kebab-case | `/api/v1/visits/{id}/upload-link` |
| Ontology node IDs | `<tree>.<slot>` | `chest_pain.radiation` |
| Slot keys in history | `<section>.<field>`; HPI adds the complaint tree: `hpi.<tree>.<field>` | `hpi.chest_pain.onset`, `drug.current[0].name` |
| Red-flag rule IDs | `RF-<SYSTEM>-<nn>` | `RF-CARD-01`, `RF-NEURO-02` |
| Requirement IDs | `FR-<MOD>-<n>`, `NFR-<n>` | `FR-INT-07` |
| Language codes | ISO 639-1 | `hi`, `te`, `en`, `ta` |
| Env vars | `UPPER_SNAKE` | `LLM_LIVE_MODEL` |

---

## 8. Git workflow

- **Branches:** `main` (always demo-able) ← `dev` ← feature branches `feat/<area>-<short>` (e.g. `feat/voice-dtmf`), fixes `fix/<short>`, docs `docs/<short>`.
- **Commits:** Conventional Commits — `feat(interview): add chest pain radiation branch`, `fix(ocr): handle rotated images`, `docs: update architecture`.
- **Pull requests:** small, one feature; CI green; 1 reviewer; clinical content (ontology, red flags) needs review by the clinical owner.
- **Never commit:** `.env`, API keys, real patient data, recorded calls without consent, generated audio cache (`backend/audio_cache/`).

---

## 9. Quick start (planned commands)

```bash
git clone <repo> && cd sih2026-2-
cp .env.example .env              # add SARVAM_API_KEY, ABDM sandbox creds
make up                           # docker compose up -d (postgres, redis, minio, hapi, api, voice, worker, frontend)
make migrate                      # alembic upgrade head
make seed                         # demo staff, patients, visits
make pregen-audio                 # render ontology questions to audio (hi, te, en)
open https://localhost/kiosk      # kiosk
open https://localhost/doctor     # doctor dashboard (demo login from seed)
open https://localhost/triage     # triage board
make test                         # unit + integration + red-flag suite
```
