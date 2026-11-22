import Link from "next/link";
import type { JurorPublic } from "@/convex-helpers-api";
import { JURY_CATEGORIES } from "@/lib/taxonomy";
import { JurorPhoto } from "./JurorPhoto";

export type DirectoryMember = JurorPublic & { evaluations: number };

/** Members by panel, in JURY_CATEGORIES order; jurors without a panel last, under "Jury". */
function byPanel(jurors: DirectoryMember[]) {
  const panels: { key: string; name: string; members: DirectoryMember[] }[] = JURY_CATEGORIES.map((c) => ({
    key: c.slug,
    name: c.name,
    members: jurors.filter((j) => j.category === c.slug),
  }));
  panels.push({ key: "jury", name: "Jury", members: jurors.filter((j) => j.category === null) });
  return panels.filter((p) => p.members.length > 0);
}

/** One member: portrait, name, role, location. The whole tile links to their profile. */
function Member({ juror }: { juror: DirectoryMember }) {
  return (
    // id: older links point at /jury#<slug>.
    <li id={juror.slug} className="scroll-mt-32">
      <Link href={`/jury/${juror.slug}`} className="group grid content-start gap-4">
        <div className="relative">
          <JurorPhoto
            url={juror.imageUrl}
            name={juror.name}
            width={320}
            height={400}
            className="aspect-[4/5] w-full rounded-2xl"
          />
          {juror.isFounding && (
            <span className="absolute top-3 left-3 inline-flex h-6 items-center rounded-full bg-white px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
              Founding
            </span>
          )}
        </div>
        <div className="grid gap-1">
          <p className="text-lg leading-tight font-semibold tracking-[-0.03em] decoration-black/30 underline-offset-4 group-hover:underline">
            {juror.name}
          </p>
          <p className="line-clamp-2 text-sm leading-snug text-black/70">{juror.title}</p>
          <p className="mt-1 font-mono text-[10.5px] font-medium tracking-[0.08em] text-black/50 uppercase tabular-nums">
            {[juror.location, `${juror.evaluations} scored`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
    </li>
  );
}

/**
 * The /jury member directory on the 12-column grid: each panel is a band
 * with its name and head count on the left, portrait tiles on the right.
 */
export function JuryDirectory({ jurors }: { jurors: DirectoryMember[] }) {
  return (
    <section aria-labelledby="members-title" className="container-site">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-12 md:pt-16">
        <h2 id="members-title" className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
          Members
        </h2>
        <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-black/55 uppercase tabular-nums">
          {jurors.length} {jurors.length === 1 ? "juror" : "jurors"}
        </p>
      </div>
      {byPanel(jurors).map((panel) => (
        <div
          key={panel.key}
          className="grid gap-6 border-b border-black/10 py-10 last:border-b-0 md:grid-cols-12 md:gap-10 md:py-14"
        >
          <div className="grid content-start gap-1 md:col-span-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em]">{panel.name}</h3>
            <p className="text-sm text-black/55">
              {panel.members.length} {panel.members.length === 1 ? "member" : "members"}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:col-span-9 md:gap-x-6 lg:grid-cols-4">
            {panel.members.map((j) => (
              <Member key={j.slug} juror={j} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
