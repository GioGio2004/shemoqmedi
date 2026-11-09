"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api, type PublicAward } from "@/convex-helpers-api";
import {
  SIGNATURE_THEME,
  badgeLabel,
  badgePath,
  embedCode,
  type BadgeShape,
  type BadgeTheme,
} from "@/lib/badgeInfo";
import { cn } from "@/lib/utils";

const ORIGIN = "https://www.shemoqmedi.space";

type Size = "s" | "m" | "l";
type Look = "own" | BadgeTheme;
type Options = { shape: BadgeShape; look: Look; size: Size; corner: boolean; motion: boolean };

/** Height on the page, in px. The seal is square; the tag's width follows its text. */
const HEIGHTS: Record<BadgeShape, Record<Size, number>> = {
  seal: { s: 96, m: 128, l: 168 },
  tag: { s: 40, m: 56, l: 72 },
};

const pill = (on: boolean) =>
  cn(
    "inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
    on ? "border-black bg-black text-white" : "border-black/14 hover:border-black",
  );

function Choice<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="grid gap-2.5">
      <legend className="eyebrow mb-1 text-black">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([slug, label]) => (
          <label key={slug} className={pill(value === slug)}>
            <input type="radio" name={name} value={slug} checked={value === slug} onChange={() => onChange(slug)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2200);
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
      className={cn(
        "min-h-11 rounded-full px-6 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors",
        copied ? "border border-black bg-white text-black" : "bg-black text-white",
      )}
    >
      <span aria-live="polite">{copied ? "Copied. Paste it in your site" : "Copy embed code"}</span>
    </button>
  );
}

function BadgeCard({ award, options }: { award: PublicAward; options: Options }) {
  const { shape, look, size, corner, motion } = options;
  const theme = look === "own" ? undefined : look;
  const label = badgeLabel(award.tier, award.period, award.date);
  const path = badgePath(award.slug, { shape, theme, motion });
  // A tag is as wide as its lettering: read the real proportions off the image.
  const [ratio, setRatio] = useState<{ key: string; value: number } | null>(null);
  const known = shape === "seal" ? 1 : ratio?.key === `${award.slug}|${shape}` ? ratio.value : null;
  const height = HEIGHTS[shape][size];
  const width = Math.round(height * (known ?? 4.2));
  const code = embedCode({ origin: ORIGIN, slug: award.slug, label, shape, theme, motion, width, height, corner });
  const onDark = (theme ?? SIGNATURE_THEME[award.tier]) === "light";

  return (
    <li className="grid gap-5 rounded-3xl border border-black/10 p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-[-0.02em]">{award.listing.title}</p>
          <p className="text-xs text-black/55">{label}</p>
        </div>
        <Link href={`/awards/${award.slug}`} className="text-xs underline underline-offset-4">
          Award page
        </Link>
      </div>

      {/* The badge at the size it will have on the page, on the opposite tone so its edge shows. */}
      <div className={cn("grid min-h-[208px] place-items-center rounded-2xl p-6 transition-colors", onDark ? "bg-black" : "bg-black/[0.04]")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the award's own SVG badge */}
        <img
          key={path}
          src={path}
          alt={label}
          height={height}
          width={known ? width : undefined}
          style={{ height, width: known ? width : "auto" }}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalHeight) setRatio({ key: `${award.slug}|${shape}`, value: img.naturalWidth / img.naturalHeight });
          }}
        />
      </div>

      <textarea
        readOnly
        value={code}
        rows={4}
        onFocus={(e) => e.currentTarget.select()}
        aria-label={`Embed code for ${label}`}
        className="w-full resize-none rounded-xl border border-black/14 bg-white px-3.5 py-3 font-mono text-[11px] leading-relaxed outline-none focus:border-black"
      />
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <CopyButton text={code} />
        <a href={path} download={`${award.slug}-${shape}.svg`} className="text-xs underline underline-offset-4">
          Download SVG
        </a>
        <span className="font-mono text-[11px] text-black/55 tabular-nums">
          {width} × {height}
        </span>
      </div>
    </li>
  );
}

