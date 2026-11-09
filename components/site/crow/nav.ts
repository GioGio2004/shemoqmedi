/**
 * The navbar crow: a small live crow in the logo slot.
 *
 *   PERCH (a look around, then still; now and then a rest or a stretch)
 *     -> TAKEOFF -> FLY_OUT (up and off to the left; the wordmark slides over
 *        the crow's spot) -> AWAY
 *     -> FLY_IN (the wordmark slides back) -> LAND -> PERCH
 *
 * The first page of a visit opens with that departure (the intro). While
 * perched the crow is drawn on a small canvas inside the slot; in the air on
 * a fixed canvas over the top-left of the page, created only for the flight.
 * Positions are the crow's feet in viewport px. The slot never changes its
 * layout width: the header does not reflow when the crow comes and goes.
 */

import { loadAnimation, type Anim, type AnimName } from "./sprites";

export type NavState = "PERCH" | "REST" | "STRETCH" | "TAKEOFF" | "FLY_OUT" | "AWAY" | "FLY_IN" | "LAND";

export type NavSprites = { idle: Anim } & Partial<Record<AnimName, Anim>>;

export interface NavOptions {
  debug: boolean;
  /** Start with the departure (first page of the visit). */
  intro: boolean;
  /** Seconds until the crow comes back, when it was away on the last page. */
  awayFor: number;
  /** Called with true when the crow is in the slot, false when it is gone. */
  onSlot: (home: boolean) => void;
  /** Called with the epoch ms of the return, or 0 when home again. */
  onAway: (until: number) => void;
}

export const NAV_BASE = "/crow/nav";
const FADE = 0.18;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);
const menuOpen = () => document.documentElement.dataset.menuOpen !== undefined;

interface Pose {
  anim: AnimName;
  frame: number;
  facing: 1 | -1;
}

export class NavCrowEngine {
  private state: NavState = "PERCH";
  private pose: Pose = { anim: "idle", frame: 0, facing: 1 };
  private fade: { from: Pose; x: number; y: number; t: number } | null = null;
  private x = 0; // feet while flying (viewport px)
  private y = 0;
  private flying = false;
  private closed = false;
  private t = 0; // seconds in the current state
  private wait = 0; // seconds until the next perch event / the return
  private look = 0; // perch: seconds into the current look-around (-1 = holding still)
  private hold = 0;
  private landedAt = 0; // performance.now() of the last landing
  private stay = 0; // seconds to stay before leaving again
  private vx = 0;
  private vy = 0;
  private from = { x: 0, y: 0 };
  private size = 1;
  private slotW = 68;
  private slotH = 44;
  private drawn = "";

  private readonly perch: CanvasRenderingContext2D;
  private sky: HTMLCanvasElement | null = null;
  private skyCtx: CanvasRenderingContext2D | null = null;
  private scratch: HTMLCanvasElement | null = null;
  private dpr = 1;
  private loading = new Set<AnimName>();
  private later = 0;

  private raf = 0;
  private timer = 0;
  private last = 0;
  private running = false;
  private destroyed = false;

  constructor(
    private readonly slot: HTMLElement,
    private readonly canvas: HTMLCanvasElement,
    private readonly sprites: NavSprites,
    private readonly opts: NavOptions,
  ) {
    this.perch = canvas.getContext("2d")!;
    this.measure();
    this.landedAt = performance.now();
    this.stay = rand(70, 160);
    if (opts.awayFor > 0) {
      // It was away on the previous page: stay away for the rest of the time.
      this.closed = true;
      opts.onSlot(false);
      this.set("AWAY");
      this.wait = opts.awayFor;
    } else {
      this.wait = opts.intro ? (opts.debug ? 1 : 1.6) : rand(8, 20);
      // The intro leaves from the still pose; otherwise start with a look.
      this.look = opts.intro ? -1 : 0;
      this.hold = opts.intro ? this.wait : 0;
    }
    if (opts.intro || opts.awayFor > 0) this.need("takeoff");
    else this.later = window.setTimeout(() => this.need("takeoff"), 15000);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("resize", this.onResize);
    this.render();
    this.onVisibility();
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    clearTimeout(this.later);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("resize", this.onResize);
    this.removeSky();
  }

  get debugState() {
    return { state: this.state, anim: this.pose.anim, frame: this.pose.frame, facing: this.pose.facing, wait: this.wait, t: this.t, x: this.x, y: this.y };
  }

  /** Debug: do the next thing now. */
  next() {
    this.wait = 0;
    this.stay = 0;
    this.look = -1;
    this.hold = 0;
    if (this.state === "AWAY") this.t = this.wait;
    this.stop();
    this.schedule();
  }

  /** Fetch a sheet the crow will need soon (once). */
  private need(name: AnimName) {
    if (this.sprites[name] || this.loading.has(name)) return;
    this.loading.add(name);
    void loadAnimation(name, NAV_BASE).then((a) => {
      if (a) this.sprites[name] = a;
    });
  }

