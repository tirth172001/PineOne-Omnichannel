import { defineControls } from "@/components/controls";
import { DEFAULT_TEXTURE, type PaintTexture, sanitizeTexture } from "@/components/hero-banner/texture";
import { PAINT_TEXTURE } from "@/lib/paint-texture";

export const SLUG = "paint-texture-maker";

const d = PAINT_TEXTURE;
export const controlsSchema = defineControls({
  colour: { type: "select", label: "Sample colour", options: ["ink", "lime", "pine"], default: "pine" },
  streaks: { type: "slider", label: "Colour streaks", min: 0, max: 1, step: 0.05, default: d.streaks },
  thinning: { type: "slider", label: "Lighter where thin", min: 0, max: 1, step: 0.05, default: d.thinning },
  gloss: { type: "slider", label: "Wet gloss", min: 0, max: 1, step: 0.05, default: d.gloss },
  grooves: { type: "slider", label: "Groove depth", min: 0, max: 1, step: 0.05, default: d.grooves },
  lip: { type: "slider", label: "Raised lip", min: 0, max: 1, step: 0.05, default: d.lip },
  dryness: { type: "slider", label: "Runs dry early", min: 0, max: 1, step: 0.05, default: d.dryness },
  specks: { type: "slider", label: "Paint specks", min: 0, max: 1, step: 0.05, default: d.specks },
  holes: { type: "slider", label: "Canvas flecks", min: 0, max: 1, step: 0.05, default: d.holes },
});

export function toTexture(values: Record<string, unknown>): PaintTexture {
  return sanitizeTexture(values);
}

/** The snippet to paste over PAINT_TEXTURE in lib/paint-texture.ts. */
export function toSnippet(t: PaintTexture) {
  return `{\n${(Object.keys(DEFAULT_TEXTURE) as (keyof PaintTexture)[]).map((k) => `  ${k}: ${Number(t[k].toFixed(2))},`).join("\n")}\n}`;
}
