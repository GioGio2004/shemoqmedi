"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Coffee, Cake, CloudLightning, MapPin, Clock, Phone, Menu as MenuIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function MegaMenu({ onCategorySelect }: { onCategorySelect?: (category: string) => void }) {
  const t = useTranslations('CoffeeTemplate3.Categories');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Ref for the desktop menu container
  const containerRef = useRef<HTMLDivElement>(null);
  // Ref for the mobile menu container
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      title: t('Menu'),
      id: "menu",
      items: [
        { name: "Coffee", label: t('Coffee'), icon: Coffee, desc: t('Coffee_Desc') },
        { name: "Cakes", label: t('Cakes'), icon: Cake, desc: t('Cakes_Desc') },
        { name: "Drinks", label: t('Drinks'), icon: CloudLightning, desc: t('Drinks_Desc') },
      ],
      featured: {
        title: t('Seasonal'),
        name: t('Featured_Menu_Name'),
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600",
      }
    },
    {
      title: t('Visit'),
      id: "visit",
      items: [
        { name: "Locations", label: t('Locations'), icon: MapPin, desc: t('Locations_Desc') },
        { name: "Hours", label: t('Hours'), icon: Clock, desc: t('Hours_Desc') },
        { name: "Contact", label: t('Contact'), icon: Phone, desc: t('Contact_Desc') },
      ],
      featured: {
        title: t('NewLocation'),
        name: t('Featured_Visit_Name'),
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600",
      }
    }
  ];

  const handleItemClick = (categoryName: string, sectionId: string) => {
    if (sectionId === "menu" && onCategorySelect) {
      onCategorySelect(categoryName);
    }
    setOpenSection(null);
    setMobileMenuOpen(false);
    
    const targetId = sectionId === "menu" ? "menu" : "visit";
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Mobile Menu Animation Logic ---
  useGSAP(() => {
    if (!mobileMenuRef.current) return;
    
    if (mobileMenuOpen) {
      // Animate In
      gsap.to(mobileMenuRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
      gsap.fromTo(".mobile-item", 
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, delay: 0.2, ease: "power2.out" }
      );
    } else {
      // Animate Out
      gsap.to(mobileMenuRef.current, { x: "100%", duration: 0.5, ease: "power3.in" });
    }
  }, { dependencies: [mobileMenuOpen], scope: mobileMenuRef });

  return (
    <div ref={containerRef}>
      {/* DESKTOP MENU */}
      <div className="hidden md:flex gap-8 items-center" onMouseLeave={() => setOpenSection(null)}>
        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            <button 
              onMouseEnter={() => setOpenSection(cat.id)}
              className={`text-sm font-bold uppercase tracking-widest py-4 transition-colors ${openSection === cat.id ? 'text-orange-500' : 'text-white hover:text-orange-500'}`}
            >
              {cat.title}
            </button>
            
            {/* Mega Dropdown */}
            {/* Added pt-4 to create a safe bridge so mouse doesn't disconnect */}
            <div 
              onMouseEnter={() => setOpenSection(cat.id)}
              className={`
                absolute top-full left-1/2 -translate-x-1/2 w-[600px] pt-6 
                transition-all duration-300 origin-top z-[100]
                ${openSection === cat.id ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible pointer-events-none'}
              `}
            >
               {/* Actual Menu Content */}
               <div className="bg-zinc-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 grid grid-cols-2 gap-6">
                  {/* List */}
                  <div className="space-y-4">
                    <h3 className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-2">{cat.title}</h3>
                    {cat.items.map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleItemClick(item.name, cat.id)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group/item"
                      >
                        <div className="p-2 bg-zinc-800 rounded-lg group-hover/item:bg-orange-500 group-hover/item:text-black transition-colors">
                          <item.icon className="w-5 h-5 text-white group-hover/item:text-black" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.label}</div>
                          <div className="text-xs text-zinc-500">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Featured Image */}
                  <div className="relative rounded-xl overflow-hidden group/img h-full min-h-[200px]">
                    <Image 
                      src={cat.featured.image} 
                      alt={cat.featured.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover/img:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <div className="text-xs text-orange-400 font-bold uppercase mb-1">{cat.featured.title}</div>
                        <div className="text-xl font-black text-white">{cat.featured.name}</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MOBILE HAMBURGER */}
      <div className="md:hidden">
         <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-white">
            <MenuIcon className="w-8 h-8" />
         </button>
      </div>

      {/* MOBILE MENU PORTAL - Moves this element to document.body */}
      <MobileMenuPortal>
        <div 
          ref={mobileMenuRef}
          className="fixed inset-0 z-[999] bg-zinc-950 flex flex-col p-8 translate-x-full"
          style={{ transform: 'translateX(100%)' }} // Initial state for GSAP to grab
        >
           <div className="flex justify-between items-center mb-12">
              <div className="text-2xl font-black uppercase">Noir<span className="text-orange-500">.</span></div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white hover:text-orange-500 transition-colors">
                 <X className="w-8 h-8" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar">
              {categories.map((cat) => (
                 <div key={cat.id} className="mobile-item opacity-0">
                    <h3 className="text-orange-500 text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">{cat.title}</h3>
                    <div className="space-y-4">
                       {cat.items.map((item, idx) => (
                          <div 
                             key={idx} 
                             onClick={() => handleItemClick(item.name, cat.id)}
                             className="flex items-center gap-4 text-white hover:text-orange-500 transition-colors cursor-pointer"
                          >
                             <item.icon className="w-6 h-6" />
                             <span className="text-xl font-bold">{item.label}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </MobileMenuPortal>
    </div>
  );
}

// Utility component to render children into body
const MobileMenuPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
};