import Link from "next/link";
import type { JurorPublic } from "@/convex-helpers-api";
import { hostOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { JurorAvatar } from "./JurorAvatar";
import { panelName, safeUrl } from "./jurorInfo";

/** What the card needs: a public juror, or a claim-link preview (no slug yet). */
export type JuryCardJuror = Omit<JurorPublic, "slug"> & { slug?: string };

/**
 * A juror's card, doubling as their jury badge: photo (or grey placeholder),
 * panel, name, role, location, bio and links. Used on /jury, /jury/<slug>,
 * the claim preview and the profile page. With `href` the whole card links
 * there (the name stretches over it; the outbound links stay clickable).
 */
export function JuryCard({
  juror,
  size = "md",
  href,
  branded,
  meta,
  className,
}: {
  juror: JuryCardJuror;
  size?: "md" | "lg";
  href?: string;
  /** Footer line naming the site, for the shareable badge. */
  branded?: boolean;
  meta?: React.ReactNode;
  className?: string;
}) {
  const lg = size === "lg";
  const website = safeUrl(juror.website);
  const linkedin = safeUrl(juror.linkedinUrl);
  const link = "relative z-10 underline decoration-black/20 underline-offset-4 hover:decoration-black";

  return (
    <article
      className={cn(
        "relative grid content-start gap-5 rounded-3xl border border-black/10 bg-white p-6",
        lg && "gap-7 md:p-10",
        href && "transition-colors hover:border-black/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <JurorAvatar url={juror.imageUrl} size={lg ? 120 : 72} />
        {juror.isFounding && (
          <span className="inline-flex h-7 items-center rounded-full bg-black px-3 text-[10.5px] font-semibold tracking-[0.08em] text-white uppercase">
            Founding Jury
          </span>
        )}
      </div>
      <div>
        <p className="eyebrow">{panelName(juror.category)}</p>
        <p
          className={cn(
            "mt-2 font-semibold tracking-[-0.04em] text-black",
            lg ? "text-[clamp(2rem,4vw,3rem)] leading-[0.95]" : "text-2xl leading-tight",
          )}
        >
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 after:rounded-3xl">
              {juror.name}
            </Link>
          ) : (
            juror.name
          )}
        </p>
        <p className={cn("mt-2 text-black", lg ? "text-base" : "text-sm")}>{juror.title}</p>
        {juror.location && <p className="mt-0.5 text-sm text-black/55">{juror.location}</p>}
      </div>
      {juror.bio && <p className="text-sm leading-relaxed whitespace-pre-line text-black/70">{juror.bio}</p>}
      {(linkedin || website) && (
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener" className={link}>
              LinkedIn
            </a>
          )}
          {website && (
            <a href={website} target="_blank" rel="noopener" className={link}>
              {hostOf(website)}
            </a>
          )}
        </p>
      )}
      {meta}
      {branded && (
        <p className="flex items-center justify-between gap-3 border-t border-black/10 pt-4 font-mono text-[10.5px] font-medium tracking-[0.08em] text-black/45 uppercase">
          <span>Shemoqmedi Jury</span>
          <span>shemoqmedi.space</span>
        </p>
      )}
    </article>
  );
}
