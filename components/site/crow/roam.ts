/**
 * The site's crow. It lives in the navbar logo, and roams the page.
 *
 *   HOME (the logo; the name is hidden while it sits there)
 *     -> after 7-8 s it takes off in the direction it faces and flies to a
 *        spot on the page (the top of a card, a footer letter) or off screen
 *   SPOT: looks around, now and then rests or stretches, then leaves again:
 *        to another spot, back home, or off screen
 *   OFF: a while later it flies in to a spot in view, or home
 *
 * One small canvas (a crow-sized box) follows the bird: it is moved with a
 * transform, so nothing big is ever repainted. Positions are the crow's feet
 * in viewport px; a perched crow follows its spot as the page scrolls.
 */

import { loadAnimation, type Anim, type AnimName } from "./sprites";
import { measureWorld, type World } from "./world";

export type RoamState = "PERCH" | "REST" | "STRETCH" | "TAKEOFF" | "FLY" | "LAND" | "OFF";

export type RoamSprites = { idle: Anim; takeoff: Anim } & Partial<Record<AnimName, Anim>>;

export interface RoamOptions {
  debug: boolean;
  /** The logo slot the crow calls home. */
  home: HTMLElement;
  /** Called with true when the crow is home (the name hides), false when it leaves. */
  onHome: (home: boolean) => void;
}

/** Where the crow can stand. */
type Spot =
  | { kind: "home" }
  | { kind: "card"; el: HTMLElement; fx: number }
  | { kind: "letter"; i: number }
  | { kind: "air"; x: number; y: number }; // off screen (flying away)

