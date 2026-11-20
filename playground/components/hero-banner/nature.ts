// Nature banners: full-coverage painted patterns from the owner's references (Van Gogh-style impasto swirls,
// ginkgo leaves, plant cells under a microscope, soft silk, flowers, dry-brush etching), in a soft natural
// palette built from one base colour. Pure module: settings, palette and noise; `nature-draw.ts` paints.

/**
 * - `swirl`: dense short impasto strokes swirling round several centres (some with a bright core).
 * - `ginkgo`: rows of overlapping fan-shaped ginkgo leaves with fine radial veins.
 * - `cells`: rows of plant cells: thick walls, a pale inside, chloroplasts clustered within.
 * - `silk`: soft blended bands of colour with a fine ripple texture, like silk or water.
 * - `bloom`: overlapping flowers with layered petals.
 * - `etching`: dry-brush swirls in two tones over a woven texture.
 */
export const NATURE_KINDS = ["swirl", "ginkgo", "cells", "silk", "bloom", "etching"] as const;
/** `mono`: the base colour's tones only; `cream`: + warm cream highlights; `blush`: + cream and a soft blush. */
export const HARMONIES = ["mono", "cream", "blush"] as const;

export type NatureKind = (typeof NATURE_KINDS)[number];
export type Harmony = (typeof HARMONIES)[number];
/** `radial`: an oval round the text. `linear`: a full-height band fading out sideways from the text. */
export const FADE_SHAPES = ["radial", "linear"] as const;
export type FadeShape = (typeof FADE_SHAPES)[number];

export type NaturePattern = {
  kind: "nature";
  pattern: NatureKind;
  /** Base colour (hex). The palette is built from its hue, kept soft. */
  colour: string;
  harmony: Harmony;
  /** Size of the pattern's elements (strokes, leaves, cells, flowers), 0.4–2.5. */
  scale: number;
  /** How densely it's painted, 0.2–1. */
  density: number;
  /** Surface texture: impasto light and shadow, veins, ripples, grain, 0–1. */
  texture: number;
  /** Where swirls centre and the brightest part sits, 0–1 across and down. */
  focusX: number;
  focusY: number;
  /** Fade: how strongly the pattern fades around the text, 0–1 (higher = more fading). */
  clear: number;
  fadeShape: FadeShape;
  /** Fade size: the radial fade's radius, or the linear fade's length, 0.3–2.5 (relative to the banner height). */
  fadeSize: number;
  seed: number;
};

export const DEFAULT_NATURE: NaturePattern = {
  kind: "nature",
  pattern: "swirl",
  colour: "#5f7f6e",
  harmony: "cream",
  scale: 1,
  density: 0.8,
  texture: 0.7,
  focusX: 0.78,
  focusY: 0.5,
  clear: 0.9,
  fadeShape: "radial",
  fadeSize: 1,
  seed: 7,
};

/** Soft natural colours in a few curated bases that sit well with the Pine palette. */
export const NATURE_COLOURS = {
  sage: "#5f7f6e",
  moss: "#66804e",
  leaf: "#7ea35a",
  sky: "#6c8cad",
  slate: "#4f6a86",
  lilac: "#8c7fa6",
  clay: "#b0806a",
  bark: "#7a6a58",
} as const;

export function isNature(p: object): p is NaturePattern {
  return "kind" in p && (p as { kind: unknown }).kind === "nature";
}

// ——— Colour: hex → OKLCH, then soft tones as `oklch()` strings (canvas understands them) ———

