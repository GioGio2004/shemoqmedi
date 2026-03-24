"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Globe, Award, Zap, ArrowUpRight } from "lucide-react";

export function AboutSection() {

  useGSAP(() => {
    gsap.from(".reveal-about", {
      y: 40,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: "#about",
        start: "top 70%",
      }
    });
  });

  return (
    <section id="about" className="py-32 px-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="relative aspect-square rounded-[40px] overflow-hidden border border-white/10 group">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            alt="About FUTURECLOTH"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="space-y-8 reveal-about">
          <Badge className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20 uppercase tracking-wider text-[9px]">
            Our Story
          </Badge>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-tight text-white">
            From the Mountains<br />
            <span className="text-[#00e5ff]">To the Future.</span>
          </h2>
          <p className="text-[#8888a0] text-lg font-light leading-relaxed">
            FUTURECLOTH is more than a shop; it&apos;s a technical infrastructure for Georgian creators. We digitalize traditional crafts, ensuring that the work of our artisans reaches every corner of the modern world.
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="logistics" className="border-white/5">
              <AccordionTrigger className="text-sm uppercase font-bold tracking-wider hover:no-underline hover:text-[#00e5ff] text-white">
                <Globe className="mr-2" size={16} /> Global Logistics
              </AccordionTrigger>
              <AccordionContent className="text-[#5a5a70] text-sm">
                We provide end-to-end shipping from Tbilisi to over 50 countries with real-time tracking and customs support.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="quality" className="border-white/5">
              <AccordionTrigger className="text-sm uppercase font-bold tracking-wider hover:no-underline hover:text-[#00e5ff] text-white">
                <Award className="mr-2" size={16} /> Quality Guarantee
              </AccordionTrigger>
              <AccordionContent className="text-[#5a5a70] text-sm">
                Every product is handcrafted and undergoes rigorous quality checks before shipping.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sustainability" className="border-white/5">
              <AccordionTrigger className="text-sm uppercase font-bold tracking-wider hover:no-underline hover:text-[#00e5ff] text-white">
                <Zap className="mr-2" size={16} /> Sustainable Future
              </AccordionTrigger>
              <AccordionContent className="text-[#5a5a70] text-sm">
                We use eco-friendly materials and partner with carbon-neutral shipping providers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <button className="px-8 py-4 bg-[#00e5ff] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_40px_#00e5ff] transition-all flex items-center gap-2">
            Learn More <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
