import { Resend } from "resend";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/waitlist
// Pre-launch email capture for the landing page. Validates + honeypot-checks
// the submission, then emails it via Resend if RESEND_API_KEY is configured.
// If no key is set yet, the signup is still accepted (and logged) so nothing
// is silently lost — add RESEND_API_KEY to .env.local to start receiving
// these by email at hello@shemoqmedi.space.
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const { email, neighborhood, company } = body as {
      email?: string;
      neighborhood?: string;
      company?: string; // honeypot — real visitors never fill this in
    };

    // Honeypot tripped → silently pretend success so bots don't learn anything.
    if (company) {
      return Response.json({ ok: true });
    }

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNeighborhood =
      typeof neighborhood === "string" && neighborhood.trim() ? neighborhood.trim() : "Not specified";

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[waitlist] ${cleanEmail} (${cleanNeighborhood}) — no RESEND_API_KEY set, not emailed`);
      return Response.json({ ok: true, delivered: false });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Voloo Waitlist <onboarding@resend.dev>",
      to: ["hello@shemoqmedi.space"],
      subject: `New waitlist signup — ${cleanEmail}`,
      text: `New Voloo waitlist signup\n\nEmail: ${cleanEmail}\nNeighborhood: ${cleanNeighborhood}\nSubmitted: ${new Date().toISOString()}`,
    });

    if (error) {
      console.error("[waitlist] Resend error:", error);
      // The visitor already saw a success state's worth of effort on their
      // end — don't punish them for our email config. Log it for follow-up.
      return Response.json({ ok: true, delivered: false });
    }

    return Response.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[waitlist] Unexpected error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
