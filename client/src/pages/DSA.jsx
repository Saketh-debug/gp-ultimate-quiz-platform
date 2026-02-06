import React from "react";

function DSA() {
  return (
    <div className="min-h-screen bg-[#0c0202] text-slate-100 font-['Space_Grotesk'] overflow-x-hidden">

      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(244,63,94,0.15),transparent_60%)] z-0" />

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0c0202]/90 border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-12 h-20 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-8">
            <button className="size-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 transition">
              <span className="material-symbols-outlined text-slate-400 hover:text-[#f43f5e]">
                arrow_back
              </span>
            </button>

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
          <div className="flex items-center gap-6">

            <div className="flex gap-8 px-6 py-2 bg-white/5 rounded-xl border border-white/10">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Window Closes
                </span>
                <span className="text-lg font-mono font-bold text-[#f43f5e]">
                  02:45:12
                </span>
              </div>

              <div className="border-l border-white/10 pl-6">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Current Pts
                </span>
                <span className="text-lg font-mono font-bold text-white">
                  450
                </span>
              </div>
            </div>

            <button className="bg-[#f43f5e] hover:bg-red-500 text-white px-6 h-12 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#f43f5e]/20 transition hover:scale-[1.02] active:scale-95 text-sm uppercase tracking-widest">
              <span className="material-symbols-outlined">rocket_launch</span>
              INITIATE (Q3)
            </button>

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
                Navigate the digital dunes. Solve algorithmic complexities to
                establish a secure comm-link across the Martian surface.
              </p>
            </div>

            {/* RIGHT STATS */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-end gap-6">
              <div className="grid grid-cols-2 gap-6">

                <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Max Resource
                  </p>
                  <p className="text-4xl font-bold text-white">
                    1,500<span className="text-[#f43f5e]">.</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">
                    Points Available
                  </p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">
                    Mission Time
                  </p>
                  <p className="text-4xl font-bold text-white">
                    180
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
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-[#2d0a0a]/40 backdrop-blur-md p-10 rounded-[2rem] border border-white/5 sticky top-32">

              <h3 className="text-xl font-bold mb-8">
                Rules of Engagement
              </h3>

              <ul className="space-y-6 text-sm">
                <li>
                  <p className="font-bold text-white">
                    8 Unique Problems
                  </p>
                  <p className="text-slate-400">
                    Multi-difficulty challenges.
                  </p>
                </li>

                <li>
                  <p className="font-bold text-white">
                    Variable Difficulty
                  </p>
                  <p className="text-slate-400">
                    Easy → Critical scaling.
                  </p>
                </li>

                <li>
                  <p className="font-bold text-white">
                    Partial Scoring
                  </p>
                  <p className="text-slate-400">
                    Credits awarded per test case.
                  </p>
                </li>
              </ul>

            </div>
          </aside>

          {/* TABLE AREA */}
          <section className="col-span-12 lg:col-span-9">
            <div className="bg-[#1a0606]/60 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden">

              <div className="px-10 py-8 border-b border-white/5">
                <h3 className="text-2xl font-bold">
                  Challenge Protocols
                </h3>
                <p className="text-sm text-slate-500">
                  8 Operational Modules
                </p>
              </div>

              <div className="p-10 text-slate-400 text-sm">
                (Challenge table content here — logic ready)
              </div>

            </div>
          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-[1440px] mx-auto px-12 py-12 border-t border-white/5 mt-10">
        <div className="flex justify-between text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">
          <p>© 2024 OPULENCE MARS COMMAND</p>
          <div className="flex gap-10">
            <a className="hover:text-[#f43f5e]">MISSION DOCS</a>
            <a className="hover:text-[#f43f5e]">GLOBAL LOGS</a>
            <a className="hover:text-[#f43f5e]">ENCRYPTION KEYS</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default DSA;
