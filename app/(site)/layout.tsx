import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/site/Footer";

// Analytics run on the public pages only. The (auth) pages are left out on
// purpose: /claim/<token> and the sign-in/sign-up redirect_url carry secret
// claim tokens, which must never reach a third-party dashboard.
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main id="main-content">{children}</main>
      <Footer />
      <Analytics />
      {/* Ahrefs Web Analytics: cookieless, no personal data */}
      <Script src="https://analytics.ahrefs.com/analytics.js" data-key="VjHihnlDJZ4C5YnUgPPQ/Q" strategy="lazyOnload" />
    </>
  );
}
