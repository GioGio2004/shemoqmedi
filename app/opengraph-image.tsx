import { ImageResponse } from "next/og";

// Default share card (og:image, and twitter:image through Next's copy) for
// every page without one of its own. Rendered once at build: no data, no
// network. Text uses the font bundled with next/og (one regular weight), so
// nothing is fetched; a hairline stroke gives the wordmark its bold weight.
// Pages that set their own openGraph reference it as "/opengraph-image".

export const alt = "Shemoqmedi: the web's finest websites";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px 96px 80px",
          background: "#ffffff",
          color: "#000000",
        }}
      >
        {/* The header's stacked wordmark, at poster size. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 144,
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: "uppercase",
              WebkitTextStroke: "6px #000000",
            }}
          >
            Shemoqmedi
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 58,
              lineHeight: 1,
              letterSpacing: 16,
              textTransform: "uppercase",
              WebkitTextStroke: "2px #000000",
            }}
          >
            Space
          </div>
        </div>
        <div
          style={{
            display: "flex",
            paddingTop: 36,
            borderTop: "2px solid rgba(0, 0, 0, 0.1)",
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          The web’s finest websites
        </div>
      </div>
    ),
    size,
  );
}
