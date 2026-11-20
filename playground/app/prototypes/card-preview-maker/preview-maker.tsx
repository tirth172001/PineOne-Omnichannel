"use client";

import { useState } from "react";
import { ControlPanel, ControlsLayout, useControls } from "@/components/controls";
import { PreviewComposition } from "@/components/preview/preview-composition";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { controlsSchema, type Sample, SLUG, toStyle } from "./data";
import { SampleCard } from "./sample-card";
import { SnippetCard } from "./snippet-card";

/** Tune how gallery cards compose screenshots; see one prototype large and a desktop + mobile card at gallery size. */
export function PreviewMaker({ samples }: { samples: Sample[] }) {
  const controls = useControls(SLUG, controlsSchema);
  const style = toStyle(controls.values);
  const firstDesktop = samples.find((s) => s.kind === "desktop");
  const firstMobile = samples.find((s) => s.kind === "mobile");
  const [slug, setSlug] = useState(firstDesktop?.slug ?? samples[0]?.slug ?? "");
  const current = samples.find((s) => s.slug === slug) ?? samples[0];
  const src = (s: Sample) => `/thumbnails/${s.slug}-card.webp?v=${s.version}`;

  if (!current) return <p className="p-6 text-sm text-muted-foreground">No screenshots yet. Run npm run thumbnails.</p>;

  const panel = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="sample" className="text-sm">
          Preview
        </label>
        <NativeSelect id="sample" className="h-11 w-full" value={current.slug} onChange={(e) => setSlug(e.target.value)}>
          {samples.map((s) => (
            <NativeSelectOption key={s.slug} value={s.slug}>
              {s.title} ({s.kind})
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <ControlPanel controls={controls} />
    </div>
  );

  return (
    <ControlsLayout panel={panel}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-6 pb-28 lg:pb-16">
        <PreviewComposition kind={current.kind} src={src(current)} style={style} className="rounded-xl ring-1 ring-border" />
        <section className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">In the gallery</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[firstDesktop, firstMobile].filter(Boolean).map((s) => (
              <SampleCard key={s!.slug} title={s!.title}>
                <PreviewComposition kind={s!.kind} src={src(s!)} style={style} />
              </SampleCard>
            ))}
          </div>
        </section>
        <SnippetCard style={style} />
      </div>
    </ControlsLayout>
  );
}
