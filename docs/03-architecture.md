# 03 · Architecture Document — MediKiosk

This document describes how MediKiosk is built: components, how they talk, how data flows, and how it is deployed.
Related: [04-tech-stack.md](04-tech-stack.md) · [09-data-model-and-api.md](09-data-model-and-api.md) · [08-ai-pipeline.md](08-ai-pipeline.md) · [10-security-privacy.md](10-security-privacy.md)

---

## 1. Architecture principles

| # | Principle | What it means in practice |
|---|---|---|
| P1 | **Deterministic clinical core** | The *ontology + state machine* decides what to ask. The LLM never invents questions or diagnoses. |
| P2 | **Physician in the loop** | Every AI output is a draft; the doctor confirms. Provenance (interview / document / doctor) is stored for every fact. |
| P3 | **Safety beats speed** | Red-flag rules run after *every* answer; on any doubt → escalate to a human. |
| P4 | **Provider-agnostic AI** | STT, TTS, LLM and OCR sit behind adapters. Sarvam cloud ↔ on-prem models ↔ fallbacks swap by config. |
| P5 | **Privacy by design** | Consent before capture, encryption everywhere, minimum retention, audit everything. |
| P6 | **Channel-agnostic** | Phone call, kiosk and upload link all feed the *same* Interview Engine and visit record. |
| P7 | **Resumable** | Every answer is persisted immediately; dropped calls resume from the last question. |
| P8 | **Standards first** | Internal canonical JSON maps 1-to-1 to FHIR R4 (NRCeS / ABDM profiles) and standard codes. |

---

## 2. System context

```mermaid
flowchart LR
    P([Patient])
    N([Triage nurse])
    D([Doctor])
    R([Registration staff])
    MK[["MediKiosk Platform"]]
    AI["AI Services<br/>Sarvam cloud or on-prem models"]
    ABDM["ABDM Gateway<br/>ABHA · Consent · HIP"]
    HIS["Hospital HIS / EMR"]
    TEL["Telephony<br/>Exotel / Twilio / SMS"]

    P -- "phone call · kiosk · upload link" --> MK
    R -- "registers visit" --> MK
    MK -- "red-flag alerts" --> N
    MK -- "structured summary" --> D
    D -- "edits · confirms" --> MK
    MK <-- "STT · LLM · TTS · OCR" --> AI
    MK <-- "ABHA verify · consent · link records" --> ABDM
    MK -- "FHIR bundles" --> HIS
    MK <-- "outbound calls · SMS · media streams" --> TEL
```

---

## 3. Container view

```mermaid
flowchart TB
    subgraph CH["Channels"]
        PH["Patient phone"]
        KI["Kiosk app<br/>(React, touch + handset)"]
        UP["Upload page<br/>(mobile web)"]
    end
    subgraph ST["Staff apps"]
        DR["Doctor dashboard"]
        TR["Triage dashboard"]
        AD["Admin / metrics"]
    end

    TEL["Telephony provider"]

    subgraph BE["MediKiosk backend"]
        VG["Voice Gateway<br/>(Pipecat workers)"]
        API["Core API<br/>(FastAPI)"]
        IE["Interview Engine"]
        RF["Red-Flag Engine"]
        DP["Document Pipeline<br/>(Celery workers)"]
        SG["Summary Generator"]
        IN["Integration<br/>ABDM · FHIR · SMS"]
        WS["Realtime hub<br/>(WebSockets)"]
    end

    subgraph AI["AI adapters"]
        STT["STT: Saaras v3"]
        LLM["LLM: Sarvam-30B / 105B"]
        TTS["TTS: Bulbul v3 + audio cache"]
        OCR["OCR: Sarvam Vision<br/>fallback Claude Haiku 4.5"]
    end

    subgraph DS["Data"]
        PG[("PostgreSQL")]
        RD[("Redis<br/>sessions · queues · pub/sub")]
        S3[("MinIO / S3<br/>encrypted files & audio")]
        FH[("HAPI FHIR server")]
    end

    PH --> TEL --> VG
    KI -- "WebRTC audio" --> VG
    KI -- "REST" --> API
    UP -- "REST (token link)" --> API
    DR <--> API
    DR <--> WS
    TR <--> WS
    AD --> API

    VG --> STT
    VG --> TTS
    VG <--> IE
    API <--> IE
    IE --> LLM
    IE --> RF
    RF --> WS
    API --> DP
    DP --> OCR
    DP --> LLM
    IE --> SG
    DP --> SG
    SG --> LLM
    SG --> WS
    API --> IN
    IN --> FH
    IN --> TEL

    API --- PG
    IE --- RD
    VG --- RD
    DP --- S3
    DP --- PG
    SG --- PG
```

