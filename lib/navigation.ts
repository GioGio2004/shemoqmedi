// Site navigation, shared by the header (server) and the crow menu (client).

/** Main sections, shown as the header's pill group on large screens. */
export const NAV_ITEMS = [
  { label: "Directory", href: "/" },
  { label: "Live voting", href: "/collections/nominees" },
  { label: "BSC (Solo)", href: "/collections/bsc" },
  { label: "Creators", href: "/creators" },
  { label: "Badges", href: "/badges" },
] as const;

/** Everything, for the menus (mobile menu and the floating crow menu). */
export const MENU_ITEMS = [
  ...NAV_ITEMS,
  { label: "Submit a site", href: "/submit" },
  { label: "Your account", href: "/account" },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
