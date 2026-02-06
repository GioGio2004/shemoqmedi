import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// Note: Adjusted path to ".." since we moved this file into [locale]
import "../globals.css"; 
import { ClerkProvider } from "@/components/clerk-provider";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "shemoqmedi - web service | digitalise your business in couple of days ",
  description: "Handmade items from Georgia",
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
        <NextIntlClientProvider messages={messages}>
          <ClerkProvider>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}