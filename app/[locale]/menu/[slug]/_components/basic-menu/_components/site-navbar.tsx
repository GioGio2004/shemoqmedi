/**
 * SiteNavbar — RULED scroll-aware navigation
 * ─────────────────────────────────────────────────────────────────────────────
 *  - Transparent at top; once scrolled: near-opaque theme background + a
 *    single 1px bottom hairline. No blur, no shadow — hairlines do the
 *    separation (RULED design language).
 *  - Center: mono micro breadcrumb `VOLOO — {VENUE}` (desktop only).
 *  - Logo accent character uses `--theme-accent` so every cafe's brand color
 *    shows in the nav automatically.
 *  - All color values resolve to CSS custom properties injected by
 *    VenueClientView (`--theme-*` + contextual `--v-c-*` frame tokens),
 *    so changing the DB theme instantly updates the navbar too.
 */

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Globe, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function SiteNavbar({
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
      className="fixed top-0 w-full z-50 transition-colors duration-500"
      style={
        scrolled
          ? {
              /* Near-opaque theme background — hairline does the separation */
              background:
                "color-mix(in srgb, var(--theme-bg, var(--background)) 88%, transparent)",
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
      <div className="relative max-w-7xl mx-auto px-6 pt-4 pb-4 flex justify-between items-center">
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          aria-label={`${organizationName} home`}
        >
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

        {/* ── Mono micro breadcrumb — centered, desktop only (RULED §5.4) ── */}
        <span
          aria-hidden="true"
          className="v-t-micro hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none select-none whitespace-nowrap"
          style={{ color: "var(--v-c-faint)" }}
        >
          VOLOO — {organizationName}
        </span>

        {/* ── Cart & Navigation ───── */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-voloo-basket"))
            }
            className="relative p-2 rounded-full transition-colors"
            style={{ border: "1px solid var(--v-c-line)" }}
            aria-label="Open Cart"
          >
            <ShoppingBag
              className="w-5 h-5"
              style={{ color: "var(--theme-text, var(--foreground))" }}
            />
            <CartBadge />
          </button>
        </div>
      </div>

      {/* ── 1px bottom hairline — appears once scrolled ─────────────────── */}
      <span
        aria-hidden="true"
        className="v-line-x absolute bottom-0 left-0 transition-opacity duration-500"
        style={{ opacity: scrolled ? 1 : 0 }}
      />
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
      const basketKey = keys.find((k) => k.startsWith("voloo_order_basket_"));
      if (basketKey) {
        const stored = JSON.parse(sessionStorage.getItem(basketKey) || "[]");
        const initialCount = stored.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
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

function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    setIsOpen(false);
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    // Full reload ensures all contexts, Convex subscriptions, and next-intl fully refresh
    window.location.href = newPath;
  };

  const getLabel = (l: string) => (l === "ka" ? "GE" : l.toUpperCase());

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] transition-colors duration-300"
        style={{
          border: "1px solid var(--v-c-line)",
          color: "var(--theme-text, var(--foreground))",
        }}
      >
        <Globe className="w-3.5 h-3.5" style={{ color: "var(--v-c-mut)" }} />
        <span className="v-t-mono">{getLabel(locale)}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
          style={{ color: "var(--v-c-faint)" }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-28 rounded-[2px] overflow-hidden z-50 flex flex-col"
              style={{
                background: "var(--v-c-bg)",
                border: "1px solid var(--v-c-line)",
              }}
            >
              {["en", "ru", "ka"].map((l, i) => (
                <button
                  key={l}
                  onClick={() => handleLocaleChange(l)}
                  className="v-t-mono flex items-center justify-between w-full px-3 py-2.5 transition-colors"
                  style={{
                    color:
                      locale === l
                        ? "var(--theme-accent, var(--primary))"
                        : "var(--v-c-mut)",
                    borderTop: i > 0 ? "1px solid var(--v-c-line)" : "none",
                  }}
                >
                  {getLabel(l)}
                  {locale === l && (
                    <span
                      className="w-1 h-1 rounded-full ml-2"
                      style={{ background: "var(--theme-accent, var(--primary))" }}
                    />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
