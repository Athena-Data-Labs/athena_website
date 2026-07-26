/**
 * GLSL for the hero atmosphere.
 *
 * Four passes:
 *   1. FIELD    — raymarched gyroid lattice, accumulated as volumetric glow
 *   2. TRACE    — signal particles advected through an ABC flow, drawn as streaks
 *   3. BLOOM    — bright-pass + separable blur over the two above
 *   4. COMPOSITE— tone map, chromatic aberration, pointer displacement, grain, dither
 *
 * The palette is the site's own: near-black #0a0c10 base, gold hsl(40 75% 60%)
 * key, cool steel in the falloff.
 */

export const FULLSCREEN_VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* ── Pass 1: the lattice ─────────────────────────────────────────────────── */

export const FIELD_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uPointer;    // -1..1, spring-smoothed
uniform float uScroll;     // 0 at rest, 1 once the hero has scrolled away
uniform float uIntro;      // 0..1 boot reveal
uniform int   uSteps;      // adaptive march budget
uniform float uScrollDim;  // how much scrolling drains the field, 0..1

float hash12(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

/* The lattice drifts toward the lens and shears as it comes, so the grid never
   reads as a rigid wireframe box. */
vec3 warp(vec3 p) {
  float t = uTime * 0.06;
  p.z += t * 3.2;
  p.x += 0.11 * sin(p.z * 0.40 + t * 1.6);
  p.y += 0.09 * cos(p.z * 0.33 - t * 1.3);
  return p;
}

const vec3 STRUT_COLOR = vec3(0.19, 0.23, 0.31); // cool steel: the structure
const vec3 NODE_COLOR  = vec3(1.00, 0.72, 0.32); // gold: the activity

/* Held off-axis on purpose. Viewed down one of its own axes the lattice is
   degenerate — every z-strut collapses onto the vanishing point and the x/y
   families stack into a single cross. Obliquely, it reads as a 3D grid. */
const mat3 LATTICE_ROT = mat3(
   0.8830,  0.0995, -0.4589,
   0.0000,  0.9772,  0.2124,
   0.4694, -0.1876,  0.8629
);

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Camera: a slow dolly with parallax the pointer leads by a hair.
  vec3 ro = vec3(uPointer.x * 0.42, uPointer.y * 0.30, -2.6 - uScroll * 1.4);
  vec3 ta = vec3(uPointer.x * 0.12, uPointer.y * 0.08, 1.0);
  vec3 f = normalize(ta - ro);
  vec3 r = normalize(cross(vec3(0.0, 1.0, 0.0), f));
  vec3 u = cross(f, r);
  vec3 rd = normalize(uv.x * r + uv.y * u + 1.45 * f);

  // Boot: the field arrives as a horizon slit that opens vertically.
  float ease = 1.0 - pow(1.0 - clamp(uIntro, 0.0, 1.0), 3.0);
  float aperture = mix(0.012, 2.2, ease);
  float slit = smoothstep(aperture, aperture * 0.35, abs(uv.y));

  /* Fixed-step emissive volume, not sphere tracing. Even steps cover the whole
     depth range, and a per-pixel jitter turns the banding that would cause into
     grain the bloom resolves. The glow kernel is tied to the step size so a
     strand is always sampled across ~2 steps: prefiltering, not luck. */
  const float NEAR_PLANE = 1.50;
  const float FAR_PLANE = 7.6;
  const float CELL = 0.78;

  float stepSize = (FAR_PLANE - NEAR_PLANE) / float(uSteps);
  float k = 1.0 / (stepSize * 0.85);
  float jitter = hash12(gl_FragCoord.xy + fract(uTime) * 137.0);
  float t = NEAR_PLANE + jitter * stepSize;

  vec3 acc = vec3(0.0);

  for (int i = 0; i < 128; i++) {
    if (i >= uSteps) break;
    vec3 w = LATTICE_ROT * warp(ro + rd * t);

    // Repeating lattice: the three cylinder families are the edges of the cell,
    // the sphere at the corner is its node.
    vec3 id = floor(w / CELL + 0.5);
    vec3 q = w - id * CELL;
    float strut = min(min(length(q.yz), length(q.xz)), length(q.xy));
    float node = length(q);

    // Each node keeps its own phase, so the network fires unevenly the way a
    // real one does rather than blinking in unison.
    float phase = hash13(id);
    float pulse = 0.22 + 0.78 * pow(0.5 + 0.5 * sin(uTime * 1.35 + phase * 6.2831), 4.0);

    float strutGlow = exp(-strut * k);
    float nodeGlow = exp(-node * k * 2.0) * pulse;
    float depth = exp(-(t - NEAR_PLANE) * 0.95);

    acc += (STRUT_COLOR * strutGlow * 0.60 + NODE_COLOR * nodeGlow * 2.6) * depth * stepSize;
    t += stepSize;
  }

  // Shaping the integrated result rather than each sample: the wide kernel is
  // what keeps the march stable, this is what makes the cores read as thin.
  acc = pow(max(acc * 12.0, 0.0), vec3(1.30)) * 0.85;

  acc *= mix(0.2, 1.0, ease) * (1.0 - 0.55 * uScroll * uScrollDim);
  acc += vec3(0.014, 0.023, 0.040) * slit * 0.3 * ease; // faint volumetric wash
  acc *= slit;

  fragColor = vec4(acc, 1.0);
}`;

/* ── Pass 2: signal traces ───────────────────────────────────────────────── */

export const TRACE_VERT = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in float aAlpha;

uniform vec3  uOrigin;
uniform mat3  uBasis;      // columns: right, up, forward
uniform float uAspect;
uniform float uFocal;

out float vAlpha;
out float vDepth;

void main() {
  vec3 rel = aPos - uOrigin;
  vec3 cam = vec3(dot(rel, uBasis[0]), dot(rel, uBasis[1]), dot(rel, uBasis[2]));
  float z = max(cam.z, 0.06);

  vec2 plane = vec2(uFocal * cam.x / z, uFocal * cam.y / z);
  gl_Position = vec4(plane.x * 2.0 / uAspect, plane.y * 2.0, 0.0, 1.0);

  vAlpha = aAlpha * smoothstep(0.05, 0.5, cam.z);
  vDepth = z;
}`;

