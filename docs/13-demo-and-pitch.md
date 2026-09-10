# 13 · Demo & Pitch — MediKiosk

How we tell the story: pitch narrative, PPT outline, live demo script, judge Q&A, and a checklist for the day.
Related: [01-idea.md](01-idea.md) · [03-architecture.md](03-architecture.md) · [04-tech-stack.md](04-tech-stack.md) · [05-wireframes.md](05-wireframes.md) · [12-project-plan.md](12-project-plan.md)

> If SIH provides an **official PPT template** or slide limit for idea submission, follow it exactly and map the slides below into it. Numbers marked *estimate* or *target* must stay labelled that way on the slides.

---

## 1. Pitch narrative

**Story arc:** Problem → Solution → Demo → Technology → Impact → Scale → Ask

| Beat | Message | Proof |
|---|---|---|
| **Problem** | Doctors in India's OPDs get 2–5 minutes per patient, so history-taking (the step that gives 70–80 % of diagnoses) gets cut. Ayurveda needs even more history, and paper records arrive in a plastic bag. | Problem statement figures, BMJ Open 2017 |
| **Solution** | MediKiosk takes the full history **before** the consultation through an AI phone call in the patient's own language, digitizes their old documents, and puts a structured summary on the doctor's screen. | Journey diagram |
| **Demo** | A Telugu chest-pain call raises a red flag, then documents are uploaded, the doctor confirms, and the record goes to FHIR/ABHA. Then Ayurveda mode. | Live demo |
| **Technology** | A clinical ontology decides what to ask, Indian AI models (Sarvam) understand and speak, rules catch emergencies, and the doctor always confirms. | Architecture slide |
| **Impact** | *Targets:* history read in < 30 s, all standard sections covered, 100 % of documents digitized, emergencies flagged before queueing. | Impact slide |
| **Scale** | Works on any phone, costs ~₹5–10 per patient (*estimate*), runs on-premise with open-weight models, and is ABDM-ready. | Cost + deployment slide |
| **Ask** | A supervised pilot in an AIIA OPD, with clinical mentorship and access to HIS integration. | Roadmap slide |

### 1.1 Elevator pitch (30 seconds)
> "In India's government hospitals, a doctor gets about two to five minutes per patient. That's barely enough to ask questions, let alone read a bag of old prescriptions. MediKiosk fixes this before the patient enters the room. An AI calls the patient in their own language (Telugu, Hindi, any language) and takes a complete history the way a doctor would, including Ayurvedic assessments like Prakriti and Agni. Old documents are photographed and turned into a timeline. When the patient walks in, the doctor already has a one-page summary with emergencies and abnormal labs flagged. It works on a basic phone, uses Indian AI models, and plugs into ABDM."

### 1.2 Two-minute version
1. **(20 s) Hook:** "Lakshmamma is 68 and speaks only Telugu. She has knee pain, diabetes, and a bag of papers from four hospitals. Her consultation will last about three minutes. What will the doctor miss?"
2. **(25 s) Problem:** 4,000–10,000 OPD patients a day in tertiary hospitals, and 2–5-minute consultations. A good history gives the diagnosis in 70–80 % of cases, yet it's the part that gets cut. Ayurveda's Dashavidha Pariksha is even longer. Existing kiosks only print tokens.
3. **(35 s) Solution:** MediKiosk calls the patient before the visit and runs a doctor-style interview in their language, with the keypad as a fallback. Emergencies such as chest pain with breathlessness go straight to the triage nurse. Documents are photographed via an SMS link or scanned at the kiosk, then digitized into a timeline. The doctor gets a structured, editable summary, and on confirmation it goes to the HIS and ABHA as FHIR.
4. **(25 s) Why it's safe:** The AI never decides what to ask; a clinical ontology reviewed by doctors does. The AI only understands answers, emergency rules are deterministic, and every summary is a draft the doctor confirms.
5. **(15 s) Why it scales:** Any phone and no app. Indian open-weight models (Sarvam, IndiaAI Mission) can run inside the hospital. Estimated cost is under ₹10 per patient.
6. **(10 s) Close:** "Lakshmamma gets heard in her own language, and her doctor gets the full picture in 30 seconds."

---

## 2. PPT outline (idea submission)

