// Hero banner backgrounds: a pattern of pixel cells spanning the whole banner, in muted ink with a soft
// gradient into one accent colour. Pure module (no DOM, no React): `renderCells` turns a pattern + size into
// cells the canvas draws.

import { PINE_LABS_CENTRE, PINE_LABS_HEIGHT, pineLabsDistance } from "./pine-logo";

/**
 * Every shape is a pattern across the banner, not a single motif.
 * Pine Labs:
 * - `echo`: the mark's outline (accent) rippling outward across the banner, like rings on water.
 * - `imprint`: a field of plant cells; the cells inside the mark light up, so the logo emerges from the pattern.
 * Inside a leaf, under the microscope:
 * - `stomata`: jigsaw-shaped epidermis cells with pores (paired guard cells); some pores in the accent.
 * - `veins`: the leaf's reticulate vein network, major veins over a fine mesh; stretches of major veins in the accent.
 * - `palisade`: columns of elongated mesophyll cells lined with chloroplasts; some chloroplasts glow.
 * - `cells`: rounded plant cells, a chloroplast in each.
 * - `grana`: thylakoid stacks (where photosynthesis happens), linked by thin lamellae; a few stacks in the accent.
 * - `xylem`: vertical water vessels with spiral thickening; stretches of a few vessels in the accent.
 * - `mycelium`: fine branching fungal threads; runs of the main threads in the accent.
 * Nature flows:
 * - `osmosis`: a membrane across the banner, dense particles on one side, a few slipping through.
 * - `flow`: meandering stream lines, one current in the accent.
 * - `rays`: sunlight fanning down across the banner in soft shafts (photosynthesis).
 * - `spiral`: sunflower phyllotaxis filling the banner; one family of spiral arms in the accent.
 * - `topo`: contour lines of rolling terrain. `drift`: diagonal streaks, like light through needles.
 */
export const SHAPES = ["echo", "imprint", "stomata", "veins", "palisade", "cells", "grana", "xylem", "mycelium", "osmosis", "flow", "rays", "spiral", "topo", "drift"] as const;
export const DITHERS = ["bayer", "noise", "halftone"] as const;
/** Line pixels (plus, ring, dash, needle, mark) read best from a pixel size of about 8. `mark` is a tiny Pine Labs corner. */
export const PIXELS = ["rounded", "square", "dot", "diamond", "plus", "ring", "dash", "needle", "mark"] as const;
/** `lime` = Pine lime; `pine` = the deep green of the Pine Labs logo (#003323), lifted for dark mode. */
export const ACCENTS = ["lime", "pine"] as const;

export type HeroShape = (typeof SHAPES)[number];
export type HeroDither = (typeof DITHERS)[number];
export type HeroPixel = (typeof PIXELS)[number];
export type HeroAccent = (typeof ACCENTS)[number];

/** Everything that defines one banner background. Serialisable, so pages keep theirs in `lib/heroes.ts`. */
export type HeroPattern = {
  shape: HeroShape;
  dither: HeroDither;
  /** How each lit cell is drawn. Cells also shrink a little where the tone is light. */
  pixel: HeroPixel;
  /** Cell size in CSS px. */
  cell: number;
  /** Size of the pattern's repeat (a mark, leaf, cell, line spacing), relative to the banner height. */
  scale: number;
  /** Overall ink, 0–1. */
  density: number;
  /** How much of the pattern's highlight (chosen outlines, a current, spiral arms…) shows in the accent, 0–1. */
  accent: number;
  palette: HeroAccent;
  /** How far muted pixels blend toward the accent colour near the focus, 0–1 (a soft colour gradient). */
  gradient: number;
  /** The gradient's bright point (and the spiral's centre, the rays' source), 0–1 across and down. */
  focusX: number;
  focusY: number;
  /** How strongly the text area is kept clear, 0–1. */
  clear: number;
  seed: number;
};

