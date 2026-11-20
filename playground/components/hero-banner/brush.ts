// Brush-stroke banners: thick, textured oil-paint strokes (impasto, in the manner of Monet) that trace the
// micro-structures found in plants: cell walls, growth rings, fern fronds, pollen, grana, xylem, fungal threads
// and sunflower spirals. Pure module: `brushStrokes` returns the strokes; `brush-draw.ts` paints them with bristle texture.

import type { NaturePattern } from "./nature";
import type { HeroPattern } from "./pattern";

/**
 * Every flow is a plant micro-structure, each a different family of shapes so no two read alike. Strokes
 * start on the structure and follow it, so the banner reads as a thick oil painting of that structure.
 * - `cells`: a network of plant cell walls, a chloroplast dab in each cell.
 * - `rings`: concentric growth rings, like a stem's cross-section, wobbling outwards from the focus.
 * - `fronds`: fern fronds: wavy stems with leaflets angled off both sides (herringbone).
 * - `pollen`: round pollen grains, each painted as a small swirled ball.
 * - `grana`: stacks of short discs (the thylakoid stacks inside a chloroplast), linked by thin lamellae.
 * - `xylem`: vertical water vessels with spiral thickening bands between their walls.
 * - `mycelium`: fine fungal threads with branches.
 * - `spiral`: a sunflower head: seeds along golden-angle spiral arms.
 */
export const FLOWS = ["cells", "rings", "fronds", "pollen", "grana", "xylem", "mycelium", "spiral"] as const;
export const BRUSH_ACCENTS = ["lime", "pine", "both"] as const;

export type BrushFlow = (typeof FLOWS)[number];
export type BrushAccent = (typeof BRUSH_ACCENTS)[number];

export type BrushPattern = {
  kind: "brush";
  flow: BrushFlow;
  /** Size of the structure (a cell, the vein spacing…), relative to the banner height. */
  scale: number;
  /** Stroke length in CSS px. */
  length: number;
  /** Stroke width in CSS px. */
  width: number;
  /** How much of the structure is painted, 0–1. */
  density: number;
  /** Bristle ridges raked through each stroke's paint: more gives a finer texture. */
  bristles: number;
  /** How raised the paint looks (light and shadow on the stroke edges, cast shadow), 0–1. */
  relief: number;
  /** How much a stroke wanders off the structure, 0–1. */
  wobble: number;
  /** Share of accent-coloured strokes, on the structure's highlights (pores, chloroplasts, major veins…), 0–1. */
  accent: number;
  palette: BrushAccent;
  /** Paint layers: 1 = structure only, 2 = + soft underpainting, 3 = + small highlights. */
  layers: number;
  /** Paper grain, 0–1. */
  grain: number;
  /** Where accents gather and the spiral centres, 0–1 across and down. */
  focusX: number;
  focusY: number;
  /** How strongly the text area is kept clear, 0–1. */
  clear: number;
  seed: number;
};

export const DEFAULT_BRUSH: BrushPattern = {
  kind: "brush",
  flow: "cells",
  scale: 1,
  length: 60,
  width: 15,
  density: 0.55,
  bristles: 6,
  relief: 0.7,
  wobble: 0.15,
  accent: 0.35,
  palette: "both",
  layers: 2,
  grain: 0.4,
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

function fbm(x: number, y: number, seed: number) {
  return noise(x, y, seed) * 0.6 + noise(x * 2.1, y * 2.1, seed + 9) * 0.3 + noise(x * 4.3, y * 4.3, seed + 17) * 0.1;
}

/** Nearest and second-nearest jittered grid points (Voronoi): `d2 - d1` is ~0 on a cell wall. */
function voronoi(gx: number, gy: number, seed: number) {
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let d1 = 9;
  let d2 = 9;
  let cell: [number, number] = [0, 0];
  let at: [number, number] = [0, 0];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx + 0.15 + hash(ix + dx, iy + dy, seed) * 0.7;
      const cy = iy + dy + 0.15 + hash(ix + dx, iy + dy, seed + 1) * 0.7;
      const d = Math.hypot(gx - cx, gy - cy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        cell = [ix + dx, iy + dy];
        at = [cx, cy];
      } else if (d < d2) d2 = d;
    }
  }
  return { d1, d2, cell, at };
}

/** Where the structure is (0–1), which way it runs (radians), and whether this is a highlight. */
type Structure = { on: number; angle: number; highlight: boolean };

/**
 * A line structure from a scalar field: the line is where `f = level`. The strength falls off with
 * distance to the line (measured with the field's slope, so lines keep their width); the direction is
 * along the line (perpendicular to the slope).
 */
