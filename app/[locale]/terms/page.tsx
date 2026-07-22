import type { Metadata } from "next";
import Link from "next/link";

// ⚙️  Update these with your exact registration details before launch.
const OPERATOR = "Saba Khvichia — Individual Entrepreneur (ინდ. მეწარმე), registered in Georgia";
const CONTACT_EMAIL = "hello@shemoqmedi.space";
const UPDATED = "19 July 2026";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Terms & Conditions",
    description:
      "The terms governing use of Shemoqmedi's NFC digital menus, AI features, and partner subscriptions. Governed by Georgian law.",
    alternates: { canonical: `${BASE_URL}/${locale}/terms` },
    robots: { index: true, follow: true },
  };
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white mt-10 mb-3">{children}</h2>;
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="text-xs tracking-widest uppercase text-zinc-500 hover:text-white transition-colors">
          ← Shemoqmedi
        </Link>
        <h1 className="text-4xl font-bold text-white mt-6 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-zinc-500">Last updated: {UPDATED}</p>

        <p className="mt-8 leading-relaxed">
          These Terms govern your use of <strong className="text-white">Shemoqmedi</strong> (the “Service”), operated by{" "}
          {OPERATOR} (“we”, “us”). By using the Service you agree to these Terms. If you do not agree, please do not use
          the Service.
        </p>

        <H>The Service</H>
        <p className="leading-relaxed">
          Shemoqmedi provides NFC/QR digital menus, an in-menu AI assistant, and table-ordering tools for cafés and
          restaurants (“Venues”), together with a management dashboard for Venue partners. We are a{" "}
          <strong className="text-white">technology provider</strong>. Food, drinks, prices, and service are provided by
          the Venue, not by us.
        </p>

        <H>Accounts &amp; access</H>
        <p className="leading-relaxed">
          Venue partner accounts are created by invitation only and are managed through our authentication provider. You
          are responsible for keeping your credentials secure. Diners use the menus without an account.
        </p>

        <H>Menus, prices &amp; allergens</H>
        <p className="leading-relaxed">
          Menu content, pricing, availability, and allergen/dietary information are supplied and controlled by each Venue.
          We do not verify their accuracy. <strong className="text-white">If you have a food allergy or intolerance, always
          confirm with Venue staff before ordering</strong> — do not rely solely on the menu or the AI assistant.
        </p>

        <H>Orders</H>
        <p className="leading-relaxed">
          When you place an order through a menu, you are ordering from the Venue. The contract for the food and drink is
          between you and the Venue. We pass your order to the Venue but are not responsible for its preparation,
          fulfilment, quality, or any payment made in person at the Venue.
        </p>

        <H>The AI assistant</H>
        <p className="leading-relaxed">
          The in-menu AI provides suggestions generated automatically. It may be inaccurate or incomplete and should not
          be relied upon for allergy, health, or dietary safety. Recommendations are not professional advice.
        </p>

        <H>Partner subscriptions &amp; payments</H>
        <p className="leading-relaxed">
          Venue partners may subscribe to paid plans. Recurring card payments are processed by our payment provider
          (Flitt); we do not store full card details. Fees, billing cycles, and cancellation terms are those agreed at
          sign-up. Taxes apply as required by Georgian law.
        </p>

        <H>Acceptable use</H>
        <p className="leading-relaxed">
          You agree not to misuse the Service: no attempts to breach security or access data you are not authorized to
          access, no automated abuse of the AI or ordering systems, no unlawful, harmful, or infringing content, and no
          interference with the Service’s operation.
        </p>

        <H>Intellectual property</H>
        <p className="leading-relaxed">
          The Service, including its software, design, and branding, is owned by us or our licensors. Venues retain rights
          to their own menu content and brand assets, and grant us the licence needed to display them within the Service.
        </p>

        <H>Disclaimers &amp; limitation of liability</H>
        <p className="leading-relaxed">
          The Service is provided “as is” without warranties of any kind. To the maximum extent permitted by law, we are
          not liable for indirect or consequential losses, for the acts or omissions of any Venue, or for issues arising
          from menu accuracy, allergens, food quality, or order fulfilment. Nothing in these Terms excludes liability that
          cannot be excluded under applicable law.
        </p>

        <H>Changes</H>
        <p className="leading-relaxed">
          We may update these Terms; material changes will be reflected by the “Last updated” date above. Continued use of
          the Service means you accept the updated Terms.
        </p>

        <H>Governing law</H>
        <p className="leading-relaxed">
          These Terms are governed by the laws of Georgia, and disputes are subject to the jurisdiction of the competent
          courts of Georgia, without prejudice to any mandatory consumer protections available to you.
        </p>

        <H>Contact</H>
        <p className="leading-relaxed">
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline underline-offset-4">{CONTACT_EMAIL}</a>,
          Tbilisi, Georgia.
        </p>

        <div className="mt-14 pt-6 border-t border-white/10 flex gap-6 text-sm text-zinc-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
