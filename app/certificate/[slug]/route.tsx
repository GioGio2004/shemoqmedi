import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { certificateImage, panelName } from "@/lib/certificate";
import { certificateCode, verifyUrl } from "@/lib/certificateCode";
import { getJuryReviews } from "@/lib/listings";

// /certificate/<award slug> — the award's certificate as a PNG (A4 portrait,
// 2262 x 3200). ?download=1 saves it as a file instead of showing it.
//
// Private: only the signed-in owner of the winning site (it is on their
// Achievements page, /account/badges) and admins can open it; everyone else
// gets the same 404 as an unknown award. The award page, its badge and the
// certificate's number on /verify stay public. Unknown or revoked awards get
// a 404 too, so a certificate exists only while its award does.

const notFound = () =>
  new Response("No such certificate", {
    status: 404,
    headers: { "Content-Type": "text/plain", "Cache-Control": "private, no-store" },
  });

/** Whether the signed-in visitor owns this award's site, or is an admin. */
async function mayOpen(slug: string) {
  const { userId, getToken } = await auth();
  if (!userId) return false;
  const token = await getToken({ template: "convex" });
  if (!token) return false;
  const [me, mine] = await Promise.all([
    fetchQuery(api.users.getCurrentUser, {}, { token }),
    fetchQuery(api.awards.mine, {}, { token }),
  ]);
  return me?.role === "admin" || me?.role === "super_admin" || mine.some((a) => a.slug === slug);
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const download = new URL(request.url).searchParams.get("download") === "1";
  try {
    if (!(await mayOpen(slug))) return notFound();
  } catch (error) {
    console.error("certificate access check failed:", error);
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  let award = null;
  try {
    award = await fetchQuery(api.awards.getBySlug, { slug });
  } catch (error) {
    console.error("awards.getBySlug failed:", error);
    return new Response("Unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!award) return notFound();

  // The jurors who scored the site sign it; First 100 is honorary (no jury).
  const reviews = award.tier === "F100" ? [] : await getJuryReviews(award.listing.slug);
  const ordered = [...reviews].sort((a, b) => a.createdAt - b.createdAt);
  const mean = (key: "design" | "usability" | "creativity" | "content") =>
    ordered.reduce((sum, r) => sum + r.scores[key], 0) / ordered.length;
  const code = certificateCode(award);

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
      // Month and Year winners are scored again in their own rounds, so the
      // listing's weekly pillar scores would not add up to their score.
      pillars:
        ordered.length && award.tier !== "SOTM" && award.tier !== "SOTY"
          ? { design: mean("design"), usability: mean("usability"), creativity: mean("creativity"), content: mean("content") }
          : null,
      verify: code ? { code, url: verifyUrl(code, award.slug) } : null,
    },
    { download },
  );
}
