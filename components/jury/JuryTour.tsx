"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The juror walkthrough on /jury/guide: slides that each show a scaled mock of
// the real screen, with an orange spotlight gliding to the part being
// explained. The mock is drawn on a fixed 960 × 600 canvas and scaled to fit,
// so spotlight positions are plain canvas pixels.

const W = 960;
const H = 600;

type Scene = "listing" | "card" | "closed" | "email";
/** `target`: the data-spot name of the element to light up in the slide's scene. */
type Spot = { target: string; r?: number; label: string; below?: boolean };
type Rect = { x: number; y: number; w: number; h: number };
type Slide = { scene: Scene; spot: Spot; title: string; body: string };

const SLIDES: Slide[] = [
  {
    scene: "listing",
    spot: { target: "voting", r: 999, label: "Live voting, with the time left" },
    title: "Find sites in live voting",
    body: "New sites go live every week and stay in voting for seven days. A daily email lists the new ones in the categories you follow, and the nominees page shows them all.",
  },
  {
    scene: "listing",
    spot: { target: "evaluate", r: 999, label: "Only jurors see this" },
    title: "Open the Evaluate button",
    body: "On every site in voting, a round Evaluate button sits in the bottom-right corner. It appears only when you're signed in as a juror.",
  },
  {
    scene: "card",
    spot: { target: "card", r: 22, label: "The evaluation card", below: true },
    title: "One card holds everything",
    body: "The button grows into a card below the navbar: the site's technical report on the left, your score form on the right. The same button, now Close, sits in the corner.",
  },
  {
    scene: "card",
    spot: { target: "report-top", r: 16, label: "Scores from Google's Lighthouse test" },
    title: "The technical report",
    body: "Google PageSpeed Insights tests the site on mobile and desktop and scores Performance, Accessibility, Best practices and SEO from 0 to 100. Switch devices at the top of the report.",
  },
  {
    scene: "card",
    spot: { target: "metrics", r: 16, label: "Loading times, rated good to poor" },
    title: "Loading, in plain words",
    body: "How long until the main content shows, whether the page shifts while loading, how fast it reacts. Below: real-visitor data when Google has it, the biggest possible savings and any failed checks. It informs your judgement; it never becomes the score.",
  },
  {
    scene: "card",
    spot: { target: "sliders", r: 16, label: "Four criteria, weighted" },
    title: "Score the four criteria",
    body: "Design 40%, usability 30%, creativity 20%, content 10%, each from 1 to 10. Your weighted score updates as you move the sliders.",
  },
  {
    scene: "card",
    spot: { target: "review", r: 16, label: "Optional, published with your name" },
    title: "Write a short review and save",
    body: "Say what works and what would make the site better. Your score and comment stay private until judging closes, and you can change them until then.",
  },
  {
    scene: "card",
    spot: { target: "conflict", r: 8, label: "Built it, or it's your company's?" },
    title: "Declare a conflict of interest",
    body: "If you built the site or it belongs to your company, declare it in one click. Your score is removed and you won't be asked to score it again.",
  },
  {
    scene: "listing",
    spot: { target: "tiles", r: 16, label: "Hidden while voting is open", below: false },
    title: "Scores stay hidden",
    body: "While a site is in voting, every score is private, so no juror sees another's and nobody is swayed. Community votes are shown, but they never count.",
  },
  {
    scene: "closed",
    spot: { target: "reviews", r: 16, label: "Your review, with your name" },
    title: "When judging closes",
    body: "The final score is the average of the jurors' weighted scores; a site needs 3 to be eligible for an award. Your score and review appear on the site's page and on your profile, and the creator gets them by email.",
  },
  {
    scene: "email",
    spot: { target: "email-cta", r: 12, label: "One click to the site" },
    title: "A reminder before it closes",
    body: "A day before a site's voting closes, you get one email listing the sites you haven't scored yet. Score as many as you can: the rest is up to you.",
  },
];

// ── The mock screens (960 × 600) ────────────────────────────────────────────

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div className="flex h-9 items-center gap-2 border-b border-black/10 bg-neutral-100 px-4">
        <span className="size-2.5 rounded-full bg-black/15" />
        <span className="size-2.5 rounded-full bg-black/15" />
        <span className="size-2.5 rounded-full bg-black/15" />
        <span className="ml-4 h-5 w-80 rounded-full bg-white px-3 font-mono text-[10px] leading-5 text-black/50">
          shemoqmedi.space/sites/irakli-inanishvili
        </span>
      </div>
      {children}
    </div>
  );
}

