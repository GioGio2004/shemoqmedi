"use client";

// components/landing/sections/PortfolioSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Venue portfolio sheet — the rect-to-fullscreen GSAP expand is preserved
// mechanically from the previous build (portal to <body>, z-9999/10000,
// body scroll-lock, Escape-to-close, reverse-collapse into the tapped card).
// RULED reskin only: crosshair-framed header under the grayscale law (tips
// into color once open), metadata as mono KEY — VALUE hairline rows, circular
// 1px-border close button. data-lenis-prevent on the scroller (spec §3.1).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { X, MapPin, ExternalLink, ArrowUpRight } from "lucide-react";
import CustomVenueMap from "@/components/venues/CustomVenueMap";
import { XFrame } from "@/components/motion/DecorLines";
import { api } from "@/convex-helpers-api";
import { buildMenuUrl } from "@/lib/routes";
import type { LandingVenue } from "../MotionLanding";
import { IMG } from "./shared";

type OrgDetail = {
  organization: {
    name: string;
    logoUrl: string | null;
    storefrontConfig?: {
      address?: string | Record<string, string>;
      cityStateZip?: string | Record<string, string>;
      coverImageUrl?: string;
      heroImageUrls?: string[];
      heroSubheadline?: string | Record<string, string>;
    } | null;
    operatingHours?: Array<{ day: string; hours: string }> | null;
    socialLinks?: { instagram?: string; whatsapp?: string; email?: string } | null;
  };
  venue?: { lat: number; lng: number };
  categories: Array<{
    _id: string;
    name: Record<string, string>;
    items: Array<{
      _id: string;
      name: Record<string, string>;
      price: number;
      imageUrl?: string | null;
    }>;
  }>;
};

function tField(field: string | Record<string, string> | undefined): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field["en"] ?? field["ka"] ?? Object.values(field)[0] ?? "";
}

