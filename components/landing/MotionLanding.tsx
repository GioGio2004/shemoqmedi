"use client";

// components/landing/MotionLanding.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The Shemoqmedi landing — black & white, GSAP-driven motion, mobile-first.
//
//  • Masked line + character reveal on the hero headline (+ rotating word)
//  • Infinite marquee of venue names
//  • Horizontally-scrolling PINNED café catalogue (ScrollTrigger)
//  • Image grid that unveils via cover-wipe + blur-to-sharp on scroll
//  • Venue tap → full "portfolio" sheet (story, gallery, menu, hours, map)
//
// SEO: venue names + links are rendered as real anchors in the initial markup
// (this component is SSR'd by Next with the `venues` prop), so Google sees them
// before any JS runs. GSAP only *enhances* — `gsap.from()` means that if JS
// never executes, everything stays in its natural, visible state.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomVenueMap from "@/components/venues/CustomVenueMap";
import { api } from "@/convex-helpers-api";
import { buildMenuUrl } from "@/lib/routes";
import {
  X, MapPin, Clock, ArrowUpRight, Instagram, MessageCircle, Mail, ExternalLink,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────
export type LandingVenue = {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

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
    items: Array<{ _id: string; name: Record<string, string>; price: number; imageUrl?: string | null }>;
  }>;
};

const FALLBACKS = [
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=900",
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=900",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=900",
  "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=900",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=900",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900",
];
const img = (v: LandingVenue, i: number) => v.imageUrl || FALLBACKS[i % FALLBACKS.length];

// Varied aspect ratios → the Pinterest masonry look
const RATIOS = ["4/5", "3/4", "1/1", "4/6", "3/5", "5/4", "4/5", "2/3"];

function tField(field: string | Record<string, string> | undefined): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field["en"] ?? field["ka"] ?? Object.values(field)[0] ?? "";
}

