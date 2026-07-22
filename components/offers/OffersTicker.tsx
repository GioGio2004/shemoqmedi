"use client";

// components/offers/OffersTicker.tsx
// Thin looping deal strip above the Offers grid — "RESCUE TONIGHT + N BAGS
// LIVE +" repeating between two drawn hairlines. Reuses the Marquee primitive
// with velocity OFF: the spec allows exactly one velocity-reactive marquee on
// the site and the landing already owns it. Reduced-motion renders the strip
// static (handled inside Marquee). Decorative: the live count is announced by
// the header meta, so Marquee's default aria-hidden stands.

import { Fragment } from "react";
import Marquee from "@/components/motion/Marquee";
import { Hairline } from "@/components/motion/DecorLines";

/** Sequence repeats so one children-copy always exceeds the container width
 *  (Marquee wraps at -50%; the first copy must cover the viewport). */
const REPEAT = 6;

export default function OffersTicker({
  rescueLabel,
  liveLabel,
}: {
  /** Pre-translated "Rescue tonight". */
  rescueLabel: string;
  /** Pre-translated "N bags live". */
  liveLabel: string;
}) {
  return (
    <div className="mt-10 md:mt-14">
      <Hairline />
      <Marquee velocity={false} duration={30}>
        {Array.from({ length: REPEAT }, (_, i) => (
          <Fragment key={i}>
            <span className="v-t-mono whitespace-nowrap px-5 py-2.5 text-v-mut">
              {rescueLabel}
            </span>
            <span className="v-t-mono text-v-accent">+</span>
            <span className="v-t-mono whitespace-nowrap px-5 py-2.5 tabular-nums text-v-ink">
              {liveLabel}
            </span>
            <span className="v-t-mono text-v-accent">+</span>
          </Fragment>
        ))}
      </Marquee>
      <Hairline />
    </div>
  );
}
