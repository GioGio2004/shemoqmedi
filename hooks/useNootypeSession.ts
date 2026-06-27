"use client";

// hooks/useNootypeSession.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source-of-truth session hook.
//
// ARCHITECTURAL CHANGE (2026-06-27):
//   localStorage now stores ONLY the guestId (session UUID).
//   The nootype is stored in Convex `anonymous_guests.savedNootype` and is
// Single source-of-truth session hook — dual-write strategy.
//
// PERSISTENCE MODEL:
//   PRIMARY:   localStorage — instant, optimistic. Drives UI decisions (popup
//              guard, chatbot nootype injection). Never blocked on network.
//   SECONDARY: Convex `anonymousGuests` — cross-device backup. Written async
//              after localStorage so the UI is NEVER gated on a Convex call.
//
// WHY DUAL-WRITE:
//   If nootype lived only in Convex, every page load would show the popup for
//   ~300ms while the query is in-flight. That backdrop blocks all UI clicks,
//   including the AI chatbot trigger. localStorage fixes this by providing an
//   instant answer with zero network latency.
//
// Storage keys:
//   "shemoqmedi_nootype"   — permanent, set-once archetype selection
//   "shemoqmedi_guest_id"  — UUID for Convex session grouping
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";

export type Nootype = "form" | "overcoming" | "relaxation" | "management";

export const NOOTYPE_KEY    = "shemoqmedi_nootype";
export const SESSION_ID_KEY = "shemoqmedi_guest_id";
/** @deprecated Use SESSION_ID_KEY. Legacy key kept for migration reads. */
const LEGACY_SESSION_ID_KEY = "voloo_session_id";

const VALID_NOOTYPES: Nootype[] = ["form", "overcoming", "relaxation", "management"];

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

export interface NootypeSession {
  /** UUID — stable across page loads for the lifetime of the dining cycle */
  sessionId: string;

  /**
   * The persisted archetype (from localStorage, backed up to Convex).
   * null if the guest hasn't onboarded yet.
   */
  nootype: Nootype | null;

  /**
   * The *active* archetype to send to /api/chat.
   * Equals moodOverride if set, otherwise falls back to nootype.
   */
  activeMood: Nootype | null;

  /**
   * In-session live override (memory-only, NOT persisted).
   * Set by the Mood Switcher in the chat header. Cleared on page reload.
   */
  moodOverride: Nootype | null;

  /** True once onboarding is complete (nootype !== null) */
  hasOnboarded: boolean;

  /**
   * Always false — kept for API compatibility. localStorage is synchronous
   * so there is no async loading window.
   */
  isLoading: boolean;

  /**
   * Persists the archetype to localStorage immediately (optimistic) and
   * asynchronously writes to Convex as a backup.
   */
  setNootype: (nootype: Nootype) => void;

  /**
   * Updates the live mood for this session without touching localStorage.
   * Called from the Mood Switcher dropdown in the chat header.
   */
  setMoodOverride: (mood: Nootype) => void;

  /** Generates a fresh sessionId + clears both nootype AND moodOverride */
  resetSession: () => void;
}

export function useNootypeSession(): NootypeSession {
  const [sessionId,    setSessionId]    = useState<string>("");
  const [nootype,      setNootypeState] = useState<Nootype | null>(null);
  const [moodOverride, setMoodOverrideState] = useState<Nootype | null>(null);

  // ── Step 1: Hydrate from localStorage after mount (SSR-safe) ─────────────
  // This is synchronous — zero network latency. The popup will never show
  // if a nootype is already saved here.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Migrate session ID from the old key name if needed
    const legacy = localStorage.getItem(LEGACY_SESSION_ID_KEY);
    let id = localStorage.getItem(SESSION_ID_KEY);
    if (!id && legacy) {
      id = legacy;
      localStorage.setItem(SESSION_ID_KEY, id);
    } else if (!id) {
      id = generateUUID();
      localStorage.setItem(SESSION_ID_KEY, id);
    }
    setSessionId(id);

    // Restore the permanent nootype archetype
    const stored = localStorage.getItem(NOOTYPE_KEY) as Nootype | null;
    if (stored && VALID_NOOTYPES.includes(stored)) {
      setNootypeState(stored);
    }
  }, []);

  // ── Step 2: Convex backup (secondary, non-blocking) ───────────────────────
  // This query runs in the background after localStorage has already given
  // us an instant answer. If Convex has a more recent value (e.g. user
  // onboarded on another device), it will update the state here.
  const guestProfile = useQuery(
    (api as any).anonymousGuests?.getProfile,
    sessionId ? { guestId: sessionId } : "skip",
  );

  // Reconcile: if Convex has a nootype and localStorage doesn't (e.g. cleared
  // by the user manually), sync localStorage from Convex.
  useEffect(() => {
    if (!guestProfile?.savedNootype) return;
    const convexNootype = guestProfile.savedNootype as Nootype;
    if (!VALID_NOOTYPES.includes(convexNootype)) return;
    // Only update if local state doesn't already have a value (Convex wins
    // only when localStorage is empty — localStorage wins otherwise).
    setNootypeState((prev) => {
      if (!prev) {
        // Also write back to localStorage so future loads are instant
        localStorage.setItem(NOOTYPE_KEY, convexNootype);
        return convexNootype;
      }
      return prev;
    });
  }, [guestProfile]);

  // ── Step 3: Convex mutation (backup write) ────────────────────────────────
  const updateNootypeMutation = useMutation(
    (api as any).anonymousGuests?.updateNootype,
  );

  const setNootype = useCallback(
    (value: Nootype) => {
      // PRIMARY write: localStorage — instant, unblocked, UI reacts immediately
      localStorage.setItem(NOOTYPE_KEY, value);
      setNootypeState(value);
      setMoodOverrideState(null);

      // SECONDARY write: Convex — async backup, fire-and-forget
      if (sessionId) {
        updateNootypeMutation({ guestId: sessionId, savedNootype: value }).catch(
          (e) => console.warn("[Nootype] Convex backup write failed (non-blocking):", e),
        );
      }
    },
    [sessionId, updateNootypeMutation],
  );

  const setMoodOverride = useCallback((mood: Nootype) => {
    setMoodOverrideState(mood);
  }, []);

  const resetSession = useCallback(() => {
    const newId = generateUUID();
    localStorage.setItem(SESSION_ID_KEY, newId);
    localStorage.removeItem(NOOTYPE_KEY);
    setSessionId(newId);
    setNootypeState(null);
    setMoodOverrideState(null);
  }, []);

  const activeMood: Nootype | null = moodOverride ?? nootype;

  return {
    sessionId,
    nootype,
    activeMood,
    moodOverride,
    hasOnboarded: nootype !== null,
    isLoading: false, // localStorage is synchronous — no async loading window
    setNootype,
    setMoodOverride,
    resetSession,
  };
}
