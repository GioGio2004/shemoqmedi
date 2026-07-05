"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex-helpers-api";
import VenueClientView from "./basic-menu/VenueClientView";
import SpatialSnapGrid from "./dragable-menu/_components/SpatialSnapGrid";
import { MenuSkeleton } from "./basic-menu/_components/menu-skeleton";
import { MultiplayerProvider } from "@/components/multiplayer/MultiplayerContext";
import { TableSuggestionToast } from "@/components/multiplayer/TableSuggestionToast";

interface MenuRouterClientProps {
  slug: string;
  guestId?: string | null;
  sessionId?: string | null;
  tagId?: string | null;
  seatNumber?: number | null;
}

export default function MenuRouterClient({
  slug,
  guestId = null,
  sessionId = null,
  tagId = null,
  seatNumber = null,
}: MenuRouterClientProps) {
  const data = useQuery(api.publicMenu.get, { slug });

  // ── Loading state — full-page skeleton ──────────────────────────────────────
  if (data === undefined) {
    return <MenuSkeleton />;
  }

  // ── 404 state ───────────────────────────────────────────────────────────────
  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">☕</span>
        </div>
        <h1 className="font-serif text-4xl mb-4 text-balance">
          Cafe Not Found
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          We couldn&apos;t find the menu you&apos;re looking for. Please check
          the URL or scan the QR code again.
        </p>
      </div>
    );
  }

  const menuType = data.organization.themeSettings?.menuType || "basic";

  return (
    <MultiplayerProvider
      guestId={guestId}
      sessionId={sessionId}
      tagId={tagId}
      seatNumber={seatNumber}
    >
      <TableSuggestionToast
        catalog={data.categories || []}
        themeSettings={data.organization.themeSettings ?? null}
      />
      {menuType === "dragable" ? (
        <SpatialSnapGrid data={data} slug={slug} />
      ) : (
        <VenueClientView data={data} slug={slug} />
      )}
    </MultiplayerProvider>
  );
}
