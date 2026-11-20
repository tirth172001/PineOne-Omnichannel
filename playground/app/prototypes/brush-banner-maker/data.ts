import { defineControls } from "@/components/controls";
import { BRUSH_ACCENTS, type BrushPattern, DEFAULT_BRUSH, FLOWS, sanitizeBrush } from "@/components/hero-banner/brush";
import { FOLDERS } from "@/lib/folders";
import { FOLDER_HEROES, HOME_HERO } from "@/lib/heroes";

export const SLUG = "brush-banner-maker";

/** Pages that carry a banner: the title to preview with, its live pattern, and where the copied pattern goes. */
export const PAGES = [
  { name: "Home", title: "Playground", pattern: HOME_HERO, target: "HOME_HERO" },
  ...FOLDERS.map((f) => ({ name: f.title, title: f.title, pattern: FOLDER_HEROES[f.id], target: `FOLDER_HEROES["${f.id}"]` })),
] as const;

const d = DEFAULT_BRUSH;
export const controlsSchema = defineControls({
  page: { type: "select", label: "Preview as", options: PAGES.map((p) => p.name), default: "Home" },
  flow: { type: "select", label: "Plant structure", options: FLOWS, default: d.flow },
  scale: { type: "slider", label: "Structure size", min: 0.4, max: 3, step: 0.05, default: d.scale },
  length: { type: "slider", label: "Stroke length", min: 10, max: 200, step: 1, default: d.length },
  width: { type: "slider", label: "Stroke width", min: 3, max: 40, step: 1, default: d.width },
  density: { type: "slider", label: "Density", min: 0.1, max: 1, step: 0.05, default: d.density },
  bristles: { type: "slider", label: "Bristle ridges", min: 2, max: 16, step: 1, default: d.bristles },
  relief: { type: "slider", label: "Relief (3D)", min: 0, max: 1, step: 0.05, default: d.relief },
  wobble: { type: "slider", label: "Wander off the structure", min: 0, max: 1, step: 0.05, default: d.wobble },
  layers: { type: "slider", label: "Layers", min: 1, max: 3, step: 1, default: d.layers },
  grain: { type: "slider", label: "Paper grain", min: 0, max: 1, step: 0.05, default: d.grain },
  accent: { type: "slider", label: "Accent on highlights", min: 0, max: 1, step: 0.05, default: d.accent },
  palette: { type: "select", label: "Accent colour", options: BRUSH_ACCENTS, default: d.palette },
  focusX: { type: "slider", label: "Focus across", min: 0, max: 1, step: 0.01, default: d.focusX },
  focusY: { type: "slider", label: "Focus down", min: 0, max: 1, step: 0.01, default: d.focusY },
  clear: { type: "slider", label: "Clear behind title", min: 0, max: 1, step: 0.05, default: d.clear },
  seed: { type: "slider", label: "Seed", min: 1, max: 999, step: 1, default: d.seed },
});

export function toBrush(values: Record<string, unknown>): BrushPattern {
  return sanitizeBrush(values);
}

/** The snippet to paste into `lib/heroes.ts`. */
export function toSnippet(p: BrushPattern) {
  const body = Object.entries(p)
    .map(([k, v]) => `  ${k}: ${typeof v === "string" ? `"${v}"` : Number(v.toFixed(2))},`)
    .join("\n");
  return `{\n${body}\n}`;
}
