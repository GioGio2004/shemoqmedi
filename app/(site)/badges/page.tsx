import type { Metadata } from "next";
import Link from "next/link";
import { BadgeArt, BadgeDefs } from "@/components/badges/BadgeArt";
import { BadgeReveal } from "@/components/badges/BadgeReveal";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { awardName } from "@/lib/badgeInfo";
import { collectionHref } from "@/lib/collections";
import { getFirst100Count } from "@/lib/listings";
import { SITE_NAME } from "@/lib/site";
import { AWARD_RULES, type AwardSlug } from "@/lib/taxonomy";

const title = "Website Award Badges";
const description =
  "Shemoqmedi award badges: Honorable Mention, Site of the Day, Site of the Month and Site of the Year, each with its date, and the honorary First 100. Only the owner of a winning site can get one.";

// openGraph replaces the root one, so it repeats the shared fields and image.
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/badges" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/badges",
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  },
};

// Static, refreshed in the background so the First 100 count stays current.
export const dynamic = "force-static";
export const revalidate = 300;

type Sample = { tier: AwardSlug; period: string; date: string; crow: string; text: string };

// The four tiers, highest first, then the two outside the ladder. Sample dates.
const TIERS: Sample[] = [
  { tier: "SOTY", period: "2026", date: "2027-01-20", crow: "Gold crow", text: "The year's best, chosen by the jury from the twelve Sites of the Month." },
  { tier: "SOTM", period: "2026-11", date: "2026-12-06", crow: "Red crow", text: "The month's best Site of the Day, scored again by the jury." },
  { tier: "SOTD", period: "2026-11-12", date: "2026-11-12", crow: "Black crow", text: "One site a day, from the jury's best. Never the same site twice." },
  {
    tier: "HM",
    period: "2026-11-02",
    date: "2026-11-16",
    crow: "Silver crow",
    text: `Scored ${AWARD_RULES.honorableMentionMin.toFixed(2)} or more by the jury in its weekly batch.`,
  },
];
const SIDE: Sample[] = [
  {
    tier: "BSC",
    period: "2026-11-02",
    date: "2026-11-16",
    crow: "For solo makers",
    text: `A site built by one person that scores ${AWARD_RULES.bscMin.toFixed(2)} or more.`,
  },
  { tier: "F100", period: "001", date: "2026-11-10", crow: "Honorary", text: "For the first hundred sites on Shemoqmedi. Each badge is numbered." },
];

const STEPS = [
  { n: "01", title: "Win it", text: "Badges aren't handed out. Each one is drawn for an award a site really won, with its date." },
  { n: "02", title: "Claim your site", text: "Only the verified owner gets the badge. Open your site's page and claim it if you haven't." },
  { n: "03", title: "Copy one line", text: "Pick the seal or the tag, light or dark, and paste the code in your footer. It links to your award page." },
];

function SealCard({ sample, index, note }: { sample: Sample; index: number; note?: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-6 rounded-3xl border border-black/10 p-6 md:p-8">
      <BadgeReveal delay={index * 110} className="mx-auto w-full max-w-[240px]">
        <BadgeArt shape="seal" tier={sample.tier} period={sample.period} date={sample.date} />
      </BadgeReveal>
      <div className="mt-auto">
        <p className="eyebrow">{sample.crow}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
          <Link href={collectionHref(sample.tier.toLowerCase())} className="hover:underline hover:underline-offset-4">
            {awardName(sample.tier)}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-black/60">{sample.text}</p>
        {note}
      </div>
    </li>
  );
}

export default async function BadgesPage() {
  const first100 = await getFirst100Count();

  return (
    <>
      {/* Without JavaScript nothing triggers the entrance: show the badges as they are. */}
      <noscript>
        <style>{`.badge-reveal .badge-art [data-part]{opacity:1!important;animation:none!important}`}</style>
      </noscript>
      <BadgeDefs />
      <PageHero
        prelude="earned, not given"
        title="Badges"
        lede="A badge shows an award a site really won, with its date, and links to that award's page. Only the verified owner of a winning site can get it."
        action={<PillLink href="/account/badges">Get your badges</PillLink>}
      />

      <section aria-labelledby="tiers-title" className="container-site pb-16 md:pb-24">
        <h2 id="tiers-title" className="eyebrow mb-6">
          The four awards
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {TIERS.map((s, i) => (
            <SealCard key={s.tier} sample={s} index={i} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="side-title" className="container-site pb-16 md:pb-24">
        <h2 id="side-title" className="eyebrow mb-6">
          Outside the ladder
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {SIDE.map((s, i) => (
            <SealCard
              key={s.tier}
              sample={s}
              index={i}
              note={
                s.tier === "F100" && first100 ? (
                  <div className="mt-5 grid gap-2">
                    <p className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.06em] uppercase">
                      <span>
                        {first100.given} of {first100.limit} given
                      </span>
                      <span className="text-black/55">{first100.limit - first100.given} left</span>
                    </p>
                    <div
                      role="progressbar"
                      aria-label="First 100 badges given"
                      aria-valuemin={0}
                      aria-valuemax={first100.limit}
                      aria-valuenow={first100.given}
                      className="h-1 overflow-hidden rounded-full bg-black/10"
                    >
                      <div
                        className="h-full rounded-full bg-black"
                        style={{ width: `${Math.min(100, (first100.given / first100.limit) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : undefined
              }
            />
          ))}
        </ul>
      </section>

      <section aria-labelledby="shapes-title" className="container-site border-t border-black/10 py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="shapes-title" className="text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
              A seal or a tag, light or dark
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-black/60">
              The round seal suits a corner of the page; the tag sits in a footer. Every badge comes in its own colours
              and in the opposite theme, so it reads on any background.
            </p>
          </div>
          <div className="grid content-start gap-8 lg:col-span-8">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[...TIERS, ...SIDE].map((s, i) => (
                <li key={s.tier} className="grid place-items-center rounded-2xl border border-black/10 p-5">
                  <BadgeReveal delay={i * 70} className="w-full max-w-[300px]">
                    <BadgeArt shape="tag" tier={s.tier} period={s.period} date={s.date} />
                  </BadgeReveal>
                </li>
              ))}
            </ul>
            <div>
              <p className="eyebrow mb-4">The same badge, both themes</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {(["light", "dark"] as const).map((theme, i) => (
                  <li
                    key={theme}
                    className={
                      theme === "light"
                        ? "grid place-items-center rounded-2xl bg-black p-5"
                        : "grid place-items-center rounded-2xl bg-black/[0.04] p-5"
                    }
                  >
                    <BadgeReveal delay={i * 90} className="w-full max-w-[300px]">
                      <BadgeArt shape="tag" tier="SOTM" period="2026-11" date="2026-12-06" theme={theme} />
                    </BadgeReveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-title" className="container-site border-t border-black/10 py-16 md:py-24">
        <h2 id="how-title" className="eyebrow">
          How to get yours
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="grid content-start gap-3 border-t border-black pt-5">
              <p className="font-mono text-[11px] tracking-[0.08em] text-black/55">{step.n}</p>
              <h3 className="text-xl font-semibold tracking-[-0.03em]">{step.title}</h3>
              <p className="text-sm leading-relaxed text-black/60">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <PillLink href="/account/badges">Get your badges</PillLink>
          <Link href="/how-we-score" className="text-sm underline underline-offset-4">
            How awards are decided
          </Link>
        </div>
      </section>
    </>
  );
}