function hexToOklch(hex: string): { C: number; H: number } {
  const n = Number.parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const r = lin(((n >> 16) & 255) / 255);
  const g = lin(((n >> 8) & 255) / 255);
  const b = lin((n & 255) / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

export const oklch = (L: number, C: number, H: number, a = 1) =>
  `oklch(${L.toFixed(3)} ${Math.max(0, C).toFixed(3)} ${(((H % 360) + 360) % 360).toFixed(1)}${a < 1 ? ` / ${a.toFixed(3)}` : ""})`;

export type NaturePalette = {
  /** Six tones of the base colour, dark to light. */
  tones: string[];
  /** Tone n with transparency. */
  tone: (i: number, alpha?: number) => string;
  /** Accents, depending on the harmony (empty for `mono`). */
  accents: string[];
  /** A highlight for impasto edges and sheen. */
  light: (alpha: number) => string;
  /** A shadow colour (a deep version of the base). */
  dark: (alpha: number) => string;
  /** Lightness range of the tones, for picking by value. */
  dim: boolean;
};

/** A soft natural palette from a base colour: chroma capped low, hue drifting slightly across the tones. */
export function naturePalette(colour: string, harmony: Harmony, dim: boolean): NaturePalette {
  const { C, H } = hexToOklch(/^#[0-9a-f]{6}$/i.test(colour) ? colour : DEFAULT_NATURE.colour);
  const c = Math.min(C, 0.11) * 0.85;
  const Ls = dim ? [0.2, 0.25, 0.31, 0.38, 0.46, 0.55] : [0.44, 0.53, 0.62, 0.71, 0.8, 0.88];
  const chroma = (i: number) => c * (1 - 0.3 * Math.abs(i - 2.5) / 2.5);
  const hue = (i: number) => H + (i - 2.5) * 3;
  const tone = (i: number, alpha = 1) => {
    // Blends continuously between the six tones (no rounding), so fades and shading never step.
    const k = Math.max(0, Math.min(5, i));
    const lo = Math.floor(Math.min(4, k));
    const f = k - lo;
    return oklch(Ls[lo] + (Ls[lo + 1] - Ls[lo]) * f, chroma(k), hue(k), alpha);
  };
  const cream = oklch(dim ? 0.66 : 0.95, 0.04, 92);
  const blush = oklch(dim ? 0.56 : 0.83, 0.05, 22);
  return {
    tones: Ls.map((_, i) => tone(i)),
    tone,
    accents: harmony === "mono" ? [] : harmony === "cream" ? [cream] : [cream, blush],
    light: (a) => oklch(dim ? 0.74 : 0.97, 0.03, 92, a),
    dark: (a) => oklch(dim ? 0.12 : 0.22, c * 0.8, H, a),
    dim,
  };
}

// ——— Randomness ———

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

export function noise(x: number, y: number, seed: number) {
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

export function fbm(x: number, y: number, seed: number) {
  return noise(x, y, seed) * 0.6 + noise(x * 2.1, y * 2.1, seed + 9) * 0.3 + noise(x * 4.3, y * 4.3, seed + 17) * 0.1;
}

/** Keep a stored or pasted nature pattern valid. */
export function sanitizeNature(input: unknown): NaturePattern {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const num = (k: keyof NaturePattern, min: number, max: number) => {
    const v = o[k];
    return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : (DEFAULT_NATURE[k] as number);
  };
  const pick = <T extends string>(k: keyof NaturePattern, options: readonly T[]) =>
    (options as readonly unknown[]).includes(o[k]) ? (o[k] as T) : (DEFAULT_NATURE[k] as T);
  return {
    kind: "nature",
    pattern: pick("pattern", NATURE_KINDS),
    colour: typeof o.colour === "string" && /^#[0-9a-f]{6}$/i.test(o.colour) ? o.colour : DEFAULT_NATURE.colour,
    harmony: pick("harmony", HARMONIES),
    scale: num("scale", 0.4, 2.5),
    density: num("density", 0.2, 1),
    texture: num("texture", 0, 1),
    focusX: num("focusX", 0, 1),
    focusY: num("focusY", 0, 1),
    clear: num("clear", 0, 1),
    fadeShape: pick("fadeShape", FADE_SHAPES),
    fadeSize: num("fadeSize", 0.3, 2.5),
    seed: Math.round(num("seed", 1, 999)),
  };
}
