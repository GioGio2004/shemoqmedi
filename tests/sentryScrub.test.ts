// Claim tokens never reach Sentry (lib/sentryScrub.ts, audit E-01).
import { describe, expect, it } from "vitest";
import { scrubDeep, scrubText } from "@/lib/sentryScrub";

describe("scrubText", () => {
  it("redacts the token in a claim path, relative or absolute", () => {
    expect(scrubText("/claim/abc123XYZ")).toBe("/claim/[redacted]");
    expect(scrubText("https://www.shemoqmedi.space/claim/abc123?x=1#top")).toBe(
      "https://www.shemoqmedi.space/claim/[redacted]?x=1#top",
    );
    expect(scrubText('Error loading "/claim/s3cr3t/extra"')).toBe('Error loading "/claim/[redacted]/extra"');
  });

  it("redacts token and key query values and keeps the rest", () => {
    expect(scrubText("/vote/x?token=abc&ref=home")).toBe("/vote/x?token=[redacted]&ref=home");
    expect(scrubText("/a?ref=1&KEY=zzz#h")).toBe("/a?ref=1&KEY=[redacted]#h");
    expect(scrubText("/a?monkey=1")).toBe("/a?monkey=1");
  });

  it("leaves ordinary text and Next's route pattern readable", () => {
    expect(scrubText("/sites/kencho")).toBe("/sites/kencho");
    expect(scrubText("GET /claim/[key]")).toBe("GET /claim/[redacted]");
  });
});

describe("scrubDeep", () => {
  it("scrubs every string in an event and its breadcrumbs, without touching the original", () => {
    const event = {
      transaction: "/claim/tok1",
      request: {
        url: "https://www.shemoqmedi.space/claim/tok2?token=tok3",
        query_string: [["token", "tok4"], ["ref", "x"]],
        headers: { Referer: "https://www.shemoqmedi.space/claim/tok5" },
      },
      exception: { values: [{ type: "Error", value: "fetch /claim/tok6 failed" }] },
      breadcrumbs: [{ category: "navigation", data: { from: "/", to: "/claim/tok7" } }],
      extra: { key: "tok8", count: 3, ok: true, none: null },
    };
    const original = JSON.stringify(event);
    const out = JSON.stringify(scrubDeep(event));
    for (let i = 1; i <= 8; i++) expect(out).not.toContain(`tok${i}`);
    expect(out).toContain('"ref","x"');
    expect(out).toContain('"count":3');
    expect(JSON.stringify(event)).toBe(original);
  });

  it("redacts a query string object's token and key, and sign-in headers", () => {
    expect(scrubDeep({ token: "a", key: "b", page: "2" })).toEqual({ token: "[redacted]", key: "[redacted]", page: "2" });
    expect(scrubDeep({ Authorization: "Bearer abc", cookie: "__session=x", accept: "text/html" })).toEqual({
      Authorization: "[redacted]",
      cookie: "[redacted]",
      accept: "text/html",
    });
  });
});
