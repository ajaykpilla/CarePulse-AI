# CarePulse AI 🩺⚡

> **Proactive Healthcare Interoperability & Autonomous Prior Authorization Engine aligned with HL7 FHIR R4 and CMS-0057-F**

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-teal?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%202.5%20Flash-Server%20Side-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![HL7 FHIR R4](https://img.shields.io/badge/HL7-FHIR%20R4-purple?style=flat-square)](https://www.hl7.org/fhir/)
[![CMS-0057-F](https://img.shields.io/badge/CMS--0057--F-Compliant-emerald?style=flat-square)](https://www.cms.gov/)

---

## 📋 Problem Statement

Modern healthcare administrative workflows suffer from severe friction, high costs, and dangerous care delays:

1. **Administrative Burden & Delays**: Traditional prior authorization (PA) requires manual, fax-heavy, and reactive paperwork, averaging **4.2 to 14 days** per request and costing upwards of **$46 per manual review**.
2. **Avoidable Denials & Patient Abandonment**: Up to **18.4% of initial PA requests** result in denials or administrative delays due to missing clinical notes, unverified step therapies, or lacking mandatory safety screenings (such as latent TB IGRA tests).
3. **Regulatory Interoperability Gaps**: The Centers for Medicare & Medicaid Services (**CMS-0057-F rule**) mandates standardized API-driven interoperability, requiring payers and providers to streamline prior authorizations, deliver 72-hour urgent turnarounds, and provide upfront patient cost transparency.
4. **Queue Bottlenecks**: Providers struggling with bulk claims submissions face cascading rejections, while payers face overburdened manual adjudication queues with poor visibility into true provider clinical intent.

---

## 💡 The CarePulse AI Solution

**CarePulse AI** is an enterprise-grade, full-stack multi-agent co-pilot and interoperability engine that automates the entire prior authorization and claims adjudication lifecycle. Aligned strictly with **HL7 FHIR R4**, **Da Vinci PAS (Prior Authorization Support)**, **Da Vinci DTR (Documentation Templates and Rules)**, and **CMS-0057-F**, CarePulse AI bridges providers, payers, and members.

### Key Architectural Pillars:

* **Command Center & Journey Simulator**:
  - Pre-loads realistic clinical scenarios (**Case A**: Auto-Approve Ready Lumbar MRI; **Case B**: Documentation Gap Adalimumab; **Case C**: Site-of-Care Cardiac Ablation Savings; **Case D**: Bulk Provider Claims Batch & Processor Queue; plus an editable **Custom Sandbox**).
  - Dual-pane workspace with editable EHR clinical progress notes, payer medical policy rulebooks, and an interactive **HL7 FHIR R4 Bundle Viewer**.

* **Autonomous 3-Agent Execution Pipeline**:
  - **Agent 1 (Clinical Parsing & FHIR Extraction)**: Parses unstructured EHR text and extracts ICD-10 codes, CPT/HCPCS procedure codes, clinical biomarkers (with red flag detection), and prior step therapies into structured HL7 FHIR evidence.
  - **Agent 2 (Policy Adjudication & CMS-0057-F Compliance)**: Evaluates structured data against medical policy criteria, enforcing strict safety rules (e.g., missing mandatory safety labs or unverified step therapy triggers proactive remediation rather than outright denial).
  - **Agent 3 (Proactive Remediation & Price Transparency)**: Generates Da Vinci DTR provider addendum requests, FHIR `QuestionnaireResponse` stubs, site-of-care cost alternatives, and warm 8th-grade plain-language member transparency cards.

* **Bulk Provider Claims Batch & Claims Processor Intent Queue (Case D)**:
  - **Provider Side**: Automatically pre-validates bulk batches of provider claims against medical policies before submission to eliminate initial rejections.
  - **Processor / Payer Manual Review Side**: Parses claim metadata and unstructured clinician notes to **translate true clinical intent**, recommending fast-track approvals or generating policy-aligned adjustment notices for manual queue claims.

* **Executive Value Flywheel & Operational Analytics**:
  - Real-time executive KPI dashboards tracking Touchless Auto-Approval Rates (`~84%`), Median Turnaround Times (`< 90s`), Avoided Denials, and Member NPS Lift.
  - Interactive **What-If Policy & Volume Simulator** with sliders for monthly PA volume, confidence thresholds, and network FHIR adoption to dynamically model annual administrative savings.

* **Interactive Masterclass Guide & Live App Tour**:
  - Built-in slide walkthrough and simulated **Live App Video Tour** featuring real-time page/tab navigation synchronized with speech synthesis voice-over narration and transcription subtitles.

---

## 🛠️ Technology Stack & Runtime

* **Frontend**: React 19, TypeScript (strict mode), Tailwind CSS, Lucide React icons.
* **Backend**: Node.js Express server (`server.ts`) co-hosted with Vite in development and bundled via `esbuild` for production.
* **AI Engine**: Official `@google/genai` TypeScript SDK utilizing `gemini-2.5-flash` with strict JSON schema response validation (`responseMimeType: "application/json"`).
* **Security & Resilience**: Server-side API key isolation (`process.env.GEMINI_API_KEY`), session BYOK header support (`x-gemini-api-key`), team access passcodes (`x-carepulse-passcode`), and automatic **Deterministic Demo Mode Fallback**.

---

## 🚀 Getting Started & Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/carepulse-ai.git
   cd carepulse-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your API key if running live Gemini mode:
   ```bash
   cp .env.example .env
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the application at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 Documentation

For detailed architectural specifications and design philosophy, please refer to [SOLUTION.md](./SOLUTION.md).
