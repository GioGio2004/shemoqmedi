"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  
  useGSAP(() => {
    gsap.from(".contact-card", {
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });

  return (
    <section id="contact" className="contact-section py-32 bg-[#2a1d15] relative text-[#d4c5b5]">
        {/* Map Background */}
        <div className="absolute inset-0 opacity-10 grayscale pointer-events-none mix-blend-overlay" 
             style={{ backgroundImage: `url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074")`, backgroundSize: 'cover' }} 
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12">
                
                {/* Info Card */}
                <div className="contact-card bg-[#3d2b1f]/90 backdrop-blur-xl p-10 md:p-14 rounded-[3rem] border border-[#5e4332] shadow-2xl">
                    <span className="text-[#e6b800] font-bold tracking-[0.2em] uppercase text-sm mb-6 block">Visit Our Showroom</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                        Let's Talk Tone.
                    </h2>
                    
                    <div className="space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/10 text-[#e6b800]">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-1">Nashville HQ</h4>
                                <p className="leading-relaxed opacity-80">123 Harmony Lane, Music Row<br/>Nashville, TN 37203</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/10 text-[#e6b800]">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-1">Opening Hours</h4>
                                <p className="leading-relaxed opacity-80">Mon - Fri: 10:00 AM - 7:00 PM<br/>Saturday: 11:00 AM - 5:00 PM</p>
                            </div>
                        </div>

                         <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-white/10 text-[#e6b800]">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg mb-1">Get in Touch</h4>
                                <p className="leading-relaxed opacity-80">(555) 123 - 4567<br/>hello@melodywoods.com</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="flex flex-col justify-center">
                    <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl text-[#3d2b1f]">
                        <h3 className="text-3xl font-serif font-bold mb-6">Send us a Message</h3>
                        <p className="text-[#8c7462] mb-8">Looking for a specific vintage model or need repair advice? Fill out the form below.</p>
                        
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="First Name" className="w-full bg-[#f4f1ee] border border-[#d6cec5] rounded-xl px-5 py-3 focus:outline-none focus:border-[#e6b800] transition-colors" />
                                <input type="text" placeholder="Last Name" className="w-full bg-[#f4f1ee] border border-[#d6cec5] rounded-xl px-5 py-3 focus:outline-none focus:border-[#e6b800] transition-colors" />
                            </div>
                            <input type="email" placeholder="Email Address" className="w-full bg-[#f4f1ee] border border-[#d6cec5] rounded-xl px-5 py-3 focus:outline-none focus:border-[#e6b800] transition-colors" />
                            <select className="w-full bg-[#f4f1ee] border border-[#d6cec5] rounded-xl px-5 py-3 focus:outline-none focus:border-[#e6b800] transition-colors text-[#8c7462]">
                                <option>General Inquiry</option>
                                <option>Repair Request</option>
                                <option>Custom Order</option>
                            </select>
                            <textarea rows={4} placeholder="How can we help?" className="w-full bg-[#f4f1ee] border border-[#d6cec5] rounded-xl px-5 py-3 focus:outline-none focus:border-[#e6b800] transition-colors resize-none"></textarea>
                            
                            <button type="button" className="w-full bg-[#3d2b1f] text-white font-bold py-4 rounded-xl hover:bg-[#e6b800] hover:text-[#3d2b1f] transition-all flex items-center justify-center gap-2 group">
                                Send Message <Send size={18} className="group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
