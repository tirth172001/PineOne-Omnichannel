"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { type Harmony, NATURE_COLOURS, naturePalette } from "@/components/hero-banner/nature";
import { cn } from "@/lib/utils";

const noop = () => () => {};

/**
 * The palette built from the base colour (its six tones and accents), and the curated soft bases to start
 * from. Swatch colours are the picked colour itself (user data), so inline colours are expected here.
 */
export function PaletteRow({ colour, harmony, onPick }: { colour: string; harmony: Harmony; onPick: (hex: string) => void }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const pal = naturePalette(colour, harmony, mounted && resolvedTheme === "dark");
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5" aria-label="Palette">
        {[...pal.tones, ...pal.accents].map((c, i) => (
          <span key={i} className={cn("h-8 flex-1 first:rounded-l-lg last:rounded-r-lg", i === pal.tones.length && "ml-2 rounded-l-lg")} style={{ background: c }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(NATURE_COLOURS).map(([name, hex]) => (
          <button
            key={name}
            type="button"
            onClick={() => onPick(hex)}
            aria-label={`Base colour ${name}`}
            aria-pressed={hex === colour}
            className={cn(
              "flex h-11 items-center gap-2 rounded-full px-3 text-sm ring-1 ring-border transition-colors duration-150 ease-out active:bg-muted",
              hex === colour && "ring-2 ring-foreground"
            )}
          >
            <span className="size-4 rounded-full" style={{ background: hex }} />
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}
