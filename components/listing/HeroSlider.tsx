"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicListing } from "@/convex-helpers-api";
import { cn } from "@/lib/utils";
import { ArrowIcon } from "@/components/site/ui";

const INTERVAL_MS = 6000;

/** See-through stroke around the card (and the controls) on the white page. No shadow. */
const frame =
  "border border-black/[0.07] bg-black/[0.035] backdrop-blur-xl [-webkit-backdrop-filter:blur(24px)]";

/** Frosted glass over the screenshot: translucent white, heavy blur. No shadow. */
const glass =
  "border border-white/60 bg-white/35 backdrop-blur-2xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(40px)_saturate(1.5)]";

/**
 * Home header: on the white page, each listing's 16:9 screenshot (1920×1080)
 * sits in a card with a see-through glass stroke. The whole card links to the
 * listing page. Speed: only slides already shown, plus the next one, are
 * mounted.
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
      className="relative flex w-full bg-white md:min-h-[620px] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-10 md:h-[100svh] md:px-6 md:pt-[104px]"
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
      {/* The card: glass stroke around a 16:9 screenshot; the whole card is the link. */}
      <Link
        href={`/sites/${current.slug}`}
        aria-label={`${current.title}, by ${current.creditName}. Open the listing`}
        className={cn(
          "group relative block w-[min(100%,1280px,calc((100svh-15rem)*16/9))] min-w-[min(100%,560px)] rounded-[28px] p-2 md:rounded-[36px] md:p-3",
          frame,
        )}
      >
        <div className="relative aspect-video overflow-hidden rounded-[20px] bg-white/40 md:rounded-[26px]">
          {slides.map((slide, i) =>
            mounted.has(i) ? (
              <Image
                key={slide.slug}
                src={slide.coverUrl!}
                alt={i === index ? `${slide.title} website screenshot` : ""}
                aria-hidden={i !== index}
                fill
                sizes="(min-width: 1360px) 1280px, 94vw"
                priority={i === 0}
                className={cn(
                  "object-cover object-top transition-[opacity,transform] duration-[900ms] ease-out group-hover:scale-[1.015]",
                  i === index ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null,
          )}

          {/* Name tag: glass pill, bottom left. */}
          <div
            className={cn(
              "absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-full py-1.5 pr-1.5 pl-4 md:bottom-5 md:left-5",
              glass,
            )}
            aria-live={paused ? "polite" : "off"}
          >
            <span className="min-w-0 truncate text-sm font-semibold tracking-[-0.02em] md:text-base">
              {current.title}
              <span className="hidden font-normal text-black/55 sm:inline"> · {current.creditName}</span>
            </span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:size-9">
              <ArrowIcon className="size-4" />
            </span>
          </div>
        </div>
      </Link>

      {count > 1 && (
        <div className={cn("mt-5 flex items-center gap-2 rounded-full p-1.5", frame)}>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous website"
            className="grid size-9 place-items-center rounded-full transition-colors hover:bg-black hover:text-white"
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
                  i === index ? "w-6 bg-black" : "w-1.5 bg-black/25 hover:bg-black/50",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next website"
            className="grid size-9 place-items-center rounded-full transition-colors hover:bg-black hover:text-white"
          >
            <ArrowIcon className="size-4 rotate-45" />
          </button>
        </div>
      )}
    </section>
  );
}
