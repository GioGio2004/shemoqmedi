"use client";

// components/offers/OffersFeed.tsx
// Realtime surprise-bags feed (Panel B) — RULED editorial treatment elevated
// to an "ordered chaos" surface:
//   • OffersBackdrop — sticky-pinned atmosphere (glow blobs, drifting mono
//     glyphs, grain) behind everything (z-0 vs content z-10).
//   • Oversized display lockup (`04 — SURPRISE BAGS`) with a masked
//     line-rise entrance (Reveal type="lines") + the pulsing live-count dot.
//   • OffersTicker — thin looping deal strip between two hairlines.
//   • Scatter grid — every 5th card spans 2 cols on lg, sub-degree rest
//     rotations and ≤24px column offsets on md+ (flat on mobile / touch),
//     straightening on hover. Chaos in geometry, order in the hairline system.
// Convex data flow untouched: useQuery(api.surpriseBags.listActiveBags, {})
// keeps the quantityLeft badges live.

import type { CSSProperties } from "react";
import { useQuery } from "convex/react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api } from "@/convex-helpers-api";
import { cn } from "@/lib/utils";
import BagCard from "@/components/offers/BagCard";
import OffersBackdrop from "@/components/offers/OffersBackdrop";
import OffersTicker from "@/components/offers/OffersTicker";
import Reveal from "@/components/motion/Reveal";
import { SectionHead, Hairline } from "@/components/motion/DecorLines";

// Ordered-chaos scatter: geometry varies on a strict 5-step cycle — chaos in
// the pattern, order in its repetition. Y offsets stay ≤ the 24px grid gap so
// shifted cards never collide with the row below; rotations are sub-degree.
const SCATTER_Y = ["0px", "24px", "10px", "18px", "6px"];
const SCATTER_R = ["0.55deg", "-0.6deg", "0.4deg", "-0.45deg", "0.5deg"];

export default function OffersFeed() {
  const locale = useLocale();
  const t = useTranslations("Offers");
  const bags = useQuery(api.surpriseBags.listActiveBags, {});
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overscroll-y-contain">
      {/* Atmosphere layer — absolute + sticky, never fixed (transformed
          framer ancestors above us). Content stacks over it at z-10. */}
      <OffersBackdrop />

      <div
        className="relative z-10 mx-auto pt-28 pb-[calc(env(safe-area-inset-bottom)+8rem)] md:pt-24 md:pb-24"
        style={{ width: "min(100% - 2 * var(--v-pad), var(--v-container))" }}
      >
        {/* ── Section-index header: 04 — SURPRISE BAGS  ( N LIVE ● ) ────── */}
        <SectionHead
          index="04"
          label={t("sectionLabel")}
          meta={
            bags !== undefined ? (
              <span className="inline-flex items-baseline gap-2 whitespace-nowrap tabular-nums">
                <motion.span
                  aria-hidden
                  className="h-1.5 w-1.5 self-center rounded-full bg-v-accent"
                  animate={
                    reduceMotion
                      ? undefined
                      : { scale: [1, 1.4, 1], opacity: [1, 0.45, 1] }
                  }
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                ( {t("live", { count: bags.length })} )
              </span>
            ) : undefined
          }
          headingClassName=""
        >
          <Reveal as="h1" type="lines" className="v-offers-title">
            {t("title")}
          </Reveal>
        </SectionHead>
        <Reveal
          as="p"
          type="fade"
          delay={0.15}
          className="v-t-small mt-4 max-w-md text-v-mut"
        >
          {t("subtitle")}
        </Reveal>

        {bags === undefined ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-v-faint" />
          </div>
        ) : bags.length === 0 ? (
          /* ── Empty state: mono line between two hairlines ───────────── */
          <div className="mt-12 md:mt-16">
            <Hairline plusMarks />
            <p className="v-t-mono px-6 py-20 text-center text-v-mut">
              ( {t("empty")} )
            </p>
            <Hairline plusMarks />
          </div>
        ) : (
          <>
            {/* ── Ticker strip: RESCUE TONIGHT + N BAGS LIVE + … ────────── */}
            <OffersTicker
              rescueLabel={t("tickerRescue")}
              liveLabel={t("tickerLive", { count: bags.length })}
            />

            {/* ── Scatter grid: 1 / 2 ≥640 / 3 ≥1024; every 5th spans 2 on
                   lg; per-cell offsets + rest rotation via .v-scatter ───── */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
              {bags.map((bag, i) => (
                <div
                  key={bag._id}
                  className={cn("v-scatter", i % 5 === 0 && "lg:col-span-2")}
                  style={
                    {
                      "--sc-y": SCATTER_Y[i % SCATTER_Y.length],
                      "--sc-r": SCATTER_R[i % SCATTER_R.length],
                    } as CSSProperties
                  }
                >
                  <BagCard
                    bag={bag}
                    locale={locale}
                    index={String(i + 1).padStart(2, "0")}
                    order={i}
                    featured={i % 5 === 0}
                    leftLabel={t("left", { count: bag.quantityLeft })}
                    pickupLabel={t("pickup")}
                    reserveLabel={t("reserve")}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
