"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  const t = useTranslations("Landing.Hero");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".hero-element", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        delay: 2.8, // Wait for intro
        ease: "power3.out",
      });
      
      // Subtle red glow pulsing
      gsap.to(".hero-glow", {
        opacity: 0.4,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden bg-black"
    >
      {/* Abstract Background Elements - Red Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px] hero-glow pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center z-10">
        <div className="hero-element mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
           <span className="w-2 h-2 rounded-full bg-red-700 animate-pulse" />
           <span className="text-xs font-medium text-zinc-400 tracking-wider uppercase">EST. 2026</span>
        </div>

        <h1 className="hero-element text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8">
          {t("title_1")} <br />
          <span className="text-white relative">
            {t("title_2")}
             {/* Underline accent */}
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-red-900" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="hero-element text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="hero-element flex flex-col items-center gap-8">
          <button 
             onClick={() => document.getElementById('portfolio-gallery')?.scrollIntoView({ behavior: 'smooth' })}
             className="px-10 py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {t("cta")}
          </button>
          
          <div className="flex flex-col items-center gap-2 text-zinc-500 text-xs tracking-widest uppercase animate-bounce mt-12">
            {t("scroll")}
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
