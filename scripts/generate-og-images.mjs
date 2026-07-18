/**
 * Generates branded 1200×630 Open Graph images (one per page) into public/og/.
 *
 * Static section images plus one image per content item (service, product,
 * case study, insight) are rendered from a shared SVG template and rasterized
 * to PNG with @resvg/resvg-js. Content is read from the same src/content data
 * that drives the routes, so social cards can never drift from the site.
 *
 * Run manually after changing page titles or adding content:
 *   pnpm run og
 */
import { build } from "esbuild";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = path.join(root, "public", "og");

// Athena emblem, embedded as a data URI so resvg can rasterize it into each card.
const LOGO_HREF = `data:image/png;base64,${readFileSync(path.join(root, "public", "favicon.png")).toString("base64")}`;

// ── Load the pure-data content module (bundled so Node can read the TS source) ──
const tmpDir = path.join(root, "node_modules", ".tmp");
mkdirSync(tmpDir, { recursive: true });
const bundled = path.join(tmpDir, "content-for-og.mjs");

await build({
  entryPoints: [path.join(root, "src", "content", "index.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundled,
  logLevel: "silent",
});

const { services, products, caseStudies, insights } = await import(pathToFileURL(bundled).href);

// ── SVG template ──────────────────────────────────────────────────────────────
const WIDTH = 1200;
const HEIGHT = 630;
const FONT_STACK = "Helvetica Neue, Helvetica, Arial, sans-serif";

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Greedy word-wrap by approximate glyph width; caps line count with an ellipsis. */
const wrapTitle = (title, { maxChars = 26, maxLines = 3 } = {}) => {
  const words = title.trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines) {
    const consumed = lines.join(" ").split(/\s+/).length;
    if (consumed < words.length) {
      lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]?$/, "")}…`;
    }
  }
  return lines;
};

const buildSvg = ({ eyebrow, title, subtitle }) => {
  const titleLines = wrapTitle(title);
  const lineHeight = 82;
  const titleTop = 250;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="90" y="${titleTop + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const titleBottom = titleTop + (titleLines.length - 1) * lineHeight;
  const dividerY = titleBottom + 44;

  const subtitleMarkup = subtitle
    ? `<text x="90" y="${dividerY + 52}" font-family="${FONT_STACK}" font-size="30" font-weight="400" fill="#a8b3c4">${escapeXml(
        subtitle
      )}</text>`
    : "";

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f2ca73" />
      <stop offset="100%" stop-color="#dc9b30" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="0%" r="75%">
      <stop offset="0%" stop-color="#e6b34d" stop-opacity="0.16" />
      <stop offset="70%" stop-color="#e6b34d" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0c10" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)" />
  <rect x="40" y="40" width="${WIDTH - 80}" height="${HEIGHT - 80}" fill="none" stroke="#ffffff" stroke-opacity="0.06" />

  <!-- Brand mark + eyebrow -->
  <image href="${LOGO_HREF}" x="90" y="58" width="104" height="104" />
  <rect x="216" y="97" width="3" height="26" fill="url(#gold)" />
  <text x="234" y="118" font-family="${FONT_STACK}" font-size="24" font-weight="600" letter-spacing="4" fill="#cbb27a">${escapeXml(
    eyebrow.toUpperCase()
  )}</text>

  <!-- Title -->
  <text font-family="${FONT_STACK}" font-size="66" font-weight="800" letter-spacing="-1.5" fill="#ffffff">${titleTspans}</text>

  <!-- Divider -->
  <rect x="90" y="${dividerY}" width="96" height="3" fill="url(#gold)" fill-opacity="0.55" />
  ${subtitleMarkup}

  <!-- Wordmark -->
  <text x="90" y="566" font-family="${FONT_STACK}" font-size="26" font-weight="700" letter-spacing="5" fill="url(#gold)">ATHENA DATA LABS</text>

  <!-- Motto -->
  <text x="${WIDTH - 90}" y="566" text-anchor="end" font-family="${FONT_STACK}" font-size="22" font-weight="400" letter-spacing="1" fill="#8794a6">Wisdom through data.</text>
</svg>`;
};

const renderPng = (svg) => {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
    font: { loadSystemFonts: true, defaultFontFamily: "Helvetica Neue" },
    background: "#0a0c10",
  });
  return resvg.render().asPng();
};

const writeImage = (relativePath, spec) => {
  const outPath = path.join(OUT_ROOT, relativePath);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderPng(buildSvg(spec)));
};

// ── Static section cards ────────────────────────────────────────────────────
const staticCards = [
  ["services.png", { eyebrow: "Services", title: "Six Disciplines, One Delivery Standard" }],
  ["products.png", { eyebrow: "Products", title: "Live Products & Proof of Delivery" }],
  ["resources.png", { eyebrow: "Resources", title: "Field Notes from Production" }],
  ["case-studies.png", { eyebrow: "Case Studies", title: "How We Design, Build & Ship" }],
  ["insights.png", { eyebrow: "Insights", title: "Technical Articles from Production" }],
  ["aletheia.png", { eyebrow: "Manifesto", title: "Aletheia", subtitle: "Truth revealed through data." }],
  ["about.png", { eyebrow: "About", title: "Built on Delivery, Not Slides" }],
  ["contact.png", { eyebrow: "Contact", title: "Let's Talk About Your Data" }],
  ["privacy.png", { eyebrow: "Legal", title: "Privacy Policy" }],
  ["terms.png", { eyebrow: "Legal", title: "Terms of Use" }],
];

for (const [file, spec] of staticCards) writeImage(file, spec);

// ── Content-item cards ──────────────────────────────────────────────────────
for (const s of services) writeImage(`services/${s.slug}.png`, { eyebrow: "Service", title: s.name });
for (const p of products.filter((p) => !p.comingSoon))
  writeImage(`products/${p.slug}.png`, { eyebrow: "Product", title: p.name, subtitle: p.tagline });
for (const c of caseStudies) writeImage(`case-studies/${c.slug}.png`, { eyebrow: "Case Study", title: c.title });
for (const i of insights) writeImage(`insights/${i.slug}.png`, { eyebrow: "Insight", title: i.title });

const total =
  staticCards.length + services.length + products.length + caseStudies.length + insights.length;
console.log(`og images: ${total} PNGs written to public/og/`);
