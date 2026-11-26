"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** localStorage key; THEME_SCRIPT (app/layout.tsx) reads it before first paint. */
export const THEME_KEY = "theme";
const THEME_COLORS = { light: "#ffffff", orange: "#0a0a0a" } as const;
/** "system" (default): follows the device's light/dark setting (dark = black + orange). */
type Choice = "system" | "light" | "orange";

/**
 * Runs in <head> before the page paints, so a returning visitor never sees
 * the wrong theme flash. No choice saved, or "system": the device decides,
 * and the page follows when the device switches. Kept tiny and dependency-free.
 */
export const THEME_SCRIPT = `try{var k="${THEME_KEY}",d=document.documentElement,q=matchMedia("(prefers-color-scheme: dark)"),s=function(){var t=localStorage.getItem(k);var o=t==="orange"||((!t||t==="system")&&q.matches);if(o)d.dataset.theme="orange";else delete d.dataset.theme;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=o?"${THEME_COLORS.orange}":"${THEME_COLORS.light}"};s();q.addEventListener("change",s);window.__applyTheme=s}catch(e){}`;

function apply(choice: Choice) {
  try {
    localStorage.setItem(THEME_KEY, choice);
  } catch {
    // private mode: applied below for this visit only
  }
  const run = (window as unknown as { __applyTheme?: () => void }).__applyTheme;
  if (run) return run();
  const dark = choice === "orange" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.dataset.theme = "orange";
  else delete document.documentElement.dataset.theme;
}

function stored(): Choice {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "orange" ? t : "system";
  } catch {
    return "system";
  }
}

const OPTIONS: { value: Choice; label: string; swatch: [string, string] }[] = [
  { value: "system", label: "System", swatch: ["#ffffff", "#0a0a0a"] },
  { value: "light", label: "White", swatch: ["#ffffff", "#000000"] },
  { value: "orange", label: "Black + orange", swatch: ["#0a0a0a", "#ff4d00"] },
];

/**
 * The theme switch in the mega menu: System (default, follows the device),
 * white + black, or black + orange, as a segmented control with swatches.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const [choice, setChoice] = useState<Choice>("system");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the saved choice once
    setChoice(stored());
  }, []);

  return (
    <div role="group" aria-label="Theme" className={cn("inline-flex flex-wrap rounded-full border border-black/12 p-1", className)}>
      {OPTIONS.map((o) => {
        const on = choice === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => {
              apply(o.value);
              setChoice(o.value);
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
