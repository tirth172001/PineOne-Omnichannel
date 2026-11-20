/**
 * The Pine Labs mark as the brand draws it: an outline of the folded corner (40 × 40 box, a 4-unit stroke
 * masked to the shape, so 2 units show inside the edge). The shape spans 4–36, so it's sampled as a 32-unit square.
 */
const PINE_LABS_PATH = "M4.82471 17.2995H22.5637V36L35.1752 22.7005V4H17.4304L4.82471 17.2995Z";

/** Each logo's path, the square (x, y, size) in its own units that the sampler maps to 0–1, and an inner stroke width if it's drawn as an outline. */
export const LOGOS = {
  pinelabs: { path: PINE_LABS_PATH, x: 4, y: 4, size: 32, stroke: 2 },
} as const;
