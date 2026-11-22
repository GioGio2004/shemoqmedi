"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** localStorage key; THEME_SCRIPT (app/layout.tsx) reads it before first paint. */
export const THEME_KEY = "theme";
const THEME_COLORS = { light: "#ffffff", orange: "#0a0a0a" } as const;
type Theme = keyof typeof THEME_COLORS;

/**
 * Runs in <head> before the page paints, so a returning visitor never sees
 * the wrong theme flash. Kept tiny and dependency-free.
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="orange"){document.documentElement.dataset.theme="orange";var m=document.querySelector('meta[name="theme-color"]');if(m)m.content="${THEME_COLORS.orange}"}}catch(e){}`;

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "orange") root.dataset.theme = "orange";
  else delete root.dataset.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // private mode: the switch still works for this visit
  }
}

const OPTIONS: { value: Theme; label: string; swatch: [string, string] }[] = [
  { value: "light", label: "White", swatch: ["#ffffff", "#000000"] },
  { value: "orange", label: "Black + orange", swatch: ["#0a0a0a", "#ff4d00"] },
];

/**
 * The theme switch in the mega menu: white + black (default) or black +
 * orange, as a two-option segmented control with a swatch for each.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs with the theme THEME_SCRIPT already applied
    setTheme(document.documentElement.dataset.theme === "orange" ? "orange" : "light");
  }, []);

  return (
    <div role="group" aria-label="Theme" className={cn("inline-flex rounded-full border border-black/12 p-1", className)}>
      {OPTIONS.map((o) => {
        const on = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => {
              apply(o.value);
              setTheme(o.value);
            }}
            className={cn(
              "inline-flex min-h-[38px] items-center gap-2.5 rounded-full px-4 text-[11px] font-semibold tracking-[0.05em] uppercase transition-colors",
              on ? "bg-black text-white" : "text-black/60 hover:text-black",
            )}
          >
            <span
              aria-hidden="true"
              className="size-3.5 rounded-full ring-1 ring-black/20"
              style={{ background: `linear-gradient(135deg, ${o.swatch[0]} 50%, ${o.swatch[1]} 50%)` }}
            />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
