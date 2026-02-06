"use client";

import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { Grid } from "./_components/grid";
import { Footer } from "./_components/footer";

export default function ShoesPage() {
  return (
    <div className="bg-white min-h-screen selection:bg-[#ccff00] selection:text-black">
      <Navbar />
      <Hero />
      <Grid />
      
      {/* Promo Banner */}
      <section className="py-20 bg-[#ff00cc] border-y-4 border-black overflow-hidden relative">
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, black 0, black 2px, transparent 0, transparent 10px)' }} 
        />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-7xl font-black uppercase italic text-white mb-6 drop-shadow-[5px_5px_0px_black]">
                Don't Miss The Drop
            </h2>
            <p className="text-2xl font-black uppercase mb-8">Sign up for early access</p>
            <div className="flex max-w-md mx-auto">
                <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL" 
                    className="flex-1 px-6 py-4 border-4 border-black font-bold uppercase focus:outline-none focus:bg-[#ccff00] transition-colors"
                />
                <button className="px-8 py-4 bg-black text-white font-black uppercase border-y-4 border-r-4 border-black hover:bg-white hover:text-black transition-colors">
                    Join
                </button>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
