// Brush-stroke banners: long impressionist strokes (in the manner of Monet) that trace the micro-structures
// found in plants: veins, cell walls, stomata, xylem vessels, palisade cells, fungal threads and sunflower
// spirals. Pure module: `brushStrokes` returns the strokes; `brush-draw.ts` paints them with bristle texture.

import type { HeroPattern } from "./pattern";

/**
 * Every flow is a plant micro-structure. Strokes start on the structure and follow it (its walls, veins or
 * threads), so the banner reads as a painting of that structure under a microscope.
 * - `veins`: a leaf's reticulate venation: major veins over a fine mesh.
 * - `cells`: plant cell walls, a chloroplast dab inside each cell.
 * - `stomata`: jigsaw-shaped epidermis cells, oval pores (guard cells) in some of them.
 * - `xylem`: vertical water vessels with spiral thickening bands between their walls.
 * - `palisade`: staggered columns of tall, rounded mesophyll cells.
 * - `mycelium`: fine fungal threads with branches.
 * - `spiral`: a sunflower head: seeds along golden-angle spiral arms.
 */
export const FLOWS = ["veins", "cells", "stomata", "xylem", "palisade", "mycelium", "spiral"] as const;
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
  /** Bristles per stroke: more gives a finer, more textured stroke. */
  bristles: number;
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
  flow: "veins",
  scale: 1,
  length: 72,
  width: 8,
  density: 0.6,
  bristles: 9,
  wobble: 0.2,
  accent: 0.35,
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

