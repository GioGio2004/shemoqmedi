"use client";

// ruled-menu/RmTunnel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// THE CORRIDOR — an infinite one-point-perspective tunnel (units.gr homage)
// built from the venue's own photography, RULED hairlines and the accent.
//
// Geometry: each segment is a slice of a rectangular tube — four real CSS 3D
// planes. Every wall is rotated so its FRONT face points into the tube
// (right/top get the opposite sign of left/bottom). backface-visibility:
// hidden on .rm-tun-wall is the guard that makes a wrong-sign wall DISAPPEAR
// loudly instead of silently rendering a mirrored photo.
//
// Scale: the tube measures its container (ResizeObserver) and derives
// s (half-width), d (segment depth) and the perspective from it, so the same
// component works full-bleed or embedded in a section panel. All chrome uses
// contextual --v-c-* tokens: inside a [data-theme="bone"] section the tunnel
// renders cream with ink hairlines — the video's exact palette.
//
// Motion: one rAF advances a progress scalar; segment z wraps modulo the tube
// length. Segments fade out just before the camera plane and fade in at the
// far end, so recycling is invisible. Scroll velocity boosts the glide;
// cursor gives a ±1.4° camera sway (subtle — the vanishing point barely
// moves, like the reference). Paused off-screen; reduced-motion renders a
// static corridor.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { imgSrcSet } from "./types";

const SEGMENTS = 9;
const BASE_SPEED_RATIO = 0.5; // mean half-extents per second at rest (~2s per ring)
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

type Panel =
  | { kind: "img"; src: string; srcSet?: string }
  | { kind: "fill"; tone: "accent" | "flip" | "raise" | "base" };

const WALLS = ["top", "right", "bottom", "left"] as const;

