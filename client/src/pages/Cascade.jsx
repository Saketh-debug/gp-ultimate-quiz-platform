import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MatrixRainingLetters from "../components/ui/matrixRainingLetters";

function Cascade() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Clear stale tokens on mount
  useEffect(() => {
    localStorage.removeItem("cascadeToken");
    localStorage.removeItem("cascadeAccessCode");
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
        localStorage.setItem("cascadeToken", data.accessToken); // JWT for API auth
        localStorage.setItem("cascadeAccessCode", token);       // Raw code for /join resume
        // Enter fullscreen before navigating (button click provides required gesture)
        await document.documentElement.requestFullscreen().catch(() => { });
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

      {/* MATRIX RAIN BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <MatrixRainingLetters color="#ff4d20" />
      </div>
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" />

      {/* BACKGROUND OVERLAY */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-[#7c2d12]/30 via-transparent to-[#ff4d20]/10 z-0" />

      {/* NAV */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-12 lg:py-8 max-w-[1600px] mx-auto">
        <Link to="/rounds" className="flex items-center gap-4 group">
          <div className="size-8 sm:size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition">
            <span className="material-symbols-outlined text-sm sm:text-base text-white/70">
              arrow_back
            </span>
          </div>
          <span className="text-white/50 text-xs sm:text-sm tracking-[0.28em] uppercase">
            Dashboard
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-[#ff4d20] animate-pulse shadow-[0_0_10px_rgba(255,77,32,0.8)]"></div>
          <span className="text-xs sm:text-base font-bold tracking-[0.3em] uppercase text-[#ff4d20]/80">
            Cascade Round Active
          </span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-6 sm:px-10 lg:px-12 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* LEFT SIDE */}
          <div className="lg:col-span-5 space-y-10">

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff4d20]/10 border border-[#ff4d20]/20 text-[#ff4d20] text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">
                <span className="material-symbols-outlined text-sm sm:text-base">
                  rocket_launch
                </span>
                Tactical Selection Mode
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-none tracking-tight">
                Coding <br />
                <span className="bg-gradient-to-r from-[#ff8c69] to-[#ff4d20] bg-clip-text text-transparent">
                  Cascade
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-white/70 leading-relaxed max-w-lg">
                Speed meets precision. Solve complex algorithmic problems in
                sequence to build your streak. Every correct answer fuels
                the cascade, but a mistake resets the flow.
              </p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 text-[#ff4d20]/70 mb-2">
                  <span className="material-symbols-outlined text-base sm:text-lg">timer</span>
                  <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">
                    Duration
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  60{" "}
                  <span className="text-base sm:text-lg lg:text-xl text-white/40 font-light">
                    mins
                  </span>
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 text-[#ff4d20]/70 mb-2">
                  <span className="material-symbols-outlined text-base sm:text-lg">dataset</span>
                  <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">
                    Tasks
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  15{" "}
                  <span className="text-base sm:text-lg lg:text-xl text-white/40 font-light">
                    questions
                  </span>
                </p>
              </div>
            </div>

            {/* START PANEL */}
            <div className="bg-black/40 backdrop-blur-xl border border-[#ff4d20]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                Enter Session
              </h3>

              <p className="text-white/50 mb-6 sm:mb-8 text-sm sm:text-base">
                Enter your access token to begin the cascade sequence.
              </p>

              <div className="space-y-4">
                <div className="flex h-14 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 border border-[#ff4d20]/30 shadow-inner focus-within:border-[#ff4d20]/80 transition-colors">
                  <div className="flex items-center px-4 sm:px-5 text-[#ff4d20]">
                    <span className="material-symbols-outlined font-light text-lg sm:text-xl">key</span>
                  </div>

                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                    placeholder="ENTER TOKEN"
                    className="flex-1 w-full min-w-0 bg-transparent px-2 text-white placeholder:text-[#ff4d20]/30 font-mono tracking-widest text-sm sm:text-base focus:outline-none"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={loading || !token}
                    className="px-4 sm:px-6 lg:px-8 bg-[#ff4d20] hover:bg-[#ff623d] text-white text-sm sm:text-base font-bold transition shadow-[0_0_20px_rgba(255,77,32,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex shrink-0 items-center justify-center gap-1 sm:gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-sm sm:text-base">sync</span>
                    ) : (
                      <>
                        <span>JOIN</span> <span className="material-symbols-outlined text-sm sm:text-base">chevron_right</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-bold text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                    {error}
                  </p>
                )}
              </div>

              <p className="text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30 mt-6">
                Token Sync Active • Streak enabled
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-7 space-y-8">

            {/* STREAK LOGIC */}
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3">
                <span className="material-symbols-outlined text-2xl sm:text-3xl lg:text-4xl text-[#ff4d20]">
                  stacked_line_chart
                </span>
                Streak Logic
              </h3>

              <div className="space-y-6 sm:space-y-8">
                {[
                  ["currency_bitcoin", "Base Points", "Nominal scoring for initial solves."],
                  ["show_chart", "Cascade Surge", "Unlocked by solving questions consecutively."],
                  ["warning", "Warning  ", "Any incorrect submission or skipped question resets the streak to 1.0x."],
                ].map(([icon, title, desc]) => (
                  <div key={icon} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl text-orange-400 shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#ff4d20]/10 border border-[#ff4d20]/40 flex items-center justify-center font-bold text-[#ff4d20]">
                      {icon}
                    </span>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold">{title}</h4>
                      <p className="text-sm sm:text-base lg:text-lg text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RULES */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl sm:text-2xl text-[#ff4d20]">
                  security
                </span>
                Mission Protocol
              </h3>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                {[
                  ["account_tree", "Sequential Order", "Questions must be solved in order."],
                  ["terminal", "Languages Allowed", "Python, C++, Java, C, Go supported."],
                  ["history", "Auto Submission", "Session ends automatically at 60 minutes."],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex sm:block items-center sm:items-start gap-4 sm:gap-0">
                    <div className="mb-0 sm:mb-3 shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#ff4d20]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#ff4d20]">
                        {icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold">{title}</h4>
                      <p className="text-sm sm:text-base lg:text-lg text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-12 py-10 lg:py-12 text-white/20 text-xs sm:text-sm uppercase tracking-[0.35em] sm:tracking-[0.4em]">
        © 2026 Opulence Systems // Mars Surface Deployment
      </footer>
    </div>
  );
}

export default Cascade;