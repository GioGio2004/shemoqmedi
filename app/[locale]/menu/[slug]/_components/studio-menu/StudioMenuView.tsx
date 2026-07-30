"use client";

import { useMemo, useRef, useState, type ComponentProps } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  type StudioConfig,
  formatPrice,
  imgSrcSet,
  themeVars,
  tr,
  withAlpha,
} from "./studio-config";
import { StudioItemCard, StudioFeaturedCard, type StudioItem } from "./StudioCards";
import { MenuAIBridge } from "../basic-menu/_components/menu-ai-bridge";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// ─────────────────────────────────────────────────────────────────────────────
// StudioMenuView — renders a venue's menu entirely from its published
// StudioConfig. This is the consumer-side counterpart of the admin's
// MenuPreview: same composition, same motion recipe, so what a venue designs
// is what a diner gets.
//
// Routed by MenuRouterClient when themeSettings.menuType === "studio".
//
// Contract with the admin workspace: EVERY field the Content panel saves and
// publicMenu.get ships must either render here or be deliberately excluded —
// "content saves live" is a promise this file keeps.
// ─────────────────────────────────────────────────────────────────────────────

type Category = {
  _id: string;
  name: Record<string, string>;
  imageUrl: string | null;
  items: StudioItem[];
};

type Translatedish = Record<string, string> | string | null | undefined;