/** The plant structure at a point (x, y in banner-height units; fx, fy the focus). */
function structure(p: BrushPattern, x: number, y: number, fx: number, fy: number): Structure {
  const s = p.scale;
  const h = 0.004;
  switch (p.flow) {
    case "veins": {
      // Major veins (large, slightly warped Voronoi walls) over a fine mesh of minor veins.
      const g1 = s * 0.42;
      const g2 = g1 / 3;
      const warp = (ax: number, ay: number) => fbm(ax * 2, ay * 2, p.seed) * 0.25;
      const major = along((ax, ay) => {
        const v = voronoi(ax / g1 + warp(ax, ay), ay / g1, p.seed);
        return (v.d2 - v.d1) * g1;
      }, x, y, 0, s * 0.03, h);
      const minor = along((ax, ay) => {
        const v = voronoi(ax / g2, ay / g2, p.seed + 50);
        return (v.d2 - v.d1) * g2;
      }, x, y, 0, s * 0.012, h);
      return major.on >= minor.on * 0.6 ? { ...major, highlight: true } : { on: minor.on * 0.6, angle: minor.angle, highlight: false };
    }
    case "cells": {
      // Cell walls; inside each cell a chloroplast (a short, round dab).
      const g = s * 0.22;
      const wall = along((ax, ay) => {
        const v = voronoi(ax / g, ay / g, p.seed);
        return (v.d2 - v.d1) * g;
      }, x, y, 0, s * 0.022, h);
      const v = voronoi(x / g, y / g, p.seed);
      const blob = Math.exp(-(((v.d1 * g) / (s * 0.035)) ** 2));
      if (blob > wall.on) return { on: blob * 0.85, angle: hash(v.cell[0], v.cell[1], p.seed + 3) * Math.PI, highlight: true };
      return { ...wall, highlight: false };
    }
    case "stomata": {
      // Jigsaw epidermis cells (wavy walls); in some cells an oval pore (two guard cells).
      const g = s * 0.26;
      const wob = (ax: number, ay: number): [number, number] => [ax / g + Math.sin((ay / g) * 5.5 + p.seed) * 0.09, ay / g + Math.sin((ax / g) * 5.5 - p.seed) * 0.09];
      const wall = along((ax, ay) => {
        const [u, w] = wob(ax, ay);
        const v = voronoi(u, w, p.seed);
        return (v.d2 - v.d1) * g;
      }, x, y, 0, s * 0.02, h);
      const [u, w] = wob(x, y);
      const v = voronoi(u, w, p.seed);
      if (hash(v.cell[0], v.cell[1], p.seed + 2) < 0.35) {
        const a = hash(v.cell[0], v.cell[1], p.seed + 4) * Math.PI;
        const ring = along((ax, ay) => {
          const [uu, ww] = wob(ax, ay);
          const ex = (uu - v.at[0]) * g;
          const ey = (ww - v.at[1]) * g;
          const lx = (ex * Math.cos(a) + ey * Math.sin(a)) / (s * 0.075);
          const ly = (-ex * Math.sin(a) + ey * Math.cos(a)) / (s * 0.045);
          return Math.hypot(lx, ly);
        }, x, y, 1, 0.12, h);
        if (ring.on > wall.on) return { on: ring.on, angle: ring.angle, highlight: true };
      }
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
      const wall = Math.exp(-(((Math.abs(dx) - half) / (s * 0.018)) ** 2));
      if (Math.abs(dx) < half * 0.85) {
        const period = s * 0.06;
        const band = (y + dx * 0.7) / period;
        const onBand = Math.exp(-((((band - Math.round(band)) * period) / (s * 0.012)) ** 2));
        if (onBand > wall) return { on: onBand * 0.6, angle: Math.atan2(-0.7, 1) + Math.PI, highlight: false };
      }
      return { on: wall, angle: Math.PI / 2, highlight: hash(col, 3, p.seed) < 0.3 };
    }
    case "palisade": {
      // Staggered columns of tall rounded cells; their outlines run mostly vertical.
      const w = s * 0.16;
      const tall = s * 0.44;
      const f = (ax: number, ay: number) => {
        const col = Math.floor(ax / w);
        const shift = (col % 2) * 0.5 + hash(col, 0, p.seed) * 0.3;
        const u = (ax / w - col - 0.5) * 2;
        const v = (ay / tall + shift - Math.floor(ay / tall + shift) - 0.5) * 2;
        return Math.pow(Math.pow(Math.abs(u) / 0.82, 4) + Math.pow(Math.abs(v) / 0.9, 4), 0.25);
      };
      const outline = along(f, x, y, 1, 0.07, h);
      const col = Math.floor(x / w);
      return { on: outline.on * 0.85, angle: outline.angle, highlight: hash(col, Math.floor(y / tall), p.seed + 8) < 0.25 };
    }
    case "mycelium": {
      // Main threads (a noise contour) and finer branches on one side of them.
      const main = along((ax, ay) => fbm((ax * 1.6) / s, (ay * 1.6) / s, p.seed), x, y, 0.5, s * 0.02, h);
      if (fbm((x * 1.6) / s, (y * 1.6) / s, p.seed) > 0.5) {
        const branch = along((ax, ay) => fbm((ax * 3.4) / s, (ay * 3.4) / s, p.seed + 20), x, y, 0.5, s * 0.012, h);
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
      return { on: Math.max(near, arm ** 6 * 0.8), angle: th + Math.PI / 2 - 0.9, highlight: k % 21 === 0 || near > 0.6 };
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
    { on: p.layers >= 2, scale: 1.7, spacing: 2.4, tone: 0.35, minOn: 0, accent: 0, stop: 0, lengthScale: 1 },
    // The structure itself: long strokes along it.
    { on: true, scale: 1, spacing: 1.1, tone: 1, minOn: 0.45, accent: 1, stop: 0.2, lengthScale: 1 },
    // Small highlights on the structure.
    { on: p.layers >= 3, scale: 0.5, spacing: 2.4, tone: 0.9, minOn: 0.55, accent: 1.6, stop: 0.3, lengthScale: 0.45 },
  ];

  for (const [li, layer] of layers.entries()) {
    if (!layer.on) continue;
    const w = p.width * layer.scale;
    const len = p.length * layer.lengthScale;
    const gap = (w * layer.spacing) / Math.max(0.15, p.density);
    for (let gy = -gap; gy < height + gap; gy += gap * 0.75) {
      for (let gx = -gap; gx < width + gap; gx += gap * 0.75) {
        let x = gx + (rand() - 0.5) * gap;
        let y = gy + (rand() - 0.5) * gap;
        const ux = x / height;
        const uy = y / height;
        const st = structure(p, ux, uy, fx, fy);
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
          const here = structure(p, x / height, y / height, fx, fy);
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
const RENAMED: Record<string, BrushFlow> = { water: "cells", meadow: "palisade", swirl: "spiral", breeze: "mycelium" };

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

/** Any banner background: a pixel pattern or a brush pattern (`kind: "brush"`). */
export type BannerPattern = HeroPattern | BrushPattern;

export function isBrush(p: BannerPattern): p is BrushPattern {
  return "kind" in p && p.kind === "brush";
}
