/**
 * Sprite sheets made by scripts/crow/build_sprites.py (public/crow/).
 * Every sheet shares one frame size and one anchor: the point on the ground
 * between the crow's feet. Sizes in the JSON are sprite px (pixelRatio x CSS
 * px), except bounds/stride/speed/frontOffset, which are CSS px at the
 * default display size (crow ~80 px tall).
 */

export type AnimName = "walk" | "idle" | "hop" | "takeoff" | "peck" | "turn";

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
}

export interface Anim extends AnimMeta {
  img: HTMLImageElement;
}

export type Sprites = { walk: Anim; idle: Anim; hop: Anim } & Partial<Record<"takeoff" | "peck" | "turn", Anim>>;

const REQUIRED: AnimName[] = ["walk", "idle", "hop"];

async function loadAnim(url: string): Promise<Anim> {
  const meta = (await (await fetch(url)).json()) as AnimMeta;
  const img = new Image();
  img.decoding = "async";
  img.src = meta.src;
  await img.decode();
  return { ...meta, img };
}

/** Loads every sheet listed in /crow/index.json; `only` limits the set. */
export async function loadSprites(only?: AnimName[]): Promise<Sprites | null> {
  try {
    const index = (await (await fetch("/crow/index.json")).json()) as {
      animations: Partial<Record<AnimName, string>>;
    };
    const names = (Object.keys(index.animations) as AnimName[]).filter((n) => !only || only.includes(n));
    const anims = await Promise.all(
      names.map((n) => loadAnim(index.animations[n]!).catch(() => null)),
    );
    const out: Partial<Record<AnimName, Anim>> = {};
    anims.forEach((a) => a && (out[a.name] = a));
    const need = only ?? REQUIRED;
    if (need.some((n) => REQUIRED.includes(n) && !out[n])) return null;
    return out as Sprites;
  } catch {
    return null;
  }
}
