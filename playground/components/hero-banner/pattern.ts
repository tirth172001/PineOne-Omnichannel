// Hero banner backgrounds: a grid of pixel cells, dithered from a shape field, with accent highlights.
// Pure module (no DOM, no React): `renderCells` turns a pattern + size into cells the canvas draws.

/** `pinelabs` = the Pine Labs outlined mark in a pixel cloud. */
export const SHAPES = ["pinelabs", "topo", "orbits", "bloom", "drift", "rings", "waves", "grain", "slope"] as const;
export const LOGO_SHAPES = ["pinelabs"] as const;
export const DITHERS = ["bayer", "noise", "halftone"] as const;
/** Line pixels (plus, ring, dash, needle, mark) read best from a pixel size of about 8. `mark` is a tiny Pine Labs corner. */
export const PIXELS = ["rounded", "square", "dot", "diamond", "plus", "ring", "dash", "needle", "mark"] as const;
/** `lime` = Pine lime; `pine` = the deep green of the Pine Labs logo (#003323), lifted for dark mode. */
export const ACCENTS = ["lime", "pine"] as const;

export type HeroShape = (typeof SHAPES)[number];
export type LogoShape = (typeof LOGO_SHAPES)[number];
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
  /** Shape size, relative to the banner height. */
  scale: number;
  /** Overall ink, 0–1. */
  density: number;
  /**
   * How much of the shape's edge is traced in the accent colour, 0–1.
   * Accents run in short segments along the logo outline (or a contour of other shapes), never as confetti.
   */
  accent: number;
  palette: HeroAccent;
  /** How far muted pixels blend toward the accent colour near the focus, 0–1 (a soft colour gradient). */
  gradient: number;
  /** Where the shape sits, 0–1 across and down. */
  focusX: number;
  focusY: number;
  /** How strongly the area behind the title is kept clear, 0–1. */
  clear: number;
  seed: number;
};

export const DEFAULT_PATTERN: HeroPattern = {
  shape: "rings",
  dither: "bayer",
  pixel: "rounded",
  cell: 7,
  scale: 1.4,
  density: 0.5,
  accent: 0.35,
  palette: "lime",
  gradient: 0.45,
  focusX: 0.8,
  focusY: 0.5,
  clear: 0.85,
  seed: 7,
};

/** A box (in banner px) to keep clear, normally the title. */
export type ClearBox = { x: number; y: number; width: number; height: number };

/** Ink tone 0–1 (drawn as a tint of the foreground); accent cells are drawn in the accent colour. */
/** `tint` (0–1) is how far a muted pixel blends toward the accent colour. */
export type Cell = { x: number; y: number; tone: number; accent: boolean; tint: number };

/** Samples a logo: u, v in 0–1 across the logo's square, returns coverage 0–1. */
export type LogoSampler = (u: number, v: number) => number;

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

/** Shape value 0–1 plus `edge`: true on the logo outline or near the shape's main contour. */
type Sample = { value: number; edge: boolean; line?: boolean };

/** Logo coverage at banner point (px, py), logo `s` banner-heights tall, centred on the focus. */
function coverage(logo: LogoSampler | null, px: number, py: number, s: number) {
  const u = px / s + 0.5;
  const v = py / s + 0.5;
  return logo && u >= 0 && u <= 1 && v >= 0 && v <= 1 ? logo(u, v) : 0;
}

/**
 * Shape field at a point. `px`, `py` are in banner-height units (0 at the focus), so shapes keep their
 * proportions on any width; `step` is one cell in the same units (for edge detection).
 */
