/**
 * Legacy URL map for the Insights to Field Notes reorganization.
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

/**
 * Every legacy path that must not 404, mapped to where the page lives now.
 *
 * The app already routes these client-side, and for a person that works fine.
 * For Googlebot it did not: Amplify answers any path it has no file for with a
 * hard 404, so the SPA shell arrived under a 404 status and the redirect inside
 * it never counted. Search Console reported the lot as "Not found (404)" and
 * dropped them, which is exactly what the note at the top of this file says must
 * never happen.
 *
 * `scripts/prerender.mjs` reads this and writes a redirecting page at each path,
 * so the status is a redirect rather than a 404. A server-side 301 in the
 * Amplify console is still the better answer; this is the half that lives in the
 * repo and cannot drift away from the routes above.
 */
export const legacyRedirects = (fieldNoteSlugs: string[]): Record<string, string> => {
  const map: Record<string, string> = {
    "/labs": "/products",
    "/resources/insights": "/resources/field-notes",
  };

  // Insights was the old home of every field note, plus the slugs that have
  // since been merged into another note.
  const insightSlugs = new Set([
    ...fieldNoteSlugs,
    ...Object.keys(FIELD_NOTE_ALIASES),
    ...Object.keys(CASE_STUDY_TO_FIELD_NOTE),
  ]);
  for (const slug of insightSlugs) {
    map[`/resources/insights/${slug}`] = `/resources/field-notes/${resolveFieldNoteSlug(slug)}`;
  }

  // Three write-ups moved out of case studies entirely.
  for (const [from, to] of Object.entries(CASE_STUDY_TO_FIELD_NOTE)) {
    map[`/resources/case-studies/${from}`] = `/resources/field-notes/${to}`;
  }

  // And one field note absorbed another, so its own old URL needs forwarding.
  for (const [from, to] of Object.entries(FIELD_NOTE_ALIASES)) {
    map[`/resources/field-notes/${from}`] = `/resources/field-notes/${to}`;
  }

  return map;
};
