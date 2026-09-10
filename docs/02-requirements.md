# 02 · Requirements (SRS) — MediKiosk

Software Requirements Specification: what the system must do, how well, and under which constraints.
Related: [01-idea.md](01-idea.md) · [03-architecture.md](03-architecture.md) · [07-conversation-design.md](07-conversation-design.md) · [09-data-model-and-api.md](09-data-model-and-api.md) · [10-security-privacy.md](10-security-privacy.md) · [11-testing-evaluation.md](11-testing-evaluation.md)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements of **MediKiosk**, the AI clinical-history platform built for SIH 2026 Problem Statement **26047 — Patient Case-Taking Software** (Ministry of Ayush · AIIA). It is the reference for developers, testers, the clinical content team and evaluators.

### 1.2 Scope
MediKiosk:
- takes a structured clinical history (allopathic + Ayurvedic) from patients **before consultation**, through an **AI voice call**, a **hospital kiosk** (handset + touch), or both;
- digitizes prior **prescriptions, lab reports and discharge summaries** into structured, dated, flagged data;
- generates a **physician-ready, editable summary** and delivers it to the doctor's dashboard;
- detects **red-flag emergencies** and alerts triage staff;
- captures **DPDP-compliant consent**, verifies identity via **ABHA**, and exports **FHIR R4** bundles to the HIS / ABDM.

MediKiosk does **not** diagnose, prescribe or give medical advice.

### 1.3 Priority legend
| Tag | Meaning |
|---|---|
| **MVP** | Must be working in the hackathon demo |
| **Stretch** | Build if time permits; design must allow it |
| **Future** | Post-hackathon; design must not block it |

PS module column (A/B/C/D) maps each requirement to the problem statement: **A** Conversational History Engine · **B** Document Digitization · **C** Summary Generator · **D** Consent, Privacy & ABDM.

### 1.4 Definitions & acronyms

| Term | Meaning |
|---|---|
| **ABDM** | Ayushman Bharat Digital Mission — India's national digital health infrastructure |
| **ABHA** | Ayushman Bharat Health Account — 14-digit health ID (ABHA number) and `name@abdm` address |
| **HIP** | Health Information Provider — an ABDM entity that holds and shares records (e.g. the hospital) |
| **HIU** | Health Information User — an ABDM entity that requests records with patient consent |
| **Consent artefact** | ABDM digital record of a patient's consent (purpose, scope, validity) |
| **FHIR R4** | HL7 Fast Healthcare Interoperability Resources, release 4 |
| **NRCeS** | National Resource Centre for EHR Standards — publishes India's FHIR profiles and distributes SNOMED CT |
| **HIS / EMR** | Hospital Information System / Electronic Medical Record |
| **DPDP Act** | Digital Personal Data Protection Act, 2023 |
| **PHI** | Personal health information |
| **CC / HPI / ROS** | Chief complaint / History of present illness / Review of systems |
| **SOCRATES** | Pain history mnemonic: Site, Onset, Character, Radiation, Associations, Time course, Exacerbating/relieving, Severity |
| **OLDCARTS** | Generic symptom mnemonic: Onset, Location, Duration, Character, Aggravating/Alleviating, Radiation, Timing, Severity |
| **Red flag** | Symptom pattern suggesting an emergency (e.g. acute chest pain with breathlessness) |
| **DTMF** | Dual-tone multi-frequency — phone keypad presses |
| **VAD** | Voice activity detection |
| **STT / ASR** | Speech-to-text / automatic speech recognition |
| **TTS** | Text-to-speech |
| **OCR** | Optical character recognition |
| **LLM** | Large language model |
| **Ontology** | MediKiosk's YAML question banks defining nodes, slots and branches |
| **Slot** | A single structured history field, e.g. `hpi.chest_pain.onset` |
| **Prakriti** | Ayurvedic constitution (Vata / Pitta / Kapha proportions) |
| **Vikriti** | Current dosha imbalance |
| **Agni** | Digestive capacity (e.g. sama, vishama, tikshna, manda) |
| **Koshtha** | Bowel nature (mridu, madhya, krura) |
| **Ahara-Vihara** | Diet and lifestyle |
| **Nidana / Samprapti** | Causative factors / pathogenesis |
| **Dashavidha Pariksha** | Ten-fold Ayurvedic examination: Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya |
| **NAMASTE** | National AYUSH Morbidity and Standardized Terminologies Electronic — Ministry of Ayush terminology |
| **ICD-11 TM2** | WHO ICD-11 Traditional Medicine Chapter, Module 2 |
| **SNOMED CT / LOINC / ICD** | Clinical terms / lab test codes / disease classification |
| **DLT** | TRAI Distributed Ledger Technology registration required for commercial SMS in India |

### 1.5 References
- SIH 2026 PS 26047 text (Background, Description, Expected solution §3.1–3.4)
- Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025
- ABDM Sandbox documentation (ABHA, HIP, consent manager) · ABDM Health Data Management Policy
- NRCeS FHIR Implementation Guide for ABDM (OPConsultRecord, DiagnosticReportRecord, HealthDocumentRecord, PrescriptionRecord)
- WCAG 2.1 (Level AA)
- Internal: [03-architecture.md](03-architecture.md), [07-conversation-design.md](07-conversation-design.md), [09-data-model-and-api.md](09-data-model-and-api.md)

---

## 2. Overall description

### 2.1 Stakeholders & user classes

