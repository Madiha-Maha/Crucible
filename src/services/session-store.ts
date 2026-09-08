import { BIAS_LIBRARY } from "../data/bias-library.js";
import type { DecisionSession, PersonaType, TribunalAnalytics, VerdictReport } from "../types.js";
import { BiasDetectionService } from "./bias-detection.service.js";
import { PersonaOrchestratorService } from "./persona-orchestrator.service.js";
import { VerdictReportService } from "./verdict-report.service.js";

export class SessionStore {
  private sessions: Map<string, DecisionSession> = new Map();
  private personaOrchestrator: PersonaOrchestratorService;
  private biasDetector: BiasDetectionService;
  private verdictService: VerdictReportService;

  constructor() {
    this.personaOrchestrator = new PersonaOrchestratorService();
    this.biasDetector = new BiasDetectionService();
    this.verdictService = new VerdictReportService();
    this.seedHistoricalSessions();
  }

  getAllSessions(): DecisionSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getSession(id: string): DecisionSession | undefined {
    return this.sessions.get(id);
  }

  async createSession(
    decisionText: string,
    stakes?: string,
    statedReasons?: string,
    userId: string = "trial-counsel-01"
  ): Promise<DecisionSession> {
    const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Detect biases
    const biasFlags = await this.biasDetector.detectBiases(decisionText, statedReasons);

    // 2. Orchestrate personas in parallel (4 distinct calls)
    const personaResponses = await this.personaOrchestrator.orchestrateAll(
      decisionText,
      stakes,
      statedReasons
    );

    const session: DecisionSession = {
      id,
      userId,
      decisionText,
      stakes,
      statedReasons,
      status: "chamber",
      personaResponses,
      biasFlags,
      circleInvites: [],
      followUps: [],
      createdAt: new Date().toISOString(),
    };

    this.sessions.set(id, session);
    return session;
  }

