"use client";

// components/landing/sections/CityDirectory.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 04 — AROUND TBILISI (city directory). The seeded/unclaimed venue directory,
// rendered on the MENUS panel BELOW the flagship partner catalogue. A separate,
// compact surface — ruled rows, not XFrame cards — for every published venue
// that is NOT already in the partner catalogue (dedupe happens server-side in
// app/[locale]/page.tsx; partners win).
//
// Row action by state:
//   • externalMenuUrl set   → the row's main area is an <a target="_blank">
//                             with a "VIEW MENU ↗" mono micro-label.
//   • no externalMenuUrl    → the main area is a plain <div>. NEVER a
//                             /menu/{slug} link — no org, no native menu, 404.
//   • unclaimed             → an extra "UNCLAIMED — YOURS? →" mono micro-label
//                             (mailto claim CTA, sibling of the main area so
//                             anchors never nest).
//
// Sort: actionable first (claimed or external menu), then unclaimed; stable
// A→Z by name inside each group. Renders nothing when the list is empty.
// Entrance mirrors the FAQ ruled-list grammar: rows rise + hairlines draw,
// staggered; reduced-motion gets the static SSR state.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead } from "@/components/motion/DecorLines";

const pad2 = (n: number) => String(n).padStart(2, "0");

// Mirrors api.publicVenues.listStorefront rows (convex-helpers-api.ts).
export type DirectoryVenue = {
  _id: string;
  slug: string;
  name: string;
  category: "cafe" | "restaurant" | "bar" | "hotel" | "other";
  coverImage: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  claimStatus: "claimed" | "unclaimed";
  menuMode?: "native" | "external";
  externalMenuUrl: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  orgId: string | null;
};

const CLAIM_MAILTO =
  "mailto:hello@shemoqmedi.space?subject=Claim%20my%20venue%20on%20VOLOO";

export default function CityDirectory({
  venues,
}: {
  venues: DirectoryVenue[];
  locale: string;
}) {
  const t = useTranslations("LandingRuled.directory");
  const rootRef = useRef<HTMLElement>(null);

  // Actionable rows (claimed, or an external menu exists) first, then
  // unclaimed; stable A→Z by name within each group.
  const sorted = useMemo(() => {
    const actionable = (v: DirectoryVenue) =>
      v.claimStatus === "claimed" || !!v.externalMenuUrl;
    return [...venues].sort((a, b) => {
      const ga = actionable(a) ? 0 : 1;
      const gb = actionable(b) ? 0 : 1;
      if (ga !== gb) return ga - gb;
      return a.name.localeCompare(b.name);
    });
  }, [venues]);

  const count = sorted.length;

  // Entrance — rows rise + hairlines draw with a stagger (FAQ §14 pattern).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || count === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const rows = gsap.utils.toArray<HTMLElement>(".ml-dir-row", root);
      const lines = rows
        .map((r) => r.querySelector<HTMLElement>(".ml-dir-line"))
        .filter(Boolean) as HTMLElement[];
      const st = {
        trigger: root.querySelector(".ml-dir-grid"),
        start: "top 82%",
        toggleActions: "play none none none",
      } as const;
      gsap.from(lines, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { ...st },
      });
      gsap.from(rows, {
        y: 16,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { ...st },
      });
    });

    return () => mm.revert();
  }, [count]);

  if (count === 0) return null;

  const catLabel: Record<DirectoryVenue["category"], string> = {
    cafe: t("cat_cafe"),
    restaurant: t("cat_restaurant"),
    bar: t("cat_bar"),
    hotel: t("cat_hotel"),
    other: t("cat_other"),
  };

  return (
    <section className="ml-sec ml-dir" id="directory" ref={rootRef}>
      <div className="ml-wrap">
        <SectionHead
          index="04"
          label={t("label")}
          meta={`( ${t("meta")} )`}
          headingClassName=""
        />
        <p className="ml-dir-sub">{t("sub")}</p>

        <div className="ml-dir-grid">
          {sorted.map((v, i) => {
            const external = !!v.externalMenuUrl;
            const unclaimed = v.claimStatus === "unclaimed";
            const rating =
              v.googleRating != null
                ? ` · ${v.googleRating.toFixed(1)}${
                    v.googleReviewCount != null
                      ? ` (${v.googleReviewCount})`
                      : ""
                  }`
                : "";
            const meta = `${catLabel[v.category]}${rating}`;

            const body = (
              <>
                <span className="ml-dir-idx">{pad2(i + 1)}</span>
                <span className="ml-dir-main">
                  <span className="ml-dir-name">{v.name}</span>
                  <span className="ml-dir-meta">{meta}</span>
                  <span className="ml-dir-addr">{v.address}</span>
                </span>
                {external && (
                  <span className="ml-dir-act" aria-hidden="true">
                    {t("view_menu")} ↗
                  </span>
                )}
              </>
            );

            return (
              <div className="ml-dir-row" key={v._id}>
                {external ? (
                  <a
                    className="ml-dir-hit v-press"
                    href={v.externalMenuUrl as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${v.name} — ${t("view_menu")}`}
                  >
                    {body}
                  </a>
                ) : (
                  <div className="ml-dir-hit">{body}</div>
                )}
                {unclaimed && (
                  <a className="ml-dir-claim" href={CLAIM_MAILTO}>
                    {t("claim")} →
                  </a>
                )}
                <span className="ml-dir-line" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
