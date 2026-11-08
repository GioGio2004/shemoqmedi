// Typed references to the Convex functions this app calls.
//
// The Convex backend lives in the shemoqmedi-admin repo (convex/). This app
// has no convex/ folder, so these types are declared here by hand. Keep them
// in sync with shemoqmedi-admin/convex/{media,listings,votes,creators,claims,users}.ts.

import { type DefaultFunctionArgs, type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";
import type { AwardSlug, CreatorTier, RegionSlug } from "@/lib/taxonomy";
import type { RegisterArgs, UploadAuth } from "@/lib/imagekitUpload";

export type Pillars = { design: number; usability: number; creativity: number; code: number };

export type ListingStatus = "pending" | "in_voting" | "awarded" | "archived" | "rejected";
export type PublicStatus = "in_voting" | "awarded" | "archived";

/** A public listing (in voting, awarded or archived). */
export type PublicListing = {
  slug: string;
  title: string;
  tagline: string;
  url: string;
  category: string; // primary CATEGORIES slug (= categories[0])
  categories: string[]; // CATEGORIES slugs, primary first
  technologies: string[]; // TECHNOLOGIES names
  region: RegionSlug;
  creatorTier: CreatorTier;
  creditName: string;
  creditUrl: string | null;
  creator: { slug: string; name: string } | null;
  status: PublicStatus;
  awards: AwardSlug[];
  editorialScores: Pillars | null; // jury, per pillar
  communityScores: Pillars | null; // community average, per pillar
  communityVotesCount: number;
  editorialAverage: number | null;
  communityAverage: number | null;
  finalScore: number | null; // 60% jury + 40% community
  publishedAt: number;
  votingEndsAt: number;
  awardedAt: number | null;
  isClaimed: boolean;
  coverUrl: string | null; // first screenshot: 16:9, or a full page that scrolls
  galleryUrls: string[]; // up to 4 more screenshots, in order
  videoUrl: string | null; // short muted hover preview
  juryNote: string | null; // owner-written review (up to ~600 chars), shown on the listing page
};

/** One of the signed-in user's own listings. */
export type OwnListing = {
  id: Id<"listings">;
  slug: string;
  title: string;
  url: string;
  status: ListingStatus;
  reviewNote: string | null;
  awards: AwardSlug[];
  finalScore: number | null;
  votingEndsAt: number | null;
  createdAt: number;
  coverUrl: string | null;
};

export type PublicCreator = {
  slug: string;
  name: string;
  tier: CreatorTier;
  region: RegionSlug;
  location: string | null;
  website: string | null;
  /** Profile links (Dribbble, LinkedIn, ...). Optional until the backend with it is deployed. */
  links?: string[];
  bio: string | null;
  isClaimed: boolean;
  awards: { SOTD: number; BSC: number; HM: number };
  nominations: number;
};

export type CreatorSummary = {
  slug: string;
  name: string;
  tier: CreatorTier;
  region: RegionSlug;
  location: string | null;
  nominations: number;
  awards: number;
  updatedAt: number;
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
type A<Args extends DefaultFunctionArgs, Ret> = FunctionReference<"action", "public", Args, Ret>;

/** A screenshot or video: an older Convex storage file or an ImageKit media row. */
export type MediaId = Id<"_storage"> | Id<"media">;
type Empty = Record<string, never>;

export type SubmitArgs = {
  title: string;
  tagline: string;
  url: string;
  categories: string[]; // CATEGORIES slugs, primary first
  technologies: string[];
  creatorTier: CreatorTier;
  region: RegionSlug;
  creditName: string;
  creditUrl?: string;
  submissionTier: "standard" | "express";
  coverId: MediaId;
  galleryIds?: MediaId[];
  videoId?: MediaId;
};

export type PublicApiType = {
  media: {
    /** Signed parameters for one browser → ImageKit upload (signed-in users). */
    uploadAuth: A<Empty, UploadAuth>;
    /** Record a finished ImageKit upload; returns the id submit takes. */
    register: M<RegisterArgs, Id<"media">>;
  };
  users: {
    getCurrentUser: Q<Empty, ConvexUser | null>;
  };
  listings: {
    /** All public listings (max 200), newest first. */
    listPublic: Q<Empty, PublicListing[]>;
    getPublicBySlug: Q<{ slug: string }, PublicListing | null>;
    /** Current slug of the public listing that used to have `slug` (renamed in the admin), or null. */
    resolveSlug: Q<{ slug: string }, string | null>;
    publicSlugs: Q<Empty, { slug: string; updatedAt: number }[]>;
    generateUploadUrl: M<Empty, string>;
    submit: M<SubmitArgs, { slug: string }>;
    myListings: Q<Empty, OwnListing[]>;
    withdraw: M<{ id: Id<"listings"> }, null>;
  };
  votes: {
    /** One vote per user while in_voting; throws ConvexError with a readable message. */
    cast: M<{ slug: string; scores: Pillars }, null>;
    mine: Q<{ slug: string }, { scores: Pillars; createdAt: number } | null>;
  };
  creators: {
    getBySlug: Q<{ slug: string }, { creator: PublicCreator; listings: PublicListing[] } | null>;
    listPublic: Q<Empty, CreatorSummary[]>;
  };
  claims: {
    submit: M<
      { targetType: "listing" | "creator"; slug: string; message: string; proofUrl?: string },
      null
    >;
  };
};

export const api: PublicApiType = anyApi as unknown as PublicApiType;
