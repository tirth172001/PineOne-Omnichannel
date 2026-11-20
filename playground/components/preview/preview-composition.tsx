"use client";

import type { PreviewKind, PreviewStyle } from "@/lib/preview";
import { cn } from "@/lib/utils";

/**
 * A gallery card's picture, composed the same way for every prototype (16:10):
 * - desktop: the app in a frame, centred, inset from the top and bleeding off the bottom;
 * - mobile: the app in a phone frame, inset from the top and bleeding off the bottom;
 * both frames share one treatment: a thin card-coloured bezel and equally rounded top corners, no browser chrome;
 * on a plain muted background. Always the light screenshot (in both themes), a static image, never a
 * live app. Sizes are % of the card, so it scales to any width.
 */
export function PreviewComposition({
  kind,
  src,
  style,
  className,
}: {
  kind: PreviewKind;
  /** The light-theme screenshot. */
  src: string;
  style: PreviewStyle;
  className?: string;
}) {
  const shadow = style.shadow && "shadow-[0_8px_30px_-6px_rgb(0_0_0/0.25)]";
  // eslint-disable-next-line @next/next/no-img-element
  const shot = <img src={src} alt="" loading="lazy" decoding="async" className="block w-full" />;

  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-muted @container", className)}>
      {kind === "desktop" ? (
        <div
          className={cn("absolute overflow-hidden rounded-t-[2.4cqw] bg-card p-[0.9cqw] pb-0 ring-1 ring-border", shadow)}
          style={{ top: `${style.inset * 1.6}%`, width: `${style.windowWidth}%`, left: `${(100 - style.windowWidth) / 2}%` }}
        >
          <div className="overflow-hidden rounded-t-[1.6cqw]">{shot}</div>
        </div>
      ) : (
        <div
          className={cn("absolute overflow-hidden rounded-t-[4.2cqw] bg-card p-[0.9cqw] pb-0 ring-1 ring-border", shadow)}
          style={{
            top: `${style.inset * 1.6}%`,
            width: `${style.phoneWidth}%`,
            left: `${((100 - style.phoneWidth) * style.phoneAlign) / 100}%`,
          }}
        >
          <div className="overflow-hidden rounded-t-[3.4cqw]">{shot}</div>
        </div>
      )}
    </div>
  );
}
