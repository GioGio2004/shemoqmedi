"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import { badgeLabel } from "@/lib/badgeInfo";

const button =
  "inline-flex min-h-[46px] items-center rounded-full px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors";

/**
 * The signed-in owner's certificates, one per award. The images come from
 * /certificate/<award>, which opens only for the site's owner (and admins),
 * so this is the one place a certificate can be seen or downloaded. Its
 * number stays checkable by anyone on /verify.
 */
export function MyCertificates() {
  const awards = useQuery(api.awards.mine, {});
  if (awards === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (awards.length === 0) {
    return <p className="text-sm text-black/55">Each award your sites win comes with a certificate. They appear here.</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((a) => (
        <li key={a.slug} className="grid content-start gap-4">
          <a
            href={`/certificate/${a.slug}`}
            target="_blank"
            rel="noopener"
            aria-label={`Open the ${badgeLabel(a.tier, a.period, a.date)} certificate for ${a.listing.title}`}
            className="block overflow-hidden rounded-2xl border border-black/10 bg-white transition-transform hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- private, generated per request */}
            <img
              src={`/certificate/${a.slug}`}
              alt={`${badgeLabel(a.tier, a.period, a.date)} certificate for ${a.listing.title}`}
              width={1131}
              height={1600}
              loading="lazy"
              className="aspect-[1131/1600] h-auto w-full bg-black/[0.03]"
            />
          </a>
          <div className="grid gap-1">
            <p className="text-base font-semibold tracking-[-0.02em]">{a.listing.title}</p>
            <p className="text-sm text-black/60">{badgeLabel(a.tier, a.period, a.date)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/certificate/${a.slug}?download=1`} className={`${button} bg-black text-white hover:opacity-85`}>
              Download certificate
            </a>
            <a href={`/awards/${a.slug}`} className={`${button} border border-black/15 hover:border-black`}>
              Award page
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
