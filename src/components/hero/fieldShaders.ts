/**
 * GLSL for the hero atmosphere: a heavy-ion collision, drawn the way a detector
 * draws one.
 *
 * Four passes:
 *   1. FIREBALL  — the luminous region: ignition at the vertex, then the
 *                  expanding shell that radial flow makes of it
 *   2. TRACKS    — charged tracks as helices in a solenoidal field, drawn as
 *                  polylines growing outward from the vertex
 *   3. BLOOM     — bright-pass + separable blur over the two above
 *   4. COMPOSITE — tone map, chromatic aberration, pointer displacement, grain
 *
 * Everything that was a raymarched volume is now line geometry, and that is the
 * whole point of the change rather than a side effect of it. A volume has no
 * edges: on black it reads as atmosphere, and on paper it can only ever be a
 * stain, which is what made the light theme a fight. Curves have edges. They
 * ink.
 *
 * The palette is the site's own: near-black #0a0c10 base, gold hsl(40 75% 60%)
 * on the hard tracks, cool steel on the soft ones.
 */

export const FULLSCREEN_VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/* ── Pass 1: the luminous region ─────────────────────────────────────────── */

export const FIREBALL_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uResolution;
uniform float uScroll;     // 0 at rest, 1 once the hero has scrolled away
uniform float uIntro;      // 0..1 boot reveal
uniform float uScrollDim;  // how much scrolling drains the field, 0..1
uniform float uPreroll;    // seconds the beams take to arrive before they meet
/**
 * How much of the luminous region to emit. Full on black; held well back on
 * paper, and that is a statement about the medium rather than a fudge.
 *
 * Everything else in this picture is line geometry, which is why it survived the
 * move to a light theme at all. The fireball is the one part that is genuinely a
 * volume, and a volume on paper is a stain — a soft grey blotch with no edge,
 * sitting exactly where the tracks are densest and hardest to read. A printed
 * event display has no glow at its vertex either. The vertex is simply the point
 * all the tracks come from, and it is legible because they do.
 */
uniform float uGlow;
uniform vec4  uEvents[4];  // xy: vertex in plane coords, z: age (negative = empty), w: depth
uniform vec4  uBunches[4]; // the two incoming bunches, in plane coords

const vec3 SOFT_COLOR = vec3(0.19, 0.23, 0.31); // cool steel: the soft spray
const vec3 HARD_COLOR = vec3(1.00, 0.72, 0.32); // gold: where the energy is
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

/**
 * A bunch: a bright head with a short trail behind it along its direction of
 * travel. Drawn as the distance to a segment, so it reads as something moving
 * rather than as a dot that happens to be in a new place each frame.
 */
float bunch(vec2 uv, vec2 head, vec2 dir, float trail, float rad) {
  vec2 seg = -dir * trail;
  vec2 w = uv - head;
  float t = clamp(dot(w, seg) / max(dot(seg, seg), 1e-8), 0.0, 1.0);
  float q = length(w - seg * t) / rad;
  return exp(-q * q) * (1.0 - t * 0.8);
}

