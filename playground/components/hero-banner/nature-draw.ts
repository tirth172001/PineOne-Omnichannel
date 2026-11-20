import { fbm, type NaturePalette, type NaturePattern, naturePalette, noise, rng } from "./nature";

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

/**
 * One impasto dab: a tapered ribbon of paint along `pts`, a shaded edge on one side and a light ridge on the
 * other (lit from the top left), and a streak of a neighbouring tone inside it.
 */
function dab(ctx: Ctx, pts: Pt[], width: number, colour: string, streak: string, pal: NaturePalette, texture: number) {
  const n = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[Math.max(0, i - 1)];
    const [x1, y1] = pts[Math.min(n - 1, i + 1)];
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const t = i / (n - 1);
    // Fat in the middle, pointed at both ends, a little fuller where the brush lands.
    const w = (width / 2) * Math.max(0.12, Math.sin(Math.PI * Math.min(1, t * 0.9 + 0.08)) ** 0.7);
    left.push([pts[i][0] - ((y1 - y0) / len) * w, pts[i][1] + ((x1 - x0) / len) * w]);
    right.push([pts[i][0] + ((y1 - y0) / len) * w, pts[i][1] - ((x1 - x0) / len) * w]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (const [x, y] of left) ctx.lineTo(x, y);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
  if (texture <= 0) return;
  const line = (p: Pt[], style: string, lw: number) => {
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (const [x, y] of p) ctx.lineTo(x, y);
    ctx.strokeStyle = style;
    ctx.lineWidth = lw;
    ctx.stroke();
  };
  const mid = (a: Pt[], b: Pt[], k: number): Pt[] => a.map(([x, y], i) => [x + (b[i][0] - x) * k, y + (b[i][1] - y) * k]);
  line(mid(left, right, 0.45), streak, Math.max(0.6, width * 0.22));
  // Which edge faces the light (up-left)? Compare the left edge's offset with the light direction.
  const [lx, ly] = left[Math.floor(n / 2)];
  const [cx, cy] = pts[Math.floor(n / 2)];
  const leftLit = (lx - cx) * -1 + (ly - cy) * -1 > 0;
  line(mid(leftLit ? left : right, leftLit ? right : left, 0.18), pal.light(0.45 * texture), Math.max(0.5, width * 0.12));
  line(leftLit ? right : left, pal.dark(0.35 * texture), Math.max(0.5, width * 0.1));
}

type Vortex = { x: number; y: number; r: number; spin: number; bright: boolean };

/** A few vortices: one at the focus, the rest spread out; some have a bright, moon-like core. */
function vortices(p: NaturePattern, w: number, h: number, rand: () => number, size: number): Vortex[] {
  const count = Math.max(2, Math.round((w / h) * 1.1));
  const list: Vortex[] = [{ x: p.focusX * w, y: p.focusY * h, r: h * 0.55 * size, spin: 1, bright: true }];
  for (let i = 0; i < count; i++) {
    list.push({
      x: ((i + 0.5) / count) * w + (rand() - 0.5) * (w / count) * 0.6,
      y: h * (0.15 + rand() * 0.7),
      r: h * (0.3 + rand() * 0.35) * size,
      spin: rand() < 0.5 ? -1 : 1,
      bright: rand() < 0.3,
    });
  }
  return list;
}

function swirlField(vs: Vortex[], drift: number, seed: number, h: number) {
  return (x: number, y: number) => {
    let vx = Math.cos(drift) * 0.6;
    let vy = Math.sin(drift) * 0.6 + (noise(x / h, y / h, seed) - 0.5) * 0.8;
    for (const v of vs) {
      const dx = x - v.x;
      const dy = y - v.y;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.exp(-((d / v.r) ** 2)) * 2.2;
      vx += (-dy / d) * k * v.spin;
      vy += (dx / d) * k * v.spin;
    }
    return Math.atan2(vy, vx);
  };
}

// ——— Every pattern is painted with brush strokes ———
// Each pattern is a field: at any point, which tone to paint, which way the brush runs, and which shape the
// point belongs to (strokes stop at a shape's edge, so leaves, petals and cells stay crisp but painted).

type Sample = { t: number; a: number; id: number; glow?: number; c?: string };
type Field = (x: number, y: number) => Sample;
type Brush = { width: number; len: [number, number] };

function hashN(x: number, y: number, seed: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed + 1, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Follows the field from (x, y) while it stays on the same shape; keeps heading the same way (lines are ambiguous by half a turn). */
function traceField(x: number, y: number, steps: number, len: number, field: Field, id: number): Pt[] {
  const pts: Pt[] = [[x, y]];
  let dir = field(x, y).a;
  for (let s = 0; s < steps; s++) {
    const f = field(x, y);
    if (f.id !== id) break;
    let a = f.a;
    if (Math.cos(a - dir) < 0) a += Math.PI;
    dir = a;
    x += Math.cos(a) * len;
    y += Math.sin(a) * len;
    pts.push([x, y]);
  }
  if (pts.length < 2) pts.push([x + Math.cos(dir) * len, y + Math.sin(dir) * len]);
  return pts;
}

/** Paints a field with three layers of impasto dabs: a broad underpainting, the main strokes, then small highlights. */
/** A text box to fade the pattern around. */
export type FadeBox = { x: number; y: number; width: number; height: number };

/**
 * How much the pattern fades at (x, y), 0–1: 1 behind the text, easing (smoothstep) to 0 at the edge of an
 * ellipse well past it. Shared by the strokes (they thin out) and the ground under them.
 */
function fadeAt(box: FadeBox | null, w: number, h: number, clear: number) {
  if (!box || clear <= 0) return () => 0;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const rx = box.width / 2 + Math.min(w * 0.2, h * 1.2);
  const ry = box.height / 2 + h * 0.45;
  const core = Math.min(0.6, Math.max(box.width / 2 / rx, box.height / 2 / ry) * 0.8);
  return (x: number, y: number) => {
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
    if (d >= 1) return 0;
    const t = Math.max(0, (d - core) / (1 - core));
    return clear * (1 - t * t * (3 - 2 * t));
  };
}

function paintField(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number, field: Field, brush: Brush, ground: number, box: FadeBox | null) {
  const fade = fadeAt(box, w, h, p.clear);
  // The quiet tone the pattern fades towards: the banner's palest (light mode) or deepest (dark mode).
  const calm = pal.dim ? 0.3 : 4.8;
  ctx.fillStyle = pal.tone(ground);
  ctx.fillRect(0, 0, w, h);
  if (box && p.clear > 0) {
    // The ground under the fading strokes eases into the calm tone too, so gaps between strokes match.
    ctx.save();
    ctx.translate(box.x + box.width / 2, box.y + box.height / 2);
    ctx.scale(box.width / 2 + Math.min(w * 0.2, h * 1.2), box.height / 2 + h * 0.45);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      g.addColorStop(t, pal.tone(calm, p.clear * (1 - t * t * (3 - 2 * t))));
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const [pass, wide] of [
    [0, 1.7],
    [1, 1],
    [2, 0.6],
  ] as const) {
    const sw = Math.max(2.5, brush.width * (0.6 + 0.4 * p.scale) * wide);
    const gap = (sw * 0.85) / (0.45 + p.density * 0.55);
    for (let gy = -gap; gy < h + gap; gy += gap) {
      for (let gx = -gap; gx < w + gap; gx += gap) {
        if (pass === 2 && rand() > 0.55) continue;
        const x = gx + (rand() - 0.5) * gap * 1.5;
        const y = gy + (rand() - 0.5) * gap * 1.5;
        // Near the text the pattern thins out: fewer strokes, smaller, and their tone drawn towards the calm one.
        const f = fade(x, y);
        if (f > 0 && rand() < f ** 0.8 * 0.9) continue;
        const s = field(x, y);
        const t = (s.t + (rand() - 0.5) * 0.9 + (pass - 1) * 0.25) * (1 - f) + calm * f;
        const accent = !s.c && s.glow && pal.accents.length > 0 && rand() < s.glow * (1 - f);
        const colour = s.c && f < 0.5 && rand() < 0.85 ? s.c : accent ? pal.accents[Math.floor(rand() * pal.accents.length)] : pal.tone(t);
        const streak = s.c || accent ? pal.light(0.35) : pal.tone(t + (rand() < 0.5 ? -1 : 1), 0.7);
        const steps = 6;
        const len = (sw * (brush.len[0] + rand() * (brush.len[1] - brush.len[0]))) / steps;
        dab(ctx, traceField(x, y, steps, len * (1 - 0.4 * f), field, s.id), sw * (0.8 + rand() * 0.4) * (1 - 0.45 * f), colour, streak, pal, p.texture * (1 - f));
      }
    }
  }
}

/** Swirl: vortices, lighter towards bright cores where the accents gather. */
function swirlFieldOf(p: NaturePattern, w: number, h: number, rand: () => number): Field {
  const vs = vortices(p, w, h, rand, p.scale);
  const angle = swirlField(vs, -0.2, p.seed, h);
  return (x, y) => {
    let v = 0.25 + 0.5 * fbm(x / (h * 0.8), y / (h * 0.8), p.seed + 3);
    for (const c of vs) if (c.bright) v += 0.6 * Math.exp(-((Math.hypot(x - c.x, y - c.y) / (c.r * 0.45)) ** 2));
    v = Math.min(1, v);
    return { t: v * 5, a: angle(x, y), id: 0, glow: v > 0.62 ? (v - 0.55) * 1.1 : 0 };
  };
}

/** Ginkgo: rows of fan leaves opening upwards (lower rows on top). Strokes radiate from each stem, painting the veins. */
function ginkgoFieldOf(p: NaturePattern, w: number, h: number): Field {
  const R = h * 0.26 * p.scale;
  const dx = R * 1.18;
  const dy = R * (0.62 - 0.12 * p.density);
  const y0 = -R * 0.2;
  const spread = 0.98;
  const leaf = (j: number, i: number) => {
    const off = -dx + (((j % 2) + 2) % 2) * dx * 0.5;
    return {
      cx: off + i * dx + (hashN(i, j, p.seed) - 0.5) * R * 0.12,
      cy: y0 + j * dy + (hashN(i, j, p.seed + 1) - 0.5) * R * 0.08,
      r: R * (0.92 + hashN(i, j, p.seed + 2) * 0.14),
      tilt: (hashN(i, j, p.seed + 3) - 0.5) * 0.12,
      shade: 1 + hashN(i, j, p.seed + 4) * 3,
      off,
    };
  };
  return (x, y) => {
    const jHi = Math.floor((y + R * 1.05 - y0) / dy);
    const jLo = Math.ceil((y - y0) / dy) - 1;
    for (let j = jHi; j >= jLo; j--) {
      const off = -dx + (((j % 2) + 2) % 2) * dx * 0.5;
      const ic = Math.round((x - off) / dx);
      for (const i of [ic + 1, ic, ic - 1]) {
        const L = leaf(j, i);
        const ddx = x - L.cx;
        const ddy = y - L.cy;
        const d = Math.hypot(ddx, ddy);
        if (d > L.r * 1.03) continue;
        const rel = Math.atan2(ddy, ddx) - L.tilt + Math.PI / 2;
        if (Math.abs(rel) > spread) continue;
        const tt = (rel + spread) / (2 * spread);
        const notch = 1 - 0.16 * Math.exp(-(((tt - 0.5) / 0.03) ** 2));
        if (d > L.r * notch * (1 + 0.025 * Math.sin(tt * 70))) continue;
        const k = d / L.r;
        let t = L.shade - 1.2 + 1.5 * k;
        // The rim is painted along the edge (smooth fan outline); the rest radiates from the stem (veins).
        const rim = k > 0.84;
        if (rim) t += 0.5;
        if (Math.abs(tt - 0.5) < 0.012 && k > 0.72) t = 0.2;
        return { t, a: Math.atan2(ddy, ddx) + (rim ? Math.PI / 2 : 0), id: j * 1000 + i + (rim ? 0.5 : 0) };
      }
    }
    return { t: 0.2, a: noise(x / R, y / R, p.seed) * Math.PI * 2, id: -1 };
  };
}

/** Cells: rows of cells; strokes run along the walls, across the pale insides, and round each chloroplast. */
function cellsFieldOf(p: NaturePattern, w: number, h: number): Field {
  const rh = h * 0.3 * p.scale;
  const y0 = -rh * 0.4;
  const wallY = (k: number, x: number) => y0 + k * rh + Math.sin(x / (rh * 1.7) + k) * rh * 0.05;
  const cw = rh * 1.6;
  const g = rh * 0.17;
  return (x, y) => {
    let k = Math.floor((y - y0) / rh);
    if (y < wallY(k, x)) k--;
    else if (y >= wallY(k + 1, x)) k++;
    const top = wallY(k, x);
    const bot = wallY(k + 1, x);
    const v = (y - top) / (bot - top);
    const dW = Math.min(y - top, bot - y);
    if (dW < rh * 0.05) return { t: 0.15 + (dW / (rh * 0.05)) * 0.7, a: 0, id: -1 - k };
    const u = (x + k * cw * 0.37 + (v - 0.5) * rh * 0.08) / cw;
    const c = Math.floor(u);
    if (Math.min(u - c, 1 - (u - c)) * cw < rh * 0.02) return { t: 1, a: Math.PI / 2, id: -500 - k };
    const gi = Math.floor(x / g);
    const gj = Math.floor(y / g);
    for (let di = -1; di <= 1; di++) {
      for (let dj = -1; dj <= 1; dj++) {
        const a = gi + di;
        const b = gj + dj;
        const cx = (a + 0.5 + (hashN(a, b, p.seed) - 0.5) * 0.8) * g;
        const cy = (b + 0.5 + (hashN(a, b, p.seed + 1) - 0.5) * 0.8) * g;
        const cv = Math.min(1, Math.max(0, (cy - top) / (bot - top)));
        const near = 1 - Math.min(cv, 1 - cv) * 2;
        if (hashN(a, b, p.seed + 2) > (0.15 + 0.65 * near) * (0.5 + p.density * 0.6)) continue;
        const rr = g * (0.3 + hashN(a, b, p.seed + 3) * 0.2);
        const d = Math.hypot(x - cx, y - cy);
        if (d < rr) return { t: d > rr * 0.72 ? 1 : 2 + (d / rr) * 0.8, a: Math.atan2(y - cy, x - cx) + Math.PI / 2, id: 1e6 + a * 1000 + b };
      }
    }
    return { t: 4.5 + (noise(x / (rh * 0.4), y / (rh * 0.4), p.seed) - 0.5) * 0.8, a: (noise(x / rh, y / rh, p.seed + 5) - 0.5) * 0.5, id: k * 1000 + c };
  };
}

/** Bloom: overlapping flowers; strokes radiate along each petal, darker between petals, a dotted centre. */
function bloomFieldOf(p: NaturePattern, w: number, h: number, pal: NaturePalette): Field {
  const S = h * 0.42 * p.scale;
  const sp = S * (0.95 - 0.25 * p.density);
  const flower = (fi: number, fj: number) => {
    const acc = pal.accents.length > 0 && hashN(fi, fj, p.seed + 8) < 0.45;
    return {
      cx: (fi + 0.5 + (hashN(fi, fj, p.seed) - 0.5) * 0.6) * sp - S * 0.3,
      cy: (fj + 0.5 + (hashN(fi, fj, p.seed + 1) - 0.5) * 0.6) * sp - S * 0.3,
      r: S * (0.42 + hashN(fi, fj, p.seed + 2) * 0.3),
      n: 5 + Math.floor(hashN(fi, fj, p.seed + 3) * 5),
      turn: hashN(fi, fj, p.seed + 4) * Math.PI,
      order: hashN(fi, fj, p.seed + 5),
      base: 2.5 + hashN(fi, fj, p.seed + 6) * 2.5,
      c: acc ? pal.accents[Math.floor(hashN(fi, fj, p.seed + 7) * pal.accents.length)] : undefined,
      id: fi * 1000 + fj,
    };
  };
  return (x, y) => {
    const gi = Math.floor((x + S * 0.3) / sp);
    const gj = Math.floor((y + S * 0.3) / sp);
    let best: { F: ReturnType<typeof flower>; d: number; th: number; dx: number; dy: number } | null = null;
    for (let di = -2; di <= 2; di++) {
      for (let dj = -2; dj <= 2; dj++) {
        const F = flower(gi + di, gj + dj);
        const dx = x - F.cx;
        const dy = y - F.cy;
        const d = Math.hypot(dx, dy);
        if (d > F.r) continue;
        const th = Math.atan2(dy, dx) - F.turn;
        if (d > F.r * (0.55 + 0.45 * Math.abs(Math.cos((F.n * th) / 2)) ** 0.5)) continue;
        if (!best || F.order > best.F.order) best = { F, d, th, dx, dy };
      }
    }
    if (!best) return { t: 0.8 + (noise(x / S, y / S, p.seed) - 0.5) * 0.8, a: noise(x / S, y / S, p.seed + 3) * Math.PI * 2, id: -1 };
    const { F, d, th, dx, dy } = best;
    const k = d / F.r;
    if (k < 0.14) return { t: 0.4, a: Math.atan2(dy, dx) + Math.PI / 2, id: F.id + 0.5, c: hashN(Math.round(x), Math.round(y), 3) < 0.35 ? pal.light(0.9) : undefined };
    let t = F.base - 1.4 + 1.8 * k;
    if (Math.abs(Math.cos((F.n * th) / 2)) < 0.12 && k > 0.2) t -= 1.2;
    return { t, a: Math.atan2(dy, dx), id: F.id, c: F.c && k > 0.38 ? F.c : undefined };
  };
}

/** Silk: long strokes along the folds; bands of light and deep tone from a soft noise across them; sheen on the ridges. */
function silkFieldOf(p: NaturePattern, w: number, h: number): Field {
  const per = h * 1.2 * p.scale;
  const curve = (x: number) => (x / w) * h * -0.6 + Math.sin(x / per) * h * 0.18;
  const slope = (x: number) => (-0.6 * h) / w + (Math.cos(x / per) * h * 0.18) / per;
  return (x, y) => {
    const q = y - curve(x);
    const v = fbm(q / (h * 0.45 * p.scale) + 3, x / (w * 1.5), p.seed);
    const s = Math.min(1, Math.max(0, (v - 0.3) / 0.4));
    return { t: 0.4 + 4.6 * s * s * (3 - 2 * s), a: Math.atan(slope(x)), id: 0, glow: Math.abs(v - 0.62) < 0.012 ? 0.7 : 0 };
  };
}

/**
 * Etching: dark and pale bands that wrap round a few vortices (contours of a stream function), brushed along
 * the bands; pale ground with dark bands, inverted in dark mode.
 */
function etchingFieldOf(p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number): Field {
  const vs = vortices(p, w, h, rand, p.scale * 1.3);
  const psi = (x: number, y: number) => {
    let v = (y * Math.cos(0.3) - x * Math.sin(0.3)) / h + (fbm(x / h, y / h, p.seed + 5) - 0.5) * 0.5;
    for (const c of vs) v += c.spin * Math.exp(-((Math.hypot(x - c.x, y - c.y) / c.r) ** 2)) * 1.4 * (c.r / h);
    return v;
  };
  const bands = 7 / p.scale;
  return (x, y) => {
    const v0 = psi(x, y);
    const gx = psi(x + 1, y) - v0;
    const gy = psi(x, y + 1) - v0;
    const n = v0 * bands;
    const f = n - Math.floor(n);
    const dark = f < 0.45;
    const light = pal.dim ? 4.6 : 4.9;
    const deep = pal.dim ? 0.6 : 0.3;
    const edge = f < 0.05 || (f > 0.4 && f < 0.5);
    return { t: (dark !== pal.dim ? deep : light) + (edge ? (dark !== pal.dim ? 0.8 : -0.8) : 0), a: Math.atan2(gy, gx) + Math.PI / 2, id: dark ? 1 : 0 };
  };
}

const PATTERNS: Record<NaturePattern["pattern"], { brush: Brush; ground: number; field: (p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) => Field }> = {
  swirl: { brush: { width: 8, len: [4.5, 7.5] }, ground: 2, field: (p, w, h, _pal, rand) => swirlFieldOf(p, w, h, rand) },
  ginkgo: { brush: { width: 4.5, len: [2.2, 3.8] }, ground: 0, field: (p, w, h) => ginkgoFieldOf(p, w, h) },
  cells: { brush: { width: 4, len: [2, 3.5] }, ground: 4, field: (p, w, h) => cellsFieldOf(p, w, h) },
  silk: { brush: { width: 6, len: [8, 12] }, ground: 3, field: (p, w, h) => silkFieldOf(p, w, h) },
  bloom: { brush: { width: 5, len: [2.5, 4] }, ground: 1, field: (p, w, h, pal) => bloomFieldOf(p, w, h, pal) },
  etching: { brush: { width: 3.5, len: [5, 8] }, ground: 3, field: (p, w, h, pal, rand) => etchingFieldOf(p, w, h, pal, rand) },
};

/** Paints a nature pattern over the whole banner, entirely in brush strokes. `dim` = dark theme (deeper tones). */
export function drawNature(ctx: Ctx, p: NaturePattern, width: number, height: number, dim: boolean, box: FadeBox | null = null) {
  const pal = naturePalette(p.colour, p.harmony, dim);
  const rand = rng(p.seed * 7919 + 13);
  const def = PATTERNS[p.pattern];
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  paintField(ctx, p, width, height, pal, rand, def.field(p, width, height, pal, rand), def.brush, def.ground, box);
  ctx.restore();
  ctx.globalAlpha = 1;
}
