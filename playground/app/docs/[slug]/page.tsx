import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocContentsInline, DocContentsRail } from "@/components/library/doc-contents";
import { formatDocDate } from "@/components/library/format";
import { Markdown } from "@/components/library/markdown";
import { PageHeader } from "@/components/page-header";
import { HeroBanner } from "@/components/hero-banner/hero-banner";
import { Badge } from "@/components/ui/badge";
import { getAllDocs, getDoc } from "@/lib/docs";
import { docHero } from "@/lib/heroes";
import { PAGE_COLUMN, PAGE_HEADER_WIDTH } from "@/lib/page-width";
import { buildGlossary, documentNames } from "@/lib/references";

export const dynamicParams = false;


export function generateStaticParams() {
  return getAllDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const doc = getDoc((await params).slug);
  return doc ? { title: doc.meta.title, description: doc.meta.description } : {};
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const doc = getDoc((await params).slug);
  if (!doc) notFound();
  const { meta, details, body, headings, minutes } = doc;
  const all = getAllDocs();
  const references = { glossary: buildGlossary(all), names: documentNames(all), slug: doc.slug };
  return (
    <div className="flex min-h-dvh flex-col">
      <PageHeader crumbs={[{ label: "Playground", href: "/" }, { label: "Docs", href: "/folders/docs" }, { label: meta.title }]} back={{ href: "/folders/docs", label: "Docs" }} width={PAGE_HEADER_WIDTH} floatingClassName="lg:hidden" />
      <div className={`${PAGE_COLUMN} pt-6`}>
        <HeroBanner align="start" eyebrow={meta.kind} title={meta.title} pattern={docHero(doc.slug)} className="sm:min-h-64" />
      </div>
      <div className={`${PAGE_COLUMN} pt-8 pb-24 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16 lg:pt-10`}>
        <aside className="hidden lg:block">
          <DocContentsRail headings={headings} back={{ href: "/folders/docs", label: "Docs" }} />
        </aside>
        <main className="w-full min-w-0">
          <header className="flex flex-col gap-4 border-b border-border pb-8">
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{meta.description}</p>
            <p className="text-sm text-muted-foreground">
              {formatDocDate(meta.date)} · {minutes} min read
            </p>
            {details.length > 0 && (
              <dl className="mt-2 grid gap-x-8 gap-y-4 rounded-xl bg-muted/50 p-5 sm:grid-cols-2">
                {details
                  .filter((d) => d.label !== "Updated")
                  .map((d) => (
                    <div key={d.label} className="flex flex-col gap-1">
                      <dt className="text-xs font-medium text-muted-foreground">{d.label}</dt>
                      <dd className="text-sm leading-snug">{d.value}</dd>
                    </div>
                  ))}
              </dl>
            )}
            {meta.topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {meta.topics.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </header>
          <div className="mt-8 lg:hidden">
            <DocContentsInline headings={headings} />
          </div>
          <article className="mt-12">
            <Markdown references={references}>{body}</Markdown>
          </article>
          <footer className="mt-16 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted-foreground">
            {meta.source && <p>Converted from {meta.source}</p>}
            <Link href="/folders/docs" className="w-fit underline underline-offset-4 hover:text-foreground">
              All docs
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
