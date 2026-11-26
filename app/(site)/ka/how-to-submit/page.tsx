import type { Metadata } from "next";
import Link from "next/link";
import type { InfoSection } from "@/components/site/InfoPage";
import { KaInfoPage } from "@/components/site/KaInfoPage";
import { getAwardRules } from "@/lib/listings";
import { kaAlternates, kaOpenGraph } from "@/lib/kaPages";
import { LIMITS, type AwardRules } from "@/lib/taxonomy";
import { SITE_URL, absoluteUrl } from "@/lib/site";

// Georgian-only guide to submitting a site: the 30-second form (/submit) and
// the full form (/submit/full), both English and not indexed. No English
// twin, so no hreflang pair.
const PATH = "/ka/how-to-submit";
const title = "როგორ გამოვგზავნოთ ვებსაიტი შემოქმედზე";
const description =
  "გამოგზავნე შენი ვებგვერდი შემოქმედზე უფასოდ: რა გჭირდება, რა საიტებს ვიღებთ, როგორ ფასდება და რას იღებ გამოქვეყნების შემდეგ.";

export const metadata: Metadata = {
  title,
  description,
  alternates: kaAlternates(PATH),
  openGraph: kaOpenGraph(PATH, title, description),
};

export const dynamic = "force-static";
export const revalidate = 300;

const list = "grid list-disc gap-2 pl-5 marker:text-black/30";

