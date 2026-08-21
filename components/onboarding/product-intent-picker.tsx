"use client"

import { useId, useState } from "react"
import { CheckIcon } from "@phosphor-icons/react"

import { PRODUCT_CATEGORIES, type ProductCategoryId } from "./product-catalog"
import { toggleProductCategory, useSignupSession } from "./signup-session"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// Ticket 06 (.scratch/onboarding-experience-v3/issues/06-product-intent-capture-ui.md): the
// business-name step's product-intent capture. Selection lives at the top-level category only
// (ticket 05's answer) — the catalog sheet is browsing-only and carries no selection of its own,
// so its "All / <category>" tabs just filter what's *shown*, they don't add a second taxonomy.
export function ProductIntentPicker() {
  const session = useSignupSession()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ProductCategoryId | "all">("all")

  function openCatalog(categoryId: ProductCategoryId) {
    setActiveTab(categoryId)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">What are you looking to do?</p>
      <div className="space-y-2">
        {PRODUCT_CATEGORIES.map((category) => (
          <CategoryRow
            key={category.id}
            id={category.id}
            label={category.label}
            teaser={category.teaser}
            Icon={category.icon}
            checked={session.selectedCategories.includes(category.id)}
            onCheckedChange={() => toggleProductCategory(category.id)}
            onKnowMore={() => openCatalog(category.id)}
          />
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-foreground">Explore our products</SheetTitle>
            <SheetDescription>Browse what&apos;s available — selecting what you need happens on the previous screen.</SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProductCategoryId | "all")} className="min-h-0 flex-1 gap-4 overflow-y-auto px-6 pb-6">
            <TabsList className="flex-wrap self-start">
              <TabsTrigger value="all">All</TabsTrigger>
              {PRODUCT_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {["all", ...PRODUCT_CATEGORIES.map((category) => category.id)].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-6">
                {PRODUCT_CATEGORIES.filter((category) => tabValue === "all" || category.id === tabValue).map((category) => (
                  <div key={category.id} className="space-y-4">
                    {category.catalogGroups.map((group) => (
                      <div key={group.title} className="space-y-2">
                        <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          <group.icon size={13} />
                          {group.title}
                        </p>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <div key={item.name} className="rounded-lg border border-border bg-card px-3 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">{item.name}</p>
                                {item.tag ? (
                                  <Badge variant="secondary" className="shrink-0">
                                    {item.tag}
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-1 text-[11px] text-muted-foreground">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CategoryRow({
  id,
  label,
  teaser,
  Icon,
  checked,
  onCheckedChange,
  onKnowMore,
}: {
  id: string
  label: string
  teaser: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  checked: boolean
  onCheckedChange: () => void
  onKnowMore: () => void
}) {
  const checkboxId = useId()

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-1 py-1 transition-colors",
        checked ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
      )}
    >
      <label htmlFor={checkboxId} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-1.5 pl-2">
        <Checkbox id={checkboxId} checked={checked} onCheckedChange={onCheckedChange} />
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full",
            checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {checked ? <CheckIcon size={13} weight="bold" /> : <Icon size={14} />}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="truncate text-[11px] text-muted-foreground">{teaser}</span>
        </span>
      </label>
      <button
        type="button"
        onClick={onKnowMore}
        className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:underline"
      >
        Know more
      </button>
    </div>
  )
}
