"use client";

// ruled-menu/RmGallery.tsx
// The drift wall — venue photography in 2/3 staggered columns, each column
// scrubbed a few percent against scroll (HowItWorks precedent). Images obey
// the grayscale-at-rest law and release to color inside the viewport's
// middle band (.is-color), plus on hover.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead, XFrame } from "@/components/motion/DecorLines";
import Reveal from "@/components/motion/Reveal";
import { imgSrcSet } from "./types";

export default function RmGallery({
  index,
  label,
  images,
  venueName,
}: {
  index: string;
  label: string;
  images: string[];
  venueName: string;
}) {
  const rootRef = useRef<HTMLElement | null>(null);

  // Column drift + color band.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cols = root.querySelectorAll<HTMLElement>(".rm-gal-col");
      cols.forEach((col, i) => {
        gsap.fromTo(
          col,
          { yPercent: i % 2 === 0 ? 4 : -3 },
          {
            yPercent: i % 2 === 0 ? -6 : 4,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      });
    });

    return () => mm.revert();
  }, [images.length]);

  if (!images.length) return null;

  // Round-robin into 3 columns (2 on mobile via CSS grid collapse).
  const cols: string[][] = [[], [], []];
  images.forEach((src, i) => cols[i % 3].push(src));

  return (
    <section className="rm-sec" ref={rootRef} id="gallery">
      <div className="rm-wrap">
        <SectionHead index={index} label={label} meta={`( ${images.length} )`} />

        <div className="rm-gal mt-12">
          {cols
            .filter((c) => c.length)
            .map((col, ci) => (
              <div key={ci} className="rm-gal-col">
                {col.map((src, ii) => {
                  const img = imgSrcSet(src);
                  return (
                    <Reveal key={`${src}-${ii}`} type="frame" delay={ii * 0.06}>
                      <XFrame>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          {...(img.srcSet ? { srcSet: img.srcSet, sizes: "(min-width:768px) 33vw, 50vw" } : {})}
                          alt={`${venueName} — ${ci * 3 + ii + 1}`}
                          className="v-img v-img-hover rm-img-band"
                          loading="lazy"
                          decoding="async"
                          data-rm-band
                        />
                      </XFrame>
                    </Reveal>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
