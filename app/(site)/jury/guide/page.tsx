import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, infoOpenGraph, type InfoSection } from "@/components/site/InfoPage";
import { MediaImage as Image } from "@/components/site/MediaImage";
import { JurorAvatar } from "@/components/jury/JurorAvatar";
import { getAwardRules, getJurors, getJuryReviews, getListing } from "@/lib/listings";
import { formatScore } from "@/lib/format";
import { PILLAR_TEXT, pct, scoreRange } from "@/lib/scoringCopy";
import { PILLARS, toPillars } from "@/lib/taxonomy";

// The guide for people invited to the jury: what jurors do, how a site is
// scored, a real example, the time it takes and what jurors get. Sent to
// candidates who want to know more before saying yes, and linked from /jury.

const title = "Joining the Shemoqmedi Jury: A Guide for Jurors";
const description =
  "What Shemoqmedi jurors do, how websites are scored, a real example, the time it takes and what jurors get. Jury membership is by invitation.";

/** The worked example: a real site, its jury reviews shown once judging closes. */
const EXAMPLE_SLUG = "irakli-inanishvili-portfolio";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/jury/guide" },
  openGraph: infoOpenGraph("/jury/guide", title, description),
};

export const dynamic = "force-static";
export const revalidate = 300;

const SCALE = [
  ["9–10", "Best in class. Sets a standard other sites will copy."],
  ["7–8", "Strong, professional work with a few things to improve."],
  ["5–6", "Solid but ordinary, or good with clear weaknesses."],
  ["1–4", "Problems that get in the way of the visitor."],
] as const;

const mono = "font-mono text-[11px] font-medium tracking-[0.08em] uppercase tabular-nums";

