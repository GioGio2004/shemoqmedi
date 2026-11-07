import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { NAV_ITEMS } from "./Navbar";
import { LocaleLinks } from "./ui";

export async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="border-t border-line">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12">
        <p className="max-w-sm text-ink-soft md:col-span-6">{t("tagline")}</p>

        <nav aria-label={t("explore")} className="md:col-span-3">
          <p className="label mb-4">{t("explore")}</p>
          <ul className="flex flex-col gap-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className="hover:underline">
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("account")} className="md:col-span-3">
          <p className="label mb-4">{t("account")}</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href={`/${locale}/sign-up`} className="hover:underline">
                {nav("submit")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/sign-in`} className="hover:underline">
                {nav("login")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Oversized wordmark: the logo, so it is the one place gold appears. */}
      <div className="container-site overflow-hidden">
        <p
          aria-hidden
          className="pb-4 text-[clamp(3.5rem,15.5vw,15rem)] leading-[0.9] font-semibold tracking-[-0.07em] text-gold lowercase select-none"
        >
          shemoqmedi
        </p>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-4 py-6 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} shemoqmedi.space · {t("rights")}</p>
          <LocaleLinks current={locale} />
        </div>
      </div>
    </footer>
  );
}
