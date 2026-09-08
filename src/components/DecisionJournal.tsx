import React, { useState } from "react";
import type { DecisionSession } from "../types.js";
import { BIAS_NAMES } from "../../packages/shared/src/schemas.js";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  History,
  Search,
  ShieldAlert,
  Star,
} from "lucide-react";

interface DecisionJournalProps {
  sessions: DecisionSession[];
  onSelectSession: (sessionId: string) => void;
  onCalibrate: (sessionId: string, actionTaken: any, reflection: string, rating: number) => Promise<any>;
}

export const DecisionJournal: React.FC<DecisionJournalProps> = ({
  sessions,
  onSelectSession,
  onCalibrate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRigor, setFilterRigor] = useState<string>("all");
  const [calibratingSessionId, setCalibratingSessionId] = useState<string | null>(null);
  const [actionTaken, setActionTaken] = useState<"proceeded" | "halted" | "pivoted">("proceeded");
  const [reflection, setReflection] = useState("");
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [isSubmittingCalibration, setIsSubmittingCalibration] = useState(false);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.decisionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.stakes && s.stakes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterRigor === "high") {
      return (s.verdictReport?.decisionQualityScore || 0) >= 75;
    } else if (filterRigor === "moderate") {
      const sc = s.verdictReport?.decisionQualityScore || 0;
      return sc >= 50 && sc < 75;
    } else if (filterRigor === "vulnerable") {
      return (s.verdictReport?.decisionQualityScore || 0) < 50;
    }

    return true;
  });

  const handleCalibrationSubmit = async (e: React.FormEvent, sessionId: string) => {
    e.preventDefault();
    if (isSubmittingCalibration) return;

    try {
      setIsSubmittingCalibration(true);
      await onCalibrate(sessionId, actionTaken, reflection, accuracyRating);
      setCalibratingSessionId(null);
      setReflection("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCalibration(false);
    }
  };

  return (
    <div className="space-y-6" id="decision-journal-section">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[#B08D57]/40 bg-[#242426] flex items-center justify-center text-[#B08D57]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F2EFE9] font-serif-report tracking-wide">
              The Decision Journal & Calibration Archive
            </h2>
            <p className="text-xs text-[#A1A1A6]">
              Private vault of past tribunal cross-examinations. Calibrate how your reasoning held up over time.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8E8E93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case files..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#3A3A3C] bg-[#141416] text-[#E5E5EA] placeholder-[#636366] focus:outline-none focus:border-[#B08D57]"
            />
          </div>

          <select
            value={filterRigor}
            onChange={(e) => setFilterRigor(e.target.value)}
            className="text-xs rounded-lg border border-[#3A3A3C] bg-[#141416] px-2.5 py-1.5 text-[#E5E5EA] focus:outline-none focus:border-[#B08D57]"
          >
            <option value="all">All Rigor Tiers</option>
            <option value="high">High Rigor (75+)</option>
            <option value="moderate">Moderate (50-74)</option>
            <option value="vulnerable">Vulnerable (&lt;50)</option>
          </select>
        </div>
      </div>

      {/* Session Cards List */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#3A3A3C] bg-[#18181A] text-xs text-[#8E8E93]">
          No archived tribunal sessions found matching the query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSessions.map((session) => {
            const score = session.verdictReport?.decisionQualityScore ?? 65;
            const isCalibrating = calibratingSessionId === session.id;

            return (
              <div
                key={session.id}
                id={`journal-card-${session.id}`}
                className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1E1E20] hover:border-[#B08D57]/60 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 border-b border-[#2C2C2E] pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#8C6A36] font-semibold uppercase tracking-wider text-[11px]">
                        {session.verdictReport?.docketNumber || `CRU-${session.id.slice(0, 8)}`}
                      </span>
                      <span className="text-[#636366]">•</span>
                      <span className="text-[#8E8E93] text-[11px]">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          score >= 75
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                            : score >= 50
                            ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                            : "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                        }`}
                      >
                        Score: {score}/100
                      </span>
                    </div>
                  </div>

                  {/* Decision Text */}
                  <h3 className="text-base font-serif-report font-semibold text-[#F2EFE9] mt-3 leading-snug">
                    "{session.decisionText}"
                  </h3>

                  {session.stakes && (
                    <p className="text-xs text-[#8E8E93] mt-2 line-clamp-2">
                      <strong className="text-[#A1A1A6]">Stakes:</strong> {session.stakes}
                    </p>
                  )}

                  {/* Biases Badges */}
                  {session.biasFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#2C2C2E]/60">
                      {session.biasFlags.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#2A1D1D] text-[#F08080] border border-[#7A2E2E]/40"
                        >
                          {BIAS_NAMES[b.bias]}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Calibrated Outcome if already logged */}
                  {session.calibratedOutcome && (
                    <div className="mt-4 p-3 rounded-lg bg-[#141416] border border-[#8C6A36]/40 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#B08D57] font-mono text-[10px] uppercase font-bold">
                        <span>Calibrated Outcome ({session.calibratedOutcome.actionTaken})</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: session.calibratedOutcome.accuracyRating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#D1D1D6] italic">
                        "{session.calibratedOutcome.reflection}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="pt-3 border-t border-[#2C2C2E]">
                  {!isCalibrating ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectSession(session.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-white transition-colors"
                      >
                        <span>Inspect Docket & Verdict</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {!session.calibratedOutcome && (
                        <button
                          onClick={() => setCalibratingSessionId(session.id)}
                          className="text-[11px] font-mono uppercase text-[#8E8E93] hover:text-[#B08D57] transition-colors"
                        >
                          Log Real-Life Outcome
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Outcome Calibration Form */
                    <form
                      onSubmit={(e) => handleCalibrationSubmit(e, session.id)}
                      className="space-y-3 bg-[#141416] p-3 rounded-lg border border-[#B08D57]/40"
                    >
                      <span className="text-[10px] font-mono uppercase text-[#B08D57] font-bold block">
                        Calibrate Decision (After-Action Review)
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        {(["proceeded", "halted", "pivoted"] as const).map((act) => (
                          <button
                            key={act}
                            type="button"
                            onClick={() => setActionTaken(act)}
                            className={`p-1.5 rounded text-[10px] font-mono uppercase tracking-wider text-center border ${
                              actionTaken === act
                                ? "bg-[#B08D57]/20 border-[#B08D57] text-[#D4AF37] font-bold"
                                : "bg-[#1E1E20] border-[#3A3A3C] text-[#8E8E93]"
                            }`}
                          >
                            {act}
                          </button>
                        ))}
                      </div>

                      <textarea
                        required
                        rows={2}
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="What happened in reality? Did the Skeptic's warnings or Dreamer's upside manifest?"
                        className="w-full text-xs rounded border border-[#3A3A3C] bg-[#1E1E20] p-2 text-[#E5E5EA] placeholder-[#636366] focus:outline-none focus:border-[#B08D57]"
                      />

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[#A1A1A6]">Tribunal Accuracy Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setAccuracyRating(num)}
                              className={`w-5 h-5 text-[10px] rounded flex items-center justify-center font-bold ${
                                accuracyRating >= num
                                  ? "bg-amber-500 text-[#141416]"
                                  : "bg-[#2C2C2E] text-[#8E8E93]"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setCalibratingSessionId(null)}
                          className="text-[11px] text-[#8E8E93] hover:text-white px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingCalibration || !reflection.trim()}
                          className="text-xs bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] px-3 py-1 rounded font-semibold disabled:opacity-50"
                        >
                          Save Calibration
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
