import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserButton } from "@clerk/nextjs";
import { CurrentUserCard } from "@/components/auth/CurrentUserCard";
import { Logo } from "@/components/site/Logo";

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
      <header className="border-b">
        <div className="container-site flex h-16 items-center justify-between">
          <Logo locale={locale} />
          <UserButton />
        </div>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <CurrentUserCard />
      </main>
    </div>
  );
}
