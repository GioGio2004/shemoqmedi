import Link from "next/link";
import type { CreatorSummary } from "@/convex-helpers-api";
import { TierBadge } from "@/components/listing/Badges";
import { JurorPhoto } from "@/components/jury/JurorPhoto";
import { regionName } from "@/lib/collections";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * One creator: photo (their sign-in photo, initials without one), name,
 * type, place and record. The whole card links to their profile.
 */
export function CreatorCard({ creator }: { creator: CreatorSummary }) {
  return (
    <Link href={`/creators/${creator.slug}`} className="group grid content-start gap-4">
      <JurorPhoto
        url={creator.photoUrl ?? null}
        name={creator.name}
        width={320}
        height={400}
        mono={false}
        className="aspect-[4/5] w-full rounded-2xl border border-black/8"
      />
      <div className="grid gap-2">
        <p className="text-lg leading-tight font-semibold tracking-[-0.03em] decoration-black/30 underline-offset-4 group-hover:underline">
          {creator.name}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={creator.tier} />
          <span className="text-sm text-black/60">{creator.location ?? regionName(creator.region)}</span>
        </div>
        <p className="font-mono text-[10.5px] font-medium tracking-[0.08em] text-black/50 uppercase tabular-nums">
          {plural(creator.nominations, "site")} · {plural(creator.awards, "award")}
        </p>
      </div>
    </Link>
  );
}

/** Responsive grid of creator cards (2 / 3 / 4 columns). */
export function CreatorGrid({ creators }: { creators: CreatorSummary[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
      {creators.map((c) => (
        <li key={c.slug}>
          <CreatorCard creator={c} />
        </li>
      ))}
    </ul>
  );
}
