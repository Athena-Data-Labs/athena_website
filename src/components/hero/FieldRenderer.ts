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
  TRACK_FRAG,
  TRACK_VERT,
} from "./fieldShaders";
import {
  buildEvent,
  mulberry32,
  writeBeamAxis,
  BEAM_DIR,
  FLOATS_PER_SEG,
  MAX_TRACKS,
  SEGMENTS,
} from "./collision";

/** How many collisions can be on screen at once. Three is the usual count. */
const SLOTS = 4;
const SLOT_SEGS = MAX_TRACKS * SEGMENTS;
const SLOT_FLOATS = SLOT_SEGS * FLOATS_PER_SEG;
const BEAM_SEGS = SEGMENTS;
const TOTAL_SEGS = SLOTS * SLOT_SEGS + BEAM_SEGS;

const BASE_MULT = 110; // multiplicity of a head-on event at full quality
const MAX_SCENE_PIXELS = 4_200_000; // the march is gone; this is geometry-bound now
/**
 * Half a track's width, in CSS pixels. Stated in CSS pixels on purpose: a line
 * specified in device pixels is twice as heavy on a non-retina screen as on a
 * retina one, which is exactly backwards.
 */
const LINE_HALF_CSS = 0.85;
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
/** How far up the beam axis a bunch starts, in world units. */
const APPROACH = 2.4;
const FRONT_SPEED = 9;
const HOLD = 1.4;
const TAIL = 1;
const LIFE = 7;
const PERIOD = 6;

type Quality = { scale: number; mult: number };

/** sRGB in 0..1, the space the composite shader works in. */
export type Palette = [number, number, number];

