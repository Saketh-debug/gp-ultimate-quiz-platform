import React from 'react'

function Rapidfire() {
  return (
     <div className="min-h-screen bg-background-dark text-white font-display">

      {/* PAGE WIDTH */}
      <div className="mx-auto max-w-6xl pb-40">

        {/* TOP NAV */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-background-dark/80 border-b border-white/5">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <h2 className="text-lg font-bold tracking-tight">
            Round 1 Deep Dive
          </h2>

          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10">
            <span className="material-symbols-outlined">info</span>
          </button>
        </div>

        {/* HERO */}
        <section className="relative py-20 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(127,19,236,0.15),transparent_70%)]" />

          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-[#4a0b8a] flex items-center justify-center border border-white/20 shadow-[0_0_40px_rgba(127,19,236,0.4)]">
              <span className="material-symbols-outlined text-6xl">bolt</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Rapid Fire
          </h1>

          <p className="mt-2 text-primary font-bold uppercase tracking-widest text-sm">
            Mission Objective: Velocity
          </p>
        </section>

        {/* SECTION DIVIDER */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-white/10" />
            <span className="text-xs uppercase tracking-widest text-white/60 font-bold">
              Mission Mechanics
            </span>
            <span className="flex-1 h-px bg-white/10" />
          </div>
        </div>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-6 px-6 mb-10">
          <div className="rounded-xl p-6 bg-[#362348]/40 backdrop-blur-md border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined">schedule</span>
              <span className="uppercase text-sm text-white/70 font-medium">
                Total Time
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              45 <span className="text-lg text-white/50">min</span>
            </p>
          </div>

          <div className="rounded-xl p-6 bg-[#362348]/40 backdrop-blur-md border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined">timer</span>
              <span className="uppercase text-sm text-white/70 font-medium">
                Per Question
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              3 <span className="text-lg text-white/50">min</span>
            </p>
          </div>
        </section>

        {/* BONUS RULE */}
        <section className="px-6 mb-12">
          <div className="rounded-xl p-[1px] bg-gradient-to-r from-primary/30 to-transparent">
            <div className="rounded-xl bg-background-dark p-6">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-primary/20 text-primary">
                  <span className="material-symbols-outlined text-3xl">
                    workspace_premium
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">
                    30-Minute Bonus Rule
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Complete the first 15 tasks within the 30-minute threshold to
                    unlock the Opulence Multiplier for the remainder of the round.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RULES LIST */}
        <section className="px-6 space-y-4">
          {[
            "No external assistance allowed during the active timer.",
            "Automatic submission occurs at 00:00.",
            "Double-check your connection before starting.",
          ].map(rule => (
            <div
              key={rule}
              className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/5"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                <span className="material-symbols-outlined text-white/80">
                  check_circle
                </span>
              </div>
              <p className="text-sm text-white/80 font-medium">
                {rule}
              </p>
            </div>
          ))}
        </section>
      </div>

      {/* BOTTOM ACTION */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-10">
        <div className="max-w-xl mx-auto px-6 pb-6">
          <button className="w-full h-16 rounded-xl bg-primary text-lg font-bold flex items-center justify-center gap-3 hover:bg-primary/90 active:scale-[0.98] shadow-[0_10px_30px_rgba(127,19,236,0.3)]">
            <span className="material-symbols-outlined">play_arrow</span>
            START ROUND
          </button>
          <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">
            Initiating secure session...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Rapidfire
