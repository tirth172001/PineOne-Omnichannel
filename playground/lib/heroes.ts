import { DEFAULT_PATTERN, type HeroPattern } from "@/components/hero-banner/pattern";
import type { FolderId } from "@/lib/folders";

/**
 * Each page's hero banner background. Design one in the Hero banner maker prototype
 * (Design system folder), press Copy, and paste the object over the page's entry here.
 */
export const HOME_HERO: HeroPattern = {
  ...DEFAULT_PATTERN,
  shape: "echo",
  pixel: "rounded",
  cell: 5,
  scale: 1,
  density: 0.7,
  accent: 1,
  palette: "lime",
  gradient: 0.5,
  focusX: 0.84,
  focusY: 0.5,
  seed: 12,
};

export const FOLDER_HEROES: Record<FolderId, HeroPattern> = {
  docs: { ...DEFAULT_PATTERN, shape: "veins", cell: 5, scale: 1.1, density: 0.5, focusX: 0.85, accent: 1, seed: 21 },
  "design-system": { ...DEFAULT_PATTERN, shape: "spiral", pixel: "dot", cell: 4, scale: 1, density: 0.6, focusX: 0.86, focusY: 0.5, accent: 1, seed: 4 },
  "pine-one": { ...DEFAULT_PATTERN, shape: "topo", pixel: "dot", cell: 6, scale: 1.4, density: 0.6, focusX: 0.82, accent: 0.3, gradient: 0.45, seed: 33 },
  "pine-one-app": { ...DEFAULT_PATTERN, shape: "stomata", cell: 5, scale: 1, density: 0.7, focusX: 0.85, accent: 1, seed: 8 },
  "pine-omni": { ...DEFAULT_PATTERN, shape: "osmosis", pixel: "dot", cell: 6, scale: 1, density: 0.8, focusX: 0.5, focusY: 0.72, accent: 1, gradient: 0.35, seed: 61 },
  "pine-omni-app": { ...DEFAULT_PATTERN, shape: "grana", pixel: "rounded", cell: 5, scale: 1.1, density: 0.7, focusX: 0.3, palette: "pine", accent: 1, gradient: 0.45, seed: 17 },
  agents: { ...DEFAULT_PATTERN, shape: "mycelium", pixel: "dot", cell: 5, scale: 1, density: 0.65, focusX: 0.15, accent: 0.35, gradient: 0.5, seed: 2 },
  onboarding: { ...DEFAULT_PATTERN, shape: "xylem", pixel: "rounded", cell: 5, scale: 1, density: 0.7, focusX: 0.15, palette: "pine", accent: 0.8, gradient: 0.45, seed: 45 },
};

function slugSeed(slug: string) {
  let h = 0;
  for (const ch of slug) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Docs get a quiet, per-doc variation (no logo, title left-aligned), so every page differs but none needs hand-tuning. */
export function docHero(slug: string): HeroPattern {
  const h = slugSeed(slug);
  const shapes = ["stomata", "veins", "palisade", "cells", "osmosis", "flow", "spiral", "topo"] as const;
  const pixels = ["rounded", "dot", "rounded", "square"] as const;
  return {
    ...DEFAULT_PATTERN,
    shape: shapes[h % shapes.length],
    pixel: pixels[(h >> 2) % pixels.length],
    cell: 6,
    // Doc titles are left-aligned, so the gradient's bright point always sits on the right.
    focusX: 0.8 + ((h >> 5) % 3) * 0.05,
    focusY: 0.3 + ((h >> 3) % 5) * 0.1,
    density: 0.65,
    accent: 0.4,
    palette: h % 4 === 0 ? "pine" : "lime",
    seed: (h % 997) + 1,
  };
}
