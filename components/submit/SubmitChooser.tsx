"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowIcon } from "@/components/site/ui";
import { cn } from "@/lib/utils";

// What a signed-in person sees at /submit (proxy.ts shows this page in its
// place): two full-height cards side by side, the 30-second form on the left
// and the full form on the right; stacked on phones. Campaign tags (utm_*) in
// the address are carried into whichever form they pick.

type Choice = {
  href: string;
  eyebrow: string;
  title: string;
  text: string;
  note: string;
  cta: string;
  solid?: boolean;
};

const CHOICES: Choice[] = [
  {
    href: "/submit?form=quick",
    eyebrow: "30 seconds",
    title: "Quick submission",
    text: "Just the site's name, its link and your email. Our editors write the listing and make the screenshots for you.",
    note: "Takes longer to go live than the full form: our team prepares everything by hand first.",
    cta: "Start the quick form",
  },
  {
    href: "/submit/full",
    eyebrow: "Full form",
    title: "Full submission",
    text: "Write your own listing: description, categories, credits, your screenshots and a preview video.",
    note: "Usually faster to go live: your listing is ready for review the moment you send it.",
    cta: "Start the full form",
    solid: true,
  },
];

function withTags(href: string, params: URLSearchParams) {
  const tags = [...params].filter(([key]) => key.startsWith("utm_"));
  if (!tags.length) return href;
  const url = new URL(href, "https://x");
  for (const [key, value] of tags) url.searchParams.set(key, value);
  return url.pathname + url.search;
}

export function SubmitChooser() {
  const params = useSearchParams();
  return (
    <div className="grid flex-1 gap-3 md:grid-cols-2 md:gap-4">
      {CHOICES.map((c) => (
        <Link
          key={c.href}
          href={withTags(c.href, params)}
          className={cn(
            "group relative flex flex-col justify-between gap-5 overflow-hidden rounded-[24px] border p-6 transition-colors duration-300 md:gap-10 md:rounded-[28px] md:p-10 lg:p-14",
            c.solid
              ? "border-black bg-black text-white"
              : "border-black/12 bg-white text-black hover:border-black",
          )}
        >
          <div className="grid gap-3 md:gap-5">
            {/* Not .eyebrow on the solid card: the orange theme paints eyebrows orange, the card's own colour. */}
            <p
              className={cn(
                c.solid ? "text-[11px] font-medium tracking-[0.06em] text-white/70 uppercase" : "eyebrow",
              )}
            >
              {c.eyebrow}
            </p>
            <h2 className="text-[clamp(1.85rem,6.5vw,5.5rem)] leading-[0.92] font-semibold tracking-[-0.055em]">
              {c.title}
            </h2>
            <p className={cn("max-w-md text-[14px] leading-relaxed md:text-base", c.solid ? "text-white/75" : "text-black/65")}>
              {c.text}
            </p>
          </div>
          <div className="grid gap-4 md:gap-6">
            <p
              className={cn(
                "max-w-md border-t pt-3 text-[12.5px] leading-relaxed md:pt-4 md:text-[13px]",
                c.solid ? "border-white/20 text-white/70" : "border-black/10 text-black/55",
              )}
            >
              {c.note}
            </p>
            <span className="flex items-center justify-between gap-4">
              <span className="text-[12px] font-semibold tracking-[0.05em] uppercase">{c.cta}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none md:size-16",
                  c.solid ? "bg-white text-black" : "bg-black text-white",
                )}
              >
                <ArrowIcon />
              </span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
