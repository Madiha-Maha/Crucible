import React from "react";
import type { TribunalAnalytics as AnalyticsType } from "../types.js";
import { BIAS_NAMES, PERSONA_CONFIG } from "../../packages/shared/src/schemas.js";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Flame,
  PieChart,
  Scale,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";

interface TribunalAnalyticsProps {
  analytics: AnalyticsType;
}

export const TribunalAnalytics: React.FC<TribunalAnalyticsProps> = ({ analytics }) => {
  const totalBiases =
    Object.values(analytics.biasDistribution).reduce<number>(
      (acc, val) => acc + (Number(val) || 0),
      0
    ) || 1;

  return (
    <div className="space-y-8" id="tribunal-analytics-section">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[#B08D57]/40 bg-[#242426] flex items-center justify-center text-[#B08D57]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F2EFE9] font-serif-report tracking-wide">
              Tribunal Real-Time Telemetry & Cognitive Analytics
            </h2>
            <p className="text-xs text-[#A1A1A6]">
              Aggregate reasoning quality metrics, cognitive distortion prevalence, and persona cross-examination pressure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Tribunal Stream Active
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#3A3A3C] bg-[#1E1E20] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">
            Total Cases Adjudicated
          </span>
          <div className="text-2xl font-bold font-serif-report text-[#F2EFE9] flex items-center gap-2">
            <span>{analytics.totalSessions}</span>
            <span className="text-xs text-[#8C6A36] font-mono font-normal">dockets</span>
          </div>
          <p className="text-[11px] text-[#A1A1A6] pt-1">
            Complete chamber sessions with full verdicts.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#3A3A3C] bg-[#1E1E20] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">
            Mean Reasoning Rigor Score
          </span>
          <div className="text-2xl font-bold font-serif-report text-[#D4AF37] flex items-center gap-2">
            <span>{analytics.avgDecisionScore}</span>
            <span className="text-xs text-[#8E8E93] font-mono font-normal">/100</span>
          </div>
          <p className="text-[11px] text-[#A1A1A6] pt-1">
            Certified objectivity and downside mitigation.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#3A3A3C] bg-[#1E1E20] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">
            Chief Inquisitor (Highest Friction)
          </span>
          <div className="text-2xl font-bold font-serif-report text-[#E08A8A] flex items-center gap-1.5">
            <span>{PERSONA_CONFIG[analytics.mostChallengingPersona].name}</span>
          </div>
          <p className="text-[11px] text-[#A1A1A6] pt-1">
            Most frequent source of adversarial rebuttals.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#3A3A3C] bg-[#1E1E20] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93]">
            Cognitive Biases Intercepted
          </span>
          <div className="text-2xl font-bold font-serif-report text-[#F2EFE9] flex items-center gap-2">
            <span>{totalBiases}</span>
            <span className="text-xs text-rose-400 font-mono font-normal">verbatim citations</span>
          </div>
          <p className="text-[11px] text-[#A1A1A6] pt-1">
            Directly cited from user reasoning transcripts.
          </p>
        </div>
      </div>

      {/* Two Analytical Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cognitive Bias Distribution */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] space-y-5">
          <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F2EFE9] font-serif-report">
              <ShieldAlert className="w-4 h-4 text-[#B08D57]" />
              Cognitive Distortion Breakdown Across Sessions
            </div>
            <span className="text-[10px] font-mono text-[#8E8E93] uppercase">
              Frequency Rank
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(analytics.biasDistribution).map(([biasKey, count]) => {
              const numericCount = Number(count) || 0;
              const pct = Math.round((numericCount / totalBiases) * 100);
              const name = BIAS_NAMES[biasKey as any] || biasKey;

              return (
                <div key={biasKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#E5E5EA]">{name}</span>
                    <span className="font-mono text-[#A1A1A6]">
                      {count} flags ({pct}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#141416] overflow-hidden border border-[#2C2C2E]">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#8C6A36] to-[#B08D57]"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Persona Friction Index & Rigor Distribution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Persona Friction Index */}
          <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F2EFE9] font-serif-report border-b border-[#2C2C2E] pb-3">
              <Flame className="w-4 h-4 text-[#7A2E2E]" />
              Inquisitor Adversarial Friction Index
            </div>

            <div className="space-y-3 text-xs">
              {Object.entries(analytics.personaFrictionIndex).map(([personaKey, indexVal]) => {
                const conf = PERSONA_CONFIG[personaKey as any];

                return (
                  <div key={personaKey} className="flex items-center justify-between p-2.5 rounded-lg bg-[#141416] border border-[#2C2C2E]">
                    <div className="flex items-center gap-2">
                      <span>{conf.avatarSymbol}</span>
                      <span className="font-medium text-[#E5E5EA]">{conf.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#2C2C2E] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#B08D57]"
                          style={{ width: `${indexVal}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-[#D4AF37] font-bold">
                        {indexVal}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rigor Tiers Distribution */}
          <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E93] block">
              Decision Quality Distribution
            </span>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-[#141416] border border-[#2E7A4A]/40">
                <span className="text-xl font-bold font-serif-report text-emerald-400 block">
                  {analytics.verdictDistribution.highRigor}
                </span>
                <span className="text-[9px] font-mono text-[#A1A1A6] uppercase">
                  High Rigor (75+)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#141416] border border-[#8C6A36]/40">
                <span className="text-xl font-bold font-serif-report text-amber-400 block">
                  {analytics.verdictDistribution.moderateRigor}
                </span>
                <span className="text-[9px] font-mono text-[#A1A1A6] uppercase">
                  Moderate (50-74)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#141416] border border-[#7A2E2E]/40">
                <span className="text-xl font-bold font-serif-report text-rose-400 block">
                  {analytics.verdictDistribution.vulnerableRigor}
                </span>
                <span className="text-[9px] font-mono text-[#A1A1A6] uppercase">
                  Vulnerable (&lt;50)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
