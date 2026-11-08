"use client";

import { useState } from "react";
import { PillLink } from "@/components/site/ui";
import { absoluteUrl } from "@/lib/site";

const action =
  "inline-flex min-h-[46px] items-center rounded-full border border-black/12 bg-white px-5 text-[11.5px] font-semibold tracking-[0.05em] text-black uppercase transition-colors hover:border-black";

/** After claiming a jury spot: share the public jury page, then start scoring. */
export function JuryShare({ slug }: { slug: string }) {
  const url = absoluteUrl(`/jury/${slug}`);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your jury page link:", url);
    }
  }

  return (
    <div className="grid content-start gap-6 rounded-3xl border border-black/10 p-6 md:p-8">
      <div className="grid gap-2">
        <p className="eyebrow">Share your badge</p>
        <p className="text-2xl font-semibold tracking-[-0.04em]">Your jury page is live.</p>
        <p className="font-mono text-xs break-all text-black/55">{url}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => void copy()} className={action}>
          <span aria-live="polite">{copied ? "Link copied" : "Copy share link"}</span>
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener"
          className={action}
        >
          Share on LinkedIn
        </a>
      </div>
      <div className="grid gap-3 border-t border-black/10 pt-6">
        <p className="text-sm text-black/60">
          Open any site in live voting and use the Evaluate button in the bottom-right corner to score it.
        </p>
        <PillLink href="/collections/nominees" className="justify-self-start">
          Score your first website
        </PillLink>
      </div>
    </div>
  );
}
