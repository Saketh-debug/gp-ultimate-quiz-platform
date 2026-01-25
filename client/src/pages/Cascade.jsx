import React from 'react'
import { Link } from 'react-router-dom'

function Cascade() {
  return (
    <div className="min-h-screen bg-background-dark text-white font-display">

      {/* PAGE WIDTH */}
      <div className="mx-auto max-w-6xl pb-40">

        {/* TOP NAV */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background-dark/90 backdrop-blur-md border-b border-white/5">
          <button className="w-12 h-12 flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <h2 className="text-lg font-bold tracking-tight">
            Round 2: Coding Cascade
          </h2>

          <div className="w-12" />
        </div>

        {/* HEADER VISUAL */}
        <section className="mt-6 px-6">
          <div
            className="relative min-h-[260px] rounded-xl overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6S9RvAGlw2Idj7uAbHjfP1lhdd9bDr4MEQKHTTw3RQYqdkHGiehvTA7QsGBMzzAq4H72erF0DjE1yewWeIRSuy5Ty0iO-NTCBgWH4WqPMwLW0IQAWbrj-PhERWMSlOXUgHekWPGLF1YApq3ZUTsogteuAAq8X-khaiHFXdX8nv0H6SDhkBssC3-o1_GqAAMwrqO1secDXmpvnd5lJFVCKme5xXsSJto0Co5z5yezNfVs5aF6alUAOhkPFBkGAc9hgESmN-eVSyuA")',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,89,242,0.15),transparent)]" />

            <div className="relative p-8">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-sm">bolt</span>
                Active Round
              </span>

              <h1 className="text-4xl font-bold tracking-tight">
                Coding Cascade
              </h1>
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}
        <section className="px-6 mt-6">
          <p className="text-white/70 leading-relaxed max-w-3xl">
            Speed meets precision. Solve complex algorithmic problems in sequence
            to build your multiplier. Every correct answer fuels the cascade, but
            a mistake resets the flow.
          </p>
        </section>

        {/* QUICK STATS */}
        <section className="px-6 mt-6 grid grid-cols-2 gap-6">
          <div className="rounded-xl p-6 bg-[#222f49] border border-white/5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined">schedule</span>
              <span className="uppercase text-sm text-white/60 tracking-wider">
                Duration
              </span>
            </div>
            <p className="text-2xl font-bold">1 Hour</p>
          </div>

          <div className="rounded-xl p-6 bg-[#222f49] border border-white/5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <span className="material-symbols-outlined">quiz</span>
              <span className="uppercase text-sm text-white/60 tracking-wider">
                Questions
              </span>
            </div>
            <p className="text-2xl font-bold">15 Qs</p>
          </div>
        </section>

        {/* STREAK INFOGRAPHIC */}
        <section className="px-6 mt-10">
          <div className="relative rounded-xl p-6 bg-primary/5 border border-primary/20 overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                trending_up
              </span>
              Streak Multiplier Logic
            </h3>

            <div className="relative space-y-4">
              {[
                ["1x", "Base Points"],
                ["1.5x", "3 Correct Streak"],
                ["2.5x", "7+ Streak (Elite)"],
              ].map(([value, label], i) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center shadow-[0_0_15px_rgba(13,89,242,0.4)]">
                    {value}
                  </div>
                  <div className="flex-1 h-px bg-white/10" />
                  <span
                    className={`text-sm ${
                      i > 0 ? "text-primary font-medium" : "text-white/80"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}

              <div className="absolute left-[19px] top-10 bottom-5 w-0.5 bg-gradient-to-b from-primary to-transparent -z-10" />
            </div>

            <div className="mt-8 p-4 bg-background-dark/50 rounded-lg border border-white/5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-amber-400">
                  warning
                </span>
                <p className="text-xs text-white/60">
                  Warning: Any incorrect submission or skipped question will
                  immediately reset your multiplier to 1.0x.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className="px-6 mt-10">
          <h3 className="text-lg font-bold mb-4">Round Rules</h3>

          <div className="space-y-4">
            {[
              [
                "check_circle",
                "Sequential Order",
                "Questions must be answered in order. You cannot revisit previous questions once submitted.",
              ],
              [
                "terminal",
                "Languages Allowed",
                "Python, C++, Java, and Rust are supported for this round.",
              ],
              [
                "history",
                "Auto-Submission",
                "Your session will automatically submit at the 60-minute mark.",
              ],
            ].map(([icon, title, desc]) => (
              <div key={title} className="flex gap-4">
                <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                  <span className="material-symbols-outlined text-primary text-sm">
                    {icon}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ACTION FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-dark/80 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-xl mx-auto p-6">
          <Link to="/">
          <button className="w-full py-4 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98]">
            ENTER THE CASCADE
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
          </Link>
          <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-white/40">
            Confirming starts your 60-minute timer
          </p>
        </div>
      </div>
    </div>
  )
}

export default Cascade
