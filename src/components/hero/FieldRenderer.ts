import {
  bindTarget,
  createFullscreenTriangle,
  createProgram,
  createTarget,
  disposeTarget,
  uniformLocator,
  type GL,
  type RenderTarget,
} from "@/lib/gl";
import {
  BLUR_FRAG,
  BRIGHT_FRAG,
  COMPOSITE_FRAG,
  FIREBALL_FRAG,
  FULLSCREEN_VERT,
  SURFACE_FRAG,
  SURFACE_VERT,
  TRACK_FRAG,
  TRACK_VERT,
} from "./fieldShaders";
import {
  buildEvent,
  mulberry32,
  writeBeamAxis,
  writeDetector,
  writeDetectorSurfaces,
  writeAccelerator,
  writePipe,
  DETECTOR_SEGS,
  ACCEL_SEGS,
  PIPE_SEGS,
  SURFACE_VERTS,
  WALL_SURF_VERTS,
  CAP_SURF_VERTS,
  CELL_SURF_VERTS,
  SLAB_SURF_VERTS,
  MODULE_SURF_VERTS,
  FLOATS_PER_SURF_VERT,
  BEAM_DIR,
  BEAM_IP,
  FLOATS_PER_SEG,
  MAX_TRACKS,
  SEGMENTS,
} from "./collision";

/** How many collisions can be on screen at once. Three is the usual count. */
const SLOTS = 4;
const SLOT_SEGS = MAX_TRACKS * SEGMENTS;
const SLOT_FLOATS = SLOT_SEGS * FLOATS_PER_SEG;
const BEAM_SEGS = SEGMENTS;
const TOTAL_SEGS = SLOTS * SLOT_SEGS + BEAM_SEGS + DETECTOR_SEGS + ACCEL_SEGS + PIPE_SEGS;

/* Multiplicity of a head-on event at full quality.
   Down from 110. The physics wants more — a central heavy-ion event is
   thousands of tracks and this was already a token — but the hero is a
   background behind a headline, and past a certain density the spray stops
   reading as individual particles leaving a point and starts reading as a
   texture. Fewer, thinner lines read as more of them, not fewer. */
const BASE_MULT = 80;
/**
 * How far the adaptive controller may shrink the scene buffer.
 *
 * Stated explicitly because it was not. The old test asked whether scale was
 * still above the floor and *then* subtracted a fixed step, so it could only
 * come to rest below it — and where it came to rest depended on where it
 * started. Desktop walked 1.0, 0.84, 0.68, 0.52 and stopped; a phone starting
 * at 0.8 walked 0.64, 0.48 and stopped. Two different floors, neither of them
 * the 0.62 the test named.
 *
 * Set near where both actually landed rather than at the number that was
 * written down, so this corrects the trap without quietly making every phone
 * render a third more pixels than it did yesterday.
 */
const MIN_SCENE_SCALE = 0.5;
const MAX_SCENE_PIXELS = 4_200_000; // the march is gone; this is geometry-bound now
/**
 * Half a track's width, in CSS pixels. Stated in CSS pixels on purpose: a line
 * specified in device pixels is twice as heavy on a non-retina screen as on a
 * retina one, which is exactly backwards.
 */
const LINE_HALF_CSS = 0.70;
/**
 * ...but never drawn thinner than this in the scene buffer, whatever the CSS
 * width works out to.
 *
 * A soft profile narrower than a pixel is worse than no antialiasing at all.
 * The quad still rasterises, but the only samples taken are the pixel centres,
 * and along a shallow diagonal those drift in and out of the bright core with a
 * period set by the slope — so the line beats against the pixel grid and comes
 * out as a dashed line. The first version of this was 0.7px wide, and every
 * curved track in the frame was visibly dotted.
 *
 * The fix is the one any vector renderer uses: hold the geometry at a pixel and
 * a bit, and scale intensity down by however much the line was widened. Total
 * ink is preserved, so a hairline still reads as a hairline — it is just a
 * fainter wide line rather than a broken thin one.
 */
const LINE_MIN_HALF_PX = 1.15;

/* The shape of an event in time. The preroll is the approach: two bunches
   closing on a vertex that stays completely dark until they reach it, because a
   spray that simply begins reads as a glitch and one that follows an arrival
   reads as a consequence. The front then travels at a fixed speed in arc
   length, so every track grows at the same rate and long ones simply finish
   later, which is what relativistic means here. The tail is exponential rather
   than linear so the newest event is always clearly the loudest and the ones
   behind it are memory. */
const PREROLL = 0.62;
/**
 * How far up the beam axis a bunch starts, in world units.
 *
 * Shortened along with the move forward. The approach is a fixed world distance
 * and the vertex is now closer to the camera, so the same number put both
 * bunches well outside the frame for most of the preroll — the beat that exists
 * to make the collision a consequence rather than a glitch was happening where
 * nobody could see it.
 */
const APPROACH = 1.9;
const FRONT_SPEED = 5;
/**
 * How long the plasma lives before it freezes out, in seconds.
 *
 * The tracks wait this out. A heavy-ion event is not a flash and then lines: the
 * medium forms, expands anisotropically, cools, and breaks up into hadrons, and
 * only then is there anything for a detector to record. Starting the spray at
 * the vertex skipped the only stage the thesis this is drawn from is about.
 */
/**
 * How far the camera retreats between the hero and the end of the scroll, in
 * world units.
 *
 * The hero stands inside the machine: the main barrel is nearly twice the height
 * of the frame there, so what is on screen is a wall curving past and an endcap
 * arriving from a corner. By the end of this pull-back the same barrel projects
 * to about a third of the frame and the whole detector is visible at once, which
 * turns the picture from an event display into a drawing of the apparatus.
 *
 * It used to be 1.4, which was parallax rather than a move — enough to keep the
 * plane from feeling pinned to the page and not enough to change what the shot
 * was of. The geometry is built at true relative scale precisely so that this
 * one number can carry the whole change.
 */
/** How much further out the camera travels between the hero and the end. */
/** How far along the beam the camera stands, toward the far endcap. */
/**
 * How the camera answers the pointer once the plane is held, in radians.
 *
 * A translation and a rotation say different things, and only one of them says
 * "globe". Sliding the camera sideways moves everything inside the sphere the
 * same way at once, which is what looking through a window as you step left
 * looks like. Orbiting it around what it is aimed at makes the near wall of the
 * barrel travel one way and the far wall travel the other, and the spray
 * between them shear — the two halves disagree, which is the only thing that
 * ever tells an eye it is looking at an object with a back to it.
 *
 * Small on purpose. Six degrees is enough for the far wall to visibly contradict
 * the near one and far short of anything a reader would call spinning; the cap
 * is there because the pointer arrives pre-amplified once the plane contracts,
 * so the raw value can be well past 1.
 *
 * It replaces the translation rather than adding to it, and only in proportion
 * to how far the plane has been contracted. A full-bleed hero keeps the slide:
 * there is no object to turn there, only a backdrop to shift.
 */
const ORBIT = { yaw: 0.04, pitch: 0.026, cap: 0.115 };

const DOLLY = 3.3;
/** Camera height, which sets how far below centre the collision sits. */
const LIFT = 0.54;

const PULLBACK = 5.6;

const QGP = 1.05;
/**
 * How far into the plasma's life the tracks are released, as a fraction of it.
 *
 * Not 1.0, which is what it was: freeze-out is a process the medium is still
 * visible during, not a moment after it ends. Releasing the front at the end of
 * the fade put a dark beat between the two stages, and that beat is what made
 * the hero read as a blob followed by an unrelated spray rather than as one
 * thing turning into another. At 0.62 the first tracks leave while the medium
 * is still glowing, and the medium finishes fading as they extend.
 */
const FREEZE = 0.62;
const HOLD = 1.4;
const TAIL = 1;
const LIFE = 7;
const PERIOD = 6;
/** Seconds of drawn breath before impact, and how far below rest it takes the room. */
const DRAW = 0.34;
const DIP = 0.5;
/** `flare` at the instant of impact, before normalising: strike + fluid. */
const PEAK = 3.75;

