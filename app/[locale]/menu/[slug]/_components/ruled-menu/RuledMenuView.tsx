"use client";

// ruled-menu/RuledMenuView.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The RULED "Signature" menu template — shell & composer.
//
//  • Scoped Lenis smooth scroll (SmoothScroll enabled) — the landing's
//    pathname gate stays untouched; this route opts in explicitly.
//  • Injects RM_CSS once; sets the per-venue accent override on .rm-root.
//  • Assembles sections in order with dynamic RULED index numbers:
//      HERO → TICKER → 01 FEATURED → 02 MENU → 03 STORY → 04 GALLERY →
//      05 INFO → FOOTER  (indexes shift when a section is hidden)
//  • Owns the item-sheet state and the nav scroll-spy state.
//  • Global color-band trigger for every [data-rm-band] image (story +
//    gallery): grayscale releases inside the viewport's middle band.
//  • Mounts the VolooAI concierge (MenuAIBridge) exactly like the basic
//    template, gated on features.hasAiManager !== false.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { MenuAIBridge } from "../basic-menu/_components/menu-ai-bridge";
import { RM_CSS } from "./rm-css";
import RmNav from "./RmNav";
import RmHero from "./RmHero";
import RmTicker from "./RmTicker";
import RmFeatured from "./RmFeatured";
import RmMenu from "./RmMenu";
import RmItemSheet from "./RmItemSheet";
import RmStory from "./RmStory";
import RmGallery from "./RmGallery";
import RmInfo from "./RmInfo";
import RmFooter from "./RmFooter";
import {
  idx2,
  pick,
  type RmCategory,
  type RmData,
  type RmItem,
} from "./types";