function along(f: (x: number, y: number) => number, x: number, y: number, level: number, halfWidth: number, h: number) {
  const v = f(x, y) - level;
  const gx = (f(x + h, y) - level - v) / h;
  const gy = (f(x, y + h) - level - v) / h;
  const slope = Math.hypot(gx, gy) + 1e-6;
  const dist = Math.abs(v) / slope;
  return { on: Math.exp(-((dist / halfWidth) ** 2)), angle: Math.atan2(gy, gx) + Math.PI / 2 };
}

/** Like `along`, for evenly spaced lines: the lines are where `f` is a whole number (spacing = 1 in f). */
function alongPeriodic(f: (x: number, y: number) => number, x: number, y: number, halfWidth: number, h: number) {
  const n = f(x, y);
  const k = Math.round(n);
  const gx = (f(x + h, y) - n) / h;
  const gy = (f(x, y + h) - n) / h;
  const slope = Math.hypot(gx, gy) + 1e-6;
  return { on: Math.exp(-(((n - k) / slope / halfWidth) ** 2)), angle: Math.atan2(gy, gx) + Math.PI / 2, k };
}

/** The plant structure at a point (x, y in banner-height units; fx, fy the focus). */
function structure(p: BrushPattern, x: number, y: number, fx: number, fy: number, lw: number): Structure {
  const s = p.scale;
  const h = 0.004;
  // Lines are never thinner than the stroke (lw = half the stroke width, in banner units), so thick strokes
  // land on them and can follow them.
  const hw = (v: number) => Math.max(v, lw);
  switch (p.flow) {
    case "rings": {
      // Growth rings around the focus, slightly oval and wobbling; every fifth ring is a highlight.
      const ring = alongPeriodic((ax, ay) => (Math.hypot(ax - fx, (ay - fy) * 1.15) + (fbm(ax * 2, ay * 2, p.seed) - 0.5) * 0.08 * s) / (s * 0.075), x, y, hw(s * 0.014), h);
      return { on: ring.on, angle: ring.angle, highlight: ring.k % 5 === 0 };
    }
    case "fronds": {
      // Wavy stems across the banner; leaflets lean forward off both sides of each stem (herringbone).
      const P = s * 0.34;
      const g = (ax: number, ay: number) => ay + Math.sin((ax * 2.2) / s + p.seed) * 0.07 * s + (fbm(ax, ay, p.seed) - 0.5) * 0.12 * s;
      const v = g(x, y);
      const k = Math.round(v / P);
      const d = v - k * P;
      const gx = (g(x + h, y) - v) / h;
      const gy = (g(x, y + h) - v) / h;
      const stem = Math.atan2(gy, gx) + Math.PI / 2;
      if (Math.abs(d) < hw(s * 0.012)) return { on: 1, angle: stem, highlight: true };
      const reach = s * 0.12;
      const band = Math.max(0, 1 - Math.abs(d) / reach);
      return { on: band ** 0.6 * 0.9, angle: stem + (d > 0 ? 0.85 : -0.85), highlight: false };
    }
    case "pollen": {
      // Round grains on a jittered grid; each is painted round and round, like a swirled ball of paint.
      const G = s * 0.3;
      const v = voronoi(x / G, y / G, p.seed);
      const cx = v.at[0] * G;
      const cy = v.at[1] * G;
      const R = s * 0.085 * (0.7 + hash(v.cell[0], v.cell[1], p.seed + 5) * 0.7);
      const d = Math.hypot(x - cx, y - cy);
      if (d > R * 1.25 || hash(v.cell[0], v.cell[1], p.seed + 6) > 0.7) return { on: 0, angle: 0, highlight: false };
      return { on: d < R ? 0.85 : 0.6, angle: Math.atan2(y - cy, x - cx) + Math.PI / 2, highlight: hash(v.cell[0], v.cell[1], p.seed + 7) < 0.2 };
    }
    case "grana": {
      // Stacks of short horizontal discs in some grid tiles, linked by thin horizontal lamellae.
      const T = s * 0.34;
      const col = Math.floor(x / T);
      const row = Math.floor(y / T);
      if (hash(col, row, p.seed) > 0.6) return { on: 0, angle: 0, highlight: false };
      const u = x / T - col - (0.5 + (hash(col, row, p.seed + 1) - 0.5) * 0.3);
      const vv = y / T - row - 0.5;
      const n = 3 + Math.floor(hash(col, row, p.seed + 2) * 3);
      // Discs at least a stroke apart, so each disc is its own lump of paint.
      const gap = Math.max(0.11, (lw * 2.6) / T);
      const k = Math.round(vv / gap);
      const inStack = Math.abs(k) <= (n - 1) / 2 && Math.abs(vv - k * gap) < gap * 0.35;
      if (inStack && Math.abs(u) < 0.24) return { on: 1, angle: 0, highlight: hash(col, row, p.seed + 3) < 0.15 };
      if (Math.abs(vv) < gap * 0.25 && u > 0.24 && hash(col, row, p.seed + 4) < 0.5) return { on: 0.55, angle: 0, highlight: false };
      return { on: 0, angle: 0, highlight: false };
    }
    case "cells": {
      // Cell walls; inside each cell a chloroplast (a short, round dab).
      const g = s * 0.22;
      const wall = along((ax, ay) => {
        const v = voronoi(ax / g, ay / g, p.seed);
        return (v.d2 - v.d1) * g;
      }, x, y, 0, hw(s * 0.022), h);
      const v = voronoi(x / g, y / g, p.seed);
      const blob = Math.exp(-(((v.d1 * g) / hw(s * 0.035)) ** 2));
      if (blob > wall.on) return { on: blob * 0.85, angle: hash(v.cell[0], v.cell[1], p.seed + 3) * Math.PI, highlight: true };
      return { ...wall, highlight: false };
    }
    case "xylem": {
      // Vertical vessels: two walls each, with diagonal bands of spiral thickening between them.
      const W = s * 0.2;
      const col = Math.floor(x / W);
      if (hash(col, 0, p.seed) > 0.55) return { on: 0, angle: Math.PI / 2, highlight: false };
      const centre = (col + 0.5 + (hash(col, 1, p.seed) - 0.5) * 0.3) * W + Math.sin(y * 3 + col) * s * 0.01;
      const half = W * (0.17 + hash(col, 2, p.seed) * 0.08);
      const dx = x - centre;
      const wall = Math.exp(-(((Math.abs(dx) - half) / hw(s * 0.018)) ** 2));
      if (Math.abs(dx) < half * 0.85) {
        const period = s * 0.06;
        const band = (y + dx * 0.7) / period;
        const onBand = Math.exp(-((((band - Math.round(band)) * period) / (s * 0.012)) ** 2));
        if (onBand > wall) return { on: onBand * 0.6, angle: Math.atan2(-0.7, 1) + Math.PI, highlight: false };
      }
      return { on: wall, angle: Math.PI / 2, highlight: hash(col, 3, p.seed) < 0.3 };
    }
    case "mycelium": {
      // Main threads (a noise contour) and finer branches on one side of them.
      const main = along((ax, ay) => fbm((ax * 1.6) / s, (ay * 1.6) / s, p.seed), x, y, 0.5, hw(s * 0.02), h);
      if (fbm((x * 1.6) / s, (y * 1.6) / s, p.seed) > 0.5) {
        const branch = along((ax, ay) => fbm((ax * 3.4) / s, (ay * 3.4) / s, p.seed + 20), x, y, 0.5, hw(s * 0.012), h);
        if (branch.on * 0.7 > main.on) return { on: branch.on * 0.7, angle: branch.angle, highlight: false };
      }
      return { ...main, highlight: true };
    }
    case "spiral": {
      // A sunflower head centred on the focus: strokes along the spiral arms, seeds as dabs.
      const dx = x - fx;
      const dy = y - fy;
      const r = Math.hypot(dx, dy);
      const th = Math.atan2(dy, dx);
      const c = s * 0.07;
      const k = Math.round((r / c) ** 2);
      const seedTh = k * 2.399963 + p.seed;
      const sx = c * Math.sqrt(k) * Math.cos(seedTh);
      const sy = c * Math.sqrt(k) * Math.sin(seedTh);
      const near = Math.exp(-((Math.hypot(dx - sx, dy - sy) / (c * 0.4)) ** 2));
      // The arms wind outwards at a constant angle (a logarithmic spiral), so strokes curve round the centre.
      const arm = 0.5 + 0.5 * Math.cos(13 * th - 13 * 0.9 * Math.log(r + 0.05) + p.seed);
      return { on: Math.max(near, arm ** 2.5 * 0.85), angle: th + Math.PI / 2 - 0.9, highlight: k % 21 === 0 || near > 0.6 };
    }
  }
}

