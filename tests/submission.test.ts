import { describe, expect, it } from "vitest";
import { fullFormHref, isOpenSubmission, siteKey } from "@/lib/submission";

// The full form (/submit/full) completes a 30-second submission of the same
// website. "Same website" must mean what the server means (domainKey in the
// backend's convex/lib/domains.ts), or the form would promise a completion
// the server doesn't make.
describe("siteKey", () => {
  it("ignores the protocol, www and a trailing slash", () => {
    const key = siteKey("https://studionord.com");
    expect(key).toBe("studionord.com");
    for (const url of ["studionord.com", "http://www.studionord.com/", "HTTPS://WWW.StudioNord.com", "  studionord.com/  "]) {
      expect(siteKey(url)).toBe(key);
    }
  });

  it("keeps the path, so two sites on one host stay apart", () => {
    expect(siteKey("https://example.com/work/")).toBe("example.com/work");
    expect(siteKey("example.com/work")).not.toBe(siteKey("example.com/shop"));
    expect(siteKey("example.com/work")).not.toBe(siteKey("example.com"));
  });

  it("drops the query and hash, and never throws on junk", () => {
    expect(siteKey("https://example.com/?utm_source=x#top")).toBe("example.com");
    expect(siteKey("not a url")).toBe("not a url");
    expect(siteKey("")).toBe("");
  });
});

describe("isOpenSubmission", () => {
  it("is true only while the editors hold it and no listing exists", () => {
    expect(isOpenSubmission({ status: "received", listing: null })).toBe(true);
    expect(isOpenSubmission({ status: "preparing", listing: null })).toBe(true);
    expect(isOpenSubmission({ status: "listed", listing: { slug: "studio-nord", status: "pending" } })).toBe(false);
    expect(isOpenSubmission({ status: "rejected", listing: null })).toBe(false);
  });
});

describe("fullFormHref", () => {
  it("points at the full form for one submission", () => {
    expect(fullFormHref("k57abc")).toBe("/submit/full?s=k57abc");
  });
});
