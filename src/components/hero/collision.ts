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
/* Turned to run further into the screen than across it.
   The camera is fixed by the framing in the renderer, so the way to look down
   the barrel rather than at its side is to rotate the machine, not the eye. At
   the old angle the beam ran mostly left to right and both endcaps sat near the
   edges of the frame; leaning it away puts the near end large and open on the
   left and the far wheel small, high and close to face on — which is the view
   along a tube, and what makes the far endcap read as a disc rather than as an
   ellipse glimpsed edge on. */
const BEAM: Vec3 = [0.62, -0.21, 0.755];
/**
 * Where the beams cross, and how far back the camera therefore stands.
 *
 * This is a scale decision more than a position one, and getting it wrong is
 * what made the machine unreadable. The barrel has a radius of 4; at the old
 * depth the camera sat 4.1 from the interaction point, so the barrel projected
 * to about 2.8 times the height of the frame and the camera was closer to the
 * wall than the wall was to the axis. Standing that close to a curved surface,
 * two panels fill the screen — the endcap wheel, the cell granularity, the ribs,
 * the slabs are all real and all off the edges. Detail does not survive a close
 * perspective on a big object; there is no brightness or density that fixes it.
 *
 * The reference event displays are not shot from inside either, however
 * immersive they look. They sit around one and a half barrel radii out, which is
 * the distance at which the whole cross-section, a wheel and the granularity all
 * appear at once. So the camera now stands 6.3 from the beam axis against a
 * radius of 4, and the barrel projects to about 1.4 frame heights: large enough
 * to run past the edges and be something you are inside the volume of, small
 * enough that what it is made of is legible.
 *
 * x and y are then set so the vertex still lands right of centre and below the
 * headline, which is a fixed fraction of the frame and therefore has to grow
 * with the depth rather than stay put.
 */
const IP: Vec3 = [1.99, -0.53, 5.9];

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
  /** The reaction plane this event's tracks were drawn about. */
  psi: number;
  /** Elliptic flow strength about that plane. */
  v2: number;
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
  /**
   * Fraction of the trimmings to keep, alongside the bulk `budget`.
   *
   * The V0 decays and the jet fragments had fixed counts, so the quality
   * controller's one real lever moved the soft multiplicity and left roughly a
   * third of the event's geometry standing. On a phone that is the difference
   * between a knob that works and one that half works: the controller would
   * wind multiplicity all the way down to its floor, watch the frame time
   * barely move, and start eating resolution instead — which is how the picture
   * ended up soft *and* slow rather than either one.
   *
   * Counts are rounded, never resampled, so the random sequence is untouched
   * and an event at low detail is the same event with fewer fragments.
   */
  detail = 1,
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
  /* Tightened from 0.9 now that there is a visible detector for the vertex to
     sit inside. The spread is real — a beam spot is centimetres long, so
     vertices genuinely scatter along z — but at 0.9 the wander was most of the
     inner barrel's length, and collisions kept happening visibly off-centre in
     an apparatus built around them. Enough to keep two overlapping events
     reading as two, not enough to leave the machine. */
  const along = (rng() - 0.5) * 0.30;
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
  const nV0 = Math.max(1, Math.round((2 + Math.floor(rng() * 3)) * detail));
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
    const nNear = Math.max(2, Math.round((5 + Math.floor(rng() * 4)) * detail));

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

/* psi and v2 go out with the geometry so the calorimeter can be lit from the
     same two numbers the tracks were drawn from. A deposit pattern invented
     separately would be decoration; this one is the same distribution sampled
     twice, so the blocks light up where the spray actually went. */
  return { vertex, trackCount: tracks.length, psi, v2 };
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

/* ── The detector ─────────────────────────────────────────────────────────
   One barrel, cut open along the top, with a wheel closing either end.

   The cutaway is the whole idea and not a stylistic flourish. A closed shell has
   no inside — you look at a tube, the event is hidden behind it, and any second
   cylinder drawn within is just another tube, which is exactly why the earlier
   nested version read as redundant. Slice the near-upper side away and the same
   geometry becomes a room: you see through the opening, down onto the event, and
   on to the far wall behind it. That is how every event display worth looking at
   is composed, and it is the difference between drawing a machine and drawing
   the inside of one.

   Where the opening goes is measured rather than chosen. The camera sits at
   about ten degrees below the transverse axis and up is ninety, so the gap is
   centred at forty — between the viewer and straight up — and spans a hundred
   and eighty degrees. Half the barrel, and the half that was in the way.

   The wireframe stays closed while the shaded wall is cut. Rings that stop at
   the cut would leave the barrel with no silhouette on the open side, and the
   full rings are what say the tube continues past the piece that was removed.

   Scale is chosen so one object serves two shots. At the hero the barrel is
   nearly twice the height of the frame, so you are inside it; by the end of the
   scroll the camera has retreated far enough for the whole of it to sit in the
   frame at once. Nothing fades in or swaps — it is one machine seen from two
   distances. */

