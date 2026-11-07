import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";
import { ButtonLink, LocaleLinks } from "./ui";

export const NAV_ITEMS = [
  { key: "websites", href: "#shortlist" },
  { key: "categories", href: "#categories" },
  { key: "creators", href: "#creators" },
  { key: "awards", href: "#awards" },
] as const;

// Server-rendered; the mobile menu is a native <details> element, so the
// navbar ships zero JavaScript.
export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="container-site flex h-16 items-center gap-10">
        <Logo locale={locale} />

        <nav aria-label={t("primary")} className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="text-ink-soft hover:text-ink">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-6 md:flex">
          <LocaleLinks current={locale} />
          <Link href={`/${locale}/sign-in`} className="text-sm hover:underline">
            {t("login")}
          </Link>
          <ButtonLink href={`/${locale}/sign-up`} className="h-9 px-4">
            {t("submit")}
          </ButtonLink>
        </div>

        <details className="group ml-auto md:hidden">
          <summary className="flex h-9 cursor-pointer list-none items-center rounded-full border border-line px-4 text-sm [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{t("menu")}</span>
            <span className="hidden group-open:inline">{t("close")}</span>
          </summary>
          <div className="absolute inset-x-0 top-16 border-b border-line bg-paper">
            <nav aria-label={t("primary")} className="container-site py-6">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="block py-2 text-3xl font-semibold tracking-[-0.035em]"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col items-start gap-5 border-t border-line pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <ButtonLink href={`/${locale}/sign-up`}>{t("submit")}</ButtonLink>
                  <ButtonLink href={`/${locale}/sign-in`} variant="outline">
                    {t("login")}
                  </ButtonLink>
                </div>
                <LocaleLinks current={locale} />
              </div>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
