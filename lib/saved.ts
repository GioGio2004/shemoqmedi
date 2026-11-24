"use client";

// Saved sites: a visitor's list of listing slugs, kept in this browser
// (localStorage), so saving needs no account and public pages stay static.
// /saved shows the list and makes a share link (/saved?s=slug,slug) that a
// client can send to their developer. Tabs stay in sync through the storage
// event; this tab's own writes notify subscribers directly.

import { useSyncExternalStore } from "react";

const KEY = "sq:saved";
/** Plenty for a reference list; keeps the share link a sane length. */
export const MAX_SAVED = 100;
const SLUG = /^[a-z0-9-]{1,80}$/;

const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let cache: { raw: string | null; slugs: string[] } = { raw: null, slugs: EMPTY };

/** Only well-formed slugs, no repeats, at most MAX_SAVED. */
export function cleanSlugs(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const s of input) {
    if (typeof s === "string" && SLUG.test(s) && !out.includes(s)) out.push(s);
    if (out.length >= MAX_SAVED) break;
  }
  return out;
}

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY; // storage blocked (private mode, settings)
  }
  if (raw === cache.raw) return cache.slugs;
  let slugs = EMPTY;
  try {
    slugs = raw ? cleanSlugs(JSON.parse(raw)) : EMPTY;
  } catch {
    slugs = EMPTY;
  }
  cache = { raw, slugs };
  return slugs;
}

function write(slugs: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cleanSlugs(slugs)));
  } catch {
    // Storage full or blocked: the save just doesn't stick.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The saved slugs, newest first; empty during server render. */
export function useSaved(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleSaved(slug: string) {
  const now = read();
  write(now.includes(slug) ? now.filter((s) => s !== slug) : [slug, ...now]);
}

/** Adds every slug not saved yet (a shared list), keeping the order. */
export function saveAll(slugs: string[]) {
  const now = read();
  write([...now, ...cleanSlugs(slugs).filter((s) => !now.includes(s))]);
}

export function removeSaved(slug: string) {
  write(read().filter((s) => s !== slug));
}
