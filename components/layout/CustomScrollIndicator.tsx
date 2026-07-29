"use client";

import { useEffect, useState } from "react";

/**
 * CustomScrollIndicator — Client Component
 *
 * Replaces the default browser scrollbar with a custom, ultra-premium
 * vertical track pinned to the right side of the viewport.
 *
 * Performance:
 * Uses a passive event listener and requestAnimationFrame to ensure
 * scroll tracking remains lightning fast and doesn't interfere with
 * GSAP ScrollTriggers.
 */
export default function CustomScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll =
            document.documentElement.scrollTop || document.body.scrollTop;
          const windowHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;

          if (windowHeight > 0) {
            setScrollProgress(
              Math.max(0, Math.min(1, totalScroll / windowHeight)),
            );
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initial calculation
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-2 md:gap-3">
      {/* Typography: Clean, vertical typography on the left of the track.
          white/45 ≈ 4.8:1 on the #0a0a0a body — the WCAG AA floor. */}
      <span
        className="text-[8px] md:text-[10px] font-light tracking-[0.4em] uppercase text-white/45 select-none"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        SHEMOQMEDI
      </span>

      {/* The Track Container */}
      <div className="relative h-[40vh] md:h-[50vh] w-0.5 md:w-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        {/* The Indicator Pill — moved with translateY (compositable) rather
            than `top`, which can't be GPU-accelerated and forces layout. The
            pill is 15% tall, so sweeping 0→85% of the track equals 0→566.67%
            of its own height. */}
        <div
          className="absolute left-0 top-0 w-full bg-white/80 rounded-full transition-transform duration-75 ease-out"
          style={{
            height: "15%",
            transform: `translateY(${((scrollProgress * 85) / 15) * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
