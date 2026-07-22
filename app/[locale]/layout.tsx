import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Noto_Sans_Georgian,
} from "next/font/google";
// Note: Adjusted path to ".." since we moved this file into [locale]
import "../globals.css";
import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import CustomScrollIndicator from "@/components/layout/CustomScrollIndicator";
import GoogleOneTapMount from "@/components/auth/GoogleOneTapMount";
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/motion/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// RULED display voice (spec §1.2). Space Grotesk has no Georgian glyphs —
// Noto Sans Georgian is the declared fallback for the ka locale on every
// tier (see --v-font-* stacks in globals.css).
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

const georgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: "variable",
  variable: "--font-ka",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getMessages({ locale });
  const messages = t as any; // Type assertion for easier access

  // Fallbacks in case messages are missing
  const title = messages?.Landing?.Hero?.title_1
    ? `${messages.Landing.Hero.title_1} - Shemoqmedi`
    : "Shemoqmedi — AI-Powered Digital Menus for Hospitality";

  const description = messages?.Landing?.Hero?.subtitle
    ? messages.Landing.Hero.subtitle.substring(0, 160)
    : "NFC digital menus with an AI concierge for cafés and restaurants in Georgia. One tap on the table — no app, no wait.";

  const keywords =
    locale === "ka"
      ? [
          "შემოქმედი",
          "ციფრული მენიუ",
          "NFC მენიუ",
          "QR მენიუ",
          "რესტორნის მენიუ",
          "კაფე მენიუ",
          "ხელოვნური ინტელექტი",
          "shemoqmedi",
          "digital menu georgia",
        ]
      : [
          "digital menu",
          "NFC menu",
          "QR menu",
          "restaurant menu",
          "cafe menu",
          "AI menu concierge",
          "hospitality technology",
          "Tbilisi",
          "Georgia",
          "shemoqmedi",
        ];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | Shemoqmedi`,
    },
    description: description,
    keywords: keywords,
    authors: [{ name: "Shemoqmedi Team" }],
    creator: "Shemoqmedi",
    openGraph: {
      type: "website",
      locale: locale,
      alternateLocale: locale === "ka" ? "en" : "ka",
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
        en: `${baseUrl}/en`,
        ka: `${baseUrl}/ka`,
        ru: `${baseUrl}/ru`,
        "x-default": `${baseUrl}/en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    manifest: "/site.webmanifest",
    applicationName: "VOLOO by Shemoqmedi",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "VOLOO",
    },
    formatDetection: {
      telephone: false,
    },
  };
}

/**
 * Viewport — interactiveWidget tells the browser NOT to resize the layout
 * viewport when the soft keyboard appears; we handle height ourselves with
 * 100dvh in the chat overlay. Pinch-zoom stays enabled for accessibility.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default async function RootLayout({
  children,

  params,
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
    <html lang={locale} className="bg-[#0a0a0a]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${georgian.variable} antialiased bg-[#0a0a0a] text-zinc-100`}
      >
        {/* 4. Wrap everything in NextIntlClientProvider first */}
        <ClerkProvider>
          {/* Google One Tap for returning consumers — [locale] tree only
              (the /t NFC tree has its own root layout and never mounts it);
              suppressed on menu/auth routes inside the component. */}
          <GoogleOneTapMount />
          <NextIntlClientProvider messages={messages}>
            <ConvexClientProvider>
              <CustomScrollIndicator />
              <CustomCursor />
              {/* Lenis smooth scroll — landing routes only, desktop pointer-
                  fine only, wired to ScrollTrigger via the standard
                  lenis.on("scroll", ScrollTrigger.update) pattern. */}
              <SmoothScroll>{children}</SmoothScroll>
            </ConvexClientProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
        <Analytics />
        {/* Ahrefs Web Analytics — cookieless, no personal data */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="RO+0sybyEvM/+UpADUCBDA"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
