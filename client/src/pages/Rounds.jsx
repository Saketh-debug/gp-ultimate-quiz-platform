
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────
   Round data
───────────────────────────────────────────── */
const ROUNDS = [
  {
    id: 0,
    key: "rapidfire",
    name: "Rapid Fire",
    icon: "bolt",
    subtitle: "Speed is your weapon",
    description:
      "High-speed trivia blitz. Answer fast, score big. Every second counts on the red plains. Burn through questions before the clock burns you.",
    chips: ["50 min", "Speed", "Quick-witted "],
    image: "/images/rapid-fire.png",
    to: "/rapidfire",
    accent: "#f97316",
    sector: "ALPHA-1",
  },
  {
    id: 1,
    key: "cascade",
    name: "Coding Cascade",
    icon: "code",
    subtitle: "Chain your solutions",
    description:
      "A waterfall of algorithmic challenges. Chain your solutions and conquer the canyon. Each problem unlocks the next — think in sequences.",
    chips: ["60 min", "Streak", "Decisive"],
    image: "/images/coding_cascade.png",
    to: "/cascade",
    accent: "#f97316",
    sector: "BETA-2",
  },
  {
    id: 2,
    key: "dsa",
    name: "DSA Arena",
    icon: "account_tree",
    subtitle: "Prove your mastery",
    description:
      "Data Structures & Algorithms arena. Navigate complex structures under the Martian sky. Only the most efficient solutions survive the hidden tests.",
    chips: ["120 min", "Competitive", "Optimal"],
    image: "/images/dsa.png",
    to: "/dsa",
    accent: "#f97316",
    sector: "GAMMA-3",
  },
];

