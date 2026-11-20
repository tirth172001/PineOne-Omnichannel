import { defineControls } from "@/components/controls";
import { ACCENTS, DITHERS, PIXELS, type HeroPattern, SHAPES, sanitizePattern } from "@/components/hero-banner/pattern";
import { FOLDERS } from "@/lib/folders";
import { PIXEL_FOLDER_HEROES, PIXEL_HOME_HERO, pixelDocHero } from "@/lib/heroes";

export const SLUG = "hero-banner-maker";

/** Pages that carry a banner: the title it previews with, and its current pattern from `lib/heroes.ts`. */
export const PAGES = [
  { name: "Home", title: "Playground", pattern: PIXEL_HOME_HERO, target: "HOME_HERO" },
  ...FOLDERS.map((f) => ({ name: f.title, title: f.title, pattern: PIXEL_FOLDER_HEROES[f.id], target: `FOLDER_HEROES["${f.id}"]` })),
  { name: "A doc", title: "Merchant day-in-the-life research plan", pattern: pixelDocHero("example"), target: "docHero() (shared by every doc)" },
] as const;

export const PAGE_NAMES = PAGES.map((p) => p.name);

// Starts on the home page's pixel design (the Pine Labs echo).
const d = PIXEL_HOME_HERO;
export const controlsSchema = defineControls({
  page: { type: "select", label: "Preview as", options: PAGE_NAMES, default: "Home" },
  shape: { type: "select", label: "Shape", options: SHAPES, default: d.shape },
  dither: { type: "select", label: "Dither", options: DITHERS, default: d.dither },
  pixel: { type: "select", label: "Pixel style", options: PIXELS, default: d.pixel },
  cell: { type: "slider", label: "Pixel size", min: 3, max: 16, step: 1, default: d.cell },
  scale: { type: "slider", label: "Pattern size", min: 0.4, max: 3, step: 0.05, default: d.scale },
  density: { type: "slider", label: "Density", min: 0, max: 1, step: 0.05, default: d.density },
  accent: { type: "slider", label: "Accent", min: 0, max: 1, step: 0.05, default: d.accent },
  palette: { type: "select", label: "Accent colour", options: ACCENTS, default: d.palette },
  gradient: { type: "slider", label: "Accent gradient", min: 0, max: 1, step: 0.05, default: d.gradient },
  focusX: { type: "slider", label: "Focus across", min: 0, max: 1, step: 0.01, default: d.focusX },
  focusY: { type: "slider", label: "Focus down", min: 0, max: 1, step: 0.01, default: d.focusY },
  clear: { type: "slider", label: "Clear behind title", min: 0, max: 1, step: 0.05, default: d.clear },
  seed: { type: "slider", label: "Seed", min: 1, max: 999, step: 1, default: d.seed },
});

/** The pattern part of the control values. */
export function toPattern(values: Record<string, unknown>): HeroPattern {
  return sanitizePattern(values);
}

/** The snippet to paste into `lib/heroes.ts`. Numbers rounded so it reads cleanly. */
export function toSnippet(p: HeroPattern) {
  const body = Object.entries(p)
    .map(([k, v]) => `  ${k}: ${typeof v === "string" ? `"${v}"` : Number(v.toFixed(2))},`)
    .join("\n");
  return `{\n${body}\n}`;
}
