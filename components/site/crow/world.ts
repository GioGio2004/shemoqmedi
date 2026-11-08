/**
 * Geometry of the footer wordmark, in footer coordinates (CSS px from the
 * footer's top-left corner): the floor line (text baseline) and, per letter,
 * its ink extent, top profile and perch point.
 *
 * Letters are measured with getBoundingClientRect, then each glyph is drawn
 * once into a small offscreen canvas to read its real ink: the top centre of
 * an "M" is a notch and the top of an "O" is a curve, so the perch is the
 * middle of the flat run of the glyph's top edge nearest its centre.
 */

export interface Letter {
  index: number;
  char: string;
  /** Ink extent on the x axis. */
  left: number;
  right: number;
  /** Highest ink point (smallest y). */
  top: number;
  perchX: number;
  perchY: number;
  /** profile[k] = top ink y at x = profileX + k, or Infinity (no ink). */
  profile: Float32Array;
  profileX: number;
}

export interface World {
  width: number;
  floorY: number;
  fontSize: number;
  letters: Letter[];
}

interface Glyph {
  /** Columns relative to the glyph origin: x = originX + dx0 + k. */
  dx0: number;
  /** Top ink y relative to the baseline (negative = above), per column. */
  tops: Float32Array;
  inkLeft: number;
  inkRight: number;
}

const glyphCache = new Map<string, Glyph>();
let scratch: CanvasRenderingContext2D | null = null;

function rasterize(ch: string, font: string): Glyph {
  const key = `${font}|${ch}`;
  const hit = glyphCache.get(key);
  if (hit) return hit;
  if (!scratch) {
    const c = document.createElement("canvas");
    scratch = c.getContext("2d", { willReadFrequently: true })!;
  }
  const ctx = scratch;
  ctx.font = font;
  const m = ctx.measureText(ch);
  const pad = 2;
  const l = Math.ceil(m.actualBoundingBoxLeft);
  const r = Math.ceil(m.actualBoundingBoxRight);
  const asc = Math.ceil(m.actualBoundingBoxAscent);
  const desc = Math.ceil(m.actualBoundingBoxDescent);
  const w = Math.max(1, l + r + pad * 2);
  const h = Math.max(1, asc + desc + pad * 2);
  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#000";
  ctx.fillText(ch, pad + l, pad + asc);
  const data = ctx.getImageData(0, 0, w, h).data;
  const tops = new Float32Array(w).fill(Infinity);
  let inkLeft = Infinity;
  let inkRight = -Infinity;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (data[(y * w + x) * 4 + 3] > 127) {
        tops[x] = y - (pad + asc);
        inkLeft = Math.min(inkLeft, x);
        inkRight = Math.max(inkRight, x + 1);
        break;
      }
    }
  }
  const dx0 = -(pad + l);
  const g: Glyph = { dx0, tops, inkLeft: dx0 + inkLeft, inkRight: dx0 + inkRight };
  glyphCache.set(key, g);
  return g;
}

export function measureWorld(footer: HTMLElement, wordmark: HTMLElement): World | null {
  const fr = footer.getBoundingClientRect();
  const probe = wordmark.querySelector<HTMLElement>("[data-crow-baseline]");
  const spans = Array.from(wordmark.querySelectorAll<HTMLElement>("[data-crow-letter]"));
  if (!probe || !spans.length || fr.width === 0) return null;

  const cs = getComputedStyle(wordmark);
  const fontSize = parseFloat(cs.fontSize);
  const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const upper = cs.textTransform === "uppercase";
  const floorY = probe.getBoundingClientRect().bottom - fr.top;
  // The wordmark's box clips overflowing letters: those are not perches.
  const clip = (wordmark.parentElement ?? wordmark).getBoundingClientRect();
  const clipL = clip.left - fr.left;
  const clipR = clip.right - fr.left;

  const letters: Letter[] = [];
  spans.forEach((span, index) => {
    const raw = span.textContent ?? "";
    const ch = upper ? raw.toUpperCase() : raw;
    const g = rasterize(ch, font);
    const originX = span.getBoundingClientRect().left - fr.left;
    const left = originX + g.inkLeft;
    const right = originX + g.inkRight;
    if (!Number.isFinite(left) || right > clipR + 1 || left < clipL - 1) return;

    // Perch: centre of the flat top run nearest the glyph's ink centre.
    let minTop = Infinity;
    for (const t of g.tops) minTop = Math.min(minTop, t);
    const tol = Math.max(2, fontSize * 0.02);
    const centre = (g.inkLeft + g.inkRight) / 2 - g.dx0;
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (let k = 0; k < g.tops.length; ) {
      if (g.tops[k] > minTop + tol) {
        k++;
        continue;
      }
      let e = k;
      while (e + 1 < g.tops.length && g.tops[e + 1] <= minTop + tol) e++;
      const d = Math.abs((k + e) / 2 - centre);
      if (d < bestD) {
        bestD = d;
        best = [k, e];
      }
      k = e + 1;
    }
    const [a, b] = best ?? [Math.round(centre), Math.round(centre)];
    const mid = (a + b) / 2;
    // Feet rest on the lowest point under them (no floating on a curve).
    const foot = Math.max(1, Math.round(fontSize * 0.02));
    let perchTop = -Infinity;
    for (let k = Math.max(a, Math.round(mid) - foot); k <= Math.min(b, Math.round(mid) + foot); k++) {
      perchTop = Math.max(perchTop, g.tops[k]);
    }
    if (!Number.isFinite(perchTop)) perchTop = minTop;

    const profile = new Float32Array(g.tops.length);
    for (let k = 0; k < g.tops.length; k++) profile[k] = floorY + g.tops[k];
    letters.push({
      index,
      char: ch,
      left,
      right,
      top: floorY + minTop,
      perchX: originX + g.dx0 + mid,
      perchY: floorY + perchTop,
      profile,
      profileX: originX + g.dx0,
    });
  });
  if (!letters.length) return null;
  return { width: fr.width, floorY, fontSize, letters };
}

/** Highest solid surface (smallest y) at x: a letter's top ink or the floor. */
export function surfaceAt(world: World, x: number): number {
  let y = world.floorY;
  for (const l of world.letters) {
    if (x < l.left || x >= l.right) continue;
    const t = l.profile[Math.floor(x - l.profileX)];
    if (t !== undefined && t < y) y = t;
  }
  return y;
}
