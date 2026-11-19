// server.ts
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.use(express.json({ limit: "10mb" }));
var PORT = process.env.PORT || 3e3;
var CAREPULSE_ACCESS_PASSCODE = process.env.CAREPULSE_ACCESS_PASSCODE || "";
function getGeminiClient(req) {
  const byok = req.headers["x-gemini-api-key"];
  const apiKey = byok || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}
function checkPasscode(req) {
  if (!CAREPULSE_ACCESS_PASSCODE) return true;
  const provided = req.headers["x-carepulse-passcode"];
  return provided === CAREPULSE_ACCESS_PASSCODE;
}
app.get("/api/config", (req, res) => {
  res.json({
    requirePasscode: Boolean(CAREPULSE_ACCESS_PASSCODE),
    demoModeDefault: !process.env.GEMINI_API_KEY
  });
});
var clinicalParseSchema = {
  type: Type.OBJECT,
  properties: {
    patientSummary: { type: Type.STRING },
    icd10Codes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["code", "description"]
      }
    },
    procedureOrMedicationCodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          system: { type: Type.STRING },
          code: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["system", "code", "description"]
      }
    },
    clinicalBiomarkersAndFindings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          finding: { type: Type.STRING },
          valueOrDetail: { type: Type.STRING },
          isRedFlag: { type: Type.BOOLEAN }
        },
        required: ["finding", "valueOrDetail", "isRedFlag"]
      }
    },
    priorConservativeOrStepTherapies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          therapy: { type: Type.STRING },
          durationOrDates: { type: Type.STRING },
          outcome: { type: Type.STRING },
          verified: { type: Type.BOOLEAN }
        },
        required: ["therapy", "durationOrDates", "outcome", "verified"]
      }
    },
    structuredFhirEvidence: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          resourceType: { type: Type.STRING },
          fhirPath: { type: Type.STRING },
          extractedValue: { type: Type.STRING }
        },
        required: ["resourceType", "fhirPath", "extractedValue"]
      }
    }
  },
  required: [
    "patientSummary",
    "icd10Codes",
    "procedureOrMedicationCodes",
    "clinicalBiomarkersAndFindings",
    "priorConservativeOrStepTherapies",
    "structuredFhirEvidence"
  ]
};
var policyAdjudicateSchema = {
  type: Type.OBJECT,
  properties: {
    determination: {
      type: Type.STRING,
      enum: ["AUTO_APPROVED", "REMEDIATION_REQUIRED", "CLINICAL_REVIEW_SUGGESTED"]
    },
    approvalConfidenceScore: { type: Type.NUMBER },
    policyReference: { type: Type.STRING },
    cms0057fCompliance: {
      type: Type.OBJECT,
      properties: {
        slaCategory: { type: Type.STRING },
        projectedTurnaroundSeconds: { type: Type.NUMBER },
        daVinciPasAligned: { type: Type.BOOLEAN },
        complianceNotes: { type: Type.STRING }
      },
      required: ["slaCategory", "projectedTurnaroundSeconds", "daVinciPasAligned", "complianceNotes"]
    },
    criteriaEvaluation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          criterionId: { type: Type.STRING },
          criterionTitle: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["MET", "MISSING", "PARTIAL"] },
          clinicalEvidenceFound: { type: Type.STRING },
          gapExplanation: { type: Type.STRING }
        },
        required: ["criterionId", "criterionTitle", "status", "clinicalEvidenceFound", "gapExplanation"]
      }
    },
    adjudicationRationale: { type: Type.STRING }
  },
  required: [
    "determination",
    "approvalConfidenceScore",
    "policyReference",
    "cms0057fCompliance",
    "criteriaEvaluation",
    "adjudicationRationale"
  ]
};
var remediateTransparencySchema = {
  type: Type.OBJECT,
  properties: {
    remediationNeeded: { type: Type.BOOLEAN },
    remediationPriority: { type: Type.STRING, enum: ["NONE", "HIGH", "MODERATE"] },
    providerAddendumRequest: {
      type: Type.OBJECT,
      properties: {
        targetRecipient: { type: Type.STRING },
        subject: { type: Type.STRING },
        missingItemsChecklist: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        draftAddendumMessage: { type: Type.STRING },
        fhirQuestionnaireResponseStub: { type: Type.OBJECT }
      },
      required: [
        "targetRecipient",
        "subject",
        "missingItemsChecklist",
        "draftAddendumMessage",
        "fhirQuestionnaireResponseStub"
      ]
    },
    evidenceBackedAlternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          rationale: { type: Type.STRING },
          estimatedSavingsOrImpact: { type: Type.STRING }
        },
        required: ["title", "rationale", "estimatedSavingsOrImpact"]
      }
    },
    memberTransparencyCard: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        plainLanguageStatus: { type: Type.STRING },
        estimatedTotalAllowedAmount: { type: Type.NUMBER },
        estimatedMemberCopayOrCoinsurance: { type: Type.NUMBER },
        deductibleApplied: { type: Type.NUMBER },
        siteOfCareSavingsHighlight: { type: Type.STRING },
        recommendedFacility: { type: Type.STRING },
        nextStepsForMember: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: [
        "headline",
        "plainLanguageStatus",
        "estimatedTotalAllowedAmount",
        "estimatedMemberCopayOrCoinsurance",
        "deductibleApplied",
        "siteOfCareSavingsHighlight",
        "recommendedFacility",
        "nextStepsForMember"
      ]
    }
  },
  required: [
    "remediationNeeded",
    "remediationPriority",
    "providerAddendumRequest",
    "evidenceBackedAlternatives",
    "memberTransparencyCard"
  ]
};
app.post("/api/agents/clinical-parse", async (req, res) => {
  const t0 = Date.now();
  try {
    if (!checkPasscode(req)) {
      return res.status(401).json({ error: "Invalid team access passcode." });
    }
    const { clinicalNote, payerPolicySnippet, forceDemo, scenarioId } = req.body;
    const ai = getGeminiClient(req);
    if (ai && !forceDemo) {
      try {
        const prompt = `You are Agent 1 of CarePulse AI, a clinical interoperability engine parsing unstructured EHR notes against HL7 FHIR R4 and payer policy requirements.
Analyze the following clinical note and payer policy snippet. Extract structured JSON adhering strictly to the schema.

CLINICAL PROGRESS NOTE:
${clinicalNote}

PAYER MEDICAL POLICY SNIPPET:
${payerPolicySnippet}
`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: clinicalParseSchema
          }
        });
        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ mode: "gemini", model: "gemini-2.5-flash", latencyMs: Date.now() - t0, result: parsed });
        }
      } catch (err) {
        console.warn("Gemini API call failed for clinical-parse, falling back to deterministic:", err);
      }
    }
    const result = getDeterministicClinicalParse(scenarioId, clinicalNote);
    res.json({ mode: "demo", model: "deterministic-engine", latencyMs: Date.now() - t0, result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error in clinical-parse" });
  }
});
app.post("/api/agents/policy-adjudicate", async (req, res) => {
  const t0 = Date.now();
  try {
    if (!checkPasscode(req)) {
      return res.status(401).json({ error: "Invalid team access passcode." });
    }
    const { agent1Result, clinicalNote, payerPolicySnippet, forceDemo, scenarioId } = req.body;
    const ai = getGeminiClient(req);
    if (ai && !forceDemo) {
      try {
        const prompt = `You are Agent 2 of CarePulse AI, a clinical policy adjudication engine aligned with CMS-0057-F and HL7 FHIR Da Vinci PAS.
Evaluate the structured clinical parse results and clinical note against the payer medical policy criteria.
STRICT SAFETY RULE: Never mark missing mandatory safety labs (such as latent TB IGRA/PPD) or unverified/unspecified step therapy (missing drug name/dates) as MET. Mark them MISSING or PARTIAL and trigger REMEDIATION_REQUIRED instead of denial.

STRUCTURED CLINICAL PARSE (Agent 1):
${JSON.stringify(agent1Result, null, 2)}

CLINICAL NOTE:
${clinicalNote}

PAYER MEDICAL POLICY:
${payerPolicySnippet}
`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: policyAdjudicateSchema
          }
        });
        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ mode: "gemini", model: "gemini-2.5-flash", latencyMs: Date.now() - t0, result: parsed });
        }
      } catch (err) {
        console.warn("Gemini API call failed for policy-adjudicate, falling back to deterministic:", err);
      }
    }
    const result = getDeterministicPolicyAdjudicate(scenarioId, agent1Result);
    res.json({ mode: "demo", model: "deterministic-engine", latencyMs: Date.now() - t0, result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error in policy-adjudicate" });
  }
});
app.post("/api/agents/remediate-transparency", async (req, res) => {
  const t0 = Date.now();
  try {
    if (!checkPasscode(req)) {
      return res.status(401).json({ error: "Invalid team access passcode." });
    }
    const { agent1Result, agent2Result, fhirBundleJson, siteOfCareOptions, forceDemo, scenarioId } = req.body;
    const ai = getGeminiClient(req);
    if (ai && !forceDemo) {
      try {
        const prompt = `You are Agent 3 of CarePulse AI, specializing in proactive provider remediation, Da Vinci DTR questionnaire generation, and patient price transparency under CMS-0057-F.
Based on Agent 1 and Agent 2 results, construct the provider addendum request, FHIR QuestionnaireResponse stub, evidence-backed alternatives (such as site-of-care savings), and warm 8th-grade plain language member transparency card.

AGENT 1 PARSE:
${JSON.stringify(agent1Result, null, 2)}

AGENT 2 ADJUDICATION:
${JSON.stringify(agent2Result, null, 2)}

FHIR BUNDLE SUMMARY:
${JSON.stringify(fhirBundleJson?.resourceType || "Bundle")}

SITE OF CARE OPTIONS:
${JSON.stringify(siteOfCareOptions || [])}
`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: remediateTransparencySchema
          }
        });
        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ mode: "gemini", model: "gemini-2.5-flash", latencyMs: Date.now() - t0, result: parsed });
        }
      } catch (err) {
        console.warn("Gemini API call failed for remediate-transparency, falling back to deterministic:", err);
      }
    }
    const result = getDeterministicRemediateTransparency(scenarioId, agent2Result, siteOfCareOptions);
    res.json({ mode: "demo", model: "deterministic-engine", latencyMs: Date.now() - t0, result });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error in remediate-transparency" });
  }
});
function getDeterministicClinicalParse(scenarioId, note) {
  if (scenarioId === "case-bulk") {
    return {
      patientSummary: "Metro Multispecialty Clinic Batch (5 Claims): Pre-validated 3 clean claims and translated intent for 2 manual queue claims.",
      icd10Codes: [
        { code: "M54.16", description: "Lumbar radiculopathy" },
        { code: "K50.80", description: "Crohn\u2019s disease" },
        { code: "I48.0", description: "Paroxysmal atrial fibrillation" },
        { code: "I10", description: "Essential hypertension" },
        { code: "M23.22", description: "Derangement of meniscus due to old tear" }
      ],
      procedureOrMedicationCodes: [
        { system: "CPT / HCPCS", code: "72148, J0135, 93656, 99214, 29881", description: "Multi-claim outpatient & specialty batch" }
      ],
      clinicalBiomarkersAndFindings: [
        { finding: "Batch Pre-Validation Rate", valueOrDetail: "60% Auto-Approval, 40% Manual Queue Intent Translated", isRedFlag: false },
        { finding: "Claim #CLM-88402 (Marcus Thorne)", valueOrDetail: "Missing TB IGRA lab -> Provider Addendum triggered", isRedFlag: true },
        { finding: "Claim #CLM-88405 (Kevin Vance)", valueOrDetail: "PA ID typo -> Intent translated for fast-track approval", isRedFlag: true }
      ],
      priorConservativeOrStepTherapies: [
        { therapy: "Batch-wide HL7 FHIR validation against payer medical policies", durationOrDates: "Real-time", outcome: "Zero unformatted rejections", verified: true }
      ],
      structuredFhirEvidence: [
        { resourceType: "Bundle", fhirPath: "Bundle.entry.resource", extractedValue: "5 claims batch successfully ingested" }
      ]
    };
  } else if (scenarioId === "case-b") {
    return {
      patientSummary: "Marcus Thorne (CP-773190-HMO), 42yo Male with moderate-to-severe Crohn\u2019s disease presenting for Adalimumab biologic therapy.",
      icd10Codes: [
        { code: "K50.80", description: "Crohn\u2019s disease of both small and large intestine without complications" }
      ],
      procedureOrMedicationCodes: [
        { system: "HCPCS / RxNorm", code: "J0135 / 327361", description: "Adalimumab 40mg subcutaneous injection" }
      ],
      clinicalBiomarkersAndFindings: [
        { finding: "SES-CD Score", valueOrDetail: "14 (Moderate endoscopic severity)", isRedFlag: false },
        { finding: "Fecal Calprotectin", valueOrDetail: "890 ug/g (Elevated active inflammation)", isRedFlag: true },
        { finding: "C-Reactive Protein (CRP)", valueOrDetail: "3.4 mg/dL", isRedFlag: false }
      ],
      priorConservativeOrStepTherapies: [
        { therapy: "Oral Budesonide 9mg", durationOrDates: "8 weeks", outcome: "Partial symptomatic response, steroid-dependent flare upon taper", verified: true },
        { therapy: "Unspecified Oral Immunosuppressant Pill", durationOrDates: "Unstated duration", outcome: "Unknown / Unverified in EHR notes", verified: false }
      ],
      structuredFhirEvidence: [
        { resourceType: "Condition", fhirPath: "Condition.code.coding[0].code", extractedValue: "K50.80" },
        { resourceType: "Observation", fhirPath: "Observation.valueQuantity.value", extractedValue: "890 ug/g fecal calprotectin" },
        { resourceType: "MedicationRequest", fhirPath: "MedicationRequest.medicationCodeableConcept", extractedValue: "Adalimumab 40mg SC" }
      ]
    };
  } else if (scenarioId === "case-c") {
    return {
      patientSummary: "David Kim (CP-558214-HDHP), 58yo Male with symptomatic paroxysmal Atrial Fibrillation evaluated for catheter ablation.",
      icd10Codes: [
        { code: "I48.0", description: "Paroxysmal atrial fibrillation" }
      ],
      procedureOrMedicationCodes: [
        { system: "CPT", code: "93656", description: "Catheter ablation of arrhythmia, pulmonary vein isolation" }
      ],
      clinicalBiomarkersAndFindings: [
        { finding: "AFib Burden on 14-day Patch", valueOrDetail: "14% burden with symptomatic palpitations", isRedFlag: false },
        { finding: "Left Ventricular Ejection Fraction (LVEF)", valueOrDetail: "58% (Normal systolic function)", isRedFlag: false },
        { finding: "ASA Physical Status", valueOrDetail: "Class II", isRedFlag: false }
      ],
      priorConservativeOrStepTherapies: [
        { therapy: "Metoprolol Succinate 50mg daily", durationOrDates: "6 months", outcome: "Failed to control breakthrough symptomatic episodes", verified: true },
        { therapy: "Flecainide 100mg BID", durationOrDates: "3 months", outcome: "Intolerable dizziness and breakthrough paroxysms", verified: true }
      ],
      structuredFhirEvidence: [
        { resourceType: "Condition", fhirPath: "Condition.code.coding[0].code", extractedValue: "I48.0" },
        { resourceType: "Procedure", fhirPath: "Procedure.code.coding[0].code", extractedValue: "93656 PVI Ablation" },
        { resourceType: "Observation", fhirPath: "Observation.valueQuantity.value", extractedValue: "14% burden" }
      ]
    };
  } else if (scenarioId === "custom") {
    return {
      patientSummary: "Custom Sandbox Patient \u2014 AI parsed clinical notes and structured HL7 FHIR R4 Bundle resources.",
      icd10Codes: [
        { code: "M17.11", description: "Unilateral primary osteoarthritis, right knee" }
      ],
      procedureOrMedicationCodes: [
        { system: "CPT", code: "27447", description: "Arthroplasty, knee, condyle and plateau, total knee replacement" }
      ],
      clinicalBiomarkersAndFindings: [
        { finding: "Kellgren-Lawrence Grade", valueOrDetail: "Grade 4 severe joint space narrowing", isRedFlag: false },
        { finding: "Range of Motion", valueOrDetail: "Flexion contracture 15 deg, painful ROM", isRedFlag: true }
      ],
      priorConservativeOrStepTherapies: [
        { therapy: "Physical Therapy & NSAIDs", durationOrDates: "12 weeks", outcome: "Persistent disabling pain and functional limitation", verified: true },
        { therapy: "Intra-articular Hyaluronic Acid Injection", durationOrDates: "6 months prior", outcome: "Transient relief for 3 weeks", verified: true }
      ],
      structuredFhirEvidence: [
        { resourceType: "Condition", fhirPath: "Condition.code.coding[0].code", extractedValue: "M17.11" },
        { resourceType: "Procedure", fhirPath: "Procedure.code.coding[0].code", extractedValue: "27447 Total Knee Arthroplasty" }
      ]
    };
  } else {
    return {
      patientSummary: "Elena Vance (CP-904821-PPO), 38yo Female with chronic lumbar radiculopathy requesting lumbar MRI.",
      icd10Codes: [
        { code: "M54.16", description: "Radiculopathy, lumbar region" }
      ],
      procedureOrMedicationCodes: [
        { system: "CPT", code: "72148", description: "Magnetic resonance (MRI), spine lumbar; without contrast" }
      ],
      clinicalBiomarkersAndFindings: [
        { finding: "Left L5 Dorsiflexion Strength", valueOrDetail: "3+/5 weakness (Objective motor deficit)", isRedFlag: true },
        { finding: "Straight Leg Raise (SLR)", valueOrDetail: "Positive on left at 30 degrees", isRedFlag: true },
        { finding: "Duration of Symptoms", valueOrDetail: "6.5 weeks persistent pain", isRedFlag: false }
      ],
      priorConservativeOrStepTherapies: [
        { therapy: "Supervised Physical Therapy", durationOrDates: "6.5 weeks (18 sessions)", outcome: "No sustained improvement in radicular symptoms", verified: true },
        { therapy: "Naproxen 500mg BID & Gabapentin 600mg TID", durationOrDates: "6 weeks", outcome: "Inadequate pain control", verified: true }
      ],
      structuredFhirEvidence: [
        { resourceType: "Condition", fhirPath: "Condition.code.coding[0].code", extractedValue: "M54.16" },
        { resourceType: "Procedure", fhirPath: "Procedure.code.coding[0].code", extractedValue: "72148 Lumbar MRI" },
        { resourceType: "Observation", fhirPath: "Observation.valueString", extractedValue: "3+/5 L5 motor deficit" }
      ]
    };
  }
}
function getDeterministicPolicyAdjudicate(scenarioId, agent1) {
  if (scenarioId === "case-bulk") {
    return {
      determination: "CLINICAL_REVIEW_SUGGESTED",
      approvalConfidenceScore: 82,
      policyReference: "BULK-CLAIMS-INTENT-01 (Interoperable Bulk Batch Intake & Manual Queue Translation)",
      cms0057fCompliance: {
        slaCategory: "CMS-0057-F Bulk Intake 24h Queue SLA",
        projectedTurnaroundSeconds: 30,
        daVinciPasAligned: true,
        complianceNotes: "Bulk batch of 5 claims successfully ingested; 3 auto-approved and 2 translated for fast-track manual queue resolution."
      },
      criteriaEvaluation: [
        { criterionId: "BULK-01", criterionTitle: "Batch Pre-Validation & FHIR Compliance", status: "MET", clinicalEvidenceFound: "3 of 5 claims clean and fully auto-approved.", gapExplanation: "None." },
        { criterionId: "BULK-02", criterionTitle: "Manual Queue Intent Translation (Claims 2 & 5)", status: "PARTIAL", clinicalEvidenceFound: "CarePulse AI translated intent for missing lab and PA ID typo.", gapExplanation: "Requires processor sign-off or automated addendum dispatch." }
      ],
      adjudicationRationale: "Bulk batch ingestion successful. 3 clean claims auto-approved instantly. 2 claims routed to manual review queue have had their true clinical intent translated by CarePulse AI for rapid processor resolution."
    };
  } else if (scenarioId === "case-b") {
    return {
      determination: "REMEDIATION_REQUIRED",
      approvalConfidenceScore: 42,
      policyReference: "RX-BIOLOGIC-112 (Crohn\u2019s Disease Biologic Therapy Criteria)",
      cms0057fCompliance: {
        slaCategory: "CMS-0057-F Standard Tier (72h Urgent / 7d Standard)",
        projectedTurnaroundSeconds: 45,
        daVinciPasAligned: true,
        complianceNotes: "Triggered proactive provider addendum workflow under Da Vinci DTR guidelines for missing safety labs."
      },
      criteriaEvaluation: [
        { criterionId: "CRIT-01", criterionTitle: "Confirmed Diagnosis of Moderate-to-Severe Crohn\u2019s Disease", status: "MET", clinicalEvidenceFound: "SES-CD 14 and Fecal Calprotectin 890 ug/g documented.", gapExplanation: "None." },
        { criterionId: "CRIT-02", criterionTitle: "Trial of Conventional Corticosteroids or Immunosuppressants", status: "PARTIAL", clinicalEvidenceFound: "Budesonide 9mg documented.", gapExplanation: "Outside oral immunosuppressant lacks drug name, dosage, and exact dates." },
        { criterionId: "CRIT-03", criterionTitle: "Mandatory Latent Tuberculosis (TB) Screening (IGRA / PPD within 12 months)", status: "MISSING", clinicalEvidenceFound: "Hepatitis B panel negative, but IGRA/PPD lab result is entirely missing.", gapExplanation: "Mandatory safety protocol requires negative latent TB screening prior to anti-TNF biologic initiation." }
      ],
      adjudicationRationale: "While disease severity and prior budesonide failure are verified, mandatory safety screening (latent TB IGRA) is missing and prior immunosuppressant therapy lacks verification. CarePulse AI has generated an instant provider addendum request to prevent avoidable denial."
    };
  } else if (scenarioId === "case-c") {
    return {
      determination: "AUTO_APPROVED",
      approvalConfidenceScore: 94,
      policyReference: "CARD-EP-409 (Catheter Ablation for Symptomatic Atrial Fibrillation)",
      cms0057fCompliance: {
        slaCategory: "CMS-0057-F Fast-Track Interoperable SLA",
        projectedTurnaroundSeconds: 12,
        daVinciPasAligned: true,
        complianceNotes: "Fully compliant with Da Vinci PAS R4 RESTful API specifications."
      },
      criteriaEvaluation: [
        { criterionId: "CRIT-01", criterionTitle: "Symptomatic Paroxysmal or Persistent AFib", status: "MET", clinicalEvidenceFound: "14% burden on 14-day patch with documented palpitations.", gapExplanation: "None." },
        { criterionId: "CRIT-02", criterionTitle: "Failure of at least one Class I or III Antiarrhythmic Drug", status: "MET", clinicalEvidenceFound: "Failed Metoprolol and Flecainide.", gapExplanation: "None." },
        { criterionId: "CRIT-03", criterionTitle: "Preserved LVEF and Operative Risk Assessment", status: "MET", clinicalEvidenceFound: "LVEF 58%, ASA Class II.", gapExplanation: "None." }
      ],
      adjudicationRationale: "All clinical criteria for catheter ablation are fully met. Recommended site-of-care optimization to accredited ambulatory surgical center (ASC) for significant out-of-pocket savings."
    };
  } else if (scenarioId === "custom") {
    return {
      determination: "AUTO_APPROVED",
      approvalConfidenceScore: 91,
      policyReference: "ORTHO-THR-204 (Total Joint Arthroplasty Guidelines)",
      cms0057fCompliance: {
        slaCategory: "CMS-0057-F Standard Interoperability Tier",
        projectedTurnaroundSeconds: 18,
        daVinciPasAligned: true,
        complianceNotes: "FHIR R4 Bundle successfully validated."
      },
      criteriaEvaluation: [
        { criterionId: "CRIT-01", criterionTitle: "Advanced Radiographic Osteoarthritis (Kellgren-Lawrence 3 or 4)", status: "MET", clinicalEvidenceFound: "Grade 4 narrowing documented.", gapExplanation: "None." },
        { criterionId: "CRIT-02", criterionTitle: "Failed Conservative Therapy (>= 12 weeks)", status: "MET", clinicalEvidenceFound: "Physical therapy and NSAIDs for 12 weeks.", gapExplanation: "None." }
      ],
      adjudicationRationale: "Radiographic and functional criteria fully met for total knee replacement."
    };
  } else {
    return {
      determination: "AUTO_APPROVED",
      approvalConfidenceScore: 98,
      policyReference: "LCD-IMAGING-304 (Lumbar Spine Imaging Criteria)",
      cms0057fCompliance: {
        slaCategory: "CMS-0057-F Real-Time Touchless SLA (< 72 Hours)",
        projectedTurnaroundSeconds: 8,
        daVinciPasAligned: true,
        complianceNotes: "Automated decision delivered via HL7 FHIR Da Vinci PAS $inquiry operation."
      },
      criteriaEvaluation: [
        { criterionId: "CRIT-01", criterionTitle: "Duration of Conservative Care (>= 6 weeks)", status: "MET", clinicalEvidenceFound: "6.5 weeks of physical therapy and pharmacotherapy.", gapExplanation: "None." },
        { criterionId: "CRIT-02", criterionTitle: "Presence of Objective Neurological Deficit or Red Flags", status: "MET", clinicalEvidenceFound: "Left L5 3+/5 weakness and positive SLR at 30 deg.", gapExplanation: "None." }
      ],
      adjudicationRationale: "Criteria met with objective motor deficit and verified 6.5-week conservative therapy trial. Touchless auto-approval granted instantly."
    };
  }
}
function getDeterministicRemediateTransparency(scenarioId, agent2, siteOfCareOptions) {
  if (scenarioId === "case-bulk") {
    return {
      remediationNeeded: true,
      remediationPriority: "MODERATE",
      providerAddendumRequest: {
        targetRecipient: "Metro Multispecialty Clinic Billing & Credentialing Dept",
        subject: "CarePulse AI Bulk Batch #BATCH-2026-NOV-09 Processor Intent Translation & Queue Resolution",
        missingItemsChecklist: [
          "Claim #CLM-88402: Attach negative TB IGRA lab result",
          "Claim #CLM-88405: Verify transposed PA ID #PA-44910"
        ],
        draftAddendumMessage: "CarePulse AI has successfully processed the 5-claim batch from Metro Multispecialty Clinic. 3 claims are auto-approved. 2 manual queue claims have been translated for rapid processor adjudication.",
        fhirQuestionnaireResponseStub: {
          resourceType: "Bundle",
          type: "batch-response",
          entry: [
            { response: { status: "200 OK", location: "Claim/CLM-88401" } },
            { response: { status: "202 Accepted", location: "Claim/CLM-88402 (Pending Addendum)" } },
            { response: { status: "200 OK", location: "Claim/CLM-88403" } }
          ]
        }
      },
      evidenceBackedAlternatives: [
        {
          title: "Bulk Batch Automated Pre-Validation Engine",
          rationale: "Pre-validating claims prior to submission eliminates 94% of initial billing rejections.",
          estimatedSavingsOrImpact: "$14,200 administrative savings / batch"
        }
      ],
      memberTransparencyCard: {
        headline: "Bulk Claims Batch Processed Successfully",
        plainLanguageStatus: "Metro Multispecialty Clinic batch processed: 3 clean claims approved instantly, and 2 manual queue claims resolved via AI intent translation.",
        estimatedTotalAllowedAmount: 23110,
        estimatedMemberCopayOrCoinsurance: 1200,
        deductibleApplied: 450,
        siteOfCareSavingsHighlight: "Provider policy pre-validation passed for 60% of batch on first pass.",
        recommendedFacility: "Metro Multispecialty Ambulatory Network",
        nextStepsForMember: [
          "Review explanation of benefits in patient app.",
          "Provider notified of pending addendum for Claim #CLM-88402."
        ]
      }
    };
  } else if (scenarioId === "case-b") {
    return {
      remediationNeeded: true,
      remediationPriority: "HIGH",
      providerAddendumRequest: {
        targetRecipient: "Dr. Sarah Jenkins, MD (Gastroenterology Associates)",
        subject: "Urgent Addendum Request: Prior Auth #PA-773190 (Adalimumab) - Missing TB IGRA & Prior Therapy Details",
        missingItemsChecklist: [
          "Negative Latent Tuberculosis (TB) Screening result (IGRA / PPD) within past 12 months",
          "Exact drug name, dosage, and stop date for prior oral immunosuppressant pill"
        ],
        draftAddendumMessage: "Dear Dr. Jenkins, CarePulse AI has performed an initial automated HL7 FHIR review for Marcus Thorne. To secure instant auto-approval under CMS-0057-F and prevent a 14-day administrative delay, please attach the recent IGRA lab report and confirm the prior immunosuppressant details.",
        fhirQuestionnaireResponseStub: {
          resourceType: "QuestionnaireResponse",
          status: "in-progress",
          questionnaire: "http://carepulse.ai/fhir/Questionnaire/crohns-biologic-addendum-v1",
          subject: { reference: "Patient/CP-773190", display: "Marcus Thorne" },
          item: [
            {
              linkId: "latent-tb-igra",
              text: "Negative Latent TB IGRA / PPD within 12 months",
              answer: [{ valueString: "PENDING_PROVIDER_UPLOAD" }]
            },
            {
              linkId: "prior-immunosuppressant",
              text: "Specific prior immunosuppressant name and dates",
              answer: [{ valueString: "PENDING_CLINICAL_CLARIFICATION" }]
            }
          ]
        }
      },
      evidenceBackedAlternatives: [
        {
          title: "Preferred Specialty Pharmacy Home Delivery",
          rationale: "Utilizing CareShield Specialty Network reduces monthly co-pay from $150 to $0 via manufacturer copay assistance card integration.",
          estimatedSavingsOrImpact: "$1,800/year member savings"
        }
      ],
      memberTransparencyCard: {
        headline: "Additional Information Requested for Instant Approval",
        plainLanguageStatus: "Hi Marcus! Your doctor\u2019s request for Adalimumab is currently paused because we just need one routine safety lab (a standard tuberculosis blood test) added to your file. Once uploaded, approval is instant with zero cost to you.",
        estimatedTotalAllowedAmount: 6450,
        estimatedMemberCopayOrCoinsurance: 0,
        deductibleApplied: 0,
        siteOfCareSavingsHighlight: "Specialty pharmacy home delivery with $0 copay assistance applied.",
        recommendedFacility: "CareShield Specialty Home Delivery Network",
        nextStepsForMember: [
          "Ask your gastroenterologist\u2019s office to upload your recent TB blood test result.",
          "Track status live in your CarePulse patient mobile app."
        ]
      }
    };
  } else if (scenarioId === "case-c") {
    return {
      remediationNeeded: false,
      remediationPriority: "NONE",
      providerAddendumRequest: {
        targetRecipient: "Dr. R. Patel, MD (Cardiac Electrophysiology)",
        subject: "Prior Authorization Approved: #PA-558214 (PVI Catheter Ablation)",
        missingItemsChecklist: [],
        draftAddendumMessage: "Prior authorization has been successfully auto-approved.",
        fhirQuestionnaireResponseStub: {
          resourceType: "QuestionnaireResponse",
          status: "completed",
          questionnaire: "http://carepulse.ai/fhir/Questionnaire/approved",
          subject: { reference: "Patient/CP-558214", display: "David Kim" }
        }
      },
      evidenceBackedAlternatives: [
        {
          title: "HeartRhythm Accredited ASC (Recommended Site of Care)",
          rationale: "Equipped with the same advanced EP mapping technology as Metro HOPD, located 3.2 miles away.",
          estimatedSavingsOrImpact: "$4,200 member out-of-pocket savings & $16,500 plan savings"
        }
      ],
      memberTransparencyCard: {
        headline: "Prior Authorization Approved \u2014 $4,200 OOP Savings Available!",
        plainLanguageStatus: "Great news David! Your cardiac ablation has been fully approved. By choosing HeartRhythm Accredited ASC instead of the hospital outpatient department, you save $4,200 on your remaining deductible and coinsurance.",
        estimatedTotalAllowedAmount: 11900,
        estimatedMemberCopayOrCoinsurance: 1450,
        deductibleApplied: 1450,
        siteOfCareSavingsHighlight: "Choosing the accredited ambulatory surgery center saves you $4,200 compared to hospital outpatient.",
        recommendedFacility: "HeartRhythm Accredited ASC (3.2 miles away)",
        nextStepsForMember: [
          "Confirm your preferred surgery date with Dr. Patel\u2019s scheduling coordinator.",
          "Review your digital price transparency summary in the patient portal."
        ]
      }
    };
  } else {
    return {
      remediationNeeded: false,
      remediationPriority: "NONE",
      providerAddendumRequest: {
        targetRecipient: "Dr. James Miller, MD (Spine & Orthopedic Center)",
        subject: "Prior Authorization Auto-Approved: #PA-904821 (Lumbar MRI)",
        missingItemsChecklist: [],
        draftAddendumMessage: "Auto-approved instantly.",
        fhirQuestionnaireResponseStub: {
          resourceType: "QuestionnaireResponse",
          status: "completed",
          questionnaire: "http://carepulse.ai/fhir/Questionnaire/approved",
          subject: { reference: "Patient/CP-904821", display: "Elena Vance" }
        }
      },
      evidenceBackedAlternatives: [
        {
          title: "Freestanding Diagnostic Imaging Center",
          rationale: "Tier 1 preferred provider network imaging center with zero deductible and $85 fixed copay.",
          estimatedSavingsOrImpact: "$535 out-of-pocket savings vs. hospital imaging"
        }
      ],
      memberTransparencyCard: {
        headline: "Prior Authorization Approved Instantly!",
        plainLanguageStatus: "Wonderful news Elena! Your lumbar MRI has been fully approved. You can schedule your scan at any Tier 1 freestanding imaging center for just an $85 copay with no deductible required.",
        estimatedTotalAllowedAmount: 620,
        estimatedMemberCopayOrCoinsurance: 85,
        deductibleApplied: 0,
        siteOfCareSavingsHighlight: "$85 fixed copay at Tier 1 freestanding imaging center.",
        recommendedFacility: "Advanced Diagnostic Imaging Center (Tier 1)",
        nextStepsForMember: [
          "Call any preferred Tier 1 imaging center to schedule your appointment.",
          "Show your digital CarePulse insurance card at check-in."
        ]
      }
    };
  }
}
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
} else {
  import("vite").then(async (vite) => {
    const viteServer = await vite.createServer({
      server: { middlewareMode: true }
    });
    app.use(viteServer.middlewares);
  });
}
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`CarePulse AI running on http://localhost:${PORT}`);
});
