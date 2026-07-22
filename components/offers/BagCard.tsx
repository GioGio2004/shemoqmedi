"use client";

// components/offers/BagCard.tsx
// A single surprise-bag card in the Offers feed — RULED editorial treatment
// (spec §5.2): crosshair frame, mono index, hairline separators, tabular
// price typography, accent urgency chip. Data contract untouched: tetri
// prices, epoch-ms pickup window, per-locale title record, quantityLeft.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { XFrame } from "@/components/motion/DecorLines";

export type SurpriseBag = {
  _id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  imageUrl?: string;
  originalValue: number; // tetri
  price: number; // tetri
  quantityLeft: number;
  pickupStart: number; // epoch ms
  pickupEnd: number; // epoch ms
  venue: {
    slug: string;
    name: string;
    category?: string;
    address?: string;
    lat?: number;
    lng?: number;
    coverImage?: string;
    googleRating?: number;
    googleReviewCount?: number;
  };
};

/** Tetri → "₾ 9.50" (always two decimals — tabular column alignment). */
function formatLari(tetri: number): string {
  return `₾ ${(tetri / 100).toFixed(2)}`;
}

/** Epoch-ms → locale-aware 24h time via Intl (spec §5.2). */
function formatTime(ms: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(ms));
  } catch {
    const d = new Date(ms);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }
}

const ROLL =
  "transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full";

export default function BagCard({
  bag,
  locale,
  leftLabel,
  index,
  order = 0,
  featured = false,
  pickupLabel,
  reserveLabel,
}: {
  bag: SurpriseBag;
  locale: string;
  leftLabel: string; // already-translated "N left"
  /** Two-digit card index within the feed, e.g. "01". */
  index: string;
  /** Zero-based position — drives the 0.06s grid entrance stagger. */
  order?: number;
  /**
   * Wide editorial variant: on lg the scatter grid gives this card a 2-col
   * span, so the image flattens to 21:9 (aspect varies, alignment doesn't).
   */
  featured?: boolean;
  pickupLabel: string; // already-translated "Pickup"
  reserveLabel: string; // already-translated "Reserve"
}) {
  const title =
    bag.title[locale] ?? bag.title.en ?? Object.values(bag.title)[0] ?? "";
  const image = bag.imageUrl ?? bag.venue.coverImage ?? null;
  const reduceMotion = useReducedMotion();
  const urgent = bag.quantityLeft === 1;
  const low = bag.quantityLeft <= 2; // subtle accent glow pulse threshold
  const entranceDelay = reduceMotion ? 0 : Math.min(order, 8) * 0.06;

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : {
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1], // expo.out
              delay: entranceDelay, // grid stagger (spec §3.2)
            }
      }
    >
      <XFrame>
        <Link
          href="#"
          className="group v-press v-img-hover block bg-v-bg-raise"
        >
          {/* ── Image 16:10 (21:9 wide when featured), grayscale-at-rest ── */}
          <div
            className={`relative w-full overflow-hidden ${
              featured ? "aspect-[16/10] lg:aspect-[21/9]" : "aspect-[16/10]"
            }`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={title}
                className="v-img v-kb h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-v-bg">
                <ShoppingBag className="h-8 w-8 text-v-faint" />
              </div>
            )}

            {/* Mono card index, top-left (spec §2.2) */}
            <span className="v-t-mono absolute left-3 top-3 z-10 text-v-ink [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
              {index}
            </span>

            {/* Live quantity chip, top-right — accent flip at 1 left.
                Keyed on quantityLeft: Convex realtime updates re-mount it
                with a 0.3s scale pop. */}
            <motion.span
              key={bag.quantityLeft}
              initial={reduceMotion ? false : { scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`v-t-micro absolute right-3 top-3 z-10 rounded-v border bg-black/45 px-2 py-1 tabular-nums ${
                urgent
                  ? "border-v-accent text-v-accent"
                  : "border-v-line text-v-ink"
              } ${low ? "v-chip-glow" : ""}`}
            >
              {leftLabel}
            </motion.span>
          </div>

          <div aria-hidden className="v-line-x" />

          {/* ── Venue · rating ─────────────────────────────────────────── */}
          <div className="flex items-baseline justify-between gap-3 px-4 pt-3">
            <span className="v-t-small min-w-0 truncate text-v-mut">
              {bag.venue.name}
            </span>
            {typeof bag.venue.googleRating === "number" && (
              <span className="v-t-mono shrink-0 tabular-nums text-v-ink">
                ★ {bag.venue.googleRating.toFixed(1)}
              </span>
            )}
          </div>

          {/* ── Title (per-locale record) ───────────────────────────────── */}
          <h3 className="v-t-h3 mt-1 px-4 text-v-ink [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
            {title}
          </h3>

          {/* ── Pickup window ──────────────────────────────────────────── */}
          <p className="v-t-mono mt-2 px-4 pb-3 tabular-nums text-v-mut">
            {pickupLabel} {formatTime(bag.pickupStart, locale)} —{" "}
            {formatTime(bag.pickupEnd, locale)}
          </p>

          <div aria-hidden className="v-line-x" />

          {/* ── Price row + RESERVE roll-hover CTA ─────────────────────── */}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-baseline gap-2.5">
              {/* Original value — strikethrough draws in after the card
                  entrance settles (scaleX 0→1, left origin). */}
              <span className="v-t-mono relative tabular-nums text-v-faint">
                {formatLari(bag.originalValue)}
                <motion.span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-px w-full bg-v-faint"
                  style={{ originX: 0 }}
                  initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    delay: entranceDelay + 0.5,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </span>
              <span className="font-v-display text-[1.1rem] font-medium tabular-nums tracking-tight text-v-accent">
                {formatLari(bag.price)}
              </span>
            </span>

            <span className="v-t-mono relative inline-flex shrink-0 overflow-hidden text-v-ink">
              <span className={`block ${ROLL}`}>{reserveLabel} →</span>
              <span
                aria-hidden
                className={`absolute inset-x-0 top-full block text-v-accent ${ROLL}`}
              >
                {reserveLabel} →
              </span>
            </span>
          </div>
        </Link>
      </XFrame>
    </motion.div>
  );
}
