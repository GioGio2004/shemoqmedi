import { ConvexError } from "convex/values";

/**
 * Message safe to show a visitor. Our Convex functions reject bad input with
 * a ConvexError("readable text"); anything else is unexpected and its raw
 * text ("[CONVEX M(...)] [Request ID: ...] Server Error ...", stacks) must
 * never reach the page, so it becomes a generic line.
 */
export function friendlyError(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err instanceof ConvexError && typeof err.data === "string" && err.data.trim()) return err.data;
  return fallback;
}