| User class | Description | Technical comfort | Primary interface |
|---|---|---|---|
| **Patient** | OPD patient of any age, literacy or language; may have a feature phone only | None assumed | Phone call, kiosk, upload link |
| **Attendant / caregiver** | Family member answering on the patient's behalf (children, elderly, unwell patients) | Low–medium | Same as patient |
| **Registration staff** | Creates visits, issues tokens, helps at kiosks | Medium | Web app (registration pages) |
| **Triage nurse** | Handles red-flag alerts and help requests | Medium | Triage dashboard |
| **Doctor** (allopathic / Ayurvedic) | Reviews, edits, confirms summaries | Medium | Doctor dashboard |
| **Admin / hospital IT** | Users, departments, metrics, audit, integrations | High | Admin pages |
| **Clinical content owner** | Doctor(s) maintaining ontology, red flags, translations | Medium | YAML files + review in PRs |
| **External systems** | ABDM gateway, HIS/FHIR server, telephony, SMS, AI providers | — | APIs |

### 2.2 Operating environment

| Component | Specification |
|---|---|
| **Patient phone** | Any mobile or landline that can receive calls (feature phones included); smartphone only needed for the upload link |
| **Kiosk hardware** | 21–24" capacitive touchscreen (portrait preferred) · wired **telephone handset** with mic (noise isolation) · document camera or 1080p webcam on an arm with a guide mat · speaker with volume limiter · mini-PC (4 cores, 8 GB RAM) · wired LAN or ≥ 4 Mbps connection (estimate) · optional 80 mm thermal token printer · optional staff buzzer / "help" light |
| **Kiosk software** | Chrome (latest) in kiosk mode, auto-start, no OS access |
| **Staff devices** | Desktop/laptop with Chrome/Edge/Firefox (latest two versions), ≥ 1366×768; doctor view also usable on tablets |
| **Server (demo)** | 1 VM, 8 vCPU, 16 GB RAM, Docker Compose |
| **Server (on-prem target)** | 2 app nodes + PostgreSQL primary/replica + MinIO + GPU server for self-hosted models (sizing by load test) |
| **Network** | TLS everywhere; outbound internet to Sarvam / ABDM / telephony (cloud mode); LAN-only PHI in on-prem mode |

### 2.3 Product functions (summary)
1. Identify patient (ABHA / mobile OTP / new registration) and capture consent.
2. Conduct an adaptive, native-language history interview by voice, keypad or touch.
3. Detect red flags after every answer and escalate.
4. Collect and digitize prior medical documents; build a timeline; flag abnormal values.
5. Generate an editable structured summary; show it to the doctor with sources.
6. Export confirmed records as FHIR bundles to HIS / ABHA.
7. Administer users, departments, metrics and audit.

---

## 3. User stories

### 3.1 Patient
| ID | Story |
|---|---|
| US-P1 | As a patient who cannot read, I want the hospital to **call me and ask questions in Telugu**, so I can give my history without help. |
| US-P2 | As a patient, I want to **press keys** when the AI doesn't understand me, so I'm never stuck. |
| US-P3 | As a patient, I want the AI to **repeat back what I said**, so I know it understood correctly. |
| US-P4 | As a patient with old papers, I want to **send photos** or **scan them at the kiosk**, so the doctor sees them without me explaining. |
| US-P5 | As a patient, I want to **hear what my data is used for and say yes or no**, so I stay in control. |
| US-P6 | As a patient whose call dropped, I want to **continue where I left off**, not start again. |
| US-P7 | As an attendant, I want to answer for my elderly parent, and have the record show that I answered. |
| US-P8 | As a patient in pain with breathlessness, I want the system to **send me to emergency immediately**, not make me wait in the queue. |

### 3.2 Triage nurse
| ID | Story |
|---|---|
| US-N1 | As a triage nurse, I want an **instant visual + sound alert** with the reason, so I can reach the patient fast. |
| US-N2 | As a triage nurse, I want to **acknowledge and resolve** alerts with a note, so the team knows it's handled. |
| US-N3 | As a triage nurse, I want to see **kiosk help requests**, so no patient is left stuck. |

### 3.3 Doctor
| ID | Story |
|---|---|
| US-D1 | As a doctor, I want a **one-screen summary in standard format** ready when the patient enters, so I can read it in 30 seconds. |
| US-D2 | As a doctor, I want to **see where each fact came from** (patient answer or document), so I can trust or verify it. |
| US-D3 | As a doctor, I want **abnormal lab values and interactions highlighted**. |
| US-D4 | As a doctor, I want to **edit, confirm or reject** the summary, and I want nothing saved as final without my confirmation. |
| US-D5 | As an Ayurveda physician, I want **Prakriti, Agni, Koshtha and Dashavidha** findings in a separate section, clearly marking items that need my examination. |
| US-D6 | As a doctor, I want to **see the original document image** next to extracted data. |

### 3.4 Registration staff & admin
| ID | Story |
|---|---|
| US-R1 | As registration staff, I want creating a visit to **automatically schedule the AI call** and send the upload link. |
| US-R2 | As registration staff, I want to register a new patient in under a minute. |
| US-A1 | As an admin, I want **metrics** (completion rate, interview time, languages, red flags) to show impact. |
| US-A2 | As an admin, I want an **audit log** of who accessed which patient record. |
| US-A3 | As an admin, I want to configure which departments use **Ayurveda mode**. |

### 3.5 Acceptance criteria (key stories)

**US-P1 — Native-language call**
- *Given* a registered visit with mobile number and preferred language Telugu,
  *When* the AI call connects,
  *Then* the greeting and language menu play, and after the patient selects Telugu every question is spoken in Telugu and answers in Telugu are understood.
- *Given* the interview is complete, *Then* `history_items` contain all mandatory sections (CC, HPI, past, drugs, allergies, family, personal, ROS) or an explicit "not asked / declined / unknown" value.

**US-P2 — Keypad fallback**
- *Given* a question whose answer failed extraction twice,
  *When* the third attempt starts,
  *Then* the system reads numbered options and accepts DTMF input, and the answer is saved with `answer_input = dtmf`.

