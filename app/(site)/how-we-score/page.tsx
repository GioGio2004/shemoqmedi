import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { VOTING_DAYS } from "@/lib/taxonomy";

// Mirrors shemoqmedi-admin/convex/lib/scoring.ts. Change both together.
const JURY_SHARE = 60;
const COMMUNITY_SHARE = 40;
const SOTD = "8.50";
const BSC = "8.20";
const HM = "7.50";

const title = "How We Score Websites: Jury, Community and Awards";
const description = `Every website is scored from 1 to 10 on design, usability, creativity and code. The jury's score counts ${JURY_SHARE}%, the community's ${COMMUNITY_SHARE}%. Site of the Day takes ${SOTD} or more.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/how-we-score" },
  openGraph: infoOpenGraph("/how-we-score", title, description),
};

export const dynamic = "force-static";

const PILLARS = [
  {
    name: "Design",
    text: "Visual quality: layout, typography, colour, imagery and art direction. Does the site look considered at every screen size, and does its look fit what it is for?",
  },
  {
    name: "Usability",
    text: "How easy the site is to use: clear navigation, readable text, fast loading, working forms, and access for keyboard and screen reader users. Effects that get in the way lose points here.",
  },
  {
    name: "Creativity",
    text: "Originality of the idea and how it is carried out. Would you remember this site tomorrow, and does it do something you have not seen many times before?",
  },
  {
    name: "Code",
    text: "The build quality you can feel in the browser: performance, smooth animation, solid behaviour on phones and older laptops, and markup that search engines and assistive technology can read.",
  },
];

const AWARDS = [
  { name: "Site of the Day", rule: `Final score of ${SOTD} or more.`, href: "/collections/sotd" },
  {
    name: "Best Solo Creation",
    rule: `Final score of ${BSC} or more, for a site made by one person. It can be won together with Site of the Day.`,
    href: "/collections/bsc",
  },
  { name: "Honorable Mention", rule: `Final score of ${HM} or more, below Site of the Day.`, href: "/collections/hm" },
];

const sections: InfoSection[] = [
  {
    id: "pillars",
    heading: "Four pillars",
    body: (
      <>
        <p>Every score is a number from 1 to 10 for each of four pillars. A site&apos;s score is the average of the four.</p>
        <dl className="grid gap-4">
          {PILLARS.map((p) => (
            <div key={p.name}>
              <dt className="font-semibold text-black">{p.name}</dt>
              <dd className="mt-1">{p.text}</dd>
            </div>
          ))}
        </dl>
      </>
    ),
  },
  {
    id: "voting",
    heading: `${VOTING_DAYS} days of voting`,
    body: (
      <>
        <p>
          A site&apos;s voting window opens when the jury approves it and lasts {VOTING_DAYS} days. During that time
          the <Link href="/jury">jury</Link> gives its score, and anyone with an account can score the site once on the
          four pillars. Owners cannot vote on their own site.
        </p>
        <p>
          Sites currently in their window are listed under <Link href="/collections/nominees">Nominees</Link>.
        </p>
      </>
    ),
  },
  {
    id: "final-score",
    heading: "The final score",
    body: (
      <>
        <p>
          The final score combines both sides: <strong>{JURY_SHARE}% jury</strong> and{" "}
          <strong>{COMMUNITY_SHARE}% community</strong>. The community part is the average of every vote. If nobody
          has voted yet, the final score is the jury&apos;s score. If the jury has not scored a site, it is the
          community&apos;s.
        </p>
        <p>
          Example: a jury score of 8.75 and a community average of 8.00 give a final score of 8.75 × 0.6 + 8.00 × 0.4
          = 8.45, just under Site of the Day.
        </p>
      </>
    ),
  },
  {
    id: "awards",
    heading: "Awards",
    body: (
      <>
        <p>Awards are decided from the final score when the voting window closes.</p>
        <dl className="grid gap-4">
          {AWARDS.map((a) => (
            <div key={a.name}>
              <dt className="font-semibold text-black">
                <Link href={a.href}>{a.name}</Link>
              </dt>
              <dd className="mt-1">{a.rule}</dd>
            </div>
          ))}
        </dl>
        <p>
          Winners and nominees can put a <Link href="/badges">badge</Link> on their site that links to their scores.
        </p>
      </>
    ),
  },
];

export default function HowWeScorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/how-we-score"),
    url: absoluteUrl("/how-we-score"),
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
        current="/how-we-score"
        prelude="how we"
        title="Score"
        lede={`Four pillars, scored 1 to 10 by the jury and the community over ${VOTING_DAYS} days. The jury counts ${JURY_SHARE}%, the community ${COMMUNITY_SHARE}%.`}
        sections={sections}
      />
    </>
  );
}
