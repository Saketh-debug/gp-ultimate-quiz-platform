import { motion } from "framer-motion";

export default function IntroSection() {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#3a0d05] via-[#2a0804] to-[#120403]">
      {/* Content */}
      <div className="text-center z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-sm uppercase tracking-[0.4em] text-[#fdba87] font-bold mb-6"
        >
          AAC PRESENTS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="opulence-title-font text-[clamp(4rem,10vw,8rem)] leading-[0.95] bg-gradient-to-r from-[#f7ddb2] via-[#f3b16f] to-[#ff7a3d] bg-clip-text text-transparent drop-shadow-[0_6px_0_rgba(20,4,3,0.9)]"
        >
          WELCOME TO
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
          className="opulence-title-font text-[clamp(4rem,10vw,7rem)] leading-[0.95] bg-gradient-to-r from-[#f7ddb2] via-[#f3b16f] to-[#ff7a3d] bg-clip-text text-transparent drop-shadow-[0_6px_0_rgba(20,4,3,0.9)] mt-4"
        >
          OPULENCE
        </motion.h2>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-orange-400/50 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-orange-400"
          />
        </motion.div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.5em] text-orange-200/40 font-bold text-center">
          Scroll to explore
        </p>
      </motion.div>
    </section>
  );
}
