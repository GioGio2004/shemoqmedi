import type { Metadata } from "next";
import { PageHero } from "@/components/listing/PageHero";
import { awardName } from "@/lib/badgeInfo";
import type { AwardSlug } from "@/lib/taxonomy";

// What each award's certificate looks like, with sample data. Winners get
// theirs from their award page and the winner email; this page is for
// checking the design, so it is not indexed or linked from the menu.
export const metadata: Metadata = {
  title: "Award certificates",
  description: "The certificate every Shemoqmedi award comes with, shown with sample data.",
  robots: { index: false, follow: false },
};

const TIERS: AwardSlug[] = ["SOTY", "SOTM", "SOTD", "HM", "BSC", "F100"];

export default function CertificatesPage() {
  return (
    <>
      <PageHero
        prelude="every award comes with"
        title="Certificates"
        lede="A4 certificates in each award's colours, made automatically when a site wins. These use sample data; a real one carries the site, its makers, the jury's score and the jurors' names, and links back to its award page."
      />
      <section aria-label="Sample certificates" className="container-site grid gap-10 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const src = `/certificate/sample/${tier.toLowerCase()}`;
          return (
            <figure key={tier} className="grid gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated PNG, shown as is */}
              <img
                src={src}
                alt={`Sample ${awardName(tier)} certificate`}
                width={1131}
                height={1600}
                loading="lazy"
                className="h-auto w-full rounded-2xl border border-black/10"
              />
              <figcaption className="flex items-center justify-between gap-4 text-sm">
                <span>{awardName(tier)}</span>
                <a href={`${src}?download=1`} className="underline underline-offset-4">
                  Download PNG
                </a>
              </figcaption>
            </figure>
          );
        })}
      </section>
    </>
  );
}
