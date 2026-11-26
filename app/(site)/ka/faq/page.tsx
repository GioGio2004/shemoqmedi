import type { Metadata } from "next";
import Link from "next/link";
import { KaInfoPage } from "@/components/site/KaInfoPage";
import { getAwardRules } from "@/lib/listings";
import { kaAlternates, kaOpenGraph } from "@/lib/kaPages";
import { weightedPillarListKa } from "@/lib/scoringCopyKa";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import type { AwardRules } from "@/lib/taxonomy";

// Georgian-only FAQ (no English twin). The same questions and answers go
// into the FAQPage structured data, so the visible text and the markup match.
const PATH = "/ka/faq";
const title = "ხშირი კითხვები: შემოქმედი, ჟიური და ჯილდოები";
const description =
  "პასუხები ყველაზე ხშირ კითხვებზე: რა არის შემოქმედი, ფასიანია თუ არა გამოგზავნა, ვინ აფასებს ვებსაიტებს და როგორ მიიღო ჯილდოს ნიშანი.";

export const metadata: Metadata = {
  title,
  description,
  alternates: kaAlternates(PATH),
  openGraph: kaOpenGraph(PATH, title, description),
};

export const dynamic = "force-static";
export const revalidate = 300;

type Qa = { id: string; q: string; a: string; link?: { href: string; label: string; en?: boolean } };

