// Typed references to the Convex functions this app calls.
//
// The Convex backend lives in the shemoqmedi-admin repo (convex/). This app
// has no convex/ folder, so these types are declared here by hand. Keep them
// in sync with shemoqmedi-admin/convex/{media,listings,votes,creators,claims,users}.ts.

import { type DefaultFunctionArgs, type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";
import type { AwardSlug, CreatorTier, JuryCategory, RegionSlug } from "@/lib/taxonomy";
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
  /** Voting was extended a week because fewer than 5 jurors had evaluated it after 7 days. Optional during rollout. */
  votingExtended?: boolean;
  awardedAt: number | null;
  isClaimed: boolean;
  /** Shown in the Startups collection and filter. */
  isStartup: boolean;
  /** false: outbound links to the site (and its creator) get rel="nofollow noopener". Optional until the backend with it is deployed. */
  isDoFollow?: boolean;
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

/** A juror's past role ("Art director" at "Studio X", "2019 – present"). */
export type JurorExperience = { title: string; organization: string; period?: string };
/** A notable piece of a juror's work. */
export type JurorWork = { title: string; url?: string; year?: string; description?: string };

/** A jury member as shown on the site. imageUrl null: grey placeholder. */
export type JurorPublic = {
  slug: string;
  name: string;
  title: string;
  category: JuryCategory | null; // jury panel
  location: string | null;
  website: string | null; // null: render no website link at all
  linkedinUrl: string | null;
  bio: string | null;
  /** Optional during rollout: older backends don't send them. Use `?? []`. */
  experience?: JurorExperience[];
  work?: JurorWork[];
  isFounding: boolean; // "Founding Jury" badge
  imageUrl: string | null; // null: grey placeholder
};

/** What /claim/<token> shows before claiming. */
export type ClaimJurorPreview = {
  name: string;
  title: string;
  category: JuryCategory | null;
  location: string | null;
  bio: string | null;
  website: string | null;
  linkedinUrl: string | null;
  isFounding: boolean;
  imageUrl: string | null;
};

export type ClaimListingPreview = {
  slug: string;
  title: string;
  tagline: string;
  url: string;
  creditName: string;
  coverUrl: string | null;
  isPublic: boolean; // has a /sites/<slug> page yet
  isStartup: boolean;
};

export type ClaimResolution = {
  state: "open" | "claimed" | "invalid";
  kind: "juror" | "bundle" | "listing" | null;
  juror: ClaimJurorPreview | null;
  listings: ClaimListingPreview[];
  redirect: string | null; // state "claimed": where the claimed profile/listing lives
};

export type JurorPage = {
  juror: JurorPublic & { joinedAt: number };
  reviews: { listing: { slug: string; title: string; coverUrl: string | null }; average: number; comment: string; updatedAt: number }[];
};

export type JuryReview = {
  juror: JurorPublic;
  scores: Pillars;
  average: number;
  comment: string;
  createdAt: number;
  updatedAt: number;
};

export type JurorProfileArgs = {
  name: string;
  title: string;
  location?: string;
  website?: string; // "" clears
  linkedinUrl?: string; // "" clears
  bio?: string;
  experience?: JurorExperience[]; // [] clears; absent keeps
  work?: JurorWork[]; // [] clears; absent keeps
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
  isStartup?: boolean;
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
    /**
     * Whether the signed-in user may vote on this site. kind "badge": they need
     * at least one Shemoqmedi badge (another of their sites listed) first. Null
     * when signed out or the account isn't synced yet.
     */
    eligibility: Q<
      { slug: string },
      { canVote: boolean; reason: string | null; kind: "ok" | "closed" | "own" | "badge" | "voted" } | null
    >;
  };
  creators: {
    getBySlug: Q<{ slug: string }, { creator: PublicCreator; listings: PublicListing[] } | null>;
    listPublic: Q<Empty, CreatorSummary[]>;
  };
  jury: {
    /** Active jurors with their evaluation counts (/jury). */
    listPublic: Q<Empty, (JurorPublic & { evaluations: number })[]>;
    reviewsForListing: Q<{ slug: string }, JuryReview[]>;
    /** The signed-in user's jury profile, or null if they are not on the jury. */
    /** hasPresetPhoto: the photo prepared with the invitation is still the one shown. */
    me: Q<Empty, (JurorPublic & { hasPresetPhoto: boolean }) | null>;
    /** The juror changed/removed their photo: drop the invitation's preset photo. */
    dropPresetPhoto: M<Empty, null>;
    myEvaluation: Q<
      { slug: string },
      {
        blocked: string | null;
        evaluation: { scores: Pillars; comment: string; updatedAt: number } | null;
        votingEndsAt: number | null;
      } | null
    >;
    evaluate: M<{ slug: string; scores: Pillars; comment: string }, null>;
    /** Returns the (possibly new) slug: renaming changes /jury/<slug>. */
    updateProfile: M<JurorProfileArgs, { slug: string }>;
    /** Public jurors: claimed and on the jury (sitemap, static params). */
    publicSlugs: Q<Empty, { slug: string; updatedAt: number }[]>;
    /** /jury/<slug>; null for unclaimed or removed jurors. */
    getBySlug: Q<{ slug: string }, JurorPage | null>;
  };
  claimLinks: {
    /** Anyone can preview a link; claiming needs a signed-in user. */
    resolve: Q<{ token: string }, ClaimResolution>;
    claim: M<{ token: string }, { kind: "juror" | "bundle" | "listing"; redirect: string }>;
  };
  claims: {
    submit: M<
      { targetType: "listing" | "creator"; slug: string; message: string; proofUrl?: string },
      null
    >;
  };
};

export const api: PublicApiType = anyApi as unknown as PublicApiType;
