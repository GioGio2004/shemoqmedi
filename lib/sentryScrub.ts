// Keeps secrets out of what Sentry receives (audit E-01). A claim link
// (/claim/<token>) lets whoever holds it take over a listing, so its token
// must never sit in an error report, a breadcrumb or a trace. The same goes
// for query strings that carry a token or key.
//
// Instead of knowing every field Sentry might put a URL in (request.url,
// transaction, breadcrumb data.from/to/url, exception messages, span
// descriptions, ...), every string in the event is scrubbed.
//
// The admin has the same file (shemoqmedi-admin/lib/sentryScrub.ts): keep
// them in step.

const REDACTED = "[redacted]";

// "/claim/<anything up to the next / ? # or quote/space>".
const CLAIM_PATH = /(\/claim\/)[^/?#\s"'<>]+/gi;
// "?token=…", "&key=…" (and the short t= / code= forms some links use).
const SECRET_QUERY = /([?&](?:token|key|t|code)=)[^&#\s"'<>]*/gi;

/** A string with claim tokens and secret query values replaced by "[redacted]". */
export function scrubText(text: string): string {
  return text.replace(CLAIM_PATH, `$1${REDACTED}`).replace(SECRET_QUERY, `$1${REDACTED}`);
}

// Query-string objects ({ token: "…" }) and header maps keep the key but
// lose the value. Sign-in headers too (the admin's MCP connector sends a
// bearer token), in case a request's headers ever end up in an event.
const SECRET_KEYS = new Set(["token", "key", "t", "code", "authorization", "cookie", "set-cookie", "x-api-key"]);

/** A deep copy of `value` with every string scrubbed (scrubText). */
export function scrubDeep<T>(value: T, depth = 0): T {
  if (typeof value === "string") return scrubText(value) as T;
  // Sentry events are shallow; the cap only guards against odd cyclic data.
  if (depth > 12 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    // A query string as [name, value] pairs: [["token", "…"]].
    if (value.length === 2 && typeof value[0] === "string" && SECRET_KEYS.has(value[0].toLowerCase()) && typeof value[1] === "string") {
      return [value[0], REDACTED] as T;
    }
    return value.map((item) => scrubDeep(item, depth + 1)) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SECRET_KEYS.has(k.toLowerCase()) && typeof v === "string" ? REDACTED : scrubDeep(v, depth + 1);
  }
  return out as T;
}
