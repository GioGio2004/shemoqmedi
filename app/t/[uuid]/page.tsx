import { redirect } from "next/navigation";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import { auth } from "@clerk/nextjs/server";
import TapExperienceClient from "./_components/TapExperienceClient";

export default async function TagRouter({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const { userId } = await auth();

  // ── 1. Check for physical cafe table tag first ────────────────────────────
  // Physical tags are provisioned NTAG216 chips at cafe tables.
  // They redirect customers to the cafe's digital menu with the table pre-selected.
  const physicalTag = await fetchQuery(api.volootagsAdmin.getPhysicalTagByUUID, { uuid });

  if (physicalTag) {
    // Log tap (non-critical)
    try {
      await fetchMutation(api.volootagsAdmin.logPhysicalTagTap, { uuid });
    } catch {
      // never block user flow
    }

    if (!physicalTag.isActive) {
      // Show inactive state via the TapExperienceClient
      const inactiveSnapshot = {
        _id: physicalTag._id,
        volooTagsUUID: physicalTag.volooTagsUUID,
        isActive: false,
        activeMode: "cafe_hub",
        showAnimation: false,
        tapCount: physicalTag.tapCount,
      };
      return <TapExperienceClient tag={inactiveSnapshot as any} isOwner={false} tagUuid={uuid} />;
    }

    // Load the org's hub settings (animation + hub theme + links)
    const orgSettings = physicalTag.orgId
      ? await fetchQuery(api.volootagsAdmin.getOrgTagSettingsPublic, { orgId: physicalTag.orgId })
      : null;

    // If a menu URL is configured, bake the table and seat parameters 
    // into the URL so the CafeHubUI "Menu" button goes straight
    // to the correct seat — no auto-redirect needed.
    let menuUrl = orgSettings?.hubMenuUrl ?? undefined;
    if (menuUrl) {
      try {
        const u = new URL(menuUrl);
        if (physicalTag.tableName) {
          u.searchParams.set("table", physicalTag.tableName);
        }
        if (physicalTag.seatNumber !== undefined && physicalTag.seatNumber !== null) {
          u.searchParams.set("seat", String(physicalTag.seatNumber));
        }
        menuUrl = u.toString();
      } catch {
        // URL parse failed — leave menuUrl as-is
      }
    }

    // Build a TagSnapshot compatible with TapExperienceClient.
    // No tableName here — we want the standard CafeHubUI flow, not auto-redirect.
    const tagSnapshot = {
      _id: physicalTag._id,
      volooTagsUUID: physicalTag.volooTagsUUID,
      isActive: physicalTag.isActive,
      activeMode: "cafe_hub",
      showAnimation: orgSettings?.showAnimation ?? true,
      selectedAnimation: orgSettings?.selectedAnimation ?? "Coffee-love.lottie",
      hubTheme: (orgSettings?.hubTheme as "dark" | "light" | "orange") ?? "dark",
      hubMenuUrl: menuUrl,
    };

    return <TapExperienceClient tag={tagSnapshot as any} isOwner={false} tagUuid={uuid} />;
  }

  // ── 2. Fall back to personal Voloo Magic tags ─────────────────────────────
  const tag = await fetchQuery(api.volootags.getTagByUUID, { uuid });

  // Unknown UUID → back to root
  if (!tag) redirect("/");

  // ── 3. Unclaimed tag → send to admin dashboard to claim ──────────────────
  if (!tag.userId) {
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3000";
    redirect(`${adminUrl}/magic?register=${uuid}`);
  }

  // ── 4. Log the tap (fire & forget — never block the render) ──────────────
  try {
    await fetchMutation(api.volootags.logTapMoment, { uuid });
  } catch {
    // analytics failure must never break the user experience
  }

  // ── 5. Inactive tag → show "Tag Inactive" card ───────────────────────────
  if (!tag.isActive) {
    return <TapExperienceClient tag={tag} isOwner={false} tagUuid={uuid} />;
  }

  // ── 6. Hand off to client component for animation + hub render ───────────
  return (
    <TapExperienceClient
      tag={tag}
      isOwner={tag.userId === userId}
      tagUuid={uuid}
    />
  );
}