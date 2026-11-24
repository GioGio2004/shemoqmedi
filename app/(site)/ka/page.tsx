import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/listing/PageHero";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { PillLink } from "@/components/site/ui";
import { MIN_INDEXABLE_COLLECTION } from "@/lib/collections";
import { getAwardRules, getPublicListings } from "@/lib/listings";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";
import { pct } from "@/lib/scoringCopy";
import { GeorgianRoot } from "@/components/site/Georgian";
import { KA_PAGES } from "@/lib/kaPages";
import { awardsKa, bscRuleKa } from "@/lib/scoringCopyKa";

// The Georgian hub: a hand-written landing page for Georgian searches
// ("საუკეთესო ქართული საიტები / ვებგვერდები"), listing the sites made in
// Georgia and linking to the other Georgian pages (lib/kaPages.ts). Its
// English counterpart is /collections/georgia; both declare each other with
// hreflang while that collection is indexable.

const year = () => new Date().getFullYear();
const title = `საუკეთესო ქართული ვებსაიტები და ვებ დიზაინი (${year()})`;
const description =
  "საქართველოში შექმნილი საუკეთესო ვებგვერდები: ხელით შერჩეული და შეფასებული დამოუკიდებელი ჟიურის მიერ დიზაინის, მოხმარების სიმარტივის, კრეატიულობისა და კონტენტის მიხედვით.";

export async function generateMetadata(): Promise<Metadata> {
  // Paired with /collections/georgia only while that page is indexable.
  const paired = (await getPublicListings()).filter((l) => l.region === "georgia").length >= MIN_INDEXABLE_COLLECTION;
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


const section = "grid gap-4 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16";
const h2 = "text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.15] font-semibold tracking-[-0.02em] md:col-span-4";
const prose =
  "grid max-w-2xl gap-4 text-[15px] leading-relaxed text-black/70 md:col-span-8 [&_a]:text-black [&_a]:underline [&_a]:decoration-black/25 [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-black";

export default async function GeorgianPage() {
  const [all, rules] = await Promise.all([getPublicListings(), getAwardRules()]);
  const listings = all.filter((l) => l.region === "georgia");
  /** A pillar's weight from the live rules, "40%". */
  const w = (key: string) => pct(rules.pillars.find((p) => p.key === key)?.weight ?? 0);
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
    <GeorgianRoot>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageHero
        eyebrow="საუკეთესო ქართული ვებსაიტები"
        prelude="საქართველოში შექმნილი"
        title="ვებ დიზაინი"
        titleClassName="text-[clamp(2.75rem,9vw,9rem)] leading-[0.95] tracking-[-0.03em]"
        lede="ვებსაიტები, რომლებიც საქართველოში შეიქმნა: ყოველი მათგანი ხელით შერჩეული და შეფასებულია დამოუკიდებელი ჟიურის მიერ."
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
              საუკეთესო ნამუშევრებს დაინახავენ როგორც საქართველოში, ისე მის ფარგლებს გარეთ. ხოლო ვისაც საკუთარი
              საიტი სჭირდება, აქ ნახავს ქართულ ვებგვერდებს, რომლებიც შეიძლება შთაგონებად ან მაგალითად გამოიყენოს.
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
              გროვდება და ჟიური მათ მომდევნო კვირას აფასებს {rules.scoreMin}-დან {rules.scoreMax}-მდე ოთხი კრიტერიუმით:
              <strong> დიზაინი ({w("design")}), მოხმარების სიმარტივე ({w("usability")}), კრეატიულობა ({w("creativity")}) და კონტენტი ({w("content")})</strong>.
              ჯილდოსთვის საიტს მინიმუმ {rules.minVotes} ჟიურის შეფასება სჭირდება. ჟიურის წევრი საკუთარ ან
              თავისი კომპანიის საიტს ვერ შეაფასებს.
            </p>
            <p>
              ჯილდოებს მხოლოდ ჟიური წყვეტს; საზოგადოების შეფასება საიტზე ინფორმაციისთვის ჩანს. კენჭისყრის დასრულების
              შემდეგ საუკეთესო საიტები ჯილდოს იღებენ:
            </p>
            <dl className="grid gap-4">
              {awardsKa(rules).map((a) => (
                <div key={a.en}>
                  <dt className="font-semibold text-black">
                    {a.name} <span className="font-normal text-black/55">({a.en})</span>
                  </dt>
                  <dd className="mt-1">{a.rule}</dd>
                </div>
              ))}
              <div>
                <dt className="font-semibold text-black">
                  საუკეთესო სოლო ნამუშევარი <span className="font-normal text-black/55">(Best Solo Creation)</span>
                </dt>
                <dd className="mt-1">{bscRuleKa(rules)}</dd>
              </div>
            </dl>
            <p>
              დეტალები: <Link href="/ka/how-we-score">როგორ ვაფასებთ</Link>.
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
              <Link href="/ka/how-to-submit">როგორ გამოვგზავნოთ საიტი</Link> ·{" "}
              <Link href="/ka/faq">ხშირი კითხვები</Link>
            </p>
          </div>
        </section>

        <nav aria-labelledby="ka-more" className={section}>
          <h2 id="ka-more" className={h2}>
            შემოქმედი ქართულად
          </h2>
          <ul className="grid gap-3 text-[15px] md:col-span-8">
            {KA_PAGES.filter((p) => p.ka !== "/ka").map((p) => (
              <li key={p.ka}>
                <Link
                  href={p.ka}
                  className="text-lg font-semibold tracking-[-0.02em] underline decoration-black/20 underline-offset-4 hover:decoration-black"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </GeorgianRoot>
  );
}