const BARREL_SEGS = 44;
/* Wide enough that the camera stands inside it. The tracking volume is still
   R_DET, so the spray stops well within this — which is the real arrangement
   anyway: the tracker is a small thing at the middle of a large calorimeter. */
/* Long and narrow, which is what one actually is: ATLAS is 25m across and 46m
   long, near enough a 1:1.8 ratio, and CMS is not far off. The earlier 4.0 by
   3.3 was wider than it was long — a drum, and a drum seen from nearby is a
   wall. Slimming it and stretching it does two things at once: the whole
   cross-section now fits the height of the frame, so the ring of panels and the
   wheel are legible; and the length runs away down the beam in perspective,
   which is the thing that says you are looking along a machine. */
/* Now 2.1 against a half-length of 5.2 — a diameter of 4.2 to a length of 10.4,
   so 1:2.5, slimmer than either real experiment and a composition choice rather
   than a claim. Note the tracking volume is 2.6, larger than this, so the spray
   runs out past the wall instead of stopping inside it. That is also what a real
   display shows: the hard tracks carry on through the calorimeter and into the
   muon system, which is what the slabs standing off outside are there for. */
const BARREL_R = 2.1;
/* A second shell inboard of the first, and ribs spanning the gap between them.
   Standing inside a single smooth tube is ambiguous — it could be a tube, a
   dome, a tunnel. What says machine is depth in the wall: a layer behind the
   layer, with structure bridging the two, all of it translucent enough that the
   collision reads straight through. This is also simply what is there; a barrel
   calorimeter is built in concentric samplings and the ribs are the supports
   between them. */
const INNER_R = 1.45;
const RIB_S = [-5.2, -2.6, 0, 2.6, 5.2];
const RIB_SPOKES = 16;
/* Short enough that a wheel is in shot.
   At 5.0 the barrel was long and correctly proportioned and both endcaps sat
   outside the frame — the beam runs mostly across the picture, so a station five
   units along it lands well past the edge. The gold wheel is the most
   recognisable thing in the machine and the piece that carries the site's own
   colour, so it has to be visible from inside, and a squatter barrel is the
   price. */
const BARREL_HALF = 5.2;
const BARREL_RINGS = [-5.2, -2.6, 0, 2.6, 5.2];
const BARREL_RAILS = 10;
const BARREL_RAIL_SEGS = 4;
/* No cutaway. There was one, and the reason it existed was a mistake about
   where the camera was standing: at the hero it sits 3.02 units from the beam
   axis while the barrel had a radius of 2.6, so it was outside the machine
   looking at an opaque wall, and a hole had to be cut in that wall for the
   collision to be visible at all.

   Put the camera inside the barrel instead and the problem stops existing.
   Nothing is between the viewer and the axis, so nothing has to be removed, and
   what you see is the inner surface of the shell wrapping past you and running
   away down the beam — which is the shot, and is what an event display is
   actually a picture of. The wall behind your shoulder is the one you then
   retreat out through as the page scrolls. */

/** Endcap wheels. Two rings and a lot of spokes — this is the shape that reads. */
const CAP_RADII = [0.4, 1.25];
const CAP_SPOKES = 16;

/** Feet, straight off the engineering drawing. Two per side, under the barrel. */
const LEG_S = [-3.4, 3.4];
const LEG_DROP = 1.3;

export const DETECTOR_SEGS =
  2 * BARREL_RINGS.length * BARREL_SEGS +
  BARREL_RAILS * BARREL_RAIL_SEGS +
  RIB_S.length * RIB_SPOKES +
  2 * (CAP_RADII.length * BARREL_SEGS + CAP_SPOKES) +
  LEG_S.length * 2 * 2;

