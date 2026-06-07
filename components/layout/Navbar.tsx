"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Hardware", href: "#hardware" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const showAnim = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    if (!navRef.current) return;

    // Initial entrance animation
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
    );

    // Build the show/hide tween (paused)
    showAnim.current = gsap
      .from(navRef.current, {
        yPercent: -150,
        paused: true,
        duration: 0.3,
        ease: "power2.out",
      })
      .progress(1);

    // ScrollTrigger watches scroll direction
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          // Scrolling UP → show
          showAnim.current?.play();
        } else {
          // Scrolling DOWN → hide
          showAnim.current?.reverse();
        }
      },
    });
  });

  return (
    <nav
      ref={navRef}
      id="main-navbar"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-4 md:gap-8 px-5 md:px-8 py-2 md:py-3
                 backdrop-blur-md bg-black/40 border border-white/10
                 rounded-full shadow-2xl shadow-black/30
                 opacity-0"
    >
      {/* Logo */}
      <a
        href="#"
        className="text-white font-light text-base md:text-lg tracking-[0.1em] md:tracking-[0.15em] uppercase
                   transition-opacity duration-300 hover:opacity-70"
      >
        Voloo
      </a>

      {/* Divider */}
      <div className="w-px h-5 bg-white/15 hidden md:block" />

      {/* Links */}
      <ul className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-white/60 text-sm font-light tracking-wide
                         transition-all duration-300 hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#contact"
        className="md:ml-2 px-4 md:px-5 py-1.5 text-xs md:text-sm font-light
                   bg-white/10 border border-white/15 rounded-full
                   text-white/80 transition-all duration-300
                   hover:bg-white/20 hover:text-white hover:border-white/25"
      >
        Get Started
      </a>
    </nav>
  );
}
