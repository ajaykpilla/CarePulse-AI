import React from 'react';
import { ShieldCheck, Activity, Cpu, TrendingUp, Settings, Sparkles, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'command-center' | 'pipeline' | 'flywheel';
  setActiveTab: (tab: 'command-center' | 'pipeline' | 'flywheel') => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  forceDemo: boolean;
  byokKey: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenGuide,
  forceDemo,
  byokKey,
}) => {
  const getRuntimeStatus = () => {
    if (forceDemo) return { label: 'Demo Mode Active', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (byokKey) return { label: 'Live Gemini (BYOK)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    return { label: 'Live Gemini Server', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  };

  const status = getRuntimeStatus();

  return (
    <header className="bg-[#0B1F3A] text-white border-b border-blue-900/40 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                CarePulse AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700/50 text-blue-300">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                FHIR R4 • CMS-0057-F
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Autonomous Prior Authorization & Interoperability Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('command-center')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'command-center'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4" />
            Command Center & Simulator
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Multi-Agent Pipeline
          </button>
          <button
            onClick={() => setActiveTab('flywheel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'flywheel'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Executive Value Flywheel
          </button>
        </nav>

        {/* Runtime Status Pill & Settings & Guide */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/40 transition shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Guide & Video</span>
          </button>

          <span className={`hidden lg:inline-flex text-xs font-medium px-3 py-1 rounded-full border items-center gap-1.5 ${status.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {status.label}
          </span>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Settings & BYOK"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 px-2 py-2">
        <button
          onClick={() => setActiveTab('command-center')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === 'command-center' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === 'pipeline' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Pipeline
        </button>
        <button
          onClick={() => setActiveTab('flywheel')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === 'flywheel' ? 'text-blue-400' : 'text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Flywheel
        </button>
      </div>
    </header>
  );
};
