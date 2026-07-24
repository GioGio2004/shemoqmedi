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
import { OrgWebsiteJsonLd } from "@/components/seo/JsonLd";

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

// CANONICAL HOST: must match the host that actually serves 200s. Vercel
// redirects apex → www, so www IS the canonical origin. A mismatch here
// (canonical/sitemap pointing at the redirecting apex) suppressed indexing
// for months — keep NEXT_PUBLIC_URL=https://www.shemoqmedi.space in Vercel.
const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space";

// Per-locale default metadata. Deliberately hardcoded (NOT sourced from
// messages/*.json): the old Landing.Hero-derived title/description served
// stale agency-era copy ("Digitalizing Georgian Business…") on every route.
// Tuned for the queries we actually want: digital menus + surprise bags /
// discounted food in Tbilisi.
const META_BY_LOCALE: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  en: {
    title: "VOLOO by Shemoqmedi — Digital Menus & Surprise Bags in Tbilisi",
    description:
      "AI-powered digital menus and surprise bags in Tbilisi — tap the table for a living menu, or grab discounted food from the city's best cafés before close.",
    keywords: [
      "digital menu",
      "NFC menu",
      "QR menu",
      "restaurant menu",
      "cafe menu",
      "AI menu concierge",
      "surprise bags Tbilisi",
      "surprise bag",
      "discounted food Tbilisi",
      "food waste Georgia",
      "hospitality technology",
      "Tbilisi",
      "Georgia",
      "shemoqmedi",
      "voloo",
    ],
  },
  ka: {
    title: "VOLOO — ციფრული მენიუ და სიურპრიზ ბოქსი თბილისში",
    description:
      "ციფრული მენიუ AI კონსიერჟით და სიურპრიზ ბოქსები — ფასდაკლებული საკვები თბილისის საუკეთესო კაფეებიდან. ერთი შეხება მაგიდაზე — აპლიკაციის გარეშე.",
    keywords: [
      "შემოქმედი",
      "ციფრული მენიუ",
      "NFC მენიუ",
      "QR მენიუ",
      "რესტორნის მენიუ",
      "კაფე მენიუ",
      "სიურპრიზ ბოქსი",
      "ფასდაკლებული საკვები თბილისი",
      "ხელოვნური ინტელექტი",
      "shemoqmedi",
      "digital menu georgia",
    ],
  },
  ru: {
    title: "VOLOO — цифровое меню и сюрприз-боксы в Тбилиси",
    description:
      "Цифровые меню с AI-консьержем и сюрприз-боксы — еда со скидкой из лучших кафе и ресторанов Тбилиси. Одно касание стола — без приложения и ожидания.",
    keywords: [
      "цифровое меню",
      "NFC меню",
      "QR меню",
      "меню ресторана",
      "меню кафе",
      "сюрприз-бокс",
      "еда со скидкой Тбилиси",
      "Тбилиси",
      "Грузия",
      "shemoqmedi",
      "voloo",
    ],
  },
};

const LOCALES = ["en", "ka", "ru"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description, keywords } =
    META_BY_LOCALE[locale] ?? META_BY_LOCALE.en;

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
      alternateLocale: LOCALES.filter((l) => l !== locale),
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
        {/* Site-wide Organization + WebSite JSON-LD (see components/seo/JsonLd.tsx).
            Page-level graphs reference these nodes by @id (#org / #site). */}
        <OrgWebsiteJsonLd locale={locale} />
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
