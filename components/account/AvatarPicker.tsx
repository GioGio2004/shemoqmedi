"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex-helpers-api";
import { AVATAR_NUMBERS, avatarUrlFor } from "@/lib/defaultAvatar";
import { friendlyError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useMyPicture } from "./useMyPicture";

const tile =
  "relative block aspect-[4/5] w-full overflow-hidden rounded-xl border transition-[border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2";

/**
 * "Your picture": the picture Shemoqmedi shows for them on their creator card,
 * profile and account. Their own photo by default when they have one, else a
 * Shemoqmedi avatar; they can pick any of the 24 instead. `onlyForCreators`
 * hides it for someone without a creator profile (the jury profile page).
 */
export function AvatarPicker({ onlyForCreators = false }: { onlyForCreators?: boolean }) {
  const picture = useMyPicture();
  const save = useMutation(api.users.setMyAvatar);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!picture.ready || (onlyForCreators && !picture.hasCreatorProfile)) return null;
  // What is on screen now: their photo, the avatar they picked, or the one picked for them.
  const current = picture.photoUrl ? "photo" : (picture.choice && picture.choice !== "photo" ? picture.choice : picture.picked);

  async function choose(avatar: string) {
    if (busy) return;
    setBusy(avatar);
    setError(null);
    try {
      await save({ avatar });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section
      aria-labelledby="your-picture-title"
      className="grid gap-6 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
    >
      <div className="grid content-start gap-2 md:col-span-4 lg:col-span-3">
        <h2 id="your-picture-title" className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]">
          Your picture
        </h2>
        <p className="text-sm text-black/55">
          Shown on your creator card and profile. Your own photo is used when you have one; pick any of these
          instead if you like.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
      <div className="grid min-w-0 gap-6 md:col-span-8 lg:col-span-9">
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {picture.accountPhotoUrl && (
            <li>
              <button
                type="button"
                onClick={() => choose("photo")}
                aria-pressed={current === "photo"}
                aria-label="Use my own photo"
                disabled={busy !== null}
                className={cn(tile, current === "photo" ? "border-black ring-2 ring-black" : "border-black/10 hover:border-black/40")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Clerk resizes it */}
                <img src={picture.accountPhotoUrl} alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute inset-x-1 bottom-1 rounded-md bg-black/75 py-1 text-center text-[10px] font-semibold tracking-[0.04em] text-white uppercase">
                  My photo
                </span>
              </button>
            </li>
          )}
          {AVATAR_NUMBERS.map((n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => choose(n)}
                aria-pressed={current === n}
                aria-label={`Use picture ${Number(n)}`}
                disabled={busy !== null}
                className={cn(tile, current === n ? "border-black ring-2 ring-black" : "border-black/10 hover:border-black/40")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a 1 KB SVG from /public */}
                <img src={avatarUrlFor(n)} alt="" className="absolute inset-0 size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-black/55">
          {busy ? "Saving…" : "Changes show on your public profile within a minute."}
        </p>
      </div>
    </section>
  );
}
