"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Parallax - slower for elegance
    gsap.to(".hero-image", {
      y: 150,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1.5
      }
    });

    // Parallax text elements
    gsap.to(".hero-text", {
      y: 80,
      opacity: 0.3,
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="hero-section relative min-h-screen flex items-center justify-center pt-24 grain overflow-hidden">
      <div className="hero-image absolute inset-0 -z-10 px-4 md:px-12 pb-24">
        <div className="w-full h-full rounded-[40px] md:rounded-[60px] overflow-hidden relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1550966842-28c2e278631f?q=80&w=2070" 
            className="w-full h-full object-cover scale-110"
            alt="Restaurant Interior"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </div>
      </div>

      <div className="m-20 hero-text text-center text-white px-6 relative z-10">
        <Badge variant="outline" className="border-white/50 backdrop-blur-sm bg-white/10 text-white mb-8 px-8 py-2 tracking-[0.25em] uppercase text-[9px] font-bold">
          Est. 2026 • Tbilisi, Georgia
        </Badge>
        <h1 className="reveal text-6xl md:text-[10rem] lg:text-[12rem] font-bold leading-[0.9] mb-10 tracking-tighter font-display">
          <span className="text-gray-900">Authentic</span><br />
          <span className="italic font-light text-[#dda15e]">Comfort</span>
        </h1>
        <p className="reveal max-w-2xl mx-auto text-white/90 text-lg md:text-xl mb-16 leading-relaxed font-light">
          A sanctuary where local seasonal ingredients meet the timeless art of slow cooking,
          <br className="hidden md:block" />
          creating unforgettable moments around every table.
        </p>
        <div className="reveal flex flex-col sm:flex-row justify-center gap-4">
          <button className="group px-12 py-5 bg-[#bc6c25] text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#dda15e] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
            Explore Menu
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-12 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-gray-900 rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-white/20 transition-all shadow-lg hover:scale-105 active:scale-95">
            Reserve Table
          </button>
        </div>
      </div>

      {/* Decorative scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-bounce">
        <p className="text-[9px] uppercase tracking-[0.3em] font-bold">Scroll</p>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}
