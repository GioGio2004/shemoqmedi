/**
 * SiteFooter — RULED contact block
 * ─────────────────────────────────────────────────────────────────────────────
 *  - Top hairline with plus-marks, mono micro data row (VOLOO breadcrumb +
 *    Tbilisi coordinates ornament — spec §2.2 / §5.4).
 *  - Column headings in the mono voice; links keep venue theme colors via the
 *    contextual `--v-c-*` frame tokens injected by VenueClientView.
 *  - Bottom micro row between hairlines: © line / MADE WITH ❤ IN TBILISI.
 *  - Safe-area aware bottom padding.
 */

export function SiteFooter({
  organizationName = "KOHI",
  socialLinks = {},
}: {
  organizationName?: string;
  socialLinks?: Record<string, string>;
}) {
  return (
    <footer>
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Top hairline with plus-marks ─────────────────────────────── */}
        <div className="v-shead-rule" aria-hidden="true">
          <span className="v-line-x" />
          <i className="v-plus" data-end="left" />
          <i className="v-plus" data-end="right" />
        </div>

        {/* ── Mono micro data row ──────────────────────────────────────── */}
        <div className="flex justify-between items-baseline gap-4 pt-4 pb-12">
          <span className="v-t-micro" style={{ color: "var(--v-c-faint)" }}>
            VOLOO — {organizationName}
          </span>
          <span
            className="v-t-micro hidden sm:block"
            style={{ color: "var(--v-c-faint)" }}
          >
            41.7151° N · 44.8271° E — TBILISI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div
              className="text-2xl font-serif tracking-wide mb-4 font-bold transition-opacity hover:opacity-80"
              style={{ color: "var(--theme-text, var(--foreground))" }}
            >
              <span style={{ color: "var(--theme-accent, var(--primary))" }}>
                {organizationName.charAt(0)}
              </span>
              {organizationName.slice(1)}
            </div>
            <p
              className="text-sm max-w-sm leading-relaxed"
              style={{ color: "var(--v-c-mut)" }}
            >
              Crafting exceptional experiences. Every detail is a journey
              tailored for you.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="v-t-mono mb-4" style={{ color: "var(--v-c-faint)" }}>
              Navigate
            </h4>
            <ul className="space-y-3">
              {["Menu", "Visit", "About", "Careers"].map((item, i) => (
                <li key={item} className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="v-t-micro"
                    style={{ color: "var(--v-c-faint)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-sm transition-colors hover:opacity-100"
                    style={{ color: "var(--v-c-mut)" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="v-t-mono mb-4" style={{ color: "var(--v-c-faint)" }}>
              Connect
            </h4>
            <ul className="space-y-3">
              {["Instagram", "Twitter", "LinkedIn", "Facebook"].map((item) => {
                const link = socialLinks?.[item.toLowerCase()];
                // Keep some defaults so it doesn't look empty if none are provided
                if (!link && item !== "Instagram" && item !== "Twitter")
                  return null;
                return (
                  <li key={item}>
                    <a
                      href={link || "#"}
                      target={link ? "_blank" : undefined}
                      rel={link ? "noopener noreferrer" : undefined}
                      className="text-sm transition-colors"
                      style={{ color: "var(--v-c-mut)" }}
                    >
                      {item}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Bottom micro row between hairlines ───────────────────────── */}
        <span className="v-line-x" aria-hidden="true" />
        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 py-6"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)",
          }}
        >
          <p className="v-t-micro" style={{ color: "var(--v-c-faint)" }}>
            © {new Date().getFullYear()} {organizationName} — All rights
            reserved
          </p>
          <p className="v-t-micro" style={{ color: "var(--v-c-faint)" }}>
            MADE WITH ❤ IN TBILISI
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="v-t-micro transition-colors hover:opacity-80"
                style={{ color: "var(--v-c-faint)" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
