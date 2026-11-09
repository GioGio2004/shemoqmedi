/**
 * The site's crow. It lives in the navbar logo, and roams the page.
 *
 *   HOME (the logo): looks around, rests now and then. 7-8 s after the page
 *     loads it takes off in the direction it faces.
 *   SPOT (the top of a card, a letter of a big title, a pill button): it
 *     lands, looks around, maybe stretches, stays for its whole visit, then
 *     moves on: to another spot, back home, or off screen. On a wide spot
 *     (a card's top edge, a playing video, a pill) it walks along it the way
 *     it faces, then flies on: walk, fly, walk, fly.
 *   OFF: a while later it flies back in, to a spot in view or home.
 *
 * Special perches (data-crow-perch="badge" | "countdown" | "video"): the SOTD
 * badge, a vote's countdown in its last day (it pecks at it) and a playing
 * walkthrough. They're picked more often, and it leaves once one stops being
 * a perch (the video paused).
 * Tap it while it sits on the page: a ruffle, a hop across the screen, or
 * now and then it flies off to a featured site ("Surprise me").
 *
 * Two spaces, so scrolling never makes it wobble:
 *   - page space: sitting on a spot, or flying to one. The canvas is
 *     absolutely positioned in the document, so the browser scrolls it with
 *     the content (no script runs on scroll). Landing points are fixed when
 *     the crow picks them (re-aimed only if the spot itself moves).
 *   - view space: home in the fixed site header, and flying off screen.
 * One crow-sized canvas follows the bird, moved with a transform.
 *
 * x/y are where the sprite is drawn from (its anchor). Facing right that is
 * the feet; facing left the bird is mirrored around its body, so the feet
 * sit `shift` px away, and landings aim the anchor so the feet hit the spot.
 */

import { loadAnimation, type Anim, type AnimName } from "./sprites";
import { measureWorld } from "./world";

export type RoamState = "PERCH" | "REST" | "STRETCH" | "PECK" | "WALK" | "TURN" | "TAKEOFF" | "FLY" | "LAND" | "OFF";
type Space = "page" | "view";

export type RoamSprites = { idle: Anim; takeoff: Anim } & Partial<Record<AnimName, Anim>>;

export interface RoamOptions {
  debug: boolean;
  /** The logo slot the crow calls home. */
  home: HTMLElement;
  /** True: the crow is (about to be) home, the name slides aside. False: it left. */
  onHome: (home: boolean) => void;
  /** "Surprise me": the address of a featured site to fly off to, or null. */
  surprise?: () => Promise<string | null>;
  /** Client-side navigation (the router). */
  navigate?: (href: string) => void;
}

/**
 * Where the crow can stand. Page spots keep the feet point picked at the
 * time (x, y) and where their element was then (ex, ey), in page px.
 */
type Spot =
  | { kind: "home" }
  | { kind: "card"; el: HTMLElement; fx: number; x: number; y: number; ex: number; ey: number }
  | { kind: "letter"; el: HTMLElement; x: number; y: number; ex: number; ey: number }
  | { kind: "air"; x: number; y: number };
type PageSpot = Extract<Spot, { kind: "card" | "letter" }>;

export const ROAM_BASE = "/crow/nav";
const FADE = 0.18;
const BOX_W = 3.6; // canvas box, in crow heights
const BOX_H = 3;
const FEET_X = 0.5; // the anchor inside the box (fractions)
const FEET_Y = 0.72;
const HOVER = 24; // CSS px (at the 48 px sheet size) above the spot before landing
const Z_FLIGHT = "55"; // above the header while flying and at home
const Z_PERCH = "20"; // sitting on the page: under the header, sticky bars, the menu
const WALK_PLAY = 1.4; // walk sheet playback speed (the feet still match the ground)
const WALK_MIN_W = 160; // CSS px: a perch at least this wide is walked along
const TURN_PLAY = 1.5; // turn-around playback speed

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const menuOpen = () => document.documentElement.dataset.menuOpen !== undefined;
const isPage = (s: Spot): s is PageSpot => s.kind === "card" || s.kind === "letter";
/** The kind of a special perch ("badge", "countdown", "video"), or "" for a plain one. */
const perchKind = (s: Spot) => (s.kind === "card" ? (s.el.dataset.crowPerch ?? "") : "");
/** Special perches are worth the trip: picked four times as often. */
const weighted = (xs: Spot[]) => {
  const w = xs.map((x) => (perchKind(x) ? 4 : 1));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < xs.length; i++) if ((r -= w[i]) < 0) return xs[i];
  return xs[xs.length - 1];
};

interface Pose {
  anim: AnimName;
  frame: number;
  facing: 1 | -1;
}

export class CrowRoamer {
  private state: RoamState = "PERCH";
  private spot: Spot = { kind: "home" };
  private target: Spot = { kind: "home" };
  private space: Space = "view";
  private pose: Pose = { anim: "idle", frame: 0, facing: 1 };
  private fade: { from: Pose; t: number } | null = null;
  private x = 0;
  private y = 0;
  private t = 0;
  private wait: number;
  private look = -1;
  private hold = 0;
  private stay = 0; // seconds to spend on the current spot
  private onSpotFor = 0;
  private restFor = 0;
  private homeCalled = false;
  private leftHomeTimer = 0;
  private flight = { x0: 0, y0: 0, cx: 0, cy: 0, x1: 0, y1: 0, dur: 1, k0: 0, face: 1 as 1 | -1 };
  private landFrom = 0;
  /** First arrival of the page: goes home (or to the must-visit spot). */
  private firstArrival = true;
  private firstHome = true;
  /** The page's must-visit spot (data-crow-goto) has been visited. */
  private gotoDone = false;
  private lastScroll = 0;
  private size = 1;
  private crowH = 44;
  private lastW = 0;
  /** Home's space: view in the fixed site header, page in a header that scrolls. */
  private homeSpace: Space = "view";
  private pecks = 2;
  /** Walk along this perch before flying on (set on landing on a wide one). */
  private walkNext = false;
  private walkTo = 0;
  private walkDir: 1 | -1 = 1;
  /** A turn-around in place: the feet stay at turnFeet; then perch or walk on. */
  private turnFrom: 1 | -1 = 1;
  private turnFeet = 0;
  private turnThen: "perch" | "walk" | "takeoff" = "perch";
  /** A "Surprise me" flight: where to go once it's off screen. */
  private surpriseTo: Promise<string | null> | null = null;
  private hoverRaf = 0;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private scratch: HTMLCanvasElement | null = null;
  private dpr = 1;
  private boxW = 0;
  private boxH = 0;
  private drawn = "";
  private placed = "";
  private shown: boolean | null = null;
  private loading = new Set<AnimName>();

