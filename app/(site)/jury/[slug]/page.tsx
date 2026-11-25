import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JurorProfileView } from "@/components/jury/JurorProfileView";
import { currentRoles } from "@/components/jury/experience";
import { jurorTitle, linkedinUrl, panelName, safeUrl } from "@/components/jury/jurorInfo";
import { getAwardRules, getJurorPage, getJurorSlugs } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { pillarList } from "@/lib/scoringCopy";
import type { AwardRules } from "@/lib/taxonomy";

// A juror's public page: a professional profile (portrait, role, experience,
// work, reviews) on the site's 12-column grid. Pre-rendered at build for every
// public juror, then refreshed in the background; a newly claimed juror
// renders on first visit. Convex reads are POST requests, which Next treats as
// uncacheable; force-static keeps the page static (ISR).
export const dynamic = "force-static";
export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getJurorSlugs()).map(({ slug }) => ({ slug }));
}

function describe(rules: AwardRules, name: string, title: string, panel: string, reviews: number) {
  const scored = reviews > 0 ? ` ${reviews} ${reviews === 1 ? "website" : "websites"} scored so far.` : "";
  return `${name}, ${title}, on the ${SITE_NAME} jury (${panel}): scores websites on ${pillarList(rules)}.${scored}`;
}

/** A long bio cut to a ~160-character meta description, at a word boundary. */
function snippet(bio: string, max = 160) {
  const flat = bio.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, flat.lastIndexOf(" ", max - 1)).replace(/[,;:.\s]+$/, "")}…`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getJurorPage(slug);
  if (!data) return { title: "Juror not found", robots: { index: false } };
  const { juror, reviews } = data;
  const title = jurorTitle(juror.name, juror.title);
  const description = juror.bio ? snippet(juror.bio) : describe(await getAwardRules(), juror.name, juror.title, panelName(juror.category), reviews.length);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/jury/${juror.slug}` },
    // Replaces the root openGraph, so the shared fields are repeated here. The
    // image is this route's opengraph-image.tsx (portrait × crow share card).
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      locale: "en_US",
      url: `/jury/${juror.slug}`,
      title,
      description,
    },
  };
}

export default async function JurorPage({ params }: Params) {
  const { slug } = await params;
  const data = await getJurorPage(slug);
  if (!data) notFound();
  const { juror, reviews } = data;
  const rules = await getAwardRules();
  const panel = panelName(juror.category);
  const website = safeUrl(juror.website);
  const linkedin = linkedinUrl(juror.linkedinUrl);
  const sameAs = [website, linkedin].filter((l): l is string => l !== null);
  // Current positions and schools, as on LinkedIn: Person.worksFor and alumniOf.
  const worksFor = currentRoles(juror.experience ?? []).map((r) => {
    const orgUrl = safeUrl(r.organizationUrl);
    return { "@type": "Organization", name: r.organization, ...(orgUrl ? { url: orgUrl } : {}) };
  });
  // One entry per school, even with two degrees from it.
  const alumniOf = [...new Set((juror.education ?? []).map((e) => e.school))].map((name) => ({
    "@type": "EducationalOrganization",
    name,
  }));

  // The Person's @id is the one /jury uses for this member.
  const url = absoluteUrl(`/jury/${juror.slug}`);
  const personId = `${url}#person`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        name: jurorTitle(juror.name, juror.title),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en",
        mainEntity: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: juror.name,
        jobTitle: juror.title,
        url,
        description: juror.bio ?? undefined,
        image: juror.imageUrl ?? undefined,
        sameAs: sameAs.length > 0 ? sameAs : undefined,
        // The seat on the jury: a role in the site's Organization (home page schema).
        memberOf: {
          "@type": "OrganizationRole",
          roleName: juror.isFounding ? "Founding jury member" : "Jury member",
          startDate: new Date(juror.joinedAt).toISOString().slice(0, 10),
          memberOf: { "@id": `${SITE_URL}/#organization` },
        },
        knowsAbout: panel,
        ...(worksFor.length > 0 ? { worksFor } : {}),
        ...(alumniOf.length > 0 ? { alumniOf } : {}),
        ...(juror.location ? { homeLocation: { "@type": "Place", name: juror.location } } : {}),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <JurorProfileView
        juror={juror}
        reviews={reviews}
        about={juror.bio ?? describe(rules, juror.name, juror.title, panel, reviews.length)}
        onTheJury={`Every juror scores websites on ${pillarList(rules)}, each site in its own judging week, and signs a short review. The final score is the jury's average alone; community votes never count.`}
      />
    </>
  );
}
