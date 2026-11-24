import type { Metadata } from "next";
import Link from "next/link";
import type { InfoSection } from "@/components/site/InfoPage";
import { KaInfoPage } from "@/components/site/KaInfoPage";
import { getAwardRules } from "@/lib/listings";
import { kaAlternates, kaOpenGraph } from "@/lib/kaPages";
import { pct, score } from "@/lib/scoringCopy";
import { awardsKa, bscRuleKa, PILLAR_TEXT_KA, pillarNameKa, weightedPillarListKa } from "@/lib/scoringCopyKa";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import type { AwardRules } from "@/lib/taxonomy";

// Georgian translation of /how-we-score (hreflang pair, lib/kaPages.ts).
const PATH = "/ka/how-we-score";
const title = "როგორ ვაფასებთ ვებსაიტებს: ჟიურის ქულები და ჯილდოები";
const describe = (rules: AwardRules) =>
  `ყოველ ვებგვერდს ჟიური ${rules.scoreMin}-დან ${rules.scoreMax}-მდე აფასებს ოთხი კრიტერიუმით: ${weightedPillarListKa(rules)}. ყოველდღე ერთი დღის საიტი, შემდეგ თვისა და წლის საიტი.`;

export async function generateMetadata(): Promise<Metadata> {
  const description = describe(await getAwardRules());
  return {
    title,
    description,
    alternates: kaAlternates(PATH),
    openGraph: kaOpenGraph(PATH, title, description),
  };
}

// Static, refreshed in the background so the numbers follow the award settings.
export const dynamic = "force-static";
export const revalidate = 300;

/** The worked example, computed from the live weights (same numbers as the English page). */
function example(rules: AwardRules) {
  const sample = [9, 8, 7, 6];
  const parts = rules.pillars.map((p, i) => ({ p, s: sample[i] ?? 5 }));
  const one = parts.reduce((sum, x) => sum + x.s * x.p.weight, 0);
  const others = [7.5, 8.4];
  const final = Math.round(((one + others[0] + others[1]) / 3) * 100) / 100;
  const f = (n: number) => n.toFixed(rules.decimals);
  return `მაგალითი: ჟიურის წევრის ქულებია ${parts
    .map((x) => `${pillarNameKa(x.p.key, x.p.name).toLowerCase()} — ${x.s}`)
    .join(", ")}. შეწონვით ეს იძლევა ${parts.map((x) => `${x.s} × ${x.p.weight}`).join(" + ")} = ${f(one)}. სამი ჟიურის წევრის ქულები ${f(one)}, ${f(others[0])} და ${f(others[1])} იძლევა საბოლოო ქულას ${f(final)}.`;
}

