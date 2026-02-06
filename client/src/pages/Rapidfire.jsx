import React from "react";
import { Link } from "react-router-dom";

function Rapidfire() {
  return (
    <div className="min-h-screen text-white font-['Space_Grotesk'] bg-gradient-to-br from-[#451a03] to-[#1a0b08] overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-900/20 blur-[160px]" />
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6">
        <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500/20 transition">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
          <div className="size-2 bg-orange-500 rounded-full animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-white/90">
            Round 1 Deep Dive
          </h2>
        </div>

        <button className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
          <span className="material-symbols-outlined">info</span>
        </button>
      </header>

      {/* MAIN SPLIT LAYOUT */}
      <main className="flex pt-28 h-screen">

        {/* LEFT SIDE — HERO */}
        <div className="w-1/2 px-20 flex flex-col justify-center border-r border-white/5">

          <div className="mb-12">
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 bg-orange-500/20 blur-[80px] rounded-full" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center border border-white/20 shadow-[0_0_60px_rgba(249,115,22,0.4)]">
                <span className="material-symbols-outlined text-6xl">
                  bolt
                </span>
              </div>
            </div>

            <h1 className="text-5xl font-bold tracking-tight">
              Rapid Fire
            </h1>

            <p className="mt-3 text-orange-400 font-bold uppercase tracking-widest text-sm">
              Mission Objective: Velocity
            </p>
          </div>

          <p className="max-w-md text-white/60 leading-relaxed">
            Establish dominance through cognitive speed. High-velocity
            computation and sub-three-minute response windows are required
            for Opulence Level 1 clearance.
          </p>

          <div className="flex gap-4 mt-6 text-orange-500/60">
            <span className="material-symbols-outlined">speed</span>
            <span className="material-symbols-outlined">rocket_launch</span>
            <span className="material-symbols-outlined">vibration</span>
          </div>
        </div>

        {/* RIGHT SIDE — CONTENT */}
        <div className="w-1/2 px-16 flex flex-col justify-center">

          <div className="max-w-xl space-y-6">

            {/* STATS */}
            <div className="glass-card rounded-2xl p-6 flex items-center gap-6 bg-[rgba(45,15,10,0.4)] backdrop-blur-xl border border-orange-500/20">
              <span className="material-symbols-outlined text-orange-500 text-3xl">
                schedule
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Total Round Duration
                </p>
                <p className="text-2xl font-bold">
                  45 <span className="text-white/40 text-lg">minutes</span>
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 flex items-center gap-6 bg-[rgba(45,15,10,0.4)] backdrop-blur-xl border border-orange-500/20">
              <span className="material-symbols-outlined text-orange-500 text-3xl">
                timer
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold">
                  Response Cadence
                </p>
                <p className="text-2xl font-bold">
                  3 <span className="text-white/40 text-lg">min / question</span>
                </p>
              </div>
            </div>

            {/* BONUS RULE */}
            <div className="rounded-2xl p-[1px] bg-gradient-to-r from-orange-500/40 to-transparent">
              <div className="rounded-2xl bg-[rgba(45,15,10,0.5)] backdrop-blur-xl p-6 flex gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <span className="material-symbols-outlined text-orange-500 text-3xl">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">
                    30-Minute Bonus Rule
                  </h4>
                  <p className="text-sm text-white/60">
                    Complete the first 15 tasks within 30 minutes to unlock
                    the Opulence Multiplier.
                  </p>
                </div>
              </div>
            </div>

            {/* RULES */}
            <div className="space-y-3">
              {[
                "No external assistance allowed during the active timer.",
                "Automatic submission occurs at 00:00.",
                "Double-check your connection before starting.",
              ].map((rule) => (
                <div
                  key={rule}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <span className="material-symbols-outlined text-orange-500">
                    check_circle
                  </span>
                  <p className="text-sm text-white/80">{rule}</p>
                </div>
              ))}
            </div>

            {/* START BUTTON */}
            <Link to="/">
              <button className="w-full py-5 rounded-2xl bg-orange-500 hover:bg-orange-600 font-bold text-lg uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition">
                Start Round
              </button>
            </Link>

            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
              Initiating secure session...
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}

export default Rapidfire;
