/**
 * Content model for the site's scalable information architecture.
 *
 * These files are pure data — no image or browser imports — so they can also be
 * consumed by Node scripts (e.g. scripts/generate-sitemap.mjs). Icons and images
 * are referenced by string key and resolved in src/components/content-icons.ts.
 */

export type DiagramNode = {
  label: string;
  /** "store" marks a persistent data store, rendered with an accent so at-rest data stands out */
  kind?: "store";
};

export type ContentDiagram = {
  /** Each group is a titled panel; each flow is a left-to-right chain of nodes */
  groups: { title: string; flows: DiagramNode[][] }[];
  caption?: string;
};

export type ContentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Themed bullet lists with a small title above each group */
  bulletGroups?: { title: string; bullets: string[] }[];
  diagram?: ContentDiagram;
  /** Paragraphs rendered after bullets/diagram, for sections that need closing prose */
  closingParagraphs?: string[];
};

export type Service = {
  slug: string;
  name: string;
  /** Small mono label, e.g. "ANALYTICS // 01" */
  tag: string;
  /** Key into the icon map in content-icons.ts */
  icon: string;
  /** One-sentence card copy used on the homepage + services index */
  summary: string;
  /** Supporting headline fragment for the detail page hero */
  headline: string;
  overview: string[];
  problems: string[];
  technologies: string[];
  benefits: { title: string; description: string }[];
  /**
   * The concrete thing this discipline has already produced. A service page
   * without one is a list of adjectives; with one it is a claim you can check.
   */
  workedExample: { label: string; body: string; to?: string };
  /** Shape and duration of a first engagement, so a buyer can estimate. */
  engagement: string;
  relatedProductSlugs: string[];
  relatedCaseStudySlugs: string[];
  relatedFieldNoteSlugs: string[];
};

/**
 * One CTA in a product hero. Every product uses the same grammar so the four
 * pages open with the same rhythm rather than four improvised button rows:
 *
 *   1. `primary`   — open the thing (exactly one, always first)
 *   2. `appstore`  — the Apple badge, only for products that ship on it
 *   3. `secondary` — the studio-facing ask (exactly one, always last)
 *
 * Keep the array in that order; the hero renders it as written.
 */
export type ProductLink = {
  /**
   * Leave this off. The label comes from `kind` — "Visit {product}" for a
   * primary, the Apple wording for the badge, "Talk to Us" for a secondary —
   * so four buttons that do the same thing cannot end up saying it four
   * different ways, which is exactly what happened when each product wrote its
   * own. Set it only where the action is genuinely different from the others,
   * as ANN's repository link and Thera's free trial are — "Visit Thera"
   * describes a door, not the fact that walking through it is free for two
   * weeks.
   */
  label?: string;
  href: string;
  /** "appstore" renders the official Apple badge */
  kind: "primary" | "secondary" | "appstore";
  umamiEvent?: string;
};

export type Product = {
  slug: string;
  name: string;
  /** Status label, e.g. "Flagship · Live" */
  tag: string;

  /**
   * Where the product came from, including any relationship a reader deserves
   * to know about. Disclosed on the detail page, not buried in an FAQ.
   */
  provenance?: { label: string; paragraphs: string[] };
  /** Key into the icon map in content-icons.ts */
  icon: string;
  tagline: string;
  summary: string;
  /**
   * Search-tuned meta description (~155 chars). `summary` is written for a card
   * and runs long enough that Google truncates it; falls back to it when absent.
   */
  seoDescription?: string;
  overview: string[];
  problem: string[];
  features: { title: string; description: string }[];
  technologies: string[];
  /**
   * Where it runs, from the user's side and ours. Lives in content rather than
   * in the page so the detail template has no per-product branches.
   */
  hosting: {
    /** How a user reaches it, e.g. "iPhone · iPad · Mac · Web" */
    platform: string;
    /**
     * schema.org `operatingSystem` value, e.g. "iOS, macOS, Web". Kept in
     * content so the detail template has no per-product branch for it.
     */
    operatingSystem: string;
    /** One-line infrastructure fact for the spec rail, e.g. "Docker on EC2" */
    runsOn: string;
    /** Expanded version of the same, for the pricing band's second column */
    detail: { title: string; body: string };
  };
  /**
   * Short price for cards and scanning, e.g. "$50/mo · $500/yr". A buyer who
   * cannot estimate cost self-selects out without ever asking.
   */
  priceLabel?: string;
  /** Full pricing prose for the detail page. */
  pricing?: string;
  /** Machine-readable monthly price, emitted as an Offer in structured data. */
  priceUsdMonthly?: number;
  faq: { question: string; answer: string }[];
  links: ProductLink[];
  relatedServiceSlugs: string[];
  relatedCaseStudySlugs: string[];
  relatedFieldNoteSlugs: string[];
};

export type Certification = {
  /** Short form used in rails and chips, e.g. "SDVOSB" */
  abbr: string;
  /** Full program name, spelled out the way the certifying body spells it */
  name: string;
  issuer: string;
  /** Issuer initialism for tight spaces, e.g. "SBA" */
  issuerShort: string;
  /** ISO date of certification, taken from the approval letter */
  date: string;
  /** Human label for display, e.g. "August 2026" */
  dateLabel: string;
};

