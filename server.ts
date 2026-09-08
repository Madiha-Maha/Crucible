import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { sessionStore } from "./src/services/session-store.js";
import { BIAS_LIBRARY } from "./src/data/bias-library.js";
import type { PersonaType } from "./src/types.js";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS Middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // 1. Mandatory /health endpoint per contract
  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "crucible-tribunal-api", timestamp: new Date().toISOString() });
  });

  // 2. Auth contract routes (Section 5)
  app.post(["/auth/register", "/api/auth/register"], (req, res) => {
    const { email, password, name } = req.body;
    res.json({
      token: "mock-jwt-crucible-token-sec-9",
      user: {
        id: "trial-counsel-01",
        email: email || "counsel@crucible.law",
        name: name || "Trial Counsel",
      },
    });
  });

  app.post(["/auth/login", "/api/auth/login"], (req, res) => {
    const { email } = req.body;
    res.json({
      token: "mock-jwt-crucible-token-sec-9",
      user: {
        id: "trial-counsel-01",
        email: email || "counsel@crucible.law",
        name: "Trial Counsel",
      },
    });
  });

  app.get(["/auth/me", "/api/auth/me"], (req, res) => {
    res.json({
      user: {
        id: "trial-counsel-01",
        email: "counsel@crucible.law",
        name: "Trial Counsel",
        role: "Chief Arbiter",
      },
    });
  });

  // 3. Bias Library Endpoint
  app.get("/api/biases", (req, res) => {
    res.json(Object.values(BIAS_LIBRARY));
  });

  // 4. Analytics Endpoint
  app.get(["/analytics", "/api/analytics"], (req, res) => {
    const analytics = sessionStore.getAnalytics();
    res.json(analytics);
  });

  // 5. Decision Journal: GET all sessions
  app.get(["/sessions", "/api/sessions"], (req, res) => {
    const sessions = sessionStore.getAllSessions();
    res.json(sessions);
  });

  // 6. Create new Decision Session -> triggers persona orchestration + bias detection
  app.post(["/sessions", "/api/sessions"], async (req, res) => {
    try {
      const { decisionText, stakes, statedReasons } = req.body;
      if (!decisionText || typeof decisionText !== "string" || decisionText.trim().length === 0) {
        return res.status(400).json({ error: "decisionText is required and must not be empty" });
      }

      const session = await sessionStore.createSession(decisionText.trim(), stakes, statedReasons);
      res.status(201).json(session);
    } catch (err) {
      console.error("Failed to create session:", err);
      res.status(500).json({ error: "Failed to create decision chamber session" });
    }
  });

  // 7. GET specific session by ID
  app.get(["/sessions/:id", "/api/sessions/:id"], (req, res) => {
    const session = sessionStore.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session);
  });

  // 8. GET Verdict Report for session
  app.get(["/sessions/:id/verdict", "/api/sessions/:id/verdict"], async (req, res) => {
    try {
      const report = await sessionStore.getOrGenerateVerdict(req.params.id);
      res.json(report);
    } catch (err: any) {
      console.error("Failed to get/generate verdict:", err);
      res.status(404).json({ error: err.message || "Failed to generate verdict" });
    }
  });

  // 9. Interactive Follow-up / Persona Interrogation
  app.post(["/sessions/:id/interrogate", "/api/sessions/:id/interrogate"], async (req, res) => {
    try {
      const { persona, userReply } = req.body;
      if (!persona || !userReply) {
        return res.status(400).json({ error: "persona and userReply are required" });
      }

      const result = await sessionStore.addPersonaFollowUp(
        req.params.id,
        persona as PersonaType,
        userReply
      );
      res.json(result);
    } catch (err: any) {
      console.error("Failed to process interrogation:", err);
      res.status(500).json({ error: err.message || "Interrogation error" });
    }
  });

  // 10. Second Opinion Circle: Invite
  app.post(["/sessions/:id/circle-invite", "/api/sessions/:id/circle-invite"], (req, res) => {
    try {
      const { email, role, name } = req.body;
      if (!email) {
        return res.status(400).json({ error: "email is required" });
      }

      const session = sessionStore.addCircleInvite(req.params.id, email, role, name);
      res.json({
        success: true,
        session,
        shareableLink: `/circle/${req.params.id}`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to invite to circle" });
    }
  });

  // 11. Second Opinion Circle: Advisor response
  app.post(["/sessions/:id/circle-response", "/api/sessions/:id/circle-response"], (req, res) => {
    try {
      const { inviteId, response, perspective } = req.body;
      const session = sessionStore.recordCircleResponse(
        req.params.id,
        inviteId || `inv-${Date.now()}`,
        response,
        perspective || "neutral"
      );
      res.json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to record advisor response" });
    }
  });

  // 12. Decision Calibration Check-in (Revisit session after 30-90 days)
  app.post("/api/sessions/:id/calibrate", (req, res) => {
    try {
      const { actionTaken, reflection, accuracyRating } = req.body;
      const session = sessionStore.calibrateOutcome(
        req.params.id,
        actionTaken,
        reflection,
        accuracyRating || 5
      );
      res.json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to calibrate outcome" });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Crucible Tribunal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Crucible server:", err);
});
