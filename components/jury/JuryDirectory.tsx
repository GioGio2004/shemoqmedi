import Link from "next/link";
import type { JurorPublic } from "@/convex-helpers-api";
import { JURY_CATEGORIES } from "@/lib/taxonomy";
import { JurorPhoto } from "./JurorPhoto";

export type DirectoryMember = JurorPublic & { evaluations: number };

/** The directory's words, in English (default) or Georgian (/ka/jury). */
const COPY = {
  en: {
    heading: "Members",
    jurors: (n: number) => `${n} ${n === 1 ? "juror" : "jurors"}`,
    members: (n: number) => `${n} ${n === 1 ? "member" : "members"}`,
    scored: (n: number) => `${n} scored`,
    founding: "Founding",
    panels: Object.fromEntries(JURY_CATEGORIES.map((c) => [c.slug, c.name])) as Record<string, string>,
    noPanel: "Jury",
  },
  ka: {
    heading: "წევრები",
    jurors: (n: number) => `${n} ჟიურის წევრი`,
    members: (n: number) => `${n} წევრი`,
    scored: (n: number) => `${n} შეფასება`,
    founding: "დამფუძნებელი",
    panels: {
      design: "დიზაინი და UI",
      product: "პროდუქტი და UX კვლევა",
      brand: "ბრენდი და კრეატიული მიმართულება",
      motion: "მოუშენი, 3D და კრეატიული დეველოპმენტი",
      engineering: "ინჟინერია და წარმადობა",
      accessibility: "ხელმისაწვდომობა და ინკლუზიური დიზაინი",
      growth: "მარკეტინგი და ზრდა",
      venture: "ვენჩურები და სტარტაპები",
      academic: "აკადემია, SEO და კონტენტი",
    } as Record<string, string>,
    noPanel: "ჟიური",
  },
};
type Copy = (typeof COPY)["en"];

/** Members by panel, in JURY_CATEGORIES order; jurors without a panel last, under "Jury". */
function byPanel(jurors: DirectoryMember[], t: Copy) {
  const panels: { key: string; name: string; members: DirectoryMember[] }[] = JURY_CATEGORIES.map((c) => ({
    key: c.slug,
    name: t.panels[c.slug] ?? c.name,
    members: jurors.filter((j) => j.category === c.slug),
  }));
  panels.push({ key: "jury", name: t.noPanel, members: jurors.filter((j) => j.category === null) });
  return panels.filter((p) => p.members.length > 0);
}

/** One member: portrait, name, role, location. The whole tile links to their profile. */
function Member({ juror, t }: { juror: DirectoryMember; t: Copy }) {
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
              {t.founding}
            </span>
          )}
        </div>
        <div className="grid gap-1">
          <p className="text-lg leading-tight font-semibold tracking-[-0.03em] decoration-black/30 underline-offset-4 group-hover:underline">
            {juror.name}
          </p>
          <p className="line-clamp-2 text-sm leading-snug text-black/70">{juror.title}</p>
          <p className="mt-1 font-mono text-[10.5px] font-medium tracking-[0.08em] text-black/50 uppercase tabular-nums">
            {[juror.location, t.scored(juror.evaluations)].filter(Boolean).join(" · ")}
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
export function JuryDirectory({ jurors, lang = "en" }: { jurors: DirectoryMember[]; lang?: "en" | "ka" }) {
  const t = COPY[lang];
  return (
    <section aria-labelledby="members-title" className="container-site">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-12 md:pt-16">
        <h2 id="members-title" className="text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
          {t.heading}
        </h2>
        <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-black/55 uppercase tabular-nums">
          {t.jurors(jurors.length)}
        </p>
      </div>
      {byPanel(jurors, t).map((panel) => (
        <div
          key={panel.key}
          className="grid gap-6 border-b border-black/10 py-10 last:border-b-0 md:grid-cols-12 md:gap-10 md:py-14"
        >
          <div className="grid content-start gap-1 md:col-span-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em]">{panel.name}</h3>
            <p className="text-sm text-black/55">
              {t.members(panel.members.length)}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:col-span-9 md:gap-x-6 lg:grid-cols-4">
            {panel.members.map((j) => (
              <Member key={j.slug} juror={j} t={t} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
