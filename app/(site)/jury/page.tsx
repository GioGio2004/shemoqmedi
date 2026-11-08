import type { Metadata } from "next";
import Link from "next/link";
import type { JurorPublic } from "@/convex-helpers-api";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { JuryCard } from "@/components/jury/JuryCard";
import { safeUrl } from "@/components/jury/jurorInfo";
import { getJurors } from "@/lib/listings";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { JURY_CATEGORIES } from "@/lib/taxonomy";

const title = "The Jury: Who Reviews and Scores Websites";
const description =
  "Meet the Shemoqmedi jury: designers and developers who score every website in its voting window on design, usability, creativity and code. Their score counts for 60%.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/jury" },
  openGraph: infoOpenGraph("/jury", title, description),
};

// Members come from Convex (jury.listPublic); refreshed in the background.
export const dynamic = "force-static";
export const revalidate = 60;

type Member = JurorPublic & { evaluations: number };

/** Members by panel, in JURY_CATEGORIES order; jurors without a panel last, under "Jury". */
function byPanel(jurors: Member[]) {
  const panels: { key: string; name: string; members: Member[] }[] = JURY_CATEGORIES.map((c) => ({
    key: c.slug,
    name: c.name,
    members: jurors.filter((j) => j.category === c.slug),
  }));
  panels.push({ key: "jury", name: "Jury", members: jurors.filter((j) => j.category === null) });
  return panels.filter((p) => p.members.length > 0);
}

function Members({ jurors }: { jurors: Member[] }) {
  return (
    <div className="grid gap-10">
      {byPanel(jurors).map((panel) => (
        <div key={panel.key} className="grid gap-4">
          <h3 className="eyebrow">{panel.name}</h3>
          <ul className="grid gap-4 sm:grid-cols-2">
            {panel.members.map((j) => (
              // id: older links point at /jury#<slug>.
              <li key={j.slug} id={j.slug} className="grid scroll-mt-32">
                <JuryCard
                  juror={j}
                  href={`/jury/${j.slug}`}
                  meta={
                    <p className="text-xs text-black/55">
                      {j.evaluations} {j.evaluations === 1 ? "evaluation" : "evaluations"}
                    </p>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const process: InfoSection[] = [
  {
    id: "review",
    heading: "How the jury works",
    body: (
      <>
        <p>
          Every submitted site is checked by hand before it is listed. Once it goes live, the jury has its
          voting window to evaluate it: each juror gives a score from 1 to 10 on design, usability, creativity
          and code, and writes a short comment that is shown on the site&apos;s page with their name.
        </p>
        <p>
          The site&apos;s jury score is the average of its jurors&apos; evaluations and counts for 60% of the final
          result; the community&apos;s votes count for the other 40%. The full method is on{" "}
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
  const jurors = await getJurors();
  const sections: InfoSection[] = [
    ...(jurors.length > 0
      ? [{ id: "members", heading: "Members", body: <Members jurors={jurors} /> }]
      : []),
    ...process,
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/jury"),
    url: absoluteUrl("/jury"),
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
    ...(jurors.length > 0
      ? {
          // Same @id as the Person on each member's /jury/<slug> page.
          mentions: jurors.map((j) => {
            const sameAs = [safeUrl(j.website), safeUrl(j.linkedinUrl)].filter((l): l is string => l !== null);
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
      />
    </>
  );
}
