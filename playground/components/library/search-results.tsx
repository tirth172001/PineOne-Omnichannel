import type { FolderHits } from "./search";
import { DocRow } from "./doc-row";
import { PrototypeCard } from "./prototype-card";

/** Matches from every folder, under the folder's name. */
export function SearchResults({ hits, titles }: { hits: FolderHits[]; titles: Map<string, string> }) {
  if (hits.length === 0) return <p className="py-16 text-center text-sm text-muted-foreground">Nothing matches.</p>;
  return (
    <div className="flex flex-col gap-10 pt-2">
      {hits.map(({ folder, prototypes, docs }) => (
        <section key={folder.id} aria-labelledby={`hits-${folder.id}`} className="flex flex-col gap-3">
          <h2 id={`hits-${folder.id}`} className="text-sm text-muted-foreground">
            {folder.title}
          </h2>
          {docs.length > 0 && (
            <div className="flex flex-col gap-3">
              {docs.map(({ doc, snippet }) => (
                <DocRow key={doc.slug} doc={doc} snippet={snippet} />
              ))}
            </div>
          )}
          {prototypes.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {prototypes.map((p) => (
                <PrototypeCard key={p.slug} prototype={p} variantOfTitle={p.meta.variantOf ? titles.get(p.meta.variantOf) : undefined} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
