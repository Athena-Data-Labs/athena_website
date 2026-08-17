/**
 * The event generator behind the hero atmosphere.
 *
 * Every few seconds two nuclei meet on an axis running obliquely across the
 * frame, and the tracks that come out of it are built here: sampled from the
 * distributions a real event is sampled from, propagated as helices in a
 * solenoidal field, and written straight into the GPU buffer as line geometry.
 *
 * The scale is honest about being a picture rather than a measurement — the
 * tracking volume is three units wide, not two metres — but every *relationship*
 * in it is the real one. Transverse momentum sets the helix radius, so the soft
 * spray curls and the rare hard track runs almost straight. Rapidity sets the
 * dip angle, so forward tracks hug the beam. Azimuth is modulated by elliptic
 * flow around a reaction plane that changes each event, so the spray is
 * almond-shaped rather than isotropic, and the modulation peaks at mid-central
 * collisions the way the measurement does. A handful of neutral strange
 * particles fly a short way from the vertex before decaying into two charged
 * daughters, which is the V0 topology the whole business of reconstructing a
 * lambda rests on, and the daughters share the parent's momentum unevenly, so
 * one runs nearly straight and the other curls hard away from it. Most events
 * also contain a dijet, quenched asymmetrically by the medium it crossed.
 *
 * Almost none of that is legible at background opacity, and it is not supposed
 * to be. It is why the thing moves the way it does. The dijet is the exception:
 * that one is meant to be seen.
 */

export const SEGMENTS = 28;
/**
 * One record per segment, drawn as an instanced quad rather than a GL line.
 *
 * A GL line is one hard pixel with no coverage information, which is a
 * staircase at any resolution and cannot be fixed downstream — the bloom only
 * blurs the staircase. A quad carries a signed distance across its width, so
 * the fragment shader can compute its own falloff, and the same change buys
 * line weight in CSS pixels instead of whatever a device pixel happens to be.
 *
 *   p0 (3) | p1 (3) | arc0, arc1, alpha0, alpha1 (4) | warmth, width (2)
 */
export const FLOATS_PER_SEG = 12;
export const MAX_TRACKS = 150;

/** The collision axis in world space: right, slightly down, slightly away. */
const BEAM: Vec3 = [0.82, -0.26, 0.51];
/**
 * Where the beams cross: right of centre so the spray blooms clear of the
 * headline, and far enough back that the whole event fits in frame. Depth is
 * doing the composition here — pulling the vertex closer would push the tracks
 * off three edges, and the burst has to be seen whole to read as a burst.
 */
const IP: Vec3 = [0.96, 0.24, 3.2];

const R_DET = 2.6; // tracks are drawn until they leave this much of a tracking volume
const ARC_MAX = 4.2; // and never for longer than this, however straight they are
/* Half a turn, and this one is taste rather than physics. A soft track really
   does spiral until it runs out of gas, but a closed loop on screen stops being
   a trajectory and becomes a circle — the eye reads the shape instead of the
   motion. Cut at 180 degrees every curler is a crescent, which still says
   "this one was slow" without drawing an ornament. */
const TURN_CAP = 0.5;
const KR = 2.4; // helix radius per GeV of transverse momentum
const T_SLOPE = 0.19; // inverse slope of the momentum spectrum, GeV
const TAU = Math.PI * 2;

type Vec3 = [number, number, number];

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const norm = (v: Vec3): Vec3 => {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
};

/* The event frame: B is the beam, E1 and E2 span the transverse plane. Which way
   E1 points inside that plane does not matter — rotating it is the same as
   shifting every azimuth by a constant, and the reaction plane is already
   random per event. */
const B = norm(BEAM);
const E1 = norm(cross([0, 1, 0], B));
const E2 = cross(B, E1);

/** Deterministic, seedable, and three lines. Events need variety, not entropy. */
export const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Rng = () => number;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const gauss = (rng: Rng) =>
  Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-6))) * Math.cos(TAU * rng());

/**
 * A thermal spectrum: the sum of two exponentials, which peaks near the slope
 * and falls away fast, plus the rare hard scatter that gives an event the one
 * or two straight tracks it needs to have any depth at all.
 */
