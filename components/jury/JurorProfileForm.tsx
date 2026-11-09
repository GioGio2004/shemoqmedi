"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api, type JurorExperience, type JurorProfileArgs, type JurorWork } from "@/convex-helpers-api";
import { friendlyError } from "@/lib/errors";
import { isImageKit } from "@/lib/imageLoader";
import { CATEGORIES, CATEGORY_GROUPS, LIMITS } from "@/lib/taxonomy";
import { ArrowIcon } from "@/components/site/ui";
import { JurorAvatar } from "./JurorAvatar";
import { JuryCard } from "./JuryCard";
import { JuryShare } from "./JuryShare";

const input =
  "w-full min-h-[46px] rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black";
const label = "eyebrow text-black";
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE = 10 * 1024 * 1024; // Clerk's limit for profile images

/** Clerk unsafeMetadata key: the preset photo URL last copied to the account. */
const COPIED_KEY = "juryPhotoCopied";

/** Downloads an image (ImageKit and Convex storage both allow CORS) as a File for Clerk. */
async function imageFile(url: string): Promise<File> {
  // ImageKit picks the format per request; ask for a JPG Clerk always accepts.
  let src = url;
  if (isImageKit(url)) {
    const u = new URL(url);
    if (!u.searchParams.has("tr")) u.searchParams.set("tr", "f-jpg,q-90");
    src = u.toString();
  }
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Photo download failed (${res.status})`);
  const blob = await res.blob();
  if (!IMAGE_TYPES.includes(blob.type)) throw new Error(`Unsupported photo type ${blob.type}`);
  return new File([blob], `jury-photo.${blob.type.split("/")[1]}`, { type: blob.type });
}

/**
 * Profile photo. `current` is what the jury pages show right now: the photo
 * prepared with the invitation (`preset`) while the juror keeps it, else their
 * account (Clerk) photo, else a grey placeholder. Changing or removing it
 * saves to the Clerk account and drops the preset, so the juror's own choice
 * shows from then on.
 *
 * The preset also becomes the account photo (header, sign-in), once per
 * preset: right after claiming (`adopt`), or whenever the account has no photo
 * of its own. An account that has one gets a button to switch instead.
 */
function PhotoField({ current, preset, adopt }: { current: string | null; preset: boolean; adopt?: boolean }) {
  const { user } = useUser();
  const dropPreset = useMutation(api.jury.dropPresetPhoto);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // After a change, show it right away: the server learns about a new Clerk
  // photo through the webhook a moment later. undefined: nothing changed yet.
  const [local, setLocal] = useState<string | null | undefined>(undefined);
  const shown = local !== undefined ? local : current;
  const [copied, setCopied] = useState(false);
  const autoCopy = useRef(false);

  const presetUrl = preset && current ? current : null;
  const alreadyCopied = !!presetUrl && user?.unsafeMetadata?.[COPIED_KEY] === presetUrl;
  const canCopy = !!presetUrl && !!user && !alreadyCopied && !copied && local === undefined;

  /** Makes the preset the Clerk account photo too, and remembers it. */
  async function copyToAccount(url: string) {
    if (!user) return;
    await user.setProfileImage({ file: await imageFile(url) });
    await user.update({ unsafeMetadata: { ...user.unsafeMetadata, [COPIED_KEY]: url } });
    await user.reload();
    setCopied(true);
  }

  useEffect(() => {
    if (!canCopy || autoCopy.current || !presetUrl || !user) return;
    if (!adopt && user.hasImage) return; // their own photo stays unless they ask
    autoCopy.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set after the upload, not synchronously
    copyToAccount(presetUrl).catch((err) => console.error("Copying the jury photo to the account failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once when the account loads
  }, [canCopy, presetUrl, user, adopt]);

  async function change(file: File | null) {
    if (!user) return;
    setError(null);
    if (file && !IMAGE_TYPES.includes(file.type)) return setError("Use a JPG, PNG, WebP or GIF image.");
    if (file && file.size > MAX_IMAGE) return setError("The photo must be 10 MB or less.");
    setBusy(true);
    try {
      // Removing the preset only drops it (the account photo, if any, shows
      // next); a new file, or removing the account photo, goes to Clerk.
      if (file || !preset) {
        await user.setProfileImage({ file });
        await user.reload();
      }
      if (preset) await dropPreset({});
      setLocal(user.hasImage ? user.imageUrl : null);
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
        <JurorAvatar url={shown} size={88} />
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              disabled={busy || !user}
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-black/14 px-4 py-2 font-medium hover:border-black disabled:opacity-50"
            >
              {busy ? "Saving…" : shown ? "Change photo" : "Upload photo"}
            </button>
            {shown && (
              <button
                type="button"
                disabled={busy || !user}
                onClick={() => void change(null)}
                className="text-black/55 underline underline-offset-4 hover:text-black disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-black/55">
            {copied
              ? "This photo is now your account photo too."
              : preset && local === undefined
                ? "This is the photo prepared for your jury profile. Change it any time."
                : "Square works best. Saved to your account; it can take a minute to appear on the site."}
          </p>
          {canCopy && user?.hasImage && !adopt && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await copyToAccount(presetUrl!);
                } catch {
                  setError("The photo could not be copied to your account. Please try again.");
                } finally {
                  setBusy(false);
                }
              }}
              className="justify-self-start text-xs text-black/55 underline underline-offset-4 hover:text-black disabled:opacity-50"
            >
              Use it as my account photo too
            </button>
          )}
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
          onChange={(e) => void change(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

/**
 * Categories the juror follows: their daily digest lists new sites in these.
 * Sites in categories no juror follows go to the general queue, which every
 * juror sees.
 */
function InterestsField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const toggle = (slug: string) => onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  return (
    <fieldset className="grid gap-4">
      <legend className={label}>Categories you follow</legend>
      <p className="-mt-2 text-xs text-black/55">
        Your daily email lists new sites in these, plus the general queue (sites no juror follows yet).
      </p>
      {CATEGORY_GROUPS.map((group) => (
        <div key={group.name} className="grid gap-2">
          <p className="text-xs font-medium text-black/55">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.slugs.map((slug) => {
              const on = value.includes(slug);
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(slug)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${on ? "border-black bg-black text-white" : "border-black/14 hover:border-black"}`}
                >
                  {CATEGORIES.find((c) => c.slug === slug)?.name ?? slug}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

