/**
 * SiteNavbar — Glassmorphic, Scroll-Aware Navigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Upgrade notes vs. the original:
 *  - On scroll: applies `backdrop-blur-xl` + `bg-theme-bg/70` + fine white
 *    border — a premium frosted-glass sticky header effect.
 *  - Logo accent character uses `--theme-accent` so every cafe's brand color
 *    shows in the nav automatically.
 *  - Accepts `logoUrl` (optional) so an image logo can be shown instead of
 *    text when the org has one.
 *  - All color values resolve to CSS custom properties injected by page.tsx,
 *    so changing the DB theme instantly updates the navbar too.
 */

"use client";

import { useState, useEffect } from "react";
import { MegaMenu } from "./mega-menu";

export function SiteNavbar({
  onCategorySelect,
  organizationName,
  logoUrl,
}: {
  onCategorySelect?: (category: string) => void;
  organizationName: string;
  /** Optional image logo URL from storefrontConfig / org.logoUrl */
  logoUrl?: string | null;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={
        scrolled
          ? {
              /* Glassmorphism: semi-transparent theme background + blur */
              background:
                "color-mix(in oklch, var(--theme-bg, var(--background)), transparent 30%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
              /* Push content below Dynamic Island / notch */
              paddingTop: "max(env(safe-area-inset-top), 0px)",
            }
          : {
              background: "transparent",
              /* Same clearance in transparent state */
              paddingTop: "max(env(safe-area-inset-top), 0px)",
            }
      }
    >
      {/* py-4 split: top padding is handled by safe-area on the <nav> */}
      <div className="max-w-7xl mx-auto px-6 pt-4 pb-4 flex justify-between items-center">

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <a href="#" className="flex items-center gap-2 group" aria-label={`${organizationName} home`}>
          {logoUrl ? (
            /* Image logo when the org has uploaded one */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={organizationName}
              className="h-8 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
            />
          ) : (
            /* Text logo — first char accented with --theme-accent */
            <span
              className="text-xl font-serif tracking-wide font-bold transition-opacity duration-300 group-hover:opacity-80"
              style={{ color: "var(--theme-text, var(--foreground))" }}
            >
              {/* Accent the first character of the org name */}
              <span style={{ color: "var(--theme-accent, var(--primary))" }}>
                {organizationName.charAt(0)}
              </span>
              {organizationName.slice(1)}
            </span>
          )}
        </a>

        {/* ── Cart & Navigation ───── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-voloo-basket"))}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5 h-5" style={{ color: "var(--theme-text, var(--foreground))" }} />
            <CartBadge />
          </button>
          
          {/* Navigation (MegaMenu — handles desktop + mobile drawer) */}
          <MegaMenu onCategorySelect={onCategorySelect} />
        </div>
      </div>
    </nav>
  );
}

import { ShoppingBag } from "lucide-react";

// A small component to handle cart badge reactivity via custom event
function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Check initial count from sessionStorage if available
    try {
      const keys = Object.keys(sessionStorage);
      const basketKey = keys.find(k => k.startsWith("voloo_order_basket_"));
      if (basketKey) {
        const stored = JSON.parse(sessionStorage.getItem(basketKey) || "[]");
        const initialCount = stored.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCount(initialCount);
      }
    } catch (e) {
      // Ignore
    }

    const handleUpdate = (e: any) => setCount(e.detail.count);
    window.addEventListener("basket-updated", handleUpdate);
    return () => window.removeEventListener("basket-updated", handleUpdate);
  }, []);

  if (count === 0) return null;

  return (
    <span
      className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm"
      style={{ backgroundColor: "var(--theme-accent, var(--primary))" }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
