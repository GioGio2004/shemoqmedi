"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070"
          alt="Coffee shop interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[hsl(40,33%,96%)]/75" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        <div className="inline-block px-5 py-1.5 mb-8 rounded-full border border-primary/30 text-primary text-xs font-medium tracking-[0.25em] uppercase">
          Artisan Coffee Since 2024
        </div>

        <h1 className="font-serif text-6xl sm:text-7xl md:text-[6.5rem] leading-[0.9] mb-8 text-foreground text-balance">
          Optimal craftsmanship
          <br />
          meets{" "}
          <span className="italic text-primary">
            exquisite taste
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-14 leading-relaxed">
          Transform your everyday coffee ritual into an artful experience with our handcrafted brews and fresh pastries.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href="#menu"
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium tracking-wide hover:opacity-90 transition-all"
          >
            Explore Our Menu
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#visit"
            className="px-8 py-4 rounded-full border border-foreground/20 text-foreground font-medium tracking-wide hover:bg-foreground/5 transition-all"
          >
            Visit Us
          </a>
        </div>

        {/* Hero Image Trio */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000"
              alt="Coffee brewing"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 33vw, 250px"
            />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden -mt-8 group">
            <Image
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000"
              alt="Latte art"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 33vw, 250px"
            />
          </div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
            <Image
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"
              alt="Cafe atmosphere"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 33vw, 250px"
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-muted-foreground">
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-muted-foreground/30 animate-pulse" />
      </div>
    </section>
  );
}
