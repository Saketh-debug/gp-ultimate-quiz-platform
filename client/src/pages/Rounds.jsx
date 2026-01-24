import React from 'react'

function Rounds() {
  return (
    <div className="min-h-screen bg-background-dark font-display text-white">

      {/* PAGE WIDTH */}
      <div className="mx-auto max-w-7xl px-6 pb-32">

        {/* TOP BAR */}
        <div className="sticky top-0 z-50 flex items-center justify-between bg-background-dark/90 backdrop-blur-md py-4 border-b border-primary/20">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            arrow_back_ios_new
          </span>

          <h2 className="text-lg font-bold">Opulence Contest</h2>

          <span className="material-symbols-outlined text-primary cursor-pointer">
            info
          </span>
        </div>

        {/* PROGRESS */}
        <section className="mt-6">
          <div className="rounded-xl bg-[#261933]/70 backdrop-blur-md border border-primary/20 p-5">
            <div className="flex justify-between mb-2">
              <p className="font-medium">Overall Progress</p>
              <p className="text-primary font-bold">1 / 3 Rounds</p>
            </div>

            <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
              <div className="h-full w-1/3 bg-primary shadow-[0_0_15px_rgba(127,19,236,0.4)] rounded-full" />
            </div>

            <p className="mt-2 text-xs text-[#ad92c9]">
              Next up: Rapid Force
            </p>
          </div>
        </section>

        {/* HEADER */}
        <section className="mt-10">
          <h3 className="text-2xl font-bold">Tournament Rounds</h3>
          <p className="text-sm text-[#ad92c9]">
            Complete all rounds to qualify for the grand finale.
          </p>
        </section>

        {/* ROUNDS GRID (DESKTOP) */}
        <section className="mt-8 grid grid-cols-3 gap-6">

          {/* CARD 1 */}
          <div className="rounded-xl bg-[#261933] border border-primary/30 overflow-hidden">
            <div
              className="relative aspect-video bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAWUnXJoowbLn4b1vnu9cSYbMp4SB3WRA1tqsltyBsgam3Ob1cQi8MXE4uMt_oODeMYuSWVNPqXGKXB7BWLKaVPEIpquME5eV--eyeBVwTYcLhKHj0mb00kKtA8nuKHkZg8SSiSKW23Wn4Ts6GuSOj8aL6pdLGdry2xgy9GumQzXlyk1U9Gq_jOVthzzYnGI3QYV46HaCW1s9v6Ca-2V5OzSelGCdaAq06EKsHcuGM0SmrEeRnTWMQ6hrYKci6V-N-6UJ7_1eO1ASM")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#261933] to-transparent" />
              <span className="absolute top-3 right-3 bg-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                Live Now
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    bolt
                  </span>
                  <h4 className="text-xl font-bold">Rapid Force</h4>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                    45m
                  </span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                    3m / q
                  </span>
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded">
                    Speed Bonus
                  </span>
                </div>
              </div>

              <button className="w-full h-12 bg-primary rounded-lg font-bold hover:bg-primary/90 transition">
                Enter Round
              </button>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="rounded-xl bg-[#261933] border border-white/10 opacity-90 overflow-hidden">
            <div
              className="relative aspect-video bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4Dw3TZ-ul2-EbqKmI9yIuonlqjDf3TTTa5Q2DS5qfcBg87jrITJsaMI9xQtfL4jFn_scdtfZRloDEhTrWfLx3RFNywQctYOt9I9taaWu42SQj3YIeiywjTJp_vOWccdKYqBO4x48u3qRjnOSs1rbI_76tLM7nq8B62MR3qnCgncSpX5tkuWqyE9XMEL4CgD0oZbFlxeTir8y_AeeVFpbrgEVdG6e7-bDqodYyhMi3NadaxyS_v8pHC3lDQ6fXXqLE34aKoFFrbQE")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#261933] to-transparent" />
              <span className="absolute top-3 right-3 bg-gray-600 text-[10px] px-2 py-1 rounded-full uppercase">
                Starts in 2h
              </span>
            </div>

            <div className="p-5 space-y-4">
              <h4 className="text-xl font-bold">Coding Cascade</h4>

              <button className="w-full h-12 rounded-lg bg-[#362348] text-sm font-bold">
                Remind Me
              </button>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="rounded-xl bg-[#261933] border border-white/10 opacity-80 overflow-hidden">
            <div
              className="relative aspect-video bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMGCswWEEIgh-jEVU-KOhr6HL3TE-cnowC71MTdkzWZr3UR_sVckX9SIoIMfs4u7aZmfB8vo-rw0iqeB0RrO0c91NCS2YWnRCfZmHjk02pHaZ5i2Q9RaXIAjG6NXWONjtxAu4GN5dN3uWWhePsrRxOjDgK66pIywzwHfucvtbN0vX6GWA6wHdRMHH-r2MATOIMAivArtyQ8SMRlSCCMd_23L1Azl768EorQKT3ZM3TI90U-AcAP0Ioexgu-iGov3o3lkWJsDZiPIQ")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#261933] to-transparent" />
              <span className="absolute top-3 right-3 bg-gray-800 text-[10px] px-2 py-1 rounded-full uppercase">
                Locked
              </span>
            </div>

            <div className="p-5">
              <button
                disabled
                className="w-full h-12 rounded-lg bg-[#1a1122] text-gray-500 flex items-center justify-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                Locked
              </button>
            </div>
          </div>

        </section>

      </div>
    </div>
  )
}

export default Rounds
