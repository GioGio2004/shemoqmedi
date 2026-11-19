// Every sentence on the site that states a scoring rule or number. Each takes
// the rules object (getAwardRules() in lib/listings.ts, served by the backend's
// awards.publicRules) so the copy always describes the model that actually
// decides awards: jury only, four weighted pillars, thresholds an admin can
// change. Covered by tests/scoringCopy.test.ts.

import type { AwardRules } from "@/lib/taxonomy";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** A threshold as the site prints it: 6.5 → "6.50". */
export const score = (rules: AwardRules, n: number) => n.toFixed(rules.decimals);

/** A pillar weight as a percentage: 0.4 → "40%". */
export const pct = (weight: number) => `${Math.round(weight * 100)}%`;

function joinAnd(items: string[]) {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function ordinal(n: number) {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** "design, usability, creativity and content" */
export const pillarList = (rules: AwardRules) => joinAnd(rules.pillars.map((p) => p.name.toLowerCase()));

/** "Design, Usability, Creativity and Content" */
export const pillarNames = (rules: AwardRules) => joinAnd(rules.pillars.map((p) => p.name));

/** "design (40%), usability (30%), creativity (20%) and content (10%)" */
export const weightedPillarList = (rules: AwardRules) =>
  joinAnd(rules.pillars.map((p) => `${p.name.toLowerCase()} (${pct(p.weight)})`));

/** "1 to 10" */
export const scoreRange = (rules: AwardRules) => `${rules.scoreMin} to ${rules.scoreMax}`;

/** Day of the month the Site of the Month is announced (the round opens on the 1st). */
export const monthlyAnnounceDay = (rules: AwardRules) => 1 + rules.monthlyRoundDays;

/** "20 January" */
export function yearlyAnnounceText(rules: AwardRules) {
  const [mm, dd] = rules.yearlyAnnounceDate.split("-").map(Number);
  return `${dd} ${MONTHS[(mm || 1) - 1]}`;
}

/** One line on who decides. */
export const juryOnlyLine = () =>
  "Only the jury decides awards. Community votes are shown on each site for interest and never count toward the final score.";

export const finalScoreLine = (rules: AwardRules) =>
  `Each juror scores ${pillarList(rules)} from ${scoreRange(rules)}. The final score is the average of the jurors' weighted scores, rounded to ${rules.decimals} decimals, and a site needs at least ${rules.minVotes} jury votes to be eligible for any award.`;

export const hmRule = (rules: AwardRules) =>
  `Every eligible site with a final score of ${score(rules, rules.honorableMentionMin)} or more when its voting closes.`;

export const sotdRule = (rules: AwardRules) =>
  `Eligible sites with ${score(rules, rules.sotdMin)} or more join the Site of the Day queue, best score first. Each day one site from the queue is announced: one winner a day, and a site can win only once. Sites left in the queue carry over to the following days. If the queue is empty, the day has no winner; a past winner is never repeated.`;

export const sotmRule = (rules: AwardRules) =>
  `On the 1st of each month the jury scores the month's Site of the Day winners again, over ${rules.monthlyRoundDays} days. The highest score wins, announced on the ${ordinal(monthlyAnnounceDay(rules))}.`;

export const sotyRule = (rules: AwardRules) =>
  `Shemoqmedi's highest award. In January the jury scores the year's Sites of the Month over ${rules.yearlyRoundDays} days. The highest score wins, announced on ${yearlyAnnounceText(rules)}.`;

export const bscRule = (rules: AwardRules) =>
  `A site designed and built by one person, with a final score of ${score(rules, rules.bscMin)} or more.`;

/** /site-of-the-day meta description. */
export const sotdDescription = (rules: AwardRules) =>
  `One website a day from the jury's Site of the Day queue: sites scored ${score(rules, rules.sotdMin)} or more on ${pillarList(rules)}. Every Site of the Day, by date.`;

/** /site-of-the-day lede. */
export const sotdLede = (rules: AwardRules) =>
  `Every day, the best site in the jury's queue: scored ${score(rules, rules.sotdMin)} or more. Never the same site twice.`;

/**
 * "About this collection" for the award and status collections, whose copy
 * states rules. Other collections use the hand-written text in
 * lib/collectionCopy.ts.
 */
export function ruleCollectionAbout(tag: string, rules: AwardRules): string[] | null {
  const sotd = score(rules, rules.sotdMin);
  switch (tag) {
    case "sotd":
      return [
        `Site of the Day goes to one website a day. Sites with a final score of ${sotd} or more when their jury week closes join a queue, and each day the best site in the queue is announced. A site can win it only once, and sites left in the queue carry over to the next days.`,
        `The final score comes from the jury alone: each juror scores ${weightedPillarList(rules)}, and their weighted scores are averaged. Winning sites usually combine a strong idea with careful execution. Winners can show a dated badge on their own site. This page is the archive of every Site of the Day, newest first.`,
      ];
    case "bsc":
      return [
        `Best Solo Creation is awarded to websites designed and built by one person, without a studio or agency team. A solo site wins it with a final score of ${score(rules, rules.bscMin)} or more from the jury.`,
        "The award exists because solo developers compete with agencies on a very different budget. These sites show what one person can do across design, motion and engineering together. A site can win Best Solo Creation and Site of the Day at the same time.",
      ];
    case "hm":
      return [
        `Honorable Mention goes to every eligible website that finishes its jury week with a final score of ${score(rules, rules.honorableMentionMin)} or more. Sites with ${sotd} or more also join the Site of the Day queue.`,
        "These are strong, well-crafted sites the jury agreed deserve recognition: often excellent in one or two pillars, such as design or creativity, with smaller compromises elsewhere. Honorable Mention winners can display an award badge on their site, and the collection is a good place to find solid, realistic inspiration.",
      ];
    case "nominees":
      return [
        "Nominees are websites in voting right now. Sites approved in one week form a batch, and the jury scores the batch during the following week. Every site here was reviewed by hand before going live.",
        `Jurors score each nominee from ${scoreRange(rules)} on ${pillarList(rules)}. When the week closes, sites with at least ${rules.minVotes} jury votes can win Honorable Mention, Best Solo Creation and a place in the Site of the Day queue. Creators with a Shemoqmedi badge can vote too; their average is shown for interest and does not decide awards.`,
      ];
    default:
      return null;
  }
}
