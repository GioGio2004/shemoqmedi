/**
 * The living crow: a state machine that walks a silhouette crow into the
 * footer, hops it onto the SHEMOQMEDI letters and sends it away again.
 *
 *   OFFSCREEN -> WALK_IN -> WALK_TO (LOOK) -> HOP_UP -> PERCH
 *     -> (HOP_TO_LETTER -> PERCH)* -> TAKEOFF | HOP_DOWN -> WALK_OUT
 *     -> OFFSCREEN
 *
 * TURN plays wherever the crow has to face the other way. Positions are the
 * crow's feet in footer coordinates (CSS px). The canvas sits absolutely in
 * the footer, starts above the wordmark and grows to the viewport height
 * while the crow flies off the top of the screen.
 */

import type { Anim, AnimName, Sprites } from "./sprites";
import { measureWorld, surfaceAt, type World } from "./world";

export type CrowState =
  | "OFFSCREEN"
  | "WALK_IN"
  | "WALK_TO"
  | "LOOK"
  | "TURN"
  | "HOP_UP"
  | "PERCH"
  | "HOP_TO_LETTER"
  | "HOP_DOWN"
  | "WALK_OUT"
  | "TAKEOFF";

type Side = "left" | "right";
type Spot = { side: Side; t: number } | { side: Side; base: true } | { side: Side; out: true };
type Step =
  | { k: "walk"; to: Spot; state: CrowState }
  | { k: "look"; anim: "idle" | "peck"; dur: number }
  | { k: "turn" }
  | { k: "hopUp"; letter: number }
  | { k: "perch"; dur: number }
  | { k: "hopTo"; letter: number }
  | { k: "hopDown"; side: Side }
  | { k: "takeoff"; startled?: boolean };

interface Action {
  state: CrowState;
  /** Advances by dt seconds; true when finished. */
  update(dt: number): boolean;
}

type Where = { kind: "off" } | { kind: "floor"; side: Side } | { kind: "letter"; i: number } | { kind: "air" };

export interface EngineOptions {
  debug: boolean;
  reducedMotion: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
const chance = (p: number) => Math.random() < p;
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const DISPLAY_H = 80; // CSS px, crow height on desktop
const MOBILE_SCALE = 0.7; // about 30% smaller under 768 px
const GRAVITY = 2600; // CSS px/s² at desktop size: a calm, weighty hop

export class CrowEngine {
  private readonly ctx: CanvasRenderingContext2D;
  private world: World | null = null;
  private dpr = 1;
  private size = 1;
  private mobile = false;
  private canvasTop = 0;
  private canvasW = 0;
  private canvasH = 0;
  private tall = false;

  // Crow
  private x = 0;
  private y = 0;
  private facing: 1 | -1 = 1;
  /** Extra draw offset on x (turn mirrors around the front-view centre). */
  private offset = 0;
  private anim: AnimName = "idle";
  private frame = 0;
  private visible = false;
  private where: Where = { kind: "off" };

  // Behaviour
  private state: CrowState = "OFFSCREEN";
  private steps: Step[] = [];
  private action: Action | null = null;
  private lastSignature = "";
  private signature = "";
  private sleepLeft: number;
  private speedMul = 1;
  private arc: { x: number; y: number }[] = [];

  // Loop
  private running = false;
  private inView = false;
  private pageVisible = true;
  private destroyed = false;
  private raf = 0;
  private timer = 0;
  private timerStart = 0;
  private lastTs = 0;
  private drawnKey = "";
  private dirty: [number, number, number, number] | null = null;
  private relayoutQueued = false;

  private readonly io: IntersectionObserver;
  private readonly ro: ResizeObserver;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly footer: HTMLElement,
    private readonly wordmark: HTMLElement,
    private readonly sprites: Sprites,
    private readonly opts: EngineOptions,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.sleepLeft = opts.debug ? 1.5 : rand(20, 60);

    this.io = new IntersectionObserver((entries) => {
      this.inView = entries.some((e) => e.isIntersecting);
      this.updateRunning();
    });
    this.io.observe(footer);
    this.ro = new ResizeObserver(() => this.queueRelayout());
    this.ro.observe(footer);
    this.ro.observe(wordmark);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("pointerdown", this.onPointer, { capture: true, passive: true });
    window.addEventListener("resize", this.queueRelayout);
    this.onVisibility();
    this.relayout();
    document.fonts?.ready.then(() => this.queueRelayout());
  }

