import React from "react";
import { Link } from "react-router-dom";

function Rounds() {
  return (
    <div className="min-h-screen text-white font-['Space_Grotesk'] relative overflow-x-hidden"
      style={{
        backgroundImage:
          "url(/images/martian-landscape.png)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}>

      {/* MARTIAN LANDSCAPE BACKGROUND */}
      <div
        className="fixed bottom-0 left-0 w-full h-[40vh] opacity-80 -z-10"
        style={{
          backgroundImage:
            "url(/images/martian-landscape.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-12 pb-20 sm:pb-32">

        {/* TOP BAR */}
        <div className="sticky top-0 z-50 flex items-center justify-between h-20 backdrop-blur-md border-b border-white/10">
          <Link to="/"><span className="material-symbols-outlined text-primary cursor-pointer">
            arrow_back_ios_new
          </span></Link>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase ">
            GPrime
          </h2>

          <span className="material-symbols-outlined text-primary cursor-pointer">

          </span>
        </div>

        {/* PROGRESS SECTION */}


        {/* HEADER */}
        <section className="mt-10 sm:mt-16">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase  tracking-tight">
            Challenge Tiers
          </h3>
          <div className="h-1 w-24 bg-orange-500 mt-3"></div>
        </section>

        {/* ROUNDS GRID */}
        <section className="mt-6 sm:mt-10 flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-10">

          {/* CARD 1 */}
          <div className="group rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 hover:-translate-y-2 hover:border-orange-500/60 transition-all duration-500">

            <div
              className="relative h-64 bg-cover bg-center overflow-hidden"
              style={{
                backgroundImage: 'url("/images/rapid-fire.png")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />


            </div>

            <div className="p-6 sm:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-orange-500">
                  bolt
                </span>
                <h4 className="text-xl sm:text-2xl font-black uppercase">
                  Rapid Fire
                </h4>
              </div>


              <Link to="/rapidfire" className="block">
                <button className="w-full h-10 sm:h-12 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase rounded-lg sm:rounded-xl text-sm sm:text-base transition">
                  Join Round
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="group rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 hover:-translate-y-2 hover:border-orange-500/60 transition-all duration-500">

            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage: 'url("/images/coding_cascade.png")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />


            </div>

            <div className="p-6 sm:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-orange-500">
                  Terminal
                </span>
                <h4 className="text-xl sm:text-2xl font-black uppercase">
                  Coding Cascade
                </h4></div>

              <Link to="/cascade" className="block">
                <button className="w-full h-10 sm:h-12 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase rounded-lg sm:rounded-xl text-sm sm:text-base transition">
                  Join Round
                </button>
              </Link>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group rounded-3xl overflow-hidden bg-[rgba(45,10,10,0.6)] backdrop-blur-xl border border-orange-500/20 hover:-translate-y-2 hover:border-orange-500/60 transition-all duration-500">

            <div
              className="relative h-64 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("/images/dsa.png")',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] to-transparent" />

            </div>

            <div className="p-6 sm:p-8 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl sm:text-3xl text-orange-500">
                  graph_7
                </span>
                <h4 className="text-xl sm:text-2xl font-black uppercase">
                  DSA
                </h4></div>
              <Link to="/dsa" className="block">
                <button className="w-full h-10 sm:h-12 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase rounded-lg sm:rounded-xl text-sm sm:text-base transition">
                  Join Round
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