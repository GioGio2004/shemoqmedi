"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// ─── Fluid ink blob ──────────────────────────────────────────────────────────

interface InkBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseR: number;
  life: number;
  maxLife: number;
  seed: number;
  wobble: number;
  freq1: number;
  freq2: number;
  spin: number;
}

const DESKTOP_LINES = ["SHEMOQMEDI"];
const MOBILE_LINES = ["SHE", "MOQ", "ME", "DI"];

export default function InkLanding() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<InkBlob[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastMouse = useRef<{ x: number; y: number; t: number } | null>(null);
  const isMobileRef = useRef(false);

  // null until we know the viewport — the curtain hides everything meanwhile
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  // ── Detect breakpoint ──────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobile(mq.matches);
      isMobileRef.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ── GSAP reveal sequence ───────────────────────────────────────────────────
  useEffect(() => {
    if (isMobile === null) return;

    const letters = lettersRef.current.filter(Boolean);
    if (!letters.length) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      gsap.set(letters, {
        yPercent: 110,
        opacity: 0,
        force3D: true,
      });

      tl.to(curtainRef.current, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        force3D: true,
      });

      tl.to(
        letters,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.05,
          ease: "power4.out",
          force3D: true,
          clearProps: "willChange",
        },
        "-=0.75",
      );
    });

    return () => ctx.revert();
  }, [isMobile]);

  // ── Viscous ink simulation ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    // Mobile GPUs choke on high-DPI canvases + SVG filters — keep DPR at 1
    const dpr = isMobileRef.current
      ? 1
      : Math.min(window.devicePixelRatio || 1, 1.5);

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (min: number, max: number) =>
      min + Math.random() * (max - min);

    // Smaller budget + smaller blobs on mobile keeps 60fps
    const MAX_BLOBS = isMobileRef.current ? 130 : 420;
    const SCALE = isMobileRef.current ? 0.65 : 1;

    const spawn = (x: number, y: number, speed: number) => {
      const energy = Math.min(speed, 60) / 60;

      blobsRef.current.push({
        x,
        y,
        vx: rand(-1, 1) * (0.3 + energy * 1.4),
        vy: rand(-1, 1) * (0.3 + energy * 1.4),
        baseR: (rand(14, 26) + energy * rand(16, 36)) * SCALE,
        life: 0,
        maxLife: 150,
        seed: Math.random() * Math.PI * 2,
        wobble: rand(0.18, 0.42),
        freq1: Math.floor(rand(2, 4)),
        freq2: Math.floor(rand(4, 7)),
        spin: rand(-0.02, 0.02),
      });

      // Satellite droplets — fewer on mobile
      const satChance = isMobileRef.current ? 0.2 : 0.35 + energy * 0.4;
      if (Math.random() < satChance) {
        const count = isMobileRef.current
          ? 1
          : 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = rand(18, 60) * (0.5 + energy);
          blobsRef.current.push({
            x: x + Math.cos(angle) * 6,
            y: y + Math.sin(angle) * 6,
            vx: Math.cos(angle) * (dist / 55),
            vy: Math.sin(angle) * (dist / 55),
            baseR: rand(4, 10) * SCALE,
            life: 0,
            maxLife: 150,
            seed: Math.random() * Math.PI * 2,
            wobble: rand(0.25, 0.55),
            freq1: Math.floor(rand(2, 4)),
            freq2: Math.floor(rand(5, 8)),
            spin: rand(-0.04, 0.04),
          });
        }
      }

      if (blobsRef.current.length > MAX_BLOBS) {
        blobsRef.current.splice(0, blobsRef.current.length - MAX_BLOBS);
      }
    };

    // Pointer events cover mouse, touch, and pen in one listener
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const prev = lastMouse.current;
      const cx = e.clientX;
      const cy = e.clientY;

      let speed = 8;
      if (prev) {
        const dt = Math.max(now - prev.t, 1);
        const dx = cx - prev.x;
        const dy = cy - prev.y;
        speed = (Math.sqrt(dx * dx + dy * dy) / dt) * 16;

        // Interpolate along fast strokes so the trail is continuous
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxSteps = isMobileRef.current ? 2 : 4;
        const steps = Math.min(Math.floor(dist / 24), maxSteps);
        for (let i = 1; i <= steps; i++) {
          spawn(
            prev.x + (dx * i) / (steps + 1),
            prev.y + (dy * i) / (steps + 1),
            speed,
          );
        }
      }

      spawn(cx, cy, speed);
      lastMouse.current = { x: cx, y: cy, t: now };
    };

    const onPointerEnd = () => {
      lastMouse.current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onPointerEnd, { passive: true });
    window.addEventListener("pointercancel", onPointerEnd, { passive: true });

    let time = 0;
    const SEGMENTS = isMobileRef.current ? 10 : 14;

    const drawBlob = (b: InkBlob, t: number) => {
      const progress = b.life / b.maxLife;

      let envelope: number;
      if (progress < 0.12) {
        envelope = progress / 0.12;
      } else {
        const p = (progress - 0.12) / 0.88;
        envelope = 1 - p * p;
      }

      const r = b.baseR * envelope;
      if (r < 1.2) return;

      ctx.beginPath();
      for (let i = 0; i <= SEGMENTS; i++) {
        const angle = (i / SEGMENTS) * Math.PI * 2 + b.seed + t * b.spin * 60;
        const n =
          1 +
          b.wobble * Math.sin(angle * b.freq1 + b.seed + t * 1.4) +
          b.wobble * 0.55 * Math.sin(angle * b.freq2 - b.seed * 2 + t * 2.1);
        const px = b.x + Math.cos(angle) * r * n;
        const py = b.y + Math.sin(angle) * r * n;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };

    let lastFrame = performance.now();

    const render = (now: number) => {
      // Delta-time based stepping so speed is consistent across refresh rates
      const delta = Math.min((now - lastFrame) / 16.67, 3);
      lastFrame = now;
      time += 0.016 * delta;

      ctx.clearRect(0, 0, vw, vh);
      ctx.fillStyle = "#FFFFFF";

      const blobs = blobsRef.current;
      let writeIdx = 0;
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];

        b.x += b.vx * delta;
        b.y += b.vy * delta;
        b.vx *= Math.pow(0.965, delta);
        b.vy *= Math.pow(0.965, delta);
        b.vx += Math.sin(time * 1.7 + b.seed * 3) * 0.008 * delta;
        b.vy += Math.cos(time * 1.3 + b.seed * 5) * 0.008 * delta;

        b.life += delta;
        drawBlob(b, time);

        // In-place compaction — no per-frame array allocation
        if (b.life < b.maxLife) {
          blobs[writeIdx++] = b;
        }
      }
      blobs.length = writeIdx;

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      blobsRef.current = [];
    };
  }, [isMobile]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const lines = isMobile ? MOBILE_LINES : DESKTOP_LINES;
  let letterIndex = -1;

  return (
    <div className="relative h-svh w-full touch-none overflow-hidden bg-background text-foreground">
      {/* SVG goo/threshold filter — melts blobs into one fluid ink mass */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="ink-goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={isMobile ? 4 : 6}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Giant brand type ── */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <h1
          key={isMobile === null ? "loading" : isMobile ? "mobile" : "desktop"}
          className="m-0 flex select-none flex-col items-center font-black uppercase leading-[0.82] tracking-tighter"
          style={{ letterSpacing: "-0.055em" }}
        >
          <span className="sr-only">SHEMOQMEDI</span>
          {lines.map((line, lineIdx) => (
            <span
              key={lineIdx}
              aria-hidden="true"
              className="block overflow-hidden whitespace-nowrap text-[27vw] md:text-[12.5vw]"
            >
              {line.split("").map((letter) => {
                letterIndex++;
                const idx = letterIndex;
                return (
                  <span
                    key={idx}
                    ref={(el) => {
                      lettersRef.current[idx] = el;
                    }}
                    className="inline-block origin-bottom opacity-0"
                    style={{ willChange: "transform, opacity" }}
                  >
                    {letter}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>
      </div>

      {/* ── Fluid ink canvas (difference blend + goo threshold) ── */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        style={{
          mixBlendMode: "difference",
          filter: "url(#ink-goo)",
        }}
        aria-hidden="true"
      />

      {/* ── Loading curtain ── */}
      <div
        ref={curtainRef}
        className="pointer-events-none absolute inset-0 z-50 bg-foreground"
        style={{ willChange: "transform" }}
      />
    </div>
  );
}
