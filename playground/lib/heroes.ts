import { type BannerPattern, type BrushPattern, DEFAULT_BRUSH } from "@/components/hero-banner/brush";
import { DEFAULT_NATURE, NATURE_COLOURS, type NaturePattern } from "@/components/hero-banner/nature";
import { DEFAULT_PATTERN, type HeroPattern } from "@/components/hero-banner/pattern";
import type { FolderId } from "@/lib/folders";

/**
 * Each page's hero banner background: a pixel pattern or a brush pattern (`kind: "brush"`). Design one in the
 * Hero banner maker or Brush banner maker prototype (Design system folder), press Copy, and paste the object
 * over the page's entry here.
 *
 * Live (since Nov 20): brush strokes everywhere (HOME_HERO, FOLDER_HEROES, docHero), each painting a plant
 * micro-structure (cells, growth rings, fern fronds, pollen, grana, xylem, mycelium, sunflower spiral) in thick
 * oil-paint strokes, with its own focus and
 * accent so pages stay distinguishable; all share the calm defaults from DEFAULT_BRUSH.
 */
const brush = (p: Partial<BrushPattern>): BrushPattern => ({ ...DEFAULT_BRUSH, ...p });

export const BRUSH_HOME_HERO: BannerPattern = brush({ flow: "rings", focusX: 0.82, focusY: 0.55, palette: "both", seed: 11 });

export const BRUSH_FOLDER_HEROES: Record<FolderId, BannerPattern> = {
  docs: brush({ flow: "cells", focusX: 0.85, palette: "lime", seed: 21 }),
  "design-system": brush({ flow: "spiral", focusX: 0.84, focusY: 0.5, palette: "both", seed: 4 }),
  "pine-one": brush({ flow: "fronds", focusX: 0.82, palette: "pine", seed: 33 }),
  "pine-one-app": brush({ flow: "pollen", focusX: 0.85, focusY: 0.45, palette: "pine", seed: 8 }),
  "pine-omni": brush({ flow: "grana", focusX: 0.5, focusY: 0.6, palette: "both", seed: 61 }),
  "pine-omni-app": brush({ flow: "xylem", focusX: 0.2, focusY: 0.55, palette: "lime", seed: 17 }),
  agents: brush({ flow: "mycelium", focusX: 0.15, palette: "lime", seed: 2 }),
  onboarding: brush({ flow: "cells", scale: 1.6, focusX: 0.15, focusY: 0.6, palette: "pine", seed: 45 }),
};

/** The brush version of the per-doc banner: a per-doc brush variation (flow, focus, accent from the slug), always focused right of the left-aligned title. */
export function brushDocHero(slug: string): BannerPattern {
  const h = slugSeed(slug);
  const flows = ["cells", "rings", "fronds", "pollen", "grana", "xylem", "mycelium", "spiral"] as const;
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

/**
 * Live (since Nov 20, latest): nature patterns, full-coverage paintings after the owner's references, each page
 * with its own pattern and soft base colour. Design one in the Nature pattern maker and paste it here.
 * The brush (BRUSH_*) and pixel (PIXEL_*) designs above are kept to switch back.
 */
const nature = (p: Partial<NaturePattern>): NaturePattern => ({ ...DEFAULT_NATURE, ...p });

export const HOME_HERO: BannerPattern = nature({ pattern: "swirl", colour: NATURE_COLOURS.sage, harmony: "cream", focusX: 0.8, fadeSize: 1.2, seed: 7 });

export const FOLDER_HEROES: Record<FolderId, BannerPattern> = {
  docs: nature({ pattern: "etching", colour: NATURE_COLOURS.slate, harmony: "mono", seed: 21 }),
  "design-system": nature({ pattern: "bloom", colour: NATURE_COLOURS.lilac, harmony: "blush", seed: 4 }),
  "pine-one": nature({ pattern: "ginkgo", colour: NATURE_COLOURS.moss, harmony: "mono", seed: 33 }),
  "pine-one-app": nature({ pattern: "cells", colour: NATURE_COLOURS.leaf, harmony: "mono", seed: 8 }),
  "pine-omni": nature({ pattern: "silk", colour: NATURE_COLOURS.sage, harmony: "cream", seed: 61 }),
  "pine-omni-app": nature({ pattern: "swirl", colour: NATURE_COLOURS.sky, harmony: "cream", focusX: 0.2, seed: 17 }),
  agents: nature({ pattern: "etching", colour: NATURE_COLOURS.bark, harmony: "mono", focusX: 0.2, seed: 2 }),
  onboarding: nature({ pattern: "bloom", colour: NATURE_COLOURS.clay, harmony: "cream", seed: 45 }),
};

/** Docs: a per-doc nature variation (pattern and colour from the slug), focused right of the left-aligned title. */
export function docHero(slug: string): BannerPattern {
  const h = slugSeed(slug);
  const patterns = ["swirl", "ginkgo", "cells", "silk", "bloom", "etching"] as const;
  const colours = Object.values(NATURE_COLOURS);
  return nature({
    pattern: patterns[h % patterns.length],
    colour: colours[(h >> 3) % colours.length],
    harmony: h % 3 === 0 ? "mono" : "cream",
    // Titles are left-aligned: a linear fade, so the pattern grows in from the text towards the right.
    fadeShape: "linear",
    fadeSize: 1.3,
    clear: 0.95,
    focusX: 0.8 + ((h >> 5) % 3) * 0.05,
    seed: (h % 997) + 1,
  });
}
