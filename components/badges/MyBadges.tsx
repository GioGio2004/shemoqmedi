"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import { BADGE_H, BADGE_W, badgeLabel, embedCode, type BadgeTheme } from "@/lib/badgeSvg";
import { cn } from "@/lib/utils";

const ORIGIN = "https://www.shemoqmedi.space";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          // Clipboard blocked: the code is selectable in the box.
        }
      }}
      className="min-h-10 rounded-full bg-black px-5 text-[11px] font-semibold tracking-[0.06em] text-white uppercase"
    >
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}

/**
 * The signed-in owner's badges: one per award their sites won, light or dark.
 * Only verified owners see this, and a badge exists only for a real award.
 */
export function MyBadges() {
  const awards = useQuery(api.awards.mine, {});
  const [theme, setTheme] = useState<BadgeTheme>("light");

  if (awards === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (awards.length === 0) {
    return (
      <div className="grid max-w-xl gap-4 rounded-3xl border border-black/10 p-6 md:p-8">
        <p className="text-xl font-semibold tracking-[-0.03em]">No awards on your sites yet.</p>
        <p className="text-sm leading-relaxed text-black/60">
          Badges are only for sites that won an award, and only their verified owner can get one. If your site won and
          isn&apos;t listed here, claim it from its page first.
        </p>
        <Link href="/how-we-score" className="text-sm underline underline-offset-4">
          How awards work
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="eyebrow mb-3 text-black">Style</legend>
        {(["light", "dark"] as const).map((t) => (
          <label
            key={t}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase",
              theme === t ? "border-black bg-black text-white" : "border-black/14 hover:border-black",
            )}
          >
            <input type="radio" name="theme" value={t} checked={theme === t} onChange={() => setTheme(t)} className="sr-only" />
            {t === "light" ? "Light" : "Dark"}
          </label>
        ))}
      </fieldset>

      <ul className="grid gap-6 lg:grid-cols-2">
        {awards.map((a) => {
          const label = badgeLabel(a.tier, a.period, a.date);
          const code = embedCode(ORIGIN, a.slug, label, theme);
          return (
            <li key={a.slug} className="grid gap-5 rounded-3xl border border-black/10 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-semibold tracking-[-0.02em]">{a.listing.title}</p>
                  <p className="text-xs text-black/55">{label}</p>
                </div>
                <Link href={`/awards/${a.slug}`} className="text-xs underline underline-offset-4">
                  Award page
                </Link>
              </div>
              <div className={cn("grid place-items-center rounded-2xl p-6", theme === "dark" ? "bg-black" : "bg-black/[0.03]")}>
                {/* eslint-disable-next-line @next/next/no-img-element -- the award's own SVG badge */}
                <img src={`/badge/${a.slug}?theme=${theme}`} alt={label} width={BADGE_W} height={BADGE_H} />
              </div>
              <textarea
                readOnly
                value={code}
                rows={4}
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`Embed code for ${label}`}
                className="w-full resize-none rounded-xl border border-black/14 bg-white px-3.5 py-3 font-mono text-[11px] leading-relaxed"
              />
              <div className="flex flex-wrap items-center gap-4">
                <CopyButton text={code} />
                <span className="text-xs text-black/55">Paste it in your footer or anywhere in your page&apos;s HTML.</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
