"use client";

import { useState } from "react";
import { Sparkles, ShoppingBag, Search, Heart, Menu, ChevronRight, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES } from "./data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Navbar({ 
  scrollTo,
  wishlistCount,
  cartCount
}: { 
  scrollTo: (id: string) => void;
  wishlistCount: number;
  cartCount: number;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  useGSAP(() => {
    ScrollTrigger.create({
      start: "top -50",
      onEnter: () => gsap.to(".navbar", { 
        backgroundColor: "rgba(5, 5, 15, 0.95)", 
        backdropFilter: "blur(16px)", 
        borderBottom: "1px solid rgba(255,255,255,0.05)", 
        duration: 0.4 
      }),
      onLeaveBack: () => gsap.to(".navbar", { 
        backgroundColor: "transparent", 
        backdropFilter: "blur(0px)", 
        borderBottom: "1px solid transparent", 
        duration: 0.4 
      }),
    });
  });

  return (
    <nav className="navbar fixed top-0 w-full z-[100] px-4 md:px-8 transition-all duration-500">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4">
        <div 
          className="text-xl font-black italic tracking-tighter cursor-pointer flex items-center gap-2" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
          <Sparkles size={20} className="text-[#00e5ff]" />
          VOLOO<span className="text-[#00e5ff]">STORE</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8888a0]">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-[#00e5ff] outline-none transition-colors">
              Categories <ChevronRight size={10} className="rotate-90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0a0a1a] border-white/5 text-white p-2">
              {CATEGORIES.map(cat => (
                <DropdownMenuItem 
                  key={cat.id} 
                  onClick={() => scrollTo(cat.id)} 
                  className="text-[10px] uppercase font-bold p-3 focus:bg-[#00e5ff] focus:text-black cursor-pointer"
                >
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <a href="#about" className="hover:text-[#00e5ff] transition-colors">About</a>
          <a href="#testimonials" className="hover:text-[#00e5ff] transition-colors">Reviews</a>
          <a href="#contact" className="hover:text-[#00e5ff] transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:text-[#00e5ff] transition-colors"
          >
            <Search size={20} />
          </button>
          <button className="relative p-2 hover:text-[#00e5ff] transition-colors group">
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#00e5ff] text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          <button className="relative p-2 hover:text-[#00e5ff] transition-colors">
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 bg-[#00e5ff] text-black text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
          <Sheet>
            <SheetTrigger className="md:hidden p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent className="bg-[#05050f] border-white/5 text-white">
              <SheetHeader className="mb-12">
                <SheetTitle className="text-white text-left font-black italic">MENU</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-8">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => scrollTo(cat.id)} 
                    className="text-3xl font-bold uppercase tracking-tighter text-left hover:text-[#00e5ff] transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
                <Separator className="bg-white/5" />
                <a href="#about" className="text-xl font-bold uppercase hover:text-[#00e5ff] transition-colors">About</a>
                <a href="#contact" className="text-xl font-bold uppercase hover:text-[#00e5ff] transition-colors">Contact</a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search Bar Dropdown */}
      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/5 p-6 shadow-2xl">
          <div className="max-w-3xl mx-auto relative">
            <Input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white/5 border-white/10 rounded-2xl pl-12 pr-12 py-6 text-sm focus:border-[#00e5ff] transition-all text-white placeholder:text-zinc-600"
              autoFocus
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888a0]" size={20} />
            <button 
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8888a0] hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
