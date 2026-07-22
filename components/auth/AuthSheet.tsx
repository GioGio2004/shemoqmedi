"use client";

// components/auth/AuthSheet.tsx
// ─────────────────────────────────────────────────────────────────────────────
// RULED auth sheet — bottom sheet on mobile, centered modal ≥720px. Portaled
// to <body> (outside any tweened landing palette → static --v-* tokens),
// z-9999 backdrop per the §12 portfolio-sheet contract. Escape / backdrop-tap
// close, body scroll-lock, reduced-motion-safe CSS entrance.
//
// Two ways to drive it:
//   1. Prop API:    <AuthSheet open={open} onClose={() => setOpen(false)} />
//   2. Global hook: mount <AuthSheetHost /> once anywhere under the [locale]
//      providers, then from any client component (e.g. the future Reserve
//      flow):  const { open } = useAuthSheet();  open();  — or call the
//      plain functions openAuthSheet() / closeAuthSheet() outside React.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import AuthPanel, { type AuthIntent } from "./AuthPanel";
import { AUTH_CSS } from "./auth-css";

export type AuthSheetProps = {
  open: boolean;
  onClose: () => void;
  intent?: AuthIntent;
};

export default function AuthSheet({ open, onClose, intent = "sign-in" }: AuthSheetProps) {
  const t = useTranslations("Auth");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="va-bd"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{AUTH_CSS}</style>
      <div
        className="va-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={intent === "sign-up" ? t("titleSignUp") : t("titleSignIn")}
        data-lenis-prevent
      >
        <span className="va-handle" aria-hidden="true" />
        <AuthPanel intent={intent} onClose={onClose} onComplete={onClose} />
      </div>
    </div>,
    document.body
  );
}

/* ═══ Global open/close store — no provider required ═══════════════════════
   Module-level state + useSyncExternalStore keeps this dependency-free and
   mountable without touching the [locale] layout (which is reserved for the
   GoogleOneTap mount only). */

type SheetState = { open: boolean; intent: AuthIntent };

const CLOSED: SheetState = { open: false, intent: "sign-in" };
let sheetState: SheetState = CLOSED;
const listeners = new Set<() => void>();

function emit(next: SheetState) {
  sheetState = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => sheetState;
const getServerSnapshot = () => CLOSED;

/** Imperative openers — safe to call from event handlers or non-React code. */
export function openAuthSheet(intent: AuthIntent = "sign-in") {
  emit({ open: true, intent });
}
export function closeAuthSheet() {
  emit({ ...sheetState, open: false });
}

/** Reactive handle on the global auth sheet. */
export function useAuthSheet() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    isOpen: state.open,
    intent: state.intent,
    open: openAuthSheet,
    close: closeAuthSheet,
  };
}

/** Mount once (client tree) to make useAuthSheet()/openAuthSheet() render. */
export function AuthSheetHost() {
  const { isOpen, intent, close } = useAuthSheet();
  return <AuthSheet open={isOpen} onClose={close} intent={intent} />;
}
