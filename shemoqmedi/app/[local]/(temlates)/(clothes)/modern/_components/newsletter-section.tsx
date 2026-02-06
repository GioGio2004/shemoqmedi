"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Input } from "@/components/ui/input";
import { Send, Lock } from "lucide-react";
import { useState } from "react";

export function NewsletterSection() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useGSAP(() => {
    gsap.from(".reveal-newsletter", {
      y: 40,
      opacity: 0,
      duration: 1,
      scrollTrigger: {
        trigger: ".newsletter-container",
        start: "top 80%",
      }
    });
  });

  return (
    <section className="newsletter-container py-24 px-4 bg-gradient-to-b from-[#0a0a1a]/40 to-transparent border-y border-white/5">
      <div className="max-w-4xl mx-auto text-center reveal-newsletter">
        <h3 className="text-3xl md:text-5xl font-black uppercase italic mb-4 text-white">
          Join the <span className="text-[#00e5ff]">Movement</span>
        </h3>
        <p className="text-[#8888a0] mb-8 text-sm uppercase tracking-widest">
          Get exclusive drops, behind-the-scenes content, and 10% off your first order
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <Input
            type="email"
            placeholder="ENTER YOUR EMAIL"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="flex-1 bg-white/5 border-white/10 rounded-xl px-6 py-6 text-sm font-bold tracking-wider focus:border-[#00e5ff] transition-all text-white placeholder:text-zinc-600"
          />
          <button className="px-8 py-4 bg-[#00e5ff] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_40px_#00e5ff] transition-all flex items-center justify-center gap-2 whitespace-nowrap">
            <Send size={16} /> Subscribe
          </button>
        </div>
        <p className="text-[10px] text-[#5a5a70] mt-4 flex items-center justify-center gap-2">
          <Lock size={12} /> We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
