"use client";

import { friendlyError } from "@/lib/errors";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { MAX_IMAGE_INPUT_BYTES, uploadToImageKit } from "@/lib/imagekitUpload";
import { useUser } from "@clerk/nextjs";
import { z } from "zod";
import { api } from "@/convex-helpers-api";
import type { GenericId as Id } from "convex/values";
import {
  CATEGORIES,
  CREATOR_TIERS,
  LIMITS,
  REGIONS,
  TECHNOLOGIES,
  type CreatorTier,
  type RegionSlug,
  isCategory,
  isTechnology,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

const input =
  "w-full min-h-[46px] rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black";

// ── Client-side validation (mirrors the backend limits) ─────────────────────

/** Same rules as normalizeUrl() in the backend, minus the normalizing. */
function isPublicUrl(raw: string) {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      host.includes(".") &&
      host !== "localhost" &&
      !/^[\d.]+$/.test(host) &&
      !host.includes(":")
    );
  } catch {
    return false;
  }
}

const isFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

function mediaFile(label: string, types: string[], maxBytes: number, typeLabel: string) {
  return z
    .custom<File>(isFile, `${label} is required.`)
    .refine((f) => !isFile(f) || types.includes(f.type), `${label} must be ${typeLabel}.`)
    .refine((f) => !isFile(f) || f.size <= maxBytes, `${label} must be ${maxBytes / 1024 / 1024} MB or less.`);
}

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Site title is required.")
    .max(LIMITS.title, `Site title must be ${LIMITS.title} characters or less.`),
  url: z
    .string()
    .trim()
    .min(1, "Website URL is required.")
    .max(LIMITS.url, "Website URL is too long.")
    .refine(isPublicUrl, "Website URL must be a public website address."),
  tagline: z
    .string()
    .trim()
    .min(1, "Short description is required.")
    .max(LIMITS.tagline, `Short description must be ${LIMITS.tagline} characters or less.`),
  category: z.string().refine(isCategory, "Choose a category."),
  technologies: z
    .array(z.string().refine(isTechnology, "Unknown technology selected."))
    .min(1, "Choose at least one technology.")
    .max(LIMITS.technologies, `Choose up to ${LIMITS.technologies} technologies.`),
  creatorTier: z.enum(["solo", "agency"], "Tell us whether you work solo or as a team."),
  region: z.enum(["georgia", "global"], "Choose a region."),
  creditName: z
    .string()
    .trim()
    .min(1, "Tell us who made it.")
    .max(LIMITS.creditName, `Made by must be ${LIMITS.creditName} characters or less.`),
  creditUrl: z
    .string()
    .trim()
    .max(LIMITS.url, "Creator website is too long.")
    .refine((v) => v === "" || isPublicUrl(v), "Creator website must be a public website address."),
  // Screenshots are converted to WebP before upload; the 5 MB limit applies after that.
  cover: mediaFile("Main screenshot", IMAGE_TYPES, MAX_IMAGE_INPUT_BYTES, "a PNG, JPG or WebP image"),
  extras: z
    .array(mediaFile("Each extra screenshot", IMAGE_TYPES, MAX_IMAGE_INPUT_BYTES, "a PNG, JPG or WebP image"))
    .max(LIMITS.gallery, `Add up to ${LIMITS.gallery} more screenshots.`),
  video: mediaFile("Preview video", VIDEO_TYPES, LIMITS.videoBytes, "an MP4 or WebM file").nullable(),
});

// ── Building blocks ─────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="eyebrow text-black">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-black/55">{hint}</p>}
    </div>
  );
}

function useObjectUrl(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  return url;
}

function MediaPicker({
  id,
  label,
  hint,
  file,
  onChange,
  aspect,
  kind = "image",
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
  aspect: string;
  kind?: "image" | "video";
}) {
  const preview = useObjectUrl(file);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <label
        htmlFor={id}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-black/25 text-center transition-colors hover:border-black has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
          aspect,
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onChange(e.dataTransfer.files?.[0] ?? null);
        }}
        onMouseEnter={() => void videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => {
          const v = videoRef.current;
          if (v) {
            v.pause();
            v.currentTime = 0;
          }
        }}
      >
        {preview && kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img src={preview} alt="" className="absolute inset-0 size-full object-cover object-top" />
        )}
        {preview && kind === "video" && (
          <video
            ref={videoRef}
            src={preview}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover object-top"
          />
        )}
        {!preview && (
          <span className="px-6 text-sm text-black/55">
            Drop {kind === "video" ? "a video" : "an image"} here or{" "}
            <span className="text-black underline underline-offset-4">browse</span>
          </span>
        )}
        <input
          id={id}
          type="file"
          accept={(kind === "video" ? VIDEO_TYPES : IMAGE_TYPES).join(",")}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="justify-self-start text-xs underline underline-offset-4"
        >
          Remove {kind === "video" ? "video" : "image"}
        </button>
      )}
    </Field>
  );
}

