import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Note: Adjusted path to ".." since we moved this file into [locale]
import "../globals.css";
import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Analytics } from "@vercel/analytics/next"
import { GoogleOneTap } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://shemoqmedi.space';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getMessages({ locale });
  const messages = t as any; // Type assertion for easier access

  // Fallbacks in case messages are missing
  const title = messages?.Landing?.Hero?.title_1
    ? `${messages.Landing.Hero.title_1} - Shemoqmedi`
    : "Shemoqmedi - Digital Business Solutions";

  const description = messages?.Landing?.Hero?.subtitle
    ? messages.Landing.Hero.subtitle.substring(0, 160)
    : "Create a modern digital experience for your business with Shemoqmedi.";

  const keywords = locale === 'ka'
    ? ["შემოქმედი", "ვებგვერდი", "როგორ შევქმნათ ვებგვერდი", "ვებ დიზაინი", "საიტის დამზადება", "shemoqmedi", "website builder georgia"]
    : ["website builder", "web design", "digital transformation", "business website", "ecommerce", "shemoqmedi", "create website"];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | Shemoqmedi`
    },
    description: description,
    keywords: keywords,
    authors: [{ name: "Shemoqmedi Team" }],
    creator: "Shemoqmedi",
    openGraph: {
      type: "website",
      locale: locale,
      alternateLocale: locale === 'ka' ? 'en' : 'ka',
      url: `${baseUrl}/${locale}`,
      title: title,
      description: description,
      siteName: "Shemoqmedi",
      images: [
        {
          url: "/og-default.jpg", // Using the default OG image
          width: 1200,
          height: 630,
          alt: "Shemoqmedi",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["/og-default.jpg"],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'ka': `${baseUrl}/ka`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Viewport — locks mobile zoom/pan. interactiveWidget tells the browser
 * NOT to resize the layout viewport when the soft keyboard appears;
 * we handle height ourselves with 100dvh in the chat overlay.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({
  children,

  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // 1. Await params (required in newer Next.js versions)
  const { locale } = await params;

  // 2. Fetch messages for the current locale (en or ka)
  const messages = await getMessages();

  return (
    // 3. Set the HTML lang dynamically
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 4. Wrap everything in NextIntlClientProvider first */}
        <ClerkProvider>

          <GoogleOneTap />
          <NextIntlClientProvider messages={messages}>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}