type Quality = { scale: number; mult: number };

/** sRGB in 0..1, the space the composite shader works in. */
export type Palette = [number, number, number];

type CollisionEvent = {
  t0: number;
  vertex: [number, number, number];
  trackCount: number;
  live: boolean;
  /** Reaction plane and flow, carried so the calorimeter can be lit from them. */
  psi: number;
  v2: number;
};

/**
 * Owns the hero's WebGL2 pipeline. React never touches GL state directly — it
 * pushes pointer/scroll/intro values in and lets this drive its own rAF loop,
 * so re-renders can never cost a frame.
 */
export class FieldRenderer {
  private gl: GL;
  private canvas: HTMLCanvasElement;

  private vao: WebGLVertexArrayObject;
  private fireballProgram: WebGLProgram;
  private trackProgram: WebGLProgram;
  private brightProgram: WebGLProgram;
  private blurProgram: WebGLProgram;
  private compositeProgram: WebGLProgram;
  private surfaceProgram: WebGLProgram;

  private fireballU: (n: string) => WebGLUniformLocation | null;
  private trackU: (n: string) => WebGLUniformLocation | null;
  private brightU: (n: string) => WebGLUniformLocation | null;
  private blurU: (n: string) => WebGLUniformLocation | null;
  private compositeU: (n: string) => WebGLUniformLocation | null;
  private surfaceU: (n: string) => WebGLUniformLocation | null;

  private scene: RenderTarget | null = null;
  private bloomA: RenderTarget | null = null;
  private bloomB: RenderTarget | null = null;
  private bloomC: RenderTarget | null = null;
  private bloomD: RenderTarget | null = null;

  private colorInternal: number;
  private colorType: number;

  /* Track geometry. One interleaved buffer holding SLOTS event regions plus the
     beam axis, and the only thing that ever touches it is an event being born:
     a collision is built once, uploaded once, and then animated entirely by two
     uniforms. Rebuilding this per frame on the CPU is the obvious way to write
     it and would cost about fifteen thousand transcendentals a frame. */
  private trackVao: WebGLVertexArrayObject;
  private trackBuffer: WebGLBuffer;
  /* The shaded walls. Triangles rather than the instanced quads everything else
     uses, because a surface is not a thick line and faking one from line
     geometry gives a screen-space band that does not perspective-correct. */
  private surfaceVao: WebGLVertexArrayObject;
  private surfaceBuffer: WebGLBuffer;
  private cornerBuffer: WebGLBuffer;
  private geometry = new Float32Array(TOTAL_SEGS * FLOATS_PER_SEG);
  private events: CollisionEvent[] = Array.from({ length: SLOTS }, () => ({
    t0: 0,
    vertex: [0, 0, 0] as [number, number, number],
    trackCount: 0,
    live: false,
    psi: 0,
    v2: 0,
  }));
  private eventUniform = new Float32Array(SLOTS * 4);
  private bunchUniform = new Float32Array(SLOTS * 4);
  private rng = mulberry32((Math.random() * 1e9) | 0);
  private nextSpawn = 0;
  private seeded = false;
  private stillFrame = false;

  // Frame state
  private raf = 0;
  private startTime = performance.now();
  private lastFrame = this.startTime;
  private frameEma = 16;
  private qualityTick = 0;
  private quality: Quality = { scale: 1, mult: 1 };
  private cssWidth = 1;
  private cssHeight = 1;
  private dpr = 1;
  private running = false;

  // Inputs, all spring-smoothed toward their targets in the loop
  private pointerTarget: [number, number] = [0, 0];
  private pointer: [number, number] = [0, 0];
  private scrollTarget = 0;
  private scroll = 0;
  private intro = 0;
  private introTarget = 0;

  /** Reduced motion still gets the composition, just frozen and calm. */
  reducedMotion = false;
  /** Off-hero frames still render (the signal band is a window) but at 24fps. */
  throttled = false;
  copyGuard = 1;
  /** Phones put the copy over the middle of the plane, so the spray thins out. */
  trackIntensity = 1;
  /** Page-level exposure — interior pages sit the field further back than the hero. */
  intensity = 1;
  /**
   * How the plane meets the page. The event is identical either way; only the
   * composite changes, from adding light over near-black to laying ink on
   * paper. Values come from the theme's own CSS tokens — see `setPalette`.
   */
  private light = 0;
  private paper: Palette = [0.039, 0.047, 0.063];
  private inkCool: Palette = [0.122, 0.29, 0.451];
  private inkWarm: Palette = [0.525, 0.388, 0.157];

  /**
   * The curve that turns accumulated light into ink, set against a measured
   * histogram of the undimmed exposure rather than against the eye, which was
   * wrong about the old plane twice.
   *
   * Everything from p50 to p70 of this frame sits on one flat pedestal at 0.016
   * — the volumetric wash, the slit, the bloom floor — and then it climbs hard:
   * p85 0.043, p90 0.106, p95 0.271, p97 0.400, p99 0.608. Most of the frame is
   * a single value with no picture in it, which is exactly what a floor is for.
   *
   * That is the change the collider bought. The lattice measured p50 0.051, p75
   * 0.106, p90 0.231: soft mid-tones everywhere and no pedestal to cut against,
   * so the floor had to sit near the median just to find an edge, which left
   * almost nothing above it and forced the ceiling down to 0.32 to avoid a wash.
   * Sparse geometry inverts that bargain: because so little of the frame prints
   * at all, what does print can be twice as dark and still read as a drawing.
   *
   * The gain is low on purpose, and getting that wrong is what made the light
   * theme look simultaneously too busy and too flat. At 11 the exponential was
   * saturated by about p95, so every value from there to the maximum printed
   * between 43 and 46 percent — no tonal range at the top, which reads as matte,
   * and full strength at the bottom, so tracks that are barely visible on black
   * printed as firmly as the ones that matter. Both complaints, one curve. At
   * 3.2 the same histogram spreads across roughly 1 to 65 percent, which is a
   * drawing with lights and darks in it rather than a stencil.
   */
  private inkFloor = 0.04;
  private inkGain = 3.2;
  private inkMax = 0.85;
  private inkDimGamma = 0.55;
  /** How much scrolling drains the field. The hero fades out; a long read does not. */
  scrollDim = 1;
  /**
   * 0 while the plane fills the viewport, 1 once something has contracted it
   * into a held object. Releases the composite's art direction; see `uHeld`.
   */
  held = 0;
  /**
   * Called once a frame with how bright the loudest live event is, 0..1.
   *
   * The plane is drawn inside a sphere someone is holding, and a light source
   * that throws nothing on the hand around it is the single clearest tell that
   * a picture was composited rather than lit. This is what lets the page put
   * that light back: it is the same envelope the events are drawn with, so what
   * lands on her hands rises and falls with what is actually happening inside
   * the glass rather than on a timer that would drift out of step with it.
   */
  onPulse: ((v: number) => void) | null = null;
  /**
   * Halves the frame rate while a touch scroll is in flight. The field is a
   * slow background; giving the GPU back to the compositor for the few hundred
   * milliseconds a flick lasts is invisible here and very visible in the scroll.
   */
  scrollBusy = false;
  private mobile = false;
  private maxScale = 1;
  private maxMult = 1;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("WebGL2 unavailable");

    this.gl = gl;
    this.canvas = canvas;

    // HDR intermediates keep the bloom smooth; 8-bit is a usable fallback.
    const float = gl.getExtension("EXT_color_buffer_float");
    const halfFloat = float ? null : gl.getExtension("EXT_color_buffer_half_float");
    if (float || halfFloat) {
      this.colorInternal = gl.RGBA16F;
      this.colorType = gl.HALF_FLOAT;
    } else {
      this.colorInternal = gl.RGBA8;
      this.colorType = gl.UNSIGNED_BYTE;
    }

