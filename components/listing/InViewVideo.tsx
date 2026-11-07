"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type InViewVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "muted" | "loop" | "preload" | "controls"
> & {
  /** Keep the video invisible until it is actually playing (the image under it shows meanwhile). */
  fadeIn?: boolean;
  /**
   * Show our own round play/pause button (bottom right) instead of the
   * browser's control bar. Needed wherever people may want to stop it, and
   * the only way to start it for prefers-reduced-motion viewers.
   */
  toggle?: boolean;
  /** What the button controls, for its label: "Pause walkthrough". */
  toggleLabel?: string;
};

/**
 * Muted, looping video that plays as soon as any part of it is on screen and
 * pauses when it leaves, so only what people can see costs bandwidth and CPU.
 * Nothing loads until it first scrolls into view. If someone pauses it with
 * the toggle, it stays paused until they press play again. Respects
 * prefers-reduced-motion (no autoplay; the toggle or poster still work).
 * Never shows the browser's own controls, picture-in-picture or cast button.
 */
export function InViewVideo({
  className,
  fadeIn = false,
  toggle = false,
  toggleLabel = "video",
  ...props
}: InViewVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(true);

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

  const video = (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      onPlaying={() => setPlaying(true)}
      onPlay={() => setPaused(false)}
      onPause={() => setPaused(true)}
      className={cn(fadeIn && "transition-opacity duration-500", fadeIn && !playing && "opacity-0", className)}
      {...props}
    />
  );
  if (!toggle) return video;

  return (
    <div className="relative">
      {video}
      <button
        type="button"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          // A viewer's pause sticks (InViewVideo's observer will not restart it).
          if (el.paused) void el.play().catch(() => {});
          else el.pause();
        }}
        aria-label={`${paused ? "Play" : "Pause"} ${toggleLabel}`}
        className="absolute right-3 bottom-3 grid size-11 place-items-center rounded-full border border-white/25 bg-black text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white md:right-4 md:bottom-4"
      >
        {paused ? (
          <svg aria-hidden="true" viewBox="0 0 16 16" className="ml-0.5 size-4" fill="currentColor">
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor">
            <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" />
          </svg>
        )}
      </button>
    </div>
  );
}
