"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselNext, 
    CarouselPrevious 
} from "@/components/ui/carousel";
import { BRAND_PILLARS } from "./data";

export function BrandPillars() {
  
  useGSAP(() => {
    gsap.from(".reveal-pillar", {
      y: 40,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: "#pillars",
        start: "top 80%",
      }
    });
  });

  return (
    <section id="pillars" className="py-24 px-8 border-y border-white/5 bg-[#0a0a1a]/40">
      <div className="max-w-7xl mx-auto">
        <h3 className="reveal-pillar text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-12 text-center text-white">
          Why <span className="text-[#00e5ff]">Voloostore</span>
        </h3>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent>
            {BRAND_PILLARS.map((p, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-10 h-full rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent hover:border-[#00e5ff]/30 hover:shadow-[0_0_40px_rgba(0,229,255,0.1)] transition-all group">
                  <p.icon className="text-[#00e5ff] mb-8 group-hover:scale-110 transition-transform" size={36} />
                  <h4 className="text-xl font-bold uppercase mb-4 italic tracking-tight text-white">{p.title}</h4>
                  <p className="text-sm text-[#5a5a70] leading-relaxed font-light">{p.desc}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0" />
            <CarouselNext className="relative inset-0 translate-x-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
