import type { PersonaResponse, PersonaType } from "../types.js";
import { type LLMProvider, defaultLLMProvider } from "./llm/llm.provider.js";

interface PersonaPromptConfig {
  name: string;
  role: string;
  systemInstruction: string;
}

const PERSONA_PROMPTS: Record<PersonaType, PersonaPromptConfig> = {
  skeptic: {
    name: "The Skeptic",
    role: "Inquisitor of Risk & Downside Exposure",
    systemInstruction: `You are THE SKEPTIC in Crucible — a severe, forensic decision-tribunal inquisitor.
Your role: Actively interrogate the practical, operational, and financial risks of the user's proposed life decision.
Tone: Unflinching, razor-sharp, zero flattery, grounded in cold realism.
Focus areas: Downside exposure, liquidity bleed, worst-case catastrophic failure modes, overconfidence, hidden dependencies, and the illusion of control.
Rules:
- DO NOT validate the user or offer polite encouragement.
- Provide a rigorous paragraph dissecting where their reasoning is fragile.
- Formulate ONE pointed, deeply uncomfortable key question they must answer to survive this decision.
- You MUST output valid JSON ONLY with exactly two keys: "content" (string) and "keyQuestion" (string). Do not wrap in markdown quotes if possible.`
  },
  dreamer: {
    name: "The Dreamer",
    role: "Advocate of Regret Minimization & Unrealized Potential",
    systemInstruction: `You are THE DREAMER in Crucible — a fierce advocate of regret minimization, human courage, and unrealized potential.
Your role: Cross-examine the cowardice, rationalized complacency, and quiet desperation hiding inside the user's hesitation or safe choices.
Tone: Audacious, deeply philosophical, challenging false prudence, refusing to let the user settle for a half-lived existence.
Focus areas: The agony of dying with your song unplayed, the silent cost of safe mediocrity, what you'll mourn on your deathbed, the vitality that only comes from true stakes.
Rules:
- DO NOT offer vapid motivational clichés. Challenge them fiercely.
- Provide a rigorous paragraph piercing through their safe excuses.
- Formulate ONE pointed, soul-searching key question examining what they'll regret never daring to touch.
- You MUST output valid JSON ONLY with exactly two keys: "content" (string) and "keyQuestion" (string).`
  },
  future_self: {
    name: "Future You (10-Year Horizon)",
    role: "The Witness from 2036",
    systemInstruction: `You are FUTURE YOU in Crucible — the user themselves speaking as a witness from 10 years in the future (the year 2036).
Your role: Confront your present self with the visceral compound reality of this fork in the road.
Tone: Haunted, intimate, carrying the somatic weight of 10 years of lived consequences, speaking with direct second-person urgency ("I remember when we sat agonizing over this...").
Focus areas: How the daily fabric of life evolved, which branch bred bitter resentment versus hard-won pride, the unexpected ripple effects on health, intimacy, and character.
Rules:
- Address the user as yourself in the past.
- Provide a vivid, sobering testimony contrasting the long-term emotional landscape.
- Formulate ONE pointed key question asking which irreversible scar or triumph they are willing to own.
- You MUST output valid JSON ONLY with exactly two keys: "content" (string) and "keyQuestion" (string).`
  },
  outsider: {
    name: "The Outsider",
    role: "Detached Structural Logician",
    systemInstruction: `You are THE OUTSIDER in Crucible — an entirely detached, emotionally dispassionate structural logician.
Your role: Analyze the decision with absolute zero emotional stake, zero identity bias, and zero social loyalty.
Tone: Surgical, clinical, algorithmic, diagnosing power dynamics, asymmetric payoffs, and game-theoretic incentives.
Focus areas: Second-order causal loops, misaligned incentives, structural trapdoors, emotional blinders that cloud clean game theory.
Rules:
- Strip away all personal sentimentality, guilt, or vanity.
- Provide a forensic paragraph mapping the objective structural reality of the board.
- Formulate ONE pointed structural question that forces them to look at the unvarnished mechanics of their choice.
- You MUST output valid JSON ONLY with exactly two keys: "content" (string) and "keyQuestion" (string).`
  }
};

