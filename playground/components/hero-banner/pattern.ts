// Hero banner backgrounds: a grid of pixel cells, dithered from a shape field, with accent sprinkles.
// Pure module (no DOM, no React): `renderCells` turns a pattern + size into cells the canvas draws.

export const SHAPES = ["logo", "rings", "waves", "grain", "slope"] as const;
export const DITHERS = ["bayer", "noise", "halftone"] as const;
export const ACCENTS = ["lime", "seal", "both"] as const;

export type HeroShape = (typeof SHAPES)[number];
export type HeroDither = (typeof DITHERS)[number];
export type HeroAccent = (typeof ACCENTS)[number];

/** Everything that defines one banner background. Serialisable, so pages keep theirs in `lib/heroes.ts`. */
export type HeroPattern = {
  shape: HeroShape;
  dither: HeroDither;
  /** Cell size in CSS px. */
  cell: number;
  /** Shape size, relative to the banner height. */
  scale: number;
  /** Overall ink, 0–1. */
  density: number;
  /** Share of lit cells drawn in an accent colour, 0–1. Keep it low: the palette is muted. */
  accent: number;
  palette: HeroAccent;
  /** Where the shape sits and accents gather, 0–1 across and down. */
  focusX: number;
  focusY: number;
  /** How strongly the area behind the title is kept clear, 0–1. */
  clear: number;
  seed: number;
};

export const DEFAULT_PATTERN: HeroPattern = {
  shape: "rings",
  dither: "bayer",
  cell: 6,
  scale: 1.4,
  density: 0.7,
  accent: 0.06,
  palette: "lime",
  focusX: 0.8,
  focusY: 0.5,
  clear: 0.85,
  seed: 7,
};

/** A box (in banner px) to keep clear, normally the title. */
export type ClearBox = { x: number; y: number; width: number; height: number };

/** Ink tone 0–1 (drawn as a tint of the foreground); accent cells carry which accent: 1 or 2. */
export type Cell = { x: number; y: number; tone: number; accent: 0 | 1 | 2 };

/** Samples the logo: u, v in 0–1 across the logo's square, returns coverage 0–1. */
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
  return (noise(x, y, seed) * 0.6 + noise(x * 2.1, y * 2.1, seed + 9) * 0.3 + noise(x * 4.3, y * 4.3, seed + 17) * 0.1);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Shape field at a point, 0–1. `px`, `py` are in banner-height units (0 at the focus),
 * so shapes keep their proportions on any width.
 */
function field(p: HeroPattern, px: number, py: number, logo: LogoSampler | null) {
  const r = Math.hypot(px, py);
  const s = p.scale;
  switch (p.shape) {
    case "logo": {
      // The seal, centred on the focus and `scale` banner-heights tall, inside a soft halo.
      const u = px / s + 0.5;
      const v = py / s + 0.5;
      const inside = logo && u >= 0 && u <= 1 && v >= 0 && v <= 1 ? logo(u, v) : 0;
      // Dense disc, tree left empty, a clean gap ring, then a sparse halo that fades out.
      if (inside > 0.5) return clamp01(0.9 + fbm(px * 3 + 40, py * 3, p.seed) * 0.1);
      if (r < s * 0.62) return 0;
      const halo = Math.exp(-(((r - s * 0.62) / (s * 0.55)) ** 2)) * 0.42;
      return clamp01(halo + (fbm(px * 3, py * 3, p.seed) - 0.5) * 0.12);
    }
    case "rings": {
      const wave = 0.5 + 0.5 * Math.cos((r / s) * Math.PI * 7 - p.seed);
      return clamp01(wave * Math.exp(-((r / (s * 1.1)) ** 2)) + fbm(px * 2, py * 2, p.seed) * 0.15);
    }
    case "waves": {
      const y = py + Math.sin(px * 2.4 / s + p.seed) * 0.18 + (fbm(px * 0.8, py * 0.8, p.seed) - 0.5) * 0.4;
      const bands = 0.5 + 0.5 * Math.sin((y / s) * Math.PI * 6);
      return clamp01(bands ** 2 * (0.35 + 0.65 * Math.exp(-((px / (s * 2.4)) ** 2))));
    }
    case "grain":
      return clamp01((fbm(px * 2.6 / s, py * 2.6 / s, p.seed) - 0.3) * 1.6);
    case "slope": {
      // A diagonal ramp from the focus, broken up by noise.
      const t = (px * 0.7 + py * 0.3) / s;
      return clamp01(1 - Math.abs(t) * 0.9 + (fbm(px * 3, py * 3, p.seed) - 0.5) * 0.5);
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
 * Tone is how dark the ink is; halftone cells also use it as their dot size.
 */
export function renderCells(p: HeroPattern, width: number, height: number, logo: LogoSampler | null, box: ClearBox | null): Cell[] {
  const cell = Math.max(2, p.cell);
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const cells: Cell[] = [];
  const fx = p.focusX * width;
  const fy = p.focusY * height;
  const soft = Math.max(cell * 4, height * 0.16);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = (i + 0.5) * cell;
      const cy = (j + 0.5) * cell;
      const px = (cx - fx) / height;
      const py = (cy - fy) / height;
      const value = field(p, px, py, logo) * p.density * clearance(cx, cy, box, p.clear, soft);
      if (value <= 0.02) continue;

      const threshold = p.dither === "bayer" ? (BAYER_8[(j % 8) * 8 + (i % 8)] + 0.5) / 64 : p.dither === "noise" ? hash(i, j, p.seed + 101) : 0;
      if (p.dither === "halftone" ? value < 0.15 : value < threshold) continue;

      // Accents gather around the focus, with a few strays across the banner.
      const near = Math.exp(-((Math.hypot(px, py) / (p.scale * 0.9)) ** 2));
      const lit = value > 0.25 && hash(i, j, p.seed + 303) < p.accent * (0.25 + 1.75 * near);
      const accent: Cell["accent"] = !lit ? 0 : p.palette === "lime" ? 1 : p.palette === "seal" ? 2 : hash(i, j, p.seed + 404) < 0.6 ? 1 : 2;
      cells.push({ x: i * cell, y: j * cell, tone: clamp01(value), accent });
    }
  }
  return cells;
}

/** Keep a stored or pasted pattern valid: unknown keys dropped, numbers clamped, bad values defaulted. */
export function sanitizePattern(input: unknown): HeroPattern {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const num = (k: keyof HeroPattern, min: number, max: number) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (DEFAULT_PATTERN[k] as number);
  };
  const pick = <T extends string>(k: keyof HeroPattern, options: readonly T[]) =>
    (options as readonly unknown[]).includes(o[k]) ? (o[k] as T) : (DEFAULT_PATTERN[k] as T);
  return {
    shape: pick("shape", SHAPES),
    dither: pick("dither", DITHERS),
    cell: num("cell", 3, 16),
    scale: num("scale", 0.4, 3),
    density: num("density", 0, 1),
    accent: num("accent", 0, 0.5),
    palette: pick("palette", ACCENTS),
    focusX: num("focusX", 0, 1),
    focusY: num("focusY", 0, 1),
    clear: num("clear", 0, 1),
    seed: Math.round(num("seed", 1, 999)),
  };
}
