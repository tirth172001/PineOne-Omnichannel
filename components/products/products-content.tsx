"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Package, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty, PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { productCategories } from "@/lib/products-data"

const operationalRoutes: Record<string, string> = {
  "card-payments": "/card-payments",
  "pine-labs-upi": "/online-payments",
  "android-pos": "/pos-device",
}

function CategoryRow({
  category,
  selected,
  onClick,
}: {
  category: (typeof productCategories)[0]
  selected: boolean
  onClick: () => void
}) {
  const CategoryIcon = category.products[0]?.icon ?? Package
  const enabledCount = category.products.filter((product) => product.status === "enabled").length
  const availableCount = category.products.filter((product) => product.status === "available").length

  return (
    <Button variant="ghost" onClick={onClick} className={`intercom-panel-row !h-auto !justify-start ${selected ? "intercom-panel-row-active" : ""}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{category.name}</p>
        <p className="text-xs text-muted-foreground">{category.description}</p>
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">
        {enabledCount} enabled · {availableCount} available
      </Badge>
    </Button>
  )
}

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
    <div className="p-5 space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{category.name}</p>
        <h3 className="text-sm font-semibold text-foreground">Activation and enablement workspace</h3>
      </div>

      <div className="space-y-2">
        {category.products.map((product) => {
          const isEnabled = product.status === "enabled"
          const isComingSoon = product.status === "coming-soon"
          const actionHref = isEnabled
            ? operationalRoutes[product.id] || product.href
            : product.href

          return (
            <div
              key={product.id}
              className={`w-full rounded-lg p-4 !h-auto !justify-start text-left transition-colors ${selectedProductId === product.id ? "bg-secondary/70" : "bg-card/80 hover:bg-muted/50"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isEnabled ? "bg-primary/10" : "bg-muted"}`}>
                  <product.icon className={`h-5 w-5 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{product.name}</p>
                    {isEnabled && (
                      <Badge variant="outline" className="text-[10px] border-success/35 bg-success/20 text-foreground px-1.5 py-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Enabled
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
                  ) : isEnabled ? (
                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary" asChild>
                      <Link href={actionHref}>
                        Operate
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" className="h-8 text-xs gap-1.5" asChild>
                      <Link href={product.href}>
                        <Plus className="h-3.5 w-3.5" />
                        Enable
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      <div className="rounded-lg border border-border bg-secondary/35 p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Flow guidance</p>
        <p className="text-sm text-foreground">Use Cases -&gt; Product detail -&gt; Enable -&gt; Onboarding -&gt; Operations</p>
      </div>
    </div>
  )
}

export function ProductsContent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(productCategories[0]?.id ?? null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const filteredCategories = useMemo(
    () =>
      productCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(query.toLowerCase()) ||
          category.products.some((product) => product.name.toLowerCase().includes(query.toLowerCase())),
      ),
    [query],
  )

  useEffect(() => {
    if (!filteredCategories.length) return
    if (!selectedCategoryId || !filteredCategories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(filteredCategories[0].id)
      setSelectedProductId(null)
    }
  }, [filteredCategories, selectedCategoryId])

  const selectedCategory = productCategories.find((category) => category.id === selectedCategoryId)
  const selectedProduct = selectedCategory?.products.find((p) => p.id === selectedProductId) || null
  const totalProducts = productCategories.reduce((acc, category) => acc + category.products.length, 0)
  const enabledProducts = productCategories.reduce(
    (acc, category) => acc + category.products.filter((product) => product.status === "enabled").length,
    0,
  )

  const leftContext = (
    <div className="left-panel-content">
      <p className="left-panel-label">Product Areas</p>
      <div className="mt-2 rounded-md bg-muted/60 p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-8 border-0 bg-card/70 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="left-panel-stack">
        {filteredCategories.length ? (
          filteredCategories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              selected={selectedCategoryId === category.id}
              onClick={() => {
                setSelectedCategoryId(category.id)
                setSelectedProductId(null)
              }}
            />
          ))
        ) : (
          <p className="px-2 py-3 text-xs text-muted-foreground">No categories found for this search.</p>
        )}
      </div>
    </div>
  )

  const centerMain = selectedCategory ? (
    <ProductGrid
      category={selectedCategory}
      selectedProductId={selectedProductId}
      onSelectProduct={setSelectedProductId}
    />
  ) : (
    <div className="h-full overflow-y-auto p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Categories", value: `${productCategories.length}` },
          { label: "Products", value: `${totalProducts}` },
          { label: "Enabled", value: `${enabledProducts}` },
          { label: "Activation Backlog", value: `${totalProducts - enabledProducts}` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-card/80 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-[15px] font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
      <PanelEmpty
        icon={Package}
        title="Select a category"
        description="Choose a product category from the left panel to continue."
      />
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
      <PageHeader title="Products" description="Catalog, activation status, and operational handoff">
        <Badge variant="outline" className="text-xs gap-1.5 border-success/30 bg-success/10 text-success">
          <CheckCircle2 className="h-3 w-3" />
          {enabledProducts} enabled products
        </Badge>
        {selectedProduct && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedProductId(null)}>
            Clear product
          </Button>
        )}
      </PageHeader>

      <WorkspaceShell
        leftContext={leftContext}
        showLeftContext={false}
        centerMain={centerMain}
        rightContext={rightContext}
        showRightContext={Boolean(selectedProduct)}
        leftWidth={260}
        leftMaxWidth={300}
      />
    </>
  )
}
