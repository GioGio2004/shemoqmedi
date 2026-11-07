"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicListing } from "@/convex-helpers-api";
import { categoryName } from "@/lib/collections";
import { withRefClient } from "@/lib/ref";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/site/ui";
import { AwardBadge, ScoreBadge } from "./Badges";
import { Countdown } from "./Countdown";

const INTERVAL_MS = 6000;

/**
 * Full-screen header slider: each listing's screenshot fills the viewport
 * under the header and crossfades to the next. A white caption card (black
 * text) names the site. Speed: only slides that have been shown, plus the
 * next one, are mounted, so the page loads one image up front.
 */
export function HeroSlider({ listings }: { listings: PublicListing[] }) {
  const slides = listings.filter((l) => l.coverUrl);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1]));
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const region = useRef<HTMLElement>(null);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      const i = (next + count) % count;
      setIndex(i);
      setMounted((prev) => {
        if (prev.has(i) && prev.has((i + 1) % count)) return prev;
        const out = new Set(prev);
        out.add(i);
        out.add((i + 1) % count);
        return out;
      });
    },
    [count],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") go(index + 1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, go, index, paused, reduced]);

  if (count === 0) return null;
  const current = slides[index];

  return (
    <section
      ref={region}
      aria-roledescription="carousel"
      aria-label="Featured websites"
      className="relative h-[100svh] min-h-[560px] w-full pt-20 md:pt-[88px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!region.current?.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="relative h-full w-full overflow-hidden border-y border-black/8 bg-white">
        {slides.map((slide, i) =>
          mounted.has(i) ? (
            <div
              key={slide.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${slide.title}`}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-[900ms] ease-out",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={slide.coverUrl!}
                alt={`${slide.title} website screenshot`}
                fill
                sizes="100vw"
                priority={i === 0}
                className={cn(
                  "object-cover object-top transition-transform ease-linear motion-reduce:transition-none",
                  i === index ? "scale-[1.04] duration-[7000ms]" : "scale-100 duration-0",
                )}
              />
            </div>
          ) : null,
        )}

        {/* Caption: white card, black text. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 pb-5 md:pb-8">
          <div className="container-site flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div
              className="pointer-events-auto w-full max-w-md rounded-3xl border border-black/10 bg-white p-5 md:p-6"
              aria-live={paused ? "polite" : "off"}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] tracking-[0.08em] text-black/55 uppercase tabular-nums">
                  {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </p>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {current.awards.map((a) => (
                    <AwardBadge key={a} award={a} />
                  ))}
                  {current.status === "in_voting" && <Countdown endsAt={current.votingEndsAt} />}
                </div>
              </div>
              <h2 className="mt-3 line-clamp-2 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
                <Link href={`/sites/${current.slug}`} className="hover:underline hover:underline-offset-4">
                  {current.title}
                </Link>
              </h2>
              <p className="mt-1.5 truncate text-sm text-black/55">
                by {current.creditName} · {categoryName(current.category)}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <ScoreBadge score={current.finalScore} outOf className="text-[11px]" />
                <div className="flex items-center gap-2">
                  <a
                    href={withRefClient(current.url)}
                    target="_blank"
                    rel="noopener"
                    className="text-xs font-medium underline underline-offset-4"
                  >
                    Live site ↗
                  </a>
                  <Link
                    href={`/sites/${current.slug}`}
                    className="inline-flex min-h-10 items-center gap-2.5 rounded-full bg-black py-1 pr-1 pl-4 text-[11px] font-semibold tracking-[0.05em] text-white uppercase"
                  >
                    View
                    <span className="grid size-8 place-items-center rounded-full bg-white text-black">
                      <ArrowIcon className="size-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {count > 1 && (
              <div className="pointer-events-auto flex items-center gap-2 self-start rounded-full border border-black/10 bg-white p-1.5 md:self-auto">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous website"
                  className="grid size-9 place-items-center rounded-full hover:bg-black hover:text-white"
                >
                  <ArrowIcon className="size-4 -rotate-[135deg]" />
                </button>
                <div className="flex items-center gap-1 px-1" role="tablist" aria-label="Choose a website">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.slug}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Show ${slide.title}`}
                      onClick={() => go(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === index ? "w-6 bg-black" : "w-1.5 bg-black/20 hover:bg-black/50",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next website"
                  className="grid size-9 place-items-center rounded-full hover:bg-black hover:text-white"
                >
                  <ArrowIcon className="size-4 rotate-45" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
