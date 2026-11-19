import { describe, expect, it, vi } from "vitest";

// AuthUI is a client module; stub the Clerk and Next imports it pulls in.
vi.mock("@clerk/nextjs", () => ({ useAuth: vi.fn(), useClerk: vi.fn() }));
vi.mock("@clerk/nextjs/errors", () => ({ isClerkAPIResponseError: () => false }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@/components/site/ui", () => ({ ArrowIcon: () => null }));

const { safeRedirect } = await import("@/components/auth/AuthUI");
const ORIGIN = "https://www.shemoqmedi.space";
const go = (raw: string | null) => safeRedirect(raw, "/account", ORIGIN);

describe("safeRedirect", () => {
  it("keeps same-site paths, query and hash", () => {
    expect(go("/claim/abc?x=1#top")).toBe("/claim/abc?x=1#top");
    expect(go("https://www.shemoqmedi.space/submit?a=b")).toBe("/submit?a=b");
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "/\t/evil.com",
    "https://evil.com/claim",
    "https://www.shemoqmedi.space.evil.com/",
    "http://www.shemoqmedi.space/",
    "javascript:alert(1)",
    "data:text/html,hi",
    "/%0a/evil.com\n",
  ])("refuses %j", (raw) => {
    expect(go(raw)).toBe("/account");
  });

  it("keeps an encoded tab on our own origin rather than leaving the site", () => {
    expect(go("/%09/evil.com")).toBe("/%09/evil.com");
  });

  it("falls back when there is no value or no origin", () => {
    expect(go(null)).toBe("/account");
    expect(go("")).toBe("/account");
    expect(safeRedirect("/x", "/account", null)).toBe("/account");
  });
});
