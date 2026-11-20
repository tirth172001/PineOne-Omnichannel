/**
 * The Pine Labs mark (the folded corner) as a polygon, from the brand SVG (40 × 40 box):
 * M4.82471 17.2995 H22.5637 V36 L35.1752 22.7005 V4 H17.4304 Z. The shape spans 4–36 on y (32 units tall).
 */
export const PINE_LABS_POINTS: readonly (readonly [number, number])[] = [
  [4.82471, 17.2995],
  [22.5637, 17.2995],
  [22.5637, 36],
  [35.1752, 22.7005],
  [35.1752, 4],
  [17.4304, 4],
];
export const PINE_LABS_CENTRE = [20, 20] as const;
export const PINE_LABS_HEIGHT = 32;

/** Signed distance (in logo units) from a point to the mark's edge: negative inside, positive outside. */
export function pineLabsDistance(x: number, y: number) {
  const pts = PINE_LABS_POINTS;
  let d = Infinity;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j];
    const [bx, by] = pts[i];
    const ex = bx - ax;
    const ey = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey)));
    d = Math.min(d, Math.hypot(x - ax - ex * t, y - ay - ey * t));
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside ? -d : d;
}
