"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Wrench, MapPin, Clock, ArrowRight, Gauge, Shield, Zap } from "lucide-react";

import { ContactDropdown } from "./_components/contact-dropdown";
import { SERVICES } from "./_components/data";
import { MegaMenu } from "./_components/mega-menu";

gsap.registerPlugin(ScrollTrigger);

export default function AutoShop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useGSAP(() => {
    // 1. Hero Text Reveal
    const tl = gsap.timeline();
    tl.from(".hero-text", {
      y: 100,
      opacity: 0,
      skewY: 10,
      duration: 1.2,
      stagger: 0.15,
      ease: "power4.out",
      delay: 0.5
    });

    // 2. Background Parallax
    gsap.to(".bg-parallax", {
        yPercent: 30,
        scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // 3. Service Cards Entrance
    gsap.fromTo(".service-card", 
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out", 
        scrollTrigger: {
            trigger: "#services-grid",
            start: "top 80%"
        } 
      }
    );

  }, { scope: containerRef });

  const filteredServices = useMemo(() => {
    if (activeCategory === "All") return SERVICES;
    return SERVICES.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  return (
    <main ref={containerRef} className="bg-zinc-950 text-zinc-100 min-h-screen selection:bg-red-600 selection:text-white overflow-x-hidden font-sans">
      
      {/* --- SCROLLBAR HIDE --- */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
         {/* Mesh Gradient */}
         <div className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vh] bg-red-900/10 blur-[150px] mix-blend-screen rounded-full" />
         <div className="bg-parallax absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#333 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
         <div className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-1">
             <Gauge className="w-8 h-8 text-red-600" />
             APEX<span className="text-zinc-500">AUTO</span>
         </div>
         <MegaMenu onCategorySelect={(cat) => setActiveCategory(cat)} />
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-32 pb-20 overflow-hidden">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 z-0 select-none">
             <Image 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000" 
                alt="Supercar" 
                fill 
                className="object-cover opacity-40 mix-blend-luminosity"
                priority
             />
             <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
         </div>

         <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center">
                <div className="hero-text flex items-center gap-3 text-red-500 font-mono text-xs font-bold uppercase tracking-[0.3em] mb-6">
                    <span className="w-8 h-[2px] bg-red-500"></span>
                    Premium Auto Care
                </div>
                <h1 className="hero-text text-6xl md:text-8xl lg:text-9xl font-black uppercase italic leading-[0.85] tracking-tighter mb-8 text-white">
                    Built for <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Speed.</span>
                </h1>
                <p className="hero-text text-xl text-zinc-400 mb-10 max-w-lg font-light leading-relaxed">
                    Precision tuning, detailing, and protection for the world's finest machines. 
                    Elevate your driving experience.
                </p>
                <div className="hero-text flex gap-4">
                    <a href="#services-grid" className="group px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all skew-x-[-12deg] inline-flex items-center gap-3">
                        <span className="skew-x-[12deg] inline-block">Book Service</span>
                        <ArrowRight className="skew-x-[12deg] w-4 h-4" />
                    </a>
                    <a href="#visit" className="group px-8 py-4 border border-white/20 text-white font-black uppercase tracking-widest text-sm hover:border-white transition-all skew-x-[-12deg] inline-flex items-center gap-3">
                        <span className="skew-x-[12deg] inline-block">Our Garage</span>
                    </a>
                </div>
            </div>

            {/* Stats / Graphic */}
            <div className="hidden lg:flex flex-col justify-end items-end hero-text opacity-50">
               <div className="text-right mb-8">
                   <div className="text-6xl font-black text-white/20">01</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-red-500">Tuning</div>
               </div>
               <div className="text-right mb-8">
                   <div className="text-6xl font-black text-white/20">02</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-red-500">Detailing</div>
               </div>
               <div className="text-right">
                   <div className="text-6xl font-black text-white/20">03</div>
                   <div className="text-sm font-bold uppercase tracking-widest text-red-500">Protection</div>
               </div>
            </div>
         </div>
      </section>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-2">
        
        {/* --- SERVICES GRID --- */}
        <div id="services-grid" className="scroll-mt-32 mb-40">
           
           {/* Header */}
           <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-white/5 pb-8">
               <div>
                   <h2 className="text-5xl font-black uppercase italic tracking-tighter mb-2">Service Menu</h2>
                   <p className="text-zinc-500 font-mono text-sm">Select Category.</p>
               </div>
               
               {/* Filters */}
               <div className="flex flex-wrap gap-2">
                {["All", "Detailing", "Tuning", "Protection"].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
                            px-6 py-2 border border-white/10 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 skew-x-[-12deg]
                            ${activeCategory === cat 
                                ? 'bg-red-600 text-white border-red-600' 
                                : 'bg-transparent text-zinc-500 hover:text-white hover:border-white'}
                        `}
                    >
                        <span className="skew-x-[12deg] inline-block">{cat}</span>
                    </button>
                ))}
               </div>
           </div>

           {/* Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredServices.map(service => (
                   <div key={service.id} className="service-card group bg-zinc-900 border border-white/5 hover:border-red-600/50 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                       
                       {/* Image */}
                       <div className="relative h-48 overflow-hidden bg-black">
                           <Image 
                               src={service.image} 
                               alt={service.name} 
                               fill 
                               className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                               sizes="(max-width: 768px) 100vw, 33vw"
                           />
                           <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                               {service.category}
                           </div>
                       </div>

                       {/* Content */}
                       <div className="p-6 flex flex-col flex-1">
                           <h3 className="text-xl font-bold uppercase italic tracking-wide mb-2 group-hover:text-red-500 transition-colors">{service.name}</h3>
                           <p className="text-zinc-500 text-xs leading-relaxed mb-6">{service.description}</p>
                           
                           {/* Price & Action */}
                           <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                               <div className="font-mono text-lg text-white font-bold">${service.price}</div>
                               <ContactDropdown 
                                   serviceName={service.name}
                                   serviceCategory={service.category}
                                   servicePrice={service.price}
                                   serviceImage={service.image}
                                   colorClass="bg-zinc-800 hover:bg-black"
                               />
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>

        {/* --- WORKSHOP INFO --- */}
        <div id="visit" className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/5 bg-zinc-900 mb-20 overflow-hidden">
            
            {/* Map Area */}
            <div className="relative h-[500px] bg-zinc-800 group">
                <Image 
                    src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1748" 
                    alt="Map" 
                    fill 
                    className="object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600/90 text-white p-8 backdrop-blur-md text-center">
                        <MapPin className="w-10 h-10 mx-auto mb-4 text-black" />
                        <h3 className="text-2xl font-black uppercase italic mb-2">Central Garage</h3>
                        <p className="font-mono text-sm opacity-90">128 Carbon Ave, Techno City</p>
                        <button className="mt-6 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors border border-black hover:border-white">
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Area */}
            <div className="p-16 flex flex-col justify-center bg-black/50 backdrop-blur-sm relative">
                <div className="absolute top-0 right-0 p-4 text-zinc-700">
                    <Wrench className="w-32 h-32 opacity-10" />
                </div>
                
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-12 flex items-center gap-4">
                    <Clock className="w-8 h-8 text-red-600" />
                    Hours of Op.
                </h2>

                <div className="space-y-6 font-mono text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-zinc-400">MON - FRI</span>
                        <span className="font-bold text-white">08:00 - 20:00</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-zinc-400">SATURDAY</span>
                        <span className="font-bold text-white">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-zinc-400">SUNDAY</span>
                        <span className="text-red-600 font-bold">CLOSED (Track Day)</span>
                    </div>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Contact Direct</h4>
                    <p className="text-2xl font-black text-white hover:text-red-500 transition-colors cursor-pointer">
                        +1 (555) 000-APEX
                    </p>
                </div>
            </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-black py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              <div>
                  <div className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-1 mb-4">
                        <Gauge className="w-6 h-6 text-red-600" />
                        APEX<span className="text-zinc-500">AUTO</span>
                  </div>
                  <p className="text-zinc-600 text-xs max-w-xs">
                      Premium automotive care for the discerning enthusiast. Built for speed, maintained for longevity.
                  </p>
              </div>
              <div className="flex justify-center gap-8">
                    <Shield className="w-6 h-6 text-zinc-800" />
                    <Wrench className="w-6 h-6 text-zinc-800" />
                    <Zap className="w-6 h-6 text-zinc-800" />
              </div>
              <div className="text-right text-zinc-600 text-xs font-mono">
                  © 2026 APEX AUTO. <br/> ALL RIGHTS RESERVED.
              </div>
          </div>
      </footer>
    </main>
  );
}
