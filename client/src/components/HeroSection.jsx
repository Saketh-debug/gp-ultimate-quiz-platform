import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection({ onJoin }) {
  return (
    <section className="relative max-w-[1440px] mx-auto px-10 pt-6 pb-20">
      {/* 🔝 TOP BAR */}
      {/* <header className="flex items-center justify-between py-8">
        <span className="material-symbols-outlined text-orange-400 text-3xl">
          rocket_launch
        </span>

        <p className="text-sm uppercase tracking-[0.4em] text-orange-200/70 font-bold">
          AAC PRESENTS
        </p>

        <span className="material-symbols-outlined text-white/70 text-3xl">
          account_circle
        </span>
      </header> */}

      {/* 🚀 HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center min-h-[75vh]">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="opulence-title-font text-[clamp(4.8rem,10vw,7rem)] leading-[0.95] bg-gradient-to-r from-[#f7ddb2] via-[#f3b16f] to-[#ff7a3d] bg-clip-text text-transparent drop-shadow-[0_6px_0_rgba(20,4,3,0.9)]"
        >
          GPRIME
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-lg tracking-[0.4em] text-orange-200 font-bold"
        >
          19TH JULY, 2025
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 max-w-xl text-orange-200/60 text-lg leading-relaxed"
        >
          Enter your access token to initiate secure uplink and begin the high-stakes coding challenge.
        </motion.p>

        {/* 🔐 JOIN BOX */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 w-full max-w-xl"
        >
          
        </motion.div>
      </section>

      {/* 📊 STATS */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-3 gap-10 mt-24"
      >
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
      </motion.section>

      {/* ⚔️ ARENA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-32"
      >
        <div className="flex items-center gap-12 mb-16 border-l-4 border-orange-500 pl-8">
          <div>
            <h2 className="text-5xl font-black tracking-tight uppercase mb-4">
              THE ARENA
            </h2>
            <p className="text-orange-200/60 max-w-2xl text-lg">
              Where code meets planetary-scale competition. Only the most precise engineers survive.
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
      </motion.section>

      {/* 🚀 CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-32 text-center"
      >
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
      </motion.section>

      {/* 🧾 FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-32 py-10 border-t border-white/10 text-center"
      >
        <p className="text-[10px] uppercase tracking-[0.5em] text-orange-200/40 font-bold">
          © 2025 OPULENCE MARTIAN ARENA
        </p>
      </motion.footer>
    </section>
  );
}
