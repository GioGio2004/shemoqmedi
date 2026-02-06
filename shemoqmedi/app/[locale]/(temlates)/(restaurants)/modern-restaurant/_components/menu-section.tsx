"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MENU_CATEGORIES, DISHES } from "./constants";
import Image from "next/image";

export function MenuSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".menu-card").forEach((elem) => {
      gsap.from(elem, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: elem,
          start: "top 90%",
        }
      });
    });
  }, { scope: containerRef });

  return (
    <section id="menu" ref={containerRef} className="py-32 bg-[#050505] relative overflow-hidden">
        
      {/* Circuit Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                Edible <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">Data</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />
        </div>

        <Tabs defaultValue="synthesis" className="w-full">
            <div className="flex justify-center mb-16">
                <TabsList className="bg-zinc-900/50 border border-white/10 p-1 h-auto rounded-none">
                    {MENU_CATEGORIES.map(cat => (
                        <TabsTrigger 
                            key={cat.id} 
                            value={cat.id}
                            className="rounded-none px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-400 data-[state=active]:bg-cyan-500 data-[state=active]:text-black transition-all"
                        >
                            <cat.icon className="w-4 h-4 mr-2" />
                            {cat.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            {MENU_CATEGORIES.map(cat => (
                <TabsContent key={cat.id} value={cat.id} className="mt-0">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {DISHES.filter(d => d.cat === cat.id).map((dish) => (
                            <div key={dish.id} className="menu-card group relative bg-zinc-900/40 border border-white/5 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
                                {/* Holographic Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />
                                
                                <div className="aspect-[4/3] relative overflow-hidden">
                                     <Image 
                                        src={dish.image} 
                                        alt={dish.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                     />
                                     {dish.badge && (
                                         <div className="absolute top-4 left-4 bg-cyan-500 text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                                             {dish.badge}
                                         </div>
                                     )}
                                </div>

                                <div className="p-8 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{dish.name}</h3>
                                        <span className="text-cyan-400 font-mono text-lg">${dish.price}</span>
                                    </div>
                                    <p className="text-zinc-500 text-sm leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
                                        {dish.desc}
                                    </p>
                                    <button className="w-full py-3 border border-zinc-700 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all">
                                        Add to Queue
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            ))}
        </Tabs>
      </div>
    </section>
  );
}
