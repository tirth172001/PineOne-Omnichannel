"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** How long each step stays before the next may fade in, and how long the fades take (ms). */
const HOLD_BLUR = 250;
const HOLD_LOW = 450;

/**
 * An image that sharpens slowly instead of appearing suddenly (progressive loading):
 * 1. a tiny blurred version, inlined in the page, shows at once;
 * 2. a ~1 KB low-quality version crossfades in, still soft;
 * 3. the full image crossfades in last while the blur eases away.
 * Every step is held briefly even when the next one is already loaded (from cache), so the change is always
 * gradual, never a jump. `delay` staggers neighbouring images. Fills its parent.
 */
export function FadeImage({ src, low, placeholder, delay = 0, className }: { src: string; low?: string; placeholder?: string; delay?: number; className?: string }) {
  const fullRef = useRef<HTMLImageElement>(null);
  const lowRef = useRef<HTMLImageElement>(null);
  const [lowLoaded, setLowLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [step, setStep] = useState(0);

  // Images already in the cache before hydration don't fire onLoad: check once on mount.
  useEffect(() => {
    const done = (img: HTMLImageElement | null) => !!img && img.complete && img.naturalWidth > 0;
    if (done(lowRef.current)) setLowLoaded(true);
    if (done(fullRef.current)) setFullLoaded(true);
  }, []);

  // Advance one step at a time, each after a short hold (plus the stagger for the first).
  useEffect(() => {
    const next = step === 0 && (lowLoaded || fullLoaded) ? (low && lowLoaded ? 1 : fullLoaded ? 2 : 0) : step === 1 && fullLoaded ? 2 : step;
    if (next === step) return;
    const t = setTimeout(() => setStep(next), (step === 0 ? HOLD_BLUR + delay : HOLD_LOW));
    return () => clearTimeout(t);
  }, [step, lowLoaded, fullLoaded, low, delay]);

  const layer = "absolute inset-0 size-full object-cover object-top transition-[opacity,filter] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none";
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
          onLoad={() => setLowLoaded(true)}
          className={cn(layer, "duration-700", step >= 1 ? "opacity-100 blur-[2px]" : "opacity-0 blur-md")}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={fullRef}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setFullLoaded(true)}
        className={cn(layer, "duration-[1100ms]", step >= 2 ? "opacity-100 blur-0" : "opacity-0 blur-[3px]")}
      />
    </div>
  );
}
