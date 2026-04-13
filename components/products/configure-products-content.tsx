"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, CheckCircle2, Package, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PanelEmpty, PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { productCategories } from "@/lib/products-data"

const onboardingRouteByProductId: Record<string, string> = {
  "android-pos": "/onboarding/pos",
  "merchant-lending": "/onboarding/lending",
}

function getStartRoute(productId: string) {
  return onboardingRouteByProductId[productId] ?? `/products/${productId}`
}

export function ConfigureProductsContent() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(productCategories[0]?.id ?? "")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const selectedCategory = useMemo(
    () => productCategories.find((category) => category.id === selectedCategoryId) ?? productCategories[0],
    [selectedCategoryId],
  )
  const selectedProduct = selectedCategory?.products.find((product) => product.id === selectedProductId) ?? null

  const totalProducts = productCategories.reduce((acc, category) => acc + category.products.length, 0)
  const enabledProducts = productCategories.reduce(
    (acc, category) => acc + category.products.filter((product) => product.status === "enabled").length,
    0,
  )
  const pendingProducts = productCategories.reduce(
    (acc, category) => acc + category.products.filter((product) => product.status === "available").length,
    0,
  )

  const leftContext = (
    <div className="left-panel-content">
      <p className="left-panel-label">Product categories</p>
      <div className="left-panel-stack">
        {productCategories.map((category) => {
          const isSelected = selectedCategory?.id === category.id
          return (
            <Button variant="ghost"
              key={category.id}
              onClick={() => {
                setSelectedCategoryId(category.id)
                setSelectedProductId(null)
              }}
              className={`intercom-panel-row !h-auto !justify-start w-full ${isSelected ? "intercom-panel-row-active" : ""}`}
            >
              <p className="min-w-0 flex-1 text-left text-sm font-medium text-foreground">{category.name}</p>
            </Button>
          )
        })}
      </div>
    </div>
  )

  const centerMain = selectedCategory ? (
    <div className="h-full overflow-y-auto p-4">
      <section className="px-1 pb-4">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Product onboarding</p>
        <h1 className="text-[16px] font-semibold text-foreground">Configure products</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Select a product and continue onboarding in a guided flow.
        </p>
      </section>

      <div className="grid gap-3 px-1 pb-4 sm:grid-cols-3">
        {[
          { label: "Categories", value: `${productCategories.length}` },
          { label: "Products", value: `${totalProducts}` },
          { label: "Pending setup", value: `${pendingProducts}` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-card/75 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-[15px] font-semibold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <Separator />

      <section className="space-y-1 px-1 pt-4">
        <div className="mb-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{selectedCategory.name}</p>
          <p className="text-sm font-semibold text-foreground">Products in this category</p>
        </div>
        {selectedCategory.products.map((product) => {
          const isEnabled = product.status === "enabled"
          const isComingSoon = product.status === "coming-soon"
          const startRoute = getStartRoute(product.id)
          const isSelected = selectedProductId === product.id

          return (
            <div
              key={product.id}
              className={`w-full rounded-lg p-3 !h-auto !justify-start text-left transition-colors ${isSelected ? "bg-secondary/70" : "bg-card/75 hover:bg-muted/50"}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${isEnabled ? "bg-primary/15" : "bg-muted"}`}
                >
                  <product.icon className={`h-4 w-4 ${isEnabled ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    {isEnabled ? (
                      <Badge variant="outline" className="text-[10px] border-success/35 bg-success/20 text-foreground">
                        Enabled
                      </Badge>
                    ) : null}
                    {isComingSoon ? <Badge variant="outline" className="text-[10px]">Coming soon</Badge> : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{product.description}</p>
                  {product.whyUseful ? <p className="mt-1 text-xs text-foreground">{product.whyUseful}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    Details
                  </Button>
                  {isComingSoon ? (
                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                      Coming soon
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="h-8 text-xs gap-1.5">
                      <Link href={startRoute}>
                        {isEnabled ? "Manage" : "Start"}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <Separator className="my-4" />

      <section className="rounded-lg bg-card/75 px-4 py-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-foreground">
            {enabledProducts} products are enabled. Continue with pending products to complete platform setup.
          </p>
        </div>
      </section>
    </div>
  ) : (
    <PanelEmpty icon={Package} title="No category selected" description="Select a category from the left panel." />
  )

  const rightContext = selectedProduct ? (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Product details</p>

      <div className="rounded-lg bg-card/80 p-4">
        <p className="text-[15px] font-semibold text-foreground">{selectedProduct.name}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{selectedProduct.description}</p>
      </div>

      <div className="space-y-2">
        <Button className="w-full" asChild>
          <Link href={getStartRoute(selectedProduct.id)}>Continue onboarding</Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => setSelectedProductId(null)}>
          Close panel
        </Button>
      </div>
    </div>
  ) : (
    <PanelEmpty
      icon={Package}
      title="Select a product"
      description="Choose a product in center to open contextual setup details."
    />
  )

  return (
    <>
      <PageHeader title="All products" description="Choose category, select product, and continue onboarding">
        <Badge variant="outline" className="text-xs gap-1.5 border-success/30 bg-success/10 text-success">
          <CheckCircle2 className="h-3 w-3" />
          {enabledProducts} enabled products
        </Badge>
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