const smallButton =
  "rounded-full border border-black/14 px-4 py-2 text-sm font-medium hover:border-black disabled:opacity-50";
const removeButton = "text-sm text-black/55 underline underline-offset-4 hover:text-black";

/** Trimmed rows with empty optional fields left out; fully empty rows dropped. */
function cleanExperience(rows: JurorExperience[]): JurorExperience[] {
  return rows
    .map((r) => ({ title: r.title.trim(), organization: r.organization.trim(), period: r.period?.trim() || undefined }))
    .filter((r) => r.title || r.organization || r.period);
}

function cleanWork(rows: JurorWork[]): JurorWork[] {
  return rows
    .map((r) => ({
      title: r.title.trim(),
      url: r.url?.trim() || undefined,
      year: r.year?.trim() || undefined,
      description: r.description?.trim() || undefined,
    }))
    .filter((r) => r.title || r.url || r.year || r.description);
}

/** Rows the server would refuse or drop, explained before saving. */
function listsProblem(experience: JurorExperience[], work: JurorWork[]) {
  if (experience.some((r) => !r.title || !r.organization)) return "Each experience entry needs a role and an organisation.";
  if (work.some((r) => !r.title)) return "Each work entry needs a title.";
  return null;
}

/** Past roles: role and organisation, period optional. */
function ExperienceEditor({
  rows,
  onChange,
}: {
  rows: JurorExperience[];
  onChange: (rows: JurorExperience[]) => void;
}) {
  const edit = (i: number, key: keyof JurorExperience, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  return (
    <fieldset className="grid gap-3">
      <legend className={`${label} mb-3`}>
        Experience (optional) <span className="text-black/55">{rows.length}/{LIMITS.juryExperience}</span>
      </legend>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid gap-3 rounded-2xl border border-black/10 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_10rem_auto] md:items-center"
        >
          <input
            aria-label={`Experience ${i + 1}: role`}
            maxLength={80}
            value={r.title}
            onChange={(e) => edit(i, "title", e.target.value)}
            className={input}
            placeholder="Art director"
          />
          <input
            aria-label={`Experience ${i + 1}: organisation`}
            maxLength={80}
            value={r.organization}
            onChange={(e) => edit(i, "organization", e.target.value)}
            className={input}
            placeholder="Studio X"
          />
          <input
            aria-label={`Experience ${i + 1}: period (optional)`}
            maxLength={40}
            value={r.period ?? ""}
            onChange={(e) => edit(i, "period", e.target.value)}
            className={input}
            placeholder="2019 – now"
          />
          <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className={removeButton}>
            Remove
          </button>
        </div>
      ))}
      <div>
        <button
          type="button"
          disabled={rows.length >= LIMITS.juryExperience}
          onClick={() => onChange([...rows, { title: "", organization: "", period: "" }])}
          className={smallButton}
        >
          Add experience
        </button>
      </div>
    </fieldset>
  );
}