**US-P6 — Resume dropped call**
- *Given* a call drops at node `chest_pain.radiation`,
  *When* the patient is called back (or calls in) within 24 hours,
  *Then* after identity confirmation the interview resumes at `chest_pain.radiation` with earlier answers intact.

**US-P8 / US-N1 — Red-flag escalation**
- *Given* slots `cc = chest_pain`, `associated ∋ breathlessness`, `associated ∋ sweating`,
  *When* the last of these is saved,
  *Then* within 2 seconds: the interview stops, the patient hears the emergency instruction in their language, a `red_flag_alerts` row with `rule_id` and evidence is created, visit priority becomes `emergency`, and the triage dashboard shows the alert with sound.

**US-D1 — Summary ready**
- *Given* an interview completed,
  *When* ≤ 30 seconds have passed,
  *Then* the doctor queue shows the patient with "summary ready" and the summary contains the standard sections in order with a "draft, not a diagnosis" disclaimer.

**US-D2 — Provenance**
- *Given* any statement in the summary,
  *When* the doctor clicks it,
  *Then* the linked transcript turn(s) or document entity (with image) is shown. Statements without a stored source are not allowed (fact-check).

**US-D4 — Confirmation**
- *Given* a draft summary,
  *When* the doctor edits a field and confirms,
  *Then* a `summary_edits` row is written, `summaries.status = confirmed`, and a FHIR bundle export is queued. Before confirmation no FHIR export occurs.

**US-P5 — Consent**
- *Given* the consent notice has been played,
  *When* the patient declines `history_capture`,
  *Then* no interview questions are asked, no health data is stored, the patient is told to proceed to the registration desk, and the decline is recorded.

---

## 4. Functional requirements

### 4.1 IDN — Identity & ABHA

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-IDN-01 | The system shall let a patient identify with an ABHA number or ABHA address, verified by OTP through the ABDM sandbox. | MVP | D |
| FR-IDN-02 | The system shall allow identification by mobile number + OTP when the patient has no ABHA. | MVP | D |
| FR-IDN-03 | The system shall allow new patient registration (name, gender, year of birth, mobile, preferred language) at the kiosk and by registration staff. | MVP | D |
| FR-IDN-04 | The system shall accept identity numbers and OTPs via DTMF on calls and via a large on-screen numeric keypad on kiosks. | MVP | A, D |
| FR-IDN-05 | The system shall fetch demographics from the ABHA profile after successful verification and pre-fill the patient record. | MVP | D |
| FR-IDN-06 | The system shall match existing patients by ABHA or hashed mobile to prevent duplicates, and confirm identity by reading/showing a masked name before continuing. | MVP | D |
| FR-IDN-07 | The system shall limit OTP attempts to 3 per 15 minutes per identifier. | MVP | D |
| FR-IDN-08 | The system shall record whether answers are given by the patient or an attendant (and the relation). | MVP | A |
| FR-IDN-09 | The system shall store and reuse the patient's preferred language. | MVP | A |
| FR-IDN-10 | The system shall let a kiosk scan the QR code on an ABHA card. | Stretch | D |
| FR-IDN-11 | The system shall support ABHA creation (Aadhaar / mobile-based) through ABDM for patients without ABHA. | Future | D |

### 4.2 CON — Consent

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-CON-01 | The system shall present a consent notice in the patient's selected language, as audio on calls and as audio + icons + text on kiosks, before any health data is captured. | MVP | D |
| FR-CON-02 | The system shall capture consent separately per purpose: `history_capture`, `call_recording`, `document_processing`, `share_with_his`, `link_abha`. | MVP | D |
| FR-CON-03 | The system shall accept consent by voice ("yes"/"no" in the language), DTMF (1/2) or touch, and store method, language, notice version, timestamp and evidence (audio clip or screen event log). | MVP | D |
| FR-CON-04 | The system shall treat `history_capture` as mandatory for the interview; if declined, it shall stop politely, store no health data, and direct the patient to the registration desk. | MVP | D |
| FR-CON-05 | The system shall make optional purposes (`call_recording`, `share_with_his`, `link_abha`) truly optional — declining them shall not block the interview. | MVP | D |
| FR-CON-06 | The system shall enforce consent at the API layer and reject processing without the required purpose (`CONSENT_REQUIRED`). | MVP | D |
| FR-CON-07 | The system shall send an SMS confirming consent, listing purposes and how to withdraw. | MVP | D |
| FR-CON-08 | The system shall allow consent withdrawal through staff/admin and trigger the deletion workflow for data not required to be retained. | MVP | D |
| FR-CON-09 | The system shall allow withdrawal by SMS keyword or IVR option. | Stretch | D |
| FR-CON-10 | The system shall require parent/guardian consent when the patient is under 18, recording the guardian's relation. | MVP | D |
| FR-CON-11 | The system shall version consent notices and keep every past version retrievable. | MVP | D |
| FR-CON-12 | The system shall show consent status per purpose on the doctor dashboard. | MVP | D |
| FR-CON-13 | The system shall honour ABDM consent artefacts for sharing records with HIUs. | Future | D |

