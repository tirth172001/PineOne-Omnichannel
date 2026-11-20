"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that never pops in: a tiny blurred version (inlined, so it's there with the page) shows straight
 * away, and the real image fades in over it once it has loaded and decoded. Fills its parent.
 */
export function FadeImage({ src, placeholder, className }: { src: string; placeholder?: string; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Already loaded from cache before hydration: onLoad won't fire, so check once on mount.
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true);
  }, []);

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      {placeholder && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={placeholder} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover object-top blur-md" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "relative size-full object-cover object-top transition-opacity duration-300 ease-out motion-reduce:transition-none",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
