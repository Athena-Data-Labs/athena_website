/**
 * Generates public/sitemap.xml from the same content data that drives the routes
 * (src/content), so the sitemap can never drift from the actual site structure.
 *
 * Runs automatically before every build via the "prebuild" npm script.
 * The content files are pure data (no image/browser imports), bundled with
 * esbuild so this script can import them under Node.
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://athenadatalabs.com";
const today = new Date().toISOString().slice(0, 10);

/**
 * When each page last actually changed.
 *
 * This used to stamp today's date on all 32 URLs, which meant a CSS tweak told
 * Google that every page on the site had changed. Google's documented response
 * to a lastmod that does not correlate with real edits is to stop believing the
 * field at all, and losing it is worth more than the convenience: it is the one
 * signal a small site has for saying "this one, actually, is new".
 *
 * Dated content carries its own date and that is the honest answer. Everything
 * else is dated by the last commit that touched the files it is rendered from.
 */
const gitDate = (...files) => {
  const dates = files
    .map((f) => {
      try {
        return execFileSync("git", ["log", "-1", "--format=%cs", "--", f], {
          cwd: root,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
      } catch {
        return "";
      }
    })
    .filter(Boolean);
  // No git history (a fresh clone with none, or a file never committed) leaves
  // today as the only date we can honestly claim.
  return dates.sort().pop() ?? today;
};

/** A page rendered from a component plus the content files it draws on. */
const pageDate = (component, ...content) => gitDate(component, ...content);

const CONTENT = {
  services: "src/content/services.ts",
  products: "src/content/products.ts",
  caseStudies: "src/content/case-studies.ts",
  fieldNotes: "src/content/field-notes.ts",
  milestones: "src/content/milestones.ts",
  certifications: "src/content/certifications.ts",
};

// Amplify resolves /about to about/index.html and 301s to /about/. Listing the
// slashless form here would point Google at a URL that immediately redirects,
// and the page it lands on would then claim a canonical that redirects too.
// Everything agrees on the form actually served instead.
const canonicalPath = (route) => (route === "/" ? "/" : `${route}/`);

// Bundle the pure-data content module so Node can import the TypeScript source.
const outDir = path.join(root, "node_modules", ".tmp");
mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "content-for-sitemap.mjs");

await build({
  entryPoints: [path.join(root, "src", "content", "index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: outFile,
  logLevel: "silent",
});

const { services, products, caseStudies, fieldNotes } = await import(pathToFileURL(outFile).href);

/** [path, changefreq, priority, lastmod] */
const staticRoutes = [
  // The homepage pulls from nearly everything, so it moves when any of it does.
  ["/", "weekly", "1.0", gitDate("src/pages/Index.tsx", CONTENT.services, CONTENT.products, "src/content/reviews.ts")],
  ["/services", "monthly", "0.9", pageDate("src/pages/services/ServicesIndex.tsx", CONTENT.services)],
  // The products index also carries the build log, so a new milestone is a real
  // change to the page even when no product copy moved.
  ["/products", "monthly", "0.9", pageDate("src/pages/products/ProductsIndex.tsx", CONTENT.products, CONTENT.milestones)],
  ["/resources", "weekly", "0.8", gitDate("src/pages/resources/ResourcesIndex.tsx", CONTENT.fieldNotes, CONTENT.caseStudies)],
  ["/resources/case-studies", "weekly", "0.7", pageDate("src/pages/resources/CaseStudiesIndex.tsx", CONTENT.caseStudies)],
  ["/resources/field-notes", "weekly", "0.7", pageDate("src/pages/resources/FieldNotesIndex.tsx", CONTENT.fieldNotes)],
  ["/aletheia", "monthly", "0.6", gitDate("src/pages/Aletheia.tsx")],
  ["/about", "monthly", "0.6", gitDate("src/pages/About.tsx", "src/components/FounderSection.tsx", CONTENT.certifications)],
  ["/contact", "monthly", "0.6", gitDate("src/pages/Contact.tsx")],
  ["/privacy", "yearly", "0.3", gitDate("src/pages/Privacy.tsx")],
  ["/terms", "yearly", "0.3", gitDate("src/pages/Terms.tsx")],
];

// Services and products have no publication date of their own, so they move with
// the file that describes them. Case studies and field notes do, and an article's
// own date is a better claim than the commit that reworded a neighbour's.
const servicesDate = pageDate("src/pages/services/ServiceDetail.tsx", CONTENT.services);
const productsDate = pageDate("src/pages/products/ProductDetail.tsx", CONTENT.products);

const dynamicRoutes = [
  ...services.map((s) => [`/services/${s.slug}`, "monthly", "0.8", servicesDate]),
  ...products.map((p) => [`/products/${p.slug}`, "monthly", "0.8", productsDate]),
  ...caseStudies.map((c) => [`/resources/case-studies/${c.slug}`, "monthly", "0.7", c.date]),
  ...fieldNotes.map((i) => [`/resources/field-notes/${i.slug}`, "monthly", "0.7", i.date]),
];

const urls = [...staticRoutes, ...dynamicRoutes]
  .map(
    ([route, changefreq, priority, lastmod]) => `  <url>
    <loc>${ORIGIN}${canonicalPath(route)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(path.join(root, "public", "sitemap.xml"), xml);
console.log(`sitemap.xml: ${staticRoutes.length + dynamicRoutes.length} URLs written`);
