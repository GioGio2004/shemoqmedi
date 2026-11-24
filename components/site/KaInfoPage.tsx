import Link from "next/link";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { GeorgianRoot } from "@/components/site/Georgian";
import { KA_PAGES, enTwinOf } from "@/lib/kaPages";
import type { InfoSection } from "@/components/site/InfoPage";

/**
 * The Georgian twin of InfoPage: same layout (hero, then two-column
 * sections), in Georgian, with links to the other Georgian pages and to the
 * English original.
 */
export function KaInfoPage({
  path,
  prelude,
  title,
  lede,
  sections,
  lead,
  jsonLd,
}: {
  /** This page's path ("/ka/jury"): left out of the links at the end. */
  path: string;
  prelude: string;
  title: string;
  lede: string;
  sections: InfoSection[];
  lead?: React.ReactNode;
  jsonLd: object;
}) {
  const english = enTwinOf(path);
  return (
    <GeorgianRoot>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        prelude={prelude}
        title={title}
        titleClassName="text-[clamp(2.75rem,9vw,9rem)] leading-[0.95] tracking-[-0.03em]"
        lede={lede}
        action={<PillLink href="/submit">გამოგზავნე საიტი</PillLink>}
      />
      {lead}
      <div className="container-site pb-8">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            aria-labelledby={`${s.id}-title`}
            className="grid gap-4 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
          >
            <h2
              id={`${s.id}-title`}
              className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.02em] md:col-span-4"
            >
              {s.heading}
            </h2>
            <div className="grid max-w-2xl gap-4 text-[15px] leading-relaxed text-black/70 md:col-span-8 [&_a]:text-black [&_a]:underline [&_a]:decoration-black/25 [&_a]:underline-offset-4 [&_a:hover]:decoration-black [&_strong]:font-semibold [&_strong]:text-black">
              {s.body}
            </div>
          </section>
        ))}
        <nav aria-label="სხვა გვერდები" className="border-t border-black/10 py-12">
          <p className="eyebrow mb-4">სხვა გვერდები ქართულად</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {KA_PAGES.filter((p) => p.ka !== path).map((p) => (
              <li key={p.ka}>
                <Link href={p.ka} className="underline decoration-black/25 underline-offset-4 hover:decoration-black">
                  {p.label}
                </Link>
              </li>
            ))}
            {english && (
              <li>
                <Link
                  href={english}
                  hrefLang="en"
                  lang="en"
                  className="underline decoration-black/25 underline-offset-4 hover:decoration-black"
                >
                  English
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </GeorgianRoot>
  );
}
