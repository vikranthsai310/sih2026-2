# MediKiosk

**AI clinical-history platform** that takes a patient's full medical history **in their own language, before they meet the doctor.**

> Smart India Hackathon 2026 · Problem Statement **26047 — Patient Case-Taking Software**
> Ministry of Ayush · All India Institute of Ayurveda (AIIA) · Software · MedTech / HealthTech

---

## What it does

1. **📞 AI voice call** — after OPD registration, an AI calls the patient (Hindi, Telugu, English…) and conducts a doctor-style history interview. Works on any phone; keypad fallback.
2. **🖥️ Kiosk** — on-site touchscreen with a telephone handset and document camera for walk-in patients.
3. **📷 Documents** — old prescriptions, lab reports and discharge summaries are photographed, OCR'd, structured and put on a timeline, with abnormal values flagged.
4. **🚨 Red flags** — emergency symptoms (e.g. chest pain + breathlessness) immediately alert the triage nurse.
5. **🧠 Summary** — a structured, physician-ready history (CC → HPI → Past → Drugs/Allergy → Family → Personal → ROS → Investigations → Ayurveda) appears on the doctor's screen; the doctor edits and confirms.
6. **🔗 ABDM** — ABHA verification, DPDP-compliant consent, FHIR R4 bundles pushed to the HIS and linked to the ABHA record.
7. **🌿 Ayurveda mode** — Prakriti, Agni, Koshtha, Ahara-Vihara and Dashavidha Pariksha (self-reportable items) for AYUSH OPDs.

## Stack

Sarvam AI (Saaras v3 STT · Sarvam-30B/105B · Bulbul v3 TTS · Sarvam Vision) · Pipecat · FastAPI · PostgreSQL · Redis · Celery · MinIO · HAPI FHIR · React + TypeScript + Tailwind · Docker Compose

## Documentation

All project documents live in [`docs/`](docs/README.md):

| | |
|---|---|
| [01 Idea](docs/01-idea.md) | [08 AI Pipeline](docs/08-ai-pipeline.md) |
| [02 Requirements](docs/02-requirements.md) | [09 Data Model & API](docs/09-data-model-and-api.md) |
| [03 Architecture](docs/03-architecture.md) | [10 Security & Privacy](docs/10-security-privacy.md) |
| [04 Tech Stack](docs/04-tech-stack.md) | [11 Testing & Evaluation](docs/11-testing-evaluation.md) |
| [05 Wireframes](docs/05-wireframes.md) | [12 Project Plan](docs/12-project-plan.md) |
| [06 Folder Structure](docs/06-folder-structure.md) | [13 Demo & Pitch](docs/13-demo-and-pitch.md) |
| [07 Conversation Design](docs/07-conversation-design.md) | |

## Quick start (planned)

```bash
cp .env.example .env        # add SARVAM_API_KEY + ABDM sandbox credentials
make up                     # start all services with Docker Compose
make migrate && make seed   # database + demo data
make pregen-audio           # pre-generate question audio (hi, te, en)
```

Then open `/kiosk`, `/doctor`, `/triage`. See [docs/06-folder-structure.md §9](docs/06-folder-structure.md).

## Disclaimer

MediKiosk produces an **AI-generated draft of patient-reported history** for physician review. It does not diagnose or recommend treatment. Every summary must be verified by a qualified clinician.
