"use client";

// ruled-menu/RmNav.tsx
// Fixed top bar — venue wordmark, category scroll-spy rail, locale switcher.
// Transparent over the hero, raises to blurred bg + drawn hairline after 24px.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLenis } from "@/components/motion/SmoothScroll";
import { buildMenuUrl } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { pick, type RmCategory } from "./types";

const LOCALES = ["en", "ka", "ru"] as const;

export default function RmNav({
  name,
  categories,
  activeCat,
  locale,
  slug,
  menuLabel,
  showCats = true,
}: {
  name: string;
  categories: RmCategory[];
  activeCat: string | null;
  locale: string;
  slug: string;
  menuLabel: string;
  /** false in feed (gallery) mode — the filter chips over the wall take over. */
  showCats?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToCat(id: string) {
    const el = document.getElementById(`rm-cat-${id}`);
    if (!el) return;
    const l = lenis.getLenis();
    if (l) l.scrollTo(el, { offset: -76 });
    else {
      const y = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  return (
    <header className={cn("rm-nav", scrolled && "is-scrolled")}>
      <div className="rm-wrap">
        <div className="rm-nav-bar">
          {/* Wordmark → back to top */}
          <button
            type="button"
            onClick={() => {
              const l = lenis.getLenis();
              if (l) l.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="v-t-mono truncate text-v-ink max-w-[42vw] text-left"
            title={name}
          >
            {name}
          </button>

          {/* Category rail — desktop (editorial rows mode only) */}
          <nav
            className={cn(
              "rm-nav-cats v-t-mono",
              showCats ? "hidden md:flex" : "hidden",
            )}
            aria-label={menuLabel}
          >
            {categories.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => scrollToCat(c._id)}
                className={cn("rm-nav-cat", activeCat === c._id && "is-active")}
              >
                {pick(c.name, locale)}
              </button>
            ))}
          </nav>

          {/* Locale switcher */}
          <div className="v-t-mono flex items-center gap-2 shrink-0">
            {LOCALES.map((l, i) => (
              <span key={l} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden style={{ color: "var(--v-faint)" }}>
                    ·
                  </span>
                )}
                <Link
                  href={buildMenuUrl(l, slug)}
                  className={cn(
                    "transition-colors",
                    l === locale
                      ? "text-v-accent"
                      : "text-v-faint hover:text-v-ink",
                  )}
                >
                  {l.toUpperCase()}
                </Link>
              </span>
            ))}
          </div>
        </div>

        {/* Category rail — mobile strip (editorial rows mode only) */}
        <nav
          className={cn(
            "rm-nav-cats v-t-mono pb-2.5 -mt-1 transition-opacity",
            showCats ? "flex md:hidden" : "hidden",
            scrolled ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          aria-label={menuLabel}
        >
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => scrollToCat(c._id)}
              className={cn("rm-nav-cat", activeCat === c._id && "is-active")}
            >
              {pick(c.name, locale)}
            </button>
          ))}
        </nav>
      </div>
      <span className="rm-nav-line" aria-hidden="true" />
    </header>
  );
}
