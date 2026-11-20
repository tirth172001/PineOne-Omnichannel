"use client";

import { ControlPanel, ControlsLayout, useControls } from "@/components/controls";
import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { controlsSchema, PAGES, SLUG, toNature } from "./data";
import { PaletteRow } from "./palette-row";
import { SnippetCard } from "./snippet-card";

/** Live nature banner (column and phone width), its palette, curated base colours, and the snippet for lib/heroes.ts. */
export function NatureMaker() {
  const controls = useControls(SLUG, controlsSchema);
  const page = PAGES.find((p) => p.name === controls.values.page) ?? PAGES[0];
  const pattern = toNature(controls.values);

  return (
    <ControlsLayout panel={<ControlPanel controls={controls} />}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-6 pb-28 lg:pb-16">
        <HeroBanner title={page.title} pattern={pattern} />
        <PaletteRow colour={pattern.colour} harmony={pattern.harmony} onPick={(hex) => controls.set("colour", hex)} />
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
