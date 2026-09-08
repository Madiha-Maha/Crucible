export type PersonaType = "skeptic" | "dreamer" | "future_self" | "outsider";

export type BiasType =
  | "sunk_cost"
  | "loss_aversion"
  | "confirmation_bias"
  | "planning_fallacy"
  | "availability_heuristic";

export interface PersonaResponse {
  persona: PersonaType;
  content: string;
  keyQuestion: string; // one pointed follow-up question posed to the user
  revealedAt?: string;
}

export interface BiasFlag {
  bias: BiasType;
  citedText: string; // exact excerpt from the user's stated reasoning
  explanation: string;
}

export interface VerdictReport {
  sessionId: string;
  caseFor: string;
  caseAgainst: string;
  biasFlags: BiasFlag[];
  unresolvedQuestions: string[];
  decisionQualityScore: number; // 0-100, reasoning quality, NOT an outcome prediction
  createdAt?: string;
  docketNumber?: string;
}

export interface PersonaFollowUp {
  id: string;
  persona: PersonaType;
  userReply: string;
  personaRebuttal: string;
  timestamp: string;
}

export interface SecondOpinionInvite {
  id: string;
  sessionId: string;
  inviteeEmail: string;
  inviteeRole: "mentor" | "parent" | "friend" | "colleague" | "other";
  inviteeName?: string;
  response?: string;
  perspective?: "concur_skeptic" | "concur_dreamer" | "neutral" | "alternate";
  submittedAt?: string;
}

export interface DecisionSession {
  id: string;
  userId: string;
  decisionText: string;
  stakes?: string;
  statedReasons?: string;
  status: "intake" | "chamber" | "verdict_ready" | "archived";
  personaResponses: PersonaResponse[];
  biasFlags: BiasFlag[];
  verdictReport?: VerdictReport | null;
  circleInvites: SecondOpinionInvite[];
  followUps: PersonaFollowUp[];
  createdAt: string;
  calibratedOutcome?: {
    checkedAt: string;
    actionTaken: "proceeded" | "halted" | "pivoted";
    reflection: string;
    accuracyRating: number; // 1-5
  };
}

export interface BiasDefinition {
  id: BiasType;
  name: string;
  formalDefinition: string;
  diagnosticTriggers: string[];
  crossExaminationStrategy: string;
  counterEvidencePrompt: string;
}

export interface TribunalAnalytics {
  totalSessions: number;
  avgDecisionScore: number;
  biasDistribution: Record<BiasType, number>;
  mostChallengingPersona: PersonaType;
  personaFrictionIndex: Record<PersonaType, number>;
  verdictDistribution: {
    highRigor: number; // score >= 75
    moderateRigor: number; // 50-74
    vulnerableRigor: number; // < 50
  };
}
