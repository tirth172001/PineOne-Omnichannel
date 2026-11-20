"use client";

import type { PreviewKind, PreviewStyle } from "@/lib/preview";
import { FadeImage } from "./fade-image";
import { cn } from "@/lib/utils";

/**
 * A gallery card's picture, composed the same way for every prototype (16:10):
 * - desktop: the app in a frame, centred, inset from the top and bleeding off the bottom;
 * - mobile: the app in a phone frame, inset from the top and bleeding off the bottom;
 * both frames share one treatment: a thin card-coloured bezel and equally rounded top corners, no browser chrome,
 * and both always run past the card's bottom edge (the screenshot fills them from the top), so they read as
 * going behind it: no gap and no bottom border;
 * on a plain muted background. Always the light screenshot (in both themes), a static image, never a
 * live app. Sizes are % of the card, so it scales to any width.
 */
export function PreviewComposition({
  kind,
  src,
  placeholder,
  style,
  className,
}: {
  kind: PreviewKind;
  /** The light-theme screenshot. */
  src: string;
  /** A tiny blurred version, shown until the screenshot has loaded. */
  placeholder?: string;
  style: PreviewStyle;
  className?: string;
}) {
  const shadow = style.shadow && "shadow-[0_8px_30px_-6px_rgb(0_0_0/0.25)]";
  const shot = <FadeImage src={src} placeholder={placeholder} />;

  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted @container", className)}>
      {kind === "desktop" ? (
        <div
          className={cn("absolute -bottom-[4%] flex flex-col overflow-hidden rounded-t-[2.4cqw] bg-card p-[0.9cqw] pb-0 ring-1 ring-border", shadow)}
          style={{ top: `${style.inset * 1.6}%`, width: `${style.windowWidth}%`, left: `${(100 - style.windowWidth) / 2}%` }}
        >
          <div className="min-h-0 flex-1 overflow-hidden rounded-t-[1.6cqw]">{shot}</div>
        </div>
      ) : (
        <div
          className={cn("absolute -bottom-[4%] flex flex-col overflow-hidden rounded-t-[4.2cqw] bg-card p-[0.9cqw] pb-0 ring-1 ring-border", shadow)}
          style={{
            top: `${style.inset * 1.6}%`,
            width: `${style.phoneWidth}%`,
            left: `${((100 - style.phoneWidth) * style.phoneAlign) / 100}%`,
          }}
        >
          <div className="min-h-0 flex-1 overflow-hidden rounded-t-[3.4cqw]">{shot}</div>
        </div>
      )}
    </div>
  );
}
