
// convex/http.ts - Updated webhook handler
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { validateClerkWebhook } from "./lib/utils";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateClerkWebhook(request);


    if (!event) {
      console.error("❌ Invalid webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log(`📨 Received webhook: ${event.type} for user ${event.data.id}`);

    try {
      switch (event.type) {
        case "user.created":
          console.log(`👤 Creating new user: ${event.data.email_addresses?.[0]?.email_address || 'email not found'}`);

          // Create user in database
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });
          console.log(`✅ Created user successfully for user ${event.data.id}`);
          break;

        case "user.updated":
          console.log(`📝 Updating user: ${event.data.email_addresses?.[0]?.email_address || 'email not found'}`);
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });
          break;

        case "user.deleted":
          console.log(`🗑️ Deleting user: ${event.data.id}`);
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId: event.data.id!,
          });
          break;

        default:
          console.log(`⚠️ Unhandled webhook event: ${event.type}`);
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("❌ Error processing webhook:", error);
      // Log the full event data for debugging
      console.error("🔍 Full event data:", JSON.stringify(event, null, 2));
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;