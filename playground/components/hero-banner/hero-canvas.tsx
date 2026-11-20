"use client";

import { useTheme } from "next-themes";
import { type RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getLogoSampler } from "./logo-sampler";
import { type ClearBox, type HeroPattern, renderCells } from "./pattern";

/** Ink is a tint of the foreground; tone sets how strong. Kept low so the banner stays muted. */
const INK_MIN = 0.1;
const INK_RANGE = 0.34;

function readColors(el: HTMLElement) {
  const style = getComputedStyle(el);
  return {
    ink: style.getPropertyValue("--foreground").trim(),
    accents: ["", style.getPropertyValue("--hero-lime").trim(), style.getPropertyValue("--hero-seal").trim()],
  };
}

/**
 * The dithered background, drawn on a transparent canvas filling its parent.
 * `clearRef` (normally the title) gets a quiet area around it, wherever it wraps to.
 */
export function HeroCanvas({ pattern, clearRef, className }: { pattern: HeroPattern; clearRef?: RefObject<HTMLElement | null>; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [drawn, setDrawn] = useState(false);
  const key = JSON.stringify(pattern);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const p = JSON.parse(key) as HeroPattern;

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

      let box: ClearBox | null = null;
      const target = clearRef?.current;
      if (target) {
        const h = host.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        box = { x: t.left - h.left, y: t.top - h.top, width: t.width, height: t.height };
      }

      const { ink, accents } = readColors(canvas);
      const cells = renderCells(p, width, height, p.shape === "logo" ? getLogoSampler() : null, box);
      const size = Math.max(2, p.cell);
      const gap = size >= 5 ? 1 : 0;

      for (const c of cells) {
        ctx.fillStyle = c.accent ? accents[c.accent] : ink;
        ctx.globalAlpha = c.accent ? 0.95 : INK_MIN + INK_RANGE * c.tone;
        if (p.dither === "halftone") {
          const r = (size / 2) * Math.sqrt(c.tone) * (c.accent ? 0.85 : 1);
          if (r < 0.4) continue;
          ctx.beginPath();
          ctx.arc(c.x + size / 2, c.y + size / 2, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(c.x, c.y, size - gap, size - gap);
        }
      }
      ctx.globalAlpha = 1;
      setDrawn(true);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    if (clearRef?.current) observer.observe(clearRef.current);
    return () => observer.disconnect();
  }, [key, resolvedTheme, clearRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ease-out motion-reduce:transition-none",
        drawn ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}
