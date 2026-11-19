/**
 * Whether a signed-in email could be the one a claim link was sent to, from
 * the masked hint the server gives ("an•••@gmail.com", see
 * shemoqmedi-admin/convex/claimLinks.ts maskEmail). Only for a warning on the
 * claim page: the server makes the real check.
 */
export function matchesEmailHint(email: string, hint: string) {
  const [prefix, domain] = hint.toLowerCase().split("•••@");
  if (prefix === undefined || domain === undefined) return true; // unknown format: don't warn
  const [local, emailDomain] = email.trim().toLowerCase().split("@");
  if (!local || !emailDomain) return false;
  return emailDomain === domain && local.startsWith(prefix);
}
