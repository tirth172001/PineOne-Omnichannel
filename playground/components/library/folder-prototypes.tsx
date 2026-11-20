import type { Prototype } from "@/lib/prototypes";
import { PrototypeCard } from "./prototype-card";

/** A prototype folder's contents: one grid, newest first. */
export function FolderPrototypes({ prototypes, titles }: { prototypes: Prototype[]; titles: Record<string, string> }) {
  if (prototypes.length === 0) return <p className="py-16 text-center text-sm text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {prototypes.map((p, i) => (
        <PrototypeCard key={p.slug} prototype={p} delay={Math.min(i, 8) * 90} variantOfTitle={p.meta.variantOf ? titles[p.meta.variantOf] : undefined} />
      ))}
    </div>
  );
}