const samplePt = (rng: Rng) => {
  const pt =
    -T_SLOPE * (Math.log(Math.max(rng(), 1e-6)) + Math.log(Math.max(rng(), 1e-6)));
  return Math.max(0.06, rng() < 0.07 ? pt * (2 + rng() * 4) : pt);
};

/**
 * Azimuth against elliptic flow. The initial overlap of two nuclei is almond
 * shaped, the pressure gradient is steeper across the short axis than the long
 * one, and what comes out is more particles in the reaction plane than out of
 * it: dN/dphi goes as 1 + 2 v2 cos 2(phi - psi). Rejection sampling, because
 * the accept rate is above 80% and inverting the CDF is not.
 */
const samplePhi = (rng: Rng, psi: number, v2: number) => {
  const ceiling = 1 + 2 * v2;
  for (let i = 0; i < 24; i++) {
    const phi = rng() * TAU;
    if (rng() * ceiling < 1 + 2 * v2 * Math.cos(2 * (phi - psi))) return phi;
  }
  return rng() * TAU;
};

type Track = {
  /** Start point in the event frame: transverse x, transverse y, along the beam. */
  ox: number;
  oy: number;
  oz: number;
  /** Arc length already flown before this track starts — a daughter inherits it. */
  s0: number;
  phi: number;
  eta: number;
  pt: number;
  /** Charge, or 0 for a neutral drawn as a straight line. */
  q: number;
  alpha: number;
  /** Fixed length, for a track that ends by decaying rather than by leaving. */
  len?: number;
};

/**
 * How far a track is worth drawing: whichever comes first of leaving the
 * tracking volume, closing a full turn, or the global cap. The transverse
 * distance from the start of a helix is 2R sin(psi/2), so this is a scan over a
 * closed form rather than a walk along the geometry.
 */
const arcLimit = (t: Track, R: number, sinhEta: number) => {
  const cap = Math.min(ARC_MAX, TURN_CAP * TAU * R);
  // Slightly conservative for a daughter: its distance from the decay point is
  // added to the decay point's distance from the vertex rather than composed
  // with it. A decay length is a fifth of the volume, so the error is small and
  // always in the direction of stopping a track early, which is the safe one.
  const r0 = Math.hypot(t.ox, t.oy, t.oz);
  for (let k = 1; k <= 32; k++) {
    const s = (cap * k) / 32;
    const rt = 2 * R * Math.abs(Math.sin(s / (2 * R)));
    if (r0 + Math.hypot(rt, s * sinhEta) > R_DET) return s;
  }
  return cap;
};

/**
 * Writes one track into `out` as SEGMENTS line segments and returns the cursor.
 * A neutral (q of 0) is a straight line, which is also what makes the V0
 * topology read: the parent is drawn faintly, the daughters open away from a
 * point that is visibly not the vertex.
 */
