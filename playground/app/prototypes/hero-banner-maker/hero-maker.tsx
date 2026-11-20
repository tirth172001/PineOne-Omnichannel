"use client";

import { ControlPanel, ControlsLayout, useControls } from "@/components/controls";
import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { Button } from "@/components/ui/button";
import { controlsSchema, PAGES, SLUG, toPattern } from "./data";
import { SnippetCard } from "./snippet-card";

/** Live banner (desktop column and phone width), the control panel, and the snippet to paste into lib/heroes.ts. */
export function HeroMaker() {
  const controls = useControls(SLUG, controlsSchema);
  const { values, set } = controls;
  const page = PAGES.find((p) => p.name === values.page) ?? PAGES[0];
  const pattern = toPattern(values);

  const loadPage = () => {
    for (const [k, v] of Object.entries(page.pattern)) set(k as keyof typeof controlsSchema, v as never);
  };

  const panel = (
    <div className="flex flex-col gap-5">
      <ControlPanel controls={controls} />
      <Button variant="outline" className="h-11" onClick={loadPage}>
        Load {page.name}&rsquo;s pixel design
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
