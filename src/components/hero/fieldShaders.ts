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
 * How long the plasma lives before it freezes out, in seconds of wall time.
 *
 * The tracks are held back by exactly this long, because that is the order it
 * happens in: the medium forms, expands, cools, and only then breaks up into
 * the hadrons a detector sees. Drawing the spray at the moment of impact skips
 * the whole subject of the thing.
 */
uniform float uQgp;
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
/**
 * The shear layer at the plasma's surface. Bluer and more saturated than
 * SOFT_COLOR because it is not a dim version of the hot core — it is the other
 * sign of a signed quantity, and in the source animation that reads as the far
 * end of a diverging colour map rather than as less of the same thing.
 */
const vec3 SHEAR_COLOR = vec3(0.16, 0.31, 0.55);
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
    /* The flash is punctuation, so it decays in about a sixth of a second rather
       than half of one. At the old rate it was still near full power right
       through the plasma stage, and since it sits at the same place with a much
       harder profile it simply won the exposure — the medium was a white hole
       with a flashbulb inside it, and the only thing either of them could say
       was "bright". A short strike and then the thing it started. */
    vec3 core =
      HARD_COLOR * exp(-q * q) * ((0.16 + 2.6 * exp(-t * 7.0)) * fired + squeeze) * uGlow;
    acc += core;
    warmAcc += dot(core, LUMA);

    /* The plasma.

       Shaped from the thesis animation rather than guessed: the fireball there
       was measured frame by frame, and the coefficients below are those
       measurements. It starts elongated along the beam at an aspect of 1.6 and
       relaxes toward round, while its width across the beam grows 1.45x and its
       length along the beam barely moves. Pressure gradients are steepest where
       the medium is thinnest, so it expands hardest transversally and the
       initial spatial anisotropy washes out as it does.

       Extent rather than RMS radius, deliberately. Both were measured and they
       disagree — RMS is mass-weighted, so it follows the bright interior and
       reports a stronger flip (1.26 down to 0.78), while extent follows the
       outline. The eye reads the outline, so the outline is what is drawn.

       So this is not a ring. It is an ellipse aligned to the beam that starts as
       a cigar and relaxes toward a disc.

       The colour split carries the other half of the physics. In the source
       animation the field is signed — a diverging red/blue map of vorticity —
       and it starts balanced, then one sign takes the interior while the other
       survives in the shear layer at the surface. This site already has a
       complementary pair to say that with: warmth for one sign, cool for the
       other, which is why the hot core grows warmer as the rim stays cool. */
    float life = clamp(t / max(uQgp, 1e-4), 0.0, 1.0);
    /* Freeze-out: the medium stops being a medium and the tracks take over. The
       two stages overlap on purpose — the fade begins before the front is
       released, so the spray leaves while the medium is still glowing and the
       one visibly becomes the other. Ending the fade first left a dark beat
       between them, and a gap is what turns a sequence into two events. */
    float alive = 1.0 - smoothstep(0.58, 1.06, life);

    vec4 bp = uBunches[i];
    vec2 axis = normalize(e.xy - bp.xy + 1e-6);
    vec2 perp = vec2(-axis.y, axis.x);
    vec2 d = uv - e.xy;

    /* Sized so the shape can actually be read. At a sixth of the spray's reach
       the anisotropy is a rounding error on a dot, and the one thing this stage
       exists to show is that it is not round. */
    float r0 = 0.260 * scale;
    float rT = r0 * (1.0 + 0.58 * life);  // across the beam, measured at 1.45x
    /* 1.72 where the measurement says 1.60: the bloom pass blurs the ellipse
       toward round, and a rendered 1.4 is what a geometric 1.6 comes out as.
       The number that matters is the one on screen. */
    float rL = r0 * 1.72;                 // along it: the outline holds
    float dl = dot(d, axis) / rL;
    float dt = dot(d, perp) / rT;
    float rr = sqrt(dl * dl + dt * dt);

    // Energy density falls as the volume grows: the thing cools by expanding.
    float dens = 1.0 / (1.0 + 2.4 * life * life);

    // Wide enough to fill the ellipse. The medium is what this stage is about;
    // the shear layer is its skin, not the subject.
    float hotQ = exp(-rr * rr * 1.10);
    float lumpRim = 1.0;

    /* Lumpy initial conditions, and the rotation the medium carries.

       This was left out of the first version on the grounds that participant
       fluctuations would read as noise at hero scale. That was wrong, and it is
       the single thing that made the stage look like a blob: two smooth radial
       gaussians, one gold and one blue, are a fried egg. There is no such thing
       as a smooth fireball anyway — what overlaps is a few dozen nucleons at
       points, so the medium starts as hot spots and only smooths out as it
       expands and thermalises. Three of them, because three is where triangular
       flow comes from and because it is what fits at this size.

       Then the part the thesis is actually about. A collision at nonzero impact
       parameter carries angular momentum, the shear in the flow gives the
       medium vorticity, and the structure inside it turns. So the pattern is
       rotated by an angle that grows with life: the fireball visibly churns
       while it expands instead of sitting there. It costs one branch and three
       exponentials on the few pixels the medium covers, and it is the whole
       difference between something alive and something drawn.

       Rotated in the ellipse's own normalised frame rather than in screen
       space, so the turn is sheared by the same anisotropy as everything else —
       which is what a rotation inside an expanding elliptical medium looks
       like. */
    if (rr < 1.8) {
      // Per-event, from the vertex itself: no hashing, and stable frame to frame.
      float ph = fract(dot(e.xy, vec2(37.13, 61.79))) * 6.2831;
      float sp = 0.78 + 0.50 * fract(dot(e.xy, vec2(11.37, 91.71)));
      float spin = ph + 1.25 * life;
      float cs = cos(spin);
      float sn = sin(spin);
      vec2 q2 = vec2(dl * cs - dt * sn, dl * sn + dt * cs);
      float w = 0.26 + 0.44 * life;   // hot spots swell and run into each other
      float lump = 0.0;
      for (int k = 0; k < 3; k++) {
        float a = float(k) * 2.0944;
        vec2 c = vec2(cos(a), sin(a)) * sp * (0.34 + 0.12 * float(k));
        vec2 dd = (q2 - c) / w;
        lump += exp(-dot(dd, dd));
      }
      // Thermalisation: the lumpiness is an initial condition, and it washes out.
      float clumpy = 0.90 * (1.0 - smoothstep(0.0, 0.90, life));
      hotQ *= mix(1.0, 0.25 + 1.15 * lump, clumpy);
      lumpRim = mix(1.0, 0.50 + 0.80 * lump, clumpy * 0.85);
    }

    /* Squared by hand, never pow(): the base goes negative inside the rim and
       pow() is undefined there, which reads as a hard notch across the shell.

       Broader and further out than it was. At the old width this was a crisp
       annulus, and a crisp annulus around a bright centre is an eye — the shape
       announced itself as an object with an outline rather than as the surface
       of something diffuse. A skirt says the same thing about the shear layer
       without drawing a border around the medium. */
    float sh = (rr - 1.05) * 2.2;
    /* Modulated by the same lumps as the interior, which is the point of doing
       it at all. A shear layer of constant strength around an elliptical
       medium draws a clean closed curve, and a clean closed curve is a border —
       it turned the fireball into an object with an outline, which is the "eye"
       the first pass came out as. Fed by the lumpiness, the rim is thick where
       the medium reaches and thin where it does not, so it reads as the edge of
       something diffuse rather than as a ring drawn around it. */
    float shear = exp(-sh * sh) * lumpRim;

    /* Roughly a third of what this used to emit, and the cut is the whole
       reason the stage reads at all now.

       Measured off the composited frame rather than the scene buffer: at the
       old level the plasma clipped to flat white over its entire width. Every
       distinction built above — the gold interior, the cool shear layer at the
       surface, the beam-aligned ellipse — was being tone-mapped into the same
       255, so the thing on screen was a headlight. Worse, it then appeared to
       *shrink* as it expanded, because what was visible was the region above
       saturation rather than the medium: as it cooled the white area contracted
       while the geometry grew, which is precisely backwards.

       Held under the clip, brightness falls and size grows independently, which
       is what expansion looks like. This is the difference between exposing a
       picture and turning up a lamp. */
    vec3 hot  = HARD_COLOR * hotQ * dens * (0.40 + 0.34 * life);
    /* Held well below the core. Measured against the source animation the first
       pass had this backwards — a blue halo with an amber dot inside it, when
       the interior is the part that goes one-signed (48% to 86% of the field
       over the run) and the opposite sign survives only in the shear layer. */
    vec3 cool = SHEAR_COLOR * shear * dens * 0.44 * (1.0 - 0.66 * life);
    float gate = fired * alive * uGlow;
    acc += (hot + cool) * gate;
    /* Only the hot half carries warmth, so the rim prints as the cool ink — and
       it has to be gated by exactly what acc was gated by, uGlow included.

       The composite recovers hue as this sum over the luminance of acc, so any
       factor applied to one and not the other is a hue error. Leaving uGlow out
       was invisible on black, where it is 1 and cancels; on paper it is 0.4,
       which inflated the ratio by two and a half and clamped the whole fireball
       to fully warm. The shear layer did not print as faint blue, it printed as
       bronze — the light theme was missing the cool half of the medium
       altogether. The beams and the impact core above both fold uGlow in before
       writing warmth; this was the one term that did not. */
    warmAcc += dot(hot, LUMA) * gate;
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
out float vShift;   // radial velocity: +1 straight away, -1 straight at you

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

  /* Doppler, and it costs one dot product because of where we already are. The
     camera sits at the origin of camera space, so the line of sight to a point
     is just that point, and the component of the track's own direction along it
     is the radial velocity. Nothing has to be uploaded and nothing has to be
     recomputed on the CPU.

     These are relativistic particles, so beta is near enough to one that the
     magnitude is carried entirely by the angle: a track crossing the field of
     view is unshifted however fast it is going, and one pointed at the camera
     is shifted as hard as anything can be. Which is why the sign, rather than a
     speed, is the whole quantity. */
  vec3 seg = c1 - c0;
  vec3 los = mix(c0, c1, t);
  /* Structure is exempt. The beam axis and the detector wireframe both flag
     themselves with a negative arc — it is what keeps them permanently ahead of
     the growth front — and the same flag serves here: a girder has no velocity,
     so shifting its colour as though it were flying at the camera would be
     drawing a physical claim that is simply false. They come out at the
     transverse midpoint, which is the site's steel. */
  float moving = step(-1.0, aEnds.x);
  vShift = dot(normalize(seg + 1e-6), normalize(los + 1e-6)) * moving;
}`;

export const TRACK_FRAG = `#version 300 es
precision highp float;

