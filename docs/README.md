# MediKiosk — Project Documentation

> **SIH 2026 · Problem Statement 26047 — Patient Case-Taking Software**
> Ministry of Ayush · All India Institute of Ayurveda (AIIA) · Software · MedTech / HealthTech

MediKiosk is an AI clinical-history platform. Before the consultation, it **calls the patient in their own language**, conducts a doctor-style history interview (voice or keypad/touch), **digitizes their old prescriptions and reports**, and delivers a **structured, physician-ready summary** to the doctor's screen — linked to the patient's ABHA record through FHIR.

---

## Document index

| # | Document | What it answers | Read it if you are… |
|---|---|---|---|
| 01 | [Idea Document](01-idea.md) | What problem, what solution, for whom, why it's unique | Everyone — start here |
| 02 | [Requirements (SRS)](02-requirements.md) | Exactly what the system must do (FR / NFR / user stories / acceptance criteria) | Everyone building features |
| 03 | [Architecture](03-architecture.md) | How the system is put together, data flows, sequence diagrams, deployment | Backend, AI, integration |
| 04 | [Tech Stack](04-tech-stack.md) | Every tool, library, AI model, and why; costs; accounts needed | Everyone during setup |
| 05 | [Wireframes & UX](05-wireframes.md) | Every screen (kiosk, upload, doctor, triage) + call flow + design rules | Frontend, UX, clinical |
| 06 | [Folder Structure](06-folder-structure.md) | Where every file lives, naming conventions, git workflow | Everyone before writing code |
| 07 | [Conversation & Clinical Design](07-conversation-design.md) | Interview flow, question ontology, SOCRATES trees, red flags, Ayurveda mode, lexicon | Clinical content, brain |
| 08 | [AI Pipeline](08-ai-pipeline.md) | STT/LLM/TTS/OCR models, prompts, JSON schemas, fallbacks, cost | AI / voice |
| 09 | [Data Model & API](09-data-model-and-api.md) | Database schema, REST + WebSocket API, canonical history JSON, FHIR mapping | Backend, frontend |
| 10 | [Security, Privacy & Compliance](10-security-privacy.md) | DPDP Act 2023, ABDM consent, encryption, retention, clinical safety | Backend, everyone |
| 11 | [Testing & Evaluation](11-testing-evaluation.md) | Test strategy, metrics & targets, datasets, red-flag test suite | Everyone |
| 12 | [Project Plan](12-project-plan.md) | Phases, timeline, team roles, milestones, risks | Team lead, everyone |
| 13 | [Demo & Pitch](13-demo-and-pitch.md) | PPT outline, live demo script, judge Q&A | Presenters |

## Reading order

- **New team member:** 01 → 04 → 06 → your module's doc
- **Before the PPT / idea submission:** 01 → 03 → 05 → 13
- **Before writing backend code:** 03 → 09 → 06 → 10
- **Before writing clinical content:** 07 → 02 (clinical FRs) → 11 (red-flag tests)

## Key decisions (summary)

| Decision | Choice | Details in |
|---|---|---|
| Primary interview channel | **AI voice call** in native language (+ keypad fallback) | 01, 03, 07 |
| On-site channel | **Kiosk** with telephone handset + touch UI + document scanner | 01, 05 |
| Document channel | SMS/WhatsApp **upload link** + kiosk scan | 03, 05 |
| Who decides what to ask | **Clinical ontology + state machine** (deterministic), not the LLM | 03, 07 |
| What the LLM does | Understands answers → JSON; phrases clarifications; writes the summary | 08 |
| AI provider | **Sarvam AI** (Saaras v3 STT, Sarvam-30B/105B LLM, Bulbul v3 TTS, Sarvam Vision); Claude Haiku 4.5 fallback for hard handwriting | 04, 08 |
| Emergency detection | **Rule-based red-flag engine** (+ LLM safety net) | 07 |
| Backend | Python · FastAPI · Pipecat · PostgreSQL · Redis · Celery · MinIO | 04 |
| Frontend | React · TypeScript · Vite · Tailwind (one app: `/kiosk`, `/upload`, `/doctor`, `/triage`, `/admin`) | 04, 06 |
| Interoperability | FHIR R4 (NRCeS/ABDM profiles) · ABDM sandbox (ABHA, consent, HIP) | 09, 10 |
| MVP languages | Hindi, Telugu, English (Tamil stretch) | 02, 07 |

## Document conventions

- Requirement IDs: `FR-<module>-<n>` (functional), `NFR-<n>` (non-functional). Referenced across docs.
- Diagrams use **Mermaid** (renders on GitHub/GitLab/VS Code).
- Prices and third-party model details are **approximate as of September 2026** — verify before quoting.
- Anything marked **[MVP]** is in hackathon scope; **[Stretch]** if time permits; **[Future]** is post-hackathon.
