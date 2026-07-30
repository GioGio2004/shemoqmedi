// ─────────────────────────────────────────────────────────────────────────────
// Money formatting — the ONE place that knows currency symbols and placement.
//
// Prices are stored in Convex in minor units (tetri/cents, integer). Anything
// that renders a price to a diner must go through these helpers with the
// venue's configured currency (organizations.currency, default "GEL") —
// hardcoding "$" or "₾" in a component is a bug (Georgian Consumer Rights Law
// Art 6 requires clear, accurate price display).
// ─────────────────────────────────────────────────────────────────────────────

type SymbolSpec = { symbol: string; position: "prefix" | "suffix" };

const CURRENCY_SYMBOLS: Record<string, SymbolSpec> = {
  GEL: { symbol: "₾", position: "suffix" }, // Georgian convention: "5.50 ₾"
  USD: { symbol: "$", position: "prefix" },
  EUR: { symbol: "€", position: "prefix" },
};

/** Format an amount already in DISPLAY units (lari/dollars). 5.5 → "5.50 ₾" */
export function formatMoney(amount: number, currency = "GEL"): string {
  const spec = CURRENCY_SYMBOLS[currency];
  const value = amount.toFixed(2);
  if (!spec) return `${value} ${currency}`;
  return spec.position === "prefix"
    ? `${spec.symbol}${value}`
    : `${value} ${spec.symbol}`;
}

/** Format an amount in MINOR units (tetri/cents). 550 → "5.50 ₾" */
export function formatMinor(minor: number, currency = "GEL"): string {
  return formatMoney(minor / 100, currency);
}

/** Just the symbol (falls back to the code) — for tight UI spots. */
export function currencySymbol(currency = "GEL"): string {
  return CURRENCY_SYMBOLS[currency]?.symbol ?? currency;
}
