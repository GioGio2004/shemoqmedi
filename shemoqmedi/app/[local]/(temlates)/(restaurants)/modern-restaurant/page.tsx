"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { MenuSection } from "./_components/menu-section";
import { ReservationSection } from "./_components/reservation-section";
import { Footer } from "./_components/footer";

gsap.registerPlugin(ScrollTrigger);

export default function ModernRestaurant() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Animations or Scroll Logic if needed
  useGSAP(() => {
    // Scroll progress bar
    gsap.to(".progress-bar", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        scrub: 0,
        start: "top top",
        end: "bottom bottom",
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-black min-h-screen text-white overflow-x-hidden selection:bg-cyan-500/50 selection:text-white">
      
      {/* Dynamic Font Loading */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Syncopate:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        
        body {
          font-family: 'Space Mono', monospace;
        }
        
        h1, h2, h3, .font-display {
          font-family: 'Orbitron', sans-serif;
        }

        .hero-title-char {
            font-family: 'Syncopate', sans-serif;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #000; 
        }
        ::-webkit-scrollbar-thumb {
          background: #22d3ee; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #0891b2; 
        }
      `}</style>
      
      {/* Top Scroll Progress */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-zinc-900 z-[100]">
         <div className="progress-bar w-full h-full bg-gradient-to-r from-cyan-400 to-purple-500 origin-left scale-x-0" />
      </div>

      <Navbar />
      <HeroSection />
      <MenuSection />
      <ReservationSection />
      <Footer />
    </div>
  );
}
