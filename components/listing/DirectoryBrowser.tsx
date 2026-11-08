"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicListing } from "@/convex-helpers-api";
import { PillLink } from "@/components/site/ui";
import { CATEGORIES, REGIONS, TECHNOLOGIES, listingCategories } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { useDragScroll } from "@/lib/useDragScroll";
import { ListingCard } from "./ListingCard";

// The home directory: a sticky bar of single-select pill groups (combined with
// AND) over the full listing grid. Filtering happens in memory; the selection
// is mirrored to ?award=&category=&region=&tech= with history.replaceState so
// links are shareable while the page itself stays static.

type Key = "award" | "category" | "region" | "tech";
type Filters = Record<Key, string | null>;
type Option = { value: string; label: string };

const EMPTY: Filters = { award: null, category: null, region: null, tech: null };
const KEYS: Key[] = ["award", "category", "region", "tech"];

const AWARD_OPTIONS: Option[] = [
  { value: "sotd", label: "SOTD" },
  { value: "bsc", label: "BSC (Solo)" },
  { value: "nominees", label: "Nominees" },
];

const REGION_OPTIONS: Option[] = REGIONS.map((r) => ({ value: r.slug, label: r.name }));

/** Always offered, in this order; other technologies follow when present. */
const CORE_TECH = ["nextjs", "webgl", "threejs", "tailwind", "convex"];

function matchAward(listing: PublicListing, award: string) {
  if (award === "sotd") return listing.awards.includes("SOTD");
  if (award === "bsc") return listing.awards.includes("BSC");
  if (award === "nominees") return listing.status === "in_voting";
  return true;
}

function techName(slug: string) {
  return TECHNOLOGIES.find((t) => t.slug === slug)?.name ?? null;
}

function matches(listing: PublicListing, f: Filters) {
  if (f.award && !matchAward(listing, f.award)) return false;
  if (f.category && !listingCategories(listing).includes(f.category)) return false;
  if (f.region && listing.region !== f.region) return false;
  if (f.tech) {
    const name = techName(f.tech);
    if (!name || !listing.technologies.includes(name)) return false;
  }
  return true;
}

function readUrl(options: Record<Key, Option[]>): Filters {
  const params = new URLSearchParams(window.location.search);
  const out: Filters = { ...EMPTY };
  for (const key of KEYS) {
    const value = params.get(key);
    if (value && options[key].some((o) => o.value === value)) out[key] = value;
  }
  return out;
}

function writeUrl(f: Filters) {
  const url = new URL(window.location.href);
  for (const key of KEYS) {
    const value = f[key];
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function DirectoryBrowser({ listings }: { listings: PublicListing[] }) {
  const options = useMemo<Record<Key, Option[]>>(() => {
    const categories = new Set(listings.flatMap(listingCategories));
    const techs = new Set(listings.flatMap((l) => l.technologies));
    return {
      award: AWARD_OPTIONS,
      category: CATEGORIES.filter((c) => categories.has(c.slug)).map((c) => ({
        value: c.slug,
        label: c.name,
      })),
      region: REGION_OPTIONS,
      tech: [
        ...CORE_TECH.map((slug) => TECHNOLOGIES.find((t) => t.slug === slug)),
        ...TECHNOLOGIES.filter((t) => !CORE_TECH.includes(t.slug) && techs.has(t.name)),
      ]
        .filter((t) => t !== undefined)
        .map((t) => ({ value: t.slug, label: t.name })),
    };
  }, [listings]);

  const [filters, setFilters] = useState<Filters>(EMPTY);
  // The pill strip is wider than the screen; let a mouse drag it sideways.
  const strip = useRef<HTMLDivElement>(null);
  useDragScroll(strip);

  // Initial selection comes from the URL after mount (not searchParams), so
  // the page can stay force-static.
  useEffect(() => {
    const initial = readUrl(options);
    if (KEYS.some((k) => initial[k] !== null)) {
      setFilters(initial); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of the URL after hydration
    }
  }, [options]);

  const update = (next: Filters) => {
    setFilters(next);
    writeUrl(next);
  };
  const toggle = (key: Key, value: string | null) =>
    update({ ...filters, [key]: filters[key] === value ? null : value });

  const results = useMemo(() => listings.filter((l) => matches(l, filters)), [listings, filters]);
  const active = KEYS.some((k) => filters[k] !== null);

  const groups: { key: Key; label: string }[] = [
    { key: "award", label: "Award" },
    { key: "category", label: "Category" },
    { key: "region", label: "Region" },
    { key: "tech", label: "Tech" },
  ];

  return (
    <section id="directory" aria-labelledby="directory-title" className="border-t border-black/10 pt-16 pb-24 md:pt-24">
      <div className="container-site">
        <p className="eyebrow">Directory</p>
        <h2
          id="directory-title"
          className="mt-3 text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.055em]"
        >
          All websites
        </h2>
      </div>

      <div className="sticky top-20 z-30 mt-10 border-y border-black/10 bg-white/90 backdrop-blur md:top-[88px] md:mt-12">
        <div className="container-site flex items-center gap-4 py-3">
          <div
            ref={strip}
            role="group"
            aria-label="Filter websites"
            className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] pointer-fine:cursor-grab [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex w-max items-center gap-5">
              {groups.map(({ key, label }, i) => (
                <div key={key} role="group" aria-label={label} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true" className="mr-3.5 h-5 w-px bg-black/10" />}
                  <span className="eyebrow mr-1.5">{label}</span>
                  <FilterPill active={filters[key] === null} onClick={() => update({ ...filters, [key]: null })}>
                    All
                  </FilterPill>
                  {options[key].map((o) => (
                    <FilterPill key={o.value} active={filters[key] === o.value} onClick={() => toggle(key, o.value)}>
                      {o.label}
                    </FilterPill>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <p aria-live="polite" className="font-mono text-[10.5px] font-medium tracking-[0.08em] whitespace-nowrap uppercase tabular-nums">
              {results.length} {results.length === 1 ? "site" : "sites"}
            </p>
            <button
              type="button"
              onClick={() => update(EMPTY)}
              disabled={!active}
              className="text-[11px] font-medium tracking-[0.04em] uppercase underline-offset-4 hover:underline disabled:pointer-events-none disabled:text-black/30"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="container-site mt-10 md:mt-12">
        {listings.length === 0 ? (
          <EmptyState title="Nothing listed here yet." />
        ) : results.length === 0 ? (
          <EmptyState title="Nothing matches these filters.">
            <button
              type="button"
              onClick={() => update(EMPTY)}
              className="inline-flex min-h-[46px] items-center rounded-full border border-black/12 px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase hover:border-black"
            >
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {results.map((listing) => (
              <li key={listing.slug}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Button twin of the Tag in components/site/ui.tsx. */
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-full border px-3.5 text-[11px] font-medium tracking-[0.04em] whitespace-nowrap uppercase transition-colors",
        active ? "border-black bg-black text-white" : "border-black/12 text-black hover:border-black",
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-6 rounded-3xl border border-black/10 p-8 md:p-12">
      <p className="max-w-lg text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
        {title}
      </p>
      {children ?? <PillLink href="/submit">Submit a site</PillLink>}
    </div>
  );
}
