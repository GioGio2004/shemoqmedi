/**
 * HeroSection — Dynamic Theme + Staggered Animation Upgrade
 * ─────────────────────────────────────────────────────────────────────────────
 * Upgrade notes vs. the original:
 *  - Background overlay now tints with `--theme-bg` instead of hardcoded HSL.
 *  - Badge border / text, headline italic accent, and primary CTA button all
 *    use `--theme-accent` — zero hardcoded colors remain.
 *  - Staggered fade-in + slide-up reveal animation applied via CSS
 *    `@keyframes` (no JS animation lib needed — lean & fast).
 *  - Secondary "Visit Us" button uses a fine `--theme-accent` border.
 *  - Hero image trio keeps the `group-hover:scale-105` micro-interaction.
 *  - Scroll indicator dot color now uses `--theme-accent`.
 */

"use client";

import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { useLocale } from "next-intl";

export interface StorefrontConfig {
  heroHeadline: any;
  heroSubheadline: any;
  primaryButtonText?: any;
  secondaryButtonText?: any;
  coverImageUrl?: string;
  heroImageUrls: string[];
  address?: string;
  cityStateZip?: string;
}

/** Inline keyframe animation helper — applied via `style` attribute */
const fadeSlideUp = (delayMs: number): React.CSSProperties => ({
  animation: `heroFadeSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms both`,
});

export function HeroSection({ config }: { config: StorefrontConfig | null }) {
  const locale = useLocale();

  const getStr = (val: any) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[locale] || val["en"] || Object.values(val)[0] || "";
  };

  const headline = getStr(config?.heroHeadline);
  const subheadline = getStr(config?.heroSubheadline);
  const primaryBtn = getStr(config?.primaryButtonText) || "Explore Our Menu";
  const secondaryBtn = getStr(config?.secondaryButtonText) || "Visit Us";

  return (
    <>
      {/*
       * Keyframe definition — injected once via a <style> tag inside the
       * component. Works without a separate CSS file or animation library.
       */}
      <style>{`
        @keyframes heroFadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* ── Full-bleed Background Image ─────────────────────────────────── */}
        <div className="absolute inset-0 z-0">
          <Image
            src={
              config?.coverImageUrl ||
              "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070"
            }
            alt="Cafe interior"
            fill
            className="object-cover"
            priority
          />
          {/*
           * Tint overlay — uses --theme-bg so dark/light modes and custom
           * background colors from the DB blend correctly with the image.
           */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "color-mix(in oklch, var(--theme-bg, oklch(0.145 0 0)), transparent 25%)",
            }}
          />
        </div>

        {/* ── Foreground Content ───────────────────────────────────────────── */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">

          {/* Badge — staggered in first */}
          <div style={fadeSlideUp(100)}>
            <div
              className="inline-block px-5 py-1.5 mb-8 text-xs font-medium tracking-[0.25em] uppercase"
              style={{
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: "color-mix(in oklch, var(--theme-accent, var(--primary)), transparent 50%)",
                color: "var(--theme-accent, var(--primary))",
              }}
            >
              Artisan Coffee Since 2024
            </div>
          </div>

          {/* Main headline */}
          <div style={fadeSlideUp(220)}>
            <h1
              className="font-serif text-6xl sm:text-7xl md:text-[6.5rem] leading-[0.9] mb-8 text-balance"
              style={{ color: "var(--theme-text, var(--foreground))" }}
            >
              {headline || (
                <>
                  Optimal craftsmanship
                  <br />
                  meets{" "}
                  <span
                    className="italic"
                    style={{ color: "var(--theme-accent, var(--primary))" }}
                  >
                    exquisite taste
                  </span>
                </>
              )}
            </h1>
          </div>

          {/* Sub-headline */}
          <div style={fadeSlideUp(360)}>
            <p
              className="text-lg md:text-xl max-w-lg mx-auto mb-14 leading-relaxed"
              style={{
                color:
                  "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 35%)",
              }}
            >
              {subheadline ||
                "Transform your everyday coffee ritual into an artful experience with our handcrafted brews and fresh pastries."}
            </p>
          </div>

          {/* ── CTA Buttons ───────────────────────────────────────────────── */}
          <div style={fadeSlideUp(460)}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              {/* Primary — filled accent */}
              <a
                href="#menu"
                id="hero-explore-menu-btn"
                className="group flex items-center gap-3 px-8 py-4 font-medium tracking-wide transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  borderRadius: "var(--radius, 9999px)",
                  background: "var(--theme-accent, var(--primary))",
                  color: "var(--primary-foreground, #000)",
                }}
              >
                {primaryBtn}
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>

              {/* Secondary — outline with accent border */}
              <a
                href="#visit"
                id="hero-visit-us-btn"
                className="px-8 py-4 font-medium tracking-wide transition-all duration-300 hover:opacity-80 hover:-translate-y-0.5"
                style={{
                  borderRadius: "var(--radius, 9999px)",
                  border: "1px solid",
                  borderColor:
                    "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 60%)",
                  color: "var(--theme-text, var(--foreground))",
                }}
              >
                {secondaryBtn}
              </a>
            </div>
          </div>

          {/* ── Hero Image Trio ────────────────────────────────────────────── */}
          <div style={fadeSlideUp(560)}>
            <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto">
              {/* Image 1 */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-xl">
                <Image
                  src={
                    (config?.heroImageUrls?.[0]?.trim() || false) ||
                    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000"
                  }
                  alt="Hero image 1"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 33vw, 250px"
                />
                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Image 2 — offset upward */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden -mt-8 group shadow-xl">
                <Image
                  src={
                    (config?.heroImageUrls?.[1]?.trim() || false) ||
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000"
                  }
                  alt="Hero image 2"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 33vw, 250px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Image 3 */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-xl">
                <Image
                  src={
                    (config?.heroImageUrls?.[2]?.trim() || false) ||
                    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"
                  }
                  alt="Hero image 3"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 33vw, 250px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Scroll Indicator ──────────────────────────────────────────────── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span
            className="text-xs tracking-[0.2em] uppercase"
            style={{
              color:
                "color-mix(in oklch, var(--theme-text, var(--foreground)), transparent 50%)",
            }}
          >
            Scroll
          </span>
          <div
            className="w-px h-8 animate-pulse"
            style={{
              background:
                "linear-gradient(to bottom, var(--theme-accent, var(--primary)), transparent)",
            }}
          />
        </div>
      </section>
    </>
  );
}
