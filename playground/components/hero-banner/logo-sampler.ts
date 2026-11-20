import type { LogoSampler } from "./pattern";
import { PINE_LOGO_PATH, PINE_LOGO_SIZE } from "./pine-logo";

const RES = 160;
let cached: LogoSampler | null = null;

/** Rasterises the Pine seal once (browser only) and returns a coverage lookup. */
export function getLogoSampler(): LogoSampler | null {
  if (cached) return cached;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = RES;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.scale(RES / PINE_LOGO_SIZE, RES / PINE_LOGO_SIZE);
  ctx.fill(new Path2D(PINE_LOGO_PATH));
  const alpha = ctx.getImageData(0, 0, RES, RES).data;
  cached = (u, v) => {
    const x = Math.min(RES - 1, Math.max(0, Math.floor(u * RES)));
    const y = Math.min(RES - 1, Math.max(0, Math.floor(v * RES)));
    return alpha[(y * RES + x) * 4 + 3] / 255;
  };
  return cached;
}
