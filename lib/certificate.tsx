import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { badgeSvg } from "@/lib/badgeSvg";
import { JURY_CATEGORIES, type AwardSlug } from "@/lib/taxonomy";
import { SITE_URL } from "@/lib/site";

// The award certificate: an A4 portrait poster in the award's own colours,
// drawn by Satori (next/og) as a PNG. Designed on the "Shemoqmedi Award
// Certificates" Claude Design canvas: the award name huge in condensed caps,
// the real seal, who won it, the jury's score, and the names of the people
// who stand behind it. It is issued digitally: handwritten signatures are
// never put on a downloadable image, where they could be lifted. Instead it
// carries a signed certificate number and a QR code that open /verify, the
// official record, so a copy or an edited version is easy to catch. The
// number is also written into the PNG's metadata.
// Served at /certificate/<award> (real awards) and /certificate/sample/<tier>.

export type CertificateJuror = { name: string; panel: string | null };

export type CertificateData = {
  tier: AwardSlug;
  slug: string; // the award's slug, for the verify link
  period: string;
  date: string; // YYYY-MM-DD
  score: number | null;
  title: string; // the site
  creditName: string; // its maker
  jurors: CertificateJuror[]; // the jurors who scored it, at most three are shown
  pillars: { design: number; usability: number; creativity: number; content: number } | null;
  /** The signed certificate number and the /verify link its QR code opens; null when numbers aren't set up. */
  verify: { code: string; url: string } | null;
  sample?: boolean;
};

// A4 at 96 dpi, drawn at 2x.
const W = 1131;
const H = 1600;
const S = 2;
const px = (n: number) => n * S;

const INK = "#0A0A0A";
const PAPER = "#F4F1EA";
const ORANGE = "#FF4D00";

type Look = {
  bg: string;
  ink: string;
  muted: string;
  lines: [string, string];
  size: number; // headline px at 1x; measured so the widest line fits the frame
  accent?: { line: 0 | 1; word: string; color?: string; fill?: string };
  dark: boolean; // white crow, light seal
};

const LOOKS: Record<AwardSlug, Look> = {
  F100: { bg: ORANGE, ink: INK, muted: INK, lines: ["First", "100"], size: 430, dark: false },
  HM: { bg: "#9EA2A8", ink: INK, muted: INK, lines: ["Honorable", "Mention"], size: 220, dark: false },
  SOTD: { bg: INK, ink: PAPER, muted: "#A8A39A", lines: ["Site of", "the Day"], size: 300, accent: { line: 1, word: "Day", color: ORANGE }, dark: true },
  SOTM: { bg: "#E5261A", ink: INK, muted: INK, lines: ["Site of", "the Month"], size: 220, dark: false },
  SOTY: { bg: INK, ink: PAPER, muted: "#A8A39A", lines: ["Site of", "the Year"], size: 268, accent: { line: 1, word: "Year", color: "#D9A63A" }, dark: true },
  BSC: { bg: PAPER, ink: INK, muted: "#6B665E", lines: ["Best Solo", "Creation"], size: 236, accent: { line: 0, word: "Solo", fill: ORANGE }, dark: false },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "12 November 2026", "November 2026" (Site of the Month), "2026" (Site of the Year). */
export function certificateDate(tier: AwardSlug, period: string, date: string) {
  if (tier === "SOTY" && /^\d{4}$/.test(period)) return period;
  if (tier === "SOTM" && /^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split("-").map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  }
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function panelName(slug: string | null) {
  return JURY_CATEGORIES.find((c) => c.slug === slug)?.name ?? null;
}

export function certificateFilename(slug: string) {
  return `shemoqmedi-certificate-${slug}.png`;
}

let fonts: Promise<{ name: string; data: Buffer; weight: 500 | 600 | 800 | 900; style: "normal" }[]> | null = null;
function loadFonts() {
  const dir = join(process.cwd(), "public/fonts/certificate");
  fonts ??= Promise.all([
    readFile(join(dir, "archivo-62-900.woff")).then((data) => ({ name: "Archivo Display", data, weight: 900 as const, style: "normal" as const })),
    readFile(join(dir, "archivo-75-800.woff")).then((data) => ({ name: "Archivo Name", data, weight: 800 as const, style: "normal" as const })),
    readFile(join(dir, "inter-500.woff")).then((data) => ({ name: "Inter", data, weight: 500 as const, style: "normal" as const })),
    readFile(join(dir, "inter-600.woff")).then((data) => ({ name: "Inter", data, weight: 600 as const, style: "normal" as const })),
  ]);
  return fonts;
}

async function crowSrc(dark: boolean) {
  const file = await readFile(join(process.cwd(), "public/brand", dark ? "crow-clear-white.png" : "crow-clear.png"));
  return `data:image/png;base64,${file.toString("base64")}`;
}

const svgSrc = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const score2 = (n: number) => n.toFixed(2);
const score1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

// CRC-32 for PNG chunks (zlib's crc32 needs Node 22.2+; this works on any Node).
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** PNG text chunks (keyword + value), written right after IHDR, so the file itself names its certificate. */
function withPngText(png: Buffer, entries: [string, string][]) {
  const chunks = entries.map(([key, value]) => {
    const data = Buffer.from(`${key}\0${value}`, "latin1");
    const type = Buffer.from("tEXt", "latin1");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([type, data])) >>> 0);
    return Buffer.concat([length, type, data, crc]);
  });
  const afterIhdr = 8 + 4 + 4 + 13 + 4; // signature + the IHDR chunk
  return Buffer.concat([png.subarray(0, afterIhdr), ...chunks, png.subarray(afterIhdr)]);
}

