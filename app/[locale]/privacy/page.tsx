import type { Metadata } from "next";
import Link from "next/link";

// ⚙️  Update these two lines with your exact registration details before launch.
const OPERATOR = "Saba Khvichia — Individual Entrepreneur (ინდ. მეწარმე), registered in Georgia";
const CONTACT_EMAIL = "hello@shemoqmedi.space";
const UPDATED = "19 July 2026";

// Must match the serving host (www) — see canonical-host note in [locale]/layout.tsx.
const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.shemoqmedi.space";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Privacy Policy",
    description:
      "How Shemoqmedi collects, uses, and protects personal data — for café/restaurant partners and diners. Georgian law + GDPR-aligned.",
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        en: `${BASE_URL}/en/privacy`,
        ka: `${BASE_URL}/ka/privacy`,
        ru: `${BASE_URL}/ru/privacy`,
        "x-default": `${BASE_URL}/en/privacy`,
      },
    },
    robots: { index: true, follow: true },
  };
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-white mt-10 mb-3">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="text-xs tracking-widest uppercase text-zinc-500 hover:text-white transition-colors">
          ← Shemoqmedi
        </Link>
        <h1 className="text-4xl font-bold text-white mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500">Last updated: {UPDATED}</p>

        <p className="mt-8 leading-relaxed">
          This Privacy Policy explains how <strong className="text-white">Shemoqmedi</strong> (“we”, “us”),
          operated by {OPERATOR}, collects, uses, and protects personal data when you use our website
          <span className="text-white"> shemoqmedi.space</span>, our NFC/QR digital menus, and the AI features within
          them (the “Service”). We are committed to the Law of Georgia on Personal Data Protection and, for visitors in
          the European Economic Area, to the standards of the EU General Data Protection Regulation (GDPR).
        </p>

        <H>Who this applies to</H>
        <p className="leading-relaxed">
          The Service has two kinds of users: <strong className="text-white">venue partners</strong> (café and restaurant
          managers we invite and onboard) and <strong className="text-white">diners</strong> (guests who open a venue’s
          menu). Diners do not create accounts.
        </p>

        <H>What we collect</H>
        <ul className="list-disc pl-5 space-y-2 leading-relaxed">
          <li>
            <strong className="text-white">Venue partners:</strong> name, email, and organization details, handled through
            our authentication provider (Clerk). Partner access is invite-only.
          </li>
          <li>
            <strong className="text-white">Diners:</strong> an anonymous device identifier generated in your browser’s
            local storage. If you tell the AI about dietary needs or allergies, those preferences are stored
            <strong className="text-white"> on your device</strong> and are only sent to power your recommendations — see
            “Health-related data” below.
          </li>
          <li>
            <strong className="text-white">Conversations &amp; orders:</strong> messages you send to the in-menu AI, and the
            items, table/seat, and totals of any order you place. We do not store your payment card details — card
            payments (for partners’ subscriptions) are handled by our payment processor.
          </li>
          <li>
            <strong className="text-white">Automatically:</strong> basic, privacy-friendly analytics (Ahrefs Web
            Analytics, which uses <strong className="text-white">no cookies and no personal data</strong>, and Vercel
            Analytics), plus standard technical data such as browser type and approximate region. A single functional
            session cookie is used to keep a dine-in table session working.
          </li>
          <li>
            <strong className="text-white">Venue public data:</strong> publicly available Google Business Profile
            information (name, rating, reviews count, hours, location) to enrich venue pages.
          </li>
        </ul>

        <H>How we use it</H>
        <p className="leading-relaxed">
          To provide and operate the Service; to power AI menu recommendations; to improve the quality of our AI; to
          process partners’ subscriptions; to keep the Service secure and prevent abuse; and to understand aggregate,
          anonymous usage.
        </p>

        <H>Legal bases (GDPR)</H>
        <p className="leading-relaxed">
          We rely on: <strong className="text-white">performance of a contract</strong> (to run the Service for partners
          and diners), <strong className="text-white">consent</strong> (for any health-related dietary data and for using
          conversations to improve our AI), and <strong className="text-white">legitimate interests</strong> (security,
          abuse prevention, and aggregate analytics that do not identify you).
        </p>

        <H>Health-related data (allergies &amp; dietary needs)</H>
        <p className="leading-relaxed">
          Allergy and dietary information is a special category of personal data. We only process it with your explicit
          consent, we keep it <strong className="text-white">on your device</strong> by default, and we send it only
          transiently to generate your recommendations. You can clear it at any time by clearing your browser data.
          Allergen information shown in a menu is provided by the venue — always confirm with staff before ordering if you
          have a serious allergy.
        </p>

        <H>Using conversations to improve our AI</H>
        <p className="leading-relaxed">
          With your consent, anonymized excerpts of menu conversations may be used to improve our AI models. We take steps
          to remove personal identifiers before this use. You may decline, and doing so does not affect your ability to
          use the menu.
        </p>

        <H>Cookies &amp; local storage</H>
        <p className="leading-relaxed">
          We use one functional, httpOnly session cookie for dine-in table sessions, and your browser’s local storage to
          remember your anonymous ID and any preferences you set. Our analytics (Ahrefs) is cookieless. We do not use
          advertising or cross-site tracking cookies.
        </p>

        <H>Who we share data with (processors)</H>
        <p className="leading-relaxed">
          We use trusted service providers who process data on our behalf: <strong className="text-white">Clerk</strong>{" "}
          (authentication), <strong className="text-white">Convex</strong> (database &amp; backend),
          <strong className="text-white"> Google</strong> (Gemini AI and Maps/Places),
          <strong className="text-white"> ImageKit</strong> (image hosting), <strong className="text-white">Resend</strong>{" "}
          (transactional email), <strong className="text-white">Upstash</strong> (rate limiting),
          <strong className="text-white"> Flitt</strong> (card payments for partner subscriptions),
          <strong className="text-white"> Ahrefs</strong> and <strong className="text-white">Vercel</strong> (analytics &amp;
          hosting). We do not sell your personal data.
        </p>

        <H>International transfers</H>
        <p className="leading-relaxed">
          Some providers are located outside Georgia and the EEA. Where personal data is transferred internationally, we
          rely on appropriate safeguards such as the European Commission’s Standard Contractual Clauses.
        </p>

        <H>Retention</H>
        <p className="leading-relaxed">
          We keep partner account data for as long as the partnership is active. Diner chat and session data are retained
          only as long as needed to operate the Service and are then deleted or anonymized. On-device preferences remain
          on your device until you clear them.
        </p>

        <H>Your rights</H>
        <p className="leading-relaxed">
          Under Georgian law and the GDPR you have the right to access, correct, delete, restrict, or object to the
          processing of your personal data, to data portability, and to withdraw consent at any time. You may also lodge a
          complaint with the <strong className="text-white">Personal Data Protection Service of Georgia</strong>, or your
          local EEA supervisory authority. To exercise any right, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline underline-offset-4">{CONTACT_EMAIL}</a>.
        </p>

        <H>Children</H>
        <p className="leading-relaxed">
          The Service is not directed at children under 16 and we do not knowingly collect their personal data.
        </p>

        <H>Security</H>
        <p className="leading-relaxed">
          We use industry-standard measures to protect personal data, including access controls and encryption in transit.
          No method of transmission is perfectly secure, but we work to protect your information.
        </p>

        <H>Changes</H>
        <p className="leading-relaxed">
          We may update this policy from time to time. Material changes will be reflected by the “Last updated” date above.
        </p>

        <H>Contact</H>
        <p className="leading-relaxed">
          Questions or requests: <a href={`mailto:${CONTACT_EMAIL}`} className="text-white underline underline-offset-4">{CONTACT_EMAIL}</a>,
          Tbilisi, Georgia.
        </p>

        <div className="mt-14 pt-6 border-t border-white/10 flex gap-6 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
