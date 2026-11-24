"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { JurorAvatar } from "@/components/jury/JurorAvatar";
import { useMyPicture } from "./useMyPicture";

const fmtSince = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

/**
 * The top of /account and /jury/profile: the signed-in person (photo, name,
 * email, member since), a short status line, and the page's actions.
 * "Account settings" opens Clerk's profile dialog (email, password, sign-out).
 */
export function AccountHeader({
  eyebrow,
  lede,
  actions,
  defaultAvatar = false,
}: {
  eyebrow: string;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  /**
   * Show their Shemoqmedi picture (avatar, or their photo if they chose it),
   * the same one as their creator card. On for /account. Off on /jury/profile,
   * which keeps the juror photo their public jury card shows.
   */
  defaultAvatar?: boolean;
}) {
  const { user, isLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const name = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "";
  const email = user?.primaryEmailAddress?.emailAddress;
  const picture = useMyPicture();
  const avatarReady = defaultAvatar ? picture.ready : isLoaded;

  return (
    <header className="container-site pt-32 pb-10 md:pt-40 md:pb-14">
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-center gap-5 md:gap-7">
          {avatarReady ? (
            <JurorAvatar
              url={defaultAvatar ? (picture.photoUrl ?? picture.avatarUrl) : user?.hasImage ? user.imageUrl : null}
              size={96}
            />
          ) : (
            <span className="size-24 shrink-0 rounded-full bg-black/[0.06]" />
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[clamp(2rem,5vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.055em]">
              {isLoaded ? name || "Your account" : " "}
            </h1>
            <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.06em] text-black/55 uppercase">
              {email && <span className="normal-case">{email}</span>}
              {user?.createdAt && <span>Member since {fmtSince.format(user.createdAt)}</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <button
            type="button"
            onClick={() => openUserProfile()}
            className="inline-flex min-h-[46px] items-center rounded-full border border-black/12 px-5 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors hover:border-black"
          >
            Account settings
          </button>
          <button
            type="button"
            onClick={() => void signOut({ redirectUrl: "/" })}
            className="px-2 text-[13px] text-black/55 underline-offset-4 hover:text-black hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
      {lede && <p className="mt-8 max-w-xl text-sm leading-relaxed text-black/60">{lede}</p>}
    </header>
  );
}
