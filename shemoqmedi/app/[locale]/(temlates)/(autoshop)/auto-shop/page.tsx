"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Wrench, Gauge, ShieldCheck, MapPin, ArrowRight, Settings } from "lucide-react";

import { BookingDropdown } from "./_components/booking-dropdown";
import { SERVICES } from "./_components/services-data";

gsap.registerPlugin(ScrollTrigger);

export default function TitanMotors() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useGSAP(() => {
    // 1. Garage Door Opening Effect (Hero)
    const tl = gsap.timeline();
    tl.from(".shutter-slice", {
      height: "100%",
      duration: 1.5,
      stagger: 0.1,
      ease: "power3.inOut"
    })
    .from(".hero-content", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    }, "-=0.5");

    // 2. Technical Drawings Parallax
    gsap.to(".tech-grid", {
      backgroundPosition: "0% 100%",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });

  }, { scope: containerRef });

  const filteredServices = useMemo(() => {
    if (activeCategory === "All") return SERVICES;
    return SERVICES.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <main ref={containerRef} className="bg-[#0a0a0a] text-zinc-300 min-h-screen selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
      
      {/* BACKGROUND: TECHNICAL BLUEPRINT GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="tech-grid w-full h-full" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
               backgroundSize: '50px 50px' 
             }} 
        />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600 animate-spin-slow" />
            <div className="text-xl font-black tracking-tighter uppercase text-white">
              TITAN<span className="text-blue-600">.</span>GE
            </div>
         </div>
         <button className="hidden md:flex items-center gap-2 px-6 py-2 border border-blue-600/30 text-blue-500 font-mono text-xs uppercase hover:bg-blue-600 hover:text-white transition-all">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Garage Open
         </button>
      </nav>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-20">
        
        {/* HERO SECTION */}
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 min-h-[80vh] items-center mb-32">
          
          {/* Left Content */}
          <div className="hero-content z-20">
             <div className="inline-block px-3 py-1 mb-6 border-l-4 border-blue-600 bg-white/5">
                <span className="text-blue-400 font-mono text-xs uppercase tracking-[0.2em]">Tbilisi • Batumi • Kutaisi</span>
             </div>
             <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-white leading-[0.9] mb-8 uppercase">
                Precision <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">Engineering</span>
             </h1>
             <p className="text-lg text-zinc-400 max-w-lg mb-10 leading-relaxed">
                Georgia's premier automotive laboratory. From off-road preparation for Kazbegi to track tuning for Rustavi International Motorpark.
             </p>
             <div className="flex flex-wrap gap-4">
                <a href="#services" className="px-8 py-4 bg-blue-600 text-white font-bold uppercase tracking-wider hover:bg-blue-500 transition-all clip-path-slant">
                   Explore Services
                </a>
                <a href="#location" className="px-8 py-4 border border-white/20 text-white font-bold uppercase tracking-wider hover:bg-white/5 transition-all flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> Find Us
                </a>
             </div>
          </div>

          {/* Right Image with Shutter Effect */}
          <div className="relative h-[600px] w-full bg-zinc-900 overflow-hidden border border-white/10 group">
             {/* The Shutter Overlays (CSS handled via GSAP) */}
             <div className="absolute inset-0 flex z-20 pointer-events-none">
                {[1,2,3,4].map(i => <div key={i} className="shutter-slice flex-1 bg-[#0a0a0a] border-r border-zinc-800" />)}
             </div>
             
             <Image 
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000" 
                alt="Supercar in Garage" 
                fill 
                className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                priority
             />
             
             {/* HUD Overlay */}
             <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/50 to-transparent flex justify-between items-end">
                <div className="font-mono text-xs text-blue-400">
                   <div>SYSTEM: ONLINE</div>
                   <div>TEMP: 24°C</div>
                </div>
                <Gauge className="w-12 h-12 text-white opacity-50" />
             </div>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32 border-y border-white/10 py-12">
           {[
              { label: "Cars Tuned", val: "1,200+" },
              { label: "Years in Tbilisi", val: "12" },
              { label: "Dyno Max HP", val: "1,500" },
              { label: "Warranty", val: "Lifetime" }
           ].map((stat, i) => (
              <div key={i} className="text-center border-r last:border-0 border-white/5">
                 <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.val}</div>
                 <div className="text-xs text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </div>
           ))}
        </div>

        {/* SERVICES GRID */}
        <div id="services" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
             <div>
                <h2 className="text-4xl font-black text-white uppercase mb-2 flex items-center gap-3">
                   <Wrench className="w-8 h-8 text-blue-600" /> Workshop Menu
                </h2>
                <p className="text-zinc-500">Select a category to view capabilities.</p>
             </div>
             
             {/* Industrial Tabs */}
             <div className="flex flex-wrap bg-zinc-900/50 p-1 border border-white/10">
                {["All", "Performance", "Off-Road", "Styling"].map(cat => (
                   <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`
                         px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all
                         ${activeCategory === cat ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}
                      `}
                   >
                      {cat}
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {filteredServices.map((service) => (
                <div key={service.id} className="group relative bg-[#111] border border-white/5 hover:border-blue-600/50 transition-colors duration-500 overflow-hidden">
                   {/* Card Image */}
                   <div className="relative h-64 overflow-hidden">
                      <Image 
                         src={service.image} 
                         alt={service.name} 
                         fill 
                         className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0" 
                      />
                      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                         {service.category}
                      </div>
                   </div>

                   {/* Card Body */}
                   <div className="p-6 relative">
                      {/* Decorative Line */}
                      <div className={`absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${service.color}`} />
                      
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="text-xl font-bold text-white uppercase">{service.name}</h3>
                         <div className="text-lg font-mono text-blue-500">₾{service.price}</div>
                      </div>
                      
                      <p className="text-zinc-500 text-sm mb-8 h-10 line-clamp-2">{service.description}</p>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                         <div className="flex items-center gap-2 text-xs text-zinc-600 uppercase font-bold">
                            <ShieldCheck className="w-4 h-4" /> Certified
                         </div>
                         <BookingDropdown 
                            serviceName={service.name}
                            category={service.category}
                            price={service.price}
                            image={service.image}
                         />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* LOCATION / MAP SECTION */}
        <div id="location" className="mt-40 grid lg:grid-cols-12 gap-0 border border-white/10 bg-[#111]">
           <div className="lg:col-span-4 p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
              <h3 className="text-3xl font-black text-white uppercase mb-8">Base of Operations</h3>
              <div className="space-y-8">
                 <div>
                    <div className="text-xs text-blue-500 uppercase tracking-widest mb-1">Address</div>
                    <div className="text-xl text-zinc-300">12 Kakheti Highway<br/>Tbilisi, Georgia</div>
                 </div>
                 <div>
                    <div className="text-xs text-blue-500 uppercase tracking-widest mb-1">Working Hours</div>
                    <div className="text-xl text-zinc-300 font-mono">Mon-Sat: 10:00 - 20:00</div>
                 </div>
                 <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                    Get Directions
                 </button>
              </div>
           </div>
           <div className="lg:col-span-8 relative h-[400px] lg:h-auto bg-zinc-800 grayscale invert-[0.9]">
               {/* Placeholder for map - using an image for style */}
               <Image 
                 src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000" 
                 alt="Tbilisi Map" 
                 fill 
                 className="object-cover opacity-40"
               />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-ping absolute" />
                  <div className="w-4 h-4 bg-blue-600 rounded-full relative border-2 border-white shadow-xl" />
               </div>
           </div>
        </div>

      </div>

      <footer className="border-t border-white/10 bg-[#050505] py-12 text-center">
         <div className="text-3xl font-black text-zinc-800 uppercase tracking-tighter mb-4">Titan Motors</div>
         <p className="text-zinc-600 text-xs uppercase tracking-widest">© 2026 Tbilisi, Georgia. Built for the bold.</p>
      </footer>
      
    </main>
  );
}