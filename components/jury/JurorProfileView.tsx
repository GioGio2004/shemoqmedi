import Link from "next/link";
import type { JurorEducation, JurorExperience, JurorWork } from "@/convex-helpers-api";
import type { JuryCategory } from "@/lib/taxonomy";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { ArrowIcon, PillLink } from "@/components/site/ui";
import { formatDate, formatScore, hostOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { educationDates, educationTitle, experienceDates, experienceDuration, groupExperience } from "./experience";
import { JurorPhoto } from "./JurorPhoto";
import { JuryShareActions } from "./JuryShareActions";
import { linkedinUrl, panelName, safeUrl } from "./jurorInfo";

export type ProfileJuror = {
  slug?: string;
  name: string;
  title: string;
  category: JuryCategory | null;
  location: string | null;
  website: string | null;
  linkedinUrl: string | null;
  bio: string | null;
  experience?: JurorExperience[];
  education?: JurorEducation[];
  work?: JurorWork[];
  isFounding: boolean;
  imageUrl: string | null;
  joinedAt?: number;
};

export type ProfileReview = {
  listing: { slug: string; title: string; coverUrl: string | null };
  average: number;
  comment: string;
  updatedAt: number;
};

const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums";

/** One band of the profile: heading in the left columns, content on the right. */
function Row({ id, heading, aside, children }: { id: string; heading: string; aside?: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16">
      <div className="grid content-start gap-2 md:col-span-4 lg:col-span-3">
        <h2 id={id} className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
          {heading}
        </h2>
        {aside && <p className="text-sm text-black/55">{aside}</p>}
      </div>
      <div className="min-w-0 md:col-span-8 lg:col-span-9">{children}</div>
    </section>
  );
}

/** A company name, linked out when it has a website. */
function Company({ name, url, className }: { name: string; url?: string; className?: string }) {
  const link = safeUrl(url ?? null);
  if (!link) return <span className={className}>{name}</span>;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener"
      className={cn("underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black", className)}
    >
      {name}
    </a>
  );
}

/** Dates on the right of a role: "Mar 2021 – Present", then "4 yrs 9 mos". */
function RoleDates({ role }: { role: JurorExperience }) {
  const dates = experienceDates(role);
  const duration = experienceDuration(role);
  if (!dates) return null;
  return (
    <p className={`${mono} grid gap-1 text-black/55 sm:pt-1.5 sm:text-right`}>
      <span className="inline-flex items-center gap-2 sm:justify-end">
        {role.current && <span aria-hidden="true" className="size-1.5 rounded-full bg-black" />}
        {dates}
      </span>
      {duration && <span className="text-black/40">{duration}</span>}
    </p>
  );
}

