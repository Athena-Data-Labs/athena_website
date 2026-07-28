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
  FIELD_FRAG,
  FULLSCREEN_VERT,
  TRACE_FRAG,
  TRACE_VERT,
} from "./fieldShaders";

const TRACE_COUNT = 420;
const MAX_STEPS = 128;
const MIN_STEPS = 44;
const MAX_SCENE_PIXELS = 1_150_000; // keeps the march affordable on integrated GPUs
const TRAIL = 0.055; // seconds of travel drawn behind each signal, as a streak

type Quality = { steps: number; scale: number };

/**
 * Owns the hero's WebGL2 pipeline. React never touches GL state directly — it
 * pushes pointer/scroll/intro values in and lets this drive its own rAF loop,
 * so re-renders can never cost a frame.
 */
export class FieldRenderer {
  private gl: GL;
  private canvas: HTMLCanvasElement;

  private vao: WebGLVertexArrayObject;
  private fieldProgram: WebGLProgram;
  private traceProgram: WebGLProgram;
  private brightProgram: WebGLProgram;
  private blurProgram: WebGLProgram;
  private compositeProgram: WebGLProgram;

  private fieldU: (n: string) => WebGLUniformLocation | null;
  private traceU: (n: string) => WebGLUniformLocation | null;
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

  // Trace (particle) state
  private traceVao: WebGLVertexArrayObject;
  private tracePosBuffer: WebGLBuffer;
  private traceAlphaBuffer: WebGLBuffer;
  private tracePositions = new Float32Array(TRACE_COUNT * 6);
  private traceAlphas = new Float32Array(TRACE_COUNT * 2);
  private particles = new Float32Array(TRACE_COUNT * 5); // x, y, z, age, life

  // Frame state
  private raf = 0;
  private startTime = performance.now();
  private lastFrame = this.startTime;
  private frameEma = 16;
  private qualityTick = 0;
  private quality: Quality = { steps: 96, scale: 1 };
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
  /** Phones put the copy over the middle of the plane, so the traces thin out. */
  traceIntensity = 1;
  /** Page-level exposure — interior pages sit the field further back than the hero. */
  intensity = 1;
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
  /** Ceiling for the adaptive controller — lowered on phones. */
  private maxSteps = MAX_STEPS;

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
    this.fieldProgram = createProgram(gl, FULLSCREEN_VERT, FIELD_FRAG);
    this.traceProgram = createProgram(gl, TRACE_VERT, TRACE_FRAG);
    this.brightProgram = createProgram(gl, FULLSCREEN_VERT, BRIGHT_FRAG);
    this.blurProgram = createProgram(gl, FULLSCREEN_VERT, BLUR_FRAG);
    this.compositeProgram = createProgram(gl, FULLSCREEN_VERT, COMPOSITE_FRAG);

    this.fieldU = uniformLocator(gl, this.fieldProgram);
    this.traceU = uniformLocator(gl, this.traceProgram);
    this.brightU = uniformLocator(gl, this.brightProgram);
    this.blurU = uniformLocator(gl, this.blurProgram);
    this.compositeU = uniformLocator(gl, this.compositeProgram);