### 3.1 Container responsibilities

| Container | Responsibility | Scales by |
|---|---|---|
| **Voice Gateway** | Runs one Pipecat pipeline per live call: audio in/out, VAD, turn detection, STT, TTS, barge-in, DTMF, call transfer | Stateless workers; 1 worker process ≈ 10–20 concurrent calls (tune in load test) |
| **Core API** | REST endpoints, auth, visit lifecycle, consent, uploads, doctor/triage/admin APIs | Horizontal replicas behind nginx |
| **Interview Engine** | Loads ontology, drives the state machine, calls the extractor, validates slots, persists answers, asks Red-Flag Engine | In-process library used by Voice Gateway and Core API; session state in Redis |
| **Red-Flag Engine** | Evaluates rules on every updated history; raises alerts; triggers escalation | In-process, pure function — must be fast (< 20 ms) |
| **Document Pipeline** | Async: preprocess → OCR → extraction → normalization → timeline → lab/drug flags | Celery worker pool |
| **Summary Generator** | Merges interview + document facts; generates summary JSON + rendered text; re-runs on edits | Celery task |
| **Integration** | ABDM client (ABHA verify, consent, HIP link/share), FHIR builder & push, SMS/WhatsApp, telephony control | Celery tasks + API calls |
| **Realtime hub** | WebSocket channels for triage alerts, doctor queue updates, kiosk progress | Redis pub/sub fan-out |

---

## 4. The Interview Engine (the "brain")

```mermaid
flowchart LR
    A["Answer in<br/>(transcript / DTMF / tap)"] --> N["Normalizer<br/>lexicon: 'chakkar' → dizziness"]
    N --> X["Extractor (LLM)<br/>question + answer + slot schema → JSON"]
    X --> V{"Valid &<br/>confident?"}
    V -- "no" --> C["Clarify / re-ask<br/>(max 2) → keypad fallback"]
    V -- "yes" --> S["Save slot<br/>+ provenance"]
    S --> RFE["Red-Flag Engine"]
    RFE -- "EMERGENCY" --> ESC["Escalate:<br/>alert + transfer"]
    RFE -- "OK" --> SM["State machine:<br/>next node"]
    SM --> RB["Read-back / next question<br/>(pre-generated audio)"]
```

### 4.1 Components

| Component | Type | Description |
|---|---|---|
| Ontology Loader | Code | Loads YAML question banks (`backend/ontology/`), validates against `schema.json`, builds a graph per department mode (allopathy / ayurveda) |
| State Machine | Code (deterministic) | Walks sections in order: Intake → Chief Complaint → HPI (complaint tree) → Past → Surgical → Drugs → Allergies → Family → Personal → Obstetric (only if relevant) → ROS → [Ayurveda] → Wrap-up. Branches on slot values (`if onset == sudden …`) |
| Normalizer | Code + dictionaries | Maps colloquial words in each language to canonical terms before and after extraction |
| Extractor | LLM (Sarvam-30B) | Given the current question, expected slot schema, and the transcript → returns strict JSON (value, unit, confidence, `unclear` flag). Never free-form. |
| Validator | Code | Type/range checks (duration > 0, severity 0–10), confidence threshold, contradiction check |
| Clarifier | LLM + templates | Template re-ask first; LLM-phrased clarification only if template fails; after 2 failures → keypad/touch options |
| Read-back | Templates | "You said the pain started 2 days ago, suddenly. Correct?" — per section, not per question, to save time |
| Red-Flag Engine | Rules (YAML) + optional LLM check | See [07-conversation-design.md §7](07-conversation-design.md) |

### 4.2 Session state (Redis, mirrored to PostgreSQL)

```json
{
  "session_id": "ses_7f3a…",
  "visit_id": "vis_19c2…",
  "language": "te",
  "mode": "allopathy",
  "channel": "phone",
  "current_node": "chest_pain.radiation",
  "section_queue": ["past_history", "drugs", "allergies", "family", "personal", "ros"],
  "slots": { "cc.complaints": ["chest_pain"], "hpi.chest_pain.onset": "sudden", "hpi.chest_pain.duration_days": 2 },
  "retries": { "chest_pain.radiation": 1 },
  "red_flags": [],
  "started_at": "2026-09-10T09:12:03+05:30"
}
```

---

## 5. Key flows (sequence diagrams)

### 5.1 One voice turn

