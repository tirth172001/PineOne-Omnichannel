"use client"

import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/panels"
import { WorkspaceShell } from "@/components/dashboard/workspace-shell"
import { partnerProducts } from "@/lib/products-data"
import { ProductCatalogCard } from "./product-catalog-card"

type ThirdPartyOffersContentProps = {
  title?: string
  subtitle?: string
}

export function ThirdPartyOffersContent({
  title = "Third-party offers",
  subtitle = "Discover partner services bundled for Pine merchants",
}: ThirdPartyOffersContentProps) {
  const centerMain = (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {partnerProducts.map((offer) => (
          <ProductCatalogCard
            key={offer.id}
            icon={<offer.icon className="h-5 w-5 text-muted-foreground" />}
            title={offer.name}
            description={offer.description}
            badge={<Badge variant="outline" className="text-[10px]">{offer.discount}</Badge>}
            metadata={`by ${offer.partnerName}`}
            primaryAction={{ label: "Explore", href: offer.href, variant: "default" }}
            secondaryAction={{ label: "View details", href: offer.href, variant: "outline" }}
          />
        ))}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
      />
      <WorkspaceShell centerMain={centerMain} />
    </>
  )
}
