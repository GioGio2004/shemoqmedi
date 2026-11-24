import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_AVATAR_COUNT, defaultAvatarUrl } from "@/lib/defaultAvatar";

describe("defaultAvatarUrl", () => {
  it("gives the same person the same avatar every time", () => {
    expect(defaultAvatarUrl("holy-motors")).toBe(defaultAvatarUrl("holy-motors"));
  });

  it("points at a file that exists, for any key", () => {
    for (const key of ["", "a", "holy-motors", "leavingstone", "user_2abcDEF", "ბაჩო ლაბაძე"]) {
      const url = defaultAvatarUrl(key);
      expect(url).toMatch(/^\/avatars\/avatar-\d{2}\.svg$/);
      expect(existsSync(join(process.cwd(), "public", url))).toBe(true);
    }
  });

  it("has a file for every number it can return", () => {
    for (let n = 1; n <= DEFAULT_AVATAR_COUNT; n++) {
      expect(existsSync(join(process.cwd(), "public", "avatars", `avatar-${String(n).padStart(2, "0")}.svg`))).toBe(true);
    }
    expect(existsSync(join(process.cwd(), "public", "avatars", `avatar-${DEFAULT_AVATAR_COUNT + 1}.svg`))).toBe(false);
  });

  it("spreads people across the set", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 400; i++) seen.add(defaultAvatarUrl(`creator-${i}`));
    expect(seen.size).toBe(DEFAULT_AVATAR_COUNT);
  });

  it("uses the avatar someone picked, and ignores anything that isn't one", () => {
    expect(defaultAvatarUrl("holy-motors", "07")).toBe("/avatars/avatar-07.svg");
    expect(defaultAvatarUrl("holy-motors", "24")).toBe("/avatars/avatar-24.svg");
    for (const bad of [null, undefined, "", "photo", "00", "25", "7", "../x"]) {
      expect(defaultAvatarUrl("holy-motors", bad)).toBe(defaultAvatarUrl("holy-motors"));
    }
  });
});
