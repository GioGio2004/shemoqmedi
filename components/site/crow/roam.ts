/**
 * The site's crow. It lives in the navbar logo, and roams the page.
 *
 *   HOME (the logo): looks around, rests now and then. 7-8 s after the page
 *     loads it takes off in the direction it faces.
 *   SPOT (the top of a card, a footer letter): it lands, looks around, maybe
 *     stretches, and stays for its whole visit, then moves on: to another
 *     spot, back home, or off screen.
 *   OFF: a while later it flies back in, to a spot in view or home.
 *
 * Two spaces, so scrolling never makes it wobble:
 *   - page space: sitting on a spot, or flying to one. The canvas is
 *     absolutely positioned in the document, so the browser scrolls it with
 *     the content (no script runs on scroll). The landing point is fixed when
 *     the crow picks it.
 *   - view space: home in the fixed header, and flying off screen. The
 *     canvas is position: fixed.
 * One crow-sized canvas follows the bird, moved with a transform.
 */

import { loadAnimation, type Anim, type AnimName } from "./sprites";
import { measureWorld } from "./world";

export type RoamState = "PERCH" | "REST" | "STRETCH" | "TAKEOFF" | "FLY" | "LAND" | "OFF";
type Space = "page" | "view";

export type RoamSprites = { idle: Anim; takeoff: Anim } & Partial<Record<AnimName, Anim>>;

export interface RoamOptions {
  debug: boolean;
  /** The logo slot the crow calls home. */
  home: HTMLElement;
  /** True: the crow is (about to be) home, the name slides aside. False: it left. */
  onHome: (home: boolean) => void;
}

/** Where the crow can stand. Page spots keep the point picked at the time. */
type Spot =
  | { kind: "home" }
  | { kind: "card"; el: HTMLElement; x: number; y: number; fx: number }
  | { kind: "letter"; el: HTMLElement; x: number; y: number }
  | { kind: "air"; x: number; y: number };

