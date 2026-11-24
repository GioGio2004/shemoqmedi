"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import { defaultAvatarUrl, pickedAvatar } from "@/lib/defaultAvatar";

/**
 * The signed-in person's picture on Shemoqmedi, the same one their creator
 * card and profile show: their own photo when they have one, unless they
 * picked a Shemoqmedi avatar instead; without a photo, a Shemoqmedi avatar
 * (the one they picked, else the one picked from their creator profile's
 * address, else from their account). `ready` is false while loading.
 */
export function useMyPicture() {
  const { user, isLoaded } = useUser();
  const me = useQuery(api.users.getCurrentUser, user ? {} : "skip");
  const profiles = useQuery(api.creators.mine, user ? {} : "skip");
  const ready = isLoaded && (!user || (me !== undefined && profiles !== undefined));
  const key = profiles?.[0]?.slug ?? user?.id ?? "";
  const choice = me?.avatar ?? null;
  const hasPhoto = Boolean(user?.hasImage);
  const pickedAnAvatar = choice !== null && choice !== "photo";
  const showsPhoto = hasPhoto && !pickedAnAvatar;
  return {
    ready,
    /** Their own photo, unless they picked an avatar instead. */
    photoUrl: showsPhoto && user ? user.imageUrl : null,
    /** The avatar shown when not the photo. */
    avatarUrl: defaultAvatarUrl(key, choice),
    /** "photo", "01"…"24", or null (the picked one). */
    choice,
    /** The number of the avatar picked for them when they haven't chosen one. */
    picked: pickedAvatar(key),
    /** Whether they have a real sign-in photo they could show. */
    hasPhoto,
    /** The sign-in photo, for the picker's "use my photo" option. */
    accountPhotoUrl: hasPhoto && user ? user.imageUrl : null,
    /** Whether they own a creator profile (where the picture is public). */
    hasCreatorProfile: (profiles?.length ?? 0) > 0,
  };
}
