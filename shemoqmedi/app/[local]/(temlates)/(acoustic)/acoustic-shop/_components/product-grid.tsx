"use client";

import { CATEGORIES, PRODUCTS } from "./data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ArrowRight, ShoppingBag } from "lucide-react";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function ProductGrid() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Reveal headers
    const headers = gsap.utils.toArray(".category-header");
    headers.forEach((header: any) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: "top 85%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      });
    });

    // Staggered batch for product cards
    ScrollTrigger.batch(".product-card", {
      onEnter: (elements) => {
        gsap.fromTo(
          elements,
          { y: 100, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.15,
            duration: 1.2,
            ease: "expo.out",
            overwrite: true,
          }
        );
      },
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen pb-40 relative z-10 -mt-16 rounded-t-[4rem]">
      {CATEGORIES.slice(1).map((cat, idx) => {
        const categoryProducts = PRODUCTS.filter((p) => p.category === cat.id);

        return (
          <section key={cat.id} id={cat.id} className="pt-32 px-6 lg:px-12 max-w-[1600px] mx-auto">
            {/* Minimalist Editorial Header */}
            <div className="category-header flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-black/5 pb-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#B2A496]">Collection {String(idx + 1).padStart(2, '0')}</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-serif italic text-[#1A1A1A] leading-tight">
                  {cat.label}
                </h2>
              </div>
              <p className="mt-6 md:mt-0 text-[#635A52] max-w-xs text-sm leading-relaxed font-light">
                Discover our curated selection of {cat.label.toLowerCase()}, where craftsmanship meets contemporary vision.
              </p>
            </div>

            {/* Dynamic Grid: Alternates between 2 and 3 columns for visual interest */}
            <div className={`grid gap-x-8 gap-y-20 ${idx % 2 === 0 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
              {categoryProducts.map((product) => (
                <div key={product.id} className="product-card group cursor-pointer">
                  {/* Image Container with organic border radius */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#EEEBE7]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                    />
                    
                    {/* Floating Info Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        New Arrival
                      </span>
                    </div>

                    {/* Quick Add Button */}
                    <button className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 bg-black text-white p-4 rounded-full hover:bg-[#e6b800]">
                      <ShoppingBag size={20} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Details Block */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-serif text-[#1A1A1A] group-hover:text-[#8C7462] transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-sm text-[#8C7462] font-light mt-1">{product.description.split('.')[0]}</p>
                      </div>
                      <span className="text-lg font-medium text-[#1A1A1A]">${product.price.toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-4 flex items-center gap-4 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="flex items-center gap-1">
                        <Star size={12} fill="black" />
                        <span className="text-[11px] font-bold">{product.rating}</span>
                      </div>
                      <span className="h-1 w-1 bg-black/20 rounded-full" />
                      <button className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 hover:gap-3 transition-all">
                        View Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}