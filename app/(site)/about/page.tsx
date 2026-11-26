import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

const title = "About Shemoqmedi: Website Awards Made in Georgia";
const description =
  "Shemoqmedi is a website awards and web design inspiration platform. Every site is reviewed by hand, then scored by an independent jury on design, usability, creativity and content.";

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
          Anyone can <Link href="/submit">submit a website</Link>, free of charge, in{" "}
          <Link href="#submit">one of two ways</Link>. The jury reviews every submission by hand before it appears.
          Sites that are unfinished, broken or not original are declined with a short note explaining why.
        </p>
        <p>
          Approved sites go live in weekly batches, and the jury scores each batch the following week on four weighted
          pillars: design, usability, creativity and content. Jurors never score their own sites or their
          company&apos;s. The best sites win <Link href="/collections/hm">Honorable Mention</Link> and{" "}
          <Link href="/site-of-the-day">Site of the Day</Link> (one a day), then{" "}
          <Link href="/collections/sotm">Site of the Month</Link> and{" "}
          <Link href="/collections/soty">Site of the Year</Link>. The details are on{" "}
          <Link href="/how-we-score">How we score</Link>.
        </p>
      </>
    ),
  },
  {
    id: "submit",
    heading: "Two ways to submit a website",
    body: (
      <>
        <p>Submitting is free either way, and every site gets the same review and the same jury.</p>
        <ul className="grid list-disc gap-3 pl-5 marker:text-black/30">
          <li>
            <strong>The 30-second form.</strong> Give us the site&apos;s name, its address and your email. No account
            is needed. Our editors prepare the listing for you: the description, the credits and the screenshots.{" "}
            <Link href="/submit">Open the 30-second form</Link>.
          </li>
          <li>
            <strong>The full form.</strong> With a free account you write the listing yourself: a short description,
            categories, the technologies the site is built with, who made it, your own screenshots and an optional
            preview video. <Link href="/submit/full">Open the full form</Link>.
          </li>
        </ul>
        <p>
          You can also start with the first and finish with the second. After a 30-second submission, create an
          account with the same email and add the details yourself: it stays one submission, not two. An account also
          lets you follow your site from review to results and read your jury scores when voting closes.
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
        lede="Website awards and web design inspiration. Every site reviewed by hand, then scored by an independent jury."
        sections={sections}
      />
    </>
  );
}
