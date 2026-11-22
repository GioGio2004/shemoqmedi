"use client";

import { useState } from "react";
import type { AuditReport, SiteAudit } from "@/convex-helpers-api";
import { cn } from "@/lib/utils";

type Rating = "good" | "average" | "poor";

/** web.dev thresholds: [good up to, poor from]. */
const THRESHOLDS = {
  lcp: [2500, 4000],
  fcp: [1800, 3000],
  tbt: [200, 600],
  cls: [0.1, 0.25],
  speedIndex: [3400, 5800],
  ttfb: [800, 1800],
  inp: [200, 500],
} as const;

const rate = (
  value: number | null,
  [good, poor]: readonly [number, number],
): Rating | null =>
  value === null
    ? null
    : value <= good
      ? "good"
      : value < poor
        ? "average"
        : "poor";

const scoreRating = (s: number | null): Rating | null =>
  s === null ? null : s >= 90 ? "good" : s >= 50 ? "average" : "poor";

const RATING_LABEL: Record<Rating, string> = {
  good: "Good",
  average: "Needs work",
  poor: "Poor",
};

const ms = (v: number | null) =>
  v === null
    ? "—"
    : v < 1000
      ? `${Math.round(v)} ms`
      : `${(v / 1000).toFixed(1)} s`;
const bytes = (v: number | null) =>
  v === null
    ? "—"
    : v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)} MB`
      : `${Math.round(v / 1000)} KB`;
const fmtDate = (t: number) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(t);

const mono = "font-mono text-[10.5px] font-medium tracking-[0.08em] uppercase";

function Dot({ rating }: { rating: Rating | null }) {
  if (!rating) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        rating === "good" && "bg-black",
        rating === "average" && "bg-[var(--orange)]",
        rating === "poor" && "border border-[var(--orange)]",
      )}
    />
  );
}

/** A Lighthouse category score as a ring. */
function Gauge({ label, score }: { label: string; score: number | null }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const rating = scoreRating(score);
  return (
    <div className="grid justify-items-center gap-3 text-center">
      <div className="relative size-[88px]">
        <svg
          viewBox="0 0 80 80"
          className="size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="6"
          />
          {score !== null && (
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              stroke={rating === "good" ? "currentColor" : "var(--orange)"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * c} ${c}`}
            />
          )}
        </svg>
        <span className="absolute inset-0 grid place-items-center text-2xl font-semibold tracking-[-0.04em] tabular-nums">
          {score ?? "—"}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold tracking-[-0.01em]">{label}</p>
        <p className="text-xs text-black/55">
          {rating ? RATING_LABEL[rating] : "Not scored"}
        </p>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  rating,
  hint,
}: {
  label: string;
  value: string;
  rating: Rating | null;
  hint: string;
}) {
  return (
    <div className="grid content-start gap-1.5 bg-white p-4" title={hint}>
      <p className={cn(mono, "text-black/55")}>{label}</p>
      <p className="flex items-center gap-2 text-xl font-semibold tracking-[-0.03em] tabular-nums">
        {value}
        <Dot rating={rating} />
      </p>
      <p className="text-xs leading-snug text-black/50">{hint}</p>
    </div>
  );
}

const ISSUE_GROUPS = [
  { key: "accessibility", label: "Accessibility" },
  { key: "best-practices", label: "Best practices" },
  { key: "seo", label: "SEO" },
] as const;

