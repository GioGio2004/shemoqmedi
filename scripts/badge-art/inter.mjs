// Reads glyph outlines out of a variable TrueType WOFF2 font (the Inter file
// next/font caches in .next/static/media) at a chosen weight. Used once, by
// build.mjs, to draw badge lettering as paths; nothing here runs on the site.
//
// Implements just what that needs: the WOFF2 container, the transformed
// glyf table, cmap, hmtx, fvar/avar normalization and gvar deltas (with IUP)
// for simple glyphs. Composite glyphs are skipped (badge text is A–Z, 0–9
// and a few marks, all simple in Inter).

import fs from "node:fs";
import zlib from "node:zlib";

const KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ",
  "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS",
  "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc",
  "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop",
  "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill",
];

class Reader {
  constructor(buf, pos = 0) {
    this.buf = buf;
    this.pos = pos;
  }
  u8() {
    return this.buf[this.pos++];
  }
  i8() {
    const v = this.buf.readInt8(this.pos);
    this.pos += 1;
    return v;
  }
  u16() {
    const v = this.buf.readUInt16BE(this.pos);
    this.pos += 2;
    return v;
  }
  i16() {
    const v = this.buf.readInt16BE(this.pos);
    this.pos += 2;
    return v;
  }
  u32() {
    const v = this.buf.readUInt32BE(this.pos);
    this.pos += 4;
    return v;
  }
  fixed() {
    return this.buf.readInt32BE((this.pos += 4) - 4) / 65536;
  }
  f2dot14() {
    return this.i16() / 16384;
  }
  tag() {
    const s = this.buf.toString("latin1", this.pos, this.pos + 4);
    this.pos += 4;
    return s;
  }
  base128() {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = this.u8();
      v = v * 128 + (b & 0x7f);
      if (!(b & 0x80)) return v;
    }
    throw new Error("Bad UIntBase128");
  }
  u255() {
    const code = this.u8();
    if (code === 253) return this.u16();
    if (code === 255) return this.u8() + 253;
    if (code === 254) return this.u8() + 506;
    return code;
  }
}

/** WOFF2 file → { tag: { data, transformed } }. */
function readTables(file) {
  const r = new Reader(file);
  if (r.tag() !== "wOF2") throw new Error("Not a WOFF2 file");
  r.u32(); // flavor
  r.u32(); // length
  const numTables = r.u16();
  r.u16();
  r.u32(); // totalSfntSize
  const compressedSize = r.u32();
  r.pos += 2 + 2 + 4 + 4 + 4 + 4 + 4; // version, meta*, priv*
  const entries = [];
  for (let i = 0; i < numTables; i++) {
    const flags = r.u8();
    const index = flags & 0x3f;
    const tag = index === 63 ? r.tag() : KNOWN_TAGS[index];
    const version = flags >> 6;
    const origLength = r.base128();
    const transformed = tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    const length = transformed ? r.base128() : origLength;
    entries.push({ tag, transformed, length });
  }
  const data = zlib.brotliDecompressSync(file.subarray(r.pos, r.pos + compressedSize));
  const tables = {};
  let offset = 0;
  for (const e of entries) {
    tables[e.tag] = { data: data.subarray(offset, offset + e.length), transformed: e.transformed };
    offset += e.length;
  }
  return tables;
}

