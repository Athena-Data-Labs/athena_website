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

export type ProductLink = {
  label: string;
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
   * Pre-launch status. Cards carry a "Coming Soon" chip and the product stays
   * out of the footer's shipped list, but it keeps a full detail page so the
   * launch list has somewhere to live.
   */
  comingSoon?: boolean;

  /**
   * Where the product came from, including any relationship a reader deserves
   * to know about. Disclosed on the detail page, not buried in an FAQ.
   */
  provenance?: { label: string; paragraphs: string[] };
  /** Key into the icon map in content-icons.ts */
  icon: string;
  tagline: string;
  summary: string;
  overview: string[];
  problem: string[];
  features: { title: string; description: string }[];
  technologies: string[];
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
