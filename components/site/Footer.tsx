import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { getCollectionCounts } from "@/lib/listings";

type FooterLink = { label: string; href: string };

const WORDMARK = "Shemoqmedi";

const EXPLORE: FooterLink[] = [
  { label: "Directory", href: "/" },
  { label: "Live voting", href: "/collections/nominees" },
  { label: "Creators", href: "/creators" },
  { label: "Badges", href: "/badges" },
];

/** Collections in the order we'd like to feature them; empty ones are skipped. */
const COLLECTIONS: { tag: string; label: string }[] = [
  { tag: "sotd", label: "Site of the Day" },
  { tag: "bsc", label: "Best Solo Creation" },
  { tag: "georgia", label: "Georgia" },
  { tag: "startups", label: "Startups" },
  { tag: "nextjs", label: "Next.js" },
  { tag: "webgl", label: "WebGL" },
  { tag: "portfolio", label: "Portfolio" },
  { tag: "e-commerce", label: "E-Commerce" },
  { tag: "gsap", label: "GSAP" },
  { tag: "agency", label: "Agency" },
  { tag: "threejs", label: "Three.js" },
];
const MAX_COLLECTION_LINKS = 7;
const toLink = (c: { tag: string; label: string }): FooterLink => ({
  label: c.label,
  href: `/collections/${c.tag}`,
});

const ABOUT: FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "How we score", href: "/how-we-score" },
  { label: "The jury", href: "/jury" },
  { label: "ქართულად", href: "/ka" },
];

const ACCOUNT: FooterLink[] = [
  { label: "Submit a site", href: "/submit" },
  { label: "Your sites", href: "/account" },
  { label: "Log in", href: "/sign-in" },
];

/** Featured collections that have at least one listing. */
async function collectionLinks(): Promise<FooterLink[]> {
  try {
    const counts = await getCollectionCounts();
    return COLLECTIONS.filter((c) => (counts[c.tag] ?? 0) > 0)
      .slice(0, MAX_COLLECTION_LINKS)
      .map(toLink);
  } catch (error) {
    unstable_rethrow(error);
    // Counts unknown (Convex unreachable): the footer is not worth failing a
    // page over, so show the first few featured links unfiltered.
    console.error("Footer collection counts failed:", error);
    return COLLECTIONS.slice(0, MAX_COLLECTION_LINKS).map(toLink);
  }
}

export async function Footer() {
  const collections = await collectionLinks();
  const columns = [
    { title: "Explore", links: EXPLORE },
    { title: "Collections", links: collections },
    { title: "About", links: ABOUT },
    { title: "Account", links: ACCOUNT },
  ].filter((col) => col.links.length > 0);

  return (
    <footer className="relative mt-32 border-t border-black/10">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
            Built something worth seeing?
          </p>
          <Link
            href="/submit"
            className="mt-6 inline-block text-sm font-medium underline underline-offset-[5px]"
          >
            Submit your site ↗
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 md:col-span-7">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="grid gap-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      hrefLang={link.href === "/ka" ? "ka" : undefined}
                      lang={link.href === "/ka" ? "ka" : undefined}
                      className="hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="container-site overflow-hidden">
        {/* One span per letter: the crow can land on top of them (crow/world.ts). */}
        <p
          aria-hidden="true"
          data-crow-wordmark=""
          className="text-[clamp(3rem,13.6vw,13rem)] leading-[0.82] font-bold tracking-[-0.065em] uppercase select-none"
        >
          {WORDMARK.split("").map((ch, i) => (
            <span key={i} data-crow-letter="">
              {ch}
            </span>
          ))}
          <span data-crow-baseline="" className="inline-block h-0 w-0" />
        </p>
      </div>

      <div className="container-site pt-8">
        <p className="max-w-2xl text-[11px] leading-relaxed text-black/55">
          All featured websites remain the intellectual property of their respective creators.
          Curated under fair-use editorial review. To claim a profile or request removal, use the
          Claim button on any listing.
        </p>
      </div>

      <div className="container-site flex flex-col gap-2 py-8 text-xs text-black/55 sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} shemoqmedi.space
          <span aria-hidden="true"> · </span>
          <Link href="/privacy" className="hover:text-black hover:underline">
            Privacy
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href="/terms" className="hover:text-black hover:underline">
            Terms
          </Link>
        </p>
        <p>The web&apos;s finest, listed by the people who build it.</p>
      </div>

    </footer>
  );
}
