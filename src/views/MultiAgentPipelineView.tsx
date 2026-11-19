import React, { useState } from 'react';
import { ScenarioData } from '../data/scenarios';
import { CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Send, Download, FileJson, Check, ExternalLink, Sparkles } from 'lucide-react';

interface MultiAgentPipelineViewProps {
  scenario: ScenarioData;
  agent1Data: any;
  agent2Data: any;
  agent3Data: any;
  isExecuting: boolean;
  onRerunPipeline: () => void;
}

export const MultiAgentPipelineView: React.FC<MultiAgentPipelineViewProps> = ({
  scenario,
  agent1Data,
  agent2Data,
  agent3Data,
  isExecuting,
  onRerunPipeline,
}) => {
  const [dispatched, setDispatched] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<string | null>(null);

  const handleDispatchAddendum = () => {
    const receiptId = `DTR-PAS-${Math.floor(100000 + Math.random() * 900000)}`;
    setDispatchReceipt(receiptId);
    setDispatched(true);
  };

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDeterminationBadge = (det: string) => {
    if (det === 'AUTO_APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          AUTO-APPROVED (CMS-0057-F Fast-Track)
        </span>
      );
    }
    if (det === 'REMEDIATION_REQUIRED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          REMEDIATION REQUIRED (Proactive DTR Hook)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold shadow-sm">
        <ShieldCheck className="w-4 h-4 text-blue-400" />
        CLINICAL REVIEW SUGGESTED
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-[#0B1F3A] text-white p-6 rounded-2xl shadow-xl border border-blue-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600/40 border border-blue-500/50 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
              HL7 FHIR Da Vinci PAS & DTR
            </span>
            <span className="text-xs text-slate-400">• Model: {agent1Data?.model || 'gemini-2.5-flash'}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">CarePulse Multi-Agent Execution Pipeline</h2>
          <p className="text-xs text-slate-300 mt-1">
            Autonomous 3-stage clinical parsing, policy adjudication, and proactive remediation for {scenario.member.name}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRerunPipeline}
            disabled={isExecuting}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Cpu className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            {isExecuting ? 'Executing Agents...' : 'Re-Run Pipeline'}
          </button>
        </div>
      </div>

      {/* AGENT 1 CARD: Clinical Parsing & FHIR Extraction */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Agent 1 — Clinical Parsing & HL7 FHIR R4 Extraction</h3>
              <p className="text-[11px] text-slate-500">Mode: <span className="uppercase font-semibold text-blue-600">{agent1Data?.mode || 'demo'}</span> • Latency: <span className="font-semibold">{agent1Data?.latencyMs || 420}ms</span></p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Structured Extraction Complete
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Patient Clinical Summary</span>
            <p className="text-sm text-slate-800 font-medium">{agent1Data?.result?.patientSummary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ICD-10 & Procedures */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Extracted ICD-10 Diagnoses</h4>
                <div className="space-y-2">
                  {agent1Data?.result?.icd10Codes?.map((code: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-mono font-bold text-blue-700">{code.code}</span>
                      <span className="text-slate-600 text-right">{code.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Procedure / Medication Codes</h4>
                <div className="space-y-2">
                  {agent1Data?.result?.procedureOrMedicationCodes?.map((proc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-mono font-bold text-emerald-700">{proc.code}</span>
                      <span className="text-slate-600 text-right">{proc.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Biomarkers & Step Therapies */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Clinical Biomarkers & Findings</h4>
                <div className="space-y-2">
                  {agent1Data?.result?.clinicalBiomarkersAndFindings?.map((bio: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between text-xs p-2.5 rounded-lg border ${bio.isRedFlag ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                      <span className="font-semibold">{bio.finding}</span>
                      <span className="font-mono">{bio.valueOrDetail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Prior Conservative & Step Therapies</h4>
                <div className="space-y-2">
                  {agent1Data?.result?.priorConservativeOrStepTherapies?.map((th: any, i: number) => (
                    <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{th.therapy}</span>
                        <span className="text-slate-500 font-normal">{th.durationOrDates}</span>
                      </div>
                      <p className="text-slate-600">{th.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AGENT 2 CARD: Policy Adjudication & CMS-0057-F Compliance */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Agent 2 — Policy Adjudication & CMS-0057-F Compliance</h3>
              <p className="text-[11px] text-slate-500">Mode: <span className="uppercase font-semibold text-indigo-600">{agent2Data?.mode || 'demo'}</span> • Latency: <span className="font-semibold">{agent2Data?.latencyMs || 510}ms</span></p>
            </div>
          </div>
          {getDeterminationBadge(agent2Data?.result?.determination)}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Policy Reference</span>
              <span className="text-xs font-bold text-slate-900">{agent2Data?.result?.policyReference}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Approval Confidence Score</span>
              <span className="text-sm font-extrabold text-blue-600">{agent2Data?.result?.approvalConfidenceScore}% / 100%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">CMS-0057-F Projected SLA</span>
              <span className="text-xs font-bold text-emerald-600">{agent2Data?.result?.cms0057fCompliance?.slaCategory}</span>
            </div>
          </div>

          {/* Criteria Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Medical Policy Criteria Evaluation</h4>
            <div className="space-y-2">
              {agent2Data?.result?.criteriaEvaluation?.map((crit: any, i: number) => {
                const isMet = crit.status === 'MET';
                const isMissing = crit.status === 'MISSING';
                return (
                  <div key={i} className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                    isMet ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : isMissing ? 'bg-rose-50/50 border-rose-200 text-rose-950' : 'bg-amber-50/50 border-amber-200 text-amber-950'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{crit.criterionId}:</span>
                        <span className="font-semibold text-xs">{crit.criterionTitle}</span>
                      </div>
                      <p className="text-xs text-slate-600">{crit.clinicalEvidenceFound || crit.gapExplanation}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                      isMet ? 'bg-emerald-600 text-white' : isMissing ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {crit.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Adjudication Rationale</span>
            <p className="text-xs text-slate-800 leading-relaxed">{agent2Data?.result?.adjudicationRationale}</p>
          </div>
        </div>
      </div>

      {/* AGENT 3 CARD: Proactive Remediation & Member Transparency */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Agent 3 — Proactive Remediation & Member Price Transparency</h3>
              <p className="text-[11px] text-slate-500">Mode: <span className="uppercase font-semibold text-teal-600">{agent3Data?.mode || 'demo'}</span> • Latency: <span className="font-semibold">{agent3Data?.latencyMs || 490}ms</span></p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            agent3Data?.result?.remediationNeeded ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {agent3Data?.result?.remediationNeeded ? 'Remediation Hook Active' : 'No Remediation Needed'}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Addendum Request (if needed) */}
          {agent3Data?.result?.remediationNeeded && (
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Da Vinci DTR Provider Addendum Request
                </h4>
                <span className="text-xs font-semibold text-amber-700">Target: {agent3Data?.result?.providerAddendumRequest?.targetRecipient}</span>
              </div>

              <p className="text-xs text-amber-900 font-medium">{agent3Data?.result?.providerAddendumRequest?.draftAddendumMessage}</p>

              <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Missing Items Checklist:</span>
                <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
                  {agent3Data?.result?.providerAddendumRequest?.missingItemsChecklist?.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Dispatch Button & Receipt */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <button
                  onClick={handleDispatchAddendum}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {dispatched ? 'Addendum Dispatched Successfully' : 'Dispatch FHIR Addendum to EHR'}
                </button>
                {dispatched && dispatchReceipt && (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    Receipt ID: {dispatchReceipt} (Timestamp: {new Date().toLocaleTimeString()})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Member Transparency Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold tracking-tight">Member Price Transparency & Plain Language Summary</h4>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-800 text-blue-200">
                CMS-0057-F Compliant
              </span>
            </div>

            <p className="text-sm font-bold text-cyan-200">{agent3Data?.result?.memberTransparencyCard?.headline}</p>
            <p className="text-xs text-slate-200 leading-relaxed bg-blue-950/60 p-4 rounded-xl border border-blue-800/60">
              "{agent3Data?.result?.memberTransparencyCard?.plainLanguageStatus}"
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="bg-blue-950/80 p-3.5 rounded-xl border border-blue-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Allowed Amount</span>
                <span className="text-base font-extrabold text-white">${agent3Data?.result?.memberTransparencyCard?.estimatedTotalAllowedAmount?.toLocaleString()}</span>
              </div>
              <div className="bg-blue-950/80 p-3.5 rounded-xl border border-blue-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Member OOP</span>
                <span className="text-base font-extrabold text-emerald-400">${agent3Data?.result?.memberTransparencyCard?.estimatedMemberCopayOrCoinsurance?.toLocaleString()}</span>
              </div>
              <div className="bg-blue-950/80 p-3.5 rounded-xl border border-blue-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Deductible Applied</span>
                <span className="text-base font-extrabold text-white">${agent3Data?.result?.memberTransparencyCard?.deductibleApplied?.toLocaleString()}</span>
              </div>
              <div className="bg-blue-950/80 p-3.5 rounded-xl border border-blue-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Facility</span>
                <span className="text-xs font-bold text-cyan-300 truncate block" title={agent3Data?.result?.memberTransparencyCard?.recommendedFacility}>
                  {agent3Data?.result?.memberTransparencyCard?.recommendedFacility}
                </span>
              </div>
            </div>

            <div className="bg-blue-950/60 p-4 rounded-xl border border-blue-800/60 space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">Next Steps for Member:</span>
              <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                {agent3Data?.result?.memberTransparencyCard?.nextStepsForMember?.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Evidence-Backed Alternatives / Site-of-Care Savings */}
          {agent3Data?.result?.evidenceBackedAlternatives?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evidence-Backed Alternatives & Site-of-Care Optimization</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agent3Data?.result?.evidenceBackedAlternatives?.map((alt: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{alt.title}</h5>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {alt.estimatedSavingsOrImpact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{alt.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200">
            <button
              onClick={() => downloadJson(agent3Data?.result?.providerAddendumRequest?.fhirQuestionnaireResponseStub || {}, `QuestionnaireResponse-${scenario.member.id}.json`)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <FileJson className="w-4 h-4 text-emerald-400" />
              Export QuestionnaireResponse (.fhir+json)
            </button>
            <button
              onClick={() => downloadJson({ scenario, agent1: agent1Data?.result, agent2: agent2Data?.result, agent3: agent3Data?.result }, `CarePulse-Summary-${scenario.member.id}.json`)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              Download Full FHIR / PA Summary (.json)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