### 4.3 VOI — Voice call & telephony

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-VOI-01 | The system shall run the AI interview as a browser/kiosk voice call over WebRTC. | MVP | A |
| FR-VOI-02 | The system shall place outbound AI calls over PSTN (Exotel/Twilio) at a scheduled time after visit creation. | Stretch | A |
| FR-VOI-03 | The system shall support inbound calls and a missed-call-triggered call-back. | Stretch | A |
| FR-VOI-04 | The system shall greet the caller and offer a language menu (MVP: Hindi, Telugu, English) selectable by voice or DTMF. | MVP | A |
| FR-VOI-05 | The system shall stream audio to STT supporting 8 kHz telephony and 16 kHz WebRTC audio. | MVP | A |
| FR-VOI-06 | The system shall detect end of turn using VAD + turn detection, with a configurable silence threshold for elderly speakers. | MVP | A |
| FR-VOI-07 | The system shall support barge-in: stop playback when the patient starts speaking. | MVP | A |
| FR-VOI-08 | The system shall accept DTMF input for yes/no, numbered options and numbers. | MVP | A |
| FR-VOI-09 | The system shall play pre-generated audio for ontology questions and use live TTS only for dynamic text (read-backs, clarifications). | MVP | A |
| FR-VOI-10 | The system shall let the patient ask to repeat (voice "repeat" / key 9) and use a slower speech rate by default for patients aged 60+. | MVP | A |
| FR-VOI-11 | The system shall play a short filler sound if the response is not ready within 1.2 s. | MVP | A |
| FR-VOI-12 | The system shall resume a dropped interview from the last unanswered node within 24 hours. | MVP | A |
| FR-VOI-13 | The system shall retry unanswered outbound calls up to 3 times, then mark the visit `ABANDONED`. | Stretch | A |
| FR-VOI-14 | The system shall transfer the call to the configured triage number on an emergency red flag. | Stretch | A |
| FR-VOI-15 | The system shall, at call end, read back key facts in the patient's language and send the document upload link by SMS. | MVP | A, C |

### 4.4 KIO — Kiosk

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-KIO-01 | The kiosk shall show an attract screen inviting the patient to touch the screen or pick up the handset, with looping audio. | MVP | A |
| FR-KIO-02 | The kiosk shall offer language selection with large labelled buttons and spoken language names. | MVP | A |
| FR-KIO-03 | The kiosk shall offer two interview modes: **handset (voice)** using the same engine as calls, and **touch**. The patient can switch at any time. | MVP | A |
| FR-KIO-04 | The kiosk shall render every question with large text, an icon, audio playback, and answer options usable by touch or voice. | MVP | A |
| FR-KIO-05 | The kiosk shall provide specialised inputs: pain-face scale (0–10), body map, duration picker, big yes/no buttons, "don't know" option. | MVP | A |
| FR-KIO-06 | The kiosk shall show progress and allow going back to the previous question. | MVP | A |
| FR-KIO-07 | The kiosk shall provide a persistent **Help** button that raises a help request on the triage dashboard. | MVP | A |
| FR-KIO-08 | The kiosk shall capture documents with the camera, with on-screen/audio guidance, auto-capture when steady, and multiple pages. | MVP | B |
| FR-KIO-09 | The kiosk shall show thumbnails of captured documents for patient confirmation (no clinical details displayed publicly). | MVP | B |
| FR-KIO-10 | The kiosk shall show an emergency screen with instructions and staff alert when a red flag fires. | MVP | A |
| FR-KIO-11 | The kiosk shall warn after 60 s of inactivity and wipe the session after 90 s. | MVP | D |
| FR-KIO-12 | The kiosk shall show the OPD token and "summary sent to doctor" at completion, and clear all local state. | MVP | C, D |
| FR-KIO-13 | The kiosk shall print the token on a thermal printer. | Stretch | — |
| FR-KIO-14 | The kiosk shall run in locked browser kiosk mode without access to OS or other sites. | MVP | D |

### 4.5 INT — Interview engine

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-INT-01 | The system shall load ontology YAML files and validate them against `ontology/schema.json` at startup, refusing to start with invalid content. | MVP | A |
| FR-INT-02 | The system shall walk sections in the order defined in `flow.yaml` for the visit mode (allopathy / ayurveda). | MVP | A |
| FR-INT-03 | The system shall route the chief complaint to a complaint tree via `complaints/_router.yaml`, falling back to the generic OLDCARTS tree. | MVP | A |
| FR-INT-04 | The system shall branch adaptively on slot values (e.g. ask radiation questions only for pain complaints). | MVP | A |
| FR-INT-05 | The system shall normalise colloquial words using the per-language lexicon before and after extraction. | MVP | A |
| FR-INT-06 | The system shall extract answers into strict JSON matching the node's slot schema, with confidence, rejecting any output that fails schema validation. | MVP | A |
| FR-INT-07 | The system shall re-ask up to `MAX_REASK` (default 2) times, then offer numbered options / touch choices, and always accept "don't know". | MVP | A |
| FR-INT-08 | The system shall read back each completed section and apply corrections the patient gives. | MVP | A |
| FR-INT-09 | The system shall persist every answer immediately as an `interview_turns` row and `history_items` with provenance (`source`, `source_ref`, `confidence`). | MVP | A |
| FR-INT-10 | The system shall skip irrelevant sections and questions (e.g. obstetric history only when applicable). | MVP | A |
| FR-INT-11 | In Ayurveda mode, the system shall capture Prakriti, Agni, Koshtha, Ahara-Vihara, Nidana and the patient-reportable Dashavidha parameters, and mark examination-only items as "for physician examination". | MVP | A |
| FR-INT-12 | The system shall never state a diagnosis or give treatment advice; if asked, it shall reply with a standard deflection ("Your doctor will explain this"). | MVP | A |
| FR-INT-13 | The system shall target a median interview duration of ≤ 8 minutes using skip logic. | MVP | A |
| FR-INT-14 | The system shall support up to 3 chief complaints in one interview, each with its own tree. | Stretch | A |
| FR-INT-15 | The system shall allow the same session to continue across channels (e.g. started on phone, completed at kiosk). | Stretch | A |