/** The site name's size: as big as fits `width` (an estimate for Archivo at 75% width), never over 96. */
function nameSize(title: string, width: number) {
  return Math.max(48, Math.min(96, Math.floor(width / (Math.max(title.length, 1) * 0.52))));
}

export async function certificateImage(c: CertificateData, opts: { download?: boolean } = {}) {
  const look = LOOKS[c.tier];
  const honorary = c.tier === "F100";
  const [crow, fontList] = await Promise.all([crowSrc(look.dark), loadFonts()]);
  const seal = svgSrc(badgeSvg({ tier: c.tier, period: c.period, date: c.date, shape: "seal", theme: look.dark ? "light" : "dark" }));
  const verifyHost = SITE_URL.replace(/^https?:\/\/(www\.)?/, "");
  const label = { fontFamily: "Inter", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: px(0.18 * 22) };
  const rule = look.ink;
  const kicker = c.sample ? "Certificate of award · Sample" : "Certificate of award";
  const qr = c.verify
    ? svgSrc(
        await QRCode.toString(c.verify.url, {
          type: "svg",
          margin: 0,
          errorCorrectionLevel: "M",
          // Always dark on light: many phone cameras can't read a light-on-dark code.
          color: { dark: `${INK}FF`, light: "#00000000" },
        }),
      )
    : null;

  // The QR code beside its number; without numbers set up, the award page link as before.
  const verifyBlock =
    c.verify && qr ? (
      <div style={{ display: "flex", alignItems: "center", gap: px(14) }}>
        {/* on the black certificates the code sits on an off-white tile */}
        <div style={{ display: "flex", padding: look.dark ? px(8) : 0, backgroundColor: look.dark ? PAPER : "transparent" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={qr} width={px(look.dark ? 88 : 96)} height={px(look.dark ? 88 : 96)} style={{ width: px(look.dark ? 88 : 96), height: px(look.dark ? 88 : 96) }} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: px(4) }}>
          <div style={{ ...label, fontSize: px(14), color: look.muted }}>Verify</div>
          <div style={{ fontSize: px(17), fontWeight: 600 }}>{c.verify.code}</div>
          <div style={{ fontSize: px(14), fontWeight: 500 }}>{`${verifyHost}/verify`}</div>
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: px(6) }}>
        <div style={{ ...label, fontSize: px(16), color: look.muted }}>Verify</div>
        <div style={{ fontSize: px(16), fontWeight: 500 }}>{`${verifyHost}/awards/`}</div>
        <div style={{ fontSize: px(16), fontWeight: 500 }}>{c.slug}</div>
      </div>
    );

  // Each word its own box with a set gap: Satori draws a space in this condensed cut far too narrow.
  const headline = (line: string, i: number) => {
    const a = look.accent && look.accent.line === i ? look.accent : null;
    return (
      <div key={i} style={{ display: "flex", gap: px(look.size * 0.2) }}>
        {line.split(" ").map((word, j) =>
          a && word === a.word ? (
            <span
              key={j}
              style={a.fill ? { color: look.ink, backgroundColor: a.fill, paddingLeft: px(look.size * 0.04), paddingRight: px(look.size * 0.04) } : { color: a.color ?? look.ink }}
            >
              {word}
            </span>
          ) : (
            <span key={j}>{word}</span>
          ),
        )}
      </div>
    );
  };

  // The bottom row's columns get fixed widths: Satori does not share space by flex: 1 here.
  const cols = honorary ? 3 : 4;
  const gap = honorary ? 40 : 32;
  const colW = (W - 176 - gap * (cols - 1)) / cols;

  // A set left margin between columns: Satori ignored space-between and gap on this row.
  const signature = (name: string, role: string, key: string, first = false) => (
    <div key={key} style={{ display: "flex", flexDirection: "column", width: px(colW), flexShrink: 0, gap: px(8), marginLeft: first ? 0 : px(gap) }}>
      <div style={{ width: px(colW), height: px(64), borderBottom: `${px(1)}px solid ${rule}` }} />
      <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: px(18) }}>{name}</div>
      <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: px(15), color: look.muted }}>{role}</div>
    </div>
  );

  const jurors = c.jurors.slice(0, 3);
  const dateText = certificateDate(c.tier, c.period, c.date);
  const nameWidth = honorary ? 955 : 620;

  const image = (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: look.bg, color: look.ink, fontFamily: "Inter" }}>
      {/* header: wordmark and kicker, then a rule */}
      <div style={{ position: "absolute", left: px(88), right: px(88), top: px(88), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: px(16) }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={crow} width={px(60)} height={px(45)} style={{ width: px(60), height: px(45) }} alt="" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: px(32), letterSpacing: px(-1.6), textTransform: "uppercase" }}>Shemoqmedi</span>
            <span style={{ fontFamily: "Inter", fontWeight: 600, fontSize: px(13), letterSpacing: px(3.5), textTransform: "uppercase", marginTop: px(6) }}>Space</span>
          </div>
        </div>
        <div style={{ ...label, fontSize: px(22) }}>{kicker}</div>
      </div>
      <div style={{ position: "absolute", left: px(88), right: px(88), top: px(196), height: px(2), background: rule }} />

      {/* the award, huge */}
      <div
        style={{
          position: "absolute",
          left: px(80),
          right: px(80),
          top: px(240),
          display: "flex",
          flexDirection: "column",
          fontFamily: "Archivo Display",
          fontWeight: 900,
          fontSize: px(look.size),
          lineHeight: 0.8,
          letterSpacing: px(look.size * -0.03),
          textTransform: "uppercase",
        }}
      >
        {look.lines.map(headline)}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
      <img
        src={seal}
        width={px(honorary ? 300 : 240)}
        height={px(honorary ? 300 : 240)}
        style={{ position: "absolute", right: px(88), top: px(honorary ? 690 : 740), width: px(honorary ? 300 : 240), height: px(honorary ? 300 : 240) }}
        alt=""
      />

      {/* who won it */}
      <div style={{ position: "absolute", left: px(88), top: px(honorary ? 1030 : 1000), width: px(nameWidth), display: "flex", flexDirection: "column" }}>
        <div style={{ ...label, fontSize: px(22), color: look.muted }}>
          {honorary ? `Honorary · number ${c.period} of 100 · awarded to` : "Awarded to"}
        </div>
        <div
          style={{
            marginTop: px(18),
            fontFamily: "Archivo Name",
            fontWeight: 800,
            fontSize: px(nameSize(c.title, nameWidth)),
            lineHeight: 0.9,
            textTransform: "uppercase",
          }}
        >
          {c.title}
        </div>
        <div style={{ marginTop: px(14), fontSize: px(24), fontWeight: 500, color: look.muted }}>{`by ${c.creditName}`}</div>
        {honorary ? (
          <div style={{ marginTop: px(28), fontSize: px(24), lineHeight: 1.4, fontWeight: 500, maxWidth: px(760) }}>
            One of the first 100 websites listed on Shemoqmedi, the web design awards judged by designers and developers.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {c.score !== null ? (
              <div style={{ marginTop: px(24), fontSize: px(24), fontWeight: 600 }}>
                {/* the juror count only when the score comes from these same reviews (not a Month or Year round) */}
                {`Final jury score ${score2(c.score)}${c.pillars && c.jurors.length ? ` from ${c.jurors.length} juror${c.jurors.length === 1 ? "" : "s"}` : ""}`}
              </div>
            ) : null}
            {c.pillars ? (
              <div style={{ marginTop: px(6), fontSize: px(20), fontWeight: 500, color: look.muted }}>
                {`Design ${score1(c.pillars.design)} · Usability ${score1(c.pillars.usability)} · Creativity ${score1(c.pillars.creativity)} · Content ${score1(c.pillars.content)}`}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* date and verify (beside the winner on jury awards; in the bottom row on First 100) */}
      {honorary ? null : (
        <div style={{ position: "absolute", right: px(88), top: px(1010), width: px(300), display: "flex", flexDirection: "column", alignItems: "flex-end", gap: px(8) }}>
          <div style={{ ...label, fontSize: px(16), color: look.muted }}>Awarded</div>
          <div style={{ fontSize: px(24), fontWeight: 600, marginBottom: px(22) }}>{dateText}</div>
          {verifyBlock}
        </div>
      )}

      {/* bottom row */}
      <div
        style={{
          position: "absolute",
          left: px(88),
          right: px(88),
          bottom: px(88),
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          width: px(W - 176), // set: Satori sizes an absolute box to its content, not to left + right
          paddingTop: px(28),
          borderTop: `${px(2)}px solid ${rule}`,
        }}
      >
        {honorary ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", width: px(colW), flexShrink: 0, gap: px(8) }}>
              <div style={{ ...label, fontSize: px(16) }}>Awarded</div>
              <div style={{ fontSize: px(24), fontWeight: 600 }}>{dateText}</div>
            </div>
            {signature("Giorgi Khvichia", "Founder, Shemoqmedi", "founder")}
            <div style={{ display: "flex", flexDirection: "column", width: px(colW), flexShrink: 0, marginLeft: px(gap), alignItems: "flex-end" }}>
              {verifyBlock}
            </div>
          </>
        ) : (
          <>
            {jurors.map((j, i) => signature(j.name, j.panel ? `Juror, ${j.panel}` : "Juror", `j${i}`, i === 0))}
            {signature("Giorgi Khvichia", "Founder, Shemoqmedi", "founder")}
          </>
        )}
      </div>

      {/* issued digitally: how to tell a real one */}
      <div style={{ position: "absolute", left: px(88), bottom: px(40), width: px(W - 176), display: "flex", fontSize: px(13), fontWeight: 500, color: look.muted }}>
        {c.verify
          ? `Issued digitally by Shemoqmedi. Handwritten signatures are not reproduced. Check this certificate at ${verifyHost}/verify.`
          : "Issued digitally by Shemoqmedi. Handwritten signatures are not reproduced."}
      </div>
    </div>
  );

  // A real certificate is private to its owner (app/certificate/[slug]/route.tsx):
  // never stored by a shared cache or the CDN. Samples are public.
  const headers: Record<string, string> = c.sample
    ? { "Cache-Control": "public, max-age=300, s-maxage=300", "Access-Control-Allow-Origin": "*" }
    : // The owner's own browser may keep it an hour; shared caches never.
      { "Cache-Control": "private, max-age=3600" };
  headers["X-Robots-Tag"] = "noindex";
  if (opts.download) headers["Content-Disposition"] = `attachment; filename="${certificateFilename(c.slug)}"`;

  const rendered = new ImageResponse(image, { width: px(W), height: px(H), fonts: await fontList });
  const png = withPngText(Buffer.from(await rendered.arrayBuffer()), [
    ["Title", `Shemoqmedi certificate: ${/^[\x20-\xFF]*$/.test(c.title) ? c.title : c.slug}`], // tEXt is Latin-1
    ["Author", "Shemoqmedi"],
    ["Certificate", c.verify?.code ?? c.slug],
    ["Verify", c.verify?.url ?? `${SITE_URL}/awards/${c.slug}`],
  ]);
  return new Response(new Uint8Array(png), { headers: { ...headers, "Content-Type": "image/png" } });
}
