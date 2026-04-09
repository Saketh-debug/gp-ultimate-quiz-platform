import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL;

/* ── Keyframes injected once ── */
const STYLES = `
  @keyframes podium-rise {
    from { transform: scaleY(0); opacity: 0; }
    to   { transform: scaleY(1); opacity: 1; }
  }
  @keyframes crown-float {
    0%, 100% { transform: translateY(0px) rotate(-5deg); }
    50%       { transform: translateY(-6px) rotate(5deg); }
  }
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.25); }
    50%       { box-shadow: 0 0 45px rgba(255,215,0,0.55); }
  }
  @keyframes silver-pulse {
    0%, 100% { box-shadow: 0 0 16px rgba(226,232,240,0.2); }
    50%       { box-shadow: 0 0 36px rgba(226,232,240,0.45); }
  }
  @keyframes bronze-pulse {
    0%, 100% { box-shadow: 0 0 14px rgba(205,127,50,0.2); }
    50%       { box-shadow: 0 0 30px rgba(205,127,50,0.45); }
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50%       { opacity: 0.05; transform: scale(0.5); }
  }
  @keyframes slide-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nebula-drift-a {
    0%   { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    33%  { transform: translate(-48%, -52%) scale(1.08) rotate(4deg); }
    66%  { transform: translate(-52%, -48%) scale(0.95) rotate(-3deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes nebula-drift-b {
    0%   { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
    33%  { transform: translate(-52%, -48%) scale(0.92) rotate(-5deg); }
    66%  { transform: translate(-48%, -52%) scale(1.1) rotate(3deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes shoot {
    0%   { transform: translateX(-200px) scaleX(0); opacity: 0; }
    5%   { opacity: 1; transform: translateX(-100px) scaleX(1); }
    80%  { opacity: 0.7; }
    100% { transform: translateX(110vw) scaleX(1); opacity: 0; }
  }
  @keyframes stats-appear {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes row-highlight-pulse {
    0%, 100% { box-shadow: inset 0 0 0 1px rgba(244,164,96,0.3); }
    50%       { box-shadow: inset 0 0 0 1px rgba(244,164,96,0.7); }
  }
  @keyframes rank-badge-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(249,115,22,0.3); }
    50%       { box-shadow: 0 0 20px rgba(249,115,22,0.7); }
  }
  @keyframes form-fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Stars — full viewport spread ── */
const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  s: Math.random() * 1.8 + 0.3,
  o: Math.random() * 0.5 + 0.15,
  d: Math.random() * 5,
}));

/* ── Shooting stars config ── */
const SHOOTS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  top: 5 + Math.random() * 40,
  delay: i * 3.5 + Math.random() * 2,
  duration: 2.5 + Math.random() * 1.5,
  width: 80 + Math.random() * 80,
}));

/* ── Medal config ── */
const MEDAL = {
  gold: {
    border: "#FFD700",
    glow: "glow-pulse 2.8s ease-in-out infinite",
    bg: "linear-gradient(135deg, rgba(255,215,0,0.18) 0%, rgba(255,160,0,0.06) 100%)",
    label: "bg-gradient-to-r from-[#FFD700] to-[#FFA500]",
    emoji: "🥇",
    rank: "1ST",
    height: 200,
  },
  silver: {
    border: "#CBD5E1",
    glow: "silver-pulse 2.8s ease-in-out infinite",
    bg: "linear-gradient(135deg, rgba(203,213,225,0.14) 0%, rgba(148,163,184,0.06) 100%)",
    label: "bg-gradient-to-r from-[#CBD5E1] to-[#94A3B8]",
    emoji: "🥈",
    rank: "2ND",
    height: 160,
  },
  bronze: {
    border: "#CD7F32",
    glow: "bronze-pulse 2.8s ease-in-out infinite",
    bg: "linear-gradient(135deg, rgba(205,127,50,0.14) 0%, rgba(161,100,36,0.06) 100%)",
    label: "bg-gradient-to-r from-[#CD7F32] to-[#A0622A]",
    emoji: "🥉",
    rank: "3RD",
    height: 130,
  },
};

/* ──────────────────────────────────────────
   PodiumCard component
────────────────────────────────────────── */
function PodiumCard({ team, score, type, index }) {
  const m = MEDAL[type];
  const isGold = type === "gold";

  return (
    <div
      className="flex flex-col items-center"
      style={{
        animation: `slide-in 0.6s ease both`,
        animationDelay: `${index * 0.12}s`,
      }}
    >
      {isGold && (
        <div className="text-4xl mb-2" style={{ animation: "crown-float 3s ease-in-out infinite" }}>
          👑
        </div>
      )}

      <div
        className="flex items-center justify-center rounded-full font-black text-white mb-3"
        style={{
          width: isGold ? 96 : 80,
          height: isGold ? 96 : 80,
          fontSize: isGold ? 36 : 28,
          background: m.bg,
          border: `3px solid ${m.border}`,
          animation: m.glow,
          boxShadow: `0 0 20px ${m.border}44`,
        }}
      >
        {m.emoji}
      </div>

      <p
        className={`font-black text-center mb-1 ${isGold ? "text-lg" : "text-base"}`}
        style={{ maxWidth: 130, lineHeight: 1.2 }}
      >
        {team}
      </p>

      <p className="text-[#f4a460] font-bold text-sm mb-3">{score} pts</p>

      <div
        className="w-36 rounded-t-2xl flex items-end justify-center pb-3 relative overflow-hidden"
        style={{
          height: m.height,
          background: m.bg,
          border: `1px solid ${m.border}44`,
          borderBottom: "none",
          transformOrigin: "bottom",
          animation: "podium-rise 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
          animationDelay: `${index * 0.12 + 0.2}s`,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${m.border}88, transparent)` }}
        />
        <span className={`text-xs font-black tracking-widest px-3 py-1 rounded-full text-black ${m.label}`}>
          {m.rank}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Table Row — rank 4+
