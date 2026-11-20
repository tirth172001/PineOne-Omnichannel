"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DocHeading } from "@/lib/docs";
import { cn } from "@/lib/utils";

/** Sections and their sub-sections. Deeper headings stay in the text only. */
function visible(headings: DocHeading[]) {
  const top = Math.min(...headings.map((h) => h.depth));
  return headings.filter((h) => h.depth <= top + 1).map((h) => ({ ...h, nested: h.depth > top }));
}

/** Tracks which section is on screen (the last heading above the top fifth of the window). */
function useActive(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = window.innerHeight * 0.2;
        let current: string | null = ids[0] ?? null;
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= line) current = id;
        }
        setActive(current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);
  return active;
}

function List({ items, active, onPick }: { items: ReturnType<typeof visible>; active?: string | null; onPick?: () => void }) {
  return (
    <ol className="flex flex-col">
      {items.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={onPick}
            className={cn(
              "block border-l py-1.5 text-sm leading-snug transition-colors duration-150 ease-out",
              h.nested ? "pl-6" : "pl-3",
              active === h.id
                ? "border-foreground font-medium text-foreground"
                : "border-border text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** Desktop: sticky "On this page" column that follows the reader. Sticks below the floating Back pill (top-20), never under it. */
export function DocContentsRail({ headings }: { headings: DocHeading[] }) {
  const items = visible(headings);
  const ids = useMemo(() => visible(headings).map((h) => h.id), [headings]);
  const active = useActive(ids);
  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6">
      <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">On this page</p>
      <List items={items} active={active} />
    </nav>
  );
}

/** Phone and tablet: a Contents block that opens in place (height animates). */
export function DocContentsInline({ headings }: { headings: DocHeading[] }) {
  const items = visible(headings);
  const [open, setOpen] = useState(false);
  if (items.length < 2) return null;
  const sections = items.filter((h) => !h.nested).length;
  return (
    <nav aria-label="Contents" className="rounded-xl ring-1 ring-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center justify-between px-4 text-sm font-medium"
      >
        <span>
          Contents <span className="font-normal text-muted-foreground">· {sections} sections</span>
        </span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4">
            <List items={items} onPick={() => setOpen(false)} />
          </div>
        </div>
      </div>
    </nav>
  );
}