export const DEFAULT_PATTERN: HeroPattern = {
  shape: "cells",
  dither: "bayer",
  pixel: "rounded",
  cell: 6,
  scale: 1,
  density: 0.7,
  accent: 0.8,
  palette: "lime",
  gradient: 0.45,
  focusX: 0.8,
  focusY: 0.5,
  clear: 1,
  seed: 7,
};

/** A box (in banner px) to keep clear, normally the title. */
export type ClearBox = { x: number; y: number; width: number; height: number };

/** `tint` (0–1) is how far a muted pixel blends toward the accent colour. */
export type Cell = { x: number; y: number; tone: number; accent: boolean; tint: number };

const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49,
  17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

/** Integer hash → 0–1. Deterministic per cell and seed, so a banner never shuffles between renders. */
export function hash(x: number, y: number, seed: number) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed + 1, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/** Value noise, 0–1. */
function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

function fbm(x: number, y: number, seed: number) {
  return noise(x, y, seed) * 0.6 + noise(x * 2.1, y * 2.1, seed + 9) * 0.3 + noise(x * 4.3, y * 4.3, seed + 17) * 0.1;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Shape value 0–1; `edge` = part of the accent highlight; `line` = drawn whole rather than dithered. */
type Sample = { value: number; edge: boolean; line?: boolean };
const EMPTY: Sample = { value: 0, edge: false };

/** Nearest and second-nearest jittered grid points (Voronoi), in grid units. */
function voronoi(gx: number, gy: number, seed: number) {
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  let d1 = 9;
  let d2 = 9;
  let near: [number, number] = [0, 0];
  let at: [number, number] = [0, 0];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx + 0.15 + hash(ix + dx, iy + dy, seed) * 0.7;
      const cy = iy + dy + 0.15 + hash(ix + dx, iy + dy, seed + 1) * 0.7;
      const d = Math.hypot(gx - cx, gy - cy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        near = [ix + dx, iy + dy];
        at = [cx, cy];
      } else if (d < d2) d2 = d;
    }
  }
  return { d1, d2, near, at };
}

/** Pine Labs mark centred on the focus, `size` banner-heights tall: signed distance in banner units. */
function markDistance(x: number, y: number, fx: number, fy: number, size: number) {
  const k = PINE_LABS_HEIGHT / size;
  return pineLabsDistance((x - fx) * k + PINE_LABS_CENTRE[0], (y - fy) * k + PINE_LABS_CENTRE[1]) / k;
}

/**
 * Pattern value at a point. `x`, `y` are in banner-height units from the banner's top-left, `fx`, `fy` the
 * focus in the same units, and `step` one cell, so line widths stay one or two pixels at any size.
 */
