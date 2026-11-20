// Brush-stroke banners: short impressionist strokes (in the manner of Monet's water and garden paintings)
// laid along a gentle flow field, in up to three layers. Pure module: `brushStrokes` returns the strokes;
// `brush-draw.ts` paints them with bristle texture on a canvas.

import type { HeroPattern } from "./pattern";

/**
 * - `water`: horizontal ripples, darker and lighter bands like reflections, with round lily-pad dabs.
 * - `meadow`: grass strokes leaning up and to the right, denser towards the bottom.
 * - `swirl`: strokes circling the focus.
 * - `breeze`: a soft, wandering current.
 */
export const FLOWS = ["water", "meadow", "swirl", "breeze"] as const;
export const BRUSH_ACCENTS = ["lime", "pine", "both"] as const;

export type BrushFlow = (typeof FLOWS)[number];
export type BrushAccent = (typeof BRUSH_ACCENTS)[number];

export type BrushPattern = {
  kind: "brush";
  flow: BrushFlow;
  /** Stroke length in CSS px. */
  length: number;
  /** Stroke width in CSS px. */
  width: number;
  /** How much of the banner is covered, 0–1. */
  density: number;
  /** Bristles per stroke: more gives a finer, more textured stroke. */
  bristles: number;
  /** How much a stroke bends away from the flow, 0–1. */
  wobble: number;
  /** Share of accent-coloured dabs, gathered in patches, 0–1. */
  accent: number;
  palette: BrushAccent;
  /** Paint layers: 1 = main strokes only, 2 = + soft underpainting, 3 = + small highlights. */
  layers: number;
  /** Paper grain, 0–1. */
  grain: number;
  /** Where accents gather and the flow centres, 0–1 across and down. */
  focusX: number;
  focusY: number;
  /** How strongly the text area is kept clear, 0–1. */
  clear: number;
  seed: number;
};

export const DEFAULT_BRUSH: BrushPattern = {
  kind: "brush",
  flow: "water",
  length: 34,
  width: 9,
  density: 0.55,
  bristles: 8,
  wobble: 0.35,
  accent: 0.22,
  palette: "both",
  layers: 3,
  grain: 0.5,
  focusX: 0.78,
  focusY: 0.55,
  clear: 1,
  seed: 11,
};

/** A stroke: its path (CSS px), width, tone (0–1, how much ink) and colour role. */
export type Stroke = {
  points: [number, number][];
  width: number;
  tone: number;
  /** 0 = ink, 1 = muted ink (a second, softer neutral), 2 = lime, 3 = pine. */
  colour: 0 | 1 | 2 | 3;
  /** Seed for this stroke's bristles. */
  seed: number;
};

/** Small seeded generator (mulberry32), so a banner paints the same way every time. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed + 1, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const s = (t: number) => t * t * (3 - 2 * t);
  const xf = s(x - xi);
  const yf = s(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

/** Flow direction (radians) at a point; x, y in banner-height units, fx, fy the focus. */
function flowAngle(p: BrushPattern, x: number, y: number, fx: number, fy: number) {
  const n = noise(x * 1.6, y * 1.6, p.seed) - 0.5;
  switch (p.flow) {
    case "water":
      return n * 0.35 + Math.sin(y * 9 + p.seed) * 0.06;
    case "meadow":
      return -1.15 + n * 0.7;
    case "swirl":
      return Math.atan2(y - fy, x - fx) + Math.PI / 2 + n * 0.6;
    case "breeze":
      return (noise(x * 0.9, y * 0.9, p.seed + 5) - 0.5) * Math.PI * 1.4;
  }
}

/** How much paint a spot gets before density, 0–1: the flow's own light and dark. */
function toneAt(p: BrushPattern, x: number, y: number, fx: number, fy: number) {
  const n = noise(x * 2.2 + 30, y * 2.2, p.seed);
  switch (p.flow) {
    case "water":
      return 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(y * 7 + n * 3)) + (n - 0.5) * 0.3;
    case "meadow":
      return 0.25 + 0.6 * Math.min(1, Math.max(0, y)) + (n - 0.5) * 0.3;
    case "swirl":
      return 0.3 + 0.5 * Math.exp(-((Math.hypot(x - fx, y - fy) / 0.9) ** 2)) + (n - 0.5) * 0.3;
    case "breeze":
      return 0.3 + 0.5 * n;
  }
}

/**
 * The strokes for a banner of `width` × `height` px, in paint order (underpainting first).
 * Strokes start on a jittered grid so coverage is even, then follow the flow in short steps.
 */
