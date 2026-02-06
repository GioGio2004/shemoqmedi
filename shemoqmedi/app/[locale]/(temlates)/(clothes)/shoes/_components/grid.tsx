"use client";

import { useState } from "react";
import { SHOES, CATEGORIES } from "./data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, ShoppingCart } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Grid() {
  const [filter, setFilter] = useState("all");
  const filteredShoes = filter === "all" ? SHOES : SHOES.filter(s => s.category === filter);

  useGSAP(() => {
    ScrollTrigger.batch(".shoe-card", {
      onEnter: elements => {
        gsap.from(elements, {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6
        });
      }
    });
  }, [filter]); // Re-run animation when filter changes

  return (
    <section id="shop" className="py-24 px-6 max-w-7xl mx-auto">
      
      {/* Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-center md:text-left">
          Fresh <span className="text-[#ff00cc]">Inventory</span>
        </h2>
        
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-6 py-2 rounded-full font-bold uppercase border-2 border-black transition-all ${
                filter === cat.id 
                  ? "bg-black text-white shadow-[4px_4px_0px_#ccff00]" 
                  : "bg-white hover:shadow-[4px_4px_0px_black] hover:-translate-y-1"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {filteredShoes.map((shoe) => (
          <div key={shoe.id} className="shoe-card group">
            <div className="relative bg-[#f4f4f4] rounded-3xl p-6 border-4 border-transparent group-hover:border-black transition-all duration-300">
              
              {/* Badge */}
              {shoe.badge && (
                <div className="absolute top-4 left-4 z-10 bg-[#ccff00] border-2 border-black px-3 py-1 font-black uppercase text-[10px] tracking-wide shadow-[3px_3px_0px_black]">
                  {shoe.badge}
                </div>
              )}

              {/* Like Button */}
              <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-[#ff00cc] hover:text-white transition-colors">
                <Star size={14} strokeWidth={3} />
              </button>

              {/* Image */}
              <div className="aspect-square relative overflow-hidden flex items-center justify-center">
                 <div className="w-48 h-48 bg-white rounded-full absolute blur-[40px] opacity-0 group-hover:opacity-60 transition-opacity" />
                 <img 
                  src={shoe.image} 
                  alt={shoe.name} 
                  className="w-[110%] h-auto object-contain transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 drop-shadow-xl" 
                 />
              </div>

              {/* Hover Add to Cart */}
              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button className="w-full py-3 bg-black text-white font-black uppercase flex items-center justify-center gap-2 rounded-xl shadow-[4px_4px_0px_#00ccff] hover:shadow-[2px_2px_0px_#00ccff] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black">
                    <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>

            <div className="mt-4 px-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{shoe.brand}</p>
                        <h3 className="text-lg font-black uppercase italic leading-tight group-hover:text-[#ff00cc] transition-colors">{shoe.name}</h3>
                    </div>
                    <p className="font-bold text-lg border-2 border-black bg-[#ccff00] px-2 shadow-[2px_2px_0px_black]">
                        ${shoe.price}
                    </p>
                </div>
                <p className="text-xs font-bold text-gray-400 mt-1">{shoe.colors} Colors Available</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