const sectionsFor = (rules: AwardRules): InfoSection[] => [
  {
    id: "free",
    heading: "უფასოა",
    body: (
      <p>
        საიტის გამოგზავნა, შეფასება და ჯილდო უფასოა. გამოგზავნა შეუძლია ნებისმიერს, ვინც საიტი
        შექმნა: მარტომ, სტუდიაში, სააგენტოში თუ გუნდთან ერთად. ვიღებთ საიტებს მთელი მსოფლიოდან; საქართველოში
        შექმნილი საიტები ცალკე, <Link href="/ka">ქართული ვებსაიტების</Link> სიაშიც ჩანს.
      </p>
    ),
  },
  {
    id: "two-ways",
    heading: "გამოგზავნის ორი გზა",
    body: (
      <>
        <p>საიტის გამოგზავნა ორი გზით შეგიძლია. ორივე ფორმა ჯერჯერობით ინგლისურადაა.</p>
        <ul className={list}>
          <li>
            <strong>სწრაფი ფორმა, 30 წამი.</strong> საკმარისია საიტის სახელი, მისი მისამართი და შენი ელფოსტა.
            ანგარიში არ გჭირდება. აღწერას, ავტორების მითითებასა და სქრინშოტებს ჩვენი რედაქტორები ამზადებენ.{" "}
            <Link href="/submit">სწრაფი ფორმა</Link>.
          </li>
          <li>
            <strong>სრული ფორმა.</strong> უფასო ანგარიშით საიტის გვერდს თავად ავსებ: მოკლე აღწერა, კატეგორიები,
            ტექნოლოგიები, ავტორები, შენი სქრინშოტები და, სურვილისამებრ, ვიდეო.{" "}
            <Link href="/submit/full">სრული ფორმა</Link>.
          </li>
        </ul>
        <p>
          შეგიძლია სწრაფი ფორმით დაიწყო და დეტალები მოგვიანებით თავად დაამატო: შექმენი ანგარიში იმავე ელფოსტით და
          შეავსე სრული ფორმა. ეს ერთ გამოგზავნად რჩება და არა ორად. ანგარიშით ასევე ხედავ, რა ეტაპზეა შენი საიტი, და
          კენჭისყრის დასრულების შემდეგ კითხულობ ჟიურის ქულებს.
        </p>
      </>
    ),
  },
  {
    id: "what-you-need",
    heading: "რა დაგჭირდება სრული ფორმისთვის",
    body: (
      <>
        <p>სრული ფორმის შესავსებად მოამზადე:</p>
        <ul className={list}>
          <li>ანგარიში შემოქმედზე (შესვლა ან რეგისტრაცია ერთ წუთს მოითხოვს);</li>
          <li>საიტის სახელი და მისი საჯარო, მოქმედი მისამართი;</li>
          <li>მოკლე აღწერა: ერთი წინადადება, {LIMITS.tagline} სიმბოლომდე, რა ხდის საიტს სანახავს;</li>
          <li>
            1-დან {LIMITS.categories}-მდე კატეგორია და {LIMITS.technologies}-მდე ტექნოლოგია, რომლითაც საიტი
            აწყობილია;
          </li>
          <li>ვინ შექმნა: შენ, შენი სტუდია ან გუნდი, და რეგიონი (საქართველო ან სხვა);</li>
          <li>
            მთავარი სქრინშოტი: 16:9, იდეალურად 1920 × 1080, ან მთლიანი გვერდის სქრინშოტი (PNG, JPG ან WebP). მთლიანი
            გვერდის სქრინშოტი მთავარ გვერდზე ნელა ჩამოსქროლდება;
          </li>
          <li>სურვილისამებრ: კიდევ {LIMITS.gallery}-მდე სქრინშოტი და 60 წამამდე უხმო ვიდეო საიტიდან.</li>
        </ul>
      </>
    ),
  },
  {
    id: "what-we-accept",
    heading: "რა საიტებს ვიღებთ",
    body: (
      <>
        <p>ყოველ საიტს გამოქვეყნებამდე ხელით ვამოწმებთ. ვიღებთ საიტს, რომელიც:</p>
        <ul className={list}>
          <li>საჯაროდ მუშაობს და დასრულებულია, არა დემო ან „მალე“ გვერდი;</li>
          <li>შესვლის გარეშე იხსნება;</li>
          <li>თავად შექმენით (მზა შაბლონი თითქმის ცვლილებების გარეშე არ მიიღება);</li>
          <li>მობილურზეც კარგად მუშაობს.</li>
        </ul>
        <p>
          ერთი საიტი ერთდროულად მხოლოდ ერთხელ განთავსდება. უკვე შეფასებული საიტი მხოლოდ მნიშვნელოვანი რედიზაინის
          შემდეგ ბრუნდება.
        </p>
      </>
    ),
  },
  {
    id: "after",
    heading: "რა ხდება გამოგზავნის შემდეგ",
    body: (
      <ol className="grid list-decimal gap-3 pl-5 marker:text-black/40">
        <li>საიტს ხელით ვამოწმებთ. თუ რამე გასასწორებელია, მიზეზს შენს ანგარიშში ნახავ.</li>
        <li>
          დამტკიცების შემდეგ საიტი ქვეყნდება საკუთარ გვერდზე და ელფოსტით მოგდის შეტყობინება, რომ ის კენჭისყრაშია.
        </li>
        <li>
          საიტი იმ კვირის ჯგუფში ხვდება, როცა დამტკიცდა. ჟიური მას მომდევნო კვირას აფასებს და კენჭისყრა იმ კვირის
          ბოლოს, კვირა დღეს სრულდება. ჯილდოსთვის საიტს მინიმუმ {rules.minVotes} ჟიურის შეფასება სჭირდება.
        </li>
        <li>
          კენჭისყრის დასრულების შემდეგ ელფოსტით იღებ შედეგებს: საბოლოო ქულას და ჟიურის თითოეული წევრის შეფასებასა
          და კომენტარს, ჯილდო მოიგო თუ არა.
        </li>
        <li>
          თუ საიტმა ჯილდო მოიგო, იღებ ჯილდოს გვერდს, ნიშანს შენი საიტისთვის და დასაბეჭდ სერტიფიკატს. როგორ
          ფასდება საიტი, ვრცლად: <Link href="/ka/how-we-score">როგორ ვაფასებთ</Link>.
        </li>
      </ol>
    ),
  },
  {
    id: "what-you-get",
    heading: "რას იღებ",
    body: (
      <ul className={list}>
        <li>საიტის საკუთარ გვერდს სქრინშოტებით, ვიდეოთი, ავტორების მითითებით და ბმულით შენს საიტზე;</li>
        <li>ავტორის პროფილს, სადაც შენი ყველა ნამუშევარი და ჯილდოა თავმოყრილი;</li>
        <li>სახელიან, პროფესიონალურ შეფასებას ჟიურისგან: რა მუშაობს კარგად და რა შეიძლება გაუმჯობესდეს;</li>
        <li>
          საიტის დადასტურების (claim) შემდეგ ბმული შენს საიტზე dofollow ხდება, რაც საძიებო სისტემებისთვის
          ღირებულია;
        </li>
        <li>
          <strong>პირველი 100:</strong> პირველი ასი საიტი, რომელსაც მივესალმებით, იღებს დანომრილ საპატიო ნიშანს
          (001–100) და სერტიფიკატს. ეს ქულის ჯილდო არ არის.
        </li>
      </ul>
    ),
  },
  {
    id: "start",
    heading: "დაწყება",
    body: (
      <p>
        მზად ხარ? <Link href="/submit">გამოგზავნე საიტი</Link>. კითხვები გაქვს? ნახე{" "}
        <Link href="/ka/faq">ხშირი კითხვები</Link>.
      </p>
    ),
  },
];

export default async function KaSubmitPage() {
  const rules = await getAwardRules();
  const url = absoluteUrl(PATH);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "ka",
  };
  return (
    <KaInfoPage
      path={PATH}
      prelude="გამოგზავნე"
      title="საიტი"
      lede="გამოგზავნა უფასოა. თუ ვებსაიტი შექმენი, მარტომ, სტუდიაში თუ გუნდთან ერთად, აქ არის ყველაფერი, რაც უნდა იცოდე."
      sections={sectionsFor(rules)}
      jsonLd={jsonLd}
    />
  );
}
