"use client";

import { useRef } from "react";
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
  const desktopNavRef = useRef<HTMLElement>(null);
  const showAnim = useRef<gsap.core.Tween | null>(null);

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

      {/* ── Mobile: always-visible bottom bar ────────────────────────── */}
      {/* Fixed to the bottom so it's always within thumb reach on phones.
          pb-safe-area-inset ensures it clears the PWA home indicator. */}
      <nav
        id="mobile-navbar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50
                   flex items-center justify-between px-5
                   backdrop-blur-xl bg-black/70 border-t border-white/[0.08]"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 0.875rem)",
          paddingTop: "0.875rem",
        }}
      >
        {/* Logo */}
        <a
          href="#"
          className="text-white font-light text-base tracking-[0.15em] uppercase"
        >
          Voloo
        </a>

        {/* Quick links — icon-sized tap targets */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center
                         text-white/50 text-xs font-light tracking-wide
                         hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#contact"
          className="px-4 py-2.5 text-xs font-light min-h-[44px] flex items-center
                     bg-white/10 border border-white/15 rounded-full
                     text-white/80 transition-all duration-300
                     hover:bg-white/20 hover:text-white"
        >
          Get Started
        </a>
      </nav>
    </>
  );
}