function NavBar() {
  return (
    <div className="flex h-14 items-center justify-between border-b border-black/5 px-10">
      <div className="leading-none">
        <p className="text-[13px] font-bold tracking-[-0.05em] uppercase">Shemoqmedi</p>
        <p className="text-[6px] font-semibold tracking-[0.3em] uppercase">Space</p>
      </div>
      <div className="flex gap-2">
        <span className="h-7 w-20 rounded-full border border-black/12" />
        <span className="h-7 w-24 rounded-full bg-black" />
      </div>
    </div>
  );
}

function Cover({ cover, className }: { cover: string | null; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-black/10 bg-neutral-900", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static mock image */}
      {cover && <img src={cover} alt="" className="size-full object-cover object-top" />}
    </div>
  );
}

function ListingScene({ cover }: { cover: string | null }) {
  return (
    <Chrome>
      <NavBar />
      <div className="grid grid-cols-[1fr_300px] gap-8 px-10 pt-6">
        <div>
          <p className="text-[11px] font-medium tracking-[0.06em] text-black/50 uppercase">Portfolio · Georgia</p>
          <p className="mt-1 text-[44px] leading-none font-semibold tracking-[-0.05em]">Irakli Inanishvili</p>
          <div data-spot="voting" className="mt-4 flex w-fit items-center gap-2">
            <span className="rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-white uppercase">
              Live voting
            </span>
            <span className="rounded-full border border-black/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.06em] uppercase">
              Ends in 04D : 12H : 30M
            </span>
          </div>
          <Cover cover={cover} className="mt-5 h-[200px]" />
          <div data-spot="tiles" className="mt-5 grid grid-cols-4 gap-2">
            {["Design 40%", "Usability 30%", "Creativity 20%", "Content 10%"].map((t) => (
              <div key={t} className="grid h-[88px] content-between rounded-xl bg-[rgb(0_64_255/0.85)] p-3 text-white">
                <p className="text-[10px] font-semibold tracking-[0.06em] uppercase">{t}</p>
                <p className="font-mono text-[9px] tracking-[0.06em] uppercase opacity-80">Revealed at close</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-3 rounded-2xl border border-black/10 p-5">
          <p className="text-[10px] font-medium tracking-[0.06em] text-black/50 uppercase">Community vote</p>
          <p className="text-[22px] font-semibold tracking-[-0.03em]">Cast your vote</p>
          <p className="text-[11px] leading-snug text-black/55">Shown for interest. Only the jury decides awards.</p>
          <span className="mt-2 h-9 rounded-full bg-black" />
        </div>
      </div>
      <span data-spot="evaluate" className="absolute right-6 bottom-6 grid size-[68px] place-items-center rounded-full border border-white/40 bg-black text-[9px] font-semibold tracking-[0.06em] text-white uppercase">
        Evaluate
      </span>
    </Chrome>
  );
}

function Ring({ v, label }: { v: number; label: string }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="grid justify-items-center gap-1.5">
      <div className="relative size-[60px]">
        <svg viewBox="0 0 52 52" className="size-full -rotate-90">
          <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="5" />
          <circle
            cx="26"
            cy="26"
            r={r}
            fill="none"
            stroke={v >= 90 ? "currentColor" : "var(--orange)"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(v / 100) * c} ${c}`}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold tabular-nums">{v}</span>
      </div>
      <p className="text-[10px] font-semibold">{label}</p>
    </div>
  );
}

function CardScene({ cover }: { cover: string | null }) {
  const metrics: [string, string, boolean][] = [
    ["Main content shown", "2.9 s", false],
    ["First content", "0.8 s", true],
    ["Blocked input", "90 ms", true],
    ["Layout shift", "0.010", true],
    ["Speed index", "2.1 s", true],
    ["Server response", "120 ms", true],
  ];
  return (
    <Chrome>
      <NavBar />
      <div className="absolute inset-x-0 top-[92px] bottom-0 bg-white/60" />
      <div data-spot="card" className="absolute inset-x-4 top-[76px] bottom-4 overflow-hidden rounded-[22px] border border-black/10 bg-white">
        <div className="flex h-14 items-center gap-3 border-b border-black/10 px-5">
          <span className="size-8 rounded-full bg-neutral-300" />
          <div>
            <p className="text-[9px] font-medium tracking-[0.06em] text-black/50 uppercase">Jury evaluation</p>
            <p className="text-[15px] font-semibold tracking-[-0.03em]">Irakli Inanishvili</p>
          </div>
          <p className="ml-auto font-mono text-[9px] tracking-[0.06em] text-black/55 uppercase">Mobile performance 82</p>
        </div>
        <div className="grid h-[calc(100%-56px)] grid-cols-[584px_1fr]">
          <div className="border-r border-black/10 px-[18px] pt-3">
            <div data-spot="report-top">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-medium tracking-[0.06em] text-[var(--orange)] uppercase">Technical report · jury only</p>
              <div className="flex rounded-full border border-black/12 p-0.5 text-[8px] font-semibold uppercase">
                <span className="rounded-full bg-black px-2.5 py-1 text-white">Mobile</span>
                <span className="px-2.5 py-1 text-black/55">Desktop</span>
              </div>
            </div>
            <div className="mt-3 flex justify-around">
              <Ring v={82} label="Performance" />
              <Ring v={96} label="Accessibility" />
              <Ring v={100} label="Best practices" />
              <Ring v={92} label="SEO" />
            </div>
            </div>
            <div data-spot="metrics" className="mt-4">
            <p className="text-[12px] font-semibold">Loading, measured in this test</p>
            <div className="mt-2 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-black/10 bg-black/10">
              {metrics.map(([l, v, good]) => (
                <div key={l} className="bg-white p-2.5">
                  <p className="font-mono text-[7.5px] tracking-[0.06em] text-black/50 uppercase">{l}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold tabular-nums">
                    {v}
                    <span className={cn("size-1.5 rounded-full", good ? "bg-black" : "bg-[var(--orange)]")} />
                  </p>
                </div>
              ))}
            </div>
            </div>
            <div className="mt-3 flex gap-3">
              <Cover cover={cover} className="h-[60px] w-[100px] rounded-lg" />
              <div className="grid flex-1 content-start gap-1.5 text-[10px]">
                <p className="font-semibold">Biggest possible savings</p>
                <p className="flex justify-between border-b border-black/10 pb-1"><span>Reduce unused JavaScript</span><span className="font-mono text-black/55">−0.9 s</span></p>
                <p className="flex justify-between"><span>Properly size images</span><span className="font-mono text-black/55">−0.4 s</span></p>
              </div>
            </div>
          </div>
          <div className="px-5 pt-3">
            <div data-spot="sliders" className="grid gap-3">
              {[
                ["Design 40%", 8.4],
                ["Usability 30%", 7.8],
                ["Creativity 20%", 8.0],
                ["Content 10%", 7.5],
              ].map(([l, v]) => (
                <div key={l as string} className="grid gap-1">
                  <p className="flex justify-between text-[9px] font-medium tracking-[0.06em] uppercase">
                    <span>{l}</span>
                    <span className="font-mono">{(v as number).toFixed(1)}</span>
                  </p>
                  <div className="relative h-1.5 rounded-full bg-black/10">
                    <span className="absolute inset-y-0 left-0 rounded-full bg-black" style={{ width: `${((v as number) - 1) * 11.1}%` }} />
                    <span className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full bg-black" style={{ left: `calc(${((v as number) - 1) * 11.1}% - 7px)` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-baseline justify-between border-y border-black/10 py-2">
              <span className="text-[9px] font-medium tracking-[0.06em] uppercase">Your score</span>
              <span className="font-mono text-[22px] font-semibold">8.07</span>
            </p>
            <div data-spot="review">
            <p className="mt-3 text-[9px] font-medium tracking-[0.06em] uppercase">Comment (optional)</p>
            <div className="mt-1.5 h-[64px] rounded-lg border border-black/14 p-2 text-[10px] leading-snug text-black/70">
              Three working prototypes instead of client logos. The intro delays the work a little too long.
            </div>
            <span className="mt-2.5 grid h-8 place-items-center rounded-full bg-black text-[9px] font-semibold tracking-[0.06em] text-white uppercase">
              Save evaluation
            </span>
            </div>
            <p data-spot="conflict" className="mt-2.5 w-fit text-[9px] text-black/55 underline">I have a conflict of interest with this site</p>
          </div>
        </div>
      </div>
      <span className="absolute right-6 bottom-6 grid size-[68px] place-items-center rounded-full border border-black bg-white text-[9px] font-semibold tracking-[0.06em] uppercase">
        Close
      </span>
    </Chrome>
  );
}

function ClosedScene({ cover }: { cover: string | null }) {
  return (
    <Chrome>
      <NavBar />
      <div className="grid grid-cols-[260px_1fr] gap-8 px-10 pt-6">
        <Cover cover={cover} className="h-[200px]" />
        <div>
          <p className="text-[11px] font-medium tracking-[0.06em] text-black/50 uppercase">Final score</p>
          <p className="mt-1 font-mono text-[56px] leading-none font-semibold tracking-[-0.04em]">8.08</p>
          <p className="mt-2 text-[12px] text-black/55">Average of 3 jurors&apos; weighted scores · Honorable Mention</p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[["Design", "8.20"], ["Usability", "8.00"], ["Creativity", "7.80"], ["Content", "8.40"]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-[rgb(0_64_255/0.85)] p-3 text-white">
                <p className="text-[9px] font-semibold tracking-[0.06em] uppercase">{l}</p>
                <p className="mt-2 font-mono text-[18px] font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div data-spot="reviews" className="mx-10 mt-6 rounded-2xl border border-black/10 p-5">
        <p className="text-[10px] font-medium tracking-[0.06em] text-black/50 uppercase">Jury reviews · 3</p>
        {[
          ["Joao Seabra", "Founder of itMatters.studio", "8.08", "A portfolio that backs up its pitch: three small working prototypes, each with its own identity. The intro delays the work a little too long."],
          ["Beka Shengelia", "Software Engineer at FitWise AI", "8.21", "Clean console, fast load and tidy focus states. Tap targets on the language switch are small."],
        ].map(([n, t, s, c]) => (
          <div key={n} className="mt-3 grid gap-1.5 border-t border-black/10 pt-3">
            <div className="flex items-center gap-2.5">
              <span className="size-7 rounded-full bg-neutral-300" />
              <p className="text-[12px] font-semibold">{n}</p>
              <p className="text-[10px] text-black/55">{t}</p>
              <p className="ml-auto text-[18px] font-semibold tabular-nums">{s}</p>
            </div>
            <p className="text-[11px] leading-snug text-black/75">{c}</p>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

function EmailScene() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#0A0A0A]">
      <div className="w-[460px] overflow-hidden rounded-2xl bg-white">
        <div className="h-1.5 bg-[var(--orange)]" />
        <div className="px-7 pt-5 pb-7">
          <p className="text-[12px] font-extrabold tracking-[-0.04em] uppercase">Shemoqmedi</p>
          <p className="mt-6 text-[9px] font-bold tracking-[0.12em] text-[var(--orange)] uppercase">Last day to score</p>
          <p className="mt-2 text-[26px] leading-[1.05] font-extrabold tracking-[-0.035em]">2 sites close tomorrow</p>
          <p className="mt-3 text-[11px] leading-relaxed">
            Hi Beka, 2 sites you haven&apos;t scored close within 24 hours. Each one needs 3 jury scores to be eligible
            for an award, so yours counts.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed">Irakli Inanishvili · Floema</p>
          <span data-spot="email-cta" className="mt-4 grid h-[54px] place-items-center rounded-xl bg-[var(--orange)] text-[12px] font-extrabold tracking-[0.06em] text-white uppercase">
            Score the first one
          </span>
        </div>
      </div>
    </div>
  );
}

// ── The tour ────────────────────────────────────────────────────────────────

export function JuryTour({ cover }: { cover: string | null }) {
  const [i, setI] = useState(0);
  const [scale, setScale] = useState(0.6);
  const [rect, setRect] = useState<Rect>({ x: 40, y: 150, w: 360, h: 40 });
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const slide = SLIDES[i];
  const last = SLIDES.length - 1;

  useLayoutEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Where the target sits on the 960 × 600 canvas, measured from the mock itself.
  useLayoutEffect(() => {
    const root = canvas.current;
    const el = root?.querySelector<HTMLElement>(`[data-scene="${slide.scene}"] [data-spot="${slide.spot.target}"]`);
    if (!root || !el) return;
    const c = root.getBoundingClientRect();
    const r = el.getBoundingClientRect();
     
    setRect({ x: (r.left - c.left) / scale, y: (r.top - c.top) / scale, w: r.width / scale, h: r.height / scale });
  }, [slide, scale]);

  const go = useCallback((n: number) => setI(Math.max(0, Math.min(last, n))), [last]);

  useEffect(() => {
    const el = frame.current?.closest("section");
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  const s = { ...slide.spot, ...rect };
  const labelAbove = !s.below && s.y > 80;
  const scenes: Scene[] = ["listing", "card", "closed", "email"];

  return (
    <section aria-roledescription="carousel" aria-label="Juror walkthrough" className="grid gap-6 lg:grid-cols-12 lg:gap-10">
      {/* The screen */}
      <div className="lg:col-span-8">
        <div
          ref={frame}
          className="relative w-full overflow-hidden rounded-[22px] border border-black/10 bg-white"
          style={{ height: H * scale }}
        >
          <div ref={canvas} className="absolute top-0 left-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
            {scenes.map((sc) => (
              <div
                key={sc}
                data-scene={sc}
                aria-hidden={slide.scene !== sc}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none",
                  slide.scene === sc ? "opacity-100" : "opacity-0",
                )}
              >
                {sc === "listing" && <ListingScene cover={cover} />}
                {sc === "card" && <CardScene cover={cover} />}
                {sc === "closed" && <ClosedScene cover={cover} />}
                {sc === "email" && <EmailScene />}
              </div>
            ))}

            {/* Spotlight: dims everything around the target and rings it in orange. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute transition-all duration-[650ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
              style={{
                left: s.x - 6,
                top: s.y - 6,
                width: s.w + 12,
                height: s.h + 12,
                borderRadius: (s.r ?? 12) + 6,
                boxShadow: "0 0 0 3px var(--orange), 0 0 0 2400px rgb(10 10 10 / 0.42)",
              }}
            >
              <span className="absolute inset-0 animate-ping rounded-[inherit] border-2 border-[var(--orange)] opacity-40 [animation-duration:1.8s] motion-reduce:hidden" />
            </div>
            {/* Its label */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute transition-all duration-[650ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
              style={{
                left: Math.min(Math.max(s.x, 16), W - 300),
                top: labelAbove ? s.y - 50 : Math.min(s.y + s.h + 16, H - 44),
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--orange)] px-4 py-2 text-[13px] font-semibold whitespace-nowrap text-white">
                {s.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The explanation */}
      <div className="flex flex-col justify-between gap-8 lg:col-span-4">
        <div aria-live="polite" className="grid gap-3">
          <p className="eyebrow">Walkthrough</p>
          <h3 key={`t${i}`} className="animate-[tour-in_.5s_ease] text-[clamp(1.5rem,2.4vw,2.1rem)] leading-[1.05] font-semibold tracking-[-0.045em] motion-reduce:animate-none">
            {slide.title}
          </h3>
          <p key={`b${i}`} className="animate-[tour-in_.5s_.05s_ease_both] text-[15px] leading-relaxed text-black/70 motion-reduce:animate-none">
            {slide.body}
          </p>
        </div>
        <div className="grid gap-5">
          <div className="flex gap-1.5" role="tablist" aria-label="Steps">
            {SLIDES.map((sl, n) => (
              <button
                key={sl.title}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={sl.title}
                onClick={() => go(n)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  n === i ? "w-8 bg-[var(--orange)]" : "w-3 bg-black/15 hover:bg-black/35",
                )}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => go(i - 1)}
              disabled={i === 0}
              className="inline-flex min-h-[46px] items-center rounded-full border border-black/12 px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors hover:border-black disabled:opacity-35"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => go(i === last ? 0 : i + 1)}
              className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase transition-transform hover:-translate-y-px"
            >
              {i === last ? "Start again" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
