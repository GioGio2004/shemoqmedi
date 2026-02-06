"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Play } from "lucide-react";

export function Hero() {

  useGSAP(() => {
    gsap.from(".hero-content > *", {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
      delay: 0.2
    });
  });

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2070" 
            className="w-full h-full object-cover"
            alt="Acoustic Studio"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1d15] via-[#2a1d15]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center hero-content text-white">
        <div className="inline-flex items-center gap-2 py-1 px-4 bg-[#e6b800]/20 border border-[#e6b800]/30 rounded-full text-[#e6b800] text-sm font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 bg-[#e6b800] rounded-full animate-pulse" />
            Spring Collections Available
        </div>
        
        <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-none tracking-tight">
          Find Your <br />
          <span className="text-[#e6b800] italic">True Sound.</span>
        </h1>
        
        <p className="text-xl text-[#d4c5b5] mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Premium handcrafted instruments for the dedicated musician. 
          Experience the warmth of analog in a digital world.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#e6b800] text-[#3d2b1f] font-bold rounded-lg hover:bg-white transition-colors duration-300 shadow-xl shadow-[#e6b800]/10">
                Shop Collection
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-colors duration-300 flex items-center justify-center gap-3">
                <Play size={18} fill="currentColor" /> Watch Video
            </button>
        </div>
      </div>
    </section>
  );
}
