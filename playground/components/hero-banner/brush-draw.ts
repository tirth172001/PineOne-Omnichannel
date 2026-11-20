import { type BrushPattern, brushStrokes, rng, type Stroke } from "./brush";

/** Theme colours read off the canvas (CSS colour strings). `base` is the banner's own background. */
export type BrushColours = { ink: string; muted: string; lime: string; pine: string; base: string };

/**
 * Lighting, not palette: the paint is lit from the top left. Shadows are black and highlights white at low
 * opacity in both themes (that's how light behaves on a raised surface), so they aren't theme tokens.
 */
const SHADOW = "rgb(0 0 0)";
const LIGHT = "rgb(255 255 255)";
const LIGHT_DIR: [number, number] = [-Math.SQRT1_2, -Math.SQRT1_2];

/**
 * Opaque paint colours: the ink mixed into the banner background (so a "light" stroke is a muted grey, not a
 * see-through ink), and the accents mixed the same way. Falls back to plain colours (drawn with opacity)
 * where the browser's canvas doesn't understand `color-mix`.
 */
function palette(ctx: CanvasRenderingContext2D, c: BrushColours) {
  const probe = "#010203";
  ctx.fillStyle = probe;
  ctx.fillStyle = `color-mix(in oklch, ${c.ink} 30%, ${c.base})`;
  const mixes = ctx.fillStyle !== probe;
  const mix = (colour: string, pct: number) => (mixes ? `color-mix(in oklch, ${colour} ${Math.round(Math.min(100, pct))}%, ${c.base})` : colour);
  return { mixes, mix };
}

/** Edges of a ribbon around a centre line: a round blob where the brush lands, then thinning as the paint runs out. */
function ribbon(pts: [number, number][], width: number, r: () => number) {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  const normals: [number, number][] = [];
  const n = pts.length;
  const swell = 0.85 + r() * 0.3;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[Math.max(0, i - 1)];
    const [x1, y1] = pts[Math.min(n - 1, i + 1)];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / len;
    const ny = (x1 - x0) / len;
    const t = i / (n - 1);
    const w = (width / 2) * swell * (t < 0.08 ? 0.75 + t * 3 : 1.05 - 0.6 * t ** 1.4) * (0.9 + r() * 0.2);
    left.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    right.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    normals.push([nx, ny]);
  }
  return { left, right, normals };
}

function fillRibbon(ctx: CanvasRenderingContext2D, left: [number, number][], right: [number, number][], dx = 0, dy = 0) {
  ctx.beginPath();
  ctx.moveTo(left[0][0] + dx, left[0][1] + dy);
  for (const [x, y] of left) ctx.lineTo(x + dx, y + dy);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0] + dx, right[i][1] + dy);
  ctx.closePath();
  ctx.fill();
}

/** A smooth open line through points (quadratic curves through the midpoints). */
function smoothLine(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
  ctx.stroke();
}

/**
 * The dry end of a stroke (as in a flat bristle brush running out of paint): bristle-wide lines that each lift
 * off at their own point (so the end feathers instead of stopping square) and skip where the paint catches
 * on the paper grain, more often the further they go.
 */
function dryTail(
  ctx: CanvasRenderingContext2D,
  left: [number, number][],
  right: [number, number][],
  solid: number,
  width: number,
  bristles: number,
  colour: string,
  opacity: number,
  r: () => number
) {
  const n = Math.max(4, bristles * 2);
  const last = left.length - 1;
  ctx.strokeStyle = colour;
  ctx.lineCap = "butt";
  ctx.lineWidth = (width / n) * 1.15;
  for (let b = 0; b < n; b++) {
    const t = (b + 0.5) / n;
    const end = solid + (last - solid) * (0.35 + r() * 0.65);
    const at = (i: number): [number, number] => {
      const i0 = Math.floor(i);
      const i1 = Math.min(last, i0 + 1);
      const f = i - i0;
      const lx = left[i0][0] + (left[i1][0] - left[i0][0]) * f;
      const ly = left[i0][1] + (left[i1][1] - left[i0][1]) * f;
      const rx = right[i0][0] + (right[i1][0] - right[i0][0]) * f;
      const ry = right[i0][1] + (right[i1][1] - right[i0][1]) * f;
      return [rx + (lx - rx) * t, ry + (ly - ry) * t];
    };
    ctx.globalAlpha = opacity * (0.75 + r() * 0.25);
    ctx.beginPath();
    let drawing = false;
    // Small steps so breaks are fine-grained; skip chance grows towards the bristle's end.
    for (let i = solid; i <= end; i += 0.25) {
      const dry = (i - solid) / Math.max(0.01, end - solid);
      const [x, y] = at(i);
      const skip = r() < dry * 0.55;
      if (skip) {
        drawing = false;
        continue;
      }
      if (!drawing) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      drawing = true;
    }
    ctx.stroke();
  }
  ctx.lineCap = "round";
}

/**
 * One stroke of thick paint (impasto):
 * 1. a soft cast shadow below-right of the lump;
 * 2. the lump itself, opaque, round where the brush lands; then a dry, feathered, broken tail (`dryTail`);
 * 3. bristle ridges raked along it: a dark groove with a lit crest beside it;
 * 4. a lit edge on the side facing the light and a shaded edge on the other side.
 */
