// Typed references to the Convex functions this app calls.
//
// The Convex backend lives in the shemoqmedi-admin repo (convex/). This app
// has no convex/ folder, so these types are declared here by hand. Keep them
// in sync with shemoqmedi-admin/convex when you add or change functions
// (or regenerate with `npx convex-helpers ts-api-spec` from the admin repo).

import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export type ConvexUser = {
  _id: Id<"users">;
  _creationTime: number;
  externalId: string;
  name: string;
  email: string;
  profilePicture?: string;
  role?: "admin" | "super_admin";
  createdAt: number;
  updatedAt: number;
};

export type PublicApiType = {
  users: {
    getCurrentUser: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      ConvexUser | null
    >;
  };
};

export const api: PublicApiType = anyApi as unknown as PublicApiType;
