export interface ScenarioData {
  id: string;
  name: string;
  category: string;
  description: string;
  member: {
    name: string;
    id: string;
    dob: string;
    plan: string;
    groupNumber: string;
  };
  requestedService: {
    serviceName: string;
    cptOrHcpcs: string;
    icd10: string;
    provider: string;
    facility: string;
  };
  policy: {
    id: string;
    title: string;
    cmsSla: string;
  };
  clinicalNote: string;
  payerPolicySnippet: string;
  siteOfCareOptions: Array<{
    id: string;
    name: string;
    distance: string;
    allowedAmount: number;
    memberCopay: number;
    recommended: boolean;
  }>;
  fhirBundle: any;
}

export const SCENARIOS: Record<string, ScenarioData> = {
  'case-a': {
    id: 'case-a',
    name: 'Case A: Lumbar MRI (Auto-Approve Ready)',
    category: 'Imaging & Diagnostics',
    description: 'Elena Vance — Chronic lumbar radiculopathy meeting all conservative care and objective red-flag criteria.',
    member: {
      name: 'Elena Vance',
      id: 'CP-904821-PPO',
      dob: '1988-04-14',
      plan: 'CareShield PPO Gold',
      groupNumber: 'GRP-88210',
    },
    requestedService: {
      serviceName: 'Lumbar Spine MRI without contrast',
      cptOrHcpcs: 'CPT 72148',
      icd10: 'ICD-10 M54.16',
      provider: 'Dr. James Miller, MD (Spine & Orthopedic Center)',
      facility: 'Advanced Diagnostic Imaging Center',
    },
    policy: {
      id: 'LCD-IMAGING-304',
      title: 'Lumbar Spine Magnetic Resonance Imaging Medical Necessity Policy',
      cmsSla: 'CMS-0057-F Real-Time Touchless SLA (< 72h Urgent / 7d Standard)',
    },
    clinicalNote: `PATIENT: Elena Vance (DOB: 04/14/1988, ID: CP-904821-PPO)
CHIEF COMPLAINT: Severe left-sided lower back pain radiating down the posterior left leg for 6.5 weeks.
HISTORY OF PRESENT ILLNESS: Patient presents with persistent lumbar radiculopathy following lifting injury. Completed 6.5 weeks of structured physical therapy (18 sessions) and pharmacotherapy including Naproxen 500mg BID and Gabapentin 600mg TID without sustained symptomatic relief.
PHYSICAL EXAMINATION: L5 motor examination reveals left ankle and hallux dorsiflexion weakness graded at 3+/5. Straight Leg Raise (SLR) test is strictly positive on the left at 30 degrees inducing lancinating pain. Deep tendon reflexes: left achilles diminished.
ASSESSMENT / PLAN: Suspected lumbar disc herniation with L5 nerve root impingement. Requesting urgent lumbar spine MRI without contrast (CPT 72148) to guide surgical evaluation.`,
    payerPolicySnippet: `CARESHIELD MEDICAL POLICY: LCD-IMAGING-304
1. Duration of conservative therapy of at least 6 weeks including documented supervised physical therapy and pharmacologic management.
2. Presence of objective neurological deficit (motor weakness <= 4/5, asymmetric reflex loss) or acute red-flag radicular signs (positive Straight Leg Raise).
3. Pre-authorization approved instantly when all criteria are fully substantiated by structured EHR evidence.`,
    siteOfCareOptions: [
      {
        id: 'soc-1',
        name: 'Advanced Diagnostic Imaging Center (Tier 1 Freestanding)',
        distance: '1.4 miles',
        allowedAmount: 620,
        memberCopay: 85,
        recommended: true,
      },
      {
        id: 'soc-2',
        name: 'Metro University Hospital Outpatient Radiology',
        distance: '6.8 miles',
        allowedAmount: 1450,
        memberCopay: 320,
        recommended: false,
      }
    ],
    fhirBundle: {
      resourceType: 'Bundle',
      id: 'bundle-elena-vance-mri',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'CP-904821-PPO',
            name: [{ family: 'Vance', given: ['Elena'] }],
            gender: 'female',
            birthDate: '1988-04-14'
          }
        },
        {
          resource: {
            resourceType: 'Coverage',
            id: 'cov-ppo-gold',
            beneficiary: { reference: 'Patient/CP-904821-PPO' },
            payor: [{ display: 'CareShield PPO Gold' }],
            class: [{ type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/coverage-class', code: 'plan' }] }, name: 'PPO Gold Tier 1' }]
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'cond-lumbar-radiculopathy',
            subject: { reference: 'Patient/CP-904821-PPO' },
            code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'M54.16', display: 'Lumbar radiculopathy' }] },
            clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }] }
          }
        },
        {
          resource: {
            resourceType: 'Procedure',
            id: 'proc-lumbar-mri',
            subject: { reference: 'Patient/CP-904821-PPO' },
            code: { coding: [{ system: 'http://www.ama-assn.org/go/cpt', code: '72148', display: 'MRI lumbar spine without contrast' }] },
            status: 'completed'
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-motor-deficit',
            subject: { reference: 'Patient/CP-904821-PPO' },
            code: { coding: [{ system: 'http://loinc.org', code: '72514-3', display: 'L5 motor strength examination' }] },
            valueString: '3+/5 left L5 dorsiflexion weakness, positive SLR at 30 deg'
          }
        }
      ]
    }
  },
  'case-b': {
    id: 'case-b',
    name: 'Case B: Adalimumab for Crohn’s (Documentation Gap)',
    category: 'Specialty Pharmacy & Biologics',
    description: 'Marcus Thorne — Moderate-to-severe Crohn’s disease needing biologic therapy; missing mandatory latent TB IGRA screening.',
    member: {
      name: 'Marcus Thorne',
      id: 'CP-773190-HMO',
      dob: '1979-11-22',
      plan: 'CareShield Select HMO',
      groupNumber: 'GRP-55401',
    },
    requestedService: {
      serviceName: 'Adalimumab 40mg subcutaneous injection',
      cptOrHcpcs: 'HCPCS J0135 / RxNorm 327361',
      icd10: 'ICD-10 K50.80',
      provider: 'Dr. Sarah Jenkins, MD (Gastroenterology Associates)',
      facility: 'CareShield Specialty Home Delivery',
    },
    policy: {
      id: 'RX-BIOLOGIC-112',
      title: 'Anti-TNF Biologic Therapy Prior Authorization Protocol for Inflammatory Bowel Disease',
      cmsSla: 'CMS-0057-F Standard Tier with Automated Remediation Hook',
    },
    clinicalNote: `PATIENT: Marcus Thorne (DOB: 11/22/1979, ID: CP-773190-HMO)
CHIEF COMPLAINT: Recurrent abdominal cramping, bloody stools, and debilitating weight loss.
HISTORY: Diagnosed with Crohn’s disease of the terminal ileum and colon (ICD-10 K50.80). Endoscopic evaluation demonstrates SES-CD score of 14 (moderate-to-severe active inflammation). Fecal calprotectin is 890 ug/g; CRP is 3.4 mg/dL.
PRIOR THERAPIES: Patient had partial symptomatic response to oral Budesonide 9mg daily for 8 weeks, but flared upon taper. Previously tried an oral immunosuppressant pill (exact drug name and dates unrecorded in chart notes).
SAFETY SCREENING: Hepatitis B surface antigen and core antibody negative. Latent tuberculosis screening (IGRA blood test or PPD skin test within past 12 months) is currently missing from submitted EHR chart records.
ASSESSMENT / PLAN: Initiate Adalimumab 40mg subcutaneous bi-weekly maintenance therapy.`,
    payerPolicySnippet: `CARESHIELD MEDICAL POLICY: RX-BIOLOGIC-112
1. Documented diagnosis of moderate-to-severe Crohn’s disease with objective inflammatory biomarkers (Fecal Calprotectin > 250 ug/g or SES-CD >= 6).
2. Trial and inadequate response or intolerance to conventional corticosteroids (e.g., budesonide) and at least one conventional immunomodulator with verified drug name, dosing, and start/stop dates.
3. Mandatory negative latent tuberculosis (TB) screening (Interferon-gamma release assay IGRA or PPD tuberculin skin test) completed within the preceding 12 months.
4. If safety screening or step therapy dates are missing, automatic provisional pause and provider addendum request are triggered under CMS-0057-F.`,
    siteOfCareOptions: [
      {
        id: 'soc-b1',
        name: 'CareShield Specialty Pharmacy Home Delivery ($0 Copay Program)',
        distance: 'Direct-to-Door',
        allowedAmount: 6450,
        memberCopay: 0,
        recommended: true,
      },
      {
        id: 'soc-b2',
        name: 'Hospital Outpatient Infusion Center',
        distance: '4.5 miles',
        allowedAmount: 8900,
        memberCopay: 150,
        recommended: false,
      }
    ],
    fhirBundle: {
      resourceType: 'Bundle',
      id: 'bundle-marcus-thorne-biologic',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'CP-773190-HMO',
            name: [{ family: 'Thorne', given: ['Marcus'] }],
            gender: 'male',
            birthDate: '1979-11-22'
          }
        },
        {
          resource: {
            resourceType: 'Coverage',
            id: 'cov-hmo',
            beneficiary: { reference: 'Patient/CP-773190-HMO' },
            payor: [{ display: 'CareShield Select HMO' }]
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'cond-crohns',
            subject: { reference: 'Patient/CP-773190-HMO' },
            code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'K50.80', display: 'Crohn’s disease without complications' }] }
          }
        },
        {
          resource: {
            resourceType: 'MedicationRequest',
            id: 'med-adalimumab',
            subject: { reference: 'Patient/CP-773190-HMO' },
            medicationCodeableConcept: { coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '327361', display: 'Adalimumab 40 MG/ML' }] },
            status: 'active'
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-calprotectin',
            subject: { reference: 'Patient/CP-773190-HMO' },
            code: { coding: [{ system: 'http://loinc.org', code: ' ઉજવળ', display: 'Fecal calprotectin' }] },
            valueQuantity: { value: 890, unit: 'ug/g' }
          }
        }
      ]
    }
  },
  'case-c': {
    id: 'case-c',
    name: 'Case C: Cardiac Ablation (Site-of-Care Optimization)',
    category: 'Cardiology & Surgical Procedures',
    description: 'David Kim — Symptomatic paroxysmal atrial fibrillation; comparing Hospital HOPD vs. Accredited ASC for $4,200 member OOP savings.',
    member: {
      name: 'David Kim',
      id: 'CP-558214-HDHP',
      dob: '1968-09-03',
      plan: 'Consumer HDHP Plus',
      groupNumber: 'GRP-10940',
    },
    requestedService: {
      serviceName: 'Catheter ablation of arrhythmia, pulmonary vein isolation (PVI)',
      cptOrHcpcs: 'CPT 93656',
      icd10: 'ICD-10 I48.0',
      provider: 'Dr. R. Patel, MD (Cardiac Electrophysiology)',
      facility: 'HeartRhythm Accredited ASC vs. Metro HOPD',
    },
    policy: {
      id: 'CARD-EP-409',
      title: 'Electrophysiology Catheter Ablation Medical Necessity & Site-of-Care Protocol',
      cmsSla: 'CMS-0057-F Interoperable Authorization with Cost Transparency',
    },
    clinicalNote: `PATIENT: David Kim (DOB: 09/03/1968, ID: CP-558214-HDHP)
CHIEF COMPLAINT: Symptomatic paroxysmal atrial fibrillation with disabling fatigue and palpitations.
HISTORY: 14-day continuous ambulatory cardiac telemetry patch demonstrates 14% atrial fibrillation burden. Patient has failed trials of Metoprolol Succinate 50mg daily and Flecainide 100mg BID with persistent breakthrough episodes and drug intolerance (dizziness).
PRE-OP ASSESSMENT: LVEF 58% (normal), ASA physical status Class II, BMI 27.4. No contraindications to catheter ablation.
FACILITY OPTIONS:
1. Metro University Hospital Outpatient Department (HOPD) — Allowed: $28,400 | Patient Deductible/Coinsurance: $5,650.
2. HeartRhythm Accredited Ambulatory Surgery Center (ASC) — Allowed: $11,900 | Patient Deductible/Coinsurance: $1,450.`,
    payerPolicySnippet: `CARESHIELD MEDICAL POLICY: CARD-EP-409
1. Documented symptomatic paroxysmal or persistent atrial fibrillation refractory to at least one Class I or III antiarrhythmic medication.
2. Normal or mildly impaired ventricular function (LVEF >= 40%).
3. CarePulse Site-of-Care Optimization encourages accredited ambulatory surgical centers for low-risk EP procedures, delivering significant member out-of-pocket savings.`,
    siteOfCareOptions: [
      {
        id: 'soc-c1',
        name: 'HeartRhythm Accredited ASC (Recommended — 3.2 miles away)',
        distance: '3.2 miles',
        allowedAmount: 11900,
        memberCopay: 1450,
        recommended: true,
      },
      {
        id: 'soc-c2',
        name: 'Metro University Hospital Outpatient Department (HOPD)',
        distance: '9.1 miles',
        allowedAmount: 28400,
        memberCopay: 5650,
        recommended: false,
      }
    ],
    fhirBundle: {
      resourceType: 'Bundle',
      id: 'bundle-david-kim-ablation',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'CP-558214-HDHP',
            name: [{ family: 'Kim', given: ['David'] }],
            gender: 'male',
            birthDate: '1968-09-03'
          }
        },
        {
          resource: {
            resourceType: 'Coverage',
            id: 'cov-hdhp',
            beneficiary: { reference: 'Patient/CP-558214-HDHP' },
            payor: [{ display: 'Consumer HDHP Plus' }]
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'cond-afib',
            subject: { reference: 'Patient/CP-558214-HDHP' },
            code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'I48.0', display: 'Paroxysmal atrial fibrillation' }] }
          }
        },
        {
          resource: {
            resourceType: 'Procedure',
            id: 'proc-ablation',
            subject: { reference: 'Patient/CP-558214-HDHP' },
            code: { coding: [{ system: 'http://www.ama-assn.org/go/cpt', code: '93656', display: 'Catheter ablation PVI' }] }
          }
        }
      ]
    }
  },
  'custom': {
    id: 'custom',
    name: 'Custom Sandbox Case (Fully Editable EHR & Policy)',
    category: 'Interactive Custom Scenario',
    description: 'Free-form sandbox to test custom clinical notes, payer policies, and HL7 FHIR R4 bundles.',
    member: {
      name: 'Alex Mercer',
      id: 'CP-000999-CUSTOM',
      dob: '1985-06-15',
      plan: 'CareShield Universal Care',
      groupNumber: 'GRP-99999',
    },
    requestedService: {
      serviceName: 'Total Knee Arthroplasty (Right Knee)',
      cptOrHcpcs: 'CPT 27447',
      icd10: 'ICD-10 M17.11',
      provider: 'Dr. Robert Chen, MD (Orthopedic Joint Center)',
      facility: 'Orthopedic Specialty Surgical Hospital',
    },
    policy: {
      id: 'ORTHO-THR-204',
      title: 'Total Knee Arthroplasty Medical Necessity Protocol',
      cmsSla: 'CMS-0057-F Interoperable Prior Authorization Tier',
    },
    clinicalNote: `PATIENT: Alex Mercer (DOB: 06/15/1985, ID: CP-000999-CUSTOM)
CHIEF COMPLAINT: Right knee pain and mechanical locking limiting walking to less than 2 blocks.
HISTORY: Radiographs demonstrate Kellgren-Lawrence Grade 4 severe osteoarthritis of the right tibiofemoral joint with complete joint space obliteration. Patient has completed 12 weeks of structured physical therapy, NSAID therapy, and intra-articular hyaluronic acid injection with persistent functional impairment.
ASSESSMENT / PLAN: Right total knee arthroplasty (CPT 27447) indicated for end-stage primary osteoarthritis (ICD-10 M17.11).`,
    payerPolicySnippet: `CARESHIELD MEDICAL POLICY: ORTHO-THR-204
1. Radiographic evidence of Kellgren-Lawrence Grade 3 or 4 osteoarthritis.
2. Documented trial of at least 12 weeks of conservative management (physical therapy, analgesics).
3. Functional limitation impacting activities of daily living.`,
    siteOfCareOptions: [
      {
        id: 'soc-custom-1',
        name: 'Orthopedic Specialty Surgical Center',
        distance: '2.5 miles',
        allowedAmount: 18500,
        memberCopay: 1200,
        recommended: true,
      },
      {
        id: 'soc-custom-2',
        name: 'General Community Hospital',
        distance: '7.1 miles',
        allowedAmount: 26800,
        memberCopay: 3400,
        recommended: false,
      }
    ],
    fhirBundle: {
      resourceType: 'Bundle',
      id: 'bundle-custom-sandbox',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'CP-000999-CUSTOM',
            name: [{ family: 'Mercer', given: ['Alex'] }],
            gender: 'male',
            birthDate: '1985-06-15'
          }
        },
        {
          resource: {
            resourceType: 'Coverage',
            id: 'cov-universal',
            beneficiary: { reference: 'Patient/CP-000999-CUSTOM' },
            payor: [{ display: 'CareShield Universal Care' }]
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'cond-oa-knee',
            subject: { reference: 'Patient/CP-000999-CUSTOM' },
            code: { coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', code: 'M17.11', display: 'Primary osteoarthritis, right knee' }] }
          }
        },
        {
          resource: {
            resourceType: 'Procedure',
            id: 'proc-tka',
            subject: { reference: 'Patient/CP-000999-CUSTOM' },
            code: { coding: [{ system: 'http://www.ama-assn.org/go/cpt', code: '27447', display: 'Total knee arthroplasty' }] }
          }
        }
      ]
    }
  },
  'case-bulk': {
    id: 'case-bulk',
    name: 'Case D: Bulk Provider Claims Batch Upload & Processor Intent Queue',
    category: 'Batch Interoperability & Claims Processing',
    description: 'Metro Multispecialty Clinic bulk claims upload (batch of 5 claims) with automated provider policy pre-validation and claims processor intent translation.',
    member: {
      name: 'Metro Multispecialty Clinic Batch (5 Claims)',
      id: 'BATCH-2026-NOV-09',
      dob: 'N/A',
      plan: 'CareShield Multi-Plan PPO/HMO',
      groupNumber: 'GRP-BULK-990',
    },
    requestedService: {
      serviceName: 'Multi-Claim Outpatient & Specialty Batch',
      cptOrHcpcs: 'CPT 99214, 72148, 27447, 93656, J0135',
      icd10: 'ICD-10 Multiple Diagnoses',
      provider: 'Dr. Robert Chen, MD & Group Billing Dept (Metro Clinic)',
      facility: 'CareShield Payer Enterprise Claims Gateway',
    },
    policy: {
      id: 'BULK-CLAIMS-INTENT-01',
      title: 'CMS-0057-F Interoperable Bulk Claims Intake & Processor Intent Translation Protocol',
      cmsSla: 'CMS-0057-F Real-Time Batch Intake SLA (< 24h Queue Resolution)',
    },
    clinicalNote: `BULK BATCH SUBMISSION HEADER:
Provider: Metro Multispecialty Clinic Group (NPI: 1457892011)
Batch ID: BATCH-2026-NOV-09-001
Total Claims in Batch: 5

CLAIM 1 (#CLM-88401): Patient Elena Vance | CPT 72148 (Lumbar MRI) | ICD-10 M54.16 | Status: Pre-validated against LCD-IMAGING-304. All conservative care notes attached. Ready for touchless auto-adjudication.
CLAIM 2 (#CLM-88402): Patient Marcus Thorne | HCPCS J0135 (Adalimumab) | ICD-10 K50.80 | Status: Flagged in Manual Queue. Missing latent TB IGRA lab result. CarePulse AI suggests processor addendum request or partial adjustment.
CLAIM 3 (#CLM-88403): Patient David Kim | CPT 93656 (Cardiac PVI Ablation) | ICD-10 I48.0 | Status: Pre-validated against CARD-EP-409 at HeartRhythm ASC. Member OOP savings highlighted. Auto-approve ready.
CLAIM 4 (#CLM-88404): Patient Brenda Cole | CPT 99214 (Outpatient Office Visit) | ICD-10 I10 | Status: Routine hypertension check. Clean claim. Auto-approved instantly.
CLAIM 5 (#CLM-88405): Patient Kevin Vance | CPT 29881 (Arthroscopy Knee) | ICD-10 M23.22 | Status: Flagged in Manual Queue due to conflicting prior authorization ID. CarePulse AI intent translator identifies matching emergency modifier and suggests fast-track approval.`,
    payerPolicySnippet: `CARESHIELD BULK CLAIMS PROCESSING & PROCESSOR INTENT PROTOCOL:
1. Provider Side: CarePulse AI automatically checks every submitted claim in the batch against payer medical policies, flagging missing documentation or unverified step therapy before submission to prevent denials.
2. Processor / Payer Manual Queue Side: For claims routed to manual review, CarePulse AI parses unstructured claim metadata and clinical notes, translates the true clinical intent, recommends fast-track queue resolution, or provides precise clinical rationale for policy-aligned adjustments or rejections.`,
    siteOfCareOptions: [
      {
        id: 'soc-bulk-1',
        name: 'Metro Multispecialty Ambulatory Network',
        distance: 'Various',
        allowedAmount: 45000,
        memberCopay: 1200,
        recommended: true,
      }
    ],
    fhirBundle: {
      resourceType: 'Bundle',
      id: 'bundle-bulk-claims-batch',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Claim',
            id: 'CLM-88401',
            status: 'active',
            patient: { reference: 'Patient/CP-904821', display: 'Elena Vance' },
            provider: { display: 'Metro Multispecialty Clinic' },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'M54.16', display: 'Lumbar radiculopathy' }] } }],
            item: [{ productOrService: { coding: [{ code: '72148', display: 'Lumbar MRI' }] }, net: { value: 620, currency: 'USD' } }]
          }
        },
        {
          resource: {
            resourceType: 'Claim',
            id: 'CLM-88402',
            status: 'active',
            patient: { reference: 'Patient/CP-773190', display: 'Marcus Thorne' },
            provider: { display: 'Metro Multispecialty Clinic' },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'K50.80', display: 'Crohn’s Disease' }] } }],
            item: [{ productOrService: { coding: [{ code: 'J0135', display: 'Adalimumab 40mg' }] }, net: { value: 6450, currency: 'USD' } }]
          }
        },
        {
          resource: {
            resourceType: 'Claim',
            id: 'CLM-88403',
            status: 'active',
            patient: { reference: 'Patient/CP-558214', display: 'David Kim' },
            provider: { display: 'Metro Multispecialty Clinic' },
            diagnosis: [{ diagnosisCodeableConcept: { coding: [{ code: 'I48.0', display: 'Paroxysmal AFib' }] } }],
            item: [{ productOrService: { coding: [{ code: '93656', display: 'Cardiac PVI Ablation' }] }, net: { value: 11900, currency: 'USD' } }]
          }
        }
      ]
    }
  }
};
