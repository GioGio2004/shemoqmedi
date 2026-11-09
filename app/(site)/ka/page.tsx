import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_Georgian } from "next/font/google";
import { PageHero } from "@/components/listing/PageHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PillLink } from "@/components/site/ui";
import { MIN_INDEXABLE } from "@/lib/collections";
import { getPublicListings } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { AWARD_RULES } from "@/lib/taxonomy";

// The one Georgian page: a hand-written landing page for Georgian searches
// ("საუკეთესო ქართული საიტები"), listing the sites made in Georgia. The rest
// of the site is English only. Its English counterpart is
// /collections/georgia; both declare each other with hreflang.

// Inter has no Georgian glyphs: Latin text (site titles) stays in Inter and
// Georgian falls through to Noto Sans Georgian.
const georgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  weight: "variable",
  display: "swap",
  variable: "--font-georgian",
});

const year = () => new Date().getFullYear();
const title = `საუკეთესო ქართული ვებსაიტები და ვებ დიზაინი (${year()})`;
const description =
  "საქართველოში შექმნილი საუკეთესო ვებსაიტები: ხელით შერჩეული და შეფასებული ჟიურისა და საზოგადოების მიერ დიზაინის, მოხმარების სიმარტივის, კრეატიულობისა და კოდის მიხედვით.";

export async function generateMetadata(): Promise<Metadata> {
  // Paired with /collections/georgia only while that page is indexable.
  const paired = (await getPublicListings()).filter((l) => l.region === "georgia").length >= MIN_INDEXABLE;
  return {
    title,
    description,
    alternates: {
      canonical: "/ka",
      ...(paired
        ? { languages: { ka: "/ka", en: "/collections/georgia", "x-default": "/collections/georgia" } }
        : {}),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "ka_GE",
      alternateLocale: ["en_US"],
      url: "/ka",
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Shemoqmedi: the web's finest websites" }],
    },
  };
}

export const dynamic = "force-static";
export const revalidate = 300;

const AWARDS = [
  {
    name: "საპატიო მოხსენიება",
    en: "Honorable Mention",
    rule: "ყოველი საიტი, რომელიც კვირის ჯგუფში 6.5 ან მეტ ქულას იღებს (ვერცხლის ყვავი).",
  },
  {
    name: "დღის საიტი",
    en: "Site of the Day",
    rule: "7.0 ან მეტი ქულის საიტები რიგში დგებიან; ყოველდღე ერთი საიტი იმარჯვებს და მხოლოდ ერთხელ (შავი ყვავი).",
  },
  { name: "თვის საიტი", en: "Site of the Month", rule: "თვის დღის საიტებიდან საუკეთესო, ჟიურის ხელახალი შეფასებით (წითელი ყვავი)." },
  { name: "წლის საიტი", en: "Site of the Year", rule: "წლის თორმეტი თვის საიტიდან საუკეთესო, იანვარში (ოქროს ყვავი)." },
  {
    name: "საუკეთესო სოლო ნამუშევარი",
    en: "Best Solo Creation",
    rule: "8.2 ან მეტი ქულა საიტისთვის, რომელიც ერთმა ადამიანმა შექმნა.",
  },
];

const section = "grid gap-4 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16";
const h2 = "text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.02em] md:col-span-4";
const prose =
  "grid max-w-2xl gap-4 text-[15px] leading-relaxed text-black/70 md:col-span-8 [&_a]:text-black [&_a]:underline [&_a]:decoration-black/25 [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-black";