function Report({ report }: { report: AuditReport }) {
  const { lab, field } = report;
  return (
    <div className="grid gap-10 2xl:grid-cols-12 2xl:gap-10">
      <div className="grid min-w-0 content-start gap-10 2xl:col-span-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Gauge label="Performance" score={report.scores.performance} />
          <Gauge label="Accessibility" score={report.scores.accessibility} />
          <Gauge label="Best practices" score={report.scores.bestPractices} />
          <Gauge label="SEO" score={report.scores.seo} />
        </div>

        <section className="grid gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em]">
              Loading, measured in this test
            </h3>
            <p className={cn(mono, "text-black/50")}>Lab data</p>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3">
            <Metric
              label="Main content shown"
              value={ms(lab.lcp)}
              rating={rate(lab.lcp, THRESHOLDS.lcp)}
              hint="Largest Contentful Paint. Good under 2.5 s."
            />
            <Metric
              label="First content"
              value={ms(lab.fcp)}
              rating={rate(lab.fcp, THRESHOLDS.fcp)}
              hint="First Contentful Paint. Good under 1.8 s."
            />
            <Metric
              label="Blocked input"
              value={ms(lab.tbt)}
              rating={rate(lab.tbt, THRESHOLDS.tbt)}
              hint="Total Blocking Time. Good under 200 ms."
            />
            <Metric
              label="Layout shift"
              value={lab.cls === null ? "—" : lab.cls.toFixed(3)}
              rating={rate(lab.cls, THRESHOLDS.cls)}
              hint="Cumulative Layout Shift. Good under 0.1."
            />
            <Metric
              label="Speed index"
              value={ms(lab.speedIndex)}
              rating={rate(lab.speedIndex, THRESHOLDS.speedIndex)}
              hint="How fast the page fills in. Good under 3.4 s."
            />
            <Metric
              label="Server response"
              value={ms(lab.ttfb)}
              rating={rate(lab.ttfb, THRESHOLDS.ttfb)}
              hint="Time to first byte. Good under 0.8 s."
            />
          </div>
          <p className="text-sm text-black/60">
            Page weight{" "}
            <span className="font-semibold text-black tabular-nums">
              {bytes(report.pageBytes)}
            </span>{" "}
            in{" "}
            <span className="font-semibold text-black tabular-nums">
              {report.requests ?? "—"}
            </span>{" "}
            requests.
          </p>
        </section>

        <section className="grid gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-[-0.03em]">
              Real visitors
            </h3>
            <p className={cn(mono, "text-black/50")}>
              Chrome users, last 28 days
            </p>
          </div>
          {field ? (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3">
              <Metric
                label="Main content shown"
                value={ms(field.lcp)}
                rating={rate(field.lcp, THRESHOLDS.lcp)}
                hint="75% of visits were at least this fast."
              />
              <Metric
                label="Response to input"
                value={ms(field.inp)}
                rating={rate(field.inp, THRESHOLDS.inp)}
                hint="Interaction to Next Paint. Good under 200 ms."
              />
              <Metric
                label="Layout shift"
                value={field.cls === null ? "—" : field.cls.toFixed(2)}
                rating={rate(field.cls, THRESHOLDS.cls)}
                hint="Good under 0.1."
              />
            </div>
          ) : (
            <p className="rounded-2xl border border-black/10 p-4 text-sm text-black/60">
              Not enough real-visitor data yet. Google only reports it for sites
              with steady traffic; new and small sites have none, which says
              nothing about their quality.
            </p>
          )}
        </section>
      </div>

      <div className="grid min-w-0 content-start gap-10 sm:grid-cols-2 2xl:col-span-4 2xl:grid-cols-1">
        {report.screenshot && (
          <figure className="grid gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL from Lighthouse */}
            <img
              src={report.screenshot}
              alt="How the page looked when the test finished loading"
              className="max-h-[420px] w-auto justify-self-start rounded-xl border border-black/10"
            />
            <figcaption className="text-xs text-black/50">
              The page as the test saw it at the end of loading.
            </figcaption>
          </figure>
        )}

        <section className="grid gap-3">
          <h3 className="text-lg font-semibold tracking-[-0.03em]">
            Biggest possible savings
          </h3>
          {report.opportunities.length === 0 ? (
            <p className="text-sm text-black/60">
              Nothing significant to speed up.
            </p>
          ) : (
            <ul className="grid">
              {report.opportunities.map((o) => (
                <li
                  key={o.title}
                  className="flex items-baseline justify-between gap-4 border-b border-black/10 py-2.5 text-sm last:border-b-0"
                >
                  <span>{o.title}</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-black/60">
                    −{ms(o.savingsMs)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-3">
          <h3 className="text-lg font-semibold tracking-[-0.03em]">
            Failed checks
          </h3>
          {ISSUE_GROUPS.map((g) => {
            const list = report.issues.filter((i) => i.category === g.key);
            return (
              <details
                key={g.key}
                className="group rounded-xl border border-black/10 px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                  {g.label}
                  <span
                    className={cn(
                      mono,
                      list.length ? "text-black" : "text-black/45",
                    )}
                  >
                    {list.length ? `${list.length} to fix` : "All passed"}
                  </span>
                </summary>
                {list.length > 0 && (
                  <ul className="mt-3 grid gap-1.5 text-sm text-black/70">
                    {list.map((i) => (
                      <li key={i.title}>{i.title}</li>
                    ))}
                  </ul>
                )}
              </details>
            );
          })}
        </section>
      </div>
    </div>
  );
}

/**
 * The technical report for jurors, shown in the Evaluate card: PageSpeed
 * Insights (Lighthouse) results for mobile and desktop, with a device switch.
 */
export function JuryAuditContent({ audit }: { audit: SiteAudit | null }) {
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const report = audit ? (strategy === "mobile" ? audit.mobile : audit.desktop) : null;
  const pageSpeedUrl = audit ? `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(audit.url)}` : null;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Technical report · jury only</p>
          {audit && (
            <p className="mt-2 text-sm text-black/55">
              {audit.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              {audit.finishedAt ? ` · tested ${fmtDate(audit.finishedAt)}` : ""}
            </p>
          )}
        </div>
        {audit && (audit.mobile || audit.desktop) && (
          <div role="group" aria-label="Device" className="inline-flex rounded-full border border-black/12 p-1">
            {(["mobile", "desktop"] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={strategy === s}
                onClick={() => setStrategy(s)}
                className={cn(
                  "min-h-[36px] rounded-full px-4 text-[11px] font-semibold tracking-[0.05em] uppercase",
                  strategy === s ? "bg-black text-white" : "text-black/60 hover:text-black",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="max-w-3xl border-l-2 border-[var(--orange)] pl-4 text-sm leading-relaxed text-black/70">
        Information for your judgement, not part of any score. Ambitious sites with 3D, video and motion often score low
        on performance in this test; judge whether the site loads gracefully and feels fast to use.
      </p>

      {!audit ? (
        <p className="text-sm text-black/60">
          This site hasn&apos;t been tested yet. The Shemoqmedi team runs the test before judging; check back soon.
        </p>
      ) : audit.status === "running" && !report ? (
        <p className="text-sm text-black/60">The test is running. It takes about a minute.</p>
      ) : report ? (
        <Report report={report} />
      ) : (
        <p className="text-sm text-black/60">The {strategy} test could not finish{audit.error ? `: ${audit.error}` : "."}</p>
      )}

      {pageSpeedUrl && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
          <p className="text-xs text-black/50">
            Google PageSpeed Insights{report?.lighthouseVersion ? ` · Lighthouse ${report.lighthouseVersion}` : ""}
          </p>
          <a
            href={pageSpeedUrl}
            target="_blank"
            rel="noopener nofollow"
            className="text-sm font-medium underline decoration-black/25 underline-offset-4 hover:decoration-black"
          >
            Run a fresh test on Google
          </a>
        </div>
      )}
    </div>
  );
}
