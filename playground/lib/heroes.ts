import { type BannerPattern, type BrushPattern, DEFAULT_BRUSH } from "@/components/hero-banner/brush";
import { DEFAULT_PATTERN, type HeroPattern } from "@/components/hero-banner/pattern";
import type { FolderId } from "@/lib/folders";

/**
 * Each page's hero banner background: a pixel pattern or a brush pattern (`kind: "brush"`). Design one in the
 * Hero banner maker or Brush banner maker prototype (Design system folder), press Copy, and paste the object
 * over the page's entry here.
 *
 * Live (since Nov 20): brush strokes everywhere (HOME_HERO, FOLDER_HEROES, docHero), each painting a plant
 * micro-structure (veins, cells, stomata, xylem, palisade, mycelium, sunflower spiral) with its own focus and
 * accent so pages stay distinguishable; all share the calm defaults from DEFAULT_BRUSH.
 */
const brush = (p: Partial<BrushPattern>): BrushPattern => ({ ...DEFAULT_BRUSH, ...p });

export const HOME_HERO: BannerPattern = brush({ flow: "veins", focusX: 0.8, focusY: 0.55, palette: "both", seed: 11 });

export const FOLDER_HEROES: Record<FolderId, BannerPattern> = {
  docs: brush({ flow: "cells", focusX: 0.85, palette: "lime", seed: 21 }),
  "design-system": brush({ flow: "spiral", focusX: 0.84, focusY: 0.5, palette: "both", seed: 4 }),
  "pine-one": brush({ flow: "veins", scale: 1.4, focusX: 0.82, palette: "pine", seed: 33 }),
  "pine-one-app": brush({ flow: "stomata", density: 0.5, focusX: 0.85, focusY: 0.45, palette: "pine", seed: 8 }),
  "pine-omni": brush({ flow: "cells", scale: 0.8, focusX: 0.5, focusY: 0.6, palette: "both", seed: 61 }),
  "pine-omni-app": brush({ flow: "xylem", focusX: 0.2, focusY: 0.55, palette: "lime", seed: 17 }),
  agents: brush({ flow: "mycelium", focusX: 0.15, palette: "lime", seed: 2 }),
  onboarding: brush({ flow: "palisade", density: 0.38, focusX: 0.15, focusY: 0.6, palette: "lime", seed: 45 }),
};

/** Docs: a per-doc brush variation (flow, focus, accent from the slug), always focused right of the left-aligned title. */
export function docHero(slug: string): BannerPattern {
  const h = slugSeed(slug);
  const flows = ["veins", "cells", "stomata", "xylem", "palisade", "mycelium", "spiral"] as const;
  const palettes = ["lime", "pine", "both"] as const;
  return brush({
    flow: flows[h % flows.length],
    focusX: 0.8 + ((h >> 5) % 3) * 0.05,
    focusY: 0.35 + ((h >> 3) % 4) * 0.1,
    palette: palettes[(h >> 2) % palettes.length],
    seed: (h % 997) + 1,
  });
}

/** The pixel designs (before brush strokes, Nov 20). Kept so any page can switch back: use one of these instead. */
export const PIXEL_HOME_HERO: HeroPattern = {
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

export const PIXEL_FOLDER_HEROES: Record<FolderId, HeroPattern> = {
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

/** The pixel version of the per-doc banner. */
export function pixelDocHero(slug: string): HeroPattern {
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
