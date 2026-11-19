import { describe, expect, it } from "vitest";
import { sizedAvatarUrl } from "@/components/jury/JurorAvatar";

// Audit F-04: preset juror photos were served at full size (838 KB).
describe("sizedAvatarUrl", () => {
  it("asks ImageKit for a square at the given size", () => {
    expect(sizedAvatarUrl("https://ik.imagekit.io/shemoqmedi/jury/a.png", 96)).toBe(
      "https://ik.imagekit.io/shemoqmedi/jury/a.png?tr=w-96%2Ch-96%2Cfo-auto",
    );
  });
  it("leaves Clerk photos, existing transforms and bad URLs alone", () => {
    expect(sizedAvatarUrl("https://img.clerk.com/abc", 96)).toBe("https://img.clerk.com/abc");
    expect(sizedAvatarUrl("https://ik.imagekit.io/x/a.png?tr=w-10", 96)).toBe("https://ik.imagekit.io/x/a.png?tr=w-10");
    expect(sizedAvatarUrl("not a url", 96)).toBe("not a url");
  });
});
