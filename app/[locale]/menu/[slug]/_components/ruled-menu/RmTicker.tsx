"use client";

// ruled-menu/RmTicker.tsx
// The marquee strip between two hairlines. Content priority:
// active announcements → admin tickerText → venue-name fallback.
// velocity={false}: the landing owns the single velocity-reactive marquee.

import Marquee from "@/components/motion/Marquee";
import { Hairline } from "@/components/motion/DecorLines";

export default function RmTicker({ phrases }: { phrases: string[] }) {
  if (!phrases.length) return null;

  return (
    <div className="rm-ticker" aria-hidden="true">
      <Hairline plusMarks={false} />
      <Marquee velocity={false} duration={32} className="py-3">
        {phrases.map((p, i) => (
          <span key={`${p}-${i}`} className="rm-ticker-item">
            <span
              className="v-t-h3 font-v-display uppercase"
              style={{ color: "var(--v-ink)", whiteSpace: "nowrap" }}
            >
              {p}
            </span>
            <span style={{ color: "var(--v-accent)" }}>+</span>
          </span>
        ))}
      </Marquee>
      <Hairline plusMarks={false} />
    </div>
  );
}
