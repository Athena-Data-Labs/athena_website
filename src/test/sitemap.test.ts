import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { caseStudies, fieldNotes } from "@/content";

const xml = readFileSync("public/sitemap.xml", "utf8");
const entries = [...xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(
  ([, loc, lastmod]) => ({ path: loc.replace("https://athenadatalabs.com", ""), lastmod })
);

/**
 * lastmod used to be today's date on all 32 URLs, so a CSS tweak announced that
 * every page had changed. Google's documented answer to a lastmod that does not
 * track real edits is to stop reading the field, and a small site cannot spare
 * it. These tests are here because the failure is invisible: a sitemap full of
 * today's date looks perfectly healthy right up until it counts for nothing.
 */
describe("sitemap lastmod", () => {
  it("has an entry for every URL", () => {
    expect(entries.length).toBe(xml.match(/<loc>/g)?.length);
    expect(entries.length).toBeGreaterThan(20);
  });

  it("is a real ISO date, never in the future", () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const { path, lastmod } of entries) {
      expect(lastmod, `${path} has a malformed lastmod`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(lastmod.localeCompare(today), `${path} is dated in the future`).toBeLessThanOrEqual(0);
    }
  });

  it("does not stamp one date across the whole site", () => {
    const distinct = new Set(entries.map((e) => e.lastmod));
    expect(distinct.size, "every URL sharing a lastmod is the bug this replaced").toBeGreaterThan(3);
  });

  it("dates each article by its own publication date", () => {
    for (const item of [...caseStudies, ...fieldNotes]) {
      const kind = caseStudies.includes(item as never) ? "case-studies" : "field-notes";
      const entry = entries.find((e) => e.path === `/resources/${kind}/${item.slug}/`);
      expect(entry, `${item.slug} missing from the sitemap`).toBeDefined();
      expect(entry!.lastmod).toBe(item.date);
    }
  });
});
