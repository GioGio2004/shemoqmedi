// Typed references to the Convex functions this app calls.
//
// The Convex backend lives in the shemoqmedi-admin repo (convex/). This app
// has no convex/ folder, so these types are declared here by hand. Keep them
// in sync with shemoqmedi-admin/convex/listings.ts and users.ts.

import { type DefaultFunctionArgs, type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export type ListingStatus = "pending" | "approved" | "rejected";

/** An approved listing, as the public sees it. */
export type PublicListing = {
  slug: string;
  title: string;
  tagline: string;
  url: string;
  category: string;
  technologies: string[];
  creditName: string;
  creditUrl: string | null;
  publishedAt: number;
  coverUrl: string | null;
  mobileUrl: string | null;
};

/** One of the signed-in user's own listings. */
export type OwnListing = {
  id: Id<"listings">;
  slug: string;
  title: string;
  url: string;
  status: ListingStatus;
  reviewNote: string | null;
  createdAt: number;
  coverUrl: string | null;
};

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

type Q<Args extends DefaultFunctionArgs, Ret> = FunctionReference<"query", "public", Args, Ret>;
type M<Args extends DefaultFunctionArgs, Ret> = FunctionReference<"mutation", "public", Args, Ret>;

export type PublicApiType = {
  users: {
    getCurrentUser: Q<Record<string, never>, ConvexUser | null>;
  };
  listings: {
    listPublished: Q<{ category?: string; limit?: number }, PublicListing[]>;
    getPublishedBySlug: Q<{ slug: string }, PublicListing | null>;
    categoryCounts: Q<
      Record<string, never>,
      { total: number; byCategory: Record<string, number> }
    >;
    publishedSlugs: Q<Record<string, never>, { slug: string; updatedAt: number }[]>;
    generateUploadUrl: M<Record<string, never>, string>;
    submit: M<
      {
        title: string;
        tagline: string;
        url: string;
        category: string;
        technologies: string[];
        creditName: string;
        creditUrl?: string;
        coverId: Id<"_storage">;
        mobileId?: Id<"_storage">;
      },
      { slug: string }
    >;
    myListings: Q<Record<string, never>, OwnListing[]>;
    withdraw: M<{ id: Id<"listings"> }, null>;
  };
};

export const api: PublicApiType = anyApi as unknown as PublicApiType;
