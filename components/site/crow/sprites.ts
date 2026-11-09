/**
 * Sprite sheets made by scripts/crow/build_sprites.py (public/crow/).
 * Each sheet has its own frame size; its anchor is the point on the ground
 * between the crow's feet, so poses line up when the player switches. Sizes
 * in the JSON are sprite px (pixelRatio x CSS px), except bounds, beak,
 * stride, speed and frontOffset, which are CSS px at the default display
 * size (crow ~80 px tall).
 */

export type AnimName =
  | "walk"
  | "idle"
  | "hop"
  | "takeoff"
  | "pickup"
  | "place"
  | "peek"
  | "caw"
  | "stretch"
  | "rest"
  | "turn";

export interface AnimMeta {
  name: AnimName;
  src: string;
  frames: number;
  /** Long sheets wrap: frame k sits at column k % columns, row k / columns. */
  columns?: number;
  frameWidth: number;
  frameHeight: number;
  fps: number;
  anchor: { x: number; y: number };
  pixelRatio: number;
  loop: boolean;
  pingpong: boolean;
  /** Play forwards, then backwards back to frame 0 (pickup's rise). */
  reverseAfter?: boolean;
  bounds: { left: number; top: number; right: number; bottom: number };
  /** walk: CSS px travelled per loop, and the matching speed (px/s). */
  stride?: number;
  speed?: number;
  /** hop/takeoff: sheet indices of the airborne frames. */
  air?: { start: number; peak: number; end: number };
  /** takeoff: after lift-off, loop frames [loopStart, frames). */
  loopStart?: number;
  /** turn: centre of the front-view (last) frame relative to the feet. */
  frontOffset?: number;
  /** Named sheet indices (contact, grab, release, liftoff, call1, ...). */
  marks?: Record<string, number>;
  /** Beak tip per frame, CSS px from the anchor, crow facing right. */
  beak?: [number, number][];
}

export interface Anim extends AnimMeta {
  img: HTMLImageElement;
}

export type Sprites = { walk: Anim; idle: Anim; hop: Anim } & Partial<Record<Exclude<AnimName, "walk" | "idle" | "hop">, Anim>>;

const REQUIRED: AnimName[] = ["walk", "idle", "hop"];
/** What the footer crow uses; the other sheets load with the story stages. */
export const FOOTER: AnimName[] = ["walk", "idle", "hop", "takeoff", "pickup", "turn"];

async function loadAnim(url: string): Promise<Anim> {
  const meta = (await (await fetch(url)).json()) as AnimMeta;
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`crow sprite failed: ${meta.src}`));
    img.src = meta.src;
  });
  // decode() can wait until a background tab is shown again; don't block on it.
  await Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 300))]);
  return { ...meta, img };
}

/**
 * Loads the sheets listed in `${base}/index.json`; `only` limits the set.
 * The navbar uses the small set in /crow/nav (a 48 px crow).
 */
export async function loadSprites(only: AnimName[] = FOOTER, base = "/crow"): Promise<Sprites | null> {
  try {
    const index = (await (await fetch(`${base}/index.json`)).json()) as {
      animations: Partial<Record<AnimName, string>>;
    };
    const names = (Object.keys(index.animations) as AnimName[]).filter((n) => !only || only.includes(n));
    const anims = await Promise.all(
      names.map((n) => loadAnim(index.animations[n]!).catch(() => null)),
    );
    const out: Partial<Record<AnimName, Anim>> = {};
    anims.forEach((a) => a && (out[a.name] = a));
    if (only.some((n) => REQUIRED.includes(n) && !out[n])) return null;
    return out as Sprites;
  } catch {
    return null;
  }
}

const indexes = new Map<string, Promise<{ animations: Partial<Record<AnimName, string>> }>>();

/** One sheet, or null; for sets that load more animations later. */
export async function loadAnimation(name: AnimName, base = "/crow"): Promise<Anim | null> {
  try {
    if (!indexes.has(base)) indexes.set(base, fetch(`${base}/index.json`).then((r) => r.json()));
    const index = await indexes.get(base)!;
    const url = index.animations[name];
    return url ? await loadAnim(url) : null;
  } catch {
    return null;
  }
}
