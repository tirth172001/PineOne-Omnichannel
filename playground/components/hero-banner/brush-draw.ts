import { PAINT_TEXTURE } from "@/lib/paint-texture";
import { type BrushPattern, brushStrokes, rng, type Stroke } from "./brush";
import type { PaintTexture } from "./texture";

/** Theme colours read off the canvas (CSS colour strings). `base` is what the banner's background looks like. */
export type BrushColours = { ink: string; muted: string; lime: string; pine: string; base: string };

/** The banner's colours from CSS tokens. The banner is `bg-muted/60`, so its visible base is muted over the page background. */
export function readColours(el: HTMLElement): BrushColours {
  const style = getComputedStyle(el);
  const v = (name: string) => style.getPropertyValue(name).trim();
  return {
    ink: v("--foreground"),
    muted: v("--muted-foreground"),
    base: `color-mix(in oklch, ${v("--muted")} 60%, ${v("--background")})`,
    lime: v("--hero-lime"),
    pine: v("--hero-pine"),
  };
}

/**
 * Lighting, not palette: the paint is lit from the top left. Shadows are black and highlights white in both
 * themes (that's how light behaves on a raised, glossy surface), so they aren't theme tokens.
 */
const SHADOW = "rgb(0 0 0)";
const LIGHT = "rgb(255 255 255)";
const LIGHT_DIR: [number, number] = [-Math.SQRT1_2, -Math.SQRT1_2];

/** One stroke's paint: `shade(k)` is the colour with more (k > 1) or less (k < 1) paint; `canvas` shows through holes. */
export type Paint = { shade: (k: number) => string; opacity: number; canvas: string };

/**
 * Paint for a colour role. Colours are opaque mixes into the banner background (so thin paint looks lighter,
 * like the references); where the canvas can't parse `color-mix`, plain colours at low opacity instead.
 */
export function makePaint(ctx: CanvasRenderingContext2D, c: BrushColours, role: Stroke["colour"], tone: number): Paint {
  const probe = "#010203";
  ctx.fillStyle = probe;
  ctx.fillStyle = `color-mix(in oklch, ${c.ink} 30%, ${c.base})`;
  const mixes = ctx.fillStyle !== probe;
  const mix = (colour: string, pct: number) => `color-mix(in oklch, ${colour} ${Math.round(Math.min(100, Math.max(0, pct)))}%, ${c.base})`;
  if (role >= 2) {
    const hue = role === 2 ? c.lime : c.pine;
    const pct = 72 + 20 * tone;
    return {
      shade: (k) => (!mixes ? hue : k <= 1 ? mix(hue, pct * k) : `color-mix(in oklch, ${hue} ${Math.round(100 - (k - 1) * 70)}%, black)`),
      opacity: mixes ? 0.97 : 0.8,
      canvas: c.base,
    };
  }
  const pct = 14 + 40 * tone + (role === 1 ? -6 : 0);
  return { shade: (k) => (mixes ? mix(c.ink, pct * k) : c.ink), opacity: mixes ? 0.97 : 0.12 + 0.3 * tone, canvas: c.base };
}

type Ribbon = { left: [number, number][]; right: [number, number][]; normals: [number, number][] };

/** Edges of a ribbon round a centre line: a round blob where the brush lands, then thinning as the paint runs out. */
function ribbon(pts: [number, number][], width: number, r: () => number): Ribbon {
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  const normals: [number, number][] = [];
  const n = pts.length;
  const swell = 0.88 + r() * 0.24;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[Math.max(0, i - 1)];
    const [x1, y1] = pts[Math.min(n - 1, i + 1)];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / len;
    const ny = (x1 - x0) / len;
    const t = i / (n - 1);
    const w = (width / 2) * swell * (1.02 - 0.5 * t ** 1.5) * (0.94 + r() * 0.12);
    left.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    right.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
    normals.push([nx, ny]);
  }
  return { left, right, normals };
}

