import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { getAwardRules } from "@/lib/listings";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import {
  hmRule,
  juryOnlyLine,
  pct,
  score,
  scoreRange,
  sotdRule,
  sotmRule,
  sotyRule,
  weightedPillarList,
} from "@/lib/scoringCopy";
import type { AwardRules } from "@/lib/taxonomy";

const title = "How We Score Websites: Jury Scores and Awards";
const describe = (rules: AwardRules) =>
  `Every website is scored by the jury from ${scoreRange(rules)} on ${weightedPillarList(rules)}. One Site of the Day a day, then Site of the Month and Site of the Year.`;

export async function generateMetadata(): Promise<Metadata> {
  const description = describe(await getAwardRules());
  return {
    title,
    description,
    alternates: { canonical: "/how-we-score" },
    openGraph: infoOpenGraph("/how-we-score", title, description),
  };
}

// Static, refreshed in the background so the numbers follow the award settings.
export const dynamic = "force-static";
export const revalidate = 300;

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

const awardList = (rules: AwardRules) => [
  {
    name: "Honorable Mention",
    crow: "Silver crow",
    rule: hmRule(rules),
    href: "/collections/hm",
  },
  {
    name: "Site of the Day",
    crow: "Black crow",
    rule: sotdRule(rules),
    href: "/site-of-the-day",
  },
  {
    name: "Site of the Month",
    crow: "Red crow",
    rule: sotmRule(rules),
    href: "/collections/sotm",
  },
  {
    name: "Site of the Year",
    crow: "Gold crow",
    rule: sotyRule(rules),
    href: "/collections/soty",
  },
];

/** The worked example, computed from the live weights. */
function example(rules: AwardRules) {
  const sample = [9, 8, 7, 6];
  const parts = rules.pillars.map((p, i) => ({ p, s: sample[i] ?? 5 }));
  const one = parts.reduce((sum, x) => sum + x.s * x.p.weight, 0);
  const others = [7.5, 8.4];
  const final = Math.round(((one + others[0] + others[1]) / 3) * 100) / 100;
  const f = (n: number) => n.toFixed(rules.decimals);
  return `Example: a juror scores ${parts.map((x) => `${x.p.name} ${x.s}`).join(", ")}, which weights to ${parts
    .map((x) => `${x.s} × ${x.p.weight}`)
    .join(" + ")} = ${f(one)}. Three jurors at ${f(one)}, ${f(others[0])} and ${f(others[1])} give a final score of ${f(final)}.`;
}

const sectionsFor = (rules: AwardRules): InfoSection[] => [
  {
    id: "pillars",
    heading: "Four pillars, weighted",
    body: (
      <>
        <p>
          Each juror scores a site from {scoreRange(rules)} on four pillars. Their score for the site weights the pillars like
          this:
        </p>
        <dl className="grid gap-4">
          {rules.pillars.map((p) => (
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
          The final score is every juror&apos;s weighted score, averaged and rounded to {rules.decimals} decimals. Only
          the jury decides awards. A site needs at least <strong>{rules.minVotes} jury votes</strong> to be eligible
          for any award; the number rises as the jury grows.
        </p>
        <p>
          {example(rules)}
        </p>
        <p>
          Creators with a Shemoqmedi badge can also vote. Their average is shown on each site as the community score.{" "}
          {juryOnlyLine()}
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
        <p>Four tiers, from the lowest; Site of the Year is the highest. Each badge shows the award and its date.</p>
        <dl className="grid gap-4">
          {awardList(rules).map((a) => (
            <div key={a.name}>
              <dt className="font-semibold text-black">
                <Link href={a.href}>{a.name}</Link> · {a.crow}
              </dt>
              <dd className="mt-1">{a.rule}</dd>
            </div>
          ))}
        </dl>
        <p>
          Solo makers with {score(rules, rules.bscMin)} or more also receive <Link href="/collections/bsc">Best Solo Creation</Link>, an award
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
        redesign can be submitted {rules.resubmitMonths} months after its last award at the earliest.
      </p>
    ),
  },
];

export default async function HowWeScorePage() {
  const rules = await getAwardRules();
  const description = describe(rules);
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
        sections={sectionsFor(rules)}
      />
    </>
  );
}