/** A point on a cylinder about the beam: `s` along it from the IP, `a` around it. */
const barrelPoint = (s: number, a: number, R: number): Vec3 => {
  const c = Math.cos(a) * R;
  const d = Math.sin(a) * R;
  return [
    IP[0] + B[0] * s + E1[0] * c + E2[0] * d,
    IP[1] + B[1] * s + E1[1] * c + E2[1] * d,
    IP[2] + B[2] * s + E1[2] * c + E2[2] * d,
  ];
};

/**
 * Writes a polyline of static structure. Arc is -6 at both ends, which is the
 * same flag the beam axis uses: it puts the segment permanently ahead of the
 * growth front so it is never gated by an event, and the vertex shader reads it
 * to mean "this does not move", which matters now that hue is a Doppler shift.
 * Structure has no velocity and must not be tinted as though it had one.
 */
const writeStatic = (
  out: Float32Array,
  cursor: number,
  pts: Vec3[],
  alpha: number,
  width: number,
) => {
  let i = cursor;
  for (let j = 0; j < pts.length - 1; j++) {
    const a = pts[j];
    const b = pts[j + 1];
    out[i] = a[0];
    out[i + 1] = a[1];
    out[i + 2] = a[2];
    out[i + 3] = b[0];
    out[i + 4] = b[1];
    out[i + 5] = b[2];
    out[i + 6] = -6;
    out[i + 7] = -6;
    out[i + 8] = alpha;
    out[i + 9] = alpha;
    out[i + 10] = 0;
    out[i + 11] = width;
    i += FLOATS_PER_SEG;
  }
  return i;
};

const ring = (s: number, R: number, n: number): Vec3[] => {
  const pts: Vec3[] = [];
  for (let k = 0; k <= n; k++) pts.push(barrelPoint(s, (k / n) * TAU, R));
  return pts;
};

/** Builds the detector wireframe into `out` at float offset `base`. */
export const writeDetector = (out: Float32Array, base: number) => {
  let i = base;

  // The barrel. End rings carry the silhouette, so they run heavier.
  for (const s of BARREL_RINGS) {
    const edge = Math.abs(s) > 4.8;
    /* Only the ends are drawn with any weight. The intermediate rings were
       there to describe the length of the tube and they were doing it as
       hoops on a barrel — combined with the rails and the lit module edges the
       shell came out as framing rather than as a wall. The silhouette is what a
       solid surface needs from a line; the middle of it needs nothing. */
    i = writeStatic(out, i, ring(s, BARREL_R, BARREL_SEGS), edge ? 0.34 : 0.04, edge ? 0.65 : 0.45);
    i = writeStatic(out, i, ring(s, INNER_R, BARREL_SEGS), edge ? 0.24 : 0.03, 0.5);
  }

  /* Ribs between the two shells. Standing inside, these are the single strongest
     cue that the surface wrapping past you is a built thing and not a backdrop:
     they run away down the beam in perspective and give the wall a rhythm. */
  for (const s of RIB_S) {
    for (let k = 0; k < RIB_SPOKES; k++) {
      const a = (k / RIB_SPOKES) * TAU;
      i = writeStatic(out, i, [barrelPoint(s, a, INNER_R), barrelPoint(s, a, BARREL_R)], 0.07, 0.45);
    }
  }
  for (let r = 0; r < BARREL_RAILS; r++) {
    const a = ((r + 0.5) / BARREL_RAILS) * TAU;
    const pts: Vec3[] = [];
    for (let k = 0; k <= BARREL_RAIL_SEGS; k++) {
      pts.push(barrelPoint(-BARREL_HALF + (2 * BARREL_HALF * k) / BARREL_RAIL_SEGS, a, BARREL_R));
    }
    i = writeStatic(out, i, pts, 0.035, 0.45);
  }

  // The wheels closing either end.
  for (const s of [-BARREL_HALF, BARREL_HALF]) {
    for (const R of CAP_RADII) i = writeStatic(out, i, ring(s, R, BARREL_SEGS), 0.22, 0.5);
    for (let k = 0; k < CAP_SPOKES; k++) {
      const a = (k / CAP_SPOKES) * TAU;
      i = writeStatic(
        out, i,
        [barrelPoint(s, a, CAP_RADII[0]), barrelPoint(s, a, BARREL_R)],
        0.17, 0.45,
      );
    }
  }

  /* Feet. Two struts dropping from the underside to a floor that is not drawn,
     which is enough — a machine standing on something reads as a machine, and
     one floating in space reads as a diagram. Straight out of the elevation
     drawing this is otherwise quoting. */
  for (const s of LEG_S) {
    const foot = barrelPoint(s, (270 * Math.PI) / 180, BARREL_R);
    const down: Vec3 = [-E2[0], -E2[1], -E2[2]];
    const base2: Vec3 = [
      foot[0] + down[0] * LEG_DROP,
      foot[1] + down[1] * LEG_DROP,
      foot[2] + down[2] * LEG_DROP,
    ];
    i = writeStatic(out, i, [foot, base2], 0.20, 0.55);
    // A short pad at the bottom, along the beam.
    i = writeStatic(
      out, i,
      [
        [base2[0] - B[0] * 0.4, base2[1] - B[1] * 0.4, base2[2] - B[2] * 0.4],
        [base2[0] + B[0] * 0.4, base2[1] + B[1] * 0.4, base2[2] + B[2] * 0.4],
      ],
      0.20, 0.55,
    );
  }

  return i;
};

