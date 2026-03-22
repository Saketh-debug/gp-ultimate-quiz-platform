import { motion } from "framer-motion";

export default function IntroSection() {
  return (
    <div className="relative h-screen flex items-center justify-center px-4">

      <div className="text-center">

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm uppercase tracking-[0.4em] text-[#fdba87] font-bold mb-6"
        >
          AAC PRESENTS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="opulence-title-font text-[clamp(4.5rem,10vw,8rem)] leading-[0.95] bg-gradient-to-r from-[#f7ddb2] via-[#f3b16f] to-[#ff7a3d] bg-clip-text text-transparent drop-shadow-[0_6px_0_rgba(20,4,3,0.9)]"
        >
          WELCOME TO
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="opulence-title-font text-[clamp(5.5rem,13vw,10rem)] leading-[0.9] bg-gradient-to-r from-[#f7ddb2] via-[#f3b16f] to-[#ff7a3d] bg-clip-text text-transparent drop-shadow-[0_6px_0_rgba(20,4,3,0.9)] mt-3"
        >
          OPULENCE
        </motion.h2>

      </div>

    </div>
  );
}