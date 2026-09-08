# Crucible — Stress-Test Your Life Before You Live It

> **A structured, multi-perspective AI decision-tribunal that cross-examines your life choices, detects cognitive biases, and delivers a formal Verdict Report.**

---

## 🏛️ THE IDEA

Every big decision app on the market (journaling apps, pro/con list tools, decision matrices) is a mirror — it reflects your own thinking back at you, politely organized. None of them argue with you.

**Crucible** puts your decision on trial. Before you quit the job, end the relationship, move cities, or launch the business, you bring the decision into "The Chamber" — a structured, multi-perspective AI tribunal that actively cross-examines your reasoning instead of validating it. You leave with a "Verdict Report": your blind spots named, your cognitive biases flagged, and the strongest honest case against your own plan — so if you go ahead, you go ahead with your eyes open.

---

## 🚀 ARCHITECTURE & MONOREPO

- `/apps/web` → Next.js 14 App Router (TypeScript, Tailwind CSS, Zustand, Motion) → **Vercel**
- `/apps/api` → Node.js + Express + TypeScript + Prisma ORM (PostgreSQL) → **Railway**
- `/packages/shared` → Shared TypeScript contracts (`PersonaType`, `BiasType`, `VerdictReport`, schemas)

---

## 📋 DEPLOYMENT STEPS (Railway + Vercel)

Follow these steps verbatim to deploy Crucible to production:

1. **Push repo to GitHub.**
2. **Railway**: New Project → Deploy from GitHub → service root `apps/api` → Add PostgreSQL plugin → set `JWT_SECRET`, `CORS_ORIGIN`, `LLM_PROVIDER_API_KEY` → deploy → confirm `/health` returns 200 → copy public URL.
3. **Vercel**: New Project → same repo → root directory `apps/web` → set `NEXT_PUBLIC_API_BASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (final Vercel domain) → deploy.
4. **Update `CORS_ORIGIN`** on Railway to the final Vercel domain, redeploy.
5. **Run a full session end-to-end**: submit a decision, confirm all four personas return distinct responses, confirm the Verdict Report renders with real bias flags and cited text.

---

## ⚙️ ENVIRONMENT VARIABLES REFERENCE

### Web (`apps/web/.env`)
```env
NEXT_PUBLIC_API_BASE_URL=https://crucible-api.up.railway.app
NEXTAUTH_SECRET=your_nextauth_secret_key_32_chars_min
NEXTAUTH_URL=https://crucible.vercel.app
```

### API (`apps/api/.env`)
```env
DATABASE_URL=postgresql://user:password@containers-us-west-123.railway.app:5432/railway
JWT_SECRET=your_jwt_signing_secret_key
CORS_ORIGIN=https://crucible.vercel.app,http://localhost:3000
LLM_PROVIDER_API_KEY=your_gemini_or_llm_api_key
PORT=4000
```

---

## ⚖️ THE FOUR TRIBUNAL PERSONAS

Crucible strictly enforces **four separately-prompted LLM calls** (never blended into a single generic prompt):

1. **The Skeptic**: Practical and financial risk, liquidity bleed, worst-case scenarios, failure modes.
2. **The Dreamer**: Regret minimization, unlived life, what you'd mourn never daring to attempt.
3. **Future You (10-Year Horizon)**: A simulated perspective from 2036 looking back on the aftermath under both choices.
4. **The Outsider**: Detached structural logician with zero emotional stake or ego bias.

---

## 🔍 THE BLIND SPOT DETECTOR & BIAS LIBRARY

Crucible's cognitive bias detection evaluates stated arguments against a defined library:
- **Sunk Cost Fallacy**: Irretrievable past investments dictating forward decisions.
- **Loss Aversion**: Asymmetric weighting of potential losses over equivalent gains.
- **Confirmation Bias**: Selectively seeking arguments that ratify a predetermined choice.
- **Planning Fallacy**: Underestimating completion time, cost, friction, and emotional toll.
- **Availability Heuristic**: Overweighting recent, vivid, or traumatic anecdotes.

Every bias flag raised includes a **verbatim citation (`citedText`)** directly excerpted from the user's testimony.
