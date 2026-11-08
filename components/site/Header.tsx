import { PillLink, Wordmark } from "./ui";
import { MenuButton, MenuCurtain, MenuProvider, MenuSearchField, MobileSearchButton } from "./MegaMenu";

// Fixed, transparent over the page; turns into white glass on scroll (see
// .site-header in globals.css). Every page and category lives in the mega
// menu (MegaMenu.tsx): a curtain that drops from the top, opened by the
// Menu button, the search field (desktop) or the search button (phones).
// The curtain sits beside the <header>, not inside it: the header's glass
// (backdrop-filter) would make it the containing block of a fixed child.
export function Header() {
  return (
    <MenuProvider>
      <header className="site-header fixed inset-x-0 top-0 z-50">
        <div className="container-site flex h-20 items-center gap-3 md:h-[88px] lg:gap-6">
          <Wordmark className="shrink-0" />
          <MenuSearchField className="hidden min-w-0 flex-1 lg:mx-auto lg:flex lg:max-w-[560px]" />
          <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
            <MobileSearchButton className="lg:hidden" />
            <MenuButton />
            <PillLink href="/submit" className="hidden sm:inline-flex">
              Submit site
            </PillLink>
            <PillLink href="/account" variant="outline" className="hidden lg:inline-flex">
              Account
            </PillLink>
          </div>
        </div>
      </header>
      <MenuCurtain />
    </MenuProvider>
  );
}
