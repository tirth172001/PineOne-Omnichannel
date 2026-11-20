"use client";

import { useMemo, useState } from "react";
import type { DocSummary } from "@/lib/docs";
import { FOLDERS } from "@/lib/folders";
import type { Prototype } from "@/lib/prototypes";
import { FolderCard } from "./folder-card";
import { SearchBox } from "./search-box";
import { SearchResults } from "./search-results";
import { searchAll } from "./search";

/** Home: one search across everything, and the folders. Typing swaps the folders for results. */
export function LibraryHome({ prototypes, docs }: { prototypes: Prototype[]; docs: DocSummary[] }) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => searchAll(query, prototypes, docs), [query, prototypes, docs]);
  const titles = useMemo(() => new Map(prototypes.map((p) => [p.slug, p.meta.title])), [prototypes]);

  return (
    <div className="flex flex-col gap-6">
      <SearchBox value={query} onChange={setQuery} />
      {query.trim() ? (
        <SearchResults hits={hits} titles={titles} />
      ) : (
        <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
          {FOLDERS.map((folder) => (
            <FolderCard key={folder.id} folder={folder} prototypes={prototypes.filter((p) => p.meta.folder === folder.id)} docs={docs} />
          ))}
        </div>
      )}
    </div>
  );
}
