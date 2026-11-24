"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api, type OwnCreatorProfile } from "@/convex-helpers-api";
import { JurorPhoto } from "@/components/jury/JurorPhoto";
import { friendlyError } from "@/lib/errors";
import { cn } from "@/lib/utils";

/** convex/creators.ts CREATOR_BIO_MAX and LIMITS.creatorLinks. */
const BIO_MAX = 800;
const LINKS_MAX = 6;

const input =
  "w-full rounded-2xl border border-black/12 bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-black";
const label = "eyebrow text-black";
const hint = "text-xs leading-relaxed text-black/55";

function Editor({ profile }: { profile: OwnCreatorProfile }) {
  const save = useMutation(api.creators.updateMine);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [website, setWebsite] = useState(profile.website);
  const [links, setLinks] = useState(profile.links.join("\n"));
  const [email, setEmail] = useState(profile.email);
  const [state, setState] = useState<{ busy: boolean; message: string | null; error: boolean }>({
    busy: false,
    message: null,
    error: false,
  });

  const linkList = links.split(/\s+/).map((l) => l.trim()).filter(Boolean);
  const changed =
    bio.trim() !== profile.bio ||
    location.trim() !== profile.location ||
    website.trim() !== profile.website ||
    linkList.join(" ") !== profile.links.join(" ") ||
    email.trim().toLowerCase() !== profile.email;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!changed || state.busy) return;
    if (linkList.length > LINKS_MAX) {
      setState({ busy: false, message: `Add up to ${LINKS_MAX} links.`, error: true });
      return;
    }
    setState({ busy: true, message: null, error: false });
    try {
      // Show what was saved: the server adds https://, trims and tidies.
      const saved = await save({ id: profile.id, bio, location, website, links: linkList, email });
      setBio(saved.bio);
      setLocation(saved.location);
      setWebsite(saved.website);
      setLinks(saved.links.join("\n"));
      setEmail(saved.email);
      setState({ busy: false, message: "Saved. Your public profile updates within a minute.", error: false });
    } catch (err) {
      setState({ busy: false, message: friendlyError(err), error: true });
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 rounded-3xl border border-black/10 p-5 md:p-8">
      <div className="flex flex-wrap items-center gap-5">
        <JurorPhoto
          url={profile.photoUrl}
          name={profile.name}
          fallbackKey={profile.slug}
          fallbackAvatar={profile.avatar}
          fallbackInitials={false}
          width={72}
          height={72}
          mono={false}
          className="size-[72px] shrink-0 rounded-2xl"
        />
        <div className="grid gap-1">
          <p className="text-xl font-semibold tracking-[-0.03em]">{profile.name}</p>
          {profile.isPublic ? (
            <Link href={`/creators/${profile.slug}`} className="text-sm underline decoration-black/25 underline-offset-4">
              View your public profile
            </Link>
          ) : (
            <p className={hint}>Your profile goes public once one of your sites is live.</p>
          )}
        </div>
      </div>
      <p className={hint}>
        Change your picture under Your picture. Your name and profile address are set by us; write to us if they
        need changing.
      </p>

      <label className="grid gap-2">
        <span className={label}>
          About {bio.length}/{BIO_MAX}
        </span>
        <textarea
          rows={6}
          maxLength={BIO_MAX}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Who you are, what you make and who you make it for. A blank line starts a new paragraph."
          className={cn(input, "resize-y")}
        />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="grid gap-2">
          <span className={label}>Location</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={80}
            placeholder="Tbilisi, Georgia"
            className={input}
          />
        </label>
        <label className="grid gap-2">
          <span className={label}>Website</span>
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourstudio.com"
            className={input}
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className={label}>Public email (optional)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@yourstudio.com"
          className={input}
        />
        <span className={hint}>
          Shown on your profile with a “Get in touch” button, so clients can write to you. Leave it empty to keep your
          email private.
        </span>
      </label>

      <label className="grid gap-2">
        <span className={label}>
          Links {linkList.length}/{LINKS_MAX}
        </span>
        <textarea
          rows={4}
          value={links}
          onChange={(e) => setLinks(e.target.value)}
          placeholder={"https://www.linkedin.com/in/you\nhttps://dribbble.com/you"}
          className={cn(input, "resize-y font-mono text-sm")}
        />
        <span className={hint}>One per line: LinkedIn, Dribbble, Behance, Instagram, GitHub, Awwwards…</span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!changed || state.busy}
          className="inline-flex min-h-[46px] items-center rounded-full bg-black px-6 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-40"
        >
          {state.busy ? "Saving…" : "Save profile"}
        </button>
        {state.message && (
          <p role="status" className={cn("text-sm", state.error ? "text-red-700" : "text-black/60")}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

/**
 * "Your creator profile": the public profiles this account claimed, each with
 * its editor. Nothing shows for an account without one.
 */
export function CreatorProfileEditor() {
  const profiles = useQuery(api.creators.mine, {});
  if (!profiles || profiles.length === 0) return null;
  return (
    <section
      aria-labelledby="creator-profile-title"
      className="grid gap-6 border-t border-black/10 py-12 md:grid-cols-12 md:gap-10 md:py-16"
    >
      <div className="grid content-start gap-2 md:col-span-4 lg:col-span-3">
        <h2
          id="creator-profile-title"
          className="text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.05] font-semibold tracking-[-0.045em]"
        >
          Your profile
        </h2>
        <p className="text-sm text-black/55">
          Your public page on Shemoqmedi, with your sites and awards. Tell visitors who you are and how to reach you.
        </p>
      </div>
      <div className="grid min-w-0 gap-6 md:col-span-8 lg:col-span-9">
        {profiles.map((p) => (
          <Editor key={p.id} profile={p} />
        ))}
      </div>
    </section>
  );
}
