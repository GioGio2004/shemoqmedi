"use client";

import { useEffect, useRef } from "react";
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

const LETTERS = "SHEMOQMEDI".split("");

export default function InkLanding() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<InkBlob[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastMouse = useRef<{ x: number; y: number; t: number } | null>(null);

  // ── GSAP reveal sequence ───────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      gsap.set(lettersRef.current, { y: 140, opacity: 0 });

      tl.to(curtainRef.current, {
        y: "-100%",
        duration: 1.3,
        ease: "power4.inOut",
      });

      tl.to(
        lettersRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.045,
          ease: "power4.out",
        },
        "-=0.8",
      );
    });

    return () => ctx.revert();
  }, []);

  // ── Viscous ink simulation ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (min: number, max: number) =>
      min + Math.random() * (max - min);

    const spawn = (x: number, y: number, speed: number) => {
      // Faster mouse = bigger, wilder ink deposits
      const energy = Math.min(speed, 60) / 60;

      const blob: InkBlob = {
        x,
        y,
        // Ink shoots off with its own momentum — you can't control it
        vx: rand(-1, 1) * (0.3 + energy * 1.4),
        vy: rand(-1, 1) * (0.3 + energy * 1.4),
        baseR: rand(14, 26) + energy * rand(16, 36),
        life: 0,
        maxLife: 150, // ~2.5s at 60fps — consistent dissolve speed
        seed: Math.random() * Math.PI * 2,
        wobble: rand(0.18, 0.42),
        freq1: Math.floor(rand(2, 4)),
        freq2: Math.floor(rand(4, 7)),
        spin: rand(-0.02, 0.02),
      };
      blobsRef.current.push(blob);

      // Occasionally fling satellite droplets away from the cursor
      if (Math.random() < 0.35 + energy * 0.4) {
        const count = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = rand(18, 60) * (0.5 + energy);
          blobsRef.current.push({
            x: x + Math.cos(angle) * 6,
            y: y + Math.sin(angle) * 6,
            vx: Math.cos(angle) * (dist / 55),
            vy: Math.sin(angle) * (dist / 55),
            baseR: rand(4, 10),
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

      // Keep the simulation bounded
      if (blobsRef.current.length > 420) {
        blobsRef.current.splice(0, blobsRef.current.length - 420);
      }
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const point = "touches" in e ? e.touches[0] : e;
      const now = performance.now();
      const prev = lastMouse.current;

      let speed = 8;
      if (prev) {
        const dt = Math.max(now - prev.t, 1);
        const dx = point.clientX - prev.x;
        const dy = point.clientY - prev.y;
        speed = (Math.sqrt(dx * dx + dy * dy) / dt) * 16;

        // Interpolate along fast strokes so the trail is continuous
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.min(Math.floor(dist / 24), 4);
        for (let i = 1; i <= steps; i++) {
          spawn(
            prev.x + (dx * i) / (steps + 1),
            prev.y + (dy * i) / (steps + 1),
            speed,
          );
        }
      }

      spawn(point.clientX, point.clientY, speed);
      lastMouse.current = { x: point.clientX, y: point.clientY, t: now };
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });

    let time = 0;
    const SEGMENTS = 14;

    const drawBlob = (b: InkBlob, t: number) => {
      const progress = b.life / b.maxLife;

      // Fast swell, long viscous shrink
      let envelope: number;
      if (progress < 0.12) {
        envelope = progress / 0.12;
      } else {
        const p = (progress - 0.12) / 0.88;
        envelope = 1 - p * p; // eases into the dissolve
      }

      const r = b.baseR * envelope;
      if (r < 1.2) return;

      ctx.beginPath();
      for (let i = 0; i <= SEGMENTS; i++) {
        const angle = (i / SEGMENTS) * Math.PI * 2 + b.seed + t * b.spin * 60;
        // Two layered sine waves = organic, asymmetric ink edge
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

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "#FFFFFF";

      const blobs = blobsRef.current;
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];

        // Viscous drift — momentum decays but never fully dies
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.965;
        b.vy *= 0.965;
        // Tiny meander so pooled ink keeps creeping
        b.vx += Math.sin(time * 1.7 + b.seed * 3) * 0.008;
        b.vy += Math.cos(time * 1.3 + b.seed * 5) * 0.008;

        b.life++;
        drawBlob(b, time);
      }

      blobsRef.current = blobs.filter((b) => b.life < b.maxLife);
      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative h-svh w-full overflow-hidden bg-background text-foreground">
      {/* SVG goo/threshold filter — melts blobs into one fluid ink mass */}
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id="ink-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
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
          className="m-0 select-none whitespace-nowrap font-black uppercase leading-none tracking-tighter"
          style={{ fontSize: "12.5vw", letterSpacing: "-0.055em" }}
        >
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              ref={(el) => {
                lettersRef.current[i] = el;
              }}
              className="inline-block origin-bottom"
              style={{ willChange: "transform, opacity" }}
            >
              {letter}
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
