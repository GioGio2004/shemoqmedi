/** "8.72" — scores always show two decimals. */
export function formatScore(score: number | null | undefined) {
  return score === null || score === undefined ? "—" : score.toFixed(2);
}

/** "ENDS IN 05D : 14H : 22M", or "VOTING CLOSED". */
export function countdownLabel(endsAt: number, now: number) {
  const ms = endsAt - now;
  if (ms <= 0) return "Voting closed";
  const totalMinutes = Math.floor(ms / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `Ends in ${pad(d)}D : ${pad(h)}H : ${pad(m)}M`;
}

export function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(ms);
}

export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