```mermaid
sequenceDiagram
    autonumber
    participant Pt as Patient
    participant T as Telephony / WebRTC
    participant VG as Voice Gateway
    participant STT as Saaras v3
    participant IE as Interview Engine
    participant LLM as Sarvam-30B
    participant RF as Red-Flag Engine
    participant TTS as Audio cache / Bulbul v3

    VG->>TTS: audio(node="chest_pain.onset", lang="te")
    TTS-->>VG: pre-generated clip
    VG->>T: play question
    Pt->>T: speaks
    T->>VG: audio stream (8 kHz phone / 16 kHz WebRTC)
    VG->>VG: Silero VAD + turn detection
    VG->>STT: utterance audio
    STT-->>VG: transcript (+ confidence)
    VG->>IE: submit_answer(session, transcript)
    IE->>LLM: extract(question, transcript, slot schema)
    LLM-->>IE: {"onset":"sudden","confidence":0.92}
    IE->>RF: evaluate(slots)
    alt emergency rule matched
        RF-->>IE: EMERGENCY(rule_id)
        IE-->>VG: escalate
    else normal
        IE->>IE: validate · persist · choose next node
        IE-->>VG: next node (+ read-back text if section done)
        VG->>TTS: audio(next node) / synthesize(read-back)
    end
```

### 5.2 Red-flag escalation

```mermaid
sequenceDiagram
    autonumber
    participant IE as Interview Engine
    participant RF as Red-Flag Engine
    participant DB as PostgreSQL
    participant WS as Realtime hub
    participant TR as Triage dashboard
    participant VG as Voice Gateway
    participant Pt as Patient

    IE->>RF: evaluate(slots)
    RF-->>IE: EMERGENCY (RF-CARD-01: chest pain + dyspnoea + sweating)
    IE->>DB: insert red_flag_alert, visit.priority = emergency
    IE->>WS: publish alert.created
    WS-->>TR: 🚨 flashing alert + evidence + phone number
    IE->>VG: escalate(session)
    VG->>Pt: "Please do not wait. Go to the emergency desk now / call 108." (own language)
    alt at hospital (kiosk) or nurse line configured
        VG->>VG: transfer call / kiosk shows "Help is coming" + staff buzzer
    end
    TR->>DB: nurse acknowledges → resolves
```

### 5.3 Document processing

```mermaid
sequenceDiagram
    autonumber
    participant Pt as Patient (phone / kiosk)
    participant API as Core API
    participant S3 as MinIO
    participant Q as Celery queue
    participant W as Document worker
    participant OCR as Sarvam Vision / Claude Haiku 4.5
    participant LLM as Sarvam-105B
    participant DB as PostgreSQL

    API->>Pt: SMS/WhatsApp secure upload link (token, expires 24 h)
    Pt->>API: upload photo(s)
    API->>S3: store encrypted original
    API->>Q: enqueue process_document(doc_id)
    Q->>W: task
    W->>W: OpenCV: crop, deskew, denoise, detect doc type
    W->>OCR: image → text (+ confidence)
    alt low confidence / handwriting
        W->>OCR: fallback model (Claude Haiku 4.5 vision)
    end
    W->>LLM: text → entities JSON (diagnoses, meds, labs, procedures, dates)
    W->>W: normalize (brand→generic, LOINC, SNOMED), lab range check, drug interaction check
    W->>DB: documents, document_entities, clinical_flags
    W->>Q: enqueue regenerate_summary(visit_id)
```

### 5.4 Summary → doctor → FHIR

```mermaid
sequenceDiagram
    autonumber
    participant SG as Summary Generator
    participant LLM as Sarvam-105B
    participant DB as PostgreSQL
    participant WS as Realtime hub
    participant Dr as Doctor dashboard
    participant IN as Integration
    participant FH as HAPI FHIR / HIS
    participant AB as ABDM

    SG->>DB: load history_items + document_entities + flags
    SG->>LLM: structured facts → summary JSON (HPI narrative, ordered sections)
    LLM-->>SG: summary JSON
    SG->>SG: verify every sentence maps to a stored fact (no new facts)
    SG->>DB: summaries(version n, status=draft)
    SG->>WS: visit.summary_ready
    WS-->>Dr: patient appears in queue with ✅ summary
    Dr->>DB: edits (summary_edits audit) → confirm
    DB->>IN: on confirm
    IN->>IN: build FHIR bundle (OPConsultRecord + HealthDocumentRecord)
    IN->>FH: POST bundle
    IN->>AB: link care context to ABHA (HIP flow, with consent)
    IN->>DB: fhir_exports status
```

### 5.5 Identify & consent (call start)