  // ----------------------------------------------------------------------
  // Loop: rAF while moving or blending; timers while it stands still or is
  // away. Nothing is redrawn unless the picture changes.
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
    if (this.sky) this.sizeSky();
    this.drawn = "";
    this.render();
  };

  private stop() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.timer);
    this.raf = 0;
    this.timer = 0;
  }

  private busy() {
    return this.flying || !!this.fade || this.state === "TAKEOFF" || this.state === "LAND";
  }

  private schedule() {
    if (!this.running || this.raf || this.timer) return;
    if (this.busy()) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }
    let ms: number;
    if (this.state === "AWAY") ms = Math.max(0, this.wait - this.t) * 1000;
    else if (this.state === "PERCH" && this.look < 0) ms = Math.max(50, Math.min(this.hold, this.wait) * 1000);
    else ms = 1000 / (this.sprites[this.pose.anim] ?? this.sprites.idle).fps - 4;
    this.timer = window.setTimeout(() => {
      this.timer = 0;
      this.raf = requestAnimationFrame(this.tick);
    }, ms);
  }

  private tick = (now: number) => {
    this.raf = 0;
    // Long gaps are normal while it stands still (timers); in motion keep
    // the steps small so a stall can't teleport the crow.
    const cap = this.busy() ? 0.1 : 30;
    const dt = this.last ? Math.min((now - this.last) / 1000, cap) : 0;
    this.last = now;
    this.update(dt);
    this.render();
    this.schedule();
  };

  // ----------------------------------------------------------------------
  // Behaviour
  // ----------------------------------------------------------------------

  private set(state: NavState) {
    this.state = state;
    this.t = 0;
  }

  private show(anim: AnimName, frame: number, facing: 1 | -1 = this.pose.facing) {
    const p = this.pose;
    if ((anim !== p.anim || facing !== p.facing) && !this.fade) {
      const [x, y] = this.feet();
      this.fade = { from: { ...p }, x, y, t: 0 };
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
        // One slow look around, then still for a while: calm, not a loop.
        const idle = s.idle;
        let f = 0;
        if (this.look >= 0) {
          this.look += dt;
          f = Math.floor(this.look * idle.fps);
          if (f >= idle.frames) {
            f = 0;
            this.look = -1;
            this.hold = rand(4, 10);
          }
        } else {
          this.hold -= dt;
          if (this.hold <= 0) this.look = 0;
        }
        this.show("idle", f, 1);
        if (this.wait > 0 || this.look > 0) break; // events start from the still pose
        if (menuOpen()) {
          this.wait = 3;
          break;
        }
        const stayed = (performance.now() - this.landedAt) / 1000;
        if (this.opts.intro || stayed >= this.stay) {
          if (!s.takeoff) {
            this.need("takeoff");
            this.wait = 2;
            break;
          }
          this.opts.intro = false;
          this.set("TAKEOFF");
        } else {
          const pick: AnimName = Math.random() < 0.3 ? "stretch" : "rest";
          if (!s[pick]) {
            this.need(pick);
            this.wait = rand(10, 20);
            break;
          }
          this.hold = rand(8, 20);
          this.set(pick === "rest" ? "REST" : "STRETCH");
        }
        break;
      }
      case "STRETCH": {
        const a = s.stretch!;
        const f = Math.floor(this.t * a.fps);
        if (f >= a.frames) this.toPerch();
        else this.show("stretch", f, 1);
        break;
      }
      case "REST": {
        // Settle (0 -> loop), hold by swinging slowly between loop and rise,
        // then get up (rise -> end, which ends on the standing pose).
        const a = s.rest!;
        const loop = a.marks?.loop ?? Math.floor(a.frames / 2);
        const rise = a.marks?.rise ?? a.frames - 1;
        const down = loop / a.fps;
        const span = Math.max(1, rise - loop);
        let f: number;
        if (this.t < down) f = Math.floor(this.t * a.fps);
        else if (this.t < down + this.hold) {
          const k = Math.floor((this.t - down) * a.fps * 0.5) % (2 * span);
          f = loop + (k < span ? k : 2 * span - k - 1);
        } else {
          f = rise + Math.floor((this.t - down - this.hold) * a.fps);
          if (f >= a.frames) {
            this.toPerch();
            break;
          }
        }
        this.show("rest", clamp(f, 0, a.frames - 1), 1);
        break;
      }
      case "TAKEOFF": {
        // Turn to face left (a quick blend), crouch, lift off.
        const a = s.takeoff!;
        const lift = a.marks?.liftoff ?? a.air?.start ?? 0;
        const f = Math.floor(this.t * a.fps);
        this.show("takeoff", Math.min(f, a.frames - 1), -1);
        if (f > lift) {
          [this.x, this.y] = this.feet();
          this.flying = true;
          this.closed = false;
          this.makeSky();
          this.vx = -40 * this.size;
          this.vy = -230 * this.size; // up first, clear of the wordmark
          this.set("FLY_OUT");
        }
        break;
      }
      case "FLY_OUT": {
        const a = s.takeoff!;
        this.vx -= 560 * this.size * dt;
        this.vy = Math.min(this.vy + 260 * this.size * dt, -20); // climb, then level out
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        // Carry on from lift-off through the climb, then the flight loop.
        const lift = a.marks?.liftoff ?? 0;
        this.show("takeoff", this.flightFrame(a, lift + 1 + Math.floor(this.t * a.fps)), -1);
        const right = a.bounds.right * this.size;
        if (!this.closed && (this.t > 0.35 || this.x + right < this.slot.getBoundingClientRect().left)) {
          this.closed = true;
          this.opts.onSlot(false); // the wordmark slides over the crow's spot
        }
        if (this.x + right < -12 || this.y < -40) {
          if (!this.closed) this.opts.onSlot(false);
          this.closed = true;
          this.flying = false;
          this.removeSky();
          this.wait = this.opts.debug ? 4 : rand(45, 120);
          this.opts.onAway(Date.now() + this.wait * 1000);
          this.set("AWAY");
          this.wait = this.opts.debug ? 4 : this.wait;
        }
        break;
      }
      case "AWAY": {
        if (this.t < this.wait) break;
        if (menuOpen() || !s.takeoff) {
          this.need("takeoff");
          this.wait = this.t + 3;
          break;
        }
        // Come back from the left, at the logo's height.
        this.opts.onSlot(true);
        this.closed = false;
        const [tx, ty] = this.slotFeet();
        this.from = { x: -70 * this.size, y: ty - 26 * this.size };
        this.x = this.from.x;
        this.y = this.from.y;
        this.flying = true;
        this.makeSky();
        this.fade = null; // off screen: nothing to blend from
        this.pose = { anim: "takeoff", frame: s.takeoff.loopStart ?? 0, facing: 1 };
        this.set("FLY_IN");
        this.wait = Math.max(0.9, (tx - this.x) / (240 * this.size));
        break;
      }
      case "FLY_IN": {
        const a = s.takeoff!;
        const [tx, ty] = this.slotFeet();
        const hover = { x: tx, y: ty - 14 * this.size };
        const u = clamp(this.t / this.wait, 0, 1);
        this.x = this.from.x + (hover.x - this.from.x) * easeOut(u);
        this.y = this.from.y + (hover.y - this.from.y) * smooth(u);
        const start = a.loopStart ?? 0;
        const f = this.flightFrame(a, start + Math.floor(this.t * a.fps));
        this.show("takeoff", f, 1);
        // Land on the loop's start frame, which is where landing begins.
        if (u >= 1 && f === start) {
          this.from = { x: this.x, y: this.y };
          this.set("LAND");
        }
        break;
      }
      case "LAND": {
        // The take-off backwards: hover, legs down, touch down, stand up.
        const a = s.takeoff!;
        const lift = a.marks?.liftoff ?? 0;
        const start = a.loopStart ?? a.frames - 1;
        const k = Math.floor(this.t * a.fps);
        const f = Math.max(0, start - k);
        const [tx, ty] = this.slotFeet();
        const u = clamp(k / Math.max(1, start - lift), 0, 1);
        this.x = this.from.x + (tx - this.from.x) * smooth(u);
        this.y = this.from.y + (ty - this.from.y) * smooth(u);
        this.show("takeoff", f, 1);
        if (f <= lift && this.flying) {
          this.flying = false;
          this.removeSky();
        }
        if (f === 0) {
          this.landedAt = performance.now();
          this.stay = rand(70, 160);
          this.opts.onAway(0);
          this.toPerch();
        }
        break;
      }
    }
  }

  private toPerch() {
    this.set("PERCH");
    this.wait = rand(20, 45);
    this.look = -1;
    this.hold = rand(2, 5);
  }

  /** Frame k of the take-off sheet, wrapping inside the flight loop. */
  private flightFrame(a: Anim, k: number) {
    const start = a.loopStart ?? 0;
    if (k < start) return k;
    return start + ((k - start) % (a.frames - start));
  }

  // ----------------------------------------------------------------------
  // Geometry and drawing
  // ----------------------------------------------------------------------

  /** Crow size from the slot's height (smaller slot on very narrow phones). */
  private measure() {
    this.slotH = this.slot.clientHeight || 44;
    this.slotW = Math.round((this.slotH * 68) / 44);
    this.size = this.slotH / Math.abs(this.sprites.idle.bounds.top);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const padX = this.padX();
    const padY = this.padY();
    // Room below the feet for the wings lowered in the crouch.
    const below = Math.ceil(26 * this.size);
    const w = Math.ceil(this.slotW + 2 * padX);
    const h = Math.ceil(this.slotH + padY + below);
    const c = this.canvas;
    c.style.left = `${-padX}px`;
    c.style.top = `${-padY}px`;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    c.width = Math.round(w * this.dpr);
    c.height = Math.round(h * this.dpr);
    this.drawn = "";
  }

  private padX() {
    return Math.round(70 * this.size);
  }
  private padY() {
    return Math.round(64 * this.size);
  }

  /** Where the feet stand in the slot (viewport px). */
  private slotFeet(): [number, number] {
    const r = this.slot.getBoundingClientRect();
    const b = this.sprites.idle.bounds;
    return [r.left + Math.abs(b.left) * this.size + 1, r.top + this.slotH];
  }

  private feet(): [number, number] {
    return this.flying ? [this.x, this.y] : this.slotFeet();
  }

  private makeSky() {
    if (this.sky) return;
    const c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:60";
    document.body.appendChild(c);
    this.sky = c;
    this.skyCtx = c.getContext("2d");
    this.sizeSky();
  }

  /** Only the corridor the flight uses: the top-left of the page. */
  private sizeSky() {
    const c = this.sky!;
    const r = this.slot.getBoundingClientRect();
    const w = Math.min(window.innerWidth, Math.ceil(r.right + 260));
    const h = Math.ceil(r.bottom + 120);
    if (c.style.width === `${w}px` && c.style.height === `${h}px`) return;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    c.width = Math.round(w * this.dpr);
    c.height = Math.round(h * this.dpr);
  }

  private removeSky() {
    this.sky?.remove();
    this.sky = null;
    this.skyCtx = null;
    this.drawn = "";
  }

  private draw(ctx: CanvasRenderingContext2D, p: Pose, x: number, y: number) {
    const a = this.sprites[p.anim] ?? this.sprites.idle;
    const s = this.size / a.pixelRatio;
    const f = clamp(p.frame, 0, a.frames - 1);
    const cols = a.columns ?? a.frames;
    // Facing left, mirror around the body's middle, not the feet, so the
    // turn doesn't shift the bird.
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
    const [x, y] = this.feet();
    const key = `${this.state}|${this.pose.anim}|${this.pose.frame}|${this.pose.facing}|${x.toFixed(1)}|${y.toFixed(1)}|${this.fade ? this.fade.t.toFixed(3) : ""}|${!!this.sky}`;
    if (key === this.drawn && !this.opts.debug) return;
    this.drawn = key;

    const d = this.dpr;
    const pc = this.perch;
    pc.setTransform(1, 0, 0, 1, 0, 0);
    pc.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const sky = this.skyCtx;
    if (sky) {
      sky.setTransform(1, 0, 0, 1, 0, 0);
      sky.clearRect(0, 0, this.sky!.width, this.sky!.height);
    }
    if (this.state === "AWAY") return;
    const onSky = this.flying && !!sky;
    const target = onSky ? sky! : pc;
    const r = this.slot.getBoundingClientRect();
    const ox = onSky ? 0 : r.left - this.padX();
    const oy = onSky ? 0 : r.top - this.padY();

    if (!this.fade) {
      target.setTransform(d, 0, 0, d, -ox * d, -oy * d);
      this.draw(target, this.pose, x, y);
    } else {
      // Blend old and new silhouettes ("lighter" keeps the overlap solid).
      const u = smooth(clamp(this.fade.t / FADE, 0, 1));
      const c = (this.scratch ??= document.createElement("canvas"));
      const tw = target.canvas.width;
      const th = target.canvas.height;
      if (c.width !== tw || c.height !== th) {
        c.width = tw;
        c.height = th;
      }
      const sc = c.getContext("2d")!;
      sc.setTransform(1, 0, 0, 1, 0, 0);
      sc.clearRect(0, 0, tw, th);
      sc.setTransform(d, 0, 0, d, -ox * d, -oy * d);
      sc.globalCompositeOperation = "lighter";
      sc.globalAlpha = 1 - u;
      this.draw(sc, this.fade.from, this.fade.x, this.fade.y);
      sc.globalAlpha = u;
      this.draw(sc, this.pose, x, y);
      sc.globalAlpha = 1;
      sc.globalCompositeOperation = "source-over";
      target.setTransform(1, 0, 0, 1, 0, 0);
      target.drawImage(c, 0, 0);
    }
    if (this.opts.debug) {
      target.setTransform(d, 0, 0, d, -ox * d, -oy * d);
      target.fillStyle = "#c2410c";
      target.font = "10px ui-monospace, monospace";
      target.fillText(`${this.state} ${this.pose.anim}#${this.pose.frame}`, x - 40, y - this.slotH - 6);
    }
  }
}
