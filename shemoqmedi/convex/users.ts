import { v } from "convex/values";
import { internalMutation, query, mutation } from "./_generated/server";
import { GenericQueryCtx } from "convex/server";

// Define reusable validators based on schema.ts
// User validator matches the users table schema plus system fields
const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  externalId: v.string(),
  name: v.string(),
  email: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  userborded: v.optional(v.boolean()),
  profilePicture: v.optional(v.string()),
  lastname: v.optional(v.string()),
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  preferredContactMethod: v.optional(v.string()),
  role: v.optional(v.string()),
  payementMethod: v.optional(v.string()),
});

const checkoutDataValidator = v.object({
  name: v.string(),
  lastname: v.string(),
  email: v.string(),
  phone: v.string(),
  location: v.string(),
  preferredContactMethod: v.string(),
  paymentMethod: v.string(),
  userId: v.id("users"),
});

const allUserDetailsValidator = v.object({
  _id: v.id("users"),
  externalId: v.string(),
  name: v.string(),
  email: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastname: v.string(),
  phone: v.string(),
  location: v.string(),
  profilePicture: v.string(),
  userborded: v.boolean(),
  preferredContactMethod: v.string(),
  role: v.string(),
  payementMethod: v.string(),
});
    
async function getUserByExternalId(ctx: GenericQueryCtx<any>, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

export const upsertFromClerk = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  async handler(ctx, { data }) {
    // Enhanced email extraction - try multiple approaches
    const getEmailFromClerkData = (clerkData: any): string => {
      // Try primary email address ID first
      if (clerkData.primary_email_address_id && clerkData.email_addresses) {
        const primaryEmail = clerkData.email_addresses.find(
          (email: any) => email.id === clerkData.primary_email_address_id
        );
        if (primaryEmail?.email_address) {
          return primaryEmail.email_address;
        }
      }
      
      // Fallback to first email address
      if (clerkData.email_addresses?.[0]?.email_address) {
        return clerkData.email_addresses[0].email_address;
      }
      
      // Last resort - check for direct email property
      if (clerkData.email) {
        return clerkData.email;
      }
      
      return "";
    };

    const email = getEmailFromClerkData(data);
    const name = `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim();

    console.log("🔍 Processing Clerk data:", {
      id: data.id,
      email: email,
      name: name,
      emailAddresses: data.email_addresses,
      primaryEmailId: data.primary_email_address_id,
      hasEmailAddresses: data.email_addresses?.length > 0
    });

    if (!data.id) {
      throw new Error(`Missing user ID from Clerk. Data: ${JSON.stringify(data)}`);
    }

    // Handle case where email is not yet available (e.g., before verification)
    if (!email) {
      console.log("⚠️ No email found in Clerk data - likely unverified user. Skipping user creation for now.");
      console.log("📋 User will be created/updated when email becomes available");
      return null; // Exit gracefully - don't create user without email
    }

    const userAttributes = {
      name: name,
      email: email,
      externalId: data.id,
      profilePicture: data.image_url ?? "",
      updatedAt: Date.now(),
    };

    const existingUser = await getUserByExternalId(ctx, userAttributes.externalId);

    if (existingUser === null) {
      // User doesn't exist - create new user record
      console.log("✅ Creating new user with email:", userAttributes.email);
      await ctx.db.insert("users", {
        ...userAttributes,
        createdAt: Date.now(),
      });

      // Send welcome email for new users
      try {
        console.log("Welcome email scheduled successfully to:", userAttributes.email);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Don't throw here - we don't want user creation to fail if email fails
      }
    } else {
      // User exists - update their information
      console.log("📝 Updating existing user:", userAttributes.email);
      await ctx.db.patch(existingUser._id, userAttributes);
    }
    
    return null;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  async handler(ctx, { clerkUserId }) {
    const user = await getUserByExternalId(ctx, clerkUserId);
    if (user !== null) {
      console.log("🗑️ Deleting user:", user.email);
      await ctx.db.delete(user._id);
    } else {
      console.log("⚠️ User not found for deletion:", clerkUserId);
    }
    return null;
  },
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || !identity.subject) {
      return null;
    }
    const user = await getUserByExternalId(ctx, identity.subject);
    return user || null;
  },
});


export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

// -------------------------------------------------------------------
// QUERY: Retrieves user's checkout information
// -------------------------------------------------------------------
export const getUserCheckoutData = query({
  args: {},
  returns: v.union(checkoutDataValidator, v.null()),
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || !identity.subject) {
      return null; // Return null if not authenticated
    }
    
    const user = await getUserByExternalId(ctx, identity.subject);
    
    if (user) {
        // Explicitly return necessary fields, using empty string for null/undefined
        return {
            name: user.name || "",
            lastname: user.lastname || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.location || "",
            preferredContactMethod: user.preferredContactMethod || "email",
            paymentMethod: user.payementMethod || "cash",
            userId: user._id, 
        };
    }
    
    return null;
  },
});

export const getAllUserDetails = query({
  args: {},
  returns: v.array(allUserDetailsValidator),
  async handler(ctx) {
    // SECURITY NOTE: This query is public by default. In a real admin panel, 
    // you MUST add an admin check here to secure user data.
    /*
    const identity = await ctx.auth.getUserIdentity();
    const callingUser = identity ? await getUserByExternalId(ctx, identity.subject) : null;
    
    if (callingUser?.role !== "admin") {
      throw new Error("Access denied: Not an admin");
    }
    */

    const allUsers = await ctx.db.query("users").collect();

    // Transform the data to ensure all optional fields have a fallback value 
    return allUsers.map(user => ({
        _id: user._id,
        externalId: user.externalId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastname: user.lastname ?? "",
        phone: user.phone ?? "",
        location: user.location ?? "",
        profilePicture: user.profilePicture ?? "",
        userborded: user.userborded ?? false, 
        preferredContactMethod: user.preferredContactMethod ?? "",
        role: user.role ?? "", 
        payementMethod: user.payementMethod ?? "",
    }));
  },
});

// -------------------------------------------------------------------
// MUTATION: Updates user's checkout information including payment method
// -------------------------------------------------------------------
export const updateUserCheckoutData = mutation({
  args: {
    name: v.string(),
    lastname: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    preferredContactMethod: v.optional(v.string()),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("transaction"))),
    updatedAt: v.number(),
  },
  returns: v.id("users"),
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || !identity.subject) {
      throw new Error("User not authenticated");
    }

    const user = await getUserByExternalId(ctx, identity.subject);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("📝 Updating user checkout data for:", args.email);

    // Patch the existing user document with the new data
    await ctx.db.patch(user._id, {
      name: args.name,
      lastname: args.lastname,
      phone: args.phone,
      location: args.location,
      preferredContactMethod: args.preferredContactMethod,
      payementMethod: args.paymentMethod, // Note: keeping the typo from your schema
      updatedAt: args.updatedAt,
      userborded: true, // Mark user as onboarded after checkout
    });

    console.log("✅ User checkout data updated successfully");
    console.log("💳 Payment method set to:", args.paymentMethod);

    return user._id;
  },
});

// -------------------------------------------------------------------
// MUTATION: Updates only the payment method for a user
// -------------------------------------------------------------------
export const updatePaymentMethod = mutation({
  args: {
    paymentMethod: v.union(v.literal("cash"), v.literal("transaction")),
  },
  returns: v.id("users"),
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || !identity.subject) {
      throw new Error("User not authenticated");
    }

    const user = await getUserByExternalId(ctx, identity.subject);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("💳 Updating payment method for user:", user.email);

    await ctx.db.patch(user._id, {
      payementMethod: args.paymentMethod,
      updatedAt: Date.now(),
    });

    console.log("✅ Payment method updated to:", args.paymentMethod);

    return user._id;
  },
});


const updateProfileArgs = v.object({
  name: v.string(),
  lastname: v.optional(v.string()),
  email: v.string(), // Usually read-only for auth consistency, but we'll allow storing it
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  profilePicture: v.optional(v.string()), // URL or Storage ID
});

// 2. Add this mutation at the end of the file
export const updateProfile = mutation({
  args: updateProfileArgs,
  returns: v.null(),
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await getUserByExternalId(ctx, identity.subject);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      name: args.name,
      lastname: args.lastname,
      email: args.email,
      phone: args.phone,
      location: args.location,
      profilePicture: args.profilePicture,
      updatedAt: Date.now(),
    });

    return null;
  },
});