type CollisionEvent = {
  t0: number;
  vertex: [number, number, number];
  trackCount: number;
  live: boolean;
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

  private fireballU: (n: string) => WebGLUniformLocation | null;
  private trackU: (n: string) => WebGLUniformLocation | null;
  private brightU: (n: string) => WebGLUniformLocation | null;
  private blurU: (n: string) => WebGLUniformLocation | null;
  private compositeU: (n: string) => WebGLUniformLocation | null;

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
  private cornerBuffer: WebGLBuffer;
  private geometry = new Float32Array(TOTAL_SEGS * FLOATS_PER_SEG);
  private events: CollisionEvent[] = Array.from({ length: SLOTS }, () => ({
    t0: 0,
    vertex: [0, 0, 0] as [number, number, number],
    trackCount: 0,
    live: false,
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
  private pointerVel: [number, number] = [0, 0];
  private rawPointerUv: [number, number] = [0.5, 0.5];
  private pointerUv: [number, number] = [0.5, 0.5];
  private ripple = 0;
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

    this.fireballU = uniformLocator(gl, this.fireballProgram);
    this.trackU = uniformLocator(gl, this.trackProgram);
    this.brightU = uniformLocator(gl, this.brightProgram);
    this.blurU = uniformLocator(gl, this.blurProgram);
    this.compositeU = uniformLocator(gl, this.compositeProgram);

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

    const beamFloats = SLOTS * SLOT_FLOATS;
    writeBeamAxis(this.geometry, beamFloats);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trackBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      beamFloats * 4,
      this.geometry,
      beamFloats,
      BEAM_SEGS * FLOATS_PER_SEG,
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
    this.rawPointerUv = [uvx, uvy];
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
    const { vertex, trackCount } = buildEvent(this.geometry, base, this.rng, budget);
    this.events[slot] = { t0, vertex, trackCount, live: true };

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
      for (const age of [3.2, 1.6, 0.7]) this.spawn(time - age);
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
      else if (this.quality.scale > 0.62) this.quality.scale -= 0.16;
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
    const prevX = this.pointer[0];
    const prevY = this.pointer[1];
    this.pointer[0] += (this.pointerTarget[0] - this.pointer[0]) * ease * 0.55;
    this.pointer[1] += (this.pointerTarget[1] - this.pointer[1]) * ease * 0.55;
    this.pointerVel = [this.pointer[0] - prevX, this.pointer[1] - prevY];
    this.pointerUv[0] += (this.rawPointerUv[0] - this.pointerUv[0]) * ease * 0.7;
    this.pointerUv[1] += (this.rawPointerUv[1] - this.pointerUv[1]) * ease * 0.7;

    const speed = Math.hypot(this.pointerVel[0], this.pointerVel[1]) * 40;
    this.ripple += (Math.min(speed, 1.6) - this.ripple) * Math.min(1, dt * 6);

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
    const aspect = this.scene.width / this.scene.height;
    const pan = 0.96 - 0.6 * Math.min(1.9, Math.max(0.4, aspect));
    const ro: [number, number, number] = [
      this.pointer[0] * 0.42 + pan,
      this.pointer[1] * 0.3,
      -2.6 - this.scroll * 1.4,
    ];
    const ta: [number, number, number] = [
      this.pointer[0] * 0.12 + pan,
      this.pointer[1] * 0.08,
      1.0,
    ];
    const basis = cameraBasis(ro, ta);
    const focal = 1.45;

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

    for (let i = 0; i < SLOTS; i++) {
      const e = this.events[i];
      const age = time - e.t0;
      if (e.live && age > LIFE) e.live = false;
      const o = i * 4;
      if (!e.live) {
        this.eventUniform[o + 2] = -1;
        continue;
      }
      const camZ = project(e.vertex[0], e.vertex[1], e.vertex[2], this.eventUniform, o);
      this.eventUniform[o + 2] = age;
      this.eventUniform[o + 3] = camZ;

      // The two bunches, closing on the vertex along the beam from either side.
      if (age < PREROLL) {
        const gap = APPROACH * (1 - age / PREROLL);
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

    bindTarget(gl, this.scene);
    gl.disable(gl.BLEND);
    gl.useProgram(this.fireballProgram);
    gl.uniform2f(this.fireballU("uResolution"), this.scene.width, this.scene.height);
    gl.uniform1f(this.fireballU("uScroll"), this.scroll);
    gl.uniform1f(this.fireballU("uIntro"), this.intro);
    gl.uniform1f(this.fireballU("uScrollDim"), this.scrollDim);
    gl.uniform1f(this.fireballU("uPreroll"), PREROLL);
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
    const globalFade =
      Math.max(0, this.intro * (1 - this.scroll * 0.85)) *
      this.trackIntensity *
      Math.sqrt(desiredHalfPx / drawHalfPx);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.trackProgram);
    gl.uniform3f(this.trackU("uOrigin"), ro[0], ro[1], ro[2]);
    gl.uniformMatrix3fv(this.trackU("uBasis"), false, basis);
    gl.uniform1f(this.trackU("uAspect"), aspect);
    gl.uniform1f(this.trackU("uFocal"), focal);
    // NDC height units: the buffer spans 2 of them over its full pixel height.
    gl.uniform1f(this.trackU("uHalfWidth"), (2 * drawHalfPx) / this.scene.height);
    gl.bindVertexArray(this.trackVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trackBuffer);

    // The axis first, under everything: it is the only part that persists.
    gl.uniform1f(this.trackU("uFront"), 0);
    gl.uniform1f(this.trackU("uFade"), globalFade);
    this.bindSlot(SLOTS * SLOT_SEGS);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, BEAM_SEGS);

    for (let i = 0; i < SLOTS; i++) {
      const e = this.events[i];
      if (!e.live) continue;
      const age = time - e.t0;
      const fade = this.envelope(age) * globalFade;
      if (fade <= 0.001) continue;
      gl.uniform1f(this.trackU("uFront"), FRONT_SPEED * Math.max(0, age - PREROLL));
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
    gl.uniform2f(this.compositeU("uPointerPx"), this.pointerUv[0], this.pointerUv[1]);
    gl.uniform1f(this.compositeU("uRipple"), this.reducedMotion ? 0 : this.ripple);
    gl.uniform1f(this.compositeU("uScroll"), this.scroll);
    gl.uniform1f(this.compositeU("uIntro"), this.intro);
    gl.uniform1f(this.compositeU("uCopyGuard"), this.copyGuard);
    gl.uniform1f(this.compositeU("uScrollDim"), this.scrollDim);
    gl.uniform1f(this.compositeU("uIntensity"), this.intensity);
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
    gl.deleteVertexArray(this.vao);
    gl.deleteVertexArray(this.trackVao);
    gl.deleteBuffer(this.trackBuffer);
    gl.deleteBuffer(this.cornerBuffer);
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
