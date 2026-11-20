"use client";

import { useTheme } from "next-themes";
import { type RefObject, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { type BannerPattern, isBrush } from "./brush";
import { drawBrush, readColours } from "./brush-draw";
import { isNature } from "./nature";
import { drawNature } from "./nature-draw";
import { type ClearBox, type HeroPattern, type HeroPixel, renderCells } from "./pattern";
import type { PaintTexture } from "./texture";

/** Ink is a tint of the foreground; tone sets how strong. Kept low so the banner stays muted. */
const INK_MIN = 0.08;
const INK_RANGE = 0.24;

/** Colours for both kinds of banner (see `readColours`). */
const readColors = readColours;

/** One pixel, `d` across, centred in its cell. Line pixels use the fill colour as their stroke. */
function drawPixel(ctx: CanvasRenderingContext2D, kind: HeroPixel, cx: number, cy: number, d: number) {
  const h = d / 2;
  if (kind === "square") return ctx.fillRect(cx - h, cy - h, d, d);
  ctx.beginPath();
  switch (kind) {
    case "dot":
      ctx.arc(cx, cy, h, 0, Math.PI * 2);
      return ctx.fill();
    case "diamond":
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + h, cy);
      ctx.lineTo(cx, cy + h);
      ctx.lineTo(cx - h, cy);
      ctx.closePath();
      return ctx.fill();
    case "mark":
      // The Pine Labs folded corner, in miniature (same proportions as the logo path).
      ctx.moveTo(cx - h, cy - h * 0.16);
      ctx.lineTo(cx + h * 0.12, cy - h * 0.16);
      ctx.lineTo(cx + h * 0.12, cy + h);
      ctx.lineTo(cx + h * 0.92, cy + h * 0.17);
      ctx.lineTo(cx + h * 0.92, cy - h);
      ctx.lineTo(cx - h * 0.2, cy - h);
      ctx.closePath();
      return ctx.fill();
    case "rounded":
      ctx.roundRect(cx - h, cy - h, d, d, d * 0.28);
      return ctx.fill();
  }
  // Line pixels.
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, d * 0.2);
  const k = h * 0.8;
  if (kind === "plus") {
    ctx.moveTo(cx - k, cy);
    ctx.lineTo(cx + k, cy);
    ctx.moveTo(cx, cy - k);
    ctx.lineTo(cx, cy + k);
  } else if (kind === "ring") ctx.arc(cx, cy, k, 0, Math.PI * 2);
  else if (kind === "dash") {
    ctx.moveTo(cx - k, cy);
    ctx.lineTo(cx + k, cy);
  } else {
    // needle: a short pine-needle stroke, leaning right
    ctx.moveTo(cx - k * 0.6, cy + k);
    ctx.lineTo(cx + k * 0.6, cy - k);
  }
  ctx.stroke();
}

/** Pixel patterns: cells from `renderCells`, muted ink with a gradient into the accent near the focus. */
function drawPixels(ctx: CanvasRenderingContext2D, p: HeroPattern, width: number, height: number, box: ClearBox | null, colours: ReturnType<typeof readColors>) {
  const { ink, lime, pine } = colours;
  const accent = p.palette === "pine" ? pine : lime;
  const cells = renderCells(p, width, height, box);
  const size = Math.max(2, p.cell);
  // Pixels leave a hairline gap and shrink a little where the tone is light; accents are full size.
  const full = size >= 5 ? size - 1 : size;

  for (const c of cells) {
    const d = c.accent ? full * (p.dither === "halftone" ? 0.7 : 1) : p.dither === "halftone" ? size * Math.sqrt(c.tone) : full * (0.6 + 0.4 * c.tone);
    if (d < 0.8) continue;
    const cx = c.x + size / 2;
    const cy = c.y + size / 2;
    if (c.accent) {
      ctx.fillStyle = accent;
      ctx.globalAlpha = 1;
      drawPixel(ctx, p.pixel, cx, cy, d);
      continue;
    }
    // Muted ink, then the accent laid over it by `tint`: a soft gradient into the accent colour near the focus.
    const alpha = INK_MIN + INK_RANGE * c.tone;
    ctx.fillStyle = ink;
    ctx.globalAlpha = alpha * (1 - c.tint);
    drawPixel(ctx, p.pixel, cx, cy, d);
    if (c.tint > 0.03) {
      ctx.fillStyle = accent;
      ctx.globalAlpha = Math.min(1, alpha * 1.6) * c.tint;
      drawPixel(ctx, p.pixel, cx, cy, d);
    }
  }
}

/**
 * The dithered background, drawn on a transparent canvas filling its parent.
 * `clearRef` (normally the title) gets a quiet area around it, wherever it wraps to.
 */
export function HeroCanvas({
  pattern,
  texture,
  clearRef,
  className,
}: {
  pattern: BannerPattern;
  /** Paint texture for brush banners; defaults to the shared PAINT_TEXTURE (the Paint texture maker overrides it). */
  texture?: PaintTexture;
  clearRef?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [drawn, setDrawn] = useState(false);
  const key = JSON.stringify(pattern);
  const textureKey = JSON.stringify(texture ?? null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const p = JSON.parse(key) as BannerPattern;

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

      const colours = readColors(canvas);
      // Nature banners fade the pattern itself around the text (strokes thin out), so no overlay is needed.
      if (isNature(p)) drawNature(ctx, p, width, height, resolvedTheme === "dark", box);
      else if (isBrush(p)) drawBrush(ctx, p, width, height, colours, (JSON.parse(textureKey) as PaintTexture | null) ?? undefined);
      else drawPixels(ctx, p, width, height, box, colours);
      ctx.globalAlpha = 1;

      // Legibility: erase pixels behind the text through a blurred mask, so the pattern fades smoothly
      // to the plain card colour wherever there's text (a gradient, not a hard box).
      if (box && !isNature(p) && p.clear > 0) {
        const pad = Math.max(24, Math.min(height * 0.2, 56));
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.filter = `blur(${Math.round(pad * 0.6)}px)`;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, p.clear)})`;
        ctx.beginPath();
        ctx.roundRect(box.x - pad * 0.5, box.y - pad * 0.5, box.width + pad, box.height + pad, pad);
        ctx.fill();
        ctx.restore();
      }
      setDrawn(true);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(host);
    if (clearRef?.current) observer.observe(clearRef.current);
    return () => observer.disconnect();
  }, [key, textureKey, resolvedTheme, clearRef]);

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
