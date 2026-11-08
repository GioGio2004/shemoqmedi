import type { Metadata } from "next";
import Link from "next/link";
import type { JurorPublic } from "@/convex-helpers-api";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { JurorAvatar } from "@/components/jury/JurorAvatar";
import { getJurors } from "@/lib/listings";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { hostOf } from "@/lib/format";

const title = "The Jury: Who Reviews and Scores Websites";
const description =
  "Meet the Shemoqmedi jury: designers and developers who score every website in its voting week on design, usability, creativity and code. Their score counts for 60%.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/jury" },
  openGraph: infoOpenGraph("/jury", title, description),
};

// Members come from Convex (jury.listPublic); refreshed in the background.
export const dynamic = "force-static";
export const revalidate = 300;

function safeUrl(raw: string | null) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function Members({ jurors }: { jurors: (JurorPublic & { evaluations: number })[] }) {
  return (
    <ul className="grid gap-8 sm:grid-cols-2">
      {jurors.map((j) => {
        const url = safeUrl(j.website);
        return (
          <li key={j.slug} id={j.slug} className="grid scroll-mt-32 content-start gap-3">
            <JurorAvatar url={j.imageUrl} size={72} />
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-black">{j.name}</p>
              <p className="text-sm">
                {j.title}
                {j.location ? `, ${j.location}` : ""}
              </p>
            </div>
            {j.bio && <p className="text-sm">{j.bio}</p>}
            <p className="text-xs text-black/55">
              {j.evaluations} {j.evaluations === 1 ? "evaluation" : "evaluations"}
              {url && (
                <>
                  {" · "}
                  <a href={url} target="_blank" rel="noopener">
                    {hostOf(url)}
                  </a>
                </>
              )}
            </p>
          </li>
        );
      })}
    </ul>
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
          seven-day voting week to evaluate it: each juror gives a score from 1 to 10 on design, usability, creativity
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
          mentions: jurors.map((j) => ({
            "@type": "Person",
            "@id": `${absoluteUrl("/jury")}#${j.slug}`,
            name: j.name,
            jobTitle: j.title,
            url: safeUrl(j.website) ?? undefined,
            image: j.imageUrl ?? undefined,
          })),
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
        lede="Designers and developers who score every site in its voting week and say what they think of it."
        sections={sections}
      />
    </>
  );
}
