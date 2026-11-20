import type { LogoSampler, LogoShape } from "./pattern";
import { LOGOS } from "./pine-logo";

const RES = 200;
const cache = new Map<LogoShape, LogoSampler>();

/** Rasterises a logo once (browser only) and returns a coverage lookup. */
export function getLogoSampler(shape: LogoShape): LogoSampler | null {
  const hit = cache.get(shape);
  if (hit) return hit;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = RES;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const logo = LOGOS[shape];
  const path = new Path2D(logo.path);
  ctx.scale(RES / logo.size, RES / logo.size);
  ctx.translate(-logo.x, -logo.y);
  ctx.fill(path);
  const fill = ctx.getImageData(0, 0, RES, RES).data;
  // Outlined logos: the stroke, clipped to the shape (as the SVG's mask does), drawn on a clean canvas.
  let line: Uint8ClampedArray | null = null;
  if (logo.stroke) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, RES, RES);
    ctx.restore();
    ctx.save();
    ctx.clip(path);
    ctx.lineWidth = logo.stroke * 2;
    ctx.lineJoin = "round";
    ctx.stroke(path);
    ctx.restore();
    line = ctx.getImageData(0, 0, RES, RES).data;
  }
  // Plain logos: coverage 0–1. Outlined logos: 1 on the outline, 0.5 inside it, 0 outside.
  const sampler: LogoSampler = (u, v) => {
    const x = Math.min(RES - 1, Math.max(0, Math.floor(u * RES)));
    const y = Math.min(RES - 1, Math.max(0, Math.floor(v * RES)));
    const i = (y * RES + x) * 4 + 3;
    if (!line) return fill[i] / 255;
    return line[i] > 127 ? 1 : fill[i] > 127 ? 0.5 : 0;
  };
  cache.set(shape, sampler);
  return sampler;
}
