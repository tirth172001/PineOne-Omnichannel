import { type BrushPattern, brushStrokes, rng } from "./brush";

/** Theme colours read off the canvas (CSS colour strings). */
export type BrushColours = { ink: string; muted: string; lime: string; pine: string };

/** Paint alpha per bristle: low, so overlapping bristles build up texture and the palette stays muted. */
const INK_ALPHA = 0.08;
const INK_RANGE = 0.2;

/**
 * Paints brush strokes. Each stroke is a bundle of thin bristle lines offset across its width:
 * every bristle gets its own opacity, thickness and length (dry, ragged ends), so the stroke has texture.
 * A faint paper grain goes underneath.
 */
export function drawBrush(ctx: CanvasRenderingContext2D, p: BrushPattern, width: number, height: number, c: BrushColours) {
  const rand = rng(p.seed * 31 + 5);

  if (p.grain > 0) {
    ctx.fillStyle = c.ink;
    const dots = Math.round(((width * height) / 90) * p.grain);
    for (let i = 0; i < dots; i++) {
      ctx.globalAlpha = 0.015 + rand() * 0.035;
      const s = rand() < 0.15 ? 1.6 : 1;
      ctx.fillRect(rand() * width, rand() * height, s, s);
    }
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const colourOf = [c.ink, c.muted, c.lime, c.pine];
  for (const stroke of brushStrokes(p, width, height)) {
    const r = rng(stroke.seed);
    const pts = stroke.points;
    const n = Math.max(2, p.bristles);
    const accent = stroke.colour >= 2;
    ctx.strokeStyle = colourOf[stroke.colour];
    for (let b = 0; b < n; b++) {
      const across = (n === 1 ? 0 : b / (n - 1) - 0.5) * stroke.width + (r() - 0.5) * stroke.width * 0.15;
      // Dry brush: each bristle stops somewhere between 55% and 100% of the stroke and may start late.
      const start = r() < 0.35 ? 1 : 0;
      const end = Math.max(start + 1, Math.round((pts.length - 1) * (0.55 + r() * 0.45)));
      ctx.globalAlpha = (accent ? 0.45 + r() * 0.3 : INK_ALPHA + INK_RANGE * stroke.tone) * (0.5 + r() * 0.5);
      // Thin bristles leave gaps between them, which is where the texture comes from.
      ctx.lineWidth = Math.max(0.6, (stroke.width / n) * (0.55 + r() * 0.6));
      ctx.beginPath();
      for (let i = start; i <= end; i++) {
        const [x0, y0] = pts[Math.max(0, i - 1)];
        const [x1, y1] = pts[Math.min(pts.length - 1, i + 1)];
        const len = Math.hypot(x1 - x0, y1 - y0) || 1;
        // Offset across the stroke (normal to its direction), with a little per-point shake.
        const nx = -(y1 - y0) / len;
        const ny = (x1 - x0) / len;
        const shake = (r() - 0.5) * 0.8;
        const [x, y] = pts[i];
        const px = x + nx * (across + shake);
        const py = y + ny * (across + shake);
        if (i === start) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
