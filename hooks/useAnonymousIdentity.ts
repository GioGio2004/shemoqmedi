"use client";

// hooks/useAnonymousIdentity.ts
// ─────────────────────────────────────────────────────────────────────────────
// Minimal identity hook. ONLY responsibility:
//   1. Read/generate the guestId UUID from localStorage.
//   2. Call createProfile mutation on first visit to register the guest in Convex.
//   3. Return the guestId once it is ready.
//
// Nootype is NO LONGER stored in or read from localStorage.
// It lives exclusively in the Convex `anonymous_guests` table and is fetched
// reactively via useQuery(api.anonymousGuests.getProfile) wherever needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex-helpers-api";

const GUEST_ID_KEY = "shemoqmedi_guest_id";

// Robust UUID fallback for non-HTTPS local network testing
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useAnonymousIdentity(): { guestId: string | null; isReady: boolean } {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const createProfile = useMutation((api as any).anonymousGuests?.createProfile);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      let id = localStorage.getItem(GUEST_ID_KEY);
      if (!id) {
        id = generateUUID();
        localStorage.setItem(GUEST_ID_KEY, id);
        try {
          await createProfile({ guestId: id });
        } catch (e) {
          console.error("[Identity] Failed to create anonymous profile:", e);
        }
      }
      setGuestId(id);
      setIsReady(true);
    };

    init();
  }, [createProfile]);

  return { guestId, isReady };
}
