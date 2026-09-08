import React, { useState } from "react";
import type { DecisionSession, SecondOpinionInvite } from "../types.js";
import { Check, Copy, HeartHandshake, Mail, MessageSquarePlus, Send, ShieldCheck, UserCheck, Users } from "lucide-react";

interface SecondOpinionCircleProps {
  session: DecisionSession;
  onInvite: (email: string, role: any, name?: string) => Promise<any>;
  onSubmitAdvisorResponse: (inviteId: string, response: string, perspective: any) => Promise<any>;
}

export const SecondOpinionCircle: React.FC<SecondOpinionCircleProps> = ({
  session,
  onInvite,
  onSubmitAdvisorResponse,
}) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"mentor" | "parent" | "friend" | "colleague" | "other">("mentor");
  const [isSending, setIsSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Advisor submission form state
  const [advisorName, setAdvisorName] = useState("");
  const [advisorRole, setAdvisorRole] = useState<"mentor" | "parent" | "friend" | "colleague" | "other">("mentor");
  const [advisorPerspective, setAdvisorPerspective] = useState<"concur_skeptic" | "concur_dreamer" | "neutral" | "alternate">("concur_skeptic");
  const [advisorTestimony, setAdvisorTestimony] = useState("");
  const [isSubmittingAdvisor, setIsSubmittingAdvisor] = useState(false);

  const shareableUrl = `${window.location.origin}/circle/${session.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isSending) return;

    try {
      setIsSending(true);
      await onInvite(inviteEmail.trim(), inviteRole, inviteName.trim() || undefined);
      setInviteEmail("");
      setInviteName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitAdvisorFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorTestimony.trim() || isSubmittingAdvisor) return;

    try {
      setIsSubmittingAdvisor(true);
      const inviteId = `inv-direct-${Date.now()}`;
      await onSubmitAdvisorResponse(inviteId, advisorTestimony.trim(), advisorPerspective);
      setAdvisorTestimony("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAdvisor(false);
    }
  };

  return (
    <div className="space-y-8" id="second-opinion-circle-section">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-[#B08D57]/40 bg-[#242426] flex items-center justify-center text-[#B08D57]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F2EFE9] font-serif-report tracking-wide">
              Second Opinion Circle
            </h2>
            <p className="text-xs text-[#A1A1A6]">
              Pull trusted human advisors (mentors, partners, colleagues) into the same rigorous tribunal format.
            </p>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-copy-circle-link"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B08D57]/40 bg-[#B08D57]/10 hover:bg-[#B08D57]/20 text-xs font-medium text-[#D4AF37] transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? "Link Copied!" : "Copy Shareable Link"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Invite Real People */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E]">
            <h3 className="text-sm font-semibold text-[#F2EFE9] font-serif-report uppercase tracking-wider mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#B08D57]" />
              Invite an Advisor
            </h3>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#A1A1A6] mb-1">
                  Advisor Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="w-full text-xs rounded-lg border border-[#3A3A3C] bg-[#141416] p-2.5 text-[#E5E5EA] placeholder-[#636366] focus:outline-none focus:border-[#B08D57]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A1A1A6] mb-1">
                  Advisor Email *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. mentor@domain.com"
                  className="w-full text-xs rounded-lg border border-[#3A3A3C] bg-[#141416] p-2.5 text-[#E5E5EA] placeholder-[#636366] focus:outline-none focus:border-[#B08D57]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A1A1A6] mb-1">
                  Relationship Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-[#3A3A3C] bg-[#141416] p-2.5 text-[#E5E5EA] focus:outline-none focus:border-[#B08D57]"
                >
                  <option value="mentor">Executive Mentor / Advisor</option>
                  <option value="colleague">Industry Peer / Colleague</option>
                  <option value="parent">Parent / Family Elder</option>
                  <option value="friend">Close Friend</option>
                  <option value="other">Other External Confidant</option>
                </select>
              </div>

              <button
                id="btn-send-circle-invite"
                type="submit"
                disabled={isSending || !inviteEmail.trim()}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-lg bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Dispatching..." : "Send Tribunal Summons"}</span>
              </button>
            </form>
          </div>

          {/* List of Sent Invites */}
          <div className="p-6 rounded-xl border border-[#2C2C2E] bg-[#18181A] space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8E8E93] block">
              Active Circle Participants ({session.circleInvites.length})
            </span>

            {session.circleInvites.length === 0 ? (
              <p className="text-xs text-[#636366] italic py-2">
                No human advisors invited yet. Send a link or email above.
              </p>
            ) : (
              <div className="space-y-2.5">
                {session.circleInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-lg border border-[#3A3A3C] bg-[#1C1C1E] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#E5E5EA] block">
                        {inv.inviteeName || inv.inviteeEmail}
                      </span>
                      <span className="text-[10px] text-[#8C6A36] uppercase font-mono">
                        Role: {inv.inviteeRole}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        inv.response
                          ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/40"
                          : "bg-amber-950/50 text-amber-300 border border-amber-800/40"
                      }`}
                    >
                      {inv.response ? "Testimony Received" : "Pending Response"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Advisor Intake & Submitted Perspectives */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Advisor Perspective Input Form */}
          <div className="p-6 rounded-xl border border-[#3A3A3C] bg-[#1C1C1E]">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B08D57] font-semibold mb-1">
              <MessageSquarePlus className="w-4 h-4" />
              Direct Human Advisor Cross-Examination
            </div>
            <h3 className="text-lg font-serif-report font-semibold text-[#F2EFE9] mb-4">
              Enter Advisor Testimony Into Official Case Docket
            </h3>

            <form onSubmit={handleSubmitAdvisorFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#A1A1A6] mb-1">
                  Which Tribunal Inquisitor Do You Lean Toward?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdvisorPerspective("concur_skeptic")}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                      advisorPerspective === "concur_skeptic"
                        ? "border-[#7A2E2E] bg-[#7A2E2E]/20 text-[#F08080] font-semibold"
                        : "border-[#3A3A3C] bg-[#141416] text-[#A1A1A6]"
                    }`}
                  >
                    ⚖️ Concur with Skeptic
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvisorPerspective("concur_dreamer")}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                      advisorPerspective === "concur_dreamer"
                        ? "border-[#B08D57] bg-[#B08D57]/20 text-[#D4AF37] font-semibold"
                        : "border-[#3A3A3C] bg-[#141416] text-[#A1A1A6]"
                    }`}
                  >
                    🔥 Concur with Dreamer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvisorPerspective("neutral")}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                      advisorPerspective === "neutral"
                        ? "border-[#8C6A36] bg-[#8C6A36]/20 text-[#E5E5EA] font-semibold"
                        : "border-[#3A3A3C] bg-[#141416] text-[#A1A1A6]"
                    }`}
                  >
                    ⏳ Balanced / Neutral
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvisorPerspective("alternate")}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                      advisorPerspective === "alternate"
                        ? "border-[#6B7280] bg-[#6B7280]/20 text-white font-semibold"
                        : "border-[#3A3A3C] bg-[#141416] text-[#A1A1A6]"
                    }`}
                  >
                    👁️ Third Vector
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#A1A1A6] mb-1">
                  Advisor Testimony & Blind Spot Warnings *
                </label>
                <textarea
                  required
                  rows={4}
                  value={advisorTestimony}
                  onChange={(e) => setAdvisorTestimony(e.target.value)}
                  placeholder="State your frank assessment of their reasoning. What are they ignoring or underestimating? What would you regret seeing them not do?"
                  className="w-full text-xs sm:text-sm rounded-lg border border-[#3A3A3C] bg-[#141416] p-3 text-[#E5E5EA] placeholder-[#636366] focus:outline-none focus:border-[#B08D57]"
                />
              </div>

              <button
                id="btn-submit-advisor-opinion"
                type="submit"
                disabled={!advisorTestimony.trim() || isSubmittingAdvisor}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#B08D57] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold tracking-wider uppercase transition-colors disabled:opacity-50"
              >
                {isSubmittingAdvisor ? "Recording Testimony..." : "Record Human Testimony"}
              </button>
            </form>
          </div>

          {/* Recorded Testimonies from Real Advisors */}
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8E8E93] block">
              Recorded Human Counsel
            </span>

            {session.circleInvites.filter((i) => i.response).length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-[#3A3A3C] bg-[#18181A] text-center text-xs text-[#8E8E93]">
                No human testimony recorded for this session yet. Submit one above or share the invite link.
              </div>
            ) : (
              session.circleInvites
                .filter((i) => i.response)
                .map((inv) => (
                  <div
                    key={inv.id}
                    className="p-5 rounded-xl border border-[#3A3A3C] bg-[#1E1E20] space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-2.5">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#B08D57]" />
                        <span className="text-sm font-semibold text-[#F2EFE9] font-serif-report">
                          {inv.inviteeName || "Trusted Advisor"}
                        </span>
                        <span className="text-[10px] font-mono text-[#8C6A36] uppercase">
                          ({inv.inviteeRole})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#A1A1A6]">
                        {inv.submittedAt ? new Date(inv.submittedAt).toLocaleDateString() : "Entered"}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#D1D1D6] leading-relaxed italic">
                      "{inv.response}"
                    </p>

                    <div className="pt-2 text-[10px] font-mono uppercase text-[#B08D57]">
                      Alignment: {inv.perspective?.replace("_", " ")}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
