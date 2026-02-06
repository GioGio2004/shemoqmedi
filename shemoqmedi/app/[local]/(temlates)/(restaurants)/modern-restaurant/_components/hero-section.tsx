"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Disc } from "lucide-react";
import { useRef } from "react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Glitch / Reveal effect
    const tl = gsap.timeline();
    
    tl.from(".hero-title-char", {
      opacity: 0,
      y: 100,
      rotateX: 90,
      stagger: 0.05,
      duration: 1,
      ease: "power4.out"
    })
    .from(".hero-subtitle", {
      opacity: 0,
      x: -50,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.5")
    .from(".hero-btn", {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 0.5
    }, "-=0.3");

    // Continuous floating animation for background elements
    gsap.to(".floating-orb", {
      y: 20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center m-20 overflow-hidden bg-black selection:bg-cyan-500/30">
      
      {/* Background Video/Image Placeholder */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black opacity-80" />
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670')] bg-cover bg-center opacity-40 mix-blend-luminosity grayscale" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,black_100%)]" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-6 flex justify-center">
            <div className="px-4 py-1 border border-cyan-500/30 rounded-full bg-cyan-950/30 backdrop-blur-md flex items-center gap-2 hero-subtitle">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">System Online • 2077</span>
            </div>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
            <span className="block hero-title-char">TASTE</span> 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 hero-title-char">THE FUTURE</span>
        </h1>

        <p className="hero-subtitle text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-mono leading-relaxed">
            Gastronomy re-engineered. Where culinary arts fuse with molecular science to create edible data.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="hero-btn group relative px-8 py-4 bg-cyan-500 text-black font-bold uppercase tracking-[0.2em] overflow-hidden">
                <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
                <span className="relative flex items-center gap-2 group-hover:text-black transition-colors">
                    Initiate Sequence <ArrowRight className="w-4 h-4" />
                </span>
            </button>
            <button className="hero-btn px-8 py-4 border border-zinc-700 text-white hover:border-purple-500 hover:text-purple-400 hover:bg-purple-500/10 font-bold uppercase tracking-[0.2em] transition-all duration-300">
                View Schematics
            </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block floating-orb">
          <Disc className="w-24 h-24 text-purple-600/20 animate-spin-slow" />
      </div>
      <div className="absolute bottom-1/4 right-10 hidden lg:block floating-orb" style={{ animationDelay: "1s" }}>
          <div className="w-32 h-32 border border-cyan-500/20 rounded-full flex items-center justify-center">
            <div className="w-24 h-24 border border-cyan-500/10 rounded-full" />
          </div>
      </div>

    </section>
  );
}
