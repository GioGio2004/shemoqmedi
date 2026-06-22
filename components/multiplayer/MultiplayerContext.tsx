"use client";

import { createContext, useContext, ReactNode } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MultiplayerSession {
  /** Server-generated UUID from the httpOnly cookie. Null = online-only browser. */
  guestId: string | null;
  /** Convex tableSessions document ID. Null = no active session (online-only). */
  sessionId: string | null;
  /** Physical tag Convex document ID. */
  tagId: string | null;
  /** Seat number auto-filled from the NFC tag. */
  seatNumber: number | null;
  /** Whether this user arrived via a physical NFC tap (has a valid session). */
  isDineIn: boolean;
}

const MultiplayerContext = createContext<MultiplayerSession>({
  guestId: null,
  sessionId: null,
  tagId: null,
  seatNumber: null,
  isDineIn: false,
});

// ─── Provider ──────────────────────────────────────────────────────────────────

interface MultiplayerProviderProps {
  guestId: string | null;
  sessionId: string | null;
  tagId: string | null;
  seatNumber: number | null;
  children: ReactNode;
}

export function MultiplayerProvider({
  guestId,
  sessionId,
  tagId,
  seatNumber,
  children,
}: MultiplayerProviderProps) {
  const value: MultiplayerSession = {
    guestId,
    sessionId,
    tagId,
    seatNumber,
    isDineIn: !!(guestId && sessionId),
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useMultiplayer(): MultiplayerSession {
  return useContext(MultiplayerContext);
}