### 4.6 RF — Red flags

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-RF-01 | The system shall evaluate red-flag rules after every saved answer. | MVP | A |
| FR-RF-02 | Rules shall be defined in `ontology/red_flags.yaml` with ID (`RF-<SYSTEM>-<nn>`), severity (`emergency` / `urgent`), conditions and patient message per language. | MVP | A |
| FR-RF-03 | On an `emergency` rule, the system shall stop the interview, speak/show the emergency instruction in the patient's language, create an alert with evidence, set visit priority to `emergency`, and publish `alert.created`. | MVP | A |
| FR-RF-04 | On an `urgent` rule, the system shall raise priority and alert triage without stopping the interview. | MVP | A |
| FR-RF-05 | The system shall scan all free-text answers for emergency phrases (e.g. "can't breathe", chest pain, fainting, self-harm), regardless of the current question. | MVP | A |
| FR-RF-06 | The system shall fail safe: any error in rule evaluation shall raise an alert rather than suppress one. | MVP | A |
| FR-RF-07 | For self-harm or suicidal statements, the system shall alert staff and provide the Tele-MANAS helpline (14416) in the patient's language. | MVP | A |
| FR-RF-08 | The system shall store rule ID, rule-set version and triggering evidence with every alert. | MVP | A |
| FR-RF-09 | The system shall run an LLM secondary check on free text to *add* possible red flags for staff review; it shall never suppress a rule-based alert. | Stretch | A |
| FR-RF-10 | A release shall be blocked unless the red-flag test suite passes 100 % (see [11-testing-evaluation.md](11-testing-evaluation.md)). | MVP | A |

### 4.7 DOC — Documents

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-DOC-01 | The system shall send a single-use upload link (SMS) that lets patients upload photos/PDFs from a phone browser without login. | MVP | B |
| FR-DOC-02 | The system shall accept documents scanned at the kiosk, including multi-page capture. | MVP | B |
| FR-DOC-03 | The system shall accept JPG, PNG and PDF, max 10 files and 10 MB per file per visit, and reject other types. | MVP | B |
| FR-DOC-04 | The system shall preprocess images: crop, deskew, orientation fix, denoise, contrast. | MVP | B |
| FR-DOC-05 | The system shall OCR printed and handwritten text in Hindi, English and Telugu (at least), returning per-block confidence. | MVP | B |
| FR-DOC-06 | The system shall retry low-confidence pages with the fallback OCR model and mark remaining low-confidence items as "unverified". | MVP | B |
| FR-DOC-07 | The system shall classify each document as prescription, lab report, discharge summary, imaging report or other (editable by the doctor). | MVP | B |
| FR-DOC-08 | The system shall extract diagnoses, medications (name, dose, frequency, duration, route), lab results (test, value, unit, reference range), procedures, document date and provider. | MVP | B |
| FR-DOC-09 | The system shall normalise medicines (brand → generic) and codes (LOINC for labs, SNOMED CT for diagnoses) using the reference data subsets. | MVP | B |
| FR-DOC-10 | The system shall flag lab values outside the reference range (range printed on the document preferred; else `lab_ranges.csv`), including critical values. | MVP | B |
| FR-DOC-11 | The system shall order documents and entities chronologically into a timeline, flagging undated documents. | MVP | B |
| FR-DOC-12 | The system shall check drug–drug and drug–allergy interactions across interview and document medications. | Stretch | B |
| FR-DOC-13 | The system shall store entity bounding boxes so the doctor can see the highlighted source region. | Stretch | B |
| FR-DOC-14 | The system shall detect duplicate uploads (same image hash). | Stretch | B |
| FR-DOC-15 | The system shall accept documents sent via WhatsApp Business. | Stretch | B |

### 4.8 SUM — Summary

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-SUM-01 | The system shall generate a draft summary within 30 s of interview completion and regenerate it (new version) when new documents are processed. | MVP | C |
| FR-SUM-02 | The summary shall follow the standard order: Chief complaint → HPI → Past medical/surgical → Drugs & allergies → Family → Personal → ROS → Prior investigations → (Ayurveda). | MVP | C |
| FR-SUM-03 | Every summary statement shall reference stored facts (`fact_refs`); a fact-check step shall reject statements with no supporting fact. | MVP | C |
| FR-SUM-04 | The summary shall show a headline (age, sex, main complaint, flags), red flags, abnormal labs, interactions and unverified items at the top. | MVP | C |
| FR-SUM-05 | In Ayurveda mode, the summary shall include an Ayurveda section (Prakriti, Vikriti indicators, Agni, Koshtha, Ahara-Vihara, Dashavidha, Nidana). | MVP | C |
| FR-SUM-06 | The summary shall always carry the disclaimer "AI-generated draft … not a diagnosis". | MVP | C |
| FR-SUM-07 | The doctor-facing summary shall be available in English. | MVP | C |
| FR-SUM-08 | The doctor-facing summary shall be available in Hindi (toggle). | Stretch | C |
| FR-SUM-09 | The patient shall receive an audio confirmation of key facts in their own language at interview end. | MVP | C |
| FR-SUM-10 | Summaries shall be versioned; earlier versions remain viewable. | MVP | C |
| FR-SUM-11 | The system shall send the patient an SMS in their language after the doctor confirms the visit. | Stretch | C |

### 4.9 DSH — Doctor dashboard

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-DSH-01 | The dashboard shall require doctor login and show the queue for the doctor's department. | MVP | C |
| FR-DSH-02 | The queue shall show token, name, age/sex, status, priority, summary-ready indicator and flag counts, sorted emergency → urgent → routine → arrival time. | MVP | C |
| FR-DSH-03 | The patient page shall have tabs: Summary · Timeline · Documents · Ayurveda (if mode) · Transcript. | MVP | C |
| FR-DSH-04 | The doctor shall be able to edit any summary field inline; every edit is audited in `summary_edits`. | MVP | C |
| FR-DSH-05 | The doctor shall be able to confirm or reject the summary (reject requires a reason). | MVP | C |
| FR-DSH-06 | Clicking a statement shall show its source (transcript turn or document entity). | MVP | C |
| FR-DSH-07 | The doctor shall see the original document image and be able to mark extracted entities as verified or corrected. | MVP | B, C |
| FR-DSH-08 | The dashboard shall update in real time (new summaries, documents, alerts) without reload. | MVP | C |
| FR-DSH-09 | The doctor shall be able to print or copy the summary as plain text. | MVP | C |
| FR-DSH-10 | The layout shall let a doctor read headline, flags and HPI without scrolling on a 1366×768 screen. | MVP | C |
| FR-DSH-11 | The dashboard shall support keyboard shortcuts (next patient, confirm, edit). | Stretch | C |
| FR-DSH-12 | The doctor shall see previous visits' confirmed summaries and "what changed since last visit". | Future | C |

