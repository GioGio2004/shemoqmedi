// ruled-menu/rm-css.ts
// ─────────────────────────────────────────────────────────────────────────────
// Scoped stylesheet for the RULED "Signature" menu template — injected once by
// RuledMenuView inside <style>. Everything is namespaced under .rm-root so it
// can never leak into the landing or the other menu templates.
//
// Follows the ml-css.ts architecture: numbered blocks, static --v-* tokens
// (this tree lives OUTSIDE .ml-root), contextual --v-c-* consumed inside
// [data-theme="bone"] sections so light blocks flip automatically.
// Lines are 1px ELEMENTS (globals.css .v-line-x/.v-line-y), radius is
// var(--v-radius), one accent only (overridable via --v-accent on .rm-root).
// ─────────────────────────────────────────────────────────────────────────────

export const RM_CSS = /* css */ `
/* ═══ 1. Root & layout ════════════════════════════════════════════════════ */

.rm-root {
  background: var(--v-bg);
  color: var(--v-ink);
  min-height: 100svh;
  font-family: var(--v-font-body);
  overflow-x: clip;
}

.rm-wrap {
  width: min(100% - 2 * var(--v-pad, clamp(20px, 4vw, 64px)), 1440px);
  margin-inline: auto;
}

.rm-sec {
  padding-block: clamp(72px, 11vh, 140px);
  position: relative;
}

.rm-sec[data-theme="bone"] {
  background: var(--v-bone);
  color: var(--v-ink-inv);
}

/* ═══ 2. Nav ══════════════════════════════════════════════════════════════ */

.rm-nav {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 60;
  transition: background-color 0.4s ease;
  background: transparent;
}

.rm-nav.is-scrolled {
  background: color-mix(in srgb, var(--v-bg) 85%, transparent);
  backdrop-filter: blur(8px);
}

.rm-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 60px;
}

.rm-nav-line {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--v-line);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.rm-nav.is-scrolled .rm-nav-line { transform: scaleX(1); }

/* Category rail (scroll-spy) — desktop inline, mobile its own strip.
 * NO display property here: this <style> is injected after Tailwind's
 * stylesheet, so declaring flex would override the responsive hidden/flex
 * utilities the JSX uses to show/hide the rails (it did — doubled rails). */
.rm-nav-cats {
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.rm-nav-cats::-webkit-scrollbar { display: none; }

.rm-nav-cat {
  position: relative;
  white-space: nowrap;
  color: var(--v-faint);
  transition: color 0.3s ease;
  padding-block: 6px;
}
.rm-nav-cat:hover { color: var(--v-ink); }
.rm-nav-cat.is-active { color: var(--v-accent); }

.rm-nav-cat::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  height: 1px;
  width: 100%;
  background: var(--v-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.rm-nav-cat.is-active::after { transform: scaleX(1); }

/* ═══ 3. Hero ═════════════════════════════════════════════════════════════ */

.rm-hero {
  position: relative;
  min-height: 92svh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-block: 96px clamp(28px, 5vh, 56px);
}

.rm-hero-name {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: clamp(2.9rem, 12.5vw, 10rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-wrap: balance;
  text-transform: uppercase;
}
.rm-hero-name:lang(ka) { letter-spacing: -0.015em; }

.rm-hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px 28px;
  margin-top: clamp(18px, 3vh, 32px);
}

.rm-hero-cover {
  position: absolute;
  right: var(--v-pad, clamp(20px, 4vw, 64px));
  top: clamp(84px, 12vh, 132px);
  width: min(34vw, 460px);
  aspect-ratio: 3 / 4;
  display: none;
}
@media (min-width: 1024px) { .rm-hero-cover { display: block; } }

.rm-hero-cover-m {
  width: 100%;
  aspect-ratio: 4 / 3;
  margin-top: 28px;
}
@media (min-width: 1024px) { .rm-hero-cover-m { display: none; } }

.rm-hero-ticks {
  position: absolute;
  left: var(--v-pad, clamp(20px, 4vw, 64px));
  top: clamp(84px, 12vh, 132px);
  display: none;
}
@media (min-width: 1280px) { .rm-hero-ticks { display: block; } }

/* ═══ 4. Ticker ═══════════════════════════════════════════════════════════ */

.rm-ticker { padding-block: 14px; }
.rm-ticker .v-marquee-track { gap: 40px; padding-inline: 20px; }
.rm-ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 40px;
  white-space: nowrap;
}

/* ═══ 5. Featured strip ═══════════════════════════════════════════════════ */

.rm-feat-viewport { overflow: hidden; cursor: grab; }
.rm-feat-viewport:active { cursor: grabbing; }

.rm-feat-track {
  display: flex;
  gap: clamp(14px, 2vw, 24px);
  padding-inline: var(--v-pad, clamp(20px, 4vw, 64px));
}

.rm-feat-card {
  flex: 0 0 min(78vw, 340px);
  min-width: 0;
  user-select: none;
}
@media (min-width: 768px) { .rm-feat-card { flex-basis: min(44vw, 400px); } }

.rm-feat-img {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--v-bg-raise);
}
.rm-feat-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Featured food photography renders FULL COLOR (venue-cover precedent). */
.rm-feat-img .rm-img-color { filter: none; }

.rm-drag-pill {
  position: fixed;
  z-index: 70;
  left: 0;
  top: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: var(--v-accent);
  color: var(--v-accent-ink);
  transform: translate(-50%, -50%) scale(0);
  will-change: transform;
}

/* ═══ 6. Menu — ruled rows ════════════════════════════════════════════════ */

.rm-cat { position: relative; }

.rm-cat-head {
  position: sticky;
  top: 104px; /* clears the nav bar + the mobile category strip */
  z-index: 5;
  background: color-mix(in srgb, var(--v-bg) 92%, transparent);
  backdrop-filter: blur(6px);
  padding-block: 14px 10px;
}
@media (min-width: 768px) {
  .rm-cat-head { top: 60px; } /* desktop nav is a single 60px bar */
}

.rm-row {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: clamp(14px, 2.5vw, 32px);
  align-items: baseline;
  padding-block: clamp(18px, 2.6vh, 26px);
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.rm-row-idx {
  color: var(--v-faint);
  transition: color 0.3s ease;
}

.rm-row-name {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: clamp(1.25rem, 2.6vw, 2rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.rm-row-desc {
  grid-column: 2;
  max-width: 56ch;
  margin-top: 6px;
  color: var(--v-mut);
}

.rm-row-tags {
  grid-column: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.rm-row-price {
  font-family: var(--v-font-mono);
  font-variant-numeric: tabular-nums;
  font-size: clamp(0.95rem, 1.6vw, 1.15rem);
  color: var(--v-ink);
  transition: color 0.3s ease;
}

.rm-row-line {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--v-line);
}
.rm-row-line::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--v-accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (pointer: fine) {
  .rm-row:hover .rm-row-name { transform: translateX(10px); }
  .rm-row:hover .rm-row-idx { color: var(--v-accent); }
  .rm-row:hover .rm-row-price { color: var(--v-accent); }
  .rm-row:hover .rm-row-line::after { transform: scaleX(1); }
}

/* Cursor-following image reveal (pointer-fine only) */
.rm-follower {
  position: fixed;
  z-index: 55;
  left: 0;
  top: 0;
  width: min(21vw, 270px);
  aspect-ratio: 4 / 5;
  pointer-events: none;
  overflow: hidden;
  border-radius: var(--v-radius);
  transform: translate(-50%, -50%);
  clip-path: inset(100% 0 0 0);
  will-change: transform, clip-path;
  display: none;
}
@media (pointer: fine) { .rm-follower { display: block; } }

.rm-follower img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.15);
  will-change: transform;
}

/* ═══ 6b. Menu — the visual wall (masonry gallery) ════════════════════════
 * Pinterest-density card wall (aicreatorawards reference). CSS columns give
 * true masonry flow; every card gets a deterministic aspect ratio from its
 * index so layout is stable (no CLS) but reads organically varied. Food
 * photography renders FULL COLOR. Items without photos become typographic
 * poster cards — outline / raised / accent tones, the tunnel-panel family. */

/* Sticky category-filter chips over the feed (Pinterest control strip).
 * Chips reuse .rm-nav-cat (mono link + accent underline). */
.rm-filter {
  position: sticky;
  top: 60px;
  z-index: 6;
  display: flex;
  align-items: baseline;
  gap: 20px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-block: 14px 12px;
  margin-top: 10px;
  background: color-mix(in srgb, var(--v-bg) 92%, transparent);
  backdrop-filter: blur(6px);
}
.rm-filter::-webkit-scrollbar { display: none; }

.rm-mas {
  columns: 2;
  column-gap: 12px;
  padding-top: 20px;
}
@media (min-width: 768px)  { .rm-mas { columns: 3; column-gap: clamp(14px, 1.6vw, 22px); } }
@media (min-width: 1280px) { .rm-mas { columns: 4; } }

.rm-mas-card {
  display: block;
  width: 100%;
  break-inside: avoid;
  margin-bottom: 12px;
  text-align: left;
  cursor: pointer;
  position: relative;
}
@media (min-width: 768px) { .rm-mas-card { margin-bottom: clamp(14px, 1.6vw, 22px); } }

.rm-mas-img {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: var(--v-radius);
  background: var(--v-bg-raise);
}

/* Deterministic Pinterest variety — aspect by card index, zero layout shift */
.rm-mas-card[data-a="0"] .rm-mas-img { aspect-ratio: 4 / 5; }
.rm-mas-card[data-a="1"] .rm-mas-img { aspect-ratio: 1 / 1; }
.rm-mas-card[data-a="2"] .rm-mas-img { aspect-ratio: 3 / 4; }
.rm-mas-card[data-a="3"] .rm-mas-img { aspect-ratio: 16 / 11; }
.rm-mas-card[data-a="4"] .rm-mas-img { aspect-ratio: 5 / 6; }

.rm-mas-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
@media (pointer: fine) {
  .rm-mas-card:hover .rm-mas-img img { transform: scale(1.045); }
  .rm-mas-card:hover .rm-mas-name { color: var(--v-accent); }
}

/* Overlays on photo cards */
.rm-mas-idx {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 2;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
.rm-mas-price {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  padding: 3px 8px;
  border-radius: var(--v-radius);
  background: rgba(0, 0, 0, 0.55);
  color: var(--v-accent);
  font-variant-numeric: tabular-nums;
}

/* Typographic poster cards (no photo) — the tunnel-panel tone family */
.rm-mas-fill {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 14px;
}
.rm-mas-img[data-tone="line"]   { background: transparent; box-shadow: inset 0 0 0 1px var(--v-line); color: var(--v-ink); }
.rm-mas-img[data-tone="raise"]  { background: var(--v-bg-raise); color: var(--v-ink); }
.rm-mas-img[data-tone="accent"] { background: var(--v-accent); color: var(--v-accent-ink); }
.rm-mas-img[data-tone="accent"] .rm-mas-fill [data-dim] { color: color-mix(in srgb, var(--v-accent-ink) 62%, transparent); }
.rm-mas-img[data-tone="line"] .rm-mas-fill [data-dim],
.rm-mas-img[data-tone="raise"] .rm-mas-fill [data-dim] { color: var(--v-faint); }

.rm-mas-fill-name {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: clamp(1.15rem, 2vw, 1.6rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

/* Meta row under photo cards */
.rm-mas-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-top: 8px;
}
.rm-mas-name {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--v-ink);
  transition: color 0.3s ease;
  min-width: 0;
}

/* ═══ 7. Story (bone) ═════════════════════════════════════════════════════ */

.rm-story-grid {
  display: grid;
  gap: clamp(28px, 5vw, 72px);
}
@media (min-width: 1024px) {
  .rm-story-grid { grid-template-columns: 7fr 5fr; align-items: stretch; }
}

.rm-story-text {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: clamp(1.45rem, 3.2vw, 2.6rem);
  line-height: 1.14;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.rm-story-img {
  width: 100%;
  aspect-ratio: 3 / 4;
  max-width: 440px;
}

/* ═══ 8. Gallery drift wall ═══════════════════════════════════════════════ */

.rm-gal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(12px, 2vw, 24px);
  align-items: start;
}
@media (min-width: 768px) { .rm-gal { grid-template-columns: repeat(3, 1fr); } }

.rm-gal-col { display: flex; flex-direction: column; gap: clamp(12px, 2vw, 24px); }
.rm-gal-col:nth-child(2) { margin-top: clamp(28px, 6vh, 72px); }
.rm-gal-col:nth-child(3) { margin-top: clamp(14px, 3vh, 36px); }

.rm-gal-item { position: relative; overflow: hidden; }
.rm-gal-item img,
.rm-gal .v-xframe img {
  width: 100%;
  aspect-ratio: 4 / 5; /* fixed box — no CLS, stable ScrollTrigger positions */
  object-fit: cover;
  display: block;
}

/* ═══ 9. Info (bone) ══════════════════════════════════════════════════════ */

.rm-info-grid {
  display: grid;
  gap: clamp(32px, 5vw, 64px);
}
@media (min-width: 1024px) {
  .rm-info-grid { grid-template-columns: 1fr 1fr; align-items: start; }
}

.rm-hours-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  position: relative;
}
.rm-hours-row::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--v-c-line, var(--v-line));
}

.rm-link-roll {
  position: relative;
  display: inline-flex;
  overflow: hidden;
  vertical-align: top;
}
.rm-link-roll > span {
  display: block;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.rm-link-roll > span[aria-hidden] {
  position: absolute;
  inset-inline: 0;
  top: 100%;
  color: var(--v-accent);
}
.rm-link-roll:hover > span { transform: translateY(-100%); }
[data-theme="bone"] .rm-link-roll > span[aria-hidden] { color: var(--v-ink-inv); }

/* ═══ 10. Footer ══════════════════════════════════════════════════════════ */

.rm-footer {
  position: relative;
  padding-block: clamp(56px, 9vh, 112px) 28px;
  overflow: hidden;
}

.rm-footer-mark {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: clamp(3rem, 14vw, 12rem);
  line-height: 0.9;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  text-wrap: balance;
  color: var(--v-ink);
  transition: color 0.5s ease;
}
.rm-footer-mark:hover { color: var(--v-accent); }
.rm-footer-mark:lang(ka) { letter-spacing: -0.015em; }

/* ═══ 11. Item sheet ══════════════════════════════════════════════════════ */

.rm-sheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(0, 0, 0, 0.65);
}

.rm-sheet {
  position: fixed;
  z-index: 81;
  inset-inline: 0;
  bottom: 0;
  max-height: 88svh;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--v-bg-raise);
  border-top: 1px solid var(--v-line);
}
@media (min-width: 768px) {
  .rm-sheet {
    inset: 0;
    margin: auto;
    width: min(880px, calc(100vw - 96px));
    height: fit-content;
    max-height: 84svh;
    border: 1px solid var(--v-line);
    border-radius: var(--v-radius);
  }
}

.rm-sheet-grid { display: grid; }
@media (min-width: 768px) {
  .rm-sheet-grid { grid-template-columns: 5fr 6fr; }
}

.rm-sheet-img {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--v-bg);
}
@media (min-width: 768px) { .rm-sheet-img { aspect-ratio: auto; min-height: 100%; } }
.rm-sheet-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* ═══ 12. Shared bits ═════════════════════════════════════════════════════ */

.rm-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border: 1px solid var(--v-c-line, var(--v-line));
  border-radius: var(--v-radius);
  color: var(--v-c-mut, var(--v-mut));
}

/* Allergen declaration — legally required, typographically distinct from
   marketing tags (bolder, amber, uppercase). Never hidden by layout toggles. */
.rm-chip-allergen {
  border-color: rgba(232, 179, 106, 0.55);
  background: rgba(232, 179, 106, 0.08);
  color: #e8b36a;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rm-accent-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--v-accent);
}

/* Grayscale-at-rest law with in-view color release (scroll band) */
.rm-img-band { transition: filter 0.6s ease; }
.rm-root .v-img.is-color { filter: none; }

/* Hide the drag pill wherever there is no fine pointer */
@media (pointer: coarse) { .rm-drag-pill { display: none; } }

/* No-JS / SSR safety: rows and reveals render final-state by default. */

/* ═══ 13. THE CORRIDOR — CSS 3D tunnel ════════════════════════════════════
 * Geometry vars are set by RmTunnel from the measured container:
 *   --tun-sx/--tun-sy : half-width/height of the tube (rectangular — the
 *   tube matches the window's aspect so the mouth fills the frame)
 *   --tun-d : segment depth      --tun-p : perspective distance
 * All colors are CONTEXTUAL (--v-c-*): on dark the corridor is ink with
 * light hairlines; inside a bone section it flips to the cream look of the
 * reference — no extra variant CSS.
 *
 * 3D-FLATTENING LAW: never put opacity, filter, will-change:opacity, or any
 * other grouping property on .rm-tun-seg or any ancestor between it and the
 * walls — grouping forces preserve-3d flat and the 90°-rotated walls project
 * edge-on (invisible). Fades belong on .rm-tun-wall (leaf groups). */

.rm-tunnel {
  --tun-sx: 620px;
  --tun-sy: 620px;
  --tun-d: 700px;
  --tun-p: 1000px;
  position: relative;
  height: 100svh;
  min-height: 560px;
  overflow: hidden;
  background: var(--v-c-bg, var(--v-bg));
  isolation: isolate;
}

.rm-tunnel.is-embedded {
  height: 100%;
  min-height: 0;
  position: absolute;
  inset: 0;
}

.rm-tun-stage {
  position: absolute;
  inset: 0;
  perspective: var(--tun-p);
  perspective-origin: 50% 50%;
  transform-style: preserve-3d;
}

.rm-tun-cam {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  will-change: transform;
}

/* One slice of the tube. Children are its four walls.
 * NO opacity/will-change:opacity here — see the flattening law above. */
.rm-tun-seg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
}

/* Fades land here: a wall's own rotate still applies when it groups.
 * backface-visibility makes a wrong rotation sign fail LOUDLY (wall
 * disappears) instead of silently rendering a mirrored photo. */
.rm-tun-wall {
  position: absolute;
  backface-visibility: hidden;
}

/* Compositor layers exist only while the corridor is on screen — RmTunnel
 * toggles .is-live from its IntersectionObserver. 46 resident layers on a
 * long menu page are not free. */
.rm-tunnel.is-live .rm-tun-seg { will-change: transform; }
.rm-tunnel.is-live .rm-tun-wall { will-change: opacity; }

.rm-tun-wall[data-wall="top"],
.rm-tun-wall[data-wall="bottom"] {
  width: calc(var(--tun-sx) * 2);
  height: var(--tun-d);
  left: calc(var(--tun-sx) * -1);
  top: calc(var(--tun-d) / -2);
}
.rm-tun-wall[data-wall="left"],
.rm-tun-wall[data-wall="right"] {
  width: var(--tun-d);
  height: calc(var(--tun-sy) * 2);
  left: calc(var(--tun-d) / -2);
  top: calc(var(--tun-sy) * -1);
}

/* Opposite rotation signs per pair — every front face points INTO the tube.
 * With backface-visibility:hidden above, a shared sign turns one of each
 * pair backface-on and it disappears — the intended loud failure. */
.rm-tun-wall[data-wall="top"]    { transform: translateY(calc(var(--tun-sy) * -1)) rotateX(-90deg); }
.rm-tun-wall[data-wall="bottom"] { transform: translateY(var(--tun-sy)) rotateX(90deg); }
.rm-tun-wall[data-wall="left"]   { transform: translateX(calc(var(--tun-sx) * -1)) rotateY(90deg); }
.rm-tun-wall[data-wall="right"]  { transform: translateX(var(--tun-sx)) rotateY(-90deg); }

/* The visible face — RULED hairline edges in 3D. */
.rm-tun-face {
  position: absolute;
  inset: 5px;
  overflow: hidden;
  border: 1px solid var(--v-c-line, var(--v-line));
  border-radius: var(--v-radius);
  background: var(--v-c-bg, var(--v-bg));
}

.rm-tun-face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rm-tun-face[data-tone="accent"] { background: var(--v-accent); border-color: var(--v-accent); }
.rm-tun-face[data-tone="flip"]   { background: var(--v-c-ink, var(--v-ink)); }
.rm-tun-face[data-tone="raise"]  { background: var(--v-c-raise, var(--v-bg-raise)); }
.rm-tun-face[data-tone="base"]   { background: var(--v-c-bg, var(--v-bg)); }

/* Depth falloff toward the vanishing point — matches the section theme. */
.rm-tun-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 50%,
      color-mix(in srgb, var(--v-c-bg, var(--v-bg)) 90%, transparent) 0%,
      color-mix(in srgb, var(--v-c-bg, var(--v-bg)) 50%, transparent) 24%,
      transparent 55%);
}

.rm-tun-core {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding-inline: 24px;
  pointer-events: none;
}

.rm-tun-kicker { color: var(--v-c-faint, var(--v-faint)); }

.rm-tun-heading {
  font-family: var(--v-font-display);
  font-weight: 500;
  font-size: clamp(1.6rem, 4.4vw, 3.4rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
  text-wrap: balance;
  max-width: 16ch;
  color: var(--v-c-ink, var(--v-ink));
}

.rm-tun-cta {
  pointer-events: auto;
  position: relative;
  display: inline-flex;
  overflow: hidden;
  margin-top: 8px;
  padding: 12px 22px;
  border: 1px solid var(--v-accent);
  border-radius: var(--v-radius);
  background: var(--v-accent);
  color: var(--v-accent-ink);
}
.rm-tun-cta > span {
  display: block;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.rm-tun-cta > span[aria-hidden] {
  position: absolute;
  inset-inline: 0;
  top: 100%;
}
.rm-tun-cta:hover > span { transform: translateY(-100%); }

/* The corridor window inside the story section */
.rm-story-tunnel {
  position: relative;
  flex: 1;
  min-height: clamp(320px, 46vh, 520px);
  overflow: hidden;
  border: 1px solid var(--v-c-line, var(--v-line));
  border-radius: var(--v-radius);
}

@media (prefers-reduced-motion: reduce) {
  .rm-tun-cta > span { transition: none; }
}

/* ═══ 14. VolooAI concierge — RULED dress code ════════════════════════════ */
/* The widget ships a soft "liquid glass" look (pills, gradients, glows).
   Inside the Signature template it must speak RULED: squared corners,
   hairlines, mono microcopy, one accent. Scoped to .rm-ai so the basic and
   dragable templates keep their original styling. */

.rm-ai,
.rm-ai input,
.rm-ai button,
.rm-ai textarea {
  font-family: var(--v-font-body);
}

/* Square every surface except genuine circles (status dots, avatars). */
.rm-ai [class*="rounded-"]:not([class*="rounded-full"]) {
  border-radius: var(--v-radius) !important;
}

/* Hairline all borders */
.rm-ai [class*="border-white/"],
.rm-ai [class*="border-zinc-"] {
  border-color: var(--v-line) !important;
}

/* Flat accent trigger — no gradient, no bloom */
.rm-ai > button[class*="fixed"],
.rm-ai button[class*="rounded-full"][class*="fixed"] {
  background: var(--v-accent) !important;
  color: var(--v-accent-ink) !important;
  box-shadow: none !important;
  border: 1px solid var(--v-accent) !important;
  border-radius: var(--v-radius) !important;
}
.rm-ai > button[class*="fixed"]:hover {
  transform: none !important;
  filter: brightness(0.95);
}

/* Uppercase mono for the widget's small labels */
.rm-ai .uppercase {
  font-family: var(--v-font-mono);
  letter-spacing: 0.08em;
}

/* Chat input: squared, hairline, no heavy shadow */
.rm-ai input[type="text"] {
  font-family: var(--v-font-body);
}
.rm-ai input[type="text"]::placeholder {
  color: var(--v-faint);
}

/* Surfaces snap to the template palette */
.rm-ai [style*="rgba(10, 10, 10"],
.rm-ai [class*="bg-zinc-9"] {
  background-color: var(--v-bg-raise) !important;
}

/* Tabular numerals for any price the assistant renders */
.rm-ai [class*="price"],
.rm-ai .tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* The chat input bar and its send button are surfaces, not dots — square
   them despite their rounded-full classes. Status dots stay circular. */
.rm-ai div[class*="rounded-full"]:has(> input),
.rm-ai div[class*="rounded-full"]:has(> input) button {
  border-radius: var(--v-radius) !important;
}
`;