const faqFor = (rules: AwardRules): Qa[] => [
  {
    id: "what",
    q: "რა არის შემოქმედი?",
    a: "შემოქმედი (Shemoqmedi) ვებსაიტების ჯილდოებისა და ვებ დიზაინის შთაგონების პლატფორმაა, რომელიც საქართველოში შეიქმნა. აქ განთავსებულ ყოველ საიტს დამოუკიდებელი ჟიური აფასებს და საუკეთესოები ჯილდოს იღებენ.",
    link: { href: "/ka", label: "ქართული ვებსაიტები" },
  },
  {
    id: "price",
    q: "ფასიანია საიტის გამოგზავნა?",
    a: "არა. გამოგზავნა, შეფასება და ჯილდო უფასოა.",
    link: { href: "/ka/how-to-submit", label: "როგორ გამოვგზავნოთ საიტი" },
  },
  {
    id: "account",
    q: "საიტის გამოსაგზავნად ანგარიში მჭირდება?",
    a: "არა. სწრაფი ფორმისთვის საკმარისია საიტის სახელი, მისამართი და შენი ელფოსტა; მისი შევსება დაახლოებით 30 წამს მოითხოვს. თუ გინდა, აღწერა, ავტორები და სქრინშოტები თავად მიუთითო, შეავსე სრული ფორმა, რომელსაც უფასო ანგარიში სჭირდება. ორივე შემთხვევაში საიტს ხელით ვამოწმებთ და ერთი და იგივე ჟიური აფასებს.",
    link: { href: "/ka/how-to-submit#two-ways", label: "გამოგზავნის ორი გზა" },
  },
  {
    id: "who",
    q: "ვინ აფასებს საიტებს?",
    a: `ჟიური: დიზაინერები, დეველოპერები და სტუდიების ხელმძღვანელები, რომლებიც მოწვევით შემოგვიერთდნენ. თითოეული წევრი საიტს ${rules.scoreMin}-დან ${rules.scoreMax}-მდე აფასებს ოთხი კრიტერიუმით: ${weightedPillarListKa(rules)}. ყოველი შეფასება საიტის გვერდზე წევრის სახელით ჩანს.`,
    link: { href: "/ka/jury", label: "ჟიური" },
  },
  {
    id: "georgian-only",
    q: "მხოლოდ ქართულ საიტებს იღებთ?",
    a: "არა, ვიღებთ საიტებს მთელი მსოფლიოდან და ყველა ერთი და იმავე კრიტერიუმით ფასდება. საქართველოში შექმნილი საიტები დამატებით ცალკე სიაშიც ჩანს.",
    link: { href: "/ka", label: "ქართული ვებსაიტების სია" },
  },
  {
    id: "english",
    q: "რატომ არის საიტების გვერდები ინგლისურად?",
    a: "შემოქმედი საერთაშორისო პლატფორმაა: ქართული ნამუშევრები მსოფლიოს საუკეთესო საიტების გვერდით დგას და ინგლისურენოვანი გვერდები მათ საქართველოს ფარგლებს გარეთაც აჩვენებს. მთავარი ინფორმაცია პლატფორმის შესახებ ქართულადაც არის.",
  },
  {
    id: "how-long",
    q: "რამდენი ხანი გრძელდება შეფასება?",
    a: "საიტი იმ კვირის ჯგუფში ხვდება, როცა დამტკიცდა. ჟიური მას მომდევნო კვირას აფასებს და კენჭისყრა იმ კვირის ბოლოს, კვირა დღეს სრულდება, ანუ დამტკიცებიდან დაახლოებით ერთი-ორი კვირის შემდეგ. შედეგებს ელფოსტით მიიღებ.",
  },
  {
    id: "min-votes",
    q: "რატომ ვერ მიიღო ჩემმა საიტმა ჯილდო მაღალი ქულის მიუხედავად?",
    a: `ჯილდოსთვის საიტს მინიმუმ ${rules.minVotes} ჟიურის შეფასება სჭირდება. თუ კენჭისყრის დასრულებამდე ნაკლები შეფასება დაგროვდა, საიტი ჯილდოს ვერ მიიღებს, თუმცა ქულა და კომენტარები მის გვერდზე რჩება.`,
    link: { href: "/ka/how-we-score", label: "როგორ ვაფასებთ" },
  },
  {
    id: "community",
    q: "ითვლება საზოგადოების ხმები?",
    a: "არა. საზოგადოების ქულა საიტის გვერდზე ინფორმაციისთვის ჩანს, მაგრამ ჯილდოებს მხოლოდ ჟიურის ქულა წყვეტს.",
  },
  {
    id: "badge",
    q: "როგორ მივიღო ჯილდოს ნიშანი ჩემი საიტისთვის?",
    a: "ნიშნის მიღება მხოლოდ გამარჯვებული საიტის დადასტურებულ მფლობელს შეუძლია. გახსენი შენი საიტის გვერდი შემოქმედზე, დაადასტურე, რომ ის შენია (claim), და შემდეგ ანგარიშიდან აიღე ნიშნის კოდი.",
    link: { href: "/badges", label: "ჯილდოს ნიშნები", en: true },
  },
  {
    id: "certificate",
    q: "რა არის სერტიფიკატი და როგორ შევამოწმო?",
    a: "ყოველ ჯილდოს თან ახლავს A4 ფორმატის სერტიფიკატი უნიკალური ნომრითა და QR კოდით. მისი ნამდვილობის შემოწმება ნებისმიერს შეუძლია shemoqmedi.space/verify გვერდზე.",
    link: { href: "/verify", label: "სერტიფიკატის შემოწმება", en: true },
  },
  {
    id: "save",
    q: "როგორ შევინახო საიტები, რომლებიც მომეწონა?",
    a: "დააჭირე გულის ღილაკს ნებისმიერ საიტზე. შენახული საიტები ამ ბრაუზერში რჩება, ანგარიშის გარეშე. შენახული სიის ბმული შეგიძლია გაუზიარო დიზაინერს ან დეველოპერს, რომ აჩვენო, რა მოგწონს.",
    link: { href: "/saved", label: "შენახული საიტები", en: true },
  },
  {
    id: "join-jury",
    q: "როგორ გავხდე ჟიურის წევრი?",
    a: "ჟიურიში გაწევრიანება მხოლოდ მოწვევით ხდება. ვიწვევთ ადამიანებს, რომელთა ნამუშევარსა და შეფასებას ვენდობით.",
    link: { href: "/jury/guide", label: "ჟიურის გზამკვლევი (ინგლისურად)", en: true },
  },
];

export default async function KaFaqPage() {
  const rules = await getAwardRules();
  const faq = faqFor(rules);
  const url = absoluteUrl(PATH);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": url,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "ka",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <KaInfoPage
      path={PATH}
      prelude="ხშირი"
      title="კითხვები"
      lede="მოკლე პასუხები იმაზე, რასაც ყველაზე ხშირად გვეკითხებიან: გამოგზავნა, ჟიური, ჯილდოები და სერტიფიკატები."
      sections={faq.map((f) => ({
        id: f.id,
        heading: f.q,
        body: (
          <p>
            {f.a}
            {f.link && (
              <>
                {" "}
                <Link href={f.link.href} hrefLang={f.link.en ? "en" : undefined}>
                  {f.link.label}
                </Link>
              </>
            )}
          </p>
        ),
      }))}
      jsonLd={jsonLd}
    />
  );
}
