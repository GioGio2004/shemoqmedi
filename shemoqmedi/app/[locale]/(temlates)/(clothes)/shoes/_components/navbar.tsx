"use client";

import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-3xl font-black italic tracking-tighter uppercase relative group cursor-pointer">
          <span className="relative z-10 group-hover:text-[#ccff00] transition-colors">Sole</span>
          <span className="text-[#ccff00] group-hover:text-black transition-colors">City</span>
          <div className="absolute -bottom-2 right-0 w-full h-1 bg-black group-hover:bg-[#ccff00] transition-colors" />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-bold uppercase tracking-wide text-sm">
          <a href="#" className="hover:text-[#ff00cc] transition-colors hover:-translate-y-1 inline-block">New Drops</a>
          <a href="#" className="hover:text-[#00ccff] transition-colors hover:-translate-y-1 inline-block">Men</a>
          <a href="#" className="hover:text-[#ccff00] transition-colors hover:-translate-y-1 inline-block">Women</a>
          <a href="#" className="hover:text-[#ff00cc] transition-colors hover:-translate-y-1 inline-block">Sale</a>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-black hover:text-white rounded-full transition-all">
                <Search size={20} strokeWidth={3} />
            </button>
            <button className="relative p-2 hover:bg-[#ccff00] rounded-full transition-all group">
                <ShoppingBag size={20} strokeWidth={3} />
                <span className="absolute -top-1 -right-1 bg-[#ff00cc] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white group-hover:border-[#ccff00]">
                    2
                </span>
            </button>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger className="md:hidden p-2 hover:bg-black hover:text-white rounded-lg transition-colors">
                    <Menu size={24} strokeWidth={3} />
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#ccff00] border-l-4 border-black p-0 w-full sm:w-[400px]">
                    <div className="flex flex-col h-full p-8 relative">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-black text-white hover:bg-white hover:text-black transition-all rounded-full"
                        >
                            <X size={24} strokeWidth={3} />
                        </button>
                        
                        <div className="mt-20 flex flex-col gap-6">
                             {["New Drops", "Men", "Women", "Sale", "Collections"].map((item, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
                                    className="text-6xl font-black uppercase italic hover:text-white hover:translate-x-4 transition-all"
                                >
                                    {item}
                                </a>
                             ))}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </nav>
  );
}
