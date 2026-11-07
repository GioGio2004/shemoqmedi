"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type InViewVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "muted" | "loop" | "preload"
> & {
  /** Keep the video invisible until it is actually playing (the image under it shows meanwhile). */
  fadeIn?: boolean;
};

/**
 * Muted, looping video that plays as soon as any part of it is on screen and
 * pauses when it leaves, so only what people can see costs bandwidth and CPU.
 * Nothing loads until it first scrolls into view. If someone pauses it with
 * the controls, it stays paused until they press play again. Respects
 * prefers-reduced-motion (no autoplay; the controls or poster still work).
 */
export function InViewVideo({ className, fadeIn = false, ...props }: InViewVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let selfPause = false; // the pause came from us (scrolled away), not the viewer
    let userPaused = false;

    const onPause = () => {
      if (!selfPause) userPaused = true;
      selfPause = false;
    };
    const onPlay = () => {
      userPaused = false;
    };
    el.addEventListener("pause", onPause);
    el.addEventListener("play", onPlay);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!userPaused && el.paused) void el.play().catch(() => {});
      } else if (!el.paused) {
        selfPause = true;
        el.pause();
      }
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      el.removeEventListener("pause", onPause);
      el.removeEventListener("play", onPlay);
    };
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      onPlaying={() => setPlaying(true)}
      className={cn(fadeIn && "transition-opacity duration-500", fadeIn && !playing && "opacity-0", className)}
      {...props}
    />
  );
}
