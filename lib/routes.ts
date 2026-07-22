/**
 * lib/routes.ts — Centralized URL route config
 *
 * MENU_ROUTE_BASE is the single source of truth for the interactive digital
 * menu path segment (no slashes). All venue links must use the helpers below.
 * To rename the menu route, update the base string here (and add a redirect
 * from the old path in next.config.ts).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const MENU_ROUTE_BASE =
  process.env.NEXT_PUBLIC_MENU_ROUTE_BASE ?? "menu";

/**
 * buildMenuUrl — the full localized path to a venue's digital menu page.
 * @example buildMenuUrl("en", "mtatsminda-coffee") → "/en/menu/mtatsminda-coffee"
 */
export function buildMenuUrl(locale: string, slug: string): string {
  return `/${locale}/${MENU_ROUTE_BASE}/${slug}`;
}

/**
 * buildMenuDirectoryUrl — the localized path to the menu/venues directory.
 * @example buildMenuDirectoryUrl("en") → "/en/menu"
 */
export function buildMenuDirectoryUrl(locale: string): string {
  return `/${locale}/${MENU_ROUTE_BASE}`;
}
