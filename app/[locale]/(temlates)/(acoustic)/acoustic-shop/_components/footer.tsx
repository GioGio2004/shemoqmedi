"use client";

import { Music, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2a1d15] text-[#d4c5b5] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 text-white font-serif mb-6">
                <div className="w-10 h-10 bg-[#e6b800] rounded-full flex items-center justify-center text-[#3d2b1f]">
                    <Music size={20} fill="currentColor" />
                </div>
                <span className="text-2xl font-bold tracking-tight">Melody<span className="text-[#e6b800]">Woods</span></span>
            </div>
            <p className="max-w-sm text-[#8c7462] leading-relaxed mb-8">
                Serving the music community since 1985. We believe in the power of acoustic instruments to heal, inspire, and connect. Every instrument is inspected by our master luthiers.
            </p>
        </div>

        <div>
            <h4 className="text-white font-serif font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
                <li><a href="#" className="hover:text-[#e6b800] transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-[#e6b800] transition-colors">Financing</a></li>
                <li><a href="#" className="hover:text-[#e6b800] transition-colors">Music School</a></li>
                <li><a href="#" className="hover:text-[#e6b800] transition-colors">Instrument Rentals</a></li>
            </ul>
        </div>

        <div>
            <h4 className="text-white font-serif font-bold text-lg mb-6">Visit Us</h4>
            <ul className="space-y-4">
                <li className="flex items-start gap-3">
                    <MapPin className="mt-1 text-[#e6b800]" size={18} />
                    <span>123 Harmony Lane<br />Nashville, TN 37203</span>
                </li>
                <li className="flex items-center gap-3">
                    <Phone className="text-[#e6b800]" size={18} />
                    <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center gap-3">
                    <Mail className="text-[#e6b800]" size={18} />
                    <span>hello@melodywoods.com</span>
                </li>
            </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[#3d2b1f] text-center text-[#5e4332] text-sm">
        © 2026 MelodyWoods Acoustic Shop. All rights reserved. Play with heart.
      </div>
    </footer>
  );
}
