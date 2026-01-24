import React from 'react'

function Leaderboard() {
  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark">
      <div className="relative min-h-screen w-full max-w-[1440px] mx-auto bg-background-light dark:bg-background-dark overflow-x-hidden">

        {/* Top App Bar */}
        <div className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between">
          <div className="text-primary flex size-12 items-center justify-start cursor-pointer">
            <span className="material-symbols-outlined text-3xl">chevron_left</span>
          </div>

          <h2 className="text-gray-900 dark:text-white text-lg font-bold flex-1 text-center">
            Opulence Contest
          </h2>

          <button className="flex items-center justify-center size-12 text-primary">
            <span className="material-symbols-outlined text-2xl">search</span>
          </button>
        </div>

        {/* Round Selector */}
        <div className="flex px-6 py-4 bg-background-light dark:bg-background-dark">
          <div className="flex h-11 flex-1 rounded-xl bg-gray-200 dark:bg-[#362348] p-1">
            {["Round 1", "Round 2", "Finals"].map((r, i) => (
              <label
                key={r}
                className={`flex cursor-pointer h-full grow items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  i === 1
                    ? "bg-white dark:bg-background-dark text-primary shadow-sm"
                    : "text-gray-500 dark:text-[#ad92c9]"
                }`}
              >
                {r}
                <input type="radio" className="hidden" />
              </label>
            ))}
          </div>
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end gap-8 px-12 pt-10 pb-16 h-[420px]">
          {/* 2nd */}
          <Podium
            rank={2}
            name="Jordan M."
            score="10,840"
            color="silver"
            size="small"
          />

          {/* 1st */}
          <Podium
            rank={1}
            name="Alex Rivers"
            score="12,450"
            color="gold"
            size="large"
          />

          {/* 3rd */}
          <Podium
            rank={3}
            name="Sarah K."
            score="9,210"
            color="bronze"
            size="small"
          />
        </div>

        {/* Rankings */}
        <div className="px-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Global Rankings</h3>
            <span className="text-xs text-[#ad92c9] uppercase">
              Round 2 • 2d left
            </span>
          </div>

          <div className="space-y-3 pb-32">
            <Row rank={4} name="Marcus_V" score="8,740" streak={12} />
            <Row rank={5} name="Luna.Tech" score="7,215" streak={8} />
            <Row rank={42} name="You (Me)" score="4,120" streak={15} highlight />
            <Row rank={43} name="Zander_99" score="3,980" streak={4} />
            <Row rank={44} name="PixelDev" score="3,750" streak={2} faded />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1440px] bg-background-light dark:bg-background-dark border-t border-white/10 p-6 flex justify-between items-center z-50">
          <div className="flex gap-10">
            <div>
              <p className="text-[10px] text-[#ad92c9] uppercase">My Rank</p>
              <p className="text-2xl font-black text-primary neon-text">#42</p>
            </div>
            <div>
              <p className="text-[10px] text-[#ad92c9] uppercase">Global %</p>
              <p className="font-bold">Top 12%</p>
            </div>
          </div>

          <button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/25">
            Claim Rewards
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Podium({ rank, name, score, color, size }) {
  return (
    <div
      className={`flex flex-col items-center ${
        size === "large" ? "scale-110" : ""
      }`}
    >
      <div
        className={`rounded-full border-4 mb-3 ${
          color === "gold"
            ? "border-gold size-24"
            : "border-" + color + " size-20"
        }`}
      />
      <p className="font-bold">{name}</p>
      <p className="text-primary font-semibold">{score}</p>
      <span className="text-xs font-bold mt-1">#{rank}</span>
    </div>
  );
}

function Row({ rank, name, score, streak, highlight, faded }) {
  return (
    <div
      className={`flex items-center px-6 py-4 rounded-xl border ${
        highlight
          ? "bg-primary/20 border-primary/40"
          : faded
          ? "opacity-60"
          : "bg-white dark:bg-white/5 border-white/10"
      }`}
    >
      <span className="w-12 font-bold text-primary">{rank}</span>
      <span className="flex-1 font-medium">{name}</span>
      <span className="w-24 text-right font-bold">{score}</span>
      <span className="w-16 text-right text-primary font-semibold flex items-center justify-end gap-1">
        {streak}
        <span className="material-symbols-outlined text-sm">bolt</span>
      </span>
    </div>
  )
}

export default Leaderboard
