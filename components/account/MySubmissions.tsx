"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api, type OwnSubmission } from "@/convex-helpers-api";
import { fullFormHref, funnelSource, isOpenSubmission, readRef } from "@/lib/submission";
import { cn } from "@/lib/utils";

// "Your submissions" on the account and jury pages: every site this account
// submitted through /submit and where it stands. Signing in anywhere also
// links this browser's latest submission (the server checks the email). One
// that has no listing yet links to the full form (/submit/full), where its
// creator can write the listing themselves.

const STEPS = ["Received", "Editorial review", "Preparation", "Awaiting approval", "Jury evaluation", "Results"] as const;

/** The step a submission is on, and the line under it. */
function progress(s: OwnSubmission): { step: number; label: string; closed?: boolean } {
  if (s.status === "rejected") return { step: 1, label: "Not accepted this time.", closed: true };
  if (s.status === "received") return { step: 1, label: "With our editors for review." };
  if (s.status === "preparing") return { step: 2, label: "Accepted. We're preparing its listing." };
  switch (s.listing?.status) {
    case "in_voting":
      return { step: 4, label: "Published. The jury is scoring it this week." };
    case "awarded":
    case "archived":
      return { step: 5, label: "Voting closed. Your jury scores are in." };
    case "rejected":
      return { step: 3, label: "Not accepted this time.", closed: true };
    case "withdrawn":
      return { step: 3, label: "Withdrawn.", closed: true };
    default:
      return { step: 3, label: "Listing ready. Waiting for final approval." };
  }
}

const PUBLIC = new Set(["in_voting", "awarded", "archived"]);

export function MySubmissions() {
  const { isAuthenticated } = useConvexAuth();
  const account = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const rows = useQuery(api.quickSubmit.mine, isAuthenticated ? {} : "skip");
  const link = useMutation(api.quickSubmit.link);
  const track = useMutation(api.quickSubmit.track);
  const tried = useRef(false);
  const viewed = useRef(false);

  // This browser's latest submission, if not linked yet (the server only links a matching verified email).
  useEffect(() => {
    if (!account || tried.current) return;
    tried.current = true;
    const ref = readRef();
    if (ref) void link({ id: ref.id, token: ref.token }).catch(() => {});
  }, [account, link]);

  useEffect(() => {
    if (!rows?.length || viewed.current) return;
    viewed.current = true;
    void track({ event: "submission_dashboard_viewed", source: funnelSource() }).catch(() => {});
  }, [rows, track]);

  if (!rows?.length) return null;

  return (
    <section
      aria-labelledby="your-submissions-title"
      className="grid gap-6 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
    >
      <div className="grid content-start gap-2 md:col-span-4 lg:col-span-3">
        <h2
          id="your-submissions-title"
          className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]"
        >
          Your submissions
        </h2>
        <p className="text-sm text-black/55">Where each project stands, from received to results.</p>
      </div>
      <ul className="grid min-w-0 gap-3 md:col-span-8 lg:col-span-9">
        {rows.map((s) => {
          const p = progress(s);
          return (
            <li key={s.id} className="grid gap-4 rounded-2xl border border-black/10 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold tracking-[-0.03em]">{s.name}</h3>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-black/55 hover:text-black">
                  {s.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              </div>
              <ol aria-label="Progress" className="grid grid-cols-6 gap-1.5">
                {STEPS.map((step, i) => (
                  <li key={step} className="grid gap-1.5">
                    <span
                      className={cn(
                        "h-1 rounded-full",
                        i < p.step || (i === p.step && !p.closed) ? "bg-black" : "bg-black/10",
                      )}
                    />
                    <span
                      className={cn(
                        "hidden text-[10.5px] leading-tight tracking-[0.02em] uppercase sm:block",
                        i === p.step ? "font-semibold text-black" : "text-black/45",
                      )}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold sm:hidden">{p.closed ? "Closed" : STEPS[p.step]}. </span>
                  <span className="text-black/65">{p.label}</span>
                </span>
                {s.listing && PUBLIC.has(s.listing.status) && (
                  <Link href={`/sites/${s.listing.slug}`} className="text-sm font-semibold underline-offset-4 hover:underline">
                    View listing
                  </Link>
                )}
                {/* Still with the editors: the creator can write the listing in the full form instead. */}
                {isOpenSubmission(s) && (
                  <Link href={fullFormHref(s.id)} className="text-sm font-semibold underline-offset-4 hover:underline">
                    Add the details yourself
                  </Link>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