export const TRACE_FRAG = `#version 300 es
precision highp float;

in float vAlpha;
in float vDepth;
out vec4 fragColor;

uniform float uFade;

void main() {
  // Far traces cool toward steel, near ones burn to gold-white.
  float near = 1.0 - smoothstep(0.6, 5.5, vDepth);
  vec3 col = mix(vec3(0.30, 0.42, 0.58), vec3(1.0, 0.82, 0.46), near);
  col = mix(col, vec3(1.0, 0.95, 0.86), pow(near, 3.0) * 0.7);
  fragColor = vec4(col * vAlpha * uFade * (0.5 + near * 1.4), 1.0);
}`;

/* ── Pass 3: bloom ───────────────────────────────────────────────────────── */

export const BRIGHT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uScene;
uniform float uThreshold;
void main() {
  vec3 c = texture(uScene, vUv).rgb;
  float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float k = smoothstep(uThreshold, uThreshold + 0.35, lum);
  fragColor = vec4(c * k, 1.0);
}`;

export const BLUR_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSource;
uniform vec2 uDirection;   // texel-sized step along one axis

/* 9-tap gaussian collapsed to 5 linear-filtered samples. */
const float O[3] = float[3](0.0, 1.3846153846, 3.2307692308);
const float W[3] = float[3](0.2270270270, 0.3162162162, 0.0702702703);

void main() {
  vec3 sum = texture(uSource, vUv).rgb * W[0];
  for (int i = 1; i < 3; i++) {
    sum += texture(uSource, vUv + uDirection * O[i]).rgb * W[i];
    sum += texture(uSource, vUv - uDirection * O[i]).rgb * W[i];
  }
  fragColor = vec4(sum, 1.0);
}`;

/* ── Pass 4: composite ───────────────────────────────────────────────────── */

export const COMPOSITE_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uScene;
uniform sampler2D uBloomA;
uniform sampler2D uBloomB;
uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uPointerPx;    // pointer in uv space
uniform float uRipple;       // pointer speed, decayed
uniform float uScroll;
uniform float uIntro;
uniform float uCopyGuard;    // 1 = protect the left column, 0 = uniform (mobile)
uniform float uScrollDim;    // how much scrolling drains the field, 0..1
uniform float uIntensity;    // page-level exposure

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

/* Filmic curve — keeps the gold from clipping to flat yellow in the hot cores. */
vec3 tonemap(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 uv = vUv;
  vec2 centered = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  // Pointer displacement: a slow lens bulge that only shows while moving.
  vec2 toPointer = uv - uPointerPx;
  toPointer.x *= uResolution.x / uResolution.y;
  float ring = exp(-dot(toPointer, toPointer) * 22.0);
  vec2 displace = normalize(toPointer + 1e-5) * ring * uRipple * 0.012;
  uv -= displace;

  // Chromatic aberration grows toward the edges and with pointer energy.
  float r2 = dot(centered, centered);
  vec2 dir = centered * (0.0007 + r2 * 0.0028 + uRipple * 0.0012);

  /* The sharp layer gets only a trace of the split — a one-pixel-wide streak
     separated into full RGB reads as a rainbow sliver, not as a lens. The
     visible aberration lives in the bloom, where it lands on soft edges. */
  vec2 sharp = dir * 0.3;
  vec3 scene = vec3(
    texture(uScene, uv + sharp).r,
    texture(uScene, uv).g,
    texture(uScene, uv - sharp).b
  );
  vec3 bloom = vec3(
    texture(uBloomA, uv + dir * 2.2).r,
    texture(uBloomA, uv).g,
    texture(uBloomA, uv - dir * 2.2).b
  );
  bloom += texture(uBloomB, uv).rgb * 0.75;

  vec3 col = scene + bloom * 0.55;

  // Single warm key at the top edge, matching the rest of the site.
  float key = exp(-pow((uv.y - 1.0) * 2.1, 2.0)) * exp(-pow(centered.x * 0.9, 2.0));
  col += vec3(0.85, 0.66, 0.32) * key * 0.055 * (1.0 - uScroll * 0.6);

  col = tonemap(col * 1.15);

  // Art direction: hold the left column back so the headline always wins.
  float guard = mix(0.42, mix(0.10, 1.0, smoothstep(0.30, 0.74, vUv.x)), uCopyGuard);
  col *= guard;

  // Vignette, biased slightly high to sit under the navbar.
  float vig = smoothstep(1.60, 0.45, length(centered * vec2(0.92, 1.05) + vec2(0.0, 0.06)));
  col *= 0.52 + 0.48 * vig;

  col *= 1.0 - uScroll * 0.75 * uScrollDim;
  col *= uIntensity;

  vec3 base = vec3(0.039, 0.047, 0.063); // #0a0c10
  col += base * (1.0 - smoothstep(0.0, 0.5, length(col)));

  // Grain and an ordered dither: both keep the near-black falloff from banding.
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 431.71) - 0.5;
  col += grain * 0.020;
  col += (hash(gl_FragCoord.xy * 1.7) - 0.5) / 255.0;

  col *= clamp(uIntro * 1.4, 0.0, 1.0);

  fragColor = vec4(col, 1.0);
}`;
