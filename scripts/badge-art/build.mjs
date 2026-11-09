// Builds lib/badgeArt.ts from the badge artwork and the Inter font.
//
//   node scripts/badge-art/build.mjs scripts/badge-art/art <Inter latin .woff2>
//
// The artwork is the designer's set in ./art (seal-*.svg, tag-*.svg, crow.svg): its
// lettering is already outlines, so the crow, the seal's arc text and the big
// bold words are taken from it as they are. What the art does not have is
// drawn here in the same lettering (Inter SemiBold 600 at 0.30em tracking for
// small caps, Inter Bold 700 at -0.04em for big words, both measured from the
// art): a SemiBold glyph table for text set at request time (dates, member
// numbers, subtitles), and the big words of the two awards without artwork
// (Honorable Mention, Best Solo Creation).
//
// The font is the latin subset next/font caches under
// .next/dev/static/media/*-s.p.*.woff2 (see inter.mjs). Run once; commit the output.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contoursToPath, loadFont } from "./inter.mjs";

const [artDir, fontPath] = process.argv.slice(2);
if (!artDir || !fontPath) {
  console.error("Usage: node scripts/badge-art/build.mjs <artwork svg folder> <Inter latin .woff2>");
  process.exit(1);
}
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../lib/badgeArt.ts");

const r2 = (v) => String(Math.round(v * 100) / 100);
const read = (name) => fs.readFileSync(path.join(artDir, name), "utf8");
/** The `d` of every <path> without a transform (the lettering), in document order. */
const lettering = (svg) =>
  [...svg.matchAll(/<path ([^>]*?)d="([^"]+)"/g)].filter((m) => !m[1].includes("transform")).map((m) => m[2]);

/** Bounding box of absolute M/L/H/V/C/Q/Z path data (control points included: fine for lettering). */
function bbox(d) {
  let x = 0;
  let y = 0;
  const xs = [];
  const ys = [];
  for (const m of d.matchAll(/([MLHVCQZ])([^MLHVCQZ]*)/g)) {
    const n = (m[2].match(/-?\d*\.?\d+/g) ?? []).map(Number);
    const point = () => {
      xs.push(x);
      ys.push(y);
    };
    if (m[1] === "H") {
      for (const v of n) {
        x = v;
        point();
      }
    } else if (m[1] === "V") {
      for (const v of n) {
        y = v;
        point();
      }
    } else {
      for (let i = 0; i + 1 < n.length; i += 2) {
        x = n[i];
        y = n[i + 1];
        point();
      }
    }
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const semibold = loadFont(fontPath, { wght: 600 });
const bold = loadFont(fontPath, { wght: 700 });
const UPM = semibold.unitsPerEm;
const CAP = 1490; // Inter cap height, font units

/** Text as one path in px: baseline at y, starting at x; returns the ink box too. */
function setText(font, text, size, tracking, x, y) {
  const s = size / UPM;
  let pen = x;
  let d = "";
  let x0 = Infinity;
  let x1 = -Infinity;
  for (const ch of text) {
    const g = font.glyph(ch);
    if (g.contours.length) {
      const moved = g.contours.map((c) => c.map((p) => ({ x: pen + p.x * s, y: y - p.y * s, on: p.on })));
      for (const p of moved.flat()) {
        x0 = Math.min(x0, p.x);
        x1 = Math.max(x1, p.x);
      }
      d += contoursToPath(moved).replace(/-?\d+\.?\d*/g, (n) => r2(Number(n)));
    }
    pen += g.advance * s + tracking * size;
  }
  return { d, x0, x1 };
}

/** A bold word centred on the seal (x = 256), as wide as the art's widest word at most, top at the cap line. */
function sealWord(word) {
  const MAX_W = 312; // the perch line's width: "MONTH" in the art fills it
  const TOP = 350;
  const BAND = 69.84; // cap height of the art's 96px words
  const probe = setText(bold, word, 100, -0.04, 0, 0);
  const size = Math.min(96, (MAX_W / (probe.x1 - probe.x0)) * 100);
  const cap = (CAP / UPM) * size;
  // Shorter words sit in the middle of the band the big words fill.
  const baseline = TOP + (BAND - cap) / 2 + cap;
  const sized = setText(bold, word, size, -0.04, 0, baseline);
  const shift = 256 - (sized.x0 + sized.x1) / 2;
  return setText(bold, word, size, -0.04, shift, baseline).d;
}

/** A bold tag title where the art puts it (x = 137, baseline 62, 30px). */
function tagTitle(text) {
  const t = setText(bold, text, 30, -0.04, 135.65, 62);
  return { d: t.d, right: Math.round(t.x1 * 100) / 100 };
}

const seal = (name) => lettering(read(`seal-${name}.svg`));
const tag = (name) => {
  const d = lettering(read(`tag-${name}.svg`))[0];
  return { d, right: Math.round(bbox(d).x1 * 100) / 100 };
};
const crow = read("crow.svg").match(/<path [^>]*d="([^"]+)"/)[1];

// SemiBold glyphs for text set at request time: caps, digits and a few marks.
const glyphs = {};
for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.·-/ ") {
  const g = semibold.glyph(ch);
  let contours = g.contours;
  if (ch === "·" && contours.length === 0) {
    // Inter builds the middle dot from the full stop (a composite glyph, which
    // inter.mjs skips): lift the full stop to mid cap height, where the art has it.
    const dot = semibold.glyph(".").contours;
    const pts = dot.flat();
    const cx = (Math.min(...pts.map((p) => p.x)) + Math.max(...pts.map((p) => p.x))) / 2;
    const cy = (Math.min(...pts.map((p) => p.y)) + Math.max(...pts.map((p) => p.y))) / 2;
    contours = dot.map((c) => c.map((p) => ({ ...p, x: p.x + g.advance / 2 - cx, y: p.y + 706 - cy })));
  }
  glyphs[ch] = [Math.round(g.advance * 10) / 10, contoursToPath(contours)];
}