export default function RuledMenuView({
  data,
  slug,
}: {
  data: RmData;
  slug: string;
}) {
  const locale = useLocale();
  const t = useTranslations("MenuRuled");

  const org = data.organization;
  const config = org.ruledMenuConfig;
  const media = data.venueMedia ?? null;
  const categories = (data.categories ?? []) as RmCategory[];

  // ── Sheet + scroll-spy state ────────────────────────────────────────────────
  const [openItem, setOpenItem] = useState<{
    item: RmItem;
    category: RmCategory | null;
  } | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const handleActiveCat = useCallback((id: string | null) => {
    if (id) setActiveCat(id);
  }, []);

  // ── Derived content ─────────────────────────────────────────────────────────
  const menuStyle: "rows" | "gallery" =
    config?.menuStyle === "rows" ? "rows" : "gallery";
  const name = org.name;
  const tagline = pick(org.storefrontConfig?.heroSubheadline, locale);
  const coverImage =
    media?.coverImage ||
    org.storefrontConfig?.coverImageUrl ||
    org.storefrontConfig?.heroImageUrls?.find(Boolean) ||
    null;

  const totalItems = useMemo(
    () => categories.reduce((n, c) => n + c.items.length, 0),
    [categories],
  );

  const featuredItems = useMemo(
    () =>
      categories
        .flatMap((c) => c.items)
        .filter((i) => i.isFeatured)
        .slice(0, 10),
    [categories],
  );

  const metaItems = useMemo(() => {
    const out: string[] = [];
    out.push((media?.category ?? t("menuLabel")).toUpperCase());
    if (media?.googleRating != null) {
      out.push(
        `★ ${media.googleRating.toFixed(1)}${
          media.googleReviewCount ? ` (${media.googleReviewCount})` : ""
        }`,
      );
    }
    out.push(t("itemsCount", { count: totalItems }));
    const city = pick(org.storefrontConfig?.cityStateZip, locale);
    out.push(city || t("cityFallback"));
    return out;
  }, [media, totalItems, org.storefrontConfig, locale, t]);

  const tickerPhrases = useMemo(() => {
    if (config?.showTicker === false) return [];
    const phrases = (org.announcements ?? [])
      .filter((a) => a.isActive && a.message.trim())
      .map((a) => a.message.trim());
    const custom = pick(config?.tickerText, locale);
    if (custom) phrases.push(custom);
    if (org.storefrontAlert?.trim()) phrases.push(org.storefrontAlert.trim());
    if (!phrases.length) phrases.push(name, t("cityFallback"));
    return phrases;
  }, [config, org.announcements, org.storefrontAlert, locale, name, t]);

  const storyText = config?.showStory === false ? "" : pick(config?.storyText, locale);
  const storyImage = config?.storyImageUrl || media?.coverImage || null;

  const galleryImages = useMemo(() => {
    if (config?.showGallery === false) return [];
    const own = (config?.galleryImageUrls ?? []).filter(Boolean);
    if (own.length) return own.slice(0, 9);
    const venue = (media?.galleryImages ?? []).filter(Boolean);
    if (venue.length) return venue.slice(0, 9);
    return (org.storefrontConfig?.heroImageUrls ?? []).filter(Boolean).slice(0, 9);
  }, [config, media, org.storefrontConfig]);

  const address =
    pick(org.storefrontConfig?.address, locale) || media?.address || null;

  const infoLinks = useMemo(() => {
    const links: Array<{ label: string; href: string }> = [];
    if (media?.phone) links.push({ label: media.phone, href: `tel:${media.phone}` });
    if (data.venue)
      links.push({
        label: t("directions"),
        href: `https://www.google.com/maps/dir/?api=1&destination=${data.venue.lat},${data.venue.lng}`,
      });
    const s = org.socialLinks;
    if (s?.instagram)
      links.push({
        label: "INSTAGRAM",
        href: s.instagram.startsWith("http")
          ? s.instagram
          : `https://instagram.com/${s.instagram.replace(/^@/, "")}`,
      });
    if (s?.whatsapp)
      links.push({
        label: "WHATSAPP",
        href: s.whatsapp.startsWith("http")
          ? s.whatsapp
          : `https://wa.me/${s.whatsapp.replace(/[^\d]/g, "")}`,
      });
    if (s?.email) links.push({ label: s.email, href: `mailto:${s.email}` });
    return links;
  }, [media, data.venue, org.socialLinks, t]);

  // The tunnel flies through every photo the venue has — dish shots first,
  // then gallery/hero imagery — so the corridor is always the venue's own.
  const tunnelImages = useMemo(() => {
    const dish = categories.flatMap((c) => c.items).map((i) => i.imageUrl);
    const cat = categories.map((c) => c.imageUrl);
    const all = [...dish, ...cat, ...galleryImages, coverImage].filter(
      (s): s is string => Boolean(s),
    );
    return Array.from(new Set(all));
  }, [categories, galleryImages, coverImage]);

  const hours = org.operatingHours ?? [];
  const showTunnel = config?.showTunnel !== false && tunnelImages.length > 0;
  const showFeatured = config?.showFeatured !== false && featuredItems.length > 0;
  // The corridor lives inside the story section — either can carry it alone.
  const showStory = Boolean(storyText) || showTunnel;
  const showGallery = galleryImages.length > 0;
  const showInfo = hours.length > 0 || Boolean(address) || infoLinks.length > 0;

  // Dynamic RULED section indexes — no gaps when sections hide.
  const indexes = useMemo(() => {
    let n = 0;
    return {
      featured: showFeatured ? idx2(n++) : "",
      menu: idx2(n++),
      story: showStory ? idx2(n++) : "",
      gallery: showGallery ? idx2(n++) : "",
      info: showInfo ? idx2(n++) : "",
    };
  }, [showFeatured, showStory, showGallery, showInfo]);

  // ── Global color band for [data-rm-band] imagery ────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const imgs = document.querySelectorAll<HTMLElement>(".rm-root [data-rm-band]");
    const bands: ScrollTrigger[] = [];
    imgs.forEach((img) => {
      bands.push(
        ScrollTrigger.create({
          trigger: img,
          start: "top 62%",
          end: "bottom 38%",
          onToggle: (self) => img.classList.toggle("is-color", self.isActive),
        }),
      );
    });
    return () => bands.forEach((b) => b.kill());
  }, [galleryImages.length, showStory]);

  // ── Keep ScrollTrigger honest after images/fonts settle ────────────────────
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 600);
    const t2 = window.setTimeout(refresh, 1800);
    window.addEventListener("load", refresh);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("load", refresh);
    };
  }, [totalItems, galleryImages.length]);

  // Per-venue accent override (admin: Signature Menu → Accent Color).
  const rootStyle = useMemo(() => {
    if (!config?.accentColor) return undefined;
    return { "--v-accent": config.accentColor } as CSSProperties;
  }, [config]);

  return (
    <SmoothScroll enabled>
      <div className="rm-root" style={rootStyle} data-menu-template="ruled">
        <style dangerouslySetInnerHTML={{ __html: RM_CSS }} />

        <RmNav
          name={name}
          categories={categories}
          activeCat={activeCat}
          locale={locale}
          slug={slug}
          menuLabel={t("menuLabel")}
          showCats={menuStyle === "rows"}
        />

        <main>
          <RmHero
            name={name}
            tagline={tagline}
            coverImage={coverImage}
            metaItems={metaItems}
            scrollLabel={t("kicker")}
          />

          {tickerPhrases.length > 0 && <RmTicker phrases={tickerPhrases} />}

          {showFeatured && (
            <RmFeatured
              items={featuredItems}
              locale={locale}
              index={indexes.featured}
              label={t("featuredLabel")}
              heading={t("featuredHeading")}
              dragLabel={t("drag")}
              currency={org.currency}
              onOpen={(item) => setOpenItem({ item, category: null })}
            />
          )}

          <RmMenu
            categories={categories}
            locale={locale}
            index={indexes.menu}
            label={t("menuLabel")}
            layout={menuStyle}
            allLabel={t("all")}
            currency={org.currency}
            onOpen={(item, category) => setOpenItem({ item, category })}
            onActiveCat={handleActiveCat}
          />

          {showStory && (
            <RmStory
              index={indexes.story}
              label={t("storyLabel")}
              text={storyText}
              imageUrl={storyImage}
              venueName={name}
              tunnel={
                showTunnel
                  ? {
                      images: tunnelImages,
                      label: t("tunnelLabel"),
                      ctaLabel: t("tunnelCta"),
                      onCta: () => {
                        const el = document.getElementById("menu");
                        if (!el) return;
                        const y =
                          el.getBoundingClientRect().top + window.scrollY - 76;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      },
                    }
                  : null
              }
            />
          )}

          {showGallery && (
            <RmGallery
              index={indexes.gallery}
              label={t("galleryLabel")}
              images={galleryImages}
              venueName={name}
            />
          )}

          {showInfo && (
            <RmInfo
              index={indexes.info}
              label={t("infoLabel")}
              heading={t("infoHeading", { name })}
              hoursLabel={t("hours")}
              contactLabel={t("contact")}
              hours={hours}
              address={address}
              links={infoLinks}
            />
          )}
        </main>

        <RmFooter
          name={name}
          locale={locale}
          backToTopLabel={t("backToTop")}
          poweredByLabel={t("poweredBy")}
        />

        <RmItemSheet
          item={openItem?.item ?? null}
          category={openItem?.category ?? null}
          locale={locale}
          closeLabel={t("close")}
          currency={org.currency}
          onClose={() => setOpenItem(null)}
        />

        {org.features?.hasAiManager !== false && (
          <div className="rm-ai">
            <MenuAIBridge
              organizationName={name}
              slug={slug}
              categories={
                categories as ComponentProps<typeof MenuAIBridge>["categories"]
              }
              themeSettings={
                (org.themeSettings ?? null) as ComponentProps<
                  typeof MenuAIBridge
                >["themeSettings"]
              }
              currency={org.currency}
            />
          </div>
        )}
      </div>
    </SmoothScroll>
  );
}