/* ── The accelerator ring ─────────────────────────────────────────────────
   The machine the detector is a bead on.

   A barrel alone, however well drawn, is one instrument. What makes the picture
   read as a collider is the ring: kilometres of tunnel curving away past the
   frame, with the experiment sitting at one point on it. It is also the correct
   relationship — the beam axis through the interaction point is the tangent to
   this circle, so the two objects are not merely near each other, one is
   literally the derivative of the other at that point.

   Built in the plane spanned by the beam and E1. E1 is the cross product of
   world up with the beam, so it has no vertical component at all and the ring
   comes out level, which is what an accelerator is. The centre sits one radius
   off along it, which puts the curve sweeping away to one side rather than
   wrapping the detector symmetrically — the view down a tunnel, not a diagram of
   a circle.

   Radius is a composition decision rather than a scale model. At true proportion
   a 27km ring against a 40m detector would put the curve so far outside the
   frame that it would render as two straight lines, which says nothing. At this
   size the curvature is legible by the end of the pull-back and the barrel still
   reads as small against it, which is the impression that is actually true.

   Faded in with the scroll, because it is meaningless up close: standing inside
   the detector, the tunnel is two lines running off past your shoulders. It
   earns its place only in the wide shot. */

const ACC_R = 17.0;
const ACC_SEGS = 128;
const ACC_WALLS = [ACC_R - 0.34, ACC_R + 0.34];
const ACC_TIES = 32;

export const ACCEL_SEGS = ACC_WALLS.length * ACC_SEGS + ACC_TIES;

/** A point on the accelerator circle: `th` around it, at radius `r`. */
const accPoint = (th: number, r: number): Vec3 => {
  const c = Math.cos(th);
  const sn = Math.sin(th);
  // centre = IP + ACC_R * E1, so th = 0 lands exactly on the interaction point
  return [
    IP[0] + E1[0] * (ACC_R - r * c) + B[0] * r * sn,
    IP[1] + E1[1] * (ACC_R - r * c) + B[1] * r * sn,
    IP[2] + E1[2] * (ACC_R - r * c) + B[2] * r * sn,
  ];
};

/** Builds the accelerator ring into `out` at float offset `base`. */
export const writeAccelerator = (out: Float32Array, base: number) => {
  let i = base;
  for (const r of ACC_WALLS) {
    const pts: Vec3[] = [];
    for (let k = 0; k <= ACC_SEGS; k++) pts.push(accPoint((k / ACC_SEGS) * TAU, r));
    i = writeStatic(out, i, pts, 0.16, 0.5);
  }
  // Cross-ties: the tunnel is built in segments, and the ticks are what say so.
  for (let k = 0; k < ACC_TIES; k++) {
    const th = (k / ACC_TIES) * TAU;
    i = writeStatic(out, i, [accPoint(th, ACC_WALLS[0]), accPoint(th, ACC_WALLS[1])], 0.13, 0.45);
  }
  return i;
};

/* ── Detector walls ───────────────────────────────────────────────────────
   The shaded surfaces, as distinct from the wireframe above.

   A wireframe alone says where the machine is; it does not say the machine is
   made of something. What reads as a detector is the translucent panelled shell
   — modules with gaps between them, catching light at grazing incidence and
   letting you see the far wall through the near one. That needs real surfaces,
   so this is triangle geometry with its own pass.

   Cut away over the same hundred and eighty degrees the comment above describes,
   which is what turns the barrel into something you are looking into.

   Modules rather than a smooth tube, and the gaps are the point: a moulded
   cylinder reads as a shape, a wall of separately mounted panels reads as
   something built. Each quad carries its own cell coordinate so the fragment
   shader can inset it and put a rim just inside the seam.

   Normals are per vertex because the shading is entirely a function of how
   obliquely you look through the panel. Face-on you cross one wall thickness and
   it is nearly invisible; edge-on the ray runs along the wall and it is at its
   densest. That single term is what makes a translucent cylinder read as a
   cylinder rather than as a flat ring. */

