"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useLocale } from "next-intl";
import CustomVenueMap from "./CustomVenueMap";
import { api } from "@/convex-helpers-api";
import {
  X,
  MapPin,
  Clock,
  ArrowUpRight,
  Instagram,
  MessageCircle,
  Mail,
  UtensilsCrossed,
  ExternalLink,
} from "lucide-react";
import { buildMenuUrl } from "@/lib/routes";

// ─────────────────────────────────────────────────────────────────────────────
// iOS-style glassmorphic venue gallery — green & white.
// Structure, data flow, popup + Google Maps are unchanged from before; only the
// visual layer (frosted glass surfaces, green accents, light canvas) is new.
// ─────────────────────────────────────────────────────────────────────────────

// iOS system green — the single accent colour used throughout.
const GREEN = "#34C759";
const GREEN_DEEP = "#15803d";

// ── Types ─────────────────────────────────────────────────────────────────────

type OrgCard = {
  _id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
};

type OrgDetail = {
  organization: {
    name: string;
    logoUrl: string | null;
    currency: string;
    storefrontConfig?: {
      address?: string | Record<string, string>;
      cityStateZip?: string | Record<string, string>;
      coverImageUrl?: string;
      heroImageUrls?: string[];
      heroHeadline?: string | Record<string, string>;
      heroSubheadline?: string | Record<string, string>;
    } | null;
    operatingHours?: Array<{ day: string; hours: string }> | null;
    socialLinks?: {
      instagram?: string;
      whatsapp?: string;
      email?: string;
    } | null;
    themeSettings?: {
      primaryColor?: string;
    } | null;
  };
  venue?: {
    lat: number;
    lng: number;
  };
  categories: Array<{
    _id: string;
    name: Record<string, string>;
    items: Array<{ _id: string; name: Record<string, string> }>;
  }>;
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800";

// ── Helper: extract string from translated field ──────────────────────────────
function t(field: string | Record<string, string> | undefined): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field["en"] ?? field["ka"] ?? Object.values(field)[0] ?? "";
}

// Shared frosted-glass tile (light iOS material)
const GLASS_TILE =
  "bg-white/55 backdrop-blur-xl border border-white/70 shadow-[0_6px_24px_rgba(16,120,60,0.08)]";

// ── Venue Detail Popup ────────────────────────────────────────────────────────

