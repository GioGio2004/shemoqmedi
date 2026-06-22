"use client";

import { useState, useEffect } from "react";

export function useGuest(tagId: string) {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (!tagId) return;

    const storageKey = `shemoqmedi_guest_${tagId}`;
    let storedId = localStorage.getItem(storageKey);

    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem(storageKey, storedId);
    }

    setGuestId(storedId);
  }, [tagId]);

  return guestId;
}