function Steps() {
  const steps: [string, string][] = [
    ["Invitation", "We invite designers, developers, founders and content people whose work we trust. You get a private link by email or message."],
    [
      "Your profile",
      "We prepare your public jury profile from your LinkedIn: photo, role, bio, experience and selected work. Before anything is published, we send you the profile and the announcement post for your approval.",
    ],
    ["Claim it", "Open the private link and sign in with the invited email. The profile is yours to edit any time."],
    [
      "Score sites",
      "Sites in voting have an Evaluate button in the bottom-right corner, visible only to jurors. It opens the score form with the site's technical report: speed, accessibility, best practices and SEO, on mobile and desktop.",
    ],
    [
      "Your reviews go public",
      "Scores stay private while a site is in voting, so no juror sees another's. When judging closes, your score and comment appear on the site's page and on your profile, with your name.",
    ],
  ];
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10">
      {steps.map(([head, text], i) => (
        <li key={head} className="grid gap-1 bg-white p-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
          <p className="text-[15px] font-semibold text-black">
            <span className="mr-2 text-black/40">{i + 1}.</span>
            {head}
          </p>
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
}

export default async function JuryGuidePage() {
  const [rules, jurors, example, exampleReviews] = await Promise.all([
    getAwardRules(),
    getJurors(),
    getListing(EXAMPLE_SLUG),
    getJuryReviews(EXAMPLE_SLUG),
  ]);

  const sections: InfoSection[] = [
    { id: "what", heading: "What a juror does", body: <Steps /> },
    {
      id: "criteria",
      heading: "How a site is scored",
      body: (
        <>
          <p>
            You score each site from {scoreRange(rules)} on four criteria. The final score is the average of the jurors&apos;
            weighted scores, and a site needs at least {rules.minVotes} jury scores to be eligible for an award. Only the
            jury decides awards; community votes never count.
          </p>
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10">
            {PILLARS.map((p) => (
              <div key={p.key} className="grid gap-1 bg-white p-5">
                <dt className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] font-semibold text-black">{p.name}</span>
                  <span className={`${mono} text-black/55`}>{pct(p.weight)} of the score</span>
                </dt>
                <dd>{PILLAR_TEXT[p.key]}</dd>
              </div>
            ))}
          </dl>
          <p className="!mt-2 text-black">What the numbers mean:</p>
          <dl className="grid gap-2">
            {SCALE.map(([range, meaning]) => (
              <div key={range} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-4">
                <dt className="font-mono font-semibold text-black tabular-nums">{range}</dt>
                <dd>{meaning}</dd>
              </div>
            ))}
          </dl>
          <p>
            A short comment is optional but it is what creators value most: say what works, and what would make the site
            better. It is published with your name, so write it the way you would say it to the person who built it.
          </p>
        </>
      ),
    },
    ...(example
      ? [
          {
            id: "example",
            heading: "A real example",
            body: (
              <>
                <p>
                  <Link href={`/sites/${example.slug}`}>{example.title}</Link>, a portfolio by {example.creditName},
                  {exampleReviews.length === 0
                    ? " is being judged right now, so its scores are private. The jury's scores and reviews appear here, exactly as on the site's page, when judging closes."
                    : " was judged in the jury's November round. Here is how the jury scored it."}
                </p>
                {example.coverUrl && (
                  <Link
                    href={`/sites/${example.slug}`}
                    className="relative block aspect-video overflow-hidden rounded-2xl border border-black/10 bg-black/5"
                    aria-label={`${example.title} on Shemoqmedi`}
                  >
                    <Image src={example.coverUrl} alt="" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover object-top" />
                  </Link>
                )}
                {exampleReviews.map((r) => (
                  <div key={r.juror.slug} className="grid gap-3 rounded-2xl border border-black/10 p-5">
                    <div className="flex items-center gap-3">
                      <JurorAvatar url={r.juror.imageUrl} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-black">{r.juror.name}</p>
                        <p className="truncate text-xs">{r.juror.title}</p>
                      </div>
                      <p className="text-2xl font-semibold tracking-[-0.04em] text-black tabular-nums">{formatScore(r.average)}</p>
                    </div>
                    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-black/10 bg-black/10 sm:grid-cols-4">
                      {PILLARS.map((p) => (
                        <div key={p.key} className="grid gap-0.5 bg-white px-3 py-2">
                          <dt className={`${mono} text-black/55`}>{p.name}</dt>
                          <dd className="font-semibold text-black tabular-nums">{toPillars(r.scores)[p.key].toFixed(1)}</dd>
                        </div>
                      ))}
                    </dl>
                    {r.comment && <p className="whitespace-pre-line">{r.comment}</p>}
                  </div>
                ))}
              </>
            ),
          } satisfies InfoSection,
        ]
      : []),
    {
      id: "time",
      heading: "Time and commitment",
      body: (
        <>
          <p>
            New sites go into voting every week, and you get a daily email when there is something new in the categories
            you follow. Most jurors take 10 to 15 minutes per site: open it on desktop and phone, read the technical
            report, score it and leave a comment.
          </p>
          <p>
            We&apos;d love you to score around 5 to 15 sites a month, but how many is up to you. Score what you have time
            for; a day before a site&apos;s voting closes, you get a reminder if you haven&apos;t scored it yet.
          </p>
          <p>
            If you built a site or it belongs to your company, you don&apos;t score it: one click in the Evaluate form
            declares the conflict.
          </p>
        </>
      ),
    },
    {
      id: "what-you-get",
      heading: "Volunteer, and what you get",
      body: (
        <>
          <p>Jury membership is voluntary and unpaid. In return:</p>
          <ul className="grid list-disc gap-2 pl-5">
            <li>A public jury profile on Shemoqmedi with your experience, selected work and every review you sign.</li>
            <li>
              &ldquo;Jury Member, Shemoqmedi Awards&rdquo; for your LinkedIn, added in one click from your profile, linking
              to your jury page.
            </li>
            <li>An announcement on our Instagram, Facebook and LinkedIn when you join, approved by you first.</li>
            <li>A first look at new web work from Georgia and beyond, and a say in which sites win.</li>
            <li>Founding jurors keep the Founding Jury mark on their profile.</li>
          </ul>
        </>
      ),
    },
    ...(jurors.length > 0
      ? [
          {
            id: "who",
            heading: "The jury today",
            body: (
              <>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {jurors.map((j) => (
                    <li key={j.slug}>
                      <Link href={`/jury/${j.slug}`} className="flex items-center gap-3 !no-underline">
                        <JurorAvatar url={j.imageUrl} size={40} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-black">{j.name}</span>
                          <span className="block truncate text-xs text-black/60">{j.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p>
                  Every juror&apos;s profile is on <Link href="/jury">the jury page</Link>.
                </p>
              </>
            ),
          } satisfies InfoSection,
        ]
      : []),
    {
      id: "questions",
      heading: "Questions",
      body: (
        <p>
          Reply to the person who invited you, or read <Link href="/how-we-score">how we score</Link> for the award rules
          in full.
        </p>
      ),
    },
  ];

  return (
    <InfoPage
      current="/jury/guide"
      prelude="joining the"
      title="Jury"
      lede="Everything a juror needs to know before saying yes: what you do, how sites are scored, the time it takes and what you get."
      sections={sections}
    />
  );
}
