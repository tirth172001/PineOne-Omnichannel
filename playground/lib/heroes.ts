import { DEFAULT_PATTERN, type HeroPattern, SHAPES } from "@/components/hero-banner/pattern";
import type { FolderId } from "@/lib/folders";

/**
 * Each page's hero banner background. Design one in the Hero banner maker prototype
 * (Design system folder), press Copy, and paste the object over the page's entry here.
 */
export const HOME_HERO: HeroPattern = {
  ...DEFAULT_PATTERN,
  shape: "logo",
  cell: 5,
  scale: 1.05,
  density: 0.9,
  accent: 0.05,
  palette: "both",
  focusX: 0.84,
  focusY: 0.56,
  seed: 12,
};

export const FOLDER_HEROES: Record<FolderId, HeroPattern> = {
  docs: { ...DEFAULT_PATTERN, shape: "slope", dither: "bayer", focusX: 0.12, focusY: 0.3, scale: 1.6, accent: 0.04, seed: 21 },
  "design-system": { ...DEFAULT_PATTERN, shape: "rings", dither: "halftone", cell: 9, focusX: 0.86, scale: 1.3, accent: 0.04, seed: 4 },
  "pine-one": { ...DEFAULT_PATTERN, shape: "logo", cell: 5, focusX: 0.14, focusY: 0.62, scale: 0.9, palette: "seal", accent: 0.05, seed: 33 },
  "pine-one-app": { ...DEFAULT_PATTERN, shape: "waves", focusX: 0.5, scale: 1.2, accent: 0.05, seed: 8 },
  "pine-omni": { ...DEFAULT_PATTERN, shape: "grain", dither: "noise", cell: 5, scale: 1.1, accent: 0.06, palette: "both", seed: 61 },
  "pine-omni-app": { ...DEFAULT_PATTERN, shape: "waves", dither: "noise", cell: 5, focusX: 0.2, scale: 0.9, palette: "both", seed: 17 },
  agents: { ...DEFAULT_PATTERN, shape: "rings", focusX: 0.15, focusY: 0.7, scale: 1.5, accent: 0.1, seed: 2 },
  onboarding: { ...DEFAULT_PATTERN, shape: "slope", dither: "halftone", cell: 8, focusX: 0.88, focusY: 0.2, scale: 1.2, accent: 0.04, seed: 45 },
};

function slugSeed(slug: string) {
  let h = 0;
  for (const ch of slug) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Docs get a quiet, per-doc variation (no logo), so every page differs but none needs hand-tuning. */
export function docHero(slug: string): HeroPattern {
  const h = slugSeed(slug);
  const shapes = SHAPES.filter((s) => s !== "logo");
  return {
    ...DEFAULT_PATTERN,
    shape: shapes[h % shapes.length],
    dither: h % 3 === 0 ? "noise" : "bayer",
    cell: 5,
    focusX: h % 2 ? 0.86 : 0.14,
    focusY: 0.3 + ((h >> 3) % 5) * 0.1,
    density: 0.6,
    accent: 0.04,
    palette: h % 4 === 0 ? "seal" : "lime",
    seed: (h % 997) + 1,
  };
}
