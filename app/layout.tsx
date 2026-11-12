import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Header } from "@/components/site/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Canonical host: lib/site.ts (www; Vercel redirects the apex there).
// The defaults below are the home page's: it sets no title of its own.
const title = "Shemoqmedi: Website Awards & Web Design Inspiration";
const description =
  "The best websites, scored by a jury and the community. Web design inspiration and website awards: Site of the Day, Best Solo Creation, Honorable Mention.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description,
  applicationName: SITE_NAME,
  // Defaults for pages that set no openGraph: Next fills og:title and
  // og:description from the page's own title and description, and the image
  // comes from app/opengraph-image.tsx. No url, title or description here:
  // they would label every such page as the home page. A page that sets
  // openGraph replaces this whole object (Next merges metadata one key deep),
  // so it must repeat siteName, locale, type and images itself.
  openGraph: { type: "website", locale: "en_US", siteName: SITE_NAME },
  // Title, description and image are copied from each page's openGraph.
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// No auth or data providers here: public pages ship no client JS of their
// own. Clerk + Convex are mounted only in the (auth) route group.
// The one Header lives here, above every route group, so the navbar (and
// the crow in it) stays put across all pages, log-in and account included.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior: Next turns the smooth scrolling from globals.css off
    // during page changes, so a new page opens at the top instead of gliding up.
    <html lang="en" data-scroll-behavior="smooth">
      <body className={inter.variable}>
        <Header />
        {children}
        {/* Cloudflare Web Analytics: cookieless page views, loaded after the page is interactive. */}
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "83618e259266450a8201ab6e959d52e5"}'
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