const writeTrack = (out: Float32Array, cursor: number, t: Track, origin: Vec3) => {
  const R = Math.max(0.19, KR * t.pt);
  const sinhEta = Math.sinh(t.eta);
  const cphi = Math.cos(t.phi);
  const sphi = Math.sin(t.phi);
  const sMax = t.len ?? arcLimit(t, R, sinhEta);
  /* Where the palette sits on the momentum spectrum, and it is worth a note
     because the first choice made the whole frame one colour. The spectrum has
     a median near 0.32 and a p90 near 0.74; mapping warmth over 0.22 to 1.5 put
     even the ninetieth percentile at a third warm, so effectively every track
     drew in the cool ink and the two-ink scheme did nothing. Straddling the
     median instead gives navy for the soft spray, bronze for the hard tracks
     and a real gradient between them. */
  const warmth = smoothstep(0.18, 1.25, t.pt);

  /* Hard tracks are drawn a little heavier as well as warmer. It is the same
     signal twice, which is the point: momentum is the only thing this picture
     ranks, so it should be legible without having to resolve the colour. */
  const width = 0.82 + 0.55 * warmth;

  // SEGMENTS + 1 points, walked in order and emitted as SEGMENTS segments.
  let px = 0;
  let py = 0;
  let pz = 0;
  let pa = 0;
  let i = cursor;

  for (let j = 0; j <= SEGMENTS; j++) {
    const frac = j / SEGMENTS;
    const s = sMax * frac;

    let tx: number;
    let ty: number;
    if (t.q === 0) {
      tx = t.ox + s * cphi;
      ty = t.oy + s * sphi;
    } else {
      /* A charged particle in a field along the beam turns at a constant rate in
         the transverse plane: after arc length s it has swept psi = s/R, moved
         R sin(psi) along its original direction and R(1 - cos psi) sideways.
         Which side is the charge. */
      const psi = s / R;
      const along = R * Math.sin(psi);
      const side = t.q * R * (1 - Math.cos(psi));
      tx = t.ox + along * cphi - side * sphi;
      ty = t.oy + along * sphi + side * cphi;
    }
    const tz = t.oz + s * sinhEta;

    const x = origin[0] + E1[0] * tx + E2[0] * ty + B[0] * tz;
    const y = origin[1] + E1[1] * tx + E2[1] * ty + B[1] * tz;
    const z = origin[2] + E1[2] * tx + E2[2] * ty + B[2] * tz;
    // Taper the far end so a track that runs out of volume dissolves instead of
    // stopping. Nothing in a detector ends in a full-brightness full stop.
    const a = t.alpha * (1 - smoothstep(0.7, 1.0, frac) * 0.85);

    if (j > 0) {
      out[i] = px;
      out[i + 1] = py;
      out[i + 2] = pz;
      out[i + 3] = x;
      out[i + 4] = y;
      out[i + 5] = z;
      out[i + 6] = t.s0 + sMax * ((j - 1) / SEGMENTS);
      out[i + 7] = t.s0 + s;
      out[i + 8] = pa;
      out[i + 9] = a;
      out[i + 10] = warmth;
      out[i + 11] = width;
      i += FLOATS_PER_SEG;
    }

    px = x;
    py = y;
    pz = z;
    pa = a;
  }

  return i;
};

/** Polylines held back from the multiplicity for the V0s and the dijet. */
const V0_BUDGET = 12;
const JET_BUDGET = 24;

/**
 * One jet: a single hard-scattered parton, seen as the collimated spray of
 * hadrons it fragments into.
 *
 * The momentum is shared among the fragments by a function that falls steeply,
 * so a jet is one or two hard particles and a handful of soft ones rather than
 * n equal pieces — which is why a real jet reads as a spear with a halo around
 * it instead of a bundle of identical lines. The hard fragments hug the axis
 * and the soft ones spread to the edge of the cone, for the same reason.
 */
const addJet = (
  tracks: Track[],
  rng: Rng,
  phi: number,
  eta: number,
  pt: number,
  cone: number,
  n: number,
  alphaScale: number,
) => {
  const zs: number[] = [];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const z = Math.pow(rng(), 2.2);
    zs.push(z);
    sum += z;
  }
  sum = sum || 1;

  for (let i = 0; i < n; i++) {
    const z = zs[i] / sum;
    const r = cone * Math.sqrt(rng()) * (1 - 0.7 * Math.min(1, z * n * 0.6));
    const a = rng() * TAU;
    const fragPt = Math.max(0.25, pt * z);
    tracks.push({
      ox: 0,
      oy: 0,
      oz: 0,
      s0: 0,
      phi: phi + r * Math.cos(a),
      eta: eta + r * Math.sin(a),
      pt: fragPt,
      q: rng() < 0.5 ? 1 : -1,
      alpha: (0.42 + 0.6 * smoothstep(0.18, 1.25, fragPt)) * alphaScale,
    });
  }
};

export type EventGeometry = {
  /** World position of the interaction point. */
  vertex: Vec3;
  /** Polylines written, so the draw call can stop at the end of the real data. */
  trackCount: number;
};

