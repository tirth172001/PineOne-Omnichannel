"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Package, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty, PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { productCategories } from "@/lib/products-data"

function ProductGrid({
  category,
  selectedProductId,
  onSelectProduct,
}: {
  category: (typeof productCategories)[0]
  selectedProductId: string | null
  onSelectProduct: (id: string) => void
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card/80 p-5 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{category.name}</p>
        <h3 className="text-sm font-semibold text-foreground">{category.description}</h3>
      </div>

      <div className="space-y-2">
        {category.products.map((product) => {
          const isConfigured = product.status === "enabled"
          const isComingSoon = product.status === "coming-soon"

          return (
            <div
              key={product.id}
              className={`w-full rounded-lg p-4 !h-auto !justify-start text-left transition-colors ${selectedProductId === product.id ? "bg-secondary/70" : "bg-card/80 hover:bg-muted/50"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isConfigured ? "bg-primary/10" : "bg-muted"}`}>
                  <product.icon className={`h-5 w-5 ${isConfigured ? "text-primary" : "text-muted-foreground"}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    {isConfigured && (
                      <Badge variant="outline" className="text-[10px] border-success/35 bg-success/20 text-foreground px-1.5 py-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Configured
                      </Badge>
                    )}
                    {!isConfigured && !isComingSoon && (
                      <Badge variant="outline" className="text-[10px]">
                        Available
                      </Badge>
                    )}
                    {isComingSoon && <Badge variant="outline" className="text-[10px]">Coming soon</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{product.description}</p>
                  {product.whyUseful && <p className="mt-1 text-xs text-foreground">{product.whyUseful}</p>}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onSelectProduct(product.id)}>
                    Details
                  </Button>
                  {isComingSoon ? (
                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                      Coming Soon
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary" asChild>
                      <Link href={product.href}>
                        Open
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ProductsContent() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const normalizedQuery = query.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) return productCategories

    return productCategories
      .map((category) => {
        const matchesCategory = category.name.toLowerCase().includes(normalizedQuery)
        const products = matchesCategory
          ? category.products
          : category.products.filter((product) => product.name.toLowerCase().includes(normalizedQuery))
        return { ...category, products }
      })
      .filter((category) => category.products.length > 0)
  }, [normalizedQuery])

  const selectedProduct = useMemo(
    () =>
      productCategories
        .flatMap((category) => category.products)
        .find((product) => product.id === selectedProductId) ?? null,
    [selectedProductId],
  )
  const totalProducts = productCategories.reduce((acc, category) => acc + category.products.length, 0)
  const configuredProducts = productCategories.reduce(
    (acc, category) => acc + category.products.filter((product) => product.status === "enabled").length,
    0,
  )

  const centerMain = (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="rounded-lg border border-border/70 bg-card/80 p-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Categories", value: `${productCategories.length}` },
              { label: "Products", value: `${totalProducts}` },
              { label: "Configured", value: `${configuredProducts}` },
              { label: "Coming soon", value: `${productCategories.flatMap((category) => category.products).filter((product) => product.status === "coming-soon").length}` },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-secondary/45 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-[15px] font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products or categories..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 bg-background pl-8 text-xs"
          />
        </div>
      </div>

      {filteredCategories.length ? (
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <ProductGrid
              key={category.id}
              category={category}
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
            />
          ))}
        </div>
      ) : (
        <PanelEmpty
          icon={Package}
          title="No products found"
          description="Try a different search term to view products across categories."
        />
      )}
    </div>
  )

  const rightContext = selectedProduct ? (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Product Context</p>
      <div className="rounded-lg bg-card/80 p-4">
        <p className="text-[15px] font-semibold text-foreground">{selectedProduct.name}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{selectedProduct.description}</p>
      </div>
      <div className="space-y-2">
        <Button className="w-full" asChild>
          <Link href={selectedProduct.href}>Open product</Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setSelectedProductId(null)}>
          Clear selection
        </Button>
      </div>
    </div>
  ) : (
    <PanelEmpty
      icon={Package}
      title="Select a product"
      description="Open a product from center to view prerequisites and next actions."
    />
  )

  return (
    <>
      <PageHeader title="All products" description="Catalog, activation status, and operational handoff">
        <Badge variant="outline" className="text-xs gap-1.5 border-success/30 bg-success/10 text-success">
          <CheckCircle2 className="h-3 w-3" />
          {configuredProducts} configured products
        </Badge>
        {selectedProduct && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedProductId(null)}>
            Clear product
          </Button>
        )}
      </PageHeader>

      <WorkspaceShell
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(selectedProduct)}
      />
    </>
  )
}
