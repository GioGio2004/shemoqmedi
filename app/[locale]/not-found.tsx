import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "@/components/site/Logo";
import { ButtonLink } from "@/components/site/ui";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const locale = await getLocale();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo locale={locale} />
      <p className="text-7xl font-semibold tracking-[-0.05em]">404</p>
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="text-ink-soft">{t("description")}</p>
      <ButtonLink href={`/${locale}`}>{t("button")}</ButtonLink>
    </main>
  );
}