────────────────────────────────────────── */
function Row({ rank, name, rapidfire, cascade, dsa, total, delay, isCurrentUser }) {
  return (
    <tr
      className="border-b border-white/5 transition-colors duration-200 group"
      style={{
        animation: `slide-in 0.5s ease both`,
        animationDelay: `${delay}s`,
        background: isCurrentUser
          ? "linear-gradient(90deg, rgba(249,115,22,0.08) 0%, rgba(244,164,96,0.05) 100%)"
          : "transparent",
        ...(isCurrentUser ? { animation: "row-highlight-pulse 2.5s ease-in-out infinite" } : {}),
      }}
    >
      <td className="px-6 py-5 w-16 text-center">
        {isCurrentUser ? (
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm text-black"
            style={{
              background: "linear-gradient(135deg,#f97316,#f4a460)",
              animation: "rank-badge-glow 2s ease-in-out infinite",
            }}
          >
            {rank}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 font-black text-sm text-white/60 group-hover:text-[#f4a460] transition-colors">
            {rank}
          </span>
        )}
      </td>

      <td className="px-6 py-5 font-bold">
        <div className="flex items-center gap-3">
          <span
            className={
              isCurrentUser
                ? "text-[#f4a460]"
                : "text-white group-hover:text-[#f4a460] transition-colors"
            }
          >
            {name}
          </span>
          {isCurrentUser && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-black"
              style={{ background: "linear-gradient(135deg,#f97316,#f4a460)" }}
            >
              YOU
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-5 text-right font-mono text-white/55">{rapidfire}</td>
      <td className="px-6 py-5 text-right font-mono text-white/55">{cascade}</td>
      <td className="px-6 py-5 text-right font-mono text-white/55">{dsa}</td>

      <td className="px-6 py-5 text-right">
        <span className={`font-black text-base ${isCurrentUser ? "text-[#f4a460]" : "text-white"}`}>
          {total}
        </span>
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────
   User Stats Card (top-right header widget)
────────────────────────────────────────── */
function UserStatsCard({ teams, currentTeamName }) {
  const teamIndex = teams.findIndex(
    (t) => t.team_name?.toLowerCase() === currentTeamName?.toLowerCase()
  );

  if (teamIndex === -1) return null;

  const userData = teams[teamIndex];
  const rank = teamIndex + 1;

  const getRankLabel = (r) => {
    if (r === 1) return "🥇 1st";
    if (r === 2) return "🥈 2nd";
    if (r === 3) return "🥉 3rd";
    return `#${r}`;
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
      style={{
        background: "rgba(15, 5, 25, 0.75)",
        border: "1px solid rgba(249,115,22,0.35)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 24px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
        animation: "stats-appear 0.5s ease both",
      }}
    >
      {/* Rank badge */}
      <div className="flex flex-col items-center justify-center min-w-[48px]">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(244,164,96,0.6)" }}>
          Rank
        </span>
        <span
          className="text-lg font-black"
          style={{ color: "#f4a460", textShadow: "0 0 12px rgba(249,115,22,0.6)" }}
        >
          {getRankLabel(rank)}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-white/10" />

      {/* Team name */}
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(244,164,96,0.55)" }}>
          Your Team
        </span>
        <span className="text-sm font-black text-white truncate max-w-[120px]">{userData.team_name}</span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-white/10" />

      {/* Score breakdown */}
      <div className="flex items-center gap-3">
        {[
          { label: "RF", value: userData.rapidfire_score, color: "#f97316" },
          { label: "CS", value: userData.cascade_score, color: "#a78bfa" },
          { label: "DSA", value: userData.dsa_score, color: "#34d399" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
              {label}
            </span>
            <span className="text-xs font-black" style={{ color }}>
              {value}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10" />

        {/* Total */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(244,164,96,0.55)" }}>
            Total
          </span>
          <span
            className="text-base font-black"
            style={{ color: "#f4a460", textShadow: "0 0 10px rgba(249,115,22,0.5)" }}
          >
            {userData.total_score}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Shared page background + cosmetic layers
────────────────────────────────────────── */
function PageBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-30" style={{ background: "#08000e" }} />
      <div
        className="fixed pointer-events-none -z-20"
        style={{
          top: "35%", left: "25%",
          width: 800, height: 750,
          background: "radial-gradient(ellipse, rgba(192,40,48,0.32) 0%, rgba(140,20,35,0.16) 45%, transparent 72%)",
          animation: "nebula-drift-a 22s ease-in-out infinite",
          transform: "translate(-50%,-50%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="fixed pointer-events-none -z-20"
        style={{
          top: "55%", left: "75%",
          width: 700, height: 650,
          background: "radial-gradient(ellipse, rgba(100,40,160,0.28) 0%, rgba(60,15,100,0.12) 50%, transparent 75%)",
          animation: "nebula-drift-b 28s ease-in-out infinite",
          transform: "translate(-50%,-50%)",
          filter: "blur(10px)",
        }}
      />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(4,0,10,0.65) 100%)" }}
      />
      <div
        className="fixed inset-x-0 top-0 h-32 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(4,0,10,0.75), transparent)" }}
      />
      <div
        className="fixed inset-x-0 bottom-0 h-40 -z-10 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(4,0,10,0.85), transparent)" }}
      />
      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.s, height: s.s,
              opacity: s.o,
              animation: `twinkle ${3 + s.d}s ease-in-out infinite`,
              animationDelay: `${s.d}s`,
            }}
          />
        ))}
      </div>
      {/* Shooting stars */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {SHOOTS.map((sh) => (
          <div
            key={sh.id}
            style={{
              position: "absolute",
              top: `${sh.top}%`,
              left: 0,
              width: sh.width,
              height: 2,
              background: "linear-gradient(to right, transparent, rgba(244,164,96,0.9) 40%, rgba(255,255,255,0.95) 60%, transparent)",
              borderRadius: 9999,
              animation: `shoot ${sh.duration}s linear infinite`,
              animationDelay: `${sh.delay}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ──────────────────────────────────────────
   FeedbackForm — shown when feedbackMode is ON
   Edge cases handled:
   - Score banner null-guards when team not in leaderboard
   - All required fields validated client-side before submit
   - 409 (already submitted) treated as success
   - feedbackMode toggled OFF while form is open: form stays mounted
     (feedbackMode is only read at initial mount / on the render check)
────────────────────────────────────────── */
function FeedbackForm({ teams, currentTeamName, onSubmitted }) {
  const [form, setForm] = useState({
    participant_name: "",
    institution: "",
    q_event_flow: "",
    q_hospitality: "",
    q_fav_part: "",
    q_overall_rating: "",
    q_suggestions: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Find this team's scores for the banner
  const teamIndex = teams.findIndex(
    (t) => t.team_name?.toLowerCase() === currentTeamName?.toLowerCase()
  );
  const userData = teamIndex !== -1 ? teams[teamIndex] : null;
  const rank = teamIndex !== -1 ? teamIndex + 1 : null;

  const getRankLabel = (r) => {
    if (!r) return "—";
    if (r === 1) return "🥇 1st";
    if (r === 2) return "🥈 2nd";
    if (r === 3) return "🥉 3rd";
    return `#${r}`;
  };

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function validate() {
    const required = [
      "participant_name", "institution", "q_event_flow",
      "q_hospitality", "q_overall_rating", "q_suggestions",
    ];
    const newErrors = {};
    required.forEach((f) => {
      if (!form[f] || form[f].toString().trim() === "") newErrors[f] = true;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${BACKEND_URL}/admin/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_name: currentTeamName,
          ...form,
          q_overall_rating: parseInt(form.q_overall_rating),
        }),
      });
      const data = await res.json();

      if (res.ok || data.alreadySubmitted) {
        // Success OR already submitted — either way, move to leaderboard
        localStorage.setItem("feedback_submitted", currentTeamName);
        onSubmitted();
      } else {
        setSubmitError(data.error || "Submission failed. Please try again.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = (field) => ({
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${errors[field] ? "rgba(239,68,68,0.7)" : "rgba(249,115,22,0.2)"}`,
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    transition: "border-color 0.2s",
    resize: "vertical",
  });

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    color: "rgba(244,164,96,0.85)",
    letterSpacing: "0.03em",
  };

  const RATINGS = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
  ];

  return (
    <div
      className="min-h-screen text-white"
      style={{ ...pageStyle, fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <style>{STYLES}</style>
      <PageBackground />

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 h-20 gap-4"
        style={{
          background: "rgba(6, 0, 16, 0.72)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(249,115,22,0.12)",
        }}
      >
        <div className="flex items-center gap-4 shrink-0">
          <div
            className="flex items-center justify-center rounded-2xl w-14 h-14"
            style={{
              background: "linear-gradient(135deg,#d15b2c,#7c2114)",
              boxShadow: "0 0 20px rgba(209,91,44,0.45)",
            }}
          >
            <span className="material-symbols-outlined text-2xl text-white">rocket_launch</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Grand <span style={{ color: "#f4a460" }}>Feedback</span>
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-6 pb-20 pt-10">

        {/* ── Score Banner ── */}
        {userData ? (
          <div
            className="rounded-2xl p-5 mb-8 flex flex-wrap items-center gap-5"
            style={{
              background: "rgba(8,0,18,0.7)",
              border: "1px solid rgba(249,115,22,0.2)",
              backdropFilter: "blur(24px)",
              animation: "form-fade-in 0.5s ease both",
            }}
          >
            <div className="flex flex-col items-center min-w-[56px]">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "rgba(244,164,96,0.6)" }}>Rank</span>
              <span className="text-2xl font-black" style={{ color: "#f4a460" }}>{getRankLabel(rank)}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "rgba(244,164,96,0.55)" }}>Your Team</span>
              <span className="text-base font-black text-white">{userData.team_name}</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex items-center gap-4">
              {[
                { label: "RF", value: userData.rapidfire_score, color: "#f97316" },
                { label: "CS", value: userData.cascade_score, color: "#a78bfa" },
                { label: "DSA", value: userData.dsa_score, color: "#34d399" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
                  <span className="text-sm font-black" style={{ color }}>{value}</span>
                </div>
              ))}
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(244,164,96,0.55)" }}>Total</span>
                <span className="text-lg font-black" style={{ color: "#f4a460" }}>{userData.total_score}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Team not found in leaderboard — still show form, no score banner */
          <div
            className="rounded-2xl p-4 mb-8 text-center"
            style={{
              background: "rgba(8,0,18,0.5)",
              border: "1px solid rgba(249,115,22,0.1)",
            }}
          >
            <p className="text-sm font-bold" style={{ color: "rgba(244,164,96,0.55)" }}>
              Your score will appear on the leaderboard once the results are finalised.
            </p>
          </div>
        )}

        {/* ── Form Card ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(8,0,18,0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(249,115,22,0.1)",
            boxShadow: "0 8px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            animation: "form-fade-in 0.6s ease 0.1s both",
          }}
        >
          {/* Card header */}
          <div
            className="px-8 py-6 border-b"
            style={{ borderColor: "rgba(249,115,22,0.1)", background: "rgba(0,0,0,0.3)" }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: "rgba(244,164,96,0.55)" }}>
              Post-Event Survey
            </p>
            <h2 className="text-2xl font-black uppercase" style={{ letterSpacing: "-0.02em" }}>
              Share Your Experience
            </h2>
            <h3>
              Share your details and feedback to get certificates.
            </h3>
          </div>

          <img src="/gprimeqr.png" alt="" />
        </div>
      </main>

      <footer
        className="border-t py-8 px-10"
        style={{
          background: "rgba(4,0,12,0.6)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="max-w-5xl mx-auto flex justify-between items-center text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <p>© 2025 Grand Prix Quiz Platform</p>
          <p style={{ color: "rgba(244,164,96,0.4)" }}>🚀 GPrime Season 1</p>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Leaderboard page
────────────────────────────────────────── */
function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // feedbackMode: fetched once on mount (no live Socket.IO — keeps page stateless)
  const [feedbackMode, setFeedbackMode] = useState(false);
  // feedbackSubmitted: derived from localStorage, updated after form submit
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Read the current user's team from localStorage (set by contest pages on completion)
  const currentTeamName = localStorage.getItem("currentTeam") || null;

  useEffect(() => {
    // Check if this team already submitted (localStorage guard — edge case #3)
    if (currentTeamName) {
      const stored = localStorage.getItem("feedback_submitted");
      setFeedbackSubmitted(stored === currentTeamName);
    }

    const fetchAll = async () => {
      try {
        const [lbRes, fbRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/admin/leaderboard`),
          fetch(`${BACKEND_URL}/admin/feedback-mode`),
        ]);
        setTeams(lbRes.data);
        const fbData = await fbRes.json();
        setFeedbackMode(!!fbData.enabled);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // feedbackMode is intentionally NOT updated via Socket.IO on the Leaderboard.
  // Edge case fix: once the form is rendered, we must not unmount it mid-fill
  // due to an admin toggle-off. The admin should disable feedback mode AFTER
  // the event, not while users are actively filling the form.

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        <style>{STYLES}</style>
        <div className="fixed inset-0 -z-30" style={{ background: "#08000e" }} />
        <div
          className="fixed pointer-events-none -z-20"
          style={{
            top: "40%", left: "30%", width: 700, height: 700,
            background: "radial-gradient(ellipse, rgba(180,50,50,0.28) 0%, rgba(120,20,40,0.12) 50%, transparent 75%)",
            animation: "nebula-drift-a 20s ease-in-out infinite",
            transform: "translate(-50%,-50%)",
          }}
        />
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">🏆</div>
          <p
            className="text-xl font-bold tracking-widest uppercase"
            style={{ color: "#f4a460", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Loading…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageStyle}>
        <p className="text-red-400 text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {error}
        </p>
      </div>
    );
  }

  /* ── Feedback form mode ── */
  if (feedbackMode && currentTeamName && !feedbackSubmitted) {
    return (
      <FeedbackForm
        teams={teams}
        currentTeamName={currentTeamName}
        onSubmitted={() => setFeedbackSubmitted(true)}
      />
    );
  }

  const top3 = teams.slice(0, 3);
  const rest = teams.slice(3);

  /* podium order: 2nd · 1st · 3rd */
  const podiumOrder =
    top3.length >= 3
      ? [
        { ...top3[1], type: "silver", podiumIndex: 0 },
        { ...top3[0], type: "gold", podiumIndex: 1 },
        { ...top3[2], type: "bronze", podiumIndex: 2 },
      ]
      : top3.map((t, i) => ({ ...t, type: ["gold", "silver", "bronze"][i], podiumIndex: i }));

  return (
    <div className="min-h-screen text-white" style={{ ...pageStyle, fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{STYLES}</style>

      <PageBackground />

      {/* ──────────── HEADER ──────────── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-10 h-20 gap-4"
        style={{
          background: "rgba(6, 0, 16, 0.72)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(249,115,22,0.12)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center justify-center rounded-xl w-10 h-10"
            style={{
              background: "linear-gradient(135deg,#d15b2c,#7c2114)",
              boxShadow: "0 0 16px rgba(209,91,44,0.45)",
            }}
          >
            <span className="material-symbols-outlined text-base text-white">rocket_launch</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Grand <span style={{ color: "#f4a460" }}>Leaderboard</span>
          </h1>
        </div>

        {/* Right side: User stats card OR team count badge */}
        <div className="flex items-center gap-3">
          {currentTeamName && teams.length > 0 ? (
            <UserStatsCard teams={teams} currentTeamName={currentTeamName} />
          ) : (
            <div
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full"
              style={{
                background: "rgba(209,91,44,0.15)",
                border: "1px solid rgba(209,91,44,0.3)",
                color: "#f4a460",
              }}
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              {teams.length} TEAMS
            </div>
          )}
        </div>
      </header>

      {/* ──────────── MAIN ──────────── */}
      <main className="max-w-5xl mx-auto w-full px-6 pb-20">

        {/* ── PODIUM section ── */}
        {top3.length > 0 && (
          <section className="pt-14 pb-0">
            <div className="text-center mb-10">
              <p
                className="text-xs font-black uppercase tracking-[0.35em] mb-2"
                style={{ color: "rgba(244,164,96,0.6)" }}
              >
                Top Commanders
              </p>
              <h2 className="text-4xl font-black tracking-tight uppercase" style={{ letterSpacing: "-0.02em" }}>
                🏆 Hall of Champions
              </h2>
            </div>

            <div className="flex items-end justify-center gap-4">
              {podiumOrder.map(({ team_name, total_score, type, podiumIndex }) => (
                <PodiumCard
                  key={type}
                  team={team_name}
                  score={total_score}
                  type={type}
                  index={podiumIndex}
                />
              ))}
            </div>

            {/* Ground line */}
            <div
              className="mt-0 mx-auto"
              style={{
                height: 2,
                maxWidth: 480,
                background:
                  "linear-gradient(to right, transparent, rgba(249,115,22,0.4) 30%, rgba(249,115,22,0.4) 70%, transparent)",
                boxShadow: "0 0 12px rgba(249,115,22,0.3)",
              }}
            />
          </section>
        )}

        {/* ── TABLE section ── */}
        <section className="mt-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p
                className="text-xs font-black uppercase tracking-[0.3em] mb-1"
                style={{ color: "rgba(244,164,96,0.55)" }}
              >
                Cumulative Scores · All Rounds
              </p>
              <h2 className="text-3xl font-black uppercase tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                Team Rankings
              </h2>
            </div>

            {teams.length > 0 && (
              <span
                className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {teams.length} total teams
              </span>
            )}
          </div>

          {/* Glass table card */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(8,0,18,0.7)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(249,115,22,0.1)",
              boxShadow:
                "0 8px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="text-[10px] font-black uppercase tracking-[0.25em]"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    color: "rgba(244,164,96,0.7)",
                    borderBottom: "1px solid rgba(249,115,22,0.1)",
                  }}
                >
                  <th className="px-6 py-4 w-16 text-center">Rank</th>
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4 text-right">Rapid Fire</th>
                  <th className="px-6 py-4 text-right">Cascade</th>
                  <th className="px-6 py-4 text-right">DSA</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center italic" style={{ color: "rgba(255,255,255,0.3)" }}>
                      No scores recorded yet. Complete a round to see results.
                    </td>
                  </tr>
                ) : (
                  teams.map((team, i) => {
                    const isCurrentUser =
                      currentTeamName &&
                      team.team_name?.toLowerCase() === currentTeamName.toLowerCase();
                    return (
                      <Row
                        key={team.username}
                        rank={i + 1}
                        name={team.team_name}
                        rapidfire={team.rapidfire_score}
                        cascade={team.cascade_score}
                        dsa={team.dsa_score}
                        total={team.total_score}
                        delay={i * 0.04}
                        isCurrentUser={!!isCurrentUser}
                      />
                    );
                  })
                )}
              </tbody>
            </table>

            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(249,115,22,0.2) 50%, transparent)",
              }}
            />
          </div>
        </section>
      </main>

      {/* ──────────── FOOTER ──────────── */}
      <footer
        className="border-t py-8 px-10"
        style={{
          background: "rgba(4,0,12,0.6)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          className="max-w-5xl mx-auto flex justify-between items-center text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <p>© 2025 Grand Prix Quiz Platform</p>
          <p style={{ color: "rgba(244,164,96,0.4)" }}>🚀 GPrime Season 1</p>
        </div>
      </footer>
    </div>
  );
}

const pageStyle = {
  background: "#08000e",
};

export default Leaderboard;
