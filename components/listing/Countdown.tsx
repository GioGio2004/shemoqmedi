"use client";

import { useEffect, useState } from "react";
import { countdownLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Live "ENDS IN 05D : 14H : 22M" badge. Renders nothing until mounted so the
 * static HTML never shows a stale time; then ticks every 30 seconds.
 */
export function Countdown({
  endsAt,
  className,
}: {
  endsAt: number;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now()); // eslint-disable-line react-hooks/set-state-in-effect -- first client tick
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // The vote's last day: the site's crow may come and peck at the clock.
  const closing = now !== null && endsAt - now > 0 && endsAt - now < 24 * 60 * 60 * 1000;

  return (
    <span
      data-crow-perch={closing ? "countdown" : undefined}
      className={cn(
        "inline-flex h-6 min-w-[11.5rem] items-center justify-center rounded-full border border-black/15 bg-white px-2.5 font-mono text-[10px] font-medium tracking-[0.08em] text-black uppercase tabular-nums",
        className,
      )}
      aria-live="off"
    >
      {now === null ? "Live voting" : countdownLabel(endsAt, now)}
    </span>
  );
}