/** Transformed glyf → per glyph: null (empty/composite) or { points: [{x,y,on}], ends: [lastIndex per contour] }. */
function readGlyphs(table) {
  if (!table.transformed) throw new Error("Expected a transformed glyf table");
  const r = new Reader(table.data);
  r.u16(); // reserved
  r.u16(); // optionFlags
  const numGlyphs = r.u16();
  r.u16(); // indexFormat
  const sizes = [r.u32(), r.u32(), r.u32(), r.u32(), r.u32(), r.u32(), r.u32()];
  let pos = r.pos;
  const stream = sizes.map((size) => {
    const s = new Reader(table.data, pos);
    pos += size;
    return s;
  });
  const [nContour, nPoints, flagS, glyphS, compositeS] = stream;
  const sign = (flag, v) => (flag & 1 ? v : -v);
  const glyphs = [];
  for (let g = 0; g < numGlyphs; g++) {
    const contours = nContour.i16();
    if (contours === 0) {
      glyphs.push(null);
      continue;
    }
    if (contours < 0) {
      // Composite: walk its records so the streams stay in step.
      let instructions = false;
      for (;;) {
        const flags = compositeS.u16();
        compositeS.pos += 2 + (flags & 1 ? 4 : 2);
        if (flags & 0x0008) compositeS.pos += 2;
        else if (flags & 0x0040) compositeS.pos += 4;
        else if (flags & 0x0080) compositeS.pos += 8;
        if (flags & 0x0100) instructions = true;
        if (!(flags & 0x0020)) break;
      }
      if (instructions) glyphS.u255();
      glyphs.push(null);
      continue;
    }
    const ends = [];
    let total = 0;
    for (let c = 0; c < contours; c++) {
      total += nPoints.u255();
      ends.push(total - 1);
    }
    const points = [];
    let x = 0;
    let y = 0;
    for (let i = 0; i < total; i++) {
      const flag = flagS.u8();
      const on = !(flag >> 7);
      const b = flag & 0x7f;
      let dx;
      let dy;
      if (b < 10) {
        dx = 0;
        dy = sign(flag, ((b & 14) << 7) + glyphS.u8());
      } else if (b < 20) {
        dx = sign(flag, (((b - 10) & 14) << 7) + glyphS.u8());
        dy = 0;
      } else if (b < 84) {
        const b0 = b - 20;
        const b1 = glyphS.u8();
        dx = sign(flag, 1 + (b0 & 0x30) + (b1 >> 4));
        dy = sign(flag >> 1, 1 + ((b0 & 0x0c) << 2) + (b1 & 0x0f));
      } else if (b < 120) {
        const b0 = b - 84;
        dx = sign(flag, 1 + (Math.floor(b0 / 12) << 8) + glyphS.u8());
        dy = sign(flag >> 1, 1 + (((b0 % 12) >> 2) << 8) + glyphS.u8());
      } else if (b < 124) {
        const b1 = glyphS.u8();
        const b2 = glyphS.u8();
        dx = sign(flag, (b1 << 4) + (b2 >> 4));
        dy = sign(flag >> 1, ((b2 & 0x0f) << 8) + glyphS.u8());
      } else {
        dx = sign(flag, glyphS.u16());
        dy = sign(flag >> 1, glyphS.u16());
      }
      x += dx;
      y += dy;
      points.push({ x, y, on });
    }
    glyphS.u255(); // instruction length (the instructions sit in their own stream)
    glyphs.push({ points, ends });
  }
  return glyphs;
}

function readCmap(data) {
  const r = new Reader(data);
  r.u16();
  const n = r.u16();
  let best = null;
  for (let i = 0; i < n; i++) {
    const platform = r.u16();
    const encoding = r.u16();
    const offset = r.u32();
    const format = data.readUInt16BE(offset);
    const rank = format === 12 ? 2 : format === 4 && (platform === 3 || platform === 0) ? 1 : 0;
    if (rank && (!best || rank > best.rank)) best = { offset, format, rank, encoding };
  }
  if (!best) throw new Error("No usable cmap subtable");
  const map = new Map();
  const s = new Reader(data, best.offset);
  if (best.format === 12) {
    s.pos += 12;
    const groups = s.u32();
    for (let i = 0; i < groups; i++) {
      const start = s.u32();
      const end = s.u32();
      const gid = s.u32();
      for (let c = start; c <= end; c++) map.set(c, gid + (c - start));
    }
    return map;
  }
  s.pos += 6;
  const segCount = s.u16() / 2;
  s.pos += 6;
  const endCode = Array.from({ length: segCount }, () => s.u16());
  s.u16();
  const startCode = Array.from({ length: segCount }, () => s.u16());
  const idDelta = Array.from({ length: segCount }, () => s.i16());
  const rangeBase = s.pos;
  const idRangeOffset = Array.from({ length: segCount }, () => s.u16());
  for (let i = 0; i < segCount; i++) {
    for (let c = startCode[i]; c <= endCode[i] && c !== 0xffff; c++) {
      let gid;
      if (idRangeOffset[i] === 0) gid = (c + idDelta[i]) & 0xffff;
      else {
        const at = rangeBase + i * 2 + idRangeOffset[i] + (c - startCode[i]) * 2;
        gid = data.readUInt16BE(at);
        if (gid !== 0) gid = (gid + idDelta[i]) & 0xffff;
      }
      if (gid) map.set(c, gid);
    }
  }
  return map;
}

