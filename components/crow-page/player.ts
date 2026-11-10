import type { Anim } from "@/components/site/crow/sprites";

/**
 * Drawing the crow's sprite sheets (public/crow) on a canvas, for the /crow
 * page. The sheets are made for a crow about 80 CSS px tall (DEFAULT_HEIGHT);
 * `scale` draws it bigger or smaller.
 */

export const DEFAULT_HEIGHT = 80;

/** How many steps one play of `a` takes: forwards, plus the way back for pingpong / reverseAfter. */
function length(a: Anim) {
  if (a.reverseAfter) return a.frames * 2 - 1;
  if (a.pingpong) return a.frames * 2 - 2;
  return a.frames;
}

/** Step i of a play → sheet frame. */
function toFrame(a: Anim, i: number) {
  return i < a.frames ? i : a.frames * 2 - 2 - i;
}

/**
 * The frame `t` seconds into `a`, and whether a one-off play has ended.
 * Looping sheets with a loopStart (takeoff's flight, rest's breathing) play
 * once from the start, then loop the tail.
 */
export function frameAt(a: Anim, t: number, { loop = false, speed = 1 } = {}) {
  const i = Math.max(0, Math.floor(t * a.fps * speed));
  const n = length(a);
  if (!loop) return { k: toFrame(a, Math.min(i, n - 1)), done: i >= n };
  if (a.loopStart !== undefined && !a.reverseAfter && !a.pingpong) {
    const k = i < a.frames ? i : a.loopStart + ((i - a.frames) % (a.frames - a.loopStart));
    return { k, done: false };
  }
  return { k: toFrame(a, i % n), done: false };
}

/** Seconds a one-off play of `a` lasts. */
export const duration = (a: Anim, speed = 1) => length(a) / (a.fps * speed);

/**
 * Draws frame k of `a` with the crow's feet at (x, y), CSS px in the
 * canvas. `flip` turns it to face left (mirrored round its feet).
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  a: Anim,
  k: number,
  x: number,
  y: number,
  { scale = 1, flip = false } = {},
) {
  const col = a.columns ?? a.frames;
  const sx = (k % col) * a.frameWidth;
  const sy = Math.floor(k / col) * a.frameHeight;
  const s = scale / a.pixelRatio;
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(a.img, sx, sy, a.frameWidth, a.frameHeight, -a.anchor.x * s, -a.anchor.y * s, a.frameWidth * s, a.frameHeight * s);
  ctx.restore();
}

/** Sizes a canvas to its CSS box at the screen's pixel density; returns the context in CSS px. */
export function fitCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width, height } = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(width * dpr));
  const h = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingQuality = "high";
  return { ctx, width, height };
}

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
