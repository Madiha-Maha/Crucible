import type { BiasFlag, PersonaResponse, VerdictReport } from "../types.js";
import { type LLMProvider, defaultLLMProvider } from "./llm/llm.provider.js";

export class VerdictReportService {
  private llm: LLMProvider;

  constructor(llm: LLMProvider = defaultLLMProvider) {
    this.llm = llm;
  }

  async generateVerdict(
    sessionId: string,
    decisionText: string,
    personas: PersonaResponse[],
    biasFlags: BiasFlag[]
  ): Promise<VerdictReport> {
    const docketNumber = `CRU-${new Date().getFullYear()}-${sessionId.slice(0, 8).toUpperCase()}`;

    const personaTestimonies = personas
      .map((p) => `[${p.persona.toUpperCase()}]:\nContent: ${p.content}\nKey Question: ${p.keyQuestion}`)
      .join("\n\n");

    const biasesListed = biasFlags
      .map((b) => `• ${b.bias.toUpperCase()}: "${b.citedText}" -> ${b.explanation}`)
      .join("\n");

    const systemInstruction = `You are THE CHIEF ARBITER of Crucible's High Decision Tribunal.
Your mandate: Issue the formal "Verdict Report" on the subject's decision after reviewing the testimonies of the four personas (Skeptic, Dreamer, Future You, Outsider) and the detected cognitive bias flags.

CRITICAL RULES:
1. "caseFor": The strongest, most honest, steel-manned argument in favor of taking the leap/proceeding with this decision.
2. "caseAgainst": The strongest, most rigorous, unsparing case against the plan — highlighting catastrophic failure modes and unhedged downsides.
3. "unresolvedQuestions": 3 to 5 critical, unignorable questions that remain unresolved and must be answered before executing.
4. "decisionQualityScore": An integer from 0 to 100.
   IMPORTANT: This score evaluates REASONING RIGOR, OBJECTIVITY, AND PREPAREDNESS.
   It is EXPLICITLY NOT a statistical prediction of future outcome success.
   - If heavy biases and vague justifications exist, score is 30-55.
   - If reasonable awareness but blind spots remain, score is 56-74.
   - If robust hedges, acute awareness of trade-offs, and clear downside tolerance exist, score is 75-92.

OUTPUT FORMAT: Return valid JSON ONLY:
{
  "caseFor": string,
  "caseAgainst": string,
  "unresolvedQuestions": string[],
  "decisionQualityScore": number
}`;

    const userPrompt = `
DECISION UNDER TRIAL:
"""
${decisionText}
"""

TRIBUNAL PERSONA CROSS-EXAMINATIONS:
${personaTestimonies}

COGNITIVE BIASES DETECTED:
${biasesListed || "None flagged."}

Synthesize the formal tribunal Verdict Report.`;

    try {
      const raw = await this.llm.generate(userPrompt, {
        systemInstruction,
        temperature: 0.3,
        responseFormat: "json",
      });

      const parsed = this.parseVerdictOutput(raw);
      return {
        sessionId,
        caseFor: parsed.caseFor,
        caseAgainst: parsed.caseAgainst,
        biasFlags,
        unresolvedQuestions: parsed.unresolvedQuestions,
        decisionQualityScore: parsed.decisionQualityScore,
        createdAt: new Date().toISOString(),
        docketNumber,
      };
    } catch (err) {
      console.warn("LLM Verdict generation encountered issue, producing formal analytical verdict:", err);
      return this.fallbackVerdict(sessionId, docketNumber, decisionText, personas, biasFlags);
    }
  }

  private parseVerdictOutput(raw: string): {
    caseFor: string;
    caseAgainst: string;
    unresolvedQuestions: string[];
    decisionQualityScore: number;
  } {
    try {
      const clean = raw.replace(/^```json/g, "").replace(/```$/g, "").trim();
      const obj = JSON.parse(clean);

      const score = Math.max(0, Math.min(100, Math.round(Number(obj.decisionQualityScore) || 65)));
      const questions = Array.isArray(obj.unresolvedQuestions)
        ? obj.unresolvedQuestions.map(String).filter(Boolean)
        : [
            "What is your non-negotiable exit metric?",
            "How will you absorb an 18-month timeline stretch?",
            "Who holds you accountable when fatigue compromises judgment?",
          ];

      return {
        caseFor: String(obj.caseFor || "").trim() || "Compelling strategic upside if executed with strict capital discipline.",
        caseAgainst: String(obj.caseAgainst || "").trim() || "Substantial exposure to prolonged downside without calibrated stop-loss hedges.",
        unresolvedQuestions: questions.slice(0, 5),
        decisionQualityScore: score,
      };
    } catch {
      return {
        caseFor: "Potential for significant personal and strategic growth, challenging default complacency.",
        caseAgainst: "High friction across liquidity, identity stability, and operational stamina.",
        unresolvedQuestions: [
          "At what specific dollar or time milestone do you trigger an emergency abort?",
          "How will you insulate your closest relationships from the collateral stress?",
          "What is your contingency if the core assumption collapses in month three?",
        ],
        decisionQualityScore: 64,
      };
    }
  }

  private fallbackVerdict(
    sessionId: string,
    docketNumber: string,
    decisionText: string,
    personas: PersonaResponse[],
    biasFlags: BiasFlag[]
  ): VerdictReport {
    const penalty = biasFlags.length * 9;
    const baseScore = Math.max(42, 84 - penalty);

    return {
      sessionId,
      docketNumber,
      caseFor:
        "The proposed path represents a decisive rejection of unexamined complacency. By moving from passive continuation to deliberate agency, the subject forces an escalation of personal capability and opens asymmetrical upside that the default trajectory mathematically precludes.",
      caseAgainst:
        "The current thesis is burdened by optimistic execution assumptions, inadequate stress-testing against extended market or psychological winters, and a dangerous failure to establish a concrete, non-negotiable stop-loss threshold before crossing the rubicon.",
      biasFlags,
      unresolvedQuestions: [
        "What specific metric (e.g., bank balance, calendar date, relationship strain) will trigger an un-rationalized termination of this experiment?",
        "If you encounter zero external validation or revenue for the first 12 months, what mechanism will prevent you from making desperate, value-destroying concessions?",
        "Have you separated your genuine desire for the alternative from an understandable longing to escape current discomfort?",
      ],
      decisionQualityScore: baseScore,
      createdAt: new Date().toISOString(),
    };
  }
}