/** pos (3) | normal (3) | cell uv (2) | barrel axis (3) */
export const FLOATS_PER_SURF_VERT = 11;

/* Far fewer, far larger panels. At twelve by nine the wall had over a hundred
   modules on it and the seams, not the material, were what you saw — a fence
   rather than a shell. A real one is built from big pieces. */
const WALL_SECTORS = 16;
const WALL_SLICES = 5;
const CAP_WALL_SECTORS = 16;
/* One band per sector, so each module is a single long wedge running from the
   beam pipe out to the rim — a petal, which is what an endcap wheel is made of
   and what makes it read as a flower of panels rather than as a dartboard. */
const CAP_WALL_RINGS = 1;

/* Split, because the two are drawn separately: the shells in steel and the
   endcap petals in gold. Walls are written first and the caps follow, so the
   renderer can issue two draws over one buffer with different uniforms. */
/* Readout cells on the inner shell: the small bright blocks scattered through
   the barrel of any real event display. They are the single cheapest thing that
   makes an interior look instrumented rather than upholstered — a smooth shell
   is a room, a shell speckled with granularity is a detector. Fixed positions
   from a fixed seed, so they are part of the machine rather than part of any one
   event, which is also what they are: the segmentation is always there. */
/* Far fewer than the first pass, and much smaller. The camera stands just
   outside the near endcap, so a block at this end of the barrel is a couple of
   units away and fills a chunk of the frame — ninety-six of them scattered at
   the old size read as confetti blowing through the shot rather than as
   granularity on a wall. Weighted down the barrel, away from the camera, so
   they recede toward the far wheel instead of crowding the near field. */
const CELL_COUNT = 26;

/* Muon chambers: the big flat slabs standing off outside the barrel.
   These are the element every real event display is framed by and the one thing
   still missing here — large rectangular planes, layered, catching the corners
   of the picture and giving the shell something to be inside of. Without them a
   barrel floats; with them it is installed in a hall. Flat, deliberately: they
   are the only part of the machine that is not a surface of revolution, and that
   contrast is most of what stops the picture reading as a tunnel. */
const SLABS: { a: number; s: number; r: number; hl: number; hw: number }[] = [
  { a: 50, s: 0.0, r: 2.9, hl: 4.6, hw: 0.95 },
  { a: 110, s: 1.1, r: 3.4, hl: 4.0, hw: 1.0 },
  { a: 170, s: -1.3, r: 3.1, hl: 4.2, hw: 0.95 },
  { a: 240, s: -0.6, r: 3.0, hl: 4.4, hw: 0.95 },
  { a: 300, s: 0.5, r: 3.5, hl: 3.8, hw: 0.9 },
  { a: 355, s: 1.4, r: 2.85, hl: 4.4, hw: 0.9 },
];
/* Two panels to a plate, not six. These are the largest things in the picture
   and the camera is level with them, so a grid drawn across one is a grid
   across a third of the frame — which is the fence again, and it fights the
   flat unbroken plate that is the whole reason they are here. */
const SLAB_PANELS = 2;
/* Muon chambers come in layered stations — two plates with air between them, so
   a track's direction can be measured rather than just its arrival. Drawing the
   pair is what makes them unmistakably not more shell: a shell is one surface,
   and no amount of tinting will say that as plainly as a second plate standing
   off behind the first with a gap you can see through. */
const SLAB_LAYERS = [0, 0.44];

/* ── Gold modules ─────────────────────────────────────────────────────────
   The bright blocks that make a detector look instrumented.

   Two families, in the two places a real machine puts them. The tile blocks sit
   in the gap between the shells, in rings at stations along the beam: looking
   down the barrel they recede in rows, which is the single strongest cue that
   the tube has length. The pixel modules pack tight around the beam pipe either
   side of the vertex, which is where the small bright squares in an event
   display are and what makes the beam line read as running through apparatus.

   Rings are staggered half a sector at alternate stations. Aligned, they would
   form columns down the barrel and the eye would read the columns instead of
   the modules — the fence problem again, one dimension down.

   Gold because they are the same accent the endcap wheels are, and giving the
   interior a second point of that colour stops the wheel reading as the only
   deliberate thing in an otherwise blue machine. */
