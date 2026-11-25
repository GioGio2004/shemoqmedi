// Typed references to the Convex functions this app calls.
//
// The Convex backend lives in the shemoqmedi-admin repo (convex/). This app
// has no convex/ folder, so these types are declared here by hand. Keep them
// in sync with shemoqmedi-admin/convex/{media,listings,votes,creators,claims,users}.ts.

import { type DefaultFunctionArgs, type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";
import type { AwardRules, AwardSlug, CreatorTier, JuryCategory, RegionSlug } from "@/lib/taxonomy";
import type { RegisterArgs, UploadAuth } from "@/lib/imagekitUpload";
import type { RegisterVideoArgs } from "@/lib/videoUpload";

export type Pillars = { design: number; usability: number; creativity: number; content: number };

/** "withdrawn": the owner archived it (hidden, everything kept, restorable). */
export type ListingStatus = "pending" | "in_voting" | "awarded" | "archived" | "rejected" | "withdrawn";
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
  /**
   * Scores, pillar scores and vote counts below are null while the site is
   * in voting: they are revealed once judging closes. false: sealed. Optional
   * until the backend with it is deployed (then treat in_voting as sealed).
   */
  scoresRevealed?: boolean;
  editorialScores: Pillars | null; // jury, per pillar
  communityScores: Pillars | null; // community average, per pillar
  communityVotesCount: number | null;
  editorialAverage: number | null;
  communityAverage: number | null;
  finalScore: number | null; // the jury's weighted score (community votes never count)
  publishedAt: number;
  votingEndsAt: number;
  /** Legacy (before weekly batches): voting was extended a week for the jury. */
  votingExtended?: boolean;
  awardedAt: number | null;
  /**
   * Site of the Day ("YYYY-MM-DD", UTC): one site a day, never twice. With
   * "SOTD" in awards it is the day the site won; without, the site is
   * scheduled for that day. Optional until the backend with it is deployed.
   */
  sotdDay?: string | null;
  /** Jury votes in the score; awards need the configured minimum. Optional until the backend with it is deployed. */
  juryVotes?: number | null;
  /** Built by the Shemoqmedi team: never eligible for awards. */
  byTeam?: boolean;
  /** A significant redesign of the listing with this slug. */
  redesignOf?: string | null;
  isClaimed: boolean;
  /** Shown in the Startups collection and filter. */
  isStartup: boolean;
  /** false: outbound links to the site (and its creator) get rel="nofollow noopener". Optional until the backend with it is deployed. */
  isDoFollow?: boolean;
  /** Position in the home page's featured header (1 = first), chosen in the admin. null: not featured. Optional until the backend with it is deployed. */
  featuredRank?: number | null;
  coverUrl: string | null; // first screenshot: 16:9, or a full page that scrolls
  galleryUrls: string[]; // up to 4 more screenshots, in order
  videoUrl: string | null; // short muted hover preview
  juryNote: string | null; // owner-written review (up to ~600 chars), shown on the listing page
  /** "About this site": the editorial write-up, paragraphs separated by a blank line. Optional until the backend with it is deployed. */
  writeup?: string | null;
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
  finalScore: number | null; // null while in voting: revealed when judging closes
  votingEndsAt: number | null;
  createdAt: number;
  coverUrl: string | null;
  /**
   * What withdrawing does: "delete" (never public, no awards: gone for good),
   * "archive" (hidden from the site, everything kept, restorable) or null
   * (nothing: a submission you sent but don't own once it's public, or one
   * already withdrawn).
   */
  removal: "delete" | "archive" | null;
  /** Withdrawn by you: restore brings it back as it was. */
  canRestore: boolean;
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
  /** Public "get in touch" address, only when the creator set one. Optional until the backend with it is deployed. */
  email?: string | null;
  /** The owner's own photo, unless they picked an avatar instead; null or missing shows a Shemoqmedi avatar. */
  photoUrl?: string | null;
  /** The Shemoqmedi avatar the owner picked ("01"…"24"); null or missing = the one picked from the slug. */
  avatar?: string | null;
  isClaimed: boolean;
  /** SOTY and SOTM are optional until the backend with them is deployed. */
  awards: { SOTY?: number; SOTM?: number; SOTD: number; BSC: number; HM: number; F100?: number };
  nominations: number;
};

export type CreatorSummary = {
  slug: string;
  name: string;
  tier: CreatorTier;
  region: RegionSlug;
  location: string | null;
  /** The owner's own photo, unless they picked an avatar instead; null or missing shows a Shemoqmedi avatar. */
  photoUrl?: string | null;
  /** The Shemoqmedi avatar the owner picked ("01"…"24"); null or missing = the one picked from the slug. */
  avatar?: string | null;
  isClaimed?: boolean;
  nominations: number;
  awards: number;
  updatedAt: number;
};

/** A creator profile the signed-in user claimed, as they edit it from their account. */
export type OwnCreatorProfile = {
  id: Id<"creators">;
  slug: string;
  name: string;
  location: string;
  website: string;
  links: string[];
  bio: string;
  email: string;
  photoUrl: string | null;
  /** The Shemoqmedi avatar the owner picked; null or missing = the one picked from the slug. */
  avatar?: string | null;
  /** false until one of its sites is public. */
  isPublic: boolean;
};

