import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Rapidfire() {
  const [token, setToken] = useState("");

  // Clear stale tokens on mount — user must re-enter if they come here
  useState(() => { localStorage.removeItem("userToken"); localStorage.removeItem("userAccessCode"); });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        localStorage.setItem("userToken", data.accessToken); // JWT for API auth
        localStorage.setItem("userAccessCode", token);       // Raw code for /join resume
        // Enter fullscreen before navigating (button click provides required gesture)
        await document.documentElement.requestFullscreen().catch(() => { });
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
    <div className="min-h-screen bg-black/90 text-white font-['Space_Grotesk'] overflow-x-hidden">
      {/* BACKGROUND VIDEO */}
      <video
        src="/0326_1.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-tr from-orange-900/30 via-transparent to-red-600/10" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-orange-600/20 blur-[120px]" />
        <div className="absolute bottom-[-14%] right-[-10%] h-[34rem] w-[34rem] rounded-full bg-red-600/10 blur-[150px]" />
      </div>

      <nav className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6 sm:px-10 lg:px-12 lg:py-8">
        <Link to="/rounds" className="group flex items-center gap-4">
          <div className="flex size-8 sm:size-10 items-center justify-center rounded-full border border-white/10 transition group-hover:bg-white/5">
            <span className="material-symbols-outlined text-sm sm:text-base text-white/70">
              arrow_back
            </span>
          </div>
          <span className="text-xs uppercase tracking-[0.28em] text-white/50 sm:text-sm">
            Dashboard
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(255,100,0,0.8)]" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-orange-400/80 sm:text-base">
            Rapid Fire Mode
          </span>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-[1600px] px-6 py-6 sm:px-10 lg:px-12 lg:py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-5">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
                <span className="material-symbols-outlined text-md">
                  flash_on
                </span>
                High Intensity Mode
              </div>

              <h1 className="text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-8xl">
                Rapid <br />
                <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                  Fire
                </span>
              </h1>

              <p className="max-w-lg text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl">
                Speed is your only ally. Solve as many problems as possible
                before the clock runs out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: "timer", label: "Duration", value: "50", suffix: "mins" },
                { icon: "bolt", label: "Questions", value: "10", suffix: "total" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 lg:p-8 backdrop-blur-xl"
                >
                  <div className="mb-2 flex items-center gap-2 text-orange-400/70">
                    <span className="material-symbols-outlined text-base sm:text-lg">{stat.icon}</span>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    {stat.value}{" "}
                    <span className="text-base sm:text-lg lg:text-xl text-white/40">
                      {stat.suffix}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-orange-500/20 bg-black/40 p-6 sm:p-8 lg:p-10 backdrop-blur-xl">
              <h3 className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold">Enter Session</h3>

              <p className="mb-6 sm:mb-8 text-sm sm:text-base text-white/50">
                Input your access token to begin the rapid fire round.
              </p>

              <div className="space-y-4">
                <div className="flex h-14 sm:h-16 overflow-hidden rounded-xl sm:rounded-2xl border border-orange-500/30 bg-black/60 transition-colors focus-within:border-orange-500/80">
                  <div className="flex items-center px-4 sm:px-5 text-orange-400">
                    <span className="material-symbols-outlined text-lg sm:text-xl">key</span>
                  </div>

                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ENTER TOKEN"
                    className="flex-1 w-full min-w-0 bg-transparent px-2 text-sm sm:text-base tracking-widest text-white placeholder:text-orange-400/30 focus:outline-none sm:px-3"
                  />

                  <button
                    onClick={handleJoin}
                    disabled={loading}
                    className="flex shrink-0 items-center justify-center gap-1 sm:gap-2 bg-orange-600 px-4 sm:px-6 lg:px-8 text-sm sm:text-base font-bold transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm sm:text-base">
                          sync
                        </span>
                        <span className="hidden sm:inline">JOINING...</span>
                      </>
                    ) : (
                      <>
                        <span>JOIN</span>
                        <span className="material-symbols-outlined text-sm sm:text-base">
                          chevron_right
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-center text-sm font-bold text-red-500">
                    {error}
                  </p>
                )}
              </div>

              <p className="mt-6 text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30">
                Timer locked • No retries
              </p>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-7">
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 lg:p-12 backdrop-blur-xl">
              <h3 className="mb-6 sm:mb-10 flex items-center gap-2 sm:gap-3 text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="material-symbols-outlined text-3xl sm:text-4xl lg:text-5xl text-orange-400">
                  local_fire_department
                </span>
                Round Mechanics
              </h3>

              <div className="space-y-6 sm:space-y-8">
                {[
                  ["timer", "Time Pressure", "5 minutes per question. No turning back."],
                  ["local_fire_department", "Speed Bonus", "Answer quickly to get bonus points."],
                  ["emoji_events", "Leaderboard", "Compete with top coders among the participants."],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6">
                    <div className="flex shrink-0 h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-lg sm:rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400">
                      <span className="material-symbols-outlined text-2xl sm:text-4xl">
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

            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-black/40 p-6 sm:p-8 lg:p-10 backdrop-blur-xl">
              <h3 className="mb-6 sm:mb-8 flex items-center gap-2 text-xl sm:text-2xl font-bold">
                <span className="material-symbols-outlined text-xl sm:text-2xl text-orange-400">
                  security
                </span>
                Rules
              </h3>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
                {[
                  ["timer", "Limited Time", "Each problem has strict timing."],
                  ["bolt", "Fast Responses", "Speed affects scoring."],
                  ["block", "No Reattempts", "Once skipped, cannot return."],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex sm:block items-center sm:items-start gap-4 sm:gap-0">
                    <div className="mb-0 sm:mb-3 shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-orange-500/10">
                      <span className="material-symbols-outlined text-2xl sm:text-3xl text-orange-400">
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

      <footer className="relative z-10 mx-auto max-w-[1600px] px-6 py-10 text-xs uppercase tracking-[0.35em] text-white/20 sm:px-10 sm:text-sm lg:px-12 lg:py-12">
        © 2026 RapidFire Systems
      </footer>
    </div>
  );
}

export default Rapidfire;