void main() {
  /* Plane coordinates, and they have to be exactly the ones the track vertex
     shader writes: it divides camera x and y by depth and scales by focal
     length, which lands in this same centered, height-normalized space. That
     equality is what lets the vertex positions arrive here as two floats
     instead of a second copy of the camera. */
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Boot: the field arrives as a horizon slit that opens vertically.
  float ease = 1.0 - pow(1.0 - clamp(uIntro, 0.0, 1.0), 3.0);
  float aperture = mix(0.012, 2.2, ease);
  float slit = smoothstep(aperture, aperture * 0.35, abs(uv.y));

  vec3 acc = vec3(0.0);
  float warmAcc = 0.0; // warmth, weighted by brightness — see TRACK_FRAG

  for (int i = 0; i < 4; i++) {
    vec4 e = uEvents[i];
    if (e.z < 0.0) continue;

    float age = e.z;
    // Angular size falls with depth like everything else the camera sees.
    float scale = 1.0 / max(e.w, 0.35);
    float r = length(uv - e.xy);
    float t = max(age - uPreroll, 0.0);

    /* The approach. Two bunches run in along the axis from opposite sides and
       meet at the vertex, and the collision is the moment they arrive rather
       than a flash that happens for no visible reason. They brighten as they
       come, which is the squeeze: the beams are focused hardest at the
       crossing point, and it also means the picture is quietly building toward
       something for half a second before it goes off. */
    if (age < uPreroll) {
      vec4 b = uBunches[i];
      float focus = 0.25 + 0.75 * (age / uPreroll);
      float rad = 0.013 * scale;
      float trail = 0.17 * scale;
      vec2 dirA = normalize(e.xy - b.xy + 1e-6);
      vec2 dirB = normalize(e.xy - b.zw + 1e-6);
      float beams = bunch(uv, b.xy, dirA, trail, rad) + bunch(uv, b.zw, dirB, trail, rad);
      vec3 c = HARD_COLOR * beams * focus * 2.6 * uGlow;
      acc += c;
      warmAcc += dot(c, LUMA);
    }

    /* Impact, and then the decay.

       The flash is gated on the arrival, not faded up across the approach. It
       used to ramp over the whole preroll while its own brightness term was
       already at maximum — so the vertex was at half power a third of a second
       before the beams reached it, and the collision looked like the end of
       something that had already happened rather than the start of it. Cause
       has to come after the thing that causes it.

       What is allowed before impact is a small hot point in the last fraction,
       where the two bunches are already overlapping. That is the squeeze, and
       it is a hint rather than a flash. The afterglow keeps the vertex findable
       while the tracks are still being drawn. */
    float fired = smoothstep(uPreroll - 0.04, uPreroll + 0.01, age);
    float squeeze = 0.5 * smoothstep(0.88, 1.0, age / max(uPreroll, 1e-4)) * (1.0 - fired);
    float rad = 0.030 * scale;
    float q = r / rad;
    vec3 core =
      HARD_COLOR * exp(-q * q) * ((0.30 + 2.4 * exp(-t * 1.9)) * fired + squeeze) * uGlow;
    acc += core;
    warmAcc += dot(core, LUMA);

    /* The fireball. Radial flow pushes the medium outward at a good fraction of
       c and it cools as it goes, so: one shell, easing outward, thickening and
       dimming. It is the only part of this that is a volume, it lasts under a
       second, and it is what makes the vertex read as hot rather than as a dot. */
    float ring = 0.62 * scale * (1.0 - exp(-t * 2.4));
    float w = (0.045 + 0.13 * t) * scale;
    float s = (r - ring) / w;
    /* Gated on the arrival, not on a test that the elapsed time is positive.
       That test looked like it meant "after impact" and did not: the elapsed
       time is clamped at zero, so it stayed true for the whole approach, and
       the shell sat at the vertex at full brightness with a radius of zero — a
       hot dot, parked there, for the entire half-second before anything hit it.
       Between this and the flash ramp, the impact point was the first thing to
       appear rather than the last. */
    vec3 shell = mix(SOFT_COLOR, HARD_COLOR, 0.45)
               * exp(-s * s) * exp(-t * 1.6) * fired * 0.55 * uGlow;
    acc += shell;
    warmAcc += 0.5 * dot(shell, LUMA);
  }

  vec3 wash = vec3(0.014, 0.023, 0.040) * slit * 0.30 * ease; // faint volumetric wash
  acc += wash;
  warmAcc += 0.1 * dot(wash, LUMA);

  float gain = mix(0.2, 1.0, ease) * (1.0 - 0.55 * uScroll * uScrollDim) * slit;
  fragColor = vec4(acc * gain, warmAcc * gain);
}`;

/* ── Pass 2: charged tracks ──────────────────────────────────────────────── */

export const TRACK_VERT = `#version 300 es
layout(location = 0) in vec2 aCorner;  // x: 0 at the near end, 1 at the far end; y: which side
layout(location = 1) in vec3 aP0;
layout(location = 2) in vec3 aP1;
layout(location = 3) in vec4 aEnds;    // arc and alpha at each end of the segment
layout(location = 4) in vec2 aStyle;   // warmth, width multiplier

uniform vec3  uOrigin;
uniform mat3  uBasis;      // columns: right, up, forward
uniform float uAspect;
uniform float uFocal;
uniform float uFront;      // how far the spray has travelled, in arc length
uniform float uFade;       // event envelope times the global exposure
uniform float uHalfWidth;  // half the drawn line width, in NDC height units

