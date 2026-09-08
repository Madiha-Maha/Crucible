import type { BiasDefinition, BiasType } from "../../../../packages/shared/src/types.js";

export const BIAS_LIBRARY: Record<BiasType, BiasDefinition> = {
  sunk_cost: {
    id: "sunk_cost",
    name: "Sunk Cost Fallacy",
    formalDefinition:
      "Continuing an endeavor as the result of previously invested resources (time, money, emotional agony) that are irrevocably gone and cannot be recouped, regardless of future payoffs.",
    diagnosticTriggers: [
      "after all the time I've put into this",
      "I can't throw away X years",
      "I've invested too much money to walk away",
      "if I quit now, it was all for nothing",
      "we've already suffered through the worst of it"
    ],
    crossExaminationStrategy:
      "Sever past pain from prospective expected value. Ask: 'If you woke up today with zero prior history in this situation and were offered this exact scenario anew, would you voluntarily enter it?'",
    counterEvidencePrompt:
      "What would you do if all past investments were declared completely null and void today?"
  },
  loss_aversion: {
    id: "loss_aversion",
    name: "Loss Aversion",
    formalDefinition:
      "The psychological tendency where the pain of losing something is experienced as psychologically twice as impactful as the pleasure of gaining an equivalent upside, causing irrational risk aversion.",
    diagnosticTriggers: [
      "I can't risk losing what I currently have",
      "at least my current situation is safe",
      "giving up the steady paycheck/title terrifies me",
      "what if the alternative is worse than this pain",
      "I'm terrified of regretting walking away"
    ],
    crossExaminationStrategy:
      "Price the invisible cost of inaction. Inquire: 'What is the compounding terminal loss of staying in your current state for another five years?'",
    counterEvidencePrompt:
      "What is the total tally of the slow, invisible erosion occurring while you remain frozen to protect the status quo?"
  },
  confirmation_bias: {
    id: "confirmation_bias",
    name: "Confirmation Bias",
    formalDefinition:
      "The systematic tendency to search for, interpret, favor, and recall information that ratifies preexisting inclinations or desires, while systematically discounting or avoiding contradictory evidence.",
    diagnosticTriggers: [
      "everyone I talked to agreed with me",
      "the signs in my life are clearly pointing toward",
      "I only asked people who have made this leap",
      "I know in my gut this is right despite the numbers",
      "the critics simply don't understand my vision"
    ],
    crossExaminationStrategy:
      "Demand the steel-man of the dissenting opinion. Ask: 'Who is the smartest, most benevolent person who vehemently advises you against this, and what is their strongest argument?'",
    counterEvidencePrompt:
      "What empirical piece of evidence, if discovered tomorrow, would force you to immediately abandon this plan?"
  },
  planning_fallacy: {
    id: "planning_fallacy",
    name: "Planning Fallacy",
    formalDefinition:
      "A cognitive phenomenon wherein predictions about how much time, capital, emotional stamina, or operational complexity is needed to complete a future task display an optimistic bias.",
    diagnosticTriggers: [
      "it will only take 3 to 6 months to break even",
      "once we move, the stress will immediately disappear",
      "everything will go smoothly once the announcement is made",
      "it's just a matter of working harder for a few weeks",
      "our burn rate won't be that high"
    ],
    crossExaminationStrategy:
      "Apply the 2.5x stress factor. Inquire: 'If this transition consumes 250% more time, 200% more money, and 300% more emotional friction than budgeted, does your plan survive or implode?'",
    counterEvidencePrompt:
      "What happens when the first three milestones slip by 90 days each and unexpected friction emerges?"
  },
  availability_heuristic: {
    id: "availability_heuristic",
    name: "Availability Heuristic",
    formalDefinition:
      "Overestimating the likelihood or frequency of events based on how easily recent, dramatic, emotionally vivid, or personal examples spring to mind, rather than statistical reality.",
    diagnosticTriggers: [
      "I saw someone on Twitter/YouTube pull this off easily",
      "my friend went through a terrible divorce so all relationships end that way",
      "the tech industry is crashing so no one should start anything",
      "just last week an incident happened that proved to me I must leave now",
      "this one disaster story is exactly what would happen to me"
    ],
    crossExaminationStrategy:
      "De-escalate emotional salience and isolate base rates. Ask: 'Are you reacting to an acute, visceral anecdote, or the sober statistical distribution of outcomes?'",
    counterEvidencePrompt:
      "What is the actual statistical base rate of success and failure for people in your exact demographic and financial bracket?"
  }
};
