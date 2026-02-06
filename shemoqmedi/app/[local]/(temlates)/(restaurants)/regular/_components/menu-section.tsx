"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import { MENU_CATEGORIES, DISHES } from "./constants";

export function MenuSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("starters");

  useGSAP(() => {
    // Staggered menu items
    gsap.utils.toArray<HTMLElement>(".menu-item").forEach((elem, i) => {
      gsap.from(elem, {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: i * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 90%",
          toggleActions: "play none none reverse"
        }
      });
    });

    // Image hover effects
    gsap.utils.toArray<HTMLElement>(".dish-image").forEach((elem) => {
      const img = elem.querySelector("img");
      
      elem.addEventListener("mouseenter", () => {
        gsap.to(img, { scale: 1.15, duration: 0.8, ease: "power2.out" });
      });
      
      elem.addEventListener("mouseleave", () => {
        gsap.to(img, { scale: 1, duration: 0.8, ease: "power2.out" });
      });
    });
  }, { scope: containerRef });

  return (
    <section id="menu" ref={containerRef} className="py-32 md:py-40 bg-gradient-to-b from-[#f4f1ea] to-[#fffcf5] border-y border-black/5 relative overflow-hidden grain">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#bc6c25]/5 rounded-full blur-[100px]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24 reveal">
          <Badge className="bg-white border border-black/10 text-[#bc6c25] hover:bg-white mb-6 px-6 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em]">
            Seasonal Selection
          </Badge>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter font-display mb-6 text-[#2d2a26]">
            The <span className="italic text-[#bc6c25]">Menu</span>
          </h2>
          <p className="text-lg text-[#5a5a70] max-w-3xl mx-auto leading-relaxed">
            Each dish is a carefully orchestrated symphony of locally-sourced ingredients,
            prepared with meticulous attention to tradition and innovation.
          </p>
        </div>

          <Tabs defaultValue="starters" className="w-full " onValueChange={setActiveCategory}>
              <div className="flex justify-center mb-20 reveal ">
              <TabsList className=" bg-white/80 backdrop-blur-sm border-2 border-black/10 rounded-full p-1.5 h-auto shadow-lg">
                  {MENU_CATEGORIES.map(cat => (
                  <TabsTrigger 
                      key={cat.id} 
                      value={cat.id}
                      className="text-gray-900 rounded-full px-8 py-3.5 data-[state=active]:bg-[#bc6c25] data-[state=active]:text-white data-[state=active]:shadow-md uppercase text-[10px] font-bold tracking-[0.15em] transition-all duration-300 hover:bg-black/5 data-[state=active]:hover:bg-[#bc6c25]"
                  >
                      <cat.icon size={14} className="mr-2" strokeWidth={2} />
                      {cat.name}
                  </TabsTrigger>
                  ))}
              </TabsList>
              </div>

          {MENU_CATEGORIES.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {DISHES.filter(d => d.cat === cat.id).map((dish, idx) => (
                  <div key={dish.id} className="menu-item group cursor-pointer">
                    <div className="dish-image aspect-[4/5] rounded-[32px] overflow-hidden relative mb-6 shadow-lg group-hover:shadow-2xl transition-shadow duration-500">
                      <img 
                        src={dish.image} 
                        className="w-full h-full object-cover transition-transform duration-700"
                        alt={dish.name}
                      />
                      {dish.badge && (
                        <Badge className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-black hover:bg-white font-bold text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 shadow-md z-10">
                          {dish.badge}
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 z-20">
                        <button className="px-10 py-3.5 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#bc6c25] hover:text-white transition-all shadow-lg">
                          Add to Order
                        </button>
                      </div>
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                        <button className="p-3 bg-white/95 backdrop-blur-sm rounded-full hover:bg-[#bc6c25] hover:text-white transition-all shadow-md">
                          <Heart size={18} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-xl md:text-2xl font-bold font-display group-hover:text-[#bc6c25] transition-colors">
                          {dish.name}
                        </h4>
                        <span className="font-bold text-lg text-[#bc6c25] whitespace-nowrap">
                          ${dish.price}
                        </span>
                      </div>
                      <p className="text-sm md:text-base text-[#5a5a70] leading-relaxed">
                        {dish.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-20 reveal">
          <p className="text-sm text-[#5a5a70] mb-6 italic">
            Menu changes seasonally based on ingredient availability
          </p>
          <button className="px-10 py-4 border-2 border-[#bc6c25] text-[#bc6c25] rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#bc6c25] hover:text-white transition-all hover:scale-105">
            View Full Menu PDF
          </button>
        </div>
      </div>
    </section>
  );
}
