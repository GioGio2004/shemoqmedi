"use client";

import { useState } from "react";
import Image from "next/image";
import { Wrench, Shield, Zap, MapPin, Clock, Phone, Menu as MenuIcon, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function MegaMenu({ onCategorySelect }: { onCategorySelect?: (category: string) => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    {
      title: "Services",
      id: "services",
      items: [
        { name: "Detailing", icon: Zap, desc: "Restoration & Cleaning" },
        { name: "Tuning", icon: Wrench, desc: "Performance Upgrades" },
        { name: "Protection", icon: Shield, desc: "PPF & Ceramic" },
      ],
      featured: {
        title: "Track Ready",
        name: "Stage 2 Package",
        image: "https://images.unsplash.com/photo-1580273916550-e323be2eb09c?q=80&w=1000",
      }
    },
    {
      title: "Garage",
      id: "garage",
      items: [
        { name: "Locations", icon: MapPin, desc: "Our Workshop" },
        { name: "Hours", icon: Clock, desc: "Service Times" },
        { name: "Contact", icon: Phone, desc: "Book Appointment" },
      ],
      featured: {
        title: "The Workshop",
        name: "State of Art",
        image: "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1000",
      }
    }
  ];

  const handleItemClick = (categoryName: string, sectionId: string) => {
    if (sectionId === "services" && onCategorySelect) {
      onCategorySelect(categoryName);
      const element = document.getElementById("services-grid");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
        const element = document.getElementById("visit");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    setOpenSection(null);
    setMobileMenuOpen(false);
  };

  useGSAP(() => {
    if (mobileMenuOpen) {
      gsap.to(".mobile-menu", { x: 0, duration: 0.5, ease: "power3.out" });
      gsap.from(".mobile-item", { x: 50, opacity: 0, stagger: 0.1, duration: 0.4, delay: 0.2 });
    } else {
      gsap.to(".mobile-menu", { x: "100%", duration: 0.5, ease: "power3.in" });
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-12 items-center" onMouseLeave={() => setOpenSection(null)}>
        {categories.map((cat) => (
          <div key={cat.id} className="relative group" onMouseEnter={() => setOpenSection(cat.id)}>
            <button 
              className={`text-xs font-black uppercase tracking-[0.2em] py-4 transition-colors ${openSection === cat.id ? 'text-red-500' : 'text-zinc-300 hover:text-white'}`}
            >
              {cat.title}
            </button>
            
            {/* Mega Dropdown */}
            <div className={`absolute top-full right-0 w-[700px] bg-black/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-0 grid grid-cols-5 gap-0 transition-all duration-300 origin-top z-50 overflow-hidden ${openSection === cat.id ? 'opacity-100 scale-100 visible translate-y-0' : 'opacity-0 scale-95 invisible -translate-y-4'}`}>
               
               {/* List */}
               <div className="col-span-2 p-8 border-r border-white/5 bg-zinc-950/50">
                 <h3 className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-1 h-3 bg-red-500 inline-block"/>
                    {cat.title} Categories
                 </h3>
                 <div className="space-y-4">
                    {cat.items.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => handleItemClick(item.name, cat.id)}
                        className="flex items-center gap-4 p-3 -mx-3 rounded-none hover:bg-white/5 transition-colors cursor-pointer group/item border-l-2 border-transparent hover:border-red-500"
                    >
                        <item.icon className="w-5 h-5 text-zinc-500 group-hover/item:text-white transition-colors" />
                        <div>
                        <div className="font-bold text-white text-sm uppercase tracking-wide">{item.name}</div>
                        <div className="text-[10px] text-zinc-600 group-hover/item:text-zinc-400 transition-colors">{item.desc}</div>
                        </div>
                    </div>
                    ))}
                 </div>
               </div>

               {/* Featured Image */}
               <div className="col-span-3 relative group/img cursor-pointer">
                  <Image 
                    src={cat.featured.image} 
                    alt={cat.featured.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover/img:scale-105 opacity-60 group-hover/img:opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-8 left-8 z-10">
                     <div className="text-[10px] text-red-500 font-black uppercase tracking-widest mb-1 border-b border-red-500 inline-block pb-1">{cat.featured.title}</div>
                     <div className="text-3xl font-black text-white italic uppercase">{cat.featured.name}</div>
                  </div>
               </div>

            </div>
          </div>
        ))}
        <button 
            className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-8 py-3 hover:bg-white hover:text-black transition-colors skew-x-[-12deg]"
        >
            <span className="skew-x-[12deg] inline-block">Get Quote</span>
        </button>
      </div>

      {/* MOBILE HAMBURGER */}
      <div className="md:hidden">
         <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-white">
            <MenuIcon className="w-8 h-8" />
         </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      <div className="mobile-menu fixed inset-0 z-[60] bg-black flex flex-col p-8 translate-x-full md:hidden">
         <div className="flex justify-between items-center mb-12">
            <div className="text-2xl font-black uppercase italic tracking-tighter">APEX<span className="text-red-500">.</span></div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
               <X className="w-8 h-8" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto space-y-12">
            {categories.map((cat) => (
               <div key={cat.id} className="mobile-item">
                  <h3 className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-white/10 pb-2">{cat.title}</h3>
                  <div className="space-y-6">
                     {cat.items.map((item, idx) => (
                        <div 
                           key={idx} 
                           onClick={() => handleItemClick(item.name, cat.id)}
                           className="flex items-center gap-6 text-zinc-300 hover:text-red-500 transition-colors pl-4 border-l border-white/10"
                        >
                           <item.icon className="w-6 h-6" />
                           <span className="text-xl font-bold uppercase tracking-wider">{item.name}</span>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
    </>
  );
}