/* Small, and none of them behind the interaction point past about a unit — the
   two stations nearest the camera were a metre and a half from the lens and
   came out the size of the headline. What is wanted is rows receding toward the
   far wheel, and a row you are standing inside of does not recede. */
const TILE_R = 1.78;
const TILE_STATIONS = [-1.4, 1.4, 2.8, 4.2];
const TILE_PER_RING = 6;
const TILE_HS = 0.20;
const TILE_HV = 0.13;

const PIX_R = 0.34;
const PIX_STATIONS = [-1.6, -0.8, 0.8, 1.6];
const PIX_PER_RING = 6;
const PIX_HS = 0.14;
const PIX_HV = 0.07;

export const WALL_SURF_VERTS = 6 * 2 * WALL_SECTORS * WALL_SLICES;
export const CAP_SURF_VERTS = 6 * 2 * CAP_WALL_SECTORS * CAP_WALL_RINGS;
export const CELL_SURF_VERTS = 6 * CELL_COUNT;
export const SLAB_SURF_VERTS = 6 * SLABS.length * SLAB_LAYERS.length * SLAB_PANELS;
export const MODULE_SURF_VERTS =
  6 * (TILE_STATIONS.length * TILE_PER_RING + PIX_STATIONS.length * PIX_PER_RING);
export const SURFACE_VERTS =
  WALL_SURF_VERTS + CAP_SURF_VERTS + CELL_SURF_VERTS + SLAB_SURF_VERTS + MODULE_SURF_VERTS;

/** Radius the calorimeter blocks sit at. */
const CAL_RADIUS = INNER_R - 0.14;

const radial = (a: number): Vec3 => [
  E1[0] * Math.cos(a) + E2[0] * Math.sin(a),
  E1[1] * Math.cos(a) + E2[1] * Math.sin(a),
  E1[2] * Math.cos(a) + E2[2] * Math.sin(a),
];

/* Where this point sits on the machine, in the machine's own coordinates:
   distance along the beam from the interaction point, azimuth about it, and
   distance out from the axis. Computed here, once, at build time, because the
   fragment shader needs all three to know whether a block is in the path of the
   spray and when the spray gets there — and deriving them there would mean
   handing the shader a second copy of the beam basis and paying for it every
   pixel.

   The radius is what lets a block be lit by its own arrival rather than by a
   single flash for the whole machine. Particles leave the vertex and travel
   outward at a finite speed, so the pixel modules against the beam pipe are hit
   before the calorimeter and the tile blocks after it, and the picture of that
   is a wave crossing the detector rather than a light switch. */
const barrelAxis = (p: Vec3): [number, number, number] => {
  const dx = p[0] - IP[0];
  const dy = p[1] - IP[1];
  const dz = p[2] - IP[2];
  const u = dx * E1[0] + dy * E1[1] + dz * E1[2];
  const v = dx * E2[0] + dy * E2[1] + dz * E2[2];
  return [
    dx * B[0] + dy * B[1] + dz * B[2],
    Math.atan2(v, u),
    Math.hypot(u, v),
  ];
};

const putVert = (out: Float32Array, i: number, p: Vec3, n: Vec3, u: number, v: number) => {
  const [s, phi, r] = barrelAxis(p);
  out[i] = p[0]; out[i + 1] = p[1]; out[i + 2] = p[2];
  out[i + 3] = n[0]; out[i + 4] = n[1]; out[i + 5] = n[2];
  out[i + 6] = u; out[i + 7] = v;
  out[i + 8] = s; out[i + 9] = phi; out[i + 10] = r;
  return i + FLOATS_PER_SURF_VERT;
};


const quad = (
  out: Float32Array, i: number,
  p00: Vec3, p10: Vec3, p11: Vec3, p01: Vec3,
  n0: Vec3, n1: Vec3,
) => {
  i = putVert(out, i, p00, n0, 0, 0);
  i = putVert(out, i, p10, n1, 1, 0);
  i = putVert(out, i, p11, n1, 1, 1);
  i = putVert(out, i, p00, n0, 0, 0);
  i = putVert(out, i, p11, n1, 1, 1);
  i = putVert(out, i, p01, n0, 0, 1);
  return i;
};

