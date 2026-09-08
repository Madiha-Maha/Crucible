import React, { useEffect, useState } from "react";
import type { DecisionSession, PersonaType } from "../types.js";
import { PersonaCard } from "./PersonaCard.js";
import { ChevronRight, FastForward, Play, RefreshCw, Scale, Sparkles } from "lucide-react";

interface ChamberRevealProps {
  session: DecisionSession;
  onInterrogate: (persona: PersonaType, reply: string) => Promise<any>;
  onProceedToVerdict: () => void;
}

export const ChamberReveal: React.FC<ChamberRevealProps> = ({
  session,
  onInterrogate,
  onProceedToVerdict,
}) => {
  // Track which index is revealed (0 to 3)
  const [revealedCount, setRevealedCount] = useState<number>(1);
  const [isAutoRevealing, setIsAutoRevealing] = useState<boolean>(true);
  const [isAllRevealed, setIsAllRevealed] = useState<boolean>(false);

  const responses = session.personaResponses;

  // Staggered sequence reveal with deliberate pause
  useEffect(() => {
    if (!isAutoRevealing || revealedCount >= responses.length) {
      if (revealedCount >= responses.length) {
        setIsAllRevealed(true);
      }
      return;
    }

    const timer = setTimeout(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next >= responses.length) {
          setIsAllRevealed(true);
        }
        return next;
      });
    }, 2800); // 2.8s deliberate dramatic cadence per persona testimony

    return () => clearTimeout(timer);
  }, [revealedCount, isAutoRevealing, responses.length]);

  const handleRevealAll = () => {
    setRevealedCount(responses.length);
    setIsAllRevealed(true);
    setIsAutoRevealing(false);
  };

  const handleStepNext = () => {
    if (revealedCount < responses.length) {
      setRevealedCount((prev) => prev + 1);
    }
  };

  const currentSpeakerIndex = Math.min(revealedCount - 1, responses.length - 1);

  return (
    <div className="space-y-8" id="chamber-reveal-container">
      {/* Tribunal Hearing Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#3A3A3C] bg-[#1A1A1C]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border border-[#B08D57]/40 bg-[#242426] flex items-center justify-center text-[#B08D57]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-[#D4AF37]">
                Live Tribunal In Session
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[#7A2E2E]/30 text-[#E08A8A] border border-[#7A2E2E]/40">
                {revealedCount} of {responses.length} Testimonies Entered
              </span>
            </div>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Four contradictory viewpoints cross-examining your choice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {!isAllRevealed && (
            <>
              <button
                id="btn-next-testimony"
                onClick={handleStepNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3A3A3C] bg-[#242426] hover:bg-[#2E2E30] text-xs font-medium text-[#E5E5EA] transition-colors"
              >
                <span>Next Testimony</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#B08D57]" />
              </button>

              <button
                id="btn-reveal-all"
                onClick={handleRevealAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B08D57]/40 bg-[#B08D57]/10 hover:bg-[#B08D57]/20 text-xs font-medium text-[#D4AF37] transition-colors"
                title="Conclude all summons immediately"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Summon All</span>
              </button>
            </>
          )}

          {isAllRevealed && (
            <button
              id="btn-proceed-verdict"
              onClick={onProceedToVerdict}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold tracking-wide uppercase transition-all shadow-[0_0_20px_rgba(176,141,87,0.3)] animate-pulse"
            >
              <span>Conclude Hearing & Generate Verdict</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Four Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {responses.map((resp, index) => {
          const isRevealed = index < revealedCount;
          const isCurrent = index === currentSpeakerIndex && !isAllRevealed;
          const followUps = session.followUps.filter((f) => f.persona === resp.persona);

          return (
            <div
              key={resp.persona}
              className={`transform transition-all duration-1000 ${
                isRevealed ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"
              }`}
            >
              <PersonaCard
                response={resp}
                isRevealed={isRevealed}
                isCurrentSpeaker={isCurrent}
                onInterrogate={onInterrogate}
                followUps={followUps}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom callout if all revealed */}
      {isAllRevealed && (
        <div className="text-center pt-4 pb-2">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-[#B08D57]/40 bg-[#1A1815] shadow-lg">
            <span className="text-xs text-[#D1D1D6] font-serif-report italic">
              "Every persona has concluded initial cross-examination. Are you ready for the Chief Arbiter's official case-file?"
            </span>
            <button
              id="btn-conclude-chamber"
              onClick={onProceedToVerdict}
              className="px-4 py-2 rounded-lg bg-[#7A2E2E] hover:bg-[#9E3838] text-[#F4EFE6] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Deliver Verdict Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
