import Link from "next/link";
import { CATEGORIES } from "@/lib/taxonomy";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-black/10">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-6">
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

        <nav aria-label="Categories" className="md:col-span-3">
          <p className="eyebrow mb-4">Categories</p>
          <ul className="grid gap-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account" className="md:col-span-3">
          <p className="eyebrow mb-4">Account</p>
          <ul className="grid gap-2 text-sm">
            <li>
              <Link href="/submit" className="hover:underline">Submit a site</Link>
            </li>
            <li>
              <Link href="/account" className="hover:underline">Your sites</Link>
            </li>
            <li>
              <Link href="/sign-in" className="hover:underline">Log in</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container-site overflow-hidden">
        <p
          aria-hidden="true"
          className="text-[clamp(3rem,13.6vw,13rem)] leading-[0.82] font-bold tracking-[-0.065em] uppercase select-none"
        >
          Shemoqmedi
        </p>
      </div>

      <div className="container-site flex flex-col gap-2 py-8 text-xs text-black/55 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} shemoqmedi.space</p>
        <p>The web&apos;s finest, listed by the people who build it.</p>
      </div>
    </footer>
  );
}