function paintStroke(ctx: CanvasRenderingContext2D, s: Stroke, p: BrushPattern, body: string, ridgeDark: string, opacity: number) {
  const r = rng(s.seed);
  const { left, right, normals } = ribbon(s.points, s.width, r);
  const relief = p.relief;
  const lift = Math.max(0.8, Math.min(3, s.width * 0.12)) * (0.4 + relief);

  // The brush is full for the first part of the stroke (solid, opaque paint), then runs dry: from `solid`
  // on, the bristles lift off one by one and the paint breaks into streaks (see `dryTail`).
  const solid = Math.max(2, Math.round((s.points.length - 1) * (0.5 + r() * 0.2)));
  const bodyL = left.slice(0, solid + 1);
  const bodyR = right.slice(0, solid + 1);

  if (relief > 0) {
    ctx.fillStyle = SHADOW;
    ctx.globalAlpha = 0.16 * relief;
    fillRibbon(ctx, bodyL, bodyR, lift, lift);
    ctx.globalAlpha = 0.1 * relief;
    fillRibbon(ctx, bodyL, bodyR, lift * 1.8, lift * 1.8);
  }

  ctx.fillStyle = body;
  ctx.globalAlpha = opacity;
  fillRibbon(ctx, bodyL, bodyR);
  dryTail(ctx, left, right, solid, s.width, p.bristles, body, opacity, r);
  // The blob where the brush first touched: a round lump of paint at the start.
  const [sx, sy] = s.points[0];
  const r0 = Math.hypot(left[0][0] - right[0][0], left[0][1] - right[0][1]) / 2;
  ctx.beginPath();
  ctx.arc(sx, sy, r0, 0, Math.PI * 2);
  ctx.fill();

  // Ridges: grooves dragged by the bristles, each with a lit crest just beside it.
  const ridges = Math.max(2, p.bristles);
  ctx.lineCap = "round";
  for (let b = 0; b < ridges; b++) {
    const across = (b + 0.5) / ridges - 0.5 + (r() - 0.5) * 0.12;
    const start = Math.floor(r() * 2);
    const end = Math.max(start + 2, Math.round((s.points.length - 1) * (0.55 + r() * 0.45)));
    const groove: [number, number][] = [];
    const crest: [number, number][] = [];
    for (let i = start; i <= Math.min(end, s.points.length - 1); i++) {
      const [lx, ly] = left[i];
      const [rx, ry] = right[i];
      const t = 0.5 + across * 0.92;
      const x = rx + (lx - rx) * t;
      const y = ry + (ly - ry) * t;
      const [nx, ny] = normals[i];
      groove.push([x, y]);
      crest.push([x + nx * 0.9, y + ny * 0.9]);
    }
    ctx.lineWidth = Math.max(0.6, (s.width / ridges) * 0.32);
    ctx.strokeStyle = ridgeDark;
    ctx.globalAlpha = (0.35 + r() * 0.3) * opacity;
    smoothLine(ctx, groove);
    if (relief > 0) {
      ctx.lineWidth = Math.max(0.5, (s.width / ridges) * 0.22);
      ctx.strokeStyle = LIGHT;
      ctx.globalAlpha = (0.08 + r() * 0.1) * relief;
      smoothLine(ctx, crest);
    }
  }

  if (relief > 0) {
    // The side whose normal points towards the light is lit; the other is in shade.
    const mid = normals[Math.floor(normals.length / 2)];
    const leftLit = mid[0] * LIGHT_DIR[0] + mid[1] * LIGHT_DIR[1] > 0;
    ctx.lineWidth = Math.max(0.8, s.width * 0.09);
    ctx.strokeStyle = LIGHT;
    ctx.globalAlpha = 0.22 * relief;
    smoothLine(ctx, leftLit ? left : right);
    ctx.strokeStyle = SHADOW;
    ctx.globalAlpha = 0.2 * relief;
    smoothLine(ctx, leftLit ? right : left);
  }
  ctx.globalAlpha = 1;
}

/** Paints a brush pattern as thick, textured oil paint on a faint canvas grain. */
export function drawBrush(ctx: CanvasRenderingContext2D, p: BrushPattern, width: number, height: number, c: BrushColours) {
  const rand = rng(p.seed * 31 + 5);
  const { mixes, mix } = palette(ctx, c);

  if (p.grain > 0) {
    // Canvas weave: a faint scatter of tiny dashes.
    ctx.fillStyle = c.ink;
    const dots = Math.round(((width * height) / 70) * p.grain);
    for (let i = 0; i < dots; i++) {
      ctx.globalAlpha = 0.015 + rand() * 0.03;
      ctx.fillRect(rand() * width, rand() * height, rand() < 0.5 ? 1.6 : 1, 1);
    }
  }

  ctx.lineJoin = "round";
  for (const s of brushStrokes(p, width, height)) {
    // Body: muted greys from the ink mixed into the background (more ink = more contrast); accents are the
    // accent colour mixed the same way. Ridges are the same paint, a step stronger.
    const inkPct = 12 + 40 * s.tone + (s.colour === 1 ? -6 : 0);
    const body = s.colour === 2 ? mix(c.lime, 70 + 20 * s.tone) : s.colour === 3 ? mix(c.pine, 70 + 20 * s.tone) : mix(c.ink, inkPct);
    const ridge = s.colour === 2 ? mix(c.lime, 100) : s.colour === 3 ? mix(c.pine, 100) : mix(c.ink, inkPct + 22);
    const opacity = mixes ? 0.96 : s.colour >= 2 ? 0.8 : 0.12 + 0.3 * s.tone;
    paintStroke(ctx, s, p, body, ridge, opacity);
  }
  ctx.globalAlpha = 1;
}
