import type { Metadata } from "next";
import Link from "next/link";
import { BadgeArt, BadgeDefs } from "@/components/badges/BadgeArt";
import { BadgeReveal } from "@/components/badges/BadgeReveal";
import { PillLink } from "@/components/site/ui";
import { awardName } from "@/lib/badgeInfo";
import { SITE_NAME } from "@/lib/site";
import type { AwardSlug } from "@/lib/taxonomy";

const title = "The Crow: Why It's Our Mascot";
const description =
  "Crows collect valuable things. Shemoqmedi Space collects valuable webpages. Why a crow is our mascot and brand symbol: what crows know, the stories behind them, and why curation matters now.";

export const metadata: Metadata = {
  title: { absolute: `${title} | ${SITE_NAME}` },
  description,
  alternates: { canonical: "/crow" },
  openGraph: {
    type: "article",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/crow",
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
  },
};

export const dynamic = "force-static";

/**
 * A big title the site's crow (components/site/crow/roam.ts) can stand on:
 * one span per letter. `goto` is the letter it flies to as soon as the page
 * opens; the others are perches it may visit later.
 */
function CrowTitle({ text, goto }: { text: string; goto?: number }) {
  return (
    <span data-crow-wordmark="" className="block">
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden="true" data-crow-letter="" data-crow-goto={i === goto ? "" : undefined}>
          {ch}
        </span>
      ))}
      <span data-crow-baseline="" aria-hidden="true" className="inline-block h-0 w-0" />
    </span>
  );
}

/** A statement whose words light up as it scrolls through (app/globals.css .crow-words). */
function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`crow-words ${className ?? ""}`}>
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </span>
  );
}

const KNOWS = [
  {
    n: "01",
    title: "They make tools",
    text: "New Caledonian crows cut hooks from twigs and leaves, shape them, and keep the ones that work.",
    us: "We look at how a site is made, not only at how it looks.",
  },
  {
    n: "02",
    title: "They remember faces",
    text: "Crows in Seattle that met researchers in a mask scolded that mask for years, and taught crows that had never seen it to do the same.",
    us: "Every site credits the people who made it, by name.",
  },
  {
    n: "03",
    title: "They plan ahead",
    text: "In a 2017 study, ravens picked a tool and saved it for a task they could only do the next day.",
    us: "Awards run on a calendar: the day, the month, the year.",
  },
  {
    n: "04",
    title: "They keep what they find",
    text: "The Clark's nutcracker, of the crow family, hides tens of thousands of seeds each autumn and finds them again months later, under snow.",
    us: "Every award is dated and archived. Nothing kept is lost.",
  },
];

const LORE = [
  {
    where: "Norse",
    title: "Thought and Memory",
    text: "Odin kept two ravens, Huginn and Muninn. Each morning they flew out over the world; each evening they came back and told him what they had seen.",
  },
  {
    where: "Ancient Greece",
    title: "The crow and the pitcher",
    text: "Aesop's thirsty crow drops pebbles into a jug until the water rises to its beak. In 2009, rooks in a Cambridge lab solved the same puzzle the same way.",
  },
  {
    where: "Pacific Northwest",
    title: "The bringer of light",
    text: "In Haida and Tlingit stories, Raven steals the light a chief kept locked in a box and lets it out into the sky, for everyone.",
  },
  {
    where: "Japan",
    title: "The guide",
    text: "Yatagarasu, the three-legged crow, led the first emperor through the mountains. It is on the crest of Japan's national football team today.",
  },
];

const CROWS: { tier: AwardSlug; period: string; date: string; name: string }[] = [
  { tier: "HM", period: "2026-11-02", date: "2026-11-16", name: "Silver" },
  { tier: "SOTD", period: "2026-11-12", date: "2026-11-12", name: "Black" },
  { tier: "SOTM", period: "2026-11", date: "2026-12-06", name: "Red" },
  { tier: "SOTY", period: "2026", date: "2027-01-20", name: "Gold" },
];

