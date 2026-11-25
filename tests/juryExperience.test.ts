import { describe, expect, it } from "vitest";
import {
  educationDates,
  educationTitle,
  experienceDates,
  experienceDuration,
  formatDuration,
  groupExperience,
} from "@/components/jury/experience";

const NOW = new Date(Date.UTC(2026, 10, 25)); // Nov 2026

describe("juror experience dates", () => {
  it("formats month/year ranges, present, year-only and the old free-text period", () => {
    expect(experienceDates({ title: "A", organization: "B", startYear: 2021, startMonth: 3, current: true })).toBe("Mar 2021 – Present");
    expect(experienceDates({ title: "A", organization: "B", startYear: 2016, endYear: 2019 })).toBe("2016 – 2019");
    expect(experienceDates({ title: "A", organization: "B", startYear: 2020, startMonth: 5, endYear: 2020, endMonth: 5 })).toBe("May 2020");
    expect(experienceDates({ title: "A", organization: "B", period: "2019 – now" })).toBe("2019 – now");
    expect(experienceDates({ title: "A", organization: "B" })).toBeNull();
  });

  it("counts time in a role like LinkedIn, both ends included", () => {
    expect(experienceDuration({ title: "A", organization: "B", startYear: 2022, startMonth: 2, current: true }, NOW)).toBe("4 yrs 10 mos");
    expect(experienceDuration({ title: "A", organization: "B", startYear: 2020, startMonth: 1, endYear: 2020, endMonth: 12 }, NOW)).toBe("1 yr");
    expect(experienceDuration({ title: "A", organization: "B", startYear: 2020, endYear: 2022 }, NOW)).toBeNull();
    expect(formatDuration(3)).toBe("3 mos");
    expect(formatDuration(25)).toBe("2 yrs 1 mo");
  });

  it("groups consecutive roles at one company and totals the time there", () => {
    const groups = groupExperience(
      [
        { title: "Design director", organization: "Studio X", startYear: 2023, startMonth: 1, current: true },
        { title: "Senior designer", organization: "studio x", organizationUrl: "https://studiox.com", startYear: 2020, startMonth: 1, endYear: 2022, endMonth: 12 },
        { title: "Designer", organization: "Bank", startYear: 2018, startMonth: 1, endYear: 2019, endMonth: 12 },
      ],
      NOW,
    );
    expect(groups.map((g) => [g.organization, g.roles.length])).toEqual([
      ["Studio X", 2],
      ["Bank", 1],
    ]);
    expect(groups[0].organizationUrl).toBe("https://studiox.com");
    expect(groups[0].duration).toBe("6 yrs 11 mos");
    expect(groups[1].duration).toBeNull();
  });

  it("formats education", () => {
    expect(educationTitle({ school: "TSU", degree: "BSc", field: "Computer science" })).toBe("BSc, Computer science");
    expect(educationTitle({ school: "TSU" })).toBe("");
    expect(educationDates({ school: "TSU", startYear: 2012, endYear: 2016 })).toBe("2012 – 2016");
    expect(educationDates({ school: "TSU", endYear: 2016 })).toBe("2016");
    expect(educationDates({ school: "TSU" })).toBeNull();
  });
});