function readAdvances(tables, numGlyphs) {
  const count = tables.hhea.data.readUInt16BE(34);
  const r = new Reader(tables.hmtx.data);
  const out = [];
  if (tables.hmtx.transformed) {
    r.u8();
    for (let i = 0; i < count; i++) out.push(r.u16());
  } else {
    for (let i = 0; i < count; i++) {
      out.push(r.u16());
      r.i16();
    }
  }
  while (out.length < numGlyphs) out.push(out[count - 1]);
  return out;
}

/** Design-space axis values → normalized coordinates (fvar, then avar). */
function normalizer(tables) {
  const f = new Reader(tables.fvar.data);
  f.pos = 4;
  const axesOffset = f.u16();
  f.u16();
  const axisCount = f.u16();
  const axisSize = f.u16();
  const axes = [];
  for (let i = 0; i < axisCount; i++) {
    const a = new Reader(tables.fvar.data, axesOffset + i * axisSize);
    axes.push({ tag: a.tag(), min: a.fixed(), def: a.fixed(), max: a.fixed() });
  }
  const maps = [];
  if (tables.avar) {
    const a = new Reader(tables.avar.data);
    a.pos = 6;
    const n = a.u16();
    for (let i = 0; i < n; i++) {
      const pairs = a.u16();
      maps.push(Array.from({ length: pairs }, () => [a.f2dot14(), a.f2dot14()]));
    }
  }
  return {
    axes,
    normalize(values) {
      return axes.map((axis, i) => {
        const v = Math.min(axis.max, Math.max(axis.min, values[axis.tag] ?? axis.def));
        let n = v < axis.def ? -(axis.def - v) / (axis.def - axis.min || 1) : (v - axis.def) / (axis.max - axis.def || 1);
        const map = maps[i];
        if (map && map.length > 1) {
          for (let k = 1; k < map.length; k++) {
            const [f0, t0] = map[k - 1];
            const [f1, t1] = map[k];
            if (n >= f0 && n <= f1) {
              n = f1 === f0 ? t0 : t0 + ((t1 - t0) * (n - f0)) / (f1 - f0);
              break;
            }
          }
        }
        return n;
      });
    },
  };
}

function packedPoints(r) {
  let count = r.u8();
  if (count === 0) return null; // every point
  if (count & 0x80) count = ((count & 0x7f) << 8) | r.u8();
  const out = [];
  let value = 0;
  while (out.length < count) {
    const control = r.u8();
    const run = (control & 0x7f) + 1;
    for (let i = 0; i < run && out.length < count; i++) {
      value += control & 0x80 ? r.u16() : r.u8();
      out.push(value);
    }
  }
  return out;
}

function packedDeltas(r, count) {
  const out = [];
  while (out.length < count) {
    const control = r.u8();
    const run = (control & 0x3f) + 1;
    for (let i = 0; i < run && out.length < count; i++) {
      out.push(control & 0x80 ? 0 : control & 0x40 ? r.i16() : r.i8());
    }
  }
  return out;
}

