import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { badgeSvg } from "@/lib/badgeSvg";

// /badge/<award slug> — the badge image for one real award.
//   ?shape=seal   the round seal (default: the horizontal tag)
//   ?theme=light|dark   (default: the award's signature look)
//   ?motion=1     the crow hops when it loads, then nods now and then
// Unknown or revoked awards get a 404, so a badge can't be made up: it
// exists only while the award does. Cached at the edge for an hour, so a
// revoked badge disappears within the hour.

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
    motion: query.get("motion") === "1",
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
