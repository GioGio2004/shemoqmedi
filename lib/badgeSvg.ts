import type { AwardSlug } from "@/lib/taxonomy";
import { CROW, GLYPHS, SEAL_ARC, SEAL_WORD, TAG_TITLE, UNITS_PER_EM } from "@/lib/badgeArt";
import {
  SEAL_SIZE,
  SIGNATURE_THEME,
  TAG_HEIGHT,
  badgeDate,
  badgeLabel,
  type BadgeShape,
  type BadgeTheme,
} from "@/lib/badgeInfo";

// Draws an award's badge from the artwork (lib/badgeArt.ts): the round seal
// or the horizontal tag, in the award's signature look or the other theme,
// with the award's date (or First 100 member number) set in the same
// lettering. Server only: it carries the artwork. Served at /badge/<award>
// and drawn inline (components/badges/BadgeArt.tsx) where badges animate.

export type BadgeInput = {
  tier: AwardSlug;
  period: string;
  date: string;
  shape: BadgeShape;
  theme?: BadgeTheme;
};

/** A line of small caps: glyphs from the shared table, placed in font units and scaled to `size` px. */
export type BadgeText = { x: number; y: number; size: number; glyphs: { char: string; at: number }[] };

/**
 * One drawable piece. `part` names it for animation; `use` marks the shared
 * crow / arc outlines; `text` is a small-caps line (drawn with one <use> per
 * letter, so a page of badges doesn't repeat every letter's outline).
 */
export type BadgePart = {
  part: "bg" | "ring" | "arc" | "crow" | "perch" | "small" | "word" | "date" | "title" | "sub";
  tag: "circle" | "rect" | "path" | "text";
  use?: "crow" | "arc";
  text?: BadgeText;
  attrs: Record<string, string | number>;
};

/** The id of a letter's outline in <defs> ("g65" for A); prefixed by whoever draws it. */
export const glyphId = (char: string) => `g${char.codePointAt(0)}`;

export type BadgeModel = { width: number; height: number; label: string; shape: BadgeShape; parts: BadgePart[] };

const BLACK = "#0B0B0C";
const WHITE = "#FFFFFF";
const RED = "#E5261A";
const GOLD = "#D9A63A";

type Palette = { bg: string; ink: string; crow: string };

function palette(tier: AwardSlug, theme: BadgeTheme): Palette {
  const dark = theme === "dark";
  const base = { bg: dark ? BLACK : WHITE, ink: dark ? WHITE : BLACK };
  switch (tier) {
    case "SOTM":
      return { ...base, crow: RED };
    case "SOTY":
      // Dark: gold throughout, as designed. Light: gold crow, black lettering (gold text on white is too faint).
      return dark ? { bg: BLACK, ink: GOLD, crow: GOLD } : { ...base, crow: GOLD };
    case "HM":
      return { ...base, crow: dark ? "#C4C7CC" : "#9EA2A8" }; // silver
    default:
      return { ...base, crow: base.ink };
  }
}

/** The small line above the big word on the seal. */
const SEAL_SMALL: Record<AwardSlug, string> = {
  SOTD: "SITE OF THE",
  SOTM: "SITE OF THE",
  SOTY: "SITE OF THE",
  F100: "ONE OF THE FIRST",
  HM: "HONORABLE",
  BSC: "BEST SOLO",
};

const TRACKING = 0.3; // em, small caps (measured from the artwork)
const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * A small-caps line: Inter SemiBold at `size` px, baseline `y`. `at`
 * positions it: "start" puts the pen at x; "center" centres the advance box
 * (trailing tracking included, as the artwork does) on x; "ink" centres the
 * drawn letters on x. Characters without a glyph are skipped.
 */
function caps(text: string, size: number, x: number, y: number, at: "start" | "center" | "ink") {
  const s = size / UNITS_PER_EM;
  const chars = [...text.toUpperCase()].filter((c) => GLYPHS[c]);
  const step = (c: string) => GLYPHS[c][0] + TRACKING * UNITS_PER_EM; // font units
  const total = chars.reduce((w, c) => w + step(c), 0) * s;
  let start = x;
  if (at === "center") start = x - total / 2;
  if (at === "ink") start = x - (total - TRACKING * size) / 2;
  let pen = 0;
  const glyphs: BadgeText["glyphs"] = [];
  for (const c of chars) {
    if (GLYPHS[c][1]) glyphs.push({ char: c, at: Math.round(pen) });
    pen += step(c);
  }
  const line: BadgeText = { x: r2(start), y, size, glyphs };
  return { line, x1: start + total - TRACKING * size };
}

function seal({ tier, period, date }: BadgeInput, p: Palette): BadgePart[] {
  const small = caps(SEAL_SMALL[tier], 19, 256, 325, "center");
  const line = caps(badgeDate(tier, period, date), 15, 256, 457, "ink");
  return [
    { part: "bg", tag: "circle", attrs: { cx: 256, cy: 256, r: 256, fill: p.bg } },
    { part: "ring", tag: "circle", attrs: { cx: 256, cy: 256, r: 247, fill: "none", stroke: p.ink, "stroke-width": 3 } },
    { part: "arc", tag: "path", use: "arc", attrs: { fill: p.ink, d: SEAL_ARC } },
    {
      part: "crow",
      tag: "path",
      use: "crow",
      attrs: { fill: p.crow, transform: "translate(134 96.32) scale(0.24)", d: CROW },
    },
    { part: "perch", tag: "rect", attrs: { x: 100, y: 274, width: 312, height: 3, fill: p.ink } },
    { part: "small", tag: "text", text: small.line, attrs: { fill: p.ink } },
    { part: "word", tag: "path", attrs: { fill: p.ink, d: SEAL_WORD[tier] } },
    { part: "date", tag: "text", text: line.line, attrs: { fill: p.ink } },
  ];
}