/**
 * A position on a juror's profile, LinkedIn style. Months are 1–12 and
 * optional (year-only dates); `current` means no end date. `period` is the
 * older free-text date, only on rows saved before dates existed.
 */
export type JurorExperience = {
  title: string;
  organization: string;
  organizationUrl?: string;
  location?: string;
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  current?: boolean;
  description?: string;
  period?: string;
};
/** A school on a juror's profile. */
export type JurorEducation = { school: string; degree?: string; field?: string; startYear?: number; endYear?: number };
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
  experience?: JurorExperience[]; // newest first
  education?: JurorEducation[]; // newest first
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
  /** Optional during rollout: older backends don't send them. */
  experience?: JurorExperience[];
  education?: JurorEducation[];
  work?: JurorWork[];
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
  state: "open" | "claimed" | "expired" | "invalid"; // expired: older than 14 days
  kind: "juror" | "bundle" | "listing" | null;
  juror: ClaimJurorPreview | null;
  listings: ClaimListingPreview[];
  redirect: string | null; // state "claimed": where the claimed profile/listing lives
  emailHint: string | null; // "an•••@gmail.com": the invitation is bound to this address
};

/** Reviews list only sites whose judging has closed. */
export type JurorPage = {
  juror: JurorPublic & { joinedAt: number };
  reviews: { listing: { slug: string; title: string; coverUrl: string | null }; average: number; comment: string; updatedAt: number }[];
};

export type JuryReview = {
  juror: JurorPublic;
  /** /jury/<slug> exists (an active, claimed juror); otherwise show the name without a link. */
  profilePublic?: boolean;
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
  experience?: JurorExperience[]; // [] clears; absent keeps; sorted newest first on save
  education?: JurorEducation[]; // [] clears; absent keeps
  work?: JurorWork[]; // [] clears; absent keeps
  interests?: string[]; // categories for the jury digest; [] clears; absent keeps
};

/** One award (tier and the day, month or year it was won for). */
export type PublicAward = {
  slug: string; // /awards/<slug>, badge /badge/<slug>
  tier: AwardSlug;
  name: string;
  period: string; // SOTD "2026-11-12", SOTM "2026-11", SOTY "2026", HM/BSC the batch week, F100 the member number "017"
  date: string; // Tbilisi day it was announced
  score: number | null;
  listing: {
    slug: string;
    title: string;
    url: string;
    creditName: string;
    creatorSlug: string | null;
    coverUrl: string | null;
  };
};

export type RoundCard = {
  id: string;
  kind: "SOTM" | "SOTY";
  period: string;
  closesAt: number;
  candidates: {
    slug: string;
    title: string;
    url: string;
    creditName: string;
    coverUrl: string | null;
    blocked: string | null; // conflict of interest
    myScores: Pillars | null;
  }[];
};

export type ConvexUser = {
  _id: Id<"users">;
  _creationTime: number;
  externalId: string;
  name: string;
  email: string;
  profilePicture?: string;
  hasImage?: boolean;
  /** The picture the site shows for them: "photo", "01"…"24", or unset (picked for them). */
  avatar?: string;
  role?: "admin" | "super_admin";
  createdAt: number;
  updatedAt: number;
};

/** One Lighthouse run (mobile or desktop) from Google PageSpeed Insights (convex/audits.ts). */
export type AuditReport = {
  /** 0-100; null when Lighthouse could not score a category. */
  scores: { performance: number | null; accessibility: number | null; bestPractices: number | null; seo: number | null };
  /** Lab metrics from this run, in ms (cls unitless). */
  lab: {
    fcp: number | null;
    lcp: number | null;
    tbt: number | null;
    cls: number | null;
    speedIndex: number | null;
    ttfb: number | null;
  };
  /** Real-user data (Chrome UX Report, 75th percentile); null without enough traffic. */
  field: {
    category: string;
    lcp: number | null;
    cls: number | null;
    inp: number | null;
    fcp: number | null;
    ttfb: number | null;
  } | null;
  pageBytes: number | null;
  requests: number | null;
  opportunities: { title: string; savingsMs: number }[];
  issues: { category: "accessibility" | "best-practices" | "seo"; title: string }[];
  screenshot?: string;
  lighthouseVersion: string;
};

/** The technical audit of a listed site, for jurors. */
export type SiteAudit = {
  url: string;
  status: "running" | "done" | "error";
  error: string | null;
  requestedAt: number;
  finishedAt: number | null;
  mobile: AuditReport | null;
  desktop: AuditReport | null;
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
  /** Slug of the earlier listing when this is a significant redesign of a site already in the showcase. */
  redesignOf?: string;
  coverId: MediaId;
  galleryIds?: MediaId[];
  videoId?: MediaId;
};

