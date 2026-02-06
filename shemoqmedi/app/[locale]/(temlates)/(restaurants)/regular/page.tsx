"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { PhilosophySection } from "./_components/philosophy-section";
import { MenuSection } from "./_components/menu-section";
import { TestimonialsSection } from "./_components/testimonials-section";
import { BookingSection } from "./_components/booking-section";
import { Footer } from "./_components/footer";

gsap.registerPlugin(ScrollTrigger);

export default function CozyRestaurant() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Enhanced reveal animations with stagger
    gsap.utils.toArray<HTMLElement>(".reveal").forEach((elem) => {
      gsap.from(elem, {
        y: 60,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Navbar transition logic moved to page level for scroll context
    ScrollTrigger.create({
      start: "top -50",
      onEnter: () => gsap.to(".navbar", { 
        backgroundColor: "rgba(255, 252, 245, 0.98)", 
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(45, 42, 38, 0.08)", 
        duration: 0.5,
        ease: "power2.out"
      }),
      onLeaveBack: () => gsap.to(".navbar", { 
        backgroundColor: "transparent", 
        backdropFilter: "blur(0px)",
        borderBottom: "1px solid transparent", 
        duration: 0.5,
        ease: "power2.out"
      }),
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#fffcf5] text-[#2d2a26] min-h-screen selection:bg-[#d4a373]/30 overflow-x-hidden">
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&display=swap');
        
        body {
          font-family: 'Crimson Pro', serif;
        }
        
        .font-display {
          font-family: 'Cormorant Garamond', serif;
        }
        
        .grain {
          position: relative;
          overflow: hidden;
        }
        
        .grain::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          right: -50%;
          bottom: -50%;
          width: 200%;
          height: 200%;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          animation: grain 8s steps(10) infinite;
        }
        
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>

      <Navbar />
      <HeroSection />
      <PhilosophySection />
      <MenuSection />
      <TestimonialsSection />
      <BookingSection />
      <Footer />
    </div>
  );
}