// Georgian versions of the scoring sentences in scoringCopy.ts. Every number
// comes from the live award rules, like the English ones, so the Georgian
// pages never state an old threshold.

import type { AwardRules } from "@/lib/taxonomy";
import { monthlyAnnounceDay, score } from "@/lib/scoringCopy";

const MONTHS_KA = [
  "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
  "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი",
];

export const PILLAR_NAME_KA: Record<string, string> = {
  design: "დიზაინი",
  usability: "მოხმარების სიმარტივე",
  creativity: "კრეატიულობა",
  content: "კონტენტი",
};

export const PILLAR_TEXT_KA: Record<string, string> = {
  design:
    "ვიზუალური ხარისხი: განლაგება, ტიპოგრაფია, ფერი, გამოსახულებები და არტ-დირექშენი. გააზრებულად გამოიყურება თუ არა საიტი ყველა ზომის ეკრანზე და შეესაბამება თუ არა მისი იერსახე იმას, რისთვისაც შეიქმნა?",
  usability:
    "რამდენად მარტივია საიტის გამოყენება: გასაგები ნავიგაცია, ადვილად წასაკითხი ტექსტი, სწრაფი ჩატვირთვა, გამართული ფორმები და ხელმისაწვდომობა კლავიატურისა და ეკრანის წამკითხველის მომხმარებლებისთვის. ეფექტები, რომლებიც ხელს უშლის, აქ ქულას აკლებს.",
  creativity:
    "იდეის ორიგინალურობა და მისი შესრულება. დაგამახსოვრდებათ თუ არა ეს საიტი ხვალაც და აკეთებს თუ არა ის რამეს, რაც ბევრჯერ არ გინახავთ?",
  content:
    "რას ამბობს და აჩვენებს საიტი: გასაგები და გულწრფელი ტექსტი, პროდუქტის რეალური ფოტოები და ინფორმაცია, რომელიც ვიზიტორს იმაზე პასუხობს, რისთვისაც მოვიდა.",
};

/** A pillar's Georgian name, falling back to the English one for a pillar added later. */
export const pillarNameKa = (key: string, fallback: string) => PILLAR_NAME_KA[key] ?? fallback;

/** "დიზაინი (40%), მოხმარების სიმარტივე (30%), კრეატიულობა (20%) და კონტენტი (10%)" */
export function weightedPillarListKa(rules: AwardRules) {
  const items = rules.pillars.map((p) => `${pillarNameKa(p.key, p.name)} (${Math.round(p.weight * 100)}%)`);
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} და ${items[items.length - 1]}`;
}

/** "20 იანვარს" (dative: every month name ends in -ი, which becomes -ს). */
function yearlyAnnounceKa(rules: AwardRules) {
  const [mm, dd] = rules.yearlyAnnounceDate.split("-").map(Number);
  return `${dd} ${MONTHS_KA[(mm || 1) - 1].replace(/ი$/, "ს")}`;
}

/** The award tiers, lowest first, with their crow colour and rule. */
export const awardsKa = (rules: AwardRules) => [
  {
    name: "საპატიო მოხსენიება",
    en: "Honorable Mention",
    crow: "ვერცხლის ყვავი",
    href: "/collections/hm",
    rule: `ყოველი საიტი, რომლის საბოლოო ქულა კენჭისყრის დასრულებისას ${score(rules, rules.honorableMentionMin)} ან მეტია.`,
  },
  {
    name: "დღის საიტი",
    en: "Site of the Day",
    crow: "შავი ყვავი",
    href: "/site-of-the-day",
    rule: `${score(rules, rules.sotdMin)} ან მეტი ქულის საიტები დღის საიტის რიგში დგებიან, საუკეთესო ქულიდან დაწყებული. ყოველდღე რიგიდან ერთი საიტი ცხადდება: დღეში ერთი გამარჯვებული, და საიტს ამის მოგება მხოლოდ ერთხელ შეუძლია. თუ რიგი ცარიელია, იმ დღეს გამარჯვებული არ არის.`,
  },
  {
    name: "თვის საიტი",
    en: "Site of the Month",
    crow: "წითელი ყვავი",
    href: "/collections/sotm",
    rule: `ყოველი თვის 1 რიცხვში ჟიური თვის დღის საიტებს თავიდან აფასებს ${rules.monthlyRoundDays} დღის განმავლობაში. საუკეთესო ქულის მქონე იმარჯვებს და ${monthlyAnnounceDay(rules)} რიცხვში ცხადდება.`,
  },
  {
    name: "წლის საიტი",
    en: "Site of the Year",
    crow: "ოქროს ყვავი",
    href: "/collections/soty",
    rule: `შემოქმედის უმაღლესი ჯილდო. იანვარში ჟიური წლის თვის საიტებს აფასებს ${rules.yearlyRoundDays} დღის განმავლობაში; გამარჯვებული ${yearlyAnnounceKa(rules)} ცხადდება.`,
  },
];

/** Best Solo Creation, outside the tiers. */
export const bscRuleKa = (rules: AwardRules) =>
  `საიტი, რომელიც ერთმა ადამიანმა შექმნა და რომლის საბოლოო ქულა ${score(rules, rules.bscMin)} ან მეტია.`;