```mermaid
sequenceDiagram
    autonumber
    participant Pt as Patient
    participant VG as Voice Gateway
    participant API as Core API
    participant AB as ABDM sandbox
    participant SMS as SMS gateway

    VG->>Pt: greeting + language menu (audio in 3 languages)
    Pt->>VG: "Telugu" / presses 2
    VG->>Pt: "Please say or type your ABHA number or mobile number"
    Pt->>VG: digits (DTMF preferred for numbers)
    VG->>API: abha/verify/init
    API->>AB: request OTP
    AB-->>Pt: OTP by SMS
    Pt->>VG: OTP via keypad
    VG->>API: abha/verify/confirm → patient profile
    VG->>Pt: consent explanation (audio, 45 s, own language)
    Pt->>VG: "Avunu" / presses 1
    VG->>API: consents (purposes, audio evidence uri)
    API->>SMS: consent confirmation SMS with revoke instructions
```

---

## 6. Visit lifecycle

```mermaid
stateDiagram-v2
    [*] --> REGISTERED
    REGISTERED --> CALL_SCHEDULED: outbound call queued
    REGISTERED --> INTERVIEW_IN_PROGRESS: kiosk / inbound call
    CALL_SCHEDULED --> INTERVIEW_IN_PROGRESS: patient answers
    CALL_SCHEDULED --> CALL_SCHEDULED: no answer (retry ≤ 3)
    INTERVIEW_IN_PROGRESS --> INTERVIEW_COMPLETE
    INTERVIEW_IN_PROGRESS --> EMERGENCY_ESCALATED: red flag
    INTERVIEW_IN_PROGRESS --> INTERVIEW_IN_PROGRESS: dropped → resumed
    INTERVIEW_COMPLETE --> SUMMARY_READY: summary generated
    SUMMARY_READY --> SUMMARY_READY: new document → regenerated
    SUMMARY_READY --> IN_CONSULTATION: doctor opens
    EMERGENCY_ESCALATED --> IN_CONSULTATION: seen by ER / triage
    IN_CONSULTATION --> CONFIRMED: doctor confirms
    CONFIRMED --> CLOSED: FHIR pushed, temp data wiped
    CALL_SCHEDULED --> ABANDONED: unreachable
    ABANDONED --> INTERVIEW_IN_PROGRESS: kiosk fallback
    INTERVIEW_IN_PROGRESS --> CONSENT_DECLINED: patient says no
    CONSENT_DECLINED --> IN_CONSULTATION: routine OPD (no AI history)
```

---

## 7. AI provider abstraction

All AI calls go through small interfaces so the provider can change without touching business logic.

```python
class STTProvider(Protocol):
    async def transcribe_stream(self, audio: AsyncIterator[bytes], lang: str, sample_rate: int) -> AsyncIterator[Transcript]: ...

class TTSProvider(Protocol):
    async def synthesize(self, text: str, lang: str, voice: str) -> bytes: ...

class LLMProvider(Protocol):
    async def extract(self, prompt: str, schema: dict) -> dict: ...          # strict JSON
    async def generate(self, prompt: str, schema: dict | None = None) -> str | dict: ...

class OCRProvider(Protocol):
    async def read(self, image: bytes, hints: dict) -> OCRResult: ...        # text + blocks + confidence
```

| Interface | Default (cloud) | Fallback | On-prem |
|---|---|---|---|
| STT | Sarvam Saaras v3 | Bhashini ASR | AI4Bharat IndicConformer |
| TTS | Sarvam Bulbul v3 | Bhashini TTS | AI4Bharat Indic Parler-TTS |
| LLM (live) | Sarvam-30B | Sarvam-105B | Sarvam-30B via vLLM |
| LLM (summary) | Sarvam-105B | Claude Haiku 4.5 | Sarvam-105B via vLLM |
| OCR | Sarvam Vision | Claude Haiku 4.5 (vision) | Surya / PaddleOCR |

Selection is by environment variables (`STT_PROVIDER=sarvam`, …) — see [04-tech-stack.md §9](04-tech-stack.md).

---

## 8. Latency budget (voice turn)

| Stage | Target | Notes |
|---|---|---|
| End-of-speech detection (VAD + turn model) | 200–300 ms | Longer silence threshold for elderly (configurable) |
| STT (streaming, final) | ≤ 300 ms | Streaming partials start during speech |
| Normalizer + LLM extraction | ≤ 600 ms | Sarvam-30B, short prompt, cached system prompt |
| Red-flag + state machine | ≤ 20 ms | Pure code |
| Next audio start | ≤ 100 ms | Pre-generated clips; live TTS only for read-backs (~300 ms) |
| **Total (patient stops → AI speaks)** | **≤ 1.5 s (p90)** | Filler sound ("hmm…") if > 1.2 s |

