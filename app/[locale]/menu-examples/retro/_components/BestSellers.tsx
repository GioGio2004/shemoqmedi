import React from "react";

export default function BestSellers({ fontHeader }: { fontHeader: string }) {
  return (
    <section className="mb-10">
      <h2
        className={`${fontHeader} text-2xl mb-4 text-[#F5F5DC] tracking-widest pl-2 border-l-4 border-[#E8A343]`}
      >
        Top Chart
      </h2>

      {/* The Record Sleeve Container */}
      <div className="relative w-full h-44 bg-[#F5F5DC] rounded-xl shadow-[0_15px_35px_rgb(0,0,0,0.5)] flex items-center overflow-hidden">
        {/* The Spinning Vinyl Record (CSS Only) */}
        <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-56 h-56 bg-[#111] rounded-full border-4 border-black/80 shadow-2xl animate-[spin_10s_linear_infinite] flex items-center justify-center z-0">
          {/* Vinyl Grooves */}
          <div className="w-40 h-40 border border-gray-700/60 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 border border-gray-700/60 rounded-full flex items-center justify-center">
              {/* Record Center Label */}
              <div className="w-12 h-12 bg-[#8B3A3A] rounded-full border-2 border-[#E8A343]"></div>
            </div>
          </div>
        </div>

        {/* The Featured Content (Sits safely on top of the vinyl) */}
        <div className="relative z-10 w-2/3 h-full p-4 flex flex-col justify-between bg-gradient-to-r from-[#F5F5DC] from-75% to-transparent">
          <div>
            <span className="text-[10px] font-bold text-[#8B3A3A] uppercase tracking-wider mb-1 block">
              ★ #1 Best Seller
            </span>
            <h3
              className={`${fontHeader} text-xl text-[#3B2F2F] leading-tight mb-2`}
            >
              Cadillac Cheeseburger
            </h3>
            <p className="text-xs text-[#3B2F2F] opacity-80 line-clamp-2">
              Our signature double smashed patties with secret sauce.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <span className={`${fontHeader} text-xl text-[#4A5D23]`}>28 ₾</span>
            <button className="bg-[#E8A343] text-[#3B2F2F] px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-md">
              ORDER
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
