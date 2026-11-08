import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { JURY } from "@/lib/jury";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const title = "The Jury: Who Reviews and Scores Websites";
const description =
  "The Shemoqmedi jury reviews every submitted website by hand and scores it on design, usability, creativity and code. Its score counts for 60% of the final result.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/jury" },
  openGraph: infoOpenGraph("/jury", title, description),
};

export const dynamic = "force-static";

function safeUrl(raw?: string) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const members: InfoSection[] =
  JURY.length > 0
    ? [
        {
          id: "members",
          heading: "Members",
          body: (
            <ul className="grid gap-5 sm:grid-cols-2">
              {JURY.map((m) => {
                const url = safeUrl(m.url);
                return (
                  <li key={m.name}>
                    <p className="font-semibold text-black">
                      {url ? (
                        <a href={url} target="_blank" rel="noopener">
                          {m.name}
                        </a>
                      ) : (
                        m.name
                      )}
                    </p>
                    <p className="text-sm">
                      {m.role}
                      {m.location ? `, ${m.location}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          ),
        },
      ]
    : [];

const sections: InfoSection[] = [
  ...members,
  {
    id: "review",
    heading: "Every site is reviewed by hand",
    body: (
      <>
        <p>
          Nothing appears on Shemoqmedi automatically. The jury opens every submitted website before it is listed and
          checks that it is live, finished and the submitter&apos;s own work.
        </p>
        <p>
          Sites that do not meet the bar are declined with a short note that explains why, so the creator can improve
          the site and submit it again.
        </p>
      </>
    ),
  },
  {
    id: "scores",
    heading: "What the jury scores",
    body: (
      <p>
        For each approved site the jury gives a score from 1 to 10 on design, usability, creativity and code. That
        score counts for 60% of the final result; the community&apos;s votes count for the other 40%. The full method
        is on <Link href="/how-we-score">How we score</Link>.
      </p>
    ),
  },
  {
    id: "notes",
    heading: "Jury notes",
    body: (
      <p>
        Many listings carry a short jury note on their page: a few sentences on what stands out, from layout and
        typography to motion and engineering. It is written to help other designers and developers learn from the
        work.
      </p>
    ),
  },
];

export default function JuryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/jury"),
    url: absoluteUrl("/jury"),
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
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
        lede="The people who review every submission by hand and score it on four pillars."
        sections={sections}
      />
    </>
  );
}