### 4.10 TRI — Triage

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-TRI-01 | The triage board shall show new alerts in real time with sound and visual highlight. | MVP | A |
| FR-TRI-02 | Each alert shall show patient name, age/sex, token, channel, phone, rule, evidence and time raised. | MVP | A |
| FR-TRI-03 | The nurse shall be able to acknowledge and resolve alerts (`seen_in_er`, `false_alarm`) with a note. | MVP | A |
| FR-TRI-04 | The board shall list all visits with `emergency` / `urgent` priority. | MVP | A |
| FR-TRI-05 | The board shall show kiosk help requests with kiosk location. | MVP | A |
| FR-TRI-06 | Unacknowledged emergency alerts shall re-alert after 2 minutes and notify a second configured user. | Stretch | A |
| FR-TRI-07 | The system shall send SMS alerts to the duty nurse's phone. | Future | A |

### 4.11 ABD — ABDM & FHIR integration

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-ABD-01 | The system shall integrate ABHA verification with the ABDM sandbox (see FR-IDN-01). | MVP | D |
| FR-ABD-02 | On doctor confirmation, the system shall build a FHIR R4 `document` Bundle with an OPConsultRecord Composition per NRCeS profiles. | MVP | D |
| FR-ABD-03 | The system shall validate bundles against the HAPI FHIR server before export. | MVP | D |
| FR-ABD-04 | The system shall push bundles to the HIS/FHIR endpoint with retries and store status in `fhir_exports`. | MVP | D |
| FR-ABD-05 | The system shall include lab results as DiagnosticReportRecord and scanned documents as HealthDocumentRecord. | Stretch | D |
| FR-ABD-06 | The system shall encode data with SNOMED CT, LOINC, ICD-10/11 and NAMASTE codes from the reference subsets where a match exists. | MVP | D |
| FR-ABD-07 | The system shall add a `Provenance` resource stating AI-drafted content and doctor confirmation. | MVP | D |
| FR-ABD-08 | The system shall link the visit as a care context to the patient's ABHA (HIP flow), only with `link_abha` consent. | Stretch | D |
| FR-ABD-09 | The system shall respond to ABDM HIP data requests after validating the consent artefact. | Future | D |
| FR-ABD-10 | The system shall provide an adapter interface for vendor HIS formats (e.g. HL7 v2). | Future | D |

### 4.12 ADM — Admin & metrics

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-ADM-01 | Admins shall manage staff users (create, deactivate, role, department). | MVP | — |
| FR-ADM-02 | Admins shall configure departments and their mode (allopathy / ayurveda). | MVP | A |
| FR-ADM-03 | Admins shall configure call scheduling (immediately / X minutes after registration / day before). | MVP | A |
| FR-ADM-04 | Admins shall search the audit log by patient, staff user, action and date. | MVP | D |
| FR-ADM-05 | The system shall show basic metrics: patients/day, interview completion rate, median interview time, channel and language mix, red flags raised. | MVP | — |
| FR-ADM-06 | The system shall show quality metrics: summary edit rate, OCR success rate, STT confidence distribution, stage latencies. | Stretch | — |
| FR-ADM-07 | Admins shall view the active ontology/rule versions and reload them without downtime. | Stretch | A |
| FR-ADM-08 | Admins shall view AI provider health and current provider selection. | Stretch | — |
| FR-ADM-09 | Admins shall export anonymised aggregate statistics as CSV. | Future | — |

### 4.13 SEC — Security functions

| ID | Requirement | Priority | PS |
|---|---|---|---|
| FR-SEC-01 | Staff authentication shall use short-lived JWT access tokens (15 min) and refresh tokens (7 days). | MVP | D |
| FR-SEC-02 | Access shall be enforced by role and department scope (see RBAC matrix in [10-security-privacy.md](10-security-privacy.md)). | MVP | D |
| FR-SEC-03 | Mobile numbers and ABHA numbers shall be encrypted at field level; lookups use hashes. | MVP | D |
| FR-SEC-04 | Documents and audio shall be stored encrypted at rest (MinIO SSE). | MVP | D |
| FR-SEC-05 | Every read or write of patient data shall create an `audit_logs` entry. | MVP | D |
| FR-SEC-06 | Application logs shall not contain PHI (scrubbing middleware). | MVP | D |
| FR-SEC-07 | Upload links shall be signed, single-use tokens expiring in 24 h. | MVP | D |
| FR-SEC-08 | Telephony and ABDM webhooks shall be verified by signature. | MVP | D |
| FR-SEC-09 | Login, OTP and upload endpoints shall be rate-limited. | MVP | D |
| FR-SEC-10 | Kiosk sessions and temporary session data shall be wiped on completion or timeout (see FR-KIO-11). | MVP | D |
| FR-SEC-11 | Consent withdrawal shall trigger deletion of data not required by law/hospital policy, with confirmation to the patient. | MVP | D |
| FR-SEC-12 | Scheduled jobs shall enforce the retention schedule. | Stretch | D |
| FR-SEC-13 | Backups shall be encrypted and restore-tested. | Stretch | D |
| FR-SEC-14 | Admin accounts shall require multi-factor authentication. | Future | D |

