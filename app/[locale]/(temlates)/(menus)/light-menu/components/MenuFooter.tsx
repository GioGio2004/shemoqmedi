"use client";

import { motion } from 'framer-motion';

export function MenuFooter() {
  return (
    <footer className="bg-[#FCFCFC] border-t border-[#111111]/10 pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 text-center md:text-left mb-32">
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-2xl font-serif text-[#111111] mb-6">Location</h3>
          <p className="text-xs text-[#555555] uppercase tracking-[0.2em] mb-3">
            Karabak Restaurant
          </p>
          <p className="text-xs text-[#555555] uppercase tracking-[0.2em]">
            Tbilisi, Georgia
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-serif text-[#111111] mb-10">Follow Along</h3>
          <a href="https://www.instagram.com/karabakrestaurantbilisi/" className="bg-[#111111] text-[#FCFCFC] px-12 py-5 text-xs uppercase tracking-[0.2em] hover:bg-transparent hover:text-[#111111] hover:shadow-[inset_0_0_0_1px_#111111] transition-all duration-700 ease-[0.76,0,0.24,1]">
            Instagram
          </a>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <h3 className="text-2xl font-serif text-[#111111] mb-6">Contact</h3>
          <p className="text-xs text-[#555555] uppercase tracking-[0.2em] mb-3">
            +995 000 000 000
          </p>
          <a href="mailto:hello@karabak.ge" className="text-xs text-[#555555] uppercase tracking-[0.2em] hover:text-[#111111] transition-colors duration-500">
            hello@karabak.ge
          </a>
        </div>
      </div>
      
      <div className="text-center text-[10px] text-[#555555] uppercase tracking-[0.3em] font-light">
        © {new Date().getFullYear()} Karabak Restaurant
      </div>
    </footer>
  );
}