function field(p: HeroPattern, x: number, y: number, fx: number, fy: number, step: number): Sample {
  const s = p.scale;
  switch (p.shape) {
    case "echo": {
      // The mark's outline in the accent, then its offsets rippling outward (rounding off as they go),
      // fading with distance; one inner offset keeps the outline's double stroke.
      const d = markDistance(x, y, fx, fy, s * 0.7);
      if (Math.abs(d) < step * 0.55) return { value: 1, edge: true, line: true };
      if (d < 0) return Math.abs(d + s * 0.05) < step * 0.5 ? { value: 0.5, edge: false, line: true } : EMPTY;
      const gap = s * 0.075 * (1 + d / (s * 1.2));
      const k = d / gap;
      if (Math.abs(k - Math.round(k)) * gap >= step * 0.5) return EMPTY;
      return { value: 0.85 * Math.exp(-d / (s * 2)) + 0.2, edge: false, line: true };
    }
    case "imprint": {
      // Plant cells everywhere; inside the mark the walls carry the accent and every cell has a chloroplast,
      // so the logo appears only as a change in the living pattern.
      const inMark = markDistance(x, y, fx, fy, s * 0.85) < 0;
      const g = s * 0.05;
      const { d1, d2 } = voronoi(x / g, y / g, p.seed);
      const st = step / g;
      if (d2 - d1 < st * 0.9) return { value: inMark ? 0.8 : 0.45, edge: inMark, line: true };
      return EMPTY;
    }
    case "stomata": {
      // Leaf epidermis: jigsaw pavement cells (warped Voronoi walls) with stomata, a pair of kidney-shaped
      // guard cells round a slit pore, in some cells; a few pores carry the accent.
      const g = s * 0.24;
      const wx = x / g + Math.sin((y / g) * 5.5 + p.seed) * 0.09;
      const wy = y / g + Math.sin((x / g) * 5.5 - p.seed) * 0.09;
      const { d1, d2, near, at } = voronoi(wx, wy, p.seed);
      const st = step / g;
      const hasPore = hash(near[0], near[1], p.seed + 2) < 0.3;
      if (hasPore) {
        const a = hash(near[0], near[1], p.seed + 4) * Math.PI;
        const ux = wx - at[0];
        const uy = wy - at[1];
        const lx = (ux * Math.cos(a) + uy * Math.sin(a)) / 0.24;
        const ly = (-ux * Math.sin(a) + uy * Math.cos(a)) / 0.15;
        const e = Math.hypot(lx, ly);
        const lit = hash(near[0], near[1], p.seed + 6) < 0.35;
        if (Math.abs(e - 1) < st * 5 * 0.5) return { value: 0.75, edge: lit, line: true };
        if (e < 1 && Math.abs(ly) * 0.15 < st * 0.45 && Math.abs(lx) < 0.75) return { value: 0.6, edge: false, line: true };
        if (e < 1.05) return EMPTY;
      }
      return d2 - d1 < st * 0.9 ? { value: 0.45, edge: false, line: true } : EMPTY;
    }
    case "veins": {
      // Reticulate venation: major veins (large Voronoi walls) over a fine mesh of minor veins.
      const g1 = s * 0.42;
      const big = voronoi(x / g1 + fbm(x * 2, y * 2, p.seed) * 0.25, y / g1, p.seed);
      if (big.d2 - big.d1 < (step / g1) * 1.3) return { value: 0.7, edge: noise(x * 2.5, y * 2.5, p.seed + 60) < 0.2, line: true };
      const g2 = g1 / 3.2;
      const small = voronoi(x / g2, y / g2, p.seed + 50);
      if (fbm(x * 1.5, y * 1.5, p.seed + 70) > 0.5) return EMPTY;
      return small.d2 - small.d1 < (step / g2) * 0.8 ? { value: 0.35, edge: false, line: true } : EMPTY;
    }
    case "palisade": {
      // Palisade mesophyll: staggered columns of tall rounded cells, chloroplasts lining their walls.
      const w = s * 0.16;
      const h = s * 0.44;
      const col = Math.floor(x / w);
      const shift = (col % 2) * 0.5 + hash(col, 0, p.seed) * 0.3;
      const row = Math.floor(y / h + shift);
      const u = (x / w - col - 0.5) * 2;
      const v = (y / h + shift - row - 0.5) * 2;
      const sq = Math.pow(Math.pow(Math.abs(u) / 0.82, 4) + Math.pow(Math.abs(v) / 0.9, 4), 0.25);
      const st = (step / w) * 2;
      if (Math.abs(sq - 1) < st * 0.6) return { value: 0.65, edge: false, line: true };
      if (sq < 0.86 && sq > 0.62) {
        const k = Math.round((v + 1) * 4.5);
        const dot = Math.abs((v + 1) * 4.5 - k) < 0.22 && hash(col * 31 + k, row, p.seed) < 0.75;
        if (dot) return { value: 0.8, edge: hash(col, row, p.seed + 8) < 0.12, line: true };
      }
      return EMPTY;
    }
    case "cells": {
      // Rounded plant cells with a chloroplast in each; a few chloroplasts glow.
      const g = s * 0.2;
      const { d1, d2, near } = voronoi(x / g, y / g, p.seed);
      const st = step / g;
      if (d2 - d1 < st * 0.9) return { value: 0.55, edge: false, line: true };
      if (d1 < st * 0.7) return { value: 0.6, edge: hash(near[0], near[1], p.seed + 7) < 0.12, line: true };
      return EMPTY;
    }
    case "grana": {
      // Thylakoid stacks: a few short discs stacked in each grid tile, some linked sideways by a lamella.
      const T = s * 0.24;
      const col = Math.floor(x / T);
      const row = Math.floor(y / T);
      if (hash(col, row, p.seed) > 0.4) return EMPTY;
      const u = x / T - col;
      const v = y / T - row;
      const cx = 0.5 + (hash(col, row, p.seed + 1) - 0.5) * 0.3;
      const n = 3 + Math.floor(hash(col, row, p.seed + 2) * 3);
      const st = step / T;
      const gap = st * 2.2;
      const lit = hash(col, row, p.seed + 3) < 0.1;
      for (let k = 0; k < n; k++) {
        const dy = 0.5 + (k - (n - 1) / 2) * gap;
        const half = 0.26 * (1 - Math.abs(k - (n - 1) / 2) * 0.1);
        if (Math.abs(v - dy) < st * 0.5 && Math.abs(u - cx) < half) return { value: 0.85, edge: lit, line: true };
      }
      if (Math.abs(v - 0.5) < st * 0.45 && u > cx + 0.26 && hash(col, row, p.seed + 4) < 0.4) return { value: 0.4, edge: false, line: true };
      return EMPTY;
    }
    case "xylem": {
      // Water vessels: pairs of vertical walls with diagonal bands of spiral thickening between them.
      const W = s * 0.2;
      const col = Math.floor(x / W);
      if (hash(col, 0, p.seed) > 0.4) return EMPTY;
      const centre = (col + 0.5 + (hash(col, 1, p.seed) - 0.5) * 0.3) * W + Math.sin(y * 3 + col) * step * 0.6;
      const half = W * (0.16 + hash(col, 2, p.seed) * 0.08);
      const dx = x - centre;
      const lit = hash(col, 3, p.seed) < 0.3;
      if (Math.abs(Math.abs(dx) - half) < step * 0.5) return { value: 0.8, edge: lit && noise(y * 3, col, p.seed) < 0.45, line: true };
      if (Math.abs(dx) < half - step) {
        const band = (y + dx * 0.7) / (s * 0.045);
        if (Math.abs(band - Math.round(band)) * s * 0.045 < step * 0.45) return { value: 0.45, edge: false, line: true };
      }
      return EMPTY;
    }
    case "mycelium": {
      // Fungal threads: the zero contour of one noise field (main threads) and, on one side of it, of a finer
      // one (branches). Distances use the field's gradient, so threads stay one pixel wide.
      const thread = (fq: number, sd: number) => {
        const f = (ax: number, ay: number) => fbm((ax * fq) / s, (ay * fq) / s, sd) - 0.5;
        const n = f(x, y);
        const gx = (f(x + step, y) - n) / step;
        const gy = (f(x, y + step) - n) / step;
        return { n, d: Math.abs(n) / (Math.hypot(gx, gy) + 1e-6) };
      };
      const main = thread(1.6, p.seed);
      if (main.d < step * 0.55) return { value: 0.85, edge: true, line: true };
      if (main.n > 0) {
        const branch = thread(3.4, p.seed + 20);
        if (branch.d < step * 0.5) return { value: 0.45, edge: false, line: true };
      }
      return EMPTY;
    }
    case "osmosis": {
      // A wavy membrane across the banner at the focus height; dense particles above thinning away from it,
      // sparse below, and a few (accent) slipping through just under it.
      const m = fy + Math.sin((x * 2.2) / s + p.seed) * 0.07 * s + (fbm(x * 1.5, 3, p.seed) - 0.5) * 0.12 * s;
      const dy = y - m;
      if (Math.abs(dy) < step * 0.9) return { value: 0.9, edge: noise(x * 3, 1, p.seed) < 0.3, line: true };
      const roll = hash(Math.round(x / step), Math.round(y / step), p.seed + 31);
      if (dy > 0 && dy < step * 4 && roll < 0.04) return { value: 1, edge: true, line: true };
      const conc = dy < 0 ? 0.34 * Math.exp(-((-dy / (s * 0.4)) ** 2)) + 0.02 : 0.05 * Math.exp(-((dy / (s * 0.3)) ** 2));
      return roll < conc ? { value: 0.6, edge: false, line: true } : EMPTY;
    }
    case "flow": {
      // Meandering stream lines across the banner; every seventh line is a current in the accent.
      const psi = y + Math.sin((x * 1.6) / s + p.seed) * 0.08 * s + (fbm((x * 0.9) / s, (y * 0.9) / s, p.seed) - 0.5) * 0.35 * s;
      const spacing = s * 0.075;
      const k = psi / spacing;
      if (Math.abs(k - Math.round(k)) * spacing >= step * 0.5) return EMPTY;
      return { value: 0.6, edge: Math.round(k) % 7 === 0, line: true };
    }
    case "rays": {
      // Sunlight fanning down from above the focus across the whole banner, in soft dithered shafts;
      // the brightest shafts carry the accent where they land.
      const sx = x - fx;
      const sy = y + 1.2;
      const ang = Math.atan2(sx, sy);
      const shaft = noise(ang * (10 / s) + 50, 2, p.seed);
      if (shaft < 0.42) return EMPTY;
      const strength = Math.min(1, (shaft - 0.42) * 2.2);
      return { value: 0.4 + 0.6 * strength, edge: strength > 0.8 && y > 0.75 && hash(Math.round(x / step), Math.round(y / step), p.seed) < 0.35 };
    }
    case "spiral": {
      // Sunflower seeds at the golden angle, centred on the focus and large enough to fill the banner;
      // the seeds of one spiral family (every 13th) carry the accent.
      const c = s * 0.075;
      const r = Math.hypot(x - fx, y - fy);
      const n = (r / c) ** 2;
      const lo = Math.max(1, Math.floor(n - 2 * (r / c) - 4));
      const hi = Math.ceil(n + 2 * (r / c) + 4);
      for (let i = lo; i <= hi; i++) {
        const ri = c * Math.sqrt(i);
        const th = i * 2.399963 + p.seed;
        if (Math.hypot(x - fx - ri * Math.cos(th), y - fy - ri * Math.sin(th)) < Math.max(step * 0.6, c * 0.4)) {
          return { value: 0.9, edge: i % 21 === 0, line: true };
        }
      }
      return EMPTY;
    }
    case "topo": {
      // Contour lines of rolling terrain, kept one pixel wide by dividing by the slope (no blobs where it
      // flattens); runs of one contour level in the accent.
      const f = (ax: number, ay: number) => fbm((ax * 1.4) / s + 11, (ay * 1.4) / s, p.seed) * 9;
      const n = f(x, y);
      const slope = Math.hypot(f(x + step, y) - n, f(x, y + step) - n) / step + 1e-6;
      const k = Math.round(n);
      if (Math.abs(n - k) / slope >= step * 0.55) return EMPTY;
      return { value: 0.6, edge: k === 5, line: true };
    }
    case "drift": {
      // Diagonal streaks across the banner, each column with its own length and fade.
      const u = x * 0.92 - y * 0.4;
      const v = x * 0.4 + y * 0.92;
      const col = Math.floor(u / (step * 1.8));
      if (hash(col, 7, p.seed) > 0.4) return EMPTY;
      const start = hash(col, 3, p.seed) * 2 - 0.6;
      const len = (0.25 + hash(col, 5, p.seed) * 0.6) * s;
      const t = (v - start) / len;
      if (t <= 0 || t >= 1) return EMPTY;
      const value = Math.sin(t * Math.PI) * 0.8;
      return { value, edge: value > 0.55 && hash(col, 9, p.seed) < 0.12, line: true };
    }
  }
}

