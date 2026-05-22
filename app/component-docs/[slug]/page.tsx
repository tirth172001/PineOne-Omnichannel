import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  componentRegistry,
  componentRegistryBySlug,
} from "@/app/component-docs/_lib/component-registry"
import {
  ComponentPreviewHeader,
} from "@/app/component-docs/_components/component-preview"
import { DocsPageActions } from "@/app/component-docs/_components/docs-page-actions"
import { TokenPlayground } from "@/app/component-docs/_components/token-playground"
import { getSemanticThemeTokens, getThemeTokens } from "@/app/component-docs/_lib/theme-tokens"

export function generateStaticParams() {
  return componentRegistry.map((component) => ({ slug: component.slug }))
}

export default async function ComponentDocsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const component = componentRegistryBySlug[slug]

  if (!component) notFound()
  const themeTokens = await getThemeTokens()
  const semanticTokens = await getSemanticThemeTokens()

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <ComponentPreviewHeader title={component.title} description={component.description} />
          <div className="flex items-center gap-2">
            <Badge variant="outline">{component.category}</Badge>
            <DocsPageActions />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 md:p-7">
        <h2 className="text-2xl font-semibold text-foreground">Usage Notes</h2>
        <Separator className="my-3" />
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Use the themed primitive from `components/ui` instead of ad-hoc HTML styles.</li>
          <li>Keep spacing and typography aligned to tokens defined in `app/globals.css`.</li>
          <li>When this component is updated here, the same implementation affects the dashboard.</li>
        </ul>
      </div>

      <TokenPlayground
        slug={component.slug}
        themeTokens={themeTokens}
        semanticTokens={semanticTokens}
      />
    </div>
  )
}
