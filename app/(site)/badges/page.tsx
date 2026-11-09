import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { BADGE_H, BADGE_W, badgeSvg } from "@/lib/badgeSvg";
import { SITE_NAME } from "@/lib/site";
import { AWARDS, type AwardSlug } from "@/lib/taxonomy";

const title = "Website Award Badges";
const description =
  "Shemoqmedi award badges: Honorable Mention, Site of the Day, Site of the Month and Site of the Year, each with its date. Only the owner of a winning site can get one.";

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

// Static content only; the samples are drawn at build time.
export const dynamic = "force-static";

const SAMPLES: { tier: AwardSlug; period: string; date: string; crow: string; text: string }[] = [
  { tier: "HM", period: "2026-11-02", date: "2026-11-16", crow: "Silver crow", text: "Scored 6.50 or more by the jury in its weekly batch." },
  { tier: "SOTD", period: "2026-11-12", date: "2026-11-12", crow: "Black crow", text: "One site a day, from the jury's best. Never the same site twice." },
  { tier: "SOTM", period: "2026-11", date: "2026-12-06", crow: "Red crow", text: "The month's best Site of the Day, scored again by the jury." },
  { tier: "SOTY", period: "2026", date: "2027-01-20", crow: "Gold crow", text: "The year's best, chosen from the twelve Sites of the Month." },
];

const dataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const name = (tier: AwardSlug) => AWARDS.find((a) => a.slug === tier)!.name;

export default function BadgesPage() {
  return (
    <>
      <PageHero
        prelude="earned, not given"
        title="Badges"
        lede="A badge shows an award a site really won, with its date, and links to that award's page on Shemoqmedi. Only the verified owner of a winning site can get it."
        action={<PillLink href="/account/badges">Get your badges</PillLink>}
      />
      <section aria-label="The badges" className="container-site pb-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {SAMPLES.map((s) => (
            <li key={s.tier} className="grid gap-5 rounded-3xl border border-black/10 p-6 md:p-8">
              <div>
                <p className="text-xl font-semibold tracking-[-0.03em]">{name(s.tier)}</p>
                <p className="mt-1 text-sm text-black/60">
                  {s.crow}. {s.text}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {(["light", "dark"] as const).map((theme) => (
                  <div key={theme} className={theme === "dark" ? "rounded-2xl bg-black p-4" : "rounded-2xl bg-black/[0.03] p-4"}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG sample */}
                    <img
                      src={dataUri(badgeSvg({ tier: s.tier, period: s.period, date: s.date, theme }))}
                      alt={`${name(s.tier)} badge, ${theme} (sample)`}
                      width={BADGE_W}
                      height={BADGE_H}
                    />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="how-title" className="container-site border-t border-black/10 py-16 md:py-24">
        <h2 id="how-title" className="eyebrow">
          How to get yours
        </h2>
        <div className="mt-6 grid max-w-2xl gap-5 text-[15px] leading-relaxed text-black/70">
          <p>
            When your site wins, we email its owner the badge and the code to embed it. You can copy it again any time
            from <Link href="/account/badges" className="text-black underline underline-offset-4">your badges</Link>,
            in light or dark.
          </p>
          <p>
            Your site isn&apos;t yours on Shemoqmedi yet? Open its page and claim it first. Badges are drawn for each
            award, so a badge can&apos;t be made for an award a site didn&apos;t win. See{" "}
            <Link href="/how-we-score" className="text-black underline underline-offset-4">how we score</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