/**
 * One flat rectangular module mounted on the barrel at (s, a, R), facing in
 * toward the beam. Readout cells, tile blocks and muon chambers are all this
 * shape and differ only in size and where they sit, which is also true of the
 * real things.
 */
const boxAt = (
  out: Float32Array, i: number,
  s: number, a: number, R: number, hs: number, hv: number,
) => {
  const c = barrelPoint(s, a, R);
  // Tangential direction at this azimuth, and a normal pointing back at the beam.
  const v: Vec3 = [
    -E1[0] * Math.sin(a) + E2[0] * Math.cos(a),
    -E1[1] * Math.sin(a) + E2[1] * Math.cos(a),
    -E1[2] * Math.sin(a) + E2[2] * Math.cos(a),
  ];
  const n = radial(a);
  const nIn: Vec3 = [-n[0], -n[1], -n[2]];
  const at = (ds: number, dv: number): Vec3 => [
    c[0] + B[0] * ds * hs + v[0] * dv * hv,
    c[1] + B[1] * ds * hs + v[1] * dv * hv,
    c[2] + B[2] * ds * hs + v[2] * dv * hv,
  ];
  return quad(out, i, at(-1, -1), at(1, -1), at(1, 1), at(-1, 1), nIn, nIn);
};

/** Builds every shaded surface. Static, written once at construction. */
export const writeDetectorSurfaces = (out: Float32Array) => {
  let i = 0;

  // Both shells, whole. Translucent, so the collision reads straight through.
  for (const R of [BARREL_R, INNER_R]) {
    for (let c = 0; c < WALL_SECTORS; c++) {
      const a0 = (c / WALL_SECTORS) * TAU;
      const a1 = ((c + 1) / WALL_SECTORS) * TAU;
      const n0 = radial(a0);
      const n1 = radial(a1);
      for (let l = 0; l < WALL_SLICES; l++) {
        const t0 = -BARREL_HALF + (2 * BARREL_HALF * l) / WALL_SLICES;
        const t1 = -BARREL_HALF + (2 * BARREL_HALF * (l + 1)) / WALL_SLICES;
        i = quad(
          out, i,
          barrelPoint(t0, a0, R), barrelPoint(t0, a1, R),
          barrelPoint(t1, a1, R), barrelPoint(t1, a0, R),
          n0, n1,
        );
      }
    }
  }

  // The wheels, whole.
  for (const [s, sign] of [[-BARREL_HALF, -1], [BARREL_HALF, 1]] as const) {
    const n: Vec3 = [B[0] * sign, B[1] * sign, B[2] * sign];
    for (let c = 0; c < CAP_WALL_SECTORS; c++) {
      const a0 = (c / CAP_WALL_SECTORS) * TAU;
      const a1 = ((c + 1) / CAP_WALL_SECTORS) * TAU;
      for (let r = 0; r < CAP_WALL_RINGS; r++) {
        const r0 = CAP_RADII[0] + ((BARREL_R - CAP_RADII[0]) * r) / CAP_WALL_RINGS;
        const r1 = CAP_RADII[0] + ((BARREL_R - CAP_RADII[0]) * (r + 1)) / CAP_WALL_RINGS;
        i = quad(
          out, i,
          barrelPoint(s, a0, r0), barrelPoint(s, a1, r0),
          barrelPoint(s, a1, r1), barrelPoint(s, a0, r1),
          n, n,
        );
      }
    }
  }

  /* ── Readout cells: the calorimeter granularity on the inner shell.
     Fixed positions from a fixed seed, so they are part of the machine rather
     than part of any one event — which is also what they are. The segmentation
     is always there; only the energy in it comes and goes. */
  const rng = mulberry32(0x9e3779b9);
  for (let k = 0; k < CELL_COUNT; k++) {
    const sPos = BARREL_HALF * (-0.30 + 1.22 * rng());
    const a = rng() * TAU;
    i = boxAt(out, i, sPos, a, CAL_RADIUS, 0.07 + rng() * 0.05, 0.055 + rng() * 0.045);
  }

  /* ── Muon chambers, in layered pairs outside the barrel. Same shape as every
     other block on the machine, just very much larger, so they go through the
     same builder — two panels end to end along the beam. */
  for (const sl of SLABS) {
    const a = (sl.a * Math.PI) / 180;
    const half = sl.hl / SLAB_PANELS;
    for (const dr of SLAB_LAYERS) {
      for (let u = 0; u < SLAB_PANELS; u++) {
        const s = sl.s + (2 * u + 1 - SLAB_PANELS) * half;
        i = boxAt(out, i, s, a, sl.r + dr, half, sl.hw);
      }
    }
  }

  /* ── Gold modules, last so they can be drawn on their own. */
  TILE_STATIONS.forEach((s, st) => {
    for (let k = 0; k < TILE_PER_RING; k++) {
      const a = ((k + (st % 2) * 0.5) / TILE_PER_RING) * TAU;
      i = boxAt(out, i, s, a, TILE_R, TILE_HS, TILE_HV);
    }
  });
  PIX_STATIONS.forEach((s, st) => {
    for (let k = 0; k < PIX_PER_RING; k++) {
      const a = ((k + (st % 2) * 0.5) / PIX_PER_RING) * TAU;
      i = boxAt(out, i, s, a, PIX_R, PIX_HS, PIX_HV);
    }
  });

  return i;
};

