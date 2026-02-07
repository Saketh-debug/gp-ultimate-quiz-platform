import React from "react";
import { Link } from "react-router-dom";

function Cascade() {
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
                Initiate Descent?
              </h3>

              <p className="text-white/50 mb-8 text-sm">
                Verify uplink stability before beginning. The cascade sequence
                starts immediately after authorization.
              </p>

              <Link to="/">
                <button className="w-full bg-[#ff4d20] hover:bg-[#ff623d] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition shadow-[0_0_30px_rgba(255,77,32,0.25)]">
                  AUTHORIZE ENTRY
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>
              </Link>

              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 mt-4">
                Biometric sync enabled
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
