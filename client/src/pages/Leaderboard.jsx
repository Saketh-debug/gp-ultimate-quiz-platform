import React from "react";

function Leaderboard() {
  return (
    <div className="min-h-screen font-['Space_Grotesk'] text-white bg-[linear-gradient(to_bottom,#d15b2c_0%,#7c2114_40%,#1a0b08_100%)]">

      {/* WRAPPER */}
      <div className="min-h-screen bg-black/20 flex flex-col">

        {/* HEADER */}
        <header className="sticky top-0 z-50 h-20 px-12 flex items-center justify-between backdrop-blur-xl bg-black/30 border-b border-white/5">

          <div className="flex items-center gap-4">
            <div className="size-10 bg-[#d15b2c] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Opulence <span className="text-[#f4a460]">Martian</span>
            </h1>
          </div>

          {/* ROUND SWITCH */}
          <div className="flex h-12 bg-black/40 rounded-full p-1 w-[420px] border border-white/5">
            {["Round 1", "Round 2", "Finals"].map((r, i) => (
              <button
                key={r}
                className={`flex-1 rounded-full text-sm font-semibold transition-all ${
                  i === 1
                    ? "bg-[#d15b2c] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#d15b2c]/20 rounded-lg text-[#f4a460] text-sm font-bold border border-[#d15b2c]/30">
              <span className="material-symbols-outlined text-sm">schedule</span>
              2 DAYS LEFT
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 max-w-[1600px] mx-auto w-full px-12 py-12 flex flex-col gap-16">

          {/* PODIUM */}
          <section className="flex items-end justify-center gap-12 pt-12">

            <Podium rank={2} name="Jordan M." score="10,840 pts" type="silver" />
            <Podium rank={1} name="Alex Rivers" score="12,450 pts" type="gold" large />
            <Podium rank={3} name="Sarah K." score="9,210 pts" type="bronze" />

          </section>

          {/* GRID */}
          <div className="grid grid-cols-12 gap-8">

            {/* TABLE */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

              <div>
                <h2 className="text-4xl font-black tracking-tight uppercase">
                  Global Rankings
                </h2>
                <p className="text-[#f4a460]/70">
                  Competition standings across the red planet
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/40 text-[12px] font-black text-[#f4a460] uppercase tracking-[0.2em]">
                      <th className="px-10 py-6 text-center">Rank</th>
                      <th className="px-10 py-6">Player</th>
                      <th className="px-10 py-6 text-right">Score</th>
                      <th className="px-10 py-6 text-right">Max Streak</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    <Row rank={4} name="Marcus_V" score="8,740" streak={12} />
                    <Row rank={5} name="Luna.Tech" score="7,215" streak={8} />
                    <Row rank={42} name="You (Me)" score="4,120" streak={15} highlight />
                    <Row rank={43} name="Zander_99" score="3,980" streak={4} />
                  </tbody>
                </table>
              </div>

            </div>

            {/* PERFORMANCE PANEL */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="bg-black/30 backdrop-blur-xl border border-[#d15b2c]/20 rounded-[2rem] p-10 flex flex-col gap-10 shadow-2xl">

                <h4 className="text-2xl font-black uppercase">
                  Your Performance
                </h4>

                <div className="grid grid-cols-2 gap-5">
                  <Stat label="Global Rank" value="#42" highlight />
                  <Stat label="Percentile" value="Top 12%" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Next Reward Tier</span>
                    <span className="text-[#f4a460] font-bold uppercase">
                      Ancient Relay
                    </span>
                  </div>

                  <div className="w-full h-4 bg-black/40 rounded-full border border-white/5 p-1">
                    <div className="w-[72%] h-full bg-gradient-to-r from-[#b44c3c] to-[#f4a460] rounded-full" />
                  </div>

                  <p className="text-sm text-center text-gray-400 mt-2">
                    Reach <span className="text-[#f4a460] font-bold">4,960 pts</span> for Top 10%
                  </p>
                </div>

                <button className="w-full bg-[#d15b2c] hover:bg-[#b44c3c] py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                  Extract Rewards
                </button>

              </div>
            </aside>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-10 px-12 bg-black/30 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto flex justify-between text-gray-400 text-sm">
            <p>© 2025 Opulence Mars Foundation</p>
            <div className="flex gap-8">
              <a className="hover:text-[#f4a460]">Colony Terms</a>
              <a className="hover:text-[#f4a460]">Data Protocol</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Podium({ rank, name, score, type, large }) {
  const colors = {
    gold: "border-[#FFD700]",
    silver: "border-[#E2E8F0]",
    bronze: "border-[#CD7F32]",
  };

  return (
    <div className={`flex flex-col items-center ${large ? "scale-110" : ""}`}>
      <div className={`rounded-full border-4 ${colors[type]} ${large ? "size-44" : "size-32"} mb-4`} />
      <h3 className={`font-bold ${large ? "text-2xl" : "text-xl"}`}>{name}</h3>
      <p className="text-[#f4a460] font-bold">{score}</p>
      <span className="mt-1 font-black">#{rank}</span>
    </div>
  );
}

function Row({ rank, name, score, streak, highlight }) {
  return (
    <tr className={`${highlight ? "bg-[#d15b2c]/15 border-l-4 border-[#f4a460]" : "hover:bg-white/5"} transition`}>
      <td className="px-10 py-6 text-center font-bold text-[#f4a460]">{rank}</td>
      <td className="px-10 py-6 font-bold">{name}</td>
      <td className="px-10 py-6 text-right font-black">{score}</td>
      <td className="px-10 py-6 text-right text-[#f4a460] font-bold">
        {streak} ⚡
      </td>
    </tr>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-black/40 rounded-3xl p-6 border border-white/5">
      <span className="text-[11px] text-[#f4a460]/60 uppercase font-bold block mb-2">
        {label}
      </span>
      <span className={`text-4xl font-black ${highlight ? "text-[#f4a460]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default Leaderboard;
  