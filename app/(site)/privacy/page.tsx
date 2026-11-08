import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const title = "Privacy Policy";
const description =
  "How Shemoqmedi collects, uses and protects personal data: accounts, submissions, votes, jury profiles, analytics without cookies, and your rights.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy" },
  openGraph: infoOpenGraph("/privacy", title, description),
};

export const dynamic = "force-static";

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const sections: InfoSection[] = [
  {
    id: "who",
    heading: "Who we are",
    body: (
      <>
        <p>
          Shemoqmedi (shemoqmedi.space) is a website showcase and awards platform, operated by an individual based in
          Georgia. In this policy &quot;we&quot; means the operator of Shemoqmedi, who decides how the personal data
          described here is used (the data controller).
        </p>
        <p>
          Questions, requests and complaints about personal data: {mail}. We answer within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    heading: "What we collect",
    body: (
      <>
        <p>
          <strong>Your account.</strong> When you sign up we receive your name, email address and profile photo, and
          the sign-in method you used (email and password, or Google). Passwords are handled by our sign-in provider;
          we never see them.
        </p>
        <p>
          <strong>Sites you submit.</strong> The site&apos;s address, title, description, categories, technologies,
          the credits (creator or studio name and website), and the screenshots and video you upload. Once a site is
          approved, this information is public.
        </p>
        <p>
          <strong>Votes.</strong> The scores you give a site are stored with your account so each account can vote
          once. Only the averages and the number of votes are public; we don&apos;t publish who voted or how.
        </p>
        <p>
          <strong>Claims and removal requests.</strong> Your message and any proof link you send us.
        </p>
        <p>
          <strong>Jury members.</strong> Your jury profile (name, role, panel, location, website, LinkedIn, bio and
          photo) and your evaluations, which are published with your name on each site&apos;s page. Before a profile
          is claimed we may prepare it from publicly available information and keep an email address to send you the
          claim link. Unclaimed profiles are private: they are not shown on the site or to search engines.
        </p>
        <p>
          <strong>Creators of listed sites.</strong> We list public websites for editorial review and credit the
          people and studios who made them, using information they published themselves (such as a name and website).
          You can claim your listing or profile, or ask us to correct or remove it.
        </p>
        <p>
          <strong>Usage statistics.</strong> We measure visits with Vercel Web Analytics and Ahrefs Web Analytics.
          Both work without cookies and report aggregated figures (pages viewed, referrers, countries, device types);
          we don&apos;t use them to build profiles of individual visitors.
        </p>
        <p>
          <strong>Technical data.</strong> Our hosting and service providers process IP addresses and request details
          to deliver the site, keep it secure and prevent abuse.
        </p>
      </>
    ),
  },
  {
    id: "use",
    heading: "Why we use it",
    body: (
      <>
        <p>We use personal data only to run Shemoqmedi:</p>
        <ul className="grid list-disc gap-2 pl-5">
          <li>to create and secure your account and let you sign in (to provide the service you asked for);</li>
          <li>to review, publish and score submitted sites, and to show jury evaluations (to provide the service);</li>
          <li>to prevent fake accounts, vote manipulation and other abuse (our legitimate interest in fair awards);</li>
          <li>
            to list and credit public websites and their makers for editorial review and commentary (our legitimate
            interest; you can object at any time);
          </li>
          <li>to send you claim links and messages about your listing or jury role;</li>
          <li>to understand how the site is used, from aggregated statistics, and improve it.</li>
        </ul>
        <p>We don&apos;t sell personal data, and we don&apos;t use it for advertising.</p>
      </>
    ),
  },
  {
    id: "public",
    heading: "What is public",
    body: (
      <p>
        Approved listings (screenshots, description and credits), creator profiles, claimed jury profiles, jury
        evaluations with the juror&apos;s name, and award results are public and can be indexed by search engines. When
        we publish or update a page we notify search engines through IndexNow; that sends only the page address.
      </p>
    ),
  },
  {
    id: "providers",
    heading: "Who processes it for us",
    body: (
      <>
        <p>We use these service providers, who process data on our behalf and under their own security commitments:</p>
        <ul className="grid list-disc gap-2 pl-5">
          <li>Vercel: hosting and aggregated, cookieless visit statistics;</li>
          <li>Clerk: accounts and sign-in (and Google, if you choose to sign in with Google);</li>
          <li>Convex: the database that stores accounts, listings, votes, claims and jury data;</li>
          <li>ImageKit: storage and delivery of screenshots and photos;</li>
          <li>Cloudflare R2: storage and delivery of preview videos;</li>
          <li>Resend: sending emails such as jury claim links;</li>
          <li>Ahrefs: aggregated, cookieless visit statistics.</li>
        </ul>
        <p>
          Some of these providers store or process data outside Georgia, including in the United States and the
          European Union. We rely on their contractual safeguards for these transfers.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: (
      <p>
        We only use the cookies that sign-in needs: they keep you signed in and protect your account, and are set when
        you sign in or create an account. We use no advertising or tracking cookies, and our analytics work without
        cookies, so there is nothing to opt in to.
      </p>
    ),
  },
  {
    id: "retention",
    heading: "How long we keep it",
    body: (
      <>
        <p>
          We keep your account data while your account exists. When you delete your account, your account record is
          deleted; scores you gave remain only as part of each site&apos;s anonymous averages.
        </p>
        <p>
          Published listings and jury evaluations stay online as part of the public awards record until they are
          removed at the owner&apos;s or juror&apos;s request, or by us. Claim and removal requests are kept while they
          are relevant to the listing they concern.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    heading: "Your rights",
    body: (
      <>
        <p>
          You can ask us to tell you what personal data we hold about you and give you a copy, correct it, delete it,
          restrict or object to how we use it, or move it to another service. You can also withdraw any consent you
          gave. Write to {mail}; we may ask you to confirm your identity first.
        </p>
        <p>
          You can also complain to the Personal Data Protection Service of Georgia, or, if you live in the European
          Union or the United Kingdom, to your local data protection authority.
        </p>
      </>
    ),
  },
  {
    id: "children",
    heading: "Children",
    body: <p>Shemoqmedi is not meant for children. You must be at least 16 to create an account.</p>,
  },
  {
    id: "changes",
    heading: "Changes",
    body: (
      <p>
        We will update this policy when the way we handle data changes, and change the date below. Significant changes
        are announced on the site. This version was last updated on {LEGAL_UPDATED}. See also the{" "}
        <Link href="/terms">Terms</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/privacy"),
    url: absoluteUrl("/privacy"),
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "en",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <InfoPage
        current="/privacy"
        prelude="our"
        title="Privacy"
        lede={`What we collect, why, who processes it, and your rights. Last updated ${LEGAL_UPDATED}.`}
        sections={sections}
      />
    </>
  );
}
