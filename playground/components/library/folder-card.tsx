import Link from "next/link";
import { FadeImage } from "@/components/preview/fade-image";
import placeholders from "@/lib/thumbnail-placeholders.json";
import type { DocSummary } from "@/lib/docs";
import type { Folder } from "@/lib/folders";
import type { Prototype } from "@/lib/prototypes";
import { FolderIcon } from "./folder-icon";
import { plural } from "./format";

/**
 * A folder on the home page, Finder icon-view style: the folder (with the newest few things inside
 * peeking out: screenshots for prototype folders, pages for Docs), its name, and how many items.
 */
export function FolderCard({ folder, prototypes, docs, delay = 0 }: { folder: Folder; prototypes: Prototype[]; docs: DocSummary[]; delay?: number }) {
  const isDocs = folder.id === "docs";
  const count = isDocs ? plural(docs.length, "doc") : plural(prototypes.length, "item");
  const sheets = isDocs
    ? docs.slice(0, 3).map((d) => <FileSheet key={d.slug} title={d.meta.title} />)
    : prototypes
        .filter((p) => p.assets.thumbnails)
        .slice(0, 3)
        .map((p, i) => <ShotSheet key={p.slug} prototype={p} delay={delay + i * 60} />);
  return (
    <Link
      href={`/folders/${folder.id}`}
      className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors duration-150 ease-out hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:bg-muted"
    >
      <div className="w-full max-w-36 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:transition-none">
        <FolderIcon sheets={sheets} />
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm leading-tight font-medium">{folder.title}</h3>
        <p className="text-xs text-muted-foreground">{count}</p>
      </div>
    </Link>
  );
}

function ShotSheet({ prototype, delay }: { prototype: Prototype; delay: number }) {
  const v = Date.parse(prototype.meta.updatedAt);
  return <FadeImage src={`/thumbnails/${prototype.slug}-sheet.webp?v=${v}`} low={`/thumbnails/${prototype.slug}-low.webp?v=${v}`} placeholder={(placeholders as Record<string, string>)[prototype.slug]} delay={delay} />;
}

function FileSheet({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-[3px] p-[8%]">
      <span className="truncate text-[6px] leading-tight font-semibold">{title}</span>
      {[100, 85, 95, 70, 90].map((w) => (
        <span key={w} className="h-px rounded-full bg-muted-foreground/40" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

