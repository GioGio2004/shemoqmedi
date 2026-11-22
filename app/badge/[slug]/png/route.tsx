import { ImageResponse } from "next/og";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { badgeSvg } from "@/lib/badgeSvg";

// /badge/<award slug>/png — the same badge as /badge/<slug>, as a PNG, for
// places that can't show SVG: emails (Gmail, Outlook) above all.
//   ?shape=seal   the round seal (default: the horizontal tag)
//   ?theme=light|dark
// Drawn at 3x for sharp screens; the email sets the display size.
// Unknown or revoked awards get a 404, like the SVG.

const SCALE = 3;

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = new URL(request.url).searchParams;
  const theme = query.get("theme");
  let award = null;
  try {
    award = await fetchQuery(api.awards.getBySlug, { slug });
  } catch (error) {
    console.error("awards.getBySlug failed:", error);
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!award) {
    return new Response("No such award", {
      status: 404,
      headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  }
  const svg = badgeSvg({
    tier: award.tier,
    period: award.period,
    date: award.date,
    shape: query.get("shape") === "seal" ? "seal" : "tag",
    theme: theme === "light" || theme === "dark" ? theme : undefined,
  });
  const w = Number(/width="([\d.]+)"/.exec(svg)?.[1] ?? 0);
  const h = Number(/height="([\d.]+)"/.exec(svg)?.[1] ?? 0);
  if (!w || !h) return new Response("Badge size unknown", { status: 500 });
  const width = Math.round(w * SCALE);
  const height = Math.round(h * SCALE);
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img src={src} width={width} height={height} style={{ width, height }} alt="" />
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