    this.vao = createFullscreenTriangle(gl);
    this.fireballProgram = createProgram(gl, FULLSCREEN_VERT, FIREBALL_FRAG);
    this.trackProgram = createProgram(gl, TRACK_VERT, TRACK_FRAG);
    this.brightProgram = createProgram(gl, FULLSCREEN_VERT, BRIGHT_FRAG);
    this.blurProgram = createProgram(gl, FULLSCREEN_VERT, BLUR_FRAG);
    this.compositeProgram = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG);
    this.surfaceProgram = createProgram(gl, SURFACE_VERT, SURFACE_FRAG);

    this.fireballU = uniformLocator(gl, this.fireballProgram);
    this.trackU = uniformLocator(gl, this.trackProgram);
    this.brightU = uniformLocator(gl, this.brightProgram);
    this.blurU = uniformLocator(gl, this.blurProgram);
    this.compositeU = uniformLocator(gl, this.compositeProgram);
    this.surfaceU = uniformLocator(gl, this.surfaceProgram);

    /* One quad, instanced once per segment. WebGL2 has no base-instance, so the
       draw call cannot be offset into the instance buffer — the attribute
       pointers are re-pointed per slot instead, which is four calls and no
       allocation. See `bindSlot`. */
    this.trackVao = gl.createVertexArray()!;
    this.trackBuffer = gl.createBuffer()!;
    this.cornerBuffer = gl.createBuffer()!;
    gl.bindVertexArray(this.trackVao);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cornerBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      // (position along the segment, which side of it), as one triangle strip
      new Float32Array([0, -1, 1, -1, 0, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.trackBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.geometry.byteLength, gl.DYNAMIC_DRAW);
    for (const loc of [1, 2, 3, 4]) {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribDivisor(loc, 1);
    }
    this.bindSlot(0);
    gl.bindVertexArray(null);

    /* The beam axis and the detector are both static, so they are built once
       here and never rewritten. Uploaded as one contiguous run because they are
       contiguous in the buffer and there is no reason to make two calls. */
    // Detector walls: built once, uploaded once, never touched again.
    this.surfaceVao = gl.createVertexArray()!;
    this.surfaceBuffer = gl.createBuffer()!;
    gl.bindVertexArray(this.surfaceVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceBuffer);
    const surf = new Float32Array(SURFACE_VERTS * FLOATS_PER_SURF_VERT);
    writeDetectorSurfaces(surf);
    gl.bufferData(gl.ARRAY_BUFFER, surf, gl.STATIC_DRAW);
    const surfStride = FLOATS_PER_SURF_VERT * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, surfStride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, surfStride, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, surfStride, 24);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 3, gl.FLOAT, false, surfStride, 32);
    gl.bindVertexArray(null);

    const beamFloats = SLOTS * SLOT_FLOATS;
    writeBeamAxis(this.geometry, beamFloats);
    writeDetector(this.geometry, beamFloats + BEAM_SEGS * FLOATS_PER_SEG);
    writeAccelerator(
      this.geometry,
      beamFloats + (BEAM_SEGS + DETECTOR_SEGS) * FLOATS_PER_SEG,
    );
    writePipe(
      this.geometry,
      beamFloats + (BEAM_SEGS + DETECTOR_SEGS + ACCEL_SEGS) * FLOATS_PER_SEG,
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trackBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      beamFloats * 4,
      this.geometry,
      beamFloats,
      (BEAM_SEGS + DETECTOR_SEGS + ACCEL_SEGS + PIPE_SEGS) * FLOATS_PER_SEG,
    );
  }

  /** Points the per-segment attributes at one region of the instance buffer. */
  private bindSlot(firstSeg: number) {
    const gl = this.gl;
    const stride = FLOATS_PER_SEG * 4;
    const base = firstSeg * stride;
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, base);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, base + 12);
    gl.vertexAttribPointer(3, 4, gl.FLOAT, false, stride, base + 24);
    gl.vertexAttribPointer(4, 2, gl.FLOAT, false, stride, base + 40);
  }

  /* ── Inputs ───────────────────────────────────────────────────────────── */

  setPointer(nx: number, ny: number, uvx: number, uvy: number) {
    this.pointerTarget = [nx, ny];

  }

  setScroll(v: number) {
    this.scrollTarget = v;
  }

  /** Called once the preloader hands off; drives the aperture opening. */
  reveal() {
    this.introTarget = 1;
  }

  /**
   * Phones are fill-rate bound, and the adaptive controller needs ~90 frames to
   * work that out. Starting cheap skips the visible degradation on the way down.
   */
  setMobileProfile(on: boolean) {
    this.mobile = on;
    // Ceilings, not just starting points. Without these the controller's
    // recovery branch walks both back up to 1 the moment the phone has a few
    // cheap idle frames, quietly undoing the clamp below.
    this.maxScale = on ? 0.8 : 1;
    this.maxMult = on ? 0.5 : 1;
    if (!on) return;
    this.quality.mult = Math.min(this.quality.mult, this.maxMult);
    if (this.quality.scale > this.maxScale) {
      this.quality.scale = this.maxScale;
      this.allocate();
    }
  }

  resize(cssWidth: number, cssHeight: number, dpr: number) {
    this.cssWidth = Math.max(1, cssWidth);
    this.cssHeight = Math.max(1, cssHeight);
    this.dpr = Math.min(dpr, 2);
    this.allocate();
  }

  /* ── Allocation ───────────────────────────────────────────────────────── */

  private allocate() {
    const gl = this.gl;
    const outW = Math.max(1, Math.round(this.cssWidth * this.dpr));
    const outH = Math.max(1, Math.round(this.cssHeight * this.dpr));
    this.canvas.width = outW;
    this.canvas.height = outH;

    // The scene renders at a fraction of output res and is upscaled — cheaper,
    // and it softens a one-pixel track the way a real lens would.
    /* Full resolution where the budget allows it. The old 0.70 cap existed to
       make a 128-step march affordable and cost nothing visually, because a
       volume has no detail to lose. Line geometry does: every pixel the scene
       gives up is a pixel of a track, and it is also what forces the width
       compensation above into play. */
    const budget = Math.sqrt(MAX_SCENE_PIXELS / (outW * outH));
    const sceneScale = Math.min(0.85, budget) * this.quality.scale;
    const sw = Math.max(2, Math.round(outW * sceneScale));
    const sh = Math.max(2, Math.round(outH * sceneScale));

    disposeTarget(gl, this.scene);
    disposeTarget(gl, this.bloomA);
    disposeTarget(gl, this.bloomB);
    disposeTarget(gl, this.bloomC);
    disposeTarget(gl, this.bloomD);

    this.scene = createTarget(gl, sw, sh, this.colorInternal, this.colorType);
    const bw = Math.max(2, Math.round(sw * 0.5));
    const bh = Math.max(2, Math.round(sh * 0.5));
    this.bloomA = createTarget(gl, bw, bh, this.colorInternal, this.colorType);
    this.bloomB = createTarget(gl, bw, bh, this.colorInternal, this.colorType);
    const cw = Math.max(2, Math.round(sw * 0.22));
    const ch = Math.max(2, Math.round(sh * 0.22));
    this.bloomC = createTarget(gl, cw, ch, this.colorInternal, this.colorType);
    this.bloomD = createTarget(gl, cw, ch, this.colorInternal, this.colorType);
  }

  /* ── Events ───────────────────────────────────────────────────────────── */

  /** Builds a collision into the least useful slot and uploads it. */
  private spawn(t0: number) {
    let slot = this.events.findIndex((e) => !e.live);
    if (slot < 0) {
      slot = this.events.reduce((oldest, e, i) => (e.t0 < this.events[oldest].t0 ? i : oldest), 0);
    }

    const base = slot * SLOT_FLOATS;
    const budget = Math.round(BASE_MULT * this.quality.mult);
    /* The same tier drives the trimmings, so the knob moves the whole event. */
    const { vertex, trackCount, psi, v2 } = buildEvent(
      this.geometry, base, this.rng, budget, this.quality.mult,
    );
    this.events[slot] = { t0, vertex, trackCount, live: true, psi, v2 };

    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trackBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      base * 4,
      this.geometry,
      base,
      trackCount * SEGMENTS * FLOATS_PER_SEG,
    );
  }

  /**
   * Reduced motion gets one composition and then nothing moves again. Three
   * events at fixed ages read as a still photograph of a beam that has been
   * running for a while, which is a better answer than an empty frame and a
   * much better one than a frozen mid-explosion.
   */
  private seedEvents(time: number) {
    for (const e of this.events) e.live = false;
    if (this.reducedMotion) {
      this.rng = mulberry32(0x5ca1ab1e);
      /* Shifted later by the plasma's lifetime, so the still frame shows the
         same three stages it always did: a mature spray, a young one, and — now
         that there is a stage before the tracks — one event still in the medium.
         The old ages were measured from impact and would draw two stubs. */
      for (const age of [3.8, 2.2, 0.9]) this.spawn(time - age);
      this.nextSpawn = Infinity;
    } else {
      this.spawn(time);
      this.nextSpawn = time + PERIOD;
    }
    this.seeded = true;
    this.stillFrame = this.reducedMotion;
  }

  /** Brightness of an event at a given age: a short hold, then an exponential tail. */
  private envelope(age: number) {
    if (age < 0 || age > LIFE) return 0;
    const rise = Math.min(1, age / 0.3);
    const cut = 1 - Math.min(1, Math.max(0, (age - (LIFE - 2)) / 2));
    return rise * Math.exp(-Math.max(0, age - HOLD) / TAIL) * cut;
  }

  /**
   * The light an event throws into the room, which is not the same curve as the
   * event itself.
   *
   * `envelope` above is how long a *spray* is worth drawing: it rises over the
   * approach, holds for a second and a half, and takes several more to leave.
   * That is right for tracks and wrong for light, and it was driving both.
   * Measured against the shader that actually paints the flash, it turned the
   * lamp on 0.32s before the beams met, held it through the collision, and was
   * still at 37% a full second after the vertex had gone dark. So the hand
   * around the glass brightened *before* anything happened and stayed lit long
   * after it was over — the two most reliable ways to make a light read as a
   * timer rather than as a consequence.
   *
   * This mirrors the fireball's own terms instead: the same strike, the same
   * hold, the same handover, normalised so the instant of impact is 1. What
   * lands on her is now the curve she is being lit by.
   *
   * And before it, a dip. The field has an anticipation already — the squeeze,
   * where the two bunches focus and glow in the last 70ms — but the room does
   * not, and a flash with nothing before it reads as a light being switched on.
   * Taking the room *down* over a third of a second first is the oldest trick
   * in animation and the one generative effects almost always skip: it costs
   * nothing, and it is the difference between an event that happens and an
   * event that was timed.
   */
  private flare(age: number) {
    if (age < 0 || age > LIFE) return 0;
    const t = age - PREROLL;
    if (t < 0) {
      const away = -t;
      return away >= DRAW ? 0 : -DIP * (1 - away / DRAW);
    }
    const release = QGP * FREEZE;
    const strike = 2.6 * Math.exp(-t * 7);
    const edge = release + 0.28;
    const lo = release * 0.62;
    const u = Math.min(1, Math.max(0, (t - lo) / (edge - lo)));
    const fluid = 1.15 * (1 - u * u * (3 - 2 * u));
    /* Without the shader's 0.16 floor, which is the vertex's own residual glow
       inside the glass and is not room light. Kept, it left every spent event
       parked a few percent above zero for the rest of its seven-second life,
       and `lit` below would then never be zero, so the room could never draw
       breath. */
    return (strike + fluid) / PEAK;
  }

  /* ── Loop ─────────────────────────────────────────────────────────────── */

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /**
   * Frame budget. Reduced motion renders a still image, so it only needs enough
   * frames to follow a resize; off-hero it only has to keep the signal band
   * alive. Both are deliberate throttles, not stalls.
   */
  private minFrameMs() {
    if (this.reducedMotion) return 250;
    // A fixed WebGL plane that keeps redrawing mid-scroll is competing for the
    // same GPU the compositor is using to move the page, and on a phone that
    // contention is what the stutter is made of. Hold the last frame until the
    // flick ends: this is atmosphere, and nobody sees it pause for 160ms.
    if (this.mobile && this.scrollBusy) return Infinity;
    if (this.throttled) return 40;
    return this.scrollBusy ? 33 : 0;
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);

    const elapsed = now - this.lastFrame;
    const budget = this.minFrameMs();
    if (budget && elapsed < budget) return;
    this.lastFrame = now;

    const dt = Math.min(elapsed / 1000, 1 / 20);
    // A throttled frame's elapsed time measures the throttle, not the GPU —
    // feeding it to the quality controller would degrade quality for no reason.
    if (!budget) {
      this.frameEma = this.frameEma * 0.9 + elapsed * 0.1;
      this.tune();
    }
    this.render(dt);
  };

  /** Drops quality if the GPU is struggling, restores it when it is not. */
  private tune() {
    if (this.reducedMotion) return;
    this.qualityTick++;
    /* Two speeds. The slow one is the steady-state controller, and ninety frames
       is deliberately long: a single stutter should not be able to move it.
       The fast one exists because ninety frames on a device that is genuinely
       struggling is ten seconds or more of jank before anything happens, and
       those are exactly the seconds a visitor is present for. */
    const struggling = this.frameEma > 55;
    if (this.qualityTick < (struggling ? 20 : 90)) return;
    this.qualityTick = 0;

    // Multiplicity goes first: a sparser event is a real event, a lower-resolution
    // one is a blurrier picture of the same thing. No two events have the same
    // track count anyway, so nobody can see this happen.
    const before = this.quality.scale;
    if (this.frameEma > 26) {
      if (this.quality.mult > 0.4) this.quality.mult -= struggling ? 0.3 : 0.15;
      else if (this.quality.scale > MIN_SCENE_SCALE) {
        this.quality.scale = Math.max(MIN_SCENE_SCALE, this.quality.scale - 0.16);
      }
    } else if (this.frameEma < 13) {
      if (this.quality.scale < this.maxScale) {
        this.quality.scale = Math.min(this.maxScale, this.quality.scale + 0.16);
      } else if (this.quality.mult < this.maxMult) {
        this.quality.mult = Math.min(this.maxMult, this.quality.mult + 0.12);
      }
    }
    this.quality.mult = Math.max(0.4, Math.min(this.maxMult, this.quality.mult));
    if (before !== this.quality.scale) this.allocate();
  }

  private render(dt: number) {
    const gl = this.gl;
    if (!this.scene || !this.bloomA || !this.bloomB || !this.bloomC || !this.bloomD) return;

    // Critically-damped-ish smoothing on every input: nothing in the scene ever
    // snaps, which is most of what makes it read as expensive.
    const ease = 1 - Math.pow(0.001, dt);
    this.pointer[0] += (this.pointerTarget[0] - this.pointer[0]) * ease * 0.55;
    this.pointer[1] += (this.pointerTarget[1] - this.pointer[1]) * ease * 0.55;

    this.scroll += (this.scrollTarget - this.scroll) * ease * 0.5;
    this.intro += (this.introTarget - this.intro) * ease * 0.32;

    const time = this.reducedMotion ? 6 : (performance.now() - this.startTime) / 1000;

    /* The camera, shared by the fireball's projected vertices and the track pass.
       The pan is framing, not motion: the vertex is meant to sit about a third
       of the way right of centre, and that is a fraction of the frame rather
       than a distance in the world. A phone in portrait is a third as wide as a
       desktop window for the same height, so the same world offset put the whole
       collision off the right edge and left only the tails of it on screen.
       Panning both the eye and the target by the same amount is a pure
       translation, so nothing about the perspective changes — only what is
       centred in it. */
    /* The camera, shared by the fireball's projected vertices and the track pass.
       The pan is framing, not motion: the vertex is meant to sit about a third
       of the way right of centre, and that is a fraction of the frame rather
       than a distance in the world. A phone in portrait is a third as wide as a
       desktop window for the same height, so the same world offset put the whole
       collision off the right edge and left only the tails of it on screen.
       Panning both the eye and the target by the same amount is a pure
       translation, so nothing about the perspective changes — only what is
       centred in it. */
    const aspect = this.scene.width / this.scene.height;

    /* The camera, shared by the fireball's projected vertices and the track pass.

       Three translations, and all three are translations rather than rotations
       on purpose: moving the eye and its target by the same vector changes what
       is centred and nothing about the perspective, which is the only honest way
       to frame a shot without distorting it.

       DOLLY runs along the beam toward the far endcap. Without it the camera sat
       further back along the axis than the near endcap did, so both wheels were
       in shot at once — one small and face on at the end of the tube, one huge
       and open across the headline — and the eye could not decide which was the
       subject. Past the near wheel, it falls behind and off the left edge, and
       what is left is the view down the barrel to the far one.

       PAN then puts the vertex about a third of the way right of centre, and
       LIFT drops it below the headline. Both are fractions of the frame rather
       than distances in the world, which is why the pan is still scaled by
       aspect: a phone in portrait is a third as wide as a desktop window for the
       same height, and the same world offset would push the collision off the
       right edge entirely. */
    const pan = -0.46 - 0.6 * Math.min(1.9, Math.max(0.4, aspect));

    /* The pointer response crosses over from a slide to an orbit as the plane
       is contracted into something held; see ORBIT. `held` is 0 everywhere the
       plane is still a backdrop, which makes this exactly the old code there. */
    const swing = this.held;
    const slide = 1 - swing;
    const clampAngle = (v: number) => Math.max(-ORBIT.cap, Math.min(ORBIT.cap, v));
    const yaw = clampAngle(this.pointer[0] * ORBIT.yaw) * swing;
    const pitch = clampAngle(this.pointer[1] * ORBIT.pitch) * swing;

    const ta: [number, number, number] = [
      this.pointer[0] * 0.12 * slide + pan + BEAM_DIR[0] * DOLLY,
      this.pointer[1] * 0.08 * slide + LIFT + BEAM_DIR[1] * DOLLY,
      1.0 + BEAM_DIR[2] * DOLLY,
    ];
    /* Where the eye sits relative to what it is aimed at. Straight back down
       the axis when the pointer is at rest, so the framing every other constant
       here was tuned against is untouched. */
    const dist = 3.6 + this.scroll * PULLBACK;
    const cp = Math.cos(pitch);
    const ro: [number, number, number] = [
      ta[0] + this.pointer[0] * 0.30 * slide + dist * Math.sin(yaw) * cp,
      ta[1] + this.pointer[1] * 0.22 * slide + dist * Math.sin(pitch),
      ta[2] - dist * Math.cos(yaw) * cp,
    ];

    const basis = cameraBasis(ro, ta);
    const focal = 1.45;
    /* How far the camera is from the interaction point right now. Both the track
       pass and the wall pass scale their depth cue by this, so the same shading
       means the same thing whether we are standing inside the detector or
       looking at the whole of it from outside. */
    const refDepth = Math.max(
      0.5,
      (BEAM_IP[0] - ro[0]) * basis[6] +
        (BEAM_IP[1] - ro[1]) * basis[7] +
        (BEAM_IP[2] - ro[2]) * basis[8],
    );

    // The preference can flip at runtime, and the two modes seed events differently.
    if (!this.seeded || this.stillFrame !== this.reducedMotion) this.seedEvents(time);
    if (time >= this.nextSpawn) {
      this.spawn(time);
      this.nextSpawn = time + PERIOD * (0.82 + this.rng() * 0.36);
    }

    /* Pass 1 — the luminous region.
       Projecting a world point into the same plane coordinates the track vertex
       shader writes, so the fireball can be told where a vertex landed in two
       floats instead of being given a second copy of the camera. */
    const project = (x: number, y: number, z: number, out: Float32Array, at: number) => {
      const rx = x - ro[0];
      const ry = y - ro[1];
      const rz = z - ro[2];
      const camZ = Math.max(rx * basis[6] + ry * basis[7] + rz * basis[8], 0.06);
      out[at] = (focal * (rx * basis[0] + ry * basis[1] + rz * basis[2])) / camZ;
      out[at + 1] = (focal * (rx * basis[3] + ry * basis[4] + rz * basis[5])) / camZ;
      return camZ;
    };

    /* Two accumulators, not one. Light adds and darkness does not: the loudest
       event decides how bright the room is, but an event drawing breath is not
       a source — it is the field going quiet — and taking a maximum across both
       would let any other event's leftovers erase it. So a room with anything
       glowing in it reports that; a room with nothing glowing reports the
       deepest breath being drawn in it. */
    let lit = 0;
    let drawn = 0;
    for (let i = 0; i < SLOTS; i++) {
      const e = this.events[i];
      const age = time - e.t0;
      if (e.live && age > LIFE) e.live = false;
      const o = i * 4;
      if (!e.live) {
        this.eventUniform[o + 2] = -1;
        continue;
      }
      // The loudest one, not the sum: two half-faded events are not a bright
      // frame, and adding them would make the glow busiest exactly when the
      // picture inside the sphere is at its most tired.
      const f = this.flare(age);
      if (f > lit) lit = f;
      else if (f < drawn) drawn = f;
      const camZ = project(e.vertex[0], e.vertex[1], e.vertex[2], this.eventUniform, o);
      this.eventUniform[o + 2] = age;
      this.eventUniform[o + 3] = camZ;

      /* The two bunches, closing on the vertex along the beam from either side —
         and still projected after they have arrived, at a fixed separation.

         They are not drawn once the collision has happened. The plasma reads
         its beam axis out of them, though, and that is what this is for. Left
         to stop at impact, the pair froze a fraction of a frame before it
         converged on the vertex: a baseline of a couple of per cent of the
         approach, held still while the camera kept dollying and leaning into
         the pointer. The vertex moved and the stale bunches did not, so the
         axis those two points define swung by tens of degrees over an event's
         life — and the ellipse, the shear layer and the whole lump frame are
         oriented by it. A different, drifting orientation for every event. */
      {
        const gap = age < PREROLL ? APPROACH * (1 - age / PREROLL) : APPROACH * 0.5;
        project(
          e.vertex[0] + BEAM_DIR[0] * gap,
          e.vertex[1] + BEAM_DIR[1] * gap,
          e.vertex[2] + BEAM_DIR[2] * gap,
          this.bunchUniform,
          o,
        );
        project(
          e.vertex[0] - BEAM_DIR[0] * gap,
          e.vertex[1] - BEAM_DIR[1] * gap,
          e.vertex[2] - BEAM_DIR[2] * gap,
          this.bunchUniform,
          o + 2,
        );
      }
    }

    /* The event's own brightness, scaled the way the composite scales it — a
       plane at a quarter exposure on an interior page should not be lighting up
       a hand at full. */
    /* Clamped at the top only. The floor is the anticipation, and a light that
       cannot go below its own rest state cannot draw breath before an event. */
    /* Exposure scales light, not its absence. `intensity` is how brightly this
       page draws its events; multiplying a drawn breath by it would make the
       room go darkest on the page that shows the field most, and on the hero,
       where pointer gain pushes intensity past 2, it would drive a consumer's
       opacity negative. */
    this.onPulse?.(lit > 0 ? Math.min(1, lit * this.intensity) : drawn);

    bindTarget(gl, this.scene);
    gl.disable(gl.BLEND);
    gl.useProgram(this.fireballProgram);
    gl.uniform2f(this.fireballU("uResolution"), this.scene.width, this.scene.height);
    gl.uniform1f(this.fireballU("uScroll"), this.scroll);
    gl.uniform1f(this.fireballU("uIntro"), this.intro);
    gl.uniform1f(this.fireballU("uScrollDim"), this.scrollDim);
    gl.uniform1f(this.fireballU("uPreroll"), PREROLL);
    gl.uniform1f(this.fireballU("uQgp"), QGP);
    gl.uniform1f(this.fireballU("uFreeze"), FREEZE);
    gl.uniform1f(this.fireballU("uGlow"), this.light > 0.5 ? 0.4 : 1);
    gl.uniform4fv(this.fireballU("uEvents"), this.eventUniform);
    gl.uniform4fv(this.fireballU("uBunches"), this.bunchUniform);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* Pass 2 — the tracks, additively over it */
    /* Widening a sub-pixel line means dropping its intensity, or a low-DPR
       screen prints every track about 1.6 times too heavy. The square root
       rather than the ratio, though: preserving ink exactly is the right rule
       for a drawing, and this is atmosphere. Full compensation took a third of
       the field away on a non-retina display and left interior pages, which are
       already at half exposure, with almost nothing on them. Half the
       correction keeps the weight close enough that no one could tell two
       screens apart, and keeps the picture on both. */
    const desiredHalfPx = LINE_HALF_CSS * (this.scene.height / this.cssHeight);
    const drawHalfPx = Math.max(desiredHalfPx, LINE_MIN_HALF_PX);
    /* `scrollDim` belongs here too, and its absence was the other half of the
       black sphere.

       Scrolling drains the plane in two places: the composite fades the whole
       frame, and this fades the tracks. Only the first was ever asked whether
       draining was wanted, so a plane told to keep its depth all the way down
       kept its walls and its glow and lost the one thing in the picture with
       any structure in it — which is why the sphere read as bright and empty
       rather than as a detector with an event in it. */
    const globalFade =
      Math.max(0, this.intro * (1 - this.scroll * 0.85 * this.scrollDim)) *
      this.trackIntensity *
      Math.sqrt(desiredHalfPx / drawHalfPx);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    /* The walls first, so the spray reads as being inside them. Order does not
       actually matter under additive blending — it is written this way because
       that is the order the picture is built in, and because a wall drawn over
       its own tracks would be a lie about which is in front even if the
       arithmetic came out the same. */
    const structureFade = Math.max(0, this.intro) * this.trackIntensity;
    gl.useProgram(this.surfaceProgram);
    gl.uniform3f(this.surfaceU("uOrigin"), ro[0], ro[1], ro[2]);
    gl.uniformMatrix3fv(this.surfaceU("uBasis"), false, basis);
    gl.uniform1f(this.surfaceU("uAspect"), aspect);
    gl.uniform1f(this.surfaceU("uFocal"), focal);
    /* A fifth, not a half. At the higher value the near wall was the brightest
       thing in the hero and the headline was reading through it rather than over
       it — a background that wins is not a background. Lightly shaded means the
       wall is legible as a surface and never as a subject. */
    /* Brightest at the hero and easing back as the machine closes up. The two
       shots want opposite things from the same wall: open, it is the subject and
       has to carry the frame on its own; closed, it is a full shell behind a
       page of copy and the same weight would be a blue fog over everything. */
    /* Far lower than it was, and rising rather than falling with the scroll —
       both because of where the camera now stands.

       Inside the barrel the wall is not an object in the frame, it is the frame:
       every pixel is covered by two shells and often an endcap as well, all
       adding, and all seen at grazing incidence because that is what the inside
       of a cylinder is. The grazing term that picks out the silhouette of a
       distant tube is at its maximum everywhere at once in here, so the value
       that was right when the camera was outside washed the whole hero white.

       Outside, at the end of the pull-back, the machine covers a small part of
       the frame and needs the opposite treatment — hence the ramp. */
    /* Trimmed on paper, and per group.

       The light theme shows everything. On black a faint surface is simply not
       there; on white the same surface is a visible mark, so a wall that reads
       as atmosphere in dark reads as clutter in light — which is why the two
       themes have never wanted the same weight out of this pass and why the
       shells were already held back here. The blocks made that worse, because a
       block is all edge: a hundred small hard-rimmed rectangles print as a
       hundred marks whatever their fill. So the paper trim now applies to the
       whole pass, and each group takes its own hold on top — hardest on the
       shells, which carry no information, lightest on the gold, which is the
       one thing the light theme is actually built around. */
    const paper = this.light > 0.5;
    const surfFade = structureFade * 0.115 * (1 + 0.9 * this.scroll) * (paper ? 0.82 : 1);

    /* How far the spray has got, and which event is throwing it.

       This is the same growth front the tracks are drawn with, handed to the
       surface pass so every instrumented block can decide for itself whether it
       has been reached yet. The arrival is not a number to pick by eye and it is
       not one number for the whole machine: particles leave at a finite speed,
       so the modules against the beam pipe are hit first, the calorimeter next,
       the tile blocks last, and what you see is a wave crossing the detector.

       The newest started event wins. Not the brightest — an older event's front
       has already swept past everything and its answer has decayed away
       wherever it landed, so the useful wave is always the most recent one, and
       showing two at once would average them into a wash rather than read as
       two events. */
    let frontArc = -1;
    let eventPsi = 0;
    let eventV2 = 0;
    for (const e of this.events) {
      if (!e.live) continue;
      const front = FRONT_SPEED * (time - e.t0 - PREROLL - QGP * FREEZE);
      if (front <= 0) continue;
      if (frontArc < 0 || front < frontArc) {
        frontArc = front;
        eventPsi = e.psi;
        eventV2 = e.v2;
      }
    }
    /* The shells are held back on paper, and the endcap is not.
       Two reasons, and they are the same reason. A translucent volume prints as
       a wash — the argument the fireball has carried since the light theme
       existed — and two nested shells of it over a white page is a lot of tint
       for something that is meant to be behind the words. And because paper
       takes its hue from a brightness-weighted average of everything on the
       pixel, a steel shell standing in front of the gold wheel does not merely
       sit on top of it, it pulls the average back toward the midpoint between
       the two inks, which is grey. Dimming the shells buys a quieter page and a
       gold wheel with one number. */
    const wallInk = paper ? 0.5 : 1.0;
    const cellInk = paper ? 0.58 : 1.0;
    const goldInk = paper ? 0.70 : 1.0;
    gl.uniform1f(this.surfaceU("uRefDepth"), refDepth);
    gl.bindVertexArray(this.surfaceVao);

    /* Three groups over one buffer, differing only in uniforms. Each is a
       bright outline around a darker translucent fill — the construction every
       event display uses — and what separates them is how hard the outline
       burns, whether the modules are physically apart, and what colour they are.

       The shells: steel, continuous, a soft edge on each plate. */
    /* No outline at all on the shells, and that is the correction. Outlining
       every module turned the barrel into scaffolding: a hundred lit rectangles
       read as a frame with glass in it, not as a wall. The plate treatment is
       right for things that genuinely are separate plates — the endcap petals
       and the muon slabs, both of which are mounted pieces with air between them
       — and wrong for a continuous shell, which should simply be a smooth
       translucent solid that thickens toward its silhouette. So the shells get
       a heavier constant fill and no edge, and the geometry underneath them was
       thinned to match. */
    gl.uniform3f(this.surfaceU("uTint"), 0.28, 0.47, 0.76);
    gl.uniform1f(this.surfaceU("uBase"), 0.19);
    gl.uniform1f(this.surfaceU("uBody"), 0.66);
    gl.uniform1f(this.surfaceU("uSeamW"), 0.0);
    gl.uniform1f(this.surfaceU("uRimW"), 0.0);
    gl.uniform1f(this.surfaceU("uRim"), 0.0);
    gl.uniform1f(this.surfaceU("uStripeN"), 1.0);
    gl.uniform1f(this.surfaceU("uStripe"), 0.0);
    gl.uniform1f(this.surfaceU("uWarm"), 0.02);
    gl.uniform1f(this.surfaceU("uFade"), surfFade * wallInk);
    /* Only the instrumented surfaces answer an event; the shells and the muon
       plates are structure and stay put. The front and the reaction plane are
       set once for all groups and cost nothing where the pulse is zero. */
    gl.uniform1f(this.surfaceU("uPsi"), eventPsi);
    gl.uniform1f(this.surfaceU("uV2"), eventV2);
    gl.uniform1f(this.surfaceU("uFrontArc"), frontArc);
    gl.uniform3f(this.surfaceU("uHot"), 0.45, 1.0, 0.52);
    gl.uniform1f(this.surfaceU("uPulse"), 0);
    gl.drawArrays(gl.TRIANGLES, 0, WALL_SURF_VERTS);

    /* The endcap wheels: gold, cut into separate petals, each one outlined hard
       and ribbed along its length by the readout planes stacked through it.

       The colour is not decoration. It is the one place where this site's accent
       and the thing itself are the same colour, so the wheel reads as the brand
       mark and as an endcap at once — and it does that in both themes, because
       gold is what the light theme already prints its hot tracks in. */
    gl.uniform3f(this.surfaceU("uTint"), 1.0, 0.74, 0.26);
    /* Brighter than the shells, and that is a requirement rather than a
       preference. The wheel on screen is the far one, so every sightline to it
       also crosses the near barrel wall — and on paper the hue of a pixel is the
       brightness-weighted average of everything that landed on it, so a steel
       surface in front of a gold one drags the average back toward the midpoint
       between the two inks, which is grey. The gold only survives the trip to
       paper if it dominates the pixel it is on. */
    gl.uniform1f(this.surfaceU("uBase"), 0.58);
    gl.uniform1f(this.surfaceU("uBody"), 0.34);
    gl.uniform1f(this.surfaceU("uSeamW"), 0.14);
    gl.uniform1f(this.surfaceU("uRimW"), 0.15);
    gl.uniform1f(this.surfaceU("uRim"), 1.15);
    gl.uniform1f(this.surfaceU("uStripeN"), 7.0);
    gl.uniform1f(this.surfaceU("uStripe"), 0.42);
    // The one warm thing in the machine, so the one thing paper prints in bronze.
    gl.uniform1f(this.surfaceU("uWarm"), 1.0);
    gl.uniform1f(this.surfaceU("uPulse"), 0);
    gl.uniform1f(this.surfaceU("uFade"), surfFade);
    gl.drawArrays(gl.TRIANGLES, WALL_SURF_VERTS, CAP_SURF_VERTS);

    /* Readout cells. Flat-on to the viewer, so they take no grazing term at all
       — weighting them by viewing angle would hide the ones facing you, which is
       every one that matters. */
    gl.uniform3f(this.surfaceU("uTint"), 0.42, 0.72, 0.92);
    gl.uniform1f(this.surfaceU("uBase"), 0.55);
    gl.uniform1f(this.surfaceU("uBody"), 0.0);
    gl.uniform1f(this.surfaceU("uSeamW"), 0.04);
    gl.uniform1f(this.surfaceU("uRimW"), 0.26);
    gl.uniform1f(this.surfaceU("uRim"), 0.95);
    gl.uniform1f(this.surfaceU("uStripeN"), 1.0);
    gl.uniform1f(this.surfaceU("uStripe"), 0.0);
    gl.uniform1f(this.surfaceU("uWarm"), 0.04);
    /* Held back on paper, but less than the shells are. These carry a
       measurement rather than just closing a volume, and trimming them as hard
       as a wall would throw the flash away along with the clutter. */
    gl.uniform1f(this.surfaceU("uFade"), surfFade * cellInk);
    gl.uniform1f(this.surfaceU("uPulse"), 1);
    gl.drawArrays(gl.TRIANGLES, WALL_SURF_VERTS + CAP_SURF_VERTS, CELL_SURF_VERTS);

    /* Muon chambers. Flat and outside everything, so they take almost no grazing
       term and instead sit at a steady low density with a firm edge — which is
       exactly how a big flat plate behaves and why they read as slabs rather
       than as more shell. */
    /* Brighter and bluer than the shell they stand outside of, deliberately.
       A plate that shades like the wall behind it reads as part of the wall, and
       the whole job of these is to be the flat rectangular thing the round
       translucent thing is inside of. Between the layered pairs, the harder edge
       and the lighter tint, they now separate at a glance. */
    gl.uniform3f(this.surfaceU("uTint"), 0.36, 0.62, 0.95);
    gl.uniform1f(this.surfaceU("uBase"), 0.32);
    gl.uniform1f(this.surfaceU("uBody"), 0.08);
    gl.uniform1f(this.surfaceU("uSeamW"), 0.05);
    gl.uniform1f(this.surfaceU("uRimW"), 0.14);
    gl.uniform1f(this.surfaceU("uRim"), 1.05);
    gl.uniform1f(this.surfaceU("uStripeN"), 1.0);
    gl.uniform1f(this.surfaceU("uStripe"), 0.0);
    gl.uniform1f(this.surfaceU("uWarm"), 0.02);
    gl.uniform1f(this.surfaceU("uPulse"), 0);
    gl.uniform1f(this.surfaceU("uFade"), surfFade * wallInk);
    gl.drawArrays(
      gl.TRIANGLES,
      WALL_SURF_VERTS + CAP_SURF_VERTS + CELL_SURF_VERTS,
      SLAB_SURF_VERTS,
    );

    /* Gold modules: the tile blocks between the shells and the pixel modules
       hugging the beam pipe.

       Flat-on and hard-edged, with no grazing term — they are small enough that
       a viewing-angle falloff would simply delete most of them, and the ones it
       would delete are the ones facing you, which is every one that matters.

       These carry the interior almost by themselves. A translucent tube with a
       gold wheel at the end is one object seen once; the same tube with rows of
       lit blocks receding down it is a machine with a length, and the rows are
       doing the work a perspective grid would do if a detector had one. */
    gl.uniform3f(this.surfaceU("uTint"), 1.0, 0.78, 0.30);
    gl.uniform1f(this.surfaceU("uBase"), 0.55);
    gl.uniform1f(this.surfaceU("uBody"), 0.0);
    gl.uniform1f(this.surfaceU("uSeamW"), 0.06);
    gl.uniform1f(this.surfaceU("uRimW"), 0.22);
    gl.uniform1f(this.surfaceU("uRim"), 1.0);
    gl.uniform1f(this.surfaceU("uStripeN"), 1.0);
    gl.uniform1f(this.surfaceU("uStripe"), 0.0);
    // Warm, like the wheels: on paper these have to print as gold or they are
    // just more blue speckle, and speckle is what the seams already were.
    gl.uniform1f(this.surfaceU("uWarm"), 1.0);
    /* And these light up too, a beat either side of the calorimeter — the pixel
       modules against the pipe before it, the tile blocks outside it after.

       Not in the calorimeter's green, though. A tracker module does not measure
       energy, it records that something passed through, so it goes to a hot
       pale gold: the same substance, brighter, rather than a different one. The
       green is reserved for the blocks that are actually taking the
       measurement, which keeps the two readable as two things. */
    gl.uniform3f(this.surfaceU("uHot"), 1.0, 0.94, 0.68);
    gl.uniform1f(this.surfaceU("uPulse"), 0.85);
    gl.uniform1f(this.surfaceU("uFade"), surfFade * goldInk);
    gl.drawArrays(
      gl.TRIANGLES,
      WALL_SURF_VERTS + CAP_SURF_VERTS + CELL_SURF_VERTS + SLAB_SURF_VERTS,
      MODULE_SURF_VERTS,
    );

    gl.useProgram(this.trackProgram);
    gl.uniform3f(this.trackU("uOrigin"), ro[0], ro[1], ro[2]);
    gl.uniformMatrix3fv(this.trackU("uBasis"), false, basis);
    gl.uniform1f(this.trackU("uAspect"), aspect);
    gl.uniform1f(this.trackU("uFocal"), focal);
    // NDC height units: the buffer spans 2 of them over its full pixel height.
    gl.uniform1f(this.trackU("uHalfWidth"), (2 * drawHalfPx) / this.scene.height);
    gl.uniform1f(this.trackU("uRefDepth"), refDepth);
    gl.bindVertexArray(this.trackVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trackBuffer);

    /* The structure first, under everything: the detector and the beam axis are
       what persist between events.

       Deliberately not given the track pass's own scroll falloff. That term
       exists to get the spray out of the way of a long read, and it is the
       right call for an event; it is the wrong one for the structure, which is
       the only thing giving the panels above something to be layered over. The
       composite still drains it on scroll along with everything else — that is
       what takes the hero's presence down to roughly a quarter by the time the
       first section is in view, which is the fade that was wanted. Applying
       both would have taken it to nothing, which is where it started. */
    gl.uniform1f(this.trackU("uFront"), 0);
    gl.uniform1f(this.trackU("uFade"), structureFade);
    this.bindSlot(SLOTS * SLOT_SEGS);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, BEAM_SEGS + DETECTOR_SEGS);

    // The beam pipe, at the structure's own weight: it is machine, not event.
    this.bindSlot(SLOTS * SLOT_SEGS + BEAM_SEGS + DETECTOR_SEGS + ACCEL_SEGS);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, PIPE_SEGS);

    /* The accelerator ring, separately and only once the camera has begun to
       retreat. Up close it is two lines running off past your shoulders and it
       reads as noise; it becomes the subject of the wide shot, where the barrel
       is finally small enough to be a bead on it. */
    gl.uniform1f(this.trackU("uFade"), structureFade * (0.06 + 0.94 * this.scroll));
    this.bindSlot(SLOTS * SLOT_SEGS + BEAM_SEGS + DETECTOR_SEGS);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, ACCEL_SEGS);

    for (let i = 0; i < SLOTS; i++) {
      const e = this.events[i];
      if (!e.live) continue;
      const age = time - e.t0;
      const fade = this.envelope(age) * globalFade;
      if (fade <= 0.001) continue;
      gl.uniform1f(this.trackU("uFront"), FRONT_SPEED * Math.max(0, age - PREROLL - QGP * FREEZE));
      gl.uniform1f(this.trackU("uFade"), fade);
      this.bindSlot(i * SLOT_SEGS);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, e.trackCount * SEGMENTS);
    }
    gl.disable(gl.BLEND);

    /* Pass 3 — bloom: bright-pass, then two blurred octaves */
    gl.bindVertexArray(this.vao);
    bindTarget(gl, this.bloomA);
    gl.useProgram(this.brightProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.scene.tex);
    gl.uniform1i(this.brightU("uScene"), 0);
    gl.uniform1f(this.brightU("uThreshold"), 0.22);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.separableBlur(this.bloomA, this.bloomB, 1.0); // tight halo, ends in bloomA
    this.crossBlur(this.bloomA, this.bloomC, this.bloomD, 2.6); // wide halo, ends in bloomD

    /* Pass 4 — composite to the canvas */
    bindTarget(gl, null, this.canvas.width, this.canvas.height);
    gl.useProgram(this.compositeProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.scene.tex);
    gl.uniform1i(this.compositeU("uScene"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomA.tex);
    gl.uniform1i(this.compositeU("uBloomA"), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.bloomD.tex);
    gl.uniform1i(this.compositeU("uBloomB"), 2);
    gl.uniform2f(this.compositeU("uResolution"), this.canvas.width, this.canvas.height);
    gl.uniform1f(this.compositeU("uTime"), time);
    gl.uniform1f(this.compositeU("uScroll"), this.scroll);
    gl.uniform1f(this.compositeU("uIntro"), this.intro);
    gl.uniform1f(this.compositeU("uCopyGuard"), this.copyGuard);
    gl.uniform1f(this.compositeU("uScrollDim"), this.scrollDim);
    gl.uniform1f(this.compositeU("uIntensity"), this.intensity);
    gl.uniform1f(this.compositeU("uHeld"), this.held);
    gl.uniform1f(this.compositeU("uLight"), this.light);
    gl.uniform3f(this.compositeU("uPaper"), this.paper[0], this.paper[1], this.paper[2]);
    gl.uniform3f(this.compositeU("uInkCool"), this.inkCool[0], this.inkCool[1], this.inkCool[2]);
    gl.uniform3f(this.compositeU("uInkWarm"), this.inkWarm[0], this.inkWarm[1], this.inkWarm[2]);
    /* A fixed black point, and it can be fixed now that the composite reads the
       undimmed exposure: the signal it thresholds is the same on every page, so
       the same number means the same thing everywhere. This used to be scaled by
       `intensity` to compensate for the dimming happening first, which corrected
       one of the four attenuations and left the other three to crush the plane. */
    gl.uniform1f(this.compositeU("uInkFloor"), this.inkFloor);
    gl.uniform1f(this.compositeU("uInkGain"), this.inkGain);
    gl.uniform1f(this.compositeU("uInkMax"), this.inkMax);
    gl.uniform1f(this.compositeU("uInkDimGamma"), this.inkDimGamma);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindVertexArray(null);
  }

  /**
   * Point the composite at a theme. Called on mount and on every theme change;
   * the event, the tracks and the bloom are untouched by it, so this never
   * costs more than the uniforms it writes.
   */
  setPalette(opts: { light: boolean; paper: Palette; cool: Palette; warm: Palette }) {
    this.light = opts.light ? 1 : 0;
    this.paper = opts.paper;
    this.inkCool = opts.cool;
    this.inkWarm = opts.warm;
  }

  /** Blurs `source` in place, using `scratch` for the horizontal half. */
  private separableBlur(source: RenderTarget, scratch: RenderTarget, radius: number) {
    const gl = this.gl;
    gl.useProgram(this.blurProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.blurU("uSource"), 0);

    bindTarget(gl, scratch);
    gl.bindTexture(gl.TEXTURE_2D, source.tex);
    gl.uniform2f(this.blurU("uDirection"), radius / scratch.width, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    bindTarget(gl, source);
    gl.bindTexture(gl.TEXTURE_2D, scratch.tex);
    gl.uniform2f(this.blurU("uDirection"), 0, radius / source.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Blurs `source` down into `dest` (a smaller target), via `scratch`. */
  private crossBlur(
    source: RenderTarget,
    scratch: RenderTarget,
    dest: RenderTarget,
    radius: number,
  ) {
    const gl = this.gl;
    gl.useProgram(this.blurProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(this.blurU("uSource"), 0);

    bindTarget(gl, scratch);
    gl.bindTexture(gl.TEXTURE_2D, source.tex);
    gl.uniform2f(this.blurU("uDirection"), radius / scratch.width, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    bindTarget(gl, dest);
    gl.bindTexture(gl.TEXTURE_2D, scratch.tex);
    gl.uniform2f(this.blurU("uDirection"), 0, radius / dest.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    this.stop();
    const gl = this.gl;
    disposeTarget(gl, this.scene);
    disposeTarget(gl, this.bloomA);
    disposeTarget(gl, this.bloomB);
    disposeTarget(gl, this.bloomC);
    disposeTarget(gl, this.bloomD);
    gl.deleteProgram(this.fireballProgram);
    gl.deleteProgram(this.trackProgram);
    gl.deleteProgram(this.brightProgram);
    gl.deleteProgram(this.blurProgram);
    gl.deleteProgram(this.compositeProgram);
    gl.deleteProgram(this.surfaceProgram);
    gl.deleteVertexArray(this.vao);
    gl.deleteVertexArray(this.trackVao);
    gl.deleteVertexArray(this.surfaceVao);
    gl.deleteBuffer(this.trackBuffer);
    gl.deleteBuffer(this.cornerBuffer);
    gl.deleteBuffer(this.surfaceBuffer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/** Column-major [right, up, forward] — must match the projection in TRACK_VERT. */
const cameraBasis = (
  ro: [number, number, number],
  ta: [number, number, number],
): Float32Array => {
  const fx = ta[0] - ro[0];
  const fy = ta[1] - ro[1];
  const fz = ta[2] - ro[2];
  const fl = Math.hypot(fx, fy, fz) || 1;
  const f: [number, number, number] = [fx / fl, fy / fl, fz / fl];
  // cross(up, forward) with up = (0,1,0)
  const rx = 1 * f[2] - 0 * f[1];
  const ry = 0 * f[0] - 0 * f[2];
  const rz = 0 * f[1] - 1 * f[0];
  const rl = Math.hypot(rx, ry, rz) || 1;
  const r: [number, number, number] = [rx / rl, ry / rl, rz / rl];
  const u: [number, number, number] = [
    f[1] * r[2] - f[2] * r[1],
    f[2] * r[0] - f[0] * r[2],
    f[0] * r[1] - f[1] * r[0],
  ];
  return new Float32Array([r[0], r[1], r[2], u[0], u[1], u[2], f[0], f[1], f[2]]);
};
