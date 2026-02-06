"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, MapPin, Clock, Send } from "lucide-react";

export function ContactSection() {
  
    useGSAP(() => {
        gsap.from(".reveal-contact", {
          y: 40,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: "#contact",
            start: "top 70%",
          }
        });
      });

  return (
    <section id="contact" className="py-32 px-8 bg-[#0a0a1a]/30 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="reveal-contact">
          <Badge className="mb-6 bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20 uppercase tracking-wider text-[9px]">
            Contact Us
          </Badge>
          <h2 className="text-4xl font-black uppercase italic mb-8 text-white">
            Get in <span className="text-[#00e5ff]">Touch</span>
          </h2>
          <div className="space-y-8">
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="p-4 bg-white/5 rounded-xl group-hover:bg-[#00e5ff] transition-all">
                <Mail className="group-hover:text-black transition-colors text-white" size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a5a70] mb-1">Email</p>
                <p className="text-sm font-bold text-white">hello@voloostore.ge</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="p-4 bg-white/5 rounded-xl group-hover:bg-[#00e5ff] transition-all">
                <MapPin className="group-hover:text-black transition-colors text-white" size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a5a70] mb-1">Location</p>
                <p className="text-sm font-bold text-white">Tbilisi, Georgia // HQ</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group cursor-pointer">
              <div className="p-4 bg-white/5 rounded-xl group-hover:bg-[#00e5ff] transition-all">
                <Clock className="group-hover:text-black transition-colors text-white" size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#5a5a70] mb-1">Hours</p>
                <p className="text-sm font-bold text-white">Mon-Fri: 9AM - 6PM GMT+4</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="reveal-contact bg-gradient-to-br from-white/[0.03] to-transparent p-10 rounded-[40px] border border-white/5 space-y-6">
          <Input 
            type="text" 
            placeholder="NAME" 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-[#00e5ff] outline-none transition-all text-white placeholder:text-zinc-600" 
          />
          <Input 
            type="email" 
            placeholder="EMAIL" 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-[#00e5ff] outline-none transition-all text-white placeholder:text-zinc-600" 
          />
          <textarea 
            placeholder="MESSAGE" 
            rows={5} 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold focus:border-[#00e5ff] outline-none transition-all resize-none text-white placeholder:text-zinc-600 bg-transparent" 
          />
          <button className="w-full py-4 bg-[#00e5ff] text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:shadow-[0_0_30px_#00e5ff] transition-all flex items-center justify-center gap-2">
            <Send size={16} /> Send Message
          </button>
        </div>
      </div>
    </section>
  );
}
