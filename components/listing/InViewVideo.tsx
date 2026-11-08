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
  /** With `toggle`: a fullscreen button next to play/pause (double-click works too). */
  fullscreen?: boolean;
  /** What the buttons control, for their labels: "Pause walkthrough". */
  toggleLabel?: string;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => void;
};
type FullscreenBox = HTMLDivElement & { webkitRequestFullscreen?: () => void };
type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
type LockableOrientation = ScreenOrientation & { lock?: (o: "landscape") => Promise<void>; unlock?: () => void };

function fullscreenElement() {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * Muted, looping video that plays as soon as any part of it is on screen and
 * pauses when it leaves, so only what people can see costs bandwidth and CPU.
 * Nothing loads until it first scrolls into view. If someone pauses it with
 * the toggle, it stays paused until they press play again. Respects
 * prefers-reduced-motion (no autoplay; the toggle or poster still work).
 * Never shows the browser's own controls, picture-in-picture or cast button.
 *
 * Fullscreen: the whole box (video + our buttons) on a black background,
 * video letterboxed (globals.css, .video-box:fullscreen). iPhone Safari
 * cannot make an element fullscreen, so there it opens the system player.
 * On phones a landscape video also asks the screen to turn landscape.
 */
export function InViewVideo({
  className,
  fadeIn = false,
  toggle = false,
  fullscreen = false,
  toggleLabel = "video",
  ...props
}: InViewVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const box = useRef<FullscreenBox>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(true);
  const [isFull, setIsFull] = useState(false);

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
      } else if (!el.paused && !fullscreenElement()) {
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

  useEffect(() => {
    if (!fullscreen) return;
    const onChange = () => {
      const full = fullscreenElement() === box.current;
      setIsFull(full);
      if (!full) (screen.orientation as LockableOrientation | undefined)?.unlock?.();
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [fullscreen]);

  function toggleFullscreen() {
    const el = ref.current as IosVideo | null;
    const target = box.current;
    if (!el || !target) return;
    if (fullscreenElement()) {
      const doc = document as FullscreenDocument;
      if (document.exitFullscreen) void document.exitFullscreen().catch(() => {});
      else doc.webkitExitFullscreen?.();
      return;
    }
    const play = () => void el.play().catch(() => {});
    if (target.requestFullscreen || target.webkitRequestFullscreen) {
      const entered = target.requestFullscreen ? target.requestFullscreen() : target.webkitRequestFullscreen?.();
      void Promise.resolve(entered)
        .then(() => {
          play();
          // Phones: turn a landscape video sideways (Android Chrome; ignored elsewhere).
          if (el.videoWidth > el.videoHeight && window.matchMedia("(pointer: coarse)").matches) {
            void (screen.orientation as LockableOrientation | undefined)?.lock?.("landscape")?.catch(() => {});
          }
        })
        .catch(() => {});
    } else if (el.webkitEnterFullscreen) {
      el.webkitEnterFullscreen(); // iPhone: the system player
      play();
    }
  }

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
      onDoubleClick={fullscreen ? toggleFullscreen : undefined}
      className={cn(fadeIn && "transition-opacity duration-500", fadeIn && !playing && "opacity-0", className)}
      {...props}
    />
  );
  if (!toggle) return video;

  const button =
    "grid size-11 place-items-center rounded-full border border-white/25 bg-black text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white";

  return (
    <div ref={box} className="video-box relative">
      {video}
      <div className="absolute right-3 bottom-3 flex gap-2 md:right-4 md:bottom-4">
        {fullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={`${isFull ? "Exit full screen" : "Full screen"}: ${toggleLabel}`}
            className={button}
          >
            {isFull ? (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
              </svg>
            )}
          </button>
        )}
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
          className={button}
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
    </div>
  );
}