function tag({ tier, period, date }: BadgeInput, p: Palette): { width: number; parts: BadgePart[] } {
  const title = TAG_TITLE[tier];
  const text =
    tier === "F100"
      ? `HONORARY · SHEMOQMEDI.SPACE · ${badgeDate(tier, period, date)}`
      : `SHEMOQMEDI.SPACE · ${badgeDate(tier, period, date)}`;
  const sub = caps(text, 10.5, 136.9, 82, "start");
  const width = Math.ceil(Math.max(title.right, sub.x1) + 32);
  return {
    width,
    parts: [
      {
        part: "bg",
        tag: "rect",
        attrs: { x: 1.25, y: 1.25, width: width - 2.5, height: 109.5, rx: 18, fill: p.bg, stroke: p.ink, "stroke-width": 2.5 },
      },
      {
        part: "crow",
        tag: "path",
        use: "crow",
        attrs: { fill: p.crow, transform: "translate(30 18.09) scale(0.084)", d: CROW },
      },
      { part: "perch", tag: "rect", attrs: { x: 30, y: 80, width: 84, height: 2, fill: p.ink } },
      { part: "title", tag: "path", attrs: { fill: p.ink, d: title.d } },
      { part: "sub", tag: "text", text: sub.line, attrs: { fill: p.ink } },
    ],
  };
}

/** The badge as data: its size and its parts in drawing order. */
export function badgeModel(input: BadgeInput): BadgeModel {
  const p = palette(input.tier, input.theme ?? SIGNATURE_THEME[input.tier]);
  const label = badgeLabel(input.tier, input.period, input.date);
  if (input.shape === "seal") {
    return { width: SEAL_SIZE, height: SEAL_SIZE, label, shape: "seal", parts: seal(input, p) };
  }
  const t = tag(input, p);
  return { width: t.width, height: TAG_HEIGHT, label, shape: "tag", parts: t.parts };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Motion for the standalone image (?motion=1): the crow hops once when the
 * image loads, then nods every few seconds. CSS inside an SVG runs when it
 * is shown through <img>. Only the crow moves and nothing starts hidden, so
 * a browser that holds the image on its first frame still shows the whole
 * badge. Off for people who ask for reduced motion.
 */
const MOTION_CSS = `
.p-crow{transform-box:fill-box;transform-origin:62% 100%}
@media (prefers-reduced-motion:no-preference){
.p-crow{animation:hop .9s cubic-bezier(.3,0,.3,1) .5s 1,nod 7s ease-in-out 3.5s infinite}
}
@keyframes hop{0%,100%{transform:none}32%{transform:translateY(-11%) rotate(-6deg)}66%{transform:translateY(0) rotate(2deg)}}
@keyframes nod{0%,88%,100%{transform:none}92%{transform:rotate(-3deg)}96%{transform:rotate(1deg)}}`.replace(/\n/g, "");

/** The transform that takes a line's glyphs (font units, y up) to its place on the badge. */
export function textTransform(t: BadgeText) {
  const s = Math.round((t.size / UNITS_PER_EM) * 1e6) / 1e6;
  return `translate(${t.x} ${t.y}) scale(${s} ${-s})`;
}

/** The badge as a standalone SVG document (what /badge/<award> serves). */
export function badgeSvg(input: BadgeInput & { motion?: boolean }) {
  const m = badgeModel(input);
  // Each letter's outline once, however often the badge uses it.
  const used = [...new Set(m.parts.flatMap((p) => p.text?.glyphs.map((g) => g.char) ?? []))];
  const defs = used.map((c) => `<path id="${glyphId(c)}" d="${GLYPHS[c][1]}"/>`).join("");
  const body = m.parts
    .map(({ part, tag: el, attrs, text }) => {
      if (text) {
        const letters = text.glyphs.map((g) => `<use href="#${glyphId(g.char)}" x="${g.at}"/>`).join("");
        return `<g class="p p-${part}" fill="${attrs.fill}"><g transform="${textTransform(text)}">${letters}</g></g>`;
      }
      const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${esc(String(v))}"`)
        .join(" ");
      // A part placed with a transform attribute is wrapped, so the animation's
      // CSS transform (which would replace the attribute) applies to the wrapper.
      return attrs.transform ? `<g class="p p-${part}"><${el} ${a}/></g>` : `<${el} class="p p-${part}" ${a}/>`;
    })
    .join("");
  const title = esc(`${m.label} on Shemoqmedi`);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.width} ${m.height}" width="${m.width}" height="${m.height}" role="img" aria-label="${title}">` +
    `<title>${title}</title>${input.motion ? `<style>${MOTION_CSS}</style>` : ""}<defs>${defs}</defs>${body}</svg>`
  );
}
