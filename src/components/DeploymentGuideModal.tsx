import React, { useState } from "react";
import { Check, Copy, ExternalLink, Globe, HeartPulse, Server, ShieldCheck, Terminal, X } from "lucide-react";

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"railway" | "vercel" | "health">("railway");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isProbingHealth, setIsProbingHealth] = useState(false);

  if (!isOpen) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const probeHealth = async () => {
    try {
      setIsProbingHealth(true);
      const res = await fetch("/health");
      const data = await res.json();
      setHealthStatus({ ok: res.ok, status: res.status, data });
    } catch (err: any) {
      setHealthStatus({ ok: false, error: err.message });
    } finally {
      setIsProbingHealth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl border border-[#3A3A3C] bg-[#1A1A1C] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2C2C2E] bg-[#161618]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg border border-[#B08D57]/40 bg-[#242426] flex items-center justify-center text-[#B08D57]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F2EFE9] font-serif-report">
                Production Deployment Dossier (Railway + Vercel)
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Architectural blueprint and zero-downtime deployment instructions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#2C2C2E] bg-[#242426] flex items-center justify-center text-[#8E8E93] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#2C2C2E] bg-[#141416] px-5">
          <button
            onClick={() => setActiveTab("railway")}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "railway"
                ? "border-[#B08D57] text-[#D4AF37]"
                : "border-transparent text-[#8E8E93] hover:text-[#D1D1D6]"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Railway (API + DB)
          </button>

          <button
            onClick={() => setActiveTab("vercel")}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "vercel"
                ? "border-[#B08D57] text-[#D4AF37]"
                : "border-transparent text-[#8E8E93] hover:text-[#D1D1D6]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Vercel (Web Frontend)
          </button>

          <button
            onClick={() => {
              setActiveTab("health");
              probeHealth();
            }}
            className={`py-3 px-4 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "health"
                ? "border-[#B08D57] text-[#D4AF37]"
                : "border-transparent text-[#8E8E93] hover:text-[#D1D1D6]"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            Live /health Probe
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#D1D1D6]">
          {activeTab === "railway" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#F2EFE9] mb-1 font-serif-report">
                  1. Deploying API & Database on Railway
                </h4>
                <p className="text-[#8E8E93]">
                  Railway hosts the Express backend orchestrator and PostgreSQL database with Prisma ORM.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#141416] border border-[#2C2C2E] space-y-2">
                <div className="flex items-center justify-between text-[#B08D57] font-mono text-[11px] font-bold">
                  <span>Required Railway Environment Variables</span>
                  <button
                    onClick={() =>
                      copyText(
                        `NODE_ENV=production\nPORT=3000\nGEMINI_API_KEY=your_gemini_key_here\nDATABASE_URL=postgresql://user:password@host:port/railway\nJWT_SECRET=your_secret_here`,
                        "env-railway"
                      )
                    }
                    className="flex items-center gap-1 text-[10px] uppercase text-[#D4AF37] hover:underline"
                  >
                    {copiedKey === "env-railway" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "env-railway" ? "Copied" : "Copy All"}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-[#A1A1A6] bg-[#0E0E10] p-3 rounded overflow-x-auto">
{`NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_gemini_key_here
DATABASE_URL=postgresql://user:password@host:port/railway
JWT_SECRET=your_secret_here`}
                </pre>
              </div>

              <div className="p-4 rounded-lg bg-[#141416] border border-[#2C2C2E] space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#B08D57] font-bold block">
                  Railway Start Command & Healthcheck Path
                </span>
                <p className="text-[#A1A1A6]">
                  Build Command: <code className="text-[#E5E5EA] bg-[#242426] px-1.5 py-0.5 rounded">npm run build</code>
                </p>
                <p className="text-[#A1A1A6]">
                  Start Command: <code className="text-[#E5E5EA] bg-[#242426] px-1.5 py-0.5 rounded">npm start</code>
                </p>
                <p className="text-[#A1A1A6]">
                  Healthcheck Path: <code className="text-emerald-400 bg-[#242426] px-1.5 py-0.5 rounded">/health</code>
                </p>
              </div>
            </div>
          )}

          {activeTab === "vercel" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-[#F2EFE9] mb-1 font-serif-report">
                  2. Deploying Web Client on Vercel
                </h4>
                <p className="text-[#8E8E93]">
                  Vercel serves the Next.js / Vite SPA thin client with Edge CDN caching and serverless rewrites.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#141416] border border-[#2C2C2E] space-y-2">
                <div className="flex items-center justify-between text-[#B08D57] font-mono text-[11px] font-bold">
                  <span>Vercel Environment Variables</span>
                  <button
                    onClick={() =>
                      copyText(
                        `NEXT_PUBLIC_API_URL=https://crucible-api.up.railway.app\nVITE_API_URL=https://crucible-api.up.railway.app`,
                        "env-vercel"
                      )
                    }
                    className="flex items-center gap-1 text-[10px] uppercase text-[#D4AF37] hover:underline"
                  >
                    {copiedKey === "env-vercel" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === "env-vercel" ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-[#A1A1A6] bg-[#0E0E10] p-3 rounded overflow-x-auto">
{`NEXT_PUBLIC_API_URL=https://crucible-api.up.railway.app
VITE_API_URL=https://crucible-api.up.railway.app`}
                </pre>
              </div>

              <div className="p-4 rounded-lg bg-[#141416] border border-[#2C2C2E] space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#B08D57] font-bold block">
                  Thin Client Constraint Enforced
                </span>
                <p className="text-[#A1A1A6]">
                  Crucible's client never contacts Gemini or LLM providers directly. All persona orchestration and bias detection run exclusively on the Express API server.
                </p>
              </div>
            </div>
          )}

          {activeTab === "health" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#F2EFE9] mb-1 font-serif-report">
                    3. Live Tribunal /health Check
                  </h4>
                  <p className="text-[#8E8E93]">
                    Probing <code className="text-[#B08D57]">GET /health</code> on the current instance.
                  </p>
                </div>

                <button
                  onClick={probeHealth}
                  disabled={isProbingHealth}
                  className="px-3 py-1.5 rounded-lg border border-[#B08D57] bg-[#B08D57]/10 text-[#D4AF37] hover:bg-[#B08D57]/20 font-mono text-[11px] uppercase"
                >
                  {isProbingHealth ? "Probing..." : "Re-probe"}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#0E0E10] border border-[#2C2C2E] space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      healthStatus?.ok ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                  <span className="font-mono text-xs font-bold text-[#E5E5EA]">
                    Status: {healthStatus?.status || (healthStatus?.ok ? "200 OK" : "Connecting...")}
                  </span>
                </div>

                <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto bg-[#141416] p-3 rounded">
                  {JSON.stringify(healthStatus?.data || healthStatus, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2C2C2E] bg-[#161618] flex items-center justify-between text-xs">
          <span className="text-[#8E8E93] font-mono">
            Vercel + Railway Deploy-Ready Specification
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#242426] hover:bg-[#2E2E30] text-[#E5E5EA] font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
