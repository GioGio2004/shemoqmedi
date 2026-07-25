"use client";

// ruled-menu/RmStory.tsx
// Bone theme-flip editorial block — brand storytelling with THE CORRIDOR.
// Left column: story copy (line mask-reveal) over the infinite-tunnel window
// (cream-flipped via contextual tokens — the reference palette). Right
// column: the crosshair-framed story image.

import Reveal from "@/components/motion/Reveal";
import { SectionHead, XFrame } from "@/components/motion/DecorLines";
import RmTunnel from "./RmTunnel";
import { imgSrcSet } from "./types";

export default function RmStory({
  index,
  label,
  text,
  imageUrl,
  venueName,
  tunnel,
}: {
  index: string;
  label: string;
  text: string;
  imageUrl: string | null;
  venueName: string;
  /** Corridor config — null hides the tunnel window. */
  tunnel: {
    images: string[];
    label: string;
    ctaLabel: string;
    onCta: () => void;
  } | null;
}) {
  const img = imageUrl ? imgSrcSet(imageUrl) : null;

  return (
    <section className="rm-sec" data-theme="bone" id="story">
      <div className="rm-wrap">
        <SectionHead index={index} label={label} headingClassName="" />

        <div className="rm-story-grid mt-10">
          <div className="flex min-w-0 flex-col gap-8">
            {text && (
              <Reveal as="p" type="lines" className="rm-story-text">
                {text}
              </Reveal>
            )}

            {tunnel && tunnel.images.length > 0 && (
              <div className="rm-story-tunnel">
                <RmTunnel
                  embedded
                  images={tunnel.images}
                  label={tunnel.label}
                  ctaLabel={tunnel.ctaLabel}
                  onCta={tunnel.onCta}
                />
              </div>
            )}
          </div>

          {img && (
            <div className="rm-story-img justify-self-end">
              <XFrame bare>
                <Reveal type="frame" className="v-xframe-in">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    {...(img.srcSet ? { srcSet: img.srcSet, sizes: "(min-width:1024px) 34vw, 90vw" } : {})}
                    alt={venueName}
                    className="v-img v-img-hover rm-img-band h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    data-rm-band
                  />
                </Reveal>
              </XFrame>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
