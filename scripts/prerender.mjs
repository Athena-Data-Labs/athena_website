/**
 * Writes a real HTML file per route into dist/, with that route's own title,
 * description, canonical and Open Graph tags baked into the served markup.
 *
 * Why this exists
 * ---------------
 * The site is a client-rendered SPA, so every URL used to serve one identical
 * index.html. Google runs JS and eventually sees what components/Seo.tsx sets,
 * but social scrapers do not: Facebook, LinkedIn, Slack and X read the raw HTML
 * once and never execute anything. Sharing /products/thera showed the homepage
 * title, description and image, and the per-product OG images this repo already
 * generates were unreachable to the only clients that needed them.
 *
 * Where the metadata comes from
 * -----------------------------
 * Nowhere new. Static routes are read back out of the <Seo .../> blocks in the
 * page components, and dynamic routes are rebuilt from src/content using the
 * same expressions the detail pages use. Nothing here restates a title or a
 * description, because a second copy of that text would drift from the first.
 *
 * It fails the build rather than guessing. If a page's <Seo> block cannot be
 * parsed, or if the routes found here disagree with the generated sitemap, the
 * build stops — a silently missing route would serve homepage metadata again,
 * which is the exact bug this script exists to remove.
 *
 * Requires the Amplify catch-all rewrite to be "404-200" rather than a plain
 * "200", or these files are never served: a 200 rewrite matches before static
 * resolution and sends every extensionless path to index.html regardless.
 */
import { build } from "esbuild";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ORIGIN = "https://athenadatalabs.com";
const SITE_NAME = "Athena Data Labs";
const DEFAULT_OG = `${ORIGIN}/og-image.png`;

// Amplify serves these as directory indexes and 301s /about to /about/, so the
// canonical, og:url and sitemap all have to name the slashed form. Naming the
// slashless one would advertise a URL that redirects away from itself.
const canonicalPath = (route) => (route === "/" ? "/" : `${route}/`);
const stripSlash = (u) => (u.length > 1 ? u.replace(/\/$/, "") : u);

const fail = (msg) => {
  console.error(`\n[prerender] ${msg}\n`);
  process.exit(1);
};

if (!existsSync(path.join(dist, "index.html"))) fail("dist/index.html not found — run vite build first.");

