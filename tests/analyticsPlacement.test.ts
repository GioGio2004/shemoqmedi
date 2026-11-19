import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// /claim/<token> and the sign-in redirect_url carry secret claim tokens.
// Third-party analytics must load only in the (site) layout, never in the
// root layout that also wraps the (auth) pages.
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const TRACKERS = ["cloudflareinsights", "analytics.ahrefs.com", "@vercel/analytics"];

describe("analytics placement", () => {
  it("keeps every tracker out of the root layout and the (auth) layout", () => {
    for (const file of ["app/layout.tsx", "app/(auth)/layout.tsx"]) {
      for (const t of TRACKERS) expect(read(file), `${t} in ${file}`).not.toContain(t);
    }
  });

  it("loads Cloudflare in the public (site) layout and names it in the privacy policy", () => {
    expect(read("app/(site)/layout.tsx")).toContain("cloudflareinsights");
    expect(read("app/(site)/privacy/page.tsx")).toMatch(/Cloudflare: aggregated, cookieless visit statistics/);
  });
});
