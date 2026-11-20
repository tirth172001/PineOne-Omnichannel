"use client";

import { ControlPanel, ControlsLayout, useControls } from "@/components/controls";
import { isBrush } from "@/components/hero-banner/brush";
import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { Button } from "@/components/ui/button";
import { controlsSchema, PAGES, SLUG, toBrush } from "./data";
import { SnippetCard } from "./snippet-card";

/** Live brush-stroke banner (desktop column and phone width), the control panel, and the snippet for lib/heroes.ts. */
export function BrushMaker() {
  const controls = useControls(SLUG, controlsSchema);
  const page = PAGES.find((p) => p.name === controls.values.page) ?? PAGES[0];
  const pattern = toBrush(controls.values);
  const live = isBrush(page.pattern) ? page.pattern : null;

  /** Start from the page's live brush banner. */
  const loadPage = () => {
    if (!live) return;
    for (const [k, v] of Object.entries(live)) if (k !== "kind") controls.set(k as keyof typeof controlsSchema, v as never);
  };

  const panel = (
    <div className="flex flex-col gap-5">
      <ControlPanel controls={controls} />
      <Button variant="outline" className="h-11" onClick={loadPage} disabled={!live}>
        Load {page.name}&rsquo;s current banner
      </Button>
    </div>
  );

  return (
    <ControlsLayout panel={panel}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-6 pb-28 lg:pb-16">
        <HeroBanner title={page.title} pattern={pattern} />
        <section aria-hidden className="hidden flex-col gap-2 sm:flex">
          <p className="text-sm text-muted-foreground">At phone width</p>
          <div className="w-[343px]">
            <HeroBanner title={page.title} pattern={pattern} />
          </div>
        </section>
        <SnippetCard pattern={pattern} target={page.target} />
      </div>
    </ControlsLayout>
  );
}