---

## 5. Non-functional requirements

| ID | Category | Requirement | Target / measure |
|---|---|---|---|
| NFR-01 | Latency | Time from patient finishing speaking to AI starting to speak | **≤ 1.5 s p90**, ≤ 1.0 s p50 |
| NFR-02 | Latency | Kiosk touch answer → next question | ≤ 500 ms p90 |
| NFR-03 | Latency | Interview complete → summary ready | ≤ 30 s p90 |
| NFR-04 | Latency | Document uploaded → entities available | ≤ 60 s p90 per page |
| NFR-05 | Latency | Red flag detected → triage alert shown | ≤ 2 s |
| NFR-06 | Capacity | Concurrent voice interviews | **~150 concurrent** at peak (5,000 patients/day, estimate); horizontal scaling |
| NFR-07 | Capacity | Documents processed | 10,000 pages/day (estimate) |
| NFR-08 | Availability | Service availability during OPD hours | ≥ 99.5 % (production target); graceful degradation to keypad/touch-only if AI providers fail |
| NFR-09 | Reliability | Dropped interviews resumable | 100 % within 24 h; no answer lost after it is acknowledged |
| NFR-10 | Accessibility | Kiosk and upload page conformance | WCAG 2.1 AA; touch targets ≥ 64 px; kiosk body text ≥ 24 px; contrast ≥ 4.5:1; audio for every screen; no timeouts shorter than 60 s without warning |
| NFR-11 | Usability | First-time, untrained patient completes the kiosk flow | ≥ 85 % unassisted completion in usability tests (target) |
| NFR-12 | Usability | Doctor reads the summary | ≤ 30 s to read headline + flags + HPI (target) |
| NFR-13 | Languages | Supported languages | MVP: Hindi, Telugu, English · Stretch: Tamil · Future: 22 scheduled languages |
| NFR-14 | Accuracy | Slot extraction accuracy on eval set | ≥ 90 % (target) |
| NFR-15 | Accuracy | Red-flag detection on test suite | **100 % sensitivity** on the defined suite |
| NFR-16 | Accuracy | Lab value extraction (printed reports) | ≥ 95 % (target); handwritten medicines ≥ 80 % with low-confidence marking (target) |
| NFR-17 | Privacy | Data processed only for consented purposes; minimum retention | See [10-security-privacy.md](10-security-privacy.md) |
| NFR-18 | Security | Transport and storage encryption | TLS 1.2+; AES-256 at rest |
| NFR-19 | Auditability | Access traceability | 100 % of PHI access audited; audit logs immutable to non-admins |
| NFR-20 | Maintainability | Clinical content editable without code changes | Ontology, red flags, lexicon, reference data in YAML/CSV; CI validation |
| NFR-21 | Maintainability | Code quality | Ruff + mypy + ESLint clean; unit test coverage of interview engine & red-flag engine ≥ 80 % |
| NFR-22 | Portability | Deployment modes | Cloud (Docker Compose) and full on-prem (self-hosted models) by configuration only |
| NFR-23 | Interoperability | Standards | FHIR R4 NRCeS profiles; codes SNOMED CT / LOINC / ICD / NAMASTE |
| NFR-24 | Cost | AI cost per patient (cloud) | **≤ ₹10** target (estimate, see [04-tech-stack.md](04-tech-stack.md)) |
| NFR-25 | Observability | Stage-level metrics and PHI-free structured logs | Latency per stage, STT confidence, call outcomes, error rates |

---

## 6. Clinical safety requirements

| ID | Requirement |
|---|---|
| CS-01 | MediKiosk shall never present a diagnosis, differential, triage score to the patient, or treatment advice. It documents history only. |
| CS-02 | All AI-generated content shall be labelled as a draft and require doctor confirmation before becoming part of the record or being exported. |
| CS-03 | The red-flag engine shall be deterministic, version-controlled, clinically reviewed, and fail-safe (errors escalate). |
| CS-04 | Every fact shall carry provenance (interview turn / document entity / doctor edit) and confidence. |
| CS-05 | The summary generator shall not introduce facts absent from stored data (fact-check, FR-SUM-03). |
| CS-06 | Low-confidence items (STT, extraction, OCR) shall be visibly marked "unverified". |
| CS-07 | Patient-reported and document-derived data shall be visually distinguished. |
| CS-08 | Ayurvedic parameters requiring physical examination shall be marked "for physician examination", never inferred. |
| CS-09 | All ontology, red-flag and translation changes shall be reviewed by a clinician before release. |
| CS-10 | The patient shall always have a route to a human (help button, "press 0", staff desk). |

---

## 7. Constraints, assumptions & dependencies

### 7.1 Constraints
- Hackathon timeline and a 6-person team; MVP scope per §4 priorities.
- ABDM integration limited to the **sandbox** during the hackathon.
- Commercial SMS in India requires **DLT-registered** sender ID and templates; until approved, SMS is simulated or sent via trial accounts.
- PSTN calling requires KYC'd numbers with a telephony provider; demo defaults to WebRTC calls.
- No real patient data may be used for development; only synthetic or consented test data.

