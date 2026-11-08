"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ORIGIN = "https://www.shemoqmedi.space";

const BADGES = [
  { slug: "sotd", name: "Site of the Day" },
  { slug: "bsc", name: "BSC — Best Solo Creation" },
  { slug: "nominee", name: "Official Nominee" },
  { slug: "hm", name: "Honorable Mention" },
] as const;

const THEMES = [
  { slug: "light", name: "Black on white" },
  { slug: "dark", name: "White on black" },
] as const;

const STYLES = [
  { slug: "ribbon", name: "Ribbon", hint: "Inline, 180 × 56" },
  { slug: "corner", name: "Floating corner", hint: "Fixed bottom-right, 120 × 120" },
] as const;

type BadgeSlug = (typeof BADGES)[number]["slug"];
type ThemeSlug = (typeof THEMES)[number]["slug"];
type StyleSlug = (typeof STYLES)[number]["slug"];

/** Accepts a bare slug or any URL containing /sites/<slug>. */
export function parseSlug(raw: string): string {
  const value = raw.trim();
  const fromUrl = value.match(/\/sites\/([^/?#\s]+)/i);
  let candidate = fromUrl ? fromUrl[1] : value;
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    return "";
  }
  candidate = candidate.toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) ? candidate : "";
}

function buildSnippet(badge: BadgeSlug, theme: ThemeSlug, style: StyleSlug, slug: string) {
  const name = BADGES.find((b) => b.slug === badge)!.name;
  const label = badge === "bsc" ? "Best Solo Creation" : name;
  const file = `${badge}-${theme}${style === "corner" ? "-corner" : ""}.svg`;
  const [w, h] = style === "corner" ? [120, 120] : [180, 56];
  const src = `${ORIGIN}/badges/${file}`;
  const link =
    `<a href="${ORIGIN}/sites/${slug}" target="_blank" rel="noopener" title="${label} on shemoqmedi">` +
    `<img src="${src}" alt="${label} — shemoqmedi" width="${w}" height="${h}"></a>`;
  const html =
    style === "corner"
      ? `<div style="position:fixed;right:16px;bottom:16px;z-index:9999">${link}</div>`
      : link;
  return { html, file, w, h, label };
}

function Choice<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly { slug: T; name: string; hint?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="eyebrow mb-1 text-black">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.slug}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
              value === o.slug ? "border-black bg-black text-white" : "border-black/14 hover:border-black",
            )}
            title={o.hint}
          >
            <input
              type="radio"
              name={name}
              value={o.slug}
              checked={value === o.slug}
              onChange={() => onChange(o.slug)}
              className="sr-only"
            />
            {o.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function BadgeGenerator() {
  const [badge, setBadge] = useState<BadgeSlug>("sotd");
  const [theme, setTheme] = useState<ThemeSlug>("light");
  const [style, setStyle] = useState<StyleSlug>("ribbon");
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const snippetRef = useRef<HTMLTextAreaElement>(null);

  // Links from a listing page or the account page open the generator with the
  // listing and its earned badge filled in: /badges?site=<slug>&badge=<badge>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const site = params.get("site");
    const wanted = params.get("badge");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    if (site) setRaw(site);
    const match = BADGES.find((b) => b.slug === wanted);
    if (match) setBadge(match.slug);
  }, []);

  const slug = parseSlug(raw);
  const invalid = raw.trim() !== "" && !slug;
  const { html, file, w, h, label } = buildSnippet(badge, theme, style, slug || "your-site");

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
    } catch {
      // Clipboard blocked (e.g. insecure context): select the text instead.
      snippetRef.current?.select();
    }
  }

  const surface = theme === "dark" ? "bg-black" : "bg-white";

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="grid content-start gap-6 lg:col-span-5">
        <Choice legend="Badge" name="badge" options={BADGES} value={badge} onChange={setBadge} />
        <Choice legend="Theme" name="theme" options={THEMES} value={theme} onChange={setTheme} />
        <Choice legend="Style" name="style" options={STYLES} value={style} onChange={setStyle} />

        <div className="grid gap-2">
          <label htmlFor="badge-slug" className="eyebrow text-black">
            Your listing
          </label>
          <input
            id="badge-slug"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="paper-weather or https://www.shemoqmedi.space/sites/paper-weather"
            aria-invalid={invalid || undefined}
            aria-describedby="badge-slug-hint"
            autoComplete="off"
            spellCheck={false}
            className="min-h-[46px] w-full rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black"
          />
          <p id="badge-slug-hint" className="text-xs text-black/55">
            {invalid
              ? "That doesn't look like a listing. Paste the address of your page on shemoqmedi."
              : slug
                ? `Links to /sites/${slug}`
                : "Type your listing slug or paste your /sites/ page address."}
          </p>
        </div>
      </div>

      <div className="grid content-start gap-6 lg:col-span-7">
        <div className="grid gap-2">
          <p className="eyebrow text-black">Preview</p>
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-black/10",
              surface,
              style === "corner" ? "aspect-[16/10]" : "grid min-h-[200px] place-items-center",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG preview */}
            <img
              src={`/badges/${file}`}
              alt={`${label} — shemoqmedi`}
              width={w}
              height={h}
              className={style === "corner" ? "absolute right-4 bottom-4" : undefined}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="badge-snippet" className="eyebrow text-black">
            HTML
          </label>
          <textarea
            id="badge-snippet"
            ref={snippetRef}
            readOnly
            rows={4}
            value={html}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-none rounded-xl border border-black/14 bg-white px-3.5 py-3 font-mono text-xs leading-relaxed outline-none focus:border-black"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-xs text-black/55">
              Plain links are followed by search engines by default, so no extra attribute is needed.
            </p>
            <button
              type="button"
              onClick={copy}
              disabled={!slug}
              className="inline-flex min-h-[46px] items-center gap-3.5 self-start rounded-full bg-black py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-40 sm:self-auto"
            >
              <span aria-live="polite">{copied ? "Copied" : "Copy HTML"}</span>
              <span className="grid size-9 place-items-center rounded-full bg-white text-black" aria-hidden="true">
                {copied ? "✓" : "↗"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