/* ---------------------------------------------------------------- content -- */
// Same esbuild bundle trick generate-sitemap.mjs uses: the content modules are
// pure data, so Node can import them once they are compiled from TypeScript.
const tmp = path.join(root, "node_modules", ".tmp");
mkdirSync(tmp, { recursive: true });
const bundled = path.join(tmp, "content-for-prerender.mjs");
await build({
  entryPoints: [path.join(root, "src", "content", "index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundled,
  logLevel: "silent",
});
const { services, products, caseStudies, fieldNotes } = await import(pathToFileURL(bundled).href);

// Same trick for the legacy URL map, so the redirects this script writes and the
// ones App.tsx routes can never drift apart.
const bundledRedirects = path.join(tmp, "redirects-for-prerender.mjs");
await build({
  entryPoints: [path.join(root, "src", "lib", "redirects.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundledRedirects,
  logLevel: "silent",
});
const { legacyRedirects } = await import(pathToFileURL(bundledRedirects).href);

/* ------------------------------------------------------------ static pages -- */
/** Pull the literal props back out of a page's <Seo .../> block. */
function readSeoBlocks(file) {
  const src = readFileSync(file, "utf8");
  const blocks = [];
  let i = 0;
  while ((i = src.indexOf("<Seo", i)) !== -1) {
    // Ends at the first line that is only whitespace + "/>", which is how every
    // one of these components is formatted.
    const end = src.slice(i).search(/\n\s*\/>/);
    if (end === -1) fail(`unterminated <Seo> block in ${path.relative(root, file)}`);
    blocks.push(src.slice(i, i + end));
    i += end;
  }
  return blocks;
}

const lit = (block, name) => block.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const flag = (block, name) => new RegExp(`\\b${name}\\b(?!=)`).test(block);

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = path.join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

const staticRoutes = new Map();
for (const file of walk(path.join(root, "src", "pages"))) {
  for (const block of readSeoBlocks(file)) {
    const routePath = lit(block, "path");
    // A templated path means a dynamic route; those are rebuilt from content
    // below. Anything else with no readable literal is a parse failure.
    if (!routePath) {
      if (/\bpath=\{/.test(block)) continue;
      fail(`<Seo> in ${path.relative(root, file)} has no readable path="…"`);
    }
    const title = lit(block, "title");
    const description = lit(block, "description");
    if (!title || !description) {
      fail(`<Seo> for ${routePath} in ${path.relative(root, file)} has a non-literal title/description — this script would emit wrong metadata, so it stops instead.`);
    }
    if (flag(block, "noindex")) continue; // 404 page: never prerendered
    staticRoutes.set(routePath, {
      title: flag(block, "bare") ? title : `${title} | ${SITE_NAME}`,
      description,
      image: lit(block, "image") ?? DEFAULT_OG,
      ogType: lit(block, "ogType") ?? "website",
    });
  }
}

/* ----------------------------------------------------------- dynamic pages -- */
// These mirror the expressions in the detail components exactly.
const dynamicRoutes = new Map();
const add = (p, meta) => dynamicRoutes.set(p, { ogType: "website", ...meta, title: `${meta.title} | ${SITE_NAME}` });

for (const s of services)
  add(`/services/${s.slug}`, { title: `${s.name} Services`, description: s.summary, image: `/og/services/${s.slug}.png` });
for (const p of products)
  add(`/products/${p.slug}`, { title: `${p.name}: ${p.tagline}`, description: p.seoDescription ?? p.summary, image: `/og/products/${p.slug}.png` });
for (const c of caseStudies)
  add(`/resources/case-studies/${c.slug}`, { title: c.title, description: c.seoDescription ?? c.summary, image: `/og/case-studies/${c.slug}.png`, ogType: "article" });
for (const f of fieldNotes)
  add(`/resources/field-notes/${f.slug}`, { title: f.title, description: f.seoDescription ?? f.summary, image: `/og/field-notes/${f.slug}.png`, ogType: "article" });

const routes = new Map([...staticRoutes, ...dynamicRoutes]);

/* ------------------------------------------------------- drift check vs map -- */
const sitemap = readFileSync(path.join(dist, "sitemap.xml"), "utf8");
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => stripSlash(m[1].replace(ORIGIN, "")) || "/"));
const missing = [...sitemapRoutes].filter((r) => !routes.has(r));
const extra = [...routes.keys()].filter((r) => !sitemapRoutes.has(r));
if (missing.length || extra.length) {
  fail(
    `routes disagree with sitemap.xml.\n` +
      (missing.length ? `  in sitemap but not prerendered: ${missing.join(", ")}\n` : "") +
      (extra.length ? `  prerendered but not in sitemap: ${extra.join(", ")}\n` : "") +
      `  Add the page's <Seo> block or update scripts/generate-sitemap.mjs.`
  );
}

/* ------------------------------------------------------------------ emit -- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const shell = readFileSync(path.join(dist, "index.html"), "utf8");

function render(routePath, meta) {
  const url = `${ORIGIN}${canonicalPath(routePath)}`;
  let image = meta.image.startsWith("http") ? meta.image : `${ORIGIN}${meta.image}`;
  // An OG tag pointing at a file that does not exist is worse than the default:
  // the scraper shows nothing at all.
  const localOg = image.replace(ORIGIN, "");
  if (!image.startsWith("http") || (image.startsWith(ORIGIN) && !existsSync(path.join(dist, localOg)))) {
    image = DEFAULT_OG;
  }

  let html = shell;
  const set = (pattern, replacement) => {
    if (!pattern.test(html)) fail(`could not find ${pattern} in dist/index.html — the head template changed.`);
    html = html.replace(pattern, replacement);
  };

  set(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`);
  set(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(meta.description)}" />`);
  set(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(meta.title)}" />`);
  set(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(meta.description)}" />`);
  set(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${esc(url)}" />`);
  set(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${esc(image)}" />`);
  set(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${esc(meta.ogType)}" />`);
  set(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(meta.title)}" />`);
  set(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(meta.description)}" />`);
  set(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${esc(image)}" />`);

  // The canonical is absent from the source template on purpose (see the note in
  // index.html); each prerendered file gets its own, which is the whole point.
  html = html.replace(/<title>/, `<link rel="canonical" href="${esc(url)}" />\n    <title>`);
  return html;
}

let written = 0;
for (const [routePath, meta] of routes) {
  const out = routePath === "/" ? path.join(dist, "index.html") : path.join(dist, routePath, "index.html");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, render(routePath, meta));
  written++;
}
console.log(`[prerender] wrote ${written} routes (${staticRoutes.size} static, ${dynamicRoutes.size} from content)`);

/* ------------------------------------------------------- legacy redirects -- */
/**
 * A page whose only job is to leave. Meta refresh at zero delay is the redirect
 * you can ship in a static file: Google follows it, treats an instant one as
 * permanent, and passes the signals on to the target. The canonical says the
 * same thing a second way, and the script tag makes it instant for a person.
 *
 * Deliberately no `noindex` — it would stop Google consolidating the old URL
 * into the new one, which is the entire point of the exercise.
 */
const redirectStub = (target) => {
  const url = `${ORIGIN}${target}/`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="canonical" href="${esc(url)}" />
    <meta http-equiv="refresh" content="0; url=${esc(url)}" />
    <title>Moved | ${SITE_NAME}</title>
    <script>window.location.replace(${JSON.stringify(url)});</script>
  </head>
  <body>
    <p>This page has moved to <a href="${esc(url)}">${esc(url)}</a>.</p>
  </body>
</html>
`;
};

const redirects = legacyRedirects(fieldNotes.map((f) => f.slug));
let redirected = 0;
for (const [from, to] of Object.entries(redirects)) {
  // A redirect must never sit on top of a real page — that would take a live
  // URL out of the index rather than putting a dead one back into it.
  if (routes.has(from)) fail(`legacy redirect ${from} collides with a real page`);
  if (!routes.has(to)) fail(`legacy redirect ${from} points at ${to}, which is not a prerendered page`);
  const out = path.join(dist, from, "index.html");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, redirectStub(to));
  redirected++;
}
console.log(`[prerender] wrote ${redirected} legacy redirect pages`);
