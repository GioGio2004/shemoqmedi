import { describe, expect, it } from "vitest";
import { addToLinkedInUrl } from "@/components/jury/JuryShareActions";

describe("Add to LinkedIn profile link", () => {
  it("names shemoqmedi.space as the issuer, as the LinkedIn company page is called", () => {
    const url = new URL(addToLinkedInUrl("ana-beridze", Date.UTC(2026, 10, 3)));
    expect(url.origin + url.pathname).toBe("https://www.linkedin.com/profile/add");
    expect(url.searchParams.get("startTask")).toBe("CERTIFICATION_NAME");
    expect(url.searchParams.get("name")).toBe("Jury Member, Shemoqmedi Awards");
    expect(url.searchParams.get("organizationName")).toBe("shemoqmedi.space");
    expect(url.searchParams.get("issueYear")).toBe("2026");
    expect(url.searchParams.get("issueMonth")).toBe("11");
    expect(url.searchParams.get("certUrl")).toMatch(/\/jury\/ana-beridze$/);
  });
});
