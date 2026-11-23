import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { certificateImage, panelName } from "@/lib/certificate";
import { getJuryReviews } from "@/lib/listings";

// /certificate/<award slug> — the award's certificate as a PNG (A4 portrait,
// 2262 x 3200). ?download=1 saves it as a file instead of showing it.
// Like the badge, unknown or revoked awards get a 404, so a certificate
// exists only while its award does; the verify link on it points back here.

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const download = new URL(request.url).searchParams.get("download") === "1";
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

  // The jurors who scored the site sign it; First 100 is honorary (no jury).
  const reviews = award.tier === "F100" ? [] : await getJuryReviews(award.listing.slug);
  const ordered = [...reviews].sort((a, b) => a.createdAt - b.createdAt);
  const mean = (key: "design" | "usability" | "creativity" | "content") =>
    ordered.reduce((sum, r) => sum + r.scores[key], 0) / ordered.length;

  return certificateImage(
    {
      tier: award.tier,
      slug: award.slug,
      period: award.period,
      date: award.date,
      score: award.score,
      title: award.listing.title,
      creditName: award.listing.creditName,
      jurors: ordered.map((r) => ({ name: r.juror.name, panel: panelName(r.juror.category) })),
      pillars: ordered.length
        ? { design: mean("design"), usability: mean("usability"), creativity: mean("creativity"), content: mean("content") }
        : null,
    },
    { download },
  );
}