/**
 * The signed-in owner's badges: one card per award their sites won. Pick the
 * shape, colours, size and placement once, then copy each badge's code. Only
 * verified owners see this, and a badge exists only for a real award.
 */
export function MyBadges() {
  const awards = useQuery(api.awards.mine, {});
  const [options, setOptions] = useState<Options>({ shape: "tag", look: "own", size: "m", corner: false, motion: false });
  const set = <K extends keyof Options>(key: K, value: Options[K]) => setOptions((o) => ({ ...o, [key]: value }));

  if (awards === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (awards.length === 0) {
    return (
      <div className="grid max-w-xl gap-4 rounded-3xl border border-black/10 p-6 md:p-8">
        <p className="text-xl font-semibold tracking-[-0.03em]">No awards on your sites yet.</p>
        <p className="text-sm leading-relaxed text-black/60">
          Badges are only for sites that won an award, and only their verified owner can get one. If your site won and
          isn&apos;t listed here, claim it from its page first.
        </p>
        <Link href="/badges" className="text-sm underline underline-offset-4">
          See the badges and how to earn one
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap gap-x-10 gap-y-6 rounded-3xl border border-black/10 p-5 md:p-6">
        <Choice
          legend="Shape"
          name="shape"
          value={options.shape}
          onChange={(v) => setOptions((o) => ({ ...o, shape: v, corner: v === "seal" ? o.corner : false }))}
          options={[
            ["tag", "Tag"],
            ["seal", "Seal"],
          ]}
        />
        <Choice
          legend="Colours"
          name="look"
          value={options.look}
          onChange={(v) => set("look", v)}
          options={[
            ["own", "Its own"],
            ["light", "Light"],
            ["dark", "Dark"],
          ]}
        />
        <Choice
          legend="Size"
          name="size"
          value={options.size}
          onChange={(v) => set("size", v)}
          options={[
            ["s", "Small"],
            ["m", "Medium"],
            ["l", "Large"],
          ]}
        />
        <Choice
          legend="Placement"
          name="corner"
          value={options.corner ? "corner" : "inline"}
          onChange={(v) => setOptions((o) => ({ ...o, corner: v === "corner", shape: v === "corner" ? "seal" : o.shape }))}
          options={[
            ["inline", "In the page"],
            ["corner", "Pinned corner"],
          ]}
        />
        <Choice
          legend="Motion"
          name="motion"
          value={options.motion ? "on" : "off"}
          onChange={(v) => set("motion", v === "on")}
          options={[
            ["off", "Still"],
            ["on", "Crow hops"],
          ]}
        />
      </div>

      <ul className="grid gap-6 lg:grid-cols-2">
        {awards.map((a) => (
          <BadgeCard key={a.slug} award={a} options={options} />
        ))}
      </ul>

      <ol className="grid gap-6 border-t border-black/10 pt-8 text-sm leading-relaxed text-black/60 md:grid-cols-3">
        <li>
          <span className="font-mono text-[11px] text-black/45">01</span>
          <p className="mt-1">
            <strong className="font-semibold text-black">Copy</strong> the code of the badge you want.
          </p>
        </li>
        <li>
          <span className="font-mono text-[11px] text-black/45">02</span>
          <p className="mt-1">
            <strong className="font-semibold text-black">Paste</strong> it in your footer&apos;s HTML, or in an Embed /
            Custom HTML block in Webflow, Framer, Wix or WordPress.
          </p>
        </li>
        <li>
          <span className="font-mono text-[11px] text-black/45">03</span>
          <p className="mt-1">
            <strong className="font-semibold text-black">Done.</strong> The badge is one small image that links to your
            award page. A pinned corner badge stays at the bottom right of the window.
          </p>
        </li>
      </ol>
    </div>
  );
}
