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
  relatedProductSlugs: string[];
  relatedCaseStudySlugs: string[];
  relatedInsightSlugs: string[];
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
   * Teaser mode: renders as a non-clickable "coming soon" card on the products
   * index and is excluded from the homepage grid, footer, sitemap, and OG set.
   */
  comingSoon?: boolean;
  /** Key into the icon map in content-icons.ts */
  icon: string;
  tagline: string;
  summary: string;
  overview: string[];
  problem: string[];
  features: { title: string; description: string }[];
  technologies: string[];
  pricing?: string;
  faq: { question: string; answer: string }[];
  links: ProductLink[];
  relatedServiceSlugs: string[];
  relatedCaseStudySlugs: string[];
  relatedInsightSlugs: string[];
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
  relatedInsightSlugs: string[];
};

export type Insight = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  readingTimeMinutes: number;
  categories: string[];
  tags: string[];
  sections: ContentSection[];
  relatedInsightSlugs: string[];
  relatedProductSlugs: string[];
  relatedServiceSlugs: string[];
};
