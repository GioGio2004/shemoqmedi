"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TaskChooseOrganization, TaskResetPassword, TaskSetupMFA, useAuth, useClerk } from "@clerk/nextjs";
import { safeRedirect } from "./AuthUI";

const COPY: Record<string, string> = {
  "reset-password": "Choose a new password to finish logging in.",
  "setup-mfa": "Set up two-step verification to finish logging in.",
  "choose-organization": "Pick an organization to finish logging in.",
};

/**
 * The task a pending Clerk session has left. Done (or nothing left): on to
 * the page the visitor asked for. Signed out: back to log in.
 */
export function SessionTasks() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const clerk = useClerk();
  const router = useRouter();
  const redirect = safeRedirect(useSearchParams().get("redirect_url"), "/account");
  const task = clerk.session?.currentTask?.key ?? null;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.replace(`/sign-in?redirect_url=${encodeURIComponent(redirect)}`);
    else if (!task) router.replace(redirect);
  }, [isLoaded, isSignedIn, task, redirect, router]);

  if (!isLoaded || !isSignedIn || !task) return <p className="eyebrow">One moment…</p>;

  return (
    <div className="grid gap-6">
      <p className="text-sm leading-relaxed text-black/60">{COPY[task] ?? "One more step to finish logging in."}</p>
      {task === "reset-password" && <TaskResetPassword redirectUrlComplete={redirect} />}
      {task === "setup-mfa" && <TaskSetupMFA redirectUrlComplete={redirect} />}
      {task === "choose-organization" && <TaskChooseOrganization redirectUrlComplete={redirect} />}
    </div>
  );
}
