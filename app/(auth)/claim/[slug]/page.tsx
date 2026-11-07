import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/listing/PageHero";
import { ClaimForm } from "@/components/listing/ClaimForm";
import { PillLink } from "@/components/site/ui";
import { getCreator, getListing } from "@/lib/listings";
import { hostOf } from "@/lib/format";

export const metadata: Metadata = { title: "Claim", robots: { index: false } };

// Protected by proxy.ts (requires a Clerk session). Rendered per request so
// the claimed state is always current.
export const dynamic = "force-dynamic";

type Target = {
  targetType: "listing" | "creator";
  name: string;
  isClaimed: boolean;
  href: string;
  coverUrl: string | null;
  caption: string;
};

async function loadTarget(slug: string, type: string | undefined): Promise<Target | null> {
  if (type === "creator") {
    const data = await getCreator(slug);
    if (!data) return null;
    const { creator, listings } = data;
    return {
      targetType: "creator",
      name: creator.name,
      isClaimed: creator.isClaimed,
      href: `/creators/${creator.slug}`,
      coverUrl: listings.find((l) => l.coverUrl)?.coverUrl ?? null,
      caption: `${creator.nominations} ${creator.nominations === 1 ? "listing" : "listings"}${
        creator.location ? ` · ${creator.location}` : ""
      }`,
    };
  }
  const listing = await getListing(slug);
  if (!listing) return null;
  return {
    targetType: "listing",
    name: listing.title,
    isClaimed: listing.isClaimed,
    href: `/sites/${listing.slug}`,
    coverUrl: listing.coverUrl,
    caption: `by ${listing.creditName} · ${hostOf(listing.url)}`,
  };
}

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string; intent?: string }>;
}) {
  const [{ slug }, { type, intent }] = await Promise.all([params, searchParams]);
  const target = await loadTarget(slug, type);
  if (!target) notFound();

  const isCreator = target.targetType === "creator";

  return (
    <>
      <Header />
      <main id="main-content">
        <PageHero
          prelude={isCreator ? "claim your profile" : "claim this project"}
          title={target.name}
          titleClassName="text-[clamp(2.75rem,8vw,7.5rem)]"
          lede={
            isCreator
              ? "Verify that this creator profile is yours to manage your credits and listings."
              : "Verify your profile, add team credits, and unlock your official nominee badge. The same form can be used to request removal of a listing."
          }
          action={
            <PillLink href={target.href} variant="outline">
              {isCreator ? "Back to profile" : "Back to site"}
            </PillLink>
          }
        />
        <div className="container-site grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <figure className="grid content-start gap-3">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-black/8">
              {target.coverUrl && (
                <Image
                  src={target.coverUrl}
                  alt={`${target.name} screenshot`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="object-cover object-top"
                />
              )}
            </div>
            <figcaption className="text-xs font-medium">{target.caption}</figcaption>
          </figure>

          {target.isClaimed ? (
            <div className="rounded-3xl border border-black/10 p-6 md:p-8">
              <p className="eyebrow">Already claimed</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                {isCreator ? "This profile" : "This project"} has already been claimed and verified.
              </p>
              <Link
                href={target.href}
                className="mt-6 inline-block text-sm font-medium underline underline-offset-[5px]"
              >
                ← Back to {target.name}
              </Link>
            </div>
          ) : (
            <ClaimForm
              targetType={target.targetType}
              slug={slug}
              name={target.name}
              initialIntent={intent === "removal" ? "removal" : "claim"}
              backHref={target.href}
            />
          )}
        </div>
      </main>
    </>
  );
}
