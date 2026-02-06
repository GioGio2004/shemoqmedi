"use client";

import { useState, useRef, useEffect } from "react";
// Assuming you have a config file, or just hardcode for demo
const SHOP_PHONE = "995555000000"; // Fake Georgian Number

interface BookingProps {
  serviceName: string;
  price: number;
  image: string;
  category: string;
  btnClass?: string;
}

export function BookingDropdown({
  serviceName,
  price,
  image,
  category,
  btnClass = "bg-blue-600 hover:bg-blue-500",
}: BookingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const message = `Gamarjoba! I want to book an appointment for: ${serviceName} (Category: ${category}). Is it available this week?`;
  const whatsappUrl = `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <div ref={dropdownRef} className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-5 py-2 rounded-sm text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${btnClass}`}
      >
        Book Slot
        <span className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-zinc-950 border border-zinc-800 p-1 shadow-2xl z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest p-2 border-b border-zinc-900 mb-1">
            Contact Workshop
          </div>
          
          <a
            href={whatsappUrl}
            target="_blank"
            className="flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors group border-l-2 border-transparent hover:border-green-500"
          >
            <div className="w-8 h-8 bg-green-900/20 text-green-500 flex items-center justify-center rounded-full group-hover:bg-green-500 group-hover:text-black transition-all">
               W
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-200">WhatsApp</div>
              <div className="text-[10px] text-zinc-500">Instant Response</div>
            </div>
          </a>

          <button className="w-full flex items-center gap-3 p-3 hover:bg-zinc-900 transition-colors group border-l-2 border-transparent hover:border-blue-500 text-left">
            <div className="w-8 h-8 bg-blue-900/20 text-blue-500 flex items-center justify-center rounded-full group-hover:bg-blue-500 group-hover:text-black transition-all">
               T
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-200">Call Shop</div>
              <div className="text-[10px] text-zinc-500">+995 32 2 00 00 00</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}