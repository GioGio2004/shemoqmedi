"use client";

// ruled-menu/RmFooter.tsx
// Closing block — hairline with plus-marks, giant venue wordmark
// (char mask-reveal, accent on hover), back-to-top, powered-by credit.

import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import { Hairline } from "@/components/motion/DecorLines";
import { useLenis } from "@/components/motion/SmoothScroll";

export default function RmFooter({
  name,
  locale,
  backToTopLabel,
  poweredByLabel,
}: {
  name: string;
  locale: string;
  backToTopLabel: string;
  poweredByLabel: string;
}) {
  const lenis = useLenis();

  return (
    <footer className="rm-footer">
      <div className="rm-wrap">
        <Hairline plusMarks />

        <div className="flex items-center justify-between gap-4 py-5">
          <span className="v-t-mono tabular-nums" style={{ color: "var(--v-faint)" }}>
            41.7151° N — 44.8271° E
          </span>
          <button
            type="button"
            onClick={() => {
              const l = lenis.getLenis();
              if (l) l.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rm-link-roll v-t-mono text-v-ink"
          >
            <span>{backToTopLabel} ↑</span>
            <span aria-hidden>{backToTopLabel} ↑</span>
          </button>
        </div>

        <Reveal as="p" type="chars" className="rm-footer-mark">
          {name}
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pb-2">
          <span className="v-t-micro" style={{ color: "var(--v-faint)" }}>
            © {new Date().getFullYear()} {name}
          </span>
          <Link
            href={`/${locale}`}
            className="v-t-micro transition-colors hover:text-v-accent"
            style={{ color: "var(--v-faint)" }}
          >
            {poweredByLabel} VOLOO ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}