function VenuePopup({
  slug,
  card,
  onClose,
}: {
  slug: string;
  card: OrgCard;
  onClose: () => void;
}) {
  const locale = useLocale();
  const detail = useQuery(api.publicMenu.get, { slug }) as OrgDetail | null | undefined;
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on ESC + lock body scroll
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const org = detail?.organization;
  const coverImage =
    org?.storefrontConfig?.coverImageUrl ??
    org?.storefrontConfig?.heroImageUrls?.[0] ??
    card.imageUrl ??
    null;

  const address = t(org?.storefrontConfig?.address);
  const cityStateZip = t(org?.storefrontConfig?.cityStateZip);
  const fullAddress = [address, cityStateZip].filter(Boolean).join(", ");
  const hours = org?.operatingHours ?? [];
  const social = org?.socialLinks;
  const displayName = org?.name ?? card.name;
  const headline = t(org?.storefrontConfig?.heroHeadline) || displayName;
  const subline = t(org?.storefrontConfig?.heroSubheadline);

  const menuUrl = buildMenuUrl(locale, slug);

  if (!mounted) return null;

  return createPortal(
    // Overlay — soft green-tinted dark blur
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background: "rgba(6,20,12,0.55)",
        backdropFilter: "blur(16px) saturate(120%)",
        WebkitBackdropFilter: "blur(16px) saturate(120%)",
      }}
    >
      {/* Modal — frosted white glass */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-t-[32px] sm:rounded-[32px] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={displayName}
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow:
            "0 30px 80px rgba(6,40,20,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Hero image */}
        <div className="relative w-full h-52 sm:h-64 shrink-0 overflow-hidden rounded-t-[32px]">
          <Image
            src={coverImage ?? PLACEHOLDER}
            alt={`${displayName} interior`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/85 via-white/10 to-transparent" />

          {/* Close button — glass */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/60 backdrop-blur-md border border-white/70 flex items-center justify-center text-emerald-900/70 hover:text-emerald-900 hover:bg-white/80 transition-all z-10 shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-5 sm:p-7 -mt-6 relative">
          {/* Name & headline */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-[0.2em] uppercase mb-3 border"
              style={{
                background: "rgba(52,199,89,0.14)",
                borderColor: "rgba(52,199,89,0.3)",
                color: GREEN_DEEP,
              }}
            >
              <UtensilsCrossed className="w-2.5 h-2.5" />
              Venue
            </span>
            <h2 className="text-3xl font-black tracking-tighter text-zinc-900 leading-none">
              {headline}
            </h2>
            {subline && (
              <p className="mt-1.5 text-zinc-500 text-sm font-light">{subline}</p>
            )}
          </div>

          {/* Loading skeleton */}
          {detail === undefined && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-emerald-900/10 rounded-full w-3/4" />
              <div className="h-4 bg-emerald-900/10 rounded-full w-1/2" />
              <div className="h-32 bg-emerald-900/[0.06] rounded-2xl w-full" />
            </div>
          )}

          {detail !== undefined && (
            <>
              {/* Info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Address */}
                {fullAddress && (
                  <div className={`${GLASS_TILE} rounded-2xl p-4 flex flex-col justify-center space-y-2`}>
                    <p className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase font-semibold" style={{ color: GREEN_DEEP }}>
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-zinc-700 text-sm font-normal leading-snug">
                      {fullAddress}
                    </p>
                  </div>
                )}

                {/* Hours */}
                {hours.length > 0 && (
                  <div className={`${GLASS_TILE} rounded-2xl p-4 space-y-2`}>
                    <p className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase font-semibold mb-1" style={{ color: GREEN_DEEP }}>
                      <Clock className="w-3 h-3" /> Hours
                    </p>
                    <dl className="space-y-1">
                      {hours.map(({ day, hours: h }) => (
                        <div key={day} className="flex justify-between gap-3">
                          <dt className="text-zinc-400 text-[11px] font-light">{day}</dt>
                          <dd className="text-zinc-700 text-[11px] font-medium text-right">{h}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>

              {/* Social links */}
              {(social?.instagram || social?.whatsapp || social?.email) && (
                <div className="flex flex-wrap gap-2">
                  {social?.instagram && (
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-[10px] text-zinc-600 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <Instagram className="w-3 h-3" /> Instagram
                    </a>
                  )}
                  {social?.whatsapp && (
                    <a
                      href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-[10px] text-zinc-600 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  )}
                  {social?.email && (
                    <a
                      href={`mailto:${social.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 text-[10px] text-zinc-600 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-sm"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  )}
                </div>
              )}

              {/* Gallery strip */}
              {org?.storefrontConfig?.heroImageUrls && org.storefrontConfig.heroImageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {org.storefrontConfig.heroImageUrls.slice(0, 5).map((src, i) => (
                    <div
                      key={i}
                      className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-white/70 shadow-sm"
                    >
                      <Image
                        src={src}
                        alt={`${displayName} photo ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Map & Directions */}
              {(detail?.venue?.lat || fullAddress) && (
                <div className="flex flex-col gap-3 mt-2">
                  {detail?.venue?.lat && detail?.venue?.lng && (
                    <div
                      className="w-full h-64 sm:h-80 rounded-[22px] overflow-hidden relative"
                      style={{
                        border: "1px solid rgba(255,255,255,0.7)",
                        boxShadow: "0 8px 30px rgba(16,120,60,0.15)",
                      }}
                    >
                      <CustomVenueMap
                        lat={detail.venue.lat}
                        lng={detail.venue.lng}
                        title={displayName}
                      />
                    </div>
                  )}

                  <a
                    href={
                      detail?.venue?.lat && detail?.venue?.lng
                        ? `https://maps.google.com/maps?q=${detail.venue.lat},${detail.venue.lng}`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress + ", Tbilisi, Georgia")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-2xl bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/70 flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 hover:text-emerald-800 transition-all group shadow-sm"
                  >
                    <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: GREEN }} />
                    Open in Google Maps
                    <ExternalLink className="w-3 h-3 ml-1 opacity-40" />
                  </a>
                </div>
              )}
            </>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/60 mt-2">
            <Link
              href={menuUrl}
              className="flex-1 w-full sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-6 text-white text-sm font-bold tracking-widest uppercase rounded-full hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DEEP})`,
                boxShadow: "0 10px 30px rgba(52,199,89,0.4)",
              }}
            >
              View Menu
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-4 px-6 text-sm font-medium text-zinc-600 bg-white/50 backdrop-blur-md border border-white/70 rounded-full hover:text-zinc-900 hover:bg-white/70 transition-all shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Venue Card ────────────────────────────────────────────────────────────────

function VenueCard({
  org,
  onOpen,
}: {
  org: OrgCard;
  onOpen: (org: OrgCard) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const isValidImage = org.imageUrl && org.imageUrl.trim() !== "" && !imgError;

  const mockedRating = "4.8";
  const mockedDietaryTags = ["Vegan", "Gluten-Free", "Keto"];

  return (
    <button
      onClick={() => onOpen(org)}
      className="group relative w-full aspect-[4/5] rounded-[30px] overflow-hidden block text-left cursor-pointer transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 hover:-translate-y-1"
      style={{
        border: "1px solid rgba(255,255,255,0.7)",
        boxShadow: "0 12px 40px rgba(16,120,60,0.12)",
      }}
      aria-label={`Open details for ${org.name}`}
    >
      {/* Cover image or fallback */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-50 to-white flex flex-col items-center justify-center">
        {!isValidImage ? (
          <div className="flex flex-col items-center justify-center opacity-70 group-hover:scale-105 transition-transform duration-700">
            <UtensilsCrossed className="w-10 h-10 mb-3" style={{ color: GREEN }} />
            <div className="w-8 h-px bg-emerald-500/30 mb-2" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-emerald-800/70 font-medium">
              Shemoqmedi Venue
            </span>
          </div>
        ) : (
          <Image
            src={org.imageUrl!}
            alt={`${org.name} — venue cover`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Top-row floating chips (Live + rating) */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/55 backdrop-blur-md border border-white/70 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
          <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-emerald-900/80">
            Live
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-900/80 bg-white/55 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/70 shadow-sm">
          <span style={{ color: GREEN }}>★</span> {mockedRating}
        </span>
      </div>

      {/* Bottom frosted glass info panel — the iOS widget look */}
      <div className="absolute inset-x-3 bottom-3 z-10">
        <div
          className="rounded-[22px] p-4 flex flex-col gap-2.5 transition-all duration-500"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.75)",
            boxShadow: "0 8px 24px rgba(6,40,20,0.14), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg sm:text-xl text-zinc-900 font-bold leading-tight tracking-tight truncate">
              {org.name}
            </h3>
            <span
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
              style={{ background: GREEN, boxShadow: "0 4px 14px rgba(52,199,89,0.5)" }}
            >
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {mockedDietaryTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-semibold"
                style={{
                  background: "rgba(52,199,89,0.12)",
                  color: GREEN_DEEP,
                  border: "1px solid rgba(52,199,89,0.22)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────

export default function VenueLandingSection() {
  const organizations = useQuery(api.publicMenu.listOrganizations) as OrgCard[] | undefined;
  const [activeVenue, setActiveVenue] = useState<OrgCard | null>(null);

  const openVenue = useCallback((org: OrgCard) => setActiveVenue(org), []);
  const closeVenue = useCallback(() => setActiveVenue(null), []);

  return (
    <>
      <section
        id="venues"
        className="relative z-10 w-full overflow-hidden px-6 py-20 md:pt-32 md:pb-24"
        style={{
          background:
            "linear-gradient(180deg, #ffffff 0%, #f2fbf5 40%, #eafaf0 100%)",
        }}
      >
        {/* Soft green glow blobs behind the glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(circle, rgba(52,199,89,0.28), transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full blur-3xl opacity-50"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.22), transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <div className="mb-14 md:mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <p
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase font-semibold mb-4 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/70 shadow-sm"
                style={{ color: GREEN_DEEP }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                Powered by Voloo
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900 leading-none">
                Our Venues
              </h2>
            </div>
            <p className="text-zinc-500 text-sm font-normal max-w-xs text-left md:text-right leading-relaxed">
              Tap any venue to explore its menu, location, and opening hours.
            </p>
          </div>

          {/* Loading skeleton */}
          {organizations === undefined && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-[30px] bg-white/50 border border-white/70 animate-pulse shadow-sm"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {organizations !== undefined && organizations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-px bg-emerald-500/30" />
              <p className="text-emerald-900/40 text-sm font-medium tracking-widest uppercase">
                No venues yet
              </p>
            </div>
          )}

          {/* Grid */}
          {organizations !== undefined && organizations.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {organizations.map((org) => (
                  <VenueCard key={org._id} org={org} onOpen={openVenue} />
                ))}
              </div>

              {/* Count */}
              <div className="mt-14 flex items-center gap-4">
                <div className="flex-1 h-px bg-emerald-900/[0.08]" />
                <p className="text-[10px] tracking-[0.3em] uppercase text-emerald-900/40 font-semibold shrink-0">
                  {organizations.length} {organizations.length === 1 ? "Venue" : "Venues"} Onboarded
                </p>
                <div className="flex-1 h-px bg-emerald-900/[0.08]" />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Popup portal */}
      {activeVenue && (
        <VenuePopup
          slug={activeVenue.slug}
          card={activeVenue}
          onClose={closeVenue}
        />
      )}
    </>
  );
}