/** Up to LIMITS.gallery more screenshots: previews with remove, plus an add tile. */
function ExtraShots({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);
  const add = (list: FileList | null) =>
    onChange([...files, ...Array.from(list ?? [])].slice(0, LIMITS.gallery));

  return (
    <Field
      label={`More screenshots (optional) ${files.length}/${LIMITS.gallery}`}
      hint="Other pages of the site, shown after the main one. 16:9 works best."
      htmlFor="extras"
    >
      <div className="grid grid-cols-2 gap-3">
        {files.map((file, i) => (
          <div key={`${file.name}-${i}`} className="relative aspect-video overflow-hidden rounded-2xl border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
            <img src={previews[i]} alt="" className="absolute inset-0 size-full object-cover object-top" />
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => onChange(files.filter((_, k) => k !== i))}
              className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white text-sm leading-none hover:bg-black hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
        {files.length < LIMITS.gallery && (
          <label
            htmlFor="extras"
            className="relative flex aspect-video cursor-pointer items-center justify-center rounded-2xl border border-dashed border-black/25 text-center transition-colors hover:border-black has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              add(e.dataTransfer.files);
            }}
          >
            <span className="px-4 text-xs text-black/55">
              Drop images or <span className="text-black underline underline-offset-4">browse</span>
            </span>
            <input
              id="extras"
              type="file"
              multiple
              accept={IMAGE_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => {
                add(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </Field>
  );
}

/** A large selectable card backed by a native radio input. */
function OptionCard({
  name,
  value,
  checked,
  disabled,
  onSelect,
  title,
  aside,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  title: string;
  aside?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "relative grid content-start gap-2 rounded-2xl border p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-black",
        checked ? "border-black" : "border-black/14",
        disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:border-black",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        readOnly={!onSelect}
        className="sr-only"
      />
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "grid size-4 shrink-0 place-items-center rounded-full border",
              checked ? "border-black" : "border-black/30",
            )}
          >
            {checked && <span className="size-2 rounded-full bg-black" />}
          </span>
          <span className="text-base font-semibold tracking-[-0.02em]">{title}</span>
        </span>
        {aside}
      </span>
      {children && <span className="pl-7 text-sm leading-relaxed text-black/60">{children}</span>}
    </label>
  );
}

const pill = (on: boolean) =>
  cn(
    "h-9 rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors",
    on ? "border-black bg-black text-white" : "border-black/14 hover:border-black",
  );

// ── Form ────────────────────────────────────────────────────────────────────

export function ListingForm() {
  const router = useRouter();
  const { user } = useUser();
  const getUploadAuth = useAction(api.media.uploadAuth);
  const registerMedia = useMutation(api.media.register);
  const submit = useMutation(api.listings.submit);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [creatorTier, setCreatorTier] = useState<CreatorTier | "">("");
  const [region, setRegion] = useState<RegionSlug | "">("");
  const [creditName, setCreditName] = useState("");
  const [creditTouched, setCreditTouched] = useState(false);
  const [creditUrl, setCreditUrl] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [extras, setExtras] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const busy = useRef(false);

  // Prefill "Made by" with the account name until the user edits it.
  const displayCredit = creditTouched ? creditName : creditName || user?.fullName || "";

  const toggleTech = (name: string) =>
    setTechnologies((current) =>
      current.includes(name)
        ? current.filter((t) => t !== name)
        : current.length >= LIMITS.technologies
          ? current
          : [...current, name],
    );

  /** WebP-converted, SEO-named upload to ImageKit (lib/imagekitUpload.ts). */
  async function upload(file: File, label: string): Promise<Id<"media">> {
    const args = await uploadToImageKit(file, { site: title, label }, () => getUploadAuth({}));
    return await registerMedia(args);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;

    const parsed = schema.safeParse({
      title,
      url,
      tagline,
      category,
      technologies,
      creatorTier,
      region,
      creditName: displayCredit,
      creditUrl,
      cover,
      extras,
      video,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form.");
      return;
    }
    const data = parsed.data;

    busy.current = true;
    setError(null);
    try {
      setStatus("uploading");
      const coverId = await upload(data.cover, "cover");
      const galleryIds: Id<"media">[] = [];
      for (const [i, file] of data.extras.entries()) galleryIds.push(await upload(file, `screenshot-${i + 2}`));
      const videoId = data.video ? await upload(data.video, "preview") : undefined;
      setStatus("saving");
      await submit({
        title: data.title,
        url: data.url,
        tagline: data.tagline,
        category: data.category,
        technologies: data.technologies,
        creatorTier: data.creatorTier,
        region: data.region,
        creditName: data.creditName,
        creditUrl: data.creditUrl || undefined,
        // Express Fast-Track is not open yet; the backend rejects it.
        submissionTier: "standard",
        coverId,
        galleryIds: galleryIds.length ? galleryIds : undefined,
        videoId,
      });
      router.push("/account?submitted=1");
    } catch (err) {
      setError(friendlyError(err));
      setStatus("idle");
      busy.current = false;
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12">
      <div className="grid content-start gap-6 lg:col-span-7">
        <Field label="Site title" htmlFor="title">
          <input
            id="title"
            className={input}
            value={title}
            maxLength={LIMITS.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paper Weather"
          />
        </Field>

        <Field label="Website URL" htmlFor="url" hint="The live, public address of the site.">
          <input
            id="url"
            type="url"
            inputMode="url"
            className={input}
            value={url}
            maxLength={LIMITS.url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://paperweather.studio"
          />
        </Field>

        <Field
          label="Short description"
          htmlFor="tagline"
          hint={`${tagline.length}/${LIMITS.tagline}. One sentence about what makes it worth seeing.`}
        >
          <textarea
            id="tagline"
            rows={3}
            className={cn(input, "resize-y")}
            value={tagline}
            maxLength={LIMITS.tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </Field>

        <fieldset className="grid gap-3">
          <legend className="eyebrow mb-1 text-black">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={category === c.slug}
                onClick={() => setCategory(c.slug)}
                className={pill(category === c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="eyebrow mb-1 text-black">
            Built with <span className="text-black/55">({technologies.length}/{LIMITS.technologies})</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {TECHNOLOGIES.map((tech) => {
              const on = technologies.includes(tech.name);
              return (
                <button
                  key={tech.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTech(tech.name)}
                  disabled={!on && technologies.length >= LIMITS.technologies}
                  className={cn(pill(on), "disabled:opacity-35")}
                >
                  {tech.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="eyebrow mb-1 text-black">Who made it</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {CREATOR_TIERS.map((t) => (
              <OptionCard
                key={t.slug}
                name="creatorTier"
                value={t.slug}
                checked={creatorTier === t.slug}
                onSelect={() => setCreatorTier(t.slug)}
                title={t.name}
              >
                {t.slug === "solo"
                  ? "One person, start to finish. Eligible for Best Solo Creation."
                  : "A studio, agency or team of two or more."}
              </OptionCard>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="eyebrow mb-1 text-black">Region</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Region">
            {REGIONS.map((r) => (
              <button
                key={r.slug}
                type="button"
                role="radio"
                aria-checked={region === r.slug}
                onClick={() => setRegion(r.slug)}
                className={pill(region === r.slug)}
              >
                {r.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Made by" htmlFor="credit" hint="You, your studio or your team.">
            <input
              id="credit"
              className={input}
              value={displayCredit}
              maxLength={LIMITS.creditName}
              onChange={(e) => {
                setCreditTouched(true);
                setCreditName(e.target.value);
              }}
            />
          </Field>
          <Field label="Creator website (optional)" htmlFor="creditUrl">
            <input
              id="creditUrl"
              type="url"
              inputMode="url"
              className={input}
              value={creditUrl}
              maxLength={LIMITS.url}
              onChange={(e) => setCreditUrl(e.target.value)}
              placeholder="https://studio.example"
            />
          </Field>
        </div>
      </div>

      <div className="grid content-start gap-6 lg:col-span-5">
        <MediaPicker
          id="cover"
          label="Main screenshot"
          hint="16:9, ideally 1920 × 1080, or a full-page screenshot. PNG, JPG or WebP up to 20 MB. We optimise it to WebP."
          file={cover}
          onChange={setCover}
          aspect="aspect-video"
        />
        <ExtraShots files={extras} onChange={setExtras} />
        <MediaPicker
          id="video"
          kind="video"
          label="Preview video (optional)"
          hint="A short, silent clip that plays on hover. MP4 or WebM, up to 10 MB."
          file={video}
          onChange={setVideo}
          aspect="aspect-video"
        />
      </div>

      <fieldset className="grid gap-3 lg:col-span-12">
        <legend className="eyebrow mb-1 text-black">Submission</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <OptionCard
            name="submissionTier"
            value="standard"
            checked
            title="Standard community queue"
            aside={<span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase">Free</span>}
          >
            Reviewed by hand, usually within 14–30 days. Accepted sites enter the 7-day live
            voting window. Founding 100: the first hundred accepted creators get honorary
            supporter status.
          </OptionCard>
          <OptionCard
            name="submissionTier"
            value="express"
            checked={false}
            disabled
            title="Express Fast-Track"
            aside={
              <span className="flex flex-col items-end gap-1.5">
                <span className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
                  $25 / 65 GEL
                </span>
                <span className="inline-flex h-6 items-center rounded-full border border-black/15 px-2.5 font-mono text-[10px] font-medium tracking-[0.08em] uppercase">
                  Coming soon
                </span>
              </span>
            }
          >
            Guaranteed 48-hour review, immediate entry into the 7-day live voting window, a
            permanent indexed page and a backlink to your site.
          </OptionCard>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-black/10 pt-8 lg:col-span-12 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs text-black/55">
          Every submission is reviewed by hand. You&apos;ll see the decision on your account page.
        </p>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {error && (
            <p role="alert" className="text-sm font-medium">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={status !== "idle"}
            className="inline-flex min-h-[46px] items-center gap-3.5 rounded-full bg-black py-1 pr-1.5 pl-5 text-[11.5px] font-semibold tracking-[0.05em] text-white uppercase disabled:opacity-60"
          >
            {status === "uploading" ? "Uploading…" : status === "saving" ? "Submitting…" : "Submit for review"}
            <span className="grid size-9 place-items-center rounded-full bg-white text-black" aria-hidden="true">
              ↗
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
