"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { PHILOSOPHY } from "./constants";
import { useRef } from "react";

export function PhilosophySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Philosophy cards with rotation
    gsap.utils.toArray<HTMLElement>(".philosophy-card").forEach((elem, i) => {
      gsap.from(elem, {
        y: 80,
        opacity: 0,
        rotation: i % 2 === 0 ? -3 : 3,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    });
  }, { scope: containerRef });

  return (
    <section id="philosophy" ref={containerRef} className="py-32 md:py-40 px-6 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#bc6c25]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-[#dda15e]/5 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 reveal">
          <Badge className="bg-[#bc6c25]/10 text-[#bc6c25] hover:bg-[#bc6c25]/20 mb-4 px-6 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em]">
            Our Foundation
          </Badge>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-display mb-6">
            Built on <span className="italic text-[#bc6c25]">Principles</span>
          </h2>
          <p className="text-lg text-[#5a5a70] max-w-2xl mx-auto leading-relaxed">
            Every dish tells a story of dedication, quality, and the artistry of traditional cooking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {PHILOSOPHY.map((item, i) => (
            <div key={i} className="philosophy-card group text-center">
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#bc6c25]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                  <div className="relative p-6 bg-gradient-to-br from-[#dda15e]/10 to-[#bc6c25]/10 rounded-3xl border border-[#bc6c25]/20 group-hover:border-[#bc6c25]/40 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <item.icon size={32} className="text-[#bc6c25]" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold font-display mb-4 group-hover:text-[#bc6c25] transition-colors">
                {item.title}
              </h3>
              <p className="text-[#5a5a70] leading-relaxed text-base md:text-lg">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
