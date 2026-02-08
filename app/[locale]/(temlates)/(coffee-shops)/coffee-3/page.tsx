"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Zap, ArrowRight } from "lucide-react";

// Use the paths relative to your project structure
import { ContactDropdown } from "./_components/contact-dropdown";
import { PRODUCTS } from "./_components/image-listing";
import { MegaMenu } from "./_components/mega-menu";
import { Coffee3 } from "@/components/chatbots/coffee/coffee-3";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useGSAP(() => {
    // 1. Reveal Elements
    const tl = gsap.timeline();
    tl.from(".hero-reveal", {
      y: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out",
      delay: 0.2
    });

    // 2. Background Text Parallax
    gsap.to(".bg-parallax-text", {
      xPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1
      }
    });

    // 3. Grid Stagger Animation when filtering
    gsap.fromTo(".product-card", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", overwrite: "auto" }
    );

  }, { scope: containerRef });

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <main ref={containerRef} className="bg-[#050505] text-zinc-100 min-h-screen selection:bg-orange-500 overflow-x-hidden font-sans">
      
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-orange-600/10 blur-[150px] rounded-full mix-blend-screen" />
        
        {/* Moving Text */}
        <div className="absolute top-[40%] left-[-10%] w-[120vw] opacity-5 -rotate-3">
          <h1 className="bg-parallax-text text-[20vw] font-black whitespace-nowrap leading-none uppercase">
            Taste The Void Taste The Void
          </h1>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px]">
         <div className="text-2xl font-black tracking-tighter uppercase relative z-50">
            Noir<span className="text-orange-500">.</span>
         </div>
         <MegaMenu onCategorySelect={(cat) => setActiveCategory(cat)} />
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        
        {/* --- HERO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-40 min-h-[70vh]">
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="hero-reveal inline-flex items-center gap-2 text-orange-500 font-mono text-xs font-bold tracking-[0.2em] uppercase mb-8">
              <Zap className="w-4 h-4" /> Est. 2024
            </div>
            <h1 className="hero-reveal text-6xl md:text-8xl xl:text-9xl font-black leading-[0.9] tracking-tighter mb-8">
              WAKE UP <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-white">
                TO DARKNESS
              </span>
            </h1>
            <p className="hero-reveal text-xl text-zinc-400 mb-10 max-w-lg leading-relaxed border-l-2 border-orange-500/50 pl-6">
              Curated caffeine for the nocturnal soul. Experience single-origin roasts and artisanal pastries in a space designed for silence.
            </p>
            <div className="hero-reveal flex gap-4">
              <a href="#menu" className="group px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center gap-2">
                View Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Visual Content */}
          <div className="lg:col-span-5 relative h-[500px] hero-reveal hidden lg:block">
             <div className="absolute inset-0 bg-zinc-900 rounded-[3rem] rotate-3 border border-white/5 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000" 
                  alt="Hero" 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
             </div>
             <div className="absolute bottom-10 -left-10 p-6 bg-orange-600 text-black rounded-3xl -rotate-6 shadow-2xl shadow-orange-900/20">
                <div className="text-4xl font-black mb-1">4.9</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Avg Rating</div>
             </div>
          </div>
        </div>

        {/* --- MENU SECTION --- */}
        <div id="menu" className="scroll-mt-32">
          {/* Header & Filter */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-white/10 pb-8">
            <div>
              <h2 className="text-5xl font-black uppercase mb-4 tracking-tight">The Collection</h2>
              <p className="text-zinc-500 font-mono">Select your poison.</p>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
               {["All", "Coffee", "Drinks", "Bakery", "Cakes"].map(cat => (
                  <button 
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`
                        px-6 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider transition-all duration-300
                        ${activeCategory === cat 
                          ? 'bg-orange-600 text-white border-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]' 
                          : 'bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white'}
                     `}
                  >
                     {cat}
                  </button>
               ))}
            </div>
          </div>

          {/* Product Grid - 12 Items Support */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredProducts.map((product) => (
               <div 
                  key={product.id} 
                  className="product-card group relative bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:bg-zinc-900/80 hover:border-orange-500/30 transition-all duration-500"
               >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-black">
                     <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                     />
                     <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">{product.category}</span>
                     </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold leading-tight group-hover:text-orange-500 transition-colors">{product.name}</h3>
                          <span className="text-lg font-mono text-zinc-400">${product.price.toFixed(2)}</span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed mb-6 line-clamp-2 min-h-[2.5em]">{product.description}</p>
                      
                      {/* Action Area */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                         <div className={`w-2 h-2 rounded-full ${product.color || 'bg-white'}`} />
                         <ContactDropdown 
                            productName={product.name}
                            productCategory={product.category}
                            productPrice={product.price}
                            productImage={product.image}
                            colorClass="bg-zinc-800 hover:bg-orange-600 text-xs px-4 py-2"
                         />
                      </div>
                  </div>
               </div>
             ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
             <div className="py-20 text-center text-zinc-500">
                <p>No products found in this category.</p>
             </div>
          )}
        </div>
      
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-black">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
             <h2 className="text-xl font-black uppercase">Noir<span className="text-orange-500">.</span></h2>
             <div className="flex gap-8 text-sm text-zinc-500 font-mono uppercase tracking-wider">
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-white transition-colors">Email</a>
             </div>
             <p className="text-zinc-700 text-xs">© 2026 NOIR COFFEE.</p>
          </div>
      </footer>

      {/* --- LIQUID AI CHAT COMPONENT --- */}
          <Coffee3 />
    </main>
  );
}