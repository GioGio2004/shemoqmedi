import { describe, expect, it } from "vitest";
import { removalAction } from "@/lib/listingRemoval";

const base = { title: "Paper Weather", status: "pending" as const, awards: [], removal: null, canRestore: false };

describe("Your sites: delete vs archive", () => {
  it("offers a permanent delete only when the backend says the site was never public", () => {
    const action = removalAction({ ...base, removal: "delete" });
    expect(action).toMatchObject({ kind: "delete", label: "Withdraw and delete" });
    expect(action!.confirm).toMatch(/for good/);
  });

  it("archives a site that has been public, and says what is kept", () => {
    const action = removalAction({ ...base, status: "awarded", awards: ["SOTD"], removal: "archive" });
    expect(action).toMatchObject({ kind: "archive", label: "Archive" });
    expect(action!.confirm).toMatch(/awards, scores and votes are kept/);
    expect(action!.confirm).toMatch(/restore it any time/);
    expect(action!.confirm).not.toMatch(/deleted for good/);
  });

  it("offers restore for a withdrawn site, and nothing when the user can't act", () => {
    expect(removalAction({ ...base, status: "withdrawn", canRestore: true })).toMatchObject({ kind: "restore" });
    expect(removalAction({ ...base, status: "in_voting", removal: null })).toBeNull();
  });
});