### 7.2 Assumptions
- Patients have access to a phone (own or attendant's) or can use the kiosk.
- Hospital provides network connectivity for kiosks and staff PCs.
- Clinicians are available to review question banks, translations and red-flag rules.
- Sarvam APIs meet the latency targets for Hindi/Telugu/English (to be verified in Phase 2 testing).

### 7.3 Dependencies

| Dependency | Used for | Risk if unavailable | Mitigation |
|---|---|---|---|
| Sarvam AI (Saaras v3, Sarvam-30B/105B, Bulbul v3, Vision) | STT, LLM, TTS, OCR | Interview cannot understand/speak | Provider adapters; fallback providers; keypad/touch-only mode |
| Anthropic (Claude Haiku 4.5) | OCR/LLM fallback | Hard handwriting stays unverified | Mark unverified; doctor sees image |
| ABDM sandbox | ABHA verification, linking | Identity via ABHA unavailable | Mobile-OTP identity; link later via retry queue |
| Telephony (Exotel/Twilio) | PSTN calls, SMS | No phone calls | WebRTC/kiosk channels |
| HAPI FHIR / HIS | Record export | Export delayed | Retry queue; summary stays on dashboard |
| Pipecat, Silero VAD | Voice pipeline | — | Open source, pinned versions |

---

## 8. Out of scope

- Diagnosis, differential diagnosis, treatment or prescription suggestions.
- Physical examination data capture (vitals devices, Nadi pariksha devices) — Future integration only.
- Appointment booking, billing, pharmacy, lab ordering.
- Telemedicine video consultation.
- Native mobile apps (web upload page only).
- Production HIS vendor integrations beyond FHIR export (Future).
- Languages beyond Hindi, Telugu, English (Tamil is Stretch).

---

## 9. Requirements traceability matrix

### 9.1 Problem statement → requirements

| PS reference | PS requirement | Satisfied by |
|---|---|---|
| §3.3 Module A | Conversational engine with Indian-language ASR, ontology-constrained dialogue manager, TTS | FR-VOI-04/05/09, FR-INT-01/02/06, FR-KIO-03 |
| Module A · Adaptive questioning | Branch on chief complaint & prior answers; complete HPI & ROS | FR-INT-03, FR-INT-04, FR-INT-10, FR-INT-14 |
| Module A · Dual-mode input | Every question answerable by speaking or tapping | FR-KIO-03, FR-KIO-04, FR-KIO-05, FR-VOI-08, FR-INT-07 |
| Module A · AYUSH history mode | Dashavidha Pariksha + Ahara-Vihara | FR-INT-11, FR-SUM-05, FR-ADM-02 |
| Module A · Red-flag detection | Flag emergencies, priority alert to triage | FR-RF-01…10, FR-TRI-01…06, FR-VOI-14, FR-KIO-10 |
| §3.3 Module B | OCR printed & handwritten, multilingual | FR-DOC-04, FR-DOC-05, FR-DOC-06 |
| Module B · Intelligent extraction | Diagnoses, meds + doses, lab values + ranges, procedures | FR-DOC-07, FR-DOC-08, FR-DOC-09 |
| Module B · Chronological organization | Dated medical timeline | FR-DOC-11 |
| Module B · Abnormal-value highlighting | Out-of-range labs, drug interactions | FR-DOC-10, FR-DOC-12 |
| §3.3 Module C | Single physician-ready summary on consultation screen | FR-SUM-01, FR-SUM-04, FR-DSH-01…03 |
| Module C · Standard clinical format | CC → HPI → Past → Drug & allergy → Family → Personal → ROS → Investigations | FR-SUM-02 |
| Module C · Editable & verifiable | Draft to accept, amend, reject; never a diagnosis | FR-DSH-04, FR-DSH-05, FR-DSH-06, FR-SUM-03, FR-SUM-06, CS-01, CS-02 |
| Module C · Bilingual output | Patient audio confirmation; physician summary in English/Hindi | FR-SUM-07, FR-SUM-08, FR-SUM-09, FR-VOI-15 |
| §3.3 Module D | ABHA authentication | FR-IDN-01, FR-IDN-05, FR-ABD-01 |
| Module D · Consent | Explicit, granular, revocable consent with audio explanation | FR-CON-01…13 |
| Module D · HIS/EMR + ABHA PHR via FHIR | Push structured history | FR-ABD-02…09 |
| Module D · Secure processing | Voice & document AI processed securely | FR-SEC-03, FR-SEC-04, NFR-17, NFR-18, NFR-22 |
| Module D · Session termination | Temporary data cleared after submission | FR-KIO-11, FR-KIO-12, FR-SEC-10 |
| §2.3 Challenge 1 | Multilingual, multi-accent voice in noisy hospitals | FR-VOI-05, FR-VOI-06, FR-KIO-03 (handset), FR-INT-05, NFR-13 |
| §2.3 Challenge 2 | Accessibility for low-literacy & elderly | FR-KIO-01…07, FR-VOI-10, NFR-10, NFR-11 |
| §2.3 Challenge 3 | Accurate clinical history structuring (+ Dashavidha) | FR-INT-06, FR-INT-09, FR-INT-11, FR-SUM-02, NFR-14 |
| §2.3 Challenge 4 | Reliable medical document digitization | FR-DOC-04…11, NFR-16 |
| §2.3 Challenge 5 | Privacy, consent & security (DPDP, ABDM) | FR-CON-*, FR-SEC-*, NFR-17…19 |

### 9.2 Patient journey (PS §3.4) → requirements

| Step | Satisfied by |
|---|---|
| 1 — Identify (ABHA/Aadhaar/new, language, audio consent) | FR-IDN-01…11, FR-VOI-04, FR-KIO-02, FR-CON-01…07 |
| 2 — Converse (adaptive voice + touch, red flags) | FR-VOI-*, FR-KIO-03…06, FR-INT-*, FR-RF-* |
| 3 — Scan (upload, digitize, timeline) | FR-DOC-*, FR-KIO-08, FR-KIO-09 |
| 4 — Summarize & route (summary, ABHA, HIS) | FR-SUM-*, FR-ABD-*, FR-DSH-08 |
| 5 — Consult (review, edit, confirm) | FR-DSH-*, FR-SUM-10, CS-02 |

### 9.3 Requirement → verification
Every MVP requirement is verified by at least one test in [11-testing-evaluation.md](11-testing-evaluation.md); the test ID references the FR/NFR ID it covers.
