import { describe, expect, it } from "vitest";
import { isGonePath } from "@/lib/gone";
import { KA_PAGES } from "@/lib/kaPages";

describe("isGonePath", () => {
  it("keeps every live Georgian page", () => {
    for (const p of KA_PAGES) expect(isGonePath(p.ka), p.ka).toBe(false);
  });

  it("still retires old Voloo pages under /ka, /en and /ru", () => {
    expect(isGonePath("/ka/menu")).toBe(true);
    expect(isGonePath("/ka/how-we-score/extra")).toBe(true);
    expect(isGonePath("/en")).toBe(true);
    expect(isGonePath("/ru/anything")).toBe(true);
    expect(isGonePath("/menu/abc")).toBe(true);
  });

  it("leaves the live site alone", () => {
    expect(isGonePath("/")).toBe(false);
    expect(isGonePath("/how-we-score")).toBe(false);
    expect(isGonePath("/saved")).toBe(false);
  });
});
