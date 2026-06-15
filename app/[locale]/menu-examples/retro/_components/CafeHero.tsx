import React from "react";

export default function CafeHero({ fontHeader }: { fontHeader: string }) {
  return (
    <div className="relative w-full">
      {/* Cafe interior photo */}
      <div className="w-full h-[220px] sm:h-[320px] md:h-[420px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=1600&auto=format&fit=crop"
          alt="Noir Cafe interior"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Welcome Banner */}
      <div className="bg-[#E8A343] px-4 py-5 sm:py-6 md:py-7 text-center">
        <h1
          className={`${fontHeader} text-2xl sm:text-3xl md:text-5xl text-[#3B2F2F] tracking-[0.1em] uppercase`}
        >
          Welcome to Noir Cafe
        </h1>
      </div>
    </div>
  );
}