export const ROAM_BASE = "/crow/nav";
const FADE = 0.18;
const BOX_W = 3.6; // canvas box, in crow heights
const BOX_H = 3;
const FEET_X = 0.5; // feet inside the box (fractions)
const FEET_Y = 0.72;

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
  private pose: Pose = { anim: "idle", frame: 0, facing: 1 };
  private fade: { from: Pose; dx: number; dy: number; t: number } | null = null;
  private x = 0;
  private y = 0;
  private t = 0;
  private wait: number;
  private look = -1;
  private hold = 0;
  private stay = 0; // seconds on the current spot before leaving
  private onSpotFor = 0;
  private outOfView = 0;
  private restFor = 0;
  private flight = { x0: 0, y0: 0, cx: 0, cy: 0, dur: 1 };
  private size = 1;
  private crowH = 44;
  private world: World | null = null;
  private worldAt = 0;
  private scrollers = new WeakMap<HTMLElement, HTMLElement | null>();

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private scratch: HTMLCanvasElement | null = null;
  private dpr = 1;
  private boxW = 0;
  private boxH = 0;
  private drawn = "";
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
    c.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:55;will-change:transform";
    document.body.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext("2d")!;
    this.measure();
    // The page opens with the crow at home; 7-8 s later it sets off.
    this.wait = opts.debug ? 2 : rand(7, 8);
    this.stay = 0;
    opts.onHome(true);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    this.render();
    this.onVisibility();
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("scroll", this.onScroll, { capture: true });
    this.canvas.remove();
  }

  get debugState() {
    const [x, y] = this.feet();
    return { state: this.state, spot: this.spot.kind, target: this.target.kind, anim: this.pose.anim, frame: this.pose.frame, facing: this.pose.facing, wait: +this.wait.toFixed(2), x: Math.round(x), y: Math.round(y) };
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
    this.world = null;
    this.drawn = "";
    this.render();
  };

  // A perched crow follows its spot as the page (or a card rail) scrolls.
  private onScroll = () => {
    if (this.state === "OFF" || this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.render();
    });
  };

  private stop() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.raf = 0;
    this.timer = 0;
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
  // Spots
  // ----------------------------------------------------------------------

  private footerWorld(): World | null {
    const now = performance.now();
    if (this.world && now - this.worldAt < 2000) return this.world;
    const footer = document.querySelector<HTMLElement>("footer");
    const mark = footer?.querySelector<HTMLElement>("[data-crow-wordmark]");
    this.world = footer && mark ? measureWorld(footer, mark) : null;
    this.worldAt = now;
    return this.world;
  }

  /** The feet position of a spot, in viewport px (null if it's gone). */
  private resolve(s: Spot): [number, number] | null {
    switch (s.kind) {
      case "home": {
        const r = this.opts.home.getBoundingClientRect();
        const b = this.sprites.idle.bounds;
        return [r.left + Math.abs(b.left) * this.size + 1, r.top + this.crowH];
      }
      case "card": {
        if (!s.el.isConnected) return null;
        const r = s.el.getBoundingClientRect();
        return [r.left + r.width * s.fx, r.top + 1];
      }
      case "letter": {
        const w = this.footerWorld();
        const l = w?.letters[s.i];
        const f = document.querySelector("footer")?.getBoundingClientRect();
        if (!l || !f) return null;
        return [f.left + l.perchX, f.top + l.perchY];
      }
      case "air":
        return [s.x, s.y];
    }
  }

  private scroller(el: HTMLElement): HTMLElement | null {
    if (this.scrollers.has(el)) return this.scrollers.get(el)!;
    let p = el.parentElement;
    while (p && p !== document.body) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden)/.test(cs.overflowX + cs.overflowY)) break;
      p = p.parentElement;
    }
    const found = p && p !== document.body ? p : null;
    this.scrollers.set(el, found);
    return found;
  }

  /** In view, clear of the header, and not clipped by a scrolling rail. */
  private inView(s: Spot): boolean {
    if (s.kind === "home") return true;
    const p = this.resolve(s);
    if (!p) return false;
    const [x, y] = p;
    const head = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const m = this.crowH;
    if (x < m || x > window.innerWidth - m || y < head + m * 1.2 || y > window.innerHeight - 8) return false;
    if (s.kind === "card") {
      const sc = this.scroller(s.el);
      if (sc) {
        const r = sc.getBoundingClientRect();
        if (x < r.left + m * 0.6 || x > r.right - m * 0.6) return false;
      }
    }
    return true;
  }

  /** Spots in view right now (not the one the crow is on). */
  private spotsInView(): Spot[] {
    const out: Spot[] = [];
    document.querySelectorAll<HTMLElement>("[data-crow-perch]").forEach((el) => {
      const s: Spot = { kind: "card", el, fx: rand(0.22, 0.78) };
      if (!(this.spot.kind === "card" && this.spot.el === el) && this.inView(s)) out.push(s);
    });
    const w = this.footerWorld();
    w?.letters.forEach((_, i) => {
      const s: Spot = { kind: "letter", i };
      if (!(this.spot.kind === "letter" && this.spot.i === i) && this.inView(s)) out.push(s);
    });
    return out;
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
      this.fade = { from: { ...p }, dx: 0, dy: 0, t: 0 };
    }
    this.pose = { anim, frame, facing };
  }

  private feet(): [number, number] {
    if (this.state === "FLY" || this.state === "LAND" || this.state === "OFF") return [this.x, this.y];
    return this.resolve(this.spot) ?? [this.x, this.y];
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
        // Its spot is gone (another page) or scrolled away for a while: slip off.
        if (this.spot.kind !== "home") {
          if (!this.resolve(this.spot)) return this.vanish();
          this.outOfView = this.inView(this.spot) ? 0 : this.outOfView + dt;
          if (this.outOfView > (this.opts.debug ? 2 : 6)) return this.vanish();
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
            this.hold = rand(4, 9);
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
        // Something to do while it stays.
        const what: AnimName = Math.random() < 0.6 ? "rest" : "stretch";
        if (!s[what]) {
          this.need(what);
          this.wait = 4;
          break;
        }
        this.restFor = rand(8, 18);
        this.set(what === "rest" ? "REST" : "STRETCH");
        break;
      }
      case "STRETCH": {
        const a = s.stretch!;
        const f = Math.floor(this.t * a.fps);
        if (f >= a.frames) this.toPerch(rand(6, 14));
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
            this.toPerch(rand(6, 14));
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
          [this.x, this.y] = this.feet();
          if (this.spot.kind === "home") window.setTimeout(() => this.opts.onHome(false), 350);
          this.startFlight();
        }
        break;
      }
      case "FLY": {
        const a = s.takeoff;
        const fl = this.flight;
        const u = clamp(this.t / fl.dur, 0, 1);
        // The target may move (scrolling): aim at where it is now.
        const end = this.hoverPoint();
        if (!end) return this.vanish();
        const e = smooth(u);
        const ix = (1 - e) * (1 - e) * fl.x0 + 2 * (1 - e) * e * fl.cx + e * e * end[0];
        const iy = (1 - e) * (1 - e) * fl.y0 + 2 * (1 - e) * e * fl.cy + e * e * end[1];
        const face = Math.abs(ix - this.x) > 0.3 ? (ix > this.x ? 1 : -1) : this.pose.facing;
        this.x = ix;
        this.y = iy;
        const lift = a.marks?.liftoff ?? 0;
        const f = this.flightFrame(a, lift + 1 + Math.floor(this.t * a.fps));
        this.show("takeoff", f, face);
        if (u < 1) break;
        if (this.target.kind === "air") return this.vanish();
        // Land on the loop's first frame, which is where the landing begins.
        if (f === (a.loopStart ?? 0)) {
          this.flight = { ...this.flight, x0: this.x, y0: this.y };
          this.set("LAND");
          if (this.target.kind === "home") this.opts.onHome(true);
        }
        break;
      }
      case "LAND": {
        const a = s.takeoff;
        const lift = a.marks?.liftoff ?? 0;
        const start = a.loopStart ?? a.frames - 1;
        const k = Math.floor(this.t * a.fps);
        const f = Math.max(0, start - k);
        const to = this.resolve(this.target);
        if (!to) return this.vanish();
        const u = clamp(k / Math.max(1, start - lift), 0, 1);
        this.x = this.flight.x0 + (to[0] - this.flight.x0) * smooth(u);
        this.y = this.flight.y0 + (to[1] - this.flight.y0) * smooth(u);
        this.show("takeoff", f);
        if (f === 0) {
          this.spot = this.target;
          this.onSpotFor = 0;
          this.outOfView = 0;
          this.stay = this.spot.kind === "home" ? rand(25, 60) : rand(25, 70);
          if (this.opts.debug) this.stay = 6;
          this.toPerch(rand(3, 8));
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

  /** Take off from the current spot, in the direction it is facing. */
  private leave() {
    const here = this.feet();
    const spots = this.spotsInView();
    const ahead = spots.filter((p) => {
      const q = this.resolve(p);
      return q && Math.sign(q[0] - here[0]) === this.pose.facing;
    });
    const r = Math.random();
    if (this.spot.kind !== "home" && r < 0.3) this.target = { kind: "home" };
    else if (ahead.length && r < 0.75) this.target = pick(ahead);
    else if (spots.length && r < 0.85) this.target = pick(spots);
    else this.target = { kind: "air", x: this.pose.facing === 1 ? window.innerWidth + 90 : -90, y: here[1] - rand(60, 160) };
    this.set("TAKEOFF");
  }

  /** Back from off screen: fly in from the nearer side to a spot in view. */
  private appear() {
    const spots = this.spotsInView();
    this.target = spots.length && Math.random() < 0.75 ? pick(spots) : { kind: "home" };
    const end = this.resolve(this.target);
    if (!end) {
      this.wait = 3;
      return;
    }
    const fromLeft = end[0] < window.innerWidth / 2;
    this.x = fromLeft ? -80 : window.innerWidth + 80;
    this.y = Math.max(40, end[1] - rand(80, 200));
    this.pose = { anim: "takeoff", frame: this.sprites.takeoff.loopStart ?? 0, facing: fromLeft ? 1 : -1 };
    this.fade = null;
    this.startFlight();
  }

  /** Where the crow hovers before landing on the target. */
  private hoverPoint(): [number, number] | null {
    const p = this.resolve(this.target);
    return p ? [p[0], p[1] - 14 * this.size] : null;
  }

  private startFlight() {
    const end = this.hoverPoint() ?? [this.x, this.y];
    const dist = Math.hypot(end[0] - this.x, end[1] - this.y);
    // A gentle arc over the straight line.
    const lift = Math.min(160, 40 + dist * 0.25);
    this.flight = {
      x0: this.x,
      y0: this.y,
      cx: (this.x + end[0]) / 2,
      cy: Math.min(this.y, end[1]) - lift,
      dur: clamp(dist / (330 * this.size), 0.8, 3.2),
    };
    this.set("FLY");
  }

  /** Gone (off screen, or its spot went away): come back later. */
  private vanish() {
    if (this.spot.kind === "home" && this.state !== "FLY") this.opts.onHome(false);
    this.spot = { kind: "air", x: -200, y: -200 };
    this.fade = null;
    this.set("OFF");
    this.wait = this.opts.debug ? 3 : rand(12, 35);
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
    const [x, y] = this.feet();
    // Hidden: away, the menu is open, or its spot is under the header.
    const head = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const hidden =
      this.state === "OFF" ||
      menuOpen() ||
      (this.spot.kind !== "home" && (this.state === "PERCH" || this.state === "REST" || this.state === "STRETCH") && y < head + 4);
    c.style.visibility = hidden ? "hidden" : "visible";
    if (hidden) return;
    const ox = x - this.boxW * FEET_X;
    const oy = y - this.boxH * FEET_Y;
    c.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0)`;

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
