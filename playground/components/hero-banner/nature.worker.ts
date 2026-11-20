/// <reference lib="webworker" />
// Paints nature banners off the main thread, so the page stays responsive while thousands of strokes are
// drawn. Receives the pattern and size, paints on an OffscreenCanvas, and returns an ImageBitmap.
import type { NaturePattern } from "./nature";
import { drawNature, type FadeBox } from "./nature-draw";

export type NatureJob = { id: number; pattern: NaturePattern; width: number; height: number; dpr: number; dim: boolean; box: FadeBox | null };
export type NatureResult = { id: number; bitmap: ImageBitmap | null };

self.onmessage = (e: MessageEvent<NatureJob>) => {
  const { id, pattern, width, height, dpr, dim, box } = e.data;
  try {
    const canvas = new OffscreenCanvas(Math.round(width * dpr), Math.round(height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawNature(ctx as unknown as CanvasRenderingContext2D, pattern, width, height, dim, box);
    const bitmap = canvas.transferToImageBitmap();
    (self as unknown as Worker).postMessage({ id, bitmap } satisfies NatureResult, [bitmap]);
  } catch {
    (self as unknown as Worker).postMessage({ id, bitmap: null } satisfies NatureResult);
  }
};
