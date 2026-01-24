import React from 'react'

function DSA() {
  return (
     <div className="dark bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30 font-display">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button className="size-12 rounded-xl hover:bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400 hover:text-primary">
                arrow_back
              </span>
            </button>

            <div className="h-10 w-px bg-white/10" />

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase">
                  Operation Opulence
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Round 3 Deep Dive
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-8 px-8 py-3 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Time Remaining
                </span>
                <span className="text-xl font-mono font-bold text-primary">
                  02:45:12
                </span>
              </div>

              <div className="border-l border-white/10 pl-8">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Current Score
                </span>
                <span className="text-xl font-mono font-bold text-white">
                  450 <span className="text-xs text-slate-500">pts</span>
                </span>
              </div>
            </div>

            <button className="bg-primary hover:bg-accent-neon text-white px-8 h-14 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-primary/40 transition-all hover:scale-[1.02] active:scale-95">
              <span className="material-symbols-outlined">terminal</span>
              RESUME CHALLENGE (Q3)
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-[1440px] mx-auto px-12 py-10">
        <div className="grid grid-cols-12 gap-8 mb-12">
          {/* LEFT */}
          <div className="col-span-7">
            <h2 className="text-6xl font-bold mb-6 tracking-tighter text-white">
              DSA <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-neon">
                Challenge
              </span>
            </h2>

            <p className="text-slate-400 text-lg max-w-xl mb-10">
              Test your algorithmic efficiency and data structure proficiency.
            </p>

            <div className="flex gap-4">
              <div className="flex-1 bg-card-dark p-6 rounded-3xl border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Total Potential Points
                </p>
                <p className="text-4xl font-bold text-white">
                  1,500<span className="text-primary">.</span>
                </p>
              </div>

              <div className="flex-1 bg-card-dark p-6 rounded-3xl border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Time Allotted
                </p>
                <p className="text-4xl font-bold text-white">
                  180<span className="text-primary text-2xl ml-1">min</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-5">
            <div className="bg-surface-dark p-8 rounded-[2rem] border border-primary/20">
              <h3 className="text-xl font-bold uppercase tracking-widest mb-8">
                Round Rules
              </h3>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <span className="material-symbols-outlined text-primary">
                    done_all
                  </span>
                  <div>
                    <p className="font-bold">8 Complex Questions</p>
                    <p className="text-sm text-slate-400">
                      Sequential access allowed.
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="material-symbols-outlined text-primary">
                    speed
                  </span>
                  <div>
                    <p className="font-bold">Dynamic Difficulty</p>
                    <p className="text-sm text-slate-400">
                      Easy → Extreme
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <span className="material-symbols-outlined text-primary">
                    calculate
                  </span>
                  <div>
                    <p className="font-bold">Weighted Points</p>
                    <p className="text-sm text-slate-400">
                      Time + difficulty based
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-card-dark rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between">
            <div>
              <h3 className="text-2xl font-bold">Challenge Set</h3>
              <p className="text-sm text-slate-500">
                8 Curated Problems
              </p>
            </div>

            {/* <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
                ALL
              </button>
              <button className="px-6 py-2.5 text-slate-400 hover:bg-white/5 rounded-xl">
                IN PROGRESS
              </button>
              <button className="px-6 py-2.5 text-slate-400 hover:bg-white/5 rounded-xl">
                COMPLETED
              </button>
            </div> */}
          </div>

          {/* <div className="p-8 text-slate-400 text-sm">
            (Table rows unchanged – logic-ready)
          </div> */}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-[1440px] mx-auto px-12 py-12 border-t border-white/5 mt-20">
        <div className="flex justify-between text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
          <p>© 2024 OPULENCE CHALLENGE ENGINE</p>
          <div className="flex gap-10">
            <a className="hover:text-primary">DOCUMENTATION</a>
            <a className="hover:text-primary">LEADERBOARD</a>
            <a className="hover:text-primary">SYSTEM LOGS</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DSA
