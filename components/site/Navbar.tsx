import Link from "next/link";
import { Logo } from "./Logo";
import { ButtonLink } from "./ui";

export const NAV_ITEMS = [
  { label: "Websites", href: "#shortlist" },
  { label: "Categories", href: "#categories" },
  { label: "Creators", href: "#creators" },
  { label: "Awards", href: "#awards" },
] as const;

// Server-rendered; the mobile menu is a native <details> element, so the
// navbar ships zero JavaScript.
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="container-site flex h-16 items-center gap-10">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-soft hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-6 md:flex">
          <Link href="/sign-in" className="text-sm hover:underline">
            Log in
          </Link>
          <ButtonLink href="/sign-up" className="h-9 px-4">
            Submit work
          </ButtonLink>
        </div>

        <details className="group ml-auto md:hidden">
          <summary className="flex h-9 cursor-pointer list-none items-center rounded-full border border-line px-4 text-sm [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Menu</span>
            <span className="hidden group-open:inline">Close</span>
          </summary>
          <div className="absolute inset-x-0 top-16 border-b border-line bg-paper">
            <nav aria-label="Main" className="container-site py-6">
              <ul className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block py-2 text-3xl font-semibold tracking-[-0.035em]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                <ButtonLink href="/sign-up">Submit work</ButtonLink>
                <ButtonLink href="/sign-in" variant="outline">
                  Log in
                </ButtonLink>
              </div>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
