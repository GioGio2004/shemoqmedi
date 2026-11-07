"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex-helpers-api";
import type { GenericId as Id } from "convex/values";
import { CATEGORIES, LIMITS, TECHNOLOGIES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const input =
  "w-full min-h-[46px] rounded-xl border border-black/14 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black";

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

function checkImage(file: File | null, label: string, required: boolean) {
  if (!file) return required ? `${label} is required.` : null;
  if (!IMAGE_TYPES.includes(file.type)) return `${label} must be a PNG, JPG or WebP image.`;
  if (file.size > LIMITS.imageBytes) return `${label} must be 5 MB or less.`;
  return null;
}

function ImagePicker({
  id,
  label,
  hint,
  file,
  onChange,
  aspect,
}: {
  id: string;
  label: string;
  hint: string;
  file: File | null;
  onChange: (file: File | null) => void;
  aspect: string;
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <label
        htmlFor={id}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-black/25 text-center transition-colors hover:border-black",
          aspect,
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onChange(e.dataTransfer.files?.[0] ?? null);
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img src={preview} alt="" className="absolute inset-0 size-full object-cover object-top" />
        ) : (
          <span className="px-6 text-sm text-black/55">
            Drop an image here or <span className="text-black underline underline-offset-4">browse</span>
          </span>
        )}
        <input
          id={id}
          type="file"
          accept={IMAGE_TYPES.join(",")}
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
          Remove image
        </button>
      )}
    </Field>
  );
}

export function ListingForm() {
  const router = useRouter();
  const { user } = useUser();
  const generateUploadUrl = useMutation(api.listings.generateUploadUrl);
  const submit = useMutation(api.listings.submit);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [creditName, setCreditName] = useState("");
  const [creditTouched, setCreditTouched] = useState(false);
  const [creditUrl, setCreditUrl] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [mobile, setMobile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");
  const busy = useRef(false);

  // Prefill "Made by" with the account name until the user edits it.
  const displayCredit = creditTouched ? creditName : creditName || user?.fullName || "";

  const toggleTech = (tech: string) =>
    setTechnologies((current) =>
      current.includes(tech)
        ? current.filter((t) => t !== tech)
        : current.length >= LIMITS.technologies
          ? current
          : [...current, tech],
    );

  async function upload(file: File): Promise<Id<"_storage">> {
    const postUrl = await generateUploadUrl({});
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload failed. Please try again.");
    const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
    return storageId;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;

    const problem =
      (!title.trim() && "Site title is required.") ||
      (!url.trim() && "Website URL is required.") ||
      (!tagline.trim() && "Short description is required.") ||
      (!category && "Choose a category.") ||
      (technologies.length === 0 && "Choose at least one technology.") ||
      (!displayCredit.trim() && "Tell us who made it.") ||
      checkImage(cover, "Desktop screenshot", true) ||
      checkImage(mobile, "Mobile screenshot", false);
    if (problem) {
      setError(problem);
      return;
    }

    busy.current = true;
    setError(null);
    try {
      setStatus("uploading");
      const coverId = await upload(cover!);
      const mobileId = mobile ? await upload(mobile) : undefined;
      setStatus("saving");
      await submit({
        title,
        url,
        tagline,
        category,
        technologies,
        creditName: displayCredit,
        creditUrl: creditUrl.trim() || undefined,
        coverId,
        mobileId,
      });
      router.push("/account?submitted=1");
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      );
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
                className={cn(
                  "h-9 rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors",
                  category === c.slug
                    ? "border-black bg-black text-white"
                    : "border-black/14 hover:border-black",
                )}
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
              const on = technologies.includes(tech);
              return (
                <button
                  key={tech}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTech(tech)}
                  disabled={!on && technologies.length >= LIMITS.technologies}
                  className={cn(
                    "h-9 rounded-full border px-4 text-[11px] font-medium tracking-[0.04em] uppercase transition-colors disabled:opacity-35",
                    on ? "border-black bg-black text-white" : "border-black/14 hover:border-black",
                  )}
                >
                  {tech}
                </button>
              );
            })}
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
              onChange={(e) => setCreditUrl(e.target.value)}
              placeholder="https://studio.example"
            />
          </Field>
        </div>
      </div>

      <div className="grid content-start gap-6 lg:col-span-5">
        <ImagePicker
          id="cover"
          label="Desktop screenshot"
          hint="16:10, e.g. 1600 × 1000. PNG, JPG or WebP, up to 5 MB."
          file={cover}
          onChange={setCover}
          aspect="aspect-[16/10]"
        />
        <ImagePicker
          id="mobile"
          label="Mobile screenshot (optional)"
          hint="Portrait, e.g. 390 × 844."
          file={mobile}
          onChange={setMobile}
          aspect="aspect-[9/12] max-w-[260px]"
        />
      </div>

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
