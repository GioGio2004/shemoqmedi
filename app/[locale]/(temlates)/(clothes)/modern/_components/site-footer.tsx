"use client";

import { Separator } from "@/components/ui/separator";
import { Instagram, Twitter, Github } from "lucide-react";
import { CATEGORIES } from "./data";

export function SiteFooter() {
  return (
    <footer className="py-20 px-8 border-t border-white/5 bg-[#05050f]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="text-2xl font-black italic mb-4 text-white">
              VOLOO<span className="text-[#00e5ff]">STORE</span>
            </div>
            <p className="text-sm text-[#5a5a70] mb-6 max-w-md">
              Digitalizing Georgian creators and bringing traditional craftsmanship to the modern world.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#00e5ff] hover:text-black transition-all text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#00e5ff] hover:text-black transition-all text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#00e5ff] hover:text-black transition-all text-white">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-white">Shop</h4>
            <ul className="space-y-3 text-sm text-[#8888a0]">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <a href={`#${cat.id}`} className="hover:text-[#00e5ff] transition-colors">
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-[#8888a0]">
              <li><a href="#about" className="hover:text-[#00e5ff] transition-colors">About Us</a></li>
              <li><a href="#testimonials" className="hover:text-[#00e5ff] transition-colors">Reviews</a></li>
              <li><a href="#contact" className="hover:text-[#00e5ff] transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-[#00e5ff] transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>

        <Separator className="bg-white/5 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#5a5a70]">
          <p className="font-mono tracking-wider">© 2026 FUTURECLOTH // TBILISI HQ // STATUS: OPERATIONAL</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#00e5ff] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#00e5ff] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#00e5ff] transition-colors">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
