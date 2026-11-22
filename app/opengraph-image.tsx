import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Default share card (og:image, and twitter:image through Next's copy) for
// every page without one of its own: black, off-white and one orange accent,
// the same system as the jurors' cards (app/(site)/jury/[slug]). Rendered
// once at build: no data, no network. Text uses the font bundled with
// next/og (one regular weight); a hairline stroke gives it its bold weight.
// Pages that set their own openGraph reference it as "/opengraph-image".

export const alt = "Shemoqmedi: the web's finest websites";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0A0A0A";
const PAPER = "#F4F1EA";
const ORANGE = "#FF4D00";
const MUTED = "#A8A39A";

export default async function OpenGraphImage() {
  const crow = await readFile(join(process.cwd(), "public/brand/crow.png"));
  const crowSrc = `data:image/png;base64,${crow.toString("base64")}`;

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 4, textTransform: "uppercase" }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ORANGE }} />
          <span style={{ WebkitTextStroke: `0.6px ${PAPER}` }}>Website awards</span>
        </div>

        {/* The crow on its tile, beside the stacked wordmark. */}
        <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
          <div
            style={{
              width: 264,
              height: 264,
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 112,
                lineHeight: 1,
                letterSpacing: -2,
                textTransform: "uppercase",
                WebkitTextStroke: `5px ${PAPER}`,
              }}
            >
              Shemoqmedi
            </div>
            <div
              style={{
                marginTop: 26,
                fontSize: 46,
                lineHeight: 1,
                letterSpacing: 14,
                textTransform: "uppercase",
                color: ORANGE,
                WebkitTextStroke: `1.5px ${ORANGE}`,
              }}
            >
              Space
            </div>
          </div>
        </div>

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
          <span>The web’s finest websites, scored by a jury</span>
          <span style={{ color: PAPER }}>shemoqmedi.space</span>
        </div>
      </div>
    ),
    size,
  );
}
