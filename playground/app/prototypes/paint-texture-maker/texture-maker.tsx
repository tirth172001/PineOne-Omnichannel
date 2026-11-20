"use client";

import { ControlPanel, ControlsLayout, useControls } from "@/components/controls";
import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { HOME_HERO } from "@/lib/heroes";
import { controlsSchema, SLUG, toTexture } from "./data";
import { SampleStroke } from "./sample-strokes";
import { SnippetCard } from "./snippet-card";

/** Two large sample strokes and the home banner, painted with the texture being tuned; the snippet for lib/paint-texture.ts. */
export function TextureMaker() {
  const controls = useControls(SLUG, controlsSchema);
  const texture = toTexture(controls.values);
  const colour = controls.values.colour;

  return (
    <ControlsLayout panel={<ControlPanel controls={controls} />}>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-6 pb-28 lg:pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <SampleStroke shape="straight" colour={colour} texture={texture} />
          <SampleStroke shape="sweep" colour={colour} texture={texture} />
        </div>
        <section className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">On a banner</p>
          <HeroBanner title="Playground" pattern={HOME_HERO} texture={texture} />
        </section>
        <SnippetCard texture={texture} />
      </div>
    </ControlsLayout>
  );
}
