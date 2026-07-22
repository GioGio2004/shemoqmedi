"use client";

// components/landing/sections/LandingMarquee.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The single marquee-v instance sitewide (spec §4.3): venue names from the
// SSR `venues` prop interleaved with accent `+` separators, mono uppercase at
// h3 size in --faint, full-bleed hairlines above and below (both draw on
// enter). aria-hidden — the names are already SSR'd as real anchors in
// #venues. Falls back to localized value props pre-launch.
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment } from "react";
import { useTranslations } from "next-intl";
import Marquee from "@/components/motion/Marquee";
import { Hairline } from "@/components/motion/DecorLines";
import type { LandingVenue } from "../MotionLanding";

export default function LandingMarquee({ venues }: { venues: LandingVenue[] }) {
  const t = useTranslations("LandingRuled.marquee");
  const items =
    venues.length > 0
      ? venues.map((v) => v.name)
      : [t("m1"), t("m2"), t("m3"), t("m4")];

  return (
    <div className="ml-marq" aria-hidden="true">
      <Hairline />
      <Marquee>
        {items.map((label, i) => (
          <Fragment key={`${label}-${i}`}>
            <span className="ml-marq-item">{label}</span>
            <span className="ml-marq-item ml-marq-sep">+</span>
          </Fragment>
        ))}
      </Marquee>
      <Hairline />
    </div>
  );
}
