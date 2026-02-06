"use client";

import { useRef } from "react";
import { Utensils, Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <nav className="navbar fixed top-0 w-full z-[100] px-6 md:px-12 transition-all duration-500">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-6">
        <div className="text-2xl md:text-3xl font-bold tracking-tight cursor-pointer flex items-center gap-2 font-display">
          <div className="relative">
            <Utensils size={28} className="text-[#bc6c25]" strokeWidth={1.5} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#bc6c25] rounded-full animate-pulse" />
          </div>
          <span className="tracking-[-0.02em]">AURA</span>
          <span className="font-light italic text-[#bc6c25]">Bistro</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[11px] font-semibold uppercase tracking-[0.15em]">
          <a href="#menu" className="hover:text-[#bc6c25] transition-colors duration-300 relative group">
            The Menu
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#bc6c25] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#philosophy" className="hover:text-[#bc6c25] transition-colors duration-300 relative group">
            Philosophy
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#bc6c25] transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#booking" className="hover:text-[#bc6c25] transition-colors duration-300 relative group">
            Reservations
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#bc6c25] transition-all duration-300 group-hover:w-full" />
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-7 py-2.5 border-2 border-[#2d2a26] rounded-full text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#2d2a26] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95">
            Book a Table
          </button>
          <Sheet>
            <SheetTrigger className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors">
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent className="bg-[#fffcf5] border-l border-black/10 w-full sm:max-w-md">
              <SheetHeader className="mb-12">
                <SheetTitle className="text-left font-bold text-3xl tracking-tighter font-display">
                  AURA <span className="text-[#bc6c25] italic font-light">Bistro</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-8 text-2xl font-display font-medium">
                <a href="#menu" className="hover:text-[#bc6c25] transition-colors border-b border-black/5 pb-4">The Menu</a>
                <a href="#philosophy" className="hover:text-[#bc6c25] transition-colors border-b border-black/5 pb-4">Our Philosophy</a>
                <a href="#booking" className="hover:text-[#bc6c25] transition-colors border-b border-black/5 pb-4">Reservations</a>
                <a href="#testimonials" className="hover:text-[#bc6c25] transition-colors border-b border-black/5 pb-4">Testimonials</a>
              </div>
              <div className="mt-12">
                <button className="w-full px-7 py-4 bg-[#bc6c25] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#dda15e] transition-all">
                  Reserve Now
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
