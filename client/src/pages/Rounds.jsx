import React from "react";
import { Link } from "react-router-dom";

function Rounds() {
  return (
    <div className="min-h-screen bg-[#1a0b0b] text-white font-['Space_Grotesk'] relative overflow-x-hidden">

      {/* MARTIAN LANDSCAPE BACKGROUND */}
      <div
        className="fixed bottom-0 left-0 w-full h-[40vh] opacity-80 -z-10"
        style={{
          backgroundImage:
            "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBWKU71LHCaR-12O4S36n5DP8fLv0yDQ7DthBgduswuRF3uIw5chGApd5dPqordM1TsjcdvBFBJHUG7_l3rVgwdQuN5-DClQMTFh4VFR1hvVVB5cM49KSjgyStPg5r-Pln-9okenBW1J4xJ6Z6KYzVqFXk6BeLW5LXoLTs8NAmgFjmQahsMf0652CDOBEwhnI9iAJ9TX9-2S417I1trrurakwXqee1-EMEJ1QpYFH1aiu0WJs1jrMd8tuMcqMLRiYlukLrGgjseeQo)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="mx-auto max-w-[1600px] px-10 pb-32">

        {/* TOP BAR */}
        <div className="sticky top-0 z-50 flex items-center justify-between h-20 bg-[#1a0b0b]/90 backdrop-blur-md border-b border-white/10">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            arrow_back_ios_new
          </span>

          <h2 className="text-xl font-black tracking-tight uppercase italic">
            Opulence
          </h2>

          <span className="material-symbols-outlined text-primary cursor-pointer">
            info
          </span>
        </div>

        {/* PROGRESS SECTION */}
        <section className="mt-10">
          <div className="rounded-3xl p-8 bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 shadow-[0_0_25px_rgba(249,115,22,0.15)]">

            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-2xl font-black uppercase italic">
                  Mission Trajectory
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  Synchronize systems across Martian sectors.
                </p>
              </div>

              <div className="text-right">
                <span className="text-4xl font-black text-orange-500">
                  33%
                </span>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Sector 1 of 3
                </p>
              </div>
            </div>

            <div className="h-3 rounded-full bg-black/40 border border-white/10 overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-orange-600 to-orange-500 relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>

            <p className="mt-3 text-xs text-white/50 uppercase tracking-wider">
              Next up: Rapid Fire
            </p>
          </div>
        </section>

        {/* HEADER */}
        <section className="mt-16">
          <h3 className="text-4xl font-black uppercase italic tracking-tight">
            Current Sectors
          </h3>
          <div className="h-1 w-24 bg-orange-500 mt-3"></div>
        </section>

        {/* ROUNDS GRID */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* CARD 1 */}
          <div className="group rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 hover:-translate-y-2 hover:border-orange-500/60 transition-all duration-500">

            <div
              className="relative h-64 bg-cover bg-center overflow-hidden"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAWUnXJoowbLn4b1vnu9cSYbMp4SB3WRA1tqsltyBsgam3Ob1cQi8MXE4uMt_oODeMYuSWVNPqXGKXB7BWLKaVPEIpquME5eV--eyeBVwTYcLhKHj0mb00kKtA8nuKHkZg8SSiSKW23Wn4Ts6GuSOj8aL6pdLGdry2xgy9GumQzXlyk1U9Gq_jOVthzzYnGI3QYV46HaCW1s9v6Ca-2V5OzSelGCdaAq06EKsHcuGM0SmrEeRnTWMQ6hrYKci6V-N-6UJ7_1eO1ASM")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Active Sector
              </span>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-500">
                  bolt
                </span>
                <h4 className="text-2xl font-black uppercase">
                  Rapid Fire
                </h4>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold">
                  45m
                </span>
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs font-bold">
                  Speed Bonus
                </span>
              </div>

              <Link to="/rapidfire">
                <button className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase rounded-xl transition">
                  Know More
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-white/10 opacity-90">

            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4Dw3TZ-ul2-EbqKmI9yIuonlqjDf3TTTa5Q2DS5qfcBg87jrITJsaMI9xQtfL4jFn_scdtfZRloDEhTrWfLx3RFNywQctYOt9I9taaWu42SQj3YIeiywjTJp_vOWccdKYqBO4x48u3qRjnOSs1rbI_76tLM7nq8B62MR3qnCgncSpX5tkuWqyE9XMEL4CgD0oZbFlxeTir8y_AeeVFpbrgEVdG6e7-bDqodYyhMi3NadaxyS_v8pHC3lDQ6fXXqLE34aKoFFrbQE")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

              <span className="absolute top-4 left-4 bg-white/10 border border-white/20 text-white/80 text-xs px-3 py-1 rounded-full uppercase">
                Starts in 2h
              </span>
            </div>

            <div className="p-8">
              <h4 className="text-2xl font-black uppercase">
                Coding Cascade
              </h4>

              <Link to="/cascade">
                <button className="mt-6 w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 font-bold transition">
                  Know More
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-white/10 opacity-70">

            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAMGCswWEEIgh-jEVU-KOhr6HL3TE-cnowC71MTdkzWZr3UR_sVckX9SIoIMfs4u7aZmfB8vo-rw0iqeB0RrO0c91NCS2YWnRCfZmHjk02pHaZ5i2Q9RaXIAjG6NXWONjtxAu4GN5dN3uWWhePsrRxOjDgK66pIywzwHfucvtbN0vX6GWA6wHdRMHH-r2MATOIMAivArtyQ8SMRlSCCMd_23L1Azl768EorQKT3ZM3TI90U-AcAP0Ioexgu-iGov3o3lkWJsDZiPIQ")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

              <span className="absolute top-4 left-4 bg-black/60 text-white/40 text-xs px-3 py-1 rounded-full uppercase">
                Locked
              </span>
            </div>

            <div className="p-8">
              <h4 className="text-2xl font-black uppercase">
                DSA
              </h4>
              <Link to="/dsa">
                <button className="mt-6 w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 font-bold transition">
                  Know More
                </button>
              </Link>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

export default Rounds;
