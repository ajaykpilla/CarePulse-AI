import React, { useState } from 'react';
import { TrendingUp, ShieldCheck, Clock, Users, ArrowUpRight, DollarSign, Activity } from 'lucide-react';

export const ExecutiveValueView: React.FC = () => {
  // Simulator State
  const [monthlyVolume, setMonthlyVolume] = useState<number>(25000);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [fhirAdoption, setFhirAdoption] = useState<number>(75);

  // Dynamic calculation logic
  const manualCostPerPA = 46.00;
  const carePulseCostPerPA = 3.50;

  // Auto-approval rate scales with fhir adoption and confidence threshold inverse
  const autoApprovalRate = Math.min(96, Math.max(65, Math.round(fhirAdoption * 0.9 + (100 - confidenceThreshold) * 0.2)));
  const automatedPAsPerMonth = Math.round(monthlyVolume * (autoApprovalRate / 100));
  const manualPAsPerMonth = monthlyVolume - automatedPAsPerMonth;

  const annualAdminCostManual = monthlyVolume * 12 * manualCostPerPA;
  const annualAdminCostCarePulse = (manualPAsPerMonth * manualCostPerPA + automatedPAsPerMonth * carePulseCostPerPA) * 12;
  const annualSavings = Math.round(annualAdminCostManual - annualAdminCostCarePulse);

  const avoidedDenialsPerMonth = Math.round(monthlyVolume * 0.14 * (fhirAdoption / 100));
  const memberFrictionDrop = Math.min(92, Math.round(50 + fhirAdoption * 0.4));

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="bg-[#0B1F3A] text-white p-6 rounded-2xl shadow-xl border border-blue-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/30 border border-emerald-500/50 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
            Enterprise ROI & Operational Analytics
          </span>
          <h2 className="text-xl font-bold tracking-tight mt-1">Executive Value Flywheel & CMS-0057-F Impact</h2>
          <p className="text-xs text-slate-300 mt-1">
            Quantifying touchless auto-adjudication, operational cost reduction, and patient retention lift.
          </p>
        </div>
        <div className="bg-blue-900/60 border border-blue-700/50 px-5 py-3 rounded-xl text-right">
          <span className="text-[10px] uppercase font-bold text-blue-300 block">Projected Annual Savings</span>
          <span className="text-2xl font-extrabold text-emerald-400">${annualSavings.toLocaleString()}</span>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Touchless Auto-Approval</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{autoApprovalRate}%</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +56% vs Legacy
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Baseline reactive rate was ~28%</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${autoApprovalRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Median Turnaround Time</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">&lt; 90s</span>
              <span className="text-xs font-semibold text-blue-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> 99.9% Faster
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Legacy manual review: 4.2 Days</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '99%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avoided Denials / Month</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{avoidedDenialsPerMonth.toLocaleString()}</span>
              <span className="text-xs font-semibold text-teal-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> -68% Appeals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Proactive DTR addendums</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member NPS & Retention</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">+46 NPS</span>
              <span className="text-xs font-semibold text-indigo-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +6.4% Retention
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Baseline reactive NPS was +12</p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Bar Charts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Legacy Reactive Workflow vs. CarePulse AI Autonomous Engine</h3>
          <p className="text-xs text-slate-500">Comparative benchmarks across key interoperability and operational metrics.</p>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Touchless Auto-Adjudication Rate</span>
              <span className="text-emerald-600">CarePulse {autoApprovalRate}% vs Legacy 28%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-emerald-500 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${autoApprovalRate}%` }}>
                  CarePulse AI ({autoApprovalRate}%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-slate-400 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: '28%' }}>
                  Legacy (28%)
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">First-Pass Clinical Completeness</span>
              <span className="text-blue-600">CarePulse {fhirAdoption}% vs Legacy 41%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-blue-600 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all duration-500" style={{ width: `${fhirAdoption}%` }}>
                  CarePulse AI ({fhirAdoption}%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-slate-400 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: '41%' }}>
                  Legacy (41%)
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">CMS-0057-F 72h Urgent SLA Compliance</span>
              <span className="text-teal-600">CarePulse 99.8% vs Legacy 62%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-teal-500 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: '99.8%' }}>
                  CarePulse AI (99.8%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-slate-400 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: '62%' }}>
                  Legacy (62%)
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-700">Upfront Member OOP Price Transparency</span>
              <span className="text-indigo-600">CarePulse 95% vs Legacy 14%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-indigo-600 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: '95%' }}>
                  CarePulse AI (95%)
                </div>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                <div className="bg-slate-400 h-full flex items-center justify-end pr-2 text-[10px] font-bold text-white" style={{ width: '14%' }}>
                  Legacy (14%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive What-If Policy & Volume Simulator */}
      <div className="bg-[#0B1F3A] text-white rounded-2xl p-6 shadow-xl border border-blue-900/60 space-y-6">
        <div>
          <h3 className="text-base font-bold tracking-tight">Interactive What-If Policy & Volume Simulator</h3>
          <p className="text-xs text-slate-300">Adjust parameters below to dynamically model annual administrative savings and avoided denials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider 1: Monthly PA Volume */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Monthly Prior Auth Volume</span>
              <span className="font-bold text-blue-400">{monthlyVolume.toLocaleString()} requests</span>
            </div>
            <input
              type="range"
              min={5000}
              max={100000}
              step={2500}
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5,000 / mo</span>
              <span>100,000 / mo</span>
            </div>
          </div>

          {/* Slider 2: Auto-Adjudication Confidence Threshold */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Auto-Approval Confidence Threshold</span>
              <span className="font-bold text-emerald-400">{confidenceThreshold}%</span>
            </div>
            <input
              type="range"
              min={65}
              max={95}
              step={1}
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>65% (Aggressive)</span>
              <span>95% (Conservative)</span>
            </div>
          </div>

          {/* Slider 3: FHIR Adoption */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Provider Network HL7 FHIR Adoption</span>
              <span className="font-bold text-teal-400">{fhirAdoption}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={fhirAdoption}
              onChange={(e) => setFhirAdoption(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>20%</span>
              <span>100% Fully Interoperable</span>
            </div>
          </div>
        </div>

        {/* Dynamic Output Banner */}
        <div className="bg-slate-900 p-5 rounded-xl border border-blue-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Instant Automated PAs</span>
            <span className="text-xl font-extrabold text-emerald-400">{automatedPAsPerMonth.toLocaleString()} / month</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Avoided Denials / Month</span>
            <span className="text-xl font-extrabold text-teal-400">{avoidedDenialsPerMonth.toLocaleString()} prevented</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Member Friction Drop</span>
            <span className="text-xl font-extrabold text-cyan-300">{memberFrictionDrop}% reduction</span>
          </div>
        </div>
      </div>
    </div>
  );
};
