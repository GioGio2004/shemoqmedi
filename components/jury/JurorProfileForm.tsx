"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api, type JurorProfileArgs } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import { LIMITS } from "@/lib/taxonomy";
import { ArrowIcon } from "@/components/site/ui";
import { JurorAvatar } from "./JurorAvatar";

const input =
  "w-full min-h-[46px] rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black";
const label = "eyebrow text-black";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE = 10 * 1024 * 1024; // Clerk's limit for profile images

/**
 * Profile photo, stored on the user's Clerk account (not ImageKit). The site
 * picks it up through the Clerk webhook; without one the jury pages show a
 * grey placeholder.
 */
function PhotoField() {
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photo = user?.hasImage ? user.imageUrl : null;

  async function upload(file: File | null) {
    if (!user) return;
    setError(null);
    if (file && !IMAGE_TYPES.includes(file.type)) return setError("Use a JPG, PNG, WebP or GIF image.");
    if (file && file.size > MAX_IMAGE) return setError("The photo must be 10 MB or less.");
    setBusy(true);
    try {
      await user.setProfileImage({ file });
      await user.reload();
    } catch {
      setError("The photo could not be saved. Please try another image.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-3">
      <p className={label}>Photo</p>
      <div className="flex flex-wrap items-center gap-5">
        <JurorAvatar url={photo} size={88} />
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              disabled={busy || !user}
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-black/14 px-4 py-2 font-medium hover:border-black disabled:opacity-50"
            >
              {busy ? "Saving…" : photo ? "Change photo" : "Upload photo"}
            </button>
            {photo && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void upload(null)}
                className="text-black/55 underline underline-offset-4 hover:text-black disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-black/55">
            Square works best. Saved to your account; it can take a minute to appear on the site.
          </p>
          {error && (
            <p role="alert" className="text-xs font-medium">
              {error}
            </p>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={(e) => void upload(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

function ProfileFields({
  initial,
  submitLabel,
  onSave,
}: {
  initial: JurorProfileArgs;
  submitLabel: string;
  onSave: (profile: JurorProfileArgs) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (key: keyof JurorProfileArgs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        title: form.title.trim(),
        location: form.location?.trim() || undefined,
        website: form.website?.trim() || undefined,
        bio: form.bio?.trim() || undefined,
      });
      setSaved(true);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <PhotoField />
      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2">
          <span className={label}>Name</span>
          <input required maxLength={LIMITS.creditName} value={form.name} onChange={set("name")} className={input} />
        </label>
        <label className="grid gap-2">
          <span className={label}>Role</span>
          <input
            required
            maxLength={LIMITS.juryTitle}
            value={form.title}
            onChange={set("title")}
            className={input}
            placeholder="Creative director at Studio X"
          />
        </label>
        <label className="grid gap-2">
          <span className={label}>Location (optional)</span>
          <input maxLength={80} value={form.location ?? ""} onChange={set("location")} className={input} placeholder="Tbilisi, Georgia" />
        </label>
        <label className="grid gap-2">
          <span className={label}>Website (optional)</span>
          <input
            inputMode="url"
            maxLength={LIMITS.url}
            value={form.website ?? ""}
            onChange={set("website")}
            className={input}
            placeholder="https://your-portfolio.com"
            spellCheck={false}
          />
        </label>
      </div>
      <label className="grid gap-2">
        <span className={label}>
          Short bio (optional) <span className="text-black/55">{(form.bio ?? "").length}/{LIMITS.juryBio}</span>
        </span>
        <textarea rows={3} maxLength={LIMITS.juryBio} value={form.bio ?? ""} onChange={set("bio")} className={`${input} resize-y`} />
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-[46px] items-center gap-3.5 rounded-full bg-black py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
          <span className="grid size-9 place-items-center rounded-full bg-white text-black">
            <ArrowIcon />
          </span>
        </button>
        {saved && (
          <p role="status" className="text-sm text-black/60">
            Saved.
          </p>
        )}
      </div>
    </form>
  );
}

/** /jury/join?token=…: accept an invitation and set up the jury profile. */
export function JuryJoin({ token }: { token: string }) {
  const router = useRouter();
  const { user } = useUser();
  const invite = useQuery(api.jury.inviteByToken, { token });
  const me = useQuery(api.jury.me, {});
  const accept = useMutation(api.jury.acceptInvite);

  if (invite === undefined || me === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (me && invite.status !== "valid") {
    return (
      <p className="text-sm">
        You&apos;re already on the jury. <a href="/jury/profile" className="underline underline-offset-4">Edit your profile</a>.
      </p>
    );
  }
  if (invite.status !== "valid") {
    const why = {
      accepted: "This invitation has already been used.",
      revoked: "This invitation was withdrawn.",
      expired: "This invitation has expired. Ask us for a new one.",
      unknown: "This invitation link is not valid. Check that you opened the full link from the email.",
    }[invite.status];
    return <p className="text-sm">{why}</p>;
  }
  const signedInAs = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  return (
    <div className="grid max-w-3xl gap-8">
      <p className="text-sm leading-relaxed text-black/70">
        This invitation is for <strong className="text-black">{invite.email}</strong>.
        {signedInAs && signedInAs !== invite.email
          ? ` You're signed in as ${signedInAs}: sign out and sign in with ${invite.email} to accept it.`
          : " Set up your jury profile below. Your name, role and photo appear with your evaluations."}
      </p>
      <ProfileFields
        initial={{ name: invite.name ?? user?.fullName ?? "", title: "" }}
        submitLabel="Join the jury"
        onSave={async (profile) => {
          await accept({ token, ...profile });
          router.replace("/jury/profile?joined=1");
        }}
      />
    </div>
  );
}

/** /jury/profile: a juror edits their profile and photo. */
export function JuryProfile() {
  const me = useQuery(api.jury.me, {});
  const update = useMutation(api.jury.updateProfile);
  if (me === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (me === null) return <p className="text-sm">This account is not on the jury. Jury membership is by invitation.</p>;
  return (
    <div className="grid max-w-3xl gap-8">
      <ProfileFields
        initial={{
          name: me.name,
          title: me.title,
          location: me.location ?? undefined,
          website: me.website ?? undefined,
          bio: me.bio ?? undefined,
        }}
        submitLabel="Save profile"
        onSave={async (profile) => {
          await update(profile);
        }}
      />
    </div>
  );
}
