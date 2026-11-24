/** How many Shemoqmedi avatars there are: public/avatars/avatar-01.svg … avatar-24.svg. */
export const DEFAULT_AVATAR_COUNT = 24;

/** "01" … "24": every avatar's number, in order. */
export const AVATAR_NUMBERS = Array.from({ length: DEFAULT_AVATAR_COUNT }, (_, i) => String(i + 1).padStart(2, "0"));

/** FNV-1a, 32 bit: small, stable across builds and the same on server and client. */
function hash(key: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The URL of avatar "01" … "24". */
export function avatarUrlFor(number: string) {
  return `/avatars/avatar-${number}.svg`;
}

/** The number of the avatar picked for this key, "01" … "24". */
export function pickedAvatar(key: string) {
  return AVATAR_NUMBERS[hash(key) % DEFAULT_AVATAR_COUNT];
}

/**
 * Everyone's picture on Shemoqmedi is a Shemoqmedi avatar unless they chose
 * their own photo. `chosen` is the one they picked ("01" … "24"); without a
 * valid choice it is picked from a stable key (a creator's slug, or an account
 * id), so the same person always gets the same picture, with nothing stored.
 */
export function defaultAvatarUrl(key: string, chosen?: string | null) {
  return avatarUrlFor(chosen && AVATAR_NUMBERS.includes(chosen) ? chosen : pickedAvatar(key));
}