out float vAlpha;
out float vDepth;
out float vWarm;
out float vSide;

vec3 toCamera(vec3 p) {
  vec3 rel = p - uOrigin;
  return vec3(dot(rel, uBasis[0]), dot(rel, uBasis[1]), dot(rel, uBasis[2]));
}

void main() {
  vec3 c0 = toCamera(aP0);
  vec3 c1 = toCamera(aP1);
  float z0 = max(c0.z, 0.06);
  float z1 = max(c1.z, 0.06);

  vec2 n0 = vec2(uFocal * c0.x / z0 * 2.0 / uAspect, uFocal * c0.y / z0 * 2.0);
  vec2 n1 = vec2(uFocal * c1.x / z1 * 2.0 / uAspect, uFocal * c1.y / z1 * 2.0);

  /* Expand the segment sideways into a quad. The width has to be equal in
     pixels rather than equal in NDC, so the direction is taken in a space where
     x is scaled by the aspect ratio and the offset is scaled back out of it.
     A segment shorter than a pixel has no reliable direction, so fall back to a
     fixed axis rather than normalising something that is nearly zero.

     Segments are not extended past their endpoints to cover the joints. They
     share endpoints exactly, the turn between two of them is about a
     fourteenth of a radian, and the wedge that leaves open on the outside of a
     bend is a fraction of a pixel — whereas overlapping caps under additive
     blending would put a bright bead at all forty joints of every track. */
  vec2 delta = (n1 - n0) * vec2(uAspect, 1.0);
  float len = length(delta);
  vec2 dir = len > 1e-6 ? delta / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x) / vec2(uAspect, 1.0);

  float t = aCorner.x;
  gl_Position = vec4(mix(n0, n1, t) + nrm * (aCorner.y * uHalfWidth * aStyle.y), 0.0, 1.0);

  /* Growth is a fade against a front travelling in arc length, not a clip
     against geometry — every track is uploaded whole, once, and the only thing
     that moves per frame is this one uniform. It also looks better than a clip:
     the edge is soft, so the spray arrives as light reaching a point rather
     than as a line being extruded.

     Particles at these energies are relativistic, so the front is common to all
     of them: long tracks finish later than short ones because they are long,
     which is the correct reason. */
  float lead = uFront - mix(aEnds.x, aEnds.y, t);
  float grow = smoothstep(0.0, 0.16, lead);
  float d = (lead - 0.12) / 0.20;
  float tip = exp(-d * d);

  float z = mix(z0, z1, t);
  vAlpha = mix(aEnds.z, aEnds.w, t) * grow * (1.0 + tip * 2.2) * uFade
         * smoothstep(0.05, 0.5, z);
  vDepth = z;
  vWarm = aStyle.x;
  vSide = aCorner.y;
}`;

export const TRACK_FRAG = `#version 300 es
precision highp float;

in float vAlpha;
in float vDepth;
in float vWarm;
in float vSide;
out vec4 fragColor;

