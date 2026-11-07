import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { UserButton } from "@clerk/nextjs";
import { CurrentUserCard } from "@/components/auth/CurrentUserCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const metadata: Metadata = { robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session).
export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("account");

  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-mono text-xs tracking-widest uppercase"
        >
          shemoqmedi.space
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <UserButton />
        </div>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <CurrentUserCard />
      </main>
    </div>
  );
}
