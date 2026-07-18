"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: "Ecosystem", href: "#ecosystem" },
  { label: "Hardware", href: "#hardware" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const desktopNavRef = useRef<HTMLElement>(null);
  const showAnim = useRef<gsap.core.Tween | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useGSAP(() => {
    if (!desktopNavRef.current) return;

    // Initial entrance animation
    gsap.fromTo(
      desktopNavRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.5 }
    );

    // Build the show/hide tween (paused)
    showAnim.current = gsap
      .from(desktopNavRef.current, {
        yPercent: -150,
        paused: true,
        duration: 0.3,
        ease: "power2.out",
      })
      .progress(1);

    // ScrollTrigger watches scroll direction — desktop only
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.current?.play();
        } else {
          showAnim.current?.reverse();
        }
      },
    });
  });

  return (
    <>
      {/* ── Desktop: floating pill (hidden on mobile) ─────────────────── */}
      <nav
        ref={desktopNavRef}
        id="main-navbar"
        className="hidden md:flex fixed left-1/2 -translate-x-1/2 z-50
                   items-center gap-8 px-8 py-3
                   backdrop-blur-md bg-black/40 border border-white/10
                   rounded-full shadow-2xl shadow-black/30
                   opacity-0"
        style={{ top: "max(env(safe-area-inset-top), 1.5rem)" }}
      >
        {/* Logo */}
        <a
          href="#"
          className="text-white font-light text-lg tracking-[0.15em] uppercase
                     transition-opacity duration-300 hover:opacity-70"
        >
          Voloo
        </a>

        {/* Divider */}
        <div className="w-px h-5 bg-white/15" />

        {/* Links */}
        <ul className="flex items-center gap-6">
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
          className="ml-2 px-5 py-1.5 text-sm font-light
                     bg-white/10 border border-white/15 rounded-full
                     text-white/80 transition-all duration-300
                     hover:bg-white/20 hover:text-white hover:border-white/25"
        >
          Get Started
        </a>
      </nav>

      {/* ── Mobile: Top Navbar & Sidebar Menu ────────────────────────── */}
      <nav
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/60 border-b border-white/[0.05]"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
      >
        <a href="#" className="text-white font-light text-lg tracking-[0.15em] uppercase">
          Voloo
        </a>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white/80 hover:text-white p-2 -mr-2"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-64 h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col p-6 animate-in slide-in-from-right-full duration-300">
            <div className="flex items-center justify-between mb-12">
              <span className="text-white font-light text-lg tracking-[0.15em] uppercase">
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/80 hover:text-white p-2 -mr-2"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <ul className="flex flex-col gap-8 flex-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/70 text-xl font-light tracking-wide transition-colors hover:text-white block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-auto px-6 py-3 text-center text-sm font-light bg-white text-black rounded-full transition-transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </>
  );
}
