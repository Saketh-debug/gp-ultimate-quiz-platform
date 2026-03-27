import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function DSA() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("dsaToken");
    localStorage.removeItem("dsaAccessCode");
  }, []);

  async function handleJoin() {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dsa/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("dsaToken", data.accessToken);
        localStorage.setItem("dsaAccessCode", token);
        await document.documentElement.requestFullscreen().catch(() => {});
        navigate("/dsa-contest", { state: { session: data } });
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
    <div className="min-h-screen bg-[#0c0202] text-white font-['Space_Grotesk'] overflow-x-hidden">

      {/* ORIGINAL DSA BACKGROUND */}
      {/* <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(244,63,94,0.15),transparent_60%)] z-0" /> */}
      
    <video
        src="/dsa_round_1.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* NAV (CASCADE STYLE) */}
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
          <div className="size-2.5 rounded-full bg-[#f43f5e] animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
          <span className="text-xs sm:text-base font-bold tracking-[0.3em] uppercase text-[#f43f5e]/80">
            DSA Round Active
          </span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-6 sm:px-10 lg:px-12 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

          {/* LEFT */}
          <div className="lg:col-span-5 space-y-10">

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] text-xs sm:text-sm font-bold uppercase tracking-[0.25em]">
                <span className="material-symbols-outlined text-sm sm:text-base">
                  memory
                </span>
                Cognitive Challenge Mode
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-none tracking-tight">
                DSA <br />
                <span className="bg-gradient-to-r from-[#fb7185] to-[#f43f5e] bg-clip-text text-transparent">
                  Challenge
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-white/70 leading-relaxed max-w-lg">
                Navigate complex data structures and algorithms. Optimize logic,
                manage time, and maximize efficiency across multiple problems.
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 text-[#f43f5e]/70 mb-2">
                  <span className="material-symbols-outlined text-base sm:text-lg">timer</span>
                  <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">
                    Duration
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  120 <span className="text-base sm:text-lg lg:text-xl text-white/40 font-light">mins</span>
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 text-[#f43f5e]/70 mb-2">
                  <span className="material-symbols-outlined text-base sm:text-lg">dataset</span>
                  <span className="text-xs sm:text-sm uppercase tracking-widest font-bold">
                    Tasks
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  5 <span className="text-base sm:text-lg lg:text-xl text-white/40 font-light">problems</span>
                </p>
              </div>
            </div>

            {/* START PANEL */}
            <div className="bg-black/40 backdrop-blur-xl border border-[#f43f5e]/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Enter Session</h3>

              <p className="text-white/50 mb-6 sm:mb-8 text-sm sm:text-base">
                Enter your access token to begin the DSA challenge.
              </p>

              <div className="space-y-4">
                <div className="flex h-14 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 border border-[#f43f5e]/30 shadow-inner focus-within:border-[#f43f5e]/80 transition-colors">
                  <div className="flex items-center px-4 sm:px-5 text-[#f43f5e]">
                    <span className="material-symbols-outlined font-light text-lg sm:text-xl">key</span>
                  </div>

                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                    placeholder="ENTER TOKEN"
                    className="flex-1 w-full min-w-0 bg-transparent px-2 text-white placeholder:text-[#f43f5e]/30 font-mono tracking-widest text-sm sm:text-base focus:outline-none"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={loading || !token}
                    className="px-4 sm:px-6 lg:px-8 bg-[#f43f5e] hover:bg-[#fb7185] text-white font-bold text-sm sm:text-base transition shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex shrink-0 items-center justify-center gap-1 sm:gap-2"
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
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7 space-y-8">

            {/* SCORING */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3">
                <span className="material-symbols-outlined text-2xl sm:text-3xl lg:text-4xl text-[#f43f5e]">
                  insights
                </span>
                Scoring Strategy
              </h3>

              <div className="space-y-6 sm:space-y-8">
                {[
                  ["avg_pace", "Standard Points", "Each correct solution gives base score."],
                  ["avg_pace", "Complexity Bonus", "Better complexity submissions gives higher scores."],
                  ["check_alert", "Partial Scoring", "Partial scoring for submissions as per the test cases passed."],
                ].map(([label, title, desc]) => (
                  <div key={title} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl lg:text-4xl shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/40 flex items-center justify-center text-[#f43f5e]">
                      {label}
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
                <span className="material-symbols-outlined text-xl sm:text-2xl text-[#f43f5e]">
                  security
                </span>
                Rules of Engagement
              </h3>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                {[
                  ["alt_route", "Free Navigation", "Solve problems in any order."],
                  ["terminal", "Languages", "Python, C++, Java, C supported."],
                  ["schedule", "Time Limit", "Session ends automatically at 120 minutes."],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex sm:block items-center sm:items-start gap-4 sm:gap-0">
                    <div className="mb-0 sm:mb-3 shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#f43f5e]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl text-[#f43f5e]">
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
        © 2026 Opulence Systems // Cognitive Division
      </footer>
    </div>
  );
}

export default DSA;