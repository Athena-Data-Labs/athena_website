/**
 * Prints the Amplify redirect rules for this app, generated from the same
 * legacy URL map the router and the prerenderer use.
 *
 * Amplify keeps redirects in the console, not the repo, so they are the one
 * piece of routing that can silently drift from the code. Generating them from
 * src/lib/redirects.ts means the drift can always be detected and corrected by
 * re-running this and diffing.
 *
 *   node scripts/amplify-redirects.mjs                 # review
 *   node scripts/amplify-redirects.mjs | aws amplify update-app \
 *     --app-id <id> --profile <p> --custom-rules file:///dev/stdin
 *
 * The prerendered meta-refresh stubs stay regardless: they are what keeps these
 * URLs alive if the console rules are ever lost.
 */
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APEX = "athenadatalabs.com";

const tmp = path.join(root, "node_modules", ".tmp");
mkdirSync(tmp, { recursive: true });

const bundle = async (entry, out) => {
  const outfile = path.join(tmp, out);
  await build({ entryPoints: [path.join(root, entry)], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  return import(pathToFileURL(outfile).href);
};

const { fieldNotes } = await bundle("src/content/index.ts", "content-for-rules.mjs");
const { legacyRedirects } = await bundle("src/lib/redirects.ts", "redirects-for-rules.mjs");

const map = legacyRedirects(fieldNotes.map((f) => f.slug));

/**
 * Exact paths first, wildcards after: Amplify takes the first rule that matches,
 * and /resources/insights/<*> would otherwise swallow the one slug that does not
 * map to itself.
 */
const exact = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));

const rules = [
  // www is a real subdomain on this app, so it serves the whole site a second
  // time under a second hostname. The canonical tags already point home; this
  // stops the duplicate being crawlable at all.
  { source: `https://www.${APEX}/<*>`, target: `https://${APEX}/<*>`, status: "301" },

  // Both forms of every legacy path, so neither has to bounce through Amplify's
  // trailing-slash 301 before it reaches the real one.
  ...exact.flatMap(([from, to]) => [
    { source: from, target: `${to}/`, status: "301" },
    { source: `${from}/`, target: `${to}/`, status: "301" },
  ]),

  // Anything else that was ever under Insights.
  { source: "/resources/insights/<*>", target: "/resources/field-notes/<*>", status: "301" },

  // Unchanged, and it must stay last: it is the SPA fallback, and it answers
  // with a 404 status on purpose so a genuinely dead URL is reported as dead.
  { source: "/<*>", target: "/index.html", status: "404-200" },
];

console.log(JSON.stringify(rules, null, 2));
