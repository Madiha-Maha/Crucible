import React, { useEffect, useState } from "react";
import type { DecisionSession, PersonaType, TribunalAnalytics as AnalyticsType, VerdictReport } from "./types.js";
import { ChamberReveal } from "./components/ChamberReveal.js";
import { VerdictDocument } from "./components/VerdictDocument.js";
import { BlindSpotDetector } from "./components/BlindSpotDetector.js";
import { SecondOpinionCircle } from "./components/SecondOpinionCircle.js";
import { DecisionJournal } from "./components/DecisionJournal.js";
import { TribunalAnalytics } from "./components/TribunalAnalytics.js";
import {
  Activity,
  AlertCircle,
  BookOpen,
  ChevronRight,
  Eye,
  Flame,
  Gavel,
  History,
  Layers,
  PlusCircle,
  Scale,
  Send,
  Sparkles,
  Users,
} from "lucide-react";

type ActiveTab = "chamber" | "verdict" | "blindspots" | "circle" | "journal" | "analytics";

const PRESET_DECISIONS = [
  {
    title: "Resign to Launch Startup",
    decision: "Resign from Staff Engineering position at Stripe to build an autonomous compliance AI startup with $180K personal savings.",
    stakes: "Forfeiting $480K guaranteed compensation, unvested equity, burning life savings with an 18-month personal runway.",
    reasons: "I've spent 7 years in fintech and understand every compliance bottleneck. After all the time I've put into this industry, I can't stay on the sidelines. It will only take 3 to 6 months to land our first 3 enterprise contracts.",
  },
  {
    title: "End 5-Year Relationship",
    decision: "End 4-year romantic relationship with partner due to fundamentally irreconcilable stances on living abroad vs staying near extended family.",
    stakes: "Shared lease, shared close-knit community, deep affection, fear of starting over single at age 32.",
    reasons: "I can't throw away 4 years of love and memories. But I'm terrified that if I stay in Ohio forever I will harbor bitter resentment. Everyone I talked to agreed that values on geography can't be compromised.",
  },
  {
    title: "Liquidate Portfolio for Real Estate",
    decision: "Liquidate 80% of my index fund investment portfolio to make a non-refundable $250,000 cash down payment on a historic fixer-upper home.",
    stakes: "Permanently realizing tax capital gains, eliminating liquid buffer against job loss, taking on $6,500/month mortgage in a high-rate environment.",
    reasons: "Rent is just throwing money away into someone else's pocket. Property in this neighborhood has gone up every year without fail, so we can't afford to wait another year.",
  },
];

