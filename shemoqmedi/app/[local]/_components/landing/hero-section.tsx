"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { ArrowDown, Sparkles } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("Landing.Hero");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".hero-element", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        delay: 2.5, // Sync with intro
        ease: "power3.out",
      });
      
      // Float Animation for background blobs
      gsap.to(".blob", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        duration: "random(4, 6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 1
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden bg-zinc-50"
    >
      {/* --- MESH GRADIENT BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="blob absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="blob absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-orange-200 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="blob absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-300 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
      </div>

      <div className="max-w-4xl mx-auto text-center z-10 relative">
        <div className="hero-element mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-200 bg-white/60 backdrop-blur-xl shadow-sm text-purple-900">
           <Sparkles className="w-4 h-4 text-purple-500" />
           <span className="text-xs font-bold tracking-widest uppercase">Est. 2026</span>
        </div>

        <h1 className="hero-element text-5xl md:text-8xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-8">
          {t("title_1")} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 relative inline-block pb-2">
            {t("title_2")}
          </span>
        </h1>

        <p className="hero-element text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="hero-element flex flex-col items-center gap-8">
          <button 
             onClick={() => document.getElementById('portfolio-gallery')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-12 py-5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-full transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 shadow-lg text-sm tracking-wide"
          >
            {t("cta")}
          </button>
          
          <div className="flex flex-col items-center gap-3 text-zinc-400 text-xs tracking-[0.2em] uppercase animate-bounce mt-16 font-bold">
            {t("scroll")}
            <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                 <ArrowDown className="w-4 h-4 text-zinc-900" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
