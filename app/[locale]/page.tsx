import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        ka: `${BASE_URL}/ka`,
        ru: `${BASE_URL}/ru`,
        "x-default": `${BASE_URL}/en`,
      },
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const { userId } = await auth();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        shemoqmedi.space
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
        {t("title")}
      </h1>
      <p className="max-w-md text-muted-foreground">{t("description")}</p>
      <div className="flex gap-3">
        {userId ? (
          <Button asChild size="lg">
            <Link href={`/${locale}/account`}>{t("account")}</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href={`/${locale}/sign-up`}>{t("signUp")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/${locale}/sign-in`}>{t("signIn")}</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
