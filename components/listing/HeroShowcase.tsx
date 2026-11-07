import { MediaImage as Image } from "@/components/site/MediaImage";
import Link from "next/link";
import type { PublicListing } from "@/convex-helpers-api";
import { PillLink } from "@/components/site/ui";
import { heroPicks, withRef } from "@/lib/listings";
import { awardName } from "@/lib/collections";
import { AwardBadge, ScoreBadge } from "./Badges";

type Frame = { label: string; listing: PublicListing };

/** Honest label for the left frame: heroPicks falls back when there is no SOTD yet. */
function leftLabel(listing: PublicListing) {
  if (listing.awards.includes("SOTD")) return "Site of the Day";
  if (listing.awards.length > 0) return "Featured";
  return "Top nominee";
}

function frames(listings: PublicListing[]): Frame[] {
  const { sotd, bsc } = heroPicks(listings);
  if (sotd && bsc && sotd.slug === bsc.slug) {
    return [{ label: "Site of the Day · Best Solo Creation", listing: sotd }];
  }
  const out: Frame[] = [];
  if (sotd) out.push({ label: leftLabel(sotd), listing: sotd });
  if (bsc) out.push({ label: "Best Solo Creation", listing: bsc });
  return out;
}

/**
 * The two headline sites side by side: latest Site of the Day (left) and
 * latest Best Solo Creation (right). Server component, zero client JS of its own.
 */
export function HeroShowcase({ listings }: { listings: PublicListing[] }) {
  const items = frames(listings);
  if (items.length === 0) return null;

  return (
    <section aria-label="Featured websites" className="container-site pb-16 md:pb-24">
      <div className={items.length > 1 ? "grid gap-8 lg:grid-cols-2" : "grid gap-8"}>
        {items.map(({ label, listing }) => (
          <HeroFrame key={listing.slug} label={label} listing={listing} wide={items.length === 1} />
        ))}
      </div>
    </section>
  );
}

function HeroFrame({
  label,
  listing,
  wide,
}: {
  label: string;
  listing: PublicListing;
  wide: boolean;
}) {
  const scoreLabel = listing.status === "in_voting" ? "Live score" : "Score";
  // The label under the image already names the frame's award; don't say it twice.
  const badges = listing.awards.filter((a) => !label.includes(awardName(a)));

  return (
    <article className="flex flex-col rounded-3xl border border-black/10 p-3 md:p-4">
      <div className="group relative aspect-video overflow-hidden rounded-2xl border border-black/8 bg-white">
        <Link href={`/sites/${listing.slug}`} aria-label={listing.title} className="absolute inset-0 block">
          {listing.coverUrl && (
            <Image
              src={listing.coverUrl}
              alt={`${listing.title} website screenshot`}
              fill
              priority
              sizes={wide ? "(max-width: 1440px) 100vw, 1392px" : "(max-width: 1024px) 100vw, 50vw"}
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          )}
        </Link>
        {/* Outside the link so its aria-label does not hide the awards from screen readers. */}
        {badges.length > 0 && (
          <span className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
            {badges.map((a) => (
              <AwardBadge key={a} award={a} full />
            ))}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 px-2 pt-6 pb-2 md:px-3">
        <div className="flex items-start justify-between gap-6">
          <p className="eyebrow">{label}</p>
          {listing.finalScore !== null && (
            <p className="flex shrink-0 items-baseline gap-2">
              <span className="sr-only">{scoreLabel}:</span>
              <ScoreBadge score={listing.finalScore} outOf className="text-[13px]" />
            </p>
          )}
        </div>

        <div>
          <h2 className="text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.045em]">
            <Link href={`/sites/${listing.slug}`} className="hover:underline hover:underline-offset-[6px]">
              {listing.title}
            </Link>
          </h2>
          <p className="mt-2 text-sm text-black/55">
            by{" "}
            {listing.creator ? (
              <Link href={`/creators/${listing.creator.slug}`} className="text-black hover:underline hover:underline-offset-4">
                {listing.creditName}
              </Link>
            ) : (
              <span className="text-black">{listing.creditName}</span>
            )}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {listing.technologies.length > 0 ? (
            <ul aria-label="Technologies" className="flex flex-wrap gap-x-3 gap-y-1">
              {listing.technologies.slice(0, 4).map((t) => (
                <li key={t} className="font-mono text-[10px] tracking-[0.08em] text-black/55 uppercase">
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <span />
          )}
          <PillLink href={withRef(listing.url)} external variant="outline" className="shrink-0 self-start sm:self-auto">
            Visit live site
          </PillLink>
        </div>
      </div>
    </article>
  );
}
