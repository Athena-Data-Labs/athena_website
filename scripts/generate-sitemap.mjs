/**
 * Generates public/sitemap.xml from the same content data that drives the routes
 * (src/content), so the sitemap can never drift from the actual site structure.
 *
 * Runs automatically before every build via the "prebuild" npm script.
 * The content files are pure data (no image/browser imports), bundled with
 * esbuild so this script can import them under Node.
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://athenadatalabs.com";
const today = new Date().toISOString().slice(0, 10);

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

const { services, products, caseStudies, insights } = await import(pathToFileURL(outFile).href);

/** [path, changefreq, priority] */
const staticRoutes = [
  ["/", "weekly", "1.0"],
  ["/services", "monthly", "0.9"],
  ["/products", "monthly", "0.9"],
  ["/resources", "weekly", "0.8"],
  ["/resources/case-studies", "weekly", "0.7"],
  ["/resources/insights", "weekly", "0.7"],
  ["/aletheia", "monthly", "0.6"],
  ["/about", "monthly", "0.6"],
  ["/contact", "monthly", "0.6"],
  ["/privacy", "yearly", "0.3"],
  ["/terms", "yearly", "0.3"],
];

const dynamicRoutes = [
  ...services.map((s) => [`/services/${s.slug}`, "monthly", "0.8"]),
  ...products.map((p) => [`/products/${p.slug}`, "monthly", "0.8"]),
  ...caseStudies.map((c) => [`/resources/case-studies/${c.slug}`, "monthly", "0.7"]),
  ...insights.map((i) => [`/resources/insights/${i.slug}`, "monthly", "0.7"]),
];

const urls = [...staticRoutes, ...dynamicRoutes]
  .map(
    ([route, changefreq, priority]) => `  <url>
    <loc>${ORIGIN}${route}</loc>
    <lastmod>${today}</lastmod>
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