const data = {
  CROW: crow,
  SEAL_ARC: seal("day")[0],
  SEAL_WORD: {
    SOTD: seal("day")[2],
    SOTM: seal("month")[2],
    SOTY: seal("year")[2],
    F100: seal("first-100")[2],
    HM: sealWord("MENTION"),
    BSC: sealWord("CREATION"),
  },
  TAG_TITLE: {
    SOTD: tag("day"),
    SOTM: tag("month"),
    SOTY: tag("year"),
    F100: tag("first-100"),
    HM: tagTitle("HONORABLE MENTION"),
    BSC: tagTitle("BEST SOLO CREATION"),
  },
};

const ts = `// Generated by scripts/badge-art/build.mjs from the badge artwork and Inter. Do not edit by hand.
//
// CROW: the crow, in a 1000 x 747 box. SEAL_ARC: "SHEMOQMEDI.SPACE" round the
// top of the 512 x 512 seal. SEAL_WORD: each award's big word on the seal.
// TAG_TITLE: each award's title on the 112-high tag, with its right edge.
// GLYPHS: Inter SemiBold outlines ([advance, path], ${UPM} units per em, y up)
// for the small-caps lines set at request time (lib/badgeSvg.ts).

export const UNITS_PER_EM = ${UPM};

export const CROW =
  ${JSON.stringify(data.CROW)};

export const SEAL_ARC =
  ${JSON.stringify(data.SEAL_ARC)};

export const SEAL_WORD = ${JSON.stringify(data.SEAL_WORD, null, 2)} as const;

export const TAG_TITLE = ${JSON.stringify(data.TAG_TITLE, null, 2)} as const;

export const GLYPHS: Record<string, readonly [number, string]> = ${JSON.stringify(glyphs, null, 2)};
`;
fs.writeFileSync(out, ts);
console.log(`Wrote ${path.relative(process.cwd(), out)} (${(ts.length / 1024).toFixed(1)} KB, ${Object.keys(glyphs).length} glyphs)`);
