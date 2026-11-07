import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Canonical host: Vercel redirects apex → www, so www is the origin that
// serves 200s. Keep NEXT_PUBLIC_URL=https://www.shemoqmedi.space in Vercel.
const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.shemoqmedi.space";

const title = "Shemoqmedi: the web's finest websites";
const description =
  "A curated showcase of the best websites on the web, submitted by the people who built them.";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: title, template: "%s | Shemoqmedi" },
  description,
  applicationName: "Shemoqmedi",
  openGraph: { type: "website", locale: "en", siteName: "Shemoqmedi", title, description },
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
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
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
