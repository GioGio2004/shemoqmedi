import type { JurorEducation, JurorExperience } from "@/convex-helpers-api";

// Dates and grouping for a juror's Experience and Education, LinkedIn style:
// "Mar 2021 – Present · 4 yrs 9 mos", consecutive roles at one company grouped.

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function date(year: number | undefined, month: number | undefined) {
  if (year === undefined) return null;
  return month ? `${MONTHS[month - 1]} ${year}` : String(year);
}

/** "Mar 2021 – Present", "2016 – 2019", or the older free-text period. null when there are no dates. */
export function experienceDates(e: JurorExperience) {
  const start = date(e.startYear, e.startMonth);
  if (!start) return e.period ?? null;
  const end = e.current ? "Present" : date(e.endYear, e.endMonth);
  return end && end !== start ? `${start} – ${end}` : start;
}

/** Months in a role, counting both the first and last month, or null without a start month. */
function months(e: JurorExperience, now: Date) {
  if (e.startYear === undefined || !e.startMonth) return null;
  let endYear: number;
  let endMonth: number;
  if (e.current) {
    endYear = now.getUTCFullYear();
    endMonth = now.getUTCMonth() + 1;
  } else if (e.endYear !== undefined && e.endMonth) {
    endYear = e.endYear;
    endMonth = e.endMonth;
  } else {
    return null;
  }
  const n = (endYear - e.startYear) * 12 + (endMonth - e.startMonth) + 1;
  return n > 0 ? n : null;
}

/** "4 yrs 9 mos", "1 yr", "3 mos". */
export function formatDuration(total: number) {
  const y = Math.floor(total / 12);
  const m = total % 12;
  const parts = [y ? `${y} ${y === 1 ? "yr" : "yrs"}` : "", m ? `${m} ${m === 1 ? "mo" : "mos"}` : ""];
  return parts.filter(Boolean).join(" ");
}

/** How long the role lasted ("4 yrs 9 mos"), or null when the months aren't known. */
export function experienceDuration(e: JurorExperience, now = new Date()) {
  const n = months(e, now);
  return n ? formatDuration(n) : null;
}

export type ExperienceGroup = {
  organization: string;
  organizationUrl?: string;
  roles: JurorExperience[];
  /** Total time at the company, for a group of two or more roles. */
  duration: string | null;
};

/**
 * Consecutive roles at the same company (the list is newest first) become one
 * group, the way LinkedIn shows a promotion. A single role is a group of one.
 */
export function groupExperience(rows: JurorExperience[], now = new Date()): ExperienceGroup[] {
  const groups: ExperienceGroup[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.organization.trim().toLowerCase() === r.organization.trim().toLowerCase()) {
      last.roles.push(r);
      last.organizationUrl ??= r.organizationUrl;
    } else {
      groups.push({ organization: r.organization, organizationUrl: r.organizationUrl, roles: [r], duration: null });
    }
  }
  for (const g of groups) {
    if (g.roles.length < 2) continue;
    // From the earliest start to the latest end (or now), when every role has months.
    const spans = g.roles.map((r) => months(r, now));
    if (spans.some((s) => s === null)) continue;
    const first = g.roles[g.roles.length - 1];
    const latest = g.roles[0];
    const span = months(
      {
        ...latest,
        startYear: first.startYear,
        startMonth: first.startMonth,
      },
      now,
    );
    g.duration = span ? formatDuration(span) : null;
  }
  return groups;
}

/** "BSc, Computer science". */
export function educationTitle(e: JurorEducation) {
  return [e.degree, e.field].filter(Boolean).join(", ");
}

/** "2012 – 2016", "2020", or null. */
export function educationDates(e: JurorEducation) {
  if (e.startYear && e.endYear) return e.startYear === e.endYear ? String(e.endYear) : `${e.startYear} – ${e.endYear}`;
  return e.endYear ? String(e.endYear) : e.startYear ? String(e.startYear) : null;
}

/** The roles a juror holds now: Person.worksFor in the page's structured data. */
export function currentRoles(rows: JurorExperience[]) {
  return rows.filter((r) => r.current);
}
