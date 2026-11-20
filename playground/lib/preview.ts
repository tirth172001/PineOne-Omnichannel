import type { PrototypeMeta } from "@/lib/prototypes";

/**
 * How every gallery card composes its screenshot. Designed in the Card preview maker prototype
 * (Design system folder): press Copy there and paste over PREVIEW_STYLE.
 */
export type PreviewStyle = {
  /** Gap from the card's top, as % of the card width. */
  inset: number;
  /** Desktop frame width, % of the card width (centred; it bleeds off the bottom). */
  windowWidth: number;
  /** Phone width, % of the card width (it bleeds off the bottom). */
  phoneWidth: number;
  /** Where the phone sits across the card, 0–100 (% of the free space). */
  phoneAlign: number;
  /** Soft shadow under the frame. */
  shadow: boolean;
};

export const PREVIEW_STYLE: PreviewStyle = {
  inset: 7,
  windowWidth: 86,
  phoneWidth: 34,
  phoneAlign: 50,
  shadow: true,
};

export type PreviewKind = "desktop" | "mobile";

/** Mobile apps (phone embeds or `surface: "mobile"`) get the phone composition; everything else the desktop frame. */
export function previewKind(meta: Pick<PrototypeMeta, "surface" | "external">): PreviewKind {
  return meta.surface === "mobile" || meta.external?.embed === "phone" ? "mobile" : "desktop";
}

/** The screenshot sizes the capture script takes for each kind (CSS px). Light theme only: cards always show the light screenshot. */
export const CAPTURE_VIEWPORT = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } } as const;