/**
 * Builds one collision into `out` starting at float offset `base`.
 * `budget` caps the multiplicity — the adaptive quality controller lowers it on
 * a struggling GPU, which is invisible because no two events have the same
 * multiplicity anyway.
 */
export const buildEvent = (
  out: Float32Array,
  base: number,
  rng: Rng,
  budget: number,
): EventGeometry => {
  /* Centrality: 0 is a head-on collision, 1 is a graze. Triangular around
     mid-central, because that is both the interesting region and the one where
     flow is largest — a head-on event is round and a peripheral one is empty. */
  const c = (rng() + rng()) / 2;
  const v2 = 0.02 + 0.42 * c * (1 - c);
  const psi = rng() * TAU; // the reaction plane, fresh every event
  const mult = Math.min(
    MAX_TRACKS - V0_BUDGET - JET_BUDGET,
    Math.max(10, Math.round(budget * (1 - 0.72 * c * c))),
  );

  /* The luminous region is long and thin: beams overlap along the axis, not
     across it. Successive events land at slightly different points along the
     beam, which is both true and the reason two overlapping events read as two
     events rather than as one muddy one. */
  const along = (rng() - 0.5) * 0.9;
  const across1 = (rng() - 0.5) * 0.16;
  const across2 = (rng() - 0.5) * 0.16;
  const vertex: Vec3 = [
    IP[0] + E1[0] * across1 + E2[0] * across2 + B[0] * along,
    IP[1] + E1[1] * across1 + E2[1] * across2 + B[1] * along,
    IP[2] + E1[2] * across1 + E2[2] * across2 + B[2] * along,
  ];

  const tracks: Track[] = [];

  for (let i = 0; i < mult; i++) {
    const pt = samplePt(rng);
    tracks.push({
      ox: 0,
      oy: 0,
      oz: 0,
      s0: 0,
      phi: samplePhi(rng, psi, v2),
      eta: gauss(rng) * 1.15,
      pt,
      q: rng() < 0.5 ? 1 : -1,
      alpha: (0.42 + 0.6 * smoothstep(0.22, 1.5, pt)) * (0.85 + rng() * 0.3),
    });
  }

  /* Strange neutrals, and the reason this is a heavy-ion event and not a spark.
     A lambda leaves no track — it flies a few centimetres, decays to a proton
     and a pion, and all a detector ever sees is two charged tracks opening from
     a point that is not the vertex. The proton takes most of the momentum, so
     one daughter runs nearly straight and the other swings wide: that asymmetry
     is what separates a lambda from a neutral kaon on sight. */
  const nV0 = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < nV0 && tracks.length + 3 <= MAX_TRACKS; i++) {
    const pt = 0.35 + samplePt(rng) * 1.5;
    const phi = samplePhi(rng, psi, v2);
    const eta = gauss(rng) * 0.9;
    const flight = 0.3 + rng() * 0.55;

    tracks.push({
      ox: 0,
      oy: 0,
      oz: 0,
      s0: 0,
      phi,
      eta,
      pt,
      q: 0,
      alpha: 0.1,
      len: flight,
    });

    // Where the parent got to before it decayed, in the event frame.
    const dx = flight * Math.cos(phi);
    const dy = flight * Math.sin(phi);
    const dz = flight * Math.sinh(eta);
    const open = 0.09 + rng() * 0.05;
    const side = rng() < 0.5 ? 1 : -1;

    tracks.push({
      ox: dx,
      oy: dy,
      oz: dz,
      s0: flight,
      phi: phi - open * side,
      eta: eta - 0.05 * side,
      pt: pt * 0.78,
      q: side,
      alpha: 0.62,
    });
    tracks.push({
      ox: dx,
      oy: dy,
      oz: dz,
      s0: flight,
      phi: phi + open * 3.4 * side,
      eta: eta + 0.2 * side,
      pt: pt * 0.22,
      q: -side,
      alpha: 0.5,
    });
  }

  /* Hard scattering, and the only structure in this picture that is not spray.
     Two partons recoil off each other back to back in azimuth, and each one
     fragments into a tight cone of hadrons — so the event stops being an even
     fan and grows an axis.

     Then the part that makes it a *heavy-ion* event rather than a proton one.
     A parton crossing the medium loses energy roughly in proportion to how much
     of it it crosses, and the overlap almond is thin across the reaction plane
     and long along it. A dijet lying in the plane therefore comes out close to
     balanced, and one lying across it arrives badly lopsided — which is the
     single most famous measurement in the field, and it is legible here without
     anybody having to be told: one side is a spear, the other is a smudge.

     The quenched side does not simply vanish, either. The energy it lost comes
     back as extra soft fragments at wider angles, so it is drawn broader, more
     numerous and dimmer rather than shorter. Hard scattering also scales with
     the number of nucleon collisions, so central events get jets more often. */
  const jetRoom = MAX_TRACKS - tracks.length - JET_BUDGET;
  if (jetRoom >= 0 && rng() < 0.35 + 0.4 * (1 - c)) {
    const phiJet = rng() * TAU;
    /* Modest on purpose. A harder parton would put every one of its fragments
       past the top of the warmth ramp, and a jet drawn entirely in the hot ink
       at the heaviest width is a solid wedge rather than a jet. Around fifteen
       GeV the steep fragmentation lands the leading particle well above the ramp
       and the tail of soft ones below it, so the cone has a bright core and a
       cooler halo — which is both what one looks like and what makes it read as
       a bundle of tracks instead of a shape. */
    const ptJet = 6 + rng() * 12;
    const outOfPlane = Math.abs(Math.sin(phiJet - psi));
    const quench = (0.12 + 0.5 * outOfPlane) * (1 - 0.5 * c);
    const nNear = 5 + Math.floor(rng() * 4);

    addJet(tracks, rng, phiJet, gauss(rng) * 0.6, ptJet, 0.22, nNear, 0.95);
    /* Rapidity is sampled independently for the away side rather than mirrored:
       the two partons are back to back in the transverse plane, but the frame
       they scattered in is boosted along the beam by an unknown amount, so only
       the azimuthal correlation survives. */
    addJet(
      tracks,
      rng,
      phiJet + Math.PI + gauss(rng) * 0.1,
      gauss(rng) * 0.7,
      ptJet * (1 - quench),
      0.34 * (1 + 1.3 * quench),
      nNear + Math.round(5 * quench),
      1.1 - 0.35 * quench,
    );
  }

  let cursor = base;
  for (const t of tracks) cursor = writeTrack(out, cursor, t, vertex);

  return { vertex, trackCount: tracks.length };
};

