import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/listing/PageHero";
import { PillLink } from "@/components/site/ui";
import { badgeDate } from "@/lib/badgeInfo";
import { certificateCode, certificatesSigned, findCertificate, normalizeCode } from "@/lib/certificateCode";
import { formatScore } from "@/lib/format";

// /verify: check a Shemoqmedi certificate. A certificate's QR code opens this
// page with its number (and award), and anyone can type a number in. A real
// number shows the official record next to the real certificate, so a copy
// with an edited name, award or score stands out; a made-up or revoked one
// finds nothing. Results are never indexed.
export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Check that a Shemoqmedi award certificate is real: enter its certificate number to see the official record.",
  alternates: { canonical: "/verify" },
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ code?: string | string[]; award?: string | string[] }> };

export default async function VerifyPage({ searchParams }: Props) {
  const params = await searchParams;
  // A repeated ?code= arrives as an array: take the first.
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const code = first(params.code)?.trim().slice(0, 40) ?? "";
  const awardSlug = first(params.award)?.slice(0, 120);
  const sample = code.toLowerCase() === "sample" || normalizeCode(code).endsWith("SAMP1E00");
  const signed = certificatesSigned();
  const found = code && !sample && signed ? await findCertificate(code, awardSlug) : null;
  const number = found ? certificateCode(found) : null;

  return (
    <>
      <PageHero
        prelude="check a certificate"
        title="Verify"
        lede="Every Shemoqmedi certificate has a number and a QR code. Enter the number to see the award it belongs to. If the certificate you were shown doesn't match the record here, it isn't genuine."
      />
      <section aria-label="Certificate check" className="container-site grid gap-10 pb-24">
        <form method="get" action="/verify" className="flex max-w-xl flex-wrap items-end gap-3">
          <div className="grid min-w-0 flex-1 gap-2">
            <label htmlFor="verify-code" className="text-sm text-black/55">
              Certificate number
            </label>
            <input
              id="verify-code"
              name="code"
              defaultValue={code && !sample ? code : ""}
              placeholder="SQ-SOTD-7K3P-92XA"
              autoComplete="off"
              spellCheck={false}
              required
              className="h-12 rounded-full border border-black/15 bg-white px-5 font-mono uppercase tracking-wide text-black outline-none focus:border-black"
            />
          </div>
          <button type="submit" className="h-12 rounded-full bg-black px-6 text-sm font-semibold uppercase tracking-wide text-white">
            Check
          </button>
        </form>

        {!code ? null : sample ? (
          <p role="status" className="max-w-2xl text-lg">
            This is a sample certificate. It shows what a Shemoqmedi certificate looks like and was never awarded to anyone.
          </p>
        ) : !signed ? (
          <p role="status" className="max-w-2xl text-lg">
            Certificate checks aren&apos;t available right now. Every real award also has its own page on Shemoqmedi, linked from the winning site&apos;s listing.
          </p>
        ) : found ? (
          <div role="status" className="grid gap-8 rounded-3xl border border-black/10 p-6 md:p-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- the generated certificate itself */}
            <img
              src={`/certificate/${found.slug}`}
              alt={`The genuine certificate: ${found.name} for ${found.listing.title}`}
              width={1131}
              height={1600}
              className="h-auto w-full rounded-xl border border-black/10"
            />
            <div className="grid content-start gap-6">
              <div className="grid gap-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/55">Genuine certificate</p>
                <p className="text-2xl leading-snug">
                  This number belongs to a real Shemoqmedi award. Check that the certificate you were shown matches these details.
                </p>
              </div>
              <dl className="grid gap-3 text-sm">
                <Row term="Website" value={found.listing.title} />
                <Row term="Made by" value={found.listing.creditName} />
                <Row term="Award" value={found.name} />
                <Row term={found.tier === "F100" ? "Member" : "Date"} value={badgeDate(found.tier, found.period, found.date)} />
                {found.score !== null ? <Row term="Jury score" value={formatScore(found.score)} mono /> : null}
                <Row term="Certificate number" value={number ?? ""} mono />
              </dl>
              <div className="flex flex-wrap gap-3">
                <PillLink href={`/awards/${found.slug}`}>See the award page</PillLink>
              </div>
            </div>
          </div>
        ) : (
          <p role="status" className="max-w-2xl text-lg">
            No active award has this number. It may be mistyped, made up, or the award may have been revoked. See{" "}
            <Link href="/badges" className="underline underline-offset-4">
              how Shemoqmedi awards work
            </Link>
            .
          </p>
        )}
      </section>
    </>
  );
}

function Row({ term, value, mono }: { term: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
      <dt className="text-black/55">{term}</dt>
      <dd className={mono ? "font-mono tabular-nums" : undefined}>{value}</dd>
    </div>
  );
}
