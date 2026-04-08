"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Sparkles, Clock } from "lucide-react"
import Link from "next/link"
import type { ProductCategory as ProductCategoryType } from "@/lib/products-data"

interface ProductCategoryProps {
  category: ProductCategoryType
}

export function ProductCategory({ category }: ProductCategoryProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{category.name}</h2>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((product) => (
          <Link key={product.id} href={product.href}>
            <Card className="group h-full border-border bg-card transition-all hover:border-primary/30 hover:bg-secondary/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <product.icon className="h-5 w-5 text-primary" />
                  </div>
                  <StatusBadge status={product.status} />
                </div>

                <h3 className="font-medium text-foreground mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {product.description}
                </p>

                {product.whyUseful && (
                  <div className="flex items-center gap-1.5 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>{product.whyUseful}</span>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "enabled" | "available" | "coming-soon" }) {
  if (status === "enabled") {
    return (
      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
        <Check className="mr-1 h-3 w-3" />
        Enabled
      </Badge>
    )
  }

  if (status === "coming-soon") {
    return (
      <Badge variant="outline" className="border-muted-foreground/30 bg-muted text-muted-foreground">
        <Clock className="mr-1 h-3 w-3" />
        Coming Soon
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
      Available
    </Badge>
  )
}
