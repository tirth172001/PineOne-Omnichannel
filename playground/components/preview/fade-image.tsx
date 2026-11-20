"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that sharpens in steps instead of popping in (progressive loading):
 * 1. a tiny blurred version, inlined in the page, shows at once (heavy blur);
 * 2. a ~1 KB low-quality version (`low`) loads almost immediately and crossfades in, slightly soft;
 * 3. the full image crossfades in last, sharp.
 * Each step fades over the previous one while the blur eases off. Fills its parent.
 */
export function FadeImage({ src, low, placeholder, className }: { src: string; low?: string; placeholder?: string; className?: string }) {
  const fullRef = useRef<HTMLImageElement>(null);
  const lowRef = useRef<HTMLImageElement>(null);
  const [lowReady, setLowReady] = useState(false);
  const [fullReady, setFullReady] = useState(false);

  // Images already in the cache before hydration don't fire onLoad: check once on mount.
  useEffect(() => {
    const done = (img: HTMLImageElement | null) => !!img && img.complete && img.naturalWidth > 0;
    if (done(lowRef.current)) setLowReady(true);
    if (done(fullRef.current)) setFullReady(true);
  }, []);

  const layer = "absolute inset-0 size-full object-cover object-top transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none";
  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {placeholder && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={placeholder} alt="" aria-hidden className={cn(layer, "scale-110 blur-md")} />
      )}
      {low && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={lowRef}
          src={low}
          alt=""
          aria-hidden
          decoding="async"
          onLoad={() => setLowReady(true)}
          className={cn(layer, lowReady && !fullReady ? "opacity-100 blur-[1.5px]" : "opacity-0 blur-sm", fullReady && "opacity-100 blur-0")}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fullRef}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setFullReady(true)}
        className={cn(layer, fullReady ? "opacity-100 blur-0" : "opacity-0 blur-[2px]")}
      />
    </div>
  );
}
