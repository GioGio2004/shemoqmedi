import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Shortlist } from "@/components/site/Shortlist";
import { Categories } from "@/components/site/Categories";
import { Awards } from "@/components/site/Awards";
import { Creators } from "@/components/site/Creators";
import { SubmitCta } from "@/components/site/SubmitCta";
import { Footer } from "@/components/site/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ka: `${BASE_URL}/ka`,
        en: `${BASE_URL}/en`,
        ru: `${BASE_URL}/ru`,
        "x-default": `${BASE_URL}/ka`,
      },
    },
  };
}

// Fully static: rendered once per locale at build time, served from the CDN.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar locale={locale} />
      <main>
        <Hero locale={locale} />
        <Shortlist locale={locale} />
        <Categories />
        <Awards />
        <Creators locale={locale} />
        <SubmitCta locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
