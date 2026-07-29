"use client";

import { useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  type StudioConfig,
  formatPrice,
  themeVars,
  tr,
  withAlpha,
} from "./studio-config";
import { StudioItemCard, StudioFeaturedCard, type StudioItem } from "./StudioCards";

gsap.registerPlugin(useGSAP);

// ─────────────────────────────────────────────────────────────────────────────
// StudioMenuView — renders a venue's menu entirely from its published
// StudioConfig. This is the consumer-side counterpart of the admin's
// MenuPreview: same composition, same motion recipe, so what a venue designs
// is what a diner gets.
//
// Routed by MenuRouterClient when themeSettings.menuType === "studio".
// ─────────────────────────────────────────────────────────────────────────────

type Category = {
  _id: string;
  name: Record<string, string>;
  imageUrl: string | null;
  items: StudioItem[];
};

export default function StudioMenuView({
  config,
  data,
}: {
  config: StudioConfig;
  // publicMenu.get payload — typed loosely because the consumer reads Convex
  // through anyApi; the fields used here are stable contract.
  data: {
    organization: {
      name: string;
      logoUrl: string | null;
      currency?: string;
      storefrontConfig: Record<string, unknown> | null;
      operatingHours: Array<{ day: string; hours: string }>;
      socialLinks: { whatsapp?: string; instagram?: string; email?: string } | null;
    };
    venueMedia?: { coverImage?: string | null } | null;
    categories: Category[];
  };
}) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const { theme, hero, cards, nav, motion, sections } = config;
  const org = data.organization;
  const currency = org.currency ?? "GEL";
  const categories = useMemo(
    () => (data.categories ?? []).filter((c) => c.items?.length),
    [data.categories],
  );

  const [activeCat, setActiveCat] = useState(0);
  const category = categories[Math.min(activeCat, Math.max(categories.length - 1, 0))];

  const featured = useMemo(
    () => categories.flatMap((c) => c.items).filter((i) => i.isFeatured).slice(0, 8),
    [categories],
  );

  const sc = (org.storefrontConfig ?? {}) as Record<string, unknown>;
  const coverImage =
    (sc.coverImageUrl as string | undefined) ||
    data.venueMedia?.coverImage ||
    null;
  const tagline = tr(
    sc.heroSubheadline as Record<string, string> | string | undefined,
    locale,
  );

  const scopeRef = useRef<HTMLDivElement>(null);

  // ── GSAP entrance — same recipe as the studio preview ─────────────────────
  useGSAP(
    () => {
      if (!motion.enabled || motion.entrance === "none") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-anim]");
      if (!els.length) return;

      const speed = motion.speed || 1;
      const d = 0.6 / speed;
      const stagger = 0.055 / speed;

      switch (motion.entrance) {
        case "stagger-rise":
          gsap.fromTo(els, { autoAlpha: 0, y: 46, scale: 0.985 },
            { autoAlpha: 1, y: 0, scale: 1, duration: d * 1.15, ease: "expo.out", stagger: stagger * 1.4, overwrite: "auto" });
          break;
        case "slide-mask":
          gsap.fromTo(els, { clipPath: "inset(0 100% 0 0)", autoAlpha: 1 },
            { clipPath: "inset(0 0% 0 0)", duration: d, ease: "expo.out", stagger, overwrite: "auto" });
          break;
        case "scale-in":
          gsap.fromTo(els, { autoAlpha: 0, scale: 0.9 },
            { autoAlpha: 1, scale: 1, duration: d * 0.9, ease: "expo.out", stagger: stagger * 0.8, overwrite: "auto" });
          break;
        default: // fade-up
          gsap.fromTo(els, { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: d, ease: "expo.out", stagger, overwrite: "auto" });
      }
    },
    {
      scope: scopeRef,
      dependencies: [motion.enabled, motion.entrance, motion.speed, cards.variant, activeCat],
    },
  );

  const hoverCss =
    motion.enabled && motion.hover !== "none"
      ? {
          lift: `.sd-root .sd-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,0.28); }`,
          tilt: `.sd-root .sd-card:hover { transform: rotate(1.2deg) scale(1.02); }`,
          glow: `.sd-root .sd-card:hover { box-shadow: 0 0 0 1px var(--sd-accent), 0 10px 30px var(--sd-accent-35); }`,
          none: "",
        }[motion.hover] ?? ""
      : "";

  const pad = "clamp(16px, 5vw, 40px)";
  const listVariant = cards.variant === "minimal" || cards.variant === "editorial";
  const columns = Math.max(1, Math.min(cards.columns || 2, 2));

  // ── Sections ──────────────────────────────────────────────────────────────
  const renderHero = () => {
    const alignCls = hero.alignment === "center" ? "items-center text-center" : "items-start text-left";

    if (hero.preset === "poster") {
      return (
        <div className="relative" style={{ minHeight: "min(72vh, 560px)" }}>
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0"
              style={{ background: `linear-gradient(160deg, ${withAlpha(theme.accent, 0.5)}, var(--sd-bg) 80%)` }} />
          )}
          <div aria-hidden className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 25%, rgba(0,0,0,0.78) 100%)" }} />
          <div data-anim className={`relative flex flex-col justify-end gap-2 ${alignCls}`}
            style={{ padding: pad, minHeight: "min(72vh, 560px)" }}>
            {hero.showLogo && org.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt="" className="mb-2 h-14 w-14 rounded-full border border-white/30 object-cover" />
            )}
            <h1 className="font-bold leading-none tracking-tight"
              style={{ color: "#FFF", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(34px, 8vw, 68px)" }}>
              {org.name}
            </h1>
            {hero.showTagline && tagline && (
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(14px, 2.2vw, 18px)" }}>{tagline}</p>
            )}
          </div>
        </div>
      );
    }

    if (hero.preset === "editorial") {
      return (
        <div data-anim className={`flex flex-col gap-3 ${alignCls}`}
          style={{ padding: `clamp(40px, 9vw, 96px) ${pad} clamp(24px, 5vw, 48px)` }}>
          <p className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: "var(--sd-accent)", fontFamily: "var(--sd-font-body)" }}>
            Menu
          </p>
          <div className="w-full" style={{ height: 1, background: "var(--sd-ink-14)" }} />
          <h1 className="font-semibold leading-[1.02] tracking-tight"
            style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(38px, 9vw, 84px)" }}>
            {org.name}
          </h1>
          {hero.showTagline && tagline && (
            <p className="max-w-[52ch] leading-relaxed"
              style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)", fontSize: "clamp(14px, 2vw, 17px)" }}>
              {tagline}
            </p>
          )}
          <div className="w-full" style={{ height: 1, background: "var(--sd-ink-14)" }} />
        </div>
      );
    }

    // classic
    return (
      <div className="relative">
        {coverImage && (
          <div className="relative w-full overflow-hidden" style={{ height: "clamp(160px, 34vw, 340px)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="" className="h-full w-full object-cover" />
            <div aria-hidden className="absolute inset-0"
              style={{ background: `linear-gradient(180deg, transparent, ${theme.background})` }} />
          </div>
        )}
        <div data-anim className={`flex flex-col gap-2 ${alignCls}`}
          style={{ padding: `${coverImage ? "clamp(12px,2vw,20px)" : "clamp(40px,8vw,80px)"} ${pad} clamp(20px,4vw,36px)` }}>
          {hero.showLogo && (
            org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover"
                style={{ border: "2px solid var(--sd-ink-14)" }} />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-bold"
                style={{ background: "var(--sd-accent)", color: "var(--sd-accent-ink)" }}>
                {org.name.charAt(0).toUpperCase()}
              </div>
            )
          )}
          <h1 className="font-bold leading-tight tracking-tight"
            style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(30px, 7vw, 56px)" }}>
            {org.name}
          </h1>
          {hero.showTagline && tagline && (
            <p className="max-w-[52ch] leading-relaxed"
              style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)", fontSize: "clamp(14px, 2vw, 17px)" }}>
              {tagline}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderFeatured = () => {
    if (!featured.length) return null;
    return (
      <div style={{ padding: `clamp(8px,2vw,20px) 0` }}>
        <div className="flex items-center gap-2" style={{ padding: `0 ${pad} clamp(10px,2vw,16px)` }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)" }}>
            Featured
          </span>
        </div>
        <div className="sd-strip flex gap-3 overflow-x-auto" style={{ padding: `0 ${pad} 6px` }}>
          {featured.map((item) => (
            <div key={item._id} data-anim>
              <StudioFeaturedCard item={item} locale={locale} currency={currency} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNav = () => {
    if (categories.length <= 1) return null;
    const strip = (
      <div className="sd-strip flex gap-2 overflow-x-auto" style={{ padding: `clamp(12px,2.5vw,20px) ${pad}` }}>
        {categories.map((cat, i) => {
          const active = i === Math.min(activeCat, categories.length - 1);
          const label = tr(cat.name, locale);
          if (nav.style === "underline") {
            return (
              <button key={cat._id} type="button" onClick={() => setActiveCat(i)}
                className="shrink-0 pb-1.5 text-[14px] font-medium transition-colors"
                style={{ color: active ? "var(--sd-ink)" : "var(--sd-ink-60)",
                  borderBottom: active ? "2px solid var(--sd-accent)" : "2px solid transparent",
                  fontFamily: "var(--sd-font-body)" }}>
                {label}
              </button>
            );
          }
          if (nav.style === "chips") {
            return (
              <button key={cat._id} type="button" onClick={() => setActiveCat(i)}
                className="shrink-0 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors"
                style={{ color: active ? "var(--sd-accent)" : "var(--sd-ink-60)",
                  border: active ? "1px solid var(--sd-accent)" : "1px solid var(--sd-ink-14)",
                  borderRadius: "calc(var(--sd-radius) * 0.6)", fontFamily: "var(--sd-font-body)" }}>
                <span style={{ opacity: 0.6 }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="ml-1.5">{label}</span>
              </button>
            );
          }
          return (
            <button key={cat._id} type="button" onClick={() => setActiveCat(i)}
              className="shrink-0 px-4 py-2 text-[14px] font-medium transition-colors"
              style={{ background: active ? "var(--sd-accent)" : "var(--sd-surface)",
                color: active ? "var(--sd-accent-ink)" : "var(--sd-ink-60)",
                borderRadius: 999,
                border: active ? "1px solid transparent" : "1px solid var(--sd-ink-08)",
                fontFamily: "var(--sd-font-body)" }}>
              {label}
            </button>
          );
        })}
      </div>
    );

    if (!nav.sticky) return strip;
    return (
      <div className="sticky top-0 z-20 backdrop-blur-md" style={{ background: withAlpha(theme.background, 0.85) }}>
        {strip}
      </div>
    );
  };

  const renderMenu = () => (
    <div>
      {renderNav()}
      <div style={{ padding: `clamp(6px,1.5vw,14px) ${pad} clamp(28px,6vw,64px)` }}>
        {category && (
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-semibold"
              style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(18px, 3vw, 26px)" }}>
              {tr(category.name, locale)}
            </h2>
            <span className="text-[12px] tabular-nums" style={{ color: "var(--sd-ink-60)" }}>
              {category.items.length} items
            </span>
          </div>
        )}
        <div
          className={listVariant ? "mx-auto w-full max-w-[820px]" : "sd-grid"}
          style={
            listVariant
              ? undefined
              : {
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: "calc(14px * var(--sd-density))",
                }
          }
        >
          {(category?.items ?? []).map((item) => (
            <div key={item._id} data-anim>
              <StudioItemCard item={item} locale={locale} cards={cards} currency={currency} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInfo = () => {
    const hours = org.operatingHours ?? [];
    const socials = org.socialLinks ?? {};
    return (
      <div data-anim
        style={{ padding: `clamp(28px,5vw,56px) ${pad} clamp(36px,7vw,72px)`, borderTop: "1px solid var(--sd-ink-14)" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)" }}>
          {org.name}
        </p>
        {hours.length > 0 && (
          <div className="mt-3 flex flex-col gap-1.5" style={{ maxWidth: 420 }}>
            {hours.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-[13px]" style={{ color: "var(--sd-ink-60)" }}>
                <span>{h.day}</span>
                <span className="tabular-nums" style={{ color: "var(--sd-ink)" }}>{h.hours}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {socials.instagram && (
            <a href={`https://instagram.com/${socials.instagram}`} target="_blank" rel="noopener noreferrer"
              className="text-[12px] underline-offset-4 hover:underline" style={{ color: "var(--sd-ink-60)" }}>
              Instagram
            </a>
          )}
          {socials.whatsapp && (
            <a href={`https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="text-[12px] underline-offset-4 hover:underline" style={{ color: "var(--sd-ink-60)" }}>
              WhatsApp
            </a>
          )}
          {socials.email && (
            <a href={`mailto:${socials.email}`}
              className="text-[12px] underline-offset-4 hover:underline" style={{ color: "var(--sd-ink-60)" }}>
              {socials.email}
            </a>
          )}
          <span className="ml-auto text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--sd-ink-25)" }}>
            Powered by VOLOO <span style={{ color: "var(--sd-accent)" }}>■</span>
          </span>
        </div>
      </div>
    );
  };

  const RENDERERS: Record<string, () => React.ReactNode> = {
    hero: renderHero,
    featured: renderFeatured,
    menu: renderMenu,
    info: renderInfo,
  };

  return (
    <div
      ref={scopeRef}
      className="sd-root min-h-screen"
      style={{ ...themeVars(theme), background: "var(--sd-bg)", fontFamily: "var(--sd-font-body)" }}
    >
      <style>{`
        .sd-root .sd-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1); }
        ${hoverCss}
        .sd-strip { scrollbar-width: none; }
        .sd-strip::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) { .sd-grid { grid-template-columns: repeat(${Math.min(columns + 1, 3)}, minmax(0,1fr)) !important; } }
        @media (min-width: 1280px) { .sd-grid { grid-template-columns: repeat(${Math.min(columns + 2, 4)}, minmax(0,1fr)) !important; } }
      `}</style>

      {(sections?.length ? sections : [{ id: "hero", visible: true }, { id: "menu", visible: true }])
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.id}>{RENDERERS[s.id]?.() ?? null}</div>
        ))}
    </div>
  );
}

export { formatPrice };