/** Notable work: title, optional link, year and short description. */
function WorkEditor({ rows, onChange }: { rows: JurorWork[]; onChange: (rows: JurorWork[]) => void }) {
  const edit = (i: number, key: keyof JurorWork, value: string) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
  return (
    <fieldset className="grid gap-3">
      <legend className={`${label} mb-3`}>
        Work (optional) <span className="text-black/55">{rows.length}/{LIMITS.juryWork}</span>
      </legend>
      {rows.map((r, i) => (
        <div key={i} className="grid gap-3 rounded-2xl border border-black/10 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem]">
          <input
            aria-label={`Work ${i + 1}: title`}
            maxLength={80}
            value={r.title}
            onChange={(e) => edit(i, "title", e.target.value)}
            className={input}
            placeholder="Brand site for Company Y"
          />
          <input
            aria-label={`Work ${i + 1}: link (optional)`}
            inputMode="url"
            maxLength={LIMITS.url}
            value={r.url ?? ""}
            onChange={(e) => edit(i, "url", e.target.value)}
            className={input}
            placeholder="https://"
            spellCheck={false}
          />
          <input
            aria-label={`Work ${i + 1}: year (optional)`}
            maxLength={20}
            value={r.year ?? ""}
            onChange={(e) => edit(i, "year", e.target.value)}
            className={input}
            placeholder="2025"
          />
          <textarea
            aria-label={`Work ${i + 1}: short description (optional)`}
            rows={2}
            maxLength={200}
            value={r.description ?? ""}
            onChange={(e) => edit(i, "description", e.target.value)}
            className={`${input} resize-y md:col-span-3`}
            placeholder="Short description (optional)"
          />
          <div className="md:col-span-3">
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className={removeButton}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <div>
        <button
          type="button"
          disabled={rows.length >= LIMITS.juryWork}
          onClick={() => onChange([...rows, { title: "", url: "", year: "", description: "" }])}
          className={smallButton}
        >
          Add work
        </button>
      </div>
    </fieldset>
  );
}

type TextKey = "name" | "title" | "location" | "website" | "linkedinUrl" | "bio";

function ProfileFields({
  initial,
  photo,
  submitLabel,
  onSave,
}: {
  initial: JurorProfileArgs;
  photo: { current: string | null; preset: boolean; adopt?: boolean };
  submitLabel: string;
  onSave: (profile: JurorProfileArgs) => Promise<void>;
}) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const set = (key: TextKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };
  const setExperience = (experience: JurorExperience[]) => {
    setSaved(false);
    setForm((f) => ({ ...f, experience }));
  };
  const setWork = (work: JurorWork[]) => {
    setSaved(false);
    setForm((f) => ({ ...f, work }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const experience = cleanExperience(form.experience ?? []);
    const work = cleanWork(form.work ?? []);
    const problem = listsProblem(experience, work);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        name: form.name.trim(),
        title: form.title.trim(),
        location: form.location?.trim() || undefined,
        // "" clears a link that was set before.
        website: form.website?.trim() ?? "",
        linkedinUrl: form.linkedinUrl?.trim() ?? "",
        bio: form.bio?.trim() || undefined,
        // Always sent: [] clears the section.
        experience,
        work,
        ...(form.interests !== undefined ? { interests: form.interests } : {}),
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
      <PhotoField current={photo.current} preset={photo.preset} adopt={photo.adopt} />
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
        <label className="grid gap-2 md:col-span-2">
          <span className={label}>LinkedIn (optional)</span>
          <input
            inputMode="url"
            maxLength={LIMITS.url}
            value={form.linkedinUrl ?? ""}
            onChange={set("linkedinUrl")}
            className={input}
            placeholder="https://www.linkedin.com/in/your-name"
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
      <ExperienceEditor rows={form.experience ?? []} onChange={setExperience} />
      <WorkEditor rows={form.work ?? []} onChange={setWork} />
      {form.interests !== undefined && (
        <InterestsField
          value={form.interests}
          onChange={(interests) => {
            setSaved(false);
            setForm((f) => ({ ...f, interests }));
          }}
        />
      )}
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

/**
 * /jury/profile: a juror edits their profile and photo. With `claimed` (just
 * claimed from a claim link) their badge and share links come first.
 */
export function JuryProfile({ claimed }: { claimed?: boolean }) {
  const me = useQuery(api.jury.me, {});
  const update = useMutation(api.jury.updateProfile);
  if (me === undefined) return <p className="text-sm text-black/55">Loading…</p>;
  if (me === null) return <p className="text-sm">This account is not on the jury. Jury membership is by invitation.</p>;
  const form = (
    <ProfileFields
      initial={{
        name: me.name,
        title: me.title,
        location: me.location ?? undefined,
        website: me.website ?? undefined,
        linkedinUrl: me.linkedinUrl ?? undefined,
        bio: me.bio ?? undefined,
        experience: me.experience ?? [],
        work: me.work ?? [],
        interests: me.interests ?? [],
      }}
      photo={{ current: me.imageUrl, preset: me.hasPresetPhoto, adopt: claimed }}
      submitLabel="Save profile"
      onSave={async (profile) => {
        await update(profile);
      }}
    />
  );
  if (!claimed) return <div className="grid max-w-3xl gap-8">{form}</div>;
  return (
    <div className="grid gap-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <JuryCard juror={me} href={`/jury/${me.slug}`} branded />
        <JuryShare slug={me.slug} />
      </div>
      <section aria-labelledby="edit-profile-title" className="grid max-w-3xl gap-8 border-t border-black/10 pt-12">
        <div className="grid gap-2">
          <h2 id="edit-profile-title" className="text-3xl font-semibold tracking-[-0.045em]">
            Your profile
          </h2>
          <p className="text-sm text-black/60">Check your details. Changes show on your jury page within a few minutes.</p>
        </div>
        {form}
      </section>
    </div>
  );
}
