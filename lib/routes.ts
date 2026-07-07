/**
 * lib/routes.ts — Centralized URL route config
 *
 * MENU_ROUTE_BASE is the single source of truth for the interactive digital
 * menu path prefix. All venue CTAs must use buildMenuUrl() from this file.
 * To rename the menu route, update the base string here.
 * This guarantees we don't end up with 404s if we decide `/custom-ui-test`
 * sounds better than `/menu` down the line.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const MENU_ROUTE_BASE =
  process.env.NEXT_PUBLIC_MENU_ROUTE_BASE ?? "/custom-ui-test";

/**
 * buildMenuUrl — constructs the full localized path to a venue's digital menu.
 * @example buildMenuUrl("en", "mtatsminda-coffee") → "/en/custom-ui-test/mtatsminda-coffee"
 */
export function buildMenuUrl(locale: string, slug: string): string {
  return `/${locale}${MENU_ROUTE_BASE}/${slug}`;
}

/**
 * buildVenueUrl — constructs the URL to the public venue discovery page.
 * @example buildVenueUrl("en", "mtatsminda-coffee") → "/en/custom-ui-test/mtatsminda-coffee"
 */
export function buildVenueUrl(locale: string, slug: string): string {
  return `/${locale}/custom-ui-test/${slug}`;
}

/**
 * buildVenuesDirectoryUrl — constructs the URL to the /custom-ui-test directory.
 * @example buildVenuesDirectoryUrl("en") → "/en/custom-ui-test"
 */
export function buildVenuesDirectoryUrl(locale: string): string {
  return `/${locale}/custom-ui-test`;
}