function RoleDescription({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-3 max-w-2xl text-[15px] leading-relaxed whitespace-pre-line text-black/70">{text}</p>;
}

/** Experience, newest first; consecutive roles at one company share its heading. */
function ExperienceList({ rows }: { rows: JurorExperience[] }) {
  const groups = groupExperience(rows);
  const item = "border-b border-black/10 py-6 first:pt-0 last:border-b-0 last:pb-0";
  return (
    <ol className="grid">
      {groups.map((g, i) =>
        g.roles.length === 1 ? (
          <li key={i} className={cn(item, "grid gap-2 sm:grid-cols-[minmax(0,1fr)_13rem] sm:gap-6")}>
            <div className="min-w-0">
              <p className="text-lg leading-snug font-semibold tracking-[-0.02em]">{g.roles[0].title}</p>
              <p className="mt-0.5 text-[15px] text-black/60">
                <Company name={g.organization} url={g.organizationUrl} />
                {g.roles[0].location && <span> · {g.roles[0].location}</span>}
              </p>
              <RoleDescription text={g.roles[0].description} />
            </div>
            <RoleDates role={g.roles[0]} />
          </li>
        ) : (
          <li key={i} className={cn(item, "grid gap-5")}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-lg leading-snug font-semibold tracking-[-0.02em]">
                <Company name={g.organization} url={g.organizationUrl} />
              </p>
              {g.duration && <p className={`${mono} text-black/55`}>{g.duration}</p>}
            </div>
            <ol className="grid gap-6 border-l border-black/15 pl-5 md:pl-6">
              {g.roles.map((r, j) => (
                <li key={j} className="relative grid gap-2 sm:grid-cols-[minmax(0,1fr)_13rem] sm:gap-6">
                  <span
                    aria-hidden="true"
                    className="absolute top-2.5 -left-[calc(1.25rem+3.5px)] size-1.5 rounded-full bg-black md:-left-[calc(1.5rem+3.5px)]"
                  />
                  <div className="min-w-0">
                    <p className="text-[17px] leading-snug font-semibold tracking-[-0.02em]">{r.title}</p>
                    {r.location && <p className="mt-0.5 text-[15px] text-black/60">{r.location}</p>}
                    <RoleDescription text={r.description} />
                  </div>
                  <RoleDates role={r} />
                </li>
              ))}
            </ol>
          </li>
        ),
      )}
    </ol>
  );
}

/**
 * A juror's public profile: portrait and identity, stats, about, experience,
 * education, selected work, reviews. The /jury/<slug> page, and the invitation page's
 * preview of the profile before it is claimed (`preview`: no share buttons,
 * no links to a page that doesn't exist yet).
 */
export function JurorProfileView({
  juror,
  reviews,
  about,
  onTheJury,
  preview,
}: {
  juror: ProfileJuror;
  reviews: ProfileReview[];
  /** The About text: the bio, or a sentence written from the profile when there is none. */
  about: string;
  /** The closing "On the jury" paragraph. */
  onTheJury: string;
  preview?: boolean;
}) {
  const panel = panelName(juror.category);
  const website = safeUrl(juror.website);
  const linkedin = linkedinUrl(juror.linkedinUrl);
  const experience = juror.experience ?? [];
  const education = juror.education ?? [];
  const work = juror.work ?? [];
  const meanGiven = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.average, 0) / reviews.length : null;
  const stats: [string, string][] = [
    ["Panel", panel],
    ["On the jury since", juror.joinedAt && !preview ? formatDate(juror.joinedAt) : "When you claim"],
    ["Websites scored", String(reviews.length)],
    ["Average score given", formatScore(meanGiven)],
  ];

  return (
    <>
      <header className={cn("container-site pb-12 md:pb-16", preview ? "pt-10 md:pt-12" : "pt-32 md:pt-40")}>
        <nav aria-label="Breadcrumb" className="eyebrow mb-8 flex flex-wrap items-center gap-2">
          {preview ? (
            <span>The jury</span>
          ) : (
            <Link href="/jury" className="hover:text-black">
              The jury
            </Link>
          )}
          <span aria-hidden="true">/</span>
          <span className="text-black">{juror.name}</span>
        </nav>
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <JurorPhoto
            url={juror.imageUrl}
            name={juror.name}
            alt={`${juror.name}, ${juror.title}`}
            width={420}
            height={525}
            mono={false}
            priority={!preview}
            className="aspect-[4/5] w-full max-w-[22rem] rounded-3xl md:col-span-4 md:max-w-none lg:col-span-3"
          />
          <div className="flex min-w-0 flex-col justify-between gap-10 md:col-span-8 lg:col-span-9">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="eyebrow">Shemoqmedi Jury · {panel}</p>
                {juror.isFounding && (
                  <span className="inline-flex h-6 items-center rounded-full border border-black px-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase">
                    Founding member
                  </span>
                )}
              </div>
              <h1 className="mt-5 text-[clamp(2.75rem,7vw,6.75rem)] leading-[0.9] font-semibold tracking-[-0.06em] [overflow-wrap:anywhere]">
                {juror.name}
              </h1>
              <p className="mt-6 max-w-3xl text-[clamp(1.125rem,1.8vw,1.5rem)] leading-snug tracking-[-0.02em]">{juror.title}</p>
              {juror.location && <p className="mt-2 text-sm text-black/55">{juror.location}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {linkedin && (
                <PillLink href={linkedin} external>
                  LinkedIn
                </PillLink>
              )}
              {website && (
                <PillLink href={website} external variant="outline">
                  {hostOf(website)}
                </PillLink>
              )}
              {!preview && juror.slug && <JuryShareActions slug={juror.slug} />}
            </div>
          </div>
        </div>
      </header>

      <div className="container-site pb-12">
        <dl className="grid grid-cols-2 border-t border-black/10 md:grid-cols-4">
          {stats.map(([term, value], i) => (
            <div
              key={term}
              className={[
                "grid content-start gap-3 py-6 md:py-8",
                i > 0 ? "md:border-l md:border-black/10 md:pl-6" : "",
                i % 2 === 1 ? "border-l border-black/10 pl-5" : "",
                i >= 2 ? "border-t border-black/10 md:border-t-0" : "",
              ].join(" ")}
            >
              <dt className="eyebrow">{term}</dt>
              <dd className="text-xl font-semibold tracking-[-0.03em] tabular-nums md:text-2xl">{value}</dd>
            </div>
          ))}
        </dl>

        <Row id="about-title" heading="About">
          <p className="max-w-3xl text-[clamp(1.125rem,1.6vw,1.375rem)] leading-[1.5] tracking-[-0.015em] whitespace-pre-line">
            {about}
          </p>
        </Row>

        {experience.length > 0 && (
          <Row id="experience-title" heading="Experience">
            <ExperienceList rows={experience} />
          </Row>
        )}

        {education.length > 0 && (
          <Row id="education-title" heading="Education">
            <ol className="grid">
              {education.map((e, i) => {
                const title = educationTitle(e);
                const dates = educationDates(e);
                return (
                  <li
                    key={i}
                    className="grid gap-1 border-b border-black/10 py-5 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_13rem] sm:gap-6"
                  >
                    <div className="min-w-0">
                      <p className="text-lg leading-snug font-semibold tracking-[-0.02em]">{e.school}</p>
                      {title && <p className="mt-0.5 text-[15px] text-black/60">{title}</p>}
                    </div>
                    {dates && <p className={`${mono} text-black/55 sm:pt-1.5 sm:text-right`}>{dates}</p>}
                  </li>
                );
              })}
            </ol>
          </Row>
        )}

        {work.length > 0 && (
          <Row id="work-title" heading="Selected work">
            <ul className="grid gap-px overflow-hidden rounded-3xl border border-black/10 bg-black/10 sm:grid-cols-2">
              {work.map((w, i) => {
                const link = safeUrl(w.url);
                const body = (
                  <>
                    <div className="flex items-baseline justify-between gap-4">
                      <p className={`${mono} truncate text-black/55`}>{link ? hostOf(link) : "Project"}</p>
                      {w.year && <p className={`${mono} text-black/55`}>{w.year}</p>}
                    </div>
                    <div className="grid gap-2">
                      <p className="flex items-start justify-between gap-4 text-xl leading-tight font-semibold tracking-[-0.03em]">
                        {w.title}
                        {link && (
                          <ArrowIcon className="mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        )}
                      </p>
                      {w.description && <p className="text-sm leading-relaxed text-black/60">{w.description}</p>}
                    </div>
                  </>
                );
                const cell = "grid min-h-44 content-between gap-8 bg-white p-6 md:p-7";
                const wide = work.length % 2 === 1 && i === work.length - 1;
                return (
                  <li key={i} className={wide ? "grid sm:col-span-2" : "grid"}>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener" className={`group ${cell} transition-colors hover:bg-neutral-50`}>
                        {body}
                      </a>
                    ) : (
                      <div className={cell}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Row>
        )}

        <Row
          id="juror-reviews-title"
          heading="Reviews"
          aside={reviews.length > 0 ? `${reviews.length} ${reviews.length === 1 ? "website" : "websites"} scored` : undefined}
        >
          {reviews.length === 0 ? (
            <p className="text-[15px] text-black/55">
              {preview
                ? "Your reviews appear here, with your name, once each judging week closes."
                : "No reviews yet. Reviews appear here once each judging week closes."}
            </p>
          ) : (
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2">
              {reviews.map((r) => (
                <li key={r.listing.slug} className="grid content-start gap-4">
                  <Link
                    href={`/sites/${r.listing.slug}`}
                    className="relative block aspect-video overflow-hidden rounded-2xl border border-black/8 bg-black/5"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {r.listing.coverUrl && (
                      <Image
                        src={r.listing.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 40vw, 480px"
                        className="object-cover object-top"
                      />
                    )}
                  </Link>
                  <div className="flex items-baseline justify-between gap-4">
                    <Link href={`/sites/${r.listing.slug}`} className="truncate text-lg font-semibold tracking-[-0.02em] hover:underline">
                      {r.listing.title}
                    </Link>
                    <p className="font-mono text-2xl font-semibold tabular-nums" aria-label={`Score ${formatScore(r.average)} out of 10`}>
                      {formatScore(r.average)}
                    </p>
                  </div>
                  {r.comment && <p className="text-[15px] leading-relaxed whitespace-pre-line text-black/80">{r.comment}</p>}
                  <p className={`${mono} text-black/55`}>{formatDate(r.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </Row>

        <Row id="on-the-jury-title" heading="On the jury">
          <div className="grid max-w-2xl gap-6 text-[15px] leading-relaxed text-black/70">
            <p>{onTheJury}</p>
            {!preview && (
              <div className="flex flex-wrap gap-3">
                <PillLink href="/jury" variant="outline">
                  Meet the jury
                </PillLink>
                <PillLink href="/how-we-score" variant="outline">
                  How we score
                </PillLink>
              </div>
            )}
          </div>
        </Row>
      </div>
    </>
  );
}
