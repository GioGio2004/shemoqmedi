"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HeroSection({ scrollTo }: { scrollTo: (id: string) => void }) {
  
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal").forEach((elem) => {
      gsap.from(elem, {
        y: 40,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    gsap.to(".hero-gradient", {
      y: 100,
      scrollTrigger: {
        trigger: ".hero-gradient",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  });

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center relative px-6 pt-24 overflow-hidden">
      <div className="hero-gradient absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-br from-[#00e5ff]/10 via-[#b388ff]/5 to-transparent rounded-full blur-[150px] -z-10" />
      
      <Badge variant="outline" className="mb-6 border-[#00e5ff] text-[#00e5ff] px-6 py-1.5 tracking-[0.4em] uppercase text-[9px] animate-pulse">
        <TrendingUp size={12} className="mr-2" /> Spring Collection 2026
      </Badge>
      
      <h1 className="reveal text-6xl md:text-[9rem] font-black tracking-tighter leading-[0.85] uppercase mb-6 text-white">
        Digitizing<br />
        <span className="bg-gradient-to-r from-[#00e5ff] via-[#00d4ff] to-[#b388ff] bg-clip-text text-transparent italic">
          Creators
        </span>
      </h1>
      
      <p className="reveal mt-4 max-w-lg text-[#8888a0] text-sm tracking-widest uppercase font-bold mb-12">
        Bridging Georgian Soul with Global Code
      </p>

      <div className="reveal flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => scrollTo('outerwear')}
          className="px-8 py-4 bg-[#00e5ff] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_40px_#00e5ff] transition-all flex items-center justify-center gap-2"
        >
          Shop Now <ArrowRight size={16} />
        </button>
        <button 
          onClick={() => scrollTo('about')}
          className="px-8 py-4 border-2 border-white/10 font-black uppercase text-xs tracking-widest rounded-xl hover:border-[#00e5ff] text-white transition-all"
        >
          Our Story
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#00e5ff] rounded-full" />
        </div>
      </div>
    </section>
  );
}
