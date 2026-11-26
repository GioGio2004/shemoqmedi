// Browser-side helpers for the 30-second submission (/submit) and the
// optional sign-in after it (/submit/received). See convex/quickSubmit.ts.

import type { SubmissionAttribution } from "@/convex-helpers-api";

/** This browser's reference to its latest submission. Never the email. */
const REF_KEY = "submission-ref";
const REF_TTL = 30 * 24 * 3600_000;
/** Campaign tags and referring site from the page people landed on, for the rest of the visit. */
const UTM_KEY = "submission-utm";

export type SubmissionRef = { id: string; token: string; at: number };

export function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** A long random password, for a Clerk setup that still requires one at sign-up. Nobody needs it: they log in with a code. */
export function randomPassword() {
  return `${newToken().slice(0, 24)}Aa1!`;
}

export function readRef(): SubmissionRef | null {
  try {
    const r = JSON.parse(localStorage.getItem(REF_KEY) ?? "null") as SubmissionRef | null;
    return r && typeof r.id === "string" && /^[a-f0-9]{64}$/.test(r.token) && Date.now() - r.at < REF_TTL ? r : null;
  } catch {
    return null;
  }
}

/** Remembers the submission (stamped now), and returns it. */
export function saveRef(ref: Omit<SubmissionRef, "at">): SubmissionRef {
  const saved = { ...ref, at: Date.now() };
  try {
    localStorage.setItem(REF_KEY, JSON.stringify(saved));
  } catch {
    // storage blocked (private mode): the page still has it in memory
  }
  return saved;
}

/** The in-app browser we're in, if any (Google blocks its sign-in there). */
export function inAppBrowser(): "instagram" | "facebook" | "threads" | "tiktok" | "linkedin" | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/Barcelona/i.test(ua)) return "threads";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(ua)) return "facebook";
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return "tiktok";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  return null;
}

function device(): SubmissionAttribution["device"] {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}

function externalReferrer() {
  try {
    const host = document.referrer ? new URL(document.referrer).host : "";
    return host && host !== window.location.host ? host.slice(0, 120) : undefined;
  } catch {
    return undefined;
  }
}

/** Remembers the landing page's utm_ tags and referring site for this visit. Call on /submit. */
export function rememberLanding(params: URLSearchParams) {
  const saved = landing();
  const next: Record<string, string> = { ...saved };
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    const value = params.get(key);
    if (value) next[key] = value.slice(0, 80);
  }
  const ref = externalReferrer();
  if (ref && !saved.ref) next.ref = ref;
  try {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(next));
  } catch {
    // storage blocked
  }
}

function landing(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

/** Where this visit came from: campaign tags, the referring host, device and in-app browser. No personal data. */
export function attribution(): SubmissionAttribution {
  const tags = landing();
  return {
    utmSource: tags.utm_source,
    utmMedium: tags.utm_medium,
    utmCampaign: tags.utm_campaign,
    referrer: tags.ref ?? externalReferrer(),
    device: device(),
    inApp: inAppBrowser() ?? undefined,
  };
}

/** The funnel's source label (the server uses the same rule). */
export function funnelSource() {
  return landing().utm_source || inAppBrowser() || "direct";
}
