"use client";

// components/landing/sections/FAQ.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 06 — FAQ. Dark, between Waitlist and Footer. Six ruled accordion rows:
// mono index, display-voice question, chevron that rotates open, answer
// revealed via a CSS grid-rows transition (0fr→1fr — no JS measuring).
// Hairlines draw on enter with a 0.1s stagger (HowItWorks pattern);
// reduced-motion gets static lines, no draw, no chevron/panel transitions
// (see the §14 guards in ml-css.ts). First row is open by default so the
// no-JS / SSR state shows real answer copy.
//
// AEO contract: every question/answer is plain text in the initial SSR
// markup, and the component emits a FAQPage JSON-LD script built from the
// SAME next-intl strings — the structured data always matches the visible
// copy in the rendered locale.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead } from "@/components/motion/DecorLines";
import Reveal from "@/components/motion/Reveal";

export default function FAQ() {
  const t = useTranslations("LandingRuled.faq");
  const rootRef = useRef<HTMLElement>(null);
  // First answer open by default — SSR/no-JS shows real copy, not six
  // collapsed rows. -1 = all closed.
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Rows rise + hairlines draw, staggered (HowItWorks §4.4 pattern).
      const rows = gsap.utils.toArray<HTMLElement>(".ml-faq-item", root);
      const lines = rows
        .map((r) => r.querySelector<HTMLElement>(".ml-faq-line"))
        .filter(Boolean) as HTMLElement[];
      const st = {
        trigger: root.querySelector(".ml-faq-list"),
        start: "top 78%",
        toggleActions: "play none none none",
      } as const;
      gsap.from(lines, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { ...st },
      });
      gsap.from(rows, {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { ...st },
      });
    });

    return () => mm.revert();
  }, []);

  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
  ];

  // FAQPage structured data from the SAME strings the user sees.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section className="ml-sec" id="faq" ref={rootRef}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="ml-wrap">
        <SectionHead
          index="06"
          label={t("label")}
          meta={`( ${t("meta")} )`}
          headingClassName=""
        >
          <Reveal as="h2" type="lines" className="v-t-h2">
            {t("heading")}
          </Reveal>
        </SectionHead>

        <p className="ml-faq-tag">{t("tagline")}</p>

        <div className="ml-faq-list">
          {items.map((it, i) => {
            const isOpen = open === i;
            const n = String(i + 1).padStart(2, "0");
            return (
              <div className="ml-faq-item" key={n}>
                <h3 className="ml-faq-qh">
                  <button
                    type="button"
                    className="ml-faq-q v-press"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className="ml-faq-idx">{n}</span>
                    <span className="ml-faq-qt">{it.q}</span>
                    <span
                      className="ml-faq-chev"
                      data-open={isOpen}
                      aria-hidden="true"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 4.5 7 9.5 12 4.5"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                      </svg>
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  className="ml-faq-panel"
                  data-open={isOpen}
                  role="region"
                >
                  <div className="ml-faq-panel-in">
                    <p className="ml-faq-a">{it.a}</p>
                  </div>
                </div>
                <span className="ml-faq-line" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
