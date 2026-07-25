"use client";

// ruled-menu/RmHero.tsx
// Masthead — giga venue wordmark (char mask-reveal), mono meta row, cover
// image in a crosshair frame with the clip-wipe entrance. Venue covers render
// FULL COLOR (design law override) with the slow ken-burns on hover.

import Reveal from "@/components/motion/Reveal";
import { XFrame, TickRuler } from "@/components/motion/DecorLines";
import { imgSrcSet } from "./types";

function Cover({ src, alt }: { src: string; alt: string }) {
  const { src: url, srcSet } = imgSrcSet(src);
  return (
    <XFrame bare>
      <Reveal type="frame" className="v-xframe-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          {...(srcSet ? { srcSet, sizes: "(min-width:1024px) 34vw, 100vw" } : {})}
          alt={alt}
          className="v-kb h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      </Reveal>
    </XFrame>
  );
}

export default function RmHero({
  name,
  tagline,
  coverImage,
  metaItems,
  scrollLabel,
}: {
  name: string;
  tagline: string;
  coverImage: string | null;
  /** Pre-formatted mono strings: category, rating, item count, city… */
  metaItems: string[];
  scrollLabel: string;
}) {
  return (
    <section className="rm-hero" id="top" aria-label={name}>
      <TickRuler count={12} className="rm-hero-ticks" />

      {coverImage && (
        <div className="rm-hero-cover">
          <Cover src={coverImage} alt={name} />
        </div>
      )}

      <div className="rm-wrap">
        {/* Mono kicker */}
        <Reveal as="p" type="fade" delay={0.05} className="v-t-mono mb-4" style={{ color: "var(--v-faint)" }}>
          {scrollLabel}
        </Reveal>

        {/* The wordmark */}
        <Reveal as="h1" type="chars" delay={0.1} className="rm-hero-name lg:max-w-[62vw]">
          {name}
        </Reveal>

        {tagline && (
          <Reveal
            as="p"
            type="lines"
            delay={0.45}
            className="v-t-lead mt-5 max-w-xl"
            style={{ color: "var(--v-mut)" }}
          >
            {tagline}
          </Reveal>
        )}

        {/* Mobile cover */}
        {coverImage && (
          <div className="rm-hero-cover-m">
            <Cover src={coverImage} alt={name} />
          </div>
        )}

        {/* Meta row */}
        <div className="rm-hero-meta">
          {metaItems.map((m, i) => (
            <Reveal
              key={`${m}-${i}`}
              as="span"
              type="fade"
              delay={0.55 + i * 0.08}
              duration={0.7}
              className="v-t-mono tabular-nums"
              style={{ color: i === 0 ? "var(--v-accent)" : "var(--v-mut)" }}
            >
              {m}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
