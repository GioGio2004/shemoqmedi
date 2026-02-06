"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Phone, MapPin, ArrowRight, Mail } from "lucide-react";
import { OPENING_HOURS, SPECIAL_MENUS } from "./constants";

export function BookingSection() {
  return (
    <section id="booking" className="py-32 md:py-40 px-6 bg-gradient-to-br from-[#fffcf5] to-[#f4f1ea]">
      <div className="max-w-7xl mx-auto">
        
        {/* Opening Hours */}
        <div className="mb-24 reveal">
          <div className="text-center mb-16">
            <Badge className="bg-[#bc6c25]/10 text-[#bc6c25] hover:bg-[#bc6c25]/20 mb-6 px-6 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em]">
              Visit Us
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-display mb-6">
              Opening <span className="italic text-[#bc6c25]">Hours</span>
            </h2>
            <p className="text-lg text-[#5a5a70] max-w-2xl mx-auto leading-relaxed">
              We welcome guests throughout the week for an unforgettable dining experience.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-xl border border-black/5 overflow-hidden">
            {OPENING_HOURS.map((schedule, i) => (
              <div 
                key={i} 
                className={`group flex items-center justify-between px-8 md:px-12 py-6 md:py-7 border-b border-black/5 last:border-b-0 transition-all duration-300 ${
                  schedule.special 
                    ? 'bg-gradient-to-r from-[#f4f1ea] to-white hover:from-[#f4f1ea] hover:to-[#f4f1ea]' 
                    : 'hover:bg-[#fffcf5]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    schedule.special 
                      ? 'bg-[#5a5a70]/30' 
                      : 'bg-[#bc6c25] group-hover:scale-125'
                  }`} />
                  <span className={`font-bold text-lg md:text-xl font-display ${
                    schedule.special ? 'text-[#5a5a70]/60' : 'text-[#2d2a26]'
                  }`}>
                    {schedule.day}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className={`${
                    schedule.special ? 'text-[#5a5a70]/40' : 'text-[#bc6c25]'
                  }`} strokeWidth={2} />
                  <span className={`text-base md:text-lg ${
                    schedule.special 
                      ? 'text-[#5a5a70]/60 italic' 
                      : 'text-[#2d2a26] font-medium'
                  }`}>
                    {schedule.hours}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-8 py-4 bg-white/60 backdrop-blur-sm rounded-full border border-black/5">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#bc6c25]" strokeWidth={2} />
                <span className="text-sm font-medium">+995 555 123 456</span>
              </div>
              <div className="w-[1px] h-6 bg-black/10 hidden sm:block" />
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#bc6c25]" strokeWidth={2} />
                <span className="text-sm font-medium">12 Rustaveli Ave, Tbilisi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Menus */}
        <div className="reveal">
          <div className="text-center mb-16">
            <Badge className="bg-[#bc6c25] text-white hover:bg-[#dda15e] mb-6 px-6 py-1.5 text-[9px] font-bold uppercase tracking-[0.3em]">
              Exclusive Experiences
            </Badge>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-display mb-6">
              Special <span className="italic text-[#bc6c25]">Menus</span>
            </h2>
            <p className="text-lg text-[#5a5a70] max-w-2xl mx-auto leading-relaxed">
              Curated dining experiences that showcase the best of AURA's culinary artistry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {SPECIAL_MENUS.map((menu, i) => (
              <div 
                key={i} 
                className="group bg-white rounded-[40px] overflow-hidden shadow-xl border border-black/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={menu.image}
                    alt={menu.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <Badge className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-black hover:bg-white font-bold text-[9px] uppercase tracking-[0.2em] px-4 py-1.5 shadow-md">
                    {menu.badge}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 space-y-6">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold font-display mb-2 group-hover:text-[#bc6c25] transition-colors">
                      {menu.title}
                    </h3>
                    <p className="text-[#bc6c25] font-semibold text-sm uppercase tracking-[0.15em] mb-1">
                      {menu.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-[#5a5a70]">
                      <Clock size={16} strokeWidth={2} />
                      <span className="text-sm">{menu.time}</span>
                    </div>
                  </div>

                  <Separator className="bg-black/5" />

                  <p className="text-[#5a5a70] leading-relaxed text-base">
                    {menu.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3">
                    {menu.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#bc6c25]" />
                        <span className="text-sm text-[#5a5a70]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-black/5" />

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-[#5a5a70] mb-1">Starting at</p>
                      <p className="text-2xl md:text-3xl font-bold text-[#bc6c25] font-display">
                        {menu.price}
                      </p>
                    </div>
                    <button className="px-8 py-3.5 bg-[#bc6c25] text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#dda15e] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2">
                      Reserve Now
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 p-8 md:p-10 bg-gradient-to-br from-[#2d2a26] to-[#3d3a36] text-white rounded-[40px] border border-black/10 shadow-xl">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold font-display">
                Private Events & Group Bookings
              </h3>
              <p className="text-white/70 leading-relaxed">
                Host your special celebration at AURA. Our private dining room accommodates up to 20 guests 
                and can be customized with bespoke menus tailored to your preferences.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button className="px-10 py-4 bg-white text-[#2d2a26] rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#bc6c25] hover:text-white transition-all shadow-lg hover:scale-105 active:scale-95">
                  Inquire About Events
                </button>
                <a 
                  href="mailto:events@aura-bistro.ge" 
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                >
                  <Mail size={16} strokeWidth={2} />
                  events@aura-bistro.ge
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
