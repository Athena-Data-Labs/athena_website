/**
 * Legacy URL map for the Insights → Field Notes reorganisation.
 *
 * Every one of these paths is indexed in Google, so none of them may 404. These
 * are client-side redirects, which crawlers follow but score as soft; the
 * matching 301s belong in the host's rewrite rules as well.
 */

/** Case-study slugs whose article is now a field note. */
export const CASE_STUDY_TO_FIELD_NOTE: Record<string, string> = {
  "privacy-first-architecture-security": "privacy-first-architecture-security",
  "search-console-indexing-fix": "search-console-indexing-fix",
  // Merged into the playbook it duplicated.
  "per-route-seo-react": "react-spa-seo-best-practices",
};

/** Field-note slugs that were folded into another note. */
export const FIELD_NOTE_ALIASES: Record<string, string> = {
  "per-route-seo-react": "react-spa-seo-best-practices",
};

export const resolveFieldNoteSlug = (slug: string) => FIELD_NOTE_ALIASES[slug] ?? slug;
