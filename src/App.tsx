import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { GuideModal } from './components/GuideModal';
import { CommandCenterView } from './views/CommandCenterView';
import { MultiAgentPipelineView } from './views/MultiAgentPipelineView';
import { ExecutiveValueView } from './views/ExecutiveValueView';
import { SCENARIOS, ScenarioData } from './data/scenarios';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'command-center' | 'pipeline' | 'flywheel'>('command-center');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Scenario State
  const [activeScenarioId, setActiveScenarioId] = useState<string>('case-a');
  const scenario: ScenarioData = SCENARIOS[activeScenarioId] || SCENARIOS['case-a'];

  // Editable Workspace State
  const [clinicalNote, setClinicalNote] = useState<string>(scenario.clinicalNote);
  const [policySnippet, setPolicySnippet] = useState<string>(scenario.payerPolicySnippet);
  const [fhirJson, setFhirJson] = useState<string>(JSON.stringify(scenario.fhirBundle, null, 2));

  // Settings & Security State
  const [forceDemo, setForceDemo] = useState<boolean>(false);
  const [byokKey, setByokKey] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [requirePasscode, setRequirePasscode] = useState<boolean>(false);

  // Pipeline Execution State
  type StepStatus = 'standby' | 'active' | 'completed' | 'error';
  interface StepState {
    status: StepStatus;
    latencyMs?: number;
  }
  interface PipelineState {
    step1: StepState;
    step2: StepState;
    step3: StepState;
  }

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [hasRunPipeline, setHasRunPipeline] = useState<boolean>(false);
  const [pipelineState, setPipelineState] = useState<PipelineState>({
    step1: { status: 'standby' },
    step2: { status: 'standby' },
    step3: { status: 'standby' },
  });

  // Agent Results State
  const [agent1Data, setAgent1Data] = useState<any>(null);
  const [agent2Data, setAgent2Data] = useState<any>(null);
  const [agent3Data, setAgent3Data] = useState<any>(null);

  // Initialize scenario and config from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scenarioParam = params.get('scenario');
    if (scenarioParam && SCENARIOS[scenarioParam]) {
      setActiveScenarioId(scenarioParam);
      const s = SCENARIOS[scenarioParam];
      setClinicalNote(s.clinicalNote);
      setPolicySnippet(s.payerPolicySnippet);
      setFhirJson(JSON.stringify(s.fhirBundle, null, 2));
    }

    // Fetch config
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.requirePasscode) setRequirePasscode(true);
        if (data.demoModeDefault) setForceDemo(true);
      })
      .catch(() => {});
  }, []);

  // When active scenario changes via dropdown, reset fields
  useEffect(() => {
    const s = SCENARIOS[activeScenarioId];
    if (s) {
      setClinicalNote(s.clinicalNote);
      setPolicySnippet(s.payerPolicySnippet);
      setFhirJson(JSON.stringify(s.fhirBundle, null, 2));
      // Reset pipeline results
      setHasRunPipeline(false);
      setPipelineState({
        step1: { status: 'standby', latencyMs: undefined },
        step2: { status: 'standby', latencyMs: undefined },
        step3: { status: 'standby', latencyMs: undefined },
      });
      setAgent1Data(null);
      setAgent2Data(null);
      setAgent3Data(null);
    }
  }, [activeScenarioId]);

  // Execute Pipeline
  const runPipeline = async () => {
    setIsExecuting(true);
    setActiveTab('command-center');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (byokKey) headers['x-gemini-api-key'] = byokKey;
    if (passcode) headers['x-carepulse-passcode'] = passcode;

    let parsedAgent1: any = null;
    let parsedAgent2: any = null;

    try {
      // Step 1: Clinical Parse
      setPipelineState({
        step1: { status: 'active' },
        step2: { status: 'standby' },
        step3: { status: 'standby' },
      });

      const res1 = await fetch('/api/agents/clinical-parse', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          clinicalNote,
          payerPolicySnippet: policySnippet,
          forceDemo,
          scenarioId: activeScenarioId,
        }),
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.error || 'Agent 1 failed');
      setAgent1Data(data1);
      parsedAgent1 = data1.result;

      setPipelineState((prev) => ({
        ...prev,
        step1: { status: 'completed', latencyMs: data1.latencyMs },
        step2: { status: 'active' },
      }));

      // Step 2: Policy Adjudicate
      const res2 = await fetch('/api/agents/policy-adjudicate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          agent1Result: parsedAgent1,
          clinicalNote,
          payerPolicySnippet: policySnippet,
          forceDemo,
          scenarioId: activeScenarioId,
        }),
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.error || 'Agent 2 failed');
      setAgent2Data(data2);
      parsedAgent2 = data2.result;

      setPipelineState((prev) => ({
        ...prev,
        step2: { status: 'completed', latencyMs: data2.latencyMs },
        step3: { status: 'active' },
      }));

      // Step 3: Remediate & Transparency
      let parsedBundle = null;
      try {
        parsedBundle = JSON.parse(fhirJson);
      } catch {}

      const res3 = await fetch('/api/agents/remediate-transparency', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          agent1Result: parsedAgent1,
          agent2Result: parsedAgent2,
          fhirBundleJson: parsedBundle,
          siteOfCareOptions: scenario.siteOfCareOptions,
          forceDemo,
          scenarioId: activeScenarioId,
        }),
      });
      const data3 = await res3.json();
      if (!res3.ok) throw new Error(data3.error || 'Agent 3 failed');
      setAgent3Data(data3);

      setPipelineState((prev) => ({
        ...prev,
        step3: { status: 'completed', latencyMs: data3.latencyMs },
      }));

      setHasRunPipeline(true);
      setIsExecuting(false);
      // Switch to pipeline view to inspect output
      setActiveTab('pipeline');
    } catch (err: any) {
      console.error('Pipeline execution error:', err);
      setIsExecuting(false);
      setPipelineState((prev) => ({
        ...prev,
        step1: prev.step1.status === 'active' ? { status: 'error' } : prev.step1,
        step2: prev.step2.status === 'active' ? { status: 'error' } : prev.step2,
        step3: prev.step3.status === 'active' ? { status: 'error' } : prev.step3,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        forceDemo={forceDemo}
        byokKey={byokKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'command-center' && (
          <CommandCenterView
            activeScenarioId={activeScenarioId}
            setActiveScenarioId={setActiveScenarioId}
            scenario={scenario}
            clinicalNote={clinicalNote}
            setClinicalNote={setClinicalNote}
            policySnippet={policySnippet}
            setPolicySnippet={setPolicySnippet}
            fhirJson={fhirJson}
            setFhirJson={setFhirJson}
            onRunPipeline={runPipeline}
            pipelineState={pipelineState}
            hasRunPipeline={hasRunPipeline}
            onInspectPipeline={() => setActiveTab('pipeline')}
          />
        )}

        {activeTab === 'pipeline' && (
          <MultiAgentPipelineView
            scenario={scenario}
            agent1Data={agent1Data || { mode: 'demo', model: 'gemini-2.5-flash', latencyMs: 380, result: { patientSummary: scenario.clinicalNote.slice(0, 120), icd10Codes: [{ code: scenario.requestedService.icd10, description: 'Clinical condition' }], procedureOrMedicationCodes: [{ system: 'CPT', code: scenario.requestedService.cptOrHcpcs, description: scenario.requestedService.serviceName }], clinicalBiomarkersAndFindings: [{ finding: 'Evaluated in Simulator', valueOrDetail: 'Normal', isRedFlag: false }], priorConservativeOrStepTherapies: [{ therapy: 'Standard trial', durationOrDates: '6 weeks', outcome: 'Completed', verified: true }] } }}
            agent2Data={agent2Data || { mode: 'demo', model: 'gemini-2.5-flash', latencyMs: 440, result: { determination: activeScenarioId === 'case-b' ? 'REMEDIATION_REQUIRED' : 'AUTO_APPROVED', approvalConfidenceScore: activeScenarioId === 'case-b' ? 45 : 97, policyReference: scenario.policy.id, cms0057fCompliance: { slaCategory: 'CMS-0057-F Real-Time SLA', projectedTurnaroundSeconds: 12, daVinciPasAligned: true, complianceNotes: 'Fully compliant' }, criteriaEvaluation: [{ criterionId: 'CRIT-01', criterionTitle: 'Clinical Necessity Criteria', status: activeScenarioId === 'case-b' ? 'MISSING' : 'MET', clinicalEvidenceFound: 'Verified in EHR note.', gapExplanation: activeScenarioId === 'case-b' ? 'Missing safety lab.' : 'None.' }], adjudicationRationale: 'Automated policy match complete.' } }}
            agent3Data={agent3Data || { mode: 'demo', model: 'gemini-2.5-flash', latencyMs: 410, result: { remediationNeeded: activeScenarioId === 'case-b', remediationPriority: activeScenarioId === 'case-b' ? 'HIGH' : 'NONE', providerAddendumRequest: { targetRecipient: scenario.requestedService.provider, subject: 'Addendum Request', missingItemsChecklist: ['Lab report'], draftAddendumMessage: 'Please attach.', fhirQuestionnaireResponseStub: { resourceType: 'QuestionnaireResponse', status: 'in-progress' } }, evidenceBackedAlternatives: [{ title: scenario.siteOfCareOptions[0]?.name || 'Preferred Site', rationale: 'Cost optimization', estimatedSavingsOrImpact: '$1,200 savings' }], memberTransparencyCard: { headline: 'Prior Authorization Status', plainLanguageStatus: 'Your request is processed.', estimatedTotalAllowedAmount: 2500, estimatedMemberCopayOrCoinsurance: 50, deductibleApplied: 0, siteOfCareSavingsHighlight: 'Savings applied', recommendedFacility: scenario.siteOfCareOptions[0]?.name || 'Facility', nextStepsForMember: ['Review details in portal'] } } }}
            isExecuting={isExecuting}
            onRerunPipeline={runPipeline}
          />
        )}

        {activeTab === 'flywheel' && <ExecutiveValueView />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        forceDemo={forceDemo}
        setForceDemo={setForceDemo}
        byokKey={byokKey}
        setByokKey={setByokKey}
        passcode={passcode}
        setPasscode={setPasscode}
        requirePasscode={requirePasscode}
        activeScenarioId={activeScenarioId}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        setActiveTab={setActiveTab}
        setActiveScenarioId={setActiveScenarioId}
      />
    </div>
  );
}
