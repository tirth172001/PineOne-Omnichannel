import { PreviewComposition } from "@/components/preview/preview-composition";
import { PREVIEW_STYLE, previewKind } from "@/lib/preview";
import placeholders from "@/lib/thumbnail-placeholders.json";
import type { Prototype } from "@/lib/prototypes";
import { cn } from "@/lib/utils";

/**
 * The card picture: the prototype's light screenshot composed the same way for every card
 * (desktop frame or phone frame; see `PreviewComposition` and `lib/preview.ts`).
 * Static images only: never a live iframe, one booted app per card crashes mobile browsers.
 */
export function Thumbnail({ prototype, className }: { prototype: Prototype; className?: string }) {
  if (!prototype.assets.thumbnails) {
    return (
      <div className={cn("flex aspect-[16/10] items-center justify-center bg-muted text-sm text-muted-foreground", className)}>
        No preview yet
      </div>
    );
  }
  const version = Date.parse(prototype.meta.updatedAt);
  // A small WebP made from the screenshot (scripts/optimize-thumbnails.mjs), not the full PNG.
  const src = `/thumbnails/${prototype.slug}-card.webp?v=${version}`;
  return (
    <PreviewComposition
      kind={previewKind(prototype.meta)}
      src={src}
      low={`/thumbnails/${prototype.slug}-low.webp?v=${version}`}
      placeholder={(placeholders as Record<string, string>)[prototype.slug]}
      style={PREVIEW_STYLE}
      className={className}
    />
  );
}