export default function App() {
  const [sessions, setSessions] = useState<DecisionSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("chamber");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);

  // New Intake Form State
  const [decisionText, setDecisionText] = useState("");
  const [stakes, setStakes] = useState("");
  const [statedReasons, setStatedReasons] = useState("");
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  const [intakeStepMsg, setIntakeStepMsg] = useState("");

  // Load initial sessions and analytics
  useEffect(() => {
    fetchSessions();
    fetchAnalytics();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionText.trim() || isSubmittingIntake) return;

    try {
      setIsSubmittingIntake(true);
      setIntakeStepMsg("Summoning Tribunal: The Skeptic, The Dreamer, Future You, and The Outsider...");

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decisionText: decisionText.trim(),
          stakes: stakes.trim(),
          statedReasons: statedReasons.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to summon tribunal");
      }

      const newSession: DecisionSession = await res.json();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setIsCreatingNew(false);
      setActiveTab("chamber");
      setDecisionText("");
      setStakes("");
      setStatedReasons("");
      fetchAnalytics();
    } catch (err) {
      console.error("Error creating session:", err);
      alert("Tribunal summons failed. Please ensure the backend server is reachable.");
    } finally {
      setIsSubmittingIntake(false);
      setIntakeStepMsg("");
    }
  };

  const handleInterrogate = async (persona: PersonaType, userReply: string) => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/interrogate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, userReply }),
      });
      if (res.ok) {
        const { session: updatedSession } = await res.json();
        setSessions((prev) =>
          prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
        );
      }
    } catch (err) {
      console.error("Interrogation error:", err);
    }
  };

  const handleProceedToVerdict = async () => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/verdict`);
      if (res.ok) {
        const verdict: VerdictReport = await res.json();
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id ? { ...s, verdictReport: verdict, status: "verdict_ready" } : s
          )
        );
        setActiveTab("verdict");
        fetchAnalytics();
      }
    } catch (err) {
      console.error("Error obtaining verdict:", err);
    }
  };

  const handleInviteToCircle = async (email: string, role: any, name?: string) => {
    if (!activeSession) return;
    const res = await fetch(`/api/sessions/${activeSession.id}/circle-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, name }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessions((prev) =>
        prev.map((s) => (s.id === data.session.id ? data.session : s))
      );
    }
  };

  const handleSubmitAdvisorResponse = async (inviteId: string, response: string, perspective: any) => {
    if (!activeSession) return;
    const res = await fetch(`/api/sessions/${activeSession.id}/circle-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId, response, perspective }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessions((prev) =>
        prev.map((s) => (s.id === data.session.id ? data.session : s))
      );
    }
  };

  const handleCalibrateOutcome = async (
    sessionId: string,
    actionTaken: any,
    reflection: string,
    rating: number
  ) => {
    const res = await fetch(`/api/sessions/${sessionId}/calibrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionTaken, reflection, accuracyRating: rating }),
    });
    if (res.ok) {
      const data = await res.json();
      setSessions((prev) =>
        prev.map((s) => (s.id === data.session.id ? data.session : s))
      );
      fetchAnalytics();
    }
  };

  const applyPreset = (preset: typeof PRESET_DECISIONS[0]) => {
    setDecisionText(preset.decision);
    setStakes(preset.stakes);
    setStatedReasons(preset.reasons);
  };

  return (
    <div className="min-h-screen bg-[#141416] text-[#E5E5EA] flex flex-col selection:bg-[#B08D57] selection:text-[#141416]">
      {/* Top Crucible Tribunal Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#2C2C2E] bg-[#161618]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsCreatingNew(false)}>
            <div className="w-10 h-10 rounded-xl border border-[#B08D57]/60 bg-gradient-to-br from-[#242426] to-[#161618] flex items-center justify-center text-[#D4AF37] shadow-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-legal-seal text-base font-bold tracking-[0.25em] text-[#F4EFE6] uppercase">
                  Crucible
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#7A2E2E]/30 text-[#F08080] border border-[#7A2E2E]/40 tracking-wider">
                  Tribunal
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] hidden sm:block">
                Stress-test your life before you live it
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1C1C1E] p-1 rounded-xl border border-[#2C2C2E]">
            <button
              id="tab-chamber"
              onClick={() => {
                setIsCreatingNew(false);
                setActiveTab("chamber");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                !isCreatingNew && activeTab === "chamber"
                  ? "bg-[#B08D57] text-[#141416] font-bold"
                  : "text-[#A1A1A6] hover:text-[#E5E5EA]"
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>The Chamber</span>
            </button>

            <button
              id="tab-verdict"
              onClick={() => {
                setIsCreatingNew(false);
                if (!activeSession?.verdictReport) {
                  handleProceedToVerdict();
                } else {
                  setActiveTab("verdict");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                !isCreatingNew && activeTab === "verdict"
                  ? "bg-[#B08D57] text-[#141416] font-bold"
                  : "text-[#A1A1A6] hover:text-[#E5E5EA]"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Verdict Report</span>
            </button>

            <button
              id="tab-blindspots"
              onClick={() => {
                setIsCreatingNew(false);
                setActiveTab("blindspots");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                !isCreatingNew && activeTab === "blindspots"
                  ? "bg-[#B08D57] text-[#141416] font-bold"
                  : "text-[#A1A1A6] hover:text-[#E5E5EA]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Blind Spot Detector</span>
            </button>

            <button
              id="tab-circle"
              onClick={() => {
                setIsCreatingNew(false);
                setActiveTab("circle");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                !isCreatingNew && activeTab === "circle"
                  ? "bg-[#B08D57] text-[#141416] font-bold"
                  : "text-[#A1A1A6] hover:text-[#E5E5EA]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Second Opinion Circle</span>
            </button>

            <button
              id="tab-journal"
              onClick={() => {
                setIsCreatingNew(false);
                setActiveTab("journal");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                !isCreatingNew && activeTab === "journal"
                  ? "bg-[#B08D57] text-[#141416] font-bold"
                  : "text-[#A1A1A6] hover:text-[#E5E5EA]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal</span>
            </button>

            <button
              id="tab-analytics"
              onClick={() => {
                setIsCreatingNew(false);
                setActiveTab("analytics");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                !isCreatingNew && activeTab === "analytics"
                  ? "bg-[#B08D57] text-[#141416] font-bold"
                  : "text-[#A1A1A6] hover:text-[#E5E5EA]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </button>
          </nav>

          {/* Action Header Controls */}
          <div className="flex items-center gap-2">
            <button
              id="btn-new-decision"
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold uppercase tracking-wider transition-all shadow"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Subpoena Decision</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chamber Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* New Decision Intake Modal/View */}
        {isCreatingNew ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn" id="new-decision-intake-form">
            <div className="p-8 rounded-2xl border border-[#3A3A3C] bg-[#1C1C1E] shadow-2xl space-y-6">
              <div className="border-b border-[#2C2C2E] pb-5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B08D57] font-semibold">
                  <Scale className="w-4 h-4" />
                  Crucible Decision Subpoena
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif-report text-[#F2EFE9] mt-1">
                  Place Your Decision on Trial
                </h2>
                <p className="text-xs sm:text-sm text-[#A1A1A6] mt-1.5 leading-relaxed">
                  Crucible will cross-examine your assumptions through four rigorous, non-validating personas (The Skeptic, The Dreamer, Future You, and The Outsider) and audit your reasoning against 5 cognitive biases.
                </p>
              </div>

              {/* Sample Preset Selector */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#8E8E93] block mb-2">
                  Or Inspect a Benchmark High-Stakes Dilemma:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_DECISIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="p-3 rounded-lg border border-[#2C2C2E] bg-[#141416] hover:border-[#B08D57] text-left transition-colors group"
                    >
                      <span className="text-xs font-semibold text-[#E5E5EA] group-hover:text-[#D4AF37] block">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-[#636366] line-clamp-1 mt-0.5">
                        {preset.decision}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form inputs */}
              <form onSubmit={handleCreateSession} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D1D1D6] mb-1.5 font-semibold">
                    1. Stated Decision Under Trial *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={decisionText}
                    onChange={(e) => setDecisionText(e.target.value)}
                    placeholder="e.g. Resign from my corporate role at Stripe to launch an autonomous compliance startup..."
                    className="w-full text-xs sm:text-sm rounded-xl border border-[#3A3A3C] bg-[#141416] p-3.5 text-[#F2EFE9] placeholder-[#57575A] focus:outline-none focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D1D1D6] mb-1.5 font-semibold">
                    2. Perceived Stakes & Irreversible Consequences (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={stakes}
                    onChange={(e) => setStakes(e.target.value)}
                    placeholder="e.g. $180,000 personal savings, forfeited career momentum, spouse relocating, health insurance..."
                    className="w-full text-xs sm:text-sm rounded-xl border border-[#3A3A3C] bg-[#141416] p-3.5 text-[#F2EFE9] placeholder-[#57575A] focus:outline-none focus:border-[#B08D57]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#D1D1D6] mb-1.5 font-semibold">
                    3. Your Stated Reasons & Justifications (Required for Blind Spot Audit) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={statedReasons}
                    onChange={(e) => setStatedReasons(e.target.value)}
                    placeholder="Explain why you feel this is the right move. Why now? What makes you confident? What have you already invested that you cannot bear to lose?"
                    className="w-full text-xs sm:text-sm rounded-xl border border-[#3A3A3C] bg-[#141416] p-3.5 text-[#F2EFE9] placeholder-[#57575A] focus:outline-none focus:border-[#B08D57]"
                  />
                  <p className="text-[11px] text-[#8E8E93] mt-1.5 italic">
                    *Crucible will search this explanation for verbatim evidence of Sunk Cost, Loss Aversion, Planning Fallacy, Confirmation Bias, and Availability Heuristic.
                  </p>
                </div>

                {isSubmittingIntake && (
                  <div className="p-4 rounded-xl border border-[#B08D57]/40 bg-[#1E1C18] flex items-center gap-3">
                    <Scale className="w-5 h-5 text-[#B08D57] animate-spin" />
                    <div>
                      <span className="text-xs font-semibold text-[#D4AF37] block">
                        Convening Crucible Chamber...
                      </span>
                      <p className="text-[11px] text-[#A1A1A6] mt-0.5">
                        {intakeStepMsg}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[#2C2C2E]">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-[#8E8E93] hover:text-white px-3 py-2"
                  >
                    Cancel & Return to Chamber
                  </button>

                  <button
                    id="btn-submit-subpoena"
                    type="submit"
                    disabled={isSubmittingIntake || !decisionText.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(176,141,87,0.35)] disabled:opacity-50"
                  >
                    <span>Summon The Chamber</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Active Views Container */
          <div>
            {/* Active Session Context Bar */}
            {activeSession && (
              <div className="mb-8 p-4 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-[#8C6A36] uppercase font-bold tracking-wider text-[11px]">
                      {activeSession.verdictReport?.docketNumber || `CRU-${activeSession.id.slice(0, 8)}`}
                    </span>
                    <span className="text-[#636366]">•</span>
                    <span className="text-[#8E8E93]">
                      Adjudicated on {new Date(activeSession.createdAt).toLocaleDateString()}
                    </span>
                    {activeSession.verdictReport && (
                      <>
                        <span className="text-[#636366]">•</span>
                        <span className="font-mono text-xs text-[#D4AF37] font-semibold">
                          Score: {activeSession.verdictReport.decisionQualityScore}/100
                        </span>
                      </>
                    )}
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold font-serif-report text-[#F2EFE9] leading-snug">
                    "{activeSession.decisionText}"
                  </h1>
                </div>

                {/* Switch active case selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    id="select-case-session"
                    value={activeSession.id}
                    onChange={(e) => {
                      setActiveSessionId(e.target.value);
                      setIsCreatingNew(false);
                    }}
                    className="text-xs rounded-lg border border-[#3A3A3C] bg-[#141416] px-3 py-1.5 text-[#E5E5EA] focus:outline-none focus:border-[#B08D57]"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.verdictReport?.docketNumber || s.id.slice(0, 10)}: {s.decisionText.slice(0, 35)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Render Selected View */}
            {activeTab === "chamber" && activeSession && (
              <ChamberReveal
                session={activeSession}
                onInterrogate={handleInterrogate}
                onProceedToVerdict={handleProceedToVerdict}
              />
            )}

            {activeTab === "verdict" && activeSession && (
              <>
                {activeSession.verdictReport ? (
                  <VerdictDocument
                    session={activeSession}
                    verdict={activeSession.verdictReport}
                    onOpenCircleInvite={() => setActiveTab("circle")}
                  />
                ) : (
                  <div className="p-12 text-center rounded-xl border border-[#3A3A3C] bg-[#18181A] space-y-4">
                    <Scale className="w-10 h-10 text-[#B08D57] mx-auto" />
                    <h3 className="text-lg font-serif-report font-semibold text-[#F2EFE9]">
                      Verdict Report Not Yet Generated
                    </h3>
                    <p className="text-xs text-[#8E8E93] max-w-md mx-auto">
                      All four personas must enter testimony before the Chief Arbiter can issue the official verdict dossier.
                    </p>
                    <button
                      onClick={handleProceedToVerdict}
                      className="px-5 py-2 rounded-lg bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold uppercase tracking-wider"
                    >
                      Generate Verdict Now
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "blindspots" && activeSession && (
              <BlindSpotDetector
                flags={activeSession.biasFlags}
                userText={`${activeSession.decisionText}\n${activeSession.statedReasons || ""}`}
              />
            )}

            {activeTab === "circle" && activeSession && (
              <SecondOpinionCircle
                session={activeSession}
                onInvite={handleInviteToCircle}
                onSubmitAdvisorResponse={handleSubmitAdvisorResponse}
              />
            )}

            {activeTab === "journal" && (
              <DecisionJournal
                sessions={sessions}
                onSelectSession={(id) => {
                  setActiveSessionId(id);
                  setActiveTab("verdict");
                }}
                onCalibrate={handleCalibrateOutcome}
              />
            )}

            {activeTab === "analytics" && analytics && (
              <TribunalAnalytics analytics={analytics} />
            )}
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-[#2C2C2E] py-6 px-4 sm:px-6 text-center text-xs text-[#636366]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-[#8E8E93]">
            CRUCIBLE DECISION TRIBUNAL • ADVERSARIAL REASONING ENGINE
          </span>
          <span className="italic font-serif-report text-[11px]">
            "He who has a why to live can bear almost any how."
          </span>
        </div>
      </footer>
    </div>
  );
}