---

## 9. Deployment views

### 9.1 Hackathon / demo (single cloud VM or laptop)

```mermaid
flowchart LR
    subgraph VM["Docker Compose on 1 VM (8 vCPU, 16 GB)"]
        NG["nginx (TLS)"] --> FE["frontend (static)"]
        NG --> API["api (FastAPI)"]
        NG --> VG["voice (Pipecat)"]
        API --> PG[("postgres")]
        API --> RD[("redis")]
        WK["worker (Celery)"] --> RD
        WK --> S3[("minio")]
        API --> FH["hapi-fhir"]
    end
    VG --> SAR["Sarvam APIs"]
    WK --> SAR
    API --> ABDM["ABDM sandbox"]
    VG --> TEL["Exotel / Twilio (optional)"]
```

### 9.2 Hospital on-premise (production target)

```mermaid
flowchart LR
    subgraph LAN["Hospital LAN (no patient data leaves)"]
        K1["Kiosks (touch + handset)"] --> LB["nginx / load balancer"]
        DRD["Doctor PCs"] --> LB
        LB --> APP["App nodes ×2<br/>API · Voice · Workers"]
        APP --> DB[("PostgreSQL primary + replica")]
        APP --> OBJ[("MinIO (encrypted)")]
        APP --> GPU["GPU server<br/>vLLM: Sarvam-30B/105B<br/>IndicConformer · Indic Parler-TTS · OCR"]
        APP --> HISX["Hospital HIS"]
    end
    APP -- "SIP trunk / PRI" --> TELCO["Telecom operator"]
    APP -- "ABDM gateway (internet, TLS)" --> ABDMG["ABDM"]
```

### 9.3 Capacity estimate (5,000 patients/day)
- Interviews concentrated in ~6 hours, ~8 min each → ≈ **110 concurrent calls average, ~150 peak**.
- Voice workers: ~10–15 processes (verify in load test).
- LLM tokens: ~100K tokens/patient → ~500M tokens/day → cloud cost dominated by STT/TTS; on-prem needs ≥ 1–2 inference GPUs (size by load test).
- Documents: ~2 pages/patient → 10,000 pages/day → OCR worker pool of 4–8.

---

## 10. Failure handling & fallbacks

| Failure | Detection | Behaviour |
|---|---|---|
| STT low confidence | confidence < threshold | Re-ask once → offer keypad/touch options |
| STT provider down | timeouts / 5xx | Switch to fallback provider (circuit breaker); if none, switch to keypad-only mode |
| LLM timeout | > 2 s | Template-based slot parse for closed questions; skip-and-flag for free text |
| Call dropped | telephony event | Session kept 24 h; auto call-back once; resume at last node |
| Patient unreachable | 3 attempts | Visit → ABANDONED; kiosk fallback on arrival |
| OCR low confidence | per-block confidence | Fallback OCR model; entity marked "unverified"; doctor sees original image |
| ABDM sandbox down | errors | Continue with mobile-OTP identity; link to ABHA later (retry queue) |
| HIS push fails | non-2xx | Retry with backoff; summary still visible in doctor dashboard |
| Red-flag engine error | exception | **Fail safe** → treat as potential emergency, alert triage |

---

## 11. Cross-cutting concerns

| Concern | Approach | Detail |
|---|---|---|
| Authentication | Staff: JWT (short-lived access + refresh), roles `doctor`, `nurse`, `registration`, `admin`. Patients: ABHA/mobile OTP; upload links: single-use signed tokens | [10](10-security-privacy.md) |
| Authorization | Role-based + department scoping (doctor sees own department queue) | [10](10-security-privacy.md) |
| Encryption | TLS 1.2+ everywhere; AES-256 at rest (MinIO SSE, PostgreSQL column encryption for mobile/ABHA) | [10](10-security-privacy.md) |
| Audit | Every read/write of patient data → `audit_logs` | [09](09-data-model-and-api.md) |
| Observability | Structured JSON logs (no PHI), request IDs, Prometheus metrics (latency per stage, STT confidence, call outcomes) | [11](11-testing-evaluation.md) |
| i18n | UI strings `frontend/src/i18n/*.json`; question text in ontology YAML per language; pre-generated audio per language | [07](07-conversation-design.md) |
| Configuration | `.env` + typed settings (`app/core/config.py`) | [04](04-tech-stack.md) |