/**
 * The beam axis itself, built once and drawn under every event. It is the one
 * piece of the picture that does not come and go, and without it the sprays
 * have nothing to be sprays *from*.
 */
export const writeBeamAxis = (out: Float32Array, base: number) => {
  const span = 5.5;
  let i = base;
  // Brightest where the beams are about to meet, falling away along the axis.
  const fade = (u: number) => 0.09 * (1 - smoothstep(0.0, span, Math.abs(u)));
  for (let j = 0; j < SEGMENTS; j++) {
    const a = -span + (2 * span * j) / SEGMENTS;
    const b = -span + (2 * span * (j + 1)) / SEGMENTS;
    out[i] = IP[0] + B[0] * a;
    out[i + 1] = IP[1] + B[1] * a;
    out[i + 2] = IP[2] + B[2] * a;
    out[i + 3] = IP[0] + B[0] * b;
    out[i + 4] = IP[1] + B[1] * b;
    out[i + 5] = IP[2] + B[2] * b;
    // Never gated by the growth front: the axis is there before the event is.
    out[i + 6] = -6;
    out[i + 7] = -6;
    out[i + 8] = fade(a);
    out[i + 9] = fade(b);
    out[i + 10] = 0.3;
    out[i + 11] = 0.75;
    i += FLOATS_PER_SEG;
  }
};

/** The collision axis, for placing the incoming bunches along it. */
export const BEAM_DIR: Vec3 = B;
/** The nominal interaction point, before the per-event jitter along the beam. */
export const BEAM_IP: Vec3 = IP;
