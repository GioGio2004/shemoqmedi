"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations, useLocale } from "next-intl";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function PortfolioGallery() {
  const t = useTranslations("Landing.Showcase");
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const templates = [
    {
      id: "beauty",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1674", // Salon interior
      href: `/${locale}/beauty`
    },
    {
      id: "construction",
      image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2689", // Modern architecture
       href: `/${locale}/construction`
    },
    {
      id: "coffee",
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671", // Coffee shop
       href: `/${locale}/coffee`
    }
  ];

  useGSAP(
    () => {
      const slider = sliderRef.current;
      if (!slider) return;

      const totalWidth = slider.scrollWidth;
      const windowWidth = window.innerWidth;
      
      // Horizontal Scroll Animation
      gsap.to(slider, {
        x: () => -(totalWidth - windowWidth),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${totalWidth}`,
          anticipatePin: 1,
        },
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  return (
    <section 
      id="portfolio-gallery" 
      ref={containerRef} 
      className="relative h-screen bg-black overflow-hidden"
    >
      <div className="absolute top-10 left-10 z-20 mix-blend-difference text-white">
        <h2 className="text-4xl font-bold tracking-tighter">{t("title")}</h2>
        <p className="text-sm opacity-70 mt-2">{t("subtitle")}</p>
      </div>

      <div 
        ref={sliderRef} 
        className="flex h-full w-[300vw] sm:w-[300vw] lg:w-[300vw]" // Ensure wide enough container
      >
        {templates.map((template, idx) => (
          <div 
            key={template.id} 
            className="w-[100vw] h-full relative group shrink-0" 
          >
            {/* Background Image */}
            <img 
              src={template.image} 
              alt={t(`${template.id}.title`)} 
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-12 md:p-24 flex flex-col items-start justify-end h-full">
              <div className="backdrop-blur-xl bg-black/30 border border-white/10 p-8 md:p-12 rounded-[2rem] max-w-2xl transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-black/50">
                <div className="flex items-start justify-between gap-8">
                    <div>
                        <h3 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        {t(`${template.id}.title`)}
                        </h3>
                        <p className="text-xl text-zinc-300 font-light mb-8">
                        {t(`${template.id}.desc`)}
                        </p>
                    </div>
                    
                    <Link
                        href={template.href}
                        className="w-16 h-16 rounded-full bg-red-800 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-red-900/50"
                    >
                        <ArrowUpRight className="w-8 h-8" />
                    </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