  destroy() {
    this.destroyed = true;
    this.pause();
    this.io.disconnect();
    this.ro.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("pointerdown", this.onPointer, { capture: true });
    window.removeEventListener("resize", this.queueRelayout);
  }

  // ----------------------------------------------------------------------
  // Running / pausing
  // ----------------------------------------------------------------------

  private onVisibility = () => {
    this.pageVisible = document.visibilityState === "visible";
    this.updateRunning();
  };

  private updateRunning() {
    const run = this.inView && this.pageVisible && !this.destroyed && !this.opts.reducedMotion;
    if (run === this.running) return;
    this.running = run;
    if (run) this.schedule();
    else this.pause();
  }

  private pause() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.timer) {
      clearTimeout(this.timer);
      this.sleepLeft -= (performance.now() - this.timerStart) / 1000;
      this.timer = 0;
    }
    this.lastTs = 0;
  }

  /** rAF while the crow is out; a plain timer while it is away. */
  private schedule() {
    if (!this.running || this.raf || this.timer) return;
    if (this.state === "OFFSCREEN" && !this.opts.debug) {
      this.timerStart = performance.now();
      this.timer = window.setTimeout(
        () => {
          this.timer = 0;
          this.sleepLeft = 0;
          if (this.running && !this.raf) this.raf = requestAnimationFrame(this.tick);
        },
        Math.max(0, this.sleepLeft * 1000),
      );
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (ts: number) => {
    this.raf = 0;
    const dt = this.lastTs ? Math.min((ts - this.lastTs) / 1000, 0.1) : 0;
    this.lastTs = ts;
    this.advance(dt);
    this.render();
    // Away (outside debug): a timer takes over, the next rAF starts fresh.
    if (this.state === "OFFSCREEN" && !this.opts.debug) this.lastTs = 0;
    this.schedule();
  };

  // ----------------------------------------------------------------------
  // Layout
  // ----------------------------------------------------------------------

  private queueRelayout = () => {
    if (this.relayoutQueued) return;
    this.relayoutQueued = true;
    requestAnimationFrame(() => {
      this.relayoutQueued = false;
      if (!this.destroyed) this.relayout();
    });
  };

  private relayout() {
    this.mobile = window.innerWidth < 768;
    this.size = this.mobile ? MOBILE_SCALE : 1;
    this.world = measureWorld(this.footer, this.wordmark);
    this.sizeCanvas();
    this.snap();
    if (this.opts.reducedMotion) this.placeStatic();
    this.drawnKey = "";
    this.render();
  }

  private frameH(a: Anim = this.sprites.idle) {
    return (a.frameHeight / a.pixelRatio) * this.size;
  }

  private sizeCanvas() {
    const w = this.world;
    if (!w) return;
    const capTop = Math.min(...w.letters.map((l) => l.top));
    const below = 12 + w.fontSize * 0.15; // Q's tail, hop landing slack
    const above = this.tall
      ? window.innerHeight + this.frameH(this.sprites.takeoff ?? this.sprites.hop) * 1.5
      : w.floorY - capTop + this.frameH(this.sprites.hop) + 60 * this.size;
    const top = Math.round(w.floorY - above);
    const height = Math.round(above + below);
    const width = Math.round(w.width);
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // sprites are 2x
    if (top === this.canvasTop && height === this.canvasH && width === this.canvasW && dpr === this.dpr) return;
    this.canvasTop = top;
    this.canvasH = height;
    this.canvasW = width;
    this.dpr = dpr;
    const s = this.canvas.style;
    s.top = `${top}px`;
    s.width = `${width}px`;
    s.height = `${height}px`;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.dirty = null;
    this.drawnKey = "";
  }

  private setTall(tall: boolean) {
    if (this.tall === tall) return;
    this.tall = tall;
    this.sizeCanvas();
  }

  /** After a resize, put the crow back on whatever it was standing on. */
  private snap() {
    const w = this.world;
    if (!w) return;
    if (this.where.kind === "letter") {
      const l = w.letters[this.where.i];
      if (l) {
        this.x = l.perchX;
        this.y = l.perchY;
      }
    } else if (this.where.kind === "floor") {
      this.y = w.floorY;
    }
  }

  // ----------------------------------------------------------------------
  // Floor geometry
  // ----------------------------------------------------------------------

  /** Clearance between the crow's feet and a letter or the screen edge. */
  private clearance() {
    const b = this.sprites.idle.bounds;
    return Math.max(-b.left, b.right) * this.size + 6;
  }

  private spotX(spot: Spot): number {
    const w = this.world!;
    const first = w.letters[0];
    const last = w.letters[w.letters.length - 1];
    const c = this.clearance();
    const fw = (this.sprites.walk.frameWidth / this.sprites.walk.pixelRatio) * this.size;
    if ("out" in spot) return spot.side === "left" ? -fw : w.width + fw;
    if (spot.side === "left") {
      const base = first.left - c;
      if ("base" in spot) return base;
      return Math.min(base, c + (base - c) * spot.t);
    }
    const base = last.right + c;
    if ("base" in spot) return base;
    const end = w.width - c;
    return Math.max(base, base + (end - base) * spot.t);
  }

  /** Visible floor between the screen edge and the end letter, CSS px. */
  private floorRoom(side: Side) {
    const w = this.world!;
    const c = this.clearance();
    return side === "left" ? w.letters[0].left - 2 * c : w.width - w.letters[w.letters.length - 1].right - 2 * c;
  }

  // ----------------------------------------------------------------------
  // Plans
  // ----------------------------------------------------------------------

  private makePlan(): Step[] {
    const w = this.world!;
    const n = w.letters.length;
    const side: Side = chance(0.5) ? "left" : "right";
    const toward = side === "left" ? 1 : -1;
    const steps: Step[] = [];
    const looks = (dur: [number, number]): Step => ({
      k: "look",
      anim: this.sprites.peck && chance(0.4) ? "peck" : "idle",
      dur: rand(dur[0], dur[1]),
    });

    // Floor: walk in, maybe wander and stop to look around.
    const room = this.floorRoom(side) > 60;
    if (room && chance(0.7)) {
      steps.push({ k: "walk", to: { side, t: rand(0.15, 0.9) }, state: "WALK_IN" });
      for (let i = randInt(0, 2); i > 0; i--) {
        if (chance(0.6)) steps.push(looks([2, 4]));
        steps.push({ k: "walk", to: { side, t: rand(0, 1) }, state: "WALK_TO" });
      }
      if (chance(0.5)) steps.push(looks([2, 4]));
      steps.push({ k: "walk", to: { side, base: true }, state: "WALK_TO" });
    } else {
      steps.push({ k: "walk", to: { side, base: true }, state: "WALK_IN" });
      if (chance(0.4)) steps.push(looks([2, 3]));
    }

    // Up onto the end letter, sometimes over it onto the next one.
    const edge = side === "left" ? 0 : n - 1;
    let cur = n > 1 && chance(0.25) ? edge + toward : edge;
    steps.push({ k: "hopUp", letter: cur });
    const perch = (short = false) => {
      if (short) return void steps.push({ k: "perch", dur: rand(0.7, 2) });
      const d = rand(6, 15);
      if (this.sprites.turn && chance(0.25)) {
        const a = d * rand(0.3, 0.6);
        steps.push({ k: "perch", dur: a }, { k: "turn" }, { k: "perch", dur: d - a });
      } else steps.push({ k: "perch", dur: d });
    };
    perch();

    // 40%: hop on to a neighbouring letter (smaller arc), again and again.
    let prev = -1;
    for (let hops = 0; hops < 4 && n > 1 && chance(0.4); hops++) {
      const options = [cur - 1, cur + 1].filter((i) => i >= 0 && i < n);
      const fresh = options.filter((i) => i !== prev);
      if (!fresh.length) break; // only way is back: done hopping around
      const pool = chance(0.85) ? fresh : options;
      const next = pool[randInt(0, pool.length - 1)];
      steps.push({ k: "hopTo", letter: next });
      perch();
      prev = cur;
      cur = next;
    }

    // Leave: fly off over the top (desktop), or hop down at an end and walk out.
    if (this.sprites.takeoff && !this.mobile && chance(0.45)) {
      steps.push({ k: "takeoff" });
    } else {
      const exit: Side = chance(0.5) ? "left" : "right";
      const end = exit === "left" ? 0 : n - 1;
      while (cur !== end) {
        cur += exit === "left" ? -1 : 1;
        steps.push({ k: "hopTo", letter: cur });
        perch(true);
      }
      steps.push({ k: "hopDown", side: exit });
      if (this.floorRoom(exit) > 60 && chance(0.4)) {
        steps.push({ k: "walk", to: { side: exit, t: rand(0.3, 1) }, state: "WALK_TO" });
        steps.push(looks([2, 3]));
      }
      steps.push({ k: "walk", to: { side: exit, out: true }, state: "WALK_OUT" });
    }
    this.signature = side + ":" + steps.map(sig).join(",");
    return steps;
  }

  private beginVisit() {
    if (!this.world) {
      this.sleepLeft = 5;
      return;
    }
    let plan = this.makePlan();
    for (let i = 0; i < 20 && this.signature === this.lastSignature; i++) plan = this.makePlan();
    this.lastSignature = this.signature;
    this.steps = plan;
    this.action = null;
    this.speedMul = rand(0.9, 1.08);
    const first = plan[0] as Extract<Step, { k: "walk" }>;
    const side = first.to.side;
    this.facing = side === "left" ? 1 : -1;
    this.x = this.spotX({ side, out: true });
    this.y = this.world.floorY;
    this.where = { kind: "floor", side };
    this.offset = 0;
    this.visible = true;
    this.setAnim("idle", 0);
    this.state = first.state;
  }

  private goOffscreen(wait: number) {
    this.state = "OFFSCREEN";
    this.steps = [];
    this.action = null;
    this.visible = false;
    this.where = { kind: "off" };
    this.arc = [];
    this.sleepLeft = this.opts.debug ? Math.min(wait, 4) : wait;
    this.setTall(false);
  }

  private startle() {
    if (!this.visible || this.state === "TAKEOFF" || this.state === "OFFSCREEN") return;
    this.offset = 0;
    this.steps = [{ k: "takeoff", startled: true }];
    this.action = null;
    this.drawnKey = "";
    this.schedule();
  }

  private onPointer = (e: PointerEvent) => {
    if (!this.visible || !this.running) return;
    const fr = this.footer.getBoundingClientRect();
    const [x0, y0, x1, y1] = this.hitBox();
    const px = e.clientX - fr.left;
    const py = e.clientY - fr.top;
    if (px >= x0 && px <= x1 && py >= y0 && py <= y1) this.startle();
  };

  private hitBox(): [number, number, number, number] {
    const b = this.sprites[this.anim]?.bounds ?? this.sprites.idle.bounds;
    const s = this.size;
    const l = this.facing === 1 ? b.left : -b.right;
    const r = this.facing === 1 ? b.right : -b.left;
    const insetX = (r - l) * 0.12 * s;
    const insetY = (b.bottom - b.top) * 0.08 * s;
    const x = this.x + this.offset;
    return [x + l * s + insetX, this.y + b.top * s + insetY, x + r * s - insetX, this.y + b.bottom * s];
  }

  // ----------------------------------------------------------------------
  // Actions
  // ----------------------------------------------------------------------

  private advance(dt: number) {
    if (this.state === "OFFSCREEN") {
      this.sleepLeft -= dt;
      if (this.sleepLeft <= 0) this.beginVisit();
      if (this.state === "OFFSCREEN") return;
    }
    for (let guard = 0; guard < 8; guard++) {
      if (!this.action) {
        const step = this.steps.shift();
        if (!step) return this.goOffscreen(rand(20, 60));
        this.action = this.toAction(step);
        if (!this.action) continue;
      }
      this.state = this.action.state;
      if (!this.action.update(dt)) return;
      this.action = null;
      dt = 0;
    }
  }

  /** Builds the action for a step; turns around first when needed. */
  private toAction(step: Step): Action | null {
    const w = this.world!;
    const needs = (dir: number) => {
      if (dir === 0 || dir === this.facing) return false;
      this.steps.unshift(step);
      return true;
    };
    switch (step.k) {
      case "walk": {
        const dir = Math.sign(this.spotX(step.to) - this.x);
        if (needs(dir)) return this.turnAction();
        return this.walkAction(step);
      }
      case "look":
        return this.idleAction("LOOK", step.dur, step.anim === "peck");
      case "perch":
        return this.idleAction("PERCH", step.dur, false);
      case "turn":
        return this.turnAction();
      case "hopUp":
      case "hopTo": {
        const l = w.letters[step.letter];
        if (!l) return null;
        if (needs(Math.sign(Math.round(l.perchX - this.x)))) return this.turnAction();
        return this.hopAction(l.perchX, l.perchY, step.k === "hopUp" ? "HOP_UP" : "HOP_TO_LETTER", {
          kind: "letter",
          i: step.letter,
        });
      }
      case "hopDown": {
        const x = this.spotX({ side: step.side, base: true });
        if (needs(step.side === "left" ? -1 : 1)) return this.turnAction();
        return this.hopAction(x, w.floorY, "HOP_DOWN", { kind: "floor", side: step.side });
      }
      case "takeoff":
        return this.takeoffAction(!!step.startled);
    }
  }

  private setAnim(name: AnimName, frame: number) {
    this.anim = name;
    this.frame = frame;
  }

  /** Walk on the floor. The animation is driven by distance: no sliding. */
  private walkAction(step: Extract<Step, { k: "walk" }>): Action {
    const walk = this.sprites.walk;
    const stride = (walk.stride ?? 26) * this.size;
    const speed = (walk.speed ?? 40) * this.size * this.speedMul;
    let phase = 0;
    // End free floor walks on a whole cycle so the crow stops mid-stance.
    let target = this.spotX(step.to);
    if ("t" in step.to) {
      const d = Math.abs(target - this.x);
      const cycles = Math.max(1, Math.round(d / stride));
      target = this.x + Math.sign(target - this.x) * cycles * stride;
      // ...but never closer to the letters than the letter's base.
      const base = this.spotX({ side: step.to.side, base: true });
      target = step.to.side === "left" ? Math.min(target, base) : Math.max(target, base);
    }
    const side = step.to.side;
    return {
      state: step.state,
      update: (dt) => {
        if ("base" in step.to) target = this.spotX(step.to); // follow resizes
        const remaining = Math.abs(target - this.x);
        const d = Math.min(remaining, speed * dt);
        this.x += Math.sign(target - this.x) * d;
        this.y = this.world!.floorY;
        phase += d / stride;
        this.setAnim("walk", Math.floor(phase * walk.frames) % walk.frames);
        this.where = { kind: "floor", side };
        return remaining - d < 0.01;
      },
    };
  }

  /** Stand and look around; peck first when asked. */
  private idleAction(state: CrowState, dur: number, peck: boolean): Action {
    const idle = this.sprites.idle;
    const peckAnim = peck ? this.sprites.peck : undefined;
    let t = 0;
    // Ping-pong look-around with random holds, so it never loops the same.
    let f = 0;
    let dir = 0;
    let hold = rand(0.6, 2.4);
    return {
      state,
      update: (dt) => {
        t += dt;
        if (peckAnim && t < peckAnim.frames / peckAnim.fps) {
          this.setAnim("peck", Math.min(peckAnim.frames - 1, Math.floor(t * peckAnim.fps)));
          return false;
        }
        if (!idle.pingpong) {
          this.setAnim("idle", Math.floor(t * idle.fps) % idle.frames);
        } else {
          if (dir === 0) {
            hold -= dt;
            if (hold <= 0) dir = f <= 0 ? 1 : -1;
          } else {
            f += dir * dt * idle.fps * 0.55; // slow, deliberate head turn
            if (f >= idle.frames - 1 || f <= 0) {
              f = clamp(f, 0, idle.frames - 1);
              dir = 0;
              hold = f > 0 ? rand(0.5, 1.8) : rand(1, 3);
            }
          }
          this.setAnim("idle", Math.round(f));
        }
        return t >= dur;
      },
    };
  }

  /**
   * Turn in place: play right-side -> front view, mirror, play back. The
   * mirror is around the front pose's centre, then the feet ease back.
   */
  private turnAction(): Action {
    const turn = this.sprites.turn;
    if (!turn) {
      this.facing = this.facing === 1 ? -1 : 1;
      return { state: "TURN", update: () => true };
    }
    const n = turn.frames;
    const half = n / turn.fps;
    const fo = turn.frontOffset ?? 0;
    let t = 0;
    let flipped = false;
    let startOffset = 0;
    return {
      state: "TURN",
      update: (dt) => {
        t += dt;
        if (t < half) {
          this.setAnim("turn", Math.min(n - 1, Math.floor(t * turn.fps)));
          return false;
        }
        if (!flipped) {
          flipped = true;
          startOffset = 2 * this.facing * fo * this.size;
          this.facing = this.facing === 1 ? -1 : 1;
        }
        const u = Math.min(1, (t - half) / half);
        this.offset = startOffset * (1 - smoothstep(u));
        this.setAnim("turn", Math.max(0, n - 1 - Math.floor((t - half) * turn.fps)));
        if (u >= 1) {
          this.offset = 0;
          this.setAnim("idle", 0);
          return true;
        }
        return false;
      },
    };
  }

  /**
   * Hop along a parabola from the feet to (x1, y1): ease-out rising,
   * ease-in falling, apex raised until the feet clear every letter on the
   * way. The hop sheet's airborne frames are spread over the flight with
   * its peak frame at the apex.
   */
  private hopAction(x1: number, y1: number, state: CrowState, after: Where): Action {
    const hop = this.sprites.hop;
    const air = hop.air ?? { start: 0, peak: Math.floor(hop.frames / 2), end: hop.frames - 1 };
    const pre = air.start / hop.fps;
    const post = (hop.frames - 1 - air.end) / hop.fps;
    const x0 = this.x;
    const y0 = this.y;
    const g = GRAVITY * this.size;
    const up = y1 < y0 - 10;
    let lift = (up ? 0.3 : 0.22) * DISPLAY_H * this.size;
    const path = (ya: number) => {
      const tUp = Math.sqrt((2 * Math.max(1, y0 - ya)) / g);
      const tDown = Math.sqrt((2 * Math.max(1, y1 - ya)) / g);
      const T = tUp + tDown;
      const at = (t: number) => {
        const p = t / T;
        // Rise first, travel later: a crow jumps up, then over.
        const xp = 0.45 * p + 0.55 * smoothstep(p);
        const y = t < tUp ? ya + (y0 - ya) * (1 - t / tUp) ** 2 : ya + (y1 - ya) * ((t - tUp) / tDown) ** 2;
        return { x: x0 + (x1 - x0) * xp, y };
      };
      return { tUp, tDown, T, at };
    };
    const w = this.world!;
    let arc = path(Math.min(y0, y1) - lift);
    for (let i = 0; i < 40; i++) {
      let ok = true;
      for (let k = 1; k < 48 && ok; k++) {
        const u = k / 48;
        if (u < 0.05 || u > 0.95) continue;
        const p = arc.at(u * arc.T);
        if (p.y > surfaceAt(w, p.x) - 3) ok = false;
      }
      if (ok) break;
      lift += 6 * this.size;
      arc = path(Math.min(y0, y1) - lift);
    }
    if (this.opts.debug) {
      this.arc = Array.from({ length: 33 }, (_, k) => arc.at((k / 32) * arc.T));
    }
    let t = 0;
    this.where = { kind: "air" };
    return {
      state,
      update: (dt) => {
        t += dt;
        if (t < pre) {
          this.setAnim("hop", Math.floor(t * hop.fps));
          return false;
        }
        const ft = t - pre;
        if (ft < arc.T) {
          const p = arc.at(ft);
          this.x = p.x;
          this.y = p.y;
          const f =
            ft < arc.tUp
              ? air.start + (air.peak - air.start + 0.999) * (ft / arc.tUp)
              : air.peak + (air.end - air.peak + 0.999) * ((ft - arc.tUp) / arc.tDown);
          this.setAnim("hop", Math.min(air.end, Math.floor(f)));
          return false;
        }
        this.x = x1;
        this.y = y1;
        this.where = after;
        this.snap(); // the layout may have changed mid-air
        const lt = ft - arc.T;
        if (lt < post) {
          this.setAnim("hop", Math.min(hop.frames - 1, air.end + 1 + Math.floor(lt * hop.fps)));
          return false;
        }
        this.setAnim("idle", 0);
        this.arc = [];
        return true;
      },
    };
  }

  /** Lift off and fly up and out over the top of the screen. */
  private takeoffAction(startled: boolean): Action {
    const tk = this.sprites.takeoff ?? this.sprites.hop;
    const name: AnimName = this.sprites.takeoff ? "takeoff" : "hop";
    const air = tk.air ?? { start: 0, peak: 0, end: tk.frames - 1 };
    const loopStart = tk.loopStart ?? air.start;
    const speedUp = startled ? 1.6 : 1;
    const pre = air.start / (tk.fps * speedUp);
    const s = this.size;
    const steep = this.mobile; // mobile: straight up, never across
    let vx = this.facing * (steep ? 30 : 120) * s;
    let vy = -(startled ? 340 : 240) * s;
    const ax = this.facing * (steep ? 10 : 170) * s;
    const ay = -(startled ? 160 : 110) * s;
    let t = 0;
    this.setTall(true);
    this.where = { kind: "air" };
    this.arc = [];
    return {
      state: "TAKEOFF",
      update: (dt) => {
        t += dt;
        if (t < pre) {
          this.setAnim(name, Math.floor(t * tk.fps * speedUp));
          return false;
        }
        const ft = t - pre;
        vx += ax * dt;
        vy += ay * dt;
        this.x += vx * dt;
        this.y += vy * dt;
        const fi = Math.floor(ft * tk.fps * 1.1);
        const head = loopStart - air.start;
        const f = fi < head ? air.start + fi : loopStart + ((fi - head) % (tk.frames - loopStart));
        this.setAnim(name, f);
        const b = tk.bounds;
        const gone =
          this.y + b.bottom * s < this.canvasTop ||
          this.x + b.right * s < -20 ||
          this.x + b.left * s > this.canvasW + 20;
        if (gone) {
          this.goOffscreen(startled ? rand(60, 90) : rand(20, 60));
          return true;
        }
        return false;
      },
    };
  }

  /** prefers-reduced-motion: one still crow perched on a letter. */
  private placeStatic() {
    const w = this.world;
    if (!w) return;
    const l = w.letters[Math.min(2, w.letters.length - 1)];
    this.x = l.perchX;
    this.y = l.perchY;
    this.facing = 1;
    this.offset = 0;
    this.where = { kind: "letter", i: l.index };
    this.visible = true;
    this.setAnim("idle", 0);
    this.state = "PERCH";
  }

  // ----------------------------------------------------------------------
  // Rendering
  // ----------------------------------------------------------------------

  private render() {
    const ctx = this.ctx;
    const a = this.sprites[this.anim] ?? this.sprites.idle;
    const key = `${this.visible}|${this.anim}|${this.frame}|${this.x.toFixed(2)}|${this.y.toFixed(2)}|${this.facing}|${this.offset.toFixed(2)}|${this.canvasTop}`;
    if (key === this.drawnKey && !this.opts.debug) return;
    this.drawnKey = key;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.opts.debug) {
      ctx.clearRect(0, 0, this.canvasW, this.canvasH);
      this.drawDebug(false);
    } else if (this.dirty) ctx.clearRect(...this.dirty);
    this.dirty = null;

    if (this.visible) {
      const pr = a.pixelRatio;
      const s = this.size;
      const dw = (a.frameWidth / pr) * s;
      const dh = (a.frameHeight / pr) * s;
      const ax = (a.anchor.x / pr) * s;
      const ay = (a.anchor.y / pr) * s;
      const cx = this.x + this.offset;
      const cy = this.y - this.canvasTop;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(this.facing, 1);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      const f = clamp(this.frame, 0, a.frames - 1);
      ctx.drawImage(a.img, f * a.frameWidth, 0, a.frameWidth, a.frameHeight, -ax, -ay, dw, dh);
      ctx.restore();
      const left = this.facing === 1 ? cx - ax : cx - (dw - ax);
      this.dirty = [Math.floor(left) - 2, Math.floor(cy - ay) - 2, Math.ceil(dw) + 4, Math.ceil(dh) + 4];
    }
    if (this.opts.debug) this.drawDebug(true);
  }

  /** ?crowdebug: geometry and HUD under the crow, hit area and anchor over it. */
  private drawDebug(over: boolean) {
    const ctx = this.ctx;
    const w = this.world;
    const T = this.canvasTop;
    ctx.save();
    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.lineWidth = 1;
    if (over) {
      if (this.visible) {
        const [x0, y0, x1, y1] = this.hitBox();
        ctx.strokeStyle = "#f5a623";
        ctx.strokeRect(x0, y0 - T, x1 - x0, y1 - y0);
        ctx.strokeStyle = "#e5484d";
        ctx.beginPath();
        ctx.moveTo(this.x - 6, this.y - T);
        ctx.lineTo(this.x + 6, this.y - T);
        ctx.moveTo(this.x, this.y - T - 6);
        ctx.lineTo(this.x, this.y - T + 6);
        ctx.stroke();
        ctx.fillStyle = "#c2410c";
        ctx.fillText(`${this.state} · ${this.anim}#${this.frame}`, x0, y0 - T - 6);
      }
      ctx.restore();
      return;
    }
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.strokeRect(0.5, 0.5, this.canvasW - 1, this.canvasH - 1);
    ctx.setLineDash([]);
    if (w) {
      // Floor line, walkable floor, letter tops, perch points.
      ctx.strokeStyle = "#e5484d";
      ctx.beginPath();
      ctx.moveTo(0, w.floorY - T + 0.5);
      ctx.lineTo(this.canvasW, w.floorY - T + 0.5);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(48,164,108,.8)";
      for (const side of ["left", "right"] as Side[]) {
        const a = this.spotX({ side, t: 0 });
        const b = this.spotX({ side, base: true });
        const c = side === "left" ? Math.min(a, b) : b;
        const d = side === "left" ? b : this.spotX({ side, t: 1 });
        ctx.beginPath();
        ctx.moveTo(c, w.floorY - T + 3);
        ctx.lineTo(d, w.floorY - T + 3);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      for (const l of w.letters) {
        ctx.strokeStyle = "rgba(0,145,255,.6)";
        ctx.beginPath();
        let started = false;
        for (let k = 0; k < l.profile.length; k++) {
          const y = l.profile[k];
          if (!Number.isFinite(y)) continue;
          if (!started) ctx.moveTo(l.profileX + k, y - T);
          else ctx.lineTo(l.profileX + k, y - T);
          started = true;
        }
        ctx.stroke();
        ctx.fillStyle = "#0091ff";
        ctx.beginPath();
        ctx.arc(l.perchX, l.perchY - T, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`${l.index}${l.char}`, l.perchX + 6, l.perchY - T - 6);
      }
    }
    if (this.arc.length) {
      ctx.strokeStyle = "rgba(245,166,35,.9)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      this.arc.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y - T) : ctx.moveTo(p.x, p.y - T)));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // HUD, just above the letters.
    const top = w ? Math.min(...w.letters.map((l) => l.top)) - T - 118 * this.size : 10;
    const lines = [
      `state ${this.state}${this.state === "OFFSCREEN" ? `  next in ${Math.max(0, this.sleepLeft).toFixed(1)}s` : ""}`,
      `anim ${this.anim}#${this.frame}  facing ${this.facing === 1 ? "right" : "left"}  where ${this.where.kind}${"i" in this.where ? ":" + this.where.i : "side" in this.where ? ":" + this.where.side : ""}`,
      `size ${this.size}${this.mobile ? " (mobile)" : ""}  canvas ${this.canvasW}x${this.canvasH}${this.tall ? " tall" : ""}  dpr ${this.dpr}`,
      `next ${this.steps.map(sig).join(" ") || "-"}`,
    ];
    ctx.fillStyle = "#c2410c";
    lines.forEach((s, i) => ctx.fillText(s.slice(0, 70), 12, Math.max(4, top) + i * 14));
    ctx.restore();
  }
}

function sig(s: Step): string {
  switch (s.k) {
    case "walk":
      return `walk(${s.to.side}${"base" in s.to ? ",base" : "out" in s.to ? ",out" : ""})`;
    case "look":
      return s.anim;
    case "hopUp":
    case "hopTo":
      return `${s.k}(${s.letter})`;
    case "hopDown":
      return `hopDown(${s.side})`;
    default:
      return s.k;
  }
}