/* ─────────────────────────────────────────────
   Offline SVG Icons
───────────────────────────────────────────── */
function IconSVG({ name, className = "", style = {} }) {
  const paths = {
    bolt: "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z",
    code: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
    account_tree: "M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z",
    rocket_launch: "M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .269 11 5.94C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.5 15.88 15.19 18.06 13C23.73 7.34 21.61 2.39 21.61 2.39M14.5 9.5C13.4 9.5 12.5 8.6 12.5 7.5C12.5 6.4 13.4 5.5 14.5 5.5C15.6 5.5 16.5 6.4 16.5 7.5C16.5 8.6 15.6 9.5 14.5 9.5Z"
  };
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
      <path d={paths[name] || ""} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Rover SVG — detailed with animated wheels
───────────────────────────────────────────── */
function RoverSVG({ moving = false }) {
  return (
    <svg
      viewBox="0 0 140 75"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 10px rgba(249,115,22,0.5))", overflow: "visible" }}
    >
      {/* Solar panel */}
      <rect x="28" y="8" width="70" height="11" rx="2" fill="#0f2d4a" stroke="#3b82f6" strokeWidth="1.2" />
      <line x1="63" y1="8" x2="63" y2="19" stroke="#3b82f6" strokeWidth="0.9" />
      <line x1="46" y1="8" x2="46" y2="19" stroke="#3b82f6" strokeWidth="0.9" />
      <line x1="80" y1="8" x2="80" y2="19" stroke="#3b82f6" strokeWidth="0.9" />
      {/* Solar panel glow */}
      <rect x="28" y="8" width="70" height="11" rx="2" fill="rgba(59,130,246,0.08)" />

      {/* Camera mast */}
      <line x1="95" y1="19" x2="95" y2="5" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="95" cy="4" r="4" fill="#f97316" />
      <circle cx="95" cy="4" r="2" fill="#fff" opacity="0.8" />

      {/* Body */}
      <rect x="18" y="18" width="90" height="28" rx="6" fill="#200c0c" stroke="#f97316" strokeWidth="1.8" />
      {/* Body detail lines */}
      <line x1="60" y1="19" x2="60" y2="45" stroke="rgba(249,115,22,0.2)" strokeWidth="0.8" />
      <rect x="25" y="23" width="25" height="8" rx="2" fill="rgba(249,115,22,0.1)" stroke="rgba(249,115,22,0.3)" strokeWidth="0.8" />

      {/* Glow eye / sensor */}
      <circle cx="100" cy="32" r="5" fill="#f97316" opacity="0.9" />
      <circle cx="100" cy="32" r="2.5" fill="#fff" opacity="0.85" />
      <circle cx="100" cy="32" r="7" fill="none" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />

      {/* Antenna */}
      <line x1="30" y1="18" x2="22" y2="10" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="9" r="2" fill="#f97316" opacity="0.7" />

      {/* Wheel struts */}
      <line x1="32" y1="44" x2="26" y2="54" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="63" y1="44" x2="63" y2="54" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="95" y1="44" x2="101" y2="54" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />

      {/* Wheels with inner detail */}
      {[
        { cx: 21, cy: 61 },
        { cx: 63, cy: 61 },
        { cx: 108, cy: 61 },
      ].map(({ cx, cy }, i) => (
        <g key={i} style={{ transformOrigin: `${cx}px ${cy}px`, animation: moving ? `wheel-spin 0.5s linear infinite` : "none" }}>
          <circle cx={cx} cy={cy} r="11" fill="#151515" stroke="#f97316" strokeWidth="2.2" />
          <circle cx={cx} cy={cy} r="5" fill="#260a0a" />
          <line x1={cx} y1={cy - 11} x2={cx} y2={cy + 11} stroke="rgba(249,115,22,0.4)" strokeWidth="1" />
          <line x1={cx - 11} y1={cy} x2={cx + 11} y2={cy} stroke="rgba(249,115,22,0.4)" strokeWidth="1" />
          <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} stroke="rgba(249,115,22,0.3)" strokeWidth="0.8" />
          <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} stroke="rgba(249,115,22,0.3)" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Flag SVG — active vs inactive
───────────────────────────────────────────── */
function FlagSVG({ active = false, size = 120 }) {
  const poleColor = active ? "#f97316" : "#5c2020";
  const flagColor = active ? "#f97316" : "#6b2a2a";
  return (
    <svg
      viewBox="0 0 36 72"
      width={size * 0.6}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: active ? "drop-shadow(0 0 14px rgba(249,115,22,0.9))" : "none",
        transition: "filter 0.5s ease, width 0.4s ease, height 0.4s ease",
        overflow: "visible",
      }}
    >
      {/* Base ring (active only) */}
      {active && (
        <ellipse
          cx="16"
          cy="70"
          rx="12"
          ry="4"
          fill="rgba(249,115,22,0.25)"
          style={{ animation: "pulse-ring 1.8s ease-in-out infinite" }}
        />
      )}
      {/* Pole */}
      <line x1="16" y1="4" x2="16" y2="68" stroke={poleColor} strokeWidth="3" strokeLinecap="round" />
      {/* Base */}
      <ellipse cx="16" cy="68" rx="10" ry="3" fill={active ? "#f97316" : "#4b1818"} opacity="0.7" />
      {/* Flag */}
      <polygon
        points="16,6 34,14 16,22"
        fill={flagColor}
        opacity={active ? 1 : 0}
        style={{ transformOrigin: "16px 14px", animation: active ? "flag-wave 2s ease-in-out infinite" : "none" }}
      />
      {/* Flag shine */}
      {active && (
        <polygon points="16,6 34,14 16,22" fill="rgba(255,255,255,0.12)" style={{ transformOrigin: "16px 14px", animation: "flag-wave 2s ease-in-out infinite" }} />
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Terrain SVG
───────────────────────────────────────────── */
function TerrainSVG() {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" style={{ height: 120 }}>
      {/* Far terrain layer */}
      <path
        d="M0,80 Q180,55 360,72 Q540,90 720,60 Q900,35 1080,68 Q1260,88 1440,65 L1440,120 L0,120 Z"
        fill="rgba(100,30,10,0.18)"
      />
      {/* Mid terrain layer */}
      <path
        d="M0,92 Q200,70 400,85 Q600,100 800,75 Q1000,55 1200,82 Q1320,92 1440,80 L1440,120 L0,120 Z"
        fill="rgba(180,50,10,0.12)"
        stroke="rgba(249,115,22,0.2)"
        strokeWidth="1"
      />
      {/* Ground level */}
      <path
        d="M0,108 Q360,100 720,106 Q1080,112 1440,104 L1440,120 L0,120 Z"
        fill="rgba(249,115,22,0.06)"
        stroke="rgba(249,115,22,0.15)"
        strokeWidth="0.8"
      />

      {/* Scattered rocks */}
      {[80, 220, 480, 650, 870, 1050, 1280, 1380].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={108 + (i % 3)} rx={6 + (i % 4) * 3} ry={3 + (i % 2) * 2} fill="rgba(180,60,10,0.35)" />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Dust particle component
───────────────────────────────────────────── */
function DustParticle({ x, delay, size = 4 }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        bottom: 4,
        left: x,
        background: "radial-gradient(circle, rgba(249,115,22,0.8) 0%, transparent 70%)",
        animation: `dust-puff 0.8s ease-out ${delay}s forwards`,
        animationIterationCount: "infinite",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Starfield
───────────────────────────────────────────── */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 55,
  s: Math.random() * 1.8 + 0.4,
  o: Math.random() * 0.5 + 0.2,
  d: Math.random() * 4,
}));

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function Rounds() {
  const [activeRound, setActiveRound] = useState(0);
  const [cardVisible, setCardVisible] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [roverX, setRoverX] = useState(null);
  const [roverWidth, setRoverWidth] = useState(140);
  const [direction, setDirection] = useState(1); // 1=right, -1=left
  const trackRef = useRef(null);
  const flagRefs = useRef([]);
  const scrollLock = useRef(false);
  const roverMounted = useRef(false);
  const movingTimer = useRef(null);

  /* ── Flag positions (% of track) ── */
  const FLAG_POSITIONS = useMemo(() => {
    if (ROUNDS.length === 1) return ["50%"];
    if (ROUNDS.length === 2) return ["20%", "80%"];
    return ["16%", "50%", "90%"];
  }, []);

  const getRoverWidth = useCallback(() => {
    if (window.innerWidth < 640) return 104;
    if (window.innerWidth < 1024) return 122;
    return 140;
  }, []);

  /* ── Compute rover pixel X from flag ── */
  const updateRoverPosition = useCallback((index) => {
    const flag = flagRefs.current[index];
    const track = trackRef.current;
    if (!flag || !track) return;
    const flagRect = flag.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const flagCenterX = flagRect.left + flagRect.width / 2 - trackRect.left;
    const nextWidth = getRoverWidth();
    setRoverWidth(nextWidth);
    setRoverX(flagCenterX - nextWidth * 0.86); // stops just before the flag
  }, [getRoverWidth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateRoverPosition(activeRound);
      roverMounted.current = true;
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!roverMounted.current) return;
    updateRoverPosition(activeRound);
  }, [activeRound, updateRoverPosition]);

  useEffect(() => {
    const handler = () => {
      setRoverWidth(getRoverWidth());
      updateRoverPosition(activeRound);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [activeRound, getRoverWidth, updateRoverPosition]);

  /* ── Navigate ── */
  const goTo = useCallback(
    (index) => {
      if (index < 0 || index >= ROUNDS.length || index === activeRound) return;
      setDirection(index > activeRound ? 1 : -1);
      setIsMoving(true);
      setCardVisible(false);

      clearTimeout(movingTimer.current);
      movingTimer.current = setTimeout(() => {
        setActiveRound(index);
        setCardVisible(true);
        // keep wheels spinning briefly after arriving
        setTimeout(() => setIsMoving(false), 400);
      }, 280);
    },
    [activeRound]
  );

  /* ── Scroll ── */
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (scrollLock.current) return;
      scrollLock.current = true;
      if (e.deltaY > 0) goTo(Math.min(activeRound + 1, ROUNDS.length - 1));
      else goTo(Math.max(activeRound - 1, 0));
      setTimeout(() => { scrollLock.current = false; }, 420);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [activeRound, goTo]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(Math.min(activeRound + 1, ROUNDS.length - 1));
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(Math.max(activeRound - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeRound, goTo]);

  const round = ROUNDS[activeRound];

  return (
    <div
      className="relative h-[100svh] w-full overflow-hidden text-white select-none"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="absolute left-4 top-4 z-50 sm:left-6 sm:top-6">
        <Link to="/" className="group flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full  transition group-hover:bg-white/5 sm:h-14 sm:w-14">
            <span className="material-symbols-outlined text-3xl text-white/80 sm:text-[2.25rem]">
              keyboard_double_arrow_left
            </span>
          </div>
        </Link>
      </div>
      {/* ── BACKGROUND: Mars sunset illustration ── */}
      {/* Base illustration — full opacity */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/martian-bg.png)", backgroundPosition: "center 30%", zIndex: -10 }}
      />
      {/* Dark vignette overlay — keeps UI readable, preserves warm tones */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: -9,
          background:
            "linear-gradient(to bottom, rgba(10,3,3,0.28) 0%, rgba(10,3,3,0.08) 35%, rgba(10,3,3,0.18) 65%, rgba(10,3,3,0.68) 100%)",
        }}
      />
      {/* Side edge vignettes */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: -9,
          background:
            "linear-gradient(to right, rgba(8,2,2,0.25) 0%, transparent 20%, transparent 80%, rgba(8,2,2,0.25) 100%)",
        }}
      />
      {/* Warm horizon glow — echoes the sun in the art */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: -8,
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 200,
          background: "radial-gradient(ellipse at center, rgba(251,146,60,0.15) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      {/* Bottom terrain warm glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: -8,
          bottom: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          height: 80,
          background: "radial-gradient(ellipse at center, rgba(249,115,22,0.1) 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* ── STARFIELD (subtle — illustration already has atmosphere) ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y * 0.4}%`, // push stars to top 40% only
              width: s.s * 0.8,
              height: s.s * 0.8,
              opacity: s.o * 0.4, // more subtle — background has its own sky
              animation: `twinkle ${3 + s.d}s ease-in-out infinite`,
              animationDelay: `${s.d}s`,
            }}
          />
        ))}
      </div>

      {/* ── AMBIENT DUST PARTICLES ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 70}%`,
              left: `${Math.random() * 100}%`,
              background: "rgba(249,115,22,0.15)",
              animation: `float-dust ${6 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      {/* ── TOP NAV ── */}
      <nav className="relative z-40 flex h-20 items-center justify-center px-4 sm:h-24 sm:px-8"
      >

        <h2 className="text-3xl font-black tracking-tight uppercase italic sm:text-4xl lg:text-5xl" style={{ letterSpacing: "0.04em" }}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">G-</span>Prime
        </h2>

      </nav>


      {/* ── MAIN AREA ── */}
      <div className="relative flex h-[calc(100svh-5rem)] flex-col sm:h-[calc(100svh-6rem)]">


        {/* ── ROUND CARD (main content) ── */}
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-40 pt-2 sm:px-6 sm:pb-48 lg:pb-52">
          <div
            style={{
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible
                ? "translateY(0) scale(1)"
                : `translateY(${direction > 0 ? 28 : -28}px) scale(0.97)`,
              transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              width: "100%",
              maxWidth: 760,
              maxHeight: "100%",
            }}
          >
            {/* Glass card */}
            <div
              className="overflow-hidden rounded-[1.75rem] sm:rounded-3xl"
              style={{
                background: "rgba(30, 8, 8, 0.78)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(249,115,22,0.22)",
                boxShadow: "0 0 90px rgba(249,115,22,0.1), 0 12px 48px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Image strip */}
              <div
                className="relative bg-cover bg-center overflow-hidden"
                style={{
                  height: "clamp(160px, 24vh, 280px)",
                  backgroundImage: `url("${round.image}")`,
                  backgroundPosition: round.key === "dsa" ? "center 42%" : "center",
                }}
              >
                {/* Gradient overlays */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(30,8,8,0) 0%, rgba(30,8,8,0.85) 100%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(249,115,22,0.12) 0%, transparent 60%)" }} />
                <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, rgba(249,115,22,0.16), transparent)" }} />

                {/* Round number */}
                <div
                  className="absolute top-5 left-5 flex items-center justify-center font-black text-black text-sm rounded-full"
                  style={{
                    width: 44,
                    height: 44,
                    background: "linear-gradient(135deg, #f97316, #dc2626)",
                    boxShadow: "0 0 24px rgba(249,115,22,0.5)",
                  }}
                >
                  {activeRound + 1}
                </div>

                {/* Sector tag */}
                <div
                  className="absolute top-5 right-5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}
                >
                  {round.sector}
                </div>

                {/* Bottom content overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 sm:px-7 sm:pb-6">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-orange-400/70">{round.subtitle}</p>
                  <div className="h-px w-24 bg-gradient-to-r from-orange-500/80 to-transparent" />
                </div>
              </div>

              {/* Card body */}
              <div className="space-y-4 px-5 py-5 sm:space-y-6 sm:px-8 sm:py-8">
                {/* Title row */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{ width: 48, height: 48, minWidth: 48, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)" }}
                  >
                    <IconSVG name={round.icon} className="text-orange-500" style={{ fontSize: 22 }} />
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-[2.1rem]" style={{ letterSpacing: "-0.02em" }}>
                    {round.name}
                  </h1>
                </div>

                <p className="text-sm leading-relaxed text-white/60 sm:text-[15px]">{round.description}</p>

                {/* Chips */}
                <div className="flex flex-wrap gap-2 pb-1 sm:gap-3 sm:pb-3">
                  {round.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {/* CTA button */}
                <Link to={round.to}>
                  <button
                    className="group relative h-12 w-full overflow-hidden rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 sm:h-14"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(249,115,22,0.35)",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f97316";
                      e.currentTarget.style.color = "#000";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(249,115,22,0.45)";
                      e.currentTarget.style.borderColor = "#f97316";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "rgba(249,115,22,0.35)";
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <IconSVG name="rocket_launch" className="text-base h-7 w-6" />
                      Enter Mission
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── TERRAIN TRACK ── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 w-full" style={{ height: "clamp(160px, 24vh, 220px)" }}>
          {/* SVG terrain */}
          <TerrainSVG />

          {/* Track ref container */}
          <div ref={trackRef} className="absolute inset-0">

            {/* Ground track line */}
            <div
              className="absolute"
              style={{
                bottom: "clamp(56px, 7vh, 72px)",
                left: "6%",
                right: "6%",
                height: 2,
                background: "linear-gradient(to right, transparent, rgba(249,115,22,0.3) 15%, rgba(249,115,22,0.3) 85%, transparent)",
              }}
            />

            {/* Track dots */}
            {Array.from({ length: 22 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  bottom: "clamp(56px, 7vh, 72px)",
                  left: `${8 + i * 4}%`,
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: i / 22 <= activeRound / (ROUNDS.length - 1) ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.08)",
                  transition: "background 0.7s ease",
                  transform: "translateY(50%)",
                }}
              />
            ))}

            {/* Progress fill */}
            <div
              className="absolute"
              style={{
                bottom: "clamp(55px, 7vh, 71px)",
                left: "8%",
                width: `${activeRound === 0 ? 1 : activeRound === 1 ? 42 : 84}%`,
                height: 4,
                borderRadius: 2,
                background: "linear-gradient(to right, rgba(249,115,22,0.9), rgba(249,115,22,0.3))",
                boxShadow: "0 0 10px rgba(249,115,22,0.4)",
                transition: "width 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            />

            {/* Rover + dust trail */}
            {roverX !== null && (
              <div
                className="absolute"
                style={{
                  bottom: "clamp(54px, 7vh, 70px)",
                  left: roverX,
                  width: roverWidth,
                  transition: roverMounted.current ? "left 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
                  zIndex: 10,
                }}
              >
                {/* Dust trail (left side, behind rover) */}
                {isMoving && (
                  <>
                    <DustParticle x={direction > 0 ? -24 : roverWidth + 10} delay={0} size={8} />
                    <DustParticle x={direction > 0 ? -16 : roverWidth + 18} delay={0.1} size={5} />
                    <DustParticle x={direction > 0 ? -9 : roverWidth + 25} delay={0.18} size={4} />
                    <DustParticle x={direction > 0 ? -2 : roverWidth + 32} delay={0.25} size={3} />
                  </>
                )}
                {/* Ground shadow */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -4,
                    left: 10,
                    right: 10,
                    height: 8,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)",
                  }}
                />
                {/* Rover body bob */}
                <div style={{ animation: isMoving ? "rover-bob 0.22s ease-in-out infinite" : "none", transformOrigin: "bottom left" }}>
                  <RoverSVG moving={isMoving} />
                </div>
              </div>
            )}

            {/* Flags */}
            {ROUNDS.map((r, i) => {
              const isActive = i === activeRound;
              return (
                <button
                  key={r.key}
                  ref={(el) => (flagRefs.current[i] = el)}
                  onClick={() => goTo(i)}
                  className="pointer-events-auto absolute flex cursor-pointer flex-col items-center group"
                  style={{
                    bottom: "clamp(58px, 7vh, 74px)",
                    left: FLAG_POSITIONS[i],
                    transform: "translateX(-50%)",
                    zIndex: 5,
                    transition: "filter 0.3s ease",
                  }}
                  aria-label={`Navigate to ${r.name}`}
                >
                  {/* Hover glow on inactive */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)", transform: "scale(3)" }}
                    />
                  )}

                  <FlagSVG active={isActive} size={isActive ? 60 : 42} />

                  {/* Label */}
                  <span
                    className="absolute text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-400"
                    style={{
                      opacity: isActive ? 1 : 0,
                      top: "100%",
                      marginTop: 10,
                      color: isActive ? "#f97316" : "rgba(255,255,255,0.25)",
                      textShadow: isActive ? "0 0 16px rgba(249,115,22,0.8)" : "none",
                    }}
                  >
                    {r.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>


      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @keyframes wheel-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes rover-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-2px); }
        }
        @keyframes dust-puff {
          0%   { transform: scale(1) translateY(0); opacity: 0.8; }
          100% { transform: scale(3.5) translateY(-18px); opacity: 0; }
        }
        @keyframes flag-wave {
          0%, 100% { transform: rotate(0deg); }
          30%       { transform: rotate(6deg); }
          70%       { transform: rotate(-3deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1);   opacity: 0.4; }
          50%       { transform: scale(1.5); opacity: 0.1; }
        }
        @keyframes float-dust {
          0%, 100% { transform: translateY(0)   translateX(0);   opacity: 0.3; }
          33%       { transform: translateY(-14px) translateX(5px); opacity: 0.7; }
          66%       { transform: translateY(-7px)  translateX(-4px); opacity: 0.5; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: var(--o, 0.3); transform: scale(1); }
          50%       { opacity: 0.05;          transform: scale(0.6); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}