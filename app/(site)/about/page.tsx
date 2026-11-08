import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { LIMITS, VOTING_DAYS } from "@/lib/taxonomy";

const title = "About Shemoqmedi: Website Awards Made in Georgia";
const description =
  "Shemoqmedi is a website awards and web design inspiration platform. Every site is reviewed by hand, then scored by a jury and the community on design, usability, creativity and code.";

export const metadata: Metadata = {
  // Absolute: the brand is already in it, so no " | Shemoqmedi" suffix.
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: infoOpenGraph("/about", title, description),
};

export const dynamic = "force-static";

const sections: InfoSection[] = [
  {
    id: "name",
    heading: "The name",
    body: (
      <>
        <p>
          <strong>Shemoqmedi</strong> (შემოქმედი) is Georgian for <em>creator</em>. The platform is made in Georgia
          and built for the people who make websites: designers, developers and studios, whether they work alone or
          in a team of fifty.
        </p>
        <p>
          It is a showcase and an awards programme in one. The listed websites do the talking: every page is built
          around their screenshots, with as little of our own design in the way as possible.
        </p>
      </>
    ),
  },
  {
    id: "how-it-works",
    heading: "How a site gets listed",
    body: (
      <>
        <p>
          Anyone can <Link href="/submit">submit a website</Link>. The jury reviews every submission by hand before it
          appears. Sites that are unfinished, broken or not original are declined with a short note explaining why.
        </p>
        <p>
          Approved sites go live with a {VOTING_DAYS}-day voting window, extended once by{" "}
          {LIMITS.votingExtensionDays} days if fewer than {LIMITS.juryMinEvaluations} jurors have scored it. During that
          time the jury gives its score and creators with a Shemoqmedi badge score the site on four pillars: design,
          usability, creativity and code. Nobody can score their own site. When the window
          closes, the best sites win <Link href="/collections/sotd">Site of the Day</Link>,{" "}
          <Link href="/collections/bsc">Best Solo Creation</Link> or{" "}
          <Link href="/collections/hm">Honorable Mention</Link>. The details are on{" "}
          <Link href="/how-we-score">How we score</Link>.
        </p>
      </>
    ),
  },
  {
    id: "creators",
    heading: "For creators",
    body: (
      <>
        <p>
          Every listing credits the people who made it and links to their own website. Each creator gets a{" "}
          <Link href="/creators">profile page</Link> that collects their sites, scores and awards, and can claim it to
          manage it.
        </p>
        <p>
          Award winners and nominees can show a <Link href="/badges">badge</Link> on their site that links back to
          their scores. Featured websites remain the property of their creators. To request a correction or removal,
          use the Claim button on the listing.
        </p>
      </>
    ),
  },
  {
    id: "georgia",
    heading: "Georgian web design, next to the world's",
    body: (
      <p>
        Shemoqmedi lists websites from everywhere, and it gives Georgian web design a stage next to the best
        international work. Georgian and international sites are judged by the same jury on the same four pillars.
        Browse <Link href="/collections/georgia">websites from Georgia</Link>, or read about them{" "}
        <Link href="/ka" hrefLang="ka">
          in Georgian
        </Link>
        .
      </p>
    ),
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": absoluteUrl("/about"),
    url: absoluteUrl("/about"),
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <InfoPage
        current="/about"
        prelude="about"
        title={SITE_NAME}
        lede="Website awards and web design inspiration. Every site reviewed by hand, then scored by a jury and the community."
        sections={sections}
      />
    </>
  );
}