in float vAlpha;
in float vDepth;
in float vWarm;
in float vSide;
in float vShift;
out vec4 fragColor;

/**
 * How far the camera currently is from the interaction point.
 *
 * The depth cue has to be measured against this rather than against fixed world
 * numbers, because the camera moves: it stands inside the detector at the hero
 * and retreats as the page scrolls. Constants tuned at the hero's distance put
 * everything past the far end of the ramp the moment the camera pulls back, so
 * the picture dimmed just as it came into full view — the opposite of what the
 * ramp is for. As fractions of this, the same cue means the same thing at every
 * distance. The two coefficients are the old 1.7 and 6.8 divided by the hero's
 * own 4.1, so the hero shot is unchanged.
 */
uniform float uRefDepth;

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

  /* The depth range is the depth the event actually occupies, not the whole
     world: anything wider spends its contrast on empty space and prints the
     entire spray at one flat brightness. Scaled by the camera's own distance —
     see uRefDepth. */
  float near = 1.0 - smoothstep(uRefDepth * 0.415, uRefDepth * 1.659, vDepth);

  /* Doppler shift, and hue is now entirely its own — it says which way through
     the volume a particle is going and nothing else.

     It used to be laid over a momentum colour, on the reasoning that keying hue
     to the shift alone would drain the colour out of the transverse tracks that
     dominate the frame. That reasoning was sound and the result was still wrong,
     because both cues pointed at the same warm-cool axis: momentum ran steel to
     gold, the shift ran blue to red, and once they are summed there is no way to
     look at a warm track and know whether it is hard or receding. Gold sat close
     enough to the red end that the hard transverse tracks — the longest,
     brightest, most numerous lines in the picture — read as tracks coming at the
     camera, which is the opposite of what they were. Two meanings on one channel
     is one meaning too many.

     So momentum comes off the channel, and loses nothing by it: it already sets
     the line width in the geometry and the alpha in the envelope, so a hard
     track is still the thick bright one and a jet is still a spear. Hue is freed
     to carry the thing a flat projection otherwise throws away entirely.

     Blue toward the observer, red away, steel across. The transverse end is the
     site's own steel rather than a grey, so the spray that dominates the frame
     still reads as the palette. */
  float toward = max(-vShift, 0.0);
  float away = max(vShift, 0.0);
  const vec3 BLUESHIFT  = vec3(0.30, 0.60, 1.00);
  const vec3 TRANSVERSE = vec3(0.34, 0.45, 0.63);
  const vec3 REDSHIFT   = vec3(1.00, 0.52, 0.22);
  vec3 col = mix(TRANSVERSE, REDSHIFT, away);
  col = mix(col, BLUESHIFT, toward);
  /* Burned toward a neutral white, not the warm one this used to use. The
     tracks that burn are the near ones and approaching tracks become near ones,
     so a warm burn was bleaching the blue off precisely the tracks the shift
     exists to mark — the ones aimed at the camera came out pale orange. */
  col = mix(col, vec3(0.93, 0.96, 1.0), pow(near, 3.0) * 0.34);

  /* Relativistic beaming: the other half of the same effect and the half that
     carries depth. A source running at you does not only shift blue, it
     concentrates its light forward and arrives brighter; one running away is
     dimmed by the same argument. Without it the shift is a colour wash on a
     flat spray. With it the spray has a front and a back. */
  float beam = 1.0 + 0.60 * toward - 0.28 * away;

  // Momentum, now that it is off the hue: the hard tracks still burn brighter.
  vec3 lit = col * vAlpha * cov * (0.42 + near * 1.35) * beam * (0.78 + 0.50 * vWarm);
  /* Alpha carries warmth, weighted by how bright this pixel is. Additive
     blending then makes the buffer's alpha a brightness-weighted sum of warmth
     over everything that landed on the pixel, so dividing it by the luminance
     recovers the average warmth — which is what the ink pass needs and what it
     could not get from the colour. See the composite. */
  /* Paper gets the shift too, and it has exactly two inks to say it with —
     which happens to be the right number. Warmth is displaced toward the bronze
     for a receding track and toward the navy for an approaching one, so the
     light theme prints the same red and blue the dark one emits. Held to a
     third of the emissive strength on purpose: the composite pushes warmth to
     one ink or the other through a steep crossover, and a shift large enough to
     carry a track across that crossover would not read as a shifted track, it
     would read as the other kind of track. */
  /* Biased below the midpoint on purpose. The composite pushes warmth to one
     ink or the other through a crossover centred on 0.5, and the two inks are
     near enough to complementary that 0.5 itself is grey — so mapping the
     transverse case to exactly the midpoint would have printed the majority of
     the spray, and the whole detector, in mud. Paper has two inks and the shift
     has three states, so the split that survives the medium is the one that
     matters: receding warm, everything else cool. */
  float warmOut = clamp(vShift * 0.45 + 0.32, 0.0, 1.0);
  fragColor = vec4(lit, warmOut * dot(lit, vec3(0.2126, 0.7152, 0.0722)));
}`;

/* ── Pass 2b: detector walls ─────────────────────────────────────────────── */

export const SURFACE_VERT = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aCell;
/* Where this point sits on the machine: (distance along the beam from the
   interaction point, azimuth about it, distance out from the axis).
   Precomputed on the CPU — see barrelAxis. The instrumented surfaces need it to
   know whether they are in the path of the spray, and when it arrives. */
layout(location = 3) in vec3 aAxis;

uniform vec3  uOrigin;
uniform mat3  uBasis;
uniform float uAspect;
uniform float uFocal;

out vec2  vCell;
out vec3  vAxis;
out float vGraze;
out float vDepth;

void main() {
  vec3 rel = aPos - uOrigin;
  vec3 cam = vec3(dot(rel, uBasis[0]), dot(rel, uBasis[1]), dot(rel, uBasis[2]));
  float z = max(cam.z, 0.06);
  gl_Position = vec4(uFocal * cam.x / z * 2.0 / uAspect, uFocal * cam.y / z * 2.0, 0.0, 1.0);

  /* How much wall the ray crosses. Looking straight through a panel you cross
     its thickness and it is nearly invisible; looking along it you cross its
     whole extent and it is at its densest. That one term is what separates a
     translucent cylinder from a flat ring, and it is why these carry normals. */
  vGraze = 1.0 - abs(dot(normalize(aNormal), normalize(rel)));
  vCell = aCell;
  vAxis = aAxis;
  vDepth = z;
}`;

