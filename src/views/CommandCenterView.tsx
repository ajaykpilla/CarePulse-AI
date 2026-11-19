import React, { useState } from 'react';
import { ScenarioData, SCENARIOS } from '../data/scenarios';
import { Play, RotateCcw, FileText, Code, CheckCircle2, Clock, AlertTriangle, ShieldCheck, Database, Filter, Layers, Users, Send, Check } from 'lucide-react';

interface CommandCenterViewProps {
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  scenario: ScenarioData;
  clinicalNote: string;
  setClinicalNote: (note: string) => void;
  policySnippet: string;
  setPolicySnippet: (snippet: string) => void;
  fhirJson: string;
  setFhirJson: (json: string) => void;
  onRunPipeline: () => void;
  pipelineState: {
    step1: { status: 'standby' | 'active' | 'completed' | 'error'; latencyMs?: number };
    step2: { status: 'standby' | 'active' | 'completed' | 'error'; latencyMs?: number };
    step3: { status: 'standby' | 'active' | 'completed' | 'error'; latencyMs?: number };
  };
  hasRunPipeline: boolean;
  onInspectPipeline: () => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  activeScenarioId,
  setActiveScenarioId,
  scenario,
  clinicalNote,
  setClinicalNote,
  policySnippet,
  setPolicySnippet,
  fhirJson,
  setFhirJson,
  onRunPipeline,
  pipelineState,
  hasRunPipeline,
  onInspectPipeline,
}) => {
  const [rightTab, setRightTab] = useState<'cards' | 'json'>('cards');
  const [resourceFilter, setResourceFilter] = useState<string>('All');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [selectedBulkClaim, setSelectedBulkClaim] = useState<number>(0);
  const [claimActionTaken, setClaimActionTaken] = useState<Record<number, string>>({});

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveScenarioId(e.target.value);
  };

  const handleReset = () => {
    const s = SCENARIOS[activeScenarioId];
    if (s) {
      setClinicalNote(s.clinicalNote);
      setPolicySnippet(s.payerPolicySnippet);
      setFhirJson(JSON.stringify(s.fhirBundle, null, 2));
      setJsonError(null);
      setClaimActionTaken({});
    }
  };

  const handleJsonChange = (val: string) => {
    setFhirJson(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  let parsedBundle: any = null;
  try {
    parsedBundle = JSON.parse(fhirJson);
  } catch {
    parsedBundle = null;
  }

  const entries = parsedBundle?.entry || [];
  const filteredEntries = entries.filter((ent: any) => {
    if (resourceFilter === 'All') return true;
    return ent.resource?.resourceType?.toLowerCase() === resourceFilter.toLowerCase();
  });

  const getStepBadge = (status: 'standby' | 'active' | 'completed' | 'error', latency?: number) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed {latency ? `(${latency}ms)` : ''}
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-300 bg-blue-950/60 border border-blue-800 px-2.5 py-1 rounded-full animate-pulse">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          Executing Agent...
        </span>
      );
    }
    if (status === 'error') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5" />
          Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
        Standby
      </span>
    );
  };

  const bulkClaimsList = [
    {
      id: 'CLM-88401',
      patient: 'Elena Vance',
      service: 'Lumbar MRI (CPT 72148)',
      amount: '$620',
      status: 'Auto-Approved Ready',
      intent: 'Clean diagnostic claim meeting LCD-IMAGING-304 conservative therapy criteria. Ready for instant touchless adjudication.',
      recommendation: 'Fast-Track Auto-Approve & Pay',
      isManualQueue: false,
    },
    {
      id: 'CLM-88402',
      patient: 'Marcus Thorne',
      service: 'Adalimumab 40mg (HCPCS J0135)',
      amount: '$6,450',
      status: 'Manual Queue (Missing Lab)',
      intent: 'Biologic therapy for Crohn’s disease. EHR notes document SES-CD 14 and prior budesonide failure, but mandatory latent TB IGRA screening lab is missing.',
      recommendation: 'Trigger Provider Addendum Request (DTR Hook) or Issue Policy-Aligned Pend Notice',
      isManualQueue: true,
    },
    {
      id: 'CLM-88403',
      patient: 'David Kim',
      service: 'Cardiac PVI Ablation (CPT 93656)',
      amount: '$11,900',
      status: 'Auto-Approved (ASC Optimized)',
      intent: 'Symptomatic paroxysmal AFib refractory to antiarrhythmics. Scheduled at accredited ASC with $4,200 member OOP savings.',
      recommendation: 'Fast-Track Auto-Approve with Site-of-Care Incentive',
      isManualQueue: false,
    },
    {
      id: 'CLM-88404',
      patient: 'Brenda Cole',
      service: 'Outpatient Office Visit (CPT 99214)',
      amount: '$240',
      status: 'Auto-Approved Clean Claim',
      intent: 'Routine hypertension follow-up evaluation. All diagnostic and billing codes fully aligned.',
      recommendation: 'Instant Auto-Approve & Pay',
      isManualQueue: false,
    },
    {
      id: 'CLM-88405',
      patient: 'Kevin Vance',
      service: 'Arthroscopic Knee Surgery (CPT 29881)',
      amount: '$4,150',
      status: 'Manual Queue (PA ID Mismatch)',
      intent: 'Acute locked knee with medial meniscus tear. Clerical billing error resulted in transposed prior auth ID digits; clinical notes verify urgent necessity.',
      recommendation: 'Translate Intent & Fast-Track Approve (Correct PA ID #PA-44910)',
      isManualQueue: true,
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Control Bar & Scenario Selector */}
      <div className="bg-[#0B1F3A] text-white p-5 rounded-2xl shadow-xl border border-blue-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Scenario:</span>
            <select
              value={activeScenarioId}
              onChange={handleScenarioChange}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-medium text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
            >
              <option value="case-a">Case A: Lumbar MRI (Auto-Approve Ready)</option>
              <option value="case-b">Case B: Adalimumab for Crohn’s (Documentation Gap)</option>
              <option value="case-c">Case C: Cardiac Ablation (Site-of-Care Savings)</option>
              <option value="case-bulk">Case D: Bulk Provider Claims Batch & Processor Queue</option>
              <option value="custom">Custom Sandbox Case (Fully Editable)</option>
            </select>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition border border-slate-700"
            title="Reset to default scenario text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Case
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={onRunPipeline}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/40 transition transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Run CarePulse Multi-Agent Pipeline
          </button>
          {hasRunPipeline && (
            <button
              onClick={onInspectPipeline}
              className="flex items-center gap-1.5 bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md border border-blue-500/50 animate-bounce"
            >
              Inspect Output →
            </button>
          )}
        </div>
      </div>

      {/* Live Sequential 3-Step Progress Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Agent 1: Clinical Parse</h4>
              <p className="text-[11px] text-slate-500">FHIR R4 Extraction & ICD/CPT</p>
            </div>
          </div>
          {getStepBadge(pipelineState.step1.status, pipelineState.step1.latencyMs)}
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Agent 2: Policy Adjudicate</h4>
              <p className="text-[11px] text-slate-500">CMS-0057-F & Da Vinci PAS</p>
            </div>
          </div>
          {getStepBadge(pipelineState.step2.status, pipelineState.step2.latencyMs)}
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Agent 3: Remediation</h4>
              <p className="text-[11px] text-slate-500">DTR Addendum & Price Transparency</p>
            </div>
          </div>
          {getStepBadge(pipelineState.step3.status, pipelineState.step3.latencyMs)}
        </div>
      </div>

      {/* Member & Benefit Summary Strip */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-lg shadow-md">
              {scenario.member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{scenario.member.name}</h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">ID: {scenario.member.id}</span>
              </div>
              <p className="text-xs text-slate-500">DOB: {scenario.member.dob} • Group: {scenario.member.groupNumber}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Benefit Plan</span>
              <span className="text-xs font-bold text-slate-800">{scenario.member.plan}</span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Requested Service</span>
              <span className="text-xs font-bold text-blue-600">{scenario.requestedService.serviceName}</span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Policy & SLA</span>
              <span className="text-xs font-bold text-emerald-600">{scenario.policy.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL BULK CLAIMS WORKBENCH (Rendered when activeScenarioId === 'case-bulk') */}
      {activeScenarioId === 'case-bulk' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Metro Multispecialty Clinic — Bulk Claims Batch Hub (5 Claims)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">CarePulse AI Provider Pre-Validation & Claims Processor Intent Translation Workbench</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                3 Auto-Approved
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                2 Manual Queue (Intent Translated)
              </span>
            </div>
          </div>

          {/* Claims Table & Details Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Claims List */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Batch Claims List</h4>
              <div className="space-y-2">
                {bulkClaimsList.map((claim, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedBulkClaim(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      selectedBulkClaim === idx
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{claim.id}</span>
                        <span className="text-xs font-semibold text-slate-700">{claim.patient}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{claim.service}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">{claim.amount}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block mt-1 ${
                        claim.isManualQueue ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Detailed Processor Intent Translator & Provider Guidance */}
            <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#0B1F3A] text-white rounded-lg">
                      {bulkClaimsList[selectedBulkClaim].id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{bulkClaimsList[selectedBulkClaim].patient}</h4>
                  </div>
                  <span className="text-xs font-bold text-blue-600">{bulkClaimsList[selectedBulkClaim].service} ({bulkClaimsList[selectedBulkClaim].amount})</span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CarePulse AI Intent Translation (For Claims Processor)</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">{bulkClaimsList[selectedBulkClaim].intent}</p>
                  </div>

                  <div className="bg-blue-950 text-white p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Recommended Processor Action / Justification</span>
                    <p className="text-xs text-slate-100 font-semibold">{bulkClaimsList[selectedBulkClaim].recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Processor */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {claimActionTaken[selectedBulkClaim] ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Action Executed: {claimActionTaken[selectedBulkClaim]}
                    </span>
                  ) : (
                    'Ready for processor execution'
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setClaimActionTaken({ ...claimActionTaken, [selectedBulkClaim]: 'Fast-Track Approved & Routed to Payment' })}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Fast-Track Approve
                  </button>
                  <button
                    onClick={() => setClaimActionTaken({ ...claimActionTaken, [selectedBulkClaim]: 'Policy-Aligned Adjustment Notice Generated' })}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Generate Justification Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Dual-Pane Workspace for Cases A, B, C, Custom */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Pane: EHR Clinical Progress Note & Payer Medical Policy */}
          <div className="space-y-6">
            {/* EHR Clinical Progress Note */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[380px]">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">EHR Clinical Progress Note (Editable)</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">HL7 FHIR ClinicalImpression source</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <textarea
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  className="w-full flex-1 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:bg-white transition resize-none leading-relaxed"
                  placeholder="Enter clinical progress note..."
                />
              </div>
            </div>

            {/* Payer Medical Policy Criteria */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[280px]">
              <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payer Medical Policy & Criteria ({scenario.policy.id})</h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">CMS-0057-F Rulebook</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <textarea
                  value={policySnippet}
                  onChange={(e) => setPolicySnippet(e.target.value)}
                  className="w-full flex-1 bg-slate-50/60 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition resize-none leading-relaxed"
                  placeholder="Enter payer policy criteria..."
                />
              </div>
            </div>
          </div>

          {/* Right Pane: Simulated HL7 FHIR R4 Bundle Viewer */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[684px]">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">HL7 FHIR R4 Bundle Viewer</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200/80 p-1 rounded-lg">
                  <button
                    onClick={() => setRightTab('cards')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      rightTab === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Resource Cards
                  </button>
                  <button
                    onClick={() => setRightTab('json')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      rightTab === 'json' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>
            </div>

            {/* Subheader / Filter pills for Resource Cards */}
            {rightTab === 'cards' && (
              <div className="bg-slate-100/70 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
                <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {['All', 'Patient', 'Coverage', 'Condition', 'Procedure', 'MedicationRequest', 'Observation'].map((pill) => (
                  <button
                    key={pill}
                    onClick={() => setResourceFilter(pill)}
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap transition ${
                      resourceFilter === pill
                        ? 'bg-[#0B1F3A] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40">
              {jsonError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  JSON Syntax Error: {jsonError}
                </div>
              )}

              {rightTab === 'json' ? (
                <textarea
                  value={fhirJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full h-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl focus:outline-none resize-none leading-relaxed"
                  placeholder="Valid HL7 FHIR R4 JSON Bundle..."
                />
              ) : (
                <div className="space-y-3">
                  {filteredEntries.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-12">No matching FHIR resources found for filter "{resourceFilter}".</p>
                  ) : (
                    filteredEntries.map((ent: any, idx: number) => {
                      const res = ent.resource || {};
                      return (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                              {res.resourceType || 'Resource'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">ID: {res.id || 'N/A'}</span>
                          </div>
                          <pre className="text-[11px] font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg overflow-x-auto border border-slate-100">
                            {JSON.stringify(res, null, 2)}
                          </pre>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
