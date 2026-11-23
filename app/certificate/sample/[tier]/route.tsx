import { AWARDS, type AwardSlug } from "@/lib/taxonomy";
import { certificateImage, type CertificateData } from "@/lib/certificate";

// /certificate/sample/<tier> — what a certificate looks like for each award,
// filled with made-up sample data and marked "Sample" on its face, so the
// design can be checked before anyone wins. Not indexed. ?download=1 saves it.

const SAMPLES: Record<AwardSlug, Pick<CertificateData, "period" | "date">> = {
  F100: { period: "042", date: "2026-12-01" },
  HM: { period: "2026-11-30", date: "2026-12-07" },
  SOTD: { period: "2026-12-01", date: "2026-12-01" },
  SOTM: { period: "2026-12", date: "2026-12-31" },
  SOTY: { period: "2026", date: "2026-12-31" },
  BSC: { period: "2026-11-30", date: "2026-12-07" },
};

export async function GET(request: Request, { params }: { params: Promise<{ tier: string }> }) {
  const { tier: raw } = await params;
  const tier = AWARDS.find((a) => a.slug.toLowerCase() === raw.toLowerCase())?.slug;
  if (!tier) return new Response("No such award", { status: 404, headers: { "Content-Type": "text/plain" } });
  const download = new URL(request.url).searchParams.get("download") === "1";
  return certificateImage(
    {
      tier,
      slug: `sample-${tier.toLowerCase()}`,
      ...SAMPLES[tier],
      score: tier === "F100" ? null : 8.76, // the weighted pillars below: 40/30/20/10
      title: "Sample Site",
      creditName: tier === "BSC" ? "Sample Creator" : "Sample Studio",
      jurors:
        tier === "F100"
          ? []
          : [
              { name: "Juror One", panel: "Design & UI" },
              { name: "Juror Two", panel: "Engineering & Performance" },
              { name: "Juror Three", panel: "Venture & Startups" },
            ],
      pillars: tier === "F100" ? null : { design: 9.1, usability: 8.4, creativity: 8.9, content: 8.2 },
      sample: true,
    },
    { download },
  );
}
