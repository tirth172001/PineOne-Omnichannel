// How thick oil paint looks in a stroke (after the owner's references: glossy ridged paint, a raised lip
// where the brush lands, streaks of lighter and darker paint, and a dry end that breaks into specks with
// canvas showing through). Shared by every brush banner; tuned in the Paint texture maker prototype.

export type PaintTexture = {
  /** Streaks of lighter and darker paint running along the stroke, 0–1. */
  streaks: number;
  /** How much lighter the paint gets where it thins towards the end, 0–1. */
  thinning: number;
  /** Wet gloss: sharp white highlights on the ridges, 0–1. */
  gloss: number;
  /** Groove depth: dark lines between the ridges, 0–1. */
  grooves: number;
  /** Raised lip where the brush lands, and lit/shaded rims along the edges, 0–1. */
  lip: number;
  /** How early the brush runs dry: 0 = solid almost to the end, 1 = dry from halfway, 0–1. */
  dryness: number;
  /** Paint specks scattered round the dry end and edges, 0–1. */
  specks: number;
  /** Bare-canvas flecks eaten into the paint near the dry end, 0–1. */
  holes: number;
};

export const DEFAULT_TEXTURE: PaintTexture = {
  streaks: 0.7,
  thinning: 0.5,
  gloss: 0.6,
  grooves: 0.5,
  lip: 0.6,
  dryness: 0.5,
  specks: 0.45,
  holes: 0.4,
};

export function sanitizeTexture(input: unknown): PaintTexture {
  const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_TEXTURE };
  for (const k of Object.keys(DEFAULT_TEXTURE) as (keyof PaintTexture)[]) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.min(1, Math.max(0, v));
  }
  return out;
}
