"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TESTIMONIALS } from "./data";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal-review").forEach((elem) => {
      gsap.from(elem, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
        }
      });
    });
  });

  return (
    <section id="testimonials" className="py-32 px-4 md:px-8 bg-[#0a0a1a]/30 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 reveal-review">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4 text-white">
            Trusted by <span className="text-[#00e5ff]">Thousands</span>
          </h2>
          <p className="text-[#8888a0] text-sm uppercase tracking-widest">What our customers say</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <div 
              key={i} 
              className="reveal-review bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-8 hover:border-[#00e5ff]/30 transition-all"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#00e5ff] text-[#00e5ff]" />
                ))}
              </div>
              <p className="text-[#e8e8f0] mb-8 leading-relaxed">&quot;{testimonial.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#b388ff] flex items-center justify-center font-black text-sm text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{testimonial.name}</p>
                  <p className="text-xs text-[#5a5a70]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
