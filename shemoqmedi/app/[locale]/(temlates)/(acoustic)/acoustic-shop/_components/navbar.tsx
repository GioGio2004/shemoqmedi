"use client";

import { useState } from "react";
import { Music, ShoppingCart, Search, Menu, X, ChevronDown } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "./data";

export function Navbar({ scrollToCategory }: { scrollToCategory: (id: string) => void }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#3d2b1f]/95 backdrop-blur-md border-b border-[#5e4332] shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3 text-white font-serif cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#e6b800] rounded-full flex items-center justify-center text-[#3d2b1f]">
                <Music size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Melody<span className="text-[#e6b800]">Woods</span></span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-[#d4c5b5] hover:text-[#e6b800] font-medium transition-colors outline-none">
                    Instruments <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#2a1d15] border-[#5e4332] text-[#d4c5b5] w-56">
                    {CATEGORIES.slice(1).map(cat => (
                        <DropdownMenuItem 
                            key={cat.id} 
                            onClick={() => scrollToCategory(cat.id)}
                            className="hover:!bg-[#3d2b1f] hover:!text-[#e6b800] cursor-pointer py-3 px-4 flex items-center gap-3"
                        >
                            <span className="text-xl">{cat.icon}</span> {cat.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <a href="#" className="text-[#d4c5b5] hover:text-[#e6b800] font-medium transition-colors">Lessons</a>
            <a href="#" className="text-[#d4c5b5] hover:text-[#e6b800] font-medium transition-colors">Repairs</a>
            <button onClick={() => scrollToCategory("about")} className="text-[#d4c5b5] hover:text-[#e6b800] font-medium transition-colors">About</button>
            <button onClick={() => scrollToCategory("contact")} className="text-[#e6b800] font-bold border-b-2 border-[#e6b800] hover:text-white hover:border-white transition-all">Contact Us</button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 text-[#d4c5b5]">
            <button className="hover:text-[#e6b800] transition-colors"><Search size={22} /></button>
            <button className="relative hover:text-[#e6b800] transition-colors">
                <ShoppingCart size={22} />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-[#e6b800] text-[#3d2b1f] hover:bg-[#ffe066]">0</Badge>
            </button>
            <button className="md:hidden" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#2a1d15] border-t border-[#5e4332] p-4 text-[#d4c5b5] absolute w-full left-0 animate-in slide-in-from-top-4 fade-in">
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase tracking-widest text-[#8c7462] mb-2 font-bold">Categories</p>
                {CATEGORIES.slice(1).map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => {
                            scrollToCategory(cat.id);
                            setIsMobileOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-[#3d2b1f] rounded-lg transition-colors text-left"
                    >
                         <span className="text-xl">{cat.icon}</span> {cat.label}
                    </button>
                ))}
                <div className="h-px bg-[#5e4332] my-2" />
                <a href="#" className="p-3 hover:bg-[#3d2b1f] rounded-lg">Lessons</a>
                <a href="#" className="p-3 hover:bg-[#3d2b1f] rounded-lg">Repairs</a>
                <button onClick={() => { scrollToCategory("about"); setIsMobileOpen(false); }} className="text-left p-3 hover:bg-[#3d2b1f] rounded-lg w-full">About Us</button>
                <button onClick={() => { scrollToCategory("contact"); setIsMobileOpen(false); }} className="text-left p-3 bg-[#e6b800] text-[#3d2b1f] font-bold rounded-lg w-full mt-2">Contact</button>
            </div>
        </div>
      )}
    </nav>
  );
}
