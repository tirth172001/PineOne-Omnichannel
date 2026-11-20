import { defineControls } from "@/components/controls";
import { PREVIEW_STYLE, type PreviewStyle } from "@/lib/preview";

export const SLUG = "card-preview-maker";

const d = PREVIEW_STYLE;
export const controlsSchema = defineControls({
  inset: { type: "slider", label: "Inset", min: 0, max: 20, step: 0.5, default: d.inset },
  windowWidth: { type: "slider", label: "Desktop frame width", min: 60, max: 100, step: 1, default: d.windowWidth },
  phoneWidth: { type: "slider", label: "Phone width", min: 20, max: 50, step: 1, default: d.phoneWidth },
  phoneAlign: { type: "slider", label: "Phone position", min: 0, max: 100, step: 5, default: d.phoneAlign },
  shadow: { type: "toggle", label: "Shadow", default: d.shadow },
});

/** A prototype the maker can preview (from the registry, built on the server). */
export type Sample = {
  slug: string;
  title: string;
  folder: string;
  kind: "desktop" | "mobile";
  version: number;
};

export function toStyle(v: Record<string, unknown>): PreviewStyle {
  return {
    inset: Number(v.inset),
    windowWidth: Number(v.windowWidth),
    phoneWidth: Number(v.phoneWidth),
    phoneAlign: Number(v.phoneAlign),
    shadow: Boolean(v.shadow),
  };
}

/** The snippet to paste over PREVIEW_STYLE in lib/preview.ts. */
export function toSnippet(style: PreviewStyle) {
  return `{\n${Object.entries(style)
    .map(([k, v]) => `  ${k}: ${typeof v === "number" ? Number(v.toFixed(2)) : v},`)
    .join("\n")}\n}`;
}