export default function PortfolioSheet({
  venue,
  origin,
  onClose,
}: {
  venue: LandingVenue;
  origin: DOMRect;
  onClose: () => void;
}) {
  const locale = useLocale();
  const detail = useQuery(api.publicMenu.get, { slug: venue.slug }) as
    | OrgDetail
    | null
    | undefined;
  const sheetRef = useRef<HTMLDivElement>(null);
  const bdRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  // Header tips into color shortly after the sheet finishes expanding —
  // the sheet is the "in-band" state of the grayscale law.
  const [inColor, setInColor] = useState(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const sheet = sheetRef.current,
      bd = bdRef.current;
    if (!sheet || !bd) return onClose();
    sheet.style.overflowY = "hidden";
    sheet.scrollTop = 0;
    gsap
      .timeline({ onComplete: onClose })
      .to(
        sheet,
        {
          top: origin.top,
          left: origin.left,
          width: origin.width,
          height: origin.height,
          borderRadius: 2,
          duration: 0.42,
          ease: "power3.inOut",
        },
        0
      )
      .to(bd, { opacity: 0, duration: 0.42, ease: "power2.inOut" }, 0);
  }, [origin, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const colorId = window.setTimeout(() => setInColor(true), 500);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(colorId);
    };
  }, [close]);

  // iOS app-open: grow from the tapped card's exact rect to full screen.
  useLayoutEffect(() => {
    const sheet = sheetRef.current,
      bd = bdRef.current;
    if (!sheet || !bd) return;
    gsap.set(bd, { opacity: 0 });
    gsap.set(sheet, {
      position: "fixed",
      top: origin.top,
      left: origin.left,
      width: origin.width,
      height: origin.height,
      borderRadius: 2,
      margin: 0,
      maxWidth: "none",
      maxHeight: "none",
      overflow: "hidden",
      zIndex: 10000,
      opacity: 1,
    });
    const tl = gsap.timeline();
    tl.to(bd, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0).to(
      sheet,
      {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        duration: 0.55,
        ease: "power3.inOut",
        onComplete() {
          sheet.style.overflowY = "auto";
          sheet.style.width = "100%";
          sheet.style.height = "100svh";
        },
      },
      0
    );
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const org = detail?.organization;
  const cover =
    org?.storefrontConfig?.coverImageUrl ??
    org?.storefrontConfig?.heroImageUrls?.[0] ??
    venue.imageUrl ??
    IMG.venueFallbacks[0];
  const address = [
    tField(org?.storefrontConfig?.address),
    tField(org?.storefrontConfig?.cityStateZip),
  ]
    .filter(Boolean)
    .join(", ");
  const subline = tField(org?.storefrontConfig?.heroSubheadline);
  const hours = org?.operatingHours ?? [];
  const social = org?.socialLinks;
  const gallery = org?.storefrontConfig?.heroImageUrls ?? [];
  const signature = (detail?.categories ?? []).flatMap((c) => c.items).slice(0, 4);
  const menuUrl = buildMenuUrl(locale, venue.slug);
  const lat = detail?.venue?.lat,
    lng = detail?.venue?.lng;

  return createPortal(
    <div
      className="ml-bd"
      ref={bdRef}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        className="ml-sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={venue.name}
        data-lenis-prevent
      >
        <XFrame className="ml-ph" innerClassName="ml-ph-in">
          <span className="ml-handle" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={venue.name}
            className={`v-img${inColor ? " is-color" : ""}`}
          />
          <div className="ml-ph-grad" />
          <button className="ml-x" onClick={close} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
          <div className="ml-cap">
            <span className="ml-vcat">VENUE — TBILISI</span>
            <h2>{venue.name}</h2>
            {subline && <p className="ml-sub">{subline}</p>}
          </div>
        </XFrame>

        <div className="ml-pb">
          {subline && (
            <section className="ml-psec">
              <p className="ml-pl">ABOUT</p>
              <div className="ml-hline-s" />
              <p className="ml-about">{subline}</p>
            </section>
          )}

          {gallery.length > 1 && (
            <section className="ml-psec">
              <p className="ml-pl">GALLERY</p>
              <div className="ml-hline-s" />
              <div className="ml-gal" data-lenis-prevent>
                {gallery.slice(0, 6).map((g, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={g} alt="" loading="lazy" />
                ))}
              </div>
            </section>
          )}

          {signature.length > 0 && (
            <section className="ml-psec">
              <p className="ml-pl">SIGNATURE MENU</p>
              <div>
                {signature.map((it) => (
                  <div key={it._id} className="ml-krow">
                    <span className="ml-k">{tField(it.name)}</span>
                    <span className="ml-v">
                      ₾ {((it.price ?? 0) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(address || hours.length > 0) && (
            <section className="ml-psec">
              <p className="ml-pl">DETAILS</p>
              <div>
                {address && (
                  <div className="ml-krow">
                    <span className="ml-k">LOCATION</span>
                    <span className="ml-v">{address}</span>
                  </div>
                )}
                {hours.length > 0 && (
                  <div className="ml-krow" style={{ display: "block" }}>
                    <span className="ml-k">HOURS</span>
                    <div style={{ marginTop: "var(--v-s2)" }}>
                      {hours.map((h) => (
                        <div key={h.day} className="ml-hr">
                          <span>{h.day}</span>
                          <span className="ml-hh">{h.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {lat && lng && (
            <section className="ml-psec">
              <p className="ml-pl">FIND US</p>
              <div className="ml-hline-s" />
              <div className="ml-map">
                <CustomVenueMap lat={lat} lng={lng} title={venue.name} />
              </div>
              <div className="ml-krow">
                <span className="ml-k">
                  <MapPin className="w-3 h-3" style={{ display: "inline" }} /> MAPS
                </span>
                <span className="ml-v">
                  <a
                    href={`https://maps.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    OPEN IN GOOGLE MAPS{" "}
                    <ExternalLink className="w-3 h-3" style={{ display: "inline" }} />
                  </a>
                </span>
              </div>
            </section>
          )}

          {(social?.instagram || social?.whatsapp || social?.email) && (
            <section className="ml-psec">
              <p className="ml-pl">FOLLOW</p>
              <div>
                {social?.instagram && (
                  <div className="ml-krow">
                    <span className="ml-k">INSTAGRAM</span>
                    <span className="ml-v">
                      <a href={social.instagram} target="_blank" rel="noopener noreferrer">
                        @{social.instagram.replace(/\/+$/, "").split("/").pop()}
                      </a>
                    </span>
                  </div>
                )}
                {social?.whatsapp && (
                  <div className="ml-krow">
                    <span className="ml-k">WHATSAPP</span>
                    <span className="ml-v">
                      <a
                        href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.whatsapp}
                      </a>
                    </span>
                  </div>
                )}
                {social?.email && (
                  <div className="ml-krow">
                    <span className="ml-k">EMAIL</span>
                    <span className="ml-v">
                      <a href={`mailto:${social.email}`}>{social.email}</a>
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="ml-pcta">
          <Link href={menuUrl} className="ml-view">
            VIEW FULL MENU <ArrowUpRight className="w-4 h-4" />
          </Link>
          <button className="ml-close2" onClick={close}>
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
