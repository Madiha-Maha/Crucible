import React, { useState } from "react";
import { BIAS_LIBRARY } from "../data/bias-library.js";
import type { BiasFlag, BiasType } from "../types.js";
import { AlertOctagon, CheckCircle2, ChevronRight, Eye, HelpCircle, ShieldAlert } from "lucide-react";

interface BlindSpotDetectorProps {
  flags: BiasFlag[];
  userText: string;
}

export const BlindSpotDetector: React.FC<BlindSpotDetectorProps> = ({ flags, userText }) => {
  const [selectedBias, setSelectedBias] = useState<BiasType | null>(
    flags.length > 0 ? flags[0].bias : "sunk_cost"
  );

  const activeDefinition = selectedBias ? BIAS_LIBRARY[selectedBias] : null;

  return (
    <div className="space-y-6" id="blind-spot-detector-section">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[#7A2E2E]/40 bg-[#242426] flex items-center justify-center text-[#E08A8A]">
            <Eye className="w-5 h-5 text-[#B08D57]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F2EFE9] font-serif-report tracking-wide">
              The Blind Spot Detector
            </h2>
            <p className="text-xs text-[#A1A1A6]">
              Forensic audit of your stated arguments against Crucible's defined library of cognitive biases.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Bias Library Selector on left, Deep Forensic Diagnosis on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: All 5 Named Biases */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#8E8E93] block px-1">
            Named Bias Taxonomy ({Object.keys(BIAS_LIBRARY).length})
          </span>

          {Object.values(BIAS_LIBRARY).map((bias) => {
            const hasFlag = flags.some((f) => f.bias === bias.id);
            const isSelected = selectedBias === bias.id;

            return (
              <button
                key={bias.id}
                id={`btn-bias-select-${bias.id}`}
                onClick={() => setSelectedBias(bias.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? "border-[#B08D57] bg-[#242426] shadow-md ring-1 ring-[#B08D57]/30"
                    : "border-[#2C2C2E] bg-[#18181A] hover:border-[#38383A]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#E5E5EA]">
                      {bias.name}
                    </span>
                    {hasFlag && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#7A2E2E]/30 text-[#F08080] border border-[#7A2E2E]/40">
                        Flagged in Session
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8E8E93] line-clamp-2 mt-1">
                    {bias.formalDefinition}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? "text-[#B08D57]" : "text-[#48484A]"}`} />
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Diagnosis & Cited Evidence */}
        <div className="lg:col-span-7">
          {activeDefinition && (
            <div className="rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B08D57] font-semibold">
                  <AlertOctagon className="w-4 h-4 text-[#B08D57]" />
                  Cognitive Distortion File: {activeDefinition.name}
                </div>
                <h3 className="text-xl font-bold font-serif-report text-[#F2EFE9] mt-1">
                  {activeDefinition.name}
                </h3>
              </div>

              {/* Formal definition */}
              <div className="p-4 rounded-lg bg-[#141416] border border-[#2C2C2E]">
                <span className="text-[10px] font-mono uppercase text-[#A1A1A6] tracking-wider block mb-1">
                  Psychological Definition
                </span>
                <p className="text-xs sm:text-sm text-[#D1D1D6] leading-relaxed">
                  {activeDefinition.formalDefinition}
                </p>
              </div>

              {/* Verified Session Flags with Verbatim Citation */}
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A1A1A6] tracking-wider block mb-2">
                  Verbatim Testimony Cited in This Session
                </span>

                {flags.filter((f) => f.bias === activeDefinition.id).length > 0 ? (
                  <div className="space-y-3">
                    {flags
                      .filter((f) => f.bias === activeDefinition.id)
                      .map((flag, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-[#2A1D1D]/40 border border-[#7A2E2E]/50 text-xs space-y-2"
                        >
                          <div className="text-[11px] font-mono text-[#F08080] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Verbatim Excerpt Citing This Bias:
                          </div>
                          <blockquote className="border-l-2 border-[#7A2E2E] pl-3 italic text-[#F2EFE9] font-serif-report text-sm">
                            "{flag.citedText}"
                          </blockquote>
                          <div className="text-[#A1A1A6] pt-1">
                            <strong className="text-[#E5E5EA]">Diagnosis:</strong> {flag.explanation}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#161618] border border-[#2C2C2E] text-xs text-[#8E8E93] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No verbatim quotes in this session triggered this specific fault line.</span>
                  </div>
                )}
              </div>

              {/* Diagnostic Triggers */}
              <div>
                <span className="text-[10px] font-mono uppercase text-[#A1A1A6] tracking-wider block mb-2">
                  Classic Linguistic Triggers & Tell-Tale Phrasing
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#8E8E93]">
                  {activeDefinition.diagnosticTriggers.map((trig, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 bg-[#141416] p-2 rounded border border-[#2C2C2E]">
                      <span className="text-[#B08D57] font-mono">›</span>
                      <span className="italic">"{trig}"</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Counter Evidence Prompt */}
              <div className="p-4 rounded-lg bg-[#222220] border border-[#B08D57]/30">
                <span className="text-[10px] font-mono uppercase text-[#D4AF37] tracking-wider font-semibold block mb-1">
                  Adversarial Counter-Interrogation
                </span>
                <p className="text-xs sm:text-sm text-[#F7F4EE] font-serif-report italic">
                  "{activeDefinition.counterEvidencePrompt}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
