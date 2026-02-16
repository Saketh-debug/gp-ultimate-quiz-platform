import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login({ onJoin }) {
  const [token, setToken] = useState("");

  async function handleJoin() {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (res.ok) onJoin(data);
    else alert(data.error);
  }

  return (
    <div className="min-h-screen bg-[#1a0805] text-white font-['Space_Grotesk'] overflow-x-hidden">
      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-600/30 via-[#4a0e05] to-[#1a0805]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-orange-500/20 blur-[160px]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-10">

        {/* TOP BAR */}
        <header className="flex items-center justify-between py-10">
          <span className="material-symbols-outlined text-orange-400 text-3xl">
            rocket_launch
          </span>

          <p className="text-sm uppercase tracking-[0.4em] text-orange-200/70 font-bold">
            AAC PRESENTS
          </p>

          <span className="material-symbols-outlined text-white/70 text-3xl">
            account_circle
          </span>
        </header>

        {/* HERO */}
        <section className="grid grid-cols-12 gap-16 items-center min-h-[70vh]">
          {/* LEFT */}
          <div className="col-span-7">
            <h1 className="text-[96px] font-black tracking-tighter leading-none drop-shadow-[4px_4px_0_rgba(0,0,0,0.35)]">
              OPULENCE
            </h1>

            <p className="mt-4 text-xl tracking-[0.3em] text-orange-200 font-bold">
              19TH JULY, 2025
            </p>

            <p className="mt-8 max-w-xl text-orange-200/60 text-lg leading-relaxed">
              Enter your access token to initiate secure uplink and begin the
              high-stakes coding challenge.
            </p>
          </div>

          {/* RIGHT – JOIN BOX */}
          <div className="col-span-5">
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
                  className="px-10 bg-orange-600 hover:bg-orange-500 font-bold transition shadow-lg shadow-orange-500/30"
                >
                  JOIN
                </button>
              </div>

              <p className="mt-4 text-[11px] uppercase tracking-[0.5em] text-orange-300/40 text-center font-bold">
                Secure uplink established
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-3 gap-10 mt-24">
          {[
            ["PRIZE POOL", "$100,000"],
            ["PARTICIPANTS", "2,400+"],
            ["DURATION", "48 HOURS"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-10"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-orange-400 font-bold">
                {label}
              </p>
              <p className="mt-3 text-4xl font-black text-white">
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ARENA */}
        <section className="mt-32">
          <div className="flex items-center gap-12 mb-16 border-l-4 border-orange-500 pl-8">
            <div>
              <h2 className="text-5xl font-black tracking-tight uppercase mb-4">
                THE ARENA
              </h2>
              <p className="text-orange-200/60 max-w-2xl text-lg">
                Where code meets planetary-scale competition. Only the most
                precise engineers survive.
              </p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-10">
            {[
              ["security", "Absolute Security", "Encrypted, isolated execution environments."],
              ["bolt", "Performance", "Ultra-low latency real-time judging."],
              ["verified_user", "Exclusivity", "Invite-only elite participation."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/30">
                  <span className="material-symbols-outlined text-orange-400 text-3xl">
                    {icon}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-black uppercase">
                  {title}
                </h3>
                <p className="mt-3 text-orange-200/50 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-32 text-center">
          <h2 className="text-5xl font-black tracking-tight">
            READY TO DOMINATE?
          </h2>

          <p className="mt-6 max-w-2xl mx-auto text-orange-200/60">
            Finalize your uplink credentials before transmission windows close.
          </p>

          <div className="mt-10 flex justify-center gap-6">
            <Link to="/Rounds">
              <button className="h-14 px-10 rounded-xl border border-white/20 text-white font-bold">
                Review Rules
              </button>
            </Link>

            <Link to="/leaderboard">
              <button className="h-14 px-10 rounded-xl bg-orange-600 hover:bg-orange-500 font-bold shadow-lg shadow-orange-500/30">
                Leaderboard
              </button>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-32 py-10 border-t border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-orange-200/40 font-bold">
            © 2025 OPULENCE MARTIAN ARENA
          </p>
        </footer>
      </div>
    </div>
  );
}