export type EntityProfile = {
  /** Registered legal name, as filed. */
  legalName: string;
  /** Assumed name the studio trades under; both belong on a federal document. */
  dba: string;
  /** SAM.gov Unique Entity ID. */
  uei: string;
  /** CAGE / NCAGE code. */
  cage: string;
  /** Registered NAICS codes from SAM.gov Assertions, primary first. */
  naics: { code: string; label: string; primary?: boolean }[];
  /** Product Service Codes the company is registered under. */
  psc: { code: string; label: string }[];
  email: string;
  /** City and state only. The street address is public in SAM.gov; it is also
   *  a home, and a capability statement needs the geography, not the door. */
  location: { city: string; state: string; congressionalDistrict: string };
  /** SAM.gov registration, as the record reads. */
  sam: { status: string; purpose: string };
  /** Who a contracting officer actually reaches. */
  poc: { name: string; title: string; email: string };
};

/**
 * The argument a capability statement makes, as opposed to the identifiers it
 * carries. Competencies say what we do, differentiators say why us, and
 * experience is deliberately not called past performance — that is a term of
 * art for federal contracts, and ours is commercial.
 */
export type CapabilityProfile = {
  competencies: { title: string; detail: string }[];
  differentiators: { title: string; body: string }[];
  experience: {
    name: string;
    role: string;
    /** Marks work done by the founder before the company, not company work. */
    priorToCompany?: boolean;
    body: string;
    to?: string;
  }[];
};

export type Review = {
  author: string;
  /** Their position at `org`, e.g. "Owner". Rendered before the org name. */
  role?: string;
  /** Where the reviewer works, when they named it themselves. */
  org?: string;
  /** Links the org name, so the reference can be checked rather than taken. */
  orgUrl?: string;
  /** App Store reviews carry a headline; Google reviews don't. */
  title?: string;
  /**
   * What was reviewed, when the review is about a product rather than the
   * studio. On a product page this is obvious from context; on the homepage,
   * where both kinds sit in one grid, it is the difference between attribution
   * and an implication that an App Store user was a client.
   */
  product?: { name: string; slug: string };
  /** Reviewer standing as the source shows it, e.g. "Local Guide · 94 reviews" */
  credential?: string;
  /** Where it was left, e.g. "Google Review" */
  source: string;
  /**
   * The listing the rating sits on, when the source is not a household name.
   * Google and the App Store need no introduction; a maker directory does, and
   * the cheapest way to answer "what is that?" is to make the label itself the
   * answer. Only rendered where a link is appropriate — never in the homepage
   * rail, whose cards are deliberately free of anything focusable.
   */
  sourceUrl?: string;
  /** ISO date the review was posted, when the source shows one. */
  date?: string;
  /** Human label for display, e.g. "July 2026" */
  dateLabel?: string;
  /** Stars out of five. */
  rating: number;
  /**
   * What they wrote, in full. Optional because plenty of people rate without
   * writing anything, and those ratings are still real: they count toward the
   * total and the average, they just have no card to fill. Modelling them as
   * reviews with an empty quote would be the lie — modelling them as ratings
   * without a review is what actually happened.
   */
  quote?: string;
  /**
   * The sharpest sentence of `quote`, for the compact rail on the homepage,
   * where a full review is too much text to take in going past.
   *
   * Must be an exact substring of `quote` — a test enforces it. Excerpting is
   * only honest if the words are unaltered and the whole thing is reachable, so
   * the rail links to the page that prints every review in full.
   */
  excerpt?: string;
};

export type Milestone = {
  /** Human period label, e.g. "October 2025" or "In progress" — not an ISO date. */
  period: string;
  title: string;
  description: string;
  /** Links the entry to the thing it produced. */
  productSlug?: string;
  fieldNoteSlug?: string;
  /** Marks the entry as ongoing rather than finished. */
  current?: boolean;
};

export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  /** Search-tuned meta description (~155 chars); falls back to `summary` when absent. */
  seoDescription?: string;
  /** Topic keywords emitted in the Article structured data. */
  keywords?: string[];
  productSlug?: string;
  serviceSlugs: string[];
  /** ISO date, e.g. "2026-06-30" */
  date: string;
  readingTimeMinutes: number;
  overview: string[];
  /** Rendered in order: Problem, Challenge, Solution, Technical Implementation, Results, Lessons Learned */
  sections: ContentSection[];
  relatedFieldNoteSlugs: string[];
};

export type FieldNote = {
  slug: string;
  title: string;
  summary: string;
  /** Search-tuned meta description (~155 chars); falls back to `summary` when absent. */
  seoDescription?: string;
  /** Topic keywords emitted in the Article structured data. */
  keywords?: string[];
  date: string;
  readingTimeMinutes: number;
  categories: string[];
  tags: string[];
  /** Standfirst paragraphs above the body, for longer notes that need a lede. */
  overview?: string[];
  sections: ContentSection[];
  relatedFieldNoteSlugs: string[];
  relatedProductSlugs: string[];
  relatedServiceSlugs: string[];
};
