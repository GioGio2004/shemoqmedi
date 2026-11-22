import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { JuryDirectory } from "@/components/jury/JuryDirectory";
import { linkedinUrl, safeUrl } from "@/components/jury/jurorInfo";
import { getAwardRules, getJurors } from "@/lib/listings";
import { pillarList, scoreRange } from "@/lib/scoringCopy";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import type { AwardRules } from "@/lib/taxonomy";

const title = "The Jury: Who Reviews and Scores Websites";
const describe = (rules: AwardRules) =>
  `Meet the Shemoqmedi jury: designers and developers who score every website from ${scoreRange(rules)} on ${pillarList(rules)}. Only the jury decides awards.`;

export async function generateMetadata(): Promise<Metadata> {
  const description = describe(await getAwardRules());
  return {
    title,
    description,
    alternates: { canonical: "/jury" },
    openGraph: infoOpenGraph("/jury", title, description),
  };
}

// Members come from Convex (jury.listPublic); refreshed in the background.
export const dynamic = "force-static";
export const revalidate = 60;

const processFor = (rules: AwardRules): InfoSection[] => [
  {
    id: "review",
    heading: "How the jury works",
    body: (
      <>
        <p>
          Every submitted site is checked by hand before it is listed. Sites approved in one week form a batch, and
          the jury evaluates the batch during the following week: each juror gives a score from {scoreRange(rules)} on{" "}
          {pillarList(rules)}, and writes a short comment that is shown on the site&apos;s page with their name.
        </p>
        <p>
          The final score is the average of the jurors&apos; weighted scores, and it alone decides awards; a site
          needs at least {rules.minVotes} jury votes to be eligible. Community votes are shown for interest and never
          count. The full method is on{" "}
          <Link href="/how-we-score">How we score</Link>.
        </p>
      </>
    ),
  },
  {
    id: "membership",
    heading: "Joining the jury",
    body: (
      <p>
        Jury membership is by invitation. We invite designers, developers and studio leads whose own work and
        judgement we trust. Jurors never evaluate their own sites.
      </p>
    ),
  },
];

export default async function JuryPage() {
  const [jurors, rules] = await Promise.all([getJurors(), getAwardRules()]);
  const sections = processFor(rules);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/jury"),
    url: absoluteUrl("/jury"),
    name: title,
    description: describe(rules),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
    ...(jurors.length > 0
      ? {
          // Same @id as the Person on each member's /jury/<slug> page.
          mentions: jurors.map((j) => {
            const sameAs = [safeUrl(j.website), linkedinUrl(j.linkedinUrl)].filter((l): l is string => l !== null);
            return {
              "@type": "Person",
              "@id": `${absoluteUrl(`/jury/${j.slug}`)}#person`,
              name: j.name,
              jobTitle: j.title,
              url: absoluteUrl(`/jury/${j.slug}`),
              image: j.imageUrl ?? undefined,
              sameAs: sameAs.length > 0 ? sameAs : undefined,
            };
          }),
        }
      : {}),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <InfoPage
        current="/jury"
        prelude="the"
        title="Jury"
        lede="Designers and developers who score every site in its voting window and say what they think of it."
        sections={sections}
        lead={jurors.length > 0 ? <JuryDirectory jurors={jurors} /> : undefined}
      />
    </>
  );
}