export const ROAM_BASE = "/crow/nav";
const FADE = 0.18;
const BOX_W = 3.6; // canvas box, in crow heights
const BOX_H = 3;
const FEET_X = 0.5; // the feet inside the box (fractions)
const FEET_Y = 0.72;
const Z_FLIGHT = "55"; // above the header while flying
const Z_PERCH = "45"; // under the header when sitting on the page

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const menuOpen = () => document.documentElement.dataset.menuOpen !== undefined;

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
  /** The feet, in the current space. */
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
  private flight = { x0: 0, y0: 0, cx: 0, cy: 0, x1: 0, y1: 0, dur: 1 };
  private size = 1;
  private crowH = 44;
  /** Home's space: view in the fixed site header, page in a header that scrolls. */
  private homeSpace: Space = "view";

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private scratch: HTMLCanvasElement | null = null;
  private dpr = 1;
  private boxW = 0;
  private boxH = 0;
  private drawn = "";
  private placed = "";
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
    c.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;will-change:transform";
    document.body.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext("2d")!;
    this.homeSpace = this.fixedAncestor(opts.home) ? "view" : "page";
    this.space = this.homeSpace;
    this.measure();
    [this.x, this.y] = this.homePoint();
    // The page opens with the crow at home; 7-8 s later it sets off.
    this.wait = opts.debug ? 2 : rand(7, 8);
    this.stay = 0;
    this.look = -1;
    this.hold = this.wait;
    opts.onHome(true);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("resize", this.onResize);
    this.render();
    this.onVisibility();
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.onResize);
    this.canvas.remove();
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

  private onResize = () => {
    this.measure();
    // Sitting at home: follow the header. Sitting on the page: the layout
    // may have moved under it, so let it fly off and come back later.
    if (this.state !== "OFF" && this.spot.kind !== "home" && this.isSitting()) this.vanish();
    else if (this.spot.kind === "home" && this.isSitting()) [this.x, this.y] = this.homePoint();
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
    return this.state === "PERCH" || this.state === "REST" || this.state === "STRETCH";
  }

  private busy() {
    return !!this.fade || this.state === "TAKEOFF" || this.state === "FLY" || this.state === "LAND";
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
  // Spaces and spots
  // ----------------------------------------------------------------------

  /** Move the current position into the other space (page = view + scroll). */
  private setSpace(space: Space) {
    if (space === this.space) return;
    const sx = window.scrollX;
    const sy = window.scrollY;
    if (space === "page") {
      this.x += sx;
      this.y += sy;
      this.flight.x0 += sx;
      this.flight.y0 += sy;
    } else {
      this.x -= sx;
      this.y -= sy;
      this.flight.x0 -= sx;
      this.flight.y0 -= sy;
    }
    this.space = space;
    this.placed = "";
  }

  private spaceOf(s: Spot): Space {
    return s.kind === "home" ? this.homeSpace : s.kind === "air" ? "view" : "page";
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

  /** Is a viewport point a good place to land: in view, clear of the header, not clipped by a rail? */
  private landable(x: number, y: number, el?: HTMLElement, own?: HTMLElement): boolean {
    const head = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const m = this.crowH;
    // Keep away from the edges (the whole crow box stays on screen) and
    // from the header, so it has room to land and won't scroll out at once.
    const side = this.boxW * FEET_X + 4;
    if (x < side || x > window.innerWidth - side || y < head + m * 1.6 || y > window.innerHeight - m * 0.6) return false;
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

  /** Spots in view right now, with their landing points fixed in page space. */
  private spotsInView(): Spot[] {
    const out: Spot[] = [];
    const sx = window.scrollX;
    const sy = window.scrollY;
    document.querySelectorAll<HTMLElement>("[data-crow-perch]").forEach((el) => {
      if ((this.spot.kind === "card" && this.spot.el === el) || (this.target.kind === "card" && this.target.el === el)) return;
      const r = el.getBoundingClientRect();
      const fx = rand(0.22, 0.78);
      const vx = r.left + r.width * fx;
      const vy = r.top + 1;
      if (this.landable(vx, vy, el)) out.push({ kind: "card", el, fx, x: vx + sx, y: vy + sy });
    });
    // Big letter-split titles: the footer wordmark, the log-in title.
    document.querySelectorAll<HTMLElement>("[data-crow-wordmark]").forEach((mark) => {
      const w = measureWorld(mark, mark);
      const f = mark.getBoundingClientRect();
      const letters = mark.querySelectorAll<HTMLElement>("[data-crow-letter]");
      w?.letters.forEach((l) => {
        const el = letters[l.index];
        if (!el || (this.spot.kind === "letter" && this.spot.el === el)) return;
        const vx = f.left + l.perchX;
        const vy = f.top + l.perchY;
        if (this.landable(vx, vy, undefined, mark)) out.push({ kind: "letter", el, x: vx + sx, y: vy + sy });
      });
    });
    return out;
  }

  /** Has the spot moved from where the crow landed (a rail scrolled, the layout changed)? */
  private spotMoved(s: Spot): boolean {
    if (s.kind !== "card") return s.kind === "letter" && !s.el.isConnected;
    if (!s.el.isConnected) return true;
    const r = s.el.getBoundingClientRect();
    const x = r.left + r.width * s.fx + window.scrollX;
    const y = r.top + 1 + window.scrollY;
    return Math.abs(x - s.x) > 10 || Math.abs(y - s.y) > 10;
  }

  /** Is the crow's spot on screen now? */
  private spotVisible(s: Spot): boolean {
    if (s.kind === "home" && this.homeSpace === "view") return true;
    const [x, y] = this.point(s);
    const vx = x - window.scrollX;
    const vy = y - window.scrollY;
    return vx > -this.crowH && vx < window.innerWidth + this.crowH && vy > 0 && vy < window.innerHeight + this.crowH * 2;
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
    switch (this.state) {
      case "PERCH": {
        this.wait -= dt;
        this.onSpotFor += dt;
        if (this.spot.kind !== "home" && this.spotMoved(this.spot)) {
          // The card moved under it (its rail scrolled): off it goes.
          return this.spotVisible(this.spot) ? this.leave() : this.vanish();
        }
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
        if (this.wait > 0 || this.look > 0) break;
        if (menuOpen()) {
          this.wait = 2;
          break;
        }
        if (this.onSpotFor >= this.stay) return this.leave();
        // While it stays: rest only at home; on the page, at most a stretch.
        const home = this.spot.kind === "home";
        const what: AnimName | null = home ? (Math.random() < 0.7 ? "rest" : "stretch") : Math.random() < 0.3 ? "stretch" : null;
        if (!what) {
          this.wait = rand(3, 6);
          break;
        }
        if (!s[what]) {
          this.need(what);
          this.wait = 4;
          break;
        }
        this.restFor = rand(6, 12);
        this.set(what === "rest" ? "REST" : "STRETCH");
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
          if (this.spot.kind === "home") [this.x, this.y] = this.homePoint();
          if (this.spot.kind === "home") window.setTimeout(() => this.state !== "LAND" && this.opts.onHome(false), 350);
          this.startFlight();
        }
        break;
      }
      case "FLY": {
        const a = s.takeoff;
        const fl = this.flight;
        // Home is in the fixed header: aim at it as it is now. Page spots
        // keep the point picked at take-off, so the path never wobbles.
        if (this.target.kind === "home") {
          const [hx, hy] = this.homePoint();
          fl.x1 = hx;
          fl.y1 = hy - 14 * this.size;
          // Make room: the name slides aside just before the crow comes in.
          if (!this.homeCalled && this.t > fl.dur - 0.9) {
            this.homeCalled = true;
            this.opts.onHome(true);
          }
        }
        const u = clamp(this.t / fl.dur, 0, 1);
        const e = smooth(u);
        const nx = (1 - e) * (1 - e) * fl.x0 + 2 * (1 - e) * e * fl.cx + e * e * fl.x1;
        const ny = (1 - e) * (1 - e) * fl.y0 + 2 * (1 - e) * e * fl.cy + e * e * fl.y1;
        const face = Math.abs(nx - this.x) > 0.3 ? (nx > this.x ? 1 : -1) : this.pose.facing;
        this.x = nx;
        this.y = ny;
        const lift = a.marks?.liftoff ?? 0;
        const f = this.flightFrame(a, lift + 1 + Math.floor(this.t * a.fps));
        this.show("takeoff", f, face);
        if (u < 1) break;
        if (this.target.kind === "air") return this.vanish();
        // Land from the loop's first frame, which is where the landing starts.
        if (f === (a.loopStart ?? 0)) {
          fl.x0 = this.x;
          fl.y0 = this.y;
          if (this.target.kind === "home" && !this.homeCalled) {
            this.homeCalled = true;
            this.opts.onHome(true);
          }
          this.set("LAND");
        }
        break;
      }
      case "LAND": {
        const a = s.takeoff;
        const lift = a.marks?.liftoff ?? 0;
        const start = a.loopStart ?? a.frames - 1;
        const k = Math.floor(this.t * a.fps);
        const f = Math.max(0, start - k);
        const [tx, ty] = this.point(this.target);
        const u = clamp(k / Math.max(1, start - lift), 0, 1);
        this.x = this.flight.x0 + (tx - this.flight.x0) * smooth(u);
        this.y = this.flight.y0 + (ty - this.flight.y0) * smooth(u);
        this.show("takeoff", f);
        if (f === 0) {
          this.x = tx;
          this.y = ty;
          // At home it faces the name (right); a quick blend turns it round.
          if (this.target.kind === "home" && this.pose.facing === -1) this.show("idle", 0, 1);
          this.spot = this.target;
          this.onSpotFor = 0;
          // Lively, like the debug pace: short visits, home a little longer.
          this.stay = this.spot.kind === "home" ? rand(12, 24) : rand(9, 16);
          if (this.opts.debug) this.stay = 6;
          this.toPerch(rand(1.5, 3.5));
        }
        break;
      }
      case "OFF": {
        this.wait -= dt;
        if (this.wait > 0) break;
        if (menuOpen()) {
          this.wait = 2;
          break;
        }
        this.appear();
        break;
      }
    }
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
    const [hx, hy] = this.point(this.spot);
    const vx = hx - (this.space === "page" ? window.scrollX : 0);
    const vy = hy - (this.space === "page" ? window.scrollY : 0);
    const spots = this.spotsInView();
    const ahead = spots.filter((p) => Math.sign(this.point(p)[0] - window.scrollX - vx) === this.pose.facing);
    const r = Math.random();
    if (this.spot.kind !== "home" && r < 0.3) this.target = { kind: "home" };
    else if (ahead.length && r < 0.75) this.target = pick(ahead);
    else if (spots.length && r < 0.85) this.target = pick(spots);
    else this.target = { kind: "air", x: this.pose.facing === 1 ? window.innerWidth + 90 : -90, y: vy - rand(60, 160) };
    this.set("TAKEOFF");
  }

  /** Back from off screen: fly in from the nearer side to a spot in view, or home. */
  private appear() {
    const spots = this.spotsInView();
    this.target = spots.length && Math.random() < 0.75 ? pick(spots) : { kind: "home" };
    const tp = this.point(this.target);
    const page = this.spaceOf(this.target) === "page";
    const endVx = tp[0] - (page ? window.scrollX : 0);
    const endVy = tp[1] - (page ? window.scrollY : 0);
    const fromLeft = endVx < window.innerWidth / 2;
    // Start just off screen (view space), then fly in.
    this.space = "view";
    this.x = fromLeft ? -80 : window.innerWidth + 80;
    this.y = Math.max(40, endVy - rand(80, 200));
    this.pose = { anim: "takeoff", frame: this.sprites.takeoff.loopStart ?? 0, facing: fromLeft ? 1 : -1 };
    this.fade = null;
    this.startFlight();
  }

  private startFlight() {
    this.homeCalled = false;
    const space = this.spaceOf(this.target);
    this.flight.x0 = this.x;
    this.flight.y0 = this.y;
    this.setSpace(space);
    const [tx, ty] = this.point(this.target);
    const x1 = tx;
    const y1 = this.target.kind === "air" ? ty : ty - 14 * this.size;
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
    };
    this.set("FLY");
  }

  /** Gone (off screen, or its spot went away): come back later. */
  private vanish() {
    if (this.spot.kind === "home") this.opts.onHome(false);
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
    this.crowH = this.opts.home.clientHeight || 44;
    this.size = this.crowH / Math.abs(this.sprites.idle.bounds.top);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.boxW = Math.ceil(this.crowH * BOX_W);
    this.boxH = Math.ceil(this.crowH * BOX_H);
    const c = this.canvas;
    c.style.width = `${this.boxW}px`;
    c.style.height = `${this.boxH}px`;
    c.width = Math.round(this.boxW * this.dpr);
    c.height = Math.round(this.boxH * this.dpr);
  }

  private draw(ctx: CanvasRenderingContext2D, p: Pose, x: number, y: number) {
    const a = this.sprites[p.anim] ?? this.sprites.idle;
    const s = this.size / a.pixelRatio;
    const f = clamp(p.frame, 0, a.frames - 1);
    const cols = a.columns ?? a.frames;
    // Facing left, mirror around the body's middle so turning doesn't shift it.
    const b = this.sprites.idle.bounds;
    const shift = p.facing === -1 ? (b.left + b.right) * this.size : 0;
    ctx.save();
    ctx.translate(x + shift, y);
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
    const hidden = this.state === "OFF" || menuOpen();
    c.style.visibility = hidden ? "hidden" : "visible";
    if (hidden) return;

    // Where the box goes: fixed (view) or in the document (page). The style
    // only changes when the position does, so a sitting crow costs nothing.
    const sitting = this.isSitting();
    const flight = !sitting;
    const ox = this.x - this.boxW * FEET_X;
    const oy = this.y - this.boxH * FEET_Y;
    const place = `${this.space}|${flight}|${ox.toFixed(1)}|${oy.toFixed(1)}`;
    if (place !== this.placed) {
      this.placed = place;
      c.style.position = this.space === "page" ? "absolute" : "fixed";
      c.style.zIndex = flight || this.spot.kind === "home" ? Z_FLIGHT : Z_PERCH;
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
