// The jury, shown on /jury. Add a member here once they have agreed to be
// listed publicly; the page shows the members grid only when this has entries.
// `url` is their own site or portfolio (a normal followed link).

export type JuryMember = {
  name: string;
  /** "Creative director at Studio X", "Independent developer" */
  role: string;
  location?: string;
  url?: string;
};

export const JURY: JuryMember[] = [];