const sectionsFor = (rules: AwardRules): InfoSection[] => [
  {
    id: "pillars",
    heading: "ოთხი კრიტერიუმი, თავისი წონით",
    body: (
      <>
        <p>
          ჟიურის თითოეული წევრი საიტს {rules.scoreMin}-დან {rules.scoreMax}-მდე აფასებს ოთხი კრიტერიუმით. მისი
          ქულა საიტისთვის კრიტერიუმებს ასე წონის:
        </p>
        <dl className="grid gap-4">
          {rules.pillars.map((p) => (
            <div key={p.key}>
              <dt className="font-semibold text-black">
                {pillarNameKa(p.key, p.name)} · {pct(p.weight)}
              </dt>
              {PILLAR_TEXT_KA[p.key] && <dd className="mt-1">{PILLAR_TEXT_KA[p.key]}</dd>}
            </div>
          ))}
        </dl>
      </>
    ),
  },
  {
    id: "batches",
    heading: "ყოველკვირეული ჯგუფები",
    body: (
      <>
        <p>
          საიტები ყოველკვირეულ ჯგუფებად გროვდება: ყველაფერი, რაც ორშაბათის 00:00-დან კვირის 23:59-მდე (თბილისის
          დროით) დამტკიცდება, ერთ ჯგუფს ქმნის. <Link href="/ka/jury">ჟიური</Link> ჯგუფს მომდევნო კვირის
          განმავლობაში აფასებს და კენჭისყრა იმ კვირის ბოლოს, კვირა დღეს სრულდება. კენჭისყრაში მყოფი საიტები{" "}
          <Link href="/collections/nominees" hrefLang="en">
            ნომინანტების
          </Link>{" "}
          გვერდზეა.
        </p>
        <p>
          ჟიურის წევრი არასოდეს აფასებს საიტს, რომელიც თავად შექმნა ან მის კომპანიას ეკუთვნის. შემოქმედის გუნდის
          შექმნილი საიტები ასეა მონიშნული და ჯილდოს არასოდეს იღებენ.
        </p>
      </>
    ),
  },
  {
    id: "final-score",
    heading: "საბოლოო ქულა",
    body: (
      <>
        <p>
          საბოლოო ქულა ჟიურის წევრების შეწონილი ქულების საშუალოა, დამრგვალებული {rules.decimals} ათწილადამდე.
          ჯილდოებს მხოლოდ ჟიური წყვეტს. ნებისმიერი ჯილდოსთვის საიტს სჭირდება მინიმუმ{" "}
          <strong>{rules.minVotes} ჟიურის შეფასება</strong>; ეს რიცხვი ჟიურის ზრდასთან ერთად გაიზრდება.
        </p>
        <p>{example(rules)}</p>
        <p>
          შემოქმედის ნიშნის მქონე ავტორებსაც შეუძლიათ ხმის მიცემა. მათი საშუალო თითოეულ საიტზე საზოგადოების ქულად
          ჩანს, მაგრამ საბოლოო ქულაში არასოდეს ითვლება.
        </p>
        <p>
          თანაბარი ქულის შემთხვევაში უპირატესობა აქვს საიტს, რომელსაც მეტი ჟიურის შეფასება აქვს, შემდეგ უფრო
          მაღალი დიზაინის ქულის მქონეს და ბოლოს ადრე გამოგზავნილს.
        </p>
      </>
    ),
  },
  {
    id: "awards",
    heading: "ჯილდოები",
    body: (
      <>
        <p>ოთხი საფეხური, ყველაზე დაბლიდან; წლის საიტი უმაღლესია. ყოველ ნიშანზე ჯილდო და მისი თარიღი წერია.</p>
        <dl className="grid gap-4">
          {awardsKa(rules).map((a) => (
            <div key={a.en}>
              <dt className="font-semibold text-black">
                <Link href={a.href} hrefLang="en">
                  {a.name}
                </Link>{" "}
                <span className="font-normal text-black/55">({a.en})</span> · {a.crow}
              </dt>
              <dd className="mt-1">{a.rule}</dd>
            </div>
          ))}
        </dl>
        <p>
          სოლო ავტორები, რომლებიც {score(rules, rules.bscMin)} ან მეტ ქულას იღებენ, ასევე იღებენ{" "}
          <Link href="/collections/bsc" hrefLang="en">
            საუკეთესო სოლო ნამუშევრის
          </Link>{" "}
          ჯილდოს (Best Solo Creation), რომელიც საფეხურებს გარეთაა: {bscRuleKa(rules)}
        </p>
        <p>
          თითოეულ ჯილდოს საკუთარი გვერდი და დასაბეჭდი სერტიფიკატი აქვს, რომლის ნამდვილობა{" "}
          <Link href="/verify" hrefLang="en">
            shemoqmedi.space/verify
          </Link>
          -ზე მოწმდება. ჯილდოს{" "}
          <Link href="/badges" hrefLang="en">
            ნიშნის
          </Link>{" "}
          მიღება მხოლოდ გამარჯვებული საიტის დადასტურებულ მფლობელს შეუძლია.
        </p>
      </>
    ),
  },
  {
    id: "resubmissions",
    heading: "დუბლიკატები და რედიზაინი",
    body: (
      <p>
        ერთი ვებსაიტი ერთდროულად მხოლოდ ერთხელ შეიძლება იყოს განთავსებული. საიტი, რომელმაც შეფასება უკვე გაიარა,
        მხოლოდ მნიშვნელოვანი რედიზაინის შემდეგ შეიძლება დაბრუნდეს: როგორც ახალი ჩანაწერი, ძველთან დაკავშირებული
        და ჟიურის მიერ დამტკიცებული. თუ საიტმა ჯილდო მოიგო, რედიზაინის გამოგზავნა ბოლო ჯილდოდან არანაკლებ{" "}
        {rules.resubmitMonths} თვის შემდეგ შეიძლება.
      </p>
    ),
  },
];

export default async function KaHowWeScorePage() {
  const rules = await getAwardRules();
  const url = absoluteUrl(PATH);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: title,
    description: describe(rules),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "ka",
  };
  return (
    <KaInfoPage
      path={PATH}
      prelude="როგორ"
      title="ვაფასებთ"
      lede={`ოთხი შეწონილი კრიტერიუმი, ${rules.scoreMin}-დან ${rules.scoreMax}-მდე ქულა ჟიურისგან, ყოველკვირეულ ჯგუფებად. საპატიო მოხსენიება, შემდეგ ყოველდღე ერთი დღის საიტი, თვის საიტი და წლის საიტი.`}
      sections={sectionsFor(rules)}
      jsonLd={jsonLd}
    />
  );
}