export default function CrowPage() {
  return (
    <>
      <noscript>
        <style>{`.badge-reveal .badge-art [data-part]{opacity:1!important;animation:none!important}`}</style>
      </noscript>
      <BadgeDefs />

      {/* Hero. The site's own crow flies straight to the E as the page opens (data-crow-goto). */}
      <header className="container-site pt-32 md:pt-40">
        <p className="block text-[clamp(1.75rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.045em] lowercase">
          our mascot
        </p>
        <h1
          aria-label="The crow"
          // Room above the letters for the crow to stand on them.
          className="mt-[clamp(3.25rem,6vw,5rem)] text-[clamp(3.75rem,13.5vw,13.5rem)] leading-[0.86] font-semibold tracking-[-0.065em] uppercase"
        >
          <CrowTitle text="The crow" goto={2} />
        </h1>
        <div className="mt-10 flex flex-col gap-6 border-t border-black/10 pt-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-black/60">
            Shemoqmedi (შემოქმედი) is Georgian for <em>creator</em>. The crow is how we find them.
          </p>
          <p className="eyebrow">Scroll</p>
        </div>
      </header>

      {/* The metaphor. */}
      <section aria-label="The idea" className="container-site py-28 md:py-44">
        <p className="max-w-[18ch] text-[clamp(2.4rem,7vw,7rem)] leading-[0.95] font-semibold tracking-[-0.06em]">
          <Words text="Crows collect valuable things." />
        </p>
        <p className="mt-6 ml-auto max-w-[18ch] text-right text-[clamp(2.4rem,7vw,7rem)] leading-[0.95] font-semibold tracking-[-0.06em] md:mt-10">
          <Words text="Shemoqmedi Space collects valuable webpages." />
        </p>
      </section>

      {/* The myth, and what is true. */}
      <section aria-labelledby="glitter-title" className="container-site border-t border-black/10 py-24 md:py-36">
        <div className="grid gap-6 md:grid-cols-12 md:gap-10">
          <h2
            id="glitter-title"
            className="text-[clamp(2rem,4.4vw,3.75rem)] leading-[1] font-semibold tracking-[-0.055em] md:col-span-5"
          >
            Not everything that glitters
          </h2>
          <div className="grid max-w-xl gap-4 text-[15px] leading-relaxed text-black/70 md:col-span-7">
            <p>
              The old story says crows and magpies steal anything shiny. It is mostly folklore: in a 2014 study at the
              University of Exeter, magpies were wary of shiny objects, not drawn to them.
            </p>
            <p>
              Crows don&apos;t grab whatever sparkles. They look, they test, they choose. So do we: a site is never
              listed for its effects alone. It is kept for being good.
            </p>
          </div>
        </div>
      </section>

      {/* What a crow knows. */}
      <section aria-labelledby="knows-title" className="container-site border-t border-black/10 py-24 md:py-36">
        <p className="eyebrow">What a crow knows</p>
        <h2
          id="knows-title"
          className="mt-3 max-w-3xl text-[clamp(2rem,5vw,4.25rem)] leading-[0.98] font-semibold tracking-[-0.055em]"
        >
          One of the cleverest animals on earth.
        </h2>
        <ol className="mt-14 grid md:mt-20">
          {KNOWS.map((k) => (
            <li
              key={k.n}
              className="crow-rise grid gap-3 border-t border-black/10 py-8 md:grid-cols-12 md:gap-10 md:py-10"
            >
              <span className="font-mono text-sm text-black/45 tabular-nums md:col-span-1">{k.n}</span>
              <h3 className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.045em] md:col-span-4">
                {k.title}
              </h3>
              <div className="grid gap-3 md:col-span-7">
                <p className="max-w-xl text-[15px] leading-relaxed text-black/70">{k.text}</p>
                <p className="text-sm font-medium">
                  <span className="text-black/45">Here: </span>
                  {k.us}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* The stories. */}
      <section aria-labelledby="lore-title" className="container-site border-t border-black/10 py-24 md:py-36">
        <p className="eyebrow">Older than the web</p>
        <h2
          id="lore-title"
          className="mt-3 max-w-3xl text-[clamp(2rem,5vw,4.25rem)] leading-[0.98] font-semibold tracking-[-0.055em]"
        >
          Every culture that watched crows gave them the same job.
        </h2>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 md:mt-20 xl:grid-cols-4">
          {LORE.map((l, i) => (
            <li
              key={l.title}
              // A card the crow may land on (components/site/crow/roam.ts).
              data-crow-perch=""
              className="crow-rise flex flex-col gap-4 rounded-3xl border border-black/10 p-6 md:p-8"
              style={{ "--i": i } as React.CSSProperties}
            >
              <p className="eyebrow">{l.where}</p>
              <h3 className="text-2xl leading-[1.05] font-semibold tracking-[-0.04em]">{l.title}</h3>
              <p className="text-sm leading-relaxed text-black/65">{l.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-14 max-w-3xl text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.045em] md:mt-20">
          <Words text="Messenger, guide, keeper of memory: go out into the world and bring back what matters. That is the job here too." />
        </p>
      </section>

      {/* The symbol. */}
      <section aria-labelledby="symbol-title" className="container-site border-t border-black/10 py-24 md:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <BadgeReveal className="mx-auto w-full max-w-[420px] lg:col-span-5">
            <BadgeArt shape="seal" tier="SOTD" period="2026-11-12" date="2026-11-12" />
          </BadgeReveal>
          <div className="lg:col-span-7">
            <p className="eyebrow">The brand symbol</p>
            <h2
              id="symbol-title"
              className="mt-3 text-[clamp(2rem,5vw,4.25rem)] leading-[0.98] font-semibold tracking-[-0.055em]"
            >
              The crow on the line
            </h2>
            <div className="mt-6 grid max-w-xl gap-4 text-[15px] leading-relaxed text-black/70">
              <p>
                On every badge the crow stands on a line. The line is the bar, and the crow only stands on work that
                clears it: a badge is drawn for an award a site really won, with its date, and only the site&apos;s
                owner can get one.
              </p>
              <p>Its colour says how far the site went.</p>
            </div>
            <ul className="mt-8 grid max-w-xl grid-cols-4 gap-3 sm:gap-5">
              {CROWS.map((c, i) => (
                <li key={c.tier} className="grid gap-2 text-center">
                  <BadgeReveal delay={200 + i * 120}>
                    <BadgeArt shape="seal" tier={c.tier} period={c.period} date={c.date} />
                  </BadgeReveal>
                  <span className="eyebrow text-black">{c.name}</span>
                  <span className="text-[11px] leading-tight text-black/55">{awardName(c.tier)}</span>
                </li>
              ))}
            </ul>
            <PillLink href="/badges" variant="outline" className="mt-10">
              See the badges
            </PillLink>
          </div>
        </div>
      </section>

      {/* Why now. */}
      <section aria-labelledby="now-title" className="container-site border-t border-black/10 pt-24 md:pt-36">
        <h2
          id="now-title"
          aria-label="Why now?"
          className="text-[clamp(3.75rem,13.5vw,13.5rem)] leading-[0.86] font-semibold tracking-[-0.065em] uppercase"
        >
          {/* The crow may stop on these letters too. */}
          <CrowTitle text="Why now?" />
        </h2>
        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12">
          <p className="text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.05em] md:col-span-6">
            <Words text="The web has never been bigger, or more alike." />
          </p>
          <div className="grid max-w-xl gap-4 text-[15px] leading-relaxed text-black/70 md:col-span-6">
            <p>
              Templates and AI can put up a thousand websites before lunch. When anyone can make a site in a minute, a
              website isn&apos;t rare anymore. A good one is, and so is someone with the eye to find it.
            </p>
            <p>
              Crows do best in the busiest cities on earth. They learn the noise, then they pick out what is worth
              keeping. The web is the busiest city there is.
            </p>
          </div>
        </div>
      </section>

      {/* The end. */}
      <section aria-labelledby="end-title">
        <div className="container-site pt-32 pb-8 md:pt-48">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2
              id="end-title"
              className="max-w-2xl text-[clamp(2rem,5vw,4.25rem)] leading-[0.98] font-semibold tracking-[-0.055em]"
            >
              Bring the crow something worth keeping.
            </h2>
            <div className="flex flex-wrap gap-3">
              <PillLink href="/submit">Submit your site</PillLink>
              <PillLink href="/" variant="outline">
                See the collection
              </PillLink>
            </div>
          </div>
          <p className="mt-16 text-xs text-black/45">
            Sources: Hunt, Nature (1996); Marzluff et al., Animal Behaviour (2010); Kabadayi &amp; Osvath, Science
            (2017); Vander Wall &amp; Balda (1977); Shephard et al., Animal Cognition (2014); Bird &amp; Emery, Current
            Biology (2009). <Link href="/about" className="underline underline-offset-4">About Shemoqmedi</Link>
          </p>
        </div>
      </section>
    </>
  );
}