// ── Portfolio sheet ───────────────────────────────────────────────────────────
function Portfolio({ venue, origin, onClose }: { venue: LandingVenue; origin: DOMRect; onClose: () => void }) {
  const locale = useLocale();
  const detail = useQuery(api.publicMenu.get, { slug: venue.slug }) as OrgDetail | null | undefined;
  const sheetRef = useRef<HTMLDivElement>(null);
  const bdRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  // Animated close — reverse the expand back into the tapped card, then unmount.
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const sheet = sheetRef.current, bd = bdRef.current;
    if (!sheet || !bd) return onClose();
    sheet.style.overflowY = "hidden";
    sheet.scrollTop = 0;
    gsap.timeline({ onComplete: onClose })
      .to(sheet, { top: origin.top, left: origin.left, width: origin.width, height: origin.height, borderRadius: 20, duration: 0.42, ease: "power3.inOut" }, 0)
      .to(bd, { opacity: 0, duration: 0.42, ease: "power2.inOut" }, 0);
  }, [origin, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  // iOS app-open: grow from the tapped card's exact rect to full screen.
  useLayoutEffect(() => {
    const sheet = sheetRef.current, bd = bdRef.current;
    if (!sheet || !bd) return;
    gsap.set(bd, { opacity: 0 });
    gsap.set(sheet, {
      position: "fixed", top: origin.top, left: origin.left, width: origin.width, height: origin.height,
      borderRadius: 20, margin: 0, maxWidth: "none", maxHeight: "none", overflow: "hidden", zIndex: 10000, opacity: 1,
    });
    const tl = gsap.timeline();
    tl.to(bd, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0)
      .to(sheet, {
        top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0,
        duration: 0.55, ease: "power3.inOut",
        onComplete() { sheet.style.overflowY = "auto"; sheet.style.width = "100%"; sheet.style.height = "100svh"; },
      }, 0);
    return () => { tl.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const org = detail?.organization;
  const cover = org?.storefrontConfig?.coverImageUrl ?? org?.storefrontConfig?.heroImageUrls?.[0] ?? venue.imageUrl ?? FALLBACKS[0];
  const address = [tField(org?.storefrontConfig?.address), tField(org?.storefrontConfig?.cityStateZip)].filter(Boolean).join(", ");
  const subline = tField(org?.storefrontConfig?.heroSubheadline);
  const hours = org?.operatingHours ?? [];
  const social = org?.socialLinks;
  const gallery = org?.storefrontConfig?.heroImageUrls ?? [];
  const signature = (detail?.categories ?? []).flatMap((c) => c.items).slice(0, 4);
  const menuUrl = buildMenuUrl(locale, venue.slug);
  const lat = detail?.venue?.lat, lng = detail?.venue?.lng;

  return createPortal(
    <div className="ml-bd" ref={bdRef} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="ml-sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label={venue.name}>
        <div className="ml-ph">
          <span className="ml-handle" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={venue.name} />
          <div className="ml-ph-grad" />
          <button className="ml-x" onClick={close} aria-label="Close"><X className="w-4 h-4" /></button>
          <div className="ml-cap">
            <span className="ml-vcat ml-mono">Venue · Tbilisi</span>
            <h2>{venue.name}</h2>
            {subline && <p className="ml-sub">{subline}</p>}
          </div>
        </div>

        <div className="ml-pb">
          {subline && (
            <section className="ml-psec">
              <p className="ml-pl ml-mono">About</p>
              <p className="ml-about">{subline}</p>
            </section>
          )}

          {gallery.length > 1 && (
            <section className="ml-psec">
              <p className="ml-pl ml-mono">Gallery</p>
              <div className="ml-gal">
                {gallery.slice(0, 6).map((g, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={g} alt="" loading="lazy" />
                ))}
              </div>
            </section>
          )}

          {signature.length > 0 && (
            <section className="ml-psec">
              <p className="ml-pl ml-mono">Signature menu</p>
              <div className="ml-items">
                {signature.map((it) => (
                  <div key={it._id} className="ml-item">
                    {it.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.imageUrl} alt="" loading="lazy" />
                    )}
                    <div>
                      <div className="ml-nm">{tField(it.name)}</div>
                      <div className="ml-pr">₾{((it.price ?? 0) / 100).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="ml-psec">
            <div className="ml-tiles">
              {address && (
                <div className="ml-tile">
                  <p className="ml-tl ml-mono"><MapPin className="w-3 h-3" /> Location</p>
                  <p className="ml-tv">{address}</p>
                </div>
              )}
              {hours.length > 0 && (
                <div className="ml-tile">
                  <p className="ml-tl ml-mono"><Clock className="w-3 h-3" /> Hours</p>
                  {hours.map((h) => (
                    <div key={h.day} className="ml-hr"><span>{h.day}</span><span className="ml-hh">{h.hours}</span></div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {lat && lng && (
            <section className="ml-psec">
              <p className="ml-pl ml-mono">Find us</p>
              <div className="ml-map"><CustomVenueMap lat={lat} lng={lng} title={venue.name} /></div>
              <a className="ml-dir" href={`https://maps.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer">
                <MapPin className="w-4 h-4" /> Open in Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </section>
          )}

          {(social?.instagram || social?.whatsapp || social?.email) && (
            <section className="ml-psec">
              <p className="ml-pl ml-mono">Follow</p>
              <div className="ml-social">
                {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-3 h-3" /> Instagram</a>}
                {social?.whatsapp && <a href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-3 h-3" /> WhatsApp</a>}
                {social?.email && <a href={`mailto:${social.email}`}><Mail className="w-3 h-3" /> Email</a>}
              </div>
            </section>
          )}
        </div>

        <div className="ml-pcta">
          <Link href={menuUrl} className="ml-view">View Full Menu <ArrowUpRight className="w-4 h-4" /></Link>
          <button className="ml-close2" onClick={close}>Close</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Landing ─────────────────────────────────────────────────────────────────
export default function MotionLanding({ venues, locale }: { venues: LandingVenue[]; locale: string }) {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<{ venue: LandingVenue; origin: DOMRect } | null>(null);
  const open = useCallback(
    (v: LandingVenue, el: HTMLElement) => setActive({ venue: v, origin: el.getBoundingClientRect() }),
    [],
  );

  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Split [data-split] elements into character spans
      root.current!.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
        const text = el.textContent ?? "";
        el.textContent = "";
        [...text].forEach((c) => {
          const s = document.createElement("span");
          s.className = "ml-ch";
          s.textContent = c === " " ? " " : c;
          el.appendChild(s);
        });
      });

      // Hero reveal
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      root.current!.querySelectorAll(".ml-hero [data-split]").forEach((el, i) => {
        heroTl.from(el.querySelectorAll(".ml-ch"), { yPercent: 118, rotate: 5, duration: 1.1, stagger: 0.028 }, i * 0.1);
      });
      heroTl.from(".ml-eye", { opacity: 0, y: 14, duration: 0.7 }, 0)
        .from("[data-lead]", { yPercent: 120, opacity: 0, duration: 1, ease: "power3.out" }, 0.45)
        .from(".ml-hbtns > *", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.7);

      // Marquee
      gsap.to(".ml-mtrack", { xPercent: -50, repeat: -1, duration: 22, ease: "none" });

      // Section headings
      gsap.utils.toArray<HTMLElement>("[data-h2]").forEach((h) => {
        gsap.from(h, { opacity: 0, y: 40, duration: 1, ease: "power3.out", scrollTrigger: { trigger: h, start: "top 82%" } });
      });

      // Masonry cover-wipe + blur-to-sharp reveal
      gsap.utils.toArray<HTMLElement>(".ml-reveal").forEach((item) => {
        const cover = item.querySelector(".ml-cover");
        const image = item.querySelector("img");
        const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 90%" } });
        if (image) tl.set(image, { filter: "blur(16px)", scale: 1.3 });
        if (cover) tl.to(cover, { yPercent: -101, duration: 1, ease: "power4.inOut" });
        if (image) tl.to(image, { scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" }, 0.1);
      });

      setTimeout(() => ScrollTrigger.refresh(), 400);
    }, root);

    return () => ctx.revert();
  }, [venues.length]);

  return (
    <main ref={root} className="ml-root">
      <style>{ML_CSS}</style>

      {/* NAV */}
      <nav className="ml-nav">
        <div className="ml-navbar">
          <span className="ml-brand">VOL<span style={{ opacity: 0.5 }}>OO</span></span>
          <div className="ml-nlinks">
            <a href="#venues">Venues</a><a href="#cta">Contact</a>
          </div>
          <a href="#cta" className="ml-btn">Get Started</a>
        </div>
      </nav>

      {/* HERO */}
      <section className="ml-hero">
        <div className="ml-wrap">
          <div className="ml-eye"><span className="ml-d" /><span className="ml-mono">NFC · AI · TBILISI</span></div>
          <h1>
            <span className="ml-hline"><span className="ml-inner" data-split>Menus</span></span>
            <span className="ml-hline"><span className="ml-inner" data-split>that feel</span></span>
            <span className="ml-hline"><span className="ml-inner" data-split>alive.</span></span>
          </h1>
          <p className="ml-lead"><span data-lead>One tap on the table. No app, no wait — just your café, in motion, on every phone.</span></p>
          <div className="ml-hbtns">
            <a href="#venues" className="ml-btn-l">Explore venues →</a>
            <a href="#cta" className="ml-btn-o">Onboard your venue</a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="ml-marq">
        <div className="ml-mtrack">
          {[0, 1].map((k) => (
            <span key={k} className="ml-mset">
              {(venues.length ? venues : Array.from({ length: 6 })).map((v: any, i) => (
                <span key={i}>{v?.name ?? "Shemoqmedi"} ·&nbsp;</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* VENUES — Pinterest masonry (crawlable links) */}
      <section className="ml-sec" id="venues">
        <div className="ml-wrap">
          <div className="ml-lbl ml-mono">Powered by Voloo</div>
          <h2 data-h2>Our Venues<br /><span className="ml-m">unveiled on scroll.</span></h2>
          <div className="ml-grid">
            {(venues.length ? venues : []).map((v, i) => (
              <div key={v._id} className="ml-reveal" style={{ aspectRatio: RATIOS[i % RATIOS.length] }}>
                <button className="ml-reveal-btn" onClick={(e) => open(v, e.currentTarget)} aria-label={`Open ${v.name}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(v, i)} alt={v.name} />
                  <div className="ml-rgrad" />
                  <span className="ml-rcap">{v.name}</span>
                  <div className="ml-cover" />
                </button>
                {/* Real crawlable link for SEO */}
                <Link href={buildMenuUrl(locale, v.slug)} className="ml-seo-link">{v.name} menu</Link>
              </div>
            ))}
          </div>
          {venues.length === 0 && (
            <div className="ml-empty ml-mono">Venues coming soon</div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="ml-sec" id="cta">
        <div className="ml-wrap">
          <div className="ml-cta">
            <h2>Make your venue<br /><span className="ml-under">unforgettable.</span></h2>
            <p>We onboard cafés &amp; restaurants across Georgia — hardware, menu &amp; AI, done for you.</p>
            <a href="mailto:hello@shemoqmedi.space" className="ml-btn-l">Start now →</a>
          </div>
        </div>
      </section>

      <footer className="ml-footer">
        <div className="ml-wrap ml-foot">
          <span className="ml-brand ml-mono">VOLOO · SHEMOQMEDI</span>
          <span className="ml-fmut">© {new Date().getFullYear()} · Made in Georgia 🇬🇪</span>
        </div>
      </footer>

      {active && <Portfolio venue={active.venue} origin={active.origin} onClose={() => setActive(null)} />}
    </main>
  );
}

// ── Scoped styles ─────────────────────────────────────────────────────────────
const ML_CSS = `
.ml-root{--bg:#0a0a0a;--ink:#fff;--mut:rgba(255,255,255,.5);--faint:rgba(255,255,255,.28);--line:rgba(255,255,255,.12);
  background:var(--bg);color:var(--ink);position:relative;overflow-x:hidden;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Inter,sans-serif;-webkit-font-smoothing:antialiased}
.ml-root a{text-decoration:none}
.ml-mono{font-family:ui-monospace,"SF Mono",Menlo,monospace}
.ml-wrap{max-width:1160px;margin:0 auto;padding:0 24px}
.ml-root ::selection{background:#fff;color:#000}

.ml-nav{position:fixed;top:max(14px,env(safe-area-inset-top));left:0;right:0;z-index:50;display:flex;justify-content:center;padding:0 16px}
.ml-navbar{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;max-width:720px;padding:10px 10px 10px 20px;border-radius:999px;background:rgba(255,255,255,.05);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--line)}
.ml-brand{font-weight:800;letter-spacing:.18em;font-size:14px}
.ml-nlinks{display:none;gap:24px}.ml-nlinks a{font-size:13px;color:var(--mut)}.ml-nlinks a:hover{color:#fff}
.ml-btn{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:13px;padding:10px 18px;border-radius:999px;background:#fff;color:#000;transition:.25s}
.ml-btn:hover{transform:translateY(-1px)}
@media(min-width:720px){.ml-nlinks{display:flex}}

.ml-hero{min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding:120px 0 60px}
.ml-eye{font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:var(--mut);margin-bottom:30px;display:flex;gap:10px;align-items:center}
.ml-eye .ml-d{width:6px;height:6px;border-radius:999px;background:#fff}
.ml-hero h1{font-size:clamp(52px,14vw,150px);line-height:.86;font-weight:850;letter-spacing:-.05em}
.ml-hline{overflow:hidden;display:block}
.ml-inner{display:block}
.ml-ch{display:inline-block;will-change:transform}
.ml-lead{margin-top:30px;max-width:440px;color:var(--mut);font-size:17px;overflow:hidden}
.ml-lead span{display:inline-block}
.ml-hbtns{margin-top:36px;display:flex;gap:12px;flex-wrap:wrap}
.ml-btn-l{display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:15px;padding:15px 26px;border-radius:999px;background:#fff;color:#000;transition:.25s}
.ml-btn-l:hover{transform:translateY(-2px)}
.ml-btn-o{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:15px 26px;border-radius:999px;border:1px solid var(--line);color:#fff;transition:.25s}
.ml-btn-o:hover{border-color:#fff;background:rgba(255,255,255,.05)}

.ml-marq{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:20px 0;overflow:hidden;margin-top:10px}
.ml-mtrack{display:flex;width:max-content}
.ml-mset{display:flex;white-space:nowrap;font-size:22px;font-weight:600;color:var(--faint)}

.ml-sec{padding:100px 0}
.ml-lbl{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--mut);font-weight:700;margin-bottom:18px;display:flex;gap:10px;align-items:center}
.ml-lbl::before{content:"";width:22px;height:1px;background:#fff}
.ml-sec h2,.ml-cta h2{font-size:clamp(30px,6vw,58px);font-weight:820;letter-spacing:-.03em;line-height:1.02}
.ml-m{color:var(--faint)}

.ml-grid{margin-top:52px;column-count:2;column-gap:14px}
@media(min-width:700px){.ml-grid{column-count:3}}
@media(min-width:1040px){.ml-grid{column-count:4}}
.ml-reveal{position:relative;border-radius:18px;overflow:hidden;margin-bottom:14px;break-inside:avoid;width:100%}
.ml-reveal-btn{position:absolute;inset:0;padding:0;border:0;background:none;cursor:pointer;width:100%;height:100%}
.ml-reveal img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;will-change:transform}
.ml-rgrad{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.62),transparent 45%);z-index:1;pointer-events:none}
.ml-rcap{position:absolute;left:15px;bottom:13px;right:15px;z-index:2;font-size:16px;font-weight:700;letter-spacing:-.01em;color:#fff;text-shadow:0 1px 12px rgba(0,0,0,.55)}
.ml-cover{position:absolute;inset:0;background:var(--bg);z-index:3}
.ml-seo-link{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ml-empty{color:var(--faint);text-align:center;padding:60px 0;letter-spacing:.2em;text-transform:uppercase;font-size:12px}

.ml-cta{margin-top:20px;padding:70px 26px;border-radius:32px;text-align:center;background:rgba(255,255,255,.03);border:1px solid var(--line)}
.ml-cta p{margin:16px auto 28px;max-width:400px;color:var(--mut)}
.ml-under{text-decoration:underline;text-underline-offset:8px;text-decoration-thickness:2px}

.ml-footer{border-top:1px solid var(--line);padding:44px 0;margin-top:40px}
.ml-foot{display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;font-size:13px;color:var(--mut)}
.ml-fmut{color:var(--mut)}

/* Portfolio sheet */
.ml-bd{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(4,6,5,.72);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
@media(min-width:720px){.ml-bd{align-items:center;padding:20px}}
.ml-sheet{width:100%;max-width:660px;max-height:94svh;overflow-y:auto;border-radius:28px 28px 0 0;background:rgba(14,14,14,.9);backdrop-filter:blur(40px) saturate(160%);-webkit-backdrop-filter:blur(40px) saturate(160%);border:1px solid rgba(255,255,255,.12);box-shadow:0 -20px 80px rgba(0,0,0,.6);color:#fff}
@media(min-width:720px){.ml-sheet{border-radius:28px}}
.ml-sheet::-webkit-scrollbar{display:none}.ml-sheet{scrollbar-width:none}
.ml-ph{position:relative;height:240px;overflow:hidden;border-radius:28px 28px 0 0}
.ml-ph img{width:100%;height:100%;object-fit:cover}
.ml-ph-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(14,14,14,1),transparent 65%)}
.ml-handle{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:38px;height:4px;border-radius:999px;background:rgba(255,255,255,.3)}
.ml-x{position:absolute;top:15px;right:15px;width:36px;height:36px;border-radius:999px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.15);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer}
.ml-cap{position:absolute;left:22px;bottom:16px;right:22px}
.ml-cap .ml-vcat{display:inline-flex;gap:6px;font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);padding:4px 10px;border-radius:999px;margin-bottom:8px}
.ml-cap h2{font-size:30px;font-weight:850;letter-spacing:-.03em}
.ml-cap .ml-sub{font-size:13px;color:var(--mut);margin-top:3px}
.ml-pb{padding:22px}
.ml-psec{margin-bottom:24px}
.ml-pl{font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:var(--mut);font-weight:700;margin-bottom:12px}
.ml-about{color:var(--mut);font-size:15px;line-height:1.7}
.ml-gal{display:flex;gap:10px;overflow-x:auto;margin:0 -22px;padding:0 22px 4px}
.ml-gal::-webkit-scrollbar{display:none}.ml-gal{scrollbar-width:none}
.ml-gal img{width:128px;height:158px;object-fit:cover;border-radius:16px;flex-shrink:0;border:1px solid var(--line)}
.ml-items{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:520px){.ml-items{grid-template-columns:1fr}}
.ml-item{display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid var(--line)}
.ml-item img{width:50px;height:50px;border-radius:12px;object-fit:cover}
.ml-nm{font-size:13px;font-weight:700}.ml-pr{font-size:12px;color:var(--mut);font-weight:700}
.ml-tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:520px){.ml-tiles{grid-template-columns:1fr}}
.ml-tile{padding:16px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid var(--line)}
.ml-tl{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--mut);font-weight:700;margin-bottom:10px;display:flex;gap:6px;align-items:center}
.ml-tv{font-size:13px;color:var(--mut);line-height:1.5}
.ml-hr{display:flex;justify-content:space-between;font-size:12px;padding:2px 0;color:var(--faint)}
.ml-hh{color:#fff;font-weight:600}
.ml-map{height:200px;border-radius:18px;overflow:hidden;border:1px solid var(--line);position:relative}
.ml-dir{margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid var(--line);font-size:14px;font-weight:600;color:#fff}
.ml-social{display:flex;gap:8px;flex-wrap:wrap}
.ml-social a{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mut);padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line)}
.ml-social a:hover{color:#fff}
.ml-pcta{position:sticky;bottom:0;padding:14px 22px calc(14px + env(safe-area-inset-bottom));display:flex;gap:12px;background:linear-gradient(to top,rgba(14,14,14,1),transparent);border-top:1px solid var(--line)}
.ml-view{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:#000;font-weight:800;padding:16px;border-radius:999px}
.ml-close2{padding:16px 22px;border-radius:999px;border:1px solid var(--line);background:none;color:#fff;font-weight:600;cursor:pointer}
`;
