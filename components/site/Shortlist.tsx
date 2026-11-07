import { getTranslations } from "next-intl/server";
import { SHORTLIST, overallScore } from "@/lib/showcase";
import { ProjectTile } from "./ProjectTile";
import { ArrowLink, SectionHeader } from "./ui";

export async function Shortlist({ locale }: { locale: string }) {
  const t = await getTranslations("shortlist");

  return (
    <section aria-labelledby="shortlist" className="container-site scroll-mt-20 pb-24">
      <SectionHeader
        id="shortlist"
        label={t("label")}
        title={t("title")}
        action={<ArrowLink href={`/${locale}/sign-up`}>{t("joinJury")}</ArrowLink>}
      />
      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {SHORTLIST.map((project) => (
          <li key={project.slug}>
            <article className="flex flex-col gap-4">
              <ProjectTile project={project} />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">
                    {project.title}
                  </h3>
                  <p className="text-sm text-ink-soft">
                    {t("by")} {project.studio} · {project.country}
                  </p>
                </div>
                <p
                  className="shrink-0 rounded-full bg-beige px-3 py-1 text-sm font-medium tabular-nums"
                  title={t("score")}
                >
                  {overallScore(project.scores).toFixed(2)}
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-ink-soft">
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
