"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck, Leaf, Heart } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  
  useGSAP(() => {
    gsap.from(".about-content > *", {
      scrollTrigger: {
        trigger: ".about-section",
        start: "top 70%",
      },
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out"
    });

    gsap.from(".stat-card", {
        scrollTrigger: {
          trigger: ".stats-container",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
  });

  return (
    <section id="about" className="about-section py-32 bg-[#FAF9F6] relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e6b800]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        {/* Image Grid */}
        <div className="relative">
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden rotate-2 shadow-2xl border-8 border-white">
                <img 
                    src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200" 
                    alt="Master Luthier at work" 
                    className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
            </div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-[2rem] overflow-hidden -rotate-3 shadow-xl border-8 border-white bg-[#3d2b1f] hidden md:block">
                 <img 
                    src="https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=800" 
                    alt="Wood details" 
                    className="w-full h-full object-cover opacity-80"
                />
            </div>
        </div>

        {/* Content */}
        <div className="about-content">
            <span className="text-[#e6b800] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Our Story</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-[#3d2b1f] mb-8 leading-tight">
                Crafting Soul <br /> Into Every String.
            </h2>
            <p className="text-[#8c7462] text-lg leading-relaxed mb-8">
                Since 1985, MelodyWoods has been a sanctuary for musicians who value tone, tradition, and truth. We don't just sell instruments; we curate voices. Every guitar, flute, and piano that enters our showroom is hand-selected and set up by our master luthiers to ensure it speaks clearly from the first note.
            </p>

            <div className="flex flex-col gap-6">
                {[
                    { icon: BadgeCheck, title: "Certified Authenticity", desc: "Every instrument verified for provenance and quality." },
                    { icon: Leaf, title: "Sustainable Sourcing", desc: "Committed to responsibly harvested tonewoods." },
                    { icon: Heart, title: "Luthier Inspected", desc: "Professional setup included with every purchase." }
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#e6e1dc] shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#e6b800]/10 text-[#e6b800] rounded-full flex items-center justify-center shrink-0">
                            <item.icon size={24} />
                        </div>
                        <div>
                            <h4 className="font-serif font-bold text-[#3d2b1f] text-lg">{item.title}</h4>
                            <p className="text-[#8c7462] text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 mt-32 stats-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
                { val: "35+", label: "Years Experience" },
                { val: "12k", label: "Instruments Sold" },
                { val: "40", label: "Master Brands" },
                { val: "100%", label: "Satisfaction" }
            ].map((stat, i) => (
                <div key={i} className="stat-card text-center p-8 bg-white rounded-3xl shadow-lg border border-[#e6e1dc]">
                    <div className="text-4xl md:text-5xl font-serif font-bold text-[#3d2b1f] mb-2">{stat.val}</div>
                    <div className="text-[#8c7462] font-medium uppercase tracking-widest text-xs">{stat.label}</div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