function field(p: HeroPattern, px: number, py: number, step: number, logo: LogoSampler | null): Sample {
  const r = Math.hypot(px, py);
  const s = p.scale;
  switch (p.shape) {
    case "pinelabs": {
      // The Pine Labs outline as a solid pixel line (the accent's track), its inside left empty,
      // in a pixel cloud that fades out from it.
      const c = coverage(logo, px, py, s);
      if (c > 0.75) return { value: 1, edge: true, line: true };
      if (c > 0.25) return { value: 0, edge: false };
      const grain = fbm(px * 3 + 40, py * 3, p.seed);
      return { value: clamp01(Math.exp(-((r / (s * 1.05)) ** 2)) * 0.6 + (grain - 0.55) * 0.2), edge: false };
    }
    case "topo": {
      // Contour lines of a slow noise field, like a topographic map; one contour carries the accent.
      const n = fbm((px * 1.4) / s + 11, (py * 1.4) / s, p.seed) * 9;
      const line = Math.abs(n - Math.round(n));
      const fade = 0.35 + 0.65 * Math.exp(-((r / (s * 1.6)) ** 2));
      return { value: line < 0.09 ? fade : 0, edge: line < 0.09 && Math.round(n) === 5, line: true };
    }
    case "orbits": {
      // Tilted, dashed orbits around the focus; the third one carries the accent.
      const a = 0.5;
      const ox = px * Math.cos(a) + py * Math.sin(a);
      const oy = (-px * Math.sin(a) + py * Math.cos(a)) * 2.1;
      const rr = Math.hypot(ox, oy) / s;
      const k = Math.round(rr / 0.16);
      const onLine = k > 0 && Math.abs(rr - k * 0.16) < 0.022;
      const dash = Math.sin(Math.atan2(oy, ox) * (6 + k * 3) + k + p.seed) > -0.35;
      return { value: onLine && dash ? 0.3 + 0.7 * Math.exp(-((k / 5) ** 2)) : 0, edge: onLine && dash && k === 3, line: true };
    }
    case "bloom": {
      // A seven-petal bloom: its outline in pixels, a faint dither inside, the outline's tips in accent.
      const th = Math.atan2(py, px) + p.seed;
      const edgeR = s * 0.42 * (0.62 + 0.38 * Math.abs(Math.cos(3.5 * th)));
      const d = Math.abs(r - edgeR);
      if (d < step * 1.1) return { value: 0.9, edge: Math.abs(Math.cos(3.5 * th)) > 0.85, line: true };
      if (r < edgeR) return { value: 0.12 + 0.1 * (r / edgeR), edge: false };
      return { value: Math.exp(-(((r - edgeR) / (s * 0.12)) ** 2)) * 0.25, edge: false };
    }
    case "drift": {
      // Slow diagonal streaks, like light through pine needles; each column has its own length and fade.
      const u = px * 0.92 - py * 0.4;
      const v = px * 0.4 + py * 0.92;
      const col = Math.floor(u / (step * 1.8));
      const on = hash(col, 7, p.seed) < 0.38;
      const start = hash(col, 3, p.seed) * 1.6 - 0.8;
      const len = (0.25 + hash(col, 5, p.seed) * 0.6) * s;
      const t = (v - start) / len;
      const value = on && t > 0 && t < 1 ? Math.sin(t * Math.PI) * 0.9 : 0;
      return { value, edge: value > 0.6 && hash(col, 9, p.seed) < 0.12, line: true };
    }
    case "rings": {
      const wave = 0.5 + 0.5 * Math.cos((r / s) * Math.PI * 7 - p.seed);
      const value = clamp01(wave * Math.exp(-((r / (s * 1.1)) ** 2)) + fbm(px * 2, py * 2, p.seed) * 0.15);
      return { value, edge: wave > 0.985 };
    }
    case "waves": {
      const y = py + Math.sin((px * 2.4) / s + p.seed) * 0.18 + (fbm(px * 0.8, py * 0.8, p.seed) - 0.5) * 0.4;
      const band = 0.5 + 0.5 * Math.sin((y / s) * Math.PI * 6);
      return { value: clamp01(band ** 2 * (0.35 + 0.65 * Math.exp(-((px / (s * 2.4)) ** 2)))), edge: band > 0.99 };
    }
    case "grain": {
      const n = fbm((px * 2.6) / s, (py * 2.6) / s, p.seed);
      return { value: clamp01((n - 0.3) * 1.6), edge: Math.abs(n - 0.62) < 0.012 };
    }
    case "slope": {
      // A diagonal ramp from the focus, broken up by noise.
      const t = (px * 0.7 + py * 0.3) / s;
      const value = clamp01(1 - Math.abs(t) * 0.9 + (fbm(px * 3, py * 3, p.seed) - 0.5) * 0.5);
      return { value, edge: Math.abs(value - 0.75) < 0.03 };
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
 * Tone is how dark the ink is and how big the pixel is drawn.
 */
export function renderCells(p: HeroPattern, width: number, height: number, logo: LogoSampler | null, box: ClearBox | null): Cell[] {
  const cell = Math.max(2, p.cell);
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const cells: Cell[] = [];
  const fx = p.focusX * width;
  const fy = p.focusY * height;
  const soft = Math.max(cell * 4, height * 0.16);
  const step = cell / height;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = (i + 0.5) * cell;
      const cy = (j + 0.5) * cell;
      const px = (cx - fx) / height;
      const py = (cy - fy) / height;
      const sample = field(p, px, py, step, logo);
      const keep = clearance(cx, cy, box, p.clear, soft);

      // Accents trace the edge in short runs (low-frequency noise picks which stretches light up),
      // and stay out of the title's clear area.
      if (sample.edge && keep > 0.6 && noise((px * 5) / p.scale, (py * 5) / p.scale, p.seed + 303) < p.accent) {
        cells.push({ x: i * cell, y: j * cell, tone: 1, accent: true, tint: 1 });
        continue;
      }

      const value = sample.value * p.density * keep;
      if (value <= 0.02) continue;
      // Lines are drawn whole (tone shows their strength); fields are dithered.
      const threshold = sample.line ? 0.06 : p.dither === "bayer" ? (BAYER_8[(j % 8) * 8 + (i % 8)] + 0.5) / 64 : p.dither === "noise" ? hash(i, j, p.seed + 101) : 0.15;
      if (value < threshold) continue;
      // Gradient: strongest at the focus, fading out over about one shape size.
      const tint = p.gradient * Math.exp(-((Math.hypot(px, py) / (p.scale * 0.9)) ** 2));
      cells.push({ x: i * cell, y: j * cell, tone: clamp01(value), accent: false, tint });
    }
  }
  return cells;
}

/** Old names from earlier saved patterns. */
const RENAMED: Record<string, string> = { logo: "pinelabs", seal: "pinelabs" };

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