  private raf = 0;
  private timer = 0;
  private last = 0;
  private running = false;
  private destroyed = false;

  constructor(
    private readonly sprites: RoamSprites,
    private readonly opts: RoamOptions,
  ) {
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.className = "crow-roam";
    c.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;will-change:transform";
    document.body.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext("2d")!;
    this.homeSpace = this.fixedAncestor(opts.home) ? "view" : "page";
    this.space = this.homeSpace;
    this.measure();
    // No logo on load: once the header is there, the crow flies in (to the
    // page's must-visit spot if it has one, else home to the logo).
    this.spot = { kind: "air", x: -200, y: -200 };
    this.target = this.spot;
    this.space = "view";
    this.state = "OFF";
    this.wait = 0.35;
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    // Taps: the canvas lets every pointer through, so hits are tested here.
    window.addEventListener("click", this.onClick, true);
    if (window.matchMedia("(hover: hover)").matches) window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.render();
    this.onVisibility();
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    clearTimeout(this.leftHomeTimer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("click", this.onClick, true);
    window.removeEventListener("pointermove", this.onPointerMove);
    cancelAnimationFrame(this.hoverRaf);
    document.documentElement.style.cursor = "";
    this.canvas.remove();
  }

  /** A client-side page change: anything on the old page is gone. */
  routeChanged() {
    this.gotoDone = false;
    if (this.state === "OFF") return;
    if (this.space === "page" && !(this.spot.kind === "home" && this.isSitting())) this.vanish();
    else if (this.spot.kind === "home" && this.isSitting()) [this.x, this.y] = this.homePoint();
    this.render();
  }

  get debugState() {
    return {
      state: this.state,
      spot: this.spot.kind,
      target: this.target.kind,
      space: this.space,
      anim: this.pose.anim,
      frame: this.pose.frame,
      facing: this.pose.facing,
      wait: +this.wait.toFixed(2),
      x: Math.round(this.x),
      y: Math.round(this.y),
    };
  }

  /** Debug: do the next thing now. */
  next() {
    if (this.state === "REST" || this.state === "STRETCH") this.toPerch(0);
    this.wait = 0;
    this.stay = 0;
    this.hold = 0;
    this.look = -1;
    this.stop();
    this.schedule();
  }

  private need(name: AnimName) {
    if (this.sprites[name] || this.loading.has(name)) return;
    this.loading.add(name);
    void loadAnimation(name, ROAM_BASE).then((a) => {
      if (a) this.sprites[name] = a;
    });
  }

  // ----------------------------------------------------------------------
  // Loop
  // ----------------------------------------------------------------------

  private onVisibility = () => {
    const run = document.visibilityState === "visible" && !this.destroyed;
    if (run === this.running) return;
    this.running = run;
    if (run) {
      this.last = 0;
      this.schedule();
    } else this.stop();
  };

  private onScroll = () => {
    this.lastScroll = performance.now();
    // Sitting on the page: check this frame whether a sticky bar now covers it.
    if (this.running && !this.raf && this.isSitting() && isPage(this.spot)) {
      clearTimeout(this.timer);
      this.timer = 0;
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  private onResize = () => {
    const w = window.innerWidth;
    const h = this.opts.home.clientHeight || 44;
    // Phones fire resize whenever the URL bar shows or hides: only the height
    // changes, nothing the crow stands on moves sideways. Keep it there.
    if (w === this.lastW && h === this.crowH) {
      if (this.spot.kind === "home" && this.isSitting()) [this.x, this.y] = this.homePoint();
      this.render();
      return;
    }
    this.measure();
    if (this.isSitting()) {
      if (this.spot.kind === "home") [this.x, this.y] = this.homePoint();
      else if (this.spotMoved(this.spot)) this.vanish();
    }
    this.drawn = "";
    this.placed = "";
    this.render();
  };

  private stop() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.raf = 0;
    this.timer = 0;
  }

  private isSitting() {
    return (
      this.state === "PERCH" || this.state === "REST" || this.state === "STRETCH" || this.state === "PECK" || this.state === "WALK"
    );
  }

  private busy() {
    return (
      !!this.fade ||
      this.state === "TAKEOFF" ||
      this.state === "FLY" ||
      this.state === "LAND" ||
      this.state === "WALK" ||
      this.state === "TURN"
    );
  }

  private schedule() {
    if (!this.running || this.raf || this.timer) return;
    if (this.busy()) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    let ms: number;
    if (this.state === "OFF") ms = Math.max(0, this.wait) * 1000;
    else if (this.state === "PERCH" && this.look < 0) ms = Math.max(50, Math.min(this.hold, this.wait, 1) * 1000);
    else ms = 1000 / (this.sprites[this.pose.anim] ?? this.sprites.idle).fps - 4;
    this.timer = window.setTimeout(() => {
      this.timer = 0;
      this.raf = requestAnimationFrame(this.tick);
    }, ms);
  }

  private tick = (now: number) => {
    this.raf = 0;
    const cap = this.busy() ? 0.1 : 30;
    const dt = this.last ? Math.min((now - this.last) / 1000, cap) : 0;
    this.last = now;
    this.update(dt);
    this.render();
    this.schedule();
  };

  // ----------------------------------------------------------------------
  // Taps
  // ----------------------------------------------------------------------

  /** Is this screen point on the bird (an inked pixel, give or take a finger)? Only while it sits on the page. */
  private hit(cx: number, cy: number): boolean {
    if (!this.isSitting() || !isPage(this.spot) || this.surpriseTo) return false;
    const r = this.canvas.getBoundingClientRect();
    const lx = cx - r.left;
    const ly = cy - r.top;
    if (lx < 0 || ly < 0 || lx > r.width || ly > r.height) return false;
    const d = this.dpr;
    const rad = 7;
    const x0 = Math.max(0, Math.floor((lx - rad) * d));
    const y0 = Math.max(0, Math.floor((ly - rad) * d));
    const w = Math.min(this.canvas.width - x0, Math.ceil(rad * 2 * d));
    const h = Math.min(this.canvas.height - y0, Math.ceil(rad * 2 * d));
    if (w <= 0 || h <= 0) return false;
    const px = this.ctx.getImageData(x0, y0, w, h).data;
    for (let i = 3; i < px.length; i += 4) if (px[i] > 60) return true;
    return false;
  }

  private onClick = (e: MouseEvent) => {
    if (!this.hit(e.clientX, e.clientY)) return;
    // The tap was for the crow, not the card or link under it.
    e.preventDefault();
    e.stopPropagation();
    this.react();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.hoverRaf) return;
    this.hoverRaf = requestAnimationFrame(() => {
      this.hoverRaf = 0;
      document.documentElement.style.cursor = this.hit(e.clientX, e.clientY) ? "pointer" : "";
    });
  };

  /** Tapped: a ruffle, a hop to the other side of the screen, or now and then "Surprise me". */
  private react() {
    document.documentElement.style.cursor = "";
    this.need("stretch");
    const r = Math.random();
    if (r < 0.2 && this.opts.surprise && this.opts.navigate) return this.surprise();
    if (r < 0.55 || !this.sprites.stretch) return this.hopAcross();
    this.set("STRETCH");
    this.wake();
  }

  private hopAcross() {
    const [vx, vy] = this.toView(this.x, this.y);
    const side = vx < window.innerWidth / 2 ? 1 : -1; // the far half of the screen
    const spots = this.spotsInView().filter((p) => (this.point(p)[0] - window.scrollX - window.innerWidth / 2) * side > 0);
    this.target = spots.length
      ? weighted(spots)
      : { kind: "air", x: side === 1 ? window.innerWidth + 90 : -90, y: vy - rand(60, 140) };
    // Facing away from it: turn round first, then take off.
    if (side !== this.pose.facing && this.sprites.turn && isPage(this.spot)) this.startTurn(this.spot.x, "takeoff");
    else this.set("TAKEOFF");
    this.wake();
  }

  private surprise() {
    this.surpriseTo = this.opts.surprise!().catch(() => null);
    const vy = this.toView(this.x, this.y)[1];
    this.target = { kind: "air", x: this.pose.facing === 1 ? window.innerWidth + 90 : -90, y: vy - rand(80, 160) };
    this.set("TAKEOFF");
    this.wake();
  }

  /** Act now, not at the next scheduled tick. */
  private wake() {
    this.stop();
    this.schedule();
  }

  // ----------------------------------------------------------------------
  // Spaces, spots, geometry
  // ----------------------------------------------------------------------

  /** Facing left the bird is mirrored around its body: the feet sit this far from the anchor. */
  private shift(facing: 1 | -1) {
    const b = this.sprites.idle.bounds;
    return facing === -1 ? (b.left + b.right) * this.size : 0;
  }

  private spaceOf(s: Spot): Space {
    return s.kind === "home" ? this.homeSpace : s.kind === "air" ? "view" : "page";
  }

  private setSpace(space: Space) {
    if (space === this.space) return;
    const dx = space === "page" ? window.scrollX : -window.scrollX;
    const dy = space === "page" ? window.scrollY : -window.scrollY;
    this.x += dx;
    this.y += dy;
    this.space = space;
    this.placed = "";
  }

  private fixedAncestor(el: HTMLElement): boolean {
    for (let p: HTMLElement | null = el; p; p = p.parentElement) {
      const pos = getComputedStyle(p).position;
      if (pos === "fixed" || pos === "sticky") return true;
    }
    return false;
  }

  /** Home's feet point, in home's space. */
  private homePoint(): [number, number] {
    const r = this.opts.home.getBoundingClientRect();
    const b = this.sprites.idle.bounds;
    const page = this.homeSpace === "page";
    return [
      r.left + Math.abs(b.left) * this.size + 1 + (page ? window.scrollX : 0),
      r.top + this.crowH + (page ? window.scrollY : 0),
    ];
  }

  /** A spot's feet point, in its own space. */
  private point(s: Spot): [number, number] {
    return s.kind === "home" ? this.homePoint() : [s.x, s.y];
  }

  /** The lowest edge of what covers the top of the screen: the header, stuck bars. */
  private ceiling(): number {
    let c = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    document.querySelectorAll<HTMLElement>("[data-crow-ceiling]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < c + 4 && r.bottom > c) c = r.bottom; // stuck under the header
    });
    return Math.max(0, c);
  }

