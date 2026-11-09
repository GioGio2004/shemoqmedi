"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Plays a badge's entrance (app/globals.css ".badge-reveal") the first time
 * it scrolls into view: the seal stamps in, the crow lands on its perch, the
 * lettering rises. `delay` staggers badges in a row. Without JavaScript, or
 * with reduced motion, the badge is simply shown.
 */
export function BadgeReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no observer to wait for: just show it
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("badge-reveal", className)}
      data-in={seen ? "" : undefined}
      style={{ "--badge-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
