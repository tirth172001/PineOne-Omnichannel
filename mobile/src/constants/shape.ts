/**
 * Corner radii. Every container is rounded, and nested containers are
 * concentric: an inner corner's radius is the outer radius minus the gap
 * between the two edges, so both curves share a centre. The concentric rule
 * always wins over a one-off value from the design.
 *
 * No radius is larger than 12dp (`Shape.max`), including sheets, dialogs, and
 * pills. Top-level containers use `Shape.max`; derive every nested radius
 * with `concentric()` instead of picking a scale step by eye.
 */
export const Shape = {
  extraSmall: 4,
  small: 8,
  medium: 12,
  /** The largest allowed radius: top-level app surfaces (top bar, nav bar, cards, sheets, dialogs). */
  max: 12,
} as const;

/** Smallest radius any container gets: nothing is square. */
export const MIN_RADIUS = Shape.extraSmall;
export const MAX_RADIUS = Shape.max;

/**
 * Radius for a container nested inside another.
 *
 * @param outerRadius the parent's corner radius
 * @param gap the smallest distance between the child's edge and the parent's
 *   edge at that corner (usually the parent's padding)
 * @param height the child's height, if known: a radius can't exceed half of it
 */
export function concentric(outerRadius: number, gap: number, height?: number) {
  const radius = Math.min(Math.max(outerRadius - gap, MIN_RADIUS), MAX_RADIUS);
  return height === undefined ? radius : Math.min(radius, height / 2);
}
