// app/api/ai/harvest/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// Gemini SFT Telemetry Hub — POST (ingest) & PATCH (signal update)
//
// This endpoint is the ingestion point for the AI training data flywheel.
// It is called non-blockingly from /api/chat/route.ts after every successful
// Gemini response — the guest UX is NEVER gated on this endpoint.
//
// POST  — writes a new training turn to ai_training_logs
// PATCH — retroactively updates the positiveSignal / nootype for a session
//         (called when checkout completion is detected client-side)
//
// Security model:
//   Callers MUST include the internal harvest secret in the
//   X-Harvest-Secret header to prevent unauthorized writes.
//   Set HARVEST_SECRET in .env.local (same value as INTERNAL_HARVEST_SECRET
//   referenced in the chat route).
//
// Nootype Archetypes (stored for SFT quality filtering):
//   "form"       — Aesthetics, presentation, prestige, visual structure.
//   "overcoming" — Challenge, intensity, bold flavors, pushing limits.
//   "relaxation" — Frictionless ease, zero cognitive load, comfort.
//   "management" — Control, data, granular options, precise breakdowns.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex-helpers-api";
import { z } from "zod";

// ── Convex client (server-side, no auth required — internal calls only) ──────
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ── Shared secret guard ───────────────────────────────────────────────────────
const HARVEST_SECRET = process.env.HARVEST_SECRET;

function verifySecret(request: NextRequest): boolean {
  if (!HARVEST_SECRET) {
    // No secret configured — only warn in dev; block in production
    if (process.env.NODE_ENV === "production") return false;
    console.warn("[Harvest] HARVEST_SECRET not set — skipping auth in dev.");
    return true;
  }
  return request.headers.get("x-harvest-secret") === HARVEST_SECRET;
}

// ── SFT content turn shape ────────────────────────────────────────────────────
const sftTurnSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.array(z.object({ text: z.string() })),
});

// ── Nootype enum ──────────────────────────────────────────────────────────────
const nootypeSchema = z.enum(["form", "overcoming", "relaxation", "management"]).optional();

// ── POST payload schema ───────────────────────────────────────────────────────
const postBodySchema = z.object({
  cafeId:            z.string().min(1),
  sessionId:         z.string().min(1),
  systemInstruction: z.string().min(1),
  // Full conversation in SFT-ready format — roles must be "user" | "model"
  contents:          z.array(sftTurnSchema).min(2), // at least user + model turns
  rawModelJson:      z.string().min(1),
  positiveSignal:    z.boolean().default(false),
  nootype:           nootypeSchema,
});

// ── PATCH payload schema ──────────────────────────────────────────────────────
const patchBodySchema = z.object({
  cafeId:         z.string().min(1),
  sessionId:      z.string().min(1),
  positiveSignal: z.boolean(),
  nootype:        nootypeSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/harvest
//
// Ingests a single completed AI exchange as an SFT training record.
// Called fire-and-forget from /api/chat after every Gemini response.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    if (!verifySecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = postBodySchema.safeParse(body);

    if (!parsed.success) {
      console.error("[Harvest] POST validation failed:", parsed.error.format());
      return NextResponse.json(
        { error: "Invalid harvest payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const {
      cafeId, sessionId, systemInstruction,
      contents, rawModelJson, positiveSignal, nootype,
    } = parsed.data;

    // Validate turn alternation: must start with "user" and alternate
    for (let i = 0; i < contents.length; i++) {
      const expected = i % 2 === 0 ? "user" : "model";
      if (contents[i].role !== expected) {
        console.error(
          `[Harvest] Turn alternation violation at index ${i}: ` +
          `expected "${expected}", got "${contents[i].role}"`,
        );
        return NextResponse.json(
          { error: `SFT violation: turn[${i}].role must be "${expected}"` },
          { status: 422 },
        );
      }
    }

    // Write to Convex ai_training_logs
    // 🔒 The Convex mutation now verifies this secret server-side, so a direct
    // client call to the deployment (bypassing this route) can no longer poison
    // the training set. HARVEST_SECRET must also be set on the Convex deployment.
    const result = await convex.mutation(api.aiTrainingLogs.ingestTurn, {
      secret: HARVEST_SECRET ?? "",
      cafeId,
      sessionId,
      systemInstruction,
      contents,
      rawModelJson,
      positiveSignal,
      nootype,
    });

    console.log(
      `📊 [Harvest] POST success — cafeId="${cafeId}" ` +
      `session="${sessionId.slice(0, 8)}…" id="${result.id}" ` +
      `nootype="${nootype ?? "?"}" turns=${contents.length}`,
    );

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Harvest] POST unhandled error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/ai/harvest
//
// Retroactively updates positiveSignal (and optionally nootype) for all
// training turns belonging to a given session.
//
// Called by the client when checkout completion fires — the original training
// turn will have been logged with positiveSignal=false; this upgrades it.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    if (!verifySecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchBodySchema.safeParse(body);

    if (!parsed.success) {
      console.error("[Harvest] PATCH validation failed:", parsed.error.format());
      return NextResponse.json(
        { error: "Invalid patch payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { cafeId, sessionId, positiveSignal, nootype } = parsed.data;

    const result = await convex.mutation(api.aiTrainingLogs.updateSignal, {
      secret: HARVEST_SECRET ?? "",
      cafeId,
      sessionId,
      positiveSignal,
      nootype,
    });

    console.log(
      `✅ [Harvest] PATCH success — cafeId="${cafeId}" ` +
      `session="${sessionId.slice(0, 8)}…" ` +
      `updated=${result.updated} positiveSignal=${positiveSignal}`,
    );

    return NextResponse.json({ success: true, updated: result.updated });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Harvest] PATCH unhandled error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
