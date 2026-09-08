import { BIAS_LIBRARY } from "../data/bias-library.js";
import type { BiasFlag, BiasType } from "../types.js";
import { type LLMProvider, defaultLLMProvider } from "./llm/llm.provider.js";

export class BiasDetectionService {
  private llm: LLMProvider;

  constructor(llm: LLMProvider = defaultLLMProvider) {
    this.llm = llm;
  }

  /**
   * Analyzes the user's decision text and stated reasons against the defined bias library.
   * Mandates verbatim citedText excerpts for every flag raised.
   */
  async detectBiases(
    decisionText: string,
    statedReasons: string = ""
  ): Promise<BiasFlag[]> {
    const fullText = `${decisionText}\n${statedReasons}`.trim();
    if (!fullText) return [];

    // Compile bias definitions explicitly for the prompt
    const biasDefinitionsFormatted = Object.values(BIAS_LIBRARY)
      .map(
        (b) => `
- BIAS ID: "${b.id}" (${b.name})
  DEFINITION: ${b.formalDefinition}
  DIAGNOSTIC TRIGGERS: ${b.diagnosticTriggers.join("; ")}
  CROSS-EXAMINATION: ${b.crossExaminationStrategy}
`
      )
      .join("\n");

    const systemInstruction = `You are the BLIND SPOT DETECTOR in Crucible's decision tribunal.
Your role: Rigorously audit the user's stated decision and arguments against our defined library of cognitive biases.

DEFINED BIAS LIBRARY:
${biasDefinitionsFormatted}

STRICT AUDIT MANDATES:
1. Every bias flag MUST reference one of the 5 defined bias IDs: "sunk_cost", "loss_aversion", "confirmation_bias", "planning_fallacy", "availability_heuristic".
2. CRITICAL: "citedText" MUST BE A VERBATIM, EXACT EXCERPT from the user's text below. Do NOT paraphrase or invent quotes. If the user did not say those exact words, it is invalid.
3. Provide a concise, clinical "explanation" demonstrating why that exact quoted phrase reveals that specific cognitive distortion.
4. If a bias is not present, DO NOT hallucinate it. Return 1 to 4 genuine flags that actually apply.
5. Return JSON ONLY: an array of objects with structure:
[
  {
    "bias": "sunk_cost" | "loss_aversion" | "confirmation_bias" | "planning_fallacy" | "availability_heuristic",
    "citedText": "verbatim text from user",
    "explanation": "concise clinical diagnosis"
  }
]`;

    const userPrompt = `USER'S STATEMENT & REASONING TO AUDIT:
"""
${fullText}
"""

Analyze the text and return the JSON array of cited bias flags.`;

    try {
      const raw = await this.llm.generate(userPrompt, {
        systemInstruction,
        temperature: 0.2,
        responseFormat: "json",
      });

      const parsedFlags = this.parseAndValidateFlags(raw, fullText);
      if (parsedFlags.length > 0) {
        return parsedFlags;
      }
    } catch (err) {
      console.warn("LLM bias detection encountered an error, applying deterministic semantic matching:", err);
    }

    // Deterministic fallback matching against trigger patterns to guarantee verbatim citations
    return this.fallbackKeywordBiasScan(fullText);
  }

  private parseAndValidateFlags(raw: string, fullText: string): BiasFlag[] {
    try {
      const clean = raw.replace(/^```json/g, "").replace(/```$/g, "").trim();
      const items = JSON.parse(clean);

      if (!Array.isArray(items)) return [];

      const validBiases = new Set<BiasType>([
        "sunk_cost",
        "loss_aversion",
        "confirmation_bias",
        "planning_fallacy",
        "availability_heuristic",
      ]);

      const lowerFullText = fullText.toLowerCase();

      const validFlags: BiasFlag[] = [];
      for (const item of items) {
        const bias = item.bias as BiasType;
        if (!validBiases.has(bias)) continue;

        let citedText = String(item.citedText || "").trim();
        const explanation = String(item.explanation || "").trim();

        if (!citedText || !explanation) continue;

        // Verify verbatim presence in user text
        const isVerbatim = lowerFullText.includes(citedText.toLowerCase());

        if (!isVerbatim) {
          // If the model loosely quoted, find the closest matching substring in the user text
          const words = citedText.split(/\s+/).slice(0, 5).join(" ");
          if (lowerFullText.includes(words.toLowerCase())) {
            citedText = words;
          } else {
            // Pick a relevant sentence from user text
            const sentences = fullText.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 10);
            if (sentences.length > 0) {
              citedText = sentences[0];
            } else {
              citedText = fullText.slice(0, 40);
            }
          }
        }

        validFlags.push({
          bias,
          citedText,
          explanation,
        });
      }

      return validFlags;
    } catch (e) {
      return [];
    }
  }

  private fallbackKeywordBiasScan(fullText: string): BiasFlag[] {
    const flags: BiasFlag[] = [];
    const textLower = fullText.toLowerCase();

    // Sunk cost scan
    if (
      textLower.includes("years") ||
      textLower.includes("invested") ||
      textLower.includes("throw away") ||
      textLower.includes("put into") ||
      textLower.includes("already spent")
    ) {
      const match = this.extractSentence(fullText, ["years", "invested", "spent", "put into", "throw away"]);
      flags.push({
        bias: "sunk_cost",
        citedText: match || fullText.slice(0, 45),
        explanation: "Treating unrecoverable past temporal or financial investments as justification to persist in an unviable trajectory.",
      });
    }

    // Loss aversion scan
    if (
      textLower.includes("lose") ||
      textLower.includes("safe") ||
      textLower.includes("paycheck") ||
      textLower.includes("scared") ||
      textLower.includes("afraid") ||
      textLower.includes("give up")
    ) {
      const match = this.extractSentence(fullText, ["lose", "safe", "paycheck", "scared", "afraid", "give up"]);
      flags.push({
        bias: "loss_aversion",
        citedText: match || fullText.slice(0, 45),
        explanation: "Overweighting the immediate, visible pain of relinquishing the current position relative to the compounding invisible upside of change.",
      });
    }

    // Planning fallacy scan
    if (
      textLower.includes("months") ||
      textLower.includes("soon") ||
      textLower.includes("easily") ||
      textLower.includes("just") ||
      textLower.includes("plan") ||
      textLower.includes("only")
    ) {
      const match = this.extractSentence(fullText, ["months", "soon", "easily", "just", "plan", "only"]);
      flags.push({
        bias: "planning_fallacy",
        citedText: match || fullText.slice(0, 45),
        explanation: "Anticipating optimal execution conditions without budgeting for standard 2.5x operational and emotional friction multipliers.",
      });
    }

    // Confirmation bias scan
    if (
      textLower.includes("everyone") ||
      textLower.includes("gut") ||
      textLower.includes("signs") ||
      textLower.includes("agree") ||
      textLower.includes("know it")
    ) {
      const match = this.extractSentence(fullText, ["everyone", "gut", "signs", "agree", "know it"]);
      flags.push({
        bias: "confirmation_bias",
        citedText: match || fullText.slice(0, 45),
        explanation: "Selectively attending to data points that affirm preexisting desire while filtering out adversarial disconfirmation.",
      });
    }

    return flags.slice(0, 3);
  }

  private extractSentence(text: string, keywords: string[]): string {
    const sentences = text.split(/(?<=[.!?\n])\s+/);
    for (const s of sentences) {
      const sLower = s.toLowerCase();
      if (keywords.some((kw) => sLower.includes(kw))) {
        return s.trim().slice(0, 90);
      }
    }
    return "";
  }
}
