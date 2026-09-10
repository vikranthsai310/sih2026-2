# 01 · Idea Document — MediKiosk

> AI clinical-history platform that takes a patient's full history **in their own language, before they meet the doctor**.

| Field | Value |
|---|---|
| Problem Statement ID | **26047** |
| Title | Patient Case-Taking Software |
| Organization | Ministry of Ayush |
| Department | All India Institute of Ayurveda (AIIA), New Delhi |
| Category | Software |
| Theme | MedTech / BioTech / HealthTech |
| Project name | **MediKiosk** |

---

## 1. One-line pitch

**"The patient's history is taken by an AI phone call in their own language before they reach the hospital — so when they walk in, the doctor already has a complete, structured summary on screen."**

---

## 2. The problem

### 2.1 History-taking is the most important step — and the one being cut
- A well-taken history gives the correct diagnosis in **70–80 % of cases**, even before examination or tests.
- Indian government tertiary hospitals see **4,000–10,000 OPD patients per day**.
- Consultation time is **2–5 minutes** (BMJ Open 2017, 67 countries: India's average primary-care consult ≈ 2 minutes).
- In those minutes the doctor must elicit history, examine, read old records, diagnose, counsel and prescribe → **history is under-elicited**, comorbidities are missed, the same questions are repeated every visit, and diagnostic errors rise.

### 2.2 Ayurveda needs even more history
Ayurvedic assessment (Trividha, Ashtavidha, **Dashavidha Pariksha**) requires Prakriti, Vikriti, Agni, Koshtha, Ahara-Vihara, Nidana and Samprapti — far more than allopathic intake. Within OPD time it is effectively impossible, so practitioners abbreviate the very assessment that defines personalised Ayurvedic care.

### 2.3 Paper records are fragmented
Patients carry handwritten prescriptions, lab reports, discharge summaries — multiple providers, multiple languages, no order. The doctor skims them during the consultation. There is **no first-mile system** that digitizes and organizes them before the encounter, and nothing feeds them into ABDM.

### 2.4 Why existing solutions fall short

| Existing approach | Why it fails |
|---|---|
| Hospital registration systems | Capture only name, age, department, token — **no clinical history** |
| Mobile health apps / chatbots | Need smartphone literacy, data, app install → exclude elderly, rural, low-literacy, first-visit patients (the bulk of OPD load) |
| Nurse-led history desks | Human-resource-limited; cannot scale to 5,000+ patients/day; same bottleneck |
| Generic document scanners | Produce images, not structured clinical data; no timeline; no ABHA link |

---

## 3. Our solution

MediKiosk moves history-taking **out of the consultation room** and hands it to an AI that speaks the patient's language.

### 3.1 Three channels, one record

| Channel | Who it's for | What happens |
|---|---|---|
| 📞 **AI voice call** (primary) | Everyone with any phone — including ₹1,000 feature phones | After registration / booking, the AI calls the patient (or they give a missed call). Full history interview by voice, keypad fallback ("press 1 for yes") |
| 🖥️ **Hospital kiosk** | Walk-in patients, patients who missed the call, anyone with paper documents | Touchscreen + **telephone handset** (same call experience, noise-free) + document scanner/camera |
| 📱 **Upload link** (SMS / WhatsApp) | Patients with a smartphone | Photograph old prescriptions and reports; they are digitized automatically |

All three write into the **same visit record**; the doctor sees one summary.

### 3.2 Four modules (mapped to the problem statement)

| Module | What it does | Key features |
|---|---|---|
| **A — Conversational History Engine** | Doctor-style interview by voice + touch/keypad | Adaptive questioning (SOCRATES etc.), dual-mode input, native-language TTS, **Ayurveda mode** (Dashavidha Pariksha, Prakriti, Agni, Koshtha, Ahara-Vihara), **red-flag detection** with instant triage alert |
| **B — Document Digitization & Intelligence** | OCR + extraction from prescriptions, lab reports, discharge summaries | Printed + handwritten, multilingual; extracts diagnoses, medicines+doses, lab values+ranges, procedures; **chronological timeline**; **abnormal-value & drug-interaction flags** |
| **C — Structured Summary Generator** | Combines interview + documents into one physician-ready summary | Standard format (CC → HPI → Past → Drug/Allergy → Family → Personal → ROS → Investigations → Ayurveda); **editable draft, never a diagnosis**; bilingual (doctor: English/Hindi, patient: audio confirmation in own language) |
| **D — Consent, Privacy & ABDM Integration** | Trust and interoperability layer | ABHA verification, granular revocable consent with audio explanation (DPDP Act 2023), encryption, session wipe, FHIR push to HIS + ABHA PHR |

### 3.3 End-to-end journey

```
REGISTER ──▶ 📞 AI CALL ──────────▶ 📷 DOCUMENTS ──────▶ 🧠 SUMMARY ──────▶ 👨‍⚕️ CONSULT
token +      language, ABHA,        upload link or       merged, coded,      doctor reads in
phone no.    consent, history       kiosk scan → OCR     FHIR → HIS/ABHA     30 s, edits,
             interview              → timeline, flags                        confirms
                 │
                 └─ 🚨 red flag → call transferred to triage nurse + alert on triage screen
```

| Step | Patient | System |
|---|---|---|
| 1. Identify | Picks language, gives ABHA/mobile + OTP, hears consent, says "yes" | Verifies via ABDM, records consent (audio evidence + SMS) |
| 2. Converse | Answers questions by speaking or pressing keys | Ontology chooses questions; LLM understands answers; red-flag rules run after every answer |
| 3. Scan | Sends photos / scans documents | OCR → entity extraction → timeline → abnormal flags |
| 4. Summarize & route | — | Summary generated, coded (SNOMED CT / ICD / LOINC / NAMASTE), FHIR bundle to HIS & ABHA, patient queued with summary |
| 5. Consult | Meets the doctor | Doctor reviews, edits, confirms; record finalized; temporary data wiped |

---

## 4. Users & personas

| Persona | Profile | Needs | How MediKiosk helps |
|---|---|---|---|
| **Lakshmamma, 68** — patient | Rural, Telugu-speaking, cannot read, feature phone, knee pain + diabetes, carries a bag of old papers | Be understood in Telugu; no reading; no app | AI calls in Telugu; keypad fallback; kiosk handset; staff never need to read the bag of papers |
| **Ramesh, 45** — patient | Hindi-speaking auto driver, smartphone, 3-year-old diabetes & BP papers | Quick, no waiting, show old reports | Call while in queue; WhatsApp photos of reports; timeline built automatically |
| **Dr. Sharma** — Ayurveda physician, AIIA OPD | 120+ patients/day, wants Prakriti/Agni/Koshtha but has no time | Complete Ayurvedic + allopathic history in seconds | Summary with Dashavidha section, flagged labs, editable draft |
| **Priya** — triage nurse | Manages the queue; responsible for emergencies | Know instantly who is critical | Red-flag alerts with evidence; transferred calls; priority re-queue |
| **Hospital IT / Medical Superintendent** | Owns HIS, compliance, budgets | ABDM compliance, low cost, data security | FHIR/ABDM ready, on-prem option, < ₹10/patient estimate, audit logs |

---

## 5. What makes MediKiosk different

| Capability | Registration kiosks | Health apps / chatbots | Nurse desk | **MediKiosk** |
|---|:-:|:-:|:-:|:-:|
| Clinical history (HPI, ROS…) | ❌ | ⚠ text only | ✅ slow | ✅ |
| Works on a feature phone, zero literacy | ❌ | ❌ | ✅ | ✅ |
| Native-language voice | ❌ | ⚠ | ✅ | ✅ |
| Before arrival (saves hospital time) | ❌ | ⚠ | ❌ | ✅ |
| Document digitization + timeline | ❌ | ❌ | ❌ | ✅ |
| Red-flag emergency escalation | ❌ | ⚠ | ✅ | ✅ |
| Ayurveda (Dashavidha) assessment | ❌ | ❌ | ❌ | ✅ |
| ABDM / FHIR integration | ⚠ | ⚠ | ❌ | ✅ |
| Scales to 5,000+ patients/day | ✅ | ✅ | ❌ | ✅ |

### Five differentiators to stress in the pitch
1. **Call-first, not app-first** — reaches the elderly, rural and low-literacy patients that apps exclude.
2. **Safety by design** — a clinical ontology decides *what* to ask; AI only *understands* answers; emergencies are caught by deterministic rules; the doctor always confirms.
3. **Ayurveda-native** — real Dashavidha/Prakriti/Agni/Koshtha capture with NAMASTE coding, built for AIIA.
4. **Indian AI stack** — Sarvam models (IndiaAI Mission), open weights → can run fully on-premise in the hospital.
5. **ABDM-ready** — ABHA verification, consent artefacts, FHIR R4 bundles to HIS and PHR.

---

## 6. Ayurveda mode (AYUSH)

Activated automatically for Ayurveda OPD departments.

| Parameter | Meaning | How MediKiosk captures it |
|---|---|---|
| Prakriti | Constitution (Vata/Pitta/Kapha) | Validated-style Prakriti questionnaire (build, skin, hair, appetite, sleep, temperament…) scored by rules |
| Vikriti | Current dosha imbalance | Symptom-to-dosha mapping from the interview |
| Sara | Tissue excellence | Partly self-report; **marked for physician examination** |
| Samhanana | Body compactness | Self-report + picture choices |
| Pramana | Body measurements | Height, weight → BMI |
| Satmya | Habituation / adaptability | Diet, climate, habit questions |
| Sattva | Mental strength | Simple psychological questions |
| Ahara Shakti | Food intake & digestion capacity | Appetite, meal frequency, digestion |
| Vyayama Shakti | Exercise capacity | Functional questions ("can you climb 2 floors?") |
| Vaya | Age | From ABHA / registration |
| + Agni, Koshtha, Ahara-Vihara, Nidana | Digestive fire, bowel nature, diet & lifestyle, causes | Dedicated question sets |

> Items needing touch/observation (Nadi, Jihva, Sparsha, Sara) are **explicitly marked "for physician examination"** — MediKiosk captures what is patient-reportable and never pretends otherwise.

---

## 7. Technology in one table

| Layer | Choice |
|---|---|
| Speech-to-text | Sarvam **Saaras v3** (22 Indic languages, 8 kHz telephony, code-mix) · on-prem: AI4Bharat IndicConformer |
| Brain | Clinical ontology + state machine + **Sarvam-30B** (live) / **Sarvam-105B** (summary) |
| Text-to-speech | Sarvam **Bulbul v3** + pre-generated question audio · on-prem: AI4Bharat Indic Parler-TTS |
| OCR | **Sarvam Vision** · Claude Haiku 4.5 fallback for hard handwriting |
| Voice framework | **Pipecat** + Exotel/Twilio telephony, WebRTC for kiosk/demo |
| Backend / frontend | FastAPI, PostgreSQL, Redis, Celery, MinIO · React + TypeScript |
| Interop | FHIR R4 (NRCeS profiles), HAPI FHIR, ABDM sandbox |

Full details: [04-tech-stack.md](04-tech-stack.md).

---

## 8. Expected impact

> Figures below are **targets / estimates** to be validated in testing ([11-testing-evaluation.md](11-testing-evaluation.md)).

| Metric | Today (typical) | With MediKiosk (target) |
|---|---|---|
| Doctor time spent eliciting history | 1.5–3 min of a 2–5 min consult | **< 30 s** to read the summary |
| History completeness (sections covered) | Often CC + a few questions | **All 8 standard sections** + Ayurveda |
| Old documents reviewed | Skimmed, if at all | **100 % digitized**, timeline + flags |
| Emergency detection before queueing | Depends on patient speaking up | **Automatic** red-flag alert |
| Languages supported | Doctor's languages | Hindi, Telugu, English (MVP) → 22 languages |
| Cost per patient | Staff time | **~₹5–10** (cloud APIs, estimate) · near zero on-prem after hardware |

---

## 9. Scope

### MVP (hackathon)
- AI voice interview (browser call + optional phone number) in **Hindi, Telugu, English**
- 6 complaint trees (chest pain, fever, abdominal pain, joint pain, cough, headache) + all standard history sections
- Red-flag engine with triage dashboard + call transfer simulation
- Kiosk UI (touch + voice), mobile upload page
- Document OCR → extraction → timeline → abnormal lab flags
- Summary generator + doctor dashboard (edit/confirm)
- Ayurveda mode (Prakriti, Agni, Koshtha, Dashavidha self-reportable items)
- ABHA verification (ABDM sandbox) + consent records + FHIR bundle export

### Stretch
- Real PSTN calling via Exotel, WhatsApp Business upload, drug–drug interaction alerts, Tamil, analytics dashboard

### Future
- All 22 scheduled languages, on-prem GPU deployment, HIS vendor integrations, follow-up visit comparisons ("what changed since last visit"), multi-hospital rollout

---

## 10. Alignment with national missions

| Mission / law | How MediKiosk aligns |
|---|---|
| **Ayushman Bharat Digital Mission (ABDM)** | Solves the first-mile capture problem; ABHA verification; FHIR bundles; HIP linking |
| **IndiaAI Mission** | Uses Indian foundation models (Sarvam) trained under the mission |
| **Bhashini** | Compatible speech/translation layer; path to all 22 languages |
| **DPDP Act 2023** | Consent-first, purpose-limited, revocable, audit-logged, deletion on request |
| **Ministry of Ayush / NAMASTE** | Ayurvedic history captured and coded with NAMASTE / ICD-11 TM2 |

---

## 11. Top risks (full list in [12-project-plan.md](12-project-plan.md))

| Risk | Mitigation |
|---|---|
| Speech recognition errors (accents, noise, 8 kHz phone audio) | Telephony-trained STT, read-back confirmation, keypad fallback, handset at kiosk |
| AI hallucination in history | Ontology-driven questions, JSON-only extraction, source links, doctor confirmation |
| Handwritten OCR errors | Confidence scores, original image beside extracted text, fallback model |
| Missed emergency | Deterministic rules tested against a red-flag suite; any doubt → escalate |
| Privacy breach | Encryption, least-privilege access, auto-deletion, on-prem option |
