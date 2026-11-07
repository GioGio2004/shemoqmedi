import Link from "next/link";
import { PillLink, Wordmark } from "./ui";

export const MENU_ITEMS = [
  { label: "Websites", href: "/" },
  { label: "Submit a site", href: "/submit" },
  { label: "Your account", href: "/account" },
  { label: "Log in", href: "/sign-in" },
] as const;

// Fixed, transparent over the page; turns into white glass on scroll (see
// .site-header in globals.css). The menu is a native <details>, so the
// header ships zero JavaScript.
export function Header() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div className="container-site flex h-20 items-center justify-between gap-4 md:h-[88px]">
        <Wordmark />

        <div className="flex items-center gap-3">
          <PillLink href="/submit" className="hidden sm:inline-flex">
            Submit site
          </PillLink>

          <details className="group relative">
            <summary className="flex min-h-[46px] cursor-pointer list-none items-center gap-4 rounded-full border border-black/12 bg-white py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase select-none hover:border-black [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Menu</span>
              <span className="hidden group-open:inline">Close</span>
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center gap-[3px] rounded-full bg-black"
              >
                <span className="size-[3px] rounded-full bg-white" />
                <span className="size-[3px] rounded-full bg-white" />
              </span>
            </summary>
            <nav
              aria-label="Main"
              className="absolute top-[calc(100%+12px)] right-0 w-[min(88vw,340px)] rounded-3xl border border-black/10 bg-white p-3"
            >
              <ul>
                {MENU_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-2xl font-semibold tracking-[-0.04em] hover:bg-black hover:text-white"
                    >
                      {item.label}
                      <span aria-hidden="true" className="text-base">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
