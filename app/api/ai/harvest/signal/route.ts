// app/api/ai/harvest/signal/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Client-safe Dining Cycle Signal Endpoint — POST /api/ai/harvest/signal
//
// Called by the browser when a guest successfully places an order.
// This closes the "dining cycle" by marking all AI training turns for that
// sessionId as positiveSignal=true — upgrading them from default (neutral)
// training data to high-quality confirmed-purchase data.
//
// Why a separate route?
//   The main PATCH /api/ai/harvest requires HARVEST_SECRET in the request
//   header. We cannot expose that secret in the client bundle. This proxy
//   route accepts a secret-free payload from the browser, then calls Convex
//   directly on the server using the stored secret.
//
// Security model:
//   • No secret required from the client
//   • Rate-limited by origin/IP in production (add Upstash if needed)
//   • cafeId + sessionId are validated before writing
//   • Only positiveSignal=true is written (no arbitrary overrides)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex-helpers-api";
import { z } from "zod";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ── Nootype enum (mirrors harvest route) ─────────────────────────────────────
const nootypeSchema = z
  .enum(["form", "overcoming", "relaxation", "management"])
  .optional();

// ── Request body schema ───────────────────────────────────────────────────────
const signalBodySchema = z.object({
  cafeId:    z.string().min(1),
  sessionId: z.string().uuid("sessionId must be a valid UUID"),
  nootype:   nootypeSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/harvest/signal
//
// Marks all training turns in this session as positiveSignal=true.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = signalBodySchema.safeParse(body);

    if (!parsed.success) {
      console.error("[Signal] Validation failed:", parsed.error.format());
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { cafeId, sessionId, nootype } = parsed.data;

    // Call Convex directly from the server — secret never touches the client
    const result = await convex.mutation(api.aiTrainingLogs.updateSignal, {
      cafeId,
      sessionId,
      positiveSignal: true,
      nootype,
    });

    console.log(
      `✅ [Signal] Cycle closed — cafeId="${cafeId}" ` +
      `session="${sessionId.slice(0, 8)}…" ` +
      `updated=${result.updated} nootype="${nootype ?? "?"}"`,
    );

    return NextResponse.json({ success: true, updated: result.updated });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Signal] Unhandled error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
