"use client";

import { useEffect, useRef } from "react";

// The welcome screen: once per browser session, on the first page opened, the
// wordmark rises in while the crow flies across the screen, then the screen
// lifts away (about 2 s; a tap, a key or scrolling skips it).
//
// INTRO_SCRIPT (in <head>) decides before first paint, so the page never
// flashes underneath: it sets html[data-intro="on"], which shows the overlay
// (globals.css). Skipped for reduced motion, crawlers and speed tests, and on
// task pages (submit, sign-in, account, claim) where it would only get in the way.
// If this component never runs, CSS lifts the overlay by itself after 3.5 s.

export const INTRO_SCRIPT = `try{var d=document.documentElement;if(!/^[/](submit|sign-in|sign-up|sso-callback|session-tasks|claim|account|vote|jury[/]profile)([/]|$)/.test(location.pathname)&&!sessionStorage.getItem("intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!/bot|crawl|spider|slurp|lighthouse|headless|pagespeed/i.test(navigator.userAgent)){d.dataset.intro="on";sessionStorage.setItem("intro","1")}}catch(e){}`;

/** The flapping part of the takeoff sheet (public/crow/nav/takeoff.json): frames 35–68. */
const SHEET = { src: "/crow/nav/takeoff.webp", columns: 18, fw: 198, fh: 200, ratio: 2, fps: 24, from: 35, to: 68 };
const FLIGHT_MS = 1700;
const START_MS = 250;
const EXIT_AT_MS = 2150;
const EXIT_MS = 650;

export function WelcomeIntro() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "on") return;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    let raf = 0;
    let done = false;
    const timers: number[] = [];

    const finish = () => {
      if (done) return;
      done = true;
      root.dataset.intro = "out";
      timers.push(window.setTimeout(() => (root.dataset.intro = "done"), EXIT_MS));
    };
    const skip = () => finish();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    timers.push(window.setTimeout(finish, EXIT_AT_MS));

    if (c && ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = () => {
        c.width = window.innerWidth * dpr;
        c.height = window.innerHeight * dpr;
      };
      resize();
      const img = new Image();
      img.src = SHEET.src;
      const t0 = performance.now();
      const frames = SHEET.to - SHEET.from + 1;
      const draw = (now: number) => {
        const t = now - t0 - START_MS;
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, c.width, c.height);
        if (t >= 0 && img.complete && img.naturalWidth) {
          const p = Math.min(t / FLIGHT_MS, 1);
          // Size: about a fifth of the shorter side, between 110 and 230 px.
          const size = Math.max(110, Math.min(230, Math.min(w, h) * 0.22));
          const scale = size / (SHEET.fh / SHEET.ratio);
          const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const x = -size + ease * (w + size * 2);
          // A gentle rising arc, low left to high right.
          const y = h * (0.7 - 0.38 * ease) - Math.sin(p * Math.PI) * h * 0.08;
          const k = SHEET.from + (Math.floor((t / 1000) * SHEET.fps) % frames);
          const sx = (k % SHEET.columns) * SHEET.fw;
          const sy = Math.floor(k / SHEET.columns) * SHEET.fh;
          ctx.setTransform(dpr * scale, 0, 0, dpr * scale, x * dpr, y * dpr);
          ctx.drawImage(img, sx, sy, SHEET.fw, SHEET.fh, -SHEET.fw / SHEET.ratio / 2, -SHEET.fh / SHEET.ratio / 2, SHEET.fw / SHEET.ratio, SHEET.fh / SHEET.ratio);
        }
        if (t < FLIGHT_MS + 200 && !done) raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      window.addEventListener("resize", resize);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("wheel", skip);
        timers.forEach(clearTimeout);
      };
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="welcome-intro" aria-hidden="true">
      <div className="welcome-intro-type">
        <p className="welcome-intro-eyebrow">Website awards</p>
        <p className="welcome-intro-word">
          {"SHEMOQMEDI".split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${120 + i * 45}ms` }}>
              {ch}
            </span>
          ))}
        </p>
        <p className="welcome-intro-space">Space</p>
        <p className="welcome-intro-line">The web&apos;s finest websites, scored by a jury.</p>
      </div>
      <canvas ref={canvas} className="welcome-intro-crow" />
    </div>
  );
}