/** Interpolates the deltas of untouched points along each contour (IUP), in place. */
function iup(points, ends, touched, delta, key) {
  let start = 0;
  for (const end of ends) {
    const idx = [];
    for (let i = start; i <= end; i++) if (touched[i]) idx.push(i);
    if (idx.length === 1) {
      for (let i = start; i <= end; i++) delta[i] = delta[idx[0]];
    } else if (idx.length > 1) {
      for (let k = 0; k < idx.length; k++) {
        const a = idx[k];
        const b = idx[(k + 1) % idx.length];
        const ca = points[a][key];
        const cb = points[b][key];
        const da = delta[a];
        const db = delta[b];
        // The untouched points strictly between a and b, wrapping round the contour.
        for (let i = a === end ? start : a + 1; i !== b; i = i === end ? start : i + 1) {
          const c = points[i][key];
          if (ca === cb) delta[i] = da === db ? da : 0;
          else if (c <= Math.min(ca, cb)) delta[i] = ca < cb ? da : db;
          else if (c >= Math.max(ca, cb)) delta[i] = ca > cb ? da : db;
          else delta[i] = da + ((db - da) * (c - ca)) / (cb - ca);
        }
      }
    }
    start = end + 1;
  }
}

/** A font instance: glyph(char) → { advance, contours: [[{x,y,on}]] } in font units, y up. */
export function loadFont(path, variation = {}) {
  const tables = readTables(fs.readFileSync(path));
  const unitsPerEm = tables.head.data.readUInt16BE(18);
  const glyphs = readGlyphs(tables.glyf);
  const cmap = readCmap(tables.cmap.data);
  const advances = readAdvances(tables, glyphs.length);
  const { axes, normalize } = tables.fvar ? normalizer(tables) : { axes: [], normalize: () => [] };
  const coords = normalize(variation);

  const gv = tables.gvar ? new Reader(tables.gvar.data) : null;
  let gvar = null;
  if (gv) {
    gv.pos = 4;
    const axisCount = gv.u16();
    const sharedCount = gv.u16();
    const sharedOffset = gv.u32();
    const glyphCount = gv.u16();
    const flags = gv.u16();
    const dataOffset = gv.u32();
    const offsets = Array.from({ length: glyphCount + 1 }, () => (flags & 1 ? gv.u32() : gv.u16() * 2));
    const s = new Reader(tables.gvar.data, sharedOffset);
    const shared = Array.from({ length: sharedCount }, () => Array.from({ length: axisCount }, () => s.f2dot14()));
    gvar = { axisCount, shared, dataOffset, offsets };
  }

  function instance(gid) {
    const base = glyphs[gid];
    let advance = advances[gid];
    if (!base) return { advance: Math.round(applyAdvance(gid, advance)), contours: [] };
    const n = base.points.length;
    const dx = new Array(n + 4).fill(0);
    const dy = new Array(n + 4).fill(0);
    forEachTuple(gid, n + 4, (scalar, pointIds, xs, ys) => {
      if (!pointIds) {
        for (let i = 0; i < n + 4; i++) {
          dx[i] += xs[i] * scalar;
          dy[i] += ys[i] * scalar;
        }
        return;
      }
      const tx = new Array(n + 4).fill(0);
      const ty = new Array(n + 4).fill(0);
      const touched = new Array(n + 4).fill(false);
      pointIds.forEach((p, i) => {
        if (p >= n + 4) return;
        touched[p] = true;
        tx[p] = xs[i];
        ty[p] = ys[i];
      });
      iup(base.points, base.ends, touched, tx, "x");
      iup(base.points, base.ends, touched, ty, "y");
      for (let i = 0; i < n + 4; i++) {
        dx[i] += tx[i] * scalar;
        dy[i] += ty[i] * scalar;
      }
    });
    advance += dx[n + 1] - dx[n];
    const moved = base.points.map((p, i) => ({ x: p.x + dx[i], y: p.y + dy[i], on: p.on }));
    const contours = [];
    let start = 0;
    for (const end of base.ends) {
      contours.push(moved.slice(start, end + 1));
      start = end + 1;
    }
    return { advance, contours };
  }

  /** Advance of an empty glyph (the space) at this instance. */
  function applyAdvance(gid, advance) {
    let delta = 0;
    forEachTuple(gid, 4, (scalar, pointIds, xs) => {
      const at = (p) => (pointIds ? (pointIds.indexOf(p) >= 0 ? xs[pointIds.indexOf(p)] : 0) : xs[p]);
      delta += (at(1) - at(0)) * scalar;
    });
    return advance + delta;
  }

  function forEachTuple(gid, pointCount, apply) {
    if (!gvar) return;
    const from = gvar.dataOffset + gvar.offsets[gid];
    const to = gvar.dataOffset + gvar.offsets[gid + 1];
    if (to <= from) return;
    const h = new Reader(tables.gvar.data, from);
    const countField = h.u16();
    const tupleCount = countField & 0x0fff;
    const d = new Reader(tables.gvar.data, from + h.u16());
    const sharedPoints = countField & 0x8000 ? packedPoints(d) : undefined;
    for (let t = 0; t < tupleCount; t++) {
      const size = h.u16();
      const index = h.u16();
      const peak = index & 0x8000 ? Array.from({ length: gvar.axisCount }, () => h.f2dot14()) : gvar.shared[index & 0x0fff];
      let lo = null;
      let hi = null;
      if (index & 0x4000) {
        lo = Array.from({ length: gvar.axisCount }, () => h.f2dot14());
        hi = Array.from({ length: gvar.axisCount }, () => h.f2dot14());
      }
      let scalar = 1;
      for (let a = 0; a < gvar.axisCount && scalar !== 0; a++) {
        const p = peak[a];
        const v = coords[a] ?? 0;
        if (p === 0) continue;
        if (v === 0) scalar = 0;
        else if (v === p) continue;
        else {
          const s0 = lo ? lo[a] : Math.min(p, 0);
          const s1 = hi ? hi[a] : Math.max(p, 0);
          if (v <= s0 || v >= s1) scalar = 0;
          else scalar *= v < p ? (v - s0) / (p - s0) : (s1 - v) / (s1 - p);
        }
      }
      const chunk = new Reader(tables.gvar.data, d.pos);
      d.pos += size;
      if (scalar === 0) continue;
      const pointIds = index & 0x2000 ? packedPoints(chunk) : sharedPoints === undefined ? null : sharedPoints;
      const count = pointIds ? pointIds.length : pointCount;
      const xs = packedDeltas(chunk, count);
      const ys = packedDeltas(chunk, count);
      apply(scalar, pointIds, xs, ys);
    }
  }

  return {
    unitsPerEm,
    axes,
    has: (char) => cmap.has(char.codePointAt(0)),
    glyph(char) {
      const gid = cmap.get(char.codePointAt(0));
      if (gid === undefined) throw new Error(`The font has no glyph for "${char}"`);
      return instance(gid);
    },
  };
}

