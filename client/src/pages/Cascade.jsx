import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Cascade() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Clear stale token on mount
  useEffect(() => {
    localStorage.removeItem("cascadeToken");
  }, []);

  async function handleJoin() {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cascade/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("cascadeToken", token); // Store for reload/resume
        navigate("/cascade-contest", { state: { session: data } });
      } else {
        setError(data.error || "Failed to join");
      }
    } catch (err) {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0b08] text-white font-['Space_Grotesk'] overflow-x-hidden">

      {/* BACKGROUND OVERLAY */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-[#7c2d12]/30 via-transparent to-[#ff4d20]/10 z-0" />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-8 max-w-[1600px] mx-auto">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition">
            <span className="material-symbols-outlined text-white/70">
              arrow_back
            </span>
          </div>
          <span className="text-white/50 text-xs tracking-widest uppercase">
            Dashboard
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-[#ff4d20] animate-pulse shadow-[0_0_10px_rgba(255,77,32,0.8)]"></div>
          <span className="text-sm font-bold tracking-[0.3em] uppercase text-[#ff4d20]/80">
            Martian Relay Active
          </span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* LEFT SIDE */}
          <div className="lg:col-span-5 space-y-10">

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4d20]/10 border border-[#ff4d20]/20 text-[#ff4d20] text-xs font-bold uppercase tracking-[0.25em]">
                <span className="material-symbols-outlined text-sm">
                  rocket_launch
                </span>
                Sector 2 Deployment
              </div>

              <h1 className="text-6xl font-bold leading-none tracking-tight">
                Coding <br />
                <span className="bg-gradient-to-r from-[#ff8c69] to-[#ff4d20] bg-clip-text text-transparent">
                  Cascade
                </span>
              </h1>

              <p className="text-white/70 leading-relaxed max-w-lg">
                Speed meets precision. Solve complex algorithmic problems in
                sequence to build your multiplier. Every correct answer fuels
                the cascade, but a mistake resets the flow.
              </p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-2 text-[#ff4d20]/70 mb-2">
                  <span className="material-symbols-outlined">timer</span>
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Duration
                  </span>
                </div>
                <p className="text-4xl font-bold">
                  60{" "}
                  <span className="text-lg text-white/40 font-light">
                    mins
                  </span>
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-2 text-[#ff4d20]/70 mb-2">
                  <span className="material-symbols-outlined">dataset</span>
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Tasks
                  </span>
                </div>
                <p className="text-4xl font-bold">
                  15{" "}
                  <span className="text-lg text-white/40 font-light">
                    questions
                  </span>
                </p>
              </div>
            </div>

            {/* START PANEL */}
            <div className="bg-black/40 backdrop-blur-xl border border-[#ff4d20]/20 rounded-3xl p-10">
              <h3 className="text-xl font-bold mb-3">
                Initiate Descent
              </h3>

              <p className="text-white/50 mb-8 text-sm">
                Enter your secure access token to authorize entry into the cascade sequence.
              </p>

              <div className="space-y-4">
                <div className="flex h-16 rounded-2xl overflow-hidden bg-black/60 border border-[#ff4d20]/30 shadow-inner focus-within:border-[#ff4d20]/80 transition-colors">
                  <div className="flex items-center px-5 text-[#ff4d20]">
                    <span className="material-symbols-outlined font-light">key</span>
                  </div>

                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                    placeholder="ENTER ACCESS TOKEN"
                    className="flex-1 bg-transparent px-2 text-white placeholder:text-[#ff4d20]/30 font-mono tracking-widest text-sm focus:outline-none"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={loading || !token}
                    className="px-8 bg-[#ff4d20] hover:bg-[#ff623d] text-white font-bold transition shadow-[0_0_20px_rgba(255,77,32,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <>
                        JOIN <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>

              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 mt-6">
                Biometric sync active • Multiplier enabled
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-7 space-y-8">

            {/* STREAK LOGIC */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              <h3 className="text-2xl font-bold mb-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ff4d20]">
                  stacked_line_chart
                </span>
                Streak Multiplier Logic
              </h3>

              <div className="space-y-8">
                {[
                  ["1.0x", "Base Points", "Nominal scoring for initial solves."],
                  ["1.5x", "Cascade Surge", "Unlocked at 3 consecutive solutions."],
                  ["2.5x", "Red Planet Velocity", "7+ streak. Maximum scoring efficiency."],
                ].map(([mult, title, desc]) => (
                  <div key={mult} className="flex gap-6 items-start">
                    <div className="w-14 h-14 rounded-xl bg-[#ff4d20]/10 border border-[#ff4d20]/40 flex items-center justify-center font-bold text-[#ff4d20]">
                      {mult}
                    </div>
                    <div>
                      <h4 className="font-bold">{title}</h4>
                      <p className="text-sm text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-red-950/40 border border-red-500/30 rounded-xl flex gap-4">
                <span className="material-symbols-outlined text-red-400">
                  warning
                </span>
                <p className="text-sm text-red-100/70">
                  Any incorrect submission or skipped question resets the multiplier to 1.0x.
                </p>
              </div>
            </div>

            {/* RULES */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff4d20]">
                  security
                </span>
                Mission Protocol
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  ["account_tree", "Sequential Order", "Questions must be solved in order."],
                  ["terminal", "Languages Allowed", "Python, C++, Java, Rust supported."],
                  ["history", "Auto Submission", "Session ends automatically at 60 minutes."],
                ].map(([icon, title, desc]) => (
                  <div key={title}>
                    <div className="w-12 h-12 rounded-xl bg-[#ff4d20]/10 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[#ff4d20]">
                        {icon}
                      </span>
                    </div>
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-sm text-white/50">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-[1600px] mx-auto px-12 py-12 text-white/20 text-xs uppercase tracking-[0.4em]">
        © 2025 Opulence Systems // Mars Surface Deployment
      </footer>
    </div>
  );
}

export default Cascade;
