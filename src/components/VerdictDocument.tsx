import React, { useState } from "react";
import type { DecisionSession, VerdictReport } from "../types.js";
import { BIAS_NAMES } from "../../packages/shared/src/schemas.js";
import {
  Check,
  Copy,
  Download,
  HelpCircle,
  Printer,
  Scale,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";

interface VerdictDocumentProps {
  session: DecisionSession;
  verdict: VerdictReport;
  onOpenCircleInvite?: () => void;
}

export const VerdictDocument: React.FC<VerdictDocumentProps> = ({
  session,
  verdict,
  onOpenCircleInvite,
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# CRUCIBLE DECISION TRIBUNAL — VERDICT REPORT
**Docket No:** ${verdict.docketNumber || "CRU-2026-TRIBUNAL"}
**Date of Hearing:** ${new Date(verdict.createdAt || session.createdAt).toLocaleDateString()}
**Decision Under Trial:** ${session.decisionText}

---

## 1. DECISION-QUALITY SCORE
**Score:** ${verdict.decisionQualityScore} / 100
*(Explicitly evaluates reasoning rigor, downside mitigation, and objectivity — NOT a prediction of future outcome)*

---

## 2. THE CASE FOR (STEEL-MANNED UPSIDE)
${verdict.caseFor}

---

## 3. THE CASE AGAINST (DOWN-SIDE VULNERABILITIES)
${verdict.caseAgainst}

---

## 4. COGNITIVE BIASES DETECTED & CITED
${
  verdict.biasFlags.length > 0
    ? verdict.biasFlags
        .map(
          (b, i) =>
            `${i + 1}. **${BIAS_NAMES[b.bias]}**\n   - *Quoted:* "${b.citedText}"\n   - *Diagnosis:* ${b.explanation}`
        )
        .join("\n\n")
    : "No acute cognitive biases flagged in the stated testimony."
}

---

## 5. UNRESOLVED TRIBUNAL INTERROGATORIES
${verdict.unresolvedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

---
*Seal of the Crucible High Decision Tribunal*
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const score = verdict.decisionQualityScore;
  const getScoreBadge = () => {
    if (score >= 75) {
      return {
        label: "HIGH REASONING RIGOR",
        color: "text-[#2E7A4A] bg-[#2E7A4A]/10 border-[#2E7A4A]/30",
        desc: "Significant trade-off awareness, adequate margin of safety, unhedged blind spots are minimal.",
      };
    } else if (score >= 50) {
      return {
        label: "MODERATE REASONING RIGOR",
        color: "text-[#8C6A36] bg-[#8C6A36]/10 border-[#8C6A36]/30",
        desc: "Viable upside recognized, but planning illusions or unpriced switching costs require immediate hedging.",
      };
    } else {
      return {
        label: "VULNERABLE REASONING RIGOR",
        color: "text-[#7A2E2E] bg-[#7A2E2E]/10 border-[#7A2E2E]/30",
        desc: "Heavy cognitive bias footprint. Sunk costs or loss aversion severely warp the premise.",
      };
    }
  };

  const badge = getScoreBadge();

  return (
    <div className="space-y-6">
      {/* Top action toolbar (Hidden in print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E]">
        <div className="flex items-center gap-2 text-xs text-[#A1A1A6]">
          <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
          <span>Case File Rendered — Official Tribunal Record</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCircleInvite && (
            <button
              id="btn-verdict-circle-invite"
              onClick={onOpenCircleInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B08D57]/40 bg-[#B08D57]/10 hover:bg-[#B08D57]/20 text-xs font-medium text-[#D4AF37] transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Invite Second Opinion Circle</span>
            </button>
          )}

          <button
            id="btn-verdict-copy"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3A3A3C] bg-[#242426] hover:bg-[#2C2C2E] text-xs font-medium text-[#E5E5EA] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Markdown" : "Copy Dossier"}</span>
          </button>

          <button
            id="btn-verdict-print"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] text-xs font-semibold px-4 py-1.5 transition-colors shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Document Parchment Surface */}
      <div
        id="formal-verdict-document"
        className="verdict-document-container mx-auto max-w-4xl bg-[#EDE6D6] text-[#1B1814] rounded-xl shadow-2xl p-8 sm:p-12 border border-[#C5BCAC] relative overflow-hidden transition-all"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.45)",
        }}
      >
        {/* Subtle formal watermark / seal background */}
        <div className="absolute right-6 top-6 opacity-[0.04] pointer-events-none select-none">
          <Scale className="w-96 h-96 text-[#1B1814]" />
        </div>

        {/* 1. Formal Letterhead */}
        <div className="border-b-2 border-[#1B1814] pb-6 mb-8 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-[1px] w-12 bg-[#8C6A36]"></span>
            <span className="font-legal-seal text-[13px] tracking-[0.3em] uppercase text-[#7A2E2E] font-bold">
              Crucible High Decision Tribunal
            </span>
            <span className="h-[1px] w-12 bg-[#8C6A36]"></span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif-report tracking-tight text-[#1B1814] uppercase">
            Official Verdict Report
          </h1>

          <p className="text-xs font-serif-report italic text-[#57524A] mt-1">
            In the Matter of the Proposed Life Transition & Rationale Stress-Test
          </p>

          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#57524A] mt-6 pt-3 border-t border-[#D5CDBC]">
            <div>
              <strong>DOCKET NO:</strong> {verdict.docketNumber || "CRU-2026-CHAMBER-01"}
            </div>
            <div>
              <strong>HEARING DATE:</strong>{" "}
              {new Date(verdict.createdAt || session.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div>
              <strong>JURISDICTION:</strong> ARBITRATION OF REASON
            </div>
          </div>
        </div>

        {/* 2. Subject's Stated Decision Under Trial */}
        <div className="mb-8 bg-[#E3DAC7] p-5 rounded-lg border border-[#C5BCAC]">
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#7A2E2E] block mb-1">
            Subject Matter Under Trial
          </span>
          <p className="text-base sm:text-lg font-serif-report font-semibold text-[#1B1814] leading-relaxed">
            "{session.decisionText}"
          </p>
          {session.stakes && (
            <p className="text-xs text-[#57524A] mt-2 italic">
              <strong>Stakes & Vulnerabilities:</strong> {session.stakes}
            </p>
          )}
        </div>

        {/* 3. Decision-Quality Score & Calibration Assessment */}
        <div className="mb-10 p-6 rounded-xl border-2 border-[#8C6A36]/40 bg-[#F6F2EA] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-[#57524A]">
              Tribunal Reasoning Assessment
            </span>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`text-xs font-mono uppercase font-bold px-2.5 py-1 rounded border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-[#57524A] max-w-md pt-1">
              {badge.desc}
            </p>
            <p className="text-[10px] text-[#7A2E2E] font-medium italic pt-1">
              *Note: This score certifies cognitive discipline and downside resilience. It is explicitly NOT an outcome prediction.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-[#EDE6D6] px-6 py-4 rounded-xl border border-[#C5BCAC]">
            <span className="text-4xl font-bold font-serif-report text-[#7A2E2E]">
              {verdict.decisionQualityScore}
              <span className="text-xl text-[#57524A]">/100</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#57524A] mt-1 font-semibold">
              Rigor Index
            </span>
          </div>
        </div>

        {/* 4. The Case For & The Case Against (Side by Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Case For */}
          <div className="p-6 rounded-xl bg-[#F6F2EA] border border-[#C5BCAC] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-[#D5CDBC] pb-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8C6A36]"></span>
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#1B1814]">
                  The Steel-Manned Case For
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-serif-report leading-relaxed text-[#2B2721] text-justify">
                {verdict.caseFor}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E3DAC7] text-[10px] text-[#8C6A36] uppercase font-mono font-medium">
              Advocated by The Dreamer
            </div>
          </div>

          {/* Case Against */}
          <div className="p-6 rounded-xl bg-[#F6F2EA] border border-[#7A2E2E]/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-[#D5CDBC] pb-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A2E2E]"></span>
                <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-[#7A2E2E]">
                  The Unsparing Case Against
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-serif-report leading-relaxed text-[#2B2721] text-justify">
                {verdict.caseAgainst}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E3DAC7] text-[10px] text-[#7A2E2E] uppercase font-mono font-medium">
              Prosecuted by The Skeptic & The Outsider
            </div>
          </div>
        </div>

        {/* 5. Cognitive Biases Detected (With Verbatim Excerpts) */}
        <div className="mb-10">
          <div className="flex items-center justify-between border-b-2 border-[#1B1814] pb-2 mb-4">
            <h3 className="text-base font-bold font-serif-report tracking-wide uppercase text-[#1B1814]">
              Cognitive Biases & Reasoning Fault Lines
            </h3>
            <span className="text-[10px] font-mono text-[#7A2E2E] uppercase tracking-wider font-bold">
              {verdict.biasFlags.length} Named Fault Lines Flagged
            </span>
          </div>

          {verdict.biasFlags.length === 0 ? (
            <p className="text-xs italic text-[#57524A] bg-[#F6F2EA] p-4 rounded-lg">
              No acute cognitive biases met the evidentiary threshold in the recorded testimony.
            </p>
          ) : (
            <div className="space-y-3">
              {verdict.biasFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#F6F2EA] border border-[#C5BCAC] transition-all hover:border-[#8C6A36]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#7A2E2E]">
                      {BIAS_NAMES[flag.bias]}
                    </span>
                    <span className="text-[10px] font-mono text-[#57524A] uppercase">
                      Evidence Ref: #{idx + 1}
                    </span>
                  </div>

                  <div className="my-2 p-2 rounded bg-[#EDE6D6] border-l-4 border-l-[#7A2E2E] text-xs font-serif-report italic text-[#1B1814]">
                    "{flag.citedText}"
                  </div>

                  <p className="text-xs text-[#57524A] leading-relaxed">
                    <strong className="text-[#1B1814]">Tribunal Finding:</strong> {flag.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Unresolved Interrogatories (Must Answer Before Proceeding) */}
        <div className="mb-10">
          <div className="border-b-2 border-[#1B1814] pb-2 mb-4">
            <h3 className="text-base font-bold font-serif-report tracking-wide uppercase text-[#1B1814]">
              Unresolved Inquiries for Executive Counsel
            </h3>
            <p className="text-xs text-[#57524A] italic mt-0.5">
              Before crossing the point of no return, the subject is compelled to answer each of the following:
            </p>
          </div>

          <div className="space-y-3">
            {verdict.unresolvedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-lg bg-[#F6F2EA] border border-[#C5BCAC]"
              >
                <span className="w-5 h-5 rounded-full bg-[#1B1814] text-[#EDE6D6] text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm font-serif-report text-[#1B1814] leading-relaxed">
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Official Legal Seal and Attestation Footer */}
        <div className="pt-8 border-t-2 border-[#1B1814] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-legal-seal text-sm font-bold uppercase tracking-[0.2em] text-[#1B1814]">
              Crucible Tribunal Chamber
            </div>
            <p className="text-[10px] text-[#57524A] font-serif-report italic">
              Certified by the Multi-Persona Arbiter Panel & Bias Forensic Unit.
            </p>
            <p className="text-[9px] font-mono text-[#8C6A36] uppercase">
              Artifact ID: {session.id}
            </p>
          </div>

          {/* Official Seal Graphic */}
          <div className="w-24 h-24 rounded-full border-4 border-double border-[#7A2E2E] flex flex-col items-center justify-center text-center p-2 transform -rotate-6 select-none bg-[#EDE6D6]">
            <span className="font-legal-seal text-[8px] font-bold tracking-widest text-[#7A2E2E] uppercase">
              Crucible
            </span>
            <Scale className="w-6 h-6 text-[#7A2E2E] my-0.5" />
            <span className="text-[7px] font-mono font-bold text-[#7A2E2E] uppercase tracking-tighter">
              VERDICT ENTERED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
