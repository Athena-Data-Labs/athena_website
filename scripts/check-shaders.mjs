/**
 * Guards the one mistake this file's shape invites.
 *
 * fieldShaders.ts holds GLSL inside template literals, and GLSL comments are
 * prose — so writing a uniform name the way you would in any other comment,
 * wrapped in backticks, silently ends the string and turns the rest of the
 * shader into TypeScript. It has happened three times. Twice esbuild caught it
 * with a parse error pointing at a word in the middle of a sentence; once the
 * result still parsed, compiled to invalid GLSL at runtime, and fell back to
 * the CSS plane with no error anywhere — three rounds of measurements were
 * taken off that fallback before anyone noticed.
 *
 * Two checks, both cheap:
 *   1. Backticks are balanced against the template-literal openers.
 *   2. Every declared uniform is written to at least once by the renderer.
 *      A `gl.uniform*` call with a null location is a silent no-op, so a
 *      uniform nobody sets reads as 0 and the effect just quietly does nothing.
 *
 * Runs in prebuild. Exits non-zero on failure.
 */
import { readFileSync } from "node:fs";

const SHADERS = "src/components/hero/fieldShaders.ts";
const RENDERER = "src/components/hero/FieldRenderer.ts";

const shaders = readFileSync(SHADERS, "utf8");
const renderer = readFileSync(RENDERER, "utf8");
const problems = [];

/* 1 — backtick balance */
const openers = shaders.match(/export const \w+ = `/g) ?? [];
const ticks = (shaders.match(/`/g) ?? []).length;
if (ticks !== openers.length * 2) {
  problems.push(
    `${SHADERS}: ${ticks} backticks for ${openers.length} template literals ` +
      `(expected ${openers.length * 2}). A backtick in a GLSL comment ends the string.`,
  );
  shaders.split("\n").forEach((line, i) => {
    if (line.includes("`") && !line.includes("export const") && !line.trim().endsWith("}`;")) {
      problems.push(`  ${SHADERS}:${i + 1}  ${line.trim().slice(0, 90)}`);
    }
  });
}

/* 2 — every uniform is written somewhere */
const declared = new Set(
  [...shaders.matchAll(/^\s*uniform\s+\w+\s+(u\w+)\s*(?:\[\s*\d+\s*\])?\s*;/gm)].map((m) => m[1]),
);
const written = new Set([...renderer.matchAll(/U\("(u\w+)"\)/g)].map((m) => m[1]));
for (const name of declared) {
  if (!written.has(name)) {
    problems.push(
      `${SHADERS}: uniform ${name} is declared but never set in ${RENDERER}. ` +
        `It will read as 0 at runtime, silently.`,
    );
  }
}

if (problems.length) {
  console.error("shader check failed:\n" + problems.join("\n"));
  process.exit(1);
}
console.log(`shader check: ${openers.length} shaders, ${declared.size} uniforms, all set`);
