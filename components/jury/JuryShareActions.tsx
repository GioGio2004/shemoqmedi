"use client";

import { useState } from "react";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const button =
  "inline-flex min-h-[42px] items-center rounded-full border border-black/12 bg-white px-4.5 text-[11px] font-semibold tracking-[0.06em] text-black uppercase transition-colors hover:border-black";

/** The issuer as the LinkedIn company page is named. */
const LINKEDIN_ORG_NAME = "shemoqmedi.space";
/**
 * The LinkedIn company page's numeric ID (linkedin.com/company/<id>/admin).
 * With it LinkedIn links the issuer to the page and shows its logo; without
 * it the issuer is plain text.
 */
const LINKEDIN_ORG_ID: string | null = null;

/**
 * LinkedIn's "Add to profile" link: lists the jury seat under the member's
 * Licenses & certifications, linking back to their jury page.
 */
export function addToLinkedInUrl(slug: string, joinedAt?: number) {
  const d = joinedAt ? new Date(joinedAt) : new Date();
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: "Jury Member, Shemoqmedi Awards",
    ...(LINKEDIN_ORG_ID ? { organizationId: LINKEDIN_ORG_ID } : { organizationName: LINKEDIN_ORG_NAME }),
    issueYear: String(d.getFullYear()),
    issueMonth: String(d.getMonth() + 1),
    certUrl: absoluteUrl(`/jury/${slug}`),
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/**
 * Copy link and LinkedIn share for a jury page. `owner` (the juror's own
 * profile editor) adds "Add to LinkedIn profile".
 */
export function JuryShareActions({
  slug,
  joinedAt,
  owner,
  className,
}: {
  slug: string;
  joinedAt?: number;
  owner?: boolean;
  className?: string;
}) {
  const url = absoluteUrl(`/jury/${slug}`);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the jury page link:", url);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {owner && (
        <a
          href={addToLinkedInUrl(slug, joinedAt)}
          target="_blank"
          rel="nofollow noopener"
          className={cn(button, "border-black bg-black text-white hover:bg-black/85")}
        >
          Add to LinkedIn profile
        </a>
      )}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="nofollow noopener"
        className={button}
      >
        Share on LinkedIn
      </a>
      <button type="button" onClick={() => void copy()} className={button}>
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