    this.traceVao = gl.createVertexArray()!;
    this.tracePosBuffer = gl.createBuffer()!;
    this.traceAlphaBuffer = gl.createBuffer()!;
    gl.bindVertexArray(this.traceVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tracePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.tracePositions.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.traceAlphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.traceAlphas.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.seedParticles();
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
    this.maxSteps = on ? 72 : MAX_STEPS;
    // Ceiling, not just a starting point. Without this the controller's recovery
    // branch walks `scale` back up to 1 the moment the phone has a few cheap
    // idle frames, quietly undoing the clamp below.
    this.maxScale = on ? 0.8 : 1;
    if (!on) return;
    this.quality.steps = Math.min(this.quality.steps, 64);
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

    // The march runs at a fraction of output res and is upscaled — cheaper and
    // it softens the lattice the way a real lens would.
    const budget = Math.sqrt(MAX_SCENE_PIXELS / (outW * outH));
    const sceneScale = Math.min(0.70, budget) * this.quality.scale;
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

  /* ── Particles: an ABC flow, which is divergence-free by construction ──── */

  private seedParticles() {
    for (let i = 0; i < TRACE_COUNT; i++) {
      this.respawn(i, true);
    }
  }

  private respawn(i: number, initial = false) {
    const p = this.particles;
    const o = i * 5;
    p[o] = (Math.random() - 0.5) * 7.0;
    p[o + 1] = (Math.random() - 0.5) * 4.6;
    p[o + 2] = initial ? Math.random() * 8.5 - 1.5 : 6.5 + Math.random() * 2.5;
    p[o + 3] = initial ? Math.random() * 4 : 0;
    p[o + 4] = 5 + Math.random() * 7;
  }

  private stepParticles(dt: number, time: number) {
    const p = this.particles;
    const pos = this.tracePositions;
    const alpha = this.traceAlphas;

    // Slowly rotating ABC coefficients keep the streamlines from settling.
    const A = 0.85 + 0.25 * Math.sin(time * 0.11);
    const B = 0.75 + 0.25 * Math.cos(time * 0.09);
    const C = 0.65 + 0.25 * Math.sin(time * 0.07 + 1.3);
    const k = 0.78;
    const speed = 0.34;

    for (let i = 0; i < TRACE_COUNT; i++) {
      const o = i * 5;
      const x = p[o];
      const y = p[o + 1];
      const z = p[o + 2];

      const vx = A * Math.sin(k * z) + C * Math.cos(k * y);
      const vy = B * Math.sin(k * x) + A * Math.cos(k * z);
      const vz = C * Math.sin(k * y) + B * Math.cos(k * x) - 2.2; // drift toward the lens

      const nx = x + vx * speed * dt;
      const ny = y + vy * speed * dt;
      const nz = z + vz * speed * dt;

      p[o + 3] += dt;
      const age = p[o + 3];
      const life = p[o + 4];

      // The streak is drawn back along the velocity by a fixed exposure, not to
      // last frame's position — one frame of travel is a dot, not a trace.
      const v = i * 6;
      pos[v] = nx - vx * speed * TRAIL;
      pos[v + 1] = ny - vy * speed * TRAIL;
      pos[v + 2] = nz - vz * speed * TRAIL;
      pos[v + 3] = nx;
      pos[v + 4] = ny;
      pos[v + 5] = nz;

      // Fade in and out so respawns are never visible as pops.
      const fade = Math.min(1, age / 1.1) * Math.min(1, Math.max(0, (life - age) / 1.6));
      const a = i * 2;
      alpha[a] = fade * 0.85;
      alpha[a + 1] = fade;

      p[o] = nx;
      p[o + 1] = ny;
      p[o + 2] = nz;

      if (age > life || nz < -2.6 || Math.abs(nx) > 5.5 || Math.abs(ny) > 3.6) {
        this.respawn(i);
      }
    }
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

  /** Drops march quality if the GPU is struggling, restores it when it is not. */
  private tune() {
    if (this.reducedMotion) return;
    this.qualityTick++;
    if (this.qualityTick < 90) return;
    this.qualityTick = 0;

    const before = this.quality.scale;
    if (this.frameEma > 26) {
      if (this.quality.steps > MIN_STEPS) this.quality.steps -= 16;
      else if (this.quality.scale > 0.62) this.quality.scale -= 0.16;
    } else if (this.frameEma < 13) {
      if (this.quality.scale < this.maxScale) {
        this.quality.scale = Math.min(this.maxScale, this.quality.scale + 0.16);
      } else if (this.quality.steps < this.maxSteps) this.quality.steps += 12;
    }
    this.quality.steps = Math.max(MIN_STEPS, Math.min(this.maxSteps, this.quality.steps));
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

    /* Pass 1 — the lattice */
    bindTarget(gl, this.scene);
    gl.disable(gl.BLEND);
    gl.useProgram(this.fieldProgram);
    gl.uniform2f(this.fieldU("uResolution"), this.scene.width, this.scene.height);
    gl.uniform1f(this.fieldU("uTime"), time);
    gl.uniform2f(this.fieldU("uPointer"), this.pointer[0], this.pointer[1]);
    gl.uniform1f(this.fieldU("uScroll"), this.scroll);
    gl.uniform1f(this.fieldU("uIntro"), this.intro);
    gl.uniform1i(this.fieldU("uSteps"), this.reducedMotion ? 72 : this.quality.steps);
    gl.uniform1f(this.fieldU("uScrollDim"), this.scrollDim);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* Pass 2 — signal traces, additively over the lattice */
    if (!this.reducedMotion) this.stepParticles(dt, time);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tracePosBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.tracePositions);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.traceAlphaBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.traceAlphas);

    const ro: [number, number, number] = [
      this.pointer[0] * 0.42,
      this.pointer[1] * 0.3,
      -2.6 - this.scroll * 1.4,
    ];
    const ta: [number, number, number] = [this.pointer[0] * 0.12, this.pointer[1] * 0.08, 1.0];
    const basis = cameraBasis(ro, ta);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.traceProgram);
    gl.uniform3f(this.traceU("uOrigin"), ro[0], ro[1], ro[2]);
    gl.uniformMatrix3fv(this.traceU("uBasis"), false, basis);
    gl.uniform1f(this.traceU("uAspect"), this.scene.width / this.scene.height);
    gl.uniform1f(this.traceU("uFocal"), 1.45);
    gl.uniform1f(
      this.traceU("uFade"),
      Math.max(0, this.intro * (1 - this.scroll * 0.85)) * this.traceIntensity,
    );
    gl.bindVertexArray(this.traceVao);
    gl.drawArrays(gl.LINES, 0, TRACE_COUNT * 2);
    gl.disable(gl.BLEND);

    /* Pass 3 — bloom: bright-pass, then two blurred octaves */
    gl.bindVertexArray(this.vao);
    bindTarget(gl, this.bloomA);
    gl.useProgram(this.brightProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.scene.tex);
    gl.uniform1i(this.brightU("uScene"), 0);
    gl.uniform1f(this.brightU("uThreshold"), 0.30);
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
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindVertexArray(null);
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
    gl.deleteProgram(this.fieldProgram);
    gl.deleteProgram(this.traceProgram);
    gl.deleteProgram(this.brightProgram);
    gl.deleteProgram(this.blurProgram);
    gl.deleteProgram(this.compositeProgram);
    gl.deleteVertexArray(this.vao);
    gl.deleteVertexArray(this.traceVao);
    gl.deleteBuffer(this.tracePosBuffer);
    gl.deleteBuffer(this.traceAlphaBuffer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

/** Column-major [right, up, forward] — must match the raymarch camera exactly. */
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
