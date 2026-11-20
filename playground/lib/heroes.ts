import { DEFAULT_PATTERN, type HeroPattern } from "@/components/hero-banner/pattern";
import type { FolderId } from "@/lib/folders";

/**
 * Each page's hero banner background. Design one in the Hero banner maker prototype
 * (Design system folder), press Copy, and paste the object over the page's entry here.
 */
export const HOME_HERO: HeroPattern = {
  ...DEFAULT_PATTERN,
  shape: "pinelabs",
  pixel: "rounded",
  cell: 6,
  scale: 0.7,
  density: 0.6,
  accent: 0.4,
  palette: "lime",
  gradient: 0.55,
  focusX: 0.79,
  focusY: 0.56,
  seed: 12,
};

export const FOLDER_HEROES: Record<FolderId, HeroPattern> = {
  docs: { ...DEFAULT_PATTERN, shape: "topo", pixel: "dash", cell: 8, scale: 1.3, density: 0.7, focusX: 0.2, focusY: 0.4, accent: 0.6, gradient: 0.4, seed: 21 },
  "design-system": { ...DEFAULT_PATTERN, shape: "bloom", pixel: "plus", cell: 8, scale: 1.05, density: 0.75, focusX: 0.8, focusY: 0.52, accent: 0.6, gradient: 0.5, seed: 4 },
  "pine-one": { ...DEFAULT_PATTERN, shape: "pinelabs", pixel: "dot", cell: 6, focusX: 0.16, focusY: 0.55, scale: 0.7, density: 0.55, palette: "pine", accent: 0.45, gradient: 0.6, seed: 33 },
  "pine-one-app": { ...DEFAULT_PATTERN, shape: "orbits", pixel: "dot", cell: 6, scale: 1.6, density: 0.8, focusX: 0.82, accent: 0.6, gradient: 0.45, seed: 8 },
  "pine-omni": { ...DEFAULT_PATTERN, shape: "drift", pixel: "needle", cell: 8, scale: 1.2, density: 0.8, accent: 0.5, gradient: 0.4, seed: 61 },
  "pine-omni-app": { ...DEFAULT_PATTERN, shape: "orbits", pixel: "ring", cell: 8, scale: 1.7, density: 0.8, focusX: 0.16, palette: "pine", accent: 0.5, gradient: 0.5, seed: 17 },
  agents: { ...DEFAULT_PATTERN, shape: "pinelabs", pixel: "mark", cell: 8, focusX: 0.16, focusY: 0.5, scale: 0.7, density: 0.6, accent: 0.4, gradient: 0.5, seed: 2 },
  onboarding: { ...DEFAULT_PATTERN, shape: "topo", pixel: "rounded", cell: 6, focusX: 0.85, focusY: 0.3, scale: 1.1, density: 0.6, accent: 0.5, gradient: 0.45, seed: 45 },
};

function slugSeed(slug: string) {
  let h = 0;
  for (const ch of slug) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Docs get a quiet, per-doc variation (no logo, title left-aligned), so every page differs but none needs hand-tuning. */
export function docHero(slug: string): HeroPattern {
  const h = slugSeed(slug);
  const shapes = ["topo", "orbits", "bloom", "drift"] as const;
  const pixels = ["rounded", "dash", "dot", "plus", "needle"] as const;
  return {
    ...DEFAULT_PATTERN,
    shape: shapes[h % shapes.length],
    pixel: pixels[(h >> 2) % pixels.length],
    cell: 8,
    // Doc titles are left-aligned, so the pattern always sits on the right.
    focusX: 0.8 + ((h >> 5) % 3) * 0.05,
    focusY: 0.3 + ((h >> 3) % 5) * 0.1,
    density: 0.7,
    accent: 0.5,
    palette: h % 4 === 0 ? "pine" : "lime",
    seed: (h % 997) + 1,
  };
}