export type PublicApiType = {
  media: {
    /** Signed parameters for one browser → ImageKit upload (signed-in users). */
    uploadAuth: A<{ site: string; label: string; contentType: string }, UploadAuth>;
    /** Record a finished ImageKit upload (screenshots only); returns the id submit takes. */
    register: M<RegisterArgs, Id<"media">>;
    /** Presigned URL for one browser → Cloudflare R2 video upload (signed-in users). */
    videoUploadUrl: A<
      { site: string; label: string; contentType: string; size: number },
      { uploadUrl: string; key: string }
    >;
    /** Record a finished R2 video upload; returns the id submit takes. */
    registerVideo: M<RegisterVideoArgs, Id<"media">>;
  };
  users: {
    getCurrentUser: Q<Empty, ConvexUser | null>;
    /** "photo", "01"…"24", or "auto" (back to the picked one). Returns what's saved (null for auto). */
    setMyAvatar: M<{ avatar: string }, string | null>;
    deleteMyAccount: A<
      { confirm: "DELETE" },
      {
        counts: { listingsDeleted: number; listingsReleased: number; creators: number; votes: number; claims: number };
        loginDeleted: boolean;
      }
    >;
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
    /** The checks submit makes that don't need the files; run before uploading. */
    precheckSubmission: Q<{ url: string; redesignOf?: string }, { ok: true } | { ok: false; reason: string }>;
    /** Sites you own, plus submissions you sent that nobody owns yet. */
    myListings: Q<Empty, OwnListing[]>;
    /** Deletes a never-public submission, or archives (status "withdrawn") one that has been public. */
    withdraw: M<{ id: Id<"listings"> }, { result: "deleted" | "archived" }>;
    /** Owner: bring a withdrawn listing back in the status it had. */
    restore: M<{ id: Id<"listings"> }, null>;
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
    /** awards: every active award of the creator's sites, newest first (optional until the backend with it is deployed). */
    getBySlug: Q<{ slug: string }, { creator: PublicCreator; listings: PublicListing[]; awards?: PublicAward[] } | null>;
    listPublic: Q<Empty, CreatorSummary[]>;
    /** The signed-in user's claimed profiles. */
    mine: Q<Empty, OwnCreatorProfile[]>;
    /** The owner edits their profile; "" clears a field. */
    updateMine: M<
      { id: Id<"creators">; location: string; website: string; links: string[]; bio: string; email: string },
      { location: string; website: string; links: string[]; bio: string; email: string }
    >;
  };
  jury: {
    /** Active jurors with their evaluation counts (/jury). */
    /** evaluations: counts only sites whose judging has closed. */
    listPublic: Q<Empty, (JurorPublic & { evaluations: number })[]>;
    /** Empty while the site is in voting: reviews are revealed when judging closes. */
    reviewsForListing: Q<{ slug: string }, JuryReview[]>;
    /** The signed-in user's jury profile, or null if they are not on the jury. */
    /** hasPresetPhoto: the photo prepared with the invitation is still the one shown. */
    me: Q<Empty, (JurorPublic & { hasPresetPhoto: boolean; interests?: string[] }) | null>;
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
    /** Rejects an account whose email isn't the invited one; `pending`: the jury profile waits for an admin. */
    claim: M<{ token: string }, { kind: "juror" | "bundle" | "listing"; redirect: string; pending: boolean }>;
  };
  awards: {
    /** An active award by its slug (/awards/<slug> and the badge image); null when revoked or unknown. */
    getBySlug: Q<{ slug: string }, PublicAward | null>;
    /** A site's award history, newest first. */
    forListing: Q<{ slug: string }, PublicAward[]>;
    /** Every active award of one tier, newest first. */
    listPublic: Q<{ tier: AwardSlug; limit?: number }, PublicAward[]>;
    publicSlugs: Q<Empty, { slug: string; createdAt: number }[]>;
    /** The signed-in owner's awards (badge embed codes). */
    mine: Q<Empty, PublicAward[]>;
    /** How many of the hundred honorary First 100 badges are given. */
    first100Count: Q<Empty, { given: number; limit: number }>;
    /** The live award rules (pillars, weights, thresholds, rounds); see AwardRules. */
    publicRules: Q<Empty, AwardRules>;
  };
  rounds: {
    /** Open Site of the Month / Year rounds the signed-in juror can score; null for non-jurors. */
    open: Q<Empty, RoundCard[] | null>;
    vote: M<{ roundId: string; slug: string; scores: Pillars }, null>;
  };
  audits: {
    /** The site's technical audit, for jurors only; null for anyone else or before the first run. */
    forJuror: Q<{ slug: string }, SiteAudit | null>;
  };
  conflicts: {
    /** A juror declares they built the site or it belongs to their company. */
    declare: M<{ slug: string; reason: string }, null>;
  };
  digest: {
    /** Sites in voting that no juror follows by category (visible to every juror); null for non-jurors. */
    generalQueue: Q<
      Empty,
      { slug: string; title: string; creditName: string; coverUrl: string | null; votingEndsAt: number }[] | null
    >;
  };
  claims: {
    /** intent "remove" asks for a listing to be taken down (listings only). */
    submit: M<
      {
        targetType: "listing" | "creator";
        slug: string;
        message: string;
        proofUrl?: string;
        intent?: "claim" | "remove";
      },
      null
    >;
  };
};

export const api: PublicApiType = anyApi as unknown as PublicApiType;
