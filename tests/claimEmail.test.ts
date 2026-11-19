import { describe, expect, it } from "vitest";
import { matchesEmailHint } from "@/lib/claimEmail";

describe("matchesEmailHint", () => {
  it("accepts the invited address in any case", () => {
    expect(matchesEmailHint("Ana.Beridze@Gmail.com", "an•••@gmail.com")).toBe(true);
    expect(matchesEmailHint("a@x.io", "a•••@x.io")).toBe(true);
  });

  it("flags another domain or another name", () => {
    expect(matchesEmailHint("ana@studio.ge", "an•••@gmail.com")).toBe(false);
    expect(matchesEmailHint("bob@gmail.com", "an•••@gmail.com")).toBe(false);
  });

  it("never warns on a hint it can't read", () => {
    expect(matchesEmailHint("ana@gmail.com", "something else")).toBe(true);
  });
});