| # | Slide title | Key content | Visual |
|---|---|---|---|
| 1 | **MediKiosk: AI Clinical History in Every Indian Language** | PS 26047 · Patient Case-Taking Software · Ministry of Ayush / AIIA · team name, college, members, roles | Logo, phone + kiosk + doctor-screen illustration |
| 2 | **The Problem** | 4,000–10,000 OPD patients/day · 2–5 min consultations (BMJ Open 2017: India ≈ 2 min) · history gives 70–80 % of diagnoses · Ayurveda needs Dashavidha, Prakriti, Agni… · paper records fragmented | 3 big-number tiles + photo-style icon of a crowded OPD |
| 3 | **Why Existing Solutions Fail** | Registration kiosks: demographics only · apps/chatbots: exclude low-literacy and elderly users · nurse desks: don't scale · scanners: images, not data | Comparison table with ❌/⚠ (from [01](01-idea.md) §5) |
| 4 | **Our Solution** | AI call in the patient's own language + kiosk + upload link → one structured summary · four modules A–D mapped to the PS | Three channels flowing into one doctor screen |
| 5 | **How It Works: Patient Journey** | Register → AI call (language, ABHA, consent, interview) → documents → summary → consult · red-flag branch to triage | 5-step horizontal journey with icons |
| 6 | **Live Interview Example** | Telugu question/answer snippet → extracted JSON → summary line · SOCRATES branching | Chat-bubble mock + JSON card |
| 7 | **Architecture** | Channels → Voice Gateway (Pipecat) → Interview Engine (ontology + LLM) → Red-Flag Engine → Document Pipeline → Summary → FHIR/ABDM | Cleaned container diagram from [03](03-architecture.md) §3 |
| 8 | **Technology Stack** | Saaras v3 STT · Sarvam-30B/105B · Bulbul v3 TTS · Sarvam Vision OCR · Pipecat · FastAPI · React · PostgreSQL · HAPI FHIR · ABDM sandbox | Layered stack graphic; "Indian AI models" badge |
| 9 | **Ayurveda Mode (AYUSH)** | Dashavidha Pariksha table · Prakriti scoring · Agni, Koshtha, Ahara-Vihara, Nidana · NAMASTE / ICD-11 TM2 coding · "for physician examination" labels | Dashavidha table + Prakriti bar chart |
| 10 | **Safety, Privacy & Compliance** | Ontology decides the questions, rules catch emergencies, the doctor confirms · DPDP Act 2023 consent (audio, granular, revocable) · encryption, audit, auto-deletion · on-prem option | Shield diagram: consent → capture → encrypt → confirm → delete |
| 11 | **Feasibility & Viability** | Built on production-grade open-source tools · MVP scope · cost ~₹5–10/patient (*estimate*) · capacity plan for 5,000 patients/day · telephony + on-prem path | Cost table + deployment mini-diagram |
| 12 | **Impact & Benefits** | For patients, doctors, hospitals, ABDM · targets table (§6) | Before/after comparison |
| 13 | **Risks & Mitigation** | STT accuracy, hallucination, OCR errors, missed emergency, privacy → mitigations | 5-row table |
| 14 | **Research, References & Roadmap** | Key references (§7) · pilot at AIIA OPD → on-prem → 22 languages → HIS integrations | Timeline arrow + reference list |

**Slide design rules**
- One message per slide, with a headline that states the conclusion ("Doctors get 2 minutes; history needs 10").
- 24 pt minimum body text and no paragraphs; put details in speaker notes.
- Use the same colours and icons as the product UI ([05](05-wireframes.md)).
- Label every estimate. Cite every statistic on the slide or in the references slide.

---

## 3. Demo setup

| Station | Device | Shows | Operator |
|---|---|---|---|
| **A: Patient phone** | Phone or laptop with headset (WebRTC call page); a real phone if PSTN is ready | The AI call | "Patient" role-player (clinical content lead, who speaks Telugu) |
| **B: Triage board** | Laptop/monitor 1 | `/triage` alert board | Backend lead |
| **C: Doctor screen** | Laptop/monitor 2 (projected) | `/doctor` queue → patient page | Presenter clicks, or frontend lead |
| **D: Kiosk** (optional) | Touchscreen/tablet + USB handset + webcam | `/kiosk` flow, document scan | Frontend lead |
| **Upload phone** | Second phone | `/upload/{token}` page from the SMS link (or a QR on screen) | Document AI lead |