export default async function GeorgianPage() {
  const listings = (await getPublicListings()).filter((l) => l.region === "georgia");
  const url = absoluteUrl("/ka");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        description,
        inLanguage: "ka",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: listings.length,
          itemListElement: listings.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/sites/${l.slug}`),
            name: l.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "მთავარი", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "ქართული ვებსაიტები", item: url },
        ],
      },
    ],
  };

  return (
    <div
      lang="ka"
      className={georgian.variable}
      style={{ fontFamily: "var(--font-inter), var(--font-georgian), ui-sans-serif, system-ui, sans-serif" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        eyebrow="საუკეთესო ქართული ვებსაიტები"
        prelude="საქართველოში შექმნილი"
        title="ვებ დიზაინი"
        titleClassName="text-[clamp(2.75rem,9vw,9rem)] leading-[0.95] tracking-[-0.03em]"
        lede="ვებსაიტები, რომლებიც საქართველოში შეიქმნა: ყოველი მათგანი ხელით შერჩეული და შეფასებულია ჟიურისა და საზოგადოების მიერ."
        meta={`${listings.length} ვებსაიტი`}
        action={<PillLink href="/submit">გამოგზავნე საიტი</PillLink>}
      />

      <section aria-label="საქართველოში შექმნილი ვებსაიტები" className="container-site pb-16">
        <ListingGrid listings={listings} emptyTitle="ქართული საიტები მალე დაემატება." />
        <p className="mt-10 text-sm">
          <Link
            href="/collections/georgia"
            hrefLang="en"
            className="underline decoration-black/25 underline-offset-4 hover:decoration-black"
          >
            იგივე სია ინგლისურად
          </Link>
        </p>
      </section>

      <div className="container-site pb-8">
        <section aria-labelledby="ka-about" className={section}>
          <h2 id="ka-about" className={h2}>
            რა არის შემოქმედი
          </h2>
          <div className={prose}>
            <p>
              <strong>შემოქმედი</strong> (Shemoqmedi) არის ვებსაიტების ჯილდოებისა და ვებ დიზაინის შთაგონების
              პლატფორმა, რომელიც საქართველოში შეიქმნა. აქ ქართული ვებსაიტები მსოფლიოს საუკეთესო ნამუშევრების
              გვერდით დგას: ყველა საიტს ერთი და იგივე ჟიური აფასებს, ერთი და იმავე კრიტერიუმებით.
            </p>
            <p>
              ჩვენი მიზანია, ქართულ სტუდიებს, სააგენტოებსა და დამოუკიდებელ დეველოპერებს ჰქონდეთ ადგილი, სადაც მათ
              საუკეთესო ნამუშევრებს დაინახავენ როგორც საქართველოში, ისე მის ფარგლებს გარეთ.
            </p>
          </div>
        </section>

        <section aria-labelledby="ka-score" className={section}>
          <h2 id="ka-score" className={h2}>
            როგორ ვაფასებთ
          </h2>
          <div className={prose}>
            <p>
              ყოველ საიტს ჟიური ხელით ამოწმებს, სანამ ის გამოქვეყნდება. საიტები ყოველკვირეულ ჯგუფებად
              გროვდება და ჟიური მათ მომდევნო კვირას აფასებს 1-დან 10-მდე ოთხი კრიტერიუმით:
              <strong> დიზაინი (40%), მოხმარების სიმარტივე (30%), კრეატიულობა (20%) და კონტენტი (10%)</strong>.
              ჯილდოსთვის საიტს მინიმუმ {AWARD_RULES.minVotes} ჟიურის შეფასება სჭირდება. ჟიურის წევრი საკუთარ ან
              თავისი კომპანიის საიტს ვერ შეაფასებს.
            </p>
            <p>
              ჯილდოებს მხოლოდ ჟიური წყვეტს; საზოგადოების შეფასება საიტზე ინფორმაციისთვის ჩანს. კენჭისყრის დასრულების
              შემდეგ საუკეთესო საიტები ჯილდოს იღებენ:
            </p>
            <dl className="grid gap-4">
              {AWARDS.map((a) => (
                <div key={a.en}>
                  <dt className="font-semibold text-black">
                    {a.name} <span className="font-normal text-black/55">({a.en})</span>
                  </dt>
                  <dd className="mt-1">{a.rule}</dd>
                </div>
              ))}
            </dl>
            <p>
              დეტალები ინგლისურად:{" "}
              <Link href="/how-we-score" hrefLang="en">
                How we score
              </Link>
              .
            </p>
          </div>
        </section>

        <section aria-labelledby="ka-submit" className={section}>
          <h2 id="ka-submit" className={h2}>
            გამოგზავნე შენი საიტი
          </h2>
          <div className={prose}>
            <p>
              თუ საქართველოში ქმნი ვებსაიტებს, სტუდიაში, სააგენტოში თუ დამოუკიდებლად, გამოგზავნე შენი ნამუშევარი.
              ყოველი გამოქვეყნებული საიტი იღებს საკუთარ გვერდს სქრინშოტებით, ავტორების მითითებით და ბმულით შენს
              საიტზე, ხოლო ავტორი იღებს პროფილს, სადაც მისი ყველა ნამუშევარი და ჯილდოა თავმოყრილი.
            </p>
            <p>
              გამარჯვებულებსა და ნომინანტებს შეუძლიათ საკუთარ საიტზე{" "}
              <Link href="/badges" hrefLang="en">
                ჯილდოს ნიშანი
              </Link>{" "}
              განათავსონ.
            </p>
            <p>
              <Link href="/submit" hrefLang="en">
                საიტის გამოგზავნა
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