export const SURFACE_FRAG = `#version 300 es
precision highp float;

in vec2  vCell;
in vec3  vAxis;
in float vGraze;
in float vDepth;
out vec4 fragColor;

uniform float uFade;
uniform vec3  uTint;
uniform float uRefDepth;   // see the note on the same uniform in TRACK_FRAG
/* How a module is drawn, which is the whole difference between a surface and a
   piece of apparatus.

   The controlling idea, taken from what a real event display actually does:
   every panel is a bright outline around a darker translucent fill. That is why
   those pictures read as built from plates and why an earlier version of this
   read as a smooth blue field — the seams here darkened rather than lit, so the
   divisions subtracted from the material instead of describing it. An edge that
   glows is a plate. An edge that dims is a smudge.

   uBase   constant fill, independent of viewing angle
   uBody   how much the fill thickens toward grazing incidence
   uSeamW  gap between modules; zero for a continuous wall, wide for petals
   uRimW   how far in from the boundary the bright edge reaches
   uRim    strength of that edge
   uStripeN / uStripe  ribs running along the module, as on the endcap wedges */
uniform float uBase;
uniform float uBody;
uniform float uSeamW;
uniform float uRimW;
uniform float uRim;
uniform float uStripeN;
uniform float uStripe;
/* The live event, for the groups that respond to one.

   uPulse is how loudly this group answers — zero for everything that is only
   structure. uFrontArc is how far the spray has travelled from the vertex, in
   world units, which is what decides *when* any given block answers. uHot is
   the colour it goes when it does. */
uniform float uPulse;
uniform float uFrontArc;
uniform vec3  uHot;
uniform float uPsi;
uniform float uV2;
/**
 * Which ink this surface prints in, for the light theme.
 *
 * Emissive colour and printed colour are two different channels here and always
 * have been: on black the tint is the picture, on paper the tint is thrown away
 * and the hue comes out of the buffer's alpha instead — see the composite. Every
 * surface was writing the same low warmth, so the endcap emitted gold on black
 * and printed navy on paper, which is not a wrong shade, it is the wrong ink.
 * The petals are the one part of the machine that is warm, so they are the one
 * part that has to say so.
 */
uniform float uWarm;

/**
 * Energy landing in this block, for the groups that measure it.
 *
 * The blocks were static decoration: always there, always the same, entirely
 * unconnected to the collision they exist to record. In a real event display
 * the deposits are the point — the blocks light where the spray went, and the
 * pattern of which ones lit is the measurement.
 *
 * So they are lit from the event's own reaction plane and flow strength, the
 * same two numbers the tracks were drawn from. That is not an approximation of
 * the spray, it is the same distribution sampled a second time, which is why
 * the bright blocks line up with the dense side of the spray without either
 * knowing about the other. Times a per-block hash, because a calorimeter
 * measures in lumps and a smooth cosine around the barrel would read as a
 * gradient rather than as granularity.
 *
 * The timing is each block's own. Everything here is gated on the spray having
 * reached this radius, so the answer sweeps outward from the beam pipe through
 * the calorimeter to the tile blocks in the order the particles actually arrive
 * — which is the difference between a machine responding and a machine
 * blinking. Measured in distance rather than seconds because the two are the
 * same thing here: the front travels at a fixed speed, so a block a metre
 * further out is lit a fixed moment later and one uniform carries both.
 *
 * uPulse is zero for everything that is only structure, which switches all of
 * this off for the price of one compare.
 */
float deposit() {
  if (uPulse < 1e-4) return 0.0;
  // How far past this block the front has swept. Nothing before it arrives.
  float d = uFrontArc - vAxis.z;
  if (d <= 0.0) return 0.0;
  /* Snaps on over about a fifth of a second and decays over a couple, in the
     units the front is measured in. */
  float env = min(1.0, d / 1.1) * exp(-d * 0.11);
  // Elliptic flow: more tracks in the reaction plane, so more energy there too.
  float flow = 1.0 + 2.0 * uV2 * cos(2.0 * (vAxis.y - uPsi));
  /* Falls off along the beam, because the spray is densest at mid-rapidity —
     but gently. The blocks that carry this picture are the ones receding toward
     the far wheel, which are the far ones, and a tight falloff about the vertex
     lights precisely the blocks nobody can see. The whole barrel gets hit; only
     the middle gets hit hardest. */
  float along = exp(-vAxis.x * vAxis.x * 0.022);
  float lump = fract(sin(vAxis.x * 12.9898 + vAxis.y * 78.233) * 43758.5453);
  /* Subtracted rather than scaled: a threshold is what makes some blocks light
     and the rest stay dark, which is the look. Scaling would raise all of them
     together and read as the wall brightening. */
  return uPulse * env * along * max(flow * (0.25 + 1.5 * lump) - 0.62, 0.0);
}

void main() {
  vec2 d = min(vCell, 1.0 - vCell);
  float edge = min(d.x, d.y);

  /* The gap, for modules that are physically separate. Zero width leaves the
     wall continuous; a wide one cuts the endcap into individual petals. */
  float gap = uSeamW > 1e-4 ? smoothstep(0.0, uSeamW, edge) : 1.0;

  // The bright outline, just inside the boundary. This is what says "plate".
  float rim = smoothstep(uRimW, uRimW * 0.25, edge);

  /* Ribs along the module. On the endcap wedges these are the layered readout
     planes you can see stacked through each petal; on the shells they are a
     hint of segmentation and nothing more. */
  float sline = abs(fract(vCell.y * uStripeN) - 0.5) * 2.0;
  float stripe = smoothstep(0.86, 1.0, sline) * uStripe;

  /* Fill. A constant part, because a sheet you can see through has a density
     everywhere, plus a grazing part that thickens it toward the silhouette and
     tells you the surface is curved. Cell blocks use constant only — they face
     the viewer flat-on and would otherwise vanish. */
  float body = pow(max(vGraze, 0.0), 1.45);
  // Same relative range the tracks use, widened: the far wall is a long way back.
  float near = 1.0 - smoothstep(uRefDepth * 0.415, uRefDepth * 2.195, vDepth);

  float fire = deposit();
  float a = (uBase * (1.0 + 6.5 * fire) + body * uBody + rim * uRim + stripe) * gap
          * uFade * (0.72 + 0.28 * near);
  /* Hot blocks pull toward the green a real display reads energy in, so a lit
     cell is a different substance from a lit-up wall rather than a brighter
     patch of the same one. */
  vec3 col = mix(uTint, uHot, min(fire * 0.9, 0.85)) * a;
  /* Cool, and well below the ink crossover so paper prints the walls in the
     navy rather than the bronze. Structure is not energy. */
  /* A deposit carries a little warmth so a lit block does not print as a cold
     hole in the middle of the hot event it belongs to — but well short of the
     crossover, because the gold is still the only thing paper should call gold. */
  fragColor = vec4(col, (uWarm + fire * 0.22) * dot(col, vec3(0.2126, 0.7152, 0.0722)));
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

  /* Chromatic aberration, growing toward the edges of the frame.

     It used to grow with pointer speed as well, and there used to be a lens
     bulge tracking the cursor on top of it. Both are gone. A background that
     deforms under the pointer asks to be noticed, and this one now has a machine
     in it worth looking at instead — an effect that competes with the subject
     for attention is a cost, not a feature. */
  float r2 = dot(centered, centered);
  vec2 dir = centered * (0.0007 + r2 * 0.0028);

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
  /* Softened from 0.75 now that scrolling away is a camera move rather than a
     dissolve. Draining the plane to a quarter made sense when the far end of the
     scroll had nothing to show; it is the wrong instinct when the far end is the
     shot where the whole machine is finally in frame. Retreating and going dark
     at once means arriving at nothing. */
  float page = (1.0 - uScroll * 0.30 * uScrollDim) * uIntensity;

  vec3 col = scene + bloom * 0.55;
  col += vec3(0.85, 0.66, 0.32) * key * 0.055 * (1.0 - uScroll * 0.6);
  /* Exposure above 1 goes in front of the tone map, attenuation stays behind
     it, and the split is the whole reason the curve is here.

     tonemap is a filmic shoulder: its job is to take a scene that overflows the
     display and roll the top of it off, so a hot core stays gold instead of
     clipping to flat yellow. Multiplying after it throws that away — the output
     is already in 0..1, so anything over 1 is a straight clamp and every value
     above the threshold becomes the same white. That was invisible while the
     only page-level term was attenuation, which is what the multiply was
     written for. Opening the exposure up as the plane contracts made it the
     opposite: the sphere came out bright and flat, which is what clipping looks
     like when it happens to the whole frame at once.

     min/max rather than a branch, and exactly equal to the old line whenever
     exposure is at or below 1. */
  col = tonemap(col * 1.15 * max(page, 1.0)) * art * min(page, 1.0);

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
  /* The warm end still prints heavier than the cool one, but by less than it
     did. At 1.75 the hard tracks laid down so much more pigment than the soft
     spray that the two stopped looking like one drawing: dark mode reads as a
     fine blue spray with a few gold streaks through it, and paper was reading as
     fat orange bars with some faint blue behind them. The asymmetry is real —
     opacity is all paper has to say "more energy" with — but it only has to be
     enough to rank them, not enough to change what kind of mark they are. */
  /* The ceiling is enforced here rather than assumed, and that is not
     defensive tidying — it is the one asymmetry between the two grounds.

     uInkMax is written above as the promise that paper keeps showing
     through. It held for free as long as every term after it was at most 1:
     art is a pair of attenuations and page was exposure, which never
     exceeded the intensity the component was mounted with. The reveal broke
     that. Opening the exposure up as the plane contracts drives page well
     past 1, pow carries it through, and density crosses 1 on the hottest
     tracks.

     On black nothing happens — emissive is light, and light past full simply
     clips to white. On paper mix(uPaper, ink, density) is an interpolation
     being asked to extrapolate: past 1 it keeps going beyond the ink and out
     the far side of the colour, which clamps to pure black. So the light theme
     grew black holes exactly where the picture was strongest, and did it while
     scrolling, because scrolling is what opens the exposure.

     A min rather than a rescale: the boost still lifts everything below the
     ceiling, which is nearly all of the drawing, and only the top of the range
     plateaus. It is a no-op for every configuration that predates the reveal. */
  float density = min(
    (1.0 - exp(-lum * uInkGain * mix(0.95, 1.32, warm))) * uInkMax * art * pow(page, uInkDimGamma),
    uInkMax);
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