const n1 = (v) => String(Math.round(v * 10) / 10);

/** TrueType contours → SVG path data (absolute M/L/Q/Z, font units, y up). */
export function contoursToPath(contours) {
  let d = "";
  for (const pts of contours) {
    if (pts.length < 2) continue;
    // Start on an on-curve point (or the midpoint of two off-curve ones).
    let startIndex = pts.findIndex((p) => p.on);
    let first;
    let list;
    if (startIndex < 0) {
      first = { x: (pts[0].x + pts[pts.length - 1].x) / 2, y: (pts[0].y + pts[pts.length - 1].y) / 2 };
      list = pts;
    } else {
      first = pts[startIndex];
      list = [...pts.slice(startIndex + 1), ...pts.slice(0, startIndex)];
    }
    d += `M${n1(first.x)} ${n1(first.y)}`;
    let control = null;
    for (const p of [...list, { ...first, on: true }]) {
      if (p.on) {
        d += control ? `Q${n1(control.x)} ${n1(control.y)} ${n1(p.x)} ${n1(p.y)}` : `L${n1(p.x)} ${n1(p.y)}`;
        control = null;
      } else {
        if (control) {
          const mid = { x: (control.x + p.x) / 2, y: (control.y + p.y) / 2 };
          d += `Q${n1(control.x)} ${n1(control.y)} ${n1(mid.x)} ${n1(mid.y)}`;
        }
        control = p;
      }
    }
    d += "Z";
  }
  return d;
}