export default function StudioMenuView({
  config,
  data,
  slug,
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
      themeSettings: {
        primaryColor: string;
        backgroundColor?: string;
        textColor?: string;
        fontFamily: string;
        buttonRadius: string;
      } | null;
      operatingHours: Array<{ day: string; hours: string }>;
      socialLinks: { whatsapp?: string; instagram?: string; email?: string } | null;
      announcements?: Array<{ id: string; message: string; isActive: boolean }>;
      features?: { hasAiManager?: boolean } | null;
    };
    venue?: { lat: number; lng: number } | null;
    venueMedia?: { coverImage?: string | null; phone?: string | null; address?: string | null } | null;
    categories: Category[];
  };
  slug: string;
}) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const t = useTranslations("MenuStudio");

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

  // ── Content the admin saves in the workspace's Content panel ──────────────
  const sc = (org.storefrontConfig ?? {}) as Record<string, unknown>;
  const heroImageUrls = Array.isArray(sc.heroImageUrls)
    ? (sc.heroImageUrls as string[]).filter(Boolean)
    : [];
  const coverImage =
    (sc.coverImageUrl as string | undefined) ||
    data.venueMedia?.coverImage ||
    heroImageUrls[0] ||
    null;
  const headline = tr(sc.heroHeadline as Translatedish, locale) || org.name;
  const tagline = tr(sc.heroSubheadline as Translatedish, locale);
  const primaryCta = tr(sc.primaryButtonText as Translatedish, locale);
  const secondaryCta = tr(sc.secondaryButtonText as Translatedish, locale);
  const address = tr(sc.address as Translatedish, locale) || data.venueMedia?.address || "";
  const cityStateZip = tr(sc.cityStateZip as Translatedish, locale);
  const announcements = (org.announcements ?? []).filter((a) => a.isActive);

  // Directions target: precise pin when the venue has one, address text otherwise.
  const directionsUrl = data.venue
    ? `https://www.google.com/maps/dir/?api=1&destination=${data.venue.lat},${data.venue.lng}`
    : address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          [address, cityStateZip].filter(Boolean).join(", "),
        )}`
      : null;

  const scopeRef = useRef<HTMLDivElement>(null);

  const scrollToMenu = () => {
    scopeRef.current
      ?.querySelector("#sd-menu")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

      const animate = (targets: HTMLElement[] | HTMLElement) => {
        switch (motion.entrance) {
          case "stagger-rise":
            return gsap.fromTo(targets, { autoAlpha: 0, y: 46, scale: 0.985 },
              { autoAlpha: 1, y: 0, scale: 1, duration: d * 1.15, ease: "expo.out", stagger: stagger * 1.4, overwrite: "auto" });
          case "slide-mask":
            return gsap.fromTo(targets, { clipPath: "inset(0 100% 0 0)", autoAlpha: 1 },
              { clipPath: "inset(0 0% 0 0)", duration: d, ease: "expo.out", stagger, overwrite: "auto" });
          case "scale-in":
            return gsap.fromTo(targets, { autoAlpha: 0, scale: 0.9 },
              { autoAlpha: 1, scale: 1, duration: d * 0.9, ease: "expo.out", stagger: stagger * 0.8, overwrite: "auto" });
          default: // fade-up
            return gsap.fromTo(targets, { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: d, ease: "expo.out", stagger, overwrite: "auto" });
        }
      };

      if (motion.scrollReveal) {
        // Elements animate in as they enter the viewport, not all at once.
        gsap.set(els, { autoAlpha: 0 });
        ScrollTrigger.batch(els, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => animate(batch as HTMLElement[]),
        });
        ScrollTrigger.refresh();
      } else {
        animate(els);
      }
    },
    {
      scope: scopeRef,
      dependencies: [motion.enabled, motion.entrance, motion.speed, motion.scrollReveal, cards.variant, activeCat],
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

  // Density scales the page gutters too — matches the admin preview.
  const pad = "calc(clamp(16px, 5vw, 40px) * var(--sd-density))";
  const listVariant = cards.variant === "minimal" || cards.variant === "editorial";
  const columns = Math.max(1, Math.min(cards.columns || 2, 2));
  // Honest columns: 1 = single column at every width (reading layout);
  // 2 = two on phones, growing to 3/4 on wider screens. No !important — the
  // grid is styled entirely from the <style> block below.
  const gridCss =
    columns === 1
      ? `.sd-root .sd-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(14px * var(--sd-density)); max-width: 820px; margin-inline: auto; }`
      : `.sd-root .sd-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(14px * var(--sd-density)); }
        @media (min-width: 768px) { .sd-root .sd-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (min-width: 1280px) { .sd-root .sd-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }`;

  // ── Sections ──────────────────────────────────────────────────────────────
  const renderAnnouncements = () => {
    if (!announcements.length) return null;
    return (
      <div
        className="flex flex-col"
        style={{ background: "var(--sd-accent-08)", borderBottom: "1px solid var(--sd-ink-08)" }}
      >
        {announcements.map((a) => (
          <p
            key={a.id}
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--sd-ink)", padding: `10px ${pad}`, fontFamily: "var(--sd-font-body)" }}
          >
            <span aria-hidden style={{ color: "var(--sd-accent)", marginRight: 8 }}>■</span>
            {a.message}
          </p>
        ))}
      </div>
    );
  };

  const renderCtas = (over: boolean) => {
    if (!primaryCta && !secondaryCta) return null;
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        {primaryCta && (
          <button
            type="button"
            onClick={scrollToMenu}
            className="px-5 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-85"
            style={{
              background: "var(--sd-accent)",
              color: "var(--sd-accent-ink)",
              borderRadius: "var(--sd-radius)",
              fontFamily: "var(--sd-font-body)",
            }}
          >
            {primaryCta}
          </button>
        )}
        {secondaryCta && directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-85"
            style={{
              color: over ? "#FFF" : "var(--sd-ink)",
              border: over ? "1px solid rgba(255,255,255,0.4)" : "1px solid var(--sd-ink-25)",
              borderRadius: "var(--sd-radius)",
              fontFamily: "var(--sd-font-body)",
            }}
          >
            {secondaryCta}
          </a>
        )}
      </div>
    );
  };

  const renderHero = () => {
    const alignCls = hero.alignment === "center" ? "items-center text-center" : "items-start text-left";

    if (hero.preset === "poster") {
      return (
        <div className="relative" style={{ minHeight: "min(72vh, 560px)" }}>
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...imgSrcSet(coverImage)} alt="" className="absolute inset-0 h-full w-full object-cover" />
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
              {headline}
            </h1>
            {hero.showTagline && tagline && (
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(14px, 2.2vw, 18px)" }}>{tagline}</p>
            )}
            {renderCtas(true)}
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
            {t("menuLabel")}
          </p>
          <div className="w-full" style={{ height: 1, background: "var(--sd-ink-14)" }} />
          <h1 className="font-semibold leading-[1.02] tracking-tight"
            style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(38px, 9vw, 84px)" }}>
            {headline}
          </h1>
          {hero.showTagline && tagline && (
            <p className="max-w-[52ch] leading-relaxed"
              style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)", fontSize: "clamp(14px, 2vw, 17px)" }}>
              {tagline}
            </p>
          )}
          {renderCtas(false)}
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
            <img {...imgSrcSet(coverImage)} alt="" className="h-full w-full object-cover" />
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
            {headline}
          </h1>
          {hero.showTagline && tagline && (
            <p className="max-w-[52ch] leading-relaxed"
              style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)", fontSize: "clamp(14px, 2vw, 17px)" }}>
              {tagline}
            </p>
          )}
          {renderCtas(false)}
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
            {t("featuredLabel")}
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

  const renderEmpty = () => (
    <div
      data-anim
      className="flex flex-col items-center gap-3 text-center"
      style={{ padding: `clamp(48px,10vw,96px) ${pad}` }}
    >
      <span aria-hidden style={{ color: "var(--sd-accent)", fontSize: 24 }}>■</span>
      <p className="font-semibold"
        style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(18px,3vw,24px)" }}>
        {t("emptyTitle")}
      </p>
      <p className="max-w-[42ch] text-[14px] leading-relaxed" style={{ color: "var(--sd-ink-60)" }}>
        {t("emptyBody")}
      </p>
    </div>
  );

  const renderMenu = () => (
    <div id="sd-menu">
      {categories.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          {renderNav()}
          <div style={{ padding: `clamp(6px,1.5vw,14px) ${pad} clamp(28px,6vw,64px)` }}>
            {category && (
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-semibold"
                  style={{ color: "var(--sd-ink)", fontFamily: "var(--sd-font-heading)", fontSize: "clamp(18px, 3vw, 26px)" }}>
                  {tr(category.name, locale)}
                </h2>
                <span className="text-[12px] tabular-nums" style={{ color: "var(--sd-ink-60)" }}>
                  {t("itemsCount", { count: category.items.length })}
                </span>
              </div>
            )}
            <div className={listVariant ? "mx-auto w-full max-w-[820px]" : "sd-grid"}>
              {(category?.items ?? []).map((item) => (
                <div key={item._id} data-anim>
                  <StudioItemCard item={item} locale={locale} cards={cards} currency={currency} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInfo = () => {
    const hours = org.operatingHours ?? [];
    const socials = org.socialLinks ?? {};
    const phone = data.venueMedia?.phone;
    return (
      <div data-anim
        style={{ padding: `clamp(28px,5vw,56px) ${pad} clamp(36px,7vw,72px)`, borderTop: "1px solid var(--sd-ink-14)" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)" }}>
          {org.name}
        </p>

        {(address || cityStateZip) && (
          <div className="mt-3 flex flex-col gap-0.5" style={{ maxWidth: 420 }}>
            {address && <p className="text-[13px]" style={{ color: "var(--sd-ink)" }}>{address}</p>}
            {cityStateZip && <p className="text-[13px]" style={{ color: "var(--sd-ink-60)" }}>{cityStateZip}</p>}
            {directionsUrl && (
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] underline-offset-4 hover:underline"
                style={{ color: "var(--sd-accent)" }}>
                {t("directions")} →
              </a>
            )}
          </div>
        )}

        {hours.length > 0 && (
          <div className="mt-5 flex flex-col gap-1.5" style={{ maxWidth: 420 }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--sd-ink-60)", fontFamily: "var(--sd-font-body)" }}>
              {t("hours")}
            </p>
            {hours.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-[13px]" style={{ color: "var(--sd-ink-60)" }}>
                <span>{h.day}</span>
                <span className="tabular-nums" style={{ color: "var(--sd-ink)" }}>{h.hours}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {phone && (
            <a href={`tel:${phone}`}
              className="text-[12px] underline-offset-4 hover:underline" style={{ color: "var(--sd-ink-60)" }}>
              {phone}
            </a>
          )}
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
            {t("poweredBy")} VOLOO <span style={{ color: "var(--sd-accent)" }}>■</span>
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
        ${gridCss}
      `}</style>

      {renderAnnouncements()}

      {(sections?.length ? sections : [{ id: "hero", visible: true }, { id: "menu", visible: true }])
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.id}>{RENDERERS[s.id]?.() ?? null}</div>
        ))}

      {/* AI concierge — same gate as the other templates; a published studio
          design must never silently remove VolooAI from a venue. */}
      {org.features?.hasAiManager !== false && (
        <MenuAIBridge
          organizationName={org.name}
          slug={slug}
          categories={categories as unknown as ComponentProps<typeof MenuAIBridge>["categories"]}
          themeSettings={org.themeSettings ?? null}
          currency={currency}
        />
      )}
    </div>
  );
}

export { formatPrice };
