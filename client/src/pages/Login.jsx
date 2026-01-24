import { useState } from "react";
import { FiArrowRight, FiAward, FiCode, FiUsers, FiZap, FiChevronRight } from 'react-icons/fi';

export default function Login({ onJoin }) {
  const [token, setToken] = useState("");

  async function handleJoin() {
    const res = await fetch("http://localhost:3000/auth/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    if (res.ok) onJoin(data);
    else alert(data.error);
  }

  return (
    <div className="min-h-screen bg-background-dark text-white font-display">
      {/* PAGE WIDTH */}
      <div className="mx-auto max-w-7xl">

        {/* TOP NAV */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="material-symbols-outlined text-primary text-3xl">
            terminal
          </span>

          <h1 className="text-lg font-bold text-zinc-500 dark:text-white">
            Opulence
          </h1>

          <span className="material-symbols-outlined text-zinc-900 dark:text-white">
            account_circle
          </span>
        </div>

        {/* HERO */}
        <section
          className="relative flex flex-col items-center justify-center min-h-[70vh] py-24 rounded-2xl overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(rgba(25,16,34,0.75), rgba(25,16,34,0.95)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuA-G9cgn4QexccJ52P5QtteZaTN6Wra5hT61N0SGWs_-FuW2E3nZNeZGa4la3Cnvx4qnFuV1meCoDw6SWNKhrHukZqSwKHZcCebAGabhzL8UBBSDRyN_GsuNipJO2e2ClHuCz5pbNwphbtQ7SRNSVZzw2_FP05PUjGfcbq5U0-vCgo6iwcj1-t_TKdaexQwk7cRO2PUFdPTAMfq8Wn6zQwN7hoBTQ_IzRAFHe4sFdeSzd8XNAsi-tKeEvnpub6Qi1jhc4ijURakYVo")',
          }}
        >
          <h2 className="text-6xl lg:text-7xl font-black tracking-tight">
            OPULENCE
          </h2>

          <p className="mt-4 text-lg uppercase tracking-widest text-zinc-400">
            The ultimate high-stakes coding arena
          </p>

          {/* ACCESS INPUT */}
          <div className="mt-10 w-full max-w-xl">
            <div className="flex h-16 rounded-xl overflow-hidden bg-zinc-900/80 border border-zinc-800 backdrop-blur">
              <div className="flex items-center px-4 text-zinc-500">
                <span className="material-symbols-outlined">key</span>
              </div>

              <input
                placeholder="Enter Access Token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="flex-1 bg-transparent px-4 text-white placeholder:text-zinc-500 focus:outline-none"
              />

              <button className="px-8 bg-primary text-white font-bold hover:bg-primary/90 transition" onClick={handleJoin}>
                Join
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs uppercase tracking-wider text-zinc-500">
            Invite-only participation
          </p>
        </section>

        {/* STATS */}
        <section className="flex gap-6 mt-12 px-6">
          {[
            ["Prize Pool", "$100,000"],
            ["Participants", "2,400+"],
            ["Duration", "48 Hours"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex-1 rounded-xl bg-zinc-900/70 backdrop-blur-md border border-zinc-800 p-6 hover:bg-zinc-900/90 transition"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">
                {label}
              </p>
              <p className="mt-1 text-2xl font-black text-primary">
                {value}
              </p>
            </div>
          ))}
        </section>

        {/* ARENA */}
        <section className="mt-20 px-6">
          <h3 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            THE ARENA
          </h3>
          <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-400">
            Where code meets high-stakes competition. Only the elite survive the
            most rigorous challenges ever devised.
          </p>

          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              ["shield", "Security", "Fully encrypted environments ensure absolute integrity and fair play."],
              ["bolt", "Performance", "Ultra low-latency evaluation engines for real-time judge feedback."],
              ["lock", "Exclusivity", "Restricted access protocol for verified high-tier software engineers."],
            ].map(([icon, title, desc]) => (
              <div
                key={title}
                className="rounded-xl bg-zinc-900/70 backdrop-blur-md border border-zinc-800 p-6"
              >
                <div className="w-fit p-3 rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h4 className="mt-4 font-bold text-lg">{title}</h4>
                <p className="mt-2 text-sm text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center">
          <h3 className="text-4xl font-black">Ready to dominate?</h3>
          <p className="mt-4 max-w-2xl mx-auto text-zinc-400">
            The arena waits for no one. Request an invite today and prove your
            worth among the global elite.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button className="h-14 px-8 rounded-lg bg-primary text-white font-bold hover:shadow-[0_0_25px_rgba(127,19,236,0.4)] transition">
              Request Access
            </button>
            <button className="h-14 px-8 rounded-lg border border-zinc-700 text-zinc-300">
              Review Rules
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-24 py-6 border-t border-zinc-800 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            © 2024 Opulence Global Arena
          </p>
        </footer>

      </div>
    </div>
    
  );
}
