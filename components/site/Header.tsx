import Link from "next/link";
import { MENU_ITEMS } from "@/lib/navigation";
import { CrowNav } from "./CrowNav";
import { MenuCloser } from "./MenuCloser";
import { NavPills } from "./NavPills";
import { PillLink } from "./ui";

/**
 * Admin-panel style header: white bar with rounded bottom corners, wordmark,
 * segmented pill navigation, Submit pill. It sits at the top of the page and
 * scrolls away; the crow (CrowNav, a separate fixed layer) stays put and
 * becomes the menu. CrowNav is rendered outside <header> on purpose: the
 * header's backdrop-filter would otherwise trap the fixed crow inside it.
 */
export function Header() {
  return (
    <>
      <CrowNav />
      <header className="site-header absolute inset-x-0 top-0 z-50">
        <MenuCloser />
        <div className="container-site flex h-20 items-center justify-between gap-4 md:h-[88px]">
          <Link href="/" className="flex items-center gap-4" aria-label="shemoqmedi, home">
            {/* Space held for the crow, which lives in the fixed CrowNav layer. */}
            <span aria-hidden="true" className="w-14 shrink-0" />
            <span className="flex flex-col leading-none">
              <span className="text-[18px] font-bold tracking-[-0.055em] uppercase">Shemoqmedi</span>
              <span className="mt-[5px] text-[9px] font-semibold tracking-[0.27em] uppercase">Space</span>
            </span>
          </Link>

          <NavPills className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="hidden text-[11.5px] font-semibold tracking-[0.05em] text-black/60 uppercase hover:text-black lg:inline"
            >
              Account
            </Link>
            <PillLink href="/submit" className="hidden sm:inline-flex">
              Submit site
            </PillLink>

            <details className="group relative lg:hidden">
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
                        className="flex items-center justify-between rounded-2xl px-4 py-3 text-2xl font-semibold tracking-[-0.04em] hover:bg-black hover:text-white"
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
    </>
  );
}
