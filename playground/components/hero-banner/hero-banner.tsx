"use client";

import { type ReactNode, useRef } from "react";
import { PageTitle } from "@/components/page-title";
import { cn } from "@/lib/utils";
import { HeroCanvas } from "./hero-canvas";
import type { BannerPattern } from "./brush";
import type { PaintTexture } from "./texture";

/**
 * The banner at the top of every playground page: a dithered background (see `pattern.ts`,
 * designed in the Hero banner maker prototype) with the page title centred on it.
 * The page's content starts below.
 */
export function HeroBanner({
  title,
  pattern,
  texture,
  eyebrow,
  meta,
  action,
  align = "center",
  className,
}: {
  title: ReactNode;
  pattern: BannerPattern;
  /** Paint texture override for brush banners (the Paint texture maker previews with it). */
  texture?: PaintTexture;
  /** Small uppercase line above the title. */
  eyebrow?: ReactNode;
  /** Quiet line below the title (a count, a date). */
  meta?: ReactNode;
  /** Pinned to the top-right corner (e.g. the theme toggle on home). */
  action?: ReactNode;
  /** `start` left-aligns the title (doc pages); default centres it. */
  align?: "center" | "start";
  className?: string;
}) {
  const titleRef = useRef<HTMLDivElement>(null);
  return (
    <section
      className={cn(
        "relative isolate flex min-h-44 items-center overflow-hidden rounded-2xl bg-muted/60 px-6 py-12 sm:min-h-56",
        align === "center" ? "justify-center" : "justify-start sm:px-10",
        className
      )}
    >
      <HeroCanvas pattern={pattern} texture={texture} clearRef={titleRef} className="-z-10" />
      <div ref={titleRef} className={cn("flex max-w-xl flex-col gap-2", align === "center" ? "items-center text-center" : "items-start text-left")}>
        {eyebrow && <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{eyebrow}</p>}
        <PageTitle>{title}</PageTitle>
        {meta && <div className="text-sm text-muted-foreground tabular-nums">{meta}</div>}
      </div>
      {action && <div className="absolute top-1.5 right-1.5">{action}</div>}
    </section>
  );
}
