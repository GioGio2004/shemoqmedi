"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "./constants";

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 md:py-40 px-6 bg-[#2d2a26] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#bc6c25]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#dda15e]/10 rounded-full blur-[120px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 reveal">
          <Badge className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 mb-6 px-6 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em]">
            Guest Reviews
          </Badge>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-display mb-6">
            What People <span className="italic text-[#dda15e]">Say</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="reveal group">
              <div className="p-8 md:p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 h-full flex flex-col">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#dda15e] text-[#dda15e]" />
                  ))}
                </div>
                <p className="text-lg md:text-xl leading-relaxed mb-8 flex-grow font-light italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-bold font-display text-lg">{testimonial.name}</p>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
