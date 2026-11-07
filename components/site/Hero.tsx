import { getTranslations } from "next-intl/server";
import {
  CRITERIA_WEIGHTS,
  FEATURED,
  overallScore,
  type Criterion,
} from "@/lib/showcase";
import { ProjectTile } from "./ProjectTile";
import { ButtonLink } from "./ui";

export async function Hero({ locale }: { locale: string }) {
  const t = await getTranslations("hero");
  const c = await getTranslations("criteria");
  const criteria = Object.keys(CRITERIA_WEIGHTS) as Criterion[];

  return (
    <section aria-labelledby="hero-title" className="container-site pt-10 pb-20 md:pt-16">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-5 lg:pt-4">
          <p className="label">{t("eyebrow")}</p>
          <h1
            id="hero-title"
            className="text-[clamp(2.75rem,6.2vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
          >
            {t("title")}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft">{t("lead")}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/${locale}/sign-up`}>{t("submit")}</ButtonLink>
            <ButtonLink href="#shortlist" variant="outline">
              {t("explore")}
            </ButtonLink>
          </div>
        </div>

        <article aria-label={t("featuredLabel")} className="flex flex-col gap-5 lg:col-span-7">
          <ProjectTile project={FEATURED} size="lg" />
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-1">
              <p className="label">{t("featuredLabel")}</p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                {FEATURED.title}
              </h2>
              <p className="text-sm text-ink-soft">
                {t("by")} {FEATURED.studio} · {FEATURED.country}
              </p>
            </div>
            <div className="text-right">
              <p className="label">{t("score")}</p>
              <p className="text-4xl font-semibold tabular-nums tracking-[-0.04em] md:text-5xl">
                {overallScore(FEATURED.scores).toFixed(2)}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
            {criteria.map((key) => (
              <div key={key} className="flex flex-col gap-1 border-b border-line py-3 pr-3 sm:border-b-0">
                <dt className="label">{c(key)}</dt>
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
