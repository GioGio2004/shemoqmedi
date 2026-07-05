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
  Star,
  MapPin,
  Clock,
  Phone,
  ArrowUpRight,
  Instagram,
  MessageCircle,
  Mail,
  UtensilsCrossed,
  ExternalLink,
} from "lucide-react";
import { buildMenuUrl } from "@/lib/routes";

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

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    
    // Calculate the scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Lock body scroll and apply padding
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [onClose]);

  // Click outside to close
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
    // Overlay
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
    >
      {/* Modal */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-zinc-950 border border-white/[0.09] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={displayName}
      >
        {/* Hero image */}
        <div className="relative w-full h-52 sm:h-64 shrink-0 overflow-hidden rounded-t-3xl">
          <Image
            src={coverImage ?? PLACEHOLDER}
            alt={`${displayName} interior`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 p-5 sm:p-7">

          {/* Name & headline */}
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/[0.1] text-[9px] font-medium tracking-[0.2em] uppercase text-white/45 mb-3">
              <UtensilsCrossed className="w-2.5 h-2.5" />
              Venue
            </span>
            <h2 className="text-3xl font-black tracking-tighter text-white leading-none">
              {headline}
            </h2>
            {subline && (
              <p className="mt-1.5 text-white/40 text-sm font-light">{subline}</p>
            )}
          </div>

          {/* Loading skeleton */}
          {detail === undefined && (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-white/[0.06] rounded-full w-3/4" />
              <div className="h-4 bg-white/[0.06] rounded-full w-1/2" />
              <div className="h-32 bg-white/[0.04] rounded-xl w-full" />
            </div>
          )}

          {detail !== undefined && (
            <>
              {/* Info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Address (NO MAP HERE ANYMORE) */}
                {fullAddress && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col justify-center space-y-2">
                    <p className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-white/30 font-light">
                      <MapPin className="w-3 h-3" /> Location
                    </p>
                    <p className="text-white/70 text-sm font-light leading-snug">
                      {fullAddress}
                    </p>
                  </div>
                )}

                {/* Hours */}
                {hours.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-2">
                    <p className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] uppercase text-white/30 font-light mb-1">
                      <Clock className="w-3 h-3" /> Hours
                    </p>
                    <dl className="space-y-1">
                      {hours.map(({ day, hours: h }) => (
                        <div key={day} className="flex justify-between gap-3">
                          <dt className="text-white/35 text-[11px] font-light">{day}</dt>
                          <dd className="text-white/60 text-[11px] font-light text-right">{h}</dd>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      <Instagram className="w-3 h-3" /> Instagram
                    </a>
                  )}
                  {social?.whatsapp && (
                    <a
                      href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/50 hover:text-white hover:border-white/20 transition-all"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  )}
                  {social?.email && (
                    <a
                      href={`mailto:${social.email}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/50 hover:text-white hover:border-white/20 transition-all"
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
                      className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/[0.06]"
                    >
                      <Image
                        src={src}
                        alt={`${displayName} photo ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover opacity-70 hover:opacity-100 transition-opacity"
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
                    <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-white/[0.06] relative">
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
                    className="w-full py-4 px-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white transition-all group"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    Open in Google Maps
                    <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                  </a>
                </div>
              )}
            </>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-white/[0.05] mt-2">
            <Link
              href={menuUrl}
              className="flex-1 w-full sm:w-auto inline-flex items-center justify-center gap-2 py-4 px-6 bg-white text-black text-sm font-bold tracking-widest uppercase rounded-full hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              View Menu
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-4 px-6 text-sm font-medium text-white/60 border border-white/[0.1] rounded-full hover:text-white hover:bg-white/[0.02] hover:border-white/20 transition-all"
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
  // Consider missing if it's explicitly null/empty or doesn't look like a URL
  const isValidImage = org.imageUrl && org.imageUrl.trim() !== "" && !imgError;

  // Mock data for the new design
  const mockedRating = "⭐ 4.8 (120)";
  const mockedDietaryTags = ["Vegan", "Gluten-Free", "Keto"];

  return (
    <button
      onClick={() => onOpen(org)}
      className="group relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-[#0a0a0a] border border-white/10 hover:border-white/30 transition-colors duration-500 block text-left cursor-pointer hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      aria-label={`Open details for ${org.name}`}
    >
      {/* Cover image or Fallback */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a] flex flex-col items-center justify-center">
        {!isValidImage ? (
          <div className="flex flex-col items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-700 group-hover:scale-105">
            <UtensilsCrossed className="w-10 h-10 text-white mb-3" />
            <div className="w-8 h-px bg-white/20 mb-2" />
            <span className="text-[9px] tracking-[0.25em] uppercase text-white font-light">Shemoqmedi Venue</span>
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
        {/* Scrim gradient at the bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-5 sm:p-6 z-10 flex flex-col justify-end">
        {/* Content wrapper for slide-up animation */}
        <div className="flex flex-col gap-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-8">
          
          {/* Top Row: Live Indicator & Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/90">Live</span>
            </div>
            <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
              {mockedRating}
            </span>
          </div>

          {/* Middle Row: Title */}
          <h3 className="text-xl sm:text-2xl text-white font-semibold leading-tight tracking-tight">
            {org.name}
          </h3>

          {/* Bottom Row: Dietary Tags */}
          <div className="flex flex-wrap gap-2">
            {mockedDietaryTags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/5 text-[10px] uppercase tracking-wider text-white/80 font-medium shadow-sm">
                {tag}
              </span>
            ))}
          </div>

        </div>
        
        {/* View Menu reveal */}
        <div className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none">
          <p className="text-xs font-medium tracking-wide uppercase text-white/70 flex items-center gap-1">
            View Menu <ArrowUpRight className="w-3.5 h-3.5" />
          </p>
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
        className="relative z-10 w-full bg-black px-6 py-16 md:pt-32 md:pb-16 border-t border-white/[0.05]"
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-16 md:mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.45em] uppercase text-white/25 mb-4 font-light">
                Powered by Voloo
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-none uppercase">
                Our Venues
              </h2>
            </div>
            <p className="text-white/35 text-sm font-light max-w-xs text-left md:text-right leading-relaxed">
              Tap any venue to explore its menu, location, and opening hours.
            </p>
          </div>

          {/* Loading skeleton */}
          {organizations === undefined && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[300px] rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {organizations !== undefined && organizations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-px bg-white/10" />
              <p className="text-white/20 text-sm font-light tracking-widest uppercase">No venues yet</p>
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
              <div className="mt-12 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/[0.05]" />
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light shrink-0">
                  {organizations.length} {organizations.length === 1 ? "Venue" : "Venues"} Onboarded
                </p>
                <div className="flex-1 h-px bg-white/[0.05]" />
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
