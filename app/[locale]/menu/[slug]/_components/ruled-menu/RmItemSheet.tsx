"use client";

// ruled-menu/RmItemSheet.tsx
// Item detail overlay — slides up on mobile, floats centered on desktop.
// data-lenis-prevent keeps its internal scroll native; Lenis pauses while
// open. Esc / backdrop / CLOSE all dismiss.

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "@/components/motion/SmoothScroll";
import { idx2, imgSrcSet, lari, pick, type RmCategory, type RmItem } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function RmItemSheet({
  item,
  category,
  locale,
  closeLabel,
  onClose,
}: {
  item: RmItem | null;
  category: RmCategory | null;
  locale: string;
  closeLabel: string;
  onClose: () => void;
}) {
  const lenis = useLenis();
  const reduce = useReducedMotion();

  // Esc to close + Lenis pause while open.
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    lenis.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis.start();
    };
  }, [item, lenis, onClose]);

  const img = item?.imageUrl ? imgSrcSet(item.imageUrl) : null;

  // NOTE: AnimatePresence needs keyed direct children — a bare Fragment here
  // leaves the sheet mounted forever because exit can never resolve.
  return (
    <AnimatePresence>
      {item && [
          <motion.button
            key="rm-sheet-backdrop"
            type="button"
            aria-label={closeLabel}
            className="rm-sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />,
          <motion.div
            key="rm-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={pick(item.name, locale)}
            className="rm-sheet"
            data-lenis-prevent
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 56 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.55, ease: [...EASE] }}
          >
            <div className="rm-sheet-grid">
              {/* Imagery — full color, the appetite shot */}
              <div className="rm-sheet-img">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.src}
                    {...(img.srcSet ? { srcSet: img.srcSet, sizes: "(min-width:768px) 40vw, 100vw" } : {})}
                    alt={pick(item.name, locale)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="v-t-mono" style={{ color: "var(--v-faint)" }}>
                      — — —
                    </span>
                  </div>
                )}
              </div>

              {/* Copy */}
              <div className="flex flex-col p-6 sm:p-8">
                <div className="v-shead-row v-t-mono" style={{ color: "var(--v-faint)" }}>
                  <span>{category ? pick(category.name, locale) : ""}</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rm-link-roll v-t-mono text-v-ink"
                  >
                    <span>{closeLabel} ✕</span>
                    <span aria-hidden>{closeLabel} ✕</span>
                  </button>
                </div>

                <span className="v-line-x my-4" aria-hidden="true" />

                <h3 className="font-v-display text-[clamp(1.7rem,4vw,2.6rem)] font-medium leading-[1.02] tracking-tight text-v-ink text-balance">
                  {pick(item.name, locale)}
                </h3>

                {item.description && (
                  <p className="v-t-small mt-4 max-w-prose" style={{ color: "var(--v-mut)" }}>
                    {pick(item.description, locale)}
                  </p>
                )}

                {item.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {item.tags.map((t, i) => (
                      <span key={t} className="rm-chip v-t-micro">
                        <span className="v-t-mono mr-1.5" style={{ color: "var(--v-faint)" }}>
                          {idx2(i)}
                        </span>
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-8">
                  <span className="v-line-x mb-4 block" aria-hidden="true" />
                  <span className="flex items-baseline justify-between">
                    <span className="v-t-mono" style={{ color: "var(--v-faint)" }}>
                      ₾
                    </span>
                    <span className="font-v-display text-[clamp(1.8rem,4vw,2.6rem)] font-medium tabular-nums tracking-tight text-v-accent">
                      {lari(item.price)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>,
        ]}
    </AnimatePresence>
  );
}
