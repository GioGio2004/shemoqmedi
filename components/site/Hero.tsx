import {
  CRITERIA,
  CRITERIA_WEIGHTS,
  FEATURED,
  overallScore,
  type Criterion,
} from "@/lib/showcase";
import { ProjectTile } from "./ProjectTile";
import { ButtonLink } from "./ui";

export function Hero() {
  const criteria = Object.keys(CRITERIA_WEIGHTS) as Criterion[];

  return (
    <section aria-labelledby="hero-title" className="container-site pt-10 pb-20 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-4">
          <p className="label">Creation of the day</p>
          <h1
            id="hero-title"
            className="text-[clamp(2.75rem,6.2vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
          >
            The web&apos;s finest work, judged by creators.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft">
            Submit your best website. An independent jury of designers and
            developers scores it, and the finest work is awarded every day.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/sign-up">Submit your work</ButtonLink>
            <ButtonLink href="#shortlist" variant="outline">
              Explore the shortlist
            </ButtonLink>
          </div>
        </div>

        <article aria-label="Today's pick" className="flex flex-col gap-5 lg:col-span-7">
          <ProjectTile project={FEATURED} size="lg" />
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="label">Today&apos;s pick</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                {FEATURED.title}
              </h2>
              <p className="text-sm text-ink-soft">
                by {FEATURED.studio} · {FEATURED.country}
              </p>
            </div>
            <div className="text-right">
              <p className="label">Score</p>
              <p className="text-4xl font-semibold tabular-nums tracking-[-0.04em] md:text-5xl">
                {overallScore(FEATURED.scores).toFixed(2)}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
            {criteria.map((key) => (
              <div key={key} className="flex flex-col gap-1 border-b border-line py-3 pr-3 sm:border-b-0">
                <dt className="label">{CRITERIA[key].name}</dt>
                <dd className="text-xl font-medium tabular-nums">
                  {FEATURED.scores[key].toFixed(1)}
                </dd>
              </div>
            ))}
          </dl>
        </article>
      </div>
    </section>
  );
}
