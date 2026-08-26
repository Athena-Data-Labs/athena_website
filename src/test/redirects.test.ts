import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fieldNotes, caseStudies, products } from "@/content";
import { legacyRedirects, resolveFieldNoteSlug } from "@/lib/redirects";

const redirects = legacyRedirects(fieldNotes.map((f) => f.slug));
const app = readFileSync("src/App.tsx", "utf8");

/**
 * Amplify answers any path it has no file for with a hard 404, so a route that
 * only exists as a client-side <Navigate> is a 404 to Googlebot — the shell
 * arrives under a 404 status and the redirect inside it never counts. That is
 * how every old Insights URL fell out of the index.
 *
 * The 301s live in Amplify's custom rules, generated from this map by
 * scripts/amplify-redirects.mjs. Nothing in the repo verifies what is actually
 * deployed there, so these tests hold the map itself to the things that make a
 * generated rule correct: it covers what App.tsx forwards, every target is a
 * real page, and no rule shadows one.
 */
describe("legacy redirects", () => {
  const pagePaths = new Set([
    "/products",
    "/resources/field-notes",
    ...products.map((p) => `/products/${p.slug}`),
    ...fieldNotes.map((f) => `/resources/field-notes/${f.slug}`),
    ...caseStudies.map((c) => `/resources/case-studies/${c.slug}`),
  ]);

  it("covers every legacy path App.tsx routes client-side", () => {
    // The literal <Route path="…"> targets that render a redirect rather than a
    // page. Kept as a list because the parameterized one expands below.
    for (const literal of ["/labs", "/resources/insights"]) {
      expect(app, `${literal} should still be routed in App.tsx`).toContain(`path="${literal}"`);
      expect(Object.keys(redirects)).toContain(literal);
    }

    expect(app).toContain('path="/resources/insights/:slug"');
    for (const note of fieldNotes) {
      expect(Object.keys(redirects)).toContain(`/resources/insights/${note.slug}`);
    }
  });

  it("sends every legacy path to a page that exists", () => {
    for (const [from, to] of Object.entries(redirects)) {
      expect(pagePaths, `${from} -> ${to} points at nothing`).toContain(to);
    }
  });

  it("never shadows a live page", () => {
    for (const from of Object.keys(redirects)) {
      expect(pagePaths, `${from} would redirect a real page away from itself`).not.toContain(from);
    }
  });

  it("resolves merged field notes rather than forwarding to themselves", () => {
    expect(resolveFieldNoteSlug("per-route-seo-react")).toBe("react-spa-seo-best-practices");
    expect(redirects["/resources/field-notes/per-route-seo-react"]).toBe(
      "/resources/field-notes/react-spa-seo-best-practices"
    );
  });
});