  /** The nearest scrolling ancestor (a card rail), if any. */
  private scroller(el: HTMLElement): HTMLElement | null {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden)/.test(cs.overflowX + cs.overflowY)) return p;
      p = p.parentElement;
    }
    return null;
  }

  /** A good viewport point to land on: in view, clear of the bars, not clipped, no text above. */
  private landable(x: number, y: number, ceiling: number, el?: HTMLElement, own?: HTMLElement): boolean {
    const m = this.crowH;
    // The whole crow box stays on screen; room above it to land.
    const side = this.boxW * FEET_X + 4;
    if (x < side || x > window.innerWidth - side || y < ceiling + m * 1.6 || y > window.innerHeight - m * 0.6) return false;
    if (el) {
      const sc = this.scroller(el);
      if (sc) {
        const r = sc.getBoundingClientRect();
        if (x < r.left + m * 0.7 || x > r.right - m * 0.7) return false;
      }
    }
    return this.clearAbove(x, y, own ?? el);
  }

  /** No text where the crow's body would be (black on black reads badly). */
  private clearAbove(x: number, y: number, own?: HTMLElement): boolean {
    const w = this.crowH * 0.75;
    for (const dy of [0.35, 0.65, 0.95]) {
      for (const dx of [-w, -w / 2, 0, w / 2]) {
        const el = document.elementFromPoint(x + dx, y - this.crowH * dy);
        if (!el || (own && own.contains(el))) continue; // its own title or card
        for (const n of el.childNodes) {
          if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) return false;
        }
      }
    }
    return true;
  }

  /** Spots in view right now, with their points fixed in page space. */
  private spotsInView(): Spot[] {
    const out: Spot[] = [];
    const sx = window.scrollX;
    const sy = window.scrollY;
    const ceiling = this.ceiling();
    const taken = (el: HTMLElement) =>
      (isPage(this.spot) && this.spot.el === el) || (isPage(this.target) && this.target.el === el);
    document.querySelectorAll<HTMLElement>("[data-crow-perch]").forEach((el) => {
      if (taken(el)) return;
      const r = el.getBoundingClientRect();
      // A small perch (a badge): stand on its middle, clear of the card's rounded corner.
      const fx = r.width < 140 ? rand(0.42, 0.72) : rand(0.22, 0.78);
      const vx = r.left + r.width * fx;
      const vy = r.top + 1;
      if (this.landable(vx, vy, ceiling, el))
        out.push({ kind: "card", el, fx, x: vx + sx, y: vy + sy, ex: r.left + sx, ey: r.top + sy });
    });
    // Big letter-split titles: the footer wordmark, the log-in title.
    document.querySelectorAll<HTMLElement>("[data-crow-wordmark]").forEach((mark) => {
      const w = measureWorld(mark, mark);
      const f = mark.getBoundingClientRect();
      const letters = mark.querySelectorAll<HTMLElement>("[data-crow-letter]");
      w?.letters.forEach((l) => {
        const el = letters[l.index];
        if (!el || taken(el)) return;
        const vx = f.left + l.perchX;
        const vy = f.top + l.perchY;
        if (!this.landable(vx, vy, ceiling, undefined, mark)) return;
        const r = el.getBoundingClientRect();
        out.push({ kind: "letter", el, x: vx + sx, y: vy + sy, ex: r.left + sx, ey: r.top + sy });
      });
    });
    return out;
  }

  /** The page's must-visit letter (data-crow-goto), if it's in view and landable. */
  private gotoSpot(): Spot | null {
    const el = document.querySelector<HTMLElement>("[data-crow-goto]");
    const mark = el?.closest<HTMLElement>("[data-crow-wordmark]");
    if (!el || !mark) return null;
    const w = measureWorld(mark, mark);
    const idx = Array.from(mark.querySelectorAll<HTMLElement>("[data-crow-letter]")).indexOf(el);
    const l = w?.letters.find((x) => x.index === idx);
    if (!l) return null;
    const f = mark.getBoundingClientRect();
    const vx = f.left + l.perchX;
    const vy = f.top + l.perchY;
    if (!this.landable(vx, vy, this.ceiling(), undefined, mark)) return null;
    const r = el.getBoundingClientRect();
    return { kind: "letter", el, x: vx + window.scrollX, y: vy + window.scrollY, ex: r.left + window.scrollX, ey: r.top + window.scrollY };
  }

  /** How far a page spot's element has moved since it was picked (page px), or null if gone. */
  private moved(s: PageSpot): [number, number] | null {
    if (!s.el.isConnected) return null;
    const r = s.el.getBoundingClientRect();
    return [r.left + window.scrollX - s.ex, r.top + window.scrollY - s.ey];
  }

  private spotMoved(s: Spot): boolean {
    if (!isPage(s)) return false;
    const d = this.moved(s);
    return !d || Math.abs(d[0]) > 10 || Math.abs(d[1]) > 10;
  }

  /** On screen and below the bars? (A spot hidden under the header counts as gone.) */
  private spotVisible(s: Spot): boolean {
    if (s.kind === "home") return true;
    const [x, y] = this.point(s);
    const vx = x - window.scrollX;
    const vy = y - window.scrollY;
    return vx > -this.crowH && vx < window.innerWidth + this.crowH && vy > this.ceiling() + this.crowH * 0.3 && vy < window.innerHeight + this.crowH;
  }

  // ----------------------------------------------------------------------
  // Behaviour
  // ----------------------------------------------------------------------

  private set(state: RoamState) {
    this.state = state;
    this.t = 0;
  }

  private show(anim: AnimName, frame: number, facing: 1 | -1 = this.pose.facing) {
    const p = this.pose;
    if ((anim !== p.anim || facing !== p.facing) && !this.fade && this.state !== "OFF") {
      this.fade = { from: { ...p }, t: 0 };
    }
    this.pose = { anim, frame, facing };
  }

  private update(dt: number) {
    this.t += dt;
    if (this.fade) {
      this.fade.t += dt;
      if (this.fade.t >= FADE) this.fade = null;
    }
    const s = this.sprites;
    // Sitting on a spot that moved under it (a rail scrolled, the layout changed): off it goes.
    if (this.isSitting() && this.spotMoved(this.spot)) {
      return this.spotVisible(this.spot) && this.moved(this.spot as PageSpot) ? this.leave() : this.vanish();
    }
    // A sticky bar (or the header) slid over it: up and away, above the bar.
    if (this.isSitting() && isPage(this.spot) && this.spot.y - window.scrollY - this.crowH < this.ceiling() + 2) return this.leave();
    // Its perch stopped being one (the walkthrough paused, the vote closed): off it goes.
    if (this.isSitting() && this.spot.kind === "card" && !this.spot.el.hasAttribute("data-crow-perch")) return this.leave();
    switch (this.state) {
      case "PERCH": {
        this.wait -= dt;
        this.onSpotFor += dt;
        // A slow look around, then still.
        const idle = s.idle;
        let f = 0;
        if (this.look >= 0) {
          this.look += dt;
          f = Math.floor(this.look * idle.fps);
          if (f >= idle.frames) {
            f = 0;
            this.look = -1;
            this.hold = rand(3, 6);
          }
        } else {
          this.hold -= dt;
          if (this.hold <= 0) this.look = 0;
        }
        this.show("idle", f);
        // A page with a must-visit spot (the log-in I): from the logo, straight down.
        if (this.spot.kind === "home" && !this.gotoDone && this.state === "PERCH" && this.t > 0.6 && !menuOpen()) {
          const g = this.gotoSpot();
          if (g) {
            this.target = g;
            this.set("TAKEOFF");
            break;
          }
        }
        if (this.wait > 0 || this.look > 0) break;
        // Not while the menu is open, nor mid-scroll (the space switch at
        // take-off reads the scroll position).
        if (menuOpen() || performance.now() - this.lastScroll < 150) {
          this.wait = 0.25;
          break;
        }
        // Just landed on a wide perch: walk along it first (then fly on).
        if (this.walkNext) {
          this.walkNext = false;
          if (this.startWalk()) break;
        }
        if (this.onSpotFor >= this.stay) return this.leave();
        // While it stays: rest only at home; on the page, at most a stretch;
        // on a closing vote's countdown, it pecks at the clock.
        const home = this.spot.kind === "home";
        const clock = perchKind(this.spot) === "countdown";
        let what: AnimName | null;
        if (home) what = Math.random() < 0.7 ? "rest" : "stretch";
        else if (clock) what = Math.random() < 0.8 ? "pickup" : null;
        else what = Math.random() < 0.3 ? "stretch" : null;
        if (!what) {
          this.wait = clock ? rand(1.5, 3) : rand(3, 6);
          break;
        }
        if (!s[what]) {
          this.need(what);
          this.wait = 4;
          break;
        }
        this.restFor = this.opts.debug ? 2 : rand(6, 12);
        this.pecks = Math.random() < 0.5 ? 2 : 3;
        this.set(what === "rest" ? "REST" : what === "pickup" ? "PECK" : "STRETCH");
        break;
      }
      case "TURN": {
        const a = s.turn!;
        if (this.spot.kind === "home") [this.turnFeet, this.y] = this.homePoint();
        const k = Math.floor(this.t * a.fps * TURN_PLAY);
        if (k < a.frames) {
          this.x = this.turnFeet - this.shift(this.turnFrom);
          this.show("turn", k, this.turnFrom);
          break;
        }
        // Turned: the same stance, facing the other way.
        const face: 1 | -1 = this.turnFrom === 1 ? -1 : 1;
        this.x = this.turnFeet - this.shift(face);
        this.show("idle", 0, face);
        if (this.turnThen === "walk") this.set("WALK");
        else if (this.turnThen === "takeoff") this.set("TAKEOFF");
        else this.toPerch(rand(1.5, 3.5));
        break;
      }
      case "WALK": {
        const a = s.walk!;
        const spot = this.spot;
        if (spot.kind !== "card") {
          this.toPerch(1);
          break;
        }
        const step = (a.speed ?? 24) * this.size * WALK_PLAY * dt;
        let feet = spot.x + this.walkDir * step;
        const done = this.walkDir === 1 ? feet >= this.walkTo : feet <= this.walkTo;
        if (done) feet = this.walkTo;
        spot.x = feet;
        this.x = feet - this.shift(this.walkDir);
        this.show("walk", Math.floor(this.t * a.fps * WALK_PLAY) % a.frames, this.walkDir);
        if (done) {
          // Walked: straight on into the take-off (a special perch keeps its longer visit).
          if (perchKind(spot)) this.toPerch(rand(0.6, 1.4));
          else return this.leave();
        }
        break;
      }
      case "PECK": {
        // Bend down to the clock, a few quick pecks, straight back up.
        const a = s.pickup!;
        const c = a.marks?.contact ?? a.frames - 1;
        const m = Math.floor(c * 0.55);
        const fps = a.fps * 1.5;
        const down = c / fps;
        const peck = (2 * (c - m)) / fps;
        let f: number;
        if (this.t < down) f = this.t * fps;
        else if (this.t < down + this.pecks * peck) {
          const u = (this.t - down) % peck;
          f = u < peck / 2 ? c - u * fps : m + (u - peck / 2) * fps;
        } else {
          f = c - (this.t - down - this.pecks * peck) * fps;
          if (f <= 0) {
            this.toPerch(rand(3, 6));
            break;
          }
        }
        this.show("pickup", clamp(Math.floor(f), 0, a.frames - 1));
        break;
      }
      case "STRETCH": {
        const a = s.stretch!;
        const f = Math.floor(this.t * a.fps);
        if (f >= a.frames) this.toPerch(rand(2, 5));
        else this.show("stretch", f);
        break;
      }
      case "REST": {
        const a = s.rest!;
        const loop = a.marks?.loop ?? Math.floor(a.frames / 2);
        const rise = a.marks?.rise ?? a.frames - 1;
        const down = loop / a.fps;
        const span = Math.max(1, rise - loop);
        let f: number;
        if (this.t < down) f = Math.floor(this.t * a.fps);
        else if (this.t < down + this.restFor) {
          const k = Math.floor((this.t - down) * a.fps * 0.5) % (2 * span);
          f = loop + (k < span ? k : 2 * span - k - 1);
        } else {
          f = rise + Math.floor((this.t - down - this.restFor) * a.fps);
          if (f >= a.frames) {
            this.toPerch(rand(2, 5));
            break;
          }
        }
        this.show("rest", clamp(f, 0, a.frames - 1));
        break;
      }
      case "TAKEOFF": {
        const a = s.takeoff;
        const lift = a.marks?.liftoff ?? a.air?.start ?? 0;
        const f = Math.floor(this.t * a.fps);
        this.show("takeoff", Math.min(f, a.frames - 1));
        if (f > lift) {
          if (this.spot.kind === "home") {
            [this.x, this.y] = this.homePoint();
            // The name slides into the spot once the crow is clear of it.
            this.leftHomeTimer = window.setTimeout(() => {
              if (!this.destroyed && this.state !== "LAND" && this.spot.kind !== "home") this.opts.onHome(false);
            }, 350);
            this.spot = { kind: "air", x: this.x, y: this.y };
          }
          this.startFlight(lift + 1);
        }
        break;
      }
      case "FLY": {
        const a = s.takeoff;
        const fl = this.flight;
        if (this.target.kind === "home") {
          // Home is in the header: aim at it as it is now.
          const [hx, hy] = this.homePoint();
          fl.x1 = hx - this.shift(fl.face);
          fl.y1 = hy - HOVER * this.size;
          // Make room: the name slides aside just before the crow comes in.
          if (!this.homeCalled && this.t > fl.dur - 0.9) {
            this.homeCalled = true;
            this.opts.onHome(true);
          }
        } else if (isPage(this.target) && !this.reaim(this.target)) {
          // Its spot went away: fly on and off the screen instead.
          return this.redirectOff();
        }
        const u = clamp(this.t / fl.dur, 0, 1);
        const e = smooth(u);
        const nx = (1 - e) * (1 - e) * fl.x0 + 2 * (1 - e) * e * fl.cx + e * e * fl.x1;
        const ny = (1 - e) * (1 - e) * fl.y0 + 2 * (1 - e) * e * fl.cy + e * e * fl.y1;
        const face = Math.abs(nx - this.x) > 0.3 ? (nx > this.x ? 1 : -1) : this.pose.facing;
        this.x = nx;
        this.y = ny;
        const f = this.flightFrame(a, fl.k0 + Math.floor(this.t * a.fps));
        this.show("takeoff", f, face);
        if (u < 1) break;
        if (this.target.kind === "air") return this.vanish();
        // Land at once, from whatever wing-beat frame is showing.
        if (this.target.kind === "home" && !this.homeCalled) {
          this.homeCalled = true;
          this.opts.onHome(true);
        }
        this.landFrom = f;
        fl.x0 = this.x;
        fl.y0 = this.y;
        this.set("LAND");
        break;
      }
      case "LAND": {
        // The take-off backwards from the current frame: hover, legs down,
        // touch down, stand up out of the crouch.
        const a = s.takeoff;
        const lift = a.marks?.liftoff ?? 0;
        if (isPage(this.target) && !this.reaim(this.target)) return this.redirectOff();
        const k = this.t * a.fps;
        const f = Math.max(0, this.landFrom - Math.floor(k));
        const [tx, ty] = this.point(this.target);
        const ax = tx - this.shift(this.pose.facing);
        const u = smooth(clamp(k / Math.max(1, this.landFrom - lift), 0, 1));
        this.x = this.flight.x0 + (ax - this.flight.x0) * u;
        this.y = this.flight.y0 + (ty - this.flight.y0) * u;
        this.show("takeoff", f);
        if (f === 0) {
          this.x = ax;
          this.y = ty;
          this.spot = this.target;
          // At home it faces the name (right). Landed facing left: it turns round.
          const turnHome = this.spot.kind === "home" && this.pose.facing === -1 && !!s.turn;
          if (this.spot.kind === "home" && !turnHome) {
            [this.x, this.y] = this.homePoint();
            this.show("idle", 0, 1);
          }
          this.onSpotFor = 0;
          this.stay = this.spot.kind === "home" ? rand(12, 24) : rand(9, 16);
          if (this.opts.debug) this.stay = 6;
          if (this.spot.kind === "home" && this.firstHome) this.stay = this.opts.debug ? 2 : rand(7, 8);
          if (this.spot.kind === "home") this.firstHome = false;
          if (perchKind(this.spot)) this.stay = this.opts.debug ? 8 : rand(14, 24);
          this.need("walk");
          this.need("turn");
          this.walkNext = this.walkable(this.spot);
          if (perchKind(this.spot) === "countdown") this.need("pickup");
          if (isPage(this.spot) && this.spot.el.hasAttribute("data-crow-goto")) {
            this.gotoDone = true;
            this.stay = this.opts.debug ? 8 : rand(30, 60); // it came here on purpose: it stays
          }
          this.toPerch(rand(1.5, 3.5));
          if (turnHome) this.startTurn(this.homePoint()[0], "perch");
        }
        break;
      }
      case "OFF": {
        this.wait -= dt;
        if (this.wait > 0) break;
        if (menuOpen() || performance.now() - this.lastScroll < 150) {
          this.wait = 0.5;
          break;
        }
        this.appear();
        break;
      }
    }
  }

  /** Follow a page target that moved (a rail scrolled mid-flight). False if it can't be reached. */
  private reaim(s: PageSpot): boolean {
    const d = this.moved(s);
    if (!d) return false;
    if (Math.abs(d[0]) < 2 && Math.abs(d[1]) < 2) return true;
    const nx = s.x + d[0];
    const ny = s.y + d[1];
    const ceiling = this.ceiling();
    const own = s.kind === "letter" ? (s.el.closest<HTMLElement>("[data-crow-wordmark]") ?? undefined) : undefined;
    if (!this.landable(nx - window.scrollX, ny - window.scrollY, ceiling, s.kind === "card" ? s.el : undefined, own)) return false;
    s.x = nx;
    s.y = ny;
    s.ex += d[0];
    s.ey += d[1];
    if (this.state === "FLY") {
      this.flight.x1 = nx - this.shift(this.flight.face);
      this.flight.y1 = ny - HOVER * this.size;
    }
    return true;
  }

  private redirectOff() {
    this.setSpace("view");
    this.target = { kind: "air", x: this.pose.facing === 1 ? window.innerWidth + 90 : -90, y: this.y - 120 };
    this.startFlight(this.flight.k0 + Math.floor(this.t * this.sprites.takeoff.fps));
  }

  /** A perch wide enough to walk along (not a badge or a countdown). */
  private walkable(s: Spot): boolean {
    if (s.kind !== "card") return false;
    const k = perchKind(s);
    return k !== "badge" && k !== "countdown" && s.el.getBoundingClientRect().width >= WALK_MIN_W;
  }

  /** Walk along the perch the way it faces (or turn, if that end is near). False if there's no room. */
  private startWalk(): boolean {
    const spot = this.spot;
    if (spot.kind !== "card" || !this.sprites.walk) return false;
    const r = spot.el.getBoundingClientRect();
    const m = this.crowH * 0.9; // clear of the rounded corners
    const side = this.boxW * FEET_X + 4; // the crow box stays on screen
    const lo = Math.max(r.left + m, side) + window.scrollX;
    const hi = Math.min(r.right - m, window.innerWidth - side) + window.scrollX;
    const feet = spot.x;
    let dir = this.pose.facing;
    const room = (d: 1 | -1) => (d === 1 ? hi - feet : feet - lo);
    if (room(dir) < 50 && room(dir === 1 ? -1 : 1) > room(dir)) dir = dir === 1 ? -1 : 1;
    if (room(dir) < 40) return false;
    this.walkDir = dir;
    this.walkTo = feet + dir * Math.min(room(dir), rand(90, 220));
    if (dir !== this.pose.facing && this.sprites.turn) this.startTurn(feet, "walk");
    else this.set("WALK");
    return true;
  }

  /** Turn round on the spot (feet at `feet`, in the current space), then perch or walk. */
  private startTurn(feet: number, then: "perch" | "walk" | "takeoff") {
    this.turnFrom = this.pose.facing;
    this.turnFeet = feet;
    this.turnThen = then;
    this.x = feet - this.shift(this.turnFrom);
    this.set("TURN");
  }

  private toPerch(wait: number) {
    this.set("PERCH");
    this.wait = this.opts.debug ? Math.min(wait, 2) : wait;
    this.look = -1;
    this.hold = rand(1, 3);
  }

  /** The visit is over: take off in the direction it faces (or slip away unseen). */
  private leave() {
    if (!this.spotVisible(this.spot)) return this.vanish();
    const [vx] = this.toView(this.x, this.y);
    const spots = this.spotsInView();
    const ahead = spots.filter((p) => Math.sign(this.point(p)[0] - window.scrollX - vx) === this.pose.facing);
    const r = Math.random();
    const vy = this.toView(this.x, this.y)[1];
    // Only ever the way it faces: home if that's ahead, a spot ahead, or off screen ahead.
    const hx = this.homePoint()[0] - (this.homeSpace === "page" ? window.scrollX : 0);
    const homeAhead = Math.sign(hx - vx) === this.pose.facing;
    if (this.spot.kind !== "home" && homeAhead && r < 0.3) this.target = { kind: "home" };
    else if (ahead.length && r < 0.85) this.target = weighted(ahead);
    else this.target = { kind: "air", x: this.pose.facing === 1 ? window.innerWidth + 90 : -90, y: vy - rand(60, 160) };
    this.set("TAKEOFF");
  }

  private toView(x: number, y: number): [number, number] {
    return this.space === "page" ? [x - window.scrollX, y - window.scrollY] : [x, y];
  }

  /** Back from off screen: fly in from the nearer side to a spot in view, or home. */
  private appear() {
    this.need("turn");
    const goto = this.gotoDone ? null : this.gotoSpot();
    const spots = goto || this.firstArrival ? [] : this.spotsInView();
    this.target = goto ?? (spots.length && Math.random() < 0.75 ? weighted(spots) : { kind: "home" });
    this.firstArrival = false;
    const tp = this.point(this.target);
    const page = this.spaceOf(this.target) === "page";
    const endVx = tp[0] - (page ? window.scrollX : 0);
    const endVy = tp[1] - (page ? window.scrollY : 0);
    const fromLeft = endVx < window.innerWidth / 2;
    // Start just off screen (view space), already in flight.
    this.space = "view";
    this.x = fromLeft ? -80 : window.innerWidth + 80;
    this.y = Math.max(40, endVy - rand(80, 200));
    this.pose = { anim: "takeoff", frame: this.sprites.takeoff.loopStart ?? 0, facing: fromLeft ? 1 : -1 };
    this.fade = null;
    this.startFlight(this.sprites.takeoff.loopStart ?? 0);
  }

  /** Fly from here to the target; k0 is the first take-off sheet frame of the flight. */
  private startFlight(k0: number) {
    this.homeCalled = false;
    this.setSpace(this.spaceOf(this.target));
    const [tx, ty] = this.point(this.target);
    const face: 1 | -1 = Math.abs(tx - this.x) > 2 ? (tx > this.x ? 1 : -1) : this.pose.facing;
    const air = this.target.kind === "air";
    const x1 = air ? tx : tx - this.shift(face);
    const y1 = air ? ty : ty - HOVER * this.size;
    const dist = Math.hypot(x1 - this.x, y1 - this.y);
    const lift = Math.min(160, 40 + dist * 0.25); // a gentle arc
    this.flight = {
      x0: this.x,
      y0: this.y,
      cx: (this.x + x1) / 2,
      cy: Math.min(this.y, y1) - lift,
      x1,
      y1,
      dur: clamp(dist / (330 * this.size), 0.8, 3.2),
      k0,
      face,
    };
    this.set("FLY");
  }

  /** Gone (off screen, or its spot went away): come back later. */
  private vanish() {
    clearTimeout(this.leftHomeTimer);
    if (this.surpriseTo) {
      const go = this.surpriseTo;
      this.surpriseTo = null;
      void go.then((href) => {
        if (href && !this.destroyed) this.opts.navigate?.(href);
      });
    }
    if (this.spot.kind === "home" || this.target.kind === "home") this.opts.onHome(false);
    this.spot = { kind: "air", x: -200, y: -200 };
    this.target = this.spot;
    this.fade = null;
    this.setSpace("view");
    this.set("OFF");
    this.wait = this.opts.debug ? 3 : rand(4, 9);
    this.drawn = "";
    this.render();
  }

  private flightFrame(a: Anim, k: number) {
    const start = a.loopStart ?? 0;
    if (k < start) return k;
    return start + ((k - start) % (a.frames - start));
  }

  // ----------------------------------------------------------------------
  // Drawing: one small canvas, moved with a transform.
  // ----------------------------------------------------------------------

  private measure() {
    this.lastW = window.innerWidth;
    this.crowH = this.opts.home.clientHeight || 44;
    this.size = this.crowH / Math.abs(this.sprites.idle.bounds.top);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const boxW = Math.ceil(this.crowH * BOX_W);
    const boxH = Math.ceil(this.crowH * BOX_H);
    if (boxW === this.boxW && boxH === this.boxH && dpr === this.dpr) return; // keep the bitmap
    this.dpr = dpr;
    this.boxW = boxW;
    this.boxH = boxH;
    const c = this.canvas;
    c.style.width = `${boxW}px`;
    c.style.height = `${boxH}px`;
    c.width = Math.round(boxW * dpr);
    c.height = Math.round(boxH * dpr);
    this.drawn = "";
  }

  private draw(ctx: CanvasRenderingContext2D, p: Pose, x: number, y: number) {
    const a = this.sprites[p.anim] ?? this.sprites.idle;
    const s = this.size / a.pixelRatio;
    const f = clamp(p.frame, 0, a.frames - 1);
    const cols = a.columns ?? a.frames;
    ctx.save();
    ctx.translate(x + this.shift(p.facing), y);
    ctx.scale(p.facing, 1);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      a.img,
      (f % cols) * a.frameWidth,
      Math.floor(f / cols) * a.frameHeight,
      a.frameWidth,
      a.frameHeight,
      -a.anchor.x * s,
      -a.anchor.y * s,
      a.frameWidth * s,
      a.frameHeight * s,
    );
    ctx.restore();
  }

  private render() {
    if (this.destroyed) return;
    const c = this.canvas;
    const show = this.state !== "OFF";
    if (show !== this.shown) {
      this.shown = show;
      c.style.visibility = show ? "visible" : "hidden";
    }
    if (!show) return;


    // Where the box goes: fixed (view) or in the document (page). Styles are
    // only written when they change, so a sitting crow costs nothing.
    const atHome = this.spot.kind === "home" && this.isSitting();
    const [x, y] = atHome ? this.homePoint() : [this.x, this.y];
    const sittingOnPage = isPage(this.spot) && (this.isSitting() || this.state === "TURN");
    const ox = x - this.boxW * FEET_X;
    const oy = y - this.boxH * FEET_Y;
    const place = `${this.space}|${sittingOnPage}|${ox.toFixed(1)}|${oy.toFixed(1)}`;
    if (place !== this.placed) {
      this.placed = place;
      c.style.position = this.space === "page" ? "absolute" : "fixed";
      c.style.zIndex = sittingOnPage ? Z_PERCH : Z_FLIGHT;
      c.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`;
    }

    const key = `${this.pose.anim}|${this.pose.frame}|${this.pose.facing}|${this.fade ? this.fade.t.toFixed(3) : ""}`;
    if (key === this.drawn && !this.opts.debug) return;
    this.drawn = key;
    const d = this.dpr;
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    const fx = this.boxW * FEET_X;
    const fy = this.boxH * FEET_Y;
    if (!this.fade) {
      ctx.setTransform(d, 0, 0, d, 0, 0);
      this.draw(ctx, this.pose, fx, fy);
    } else {
      const u = smooth(clamp(this.fade.t / FADE, 0, 1));
      const sc = (this.scratch ??= document.createElement("canvas"));
      if (sc.width !== c.width || sc.height !== c.height) {
        sc.width = c.width;
        sc.height = c.height;
      }
      const g = sc.getContext("2d")!;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, sc.width, sc.height);
      g.setTransform(d, 0, 0, d, 0, 0);
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = 1 - u;
      this.draw(g, this.fade.from, fx, fy);
      g.globalAlpha = u;
      this.draw(g, this.pose, fx, fy);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
      ctx.drawImage(sc, 0, 0);
    }
    if (this.opts.debug) {
      ctx.setTransform(d, 0, 0, d, 0, 0);
      ctx.fillStyle = "#c2410c";
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillText(`${this.state} → ${this.target.kind}`, 2, 10);
    }
  }
}
