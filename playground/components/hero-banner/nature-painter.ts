// One shared background painter for every nature banner on the page (see nature.worker.ts). Falls back to
// painting on the main thread, after the page is idle, where workers or OffscreenCanvas aren't available.
import type { NaturePattern } from "./nature";
import { drawNature, type FadeBox } from "./nature-draw";
import type { NatureJob, NatureResult } from "./nature.worker";

let worker: Worker | null | undefined;
let nextId = 1;
const pending = new Map<number, (bitmap: ImageBitmap | null) => void>();

function getWorker() {
  if (worker !== undefined) return worker;
  try {
    if (typeof OffscreenCanvas === "undefined" || typeof Worker === "undefined") throw new Error("unsupported");
    worker = new Worker(new URL("./nature.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<NatureResult>) => {
      pending.get(e.data.id)?.(e.data.bitmap);
      pending.delete(e.data.id);
    };
    worker.onerror = () => {
      for (const done of pending.values()) done(null);
      pending.clear();
      worker = null;
    };
  } catch {
    worker = null;
  }
  return worker;
}

/** Paints a nature banner in the background; resolves with the finished picture (null if it couldn't). */
export function paintNature(job: Omit<NatureJob, "id">): Promise<ImageBitmap | null> {
  const w = getWorker();
  if (!w) return Promise.resolve(null);
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    w.postMessage({ ...job, id } satisfies NatureJob);
  });
}

/** Main-thread fallback, deferred until the browser is idle so the page renders first. */
export function paintNatureLater(ctx: CanvasRenderingContext2D, p: NaturePattern, width: number, height: number, dim: boolean, box: FadeBox | null, done: () => void) {
  const run = () => {
    drawNature(ctx, p, width, height, dim, box);
    done();
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 1200 });
  else setTimeout(run, 50);
}
