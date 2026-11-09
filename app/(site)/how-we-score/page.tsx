import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { AWARD_RULES, PILLARS as WEIGHTS } from "@/lib/taxonomy";

// Mirrors shemoqmedi-admin/convex/lib/scoring.ts and lib/config.ts (defaults).
const pct = (w: number) => `${Math.round(w * 100)}%`;
const HM = AWARD_RULES.honorableMentionMin.toFixed(2);
const SOTD = AWARD_RULES.sotdMin.toFixed(2);
const BSC = AWARD_RULES.bscMin.toFixed(2);

const title = "How We Score Websites: Jury Scores and Awards";
const description = `Every website is scored by the jury from 1 to 10 on design (${pct(0.4)}), usability (${pct(0.3)}), creativity (${pct(0.2)}) and content (${pct(0.1)}). One Site of the Day a day, then Site of the Month and Site of the Year.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/how-we-score" },
  openGraph: infoOpenGraph("/how-we-score", title, description),
};

export const dynamic = "force-static";

const PILLAR_TEXT: Record<string, string> = {
  design:
    "Visual quality: layout, typography, colour, imagery and art direction. Does the site look considered at every screen size, and does its look fit what it is for?",
  usability:
    "How easy the site is to use: clear navigation, readable text, fast loading, working forms, and access for keyboard and screen reader users. Effects that get in the way lose points here.",
  creativity:
    "Originality of the idea and how it is carried out. Would you remember this site tomorrow, and does it do something you have not seen many times before?",
  content:
    "What the site says and shows: clear, honest writing, real product imagery, and information that answers what a visitor came for.",
};

const AWARDS = [
  {
    name: "Honorable Mention",
    crow: "Silver crow",
    rule: `Every eligible site with a final score of ${HM} or more when its voting closes.`,
    href: "/collections/hm",
  },
  {
    name: "Site of the Day",
    crow: "Black crow",
    rule: `Eligible sites with ${SOTD} or more join the Site of the Day queue, best score first. Each day one site from the queue is announced: one winner a day, and a site can win only once. Sites left in the queue carry over to the following days. If the queue is empty, the day has no winner; a past winner is never repeated.`,
    href: "/site-of-the-day",
  },
  {
    name: "Site of the Month",
    crow: "Red crow",
    rule: `On the 1st of each month the jury scores the month's Site of the Day winners again, over ${AWARD_RULES.monthlyRoundDays} days. The highest score wins, announced on the 6th.`,
    href: "/collections/sotm",
  },
  {
    name: "Site of the Year",
    crow: "Gold crow",
    rule: `In January the jury scores the year's twelve Sites of the Month over ${AWARD_RULES.yearlyRoundDays} days. The highest score wins, announced on 20 January.`,
    href: "/collections/soty",
  },
];

const sections: InfoSection[] = [
  {
    id: "pillars",
    heading: "Four pillars, weighted",
    body: (
      <>
        <p>
          Each juror scores a site from 1 to 10 on four pillars. Their score for the site weights the pillars like
          this:
        </p>
        <dl className="grid gap-4">
          {WEIGHTS.map((p) => (
            <div key={p.key}>
              <dt className="font-semibold text-black">
                {p.name} · {pct(p.weight)}
              </dt>
              <dd className="mt-1">{PILLAR_TEXT[p.key]}</dd>
            </div>
          ))}
        </dl>
      </>
    ),
  },
  {
    id: "batches",
    heading: "Weekly batches",
    body: (
      <>
        <p>
          Sites are collected in weekly batches: everything approved from Monday 00:00 to Sunday 23:59 (Tbilisi time)
          forms one batch. The <Link href="/jury">jury</Link> scores the batch during the following week, and its
          voting closes at the end of that Sunday. Sites in voting are listed under{" "}
          <Link href="/collections/nominees">Nominees</Link>.
        </p>
        <p>
          Jurors never score a site they built or one that belongs to their company. Sites built by the Shemoqmedi team
          are shown as such and never win awards.
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
          The final score is every juror&apos;s weighted score, averaged and rounded to two decimals. Only the jury
          decides awards. A site needs at least <strong>{AWARD_RULES.minVotes} jury votes</strong> to be eligible for
          any award; the number rises as the jury grows.
        </p>
        <p>
          Example: a juror scores Design 9, Usability 8, Creativity 7 and Content 6, which weights to 9 × 0.4 + 8 × 0.3
          + 7 × 0.2 + 6 × 0.1 = 8.00. Three jurors at 8.00, 7.50 and 8.40 give a final score of 7.97.
        </p>
        <p>
          Creators with a Shemoqmedi badge can also vote. Their average is shown on each site as the community score,
          for interest; it does not decide awards.
        </p>
        <p>
          Ties are broken by more jury votes, then a higher Design score, then the earlier submission.
        </p>
      </>
    ),
  },
  {
    id: "awards",
    heading: "Awards",
    body: (
      <>
        <p>Four tiers, from the lowest. Each badge shows the award and its date.</p>
        <dl className="grid gap-4">
          {AWARDS.map((a) => (
            <div key={a.name}>
              <dt className="font-semibold text-black">
                <Link href={a.href}>{a.name}</Link> · {a.crow}
              </dt>
              <dd className="mt-1">{a.rule}</dd>
            </div>
          ))}
        </dl>
        <p>
          Solo makers with {BSC} or more also receive <Link href="/collections/bsc">Best Solo Creation</Link>, an award
          outside the tiers.
        </p>
        <p>
          Each award has its own page, and only the verified owner of a winning site can get its{" "}
          <Link href="/badges">badge</Link>.
        </p>
      </>
    ),
  },
  {
    id: "resubmissions",
    heading: "Duplicates and redesigns",
    body: (
      <p>
        A website can be listed once at a time. A site that has already been through the showcase can come back only as
        a significant redesign, as a new entry linked to the old one and approved by the jury. If it won an award, the
        redesign can be submitted {AWARD_RULES.resubmitMonths} months after its last award at the earliest.
      </p>
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
        lede="Four weighted pillars, scored 1 to 10 by the jury in weekly batches. Honorable Mention, then one Site of the Day a day, Site of the Month and Site of the Year."
        sections={sections}
      />
    </>
  );
}
