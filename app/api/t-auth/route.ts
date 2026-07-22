import { NextRequest, NextResponse } from "next/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex-helpers-api";
import crypto from "crypto";
import { buildMenuUrl } from "@/lib/routes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get("uuid");

  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  if (!uuid) {
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  // 1. Re-validate the tag
  const physicalTag = await fetchQuery(
    api.volootagsAdmin.getPhysicalTagByUUID,
    { uuid },
  );

  if (!physicalTag || !physicalTag.isActive) {
    // If invalid or inactive, bounce them back to the tap page to see the inactive state
    return NextResponse.redirect(new URL(`/t/${uuid}`, baseUrl));
  }

  // 2. Generate secure guest identity and join Convex session
  const guestId = crypto.randomUUID();
  let sessionId: string | null = null;
  try {
    sessionId = await fetchMutation(api.tableSessions.joinSession, {
      orgId: physicalTag.orgId!,
      tagId: physicalTag._id as any,
      guestId,
    });
  } catch (err) {
    console.error("Failed to join table session:", err);
  }

  // 3. Determine the clean target URL
  // Fix for Ngrok: respect forwarded headers so we don't accidentally redirect to https://localhost
  let targetUrl = new URL("/", baseUrl);
  if (physicalTag.orgSlug) {
    const seatParam =
      physicalTag.seatNumber != null ? `?seat=${physicalTag.seatNumber}` : "";
    targetUrl = new URL(
      `${buildMenuUrl("en", physicalTag.orgSlug)}${seatParam}`,
      baseUrl,
    );
  } else {
    // Fallback if no org slug is assigned to this physical tag
    targetUrl = new URL(`/t/${uuid}?fallback=true`, baseUrl);
  }

  // 4. Create the redirect response and set the httpOnly cookie
  const response = NextResponse.redirect(targetUrl);

  response.cookies.set(
    "shemoqmedi_session",
    JSON.stringify({
      guestId,
      sessionId,
      tagId: String(physicalTag._id),
      seatNumber: physicalTag.seatNumber ?? null,
      orgSlug: physicalTag.orgSlug ?? null,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14400, // 4 hours
      path: "/",
    },
  );

  return response;
}
