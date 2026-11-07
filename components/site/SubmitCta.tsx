import { getTranslations } from "next-intl/server";
import { ButtonLink } from "./ui";

export async function SubmitCta({ locale }: { locale: string }) {
  const t = await getTranslations("cta");

  return (
    <section aria-labelledby="cta-title" className="container-site pb-24">
      <div className="flex flex-col gap-8 rounded-md bg-beige px-6 py-16 md:px-12 md:py-24">
        <h2
          id="cta-title"
          className="max-w-4xl text-[clamp(2.25rem,5.5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em]"
        >
          {t("title")}
        </h2>
        <p className="max-w-xl text-lg leading-relaxed text-ink-soft">{t("lead")}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/${locale}/sign-up`} className="bg-paper hover:bg-beige-deep">
            {t("submit")}
          </ButtonLink>
          <ButtonLink href={`/${locale}/sign-in`} variant="outline" className="bg-transparent">
            {t("login")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