/**
 * The strokes for a banner of `width` × `height` px, in paint order (underpainting first).
 * Strokes start on the structure (jittered grid, kept where the structure is) and follow it in short
 * steps, stopping when they leave it, so long strokes trace walls, veins and threads.
 */
export function brushStrokes(p: BrushPattern, width: number, height: number): Stroke[] {
  const rand = rng(p.seed * 9973 + 17);
  const strokes: Stroke[] = [];
  const fx = (p.focusX * width) / height;
  const fy = p.focusY;
  const reach = Math.hypot(width, height) / height;
  const accentColour = (): 2 | 3 => (p.palette === "lime" ? 2 : p.palette === "pine" ? 3 : rand() < 0.6 ? 2 : 3);

  const layers = [
    // Soft underpainting: wide, faint strokes anywhere, following the structure's direction.
    { on: p.layers >= 2, scale: 1.4, spacing: 2.6, tone: 0.3, minOn: 0, accent: 0, stop: 0, lengthScale: 0.8 },
    // The structure itself: long strokes along it.
    { on: true, scale: 1, spacing: 0.9, tone: 1, minOn: 0.45, accent: 1, stop: 0.2, lengthScale: 1 },
    // Small highlights on the structure.
    { on: p.layers >= 3, scale: 0.5, spacing: 2.4, tone: 0.9, minOn: 0.55, accent: 1.6, stop: 0.3, lengthScale: 0.45 },
  ];

  for (const [li, layer] of layers.entries()) {
    if (!layer.on) continue;
    const w = p.width * layer.scale;
    const lw = (w * 0.5) / height;
    const len = p.length * layer.lengthScale;
    const gap = (w * layer.spacing) / Math.max(0.15, p.density);
    for (let gy = -gap; gy < height + gap; gy += gap * 0.75) {
      for (let gx = -gap; gx < width + gap; gx += gap * 0.75) {
        let x = gx + (rand() - 0.5) * gap;
        let y = gy + (rand() - 0.5) * gap;
        const ux = x / height;
        const uy = y / height;
        const st = structure(p, ux, uy, fx, fy, lw);
        const weight = layer.minOn ? st.on : 0.6;
        if (st.on < layer.minOn || rand() > weight * (0.25 + p.density * 0.75)) continue;
        const far = Math.min(1, Math.hypot(ux - fx, uy - fy) / (reach * 0.75));
        const tone = Math.min(1, weight * layer.tone * (1 - 0.4 * far));

        const patch = noise(ux * 2.2, uy * 2.2, p.seed + 77);
        // Accents only where the structure has a highlight AND a low-frequency patch says so: clusters, not confetti.
        const accentChance = p.accent * layer.accent * (st.highlight ? 1 : 0.1) * Math.max(0, patch - 0.4) * 2.5 * (1.2 - far);
        const colour: Stroke["colour"] = rand() < accentChance ? accentColour() : rand() < 0.4 ? 1 : 0;

        const steps = 14;
        const stepLen = (len * (0.7 + rand() * 0.5)) / steps;
        const points: [number, number][] = [[x, y]];
        let dir = st.angle;
        let bend = (rand() - 0.5) * p.wobble;
        for (let s = 1; s <= steps; s++) {
          const here = structure(p, x / height, y / height, fx, fy, lw);
          if (layer.stop && here.on < layer.stop) break;
          // Keep heading the same way: a line's direction is ambiguous by half a turn.
          let a = here.angle;
          if (Math.cos(a - dir) < 0) a += Math.PI;
          dir = a + bend;
          bend += (rand() - 0.5) * p.wobble * 0.3;
          x += Math.cos(dir) * stepLen;
          y += Math.sin(dir) * stepLen;
          points.push([x, y]);
        }
        if (points.length < 3) continue;
        strokes.push({ points, width: w * (0.75 + rand() * 0.5), tone, colour, seed: Math.floor(rand() * 1e9) + li });
      }
    }
  }
  return strokes;
}

