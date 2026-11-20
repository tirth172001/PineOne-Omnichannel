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

/** Follows a direction field from (x, y) for `steps` steps of `len`, returning the path. */
function trace(x: number, y: number, steps: number, len: number, angle: (x: number, y: number) => number): Pt[] {
  const pts: Pt[] = [[x, y]];
  for (let s = 0; s < steps; s++) {
    const a = angle(x, y);
    x += Math.cos(a) * len;
    y += Math.sin(a) * len;
    pts.push([x, y]);
  }
  return pts;
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

/** Swirl: dense layers of short impasto strokes following several vortices, lighter towards bright cores. */
function paintSwirl(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) {
  ctx.fillStyle = pal.tone(2);
  ctx.fillRect(0, 0, w, h);
  const vs = vortices(p, w, h, rand, p.scale);
  const field = swirlField(vs, -0.2, p.seed, h);
  const value = (x: number, y: number) => {
    let v = 0.25 + 0.5 * fbm(x / (h * 0.8), y / (h * 0.8), p.seed + 3);
    for (const c of vs) if (c.bright) v += 0.6 * Math.exp(-((Math.hypot(x - c.x, y - c.y) / (c.r * 0.45)) ** 2));
    return Math.min(1, v);
  };
  for (const [pass, wide] of [[0, 1.6], [1, 1], [2, 0.7]] as const) {
    const sw = Math.max(3, 8 * p.scale * wide);
    const gap = (sw * 0.9) / (0.4 + p.density * 0.6);
    for (let gy = -gap; gy < h + gap; gy += gap) {
      for (let gx = -gap; gx < w + gap; gx += gap) {
        if (pass === 2 && rand() > 0.5) continue;
        const x = gx + (rand() - 0.5) * gap * 1.6;
        const y = gy + (rand() - 0.5) * gap * 1.6;
        const v = value(x, y);
        const idx = Math.max(0, Math.min(5, v * 5 + (rand() - 0.5) * 1.6 + (pass - 1) * 0.5));
        // Accents gather in the bright cores (like the moons in the references), not scattered.
        const accent = pal.accents.length > 0 && v > 0.62 && rand() < (v - 0.55) * (pass === 2 ? 1.4 : 0.8);
        const colour = accent ? pal.accents[Math.floor(rand() * pal.accents.length)] : pal.tone(idx);
        const pts = trace(x, y, 8, (sw * (4.5 + rand() * 3)) / 8, field);
        dab(ctx, pts, sw * (0.8 + rand() * 0.4), colour, pal.tone(idx + (rand() < 0.5 ? -1 : 1), 0.7), pal, p.texture);
      }
    }
  }
}

/** Ginkgo: rows of fan-shaped leaves opening upwards, each row overlapping the bases of the row above. */
function paintGinkgo(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) {
  ctx.fillStyle = pal.tone(0);
  ctx.fillRect(0, 0, w, h);
  const R = h * 0.26 * p.scale;
  const dx = R * 1.18;
  const dy = R * (0.62 - 0.12 * p.density);
  const spread = 0.98;
  let row = 0;
  for (let cy = -R * 0.2; cy < h + R * 1.2; cy += dy, row++) {
    for (let cx = -dx + (row % 2) * dx * 0.5; cx < w + dx; cx += dx) {
      const x = cx + (rand() - 0.5) * R * 0.12;
      const y = cy + (rand() - 0.5) * R * 0.08;
      const r = R * (0.92 + rand() * 0.14);
      const tilt = (rand() - 0.5) * 0.12;
      const shade = 1 + rand() * 3;
      const a0 = -Math.PI / 2 - spread + tilt;
      const a1 = -Math.PI / 2 + spread + tilt;
      const edge: Pt[] = [];
      const steps = 36;
      for (let i = 0; i <= steps; i++) {
        const a = a0 + ((a1 - a0) * i) / steps;
        const t = i / steps;
        // A wavy outer edge with the ginkgo's notch in the middle.
        const notch = 1 - 0.16 * Math.exp(-(((t - 0.5) / 0.03) ** 2));
        const rr = r * notch * (1 + 0.025 * Math.sin(i * 1.9 + x));
        edge.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
      }
      ctx.save();
      ctx.shadowColor = pal.dark(0.5);
      ctx.shadowBlur = R * 0.12;
      ctx.shadowOffsetY = R * 0.04;
      const g = ctx.createRadialGradient(x, y, r * 0.05, x, y, r);
      g.addColorStop(0, pal.tone(shade - 1));
      g.addColorStop(0.7, pal.tone(shade));
      g.addColorStop(1, pal.tone(shade + 0.6));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (const [ex, ey] of edge) ctx.lineTo(ex, ey);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      if (p.texture > 0) {
        // Fine veins fanning out from the stem, and the notch's split.
        ctx.lineWidth = Math.max(0.4, R * 0.008);
        for (let i = 0; i <= steps; i += 1.5) {
          const [ex, ey] = edge[Math.min(steps, Math.round(i))];
          ctx.strokeStyle = i % 3 < 1.5 ? pal.dark(0.1 * p.texture) : pal.light(0.1 * p.texture);
          ctx.beginPath();
          ctx.moveTo(x + (ex - x) * 0.12, y + (ey - y) * 0.12);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
        const [nx, ny] = edge[steps / 2];
        ctx.strokeStyle = pal.dark(0.45 * p.texture);
        ctx.lineWidth = Math.max(0.6, R * 0.015);
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(x + (nx - x) * 0.72, y + (ny - y) * 0.72);
        ctx.stroke();
        ctx.strokeStyle = pal.light(0.25 * p.texture);
        ctx.beginPath();
        edge.forEach(([ex, ey], i) => (i ? ctx.lineTo(ex, ey) : ctx.moveTo(ex, ey)));
        ctx.stroke();
      }
    }
  }
}

/** Cells: rows of rectangular plant cells with thick walls between rows and chloroplasts clustered inside. */
function paintCells(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) {
  ctx.fillStyle = pal.tone(5);
  ctx.fillRect(0, 0, w, h);
  const rh = h * 0.3 * p.scale;
  const rows: number[] = [];
  for (let y = -rh * 0.4; y < h + rh; y += rh * (0.9 + rand() * 0.2)) rows.push(y);
  const wave = (x: number, y0: number) => y0 + Math.sin(x / (rh * 1.7) + y0) * rh * 0.05;
  for (let r = 0; r < rows.length - 1; r++) {
    const top = rows[r];
    const bottom = rows[r + 1];
    let x = -rand() * rh;
    while (x < w + rh) {
      const cw = rh * (1.1 + rand() * 1.1);
      const x0 = x;
      const x1 = x + cw;
      // A pale wash inside the cell, then chloroplasts crowding towards the walls.
      ctx.fillStyle = pal.tone(4, 0.55);
      ctx.fillRect(x0 + 2, wave(x0, top) + 3, cw - 4, bottom - top - 6);
      const n = Math.round(p.density * cw * (bottom - top) / (rh * rh) * 26);
      for (let k = 0; k < n; k++) {
        const near = rand() < 0.75;
        const cx = x0 + 4 + rand() * (cw - 8);
        const cy = near ? (rand() < 0.5 ? top + 6 + rand() * rh * 0.2 : bottom - 6 - rand() * rh * 0.2) : top + 6 + rand() * (bottom - top - 12);
        const rr = rh * (0.045 + rand() * 0.05);
        const soft = rand() < 0.3;
        ctx.fillStyle = pal.tone(1 + rand() * 2, soft ? 0.35 : 0.8);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr * (soft ? 1.4 : 1), rr * (soft ? 1.2 : 0.8), rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
        if (!soft && p.texture > 0) {
          ctx.strokeStyle = pal.dark(0.4 * p.texture);
          ctx.lineWidth = Math.max(0.5, rr * 0.15);
          ctx.stroke();
          ctx.fillStyle = pal.light(0.35 * p.texture);
          ctx.beginPath();
          ctx.arc(cx - rr * 0.3, cy - rr * 0.25, rr * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Thin wall between neighbouring cells, slightly slanted.
      ctx.strokeStyle = pal.tone(1, 0.75);
      ctx.lineWidth = Math.max(1, rh * 0.012);
      ctx.beginPath();
      ctx.moveTo(x1, wave(x1, top));
      ctx.lineTo(x1 + (rand() - 0.5) * rh * 0.2, wave(x1, bottom));
      ctx.stroke();
      x = x1;
    }
  }
  // Thick walls between the rows, blurred a little like an out-of-focus layer.
  for (const y0 of rows) {
    for (const [lw, a] of [[rh * 0.12, 0.25], [rh * 0.06, 0.5], [rh * 0.025, 0.9]] as const) {
      ctx.strokeStyle = pal.tone(0, a);
      ctx.lineWidth = Math.max(1, lw);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const y = wave(x, y0);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

/** Silk: soft blended bands (layered translucent strokes, so it blurs without canvas filters) and a fine ripple. */
function paintSilk(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) {
  // A pale ground with deeper folds; in dark mode a deep ground with lighter folds, so the bands always show.
  ctx.fillStyle = pal.tone(pal.dim ? 1 : 4);
  ctx.fillRect(0, 0, w, h);
  const band = (offset: number, colour: (a: number) => string, thick: number) => {
    const path = () => {
      ctx.beginPath();
      for (let x = -40; x <= w + 40; x += 12) {
        const y = offset + (x / w) * h * -0.6 + Math.sin(x / (h * 1.2 * p.scale) + offset) * h * 0.18;
        if (x === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    };
    for (let k = 24; k >= 1; k--) {
      path();
      ctx.strokeStyle = colour(0.05);
      ctx.lineWidth = thick * (k / 24) ** 0.8;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  };
  const count = 6 + Math.round(p.density * 4);
  for (let i = 0; i < count; i++) {
    const off = -h * 0.4 + ((i + rand() * 0.6) / count) * h * 2;
    const pick = rand();
    const t = pal.dim ? (pick < 0.5 ? 3 + rand() * 2 : rand()) : pick < 0.5 ? rand() * 1.6 : 4 + rand();
    const colour = pick > 0.85 && pal.accents.length ? (a: number) => pal.light(a * 1.6) : (a: number) => pal.tone(t, a * 1.8);
    band(off, colour, h * (0.35 + rand() * 0.5) * p.scale);
  }
  if (p.texture > 0) {
    // Fine ripples running with the folds.
    const n = Math.round(((w * h) / 45) * p.texture);
    ctx.lineWidth = 0.6;
    for (let k = 0; k < n; k++) {
      const x = rand() * w;
      const y = rand() * h;
      const a = -0.55 + (noise(x / h, y / h, p.seed) - 0.5) * 0.8;
      const len = 3 + rand() * 4;
      ctx.strokeStyle = rand() < 0.5 ? pal.dark(0.07) : pal.light(0.12);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 - Math.sin(a) * 1.2, y + Math.sin(a) * len * 0.5 + Math.cos(a) * 1.2, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    // A few long sheen lines along the folds.
    for (let k = 0; k < 4; k++) {
      const off = rand() * h * 1.6 - h * 0.3;
      ctx.strokeStyle = pal.light(0.3 * p.texture);
      ctx.lineWidth = 1 + rand() * 1.5;
      ctx.beginPath();
      for (let x = -20; x <= w + 20; x += 10) {
        const y = off + (x / w) * h * -0.6 + Math.sin(x / (h * 1.2 * p.scale) + off) * h * 0.18;
        if (x === -20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

/** Bloom: overlapping flowers with layered petals, on a deep ground. */
function paintBloom(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) {
  ctx.fillStyle = pal.tone(1);
  ctx.fillRect(0, 0, w, h);
  const S = h * 0.42 * p.scale;
  const spots: [number, number][] = [];
  for (let y = -S * 0.3; y < h + S * 0.5; y += S * (0.95 - p.density * 0.25)) {
    for (let x = -S * 0.3; x < w + S * 0.5; x += S * (0.95 - p.density * 0.25)) spots.push([x + (rand() - 0.5) * S * 0.6, y + (rand() - 0.5) * S * 0.6]);
  }
  spots.sort(() => rand() - 0.5);
  for (const [x, y] of spots) {
    const r = S * (0.42 + rand() * 0.3);
    const petals = 5 + Math.floor(rand() * 5);
    const turn = rand() * Math.PI;
    const useAccent = pal.accents.length > 0 && rand() < 0.45;
    const accent = useAccent ? pal.accents[Math.floor(rand() * pal.accents.length)] : null;
    const base = 2.5 + rand() * 2.5;
    // Two rings of petals: outer, then a smaller inner ring turned half a petal.
    for (const [ring, rr] of [[0, 1], [1, 0.62]] as const) {
      for (let k = 0; k < petals; k++) {
        const a = turn + ((k + ring * 0.5) / petals) * Math.PI * 2;
        const len = r * rr * (0.9 + rand() * 0.2);
        const wid = len * (0.42 + 2.2 / petals) * 0.5;
        const tipX = x + Math.cos(a) * len;
        const tipY = y + Math.sin(a) * len;
        const nx = -Math.sin(a);
        const ny = Math.cos(a);
        ctx.save();
        ctx.shadowColor = pal.dark(0.35);
        ctx.shadowBlur = r * 0.12;
        const g = ctx.createLinearGradient(x, y, tipX, tipY);
        g.addColorStop(0, pal.tone(base - 1.5 + ring));
        g.addColorStop(1, accent ?? pal.tone(base + ring * 0.5));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + Math.cos(a) * len * 0.4 + nx * wid, y + Math.sin(a) * len * 0.4 + ny * wid, tipX + nx * wid * 0.6, tipY + ny * wid * 0.6, tipX, tipY);
        ctx.bezierCurveTo(tipX - nx * wid * 0.6, tipY - ny * wid * 0.6, x + Math.cos(a) * len * 0.4 - nx * wid, y + Math.sin(a) * len * 0.4 - ny * wid, x, y);
        ctx.fill();
        ctx.restore();
        if (p.texture > 0) {
          ctx.strokeStyle = pal.dark(0.15 * p.texture);
          ctx.lineWidth = Math.max(0.5, r * 0.01);
          for (const off of [-0.35, 0, 0.35]) {
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * len * 0.15, y + Math.sin(a) * len * 0.15);
            ctx.lineTo(tipX - Math.cos(a) * len * 0.1 + nx * wid * off, tipY - Math.sin(a) * len * 0.1 + ny * wid * off);
            ctx.stroke();
          }
        }
      }
    }
    // The flower's centre: a cluster of small dots.
    for (let k = 0; k < 14; k++) {
      const a = rand() * Math.PI * 2;
      const d = rand() * r * 0.14;
      ctx.fillStyle = k % 3 ? pal.tone(0, 0.85) : pal.light(0.8);
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.025 + rand() * 0.02), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Etching: dry-brush swirls in a dark tone over a pale ground, with a woven texture across everything. */
function paintEtching(ctx: Ctx, p: NaturePattern, w: number, h: number, pal: NaturePalette, rand: () => number) {
  // Light ground with dark marks; in dark mode, a deep ground with pale marks.
  ctx.fillStyle = pal.tone(pal.dim ? 1 : 5);
  ctx.fillRect(0, 0, w, h);
  const vs = vortices(p, w, h, rand, p.scale * 1.3);
  const field = swirlField(vs, 0.3, p.seed, h * 1.4);
  const value = (x: number, y: number) => fbm(x / (h * 0.7 * p.scale), y / (h * 0.7 * p.scale), p.seed + 5);
  const lines = Math.round(((w * h) / 26) * p.density);
  ctx.lineCap = "round";
  for (let k = 0; k < lines; k++) {
    const x = rand() * w;
    const y = rand() * h;
    const v = value(x, y);
    // Darker regions get far more marks: the shapes come from where the brush pressed.
    if (rand() > (v - 0.36) * 3) continue;
    const pts = trace(x, y, 12, 5 + rand() * 5, field);
    const mark = pal.dim ? 4 + rand() : rand() < 0.7 ? 0 : 1;
    const width = 1.6 + rand() * 3.6;
    // A dry brush: three bristles side by side, each skipping on its own.
    for (const off of [-0.33, 0, 0.33]) {
      ctx.strokeStyle = pal.tone(mark, 0.3 + rand() * 0.45);
      ctx.lineWidth = width * 0.3;
      ctx.beginPath();
      let on = true;
      pts.forEach(([px, py], i) => {
        const [qx, qy] = pts[Math.min(pts.length - 1, i + 1)];
        const len = Math.hypot(qx - px, qy - py) || 1;
        const ox = (-(qy - py) / len) * width * off;
        const oy = ((qx - px) / len) * width * off;
        if (rand() < 0.12) on = !on;
        if (i === 0 || !on) ctx.moveTo(px + ox, py + oy);
        else ctx.lineTo(px + ox, py + oy);
      });
      ctx.stroke();
    }
  }
  if (p.texture > 0) {
    // Woven texture: broken horizontal threads, light and dark.
    for (let y = 0; y < h; y += 2) {
      ctx.setLineDash([2 + rand() * 6, 1 + rand() * 5]);
      ctx.strokeStyle = y % 4 ? pal.light(0.18 * p.texture) : pal.dark(0.08 * p.texture);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-rand() * 8, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

const PAINTERS = { swirl: paintSwirl, ginkgo: paintGinkgo, cells: paintCells, silk: paintSilk, bloom: paintBloom, etching: paintEtching };

/** Paints a nature pattern over the whole banner. `dim` = dark theme (deeper tones). */
export function drawNature(ctx: Ctx, p: NaturePattern, width: number, height: number, dim: boolean) {
  const pal = naturePalette(p.colour, p.harmony, dim);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  PAINTERS[p.pattern](ctx, p, width, height, pal, rng(p.seed * 7919 + 13));
  ctx.restore();
  ctx.globalAlpha = 1;
}
