"use client";

import { useEffect, useRef, useState } from "react";
import { STATS, TRUST_BADGES } from "./data";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const targetNum = parseFloat(target);
          const duration = 2000;
          const steps = 60;
          const increment = targetNum / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= targetNum) {
              setCount(targetNum);
              clearInterval(timer);
            } else {
              setCount(current);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toFixed(target.includes('.') ? 1 : 0)}{suffix}
    </span>
  );
}

export function StatsSection() {
    
  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>(".reveal-stat").forEach((elem) => {
        gsap.from(elem, {
          y: 30,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: elem,
            start: "top 90%",
          }
        });
      });
  });

  return (
    <>
      {/* ─── TRUST BADGES ─── */}
      <section className="py-16 px-4 border-y border-white/5 bg-[#0a0a1a]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {TRUST_BADGES.map((badge, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
              <badge.icon className="text-[#00e5ff] flex-shrink-0" size={32} />
              <div>
                <p className="font-bold text-sm text-white">{badge.title}</p>
                <p className="text-xs text-[#5a5a70]">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS COUNTER ─── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-[#0a0a1a]/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center reveal-stat">
              <p className="text-5xl md:text-6xl font-black text-[#00e5ff] mb-2">
                <AnimatedCounter 
                  target={stat.value.replace('+', '').replace('%', '')} 
                  suffix={stat.value.includes('+') ? '+' : stat.value.includes('%') ? '%' : ''} 
                />
              </p>
              <p className="text-xs uppercase tracking-widest text-[#8888a0] font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