/** Earlier flow names (first brush version, Nov 20) map to the closest plant structure. */
const RENAMED: Record<string, BrushFlow> = { water: "cells", meadow: "fronds", swirl: "spiral", breeze: "mycelium", veins: "cells", stomata: "pollen", palisade: "xylem" };

/** Keep a stored or pasted brush pattern valid. */
export function sanitizeBrush(input: unknown): BrushPattern {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const num = (k: keyof BrushPattern, min: number, max: number) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (DEFAULT_BRUSH[k] as number);
  };
  const pick = <T extends string>(k: keyof BrushPattern, options: readonly T[]) => {
    const raw = o[k];
    const v = k === "flow" && typeof raw === "string" && raw in RENAMED ? RENAMED[raw] : raw;
    return (options as readonly unknown[]).includes(v) ? (v as T) : (DEFAULT_BRUSH[k] as T);
  };
  return {
    kind: "brush",
    flow: pick("flow", FLOWS),
    scale: num("scale", 0.4, 3),
    length: num("length", 10, 200),
    width: num("width", 3, 40),
    density: num("density", 0.1, 1),
    bristles: Math.round(num("bristles", 2, 16)),
    relief: num("relief", 0, 1),
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

/** Any banner background: a pixel pattern, a brush pattern (`kind: "brush"`) or a nature pattern (`kind: "nature"`). */
export type BannerPattern = HeroPattern | BrushPattern | NaturePattern;

export function isBrush(p: BannerPattern): p is BrushPattern {
  return "kind" in p && p.kind === "brush";
}
