
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Rapidfire() {
  const [token, setToken] = useState("");

  // Clear stale token on mount — user must re-enter if they come here
  useState(() => localStorage.removeItem("userToken"));

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
        localStorage.setItem("userToken", token); // Store for reload/resume
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
    <div className="min-h-screen text-white font-['Space_Grotesk'] bg-gradient-to-br from-[#451a03] to-[#1a0b08] overflow-hidden">

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen">

        {/* HEADER */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-md mb-6">
            <span className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase">High Intensity Mode</span>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-2">
            Rapid <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Fire</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide">
            Speed is your only ally. Solve as many problems as possible before the clock runs out.
          </p>
        </div>

        {/* CARD */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* LEFT: STATS */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400 group-hover:scale-110 transition">
                  <span className="material-symbols-outlined text-3xl">timer</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Time Pressure</h3>
                  <p className="text-sm text-gray-400">3 minutes per question. No turning back.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-lg bg-red-500/20 text-red-400 group-hover:scale-110 transition">
                  <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Streak Bonus</h3>
                  <p className="text-sm text-gray-400">Maintain a streak for maximum points.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition">
                  <span className="material-symbols-outlined text-3xl">emoji_events</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Leaderboard</h3>
                  <p className="text-sm text-gray-400">Compete with top coders globally.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: ACTION */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Questions", value: "15" },
                { label: "Duration", value: "45m" },
                { label: "Difficulty", value: "Mixed" },
                { label: "Format", value: "Seq" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-black/20 border border-white/5">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* START BUTTON / LOGIN INPUT */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <div className="flex items-center px-4 text-orange-400">
                  <span className="material-symbols-outlined">key</span>
                </div>

                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ENTER ACCESS TOKEN"
                  className="flex-1 bg-transparent px-4 text-white placeholder:text-orange-200/40 focus:outline-none"
                />

                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="px-10 bg-orange-600 hover:bg-orange-500 font-bold transition shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "JOINING..." : "JOIN"}
                </button>
              </div>
              {error && <p className="mt-3 text-red-500 text-xs font-bold text-center">{error}</p>}
              <p className="mt-4 text-[11px] uppercase tracking-[0.5em] text-orange-300/40 text-center font-bold">
                Secure uplink established
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Rapidfire;
