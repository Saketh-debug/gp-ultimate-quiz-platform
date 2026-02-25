import React, { useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL;

function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/admin/leaderboard`);
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        setError("Failed to load leaderboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen font-['Space_Grotesk'] text-white bg-[linear-gradient(to_bottom,#d15b2c_0%,#7c2114_40%,#1a0b08_100%)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">🏆</div>
          <p className="text-xl text-[#f4a460] font-bold tracking-widest uppercase">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-['Space_Grotesk'] text-white bg-[linear-gradient(to_bottom,#d15b2c_0%,#7c2114_40%,#1a0b08_100%)] flex items-center justify-center">
        <p className="text-red-400 text-xl">{error}</p>
      </div>
    );
  }

  // Separate podium (top 3) and table (rest)
  const podiumTeams = teams.slice(0, 3);
  const tableTeams = teams.slice(3);

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
              Grand <span className="text-[#f4a460]">Leaderboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-[#d15b2c]/20 rounded-lg text-[#f4a460] text-sm font-bold border border-[#d15b2c]/30">
            <span className="material-symbols-outlined text-sm">groups</span>
            {teams.length} TEAMS
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 max-w-[1600px] mx-auto w-full px-12 py-12 flex flex-col gap-16">

          {/* PODIUM */}
          {podiumTeams.length >= 3 && (
            <section className="flex items-end justify-center gap-12 pt-12">
              <Podium rank={2} name={podiumTeams[1].team_name} score={podiumTeams[1].total_score} type="silver" />
              <Podium rank={1} name={podiumTeams[0].team_name} score={podiumTeams[0].total_score} type="gold" large />
              <Podium rank={3} name={podiumTeams[2].team_name} score={podiumTeams[2].total_score} type="bronze" />
            </section>
          )}

          {/* GRID */}
          <div className="grid grid-cols-12 gap-8">

            {/* TABLE */}
            <div className="col-span-12 flex flex-col gap-6">

              <div>
                <h2 className="text-4xl font-black tracking-tight uppercase">
                  Team Rankings
                </h2>
                <p className="text-[#f4a460]/70">
                  Cumulative scores across all rounds
                </p>
              </div>

              <div className="rounded-3xl overflow-hidden bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/40 text-[12px] font-black text-[#f4a460] uppercase tracking-[0.2em]">
                      <th className="px-10 py-6 text-center">Rank</th>
                      <th className="px-10 py-6">Team</th>
                      <th className="px-10 py-6 text-right">Rapid Fire</th>
                      <th className="px-10 py-6 text-right">Cascade</th>
                      <th className="px-10 py-6 text-right">DSA</th>
                      <th className="px-10 py-6 text-right">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {teams.map((team, index) => (
                      <Row
                        key={team.username}
                        rank={index + 1}
                        name={team.team_name}
                        rapidfire={team.rapidfire_score}
                        cascade={team.cascade_score}
                        dsa={team.dsa_score}
                        total={team.total_score}
                        highlight={index < 3}
                      />
                    ))}
                    {teams.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-10 py-12 text-center text-gray-400 italic">
                          No scores recorded yet. Complete a round to see results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-10 px-12 bg-black/30 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto flex justify-between text-gray-400 text-sm">
            <p>© 2025 Grand Prix Quiz Platform</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Podium({ rank, name, score, type, large }) {
  const colors = {
    gold: "border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)]",
    silver: "border-[#E2E8F0] shadow-[0_0_20px_rgba(226,232,240,0.2)]",
    bronze: "border-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.2)]",
  };

  const bgColors = {
    gold: "bg-gradient-to-b from-[#FFD700]/20 to-transparent",
    silver: "bg-gradient-to-b from-[#E2E8F0]/10 to-transparent",
    bronze: "bg-gradient-to-b from-[#CD7F32]/10 to-transparent",
  };

  const emoji = { gold: "🥇", silver: "🥈", bronze: "🥉" };

  return (
    <div className={`flex flex-col items-center ${large ? "scale-110" : ""}`}>
      <div className={`rounded-full border-4 ${colors[type]} ${large ? "size-44" : "size-32"} mb-4 flex items-center justify-center ${bgColors[type]}`}>
        <span className={`${large ? "text-6xl" : "text-4xl"}`}>{emoji[type]}</span>
      </div>
      <h3 className={`font-bold ${large ? "text-2xl" : "text-xl"}`}>{name}</h3>
      <p className="text-[#f4a460] font-bold">{score} pts</p>
      <span className="mt-1 font-black">#{rank}</span>
    </div>
  );
}

function Row({ rank, name, rapidfire, cascade, dsa, total, highlight }) {
  return (
    <tr className={`${highlight ? "bg-[#d15b2c]/15 border-l-4 border-[#f4a460]" : "hover:bg-white/5"} transition`}>
      <td className="px-10 py-6 text-center font-bold text-[#f4a460]">{rank}</td>
      <td className="px-10 py-6 font-bold">{name}</td>
      <td className="px-10 py-6 text-right font-mono">{rapidfire}</td>
      <td className="px-10 py-6 text-right font-mono">{cascade}</td>
      <td className="px-10 py-6 text-right font-mono">{dsa}</td>
      <td className="px-10 py-6 text-right font-black text-lg">{total}</td>
    </tr>
  );
}

export default Leaderboard;