export function brushStrokes(p: BrushPattern, width: number, height: number): Stroke[] {
  const rand = rng(p.seed * 9973 + 17);
  const strokes: Stroke[] = [];
  const fx = (p.focusX * width) / height;
  const fy = p.focusY;
  const reach = Math.hypot(width, height) / height;
  const accentColour = (): 2 | 3 => (p.palette === "lime" ? 2 : p.palette === "pine" ? 3 : rand() < 0.6 ? 2 : 3);

  const layers = [
    { on: p.layers >= 2, scale: 1.8, spacing: 1.9, tone: 0.45, accent: 0 }, // soft underpainting
    { on: true, scale: 1, spacing: 1.35, tone: 1, accent: 1 }, // main strokes
    { on: p.layers >= 3, scale: 0.55, spacing: 3.4, tone: 0.9, accent: 1.4 }, // small highlights
  ];

  for (const [li, layer] of layers.entries()) {
    if (!layer.on) continue;
    const w = p.width * layer.scale;
    const len = p.length * layer.scale;
    const gap = (w * layer.spacing) / Math.max(0.15, p.density);
    for (let gy = -gap; gy < height + gap; gy += gap * 0.8) {
      for (let gx = -gap; gx < width + gap; gx += gap) {
        let x = gx + (rand() - 0.5) * gap * 1.4;
        let y = gy + (rand() - 0.5) * gap * 1.4;
        const ux = x / height;
        const uy = y / height;
        const far = Math.min(1, Math.hypot(ux - fx, uy - fy) / (reach * 0.75));
        const tone = Math.min(1, toneAt(p, ux, uy, fx, fy)) * layer.tone * (1 - 0.45 * far);
        if (tone < 0.08 || rand() > 0.2 + p.density * 0.7) continue;

        // Accents gather in patches near the focus (low-frequency noise), never as scattered confetti.
        const patch = noise(ux * 2.4, uy * 2.4, p.seed + 77);
        const isAccent = layer.accent > 0 && patch > 1 - p.accent * layer.accent * (1.2 - far) && rand() < 0.75;
        const colour: Stroke["colour"] = isAccent ? accentColour() : rand() < 0.4 ? 1 : 0;

        // Lily pads on water: some accent dabs become short round clusters.
        const steps = p.flow === "water" && isAccent && rand() < 0.4 ? 3 : 7;
        const stepLen = (len * (0.6 + rand() * 0.6)) / (steps - 1);
        const points: [number, number][] = [[x, y]];
        let bend = (rand() - 0.5) * p.wobble * 1.2;
        for (let s = 1; s < steps; s++) {
          const a = flowAngle(p, x / height, y / height, fx, fy) + bend;
          bend += (rand() - 0.5) * p.wobble * 0.5;
          x += Math.cos(a) * stepLen;
          y += Math.sin(a) * stepLen;
          points.push([x, y]);
        }
        strokes.push({ points, width: w * (0.75 + rand() * 0.5), tone, colour, seed: Math.floor(rand() * 1e9) + li });
      }
    }
  }
  return strokes;
}

/** Keep a stored or pasted brush pattern valid. */
export function sanitizeBrush(input: unknown): BrushPattern {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const num = (k: keyof BrushPattern, min: number, max: number) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (DEFAULT_BRUSH[k] as number);
  };
  const pick = <T extends string>(k: keyof BrushPattern, options: readonly T[]) =>
    (options as readonly unknown[]).includes(o[k]) ? (o[k] as T) : (DEFAULT_BRUSH[k] as T);
  return {
    kind: "brush",
    flow: pick("flow", FLOWS),
    length: num("length", 8, 120),
    width: num("width", 3, 30),
    density: num("density", 0.1, 1),
    bristles: Math.round(num("bristles", 2, 16)),
    wobble: num("wobble", 0, 1),
    accent: num("accent", 0, 1),
    palette: pick("palette", BRUSH_ACCENTS),
    layers: Math.round(num("layers", 1, 3)),
    grain: num("grain", 0, 1),
    focusX: num("focusX", 0, 1),
    focusY: num("focusY", 0, 1),
    clear: num("clear", 0, 1),
    seed: Math.round(num("seed", 1, 999)),
  };
}

export function isBrush(p: BannerPattern): p is BrushPattern {
  return "kind" in p && p.kind === "brush";
}

/** Any banner background: a pixel pattern or a brush pattern (`kind: "brush"`). */
export type BannerPattern = HeroPattern | BrushPattern;
