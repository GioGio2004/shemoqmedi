import { describe, expect, it } from "vitest";
import { escapeSitemap, xmlEscape } from "@/lib/sitemapXml";

describe("sitemap escaping", () => {
  it("escapes the five XML entities and drops forbidden control characters", () => {
    expect(xmlEscape(`A & B <c> "d" 'e'\u0001`)).toBe("A &amp; B &lt;c&gt; &quot;d&quot; &apos;e&apos;");
  });

  it("escapes nested video fields and keeps dates", () => {
    const when = new Date("2026-11-19T00:00:00Z");
    const [entry] = escapeSitemap([
      { url: "https://x.test/a?b=1&c=2", lastModified: when, videos: [{ title: "Photo & Film", description: "d", thumbnail_loc: "t" }] },
    ]);
    expect(entry.url).toBe("https://x.test/a?b=1&amp;c=2");
    expect(entry.lastModified).toBe(when);
    expect(entry.videos?.[0].title).toBe("Photo &amp; Film");
  });
});