export default function RmTunnel({
  images,
  label,
  heading,
  ctaLabel,
  onCta,
  embedded = false,
}: {
  images: string[];
  label: string;
  /** Optional big display line at the core — omit in embedded panels. */
  heading?: string;
  ctaLabel: string;
  onCta: () => void;
  /** Fill the parent element instead of claiming the full viewport. */
  embedded?: boolean;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const camRef = useRef<HTMLDivElement | null>(null);
  const segRefs = useRef<HTMLDivElement[]>([]);
  // Geometry derived from the measured container — read by the rAF loop.
  // sx/sy: half-extents (rectangular tube matches the window's aspect);
  // d: segment depth; m: mean extent, the scale for speed/fade distances.
  const geo = useRef({ sx: 620, sy: 620, d: 700, m: 620 });

  // Deterministic panel mix: photos dominate, fills punctuate, accent is rare.
  const segments = useMemo(() => {
    const pool = images.filter(Boolean);
    let cursor = 0;
    return Array.from({ length: SEGMENTS }, (_, si) =>
      WALLS.map((_, wi) => {
        const slot = si * 4 + wi;
        if (pool.length > 0 && slot % 3 !== 2) {
          const src = pool[cursor % pool.length];
          cursor += 1;
          const { src: url, srcSet } = imgSrcSet(src);
          return { kind: "img", src: url, srcSet } as Panel;
        }
        const tone =
          slot % 9 === 2 ? "accent" : slot % 9 === 5 ? "flip" : slot % 2 ? "raise" : "base";
        return { kind: "fill", tone } as Panel;
      }),
    );
  }, [images]);

  useEffect(() => {
    const root = rootRef.current;
    const segs = segRefs.current.filter(Boolean);
    if (!root || !segs.length) return;

    gsap.registerPlugin(ScrollTrigger);

    // ── Measure → geometry vars ──────────────────────────────────────────────
    const measure = () => {
      const r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const sx = Math.max(160, r.width * 0.46);
      const sy = Math.max(110, r.height * 0.46);
      const d = (sx + sy) * 0.55;
      const m = (sx + sy) / 2;
      geo.current = { sx, sy, d, m };
      root.style.setProperty("--tun-sx", `${sx.toFixed(1)}px`);
      root.style.setProperty("--tun-sy", `${sy.toFixed(1)}px`);
      root.style.setProperty("--tun-d", `${d.toFixed(1)}px`);
      root.style.setProperty("--tun-p", `${(m * 1.61).toFixed(1)}px`);
    };
    measure();
    const ro = new ResizeObserver(() => {
      measure();
      placeRef.current?.(lastProgress.current);
    });
    ro.observe(root);

    // Walls cached per segment: fades are applied to WALLS, never the segment
    // — opacity on the segment is a grouping property that flattens
    // preserve-3d and projects every 90°-rotated wall edge-on (invisible).
    const wallEls = segs.map((s) => Array.from(s.children) as HTMLElement[]);

    // ── Placement (also the static reduced-motion state) ─────────────────────
    const lastProgress = { current: 0 };
    const place = (progress: number) => {
      const { d, m } = geo.current;
      const range = SEGMENTS * d;
      const near = m * 0.645;
      const fadeStart = m * 0.242;
      const fadeEnd = m * 0.613;
      const farFade = m * 1.94;
      for (let i = 0; i < segs.length; i++) {
        const raw = (i * d + progress) % range;
        const z = (raw < 0 ? raw + range : raw) - range + near;
        const nearA = clamp01((fadeEnd - z) / (fadeEnd - fadeStart));
        const farA = clamp01((z - (near - range)) / farFade);
        segs[i].style.transform = `translate(-50%, -50%) translateZ(${z.toFixed(1)}px)`;
        const a = Math.min(nearA, farA).toFixed(3);
        const walls = wallEls[i];
        for (let w = 0; w < walls.length; w++) walls[w].style.opacity = a;
      }
      lastProgress.current = progress;
    };
    const placeRef = { current: place };
    place(0);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let progress = 0;
      let speedMul = 1;
      let visible = true;
      let last = performance.now();
      let raf = 0;

      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        // dt clamp 0.033 keeps the worst-case per-frame step inside the wrap
        // invisibility buffer (near − fadeEnd) so a rim ring never pops.
        const dt = Math.min((now - last) / 1000, 0.033);
        last = now;
        // Decay runs even while hidden — otherwise the scroll boost ratchets
        // off-screen and the corridor lurches on viewport entry.
        speedMul += (1 - speedMul) * Math.min(dt * 3, 1);
        if (!visible) return;
        progress += geo.current.m * BASE_SPEED_RATIO * speedMul * dt;
        place(progress);
      };
      raf = requestAnimationFrame(tick);

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity());
          speedMul = Math.max(speedMul, gsap.utils.clamp(1, 3, 1 + v / 380));
        },
      });

      const io = new IntersectionObserver(
        (entries) => {
          // Coalesced entries arrive oldest-first — only the last is current.
          const entry = entries[entries.length - 1];
          const wasVisible = visible;
          visible = entry.isIntersecting;
          // will-change layers live only while the corridor is on screen.
          root.classList.toggle("is-live", visible);
          if (visible && !wasVisible) speedMul = 1;
          last = performance.now();
        },
        { rootMargin: "120px" },
      );
      io.observe(root);

      // Camera sway — barely-there, the vanishing point stays anchored.
      const cam = camRef.current;
      let xTo: ((v: number) => void) | null = null;
      let yTo: ((v: number) => void) | null = null;
      if (cam) {
        xTo = gsap.quickTo(cam, "rotationY", { duration: 1.1, ease: "power3.out" });
        yTo = gsap.quickTo(cam, "rotationX", { duration: 1.1, ease: "power3.out" });
      }
      const onMove = (e: MouseEvent) => {
        if (!xTo || !yTo) return;
        const r = root.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        xTo(nx * 1.4);
        yTo(-ny * 1.1);
      };
      const onLeave = () => {
        xTo?.(0);
        yTo?.(0);
      };
      root.addEventListener("mousemove", onMove);
      root.addEventListener("mouseleave", onLeave);

      return () => {
        cancelAnimationFrame(raf);
        st.kill();
        io.disconnect();
        root.removeEventListener("mousemove", onMove);
        root.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => {
      ro.disconnect();
      mm.revert();
    };
  }, [segments.length]);

  const Tag = embedded ? "div" : "section";

  return (
    <Tag
      className={cn("rm-tunnel", embedded && "is-embedded")}
      ref={rootRef as never}
      id={embedded ? undefined : "tunnel"}
      aria-label={label}
    >
      <div className="rm-tun-stage" aria-hidden="true">
        <div className="rm-tun-cam" ref={camRef}>
          {segments.map((walls, si) => (
            <div
              key={si}
              className="rm-tun-seg"
              ref={(el) => {
                if (el) segRefs.current[si] = el;
              }}
            >
              {walls.map((panel, wi) => (
                <div key={wi} className="rm-tun-wall" data-wall={WALLS[wi]}>
                  <div
                    className="rm-tun-face"
                    data-tone={panel.kind === "fill" ? panel.tone : undefined}
                  >
                    {panel.kind === "img" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={panel.src}
                        {...(panel.srcSet ? { srcSet: panel.srcSet, sizes: "50vw" } : {})}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>

      {/* Fog overlay — MUST stay a sibling of the stage, never inside it:
          inside the preserve-3d context it sits in the z=0 plane and forces
          per-frame BSP plane-splitting against the ring that straddles z=0
          (hairline seams / WebKit flicker). As a sibling it's a plain 2D
          overlay with identical output. */}
      <span className="rm-tun-vignette" aria-hidden="true" />

      <div className="rm-tun-core">
        <p className="v-t-mono rm-tun-kicker">{label}</p>
        {heading && <h2 className="rm-tun-heading">{heading}</h2>}
        <button type="button" onClick={onCta} className="rm-tun-cta v-t-mono v-press">
          <span>{ctaLabel} ↓</span>
          <span aria-hidden>{ctaLabel} ↓</span>
        </button>
      </div>
    </Tag>
  );
}