/** 1 far from the box, falling to 1 − clear inside it, with a soft edge a few cells wide. */
function clearance(x: number, y: number, box: ClearBox | null, strength: number, soft: number) {
  if (!box || strength <= 0) return 1;
  const dx = Math.max(box.x - x, 0, x - (box.x + box.width));
  const dy = Math.max(box.y - y, 0, y - (box.y + box.height));
  const d = Math.hypot(dx, dy);
  return 1 - strength * Math.exp(-((d / soft) ** 2));
}

/**
 * The cells to draw for a banner of `width` × `height` px.
 * Tone is how dark the ink is and how big the pixel is drawn. A gentle gradient across the banner keeps it
 * brightest near the focus and quieter far from it.
 */
export function renderCells(p: HeroPattern, width: number, height: number, box: ClearBox | null): Cell[] {
  const cell = Math.max(2, p.cell);
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const cells: Cell[] = [];
  const fx = (p.focusX * width) / height;
  const fy = p.focusY;
  const reach = Math.hypot(width, height) / height;
  const soft = Math.max(cell * 4, height * 0.16);
  const step = cell / height;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = (i + 0.5) * cell;
      const cy = (j + 0.5) * cell;
      const x = cx / height;
      const y = cy / height;
      const sample = field(p, x, y, fx, fy, step);
      if (sample.value <= 0) continue;
      const keep = clearance(cx, cy, box, p.clear, soft);
      const far = Math.min(1, Math.hypot(x - fx, y - fy) / (reach * 0.7));

      if (sample.edge && keep > 0.6 && noise(x * 4, y * 4, p.seed + 303) < p.accent) {
        cells.push({ x: i * cell, y: j * cell, tone: 1, accent: true, tint: 1 });
        continue;
      }

      const value = sample.value * p.density * keep * (1 - 0.55 * far);
      if (value <= 0.02) continue;
      // Lines are drawn whole (tone shows their strength); fields are dithered.
      const threshold = sample.line ? 0.06 : p.dither === "bayer" ? (BAYER_8[(j % 8) * 8 + (i % 8)] + 0.5) / 64 : p.dither === "noise" ? hash(i, j, p.seed + 101) : 0.15;
      if (value < threshold) continue;
      cells.push({ x: i * cell, y: j * cell, tone: clamp01(value), accent: false, tint: p.gradient * (1 - far) ** 2 });
    }
  }
  return cells;
}

