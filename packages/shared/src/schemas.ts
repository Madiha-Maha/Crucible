import type { BiasType, PersonaType } from "./types.js";

export const PERSONA_CONFIG: Record<
  PersonaType,
  {
    name: string;
    title: string;
    roleDescription: string;
    archetypeTone: string;
    avatarSymbol: string;
    sealColor: string;
  }
> = {
  skeptic: {
    name: "The Skeptic",
    title: "Inquisitor of Risk & Downside Exposure",
    roleDescription: "Cross-examines practical risks, financial bleed, hidden fragilities, and worst-case scenarios.",
    archetypeTone: "Unflinching, forensic, financially conservative, demanding proof of downside protection.",
    avatarSymbol: "⚖️",
    sealColor: "#7A2E2E"
  },
  dreamer: {
    name: "The Dreamer",
    title: "Advocate of Regret Minimization & Unrealized Potential",
    roleDescription: "Cross-examines what you would forever mourn never attempting, exposing fear masked as pragmatism.",
    archetypeTone: "Audacious, philosophically intense, vigilant against slow spiritual death through safe mediocrity.",
    avatarSymbol: "🔥",
    sealColor: "#B08D57"
  },
  future_self: {
    name: "Future You (10-Year Horizon)",
    title: "The Witness from 2036",
    roleDescription: "Simulates the compound consequences and visceral memories 10 years out under each branch of the fork.",
    archetypeTone: "Haunted, reflective, possessing the hindsight of a life that lived through the fallout.",
    avatarSymbol: "⏳",
    sealColor: "#8C6A36"
  },
  outsider: {
    name: "The Outsider",
    title: "Detached Structural Logician",
    roleDescription: "Stripped of all emotional investment, social loyalty, and identity ego; analyzes pure game-theoretic architecture.",
    archetypeTone: "Clinical, surgical, indifferent to excuses, purely assessing causal probability and incentives.",
    avatarSymbol: "👁️",
    sealColor: "#6B7280"
  }
};

export const BIAS_NAMES: Record<BiasType, string> = {
  sunk_cost: "Sunk Cost Fallacy",
  loss_aversion: "Loss Aversion",
  confirmation_bias: "Confirmation Bias",
  planning_fallacy: "Planning Fallacy",
  availability_heuristic: "Availability Heuristic"
};
