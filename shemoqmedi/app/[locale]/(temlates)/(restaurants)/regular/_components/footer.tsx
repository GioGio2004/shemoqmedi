"use client";

import { Separator } from "@/components/ui/separator";
import { Instagram, Mail, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 md:py-24 px-8 border-t border-black/5 bg-[#fffcf5]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 md:gap-16 mb-16">
          <div className="space-y-6">
            <div className="text-3xl md:text-4xl font-bold font-display tracking-tighter">
              AURA <span className="text-[#bc6c25] italic font-light">Bistro</span>
            </div>
            <p className="text-[#5a5a70] leading-relaxed text-sm md:text-base">
              Celebrating the art of slow food and authentic Georgian hospitality since 2026.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-[#bc6c25]/10 rounded-full hover:bg-[#bc6c25] hover:text-white transition-all group">
                <Instagram size={20} className="text-[#bc6c25] group-hover:text-white" strokeWidth={2} />
              </a>
              <a href="#" className="p-3 bg-[#bc6c25]/10 rounded-full hover:bg-[#bc6c25] hover:text-white transition-all group">
                <Mail size={20} className="text-[#bc6c25] group-hover:text-white" strokeWidth={2} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-6">Quick Links</h4>
            <div className="space-y-3 text-[#5a5a70]">
              <a href="#menu" className="block hover:text-[#bc6c25] transition-colors">The Menu</a>
              <a href="#philosophy" className="block hover:text-[#bc6c25] transition-colors">Our Philosophy</a>
              <a href="#booking" className="block hover:text-[#bc6c25] transition-colors">Reservations</a>
              <a href="#" className="block hover:text-[#bc6c25] transition-colors">Private Events</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-sm uppercase tracking-[0.2em] mb-6">Information</h4>
            <div className="space-y-3 text-[#5a5a70]">
              <a href="#" className="block hover:text-[#bc6c25] transition-colors">Gift Cards</a>
              <a href="#" className="block hover:text-[#bc6c25] transition-colors">Careers</a>
              <a href="#" className="block hover:text-[#bc6c25] transition-colors">Press Kit</a>
              <a href="#" className="block hover:text-[#bc6c25] transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
        
        <Separator className="bg-black/5 mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#5a5a70]">
          <p className="uppercase tracking-[0.2em]">
            © 2026 Aura Culinary Group. All Rights Reserved.
          </p>
          <p className="flex items-center gap-2">
            Crafted with <Heart size={12} className="fill-[#bc6c25] text-[#bc6c25]" /> in Tbilisi
          </p>
        </div>
      </div>
    </footer>
  );
}
