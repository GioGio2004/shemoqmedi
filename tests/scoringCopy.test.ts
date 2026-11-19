import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { collectionAbout } from "@/lib/collectionCopy";
import { allCollections } from "@/lib/collections";
import * as copy from "@/lib/scoringCopy";
import { AWARD_RULES, PILLARS, type AwardRules } from "@/lib/taxonomy";

// The site must describe the scoring model the backend actually runs: jury
// only, Design/Usability/Creativity/Content, thresholds from the rules object.

const ROOT = join(__dirname, "..");

/** Every rule sentence the helpers produce for a set of rules. */
function allCopy(rules: AwardRules) {
  return [
    copy.pillarList(rules),
    copy.pillarNames(rules),
    copy.weightedPillarList(rules),
    copy.juryOnlyLine(),
    copy.finalScoreLine(rules),
    copy.hmRule(rules),
    copy.sotdRule(rules),
    copy.sotmRule(rules),
    copy.sotyRule(rules),
    copy.bscRule(rules),
    copy.sotdDescription(rules),
    copy.sotdLede(rules),
    ...["sotd", "bsc", "hm", "nominees"].flatMap((tag) => copy.ruleCollectionAbout(tag, rules) ?? []),
    ...allCollections().flatMap((c) => [c.intro, c.description, ...(collectionAbout(c.tag, rules) ?? [])]),
  ].join("\n");
}

/** Claims from the old model (60/40 jury/community, Code pillar, SOTD 8.5, HM 7.5–8.5). */
function expectNoOldModel(text: string) {
  expect(text).not.toMatch(/60 ?%/);
  expect(text).not.toMatch(/community[^.]{0,60}\d+ ?%/i);
  expect(text).not.toMatch(/\d+ ?%[^.]{0,60}community/i);
  expect(text).not.toMatch(/(jury|by) and (the )?community/i);
  expect(text).not.toMatch(/creativity,? (and|&) code/i);
  expect(text).not.toMatch(/\b8\.50?\b|\b7\.50?\b/);
  expect(text).not.toMatch(/Site of the Day is [^.]*highest/i);
}

describe("scoring copy", () => {
  it("describes the current model with the default rules", () => {
    const text = allCopy(AWARD_RULES);
    expectNoOldModel(text);
    expect(copy.pillarList(AWARD_RULES)).toBe("design, usability, creativity and content");
    expect(copy.weightedPillarList(AWARD_RULES)).toBe("design (40%), usability (30%), creativity (20%) and content (10%)");
    expect(copy.hmRule(AWARD_RULES)).toContain("6.50 or more");
    expect(copy.sotdRule(AWARD_RULES)).toContain("7.00 or more");
    expect(copy.bscRule(AWARD_RULES)).toContain("8.20 or more");
    expect(copy.finalScoreLine(AWARD_RULES)).toContain("at least 3 jury votes");
    expect(copy.sotmRule(AWARD_RULES)).toContain("over 5 days");
    expect(copy.sotmRule(AWARD_RULES)).toContain("announced on the 6th");
    expect(copy.sotyRule(AWARD_RULES)).toMatch(/^Shemoqmedi's highest award/);
    expect(copy.sotyRule(AWARD_RULES)).toContain("announced on 20 January");
    expect(copy.juryOnlyLine()).toMatch(/only the jury decides/i);
  });

  it("takes every number from the rules object", () => {
    const changed: AwardRules = {
      ...AWARD_RULES,
      minVotes: 5,
      honorableMentionMin: 6.8,
      sotdMin: 7.4,
      bscMin: 9.1,
      monthlyRoundDays: 7,
      yearlyRoundDays: 12,
      yearlyAnnounceDate: "02-03",
    };
    const text = allCopy(changed);
    expectNoOldModel(text);
    expect(copy.hmRule(changed)).toContain("6.80 or more");
    expect(copy.sotdRule(changed)).toContain("7.40 or more");
    expect(copy.sotdLede(changed)).toContain("7.40");
    expect(copy.sotdDescription(changed)).toContain("7.40");
    expect(copy.bscRule(changed)).toContain("9.10 or more");
    expect(copy.finalScoreLine(changed)).toContain("at least 5 jury votes");
    expect(copy.sotmRule(changed)).toContain("announced on the 8th");
    expect(copy.sotyRule(changed)).toContain("over 12 days");
    expect(copy.sotyRule(changed)).toContain("announced on 3 February");
    expect(copy.ruleCollectionAbout("nominees", changed)?.join(" ")).toContain("at least 5 jury votes");
    expect(copy.ruleCollectionAbout("hm", changed)?.join(" ")).toContain("6.80");
    // None of the default thresholds survive in the changed copy.
    expect(text).not.toMatch(/\b6\.50\b|\b7\.00\b|\b8\.20\b/);
  });

  it("the fallback rules match the pillar weights", () => {
    expect(AWARD_RULES.pillars).toEqual(PILLARS.map((p) => ({ key: p.key, name: p.name, weight: p.weight })));
    expect(AWARD_RULES.pillars.reduce((s, p) => s + p.weight, 0)).toBeCloseTo(1, 10);
    expect(AWARD_RULES.communityCounts).toBe(false);
  });
});

/** Source files of the site, for a grep of hard-coded old-model copy. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|mdx?)$/.test(name) ? [path] : [];
  });
}

describe("site source", () => {
  const files = ["app", "components", "lib"].flatMap((d) => sourceFiles(join(ROOT, d)));

  it("has no copy from the old scoring model", () => {
    const bad: string[] = [];
    const patterns = [
      /60 ?%/,
      /community[^.\n]{0,40}\b[1-9]0 ?%/i,
      /(jury|by) and (the )?community/i,
      /creativity,? (and|&) code/i,
      /8\.50? or more|7\.50? or more/,
      /Site of the Day is [^.\n]*highest/i,
    ];
    for (const file of files) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (patterns.some((p) => p.test(line))) bad.push(`${file.slice(ROOT.length + 1)}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(bad).toEqual([]);
  });

  it("states award thresholds only through the rules object", () => {
    const bad: string[] = [];
    for (const file of files) {
      if (file.endsWith(join("lib", "taxonomy.ts"))) continue; // the fallback defaults live here
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (/\b(6\.5|6\.50|7\.0|7\.00|8\.2|8\.20)\b(?! ?(rem|px|%|s\b))/.test(line) && /score|or more|ქულ/i.test(line)) {
            bad.push(`${file.slice(ROOT.length + 1)}:${i + 1}: ${line.trim()}`);
          }
        });
    }
    expect(bad).toEqual([]);
  });
});
