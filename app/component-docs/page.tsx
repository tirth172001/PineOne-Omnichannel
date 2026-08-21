import Link from "next/link"
import { ArrowLeftIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { componentRegistry } from "@/app/component-docs/_lib/component-registry"
import { getFoundationTableRows } from "@/app/component-docs/_lib/foundation-token-table"
import { ComponentPreview } from "@/app/component-docs/_components/component-preview"
import { DocsPageActions } from "@/app/component-docs/_components/docs-page-actions"
import { FoundationTokenTable } from "@/app/component-docs/_components/foundation-token-table"

function SectionShell({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-5">
      <div className="space-y-2">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="max-w-3xl text-lg text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function ComponentDocsHomePage() {
  const foundationRows = getFoundationTableRows()

  return (
    <div className="space-y-12">
      <header className="mb-2 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl"
          >
            <Link href="/">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-6xl font-semibold tracking-tight text-foreground">Introduction</h1>
            <p className="mt-3 max-w-3xl text-xl text-muted-foreground">
              Documented foundations, complete component previews, and a standardized desktop page shell for Pine One.
            </p>
          </div>
        </div>
        <DocsPageActions />
      </header>

      <SectionShell
        id="foundations"
        title="Foundations"
        description="Editable mapping table generated from your PineOne token JSON. Edit light and dark values directly, then copy the payload to apply exact updates."
      >
        <FoundationTokenTable initialRows={foundationRows} />
      </SectionShell>

      <SectionShell
        id="preview-gallery"
        title="Components"
        description="Every listed item includes a real preview and links to its dedicated component page for focused editing."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {componentRegistry.map((component) => (
            <article key={component.slug} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{component.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{component.description}</p>
                </div>
                <Badge variant="outline">{component.category}</Badge>
              </div>
              <ComponentPreview slug={component.slug} mode="card" />
              <div className="mt-3">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                >
                  <Link href={`/component-docs/${component.slug}`}>Open docs page</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>
    </div>
  )
}
