"use client";

import { Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-8 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ccff00] via-[#ff00cc] to-[#00ccff]" />

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 mb-20 relative z-10">
        <div>
          <div className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-6 text-center md:text-left">
            Sole<span className="text-[#00ccff]">City</span>
          </div>
          <p className="max-w-md text-gray-400 font-medium text-center md:text-left mx-auto md:mx-0">
            The destination for sneakerheads. We don't just sell shoes; we curate the culture. Join the movement.
          </p>
          
          <div className="flex gap-4 mt-8 justify-center md:justify-start">
            <a href="#" className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center hover:bg-[#ff00cc] hover:border-[#ff00cc] transition-all">
                <Instagram size={20} />
            </a>
            <a href="#" className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center hover:bg-[#00ccff] hover:border-[#00ccff] transition-all">
                <Twitter size={20} />
            </a>
            <a href="#" className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center hover:bg-[#ccff00] hover:border-[#ccff00] hover:text-black transition-all">
                <Facebook size={20} />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div>
                <h4 className="font-black uppercase text-[#ccff00] mb-6">Shop</h4>
                <ul className="space-y-4 font-bold uppercase text-sm">
                    {["New Arrivals", "Best Sellers", "Men", "Women", "Kids"].map(item => (
                        <li key={item}><a href="#" className="hover:text-[#ff00cc] hover:translate-x-2 inline-block transition-all">{item}</a></li>
                    ))}
                </ul>
            </div>
            <div>
                <h4 className="font-black uppercase text-[#ff00cc] mb-6">Support</h4>
                <ul className="space-y-4 font-bold uppercase text-sm">
                    {["Order Status", "Shipping", "Returns", "Size Guide", "Contact Us"].map(item => (
                        <li key={item}><a href="#" className="hover:text-[#00ccff] hover:translate-x-2 inline-block transition-all">{item}</a></li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {/* Big Text */}
      <div className="border-t border-white/20 pt-8 mt-8">
          <div className="w-full overflow-hidden whitespace-nowrap opacity-10">
              <h1 className="text-[12rem] font-black uppercase italic leading-none">
                  Just Do It Nothing Is Impossible
              </h1>
          </div>
          <div className="text-center mt-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
              © 2026 SoleCity Inc. All Rights Reserved.
          </div>
      </div>
    </footer>
  );
}
