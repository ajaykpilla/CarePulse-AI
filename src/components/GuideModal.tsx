import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, BookOpen, Video, Volume2, VolumeX, Sparkles, Activity, Cpu, Layers, TrendingUp } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: 'command-center' | 'pipeline' | 'flywheel') => void;
  setActiveScenarioId: (id: string) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  setActiveScenarioId,
}) => {
  const [guideMode, setGuideMode] = useState<'slides' | 'video'>('slides');
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Video player simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // seconds
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const totalDuration = 180; // 3 minutes (180s)
  const timerRef = useRef<any>(null);

  // Video chapters with narration scripts, mockup images, and app navigation targets
  const chapters = [
    {
      start: 0,
      end: 45,
      title: 'Chapter 1: Introduction & Command Center',
      script: 'Welcome to CarePulse AI. Notice how the application automatically navigated to the Command Center & Journey Simulator. Here you can review clinical progress notes, payer policies, and HL7 FHIR R4 resource bundles.',
      image: '/src/assets/images/carepulse_dashboard_mockup_1795118477578.jpg',
      icon: Activity,
      action: () => {
        setActiveTab('command-center');
        setActiveScenarioId('case-a');
      }
    },
    {
      start: 45,
      end: 90,
      title: 'Chapter 2: Multi-Agent Pipeline Execution',
      script: 'Now the video tour has transitioned to the Multi-Agent Pipeline. Watch as Agent 1 extracts FHIR structures, Agent 2 adjudicates against CMS-0057-F rules, and Agent 3 builds provider DTR addendums and member price transparency summaries.',
      image: '/src/assets/images/carepulse_pipeline_mockup_1795118489301.jpg',
      icon: Cpu,
      action: () => {
        setActiveTab('pipeline');
      }
    },
    {
      start: 90,
      end: 135,
      title: 'Chapter 3: Bulk Claims Batch & Processor Queue',
      script: 'We have now navigated back to the Command Center and loaded Case D: Bulk Provider Claims Batch. CarePulse AI pre-validates claims for providers and translates true clinical intent for claims processors in manual queues.',
      image: '/src/assets/images/carepulse_dashboard_mockup_1795118477578.jpg',
      icon: Layers,
      action: () => {
        setActiveTab('command-center');
        setActiveScenarioId('case-bulk');
      }
    },
    {
      start: 135,
      end: 180,
      title: 'Chapter 4: Executive Value Flywheel',
      script: 'Finally, the tour brings us to the Executive Value Flywheel tab. Explore enterprise ROI metrics, side-by-side legacy comparison charts, and interactive what-if volume and policy simulators.',
      image: '/src/assets/images/carepulse_pipeline_mockup_1795118489301.jpg',
      icon: TrendingUp,
      action: () => {
        setActiveTab('flywheel');
      }
    }
  ];

  const currentChapter = chapters.find(c => progress >= c.start && progress < c.end) || chapters[chapters.length - 1];

  // Trigger app navigation when chapter/progress changes during playback
  useEffect(() => {
    if (isPlaying && guideMode === 'video' && currentChapter?.action) {
      currentChapter.action();
    }
  }, [progress, isPlaying, guideMode]);

  // Timer playback loop
  useEffect(() => {
    if (isPlaying && guideMode === 'video') {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, guideMode]);

  // Speech synthesis narration when chapter changes and not muted
  useEffect(() => {
    if (isPlaying && !isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentChapter.script);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentChapter.title, isPlaying, isMuted]);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to CarePulse AI',
      subtitle: 'HL7 FHIR R4 & CMS-0057-F Autonomous Prior Authorization Engine',
      description: 'CarePulse AI bridges providers, payers, and members with autonomous 3-agent intelligence, real-time FHIR interoperability, and proactive remediation.',
      image: '/src/assets/images/carepulse_dashboard_mockup_1795118477578.jpg',
      badge: 'Overview & Architecture'
    },
    {
      title: 'View 1: Command Center & Journey Simulator',
      subtitle: 'Select Scenarios & Inspect HL7 FHIR Bundles',
      description: 'Test preloaded scenarios (Case A Auto-Approve, Case B Documentation Gap, Case C Site-of-Care, Case D Bulk Claims) or edit clinical progress notes and payer policies directly in the dual-pane workspace.',
      image: '/src/assets/images/carepulse_dashboard_mockup_1795118477578.jpg',
      badge: 'Command Center'
    },
    {
      title: 'View 2: Multi-Agent Execution Pipeline',
      subtitle: 'Sequential AI Adjudication & Proactive DTR Remediations',
      description: 'Watch Agents 1, 2, and 3 execute in real-time. Review structured clinical extractions, CMS-0057-F compliance metrics, provider addendum requests, and warm 8th-grade plain-language member transparency summaries.',
      image: '/src/assets/images/carepulse_pipeline_mockup_1795118489301.jpg',
      badge: 'Multi-Agent Pipeline'
    },
    {
      title: 'View 3: Executive Value Flywheel & Bulk Claims',
      subtitle: 'ROI Analytics & Provider Bulk Batch Intent Translation',
      description: 'Explore executive KPIs, side-by-side legacy comparisons, interactive what-if volume sliders, and the new Case D Bulk Claims Batch & Processor Manual Queue Intent Translator.',
      image: '/src/assets/images/carepulse_pipeline_mockup_1795118489301.jpg',
      badge: 'Executive Value & Bulk Claims'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-[#0B1F3A] text-white rounded-2xl max-w-4xl w-full h-[660px] flex flex-col shadow-2xl border border-blue-900/60 relative overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-blue-900/60 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">CarePulse AI Masterclass & Guided Walkthrough</h2>
              <p className="text-xs text-slate-400">Live app navigation synchronized with voice-over narration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => {
                  setGuideMode('slides');
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  guideMode === 'slides' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Slide Walkthrough
              </button>
              <button
                onClick={() => setGuideMode('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  guideMode === 'video' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Live App Video Tour
              </button>
            </div>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-lg bg-slate-800/80 border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          {guideMode === 'slides' ? (
            <div className="h-full flex flex-col justify-between space-y-6">
              {/* Slide Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
                <div className="md:col-span-6 space-y-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40">
                    {slides[currentSlide].badge}
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight text-white">{slides[currentSlide].title}</h3>
                  <h4 className="text-sm font-semibold text-cyan-300">{slides[currentSlide].subtitle}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{slides[currentSlide].description}</p>
                </div>

                <div className="md:col-span-6">
                  <div className="rounded-xl overflow-hidden border border-blue-900/60 shadow-xl bg-slate-900">
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      className="w-full h-auto object-cover max-h-[260px]"
                    />
                  </div>
                </div>
              </div>

              {/* Slide Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        currentSlide === idx ? 'bg-blue-500 w-6' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
                    disabled={currentSlide === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => currentSlide < slides.length - 1 && setCurrentSlide(currentSlide + 1)}
                    disabled={currentSlide === slides.length - 1}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white disabled:opacity-40 transition flex items-center gap-1 shadow-md shadow-blue-900/40"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Video Walkthrough with Real-Time App Page Navigation */
            <div className="h-full flex flex-col justify-between space-y-4">
              {/* Video Screen Simulation */}
              <div className="bg-slate-900 rounded-2xl border border-blue-900/60 overflow-hidden relative flex-1 flex flex-col justify-between p-6 shadow-2xl">
                {/* Background Feature Mockup Image */}
                <div className="absolute inset-0 z-0 opacity-20">
                  <img
                    src={currentChapter.image}
                    alt={currentChapter.title}
                    className="w-full h-full object-cover filter blur-xs"
                  />
                </div>

                {/* Top Overlay Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl shadow-md">
                    <currentChapter.icon className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">{currentChapter.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live App Tour Navigating
                  </span>
                </div>

                {/* Center Subtitle / Narration Box */}
                <div className="relative z-10 my-auto bg-slate-950/90 border border-blue-800/80 p-5 rounded-2xl shadow-2xl max-w-2xl mx-auto backdrop-blur-md space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 text-[10px] uppercase font-extrabold tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Voice-Over Narration ({Math.floor(progress / 60)}:{String(progress % 60).padStart(2, '0')} / 3:00)
                  </div>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    "{currentChapter.script}"
                  </p>
                </div>

                {/* Bottom Timeline Indicator */}
                <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span>Auto-navigating application features in background</span>
                  <span>{Math.floor(progress / 60)}:{String(progress % 60).padStart(2, '0')} / 3:00</span>
                </div>
              </div>

              {/* Video Controls & Chapter Navigation */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      {isPlaying ? 'Pause Tour & Voice-Over' : 'Play Live App Tour'}
                    </button>
                    <button
                      onClick={() => {
                        setProgress(0);
                        setIsPlaying(false);
                        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Rewind"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (!isMuted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                      }}
                      className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                        isMuted ? 'bg-rose-950/60 border-rose-800 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-200'
                      }`}
                      title={isMuted ? 'Unmute Voice-Over' : 'Mute Voice-Over'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      {isMuted ? 'Muted' : 'Voice-Over ON'}
                    </button>
                  </div>

                  {/* Chapter Quick Jump Buttons */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {chapters.map((ch, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setProgress(ch.start);
                          setIsPlaying(true);
                          ch.action();
                        }}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
                          progress >= ch.start && progress < ch.end
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        Ch {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
