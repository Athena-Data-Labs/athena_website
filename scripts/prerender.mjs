/**
 * Writes a real HTML file per route into dist/ — that route's own title,
 * description, canonical and Open Graph tags, and the rendered page itself.
 *
 * Why this exists
 * ---------------
 * The site is a client-rendered SPA, so every URL used to serve one identical
 * index.html. Google runs JS and eventually sees what components/Seo.tsx sets,
 * but nothing else does: social scrapers and AI retrieval crawlers read the raw
 * HTML once and never execute anything. Sharing /products/thera showed the
 * homepage title, description and image, and the per-product OG images this
 * repo already generates were unreachable to the only clients that needed them.
 *
 * Fixing the metadata fixed the unfurl and left the deeper half of the problem
 * in place: the body was still `<div id="root"></div>`. Bing, DuckDuckGo, and
 * every crawler behind an AI answer — GPTBot, OAI-SearchBot, PerplexityBot,
 * ClaudeBot — were being served a title and an empty div for twenty-one content
 * pages. So the body is now rendered here too, by running the real React tree
 * in Node (src/entry-server.tsx) and writing the result into the same files.
 *
 * The client still calls createRoot rather than hydrateRoot, deliberately: this
 * markup is a crawler's copy and a faster first paint, not a hydration target.
 * React clears it and mounts normally, so nothing about how the live app
 * behaves depends on what is written here, and a mismatch cannot break a page.
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
import { render as renderApp } from "../dist-ssr/entry-server.js";
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
  add(`/products/${p.slug}`, { title: p.seoTitle ?? `${p.name}: ${p.tagline}`, description: p.seoDescription ?? p.summary, image: `/og/products/${p.slug}.png` });
for (const c of caseStudies)
  add(`/resources/case-studies/${c.slug}`, { title: c.seoTitle ?? c.title, description: c.seoDescription ?? c.summary, image: `/og/case-studies/${c.slug}.png`, ogType: "article" });
for (const f of fieldNotes)
  add(`/resources/field-notes/${f.slug}`, { title: f.seoTitle ?? f.title, description: f.seoDescription ?? f.summary, image: `/og/field-notes/${f.slug}.png`, ogType: "article" });

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

// The mount point, empty. Also the guard against running this script twice
// against one build: route "/" overwrites dist/index.html, which is the file
// `shell` was read from, so a second pass would otherwise nest a rendered
// homepage inside a rendered homepage.
const ROOT_DIV = '<div id="root"></div>';
if (!shell.includes(ROOT_DIV)) {
  fail(
    'dist/index.html has no empty <div id="root"></div>.\n' +
      "  Either the shell changed, or this ran twice on one build — rebuild with `pnpm build` rather than re-running prerender."
  );
}

/**
 * Shortest legitimate page, in extracted characters. Contact is the thinnest
 * route on the site and lands around 2,000; anything under this is a page that
 * rendered a shell and no content, which is precisely the bug being fixed and
 * must not ship quietly.
 */
const MIN_TEXT_CHARS = 900;

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Render one route's body, refusing anything that is not a finished page. */
async function renderBody(routePath) {
  let body;
  try {
    body = await renderApp(canonicalPath(routePath));
  } catch (error) {
    fail(`${routePath} threw while rendering:\n  ${error?.stack ?? error}`);
  }

  // RouteBoundary catches a throwing page and renders an apology, which would
  // otherwise be baked into the file and served to crawlers as the page.
  if (body.includes("This page failed to load")) {
    fail(`${routePath} rendered the RouteBoundary fallback — the page threw. Check the build log above.`);
  }
  // The route-level Suspense fallback. Its presence means a lazy import did not
  // resolve before onAllReady, so the file would ship a blank div.
  if (body.includes('aria-busy="true"')) {
    fail(`${routePath} rendered the Suspense fallback instead of the page.`);
  }
  const chars = textOf(body).length;
  if (chars < MIN_TEXT_CHARS) {
    fail(`${routePath} rendered only ${chars} characters of text (floor is ${MIN_TEXT_CHARS}) — that is not a page.`);
  }
  return body;
}

function render(routePath, meta, body) {
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

  // The page itself. Not a template string: the markup contains `$&` sequences
  // often enough that String.replace would interpret them as the matched text.
  html = html.replace(ROOT_DIV, () => `<div id="root">${body}</div>`);
  return html;
}

let written = 0;
let smallest = Infinity;
for (const [routePath, meta] of routes) {
  const body = await renderBody(routePath);
  smallest = Math.min(smallest, textOf(body).length);
  const out = routePath === "/" ? path.join(dist, "index.html") : path.join(dist, routePath, "index.html");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, render(routePath, meta, body));
  written++;
}
console.log(
  `[prerender] wrote ${written} routes (${staticRoutes.size} static, ${dynamicRoutes.size} from content), ` +
    `thinnest page ${smallest.toLocaleString()} characters of text`
);

/* ------------------------------------------------------- legacy redirects -- */
/**
 * Nothing to write here, and that is the point.
 *
 * This used to emit a meta-refresh stub at every legacy path, because Amplify
 * was answering them with a hard 404. It worked, and it turned out to be the
 * thing standing in the way of the better fix: Amplify serves a file that exists
 * before it evaluates a redirect rule, so a stub at /labs/ meant the 301 for
 * /labs/ could never fire. A 200 carrying a meta refresh outranked the real
 * redirect sitting right behind it.
 *
 * The 301s live in the app's custom rules now — generate them with
 * `node scripts/amplify-redirects.mjs`, which reads the same map in
 * src/lib/redirects.ts that the router does. If those rules are ever lost, these
 * URLs go back to 404 and the fix is to re-run that script, not to put the stubs
 * back.
 */
