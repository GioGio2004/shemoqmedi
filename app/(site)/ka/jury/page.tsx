import type { Metadata } from "next";
import Link from "next/link";
import type { InfoSection } from "@/components/site/InfoPage";
import { KaInfoPage } from "@/components/site/KaInfoPage";
import { JuryDirectory } from "@/components/jury/JuryDirectory";
import { getAwardRules, getJurors } from "@/lib/listings";
import { kaAlternates, kaOpenGraph } from "@/lib/kaPages";
import { weightedPillarListKa } from "@/lib/scoringCopyKa";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import type { AwardRules } from "@/lib/taxonomy";

// Georgian translation of /jury (hreflang pair, lib/kaPages.ts). Members'
// own profiles (/jury/<slug>) stay in English.
const PATH = "/ka/jury";
const title = "ჟიური: ვინ აფასებს ვებსაიტებს შემოქმედზე";
const describe = (rules: AwardRules) =>
  `გაიცანით შემოქმედის ჟიური: დიზაინერები და დეველოპერები, რომლებიც ყოველ ვებსაიტს ${rules.scoreMin}-დან ${rules.scoreMax}-მდე აფასებენ. ჯილდოებს მხოლოდ ჟიური წყვეტს.`;

export async function generateMetadata(): Promise<Metadata> {
  const description = describe(await getAwardRules());
  return {
    title,
    description,
    alternates: kaAlternates(PATH),
    openGraph: kaOpenGraph(PATH, title, description),
  };
}

// Members come from Convex (jury.listPublic); refreshed in the background.
export const dynamic = "force-static";
export const revalidate = 60;

const sectionsFor = (rules: AwardRules): InfoSection[] => [
  {
    id: "review",
    heading: "როგორ მუშაობს ჟიური",
    body: (
      <>
        <p>
          ყოველ გამოგზავნილ საიტს ხელით ვამოწმებთ, სანამ გამოქვეყნდება. ერთ კვირაში დამტკიცებული საიტები ერთ ჯგუფს
          ქმნის და ჟიური ამ ჯგუფს მომდევნო კვირას აფასებს: თითოეული წევრი საიტს {rules.scoreMin}-დან{" "}
          {rules.scoreMax}-მდე აფასებს ოთხი კრიტერიუმით, {weightedPillarListKa(rules)}, და წერს მოკლე კომენტარს,
          რომელიც საიტის გვერდზე მისი სახელით ქვეყნდება.
        </p>
        <p>
          საბოლოო ქულა ჟიურის წევრების შეწონილი ქულების საშუალოა და მხოლოდ ის წყვეტს ჯილდოებს; ჯილდოსთვის საიტს
          მინიმუმ {rules.minVotes} ჟიურის შეფასება სჭირდება. საზოგადოების ხმები ინფორმაციისთვის ჩანს და არასოდეს
          ითვლება. სრული მეთოდი: <Link href="/ka/how-we-score">როგორ ვაფასებთ</Link>.
        </p>
      </>
    ),
  },
  {
    id: "conflicts",
    heading: "ინტერესთა კონფლიქტი",
    body: (
      <p>
        ჟიურის წევრი ვერ აფასებს საიტს, რომელიც თავად შექმნა ან გამოგზავნა, და საიტს, რომელიც მის კომპანიას
        ეკუთვნის: სისტემა ამის საშუალებას არ აძლევს. ჟიურის წევრს შეუძლია კონფლიქტი თავად განაცხადოს, ხოლო
        ადმინისტრატორს ნებისმიერ წევრსა და საიტს შორის მისი მონიშვნა შეუძლია.
      </p>
    ),
  },
  {
    id: "membership",
    heading: "ჟიურიში გაწევრიანება",
    body: (
      <p>
        ჟიურიში გაწევრიანება მხოლოდ მოწვევით ხდება. ვიწვევთ დიზაინერებს, დეველოპერებსა და სტუდიების
        ხელმძღვანელებს, რომელთა ნამუშევარსა და შეფასებას ვენდობით. მოგიწვიეს, ან გაინტერესებს, რას გულისხმობს?
        წაიკითხე{" "}
        <Link href="/jury/guide" hrefLang="en">
          ჟიურის გზამკვლევი
        </Link>{" "}
        (ინგლისურად).
      </p>
    ),
  },
];

export default async function KaJuryPage() {
  const [jurors, rules] = await Promise.all([getJurors(), getAwardRules()]);
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
    ...(jurors.length > 0
      ? {
          // Same @id as the Person on each member's /jury/<slug> page.
          mentions: jurors.map((j) => ({
            "@type": "Person",
            "@id": `${absoluteUrl(`/jury/${j.slug}`)}#person`,
            name: j.name,
            url: absoluteUrl(`/jury/${j.slug}`),
          })),
        }
      : {}),
  };
  return (
    <KaInfoPage
      path={PATH}
      prelude="შემოქმედის"
      title="ჟიური"
      lede="დიზაინერები და დეველოპერები, რომლებიც ყოველ საიტს მისი კენჭისყრის დროს აფასებენ და პირდაპირ ამბობენ, რას ფიქრობენ მასზე."
      sections={sectionsFor(rules)}
      lead={jurors.length > 0 ? <JuryDirectory jurors={jurors} lang="ka" /> : undefined}
      jsonLd={jsonLd}
    />
  );
}
