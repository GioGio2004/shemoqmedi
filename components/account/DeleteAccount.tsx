"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { api } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import { inputClass } from "@/components/auth/AuthUI";

/**
 * "Delete my account" (audit J-02). users.deleteMyAccount removes our data
 * (sites that never went public are deleted, public ones stay listed
 * without you, votes and requests go) and then the Clerk login, both on the
 * server; the page only signs out.
 */
export function DeleteAccount() {
  const deleteMyAccount = useAction(api.users.deleteMyAccount);
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(e: React.FormEvent) {
    e.preventDefault();
    if (typed !== "DELETE") return;
    setBusy(true);
    setError(null);
    try {
      const { loginDeleted } = await deleteMyAccount({ confirm: "DELETE" });
      if (!loginDeleted) {
        setError("Your data is deleted, but we couldn't close your login. Email us and we'll finish it within a few days.");
        setBusy(false);
        return;
      }
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
      return;
    }
    await signOut({ redirectUrl: "/" });
  }

  return (
    <section aria-labelledby="delete-account" className="mt-20 border-t border-black/10 pt-10">
      <h2 id="delete-account" className="eyebrow text-black">
        Delete my account
      </h2>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 text-[13px] text-black/60 underline-offset-4 hover:text-black hover:underline"
        >
          Delete my account and my data
        </button>
      ) : (
        <form onSubmit={onDelete} className="mt-4 grid max-w-md gap-4 text-sm leading-relaxed">
          <p>
            This can&apos;t be undone. Sites you submitted that were never published are deleted. Published sites stay
            in the showcase as part of the awards record, but no longer belong to you. Your votes, requests and login
            are removed. A jury profile goes private.
          </p>
          <label htmlFor="delete-confirm" className="grid gap-2">
            <span>
              Type <strong>DELETE</strong> to confirm
            </span>
            <input
              id="delete-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className={inputClass}
              disabled={busy}
            />
          </label>
          {error ? (
            <p role="alert" className="rounded-2xl border border-black px-4 py-3">
              {error}
            </p>
          ) : null}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={typed !== "DELETE" || busy}
              className="min-h-[46px] rounded-full bg-black px-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-40"
            >
              {busy ? "Deleting…" : "Delete my account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
              disabled={busy}
              className="text-[13px] text-black/60 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
