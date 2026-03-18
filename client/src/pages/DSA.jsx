import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function DSA() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Clear stale token on mount
  useEffect(() => {
    localStorage.removeItem("dsaToken");
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
        localStorage.setItem("dsaToken", token); // Store for reload/resume
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
    <div className="min-h-screen bg-[#0c0202] text-slate-100 font-['Space_Grotesk'] overflow-x-hidden">

      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(244,63,94,0.15),transparent_60%)] z-0" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0c0202]/90 border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-12 h-20 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-8">
            <Link to="/" className="size-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition">
              <span className="material-symbols-outlined text-slate-400 hover:text-[#f43f5e]">
                arrow_back
              </span>
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold tracking-[0.3em] text-[#f43f5e] uppercase">
                  Operation Opulence
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                  Mars Sector
                </span>
              </div>

              <h1 className="text-xl font-bold text-white">
                Round 3: Martian Ascent
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-[#f43f5e] animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
            <span className="text-sm font-bold tracking-[0.3em] uppercase text-[#f43f5e]/80">
              Central Hub Active
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative z-10 max-w-[1440px] mx-auto px-12 py-12">

        {/* HERO */}
        <div className="rounded-[2.5rem] border border-white/5 p-14 mb-12 bg-[radial-gradient(circle_at_50%_120%,#450a0a_0%,transparent_70%)]">

          <div className="grid grid-cols-12 gap-12">

            {/* LEFT */}
            <div className="col-span-12 lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/20 mb-6">
                <span className="size-2 rounded-full bg-[#f43f5e] animate-pulse" />
                <span className="text-[10px] font-bold text-[#f43f5e] uppercase tracking-widest">
                  Active Transmission
                </span>
              </div>

              <h2 className="text-6xl font-bold mb-6 tracking-tight leading-[0.9]">
                DSA <br />
                <span className="bg-gradient-to-r from-[#f43f5e] to-[#fb923c] bg-clip-text text-transparent">
                  Challenge
                </span>
              </h2>

              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Navigate the digital dunes. Solve complex algorithmic challenges to
                establish a secure comm-link across the Martian surface.
              </p>

              {/* START PANEL */}
              <div className="mt-10 bg-black/40 backdrop-blur-xl border border-[#f43f5e]/20 rounded-3xl p-8 max-w-md">
                <h3 className="text-xl font-bold mb-3">
                  Initiate Ascent
                </h3>

                <p className="text-white/50 mb-6 text-sm">
                  Enter your secure access token to authorize entry into the DSA challenge sequence.
                </p>

                <div className="space-y-4">
                  <div className="flex h-14 rounded-2xl overflow-hidden bg-black/60 border border-[#f43f5e]/30 shadow-inner focus-within:border-[#f43f5e]/80 transition-colors">
                    <div className="flex items-center px-4 text-[#f43f5e]">
                      <span className="material-symbols-outlined font-light">key</span>
                    </div>

                    <input
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
                      placeholder="ENTER ACCESS TOKEN"
                      className="flex-1 bg-transparent px-2 text-white placeholder:text-[#f43f5e]/30 font-mono tracking-widest text-sm focus:outline-none"
                    />

                    <button
                      onClick={handleJoin}
                      disabled={loading || !token}
                      className="px-6 bg-[#f43f5e] hover:bg-[#fb923c] text-white font-bold transition shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              </div>

            </div>

            {/* RIGHT STATS */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-end gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Tasks
                  </p>
                  <p className="text-4xl font-bold text-white">
                    5<span className="text-[#f43f5e]">.</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">
                    Fixed Order Questions
                  </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Mission Time
                  </p>
                  <p className="text-4xl font-bold text-white">
                    120
                    <span className="text-[#f43f5e] text-lg ml-1">min</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">
                    Standard Duration
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-12 gap-12">

          {/* RULES */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="bg-[#2d0a0a]/40 backdrop-blur-md p-10 rounded-[2rem] border border-white/5">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f43f5e]">
                  security
                </span>
                Rules of Engagement
              </h3>

              <ul className="space-y-6 text-sm">
                <li className="flex gap-4">
                  <span className="material-symbols-outlined text-[#f43f5e]">alt_route</span>
                  <div>
                    <p className="font-bold text-white">Free Navigation</p>
                    <p className="text-slate-400 mt-1">Jump between any of the 5 questions at any time.</p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="material-symbols-outlined text-[#f43f5e]">terminal</span>
                  <div>
                    <p className="font-bold text-white">Languages</p>
                    <p className="text-slate-400 mt-1">Python, C++, Java supported.</p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="material-symbols-outlined text-[#f43f5e]">hourglass_bottom</span>
                  <div>
                    <p className="font-bold text-white">Time Multipliers</p>
                    <p className="text-slate-400 mt-1">Flat base points. Fast solving yields efficiency bonuses.</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* TABLE AREA */}
          <section className="col-span-12 lg:col-span-8">
            <div className="bg-[#1a0606]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden h-full flex flex-col justify-center items-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f43f5e]/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-[#f43f5e]">
                  lock_open
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">
                Challenge Unlocked
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Prepare your development environment. The contest begins as soon as you enter your access token.
              </p>
            </div>
          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-[1440px] mx-auto px-12 py-12 border-t border-white/5 mt-10">
        <div className="flex justify-between text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">
          <p>© 2024 OPULENCE MARS COMMAND</p>
          <div className="flex gap-10">
            <a className="hover:text-[#f43f5e] cursor-pointer">MISSION DOCS</a>
            <a className="hover:text-[#f43f5e] cursor-pointer">GLOBAL LOGS</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default DSA;
