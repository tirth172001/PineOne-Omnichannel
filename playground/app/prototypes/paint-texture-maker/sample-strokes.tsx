"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import type { Stroke } from "@/components/hero-banner/brush";
import { makePaint, paintStroke, readColours } from "@/components/hero-banner/brush-draw";
import type { PaintTexture } from "@/components/hero-banner/texture";

type Shape = "straight" | "sweep";

/** Centre line of a sample stroke, in canvas px: a wide straight drag, or a curved sweep (like the references). */
function path(shape: Shape, w: number, h: number): [number, number][] {
  const n = 40;
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    if (shape === "straight") return [w * (0.08 + 0.82 * t), h * (0.5 + Math.sin(t * 3) * 0.03)] as [number, number];
    // Lands on the right and sweeps down-left, curving like an S.
    return [w * (0.86 - 0.78 * t), h * (0.32 + 0.36 * t + Math.sin(t * Math.PI) * 0.12)] as [number, number];
  });
}

const ROLE = { ink: 0, lime: 2, pine: 3 } as const;

/** One large stroke painted with the texture, on the same background as a banner. */
export function SampleStroke({ shape, colour, texture }: { shape: Shape; colour: keyof typeof ROLE; texture: PaintTexture }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const key = JSON.stringify(texture);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const tex = JSON.parse(key) as PaintTexture;
    const draw = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const stroke: Stroke = { points: path(shape, width, height), width: height * (shape === "straight" ? 0.42 : 0.3), tone: 1, colour: ROLE[colour], seed: shape === "straight" ? 7 : 19 };
      paintStroke(ctx, stroke, { bristles: 8, relief: 0.6, texture: tex }, makePaint(ctx, readColours(canvas), stroke.colour, 1));
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    return () => observer.disconnect();
  }, [key, shape, colour, resolvedTheme]);

  return (
    <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-muted/60">
      <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}
