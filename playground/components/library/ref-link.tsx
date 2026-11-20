"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import type { Reference } from "@/lib/references";

const OPEN_DELAY = 120;
const CLOSE_DELAY = 150;

/**
 * A cross-reference inside a document, with a preview card: what it means, and a button to open the
 * document (or go to the definition).
 * - Mouse: hover opens the card (it stays open while the pointer moves into it); click follows the link.
 * - Touch and pen: tap opens the card instead of navigating; the card's button goes there.
 * - Keyboard: focus opens the card; Enter follows the link.
 * Dotted underline so it reads as a reference, not a web link.
 */
export function RefLink({ reference, href, children }: { reference: Reference; href: string; children: ReactNode }) {
  const isDoc = reference.key.startsWith("doc:");
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointer = useRef<string>("mouse");

  const schedule = (next: boolean, delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  };
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const hoverOpen = (e: React.PointerEvent) => e.pointerType === "mouse" && schedule(true, OPEN_DELAY);
  const hoverClose = (e: React.PointerEvent) => e.pointerType === "mouse" && schedule(false, CLOSE_DELAY);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Link
          href={href}
          onPointerDown={(e) => (pointer.current = e.pointerType)}
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          onFocus={() => schedule(true, OPEN_DELAY)}
          onBlur={() => schedule(false, CLOSE_DELAY)}
          onClick={(e) => {
            // Touch has no hover: the first tap shows the card, its button navigates.
            if (pointer.current !== "mouse") {
              e.preventDefault();
              if (timer.current) clearTimeout(timer.current);
              setOpen((o) => !o);
            }
          }}
          aria-expanded={open}
          className="rounded-sm font-medium text-foreground underline decoration-muted-foreground/60 decoration-dotted decoration-[1.5px] underline-offset-4 transition-colors duration-150 ease-out hover:bg-muted hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-muted"
        >
          {children}
        </Link>
      </PopoverAnchor>
      <PopoverContent
        side="top"
        align="start"
        collisionPadding={12}
        className="w-[min(20rem,calc(100vw-1.5rem))] p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerEnter={hoverOpen}
        onPointerLeave={hoverClose}
      >
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{isDoc ? "Document" : reference.label}</p>
          <p className="leading-snug font-semibold">{reference.name}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{reference.definition}</p>
          <Button asChild variant="secondary" className="mt-2 h-11 justify-between">
            <Link href={href} onClick={() => setOpen(false)}>
              <span className="truncate">{isDoc ? "Open document" : `Open in ${reference.docTitle}`}</span>
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