**Seeded data** (`make seed`): doctor login, nurse login, today's queue with 5 patients, including **Lakshmamma** in the Ayurveda department with a completed interview, and 3 sample documents (a printed lab report with high HbA1c, a handwritten prescription, a discharge summary) ready on the upload phone.

---

## 4. Live demo script (≈ 4 min 30 s)

> Roles: **P** = presenter · **Pt** = patient role-player (Telugu) · **N** = nurse operator · **D** = doctor-screen operator.
> Telugu lines are romanized, with the meaning in brackets.

| Time | Who | Action / exact line |
|---|---|---|
| 0:00 | P | "Meet Ramesh. He's registered at the OPD counter and got token 217. He hasn't even sat down yet, and our AI is already calling him." *(Pt's phone rings / call page connects)* |
| 0:10 | AI | Greeting and language menu in Hindi, Telugu and English. |
| 0:15 | Pt | Presses **2** (Telugu). |
| 0:20 | AI | Asks for the mobile number/ABHA → Pt types the digits → OTP → verified. *(Use the ABDM sandbox test ABHA, or mobile-OTP fallback.)* |
| 0:35 | AI | Plays the consent explanation (trimmed to 10 s in demo mode). Pt: "**Avunu.**" (Yes.) |
| 0:45 | P | "Everything you're hearing is in Telugu. The questions come from a clinical question bank our doctors reviewed. The AI only understands the answers." |
| 0:50 | AI | "Meeku emi ibbandi undi?" (What's troubling you?) |
| 0:55 | Pt | "**Rendu rojula nundi chest lo noppi undi.**" (Chest pain for two days.) |
| 1:00 | D | *(Screen C shows live slots filling: complaint = chest pain, duration = 2 days.)* |
| 1:05 | AI | "Noppi okkasariga vachinda, konchem konchem ga vachinda?" (Did it start suddenly or gradually?) |
| 1:10 | Pt | "**Okkasariga.**" (Suddenly.) |
| 1:15 | AI | "Noppi chethiki leda davadaki pakutunda?" (Does it spread to your arm or jaw?) |
| 1:20 | Pt | "**Edama chethiki vastundi.**" (It goes to my left arm.) |
| 1:25 | AI | "Oopiri aadakapovadam, chematalu padatam unnaya?" (Any breathlessness or sweating?) |
| 1:30 | Pt | "**Avunu, oopiri aadatam ledu, chematalu vastunnayi.**" (Yes, I can't breathe well, and I'm sweating.) |
| 1:33 | — | 🚨 **Triage board (B) flashes red within 3 s:** RF-CARD-01, the patient's name and token, evidence, channel. |
| 1:35 | AI | Emergency message in Telugu: "Please don't wait. Go to the emergency desk now. A nurse is coming." *(Call transfer to the nurse line is simulated.)* |
| 1:45 | N | Clicks **Acknowledge** on the triage board. |
| 1:50 | P | "No queue, no waiting. The nurse knows within seconds, with the evidence, and the patient is told what to do in their own language. These emergency rules are deterministic and tested against every red-flag scenario we have." |
| 2:05 | P | "Even in the ER, doctors need his history and his old papers. He got an SMS link." *(Upload phone opens the link.)* |
| 2:10 | Upload operator | Photographs/selects 3 documents → **Upload**. |
| 2:20 | D | Screen C: a document card shows *processing → done*. The **Timeline** tab shows documents ordered by date, with **⚠ HbA1c 9.2 % (high)**, medications (Metformin 500 mg BD), and a handwritten item marked *unverified* with the original image beside it. |
| 2:45 | P | "Handwriting gets a confidence score, and the doctor always sees the original image. We never hide uncertainty." |
| 2:55 | D | Opens the **Summary** tab: CC → HPI → Past → Drugs & allergies → Family → Personal → ROS → Investigations, with the red-flag banner at the top. |
| 3:10 | P | "This is what the doctor reads in 30 seconds instead of spending three minutes asking. It's a draft, and the doctor stays in control." |
| 3:15 | D | Edits one line (e.g. adds "on aspirin since yesterday") → **Confirm**. |
| 3:20 | D | Shows the toast "FHIR bundle sent · ABHA linked", then opens the FHIR preview (Composition / OPConsultRecord). |
| 3:35 | P | "On confirmation, the record goes to the hospital HIS and the patient's ABHA health record in the national FHIR format." |
| 3:45 | D | Back to the queue and opens **Lakshmamma** (Ayurveda department) → **Ayurveda** tab: Prakriti *Pitta-Kapha* bars, Agni *manda*, Koshtha *krura*, Dashavidha table with Sara marked *for physician examination*. |
| 4:05 | P | "For AIIA, the same call covers Dashavidha Pariksha, Prakriti, Agni, Koshtha and Ahara-Vihara, coded with NAMASTE. Anything that needs touch or pulse is honestly marked for the physician." |
| 4:20 | P | **Close:** "History that takes a doctor minutes to collect, ready in 30 seconds, in any Indian language, on any phone, for under ten rupees per patient (our estimate), using Indian AI. Thank you." |

### 4.1 Demo mode settings
- `DEMO_MODE=true`: consent audio shortened, call-back delays removed, and the "live slots" panel shown on the doctor screen.
- Pre-warm the providers (1 test call 10 minutes before) so first-call latency doesn't hit the live run.
- Keep the Ayurveda patient **pre-seeded**; don't run a second full call live.

### 4.2 Backup plan

| Failure | Backup |
|---|---|
| Venue internet down | Mobile hotspot (2 networks) · if still down, play the **pre-recorded demo video** (same script, 4 min) |
| Sarvam API slow or down | Switch `.env` to fallback providers · or play the video segment for the call and continue live with the seeded data |
| WebRTC/audio device fails | Spare headset · second laptop with the call page open · phone path as an alternative |
| ABDM sandbox down | Mobile-OTP identity path (already built) · explain the ABHA link retry queue |
| Triage alert doesn't appear | Refresh the board (alert is persisted) · show the alert in the doctor queue banner |
| Upload fails | Use pre-uploaded documents on the seeded visit ("here's one we did earlier") |
| Projector problems | Laptop screen tilted to the judges + printed one-page architecture and screenshots |

---

## 5. Judge Q&A bank

| # | Likely question | Crisp answer |
|---|---|---|
| 1 | What if the AI hallucinates? | The AI never decides what to ask; a doctor-reviewed ontology does. The LLM only converts answers into strict JSON, which is validated. Every summary sentence must map to a stored fact, and the doctor confirms. |
| 2 | How accurate is it? | We measure extraction accuracy, STT error, OCR entity accuracy and red-flag recall on our test sets (see our testing doc). Red-flag recall must be 100 % on the suite. We report our measured numbers and don't claim more. |
| 3 | Can elderly or illiterate patients use it? | Yes. It's a normal phone call in their language, with no reading or app needed. Numbers and yes/no questions can use the keypad, and the kiosk has a real telephone handset. |
| 4 | Hospitals are noisy. | Phone calls usually happen before arrival or away from the crowd. At the kiosk, the handset puts the mic at the mouth. We add noise suppression, read-back confirmation, and a keypad fallback. |
| 5 | Why a phone call and not an app? | Most OPD patients are elderly, rural or first-time visitors. Everyone can answer a phone call, and the history is ready before they arrive, which saves hospital time too. |
| 6 | How do you handle privacy (DPDP Act)? | Consent comes first: an audio notice in their language, granular purposes, revocable, recorded as evidence with an SMS confirmation. Data is encrypted, access is role-based, everything is audit-logged, temporary data is auto-deleted, and there's an on-prem option. |
| 7 | How do you integrate with ABDM? | ABHA verification via OTP (M1), FHIR R4 bundles in NRCeS profiles (OPConsultRecord, HealthDocumentRecord), and care-context linking through the HIP flow (M2). Built against the ABDM sandbox. |
| 8 | What does it cost at 5,000 patients/day? | About ₹5–10 per patient on cloud APIs (*estimate*), mostly speech. On-prem with open-weight models, the marginal cost is near zero after the GPU server. |
| 9 | What if the patient gives wrong information or lies? | Same as with a human interviewer: it's patient-reported and labelled that way. Read-back reduces misunderstanding, documents cross-check the interview, and the doctor verifies in the consultation. |
| 10 | Who is liable if something is missed? | MediKiosk is a documentation aid, not a diagnostic tool. The doctor reviews and confirms every summary. Provenance shows the source of every fact, and emergency detection errs on the side of escalation. |
| 11 | Is this a medical device needing CDSCO approval? | It's designed as a history-documentation aid with the physician in the loop, and it doesn't diagnose or recommend treatment. Before deployment we'd get a formal regulatory opinion on Software as a Medical Device classification. The red-flag feature is the part we'd review most carefully. |
| 12 | What about poor connectivity? | Phone calls need no internet on the patient's side. The hospital side can run fully on the LAN in on-prem mode, and uploads and exports queue and retry. |
| 13 | Only 3 languages? | Those are our MVP (Hindi, Telugu, English). The STT already supports 22 Indic languages. Adding a language means translating the question bank and lexicon and pre-generating audio, with no code change. |
| 14 | How is the Ayurveda assessment validated? | Question sets are reviewed by our Ayurveda mentor and follow standard Prakriti questionnaire approaches. Scoring is rule-based and transparent. Items needing physical examination are never guessed. Validation against physician assessment is part of the pilot. |
| 15 | Why Sarvam and not GPT or others? | Strong Indic speech and language support, 8 kHz telephony STT, low cost, data residency in India, and open weights for on-prem use. Our provider adapters mean we can switch if something better appears. |
| 16 | Can it really run on-premise? | Yes. Sarvam-30B/105B are open-weight (Apache 2.0) and serve with vLLM, and IndicConformer and Indic Parler-TTS are open source. Hardware would be one or two inference GPU servers, sized in a load test. |
| 17 | How does it connect to our HIS? | Standard FHIR R4 bundles. Any FHIR-capable HIS can receive them, and for others we add an adapter. Our demo pushes to a HAPI FHIR server as the HIS stand-in. |
| 18 | Will doctors actually use it? | It saves them time and gives them control: a one-page summary in the standard order they're trained on, editable, with the original documents one click away. We'll measure adoption in the pilot. |
| 19 | What's the business or sustainability model? | For government hospitals, deployment through ABDM/state health missions at a low per-patient or per-site cost. Open-source components keep costs low, and private hospitals could use a SaaS tier. |
| 20 | How is this different from existing products? | Registration kiosks capture demographics only, and chatbots need smartphones and literacy. Ours is call-first and multilingual, covers clinical depth including Ayurveda, adds document intelligence, and is ABDM-native. |
| 21 | Who owns the data? | The patient, under DPDP. The hospital is the data fiduciary for care delivery, and sharing to ABHA happens only with consent. Patients can revoke consent and request deletion. |
| 22 | What if the patient has multiple complaints? | The chief-complaint router captures all of them, ranks them by the patient's priority, and runs each complaint tree (shortened for secondary complaints), with shared sections asked once. |
| 23 | What about children? | A caregiver answers on the child's behalf, and that's recorded in the summary. Paediatric-specific trees (birth, immunization, development) are on the roadmap. |
| 24 | What about false alarms from red flags? | We accept some false alarms, because a missed emergency is far worse. Alerts have severity levels, nurses can mark false alarms, and we track that rate to tune rules with clinicians. |
| 25 | How long does the call take? | Our design target is 5–8 minutes (*target*, to be measured), and the patient can pause and resume. Most of that time replaces waiting time in the queue, not doctor time. |
| 26 | What if the call drops? | Every answer is saved immediately. The system calls back once and resumes from the last question, and the kiosk can also resume the same session. |
| 27 | How do you handle code-mixed speech ("sugar tablet", "BP high")? | Saaras has a code-mix mode, and our lexicon maps colloquial and mixed terms to clinical terms ("sugar" → diabetes, "chakkar" → dizziness). |
| 28 | How do you protect against prompt injection or odd answers? | The LLM only fills a fixed schema for the current question, and it can't change the flow, trigger actions, or see other patients' data. Invalid output is rejected and re-asked. |
| 29 | How do you know the summary didn't add facts? | A fact-check step: every summary statement must reference stored history items or document entities, and unreferenced statements are removed or flagged before the doctor sees them. |
| 30 | What would you need from AIIA? | A pilot OPD, a clinical champion, access to test HIS integration, and support for ethics committee approval. |

---

## 6. Impact slide content

**Source figures (from the problem statement)**
- Tertiary government hospitals register **4,000–10,000 OPD patients per day**.
- Consultation time is typically **2–5 minutes**. A **BMJ Open 2017** systematic review across **67 countries** (Irving et al.) put India's average primary-care consultation at **about 2 minutes**.
- A well-conducted history yields the correct diagnosis in **70–80 % of cases**.

**Our targets** (*targets/estimates, to be validated in testing and the pilot*)

| Metric | Target |
|---|---|
| Doctor time to review history | **< 30 seconds** |
| History sections covered | **All 8 standard sections** + Ayurveda section in AYUSH OPDs |
| Old documents digitized before consult | **100 %** of those shared |
| Emergency patterns flagged before queueing | **100 %** recall on the red-flag test suite |
| Voice turn latency | **≤ 1.5 s** (p90) |
| Cost per patient | **~₹5–10** on cloud APIs (*estimate*) |
| Languages | 3 in MVP → 22 scheduled languages |

**Who benefits**
- **Patients:** heard in their own language, fewer repeated questions, faster emergency care.
- **Doctors:** complete history in seconds, and more of the consultation left for examination, reasoning and counselling.
- **Hospitals:** higher OPD throughput, structured data, ABDM compliance.
- **Ayurveda:** personalized assessment (Prakriti, Agni, Koshtha) becomes practical at OPD scale.
- **ABDM:** solves the first-mile capture problem and brings patient history into ABHA records.

---

## 7. References

| Reference | Link |
|---|---|
| SIH 2026 Problem Statement 26047: *Patient Case-Taking Software* (Ministry of Ayush / AIIA), including the additional-information PDF | SIH portal |
| Irving G. et al., "International variations in primary care physician consultation time: a systematic review of 67 countries", *BMJ Open*, 2017 | — |
| Ayushman Bharat Digital Mission: sandbox & developer documentation | https://sandbox.abdm.gov.in |
| NRCeS: FHIR Implementation Guide for ABDM (India FHIR profiles), SNOMED CT India release | https://nrces.in |
| Digital Personal Data Protection Act, 2023 (Government of India, MeitY) | — |
| Sarvam AI: API documentation (Saaras, Bulbul, Sarvam-30B/105B, Vision) | https://docs.sarvam.ai |
| AI4Bharat (IIT Madras): IndicConformer, Indic Parler-TTS, IndicTrans2 | https://ai4bharat.iitm.ac.in |
| Bhashini: National Language Translation Mission | https://bhashini.gov.in |
| Pipecat: open-source voice-agent framework | https://github.com/pipecat-ai/pipecat |
| NAMASTE portal: National AYUSH Morbidity & Standardized Terminologies Electronic | https://namaste.ayush.gov.in |
| WHO ICD-11, including the Traditional Medicine chapter (TM2) | https://icd.who.int |
| HAPI FHIR: open-source FHIR server | — |

---

## 8. Presenter checklist

### The day before
- [ ] Top up Sarvam credits; confirm all API keys work on the demo VM **and** the local stack
- [ ] `make seed` on the demo environment; verify Lakshmamma's Ayurveda summary and Ramesh's clean visit
- [ ] Record or refresh the **backup demo video** (full script, ≤ 4 min 30 s) and put it on 2 laptops + a USB drive
- [ ] Charge everything: laptops, phones, headset, tablet, power banks
- [ ] Print: one-page architecture, Q&A cheat sheet, team roles
- [ ] Rehearse the full pitch + demo **3×** with a timer; rehearse the handover lines between speakers

### 1 hour before
- [ ] Test venue Wi-Fi **and** both hotspots; decide which to use
- [ ] Open every screen: call page (A), triage board (B, logged in as nurse), doctor queue (C, logged in as doctor), kiosk (D), upload phone with the link ready
- [ ] Make a pre-warm call to warm up the providers; check the triage alert sound works on the speakers
- [ ] Silence notifications on all devices; turn off auto-updates and sleep
- [ ] Set `DEMO_MODE=true`; reset Ramesh's visit to `REGISTERED`

### On stage
- [ ] Speak to the judges, not the screen; the presenter narrates while the operators click
- [ ] If anything fails, say "Here's the recorded run," switch to the video without apologizing, and keep the narrative going
- [ ] End on the closing line; hand over to Q&A with the cheat sheet in hand
- [ ] Afterwards, note every judge question and suggestion for the next round
