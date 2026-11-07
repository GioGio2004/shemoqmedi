import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Georgian } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const georgian = Noto_Sans_Georgian({
  variable: "--font-ka",
  subsets: ["georgian"],
  weight: "variable",
});

// Canonical host: Vercel redirects apex → www, so www is the origin that
// serves 200s. Keep NEXT_PUBLIC_URL=https://www.shemoqmedi.space in Vercel.
const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space";

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
  themeColor: "#0a0a0a",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${georgian.variable} font-sans antialiased`}
      >
        <ClerkProvider>
          <NextIntlClientProvider messages={messages}>
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
        <Analytics />
        {/* Ahrefs Web Analytics: cookieless, no personal data */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="RO+0sybyEvM/+UpADUCBDA"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
