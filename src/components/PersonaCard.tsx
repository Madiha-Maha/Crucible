import React, { useState } from "react";
import type { PersonaResponse, PersonaType } from "../types.js";
import { PERSONA_CONFIG } from "../../packages/shared/src/schemas.js";
import { AlertCircle, ArrowRight, CheckCircle2, MessageSquare, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

interface PersonaCardProps {
  response: PersonaResponse;
  isRevealed: boolean;
  isCurrentSpeaker: boolean;
  onInterrogate?: (persona: PersonaType, userReply: string) => Promise<string | void>;
  followUps?: Array<{ userReply: string; personaRebuttal: string; timestamp: string }>;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  response,
  isRevealed,
  isCurrentSpeaker,
  onInterrogate,
  followUps = [],
}) => {
  const config = PERSONA_CONFIG[response.persona];
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isRevealed) {
    return (
      <div
        id={`persona-unrevealed-${response.persona}`}
        className="rounded-xl border border-[#2C2C2E] bg-[#18181A]/60 p-6 backdrop-blur-sm transition-all duration-700 flex flex-col justify-center items-center text-center min-h-[340px] opacity-40"
      >
        <div className="w-12 h-12 rounded-full border border-[#3A3A3C] bg-[#1C1C1E] flex items-center justify-center text-xl mb-3 text-[#8E8E93]">
          {config.avatarSymbol}
        </div>
        <h3 className="text-base font-medium text-[#A1A1A6] font-serif-report tracking-wide">
          {config.name}
        </h3>
        <p className="text-xs text-[#636366] mt-1 max-w-[220px]">
          Awaiting testimony summons...
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8C6A36] uppercase tracking-widest font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#8C6A36] animate-pulse"></span>
          Subpoenaed
        </div>
      </div>
    );
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !onInterrogate || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onInterrogate(response.persona, replyInput.trim());
      setReplyInput("");
      setIsInterrogating(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardAccent = (persona: PersonaType) => {
    switch (persona) {
      case "skeptic":
        return "border-l-4 border-l-[#7A2E2E] shadow-[0_4px_30px_rgba(122,46,46,0.15)]";
      case "dreamer":
        return "border-l-4 border-l-[#B08D57] shadow-[0_4px_30px_rgba(176,141,87,0.15)]";
      case "future_self":
        return "border-l-4 border-l-[#8C6A36] shadow-[0_4px_30px_rgba(140,106,54,0.15)]";
      case "outsider":
        return "border-l-4 border-l-[#6B7280] shadow-[0_4px_30px_rgba(107,114,128,0.15)]";
    }
  };

  return (
    <div
      id={`persona-card-${response.persona}`}
      className={`relative rounded-xl border border-[#3A3A3C] bg-[#1E1E20] p-6 transition-all duration-700 flex flex-col justify-between ${getCardAccent(
        response.persona
      )} ${
        isCurrentSpeaker
          ? "ring-1 ring-[#B08D57]/60 shadow-[0_0_35px_rgba(176,141,87,0.22)]"
          : "opacity-95"
      }`}
    >
      {/* Header with Persona Seal and Role */}
      <div>
        <div className="flex items-start justify-between gap-3 border-b border-[#2C2C2E] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg border border-[#B08D57]/40 bg-[#161618] flex items-center justify-center text-xl shadow-inner">
              {config.avatarSymbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#F2EFE9] font-serif-report tracking-wide">
                  {config.name}
                </h3>
                {isCurrentSpeaker && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#B08D57]/20 text-[#D4AF37] border border-[#B08D57]/30 tracking-widest animate-pulse">
                    On The Stand
                  </span>
                )}
              </div>
              <p className="text-xs text-[#B08D57] font-medium tracking-wide">
                {config.title}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1A6] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#B08D57]" /> Sworn Testimony
            </span>
          </div>
        </div>

        {/* Archetype Description */}
        <p className="text-[11px] text-[#8E8E93] italic mt-3 mb-3 border-l-2 border-[#38383A] pl-2.5">
          {config.roleDescription}
        </p>

        {/* Cross-Examination Content */}
        <div className="mt-4 text-sm leading-relaxed text-[#D1D1D6] font-normal space-y-2.5">
          <p className="whitespace-pre-line">{response.content}</p>
        </div>

        {/* The Pointed Key Question */}
        <div className="mt-5 rounded-lg border border-[#B08D57]/35 bg-[#171719] p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 opacity-5 pointer-events-none">
            <AlertCircle className="w-20 h-20 text-[#B08D57]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#D4AF37] uppercase font-semibold mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B08D57]" />
            Tribunal Interrogatory
          </div>
          <p className="text-sm font-serif-report font-medium italic text-[#F7F4EE] leading-snug">
            "{response.keyQuestion}"
          </p>
        </div>

        {/* Follow-up testimonies if any */}
        {followUps.length > 0 && (
          <div className="mt-4 space-y-3 pt-3 border-t border-[#2C2C2E]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#A1A1A6]">
              Subsequent Interrogations ({followUps.length})
            </span>
            {followUps.map((fup, i) => (
              <div key={i} className="text-xs space-y-1.5 bg-[#151517] p-3 rounded-lg border border-[#2C2C2E]">
                <div className="text-[#A1A1A6]">
                  <strong className="text-[#B08D57]">Your Answer:</strong> "{fup.userReply}"
                </div>
                <div className="text-[#D1D1D6] border-l-2 border-[#B08D57]/50 pl-2">
                  <strong className="text-[#E5E5EA]">{config.name}'s Rebuttal:</strong>{" "}
                  {fup.personaRebuttal}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer action: Interrogate / Respond */}
      <div className="mt-5 pt-3 border-t border-[#2C2C2E]">
        {!isInterrogating ? (
          <button
            id={`btn-challenge-${response.persona}`}
            onClick={() => setIsInterrogating(true)}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2 px-3 rounded-lg border border-[#3A3A3C] bg-[#242426] text-[#E5E5EA] hover:border-[#B08D57] hover:text-[#D4AF37] transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#B08D57]" />
            Answer or Challenge This Inquisitor
          </button>
        ) : (
          <form onSubmit={handleReplySubmit} className="space-y-2">
            <textarea
              id={`input-challenge-${response.persona}`}
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder={`Answer ${config.name}'s key question or defend your rationale...`}
              rows={3}
              className="w-full text-xs rounded-lg border border-[#B08D57]/40 bg-[#141416] p-2.5 text-[#E5E5EA] placeholder-[#636366] focus:outline-none focus:ring-1 focus:ring-[#B08D57]"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInterrogating(false)}
                className="text-xs text-[#8E8E93] hover:text-white px-2 py-1"
              >
                Cancel
              </button>
              <button
                id={`btn-submit-challenge-${response.persona}`}
                type="submit"
                disabled={!replyInput.trim() || isSubmitting}
                className="flex items-center gap-1 text-xs font-medium bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Interrogating..." : "Submit Defense"}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
