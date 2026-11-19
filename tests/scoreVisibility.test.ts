import { describe, expect, it } from "vitest";
import { scoresSealed } from "@/lib/scoreVisibility";

describe("score visibility", () => {
  it("seals scores while a site is in voting", () => {
    expect(scoresSealed({ status: "in_voting", scoresRevealed: false })).toBe(true);
    // An older backend without the flag: in_voting alone seals.
    expect(scoresSealed({ status: "in_voting" })).toBe(true);
  });

  it("reveals them once judging has closed", () => {
    expect(scoresSealed({ status: "archived", scoresRevealed: true })).toBe(false);
    expect(scoresSealed({ status: "awarded", scoresRevealed: true })).toBe(false);
    expect(scoresSealed({ status: "awarded" })).toBe(false);
  });
});