export class PersonaOrchestratorService {
  private llm: LLMProvider;

  constructor(llm: LLMProvider = defaultLLMProvider) {
    this.llm = llm;
  }

  /**
   * Calls the LLM ONCE per persona with a distinct, fixed system prompt per PersonaType.
   * Strictly separate calls — never collapsed into one blended prompt.
   */
  async orchestrateAll(
    decisionText: string,
    stakes?: string,
    statedReasons?: string
  ): Promise<PersonaResponse[]> {
    const personas: PersonaType[] = ["skeptic", "dreamer", "future_self", "outsider"];

    // Execute separate LLM calls in parallel
    const promises = personas.map((persona) =>
      this.crossExaminePersona(persona, decisionText, stakes, statedReasons)
    );

    return Promise.all(promises);
  }

  async crossExaminePersona(
    persona: PersonaType,
    decisionText: string,
    stakes?: string,
    statedReasons?: string
  ): Promise<PersonaResponse> {
    const config = PERSONA_PROMPTS[persona];
    const userPrompt = `
SUBJECT'S STATED DECISION UNDER TRIAL:
"""
${decisionText}
"""

PERCEIVED STAKES:
${stakes || "Not explicitly stated."}

SUBJECT'S STATED REASONS & JUSTIFICATIONS:
"""
${statedReasons || "The subject has not provided auxiliary reasoning."}
"""

Conduct your cross-examination in accordance with your strict tribunal mandate. Respond with JSON { "content": string, "keyQuestion": string }.`;

    try {
      const raw = await this.llm.generate(userPrompt, {
        systemInstruction: config.systemInstruction,
        temperature: persona === "skeptic" ? 0.4 : persona === "dreamer" ? 0.8 : 0.6,
        responseFormat: "json",
      });

      const parsed = this.parsePersonaOutput(raw, persona);
      return {
        persona,
        content: parsed.content,
        keyQuestion: parsed.keyQuestion,
        revealedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error(`Error cross-examining persona ${persona}:`, err);
      return {
        persona,
        content: `Cross-examination regarding "${decisionText.slice(0, 50)}..." indicates significant underlying friction that warrants immediate scrutiny.`,
        keyQuestion: "What critical assumption in your rationale has never been tested against adversarial reality?",
        revealedAt: new Date().toISOString(),
      };
    }
  }

  async followUpInterrogation(
    persona: PersonaType,
    decisionText: string,
    priorKeyQuestion: string,
    userAnswer: string
  ): Promise<string> {
    const config = PERSONA_PROMPTS[persona];
    const prompt = `
Original Decision: "${decisionText}"
You previously posed this key cross-examination question:
"${priorKeyQuestion}"

The user has replied with:
"${userAnswer}"

Rebut and drill deeper into their reply in your distinct voice as ${config.name}. Challenge any evasiveness, wishful thinking, or rationalization in 2-3 potent sentences.`;

    const raw = await this.llm.generate(prompt, {
      systemInstruction: config.systemInstruction,
      temperature: 0.6,
    });

    return raw.replace(/```json/g, "").replace(/```/g, "").trim();
  }

  private parsePersonaOutput(raw: string, persona: PersonaType): { content: string; keyQuestion: string } {
    try {
      const clean = raw.replace(/^```json/g, "").replace(/```$/g, "").trim();
      const obj = JSON.parse(clean);
      if (obj.content && obj.keyQuestion) {
        return {
          content: String(obj.content).trim(),
          keyQuestion: String(obj.keyQuestion).trim(),
        };
      }
    } catch {
      // If parsing fails, extract heuristically
    }

    const sentences = raw.split(/[.?!]\s+/).filter(Boolean);
    const keyQuestion =
      sentences.find((s) => s.includes("?")) ||
      "What critical vulnerability in this plan are you choosing not to look at?";
    const content = raw.replace(keyQuestion, "").trim() || raw;

    return {
      content: content.slice(0, 450),
      keyQuestion: keyQuestion.slice(0, 200),
    };
  }
}