/** A point at fractional index `i` along the ribbon, `t` across it (0 = right edge, 1 = left edge). */
function at(rb: Ribbon, i: number, t: number): [number, number] {
  const last = rb.left.length - 1;
  const i0 = Math.max(0, Math.min(last, Math.floor(i)));
  const i1 = Math.min(last, i0 + 1);
  const f = Math.max(0, Math.min(1, i - i0));
  const lx = rb.left[i0][0] + (rb.left[i1][0] - rb.left[i0][0]) * f;
  const ly = rb.left[i0][1] + (rb.left[i1][1] - rb.left[i0][1]) * f;
  const rx = rb.right[i0][0] + (rb.right[i1][0] - rb.right[i0][0]) * f;
  const ry = rb.right[i0][1] + (rb.right[i1][1] - rb.right[i0][1]) * f;
  return [rx + (lx - rx) * t, ry + (ly - ry) * t];
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

/** A line along the ribbon at `t` across, from index `a` to `b`, sampled finely. */
function lineAlong(rb: Ribbon, a: number, b: number, t: number, offset = 0): [number, number][] {
  const out: [number, number][] = [];
  const step = Math.max(0.25, (b - a) / 40);
  for (let i = a; i <= b + 1e-6; i += step) {
    const [x, y] = at(rb, i, t);
    const n = rb.normals[Math.min(rb.normals.length - 1, Math.round(i))];
    out.push([x + n[0] * offset, y + n[1] * offset]);
  }
  return out;
}

export type StrokeLook = { bristles: number; relief: number; texture: PaintTexture };

/**
 * One stroke of thick oil paint, in layers:
 * 1. cast shadow (relief); 2. the opaque body, with a round blob where the brush lands;
 * 3. streaks of denser and thinner paint along it, lighter towards the end (thinning);
 * 4. grooves between the ridges and wet gloss on them; 5. the raised lip and lit/shaded rims;
 * 6. the dry end: bristle streaks that lift off one by one and break up, paint specks round it,
 *    and bare-canvas flecks eaten into the paint.
 */
export function paintStroke(ctx: CanvasRenderingContext2D, s: Stroke, look: StrokeLook, paint: Paint) {
  const r = rng(s.seed);
  const tex = look.texture;
  const rb = ribbon(s.points, s.width, r);
  const N = s.points.length - 1;
  const solid = Math.max(2, Math.min(N, Math.round(N * (0.88 - 0.38 * tex.dryness + (r() - 0.5) * 0.12))));
  // The opaque body stops a little short of `solid`; the bristles leave it at staggered points (6a), so the
  // change from solid paint to dry streaks is gradual, not a straight edge.
  const bodyEnd = Math.max(2, solid - 2);
  const bodyL = rb.left.slice(0, bodyEnd + 1);
  const bodyR = rb.right.slice(0, bodyEnd + 1);
  // Specks and flecks stay fine at any stroke width (references: grains of paint, not blobs).
  const unit = Math.min(1.8, Math.max(0.7, s.width / 40));
  const [sx, sy] = s.points[0];
  const r0 = Math.hypot(rb.left[0][0] - rb.right[0][0], rb.left[0][1] - rb.right[0][1]) / 2;
  // The rounded end where the brush landed: a half circle behind the start (facing back along the stroke).
  const back = Math.atan2(s.points[0][1] - s.points[1][1], s.points[0][0] - s.points[1][0]);
  const cap = (dx = 0, dy = 0) => {
    ctx.beginPath();
    ctx.ellipse(sx + dx, sy + dy, r0, r0, back, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  };
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1. Cast shadow.
  if (look.relief > 0) {
    const lift = Math.max(0.8, Math.min(4, s.width * 0.1)) * (0.4 + look.relief);
    ctx.fillStyle = SHADOW;
    for (const [k, a] of [
      [1, 0.16],
      [1.9, 0.08],
    ] as const) {
      ctx.globalAlpha = a * look.relief;
      fillRibbon(ctx, bodyL, bodyR, lift * k, lift * k);
      cap(lift * k, lift * k);
    }
  }

  // 2. Body.
  ctx.fillStyle = paint.shade(1);
  ctx.globalAlpha = paint.opacity;
  fillRibbon(ctx, bodyL, bodyR);
  cap();

  // 3. Streaks: each bristle laid a slightly different amount of paint; thinner (lighter) towards the end.
  if (tex.streaks > 0) {
    const count = Math.max(5, Math.min(90, Math.round(s.width / 1.6)));
    for (let b = 0; b < count; b++) {
      const t = Math.min(0.97, Math.max(0.03, (b + 0.5) / count + ((r() - 0.5) * 0.6) / count));
      const a = r() * N * 0.03;
      const e = Math.max(a + 1, solid * (0.6 + r() * 0.4));
      const base = 0.62 + r() * 0.75;
      ctx.lineWidth = Math.max(0.5, (s.width / count) * (0.6 + r() * 0.9));
      ctx.globalAlpha = tex.streaks * (0.35 + r() * 0.45) * paint.opacity;
      for (let piece = 0; piece < 3; piece++) {
        const pa = a + ((e - a) * piece) / 3;
        const pb = a + ((e - a) * (piece + 1)) / 3;
        ctx.strokeStyle = paint.shade(base - tex.thinning * 0.5 * (pb / Math.max(1, N)));
        smoothLine(ctx, lineAlong(rb, pa, pb, t));
      }
    }
  }

  // 3b. The rounded end gets curved streaks too (paint pushed round the edge), so it isn't a flat cap.
  if (tex.streaks > 0) {
    const rings = Math.max(3, Math.round(r0 / 3));
    for (let k = 0; k < rings; k++) {
      const radius = r0 * (0.25 + (0.7 * (k + r())) / rings);
      ctx.lineWidth = Math.max(0.5, (r0 / rings) * (0.5 + r() * 0.7));
      ctx.strokeStyle = paint.shade(0.62 + r() * 0.75);
      ctx.globalAlpha = tex.streaks * (0.35 + r() * 0.45) * paint.opacity;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, back - Math.PI / 2 + 0.15, back + Math.PI / 2 - 0.15);
      ctx.stroke();
    }
  }

  // 4. Grooves and gloss: ridges dragged by the bristles; the wet tops of the ridges catch the light.
  const ridges = Math.max(look.bristles, Math.round(s.width / 3.5));
  const mid = rb.normals[Math.floor(rb.normals.length / 2)];
  const leftLit = mid[0] * LIGHT_DIR[0] + mid[1] * LIGHT_DIR[1] > 0;
  for (let b = 0; b < ridges; b++) {
    const t = Math.min(0.95, Math.max(0.05, (b + 0.5) / ridges + ((r() - 0.5) * 0.3) / ridges));
    const a = r() * N * 0.03;
    const e = Math.max(a + 1, solid * (0.5 + r() * 0.5));
    if (tex.grooves > 0) {
      ctx.lineWidth = Math.max(0.5, (s.width / ridges) * 0.16);
      ctx.strokeStyle = SHADOW;
      ctx.globalAlpha = tex.grooves * (0.12 + r() * 0.2);
      smoothLine(ctx, lineAlong(rb, a, e, t));
    }
    if (tex.gloss > 0) {
      // Brighter on the half facing the light; one or two glints per ridge, not the whole length.
      const litSide = leftLit ? t : 1 - t;
      const glints = 1 + Math.floor(r() * 3);
      for (let g = 0; g < glints; g++) {
        const ga = a + r() * (e - a) * 0.6;
        const gb = Math.min(e, ga + (e - a) * (0.15 + r() * 0.35));
        ctx.lineWidth = Math.max(0.4, (s.width / ridges) * (0.08 + r() * 0.1));
        ctx.strokeStyle = LIGHT;
        ctx.globalAlpha = tex.gloss * (0.2 + 0.7 * litSide) * (0.45 + r() * 0.55);
        smoothLine(ctx, lineAlong(rb, ga, gb, t, leftLit ? 0.6 : -0.6));
      }
    }
  }

  // 5. Lip and rims: the raised edge where the brush landed, a lit rim on the side facing the light and a
  //    shaded rim on the other.
  if (tex.lip > 0) {
    const toLight = Math.atan2(LIGHT_DIR[1], LIGHT_DIR[0]);
    ctx.lineWidth = Math.max(1, s.width * 0.05);
    ctx.strokeStyle = LIGHT;
    ctx.globalAlpha = tex.lip * 0.45;
    // The lip: a ridge of paint just inside the rounded end, lit where it faces the light.
    const capArc = (radius: number, from: number, to: number) => {
      ctx.beginPath();
      ctx.arc(sx, sy, radius, from, to);
      ctx.stroke();
    };
    const lo = back - Math.PI / 2;
    const hi = back + Math.PI / 2;
    const clampArc = (a: number, b: number): [number, number] => [Math.max(lo, Math.min(hi, a)), Math.max(lo, Math.min(hi, b))];
    const near = (a: number) => back + Math.atan2(Math.sin(a - back), Math.cos(a - back));
    const [l0, l1] = clampArc(near(toLight) - 1, near(toLight) + 1);
    if (l1 > l0) capArc(r0 * 0.82, l0, l1);
    ctx.strokeStyle = SHADOW;
    ctx.globalAlpha = tex.lip * 0.3;
    const [d0, d1] = clampArc(near(toLight + Math.PI) - 1, near(toLight + Math.PI) + 1);
    if (d1 > d0) capArc(r0 * 0.96, d0, d1);
    ctx.lineWidth = Math.max(0.8, s.width * 0.06);
    ctx.strokeStyle = LIGHT;
    ctx.globalAlpha = tex.lip * 0.3;
    smoothLine(ctx, leftLit ? bodyL : bodyR);
    ctx.strokeStyle = SHADOW;
    ctx.globalAlpha = tex.lip * 0.25;
    smoothLine(ctx, leftLit ? bodyR : bodyL);
  }

  // 6a. Dry end: bristle-wide streaks that lift off one by one and skip more the further they go.
  const n = Math.max(6, Math.round(s.width / 1.8));
  ctx.lineCap = "butt";
  ctx.lineWidth = (s.width / n) * 1.35;
  for (let b = 0; b < n; b++) {
    const t = (b + 0.5) / n;
    const end = solid + (N - solid) * (0.3 + r() * 0.7);
    const from = bodyEnd - 1 - r() * 2;
    ctx.strokeStyle = paint.shade(0.8 + r() * 0.3 - tex.thinning * 0.35);
    ctx.globalAlpha = paint.opacity * (0.7 + r() * 0.3);
    ctx.beginPath();
    let drawing = false;
    let on = true;
    for (let i = from; i <= end; i += 0.2) {
      const dry = Math.max(0, (i - solid) / Math.max(0.01, end - solid));
      // Runs of paint that break off and pick up again, breaking more often as the bristle dries.
      if (on && r() < 0.04 + dry * 0.22) on = false;
      else if (!on && r() < 0.45 * (1 - dry)) on = true;
      if (!on) {
        drawing = false;
        continue;
      }
      const [x, y] = at(rb, i, t);
      if (!drawing) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      drawing = true;
    }
    ctx.stroke();
  }
  ctx.lineCap = "round";

  // 6b. Specks of paint flicked round the dry end and just past the edges.
  const span = N - solid + 3;
  const specks = Math.min(600, Math.round(tex.specks * span * s.width * 0.35));
  ctx.fillStyle = paint.shade(0.95);
  for (let k = 0; k < specks; k++) {
    const i = solid - 1 + r() * span;
    const dry = Math.max(0, (i - solid) / Math.max(1, N - solid));
    const t = 0.5 + (r() - 0.5) * (1.15 + 0.35 * dry);
    if (r() > 0.25 + dry) continue;
    const [x, y] = at(rb, Math.min(N, i), t);
    ctx.globalAlpha = paint.opacity * (0.6 + r() * 0.4);
    ctx.beginPath();
    ctx.arc(x + (r() - 0.5) * unit * 4, y + (r() - 0.5) * unit * 4, (0.3 + r() ** 3 * 1.6) * unit, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6c. Bare-canvas flecks eaten into the paint, thickest towards the dry end and along the edges.
  const holes = Math.min(600, Math.round(tex.holes * (N - solid * 0.75 + 2) * s.width * 0.4));
  ctx.fillStyle = paint.canvas;
  ctx.globalAlpha = 1;
  for (let k = 0; k < holes; k++) {
    const i = solid * 0.75 + r() * (N - solid * 0.75);
    const edge = r() < 0.5;
    const t = edge ? (r() < 0.5 ? r() * 0.2 : 1 - r() * 0.2) : 0.1 + r() * 0.8;
    const dry = Math.max(0, (i - solid * 0.75) / Math.max(1, N - solid * 0.75));
    if (r() > 0.2 + dry * (edge ? 1 : 0.6)) continue;
    const [x, y] = at(rb, i, t);
    ctx.beginPath();
    ctx.ellipse(x, y, (0.4 + r() ** 2 * 2.2) * unit, (0.3 + r() * 0.8) * unit, r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Paints a brush pattern as thick oil paint on a faint canvas grain. `texture` defaults to the shared PAINT_TEXTURE. */
export function drawBrush(ctx: CanvasRenderingContext2D, p: BrushPattern, width: number, height: number, c: BrushColours, texture: PaintTexture = PAINT_TEXTURE) {
  const rand = rng(p.seed * 31 + 5);

  if (p.grain > 0) {
    ctx.fillStyle = c.ink;
    const dots = Math.round(((width * height) / 70) * p.grain);
    for (let i = 0; i < dots; i++) {
      ctx.globalAlpha = 0.015 + rand() * 0.03;
      ctx.fillRect(rand() * width, rand() * height, rand() < 0.5 ? 1.6 : 1, 1);
    }
  }

  const look: StrokeLook = { bristles: p.bristles, relief: p.relief, texture };
  for (const s of brushStrokes(p, width, height)) paintStroke(ctx, s, look, makePaint(ctx, c, s.colour, s.tone));
  ctx.globalAlpha = 1;
}
