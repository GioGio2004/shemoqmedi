import Link from "next/link";
import { NAV_ITEMS } from "./Navbar";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12">
        <p className="max-w-sm text-ink-soft md:col-span-6">
          shemoqmedi is a space for creators: a showcase of the web&apos;s finest
          work, judged by the people who build it.
        </p>

        <nav aria-label="Explore" className="md:col-span-3">
          <p className="label mb-4">Explore</p>
          <ul className="flex flex-col gap-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account" className="md:col-span-3">
          <p className="label mb-4">Account</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/sign-up" className="hover:underline">
                Submit work
              </Link>
            </li>
            <li>
              <Link href="/sign-in" className="hover:underline">
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Oversized wordmark: the logo, so it is the one place gold appears. */}
      <div className="container-site overflow-hidden">
        <p
          aria-hidden
          className="pb-4 text-[clamp(3.5rem,15.5vw,15rem)] leading-[0.9] font-semibold tracking-[-0.07em] text-gold lowercase select-none"
        >
          shemoqmedi
        </p>
      </div>

      <div className="border-t border-line">
        <div className="container-site py-6 text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} shemoqmedi.space · All rights reserved</p>
        </div>
      </div>
    </footer>
  );
}
