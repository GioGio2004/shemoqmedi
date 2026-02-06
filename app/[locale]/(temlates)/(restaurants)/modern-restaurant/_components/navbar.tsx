"use client";

import { Aperture, Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <Aperture className="text-cyan-400 w-8 h-8 md:w-10 md:h-10 animate-slow-spin" />
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black tracking-[0.2em] text-white">
              NEBULA
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-cyan-400/80">
              High-Dining
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-12 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
          <a href="#menu" className="hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-300">
            Coordinates
          </a>
          <a href="#experience" className="hover:text-purple-400 hover:shadow-[0_0_20px_rgba(192,132,252,0.5)] transition-all duration-300">
            Experience
          </a>
          <a href="#reserve" className="px-6 py-2 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all rounded-none skew-x-[-10deg]">
             <span className="skew-x-[10deg] inline-block">Initialize</span>
          </a>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="md:hidden text-white hover:text-cyan-400 transition-colors">
            <Menu className="w-8 h-8" />
          </SheetTrigger>
          <SheetContent className="bg-black/95 border-l border-white/10 text-white w-full">
            <SheetHeader className="mb-12 border-b border-white/10 pb-6">
              <SheetTitle className="text-left text-3xl font-black tracking-widest text-white">
                NV-01
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-8 text-2xl font-bold tracking-widest uppercase">
              <a href="#menu" className="text-zinc-500 hover:text-cyan-400 transition-colors">Menu</a>
              <a href="#experience" className="text-zinc-500 hover:text-purple-400 transition-colors">Experience</a>
              <a href="#reserve" className="text-cyan-400">Connect</a>
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </nav>
  );
}
