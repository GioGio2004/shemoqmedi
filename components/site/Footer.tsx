import Link from "next/link";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Directory", href: "/" },
      { label: "Live voting", href: "/collections/nominees" },
      { label: "Creators", href: "/creators" },
      { label: "Badges", href: "/badges" },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "Site of the Day", href: "/collections/sotd" },
      { label: "Best Solo Creation", href: "/collections/bsc" },
      { label: "Georgia", href: "/collections/georgia" },
      { label: "Next.js", href: "/collections/nextjs" },
      { label: "WebGL", href: "/collections/webgl" },
      { label: "Portfolio", href: "/collections/portfolio" },
      { label: "E-Commerce", href: "/collections/e-commerce" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Submit a site", href: "/submit" },
      { label: "Your sites", href: "/account" },
      { label: "Log in", href: "/sign-in" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-32 border-t border-black/10">
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

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-7">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="grid gap-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
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
        <p
          aria-hidden="true"
          className="text-[clamp(3rem,13.6vw,13rem)] leading-[0.82] font-bold tracking-[-0.065em] uppercase select-none"
        >
          Shemoqmedi
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
        <p>© {new Date().getFullYear()} shemoqmedi.space</p>
        <p>The web&apos;s finest, listed by the people who build it.</p>
      </div>
    </footer>
  );
}
