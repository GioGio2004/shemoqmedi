import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { panelName } from "@/components/jury/jurorInfo";
import { getJurorPage, getJurorSlugs } from "@/lib/listings";

// A juror's share card (og:image, and twitter:image through Next's copy):
// their portrait × the crow, then name, role and panel. Black, off-white and
// one orange accent, the post design system's palette. Text uses the font
// bundled with next/og (one regular weight); a hairline stroke makes it bold.

export const alt = "Shemoqmedi Jury member";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getJurorSlugs()).map(({ slug }) => ({ slug }));
}

const INK = "#0A0A0A";
const PAPER = "#F4F1EA";
const ORANGE = "#FF4D00";
const MUTED = "#A8A39A";
const TILE = 264;
/** Width left for the name beside the tiles, in px. */
const TEXT_WIDTH = 1200 - 144 - (TILE * 2 + 22 * 2 + 40) - 56;

/**
 * The juror's photo as a data URL, or null. Satori reads PNG and JPEG only:
 * ImageKit is asked for a face-centred JPG crop, other hosts (Clerk) for
 * JPEG/PNG through the Accept header; anything else falls back to initials.
 */
async function photoData(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "ik.imagekit.io") u.searchParams.set("tr", `w-${TILE * 2},h-${TILE * 2},fo-face,f-jpg,q-85`);
    const res = await fetch(u, { headers: { Accept: "image/jpeg,image/png" } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type")?.split(";")[0] ?? "";
    if (type !== "image/jpeg" && type !== "image/png") return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Title-cases an all-lowercase name ("giorgi khvichia"); mixed case is kept as typed. */
function displayName(name: string) {
  return name === name.toLowerCase() ? name.replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()) : name;
}

export default async function JurorOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, crow] = await Promise.all([
    getJurorPage(slug),
    readFile(join(process.cwd(), "public/brand/crow.png")),
  ]);
  const juror = data?.juror;
  const name = juror ? displayName(juror.name) : "Shemoqmedi Jury";
  const title = juror?.title ?? "";
  const panel = juror ? panelName(juror.category) : "";
  const photo = await photoData(juror?.imageUrl ?? null);
  const crowSrc = `data:image/png;base64,${crow.toString("base64")}`;
  // The longest word must fit on one line (Geist is about 0.56em per letter).
  const longest = Math.max(...name.split(/\s+/).map((w) => w.length), 1);
  const nameSize = Math.max(44, Math.min(84, Math.floor(TEXT_WIDTH / (longest * 0.56))));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: INK,
          color: PAPER,
        }}
      >
        {/* Top line: the program, and the founding mark. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: ORANGE }} />
            <span style={{ WebkitTextStroke: `0.6px ${PAPER}` }}>Shemoqmedi Jury</span>
          </div>
          {juror?.isFounding && (
            <div
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 999,
                border: `2px solid ${ORANGE}`,
                color: ORANGE,
                fontSize: 20,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Founding member
            </div>
          )}
        </div>

        {/* Portrait × crow, then who they are. */}
        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser
              <img src={photo} width={TILE} height={TILE} style={{ width: TILE, height: TILE, borderRadius: 32, objectFit: "cover" }} alt="" />
            ) : (
              <div
                style={{
                  width: TILE,
                  height: TILE,
                  borderRadius: 32,
                  background: "#1F1F1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 110,
                  color: MUTED,
                }}
              >
                {initials(name)}
              </div>
            )}
            <div style={{ display: "flex", fontSize: 64, color: ORANGE, lineHeight: 1, WebkitTextStroke: `2px ${ORANGE}` }}>×</div>
            <div
              style={{
                width: TILE,
                height: TILE,
                borderRadius: 32,
                background: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
              <img src={crowSrc} width={194} height={144} style={{ width: 194, height: 144 }} alt="" />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                fontSize: nameSize,
                lineHeight: 0.98,
                letterSpacing: -2,
                WebkitTextStroke: `2px ${PAPER}`,
              }}
            >
              {name}
            </div>
            {title && (
              <div
                style={{
                  display: "block",
                  marginTop: 24,
                  fontSize: 26,
                  lineHeight: 1.3,
                  color: MUTED,
                  lineClamp: 2,
                }}
              >
                {title}
              </div>
            )}
          </div>
        </div>

        {/* Bottom line: panel and address, over a hairline. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 26,
            borderTop: "2px solid rgba(244, 241, 234, 0.14)",
            fontSize: 22,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <span>{panel ? `${panel} panel` : "Jury"}</span>
          <span style={{ color: PAPER }}>shemoqmedi.space/jury</span>
        </div>
      </div>
    ),
    size,
  );
}