  async getOrGenerateVerdict(sessionId: string): Promise<VerdictReport> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found.`);
    }

    if (session.verdictReport) {
      return session.verdictReport;
    }

    const report = await this.verdictService.generateVerdict(
      sessionId,
      session.decisionText,
      session.personaResponses,
      session.biasFlags
    );

    session.verdictReport = report;
    session.status = "verdict_ready";
    this.sessions.set(sessionId, session);
    return report;
  }

  async addPersonaFollowUp(
    sessionId: string,
    persona: PersonaType,
    userReply: string
  ): Promise<{ rebuttal: string; session: DecisionSession }> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    const personaResp = session.personaResponses.find((p) => p.persona === persona);
    const priorQuestion =
      personaResp?.keyQuestion || "What unexamined risk are you hiding from?";

    const rebuttal = await this.personaOrchestrator.followUpInterrogation(
      persona,
      session.decisionText,
      priorQuestion,
      userReply
    );

    const followUp = {
      id: `fup-${Date.now()}`,
      persona,
      userReply,
      personaRebuttal: rebuttal,
      timestamp: new Date().toISOString(),
    };

    session.followUps.push(followUp);
    this.sessions.set(sessionId, session);

    return { rebuttal, session };
  }

  addCircleInvite(
    sessionId: string,
    inviteeEmail: string,
    inviteeRole: "mentor" | "parent" | "friend" | "colleague" | "other" = "mentor",
    inviteeName?: string
  ): DecisionSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    const invite = {
      id: `inv-${Date.now()}`,
      sessionId,
      inviteeEmail,
      inviteeRole,
      inviteeName: inviteeName || inviteeEmail.split("@")[0],
    };

    session.circleInvites.push(invite);
    this.sessions.set(sessionId, session);
    return session;
  }

  recordCircleResponse(
    sessionId: string,
    inviteId: string,
    response: string,
    perspective: "concur_skeptic" | "concur_dreamer" | "neutral" | "alternate"
  ): DecisionSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    const invite = session.circleInvites.find((i) => i.id === inviteId);
    if (invite) {
      invite.response = response;
      invite.perspective = perspective;
      invite.submittedAt = new Date().toISOString();
    } else {
      // Direct guest submission
      session.circleInvites.push({
        id: inviteId,
        sessionId,
        inviteeEmail: "counsel.advisor@crucible.internal",
        inviteeRole: "mentor",
        inviteeName: "Trusted Advisor",
        response,
        perspective,
        submittedAt: new Date().toISOString(),
      });
    }

    this.sessions.set(sessionId, session);
    return session;
  }

  calibrateOutcome(
    sessionId: string,
    actionTaken: "proceeded" | "halted" | "pivoted",
    reflection: string,
    accuracyRating: number
  ): DecisionSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.calibratedOutcome = {
      checkedAt: new Date().toISOString(),
      actionTaken,
      reflection,
      accuracyRating,
    };
    session.status = "archived";

    this.sessions.set(sessionId, session);
    return session;
  }

  getAnalytics(): TribunalAnalytics {
    const all = this.getAllSessions();
    const biasDistribution: Record<string, number> = {
      sunk_cost: 0,
      loss_aversion: 0,
      confirmation_bias: 0,
      planning_fallacy: 0,
      availability_heuristic: 0,
    };

    let totalScore = 0;
    let scoredCount = 0;
    const verdictDistribution = {
      highRigor: 0,
      moderateRigor: 0,
      vulnerableRigor: 0,
    };

    for (const s of all) {
      for (const b of s.biasFlags) {
        biasDistribution[b.bias] = (biasDistribution[b.bias] || 0) + 1;
      }
      if (s.verdictReport) {
        const score = s.verdictReport.decisionQualityScore;
        totalScore += score;
        scoredCount++;
        if (score >= 75) verdictDistribution.highRigor++;
        else if (score >= 50) verdictDistribution.moderateRigor++;
        else verdictDistribution.vulnerableRigor++;
      }
    }

    const avgDecisionScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 71;

    return {
      totalSessions: all.length,
      avgDecisionScore,
      biasDistribution: biasDistribution as any,
      mostChallengingPersona: "skeptic",
      personaFrictionIndex: {
        skeptic: 88,
        future_self: 76,
        outsider: 72,
        dreamer: 64,
      },
      verdictDistribution,
    };
  }

  private seedHistoricalSessions() {
    const s1: DecisionSession = {
      id: "crucible-case-101",
      userId: "trial-counsel-01",
      decisionText: "Resign from Staff Engineering position at Stripe to build an autonomous compliance AI startup with $180K personal savings.",
      stakes: "Walking away from $480K total annual comp, 4-year tenure, unvested options, while funding runway with life savings.",
      statedReasons: "I've spent 7 years in fintech and understand every compliance bottleneck. After all the time I've put into this industry, I can't stay on the sidelines. It will only take 3 to 6 months to land our first 3 enterprise contracts.",
      status: "verdict_ready",
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      personaResponses: [
        {
          persona: "skeptic",
          content: "You are burning pristine liquidity into an enterprise sales cycle notorious for 9-to-14 month security review latencies. Your estimated 3-6 month breakeven is a catastrophic planning illusion. Enterprise CISOs do not buy critical compliance infrastructure from pre-seed founders with zero SOC2 certifications.",
          keyQuestion: "When month 9 arrives, your $180k is depleted to $40k, and procurement at your lead prospect freezes until next fiscal year, what is your non-negotiable exit plan?",
          revealedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        },
        {
          persona: "dreamer",
          content: "You have built golden handcuffs so comfortable they are suffocating you. If you spend another four years polishing Stripe's ledger architecture, you will die spiritually having traded your prime building decade for liquid RSUs. Take the arena.",
          keyQuestion: "At age 60, will you weep for the $480k salary you forfeited, or the sovereign venture you were terrified to build?",
          revealedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        },
        {
          persona: "future_self",
          content: "I am writing this from 2036. The shock of having no institutional brand in year one was terrifying. But the day we closed our own first sovereign client cured the corporate anxiety forever. Just do not burn through your savings without a co-founder to carry the cognitive load.",
          keyQuestion: "Can you endure 18 months of total obscurity without losing your dignity or burning out your marriage?",
          revealedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        },
        {
          persona: "outsider",
          content: "The structural flaw is your distribution model. You possess domain expertise but zero demonstrated enterprise sales muscle. You are treating product engineering as 80% of the battle when distribution is 90% of the game.",
          keyQuestion: "Why should any Fortune 500 company trust your solo balance sheet over established incumbents when the risk of failure lands directly on their job?",
          revealedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        },
      ],
      biasFlags: [
        {
          bias: "sunk_cost",
          citedText: "After all the time I've put into this industry",
          explanation: "Allowing irrecoverable past domain tenure to justify future high-risk capital allocation.",
        },
        {
          bias: "planning_fallacy",
          citedText: "It will only take 3 to 6 months to land our first 3 enterprise contracts",
          explanation: "Severe underestimation of enterprise procurement and compliance lag by a factor of 3x.",
        },
      ],
      verdictReport: {
        sessionId: "crucible-case-101",
        docketNumber: "CRU-2026-CASE-101",
        caseFor: "Deep domain competence paired with asymmetric equity upside, freeing elite talent from golden corporate stagnation.",
        caseAgainst: "Critical exposure to enterprise procurement friction with an unhedged personal burn rate and no sales co-founder.",
        biasFlags: [
          {
            bias: "sunk_cost",
            citedText: "After all the time I've put into this industry",
            explanation: "Allowing irrecoverable past domain tenure to justify future high-risk capital allocation.",
          },
          {
            bias: "planning_fallacy",
            citedText: "It will only take 3 to 6 months to land our first 3 enterprise contracts",
            explanation: "Severe underestimation of enterprise procurement and compliance lag by a factor of 3x.",
          },
        ],
        unresolvedQuestions: [
          "What is the non-negotiable cash reserve floor ($50K?) where you halt operations?",
          "Can you secure 5 signed letters of intent BEFORE tendering your resignation?",
          "How will you survive an unexpected 6-month delay in security compliance sign-offs?",
        ],
        decisionQualityScore: 72,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
      circleInvites: [
        {
          id: "inv-seed-1",
          sessionId: "crucible-case-101",
          inviteeEmail: "sarah.mentor@sequoia.com",
          inviteeRole: "mentor",
          inviteeName: "Sarah Chen (Founding VP)",
          response: "Crucible's Skeptic is right about the sales cycle. Line up an enterprise design partner before quitting, then leap.",
          perspective: "concur_skeptic",
          submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
      ],
      followUps: [],
      calibratedOutcome: {
        checkedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        actionTaken: "pivoted",
        reflection: "Crucible's Skeptic forced me to secure two LOIs before quitting Stripe. Saved me at least 6 months of panic.",
        accuracyRating: 5,
      },
    };

    const s2: DecisionSession = {
      id: "crucible-case-102",
      userId: "trial-counsel-01",
      decisionText: "End 4-year romantic relationship with partner due to fundamentally irreconcilable stances on living abroad vs staying near extended family.",
      stakes: "Joint lease, shared circle of friends, deep affection, fear of starting over at age 32.",
      statedReasons: "I can't throw away 4 years of love and memories. But I'm terrified that if I stay in Ohio forever I will harbor bitter resentment. Everyone I talked to agreed that values on geography can't be compromised.",
      status: "verdict_ready",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      personaResponses: [
        {
          persona: "skeptic",
          content: "You are romanticizing a geographic coordinates change as a panacea for internal restlessness. Moving to Europe will not resolve existential questions. Furthermore, discarding a proven, compassionate partner in your 30s is an irreversible option with heavy emotional switching costs.",
          keyQuestion: "Are you running toward an authentic life vision, or merely using geography to escape dealing with relational vulnerability?",
          revealedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          persona: "dreamer",
          content: "Quiet resentment is a poison that takes 10 years to kill a marriage from the inside out. Sacrificing your core desire for global exploration to maintain familiar peace will mutate into contempt. You cannot negotiate fundamental life vectors.",
          keyQuestion: "Do you want to wake up in 2036 looking at someone you love while secretly blaming them for the world you never saw?",
          revealedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          persona: "future_self",
          content: "I remember the grief of packing the apartment boxes. It hurt more than anything we had ever done. But the honesty spared us both a bitter divorce at 38 with toddlers in tow.",
          keyQuestion: "Is clean grief today better than weaponized resentment tomorrow?",
          revealedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          persona: "outsider",
          content: "The divergence is binary: location is non-fungible when rooted in familial obligation. A compromise here leaves both parties sub-optimally situated. The structural incentive is to decouple before asset or child entanglement.",
          keyQuestion: "What is the probability that either of you will genuinely change your fundamental life priorities without coercion over the next 3 years?",
          revealedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
      ],
      biasFlags: [
        {
          bias: "sunk_cost",
          citedText: "I can't throw away 4 years of love and memories",
          explanation: "Treating elapsed historical relationship tenure as a constraint preventing honest future vector alignment.",
        },
        {
          bias: "confirmation_bias",
          citedText: "Everyone I talked to agreed that values on geography can't be compromised",
          explanation: "Consulting an echo-chamber circle that validates preexisting breakup inclinations.",
        },
      ],
      verdictReport: {
        sessionId: "crucible-case-102",
        docketNumber: "CRU-2026-CASE-102",
        caseFor: "Prevents toxic, slow-burning resentment from poisoning a healthy bond; respects non-negotiable geographic and familial vectors.",
        caseAgainst: "High risk of grieving an exceptional partner whose presence is discounted due to restless novelty seeking.",
        biasFlags: [
          {
            bias: "sunk_cost",
            citedText: "I can't throw away 4 years of love and memories",
            explanation: "Treating elapsed historical relationship tenure as a constraint preventing honest future vector alignment.",
          },
          {
            bias: "confirmation_bias",
            citedText: "Everyone I talked to agreed that values on geography can't be compromised",
            explanation: "Consulting an echo-chamber circle that validates preexisting breakup inclinations.",
          },
        ],
        unresolvedQuestions: [
          "Have you conducted a structured trial (e.g. 6-month remote immersion) together before terminating?",
          "Are you confident your desire for living abroad is an enduring life goal rather than temporary escapism?",
          "Can you separate your respect for them from your guilt over initiating the separation?",
        ],
        decisionQualityScore: 81,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      circleInvites: [],
      followUps: [],
    };

    this.sessions.set(s1.id, s1);
    this.sessions.set(s2.id, s2);
  }
}

export const sessionStore = new SessionStore();
