// components/landing/ml-css.ts
// ─────────────────────────────────────────────────────────────────────────────
// ML_CSS — the RULED landing stylesheet (design spec v1.0), delivered as a
// mounted <style>{ML_CSS}</style> template literal inside MotionLanding.
// CONTRACT: the delivery mechanism must never change — LandingPanels' Offers
// navbar clone depends on this tag staying mounted. Class names .ml-root /
// .ml-nav / .ml-navbar / .ml-brand / .ml-nlinks / .ml-btn are contractual.
//
// The :root-equivalent token block lives on .ml-root and is the source of
// truth for the landing; globals.css mirrors the raw --v-* tokens for the
// Offers / menu-chrome surfaces. The tweenable palette (--bg/--ink/--mut/
// --faint/--line/--raise) is what the theme-flip ScrollTrigger animates —
// contextual --v-c-* consumers (foundation .v-* utilities) are re-pointed at
// those tweened vars so every hairline/heading follows the flip for free.
// ─────────────────────────────────────────────────────────────────────────────

export const ML_CSS = `
/* ═══ 1. Root & palette ══════════════════════════════════════════════════ */
.ml-root{
  /* Tweened palette — theme-flip animates THESE (spec §1.1). */
  --bg:var(--v-bg);--raise:var(--v-bg-raise);--ink:var(--v-ink);
  --mut:var(--v-mut);--faint:var(--v-faint);--line:var(--v-line);
  /* Re-point the foundation's contextual tokens at the tweened palette. */
  --v-c-bg:var(--bg);--v-c-raise:var(--raise);--v-c-ink:var(--ink);
  --v-c-mut:var(--mut);--v-c-faint:var(--faint);--v-c-line:var(--line);
  background:var(--bg);color:var(--ink);
  position:relative;overflow-x:hidden;
  font-family:var(--v-font-body);
  -webkit-font-smoothing:antialiased;
}
.ml-root a{text-decoration:none;color:inherit}
.ml-mono{font-family:var(--v-font-mono);letter-spacing:.06em;text-transform:uppercase}
.ml-wrap{width:min(100% - 2*var(--v-pad),var(--v-container));margin-inline:auto}
.ml-sec{padding-block:var(--v-sec-pad)}
.ml-accent{color:var(--v-accent)}

/* ═══ 2. Roll-hover (spec §3.3 roll-hover) ═══════════════════════════════ */
/* Clip to a single line so only the first of the two stacked copies shows at
   rest; :hover slides the column -50% to reveal the duplicate. Without the
   height clamp both copies render (the doubled-text bug). 1lh = one line box;
   em fallback for browsers without the lh unit. */
.ml-roll{display:inline-flex;overflow:hidden;vertical-align:top;height:1.15em;height:1lh}
.ml-roll-in{display:flex;flex-direction:column;transition:transform .4s cubic-bezier(.16,1,.3,1);will-change:transform}
.ml-roll-in>span{display:block;white-space:nowrap;height:1.15em;height:1lh}
@media(hover:hover) and (pointer:fine){
  .ml-rollhost:hover .ml-roll-in{transform:translateY(-50%)}
}
@media(prefers-reduced-motion:reduce){.ml-roll-in{transition:none}.ml-rollhost:hover .ml-roll-in{transform:none}}

/* ═══ 3. Buttons ═════════════════════════════════════════════════════════ */
.ml-btn{
  display:inline-flex;align-items:center;gap:8px;white-space:nowrap;cursor:pointer;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  background:var(--v-accent);color:var(--v-accent-ink)!important;
  padding:10px 16px;border:0;border-radius:var(--v-radius);
  transition:transform .12s ease,background .12s ease,color .12s ease;
}
.ml-btn:active{transform:scale(.97);background:var(--v-ink);color:var(--v-bg)!important}
.ml-cta{
  display:inline-flex;align-items:center;justify-content:center;gap:10px;white-space:nowrap;cursor:pointer;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  background:var(--v-accent);color:var(--v-accent-ink)!important;
  padding:16px 26px;border:0;border-radius:var(--v-radius);
  transition:transform .12s ease,background .12s ease,color .12s ease;
}
.ml-cta:active{transform:scale(.97);background:var(--v-ink);color:var(--v-bg)!important}
.ml-cta-o{
  display:inline-flex;align-items:center;justify-content:center;gap:10px;white-space:nowrap;cursor:pointer;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  background:transparent;color:var(--v-ink);
  padding:15px 25px;border:1px solid var(--v-line);border-radius:var(--v-radius);
  transition:transform .12s ease,border-color .3s ease,color .3s ease;
}
.ml-cta-o:hover{border-color:var(--v-accent);color:var(--v-accent)}
.ml-cta-o:active{transform:scale(.97)}

/* ═══ 4. Nav (spec §4.1 — class names contractual) ═══════════════════════ */
.ml-nav{
  position:fixed;top:0;left:0;right:0;z-index:60;
  padding-top:env(safe-area-inset-top);
  background:transparent;transition:background .3s ease;
}
.ml-nav[data-scrolled="true"]{background:rgba(10,10,10,.85)}
.ml-nav-line{
  position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--v-line);
  transform:scaleX(0);transform-origin:left center;
  transition:transform .9s cubic-bezier(.16,1,.3,1);
}
.ml-nav[data-scrolled="true"] .ml-nav-line{transform:scaleX(1)}
.ml-navbar{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  height:64px;padding-inline:var(--v-pad);
}
.ml-brand{display:inline-flex;align-items:baseline;gap:10px;color:var(--v-ink)}
.ml-brand-wm{font-family:var(--v-font-display);font-weight:500;font-size:1.05rem;letter-spacing:-.02em}
.ml-brand-by{font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint)}
.ml-nav-city{display:none;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint)}
.ml-nav-right{display:flex;align-items:center;gap:var(--v-s6)}
.ml-nlinks{display:none;align-items:center;gap:var(--v-s5)}
.ml-nlinks a{
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:var(--v-mut);transition:color .3s ease;
}
.ml-nlinks a:hover{color:var(--v-ink)}
@media(min-width:1024px){
  .ml-nlinks{display:flex}
  .ml-nav-city{display:block}
}
/* Button variants of nav links (panel switches — no route change). Reset the
   native button box, then inherit the mono link look. */
button.ml-brand{background:none;border:0;padding:0;cursor:pointer;font:inherit;text-align:left}
.ml-navlink{
  background:none;border:0;padding:0;cursor:pointer;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:var(--v-mut);transition:color .3s ease;
}
.ml-navlink:hover{color:var(--v-ink)}
.ml-navlink[data-active="true"]{color:var(--v-accent)}

/* ═══ 4b. Menus CTA (home) — the pinned catalogue's home stand-in ════════ */
.ml-vspace{min-height:100svh;padding-top:calc(64px + env(safe-area-inset-top))}
.ml-mcta{position:relative}
.ml-mcta-btn{
  display:block;width:100%;background:none;border:0;padding:0;cursor:pointer;
  color:var(--v-ink);text-align:left;
}
.ml-mcta-hl{display:block;height:1px;background:var(--v-line);transform-origin:left center}
.ml-mcta-row{
  display:flex;align-items:center;justify-content:space-between;gap:var(--v-s5);
  padding-block:clamp(28px,6vw,64px);
}
.ml-mcta-mask{display:block;overflow:hidden}
.ml-mcta-big{
  display:block;
  font-family:var(--v-font-display);font-weight:500;
  font-size:clamp(3rem,13vw,10rem);line-height:.92;letter-spacing:-.03em;
  transition:color .4s cubic-bezier(.16,1,.3,1);
}
.ml-mcta-arrow{
  flex:none;font-family:var(--v-font-mono);font-size:clamp(1.5rem,4vw,3rem);color:var(--v-accent);
  transition:transform .4s cubic-bezier(.16,1,.3,1);
}
.ml-mcta-sub{
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding-bottom:clamp(20px,4vw,40px);
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--v-mut);
}
.ml-mcta-count{color:var(--v-faint)}
.ml-mcta-btn:active{transform:scale(.995)}
@media(hover:hover) and (pointer:fine){
  .ml-mcta-btn:hover .ml-mcta-big{color:var(--v-accent)}
  .ml-mcta-btn:hover .ml-mcta-arrow{transform:translateX(12px)}
}
@media(prefers-reduced-motion:reduce){
  .ml-mcta-big,.ml-mcta-arrow{transition:none}
}

/* ═══ 5. Hero (spec §4.2) ════════════════════════════════════════════════ */
.ml-hero{
  position:relative;min-height:100svh;
  display:flex;align-items:flex-end;
  padding-top:calc(96px + env(safe-area-inset-top));
  padding-bottom:clamp(48px,8vh,96px);
}
.ml-hero-grid{display:grid;grid-template-columns:1fr;gap:var(--v-s7);align-items:end}
.ml-hero-copy{min-width:0}
.ml-hero-visual{position:relative;min-width:0}
.ml-hero-img{aspect-ratio:4/3}
.ml-hero-ticks{display:none}
@media(min-width:1024px){
  .ml-hero-grid{grid-template-columns:repeat(12,1fr)}
  .ml-hero-copy{grid-column:1/9}
  .ml-hero-visual{grid-column:9/13}
  .ml-hero-img{aspect-ratio:3/4}
  .ml-hero-ticks{display:flex;position:absolute;right:calc(var(--v-pad) + 16px);top:22vh;z-index:1}
}
.ml-hero-img img,.ml-wall-item img,.ml-conc-img img,.ml-vcard-img img{
  width:100%;height:100%;object-fit:cover;display:block;
}
.ml-h1{margin:0}
.ml-hline{display:block}
.ml-hline-rot{display:flex;flex-wrap:wrap;align-items:flex-start;column-gap:.24em}
.ml-rot{display:inline-grid;overflow:hidden;color:var(--v-accent);padding:.14em 0;margin:-.14em 0}
.ml-rot>span{grid-area:1/1;display:block;will-change:transform}
.ml-rot>span:not(:first-child){visibility:hidden}
.ml-lead{margin-top:var(--v-s6);max-width:520px;color:var(--v-mut)}
.ml-scroll-cue{
  margin-top:var(--v-s6);display:flex;align-items:center;gap:var(--v-s3);
  font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);
}
.ml-scroll-line{display:block;width:1px;height:24px;background:var(--v-faint);transform-origin:center top}
.ml-hbtns{margin-top:var(--v-s6);display:flex;gap:var(--v-s3);flex-wrap:wrap}

/* ═══ 6. Marquee (spec §4.3) ═════════════════════════════════════════════ */
.ml-marq{margin-top:var(--v-s2)}
.ml-marq .v-marquee{padding-block:var(--v-s5)}
.ml-marq-item{
  display:inline-flex;align-items:center;
  font-family:var(--v-font-mono);font-size:var(--v-t-h3);letter-spacing:.06em;text-transform:uppercase;
  color:var(--faint);white-space:nowrap;
}
.ml-marq-sep{color:var(--v-accent);margin-inline:.9em;font-family:var(--v-font-mono)}

/* ═══ 7. How it works (spec §4.4 — bone) ═════════════════════════════════ */
.ml-how-rows{margin-top:var(--v-s8)}
.ml-how-row{
  position:relative;display:grid;column-gap:var(--v-s4);row-gap:var(--v-s2);
  grid-template-columns:48px 1fr 28px;align-items:baseline;
  padding-block:var(--v-s6);
  transition:background .3s ease;
}
.ml-how-idx{
  grid-column:1;font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;
  color:var(--faint);transition:transform .3s cubic-bezier(.16,1,.3,1);
}
.ml-how-title{grid-column:2;margin:0;color:var(--ink)}
.ml-how-copy{grid-column:2;margin:0;font-size:var(--v-t-body);line-height:1.6;color:var(--mut);max-width:56ch}
.ml-how-arrow{grid-column:3;grid-row:1;justify-self:end;color:var(--faint);font-family:var(--v-font-mono)}
.ml-how-line{position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--line);transform-origin:left center}
@media(min-width:1024px){
  .ml-how-row{grid-template-columns:96px 300px 1fr 28px;column-gap:var(--v-s6)}
  .ml-how-copy{grid-column:3;grid-row:1}
  .ml-how-arrow{grid-column:4}
}
@media(hover:hover) and (pointer:fine){
  .ml-how-row:hover{background:var(--raise)}
  .ml-how-row:hover .ml-how-idx{transform:translateX(8px)}
  .ml-how-row:hover .ml-how-arrow{color:var(--ink)}
}
.ml-how-baglink{color:var(--v-accent);cursor:pointer;background:none;border:0;padding:0;font:inherit;letter-spacing:inherit}
.ml-how-baglink:hover{text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1px}

/* Image wall — drift columns (spec §4.4). Two DOM variants: -m (2col mobile),
   -d (3col desktop). Hidden variant's lazy images never intersect → no load. */
.ml-wall{margin-top:var(--v-s8)}
.ml-wall-m{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--v-s4)}
.ml-wall-d{display:none}
@media(min-width:1024px){
  .ml-wall-m{display:none}
  .ml-wall-d{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--v-s5)}
}
.ml-wall-col{display:flex;flex-direction:column;gap:var(--v-s4)}
@media(min-width:1024px){.ml-wall-col{gap:var(--v-s5)}}
.ml-wall-item{aspect-ratio:4/5}
.ml-wall-col > :nth-child(2n) .ml-wall-item{aspect-ratio:3/4}

/* ═══ 8. Concierge (spec §4.5 — bone) ════════════════════════════════════ */
.ml-conc{margin-top:var(--v-s8);display:grid;gap:var(--v-s8);align-items:start}
@media(min-width:1024px){.ml-conc{grid-template-columns:6fr 5fr;gap:var(--v-s9)}}
.ml-conc-h{margin:0;color:var(--ink)}
.ml-conc-sub{margin-top:var(--v-s5);color:var(--mut);max-width:44ch}
.ml-chips{margin-top:var(--v-s6);display:flex;flex-wrap:wrap;gap:var(--v-s3)}
.ml-chip{
  display:inline-flex;align-items:center;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink);border:1px solid var(--line);border-radius:var(--v-radius);
  padding:10px 14px;transition:background .3s ease,border-color .3s ease,color .3s ease;
}
@media(hover:hover) and (pointer:fine){
  .ml-chip:hover{background:var(--v-accent);border-color:var(--v-accent);color:var(--v-accent-ink)}
}
.ml-conc-try{
  margin-top:var(--v-s7);display:inline-flex;align-items:center;gap:8px;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink);
}
.ml-conc-try:hover{color:var(--v-accent)}
.ml-conc-visual{position:relative}
.ml-conc-img{aspect-ratio:4/5}
.ml-conc-bubble{
  position:absolute;left:calc(-1*min(var(--v-s6),4vw));bottom:var(--v-s6);
  max-width:min(320px,82%);
  background:var(--raise);border:1px solid var(--line);border-radius:var(--v-radius);
  padding:var(--v-s4) var(--v-s5);
}
.ml-conc-bubble-tag{
  display:block;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;
  text-transform:uppercase;color:var(--faint);margin-bottom:var(--v-s2);
}
.ml-conc-bubble-q{margin:0 0 var(--v-s2);font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--mut)}
.ml-conc-bubble-a{margin:0;font-size:var(--v-t-small);line-height:1.5;color:var(--ink)}

/* ═══ 9. Venues (spec §4.6 — dark, pinned horizontal ≥1024) ══════════════ */
.ml-venues{overflow:hidden}
.ml-vwrap{
  margin-top:var(--v-s8);
  overflow-x:auto;overscroll-behavior-x:contain;
  scroll-snap-type:x mandatory;
  scroll-padding-inline:max(var(--v-pad),calc((100vw - var(--v-container))/2));
  -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.ml-vwrap::-webkit-scrollbar{display:none}
.ml-vtrack{
  display:flex;gap:var(--v-s5);width:max-content;
  padding-inline:max(var(--v-pad),calc((100vw - var(--v-container))/2));
}
.ml-vcard{
  position:relative;flex:0 0 auto;width:min(420px,78vw);
  scroll-snap-align:start;cursor:pointer;
  display:flex;flex-direction:column;gap:var(--v-s4);
  padding-bottom:var(--v-s5);
}
.ml-vcard:focus-visible{outline:1px solid var(--v-accent);outline-offset:6px}
.ml-vcard-img{aspect-ratio:3/4;background:var(--raise)}
/* Venue covers always render in FULL COLOR — override the grayscale-at-rest
   law (globals.css .v-img) for catalogue cards. Lives here beside the venue
   card styles (the whole card system depends on this mounted sheet). */
.ml-vcard-img .v-img,
.ml-vcard-img .v-img.is-color{filter:contrast(1.03) brightness(.99)!important}
.ml-vcard-meta{display:flex;flex-direction:column;gap:var(--v-s2);min-width:0}
.ml-vcard-idx{font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;color:var(--faint)}
.ml-vcard-name{display:block;margin:0;color:var(--ink);min-width:0;overflow:hidden}
.ml-vcard-name .ml-roll{max-width:100%}
.ml-vcard-row{
  display:flex;align-items:baseline;justify-content:space-between;gap:var(--v-s3);
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--mut);
}
.ml-vcard-frac{color:var(--faint)}
.ml-vcard-line{position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--line);transform-origin:left center}
@media(hover:hover) and (pointer:fine){
  .ml-vcard:hover .v-xframe-tick{color:var(--v-accent)}
  .ml-vcard:hover .ml-vcard-name{color:var(--v-accent)}
}
.ml-vempty{
  margin-top:var(--v-s8);padding-block:var(--v-s7);text-align:center;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--faint);
}

/* ═══ 10. Waitlist (spec §4.7 — dark) ════════════════════════════════════ */
.ml-wl-h{margin:0}
.ml-wl-lead{margin-top:var(--v-s5);color:var(--mut);max-width:52ch}
.ml-wl-form{margin-top:var(--v-s7);max-width:820px}
.ml-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.ml-wl-row{display:flex;flex-direction:column;gap:var(--v-s5)}
@media(min-width:768px){.ml-wl-row{flex-direction:row;align-items:flex-end;gap:var(--v-s6)}}
.ml-in{
  flex:1;min-width:0;background:transparent;border:0;border-radius:0;
  border-bottom:1px solid var(--v-line);
  color:var(--v-ink);font-family:var(--v-font-mono);font-size:var(--v-t-body);
  letter-spacing:.04em;padding:12px 0;outline:none;
  transition:border-color .3s ease;
}
.ml-in::placeholder{color:var(--v-faint);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase}
.ml-in:focus{border-bottom-color:var(--v-accent)}
.ml-wl-submit{flex:0 0 auto}
.ml-wl-note{
  margin-top:var(--v-s5);font-family:var(--v-font-mono);font-size:var(--v-t-micro);
  letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);
}
.ml-wl-error{
  margin-top:var(--v-s4);padding-top:var(--v-s3);position:relative;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:#f87171;
}
.ml-wl-error::before{content:"";position:absolute;top:0;left:0;width:100%;height:1px;background:#f87171}
.ml-wl-success{
  display:inline-flex;align-items:center;gap:var(--v-s3);margin-top:var(--v-s7);
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:#34d399;animation:ml-fadein .5s ease both;
}
@keyframes ml-fadein{from{opacity:0}to{opacity:1}}
.ml-ellipsis{display:inline-block;animation:ml-pulse 1s ease-in-out infinite}
@keyframes ml-pulse{0%,100%{opacity:.35}50%{opacity:1}}
@media(prefers-reduced-motion:reduce){.ml-ellipsis{animation:none}.ml-wl-success{animation:none}}

/* ═══ 11. Footer (spec §4.8 — 05 CONTACT) ════════════════════════════════ */
.ml-footer{position:relative;padding-top:var(--v-s8)}
.ml-foot-head{
  display:flex;align-items:baseline;justify-content:space-between;gap:var(--v-s4);
  padding-top:var(--v-s4);flex-wrap:wrap;
  font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);
}
.ml-foot-cols{
  margin-top:var(--v-s8);display:grid;grid-template-columns:1fr;gap:var(--v-s7);
}
@media(min-width:768px){.ml-foot-cols{grid-template-columns:repeat(3,1fr)}}
.ml-foot-col-t{
  font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;
  color:var(--v-faint);margin-bottom:var(--v-s4);
}
.ml-foot-col{display:flex;flex-direction:column;gap:var(--v-s3);align-items:flex-start}
.ml-foot-link{
  display:inline-flex;align-items:baseline;gap:10px;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  color:var(--v-mut);cursor:pointer;background:none;border:0;padding:0;
}
.ml-foot-link:hover{color:var(--v-ink)}
.ml-foot-link .ml-fidx{color:var(--v-faint);font-size:var(--v-t-micro)}
.ml-wm{
  margin-top:var(--v-s8);display:flex;justify-content:space-between;
  font-family:var(--v-font-display);font-weight:500;letter-spacing:-.04em;line-height:.92;
  font-size:min(var(--v-t-giga),22vw);color:var(--v-faint);
  user-select:none;
}
.ml-wm-m{display:inline-block;overflow:hidden}
.ml-wm-ch{display:inline-block;will-change:transform}
.ml-foot-bottom{
  margin-top:var(--v-s7);padding-block:var(--v-s4);
  display:flex;align-items:baseline;justify-content:space-between;gap:var(--v-s4);flex-wrap:wrap;
  font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);
}
.ml-locales{display:inline-flex;gap:6px}
.ml-locales a{color:var(--v-faint)}
.ml-locales a:hover{color:var(--v-ink)}
.ml-locales a[data-current="true"]{color:var(--v-accent)}
.ml-foot-pad{padding-bottom:calc(env(safe-area-inset-bottom) + 88px)}
@media(min-width:768px){.ml-foot-pad{padding-bottom:var(--v-s6)}}

/* ═══ 12. Portfolio sheet (mechanics preserved, RULED skin) ══════════════
   Portaled to <body> — outside .ml-root's tweened palette, so it uses the
   static dark --v-* tokens directly. z-9999/10000 contract preserved.       */
.ml-bd{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(10,10,10,.82)}
@media(min-width:720px){.ml-bd{align-items:center;padding:20px}}
.ml-sheet{
  width:100%;max-width:660px;max-height:94svh;overflow-y:auto;
  border-radius:var(--v-radius);
  background:var(--v-bg-raise);border:1px solid var(--v-line);color:var(--v-ink);
  font-family:var(--v-font-body);
}
.ml-sheet::-webkit-scrollbar{display:none}.ml-sheet{scrollbar-width:none}
.ml-ph{position:relative;height:260px}
.ml-ph .v-xframe-in,.ml-ph-in{position:relative;height:100%}
.ml-ph img{width:100%;height:100%;object-fit:cover;display:block}
.ml-ph-grad{position:absolute;inset:0;background:linear-gradient(to top,var(--v-bg-raise),transparent 62%);pointer-events:none}
.ml-handle{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:38px;height:2px;background:rgba(244,243,240,.4);z-index:2}
.ml-x{
  position:absolute;top:14px;right:14px;z-index:2;width:38px;height:38px;border-radius:999px;
  background:rgba(10,10,10,.55);border:1px solid var(--v-line);color:var(--v-ink);
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:border-color .3s ease,color .3s ease;
}
.ml-x:hover{border-color:var(--v-accent);color:var(--v-accent)}
.ml-cap{position:absolute;left:var(--v-s5);bottom:var(--v-s4);right:var(--v-s5);z-index:1}
.ml-cap .ml-vcat{
  display:inline-block;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;
  text-transform:uppercase;color:var(--v-faint);margin-bottom:var(--v-s2);
}
.ml-cap h2{margin:0;font-family:var(--v-font-display);font-weight:500;font-size:1.9rem;letter-spacing:-.02em;line-height:1.05}
.ml-cap .ml-sub{font-size:var(--v-t-small);color:var(--v-mut);margin-top:4px}
.ml-pb{padding:var(--v-s5)}
.ml-psec{margin-bottom:var(--v-s6)}
.ml-pl{
  font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;
  color:var(--v-faint);margin:0 0 var(--v-s3);display:flex;gap:6px;align-items:center;
}
.ml-hline-s{height:1px;background:var(--v-line);margin-bottom:var(--v-s3)}
.ml-about{color:var(--v-mut);font-size:var(--v-t-small);line-height:1.7;margin:0}
.ml-gal{display:flex;gap:var(--v-s3);overflow-x:auto;margin:0 calc(-1*var(--v-s5));padding:0 var(--v-s5) 4px}
.ml-gal::-webkit-scrollbar{display:none}.ml-gal{scrollbar-width:none}
.ml-gal img{width:128px;height:158px;object-fit:cover;border-radius:var(--v-radius);flex-shrink:0;border:1px solid var(--v-line)}
.ml-krow{
  display:flex;align-items:baseline;justify-content:space-between;gap:var(--v-s4);
  padding-block:var(--v-s3);border-top:1px solid var(--v-line);
}
.ml-krow:last-child{border-bottom:1px solid var(--v-line)}
.ml-k{flex:0 0 auto;font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint)}
.ml-v{min-width:0;text-align:right;font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;color:var(--v-ink)}
.ml-v a{color:var(--v-ink)}
.ml-v a:hover{color:var(--v-accent)}
.ml-hr{display:flex;justify-content:space-between;gap:var(--v-s4);font-family:var(--v-font-mono);font-size:var(--v-t-micro);letter-spacing:.08em;text-transform:uppercase;color:var(--v-faint);padding-block:4px}
.ml-hh{color:var(--v-ink)}
.ml-map{height:200px;border-radius:var(--v-radius);overflow:hidden;border:1px solid var(--v-line);position:relative}
.ml-pcta{
  position:sticky;bottom:0;display:flex;gap:var(--v-s3);
  padding:var(--v-s4) var(--v-s5) calc(var(--v-s4) + env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--v-bg-raise) 60%,transparent);border-top:1px solid var(--v-line);
}
.ml-view{
  flex:1;display:flex;align-items:center;justify-content:center;gap:8px;
  background:var(--v-accent);color:var(--v-accent-ink)!important;
  font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  padding:16px;border-radius:var(--v-radius);
  transition:transform .12s ease;
}
.ml-view:active{transform:scale(.97)}
.ml-close2{
  padding:16px 22px;border-radius:var(--v-radius);border:1px solid var(--v-line);background:none;
  color:var(--v-ink);font-family:var(--v-font-mono);font-size:var(--v-t-mono);letter-spacing:.06em;text-transform:uppercase;
  cursor:pointer;transition:border-color .3s ease;
}
.ml-close2:hover{border-color:var(--v-accent)}

/* ═══ 13. Reduced-motion CSS guards ══════════════════════════════════════ */
@media(prefers-reduced-motion:reduce){
  .ml-nav,.ml-nav-line,.ml-how-row,.ml-how-idx,.ml-chip,.ml-btn,.ml-cta,.ml-cta-o{transition:none}
  .v-press:active{transform:none}
}
`;