void main() {
  /* The antialiasing, and the reason these are quads at all. vSide runs from -1
     to 1 across the width of the segment, so coverage is an analytic profile
     rather than whatever the rasteriser decided a one-pixel line was. It is
     smooth at any resolution, it costs one exp, and unlike multisampling it
     also gives the line a soft edge to bloom against.

     The exponent is set against the quad width the renderer guarantees: it puts
     the half-power points about 56% of the way out, so the visible core spans
     rather more than a pixel. Tightening it saves nothing and starts the
     dashing again. */
  float cov = exp(-vSide * vSide * 2.2);

  /* Warmth is transverse momentum: the soft spray runs cool and the few hard
     tracks burn gold. Unlike colouring by charge, it puts the emphasis on the
     rare thing.

     The depth range is the depth the event actually occupies, not the whole
     world: the vertex sits around 5.8 and the tracking volume is 2.6 across, so
     anything wider spends its contrast on empty space and prints the entire
     spray at one flat brightness. */
  float near = 1.0 - smoothstep(3.4, 8.5, vDepth);
  vec3 col = mix(vec3(0.24, 0.38, 0.58), vec3(1.00, 0.74, 0.36), vWarm);
  col = mix(col, vec3(1.0, 0.95, 0.86), pow(near, 3.0) * 0.55);

  vec3 lit = col * vAlpha * cov * (0.42 + near * 1.35);
  /* Alpha carries warmth, weighted by how bright this pixel is. Additive
     blending then makes the buffer's alpha a brightness-weighted sum of warmth
     over everything that landed on the pixel, so dividing it by the luminance
     recovers the average warmth — which is what the ink pass needs and what it
     could not get from the colour. See the composite. */
  fragColor = vec4(lit, vWarm * dot(lit, vec3(0.2126, 0.7152, 0.0722)));
}`;

/* ── Pass 3: bloom ───────────────────────────────────────────────────────── */

export const BRIGHT_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uScene;
uniform float uThreshold;
/* Alpha rides along through the whole bloom chain rather than being reset to 1.
   It is the warmth channel, and a halo has to know which ink it belongs to for
   the same reason the track under it does. Scaling and summing it alongside the
   colour keeps it a correctly weighted average at every tap. */
void main() {
  vec4 c = texture(uScene, vUv);
  float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
  fragColor = c * smoothstep(uThreshold, uThreshold + 0.35, lum);
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
  vec4 sum = texture(uSource, vUv) * W[0];
  for (int i = 1; i < 3; i++) {
    sum += texture(uSource, vUv + uDirection * O[i]) * W[i];
    sum += texture(uSource, vUv - uDirection * O[i]) * W[i];
  }
  fragColor = sum;
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
uniform float uLight;        // 0 = emit light on black, 1 = lay ink on paper
uniform vec3  uPaper;        // the page behind the plane, light theme only
uniform vec3  uInkCool;      // ink the soft spray is drawn in
uniform vec3  uInkWarm;      // ink the hard tracks are drawn in
uniform float uInkFloor;     // light below this deposits nothing
uniform float uInkGain;      // how fast light above the floor becomes opacity
uniform float uInkMax;       // ceiling on opacity, so paper always shows through
uniform float uInkDimGamma;  // compresses attenuation into paper's smaller range

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

  /* The sharp layer gets only a trace of the split — a one-pixel-wide track
     separated into full RGB reads as a rainbow sliver, not as a lens. The
     visible aberration lives in the bloom, where it lands on soft edges. */
  vec2 sharp = dir * 0.3;
  vec4 sceneC = texture(uScene, uv);
  vec4 bloomC = texture(uBloomA, uv);
  vec3 scene = vec3(
    texture(uScene, uv + sharp).r,
    sceneC.g,
    texture(uScene, uv - sharp).b
  );
  vec3 bloom = vec3(
    texture(uBloomA, uv + dir * 2.2).r,
    bloomC.g,
    texture(uBloomA, uv - dir * 2.2).b
  );
  bloom += texture(uBloomB, uv).rgb * 0.75;

  // Single warm key at the top edge, matching the rest of the site.
  float ky = (uv.y - 1.0) * 2.1;
  float kx = centered.x * 0.9;
  float key = exp(-ky * ky) * exp(-kx * kx);

  /* Art direction: hold the left column back so the headline always wins. The
     ramp runs past the middle of the frame because the headline does — it is
     the longest line on the page and its last word sits at 0.85. */
  float guard = mix(0.42, mix(0.10, 1.0, smoothstep(0.30, 0.82, vUv.x)), uCopyGuard);
  // Vignette, biased slightly high to sit under the navbar.
  float vig = smoothstep(1.60, 0.45, length(centered * vec2(0.92, 1.05) + vec2(0.0, 0.06)));

  /* Two kinds of attenuation, kept apart because ink treats them differently.

     The spatial term is about legibility: hold the left column back so the
     headline always wins, and fall off at the edges of the frame. The page term is
     distance: an interior page sits further away than the hero, and scrolling
     drains the plane. Emissive multiplies both and always did. */
  float art = guard * (0.52 + 0.48 * vig);
  float page = (1.0 - uScroll * 0.75 * uScrollDim) * uIntensity;
  float dim = art * page;

  vec3 col = scene + bloom * 0.55;
  col += vec3(0.85, 0.66, 0.32) * key * 0.055 * (1.0 - uScroll * 0.6);
  col = tonemap(col * 1.15) * dim;

  /* The ink exposure, and the one real difference in what the two themes read.

     Bloom is what makes the tracks glow, and on black that glow is most of the
     picture. On paper it is a stain: a soft mid-grey blotch with no edge, which
     is precisely what a white page cannot absorb. So ink is drawn almost
     entirely from the sharp layer, where the tracks actually are, and the warm
     key is left out of it: the page already carries that as a CSS wash, and
     doubling it here only tints the paper.

     Note what is *not* multiplied in: the dim factor. Emissive can be attenuated as
     light because dimming light is what a darker frame means. Ink cannot — the
     floor below is a black point, and a black point applied after the signal
     has already been scaled is not a threshold, it is a cliff. An interior page
     runs guard 0.42 against the hero's ~1.0 and exposure 0.5 against its 1.0,
     which is nearly five times dimmer before a single term about ink is
     reached, and a scrolled-past section takes another 0.25 on top. All of it
     landed under the floor, which is why the plane was visible in the hero and
     absent nearly everywhere else.

     So the mapping reads the undimmed exposure and the dim factor applies to the
     resulting *opacity* instead. Every art-direction term then does exactly
     what it was written to do — the left column is held back, interior pages
     sit further away, scrolling drains the plane — but it does it by making
     the drawing fainter rather than by deciding there is nothing to draw. */
  vec3 drawn = tonemap((scene + bloom * 0.22) * 1.15);

  float reveal = clamp(uIntro * 1.4, 0.0, 1.0);
  float grain = hash(gl_FragCoord.xy + fract(uTime) * 431.71) - 0.5;
  float dither = (hash(gl_FragCoord.xy * 1.7) - 0.5) / 255.0;

  /* ── Emissive: the tracks are a light source over near-black ─────────────── */
  // uPaper is the page's own --background in both themes, so the plane can never
  // drift from the sections that sit on it the way a literal #0a0c10 here did.
  vec3 emissive = col + uPaper * (1.0 - smoothstep(0.0, 0.5, length(col)));
  // Grain and an ordered dither: both keep the near-black falloff from banding.
  emissive += grain * 0.020 + dither;
  emissive *= reveal;

  /* ── Ink: the same event drawn on paper ──────────────────────────────────────
     Everything above this line is an accumulation of *light*, which is why the
     plane could not simply be exposed differently for the light theme: there is
     no brightness at which added light darkens a near-white page. What survives
     the change of ground is not the colour but the density — where the tracks
     went and how much energy was there. So the accumulated luminance is read as
     an opacity and used to lay ink down instead.

     Which of the two inks a pixel gets is carried in the buffer's alpha rather
     than inferred from its colour. Inferring it was the obvious approach and it
     was wrong in a way that only showed up on paper: the hue came off the
     tone-mapped colour, and tone mapping drives anything bright toward white,
     so red minus blue collapses to zero exactly where the picture is strongest.
     Zero is the midpoint between the two inks, so every hot track core — the
     part most worth seeing — printed in a flat 50/50 mud of navy and bronze.
     Burning near tracks toward white did the same thing for a different reason.

     So the track pass writes warmth into alpha weighted by its own brightness,
     additive blending sums both, and the ratio here is a proper
     brightness-weighted average of the warmth of everything that landed on the
     pixel. It survives tone mapping because it never passes through it, it
     survives overlap because the weighting is what an average is, and it is
     scale-free, so a dim track and a bright one of the same kind agree.

     The floor is what makes it a drawing rather than a wash: the bloom halo and
     the volumetric slit occupy the bottom of the histogram, they are invisible
     on black, and carried onto paper they are a flat tint over the whole
     viewport that greys the page and buys nothing. The ceiling is the other
     half of the same argument — this is a background, and paper has to keep
     showing through it. */
  float lum = max(dot(drawn, vec3(0.2126, 0.7152, 0.0722)) - uInkFloor, 0.0);
  /* The dim factor is compressed rather than applied straight, and the reason
     is the medium. On black, an interior page at 0.19 of the hero's exposure is
     still plainly a lit plane — the eye adapts to the darkest thing on screen
     and reads what is left. On paper there is nothing to adapt to: the page is
     the brightest thing in the room, so 0.19 of a 25% tint is 5%, which is not
     "further away", it is gone. That is what made the plane invisible on every
     page but the hero.

     A gamma keeps the ordering — the hero is still the loudest and a scrolled
     section still drains — while lifting the bottom of the range into the part
     of it paper can actually hold.

     Only the distance term is compressed. The spatial term is not about
     distance at all, it is the guard that keeps the plane off the headline, and
     softening that was the immediate cost of applying one gamma to everything:
     0.10 under the copy became 0.29, and the smudge walked back under the type
     the guard exists to protect. */
  // The same 0.22 the exposure above uses, so halo and track agree on their ink.
  float warmNum = sceneC.a + bloomC.a * 0.22;
  float warmDen = dot(sceneC.rgb, vec3(0.2126, 0.7152, 0.0722))
                + dot(bloomC.rgb, vec3(0.2126, 0.7152, 0.0722)) * 0.22;
  float warm = clamp(warmNum / max(warmDen, 1e-5), 0.0, 1.0);

  /* Hard tracks print heavier, not just warmer. On black, "hot" is a brightness
     and the gold says it by itself; on paper there is no such move — a
     saturated amber at a fifth opacity over white is a pale tan whatever its
     hue, which is why the energetic half of this picture kept coming out the
     weakest. Opacity is the only thing paper has, so the gain is raised for the
     warm end and the hard tracks lay down properly dark ink. It is also the
     honest reading: more energy deposited, more ink. */
  float density =
    (1.0 - exp(-lum * uInkGain * mix(0.9, 1.75, warm))) * uInkMax * art * pow(page, uInkDimGamma);
  /* Ink is not a flat tint, and this is the difference between a drawing and a
     screen-printed swatch. A pigment laid down thinly is a pale, desaturated
     wash of its own hue; laid down heavily it is deep, nearly black, and it
     catches a little light off its own surface rather than going to pure dark.
     Mixing paper toward one fixed colour has none of that range by
     construction — which is exactly what "flat and matte" was describing. The
     small constant added at the deep end is that surface sheen: without it,
     heavy ink reads as a hole in the page instead of as something sitting on
     top of it. */
  /* Pushed toward one ink or the other rather than mixed evenly between them.
     The two are near enough to complementary that the midpoint is grey, so a
     track of middling momentum came out the dullest thing in the frame — which
     is the opposite of what the colour is for. Steepening the crossover keeps
     almost every track on one side of it. */
  vec3 base = mix(uInkCool, uInkWarm, smoothstep(0.28, 0.72, warm));
  float load = smoothstep(0.05, 0.8, density / max(uInkMax, 1e-4));
  /* The two hues cannot be deepened by the same amount. Darkening a blue gives
     a deeper blue; darkening an orange gives brown, and brown is the one thing
     the hot end of this picture must not be. So the warm ink barely darkens at
     all as it loads up and keeps its chroma instead, while the cool ink can go
     properly deep. The small additive term is surface sheen, and it is applied
     only to the cool side — on the amber it just greys it. */
  vec3 deep = base * mix(0.58, 0.86, warm) + vec3(0.03, 0.035, 0.05) * (1.0 - warm);
  vec3 ink = mix(base * 1.05, deep, load);
  // Paper takes far less grain than black does — it has no banding to hide, and
  // texture over near-white reads as dirt.
  vec3 inked = mix(uPaper, ink, density * reveal) + grain * 0.004;

  /* Halation, and the only way heat can read on a white ground. Adding light to
     paper does nothing — it is already the brightest thing in the room — so the
     warmth around a hot track is made by taking blue *out* of the paper
     instead. The page itself goes amber near the hard tracks, the way ink
     bleeds into fibre or a bright source fogs a plate, and the cool spray
     leaves it alone. It costs one smoothstep and it is most of what makes the
     light theme look energetic rather than merely drawn. */
  float halo = smoothstep(0.03, 0.4, dot(bloomC.rgb, vec3(0.2126, 0.7152, 0.0722)));
  inked -= vec3(0.0, 0.022, 0.075) * halo * warm * art * reveal;

  fragColor = vec4(mix(emissive, inked, uLight), 1.0);
}`;
