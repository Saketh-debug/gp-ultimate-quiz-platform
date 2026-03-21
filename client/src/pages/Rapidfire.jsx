import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Rapidfire() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("userToken");
  }, []);

  async function handleJoin() {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/rapidfire/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userToken", token);
        navigate("/rapidfire-contest", { state: { session: data } });
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

      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-orange-900/30 via-transparent to-red-600/10 z-0" />

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
          <div className="size-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(255,100,0,0.8)]"></div>
          <span className="text-sm font-bold tracking-[0.3em] uppercase text-orange-400/80">
            Rapid Mode Active
          </span>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* LEFT */}
          <div className="lg:col-span-5 space-y-10">

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-[0.25em]">
                <span className="material-symbols-outlined text-sm">
                  flash_on
                </span>
                High Intensity Mode
              </div>

              <h1 className="text-6xl font-bold leading-none tracking-tight">
                Rapid <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                  Fire
                </span>
              </h1>

              <p className="text-white/70 leading-relaxed max-w-lg">
                Speed is everything. Solve questions under extreme time pressure.
                No pauses, no retries — just pure performance.
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-2 text-orange-400/70 mb-2">
                  <span className="material-symbols-outlined">timer</span>
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Duration
                  </span>
                </div>
                <p className="text-4xl font-bold">
                  45 <span className="text-lg text-white/40">mins</span>
                </p>
              </div>

              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-2 text-orange-400/70 mb-2">
                  <span className="material-symbols-outlined">bolt</span>
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Questions
                  </span>
                </div>
                <p className="text-4xl font-bold">
                  15 <span className="text-lg text-white/40">total</span>
                </p>
              </div>
            </div>

            {/* JOIN PANEL */}
            <div className="bg-black/40 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-10">
              <h3 className="text-xl font-bold mb-3">
                Enter Rapid Session
              </h3>

              <p className="text-white/50 mb-8 text-sm">
                Input your access token to begin the rapid challenge.
              </p>

              <div className="space-y-4">
                <div className="flex h-16 rounded-2xl overflow-hidden bg-black/60 border border-orange-500/30 focus-within:border-orange-500/80 transition-colors">
                  <div className="flex items-center px-5 text-orange-400">
                    <span className="material-symbols-outlined">key</span>
                  </div>

                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
                    placeholder="ENTER ACCESS TOKEN"
                    className="flex-1 bg-transparent px-2 text-white placeholder:text-orange-400/30 font-mono tracking-widest text-sm focus:outline-none"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={loading || !token}
                    className="px-8 bg-orange-600 hover:bg-orange-500 font-bold transition shadow-[0_0_20px_rgba(255,100,0,0.3)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-sm">
                        sync
                      </span>
                    ) : (
                      <>
                        JOIN
                        <span className="material-symbols-outlined text-sm">
                          chevron_right
                        </span>
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
                Timer locked • No retries
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7 space-y-8">

            {/* FEATURES */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
              <h3 className="text-2xl font-bold mb-10 flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-400">
                  local_fire_department
                </span>
                Rapid Mechanics
              </h3>

              <div className="space-y-8">
                {[
                  ["⚡", "Time Pressure", "Each question must be solved quickly."],
                  ["🔥", "Streak Bonus", "Maintain streaks for higher scores."],
                  ["🏆", "Leaderboard", "Compete globally in real-time."],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex gap-6 items-start">
                    <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-orange-400 text-xl">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold">{title}</h4>
                      <p className="text-sm text-white/50">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RULES */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">
                  security
                </span>
                Rules
              </h3>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  ["timer", "Limited Time", "Each problem has strict timing."],
                  ["bolt", "Fast Responses", "Speed affects scoring."],
                  ["block", "No Reattempts", "Once skipped, cannot return."],
                ].map(([icon, title, desc]) => (
                  <div key={title}>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-orange-400">
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
        © 2025 RapidFire Systems
      </footer>
    </div>
  );
}

export default Rapidfire;