/** Old names from earlier saved patterns. */
const RENAMED: Record<string, string> = { logo: "echo", seal: "echo", pinelabs: "echo", leaf: "veins", leaves: "veins" };

/** Keep a stored or pasted pattern valid: unknown keys dropped, numbers clamped, bad values defaulted. */
export function sanitizePattern(input: unknown): HeroPattern {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const num = (k: keyof HeroPattern, min: number, max: number) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (DEFAULT_PATTERN[k] as number);
  };
  const pick = <T extends string>(k: keyof HeroPattern, options: readonly T[]) => {
    const v = typeof o[k] === "string" ? (RENAMED[o[k] as string] ?? o[k]) : o[k];
    return (options as readonly unknown[]).includes(v) ? (v as T) : (DEFAULT_PATTERN[k] as T);
  };
  return {
    shape: pick("shape", SHAPES),
    dither: pick("dither", DITHERS),
    pixel: pick("pixel", PIXELS),
    cell: num("cell", 3, 16),
    scale: num("scale", 0.4, 3),
    density: num("density", 0, 1),
    accent: num("accent", 0, 1),
    palette: pick("palette", ACCENTS),
    gradient: num("gradient", 0, 1),
    focusX: num("focusX", 0, 1),
    focusY: num("focusY", 0, 1),
    clear: num("clear", 0, 1),
    seed: Math.round(num("seed", 1, 999)),
  };
}
