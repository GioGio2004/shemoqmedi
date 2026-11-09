import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { CONTACT_EMAIL, LEGAL_UPDATED } from "@/lib/legal";
import { SITE_URL, absoluteUrl } from "@/lib/site";

const title = "Terms and Conditions";
const description =
  "The rules for using Shemoqmedi: accounts, submitting sites, voting, the jury, awards and badges, listings and removal, and our responsibilities.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: infoOpenGraph("/terms", title, description),
};

export const dynamic = "force-static";

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const sections: InfoSection[] = [
  {
    id: "agreement",
    heading: "These terms",
    body: (
      <>
        <p>
          Shemoqmedi (shemoqmedi.space) is a website showcase and awards platform operated by an individual based in
          Georgia (&quot;we&quot;). By using the site or creating an account you agree to these terms. If you don&apos;t
          agree, please don&apos;t use Shemoqmedi.
        </p>
        <p>
          How we handle personal data is described in the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    heading: "Your account",
    body: (
      <p>
        You must be at least 16 to create an account. Give accurate details, use one account per person and keep your
        sign-in secure; you are responsible for what happens under your account. We may suspend or close accounts that
        break these terms.
      </p>
    ),
  },
  {
    id: "submissions",
    heading: "Submitting a site",
    body: (
      <>
        <p>
          You may only submit a site you made or worked on, or have permission to submit, and the screenshots, videos
          and text you upload must be yours to share. Credit the people who made it honestly.
        </p>
        <p>
          You keep all rights to your site and your material. By submitting, you give us a free, worldwide,
          non-exclusive licence to host, display, resize and publish that material on Shemoqmedi and in our own
          promotion of the site (for example on social media), with credit, for as long as the listing is online.
        </p>
        <p>
          Every submission is reviewed by hand. We decide which sites are listed, and may decline, edit (for example to
          fix a typo or a category) or remove a listing at any time.
        </p>
      </>
    ),
  },
  {
    id: "listings",
    heading: "Listed sites, claims and removal",
    body: (
      <>
        <p>
          We also list public websites we find, for editorial review and commentary, crediting their makers. If a
          listing is about your site, you can claim it through the link on its page or a claim link we send you, or ask
          us to correct or remove it at {mail}.
        </p>
        <p>
          Claim links are personal: don&apos;t share or forward them. A claim link can be used once; whoever uses it
          becomes the owner of what it points to. If a claim was made by the wrong person, tell us and we will put it
          right. Links from a listing to its website are marked nofollow until the listing is claimed.
        </p>
      </>
    ),
  },
  {
    id: "voting",
    heading: "Voting",
    body: (
      <>
        <p>
          Community voting is open to accounts with at least one of their own sites listed here. Each such account can score a site once while its voting window is open,
          and never a site it owns or created. Don&apos;t use more than one account, trade or buy votes, or use
          automated means to vote. We may remove votes and close accounts involved in manipulation, and recalculate
          the affected scores.
        </p>
        <p>
          Sites are judged in weekly batches: a site approved in one week is scored by the jury during the following
          week, then its voting closes. Awards are decided by the jury alone; community votes are shown for interest.
          We may change who can vote, and the number of jury votes a site needs, as the platform grows.
        </p>
      </>
    ),
  },
  {
    id: "jury",
    heading: "The jury",
    body: (
      <p>
        Jury membership is by invitation. Jurors agree to give honest, independent scores and comments, never to score
        sites they made, own or are paid to promote, and to keep comments respectful. Evaluations are published with
        the juror&apos;s name. We may remove a juror or an evaluation that doesn&apos;t meet these rules.
      </p>
    ),
  },
  {
    id: "awards",
    heading: "Scores and awards",
    body: (
      <p>
        Scores and awards are opinions of the jury and the community, calculated as described on{" "}
        <Link href="/how-we-score">How we score</Link>. They are not a guarantee of a site&apos;s quality, security or
        fitness for any purpose. We may correct scores or awards that were affected by an error or by manipulation.
      </p>
    ),
  },
  {
    id: "badges",
    heading: "Badges",
    body: (
      <p>
        If your site is a nominee or wins an award, you may display the matching Shemoqmedi badge on your own site,
        linking to your listing. Don&apos;t alter the badge, show one you didn&apos;t earn, or use our name in a way that
        suggests we endorse something we don&apos;t. We can withdraw the right to use a badge if an award is removed.
      </p>
    ),
  },
  {
    id: "conduct",
    heading: "Acceptable use",
    body: (
      <p>
        Don&apos;t submit anything unlawful, misleading, hateful or infringing; don&apos;t impersonate others; don&apos;t
        try to break, overload, scrape at scale or get around the security of the site; and don&apos;t use Shemoqmedi to
        send spam.
      </p>
    ),
  },
  {
    id: "ours",
    heading: "Our content",
    body: (
      <p>
        The Shemoqmedi name, logo, design, badges, jury notes and our own text belong to us. Listed websites and their
        screenshots remain the property of their creators.
      </p>
    ),
  },
  {
    id: "other-sites",
    heading: "Other websites",
    body: (
      <p>
        Listings link to websites we don&apos;t control. We are not responsible for their content, availability, or
        privacy practices; visit them at your own discretion.
      </p>
    ),
  },
  {
    id: "liability",
    heading: "Liability",
    body: (
      <>
        <p>
          Shemoqmedi is provided &quot;as is&quot;, free of charge, without warranties of any kind. We do our best to
          keep it available and accurate, but we don&apos;t promise it will be uninterrupted or error-free.
        </p>
        <p>
          To the extent the law allows, we are not liable for indirect or consequential losses, or for loss of profits,
          data or reputation arising from your use of the site. Nothing in these terms limits liability that cannot be
          limited by law.
        </p>
      </>
    ),
  },
  {
    id: "law",
    heading: "Law and changes",
    body: (
      <>
        <p>
          These terms are governed by the laws of Georgia, and disputes go to the courts of Georgia, unless the law of
          your country gives you the right to use your local courts.
        </p>
        <p>
          We may update these terms; the date below shows the current version, and significant changes are announced on
          the site. Continuing to use Shemoqmedi after a change means you accept it. Last updated {LEGAL_UPDATED}.
          Questions: {mail}.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": absoluteUrl("/terms"),
    url: absoluteUrl("/terms"),
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
        current="/terms"
        prelude="the"
        title="Terms"
        lede={`The rules for using Shemoqmedi, submitting sites, voting and the jury. Last updated ${LEGAL_UPDATED}.`}
        sections={sections}
      />
    </>
  );
}
