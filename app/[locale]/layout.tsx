import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import Script from "next/script";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { LOCALES, isLocale } from "@/lib/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Only needed on /ka pages, so it is not preloaded everywhere.
const georgian = Noto_Sans_Georgian({
  variable: "--font-ka",
  subsets: ["georgian"],
  weight: "variable",
  preload: false,
});

// Canonical host: Vercel redirects apex → www, so www is the origin that
// serves 200s. Keep NEXT_PUBLIC_URL=https://www.shemoqmedi.space in Vercel.
const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space";

// Pre-render every locale at build time (the landing page is fully static).
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(baseUrl),
    title: { default: t("title"), template: "%s | Shemoqmedi" },
    description: t("description"),
    applicationName: "Shemoqmedi",
    openGraph: {
      type: "website",
      locale,
      siteName: "Shemoqmedi",
      title: t("title"),
      description: t("description"),
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// No auth or data providers here: the public pages ship no client JS of
// their own. Clerk + Convex are mounted only in the (auth) route group.
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable}`}
      >
        {children}
        <Analytics />
        {/* Ahrefs Web Analytics: cookieless, no personal data */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="RO+0sybyEvM/+UpADUCBDA"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
