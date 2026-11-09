import type { AwardSlug, CreatorTier } from "@/lib/taxonomy";
import { awardName, tierBadge } from "@/lib/collections";
import { formatScore } from "@/lib/format";
import { cn } from "@/lib/utils";

const mono = "font-mono text-[10px] font-medium tracking-[0.08em] uppercase";

/** Award ribbon: SOTD / BSC / HM. Solid black; the only "loud" element. */
export function AwardBadge({
  award,
  full,
  className,
}: {
  award: AwardSlug;
  full?: boolean;
  className?: string;
}) {
  return (
    <span
      title={awardName(award)}
      // The site's crow may land on a Site of the Day badge.
      data-crow-perch={award === "SOTD" ? "badge" : undefined}
      className={cn(
        mono,
        "inline-flex h-6 items-center rounded-full bg-black px-2.5 text-white",
        className,
      )}
    >
      {full ? awardName(award) : award}
    </span>
  );
}

/** "SOLO DEV" / "AGENCY" outline tag. */
export function TierBadge({ tier, className }: { tier: CreatorTier; className?: string }) {
  return (
    <span
      className={cn(
        mono,
        "inline-flex h-6 items-center rounded-full border border-black/15 px-2.5 text-black",
        className,
      )}
    >
      {tierBadge(tier)}
    </span>
  );
}

/** "8.72 / 10" score readout. */
export function ScoreBadge({
  score,
  outOf,
  className,
}: {
  score: number | null;
  outOf?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(mono, "tabular-nums text-black", className)}>
      {formatScore(score)}
      {outOf && score !== null && <span className="text-black/45"> / 10</span>}
    </span>
  );
}
