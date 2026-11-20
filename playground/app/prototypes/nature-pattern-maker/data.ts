import { defineControls } from "@/components/controls";
import { DEFAULT_NATURE, HARMONIES, NATURE_KINDS, type NaturePattern, sanitizeNature } from "@/components/hero-banner/nature";
import { FOLDERS } from "@/lib/folders";

export const SLUG = "nature-pattern-maker";

/** Pages that carry a banner: the title to preview with, and where the copied pattern goes. */
export const PAGES = [
  { name: "Home", title: "Playground", target: "HOME_HERO" },
  ...FOLDERS.map((f) => ({ name: f.title, title: f.title, target: `FOLDER_HEROES["${f.id}"]` })),
] as const;

const d = DEFAULT_NATURE;
export const controlsSchema = defineControls({
  page: { type: "select", label: "Preview as", options: PAGES.map((p) => p.name), default: "Home" },
  pattern: { type: "select", label: "Pattern", options: NATURE_KINDS, default: d.pattern },
  colour: { type: "color", label: "Base colour", default: d.colour },
  harmony: { type: "select", label: "Accents", options: HARMONIES, default: d.harmony },
  scale: { type: "slider", label: "Size", min: 0.4, max: 2.5, step: 0.05, default: d.scale },
  density: { type: "slider", label: "Density", min: 0.2, max: 1, step: 0.05, default: d.density },
  texture: { type: "slider", label: "Texture", min: 0, max: 1, step: 0.05, default: d.texture },
  focusX: { type: "slider", label: "Focus across", min: 0, max: 1, step: 0.01, default: d.focusX },
  focusY: { type: "slider", label: "Focus down", min: 0, max: 1, step: 0.01, default: d.focusY },
  clear: { type: "slider", label: "Clear behind title", min: 0, max: 1, step: 0.05, default: d.clear },
  seed: { type: "slider", label: "Seed", min: 1, max: 999, step: 1, default: d.seed },
});

export function toNature(values: Record<string, unknown>): NaturePattern {
  return sanitizeNature(values);
}

/** The snippet to paste into lib/heroes.ts. */
export function toSnippet(p: NaturePattern) {
  return `{\n${Object.entries(p)
    .map(([k, v]) => `  ${k}: ${typeof v === "string" ? `"${v}"` : Number(v.toFixed(2))},`)
    .join("\n")}\n}`;
}
