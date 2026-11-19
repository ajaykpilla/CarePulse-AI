import React, { useState } from 'react';
import { X, Key, Shield, Globe, Check, Copy, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceDemo: boolean;
  setForceDemo: (val: boolean) => void;
  byokKey: string;
  setByokKey: (key: string) => void;
  passcode: string;
  setPasscode: (pass: string) => void;
  requirePasscode: boolean;
  activeScenarioId: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  forceDemo,
  setForceDemo,
  byokKey,
  setByokKey,
  passcode,
  setPasscode,
  requirePasscode,
  activeScenarioId,
}) => {
  const [copied, setCopied] = useState(false);
  const [tempKey, setTempKey] = useState(byokKey);
  const [tempPass, setTempPass] = useState(passcode);

  if (!isOpen) return null;

  const handleSave = () => {
    setByokKey(tempKey);
    setPasscode(tempPass);
    onClose();
  };

  const shareableUrl = `${window.location.origin}?scenario=${activeScenarioId}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0B1F3A] text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-900/60 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">CarePulse AI Settings & Security</h2>
            <p className="text-xs text-slate-400">HL7 FHIR R4 & CMS-0057-F Interoperability Control</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Demo Mode Toggle */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-200 block">Deterministic Demo Mode Fallback</label>
                <p className="text-xs text-slate-400">Run instant scenario-aware simulations without requiring live Gemini API keys.</p>
              </div>
              <input
                type="checkbox"
                checked={forceDemo}
                onChange={(e) => setForceDemo(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* BYOK Session Key */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              Session Gemini API Key (BYOK)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400">Stored in browser memory only for this session. Sent via x-gemini-api-key header.</p>
          </div>

          {/* Passcode if required */}
          {requirePasscode && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Team Access Passcode Required
              </label>
              <input
                type="password"
                placeholder="Enter team passcode..."
                value={tempPass}
                onChange={(e) => setTempPass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Shareable Scenario Link */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Shareable Scenario URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 select-all"
              />
              <button
                onClick={copyUrl}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-900/30"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
