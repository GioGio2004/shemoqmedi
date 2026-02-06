"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { FEATURES, SERVICES } from "./constants";
import { ArrowRight, Cpu, Wifi } from "lucide-react";

export function ReservationSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".feature-card", {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: {
        trigger: "#features",
        start: "top 80%",
      }
    });

    gsap.from(".reservation-form", {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      scrollTrigger: {
        trigger: ".reservation-form",
        start: "top 85%",
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* Features */}
      <section id="features" className="py-20 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => (
                <div key={i} className="feature-card p-6 border border-zinc-800 bg-zinc-900/20 hover:border-cyan-500/50 transition-colors group">
                    <feat.icon className="w-8 h-8 text-zinc-600 group-hover:text-cyan-400 transition-colors mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
                    <p className="text-zinc-500 text-sm">{feat.desc}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Reservation */}
      <section id="reserve" className="py-32 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="reservation-form bg-zinc-900/50 border border-white/10 p-8 md:p-12 mb-12">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-mono text-green-500 text-sm tracking-widest">SYSTEM READY</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter">
                    SECURE YOUR <span className="text-cyan-400">TABLE</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8 mt-12">
                    <div className="space-y-4">
                        <label className="text-[10px] items-center gap-2 flex font-bold uppercase tracking-widest text-zinc-500">
                           <Wifi className="w-3 h-3" /> Identity
                        </label>
                        <input type="text" placeholder="ENTER NAME" className="w-full bg-black/50 border border-zinc-800 p-4 text-white font-mono focus:border-cyan-500 focus:outline-none transition-colors" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] items-center gap-2 flex font-bold uppercase tracking-widest text-zinc-500">
                           <Cpu className="w-3 h-3" /> Frequency
                        </label>
                        <input type="email" placeholder="ENTER EMAIL" className="w-full bg-black/50 border border-zinc-800 p-4 text-white font-mono focus:border-cyan-500 focus:outline-none transition-colors" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Upgrades</h3>
                    <div className="grid gap-4">
                        {SERVICES.map((srv, i) => (
                            <label key={i} className="flex items-center justify-between p-4 border border-zinc-800 hover:bg-white/5 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-4 h-4 border border-zinc-600 rounded-sm group-hover:bg-cyan-400 transition-colors" />
                                    <div>
                                        <div className="font-bold text-white">{srv.title}</div>
                                        <div className="text-xs text-zinc-600">{srv.desc}</div>
                                    </div>
                                </div>
                                <div className="font-mono text-cyan-400 text-sm">{srv.price}</div>
                            </label>
                        ))}
                    </div>
                </div>

                <button className="w-full mt-8 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity">
                    Confirm Transmission
                </button>
            </div>
        </div>
      </section>
    </div>
  );
}
