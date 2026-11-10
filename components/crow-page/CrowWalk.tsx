"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadAnimation, type Anim } from "@/components/site/crow/sprites";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { cn } from "@/lib/utils";
import { DEFAULT_HEIGHT, drawFrame, fitCanvas, frameAt, reducedMotion } from "./player";

export type WalkItem = { slug: string; title: string; coverUrl: string; award: string | null };

/** A card's width; the strip's gap is 1rem on phones, 1.5rem from md. */
const CARD = "clamp(200px, 24vw, 340px)";

/**
 * The collection, scrolled: real listings hang under a line and slide past
 * as you scroll, and the crow walks the line above them (the scroll moves the
 * ground, so its feet keep pace). Every site it walks over is looked at;
 * award winners are kept, the rest fade. A counter keeps the tally. Stop
 * scrolling and it stands and looks around; scroll back and it turns round.
 */
export function CrowWalk({ items }: { items: WalkItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // How many cards the crow has passed (its feet beyond their centre).
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    const sec = section.current;
    const strip = track.current;
    const cv = canvas.current;
    if (!sec || !strip || !cv) return;
    let walk: Anim | null = null;
    let idle: Anim | null = null;
    let raf = 0;
    let disposed = false;
    let offset = 0;
    let travel = 0;
    let facingLeft = false;
    let lastMove = -Infinity; // s
    let idleSince = 0;
    let lastPassed = -1;
    let visible = false;

    const crowHeight = () => (window.innerWidth < 768 ? 64 : 92);

    const measure = () => {
      const cards = strip.querySelectorAll<HTMLElement>("[data-card]");
      if (!cards.length) return { centres: [] as number[] };
      const first = cards[0];
      const last = cards[cards.length - 1];
      const centre = (el: HTMLElement) => el.offsetLeft + el.offsetWidth / 2;
      travel = centre(last) - centre(first);
      return { centres: [...cards].map((c) => centre(c) - centre(first)) };
    };
    let geo = measure();

    const progress = () => {
      const r = sec.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    };

    const render = (ms: number) => {
      raf = 0;
      if (disposed) return;
      const now = ms / 1000;
      // Ease the strip towards the scroll position: smooth on wheel steps.
      const target = progress() * travel;
      const before = offset;
      offset += (target - offset) * 0.18;
      if (Math.abs(target - offset) < 0.1) offset = target;
      const moved = offset - before;
      strip.style.transform = `translate3d(${-offset}px,0,0)`;

      const n = geo.centres.filter((c) => c <= offset + 2).length;
      if (n !== lastPassed) {
        lastPassed = n;
        setPassed(n);
      }

      const { ctx, width, height } = fitCanvas(cv);
      ctx.clearRect(0, 0, width, height);
      const h = crowHeight();
      const scale = h / DEFAULT_HEIGHT;
      const x = width / 2;
      const y = height;
      if (Math.abs(moved) > 0.05) {
        lastMove = now;
        facingLeft = moved < 0;
      }
      const still = reducedMotion();
      if (walk && !still && now - lastMove < 0.12) {
        // The ground moved `offset` px: the walk cycle advances to match.
        const stride = (walk.stride ?? 55) * scale;
        const k = (((Math.floor((offset / stride) * walk.frames) % walk.frames) + walk.frames) % walk.frames);
        drawFrame(ctx, walk, k, x, y, { scale, flip: facingLeft });
        idleSince = now;
      } else if (idle) {
        const k = still ? 0 : frameAt(idle, now - idleSince, { loop: true }).k;
        drawFrame(ctx, idle, k, x, y, { scale, flip: facingLeft });
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(render);
    };
    const kick = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        if (!walk) {
          void Promise.all([loadAnimation("walk"), loadAnimation("idle")]).then(([w, i]) => {
            walk = w;
            idle = i;
            kick();
          });
        }
        kick();
      }
    });
    io.observe(sec);
    const onResize = () => {
      geo = measure();
      kick();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", kick, { passive: true });
    document.addEventListener("visibilitychange", kick);
    return () => {
      disposed = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", kick);
      document.removeEventListener("visibilitychange", kick);
    };
  }, []);

  const looked = Math.min(passed, items.length);
  const kept = items.slice(0, looked).filter((i) => i.award).length;

  return (
    <section
      ref={section}
      aria-labelledby="walk-title"
      className="relative"
      // One screen, plus one card step per site: the ground moves as far as the page scrolls.
      style={{ height: `calc(100svh + ${items.length - 1} * (${CARD} + 1.5rem))` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container-site">
          <p className="eyebrow">The collection</p>
          <h2
            id="walk-title"
            className="mt-3 max-w-3xl text-[clamp(2rem,5vw,4.25rem)] leading-[0.98] font-semibold tracking-[-0.055em]"
          >
            It looks at everything. It keeps a few.
          </h2>
        </div>

        <div className="relative mt-24 md:mt-32">
          {/* The crow, centred over the line. */}
          <canvas
            ref={canvas}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[calc(100%-1px)] left-1/2 h-[120px] w-[220px] -translate-x-1/2 md:h-[170px] md:w-[300px]"
          />
          <div className="h-px w-full bg-black" />
          <div className="overflow-visible pt-4">
            <div
              ref={track}
              className="flex w-max gap-4 will-change-transform md:gap-6"
              // The first card starts centred under the crow.
              style={{ paddingLeft: "calc(50vw - var(--card) / 2)", paddingRight: "calc(50vw - var(--card) / 2)", ["--card" as string]: CARD }}
            >
              {items.map((item, i) => {
                const seen = i < looked;
                return (
                  <Link
                    key={item.slug}
                    href={`/sites/${item.slug}`}
                    data-card=""
                    className={cn(
                      "group relative block w-[var(--card)] shrink-0 transition-opacity duration-500",
                      seen && !item.award && "opacity-25",
                    )}
                  >
                    <span className="relative block aspect-[16/10] overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03]">
                      <Image
                        src={item.coverUrl}
                        alt={`${item.title} website screenshot`}
                        fill
                        sizes="340px"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="mt-3 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold tracking-[-0.02em]">{item.title}</span>
                      {item.award && (
                        <span
                          className={cn(
                            "shrink-0 rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold tracking-[0.06em] text-white uppercase transition-all duration-500",
                            seen ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                          )}
                        >
                          Kept · {item.award}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container-site mt-10 flex items-baseline gap-8 font-mono text-[11px] tracking-[0.06em] uppercase tabular-nums md:mt-14">
          <p>
            Looked at <span className="text-black">{String(looked).padStart(2, "0")}</span>
          </p>
          <p className="text-black/55">
            Kept <span className="text-black">{String(kept).padStart(2, "0")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
