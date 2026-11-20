"use client";

import { ControlPanel, ControlsLayout, useControls } from "@/components/controls";
import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { controlsSchema, PAGES, SLUG, toBrush } from "./data";
import { SnippetCard } from "./snippet-card";

/** Live brush-stroke banner (desktop column and phone width), the control panel, and the snippet for lib/heroes.ts. */
export function BrushMaker() {
  const controls = useControls(SLUG, controlsSchema);
  const page = PAGES.find((p) => p.name === controls.values.page) ?? PAGES[0];
  const pattern = toBrush(controls.values);

  return (
    <ControlsLayout panel={<ControlPanel controls={controls} />}>
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