/* ── The beam pipe ────────────────────────────────────────────────────────
   Something for the beam to travel through.

   The axis was a single line, which is a caption rather than an object: the one
   part of the picture the copy actually names had nothing in it to look at. A
   real beam line is a narrow tube inside a rhythm of collars — flanges, bellows,
   and the magnets that hold the beam together — and that rhythm is what gives
   the axis scale and makes it read as engineering rather than as a ruled line.
   It runs well past the detector at both ends, which is worth drawing: it is the
   one thing on screen saying this apparatus is a station on something longer. */

/* Drawn harder than the rest of the wireframe. It was among the faintest lines
   on screen and it is the one object the copy actually points at — the thing the
   beam runs through. A structure that reads as the subject has to be drawn like
   one. */
const PIPE_R = 0.075;
const PIPE_SPAN = 9.5;
const PIPE_RAILS = 8;
const PIPE_RAIL_SEGS = 10;
const PIPE_COLLAR_SEGS = 16;

/* Flanges every 1.2 units, alternating narrow and wide, and every wide one
   doubled into a close pair.

   A run of identical evenly spaced rings is a ruler. What makes a real beam
   line read as engineering is that the rhythm is uneven — bellows in pairs
   where the pipe has to flex against thermal movement, plain welds where it
   does not — and it is the pairing specifically that does the work, because two
   rings a hand's width apart are unmistakably a fitting and one ring on its own
   is just a mark on a tube. */
const PIPE_COLLARS: { s: number; r: number }[] = [];
for (let k = 0; k < 7; k++) {
  const s = 1.25 + k * 1.2;
  const wide = k % 2 === 1;
  const r = wide ? 0.25 : 0.155;
  for (const sign of [-1, 1]) {
    PIPE_COLLARS.push({ s: sign * s, r });
    if (wide) PIPE_COLLARS.push({ s: sign * (s + 0.16), r });
  }
}

export const PIPE_SEGS =
  PIPE_RAILS * PIPE_RAIL_SEGS + PIPE_COLLARS.length * PIPE_COLLAR_SEGS;

/** Builds the beam pipe into `out` at float offset `base`. */
export const writePipe = (out: Float32Array, base: number) => {
  let i = base;
  for (let r = 0; r < PIPE_RAILS; r++) {
    const a = (r / PIPE_RAILS) * TAU;
    const pts: Vec3[] = [];
    for (let k = 0; k <= PIPE_RAIL_SEGS; k++) {
      pts.push(barrelPoint(-PIPE_SPAN + (2 * PIPE_SPAN * k) / PIPE_RAIL_SEGS, a, PIPE_R));
    }
    i = writeStatic(out, i, pts, 0.42, 1.35);
  }
  /* Collars fall away with distance from the interaction point, so the pipe
     fades out along its length instead of stopping at a hard end. */
  for (const { s, r } of PIPE_COLLARS) {
    const fade = 1 - Math.min(1, Math.abs(s) / 10);
    i = writeStatic(out, i, ring(s, r, PIPE_COLLAR_SEGS), 0.18 + 0.46 * fade, 1.5);
  }
  return i;
};

/** The collision axis, for placing the incoming bunches along it. */
export const BEAM_DIR: Vec3 = B;
/** The nominal interaction point, before the per-event jitter along the beam. */
export const BEAM_IP: Vec3 = IP;
