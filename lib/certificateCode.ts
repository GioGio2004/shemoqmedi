import { createHmac } from "node:crypto";
import { fetchQuery } from "convex/nextjs";
import { api, type PublicAward } from "@/convex-helpers-api";
import { getAward } from "@/lib/listings";
import { SITE_URL } from "@/lib/site";
import { AWARDS, type AwardSlug } from "@/lib/taxonomy";

// Certificate numbers: "SQ-SOTD-7K3P-92XA". The last eight characters are an
// HMAC of the award's slug under CERTIFICATE_SECRET (server env, never sent to
// the browser), so a number can't be made up or moved to another award. The
// number never changes for an award, even if the site is renamed later.
// /verify looks a number up and shows the official record; a revoked award's
// number stops verifying because only active awards are searched.

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford base32: no I, L, O, U

function secret() {
  return process.env.CERTIFICATE_SECRET?.trim() || null;
}

/** Whether numbers can be issued and checked (CERTIFICATE_SECRET is set). */
export function certificatesSigned() {
  return secret() !== null;
}

/** The award's certificate number, or null without CERTIFICATE_SECRET. */
export function certificateCode(award: { slug: string; tier: AwardSlug }) {
  const key = secret();
  if (!key) return null;
  const mac = createHmac("sha256", key).update(`shemoqmedi-certificate:${award.slug}`).digest();
  let bits = BigInt(0);
  for (let i = 0; i < 5; i++) bits = (bits << BigInt(8)) | BigInt(mac[i]); // 40 bits = 8 characters
  let out = "";
  for (let i = 7; i >= 0; i--) out += ALPHABET[Number((bits >> BigInt(i * 5)) & BigInt(31))];
  return `SQ-${award.tier}-${out.slice(0, 4)}-${out.slice(4)}`;
}

/** Typed numbers forgive case, spaces, missing dashes and the usual look-alikes (O/0, I/L/1). */
export function normalizeCode(input: string) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
}

/** The page a certificate's QR code opens. */
export function verifyUrl(code: string, awardSlug?: string) {
  const query = new URLSearchParams({ code });
  if (awardSlug) query.set("award", awardSlug);
  return `${SITE_URL}/verify?${query.toString()}`;
}

/**
 * The active award a number belongs to, or null (made up, mistyped, revoked).
 * `awardSlug` (from the QR code) checks that award directly; a typed number
 * is matched against the active awards of the tier it names.
 */
export async function findCertificate(input: string, awardSlug?: string): Promise<PublicAward | null> {
  if (!certificatesSigned()) return null;
  const want = normalizeCode(input);
  const matches = (award: PublicAward) => {
    const code = certificateCode(award);
    return code !== null && normalizeCode(code) === want;
  };
  if (awardSlug) {
    const award = await getAward(awardSlug);
    if (award && matches(award)) return award;
  }
  const tier = AWARDS.find((a) => want.startsWith(normalizeCode(`SQ${a.slug}`)))?.slug;
  if (!tier) return null;
  try {
    const awards = await fetchQuery(api.awards.listPublic, { tier, limit: 1000 });
    return awards.find(matches) ?? null;
  } catch (error) {
    console.error("awards.listPublic failed:", error);
    return null;
  }
}
