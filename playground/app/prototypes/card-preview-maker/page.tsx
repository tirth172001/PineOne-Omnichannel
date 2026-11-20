import { previewKind } from "@/lib/preview";
import { getAllPrototypes } from "@/lib/prototypes";
import type { Sample } from "./data";
import { PreviewMaker } from "./preview-maker";

/** Lists prototypes that have screenshots, then hands off to the client maker. */
export default function CardPreviewMakerPage() {
  const samples: Sample[] = getAllPrototypes()
    .filter((p) => p.assets.thumbnails)
    .map((p) => {
      return { slug: p.slug, title: p.meta.title, folder: p.meta.folder, kind: previewKind(p.meta), version: Date.parse(p.meta.updatedAt) };
    });
  return <PreviewMaker samples={samples} />;
}
