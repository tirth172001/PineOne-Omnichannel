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
 * Every step is held briefly so the change is gradual, never a jump. An image that's already cached when the
 * page appears skips the reveal and shows sharp at once. `delay` staggers neighbouring images. Fills its parent.
 */
export function FadeImage({ src, low, placeholder, delay = 0, className }: { src: string; low?: string; placeholder?: string; delay?: number; className?: string }) {
  const fullRef = useRef<HTMLImageElement>(null);
  const lowRef = useRef<HTMLImageElement>(null);
  const [lowLoaded, setLowLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const [step, setStep] = useState(0);
  // An image already in the browser's cache is shown sharp straight away, with no reveal; replaying the
  // blur-to-sharp steps for it looks as if it were loading again.
  const [instant, setInstant] = useState(false);
  const mountedAt = useRef(0);

  // Images already in the cache before hydration don't fire onLoad: check once on mount.
  useEffect(() => {
    mountedAt.current = performance.now();
    const done = (img: HTMLImageElement | null) => !!img && img.complete && img.naturalWidth > 0;
    if (done(fullRef.current)) {
      setInstant(true);
      setFullLoaded(true);
      setStep(2);
      return;
    }
    if (done(lowRef.current)) setLowLoaded(true);
  }, []);

  // Advance one step at a time, each after a short hold (plus the stagger for the first).
  useEffect(() => {
    const next = step === 0 && (lowLoaded || fullLoaded) ? (low && lowLoaded ? 1 : fullLoaded ? 2 : 0) : step === 1 && fullLoaded ? 2 : step;
    if (next === step) return;
    const t = setTimeout(() => setStep(next), (step === 0 ? HOLD_BLUR + delay : HOLD_LOW));
    return () => clearTimeout(t);
  }, [step, lowLoaded, fullLoaded, low, delay]);

  if (instant) {
    return (
      <div className={cn("relative size-full overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={fullRef} src={src} alt="" decoding="async" className="absolute inset-0 size-full object-cover object-top" />
      </div>
    );
  }

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
        onLoad={() => {
          // Arrived almost at once (from the cache, after moving between pages): show it, don't animate.
          if (performance.now() - mountedAt.current < 150) {
            setInstant(true);
            setStep(2);
          }
          setFullLoaded(true);
        }}
        className={cn(layer, "duration-[1100ms]", step >= 2 ? "opacity-100 blur-0" : "opacity-0 blur-[3px]")}
      />
    </div>
  );
}
