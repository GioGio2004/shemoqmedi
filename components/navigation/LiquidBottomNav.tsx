"use client";

// components/navigation/LiquidBottomNav.tsx
// Floating bottom nav (mobile only) with an animated framer-motion layoutId
// pill behind the active item. RULED restyle (spec §5.3): dark-glass pill
// (rgba(17,17,16,.88) + backdrop-blur-md — the one permitted blur, kept for
// legibility over light imagery), 1px hairline border, mono micro labels,
// accent-border active pill + 4px accent dot, press feedback, safe-area
// bottom offset.

import { motion, useReducedMotion } from "framer-motion";
import { Home, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";

export type LandingPanel = "home" | "menus" | "offers";

const ICONS: Record<LandingPanel, ComponentType<{ className?: string }>> = {
  home: Home,
  menus: UtensilsCrossed,
  offers: ShoppingBag,
};

const PANEL_ORDER: LandingPanel[] = ["home", "menus", "offers"];

export default function LiquidBottomNav({
  active,
  onChange,
  labels,
}: {
  active: LandingPanel;
  onChange: (panel: LandingPanel) => void;
  labels: Record<LandingPanel, string>;
}) {
  const panels = PANEL_ORDER;
  const reduceMotion = useReducedMotion();

  // Portal to <body>: the landing shell is a transformed (framer-motion)
  // ancestor, which would hijack position:fixed and pin the bar to the
  // content instead of the viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const pillSpring = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 400, damping: 30 } as const);

  return createPortal(
    <nav
      className="fixed left-1/2 z-[80] -translate-x-1/2 md:hidden"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Landing panels"
    >
      <div className="relative flex items-center gap-1 rounded-full border border-v-line bg-[rgba(17,17,16,0.88)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {panels.map((panel) => {
          const Icon = ICONS[panel];
          const isActive = active === panel;
          return (
            <motion.button
              key={panel}
              type="button"
              onClick={() => onChange(panel)}
              aria-pressed={isActive}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-2.5"
            >
              {isActive && (
                <>
                  {/* Active pill: 1px accent border, transparent fill */}
                  <motion.span
                    layoutId="liquid-nav-pill"
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-v-accent"
                    transition={pillSpring}
                  />
                  {/* 4px accent dot above the active label */}
                  <motion.span
                    layoutId="liquid-nav-dot"
                    aria-hidden
                    className="absolute top-[3px] h-1 w-1 rounded-full bg-v-accent"
                    style={{ left: "50%", marginLeft: -2 }}
                    transition={pillSpring}
                  />
                </>
              )}
              <Icon
                className={`relative z-10 h-4 w-4 transition-colors duration-200 ${
                  isActive ? "text-v-ink" : "text-v-mut"
                }`}
              />
              <span
                className={`v-t-micro relative z-10 transition-colors duration-200 ${
                  isActive ? "text-v-ink" : "text-v-mut"
                }`}
              >
                {labels[panel]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}
