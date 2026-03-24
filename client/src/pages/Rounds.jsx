import React from "react";
import { Link } from "react-router-dom";

function Rounds() {
  return (
    <div className="min-h-screen bg-[#1a0b0b] text-white font-['Space_Grotesk'] relative overflow-x-hidden">

      {/* MARTIAN LANDSCAPE BACKGROUND */}
      <div
        className="fixed bottom-0 left-0 w-full h-[40vh] opacity-80 -z-10"
        style={{
          backgroundImage:
            "url(/images/martian-bg.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="mx-auto max-w-[1600px] px-10 pb-32">

        {/* TOP BAR */}
        <div className="sticky top-0 z-50 flex items-center justify-between h-20 bg-[#1a0b0b]/90 backdrop-blur-md border-b border-white/10">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            arrow_back_ios_new
          </span>

          <h2 className="text-xl font-black tracking-tight uppercase italic">
            Opulence
          </h2>

          <span className="material-symbols-outlined text-primary cursor-pointer">
            info
          </span>
        </div>

        {/* PROGRESS SECTION */}
        <section className="mt-10">
          <div className="rounded-3xl p-8 bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 shadow-[0_0_25px_rgba(249,115,22,0.15)]">

            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-2xl font-black uppercase italic">
                  Mission Trajectory
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  Synchronize systems across Martian sectors.
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black text-orange-500">
                  33%
                </span>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Sector 1 of 3
                </p>
              </div>
            </div>

            <div className="h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-orange-600 to-orange-500 relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <p className="mt-3 text-xs text-white/50 uppercase tracking-wider">
              Next up: Rapid Fire
            </p>
          </div>
        </section>

        {/* HEADER */}
        <section className="mt-16">
          <h3 className="text-4xl font-black uppercase italic tracking-tight">
            Current Sectors
          </h3>
          <div className="h-1 w-24 bg-orange-500 mt-3"></div>
        </section>

        {/* ROUNDS GRID */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* CARD 1 */}
          <div className="group rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 hover:-translate-y-2 hover:border-orange-500/60 transition-all duration-500">

            <div
              className="relative h-64 bg-cover bg-center overflow-hidden"
              style={{
                backgroundImage:
                  'url("/images/rapid-fire.png")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Active Sector
              </span>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-500">
                  bolt
                </span>
                <h4 className="text-2xl font-black uppercase">
                  Rapid Fire
                </h4>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold">
                  45m
                </span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold">
                  Speed Bonus
                </span>
              </div>

              <Link to="/rapidfire">
                <button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase rounded-xl transition">
                  Join Round
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-white/10 opacity-90">

            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("/images/coding-cascade.png")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

              <span className="absolute top-4 left-4 bg-white/10 border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full uppercase">
                Starts in 2h
              </span>
            </div>

            <div className="p-8">
              <h4 className="text-2xl font-black uppercase">
                Coding Cascade
              </h4>

              <Link to="/cascade">
                <button className="mt-6 w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 font-bold transition">
                  Join Round
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-white/10 opacity-70">

            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("/images/dsa.png")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

              <span className="absolute top-4 left-4 bg-black/60 text-white/40 text-xs px-3 py-1 rounded-full uppercase">
                Locked
              </span>
            </div>

            <div className="p-8">
              <h4 className="text-2xl font-black uppercase">
                DSA
              </h4>
              <Link to="/dsa">
                <button className="mt-6 w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 font-bold transition">
                  Join Round
                </button>
              </Link>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

export default Rounds;
